import requests
import json
import time
import os

# --- CẤU HÌNH ---
WORD_LIST_FILE = 'words.txt'
OUTPUT_FILE = 'dictionary_data.jsonl' # CHỈ lưu từ cào thành công (Status 200)
FILE_404 = '404_words.txt'            # Cất mấy từ bị 404 ra một file riêng
BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/"

def get_scraped_words():
    """Gom danh sách từ đã cào (từ cả file JSONL và file 404) để bỏ qua"""
    scraped = set()
    
    # 1. Đọc các từ thành công từ file JSONL
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    scraped.add(data['word'])
                except:
                    continue
                    
    # 2. Đọc các từ 404 từ file text (để script nhớ mặt không cào lại)
    if os.path.exists(FILE_404):
        with open(FILE_404, 'r', encoding='utf-8') as f:
            for line in f:
                scraped.add(line.strip())
                
    return scraped

def main():
    # Đọc danh sách từ gốc
    try:
        with open(WORD_LIST_FILE, 'r', encoding='utf-8') as f:
            all_words = [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print(f"Lỗi: Không tìm thấy file '{WORD_LIST_FILE}'!")
        return

    # Lọc ra những từ chưa cào
    scraped_set = get_scraped_words()
    remaining_words = [w for w in all_words if w not in scraped_set]

    print(f"--- BÁO CÁO TIẾN ĐỘ ---")
    print(f"Tổng list: {len(all_words)} từ")
    print(f"Đã xử lý:  {len(scraped_set)} từ")
    print(f"Còn lại:   {len(remaining_words)} từ")
    print(f"-----------------------\n")

    if not remaining_words:
        print("🎉 Chúc mừng ní! Đã cào xong hết sạch rồi.")
        return

    # Mở song song 2 file ở chế độ 'a' (append - ghi nối tiếp)
    with open(OUTPUT_FILE, 'a', encoding='utf-8') as f_out, \
         open(FILE_404, 'a', encoding='utf-8') as f_404:
        
        total = len(remaining_words)
        for i, word in enumerate(remaining_words, 1):
            safe_word = word.replace(" ", "%20")
            print(f"[{i}/{total}] Đang lấy: {word:<20}", end="")
            
            try:
                # Gọi API với timeout 15s để tránh treo máy
                response = requests.get(BASE_URL + safe_word, timeout=15)
                
                if response.status_code == 200:
                    # TỪ THÀNH CÔNG -> Ghi vào file JSONL
                    entry = {"word": word, "status": 200, "data": response.json()}
                    f_out.write(json.dumps(entry, ensure_ascii=False) + '\n')
                    f_out.flush() # Lưu thẳng xuống ổ cứng
                    print("✅ Lụm!")
                    
                elif response.status_code == 404:
                    # TỪ BỊ LỖI -> Chỉ ghi tên từ vựng vào file 404.txt
                    f_404.write(word + '\n')
                    f_404.flush()
                    print("❌ 404 (Đã cất vào file riêng)")
                    
                else:
                    print(f"⚠️ Lỗi {response.status_code}")
                
            except Exception as e:
                print(f"🔥 Lỗi mạng: {e}")
                time.sleep(5) # Lỗi mạng thì cho kịch bản nghỉ ngơi 5s
            
            # QUAN TRỌNG: Nghỉ 1s để bảo vệ API và chống bị khóa IP
            time.sleep(1)

if __name__ == "__main__":
    main()sao vậy