# 🎓 BÁO CÁO ĐÁNH GIÁ TOÀN DIỆN — IELTS AI SCORING MICROSERVICE

> **Vai trò giám khảo:** Senior AI Engineer + Cambridge IELTS Examiner Evaluator  
> **Ngày đánh giá:** 2026-06-03  
> **Phạm vi:** Toàn bộ AI pipeline (`ai-core-microservice`)  
> **Tiêu chí:** Production Readiness · Knowledge Credibility · Pedagogical Value · Engineering Quality

---

## 📊 TỔNG ĐIỂM ĐÁNH GIÁ

| Hạng mục | Điểm | Ghi chú |
|---|---|---|
| **Kiến trúc AI** | 8.2 / 10 | Dual-Node rất tốt, có cơ sở lý thuyết vững |
| **Độ chính xác chấm điểm** | 6.5 / 10 | QWK=0.74 là chấp nhận được nhưng chưa đủ tin cậy cho production |
| **Độ uy tín kiến thức (Cambridge rubric)** | 7.5 / 10 | Aligned tốt, nhưng vài điểm tự suy luận chưa có citation |
| **Khả năng giúp học viên tăng band** | 7.0 / 10 | Feedback chất lượng, nhưng bị giới hạn bởi latency |
| **Production Readiness** | 4.5 / 10 | **CHƯA SẴN SÀNG** — latency P50=654s là blocker nghiêm trọng |
| **Code Quality** | 7.8 / 10 | Clean Code tốt, defensive programming rất tốt |
| **TỔNG** | **6.9 / 10** | Tiềm năng cao, nhưng cần giải quyết bottleneck cốt lõi |

---

## PHẦN 1: ĐÁNH GIÁ ĐỘ UY TÍN KIẾN THỨC (Knowledge Credibility)

### 1.1 ✅ Những gì đúng với Cambridge Rubric

**GRA Engine** (`scoring.engine.js` L80–162) có calibration rất tốt:
- Error rate → base score mapping (`<1.0/100w → Band 7`, `<5.0 → Band 6`...) phù hợp với Cambridge Band Descriptors thực tế
- Tách biệt Accuracy (error rate) và Range (complex ratio, advanced structures) đúng chuẩn
- Downgrade rule `base >= 7.0 AND complexRatio < 0.15` — đúng vì Cambridge Band 7 yêu cầu "variety of complex structures"

**LR Engine** (L176–292) có điểm mạnh:
- AWL Coverage làm primary signal thay vì TTR — đây là quyết định đúng về mặt học thuật (Coxhead 2000)
- Word Family Diversity penalty (`familyRatio < 0.55`) — rất đúng, Cambridge phân biệt rõ "range" vs "repetition"
- Register penalty cho informal vocabulary — aligned với Cambridge Band 5 descriptor

**CC Engine** (L320–461) — Dual-signal design sáng tạo:
- 60/40 blend (Graph + Legacy) có reasoning rõ ràng và phòng thủ tốt trước LLM under-extraction
- Mechanical transition penalty → Band 7 blocker là đúng Cambridge rubric
- Coherence penalty cap ở -0.5 với lý do FP rate 20% — phán đoán thực tiễn tốt

**TR Engine** (L495–648):
- Phase 1 Relevance Gate (DRIFT/PARTIAL/ADEQUATE) — rất phù hợp Cambridge "tangentially addresses"
- Checklist inflation cap (`devBase = min(checklistScore, 7.5)`) — đúng: checklist không thể đo lường holistic judgment
- Bonus stacking cap `rawAdjustment > 0.5 → capped at 0.5` — giải quyết đúng root cause TR=9 inflation

### 1.2 ⚠️ Những điểm cần challenge về mặt học thuật

**[MEDIUM RISK] AWL thresholds tự định nghĩa:**
```
Band 5: ~1-3% | Band 6: ~3-6% | Band 7: ~6-10% | Band 8+: ~10%+
```
Comment nói "Empirical ranges from IELTS essay corpora" nhưng không có citation cụ thể. Đây là calibration nội bộ trên ~10 essays — sample size quá nhỏ. Cambridge chính thức không publish AWL % thresholds. **Risk:** Nếu hội đồng hỏi source, không có tài liệu backing.

**[MEDIUM RISK] Cliché density thresholds:**
```
Band 5 avg density: 11.52 | Band 6 avg: 4.44 | Band 7 avg: 0.20
```
Derived từ `calibrate_cliche_threshold.js on 10 IELTS essays` — 10 essays là sample size không đủ để generalize. Tuy nhiên thresholds được document rõ trong code nên defense-able.

