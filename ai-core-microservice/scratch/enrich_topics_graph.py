from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USERNAME = "neo4j"
PASSWORD = "password123"

# Định nghĩa bộ quy tắc từ khóa mở rộng cho từng Topic IELTS
# Nếu định nghĩa (definition) của từ vựng chứa một trong các từ khóa này, từ đó sẽ được gắn vào Topic tương ứng.
TOPIC_RULES = {
    "Environment": [
        "environment", "pollution", "climate", "nature", "ecosystem", "sustainability", 
        "renewable", "global warming", "biodiversity", "conservation", "ecology", "emission", 
        "greenhouse", "forest", "wildlife", "ocean", "river", "glacier", "natural resource", 
        "recycle", "waste", "garbage", "habitat", "wild", "earth", "planet", "atmosphere"
    ],
    "Education": [
        "curriculum", "pedagogy", "literacy", "scholarship", "academic", "tuition", 
        "discipline", "knowledge", "qualification", "vocational", "undergraduate", 
        "school", "university", "college", "student", "teacher", "professor", "learn", 
        "teach", "lesson", "education", "classroom", "study", "exam", "grade", "lecture"
    ],
    "Technology": [
        "innovation", "automation", "digital", "artificial intelligence", "software", 
        "hardware", "cybersecurity", "interface", "algorithm", "bandwidth", "telecommunication", 
        "computer", "internet", "network", "device", "mobile", "application", "database", 
        "online", "website", "virtual", "robot", "machine", "tech", "electronic"
    ],
    "Health": [
        "epidemic", "nutrition", "well-being", "medicine", "diagnosis", "therapy", 
        "hygiene", "chronic", "immune", "metabolism", "vaccin", "prevention", "health", 
        "disease", "illness", "doctor", "nurse", "hospital", "patient", "clinic", 
        "treatment", "workout", "exercise", "physical", "mental", "diet", "virus", "infection"
    ],
    "Government": [
        "legislation", "policy", "democracy", "bureaucracy", "regulation", "authority", 
        "governance", "administration", "electoral", "diplomacy", "infrastructure", 
        "government", "parliament", "president", "minister", "politics", "political", 
        "state", "law", "court", "judge", "citizen", "public", "nation", "tax", "legal"
    ],
    "Economy": [
        "economy", "economic", "finance", "financial", "business", "market", "trade", 
        "commerce", "industry", "industrial", "money", "currency", "wealth", "revenue", 
        "profit", "loss", "cost", "price", "investment", "invest", "stock", "taxation", 
        "employment", "unemployment", "labor", "workforce", "salary", "wage"
    ],
    "Society": [
        "society", "social", "culture", "cultural", "community", "population", 
        "demographic", "tradition", "traditional", "custom", "citizen", "public", 
        "urban", "rural", "suburb", "migration", "immigration", "heritage", "history", 
        "historical", "religion", "lifestyle", "family", "generation"
    ],
    "Science": [
        "science", "scientific", "research", "experiment", "laboratory", "physics", 
        "chemistry", "biology", "geology", "astronomy", "scientist", "theory", 
        "hypothesis", "discovery", "discover", "analysis", "data", "statistic"
    ]
}

def enrich_topics():
    driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))
    try:
        with driver.session() as session:
            print("Starting rule-based Topic enrichment in Neo4j...")
            
            # Xóa các liên kết BELONGS_TO_TOPIC cũ để tránh trùng lặp hoặc sai lệch dữ liệu
            print("Clearing old BELONGS_TO_TOPIC relationships...")
            session.run("MATCH ()-[r:BELONGS_TO_TOPIC]->() DELETE r")
            
            total_added = 0
            for topic, keywords in TOPIC_RULES.items():
                print(f"Enriching Topic '{topic}'...")
                
                # Tạo node Topic
                session.run("MERGE (t:Topic {name: $name})", name=topic)
                
                # Tạo câu lệnh Cypher tìm kiếm từ khóa trong Definition để gắn Topic
                # Sử dụng toLower để không phân biệt chữ hoa chữ thường
                query = """
                    MATCH (w:Word)-[:HAS_MEANING]->(d:Definition)
                    WHERE any(kw IN $keywords WHERE toLower(d.text) CONTAINS toLower(kw))
                    OR any(kw IN $keywords WHERE toLower(w.name) = toLower(kw))
                    WITH distinct w
                    MATCH (t:Topic {name: $topic_name})
                    MERGE (w)-[:BELONGS_TO_TOPIC]->(t)
                    RETURN count(w) as count
                """
                
                result = session.run(query, keywords=keywords, topic_name=topic)
                count = result.single()["count"]
                print(f" -> Linked {count} words to Topic '{topic}'")
                total_added += count
                
            print(f"\nSuccess! Total topic links created: {total_added}")
            
    except Exception as e:
        print(f"Error during enrichment: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    enrich_topics()
