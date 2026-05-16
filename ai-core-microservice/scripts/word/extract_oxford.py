"""
Name: extract_oxford.py
Description: Extract vocabulary and CEFR levels from Oxford PDF files.
"""

import os
import re
import json
from pypdf import PdfReader

# Cấu hình đường dẫn
KG_DIR = "../../KG_Oxford"
OUTPUT_MAPPING = "oxford_levels.json"

def extract_from_pdf(file_path):
    print(f"Processing: {os.path.basename(file_path)}")
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    current_level = None
    found_data = {}
    
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Kiểm tra Level header
        level_match = re.match(r"^(A1|A2|B1|B2|C1|C2)$", line)
        if level_match:
            current_level = level_match.group(1)
            continue
            
        # Kiểm tra Word entry
        word_match = re.match(r"^([a-zA-Z\s\-]+)\s+(?:n\.|v\.|adj\.|adv\.|prep\.|conj\.|det\.|pron\.)", line)
        if word_match and current_level:
            word = word_match.group(1).strip().lower()
            found_data[word] = {
                "level": current_level,
                "is_academic": current_level in ["B2", "C1", "C2"]
            }
    
    return found_data

def main():
    if not os.path.exists(KG_DIR):
        print(f"Error: {KG_DIR} not found.")
        return

    all_oxford_data = {}
    for file in os.listdir(KG_DIR):
        if file.endswith(".pdf"):
            file_path = os.path.join(KG_DIR, file)
            data = extract_from_pdf(file_path)
            all_oxford_data.update(data)

    if not all_oxford_data:
        print("Warning: No words found.")
        return

    print(f"Success: Found {len(all_oxford_data)} words.")

    with open(OUTPUT_MAPPING, "w", encoding="utf-8") as f:
        json.dump(all_oxford_data, f, indent=4, ensure_ascii=False)
    print(f"Saved to {OUTPUT_MAPPING}")

if __name__ == "__main__":
    main()
