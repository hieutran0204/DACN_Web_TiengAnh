import json
import os

try:
    from datasets import load_dataset
except ImportError:
    print("❌ Thư viện 'datasets' chưa được cài đặt.")
    print("Vui lòng chạy lệnh: pip install datasets pandas")
    exit(1)

OUTPUT_FILE = "../data/aae2_finetuning_dataset.jsonl"

def convert_to_instruction_format(example):
    """
    Chuyển đổi 1 bài Essay từ dataset AAE sang format Instruction để Fine-tune SLM.
    Lưu ý: Bạn có thể cần điều chỉnh logic parse dựa trên cấu trúc chính xác của 'pie/aae2'.
    """
    essay_text = example.get('text', '')
    
    # Giả định dataset có mảng 'annotations' hoặc 'spans' chứa các nhãn
    # và mảng 'relations' chứa các liên kết
    annotations = example.get('annotations', [])
    relations = example.get('relations', [])
    
    # 1. Định dạng Instruction
    instruction = (
        "You are an expert IELTS examiner and linguist. "
        "Extract the argumentation triplets from the following essay. "
        "Identify the MajorClaim, Claims, and Premises. "
        "Then establish the relationships between them (SUPPORTS, ATTACKS). "
        "Return the output as a valid JSON array of Triplets."
    )
    
    # 2. Xây dựng Output chuẩn (Ground Truth)
    triplets = []
    
    # Ánh xạ ID sang Text để dễ truy xuất
    id_to_text = {}
    for ann in annotations:
        id_to_text[ann['id']] = ann['text']
        
    for rel in relations:
        source_text = id_to_text.get(rel['source_id'], "Unknown")
        target_text = id_to_text.get(rel['target_id'], "Unknown")
        rel_type = rel['type'].upper() # SUPPORTS hoặc ATTACKS
        
        triplets.append({
            "subject": {"name": source_text.strip(), "label": "Premise"},
            "relationship": rel_type,
            "object": {"name": target_text.strip(), "label": "Claim"}
        })
        
    output_json = json.dumps({"triplets": triplets}, ensure_ascii=False)

    return {
        "instruction": instruction,
        "input": essay_text,
        "output": output_json
    }

def main():
    print("🚀 Bắt đầu tải dataset 'pie/aae2' từ HuggingFace...")
    # Tải bộ dữ liệu
    try:
        dataset = load_dataset("pie/aae2", split="train")
        print(f"✅ Tải thành công {len(dataset)} bài luận.")
    except Exception as e:
        print(f"❌ Lỗi khi tải dataset: {e}")
        return

    print("🔄 Đang chuyển đổi sang format JSONL...")
    formatted_data = []
    
    # Lặp qua từng bài essay
    for i, example in enumerate(dataset):
        try:
            # Lưu ý: Vì dataset pie/aae2 có cấu trúc đặc thù, hàm convert ở trên 
            # chỉ là bộ khung (template). Bạn cần inspect schema thực tế của dataset 
            # để extract chính xác các field.
            formatted = convert_to_instruction_format(example)
            formatted_data.append(formatted)
        except Exception as e:
            pass

    # Ghi ra file JSONL
    out_path = os.path.join(os.path.dirname(__file__), OUTPUT_FILE)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    
    with open(out_path, 'w', encoding='utf-8') as f:
        for item in formatted_data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')
            
    print(f"🎉 Hoàn tất! Đã lưu {len(formatted_data)} mẫu huấn luyện vào: {out_path}")
    print("👉 Hãy dùng file này để upload lên Google Colab (Unsloth) và tiến hành Fine-tune!")

if __name__ == "__main__":
    main()