**[LOW RISK] GRA Range thresholds không có citation:**
- `complexRatio >= 0.40 && advStructs >= 3 → +0.5` — logic hợp lý nhưng tự định nghĩa
- Cambridge rubric nói "variety" nhưng không quantify thành số

**[HIGH RISK] Group B data leakage trong eval_results.json:**
```json
"note": "Group B predicted scores were manually set equal to human scores"
"data_integrity_warning": "Group B (GT_021-030) has delta_overall=0 for all 10 cases. This is data leakage."
```
Đây là **vi phạm nghiêm trọng về integrity** nếu sử dụng combined metrics (QWK=0.86) cho báo cáo. Code đã tự warn về điều này — credit cho tính minh bạch — nhưng nếu hội đồng hỏi, phải defend rõ ràng chỉ dùng Group A metrics.

---

## PHẦN 2: ĐÁNH GIÁ NHỮNG GÌ MỘT GIA SƯ AI CÓ THỂ LÀM CHO HỌC VIÊN

### 2.1 ✅ Điểm mạnh thực sự (Production Tutor Value)

**Sentence-level annotation với discourse roles:**
- Micro-Evaluator phân loại từng câu: `topic_sentence | supporting_detail | example | conclusion | claim | hook | thesis`
- Đây là thông tin mà tutor con người mất 30-60 phút để làm thủ công
- Pre-verification + multi-gate validation giảm false positives đáng kể

**Cambridge Examiner-style scaffolding:**
Prompt.service.js yêu cầu LLM:
- `linguistic_principle` — named grammatical structure (Passive Voice, Nominalization...)
- `improved` phải giữ nguyên argument gốc
- `explanation_vn` — giải thích WHY it matters to examiner
→ **Đây là quality cao hơn nhiều so với generic AI feedback**

**RAG-personalized memory system:**
- Student history từ Neo4j: track lỗi theo tần suất, lần cuối gặp
- Feedback được contextualize với past mistakes
→ **Tính năng này là differentiator thực sự**

**Rubric Checklist (6 essay types):**
- Opinion, Discussion, Problem-Solution, Cause-Effect, Advantage-Disadvantage, Two-Part
- Weighted scoring với evidence quotes
→ **Giúp học viên biết chính xác "what's missing" theo từng task type**

**Discourse Graph + Unsupported Claims detection:**
- Neo4j ArgumentationGraph: `checkUnsupportedClaims()`, `checkCoherenceJumps()`
- LLM được inject graph context → feedback specifc về WHICH claims are unsupported
→ **Đây là tutor action cao nhất: không chỉ nói "phát triển ý" mà chỉ ra "claim X thiếu evidence"**

### 2.2 ⚠️ Giới hạn về pedagogical value

**Không có interactive revision loop:**
- Hệ thống chấm 1 lần, không có "submit revised version → compare progress"
- Tutor giỏi sẽ làm: student rewrites → re-grade → show delta improvement
- **Missing feature for band improvement journey**

**Scaffolding quality phụ thuộc vào LLM local (Ollama):**
- Với small models (Qwen 3B), scaffolding có thể surface hoặc generic
- Không có quality control layer trên scaffolding output
- **Risk:** Bad scaffolding = bad pedagogical advice

**GRA feedback không chỉ ra pattern:**
- Hệ thống detect SVA, TENSE errors nhưng feedback không cluster: "student consistently makes SVA errors (5/20 sentences)"
- Pattern recognition quan trọng hơn per-error listing cho việc cải thiện

**Không có Study Plan generation:**
- Feedback diagnoses problems nhưng không map sang "study these resources next week"
- A band 5.5 student cần roadmap, không chỉ essay feedback

---

## PHẦN 3: PRODUCTION READINESS ASSESSMENT

### 3.1 🔴 CRITICAL BLOCKERS

**[P0] Latency — Pipeline không thể deploy:**
```
P50 latency: 653.86 seconds (~10.9 phút)
P95 latency: 1,631.46 seconds (~27.2 phút)
```
**Verdict: KHÔNG THỂ production với latency này.** Không có user nào chờ 10 phút để nhận feedback. Đây là blocker hoàn toàn.

**Root causes:**
1. Micro-Evaluator gọi Ollama per-sentence (concurrency=2, 15-25 sentences = 7-12 sequential calls)
2. RubricChecklist: 1 LLM call với full essay
3. DiscourseGraph: 1 LLM call
4. MacroEvaluator (Node 2): 1 LLM call với context rất lớn
5. Python bridge (spaCy) → sequential blocking

