import json
from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USERNAME = "neo4j"
PASSWORD = "password123"
LEVELS_FILE = "scripts/word/oxford_levels.json"

def update_levels():
    # Đọc dữ liệu levels từ file json đã quét được
    with open(LEVELS_FILE, "r", encoding="utf-8") as f:
        oxford_data = json.load(f)
    
    print(f"Loaded {len(oxford_data)} words from {LEVELS_FILE}")
    
    driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))
    try:
        with driver.session() as session:
            print("Preparing batch update for Neo4j...")
            
            # Chuẩn bị dữ liệu để nạp lô
            batch = []
            for word, info in oxford_data.items():
                batch.append({
                    "word": word,
                    "level": info["level"],
                    "is_academic": info["is_academic"]
                })
            
            # Thực thi Cypher UNWIND để cập nhật siêu tốc độ (đã có Unique Constraint nên cực nhanh)
            query = """
                UNWIND $batch AS data
                MERGE (w:Word {name: toLower(data.word)})
                SET w.level = data.level, w.is_academic = data.is_academic
                WITH w, data
                WHERE data.is_academic = true
                SET w:Academic
                RETURN count(w) as count
            """
            
            print("Executing Neo4j batch update...")
            result = session.run(query, batch=batch)
            updated_count = result.single()["count"]
            print(f" -> Merged/Updated {len(batch)} words in Neo4j.")
            
            # Đếm lại tổng số từ có Level trong DB để kiểm chứng
            count_query = """
                MATCH (w:Word) 
                WHERE w.level IS NOT NULL AND w.level <> 'Unknown' 
                RETURN count(w) as count
            """
            total_with_level = session.run(count_query).single()["count"]
            print(f"Verification: Total Word nodes in Neo4j with CEFR levels now = {total_with_level}")
            
    except Exception as e:
        print(f"Error during level update: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    update_levels()
