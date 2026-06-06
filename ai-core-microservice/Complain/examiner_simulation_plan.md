# 🧠 BRAINSTORM: Examiner Simulation Model — Upgrade Plan

## Tổng quan

Hiện tại hệ thống đang ở tầng **"Rule-based NLP Grader"**.
Mục tiêu nâng cấp lên **"Examiner Simulation Model"** theo 4 trụ cột.

---

## Phân tích hiện trạng từng tiêu chí

### 🔴 CC — Hiện trạng vs Target

| | Hiện tại | Target |
|---|---|---|
| **Tín hiệu chính** | Đếm số `topic_sentence` (LLM discourse role) + số từ nối | Discourse Graph: Node = Idea, Edge = Logical Relation |
| **Giới hạn** | LLM nhỏ hay hallucinate, bỏ lọt "example" và "topic_sentence" | Không phụ thuộc LLM để phát hiện cấu trúc |
| **Điểm yếu chí mạng** | Bài có 2 topic sents + 1 example → Band 7, bất kể 2 ý đó có liên kết logic với nhau không | Graph Engine sẽ kiểm tra: Edge (CLAIM → EVIDENCE) có tồn tại không? |

**Kế hoạch:**
Xây dựng `discourse-graph.service.js` mới. LLM (Node 2) sẽ được prompt để trả về **graph triplets** thay vì chỉ gán nhãn discourse roles:

```json
{
  "nodes": [
    { "id": "n1", "type": "CLAIM", "text": "EVs protect the environment" },
    { "id": "n2", "type": "EVIDENCE", "text": "Zero carbon emissions" },
    { "id": "n3", "type": "COUNTER", "text": "Battery production is polluting" }
  ],
  "edges": [
    { "from": "n1", "to": "n2", "relation": "SUPPORTED_BY" },
    { "from": "n3", "to": "n1", "relation": "CHALLENGES" }
  ]
}
```

**Scoring từ Graph:**
- Mỗi CLAIM có ít nhất 1 `SUPPORTED_BY` Edge → Essay có phát triển luận điểm
- `COUNTER` → `REBUT` Edge → Học viên biết phản biện (Band 8+ TR + CC)
- CLAIM không có Edge nào → "Unsupported assertion" → CC penalty

> **Lợi thế:** Neo4j đã có sẵn. `graphService` đã có pattern APOC merge. Chỉ cần thêm service mới + cập nhật ScoringEngine.

---

### 🔴 LR — Hiện trạng vs Target

| | Hiện tại | Target |
|---|---|---|
| **Phương pháp** | Word List matching (AWL, LESS_COMMON_WORDS, ACADEMIC_COLLOCATIONS) | Collocation Embedding Similarity |
| **Giới hạn** | Giới hạn trong hardcoded list; từ C1/C2 chưa có trong list sẽ bị bỏ lọt | Nhúng cụm từ thành Vector, so sánh Cosine với corpus học thuật |
| **Điểm yếu** | "a big consequence" và "a profound implication" cho điểm như nhau nếu "profound" nằm trong list | Embedding phân biệt được: "profound implication" gần corpus học thuật hơn "big consequence" |

**Kế hoạch:**
Xây dựng `collocation-embedding.service.js`:

1. **Pre-compute corpus embeddings** (one-time): Lấy ~500 cụm collocation C1/C2 từ Cambridge Phrase Bank, nhúng thành vector, lưu vào Neo4j VectorStore.
2. **Runtime**: Với mỗi n-gram (2-3 từ) trong bài viết học viên, nhúng thành vector → query cosine similarity với corpus.
3. **Scoring**: Cụm nào cosine ≥ 0.75 → "Advanced collocation hit". Tổng hits → LR score signal.

**File ảnh hưởng:**
- `rule-based.service.js`: `_extractAcademicWords` có thể loại bỏ hoàn toàn, thay bằng async call đến `collocation-embedding.service.js`
- `feature-builder.js`: Thêm field `collocation_similarity_score` vào `lexical_resource`
- `scoring.engine.js`: `_computeLR` dùng `collocation_similarity_score` thay `advanced_vocab_count`

> **Lưu ý:** Hệ thống đã có `GoogleGenerativeAIEmbeddings` và `Neo4jVectorStore`. Về mặt kỹ thuật chỉ cần thêm corpus data và query logic.

---

### 🟡 GRA — Hiện trạng vs Target

| | Hiện tại | Target |
|---|---|---|
| **Phương pháp** | Micro-evaluator LLM đọc từng câu, *infer* lỗi dựa trên context | Sentence-level Error Verification: chỉ xác nhận lỗi, không suy luận |
| **Giới hạn** | LLM nhỏ hay "sửa" câu đúng thành sai (False Positive), hoặc bỏ sót lỗi rõ ràng | Dùng deterministic grammar checker để verify trước, LLM chỉ confirm |
| **Điểm yếu** | "Although technology has advanced, it has..." → LLM đôi khi gán là fragment | Truyền cho LLM cả câu + token span, hỏi: "Is this span grammatically correct?" |

**Kế hoạch:**
Thêm **Pre-verification Layer** trước LLM call trong `micro-evaluator.service.js`:

```
[Câu học viên]
     ↓
[LanguageTool/Compromise rule-check] → Xác định vùng nghi ngờ (suspect span)
     ↓
[LLM prompt] = "Does this SPECIFIC span contain a grammar error? YES/NO + reason"
     ↓
[Chỉ lưu lỗi nếu LLM confirms YES]
```

**Kết quả:** Giảm False Positive từ ~30% xuống < 5%. LLM không còn hallucinate lỗi vì nó chỉ được phép xác nhận, không được suy luận.

**File ảnh hưởng:**
- `ai/micro-evaluator.service.js`: Thêm pre-verify step
- Không cần thay đổi `scoring.engine.js` hay `feature-builder.js` (interface giữ nguyên)

---

### 🟡 TR — Hiện trạng vs Target

| | Hiện tại | Target |
|---|---|---|
| **Phương pháp** | Semantic similarity + keyword score + paragraph count → devBase score | Rubric Checklist: từng tiêu chí Cambridge là 1 câu hỏi Yes/No |
| **Giới hạn** | wordCount ≥ 350 → devBase = 7.0, bất kể ý có sâu không | Checklist ngăn việc "hack điểm bằng độ dài" |
| **Điểm yếu** | Bài 400 từ nhưng toàn repetition có thể đạt TR 7.0 | Checklist yêu cầu: "Position stated AND maintained?" → NO nếu bài tự mâu thuẫn |

**Kế hoạch:**
Thêm `rubric-checklist.service.js`:

```javascript
const TR_CHECKLIST = {
  opinion: [
    "Is a clear position stated in the introduction?",
    "Is the position maintained consistently throughout?",
    "Are there at least 2 distinct supporting arguments?",
    "Is each argument developed with evidence or example?",
    "Does the conclusion restate the position?"
  ],
  discussion: [
    "Are BOTH views of the issue presented?",
    "Is each view supported with at least 1 reason?",
    "Is the student's personal opinion clearly stated?",
    ...
  ]
}
```

LLM được gọi **một lần** với toàn bộ checklist (không phải 5 lần riêng lẻ). Output là một JSON `{ checked: boolean, evidence: string }[]`. Score = Tỷ lệ YES trên tổng checklist.

**Kết quả:** TR score minh bạch, traceable, không thể bị inflate bởi độ dài bài viết.

---

## Thứ tự triển khai đề xuất

Theo nguyên tắc **Lowest Risk → Highest Impact First**:

```
Phase 1 (Ít phá vỡ nhất — chỉ thêm service mới):
  ├── GRA Pre-verification Layer (micro-evaluator)
  └── TR Rubric Checklist (thêm 1 LLM call trước scoring)

Phase 2 (Thay thế signal hiện tại):
  ├── CC Discourse Graph (thêm service + sửa ScoringEngine CC)
  └── LR Embedding Similarity (thay Word List matching)
```

> **Lý do Phase 2 sau:** Cả CC và LR đều yêu cầu thêm embedding corpus data và sửa ScoringEngine. Phase 1 có thể deploy độc lập không breaking change.

---

## File Impact Map

| File | Phase | Loại thay đổi |
|------|-------|--------------|
| `services/ai/micro-evaluator.service.js` | 1 | Sửa (thêm pre-verify step) |
| `services/ai/rubric-checklist.service.js` | 1 | **Mới** |
| `services/ai/scoring.engine.js` | 1 → 2 | Sửa (_computeTR dùng checklist score, _computeCC dùng graph) |
| `services/nlp/discourse-graph.service.js` | 2 | **Mới** |
| `services/nlp/collocation-embedding.service.js` | 2 | **Mới** |
| `services/rag/feature-builder.js` | 2 | Sửa (thêm fields mới) |
| `services/ai/prompt.service.js` | 2 | Sửa (CC context từ graph) |
| `services/nlp/rule-based.service.js` | 2 | Giảm vai trò (Word List chỉ dùng cho AWL density) |

---

## Rủi ro và Biện pháp

| Rủi ro | Xác suất | Biện pháp |
|--------|----------|-----------|
| Embedding latency làm timeout | Cao | Cache embedding vào Redis/Neo4j; async pre-compute |
| LLM discourse graph hallucinate edges | Trung bình | Validate: chỉ chấp nhận edges có `evidence` text trích từ bài |
| TR Checklist LLM cost tăng | Thấp | Gộp 5 câu hỏi vào 1 call, không phải 5 calls riêng |
| Breaking change feature-builder → scoring pipeline | Cao | Giữ backward compat fields; thêm field mới song song |

---

## Quyết định cần bạn xác nhận trước khi code

> [!IMPORTANT]
> Cần bạn xác nhận 3 điểm sau trước khi bắt đầu code:

1. **Phase 1 hay Phase 2 trước?** Đề xuất: bắt đầu từ **GRA Pre-verification** vì ít risk nhất và cải thiện ngay độ chính xác.
2. **LR Embedding**: Dùng `GoogleGenerativeAIEmbeddings` (có sẵn, cần API) hay tích hợp `nomic-embed-text` qua Ollama (offline, latency cao hơn)?
3. **Discourse Graph**: LLM nào để generate graph? Micro-evaluator hiện tại (nhỏ, nhanh) hay Gemini Flash (chuẩn hơn)?