**[P0] Group B data leakage in eval set:**
Nếu deploy với claim "QWK=0.86", hệ thống sẽ bị challenged ngay khi real users thấy scoring không đạt.
- **Honest metrics (Group A only): QWK=0.7375, MAE=0.625**
- AAR=70% (within 0.5 band, N=20) — chấp nhận được cho thesis nhưng không đủ cho production

**[P0] Per-criterion variance quá cao:**
```
TR MAE: 1.15  — NGHIÊM TRỌNG
LR MAE: 1.20  — NGHIÊM TRỌNG  
CC MAE: 0.95  — CAO
GRA MAE: 0.775 — CAO
```
TR và LR sai trung bình >1 band. Một học viên Band 6.5 LR thực tế có thể bị score là 5.5 hoặc 7.5. Đây là **nghiêm trọng về tính công bằng** (fairness).

**Cụ thể từ eval data:**
```
GT_003: Human LR=7.5 → Predicted LR=5.0 (delta=-2.5) 🔴
GT_005: Human TR=8.0 → Predicted TR=9.0 (delta=+1.0) 🔴
GT_014-020: TR được predict là 9.0 cho nhiều essays khác nhau — TR=9 vẫn còn inflation
```

### 3.2 🟡 HIGH RISK ISSUES

**[P1] TR scoring vẫn còn biến động lớn:**
GT_014 (Human TR=6.5) → Predicted TR=9; GT_016 (Human TR=7) → Predicted TR=9; GT_018 (Human TR=7.5) → Predicted TR=9
→ RubricChecklist hoặc SemanticScore đang inflate TR ở nhiều cases

**[P1] LR consistently under-scores:**
- Bias = -0.125 (overall), nhưng LR Pearson = 0.504 (rất thấp)
- LR correlation gần như không có (0.5 ≈ random)
- AWL-based thresholds không capture style/collocation đủ tốt cho Band 7+ essays

**[P1] CC Pearson=0.52 — weak correlation:**
- Graph CC Score blending (60/40) chưa được validate trên enough essays
- Mechanical transition detection có thể over-trigger

**[P1] Python NLP bridge là single point of failure:**
```javascript
feature_map.statistics.python_nlp_available = pythonBridge.isHealthy;
if (!pythonBridge.isHealthy) {
  degradedReasons.push('Python NLP unavailable — discourse roles less accurate');
}
```
Nếu spaCy server down → DEGRADED_MODE → scoring kém hơn đáng kể. Không có SLA cho service này.

### 3.3 🟢 STRENGTHS THAT ARE PRODUCTION-READY

**Defensive programming xuất sắc:**
- Every async call wrapped trong `.catch()` với graceful fallback
- `degradedReasons` array track quality degradation
- `pipeline_latency_ms` trong mọi response
- `data_integrity_warning` trong eval_results.json — transparency cao

**Deterministic scoring architecture (Dual-Node):**
- Score bị lock trước LLM call → LLM không thể override
- Final override trong `macro-evaluator.service.js` là safety net tốt
- Reproducible given same inputs

**Input validation và hallucination prevention:**
- Multi-gate error validation (span verbatim check, type whitelist, safe word filter)
- Sanitize advanced_vocabulary (remove BASIC_WORDS, confirm against featureMap)
- Pre-verification grammar pattern trước LLM call → verification mode

**Fault tolerance:**
- Neo4j failure → coherenceIssues=[] (không crash)
- Vector store failure → empty context (không crash)
- Discourse graph failure → null graph_cc_score → legacy-only path

---

## PHẦN 4: KIẾN TRÚC AI — ĐÁNH GIÁ KỸ THUẬT

### 4.1 Pipeline Architecture (8.5/10)

```
Pre-processing → Micro-Evaluator (pool) → Rule-Based (parallel) 
→ Feature Builder → Constraint Engine → [Parallel Block 1] 
→ [Parallel Block 2] → Node 1 (Deterministic Scoring) → Node 2 (LLM Feedback)
→ Post-processing → Graph Update (async)
```

**Điểm mạnh kiến trúc:**
- Parallel Block 1 và 2 cho các independent tasks — thiết kế tốt
- Graph update async (không block response)
- Telemetry bootstrap ngay từ đầu pipeline

**Điểm yếu kiến trúc:**
- Micro-Evaluator vẫn là sequential bottleneck dù có pool (CONCURRENCY=2)
- Không có caching layer cho identical essays (re-run = full re-compute)
- Không có async job pattern (client phải chờ sync HTTP response 10 phút)

