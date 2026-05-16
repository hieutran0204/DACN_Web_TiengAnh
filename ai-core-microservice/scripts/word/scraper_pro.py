import asyncio
import aiohttp
import json
import os
import time

# ===== CẤU HÌNH =====
WORD_LIST_FILE = "words.txt"
OUTPUT_FILE = "dictionary_data.jsonl"
FILE_404 = "404_words.txt"
BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/"

CONCURRENT_REQUESTS = 5
BATCH_SIZE = 15
REQUEST_TIMEOUT = 30
RETRY_COUNT = 2
SLEEP_BETWEEN_BATCH = 1.0

# Ép API không dùng Brotli (br) để tránh lỗi decode
HEADERS = {
    "Accept-Encoding": "gzip, deflate",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

async def fetch_word(session, word, semaphore, f_out, f_404):
    async with semaphore:
        url = BASE_URL + word.replace(" ", "%20")
        for attempt in range(RETRY_COUNT):
            try:
                async with session.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT) as response:
                    status = response.status
                    if status == 200:
                        data = await response.json()
                        entry = {"word": word, "status": 200, "data": data}
                        f_out.write(json.dumps(entry, ensure_ascii=False) + "\n")
                        return "success"
                    elif status == 404:
                        # CHỈ ghi vào 404 nếu chắc chắn API trả về 404
                        f_404.write(word + "\n")
                        return "404"
                    elif status == 429:
                        return "rate_limit"
            except Exception as e:
                # Nếu là lỗi mạng, lỗi decode... thì KHÔNG ghi vào 404
                # Để lần sau script chạy lại nó sẽ thử cào lại từ này
                pass
            await asyncio.sleep(1)
        return "failed"

async def load_processed():
    processed = set()
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            for line in f:
                try: processed.add(json.loads(line)["word"])
                except: pass
    if os.path.exists(FILE_404):
        with open(FILE_404, "r", encoding="utf-8") as f:
            for line in f: processed.add(line.strip())
    return processed

async def main():
    processed = await load_processed()
    try:
        with open(WORD_LIST_FILE, "r", encoding="utf-8") as f:
            all_words = [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print(f"❌ Không tìm thấy {WORD_LIST_FILE}")
        return

    remaining_words = [w for w in all_words if w not in processed]
    print(f"🚀 Còn {len(remaining_words)} từ cần xử lý. Đã ép tắt Brotli để tránh lỗi.")

    semaphore = asyncio.Semaphore(CONCURRENT_REQUESTS)
    async with aiohttp.ClientSession() as session:
        with open(OUTPUT_FILE, "a", encoding="utf-8") as f_out, \
             open(FILE_404, "a", encoding="utf-8") as f_404:
            
            total = len(remaining_words)
            for start in range(0, total, BATCH_SIZE):
                batch = remaining_words[start:start + BATCH_SIZE]
                tasks = [fetch_word(session, word, semaphore, f_out, f_404) for word in batch]
                
                results = await asyncio.gather(*tasks)
                
                success = results.count("success")
                missing = results.count("404")
                rate_limit = results.count("rate_limit")
                failed = results.count("failed")
                
                current = min(start + BATCH_SIZE, total)
                print(f"📈 [{current}/{total}] | ✅ {success} | 🔍 404: {missing} | ⚠️ Limit: {rate_limit} | ❌ fail: {failed}")
                
                f_out.flush()
                f_404.flush()
                
                if rate_limit > 0:
                    print("🐢 Đang bị giới hạn, nghỉ 5s...")
                    await asyncio.sleep(5)
                else:
                    await asyncio.sleep(SLEEP_BETWEEN_BATCH)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Dừng thủ công. Dữ liệu đã được lưu!")