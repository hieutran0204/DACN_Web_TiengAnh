# Linking Words: Classification, Usage, and Scoring Logic

## 1. Functional Classification (The Library)
AI should use this library to identify the *intent* of each connection.

| Function | Basic (Band 5.0-6.0) | Advanced (Band 7.0+) |
| :--- | :--- | :--- |
| **Addition** | And, Also, Plus, Besides | Furthermore, Moreover, Additionally, Coupled with |
| **Contrast** | But, Or, So, However | Nevertheless, Nonetheless, Conversely, Notwithstanding |
| **Result/Cause** | So, Because, Therefore | Consequently, Hence, Thus, Accordingly, As a result |
| **Concession** | But, Even though | Albeit, Regardless of, Despite the fact that |
| **Example** | For example, Like | To illustrate, For instance, As a case in point |

## 2. Positioning & Sentence Variety
A key differentiator between Band 6.0 and 7.0+ is where the linking word is placed.

### A. Front-loading (The "Mechanical" Trap)
* **Pattern:** `[Linking Word], [Subject] [Verb]...`
* **Example:** "Furthermore, the government should invest in education."
* **AI Logic:** Nếu >70% câu bắt đầu bằng format này, đánh tag `[OVERUSE_MECHANICAL]`.

### B. Mid-sentence/Parenthetical (Advanced)
* **Pattern:** `[Subject], [Linking Word], [Verb]...`
* **Example:** "The government, **therefore**, should invest in education."
* **AI Logic:** Phát hiện vị trí này để cộng điểm "Flexibility".

## 3. The "Overuse" & "Misuse" Detection Logic

### A. Overuse (Band 5.0 - 5.5)
* **Metric:** Linker Density.
* **Flag:** Nếu mỗi câu đều có một từ nối ở đầu, bài viết sẽ bị khô khan và thiếu tự nhiên.
* **Instruction for AI:** Check if 3 or more consecutive sentences start with a formal linker.

### B. Misuse of Register
* **Flag:** Sử dụng từ nối quá thân mật (informal) trong bài viết Academic.
* **Forbidden words:** *Besides* (đầu câu), *Plus*, *Anyway*, *By the way*.

### C. Meaning Mismatch
* **Flag:** Dùng "However" nhưng hai vế không có sự đối lập về nghĩa.
* **AI Requirement:** Sử dụng NLP để check semantic similarity giữa Sentence A và Sentence B.

## 4. RAG Metadata for GraphRAG
* **Node:** `Linker_Entity`
* **Properties:**
    * `category`: (Contrast, Addition, etc.)
    * `band_level`: (Basic/Advanced)
    * `position_preference`: (Start/Mid/End)
* **Edges:**
    * `CONNECTS`: (Sentence_A) -> (Sentence_B)
    * `TRANSITIONS`: (Paragraph_1) -> (Paragraph_2)

## 5. Few-shot Example for AI Training

**❌ Band 5.5 (Mechanical):**
> Firstly, pollution is bad. Secondly, it affects health. Moreover, it kills animals. Therefore, we must stop it.

**✅ Band 7.5+ (Natural):**
> Pollution is a significant concern; **moreover**, its impact on human health cannot be overstated. Beyond the medical implications, **however**, lies a deeper ecological crisis as many species face extinction. Addressing this issue **thus** becomes a global priority.