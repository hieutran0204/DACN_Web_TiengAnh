import json
import os
import requests
from neo4j import GraphDatabase

# --- CẤU HÌNH KẾT NỐI NEO4J ---
# Điền thông tin database của ní vào đây
URI = "bolt://localhost:7687"
USERNAME = "neo4j"
PASSWORD = "password123" 
SYNC_API_URL = "http://localhost:5000/api/graph/sync-vocab"

INPUT_FILE = "dictionary_data.jsonl"
LEVELS_FILE = "oxford_levels.json"
TOPICS_FILE = "ielts_topics.json"

class DictionaryGraphBuilder:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        self.oxford_data = self._load_json(LEVELS_FILE)
        self.topics_data = self._load_json(TOPICS_FILE)
        
        # Tiền xử lý để tra cứu topic siêu tốc độ O(1) thay vì O(N*M)
        self.word_to_topics = {}
        for topic, words in self.topics_data.items():
            for w in words:
                w_lower = w.lower()
                if w_lower not in self.word_to_topics:
                    self.word_to_topics[w_lower] = []
                self.word_to_topics[w_lower].append(topic.capitalize())

    def _load_json(self, file_path):
        """Tải dữ liệu từ file JSON an toàn"""
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def close(self):
        self.driver.close()

    def get_existing_words(self):
        """Lấy danh sách từ đã có trong Neo4j để tránh nạp lại"""
        print("Checking existing data in Neo4j...")
        with self.driver.session() as session:
            result = session.run("MATCH (w:Word) RETURN w.name as name")
            return {record["name"] for record in result}

    def _execute_batch(self, tx, batch, existing_words, advanced=True):
        """Chèn dữ liệu theo lô lớn bằng Cypher UNWIND để tăng tốc độ gấp 100 lần"""
        batch_words = []
        batch_topics = []
        batch_pos = []
        batch_defs = []
        batch_syns = []
        batch_ants = []
        
        batch_past_participles = []
        batch_past_tenses = []
        batch_derived = []
        batch_composed = []

        for api_data in batch:
            word = api_data.get("word")
            if not word: continue
            
            # --- 1. PREPARE WORD DATA ---
            oxford_info = self.oxford_data.get(word.lower(), {"level": "Unknown", "is_academic": False})
            level = oxford_info.get("level", "Unknown")
            is_academic = oxford_info.get("is_academic", False)
            
            batch_words.append({"word": word, "level": level, "is_academic": is_academic})
            
            for topic in self.word_to_topics.get(word.lower(), []):
                batch_topics.append({"word": word, "topic": topic})

            for meaning in api_data.get("meanings", []):
                pos = meaning.get("partOfSpeech", "unknown")
                batch_pos.append({"word": word, "pos": pos})
                
                for def_obj in meaning.get("definitions", []):
                    def_text = def_obj.get("definition")
                    if def_text:
                        batch_defs.append({"word": word, "definition": def_text})
                        
                for syn in meaning.get("synonyms", []):
                    batch_syns.append({"word": word, "synonym": syn})
                    
                for ant in meaning.get("antonyms", []):
                    batch_ants.append({"word": word, "antonym": ant})

            # --- 2. PREPARE RELATIONSHIP DATA (Advanced) ---
            if advanced and word not in existing_words:
                for meaning in api_data.get("meanings", []):
                    pos = meaning.get("partOfSpeech")
                    if pos == "verb":
                        for def_obj in meaning.get("definitions", []):
                            if "present tense" in def_obj.get("definition", ""):
                                for syn in def_obj.get("synonyms", []):
                                    if def_obj.get("definition", "").endswith("past participle"):
                                        batch_past_participles.append({"base": word, "v3": syn})
                                    else:
                                        batch_past_tenses.append({"base": word, "v2": syn})
                
                if "-ness" in word:
                    parent = word.replace("-ness", "")
                    batch_derived.append({"child": word, "parent": parent})
                    
                if " " in word:
                    parts = word.split(" ")
                    for part in parts:
                        batch_composed.append({"word": word, "part": part})

        # --- EXECUTE CYPHER QUERIES ---
        if batch_words:
            tx.run("""
                UNWIND $batch AS data
                MERGE (w:Word {name: data.word})
                SET w.level = data.level, w.is_academic = data.is_academic
            """, batch=batch_words)
            
            academic_words = [w["word"] for w in batch_words if w["is_academic"]]
            if academic_words:
                tx.run("""
                    UNWIND $words AS word
                    MATCH (w:Word {name: word})
                    SET w:Academic
                """, words=academic_words)

        if batch_topics:
            tx.run("""
                UNWIND $batch AS data
                MATCH (w:Word {name: data.word})
                MERGE (t:Topic {name: data.topic})
                MERGE (w)-[:BELONGS_TO_TOPIC]->(t)
            """, batch=batch_topics)

        if batch_pos:
            tx.run("""
                UNWIND $batch AS data
                MATCH (w:Word {name: data.word})
                MERGE (p:PartOfSpeech {name: data.pos})
                MERGE (w)-[:IS_A]->(p)
            """, batch=batch_pos)

        if batch_defs:
            tx.run("""
                UNWIND $batch AS data
                MATCH (w:Word {name: data.word})
                MERGE (d:Definition {text: data.definition})
                MERGE (w)-[:HAS_MEANING]->(d)
            """, batch=batch_defs)

        if batch_syns:
            tx.run("""
                UNWIND $batch AS data
                MATCH (w1:Word {name: data.word})
                MERGE (w2:Word {name: data.synonym})
                MERGE (w1)-[:SYNONYM_OF]->(w2)
            """, batch=batch_syns)

        if batch_ants:
            tx.run("""
                UNWIND $batch AS data
                MATCH (w1:Word {name: data.word})
                MERGE (w2:Word {name: data.antonym})
                MERGE (w1)-[:ANTONYM_OF]->(w2)
            """, batch=batch_ants)

        if batch_past_participles:
            tx.run("""
                UNWIND $batch AS data
                MATCH (w:Word {name: data.base})
                MERGE (v3:Word {name: data.v3})
                MERGE (w)-[:HAS_PAST_PARTICIPLE]->(v3)
            """, batch=batch_past_participles)
            
        if batch_past_tenses:
            tx.run("""
                UNWIND $batch AS data
                MATCH (w:Word {name: data.base})
                MERGE (v2:Word {name: data.v2})
                MERGE (w)-[:HAS_PAST_TENSE]->(v2)
            """, batch=batch_past_tenses)
            
        if batch_derived:
            tx.run("""
                UNWIND $batch AS data
                MERGE (child:Word {name: data.child})
                MERGE (parent:Word {name: data.parent})
                MERGE (child)-[:DERIVED_FROM]->(parent)
                MERGE (parent)-[:DERIVES]->(child)
            """, batch=batch_derived)
            
        if batch_composed:
            tx.run("""
                UNWIND $batch AS data
                MATCH (w:Word {name: data.word})
                MERGE (p:Word {name: data.part})
                MERGE (w)-[:COMPOSED_OF]->(p)
            """, batch=batch_composed)

    def process_file_advanced(self):
        """Cập nhật dữ liệu & xây dựng Relationships (Chỉ nạp từ mới)"""
        existing_words = self.get_existing_words()
        print(f"Success: Found {len(existing_words)} words. Updating levels and topics...")

        print("Starting batch data ingestion...")
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            with self.driver.session() as session:
                batch = []
                batch_size = 500
                total_processed = 0
                
                for i, line in enumerate(f, 1):
                    try:
                        record = json.loads(line)
                        if record.get("status") == 200 and record.get("data"):
                            batch.append(record["data"][0])
                            
                        if len(batch) >= batch_size:
                            session.execute_write(self._execute_batch, batch, existing_words, True)
                            total_processed += len(batch)
                            print(f"Processed {total_processed} words...")
                            batch = []
                    except Exception as e:
                        print(f"[{i}] Error: {e}")

                if batch:
                    session.execute_write(self._execute_batch, batch, existing_words, True)
                    total_processed += len(batch)
                    print(f"Processed {total_processed} words...")

        # --- TRIGGER SYNC ---
        print("\nSending sync command to AI Server...")
        try:
            response = requests.post(SYNC_API_URL, timeout=30)
            if response.status_code == 200:
                print(f"Success: Server responded: {response.json().get('message')}")
        except:
            print("Warning: Could not connect to AI Server (It might be offline).")

    def process_file(self):
        print("Starting batch data ingestion into Neo4j...")
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            with self.driver.session() as session:
                batch = []
                batch_size = 500
                total_processed = 0
                
                for i, line in enumerate(f, 1):
                    try:
                        record = json.loads(line)
                        if record.get("status") == 200 and record.get("data"):
                            batch.append(record["data"][0])
                            
                        if len(batch) >= batch_size:
                            session.execute_write(self._execute_batch, batch, set(), False)
                            total_processed += len(batch)
                            print(f"Processed {total_processed} words...")
                            batch = []
                    except Exception as e:
                        print(f"[{i}] Parse error: {e}")

                if batch:
                    session.execute_write(self._execute_batch, batch, set(), False)
                    total_processed += len(batch)
                    print(f"Processed {total_processed} words...")

        print("Data ingestion complete! GraphRAG is ready.")

if __name__ == "__main__":
    builder = DictionaryGraphBuilder(URI, USERNAME, PASSWORD)
    try:
        builder.process_file_advanced()
    finally:
        builder.close()
