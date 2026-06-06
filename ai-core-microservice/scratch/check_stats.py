from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USERNAME = "neo4j"
PASSWORD = "password123"

def check_stats():
    driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))
    try:
        with driver.session() as session:
            # Lấy tổng số từ
            total_words = session.run("MATCH (w:Word) RETURN count(w) as count").single()["count"]
            
            # Lấy số từ có level
            with_level = session.run("MATCH (w:Word) WHERE w.level IS NOT NULL AND w.level <> 'Unknown' RETURN count(w) as count").single()["count"]
            
            # Lấy số từ là Academic
            academic = session.run("MATCH (w:Word:Academic) RETURN count(w) as count").single()["count"]
            
            # Lấy số từ có Topic
            with_topic = session.run("MATCH (w:Word)-[:BELONGS_TO_TOPIC]->() RETURN count(distinct w) as count").single()["count"]
            
            # Lấy số lượng từng level cụ thể
            levels_query = """
                MATCH (w:Word) 
                WHERE w.level IS NOT NULL AND w.level <> 'Unknown'
                RETURN w.level as level, count(w) as count 
                ORDER BY level
            """
            levels_res = session.run(levels_query)
            
            print("================ DB GRAPH STATS ================")
            print(f"Total Word nodes in Neo4j          : {total_words}")
            print(f"Word nodes with CEFR levels        : {with_level}")
            print(f"Word nodes labeled as :Academic    : {academic}")
            print(f"Word nodes linked to IELTS Topics  : {with_topic}")
            print("\nCEFR Levels breakdown:")
            for record in levels_res:
                print(f" - {record['level']}: {record['count']} words")
                
            # Breakdown topic
            topics_query = """
                MATCH (w:Word)-[:BELONGS_TO_TOPIC]->(t:Topic)
                RETURN t.name as topic, count(w) as count
                ORDER BY count DESC
            """
            topics_res = session.run(topics_query)
            print("\nIELTS Topics breakdown:")
            for record in topics_res:
                print(f" - {record['topic']}: {record['count']} words")
            print("================================================")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    check_stats()
