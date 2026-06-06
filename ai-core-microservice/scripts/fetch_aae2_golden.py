import json
import os

try:
    from datasets import load_dataset
except ImportError:
    print("❌ Thư viện 'datasets' chưa được cài đặt. Chạy: pip install datasets")
    exit(1)

OUTPUT_FILE = "../data/aae_golden_graph.json"

def process_aae2_dataset():
    print("🚀 Bắt đầu tải dataset 'pie/aae2' từ HuggingFace...")
    try:
        dataset = load_dataset("pie/aae2", split="train", trust_remote_code=True)
        print(f"✅ Tải thành công {len(dataset)} bài luận.")
    except Exception as e:
        print(f"❌ Lỗi tải dataset: {e}")
        return

    print("🔄 Đang bóc tách đồ thị lập luận (Argumentation Graph)...")
    golden_data = []

    for idx, example in enumerate(dataset):
        essay_id = example.get('id', f'aae_essay_{idx}')
        essay_text = example.get('text', '')
        
        # AAE schema thường có spans (entities) và relations
        # Tùy phiên bản, có thể là 'annotations' thay vì 'spans'
        spans = example.get('spans', []) or example.get('annotations', [])
        relations = example.get('relations', [])
        
        # Map id to span
        span_map = {}
        for span in spans:
            # Lấy text. Nếu không có text, thử cắt từ essay_text
            span_text = span.get('text', '')
            if not span_text and 'start' in span and 'end' in span:
                span_text = essay_text[span['start']:span['end']]
            
            # Map nhãn (Label)
            label = span.get('label', 'Claim')
            if 'MajorClaim' in label:
                node_label = 'Claim' # Major
            elif 'Claim' in label:
                node_label = 'Claim'
            else:
                node_label = 'Evidence' # Premise
                
            span_map[span['id']] = {
                "text": span_text.strip(),
                "label": node_label
            }

        triplets = []
        for rel in relations:
            source_id = rel.get('head', rel.get('source_id'))
            target_id = rel.get('tail', rel.get('target_id'))
            rel_type = rel.get('type', rel.get('label', 'supports')).upper()

            if source_id in span_map and target_id in span_map:
                triplets.append({
                    "subject": {"name": span_map[source_id]['text'], "label": span_map[source_id]['label']},
                    "relationship": rel_type,
                    "object": {"name": span_map[target_id]['text'], "label": span_map[target_id]['label']}
                })
        
        if len(triplets) > 0:
            golden_data.append({
                "essayId": essay_id,
                "triplets": triplets
            })

    out_path = os.path.join(os.path.dirname(__file__), OUTPUT_FILE)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(golden_data, f, ensure_ascii=False, indent=2)
        
    print(f"🎉 Đã lưu thành công {len(golden_data)} Đồ thị Chuẩn Vàng vào: {out_path}")

if __name__ == "__main__":
    process_aae2_dataset()
