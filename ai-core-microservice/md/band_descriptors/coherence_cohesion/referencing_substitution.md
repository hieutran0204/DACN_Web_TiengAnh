# Referencing and Substitution: Lexical Cohesion Techniques

## 1. Definition
These techniques are used to bind sentences together without repeating the same words, ensuring a smooth flow of ideas. They are key indicators of a **Band 7.0+** in Coherence and Cohesion.

## 2. Summary Nouns (Anaphoric Nouns) - Kỹ thuật Band 7.5+
Thay vì dùng các đại từ "It", "This", "That" một cách mơ hồ, thí sinh Band 7.5+ sử dụng các danh từ tóm lược để vừa kết nối vừa phân loại thông tin của câu trước.

### 📋 Danh mục Summary Nouns theo ngữ cảnh:
- **Problem/Issue:** *this predicament, this obstacle, this dilemma, these challenges*
- **Action/Process:** *this initiative, this measure, this procedure, this approach*
- **Change/Trend:** *this shift, this development, this transformation, this tendency*
- **Argument/Idea:** *this contention, this notion, this perspective, this hypothesis*

### 💡 Transformation Template (AI Scaffolding):
- **Input:** "...Many people are losing their jobs. It is a big problem."
- **Suggestion:** "Thay vì dùng 'It', hãy dùng '**This economic instability**' hoặc '**This alarming trend**' để tóm tắt tình trạng thất nghiệp và tăng tính chuyên nghiệp cho bài viết."

## 3. Substitution Techniques
Dùng các từ thay thế để tránh lặp từ (Lexical Repetition).

- **The former / The latter:** "Governments can invest in renewable energy or nuclear power. While **the former** is safer, **the latter** provides a more consistent energy supply."
- **That of / Those of:** "The air quality in rural areas is significantly better than **that of** major cities."
- **One / Ones:** "If society wants to solve environmental issues, individuals must be the **ones** to take action first."

## 4. Referencing Patterns
### A. Anaphoric Reference (Nhắc lại ý trước)
* **Personal Pronouns:** *it, they, them.*
* **Demonstrative Pronouns:** *this, that, these, those.*
* **Possessive Adjectives:** *its, their.*

### B. AI Logic:
* Quét thực thể (Entity) ở câu $N$ và kiểm tra đại từ ở câu $N+1$. 
* Nếu đại từ không có thực thể rõ ràng để trỏ về -> Gắn tag `[AMBIGUOUS_REFERENCE]`.
* Nếu khoảng cách giữa 2 Node có cùng nội dung (Identical Strings) < 3 câu -> Flag `[WORD_REPETITION]`.

## 5. Band Descriptor Impact

| Band | Performance Characteristics |
| :--- | :--- |
| **9.0** | Referencing is so natural that it is almost invisible to the reader. |
| **7.0** | Successfully uses a range of referencing; substitution is clear and accurate. |
| **5.0** | Heavy repetition of key words; referencing is often faulty or unclear. |

## 6. Demonstration for AI Scaffolding

**❌ Band 5.0 (Repetitive):**
> **Computers** are everywhere. **Computers** help people work. **Computers** are also used for games. Because **computers** are expensive, people must save money to buy **computers**.

**✅ Band 7.5+ (Referencing/Substitution):**
> **Computers** are ubiquitous in modern society. **These devices** assist individuals with their professional tasks, while **they** are equally popular for entertainment purposes. Since **such technology** is often costly, saving money becomes a necessity for potential buyers. **This financial burden**, tuy nhiên, lại được bù đắp bởi hiệu quả làm việc mà chúng mang lại.