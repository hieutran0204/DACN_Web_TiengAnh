from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USERNAME = "neo4j"
PASSWORD = "password123"

# Định nghĩa các bộ Essay Skeletons chuẩn cho IELTS Task 1 và Task 2
SKELETONS = [
    {
        "id": "T1_TREND_REPORT",
        "task_type": 1,
        "genre": "Trend (Line Graph/Bar Chart/Table)",
        "nodes": [
            {"id": "T1_TREND_INTRO", "type": "Introduction", "description": "Paraphrase the prompt describing what the chart shows, including time and location."},
            {"id": "T1_TREND_OVERVIEW", "type": "Overview", "description": "Highlight 2-3 main trends, high/low points, or significant changes without detailed numbers."},
            {"id": "T1_TREND_DETAILS_1", "type": "Data_Evidence", "description": "Detail the first group of data, comparing values and showing trends with specific numbers."},
            {"id": "T1_TREND_DETAILS_2", "type": "Data_Evidence", "description": "Detail the second group of data, comparing values and showing trends with specific numbers."}
        ]
    },
    {
        "id": "T1_PROCESS_REPORT",
        "task_type": 1,
        "genre": "Process (Diagram/Flowchart)",
        "nodes": [
            {"id": "T1_PROC_INTRO", "type": "Introduction", "description": "Paraphrase the prompt describing the process, step, or system shown."},
            {"id": "T1_PROC_OVERVIEW", "type": "Overview", "description": "Summarize the total number of stages, where it starts, where it ends, and if it is cyclic or linear."},
            {"id": "T1_PROC_STEPS_1", "type": "Data_Evidence", "description": "Detail the first half of the process, using sequence connectors (firstly, subsequently, next) and passive voice."},
            {"id": "T1_PROC_STEPS_2", "type": "Data_Evidence", "description": "Detail the remaining steps of the process, culminating in the final product or stage."}
        ]
    },
    {
        "id": "T2_OPINION_ESSAY",
        "task_type": 2,
        "genre": "Opinion (Agree/Disagree)",
        "nodes": [
            {"id": "T2_OPIN_INTRO", "type": "Introduction", "description": "Hook/Background statement paraphrasing the topic."},
            {"id": "T2_OPIN_THESIS", "type": "Thesis", "description": "Clearly state a strong agree or disagree position (Thesis statement)."},
            {"id": "T2_OPIN_BODY1_CLAIM", "type": "Claim", "description": "State the first reason supporting your position."},
            {"id": "T2_OPIN_BODY1_EXPLAIN", "type": "Explanation", "description": "Elaborate on the claim, explaining the logical mechanism of why it is true."},
            {"id": "T2_OPIN_BODY1_EXAMPLE", "type": "Example", "description": "Provide a concrete case study, statistic, or real-world example supporting this point."},
            {"id": "T2_OPIN_BODY2_CLAIM", "type": "Claim", "description": "State the second reason supporting your position."},
            {"id": "T2_OPIN_BODY2_EXPLAIN", "type": "Explanation", "description": "Elaborate on the second claim, explaining the mechanism."},
            {"id": "T2_OPIN_BODY2_EXAMPLE", "type": "Example", "description": "Provide another concrete example to solidify the second argument."},
            {"id": "T2_OPIN_CONCLUSION", "type": "Conclusion", "description": "Restate the thesis in different words and summarize the main supporting points."}
        ]
    },
    {
        "id": "T2_DISCUSSION_ESSAY",
        "task_type": 2,
        "genre": "Discussion (Discuss both views & opinion)",
        "nodes": [
            {"id": "T2_DISC_INTRO", "type": "Introduction", "description": "Introduce both viewpoints neutrally."},
            {"id": "T2_DISC_THESIS", "type": "Thesis", "description": "State your clear personal opinion/position on which side you support."},
            {"id": "T2_DISC_BODY1_VIEW1", "type": "Claim", "description": "Discuss View 1 (why people support this side) even if you disagree."},
            {"id": "T2_DISC_BODY1_EXPLAIN", "type": "Explanation", "description": "Explain the logic/arguments behind View 1."},
            {"id": "T2_DISC_BODY1_EXAMPLE", "type": "Example", "description": "Give an example showing View 1 in practice."},
            {"id": "T2_DISC_BODY2_VIEW2", "type": "Claim", "description": "Discuss View 2 (why you or others support this side)."},
            {"id": "T2_DISC_BODY2_EXPLAIN", "type": "Explanation", "description": "Explain the arguments supporting View 2, linking back to your thesis."},
            {"id": "T2_DISC_BODY2_EXAMPLE", "type": "Example", "description": "Give a concrete example of View 2."},
            {"id": "T2_DISC_CONCLUSION", "type": "Conclusion", "description": "Summarize both views and reinforce your final stance clearly."}
        ]
    },
    {
        "id": "T2_PROBLEM_SOLUTION_ESSAY",
        "task_type": 2,
        "genre": "Problem-Solution",
        "nodes": [
            {"id": "T2_PROB_INTRO", "type": "Introduction", "description": "Introduce the issue outlined in the prompt."},
            {"id": "T2_PROB_THESIS", "type": "Thesis", "description": "State that this is a serious problem with multiple causes and clear solutions."},
            {"id": "T2_PROB_BODY1_CLAIM", "type": "Claim", "description": "Identify the primary problems or direct causes of the issue."},
            {"id": "T2_PROB_BODY1_EXPLAIN", "type": "Explanation", "description": "Explain how/why these causes result in the main problem."},
            {"id": "T2_PROB_BODY1_EXAMPLE", "type": "Example", "description": "Give an example of the problem/cause in action."},
            {"id": "T2_PROB_BODY2_CLAIM", "type": "Claim", "description": "Propose concrete solutions to address the causes discussed in Body 1."},
            {"id": "T2_PROB_BODY2_EXPLAIN", "type": "Explanation", "description": "Explain how these solutions will operate and solve the problems."},
            {"id": "T2_PROB_BODY2_EXAMPLE", "type": "Example", "description": "Give an example of a country or community where a similar solution was successful."},
            {"id": "T2_PROB_CONCLUSION", "type": "Conclusion", "description": "Recap the main problems, reinforce that the proposed solutions are viable, and offer a final warning or prediction."}
        ]
    }
]