### 4.2 RAG Architecture (7.5/10)

**GraphRAG + Vector hybrid** là kiến trúc tiên tiến:
- Knowledge Graph (Neo4j) + Vector Store đồng thời
- Student memory personalization qua temporal graph
- Discourse Argument Graph (Phase 2) — innovative cho IELTS domain

**Điểm yếu RAG:**
- `hybridQuery()` dùng full-text search (`db.index.fulltext`) thay vì vector similarity → chất lượng retrieval thấp hơn
- Knowledge base size không được document → không biết có đủ IELTS knowledge không
- Graph memory decay (old errors giảm weight theo time) chưa implement

### 4.3 Scoring Model (6.5/10)

**Innovative Design:**
- Rule-Based deterministic core (không phụ thuộc LLM cho scoring)
- Hard Cap system ngăn chặn inflation
- BandConstraintEngine với reasoning rõ ràng

**Gaps so với State-of-the-Art:**
- Không có learned scoring model (e.g., fine-tuned BERT/RoBERTa trên IELTS corpus)
- AWL detection từ hardcoded list, không dùng embedding similarity
- Grammar error detection phụ thuộc vào small LLM (unreliable) thay vì dedicated NLP tool (e.g., LanguageTool, ERRANT)

---

## PHẦN 5: KẾT LUẬN VÀ KHUYẾN NGHỊ

### 5.1 Verdict: Có chạy được trên Production không?

> **❌ CHƯA. Cần giải quyết ít nhất 2 P0 blockers trước khi deploy.**

| Blocker | Severity | Giải pháp |
|---|---|---|
| P50 latency = 654s | P0 🔴 | Async job pattern (webhook/polling) + GPU upgrade |
| LR/TR MAE > 1.0 | P0 🔴 | Recalibrate AWL thresholds trên 50+ essays |
| Group B data leakage | P0 🔴 | Re-run engine trên GT_021-030, publish honest metrics |
| TR=9 inflation (GT_014-020) | P1 🟡 | Tighten RubricChecklist → checklist score cap → 7.0 |
| LR Pearson=0.504 | P1 🟡 | CollocationEmbedding cần validate thêm |

### 5.2 Cho Thesis Defense (không phải production)

> **✅ ĐỦ CHẤP NHẬN cho một đồ án tốt nghiệp với các điều kiện sau:**

1. **Chỉ báo cáo Group A metrics**: QWK=0.74, MAE=0.625, AAR=70%, Pearson_overall=0.85
2. **Framing đúng**: "Proof-of-concept hybrid AI system" — không claim production-ready
3. **Acknowledge limitations rõ ràng**: latency, sample size, LR calibration
4. **Highlight innovations**: Dual-Node architecture, GraphRAG memory, Discourse Graph, RubricChecklist

### 5.3 Roadmap để đạt Production-Grade

```
Phase 1 (Critical — 2 tuần):
  □ Implement async job pattern (POST → jobId → GET /status)
  □ Re-run engine trên Group B essays (eliminate data leakage)
  □ Recalibrate LR thresholds trên expanded dataset (50+ essays)

Phase 2 (Quality — 4 tuần):
  □ Replace Micro-Evaluator LLM với LanguageTool API (deterministic, fast)
  □ GPU upgrade hoặc Ollama batch mode để giảm latency
  □ Collect 200+ labeled essays để re-validate all thresholds

Phase 3 (Product — 6 tuần):
  □ Interactive revision loop (re-submit + progress tracking)
  □ Study plan generation từ error patterns
  □ Band improvement prediction model
```

---

## PHỤ LỤC: ĐIỂM NỔI BẬT CỦA DỰ ÁN

> Mặc dù chưa production-ready, dự án này **vượt xa mức bình thường của một đồ án tốt nghiệp** về độ sâu kỹ thuật:

- ✅ **Dual-Node Architecture** với locked deterministic scores — giải quyết đúng LLM prior conflict problem
- ✅ **Multi-layer hallucination prevention** (pre-verify → validate → sanitize)
- ✅ **Discourse Argument Graph** (Phase 2) — innovative application của NLP cho IELTS
- ✅ **Temporal student memory** với Neo4j — cá nhân hóa thực sự
- ✅ **Transparent evaluation** với group separation và data integrity warnings
- ✅ **Fault-tolerant pipeline** với graceful degradation ở mọi tầng
- ✅ **Cambridge rubric alignment** được document rõ ràng với lý do cho mọi threshold
