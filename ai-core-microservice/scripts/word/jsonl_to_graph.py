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

    def _load_json(self, file_path):
        """Tải dữ liệu từ file JSON an toàn"""
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def close(self):
        self.driver.close()

    def create_word_graph(self, tx, entry_data):
        """Thực thi các lệnh Cypher để vẽ Node và Relationship"""
        word = entry_data.get("word")
        if not word: return

        # 1. Tạo Nút Từ vựng kèm Level & Label
        oxford_info = self.oxford_data.get(word.lower(), {"level": "Unknown", "is_academic": False})
        level = oxford_info.get("level", "Unknown")
        is_academic = oxford_info.get("is_academic", False)
        
        # Gắn thêm label 'Academic' nếu là từ academic
        query = "MERGE (w:Word {name: $word}) SET w.level = $level, w.is_academic = $is_academic"
        if is_academic:
            query += " SET w:Academic"
            
        tx.run(query, word=word, level=level, is_academic=is_academic)
        
        # 1.1 Gắn Topic (nếu có trong mapping)
        for topic, words in self.topics_data.items():
            if word.lower() in [w.lower() for w in words]:
                tx.run("""
                    MATCH (w:Word {name: $word})
                    MERGE (t:Topic {name: $topic})
                    MERGE (w)-[:BELONGS_TO_TOPIC]->(t)
                """, word=word, topic=topic.capitalize())

        # 2. Duyệt qua mảng meanings
        for meaning in entry_data.get("meanings", []):
            pos = meaning.get("partOfSpeech", "unknown")
            
            # Gắn Loại từ
            tx.run("""
                MATCH (w:Word {name: $word})
                MERGE (p:PartOfSpeech {name: $pos})
                MERGE (w)-[:IS_A]->(p)
            """, word=word, pos=pos)

            # Gắn Định nghĩa
            for def_obj in meaning.get("definitions", []):
                definition_text = def_obj.get("definition")
                tx.run("""
                    MATCH (w:Word {name: $word})
                    MERGE (d:Definition {text: $definition})
                    MERGE (w)-[:HAS_MEANING]->(d)
                """, word=word, definition=definition_text)

            # Gắn Đồng nghĩa
            for syn in meaning.get("synonyms", []):
                tx.run("""
                    MATCH (w1:Word {name: $word})
                    MERGE (w2:Word {name: $synonym})
                    MERGE (w1)-[:SYNONYM_OF]->(w2)
                """, word=word, synonym=syn)

            # Gắn Trái nghĩa
            for ant in meaning.get("antonyms", []):
                tx.run("""
                    MATCH (w1:Word {name: $word})
                    MERGE (w2:Word {name: $antonym})
                    MERGE (w1)-[:ANTONYM_OF]->(w2)
                """, word=word, antonym=ant)

    def process_file(self):
        print("Starting data ingestion into Neo4j...")
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            with self.driver.session() as session:
                for i, line in enumerate(f, 1):
                    try:
                        record = json.loads(line)
                        if record.get("status") == 200 and record.get("data"):
                            api_data = record["data"][0] 
                            session.execute_write(self.create_word_graph, api_data)
                            print(f"[{i}] Processed: {record['word']}")
                    except Exception as e:
                        print(f"[{i}] Parse error: {e}")

        print("Data ingestion complete! GraphRAG is ready.")

    def create_relationships(self, tx, entry_data):
        """Tạo Relationships phức tạp hơn (Tenses, Derivatives)"""
        word = entry_data.get("word")
        
        # 1. Xử lý Tenses (Động từ chia thể)
        for meaning in entry_data.get("meanings", []):
            pos = meaning.get("partOfSpeech")
            if pos == "verb":
                # Lấy dạng Present Tense (V1) làm gốc
                base_verb = word
                for def_obj in meaning.get("definitions", []):
                    if "present tense" in def_obj.get("definition", ""):
                        # Tìm trong 'synonyms' thường chứa V2, V3
                        for syn in def_obj.get("synonyms", []):
                            # V3 (Past Participle) thường đi với 'be' -> hasBeenForm
                            # V2 (Past Tense) thường đi với 'have' -> hasPastTense
                            if def_obj.get("definition", "").endswith("past participle"):
                                tx.run("""
                                    MATCH (w:Word {name: $base})
                                    MERGE (v3:Word {name: $v3})
                                    MERGE (w)-[:HAS_PAST_PARTICIPLE]->(v3)
                                """, base=base_verb, v3=syn)
                            else:
                                tx.run("""
                                    MATCH (w:Word {name: $base})
                                    MERGE (v2:Word {name: $v2})
                                    MERGE (w)-[:HAS_PAST_TENSE]->(v2)
                                """, base=base_verb, v2=syn)

        # 2. Xử lý Derivatives (Từ phái sinh)
        for meaning in entry_data.get("meanings", []):
            for def_obj in meaning.get("definitions", []):
                # Kiểm tra xem có key 'derivedFrom' không (nếu API trả)
                # Hoặc tự kiểm tra nếu 'word' là dạng phái sinh
                # Ví dụ: 'happiness' -> 'happy'
                if "-ness" in word:
                    parent = word.replace("-ness", "")
                    tx.run("""
                        MATCH (child:Word {name: $child})
                        MERGE (parent:Word {name: $parent})
                        MERGE (child)-[:DERIVED_FROM]->(parent)
                        MERGE (parent)-[:DERIVES]->(child)
                    """, child=word, parent=parent)

        # 3. Từ ghép (Compound Words)
        if " " in word:
            parts = word.split(" ")
            for part in parts:
                tx.run("""
                    MATCH (w:Word {name: $word})
                    MERGE (p:Word {name: $part})
                    MERGE (w)-[:COMPOSED_OF]->(p)
                """, word=word, part=part)

    def get_existing_words(self):
        """Lấy danh sách từ đã có trong Neo4j để tránh nạp lại"""
        print("Checking existing data in Neo4j...")
        with self.driver.session() as session:
            result = session.run("MATCH (w:Word) RETURN w.name as name")
            return {record["name"] for record in result}

    def process_file_advanced(self):
        """Cập nhật dữ liệu & xây dựng Relationships (Chỉ nạp từ mới)"""
        # 1. Lấy danh sách từ đã có
        existing_words = self.get_existing_words()
        print(f"Success: Found {len(existing_words)} words. Updating levels and topics...")

        print("Starting data ingestion...")
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            with self.driver.session() as session:
                for i, line in enumerate(f, 1):
                    try:
                        record = json.loads(line)
                        word = record.get("word")
                        
                        # 2. XỬ LÝ: Luôn chạy create_word_graph để cập nhật Level/Label mới
                        if record.get("status") == 200 and record.get("data"):
                            api_data = record["data"][0] 
                            
                            # Cập nhật Level/Topic
                            session.execute_write(self.create_word_graph, api_data)
                            
                            # Chỉ tạo relationships phức tạp nếu là từ mới (để tiết kiệm time)
                            if word not in existing_words:
                                session.execute_write(self.create_relationships, api_data)
                                print(f"[{i}] Added new word: {word}")
                            else:
                                print(f"[{i}] Updated Level/Topic for: {word}")
                    except Exception as e:
                        print(f"[{i}] Error: {e}")

        # --- TRIGGER SYNC ---
        print("\nSending sync command to AI Server...")
        try:
            response = requests.post(SYNC_API_URL, timeout=30)
            if response.status_code == 200:
                print(f"Success: Server responded: {response.json().get('message')}")
        except:
            print("Warning: Could not connect to AI Server (It might be offline).")

if __name__ == "__main__":
    builder = DictionaryGraphBuilder(URI, USERNAME, PASSWORD)
    try:
        builder.process_file_advanced()
    finally:
        builder.close()