def ingest_skeletons():
    driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))
    try:
        with driver.session() as session:
            print("Starting Skeletons Ingestion in Neo4j...")
            
            # Xóa các skeletons và discourse nodes cũ để làm sạch dữ liệu
            print("Clearing old Skeleton and DiscourseNode data...")
            session.run("MATCH (s:Skeleton) DETACH DELETE s")
            session.run("MATCH (dn:DiscourseNode) DETACH DELETE dn")
            
            for sk in SKELETONS:
                print(f"Creating Skeleton: {sk['id']} ({sk['genre']})...")
                
                # Tạo Node Skeleton chính
                session.run("""
                    CREATE (s:Skeleton {
                        id: $id, 
                        task_type: $task_type, 
                        genre: $genre
                    })
                """, id=sk["id"], task_type=sk["task_type"], genre=sk["genre"])
                
                # Tạo các DiscourseNodes và nối chúng với Skeleton chính
                previous_node_id = None
                for i, node in enumerate(sk["nodes"]):
                    # Tạo Node DiscourseNode
                    session.run("""
                        CREATE (dn:DiscourseNode {
                            id: $id,
                            type: $type,
                            description: $description,
                            step_index: $step_index
                        })
                    """, id=node["id"], type=node["type"], description=node["description"], step_index=i+1)
                    
                    # Nối Skeleton với DiscourseNode qua mối quan hệ STRUCTURED_AS
                    session.run("""
                        MATCH (s:Skeleton {id: $s_id})
                        MATCH (dn:DiscourseNode {id: $dn_id})
                        CREATE (s)-[:STRUCTURED_AS]->(dn)
                    """, s_id=sk["id"], dn_id=node["id"])
                    
                    # Nối NEXT_STEP từ node trước đó đến node hiện tại
                    if previous_node_id:
                        session.run("""
                            MATCH (dn1:DiscourseNode {id: $dn1_id})
                            MATCH (dn2:DiscourseNode {id: $dn2_id})
                            CREATE (dn1)-[:NEXT_STEP]->(dn2)
                        """, dn1_id=previous_node_id, dn2_id=node["id"])
                        
                    previous_node_id = node["id"]
                    
            # In ra thống kê để kiểm tra
            total_skeletons = session.run("MATCH (s:Skeleton) RETURN count(s) as count").single()["count"]
            total_nodes = session.run("MATCH (dn:DiscourseNode) RETURN count(dn) as count").single()["count"]
            total_steps = session.run("MATCH ()-[r:NEXT_STEP]->() RETURN count(r) as count").single()["count"]
            
            print("\n================ SKELETONS GRAPH STATS ================")
            print(f"Total Skeleton nodes created      : {total_skeletons}")
            print(f"Total DiscourseNode nodes created : {total_nodes}")
            print(f"Total NEXT_STEP links created     : {total_steps}")
            print("========================================================\n")
            print("Success! Skeletons ingestion complete.")
            
    except Exception as e:
        print(f"Error during ingestion: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    ingest_skeletons()
