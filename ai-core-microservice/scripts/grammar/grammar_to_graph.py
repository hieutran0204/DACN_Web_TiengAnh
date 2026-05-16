import os
import re
import yaml
import sys
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Ép Terminal dùng UTF-8 để in tiếng Việt
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Load môi trường
load_dotenv()

class GrammarGraphBuilder:
    def __init__(self):
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USER", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        self.grammar_path = "../../md/grammar"

    def close(self):
        self.driver.close()

    def parse_md_file(self, file_path):
        """Bóc tách metadata và content từ file markdown"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Tìm block metadata giữa ---
        meta_match = re.search(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        metadata = {}
        clean_content = content
        
        if meta_match:
            try:
                metadata = yaml.safe_load(meta_match.group(1))
                clean_content = content[meta_match.end():]
            except Exception as e:
                print(f"Error parsing metadata in {file_path}: {e}")
        
        # Lấy tiêu đề từ dòng # đầu tiên
        title_match = re.search(r'^#\s+(.*)', clean_content, re.MULTILINE)
        title = title_match.group(1) if title_match else os.path.basename(file_path)
        
        return {
            "title": title,
            "metadata": metadata,
            "content": clean_content,
            "filename": os.path.basename(file_path)
        }

    def sync_to_neo4j(self):
        with self.driver.session() as session:
            # 1. Quét và tạo tất cả các Node trước
            for root, dirs, files in os.walk(self.grammar_path):
                for file in files:
                    if file.endswith(".md"):
                        full_path = os.path.join(root, file)
                        data = self.parse_md_file(full_path)
                        
                        # Tạo Node
                        session.execute_write(self._create_grammar_node, data)
                        print(f"Synced Node: {data['title']}")

            # 2. Tạo quan hệ dựa trên metadata 'related_to'
            for root, dirs, files in os.walk(self.grammar_path):
                for file in files:
                    if file.endswith(".md"):
                        full_path = os.path.join(root, file)
                        data = self.parse_md_file(full_path)
                        
                        if 'related_to' in data['metadata']:
                            for target in data['metadata']['related_to']:
                                session.execute_write(self._create_relationship, data['filename'], target)

    @staticmethod
    def _create_grammar_node(tx, data):
        query = """
        MERGE (g:Grammar {filename: $filename})
        SET g.title = $title,
            g.content = $content,
            g.complexity = $complexity,
            g.tags = $tags,
            g.updated_at = timestamp()
        """
        tx.run(query, 
               filename=data['filename'],
               title=data['title'],
               content=data['content'],
               complexity=data.get('metadata', {}).get('complexity_level', 'Medium'),
               tags=data.get('metadata', {}).get('tags', []))

    @staticmethod
    def _create_relationship(tx, source_file, target_file):
        # Lưu ý: Target file trong metadata có thể là tên file .md
        query = """
        MATCH (a:Grammar {filename: $source_file})
        MATCH (b:Grammar {filename: $target_file})
        MERGE (a)-[:RELATED_TO]->(b)
        """
        tx.run(query, source_file=source_file, target_file=target_file)

if __name__ == "__main__":
    builder = GrammarGraphBuilder()
    try:
        print("Starting Grammar Sync to Neo4j...")
        builder.sync_to_neo4j()
        print("Successfully synced all grammar modules!")
    finally:
        builder.close()
