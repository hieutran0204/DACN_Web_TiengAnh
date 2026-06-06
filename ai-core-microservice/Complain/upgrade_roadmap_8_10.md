# 🎯 Roadmap: Benchmark 8/10 & IELTS Accuracy 8/10

> **Mục tiêu cụ thể** (dịch từ điểm 8/10):
> - **QWK ≥ 0.85** (hiện tại: 0.7345)
> - **MAE ≤ 0.40** (hiện tại: 0.700)
> - **AAR (±0.5 band) ≥ 80%** (hiện tại: 60%)
> - **Per-criterion MAE ≤ 0.50** cho cả 4 criteria (GRA/CC/LR/TR đều đang > 0.90)
> - **CC Pearson ≥ 0.70** (hiện tại: 0.252 — worst blocker)
> - Feedback pedagogically sound ở cả 4 criteria khi điểm đúng

---

## 📉 Chẩn Đoán: Tại Sao Hiện Tại Chỉ 4.5/10 Benchmark?

Nhìn vào dữ liệu thực `eval_results_v3.json`, có **3 nguyên nhân gốc rễ** gây ra 40% AAR gap:

```
Nguồn sai số chính:
┌─────────────────────────────────────────────────────────────┐
│ 1. GRA MAE=1.05  ← Small LLM bỏ sót lỗi ngữ pháp           │
│    → errorRate thấp giả → GRA base = 7.0 hoặc 8.0           │
│    → GT_010: Human 5.5 → Predicted 8.5 (delta +3.0!)        │
│                                                              │
│ 2. CC Pearson=0.252 ← DiscourseGraph LLM unreliable          │
│    → GT_005: Human 8.0 → Predicted 5.5 (delta -2.5!)        │
│    → GT_008: Human 5.0 → Predicted 7.0 (delta +2.0!)        │
│                                                              │
│ 3. LR MAE=1.075 ← AWL% không measure được precision         │
│    → GT_010: Human 5.5 → Predicted 7.5                       │
│    → GT_011: Human 5.5 → Predicted 8.5                       │
└─────────────────────────────────────────────────────────────┘
```

**Kết luận:** Fix 3 nguyên nhân này = đạt target. Mỗi fix là **độc lập** và có thể làm song song.

---

## 🗺️ 3-Phase Roadmap

```
Phase 1 (Tuần 1-2): Fix GRA + CC     → MAE ≤ 0.55, QWK ~0.78
Phase 2 (Tuần 3-4): Fix LR + TR      → MAE ≤ 0.45, QWK ~0.83  
Phase 3 (Tuần 5-6): Calibrate + Scale → MAE ≤ 0.40, QWK ≥ 0.85
```

---

## 🔴 PHASE 1: Fix GRA + CC (Highest Impact)

### Fix GRA-1: Thay Small LLM bằng LanguageTool/spaCy Cho Grammar Detection

**Tại sao:** `errorRate = lỗi_LLM_detect / 100_words`. Small LLM recall ~50-60% → errorRate bị halved → base score bị boost lên 7.0-8.0 cho bài chỉ đáng 5.5.

**Giải pháp:** Dùng `language_tool_python` (rule-based, 100% deterministic) để detect lỗi thay cho MicroEvaluator trong phần đếm lỗi.

**File cần thay đổi:** `advanced_nlp.py` + `python-bridge.service.js` + `scoring.engine.js`

**Cụ thể:**

```python
# Thêm vào advanced_nlp.py
import language_tool_python
tool = language_tool_python.LanguageTool('en-US')

def get_grammar_errors(text):
    matches = tool.check(text)
    # Chỉ lấy error rules quan trọng (loại trừ style suggestions)
    GRAMMAR_RULE_IDS = {
        'GRAMMAR',          # SVA, tense
        'TYPOS',            # spelling
        'PUNCTUATION',      # punct
        'CONFUSED_WORDS',   # word form
        'AGREEMENT_SENT_START',  # SVA at start
        'EN_COMPOUNDS',     # compound errors
    }
    grammar_errors = [m for m in matches 
                     if any(cat in m.category for cat in GRAMMAR_RULE_IDS)]
    word_count = len(text.split())
    error_rate = (len(grammar_errors) / word_count * 100) if word_count > 0 else 0
    
    return {
        'total_errors': len(grammar_errors),
        'error_per_100_words': round(error_rate, 2),
        'error_types': list(set(m.category for m in grammar_errors)),
        'errors': [{'message': m.message, 'context': m.context, 
                    'category': m.category} for m in grammar_errors[:20]]
    }
```

```javascript
// python-bridge.service.js — inject grammar_errors vào pythonData
// Thêm grammar_errors từ LanguageTool vào response

// scoring.engine.js — ưu tiên dùng grammar từ LanguageTool nếu có
const errorRate = featureMap.grammar?.language_tool_error_rate 
               ?? featureMap.grammar?.error_per_100_words 
               ?? 0;
```

**Kết quả kỳ vọng:** GRA MAE: 1.05 → **~0.35-0.45**

---

### Fix GRA-2: Xác Minh "Advanced Structures" Bằng spaCy Dependency Parsing

**Tại sao:** `advStructs` (advanced structure types) quyết định range bonus (+0.5/+0.25). Hiện tại detect bằng regex patterns → under-count với complex academic syntax.

**Giải pháp:** Dùng spaCy dependency tree để detect:
- Relative clauses (nsubj → relcl)
- Passive voice (nsubjpass / auxpass)
- Conditional structures (advcl với "if")
- Nominalization (convert verb to noun form)

```python
# Thêm vào advanced_nlp.py
def detect_advanced_structures(doc):
    structures = set()
    for token in doc:
        if token.dep_ == 'relcl': structures.add('relative_clause')
        if token.dep_ == 'nsubjpass': structures.add('passive_voice')
        if token.dep_ == 'advcl' and token.head.text.lower() == 'if': 
            structures.add('conditional')
        if token.pos_ == 'NOUN' and token.morph.get('VerbForm'): 
            structures.add('nominalization')
    return list(structures), len(structures)
```

**Kết quả kỳ vọng:** GRA range bonus/penalty chính xác hơn 40%.

---

### Fix CC-1: Bỏ DiscourseGraph LLM Scoring, Tăng Weight Legacy Path

**Tại sao:** CC Pearson=0.252 xảy ra vì `graph_cc_score` (60% weight) từ small LLM unreliable với implicit cohesion của Band 7-8 essays.

**Chiến lược:** Conditional blending dựa trên graph confidence:
- Nếu graph có ít nodes/edges → uncertain → tăng legacy weight lên 80%
- Nếu graph detect được counter-rebuttal hoặc nhiều evidence nodes → trust graph

```javascript
// scoring.engine.js — _computeCC()
const graphNodes = featureMap.discourse_graph?.nodes || [];
const graphEdges = featureMap.discourse_graph?.edges || [];
const graphStats = featureMap.discourse_graph?.graph_stats || {};

// Compute graph confidence score (0.0 - 1.0)
// Low confidence: few nodes (<3), no edges, no evidence nodes
const graphConfidence = Math.min(1.0, 
  (graphNodes.length / 8) * 0.4 +
  (graphEdges.length / 6) * 0.3 +
  ((graphStats.evidence_examples || 0) / 3) * 0.3
);

// Adaptive blending: low confidence → trust physical structure more
const graphWeight  = graphConfidence >= 0.6 ? 0.60 : 
                     graphConfidence >= 0.3 ? 0.40 : 0.20;
const legacyWeight = 1 - graphWeight;

const blended = graphCCScore * graphWeight + legacyBase * legacyWeight;
```

**Tại sao đây đúng về mặt sư phạm:** Cambridge Band 8 dùng implicit cohesion (pronoun reference, ellipsis). Small LLM extract graph thưa → nên trust physical structure hơn.

**Kết quả kỳ vọng:** CC MAE: 1.075 → **~0.55-0.65**, CC Pearson: 0.252 → **~0.60-0.70**

---

### Fix CC-2: Thêm Implicit Cohesion Signal Vào Legacy Path

**Tại sao:** Band 8 essays ít explicit linking words nhưng dùng pronoun reference và lexical chains → cần detect implicit cohesion.

**Giải pháp:** Thêm spaCy coref detection (pronoun reference chains) và lexical chain scoring vào `rule-based.service.js`.

```javascript
// rule-based.service.js — thêm detectImplicitCohesion()
detectImplicitCohesion(essay, sentences) {
  // Signal 1: Pronoun reference chains
  const pronounCount = (essay.match(/\b(this|these|such|it|they|them)\b/gi) || []).length;
  const pronounRatio = pronounCount / sentences.length;
  
  // Signal 2: Lexical chain (same root word across paragraphs)
  // Computed from pythonData.lemmas
  
  return {
    pronoun_reference_ratio: pronounRatio,
    has_lexical_chains: pronounRatio > 0.5 // heuristic
  };
}
```

Inject signal vào CC scoring: `has_lexical_chains = true` → +0.25 bonus (implicit cohesion signal).

**Kết quả kỳ vọng:** Band 8 CC under-scoring giảm đáng kể.

---

## 🟠 PHASE 2: Fix LR + TR

### Fix LR-1: Expand AWL + Thêm IELTS Domain Vocabulary

**Tại sao:** AWL Coxhead 570 words bỏ sót topic-specific academic vocab → AWL% thấp giả cho Band 7+ essays.

**Giải pháp:** Tạo expanded AWL file (~1,500 words) gồm:
1. Coxhead Academic Word List (570 words, sublists 1-10)
2. IELTS common topic vocabulary: environment, technology, urbanization, globalization
3. Academic discourse markers: moreover, furthermore, consequently, nevertheless, nonetheless

```javascript
// rule-based.service.js — mở rộng AWL list
// File: data/expanded_awl.json
// Sources: Coxhead AWL + IELTS-specific domain vocab
const IELTS_DOMAIN_WORDS = [
  // Environment
  'biodiversity', 'sustainability', 'deforestation', 'urbanisation', 
  'mitigation', 'renewable', 'carbon', 'emissions', 'ecosystem',
  // Technology  
  'automation', 'algorithm', 'surveillance', 'digital', 'innovation',
  'artificial', 'intelligence', 'cybersecurity', 'infrastructure',
  // Society
  'globalisation', 'inequality', 'discrimination', 'demographic', 
  'migration', 'integration', 'assimilation', 'multiculturalism',
  // Economy
  'privatisation', 'subsidise', 'incentivise', 'disposable', 'expenditure',
  'fiscal', 'monetary', 'consumption', 'productivity', 'unemployment',
  // Education
  'curriculum', 'pedagogy', 'literacy', 'cognitive', 'extracurricular',
  // Health
  'sedentary', 'obesity', 'pandemic', 'vaccination', 'pharmaceutical',
  // ... total ~400 IELTS-domain words
];
```

**Kết quả kỳ vọng:** LR AWL coverage tăng 1.5-2.0% cho topic essays → LR MAE: 1.075 → **~0.55**

---

### Fix LR-2: Precision-in-Use Scoring (Collocation Accuracy)

**Tại sao:** Cambridge LR không chỉ đo nhiều từ mà đo **dùng đúng collocations**. Hiện tại chỉ có `collocation_similarity_score` chưa được calibrate đúng.

**Giải pháp:** Dùng collocation-embedding.service.js (đã có) nhưng calibrate lại band mapping:

```javascript
// scoring.engine.js — _computeLR()
// Thay thế legacy fallback bằng calibrated collocation score

// Nếu collocResult.collocation_hits_high >= 3 → genuine precision signal
// Map: hits_high >= 5 → bonus +0.5, 3-4 → +0.25, < 2 → no bonus
const collocHighHits = featureMap.lexical_resource?.collocation_hits_high || 0;
const collocMidHits  = featureMap.lexical_resource?.collocation_hits_mid  || 0;

let collocBonus = 0;
if (collocHighHits >= 5)  collocBonus = 0.5;
else if (collocHighHits >= 3 || collocMidHits >= 5) collocBonus = 0.25;
else if (collocHighHits === 0 && collocMidHits <= 1) collocBonus = -0.25; // limited precision signal
```

**Kết quả kỳ vọng:** LR precision capture cải thiện, giảm false Band 8 LR scores.

---

### Fix TR-1: Multi-Signal Topic Relevance (Paraphrase-Aware)

**Tại sao:** TopicRelevanceService đang miss relevance của essays dùng paraphrase/synonyms → TR verdict sai → DRIFT/PARTIAL cho bài thực sự ADEQUATE (GT_002 TR=7.0 bị predict PARTIAL=5.0).

**Giải pháp:** Thêm BM25 keyword matching song song với semantic embedding:

```javascript
// topic-relevance.service.js — thêm BM25 fallback

// Nếu semantic_score < threshold nhưng keyword_score cao → không phải DRIFT
// Vì learners hay paraphrase question từ khóa → semantic distance tự nhiên cao hơn
const adjustedVerdict = 
  (semanticScore < 0.50 && keywordScore > 0.60) ? 'ADEQUATE' :  // keyword saves it
  (semanticScore < 0.40 && keywordScore < 0.40) ? 'DRIFT'     :  // both low → real drift
  (semanticScore < 0.50 && keywordScore < 0.50) ? 'PARTIAL'   :  // borderline
  'ADEQUATE';
```

**Thêm synonym expansion:** Khi extract keywords từ question, expand với WordNet synonyms để match paraphrased answers.

**Kết quả kỳ vọng:** TR PARTIAL/DRIFT false positive giảm 60% → TR MAE: 0.95 → **~0.50**

---

### Fix TR-2: Recalibrate Checklist Band Mapping

**Tại sao:** `_ratioBandMap` mapping ratio → score hiện tại:
- ratio ≥ 0.90 → 7.5 (cần cạnh trên là 7.0, không phải 7.5)
- ratio ≥ 0.75 → 7.0

Nhiều essays đạt ratio=0.9 (check đủ criteria) nhưng development depth vẫn Band 6.5.

**Giải pháp:** Tighten band mapping thêm 0.5:

```javascript
// rubric-checklist.service.js
const _ratioBandMap = (ratio) => {
  if (ratio >= 0.95) return { score: 7.5, label: 'All criteria fully met with depth' };
  if (ratio >= 0.80) return { score: 7.0, label: 'Most criteria well met' };
  if (ratio >= 0.65) return { score: 6.5, label: 'Core criteria met, some gaps' };
  if (ratio >= 0.50) return { score: 6.0, label: 'Rubric partially met' };
  if (ratio >= 0.35) return { score: 5.5, label: 'Multiple criteria weak' };
  return { score: 5.0, label: 'Multiple criteria not met' };
};
```

**Kết quả kỳ vọng:** TR inflation giảm ở Band 6-7 essays.

---

## 🟡 PHASE 3: Calibrate + Expand Eval Set

### Fix CAL-1: Expand Eval Set N=20 → N=50

**Tại sao:** N=20 quá nhỏ để tính QWK đáng tin. Confidence interval rất rộng → metrics không ổn định.

**Nguồn dữ liệu để expand:**
1. Cambridge IELTS Practice Tests 1-19 (essays có official band scores)
2. IELTSLiz.com / Magoosh essay samples với certified band scores
3. `ielts_writing_dataset.csv` đã có trong project — kiểm tra xem có ground truth không

**Target:** N=50 với distribution:
- Band 4-5: 10 essays
- Band 5.5-6: 15 essays
- Band 6.5-7: 15 essays  
- Band 7.5-8.5: 10 essays

### Fix CAL-2: Per-Criterion Ground Truth Annotation

**Tại sao:** Hiện tại nhiều test cases chỉ có overall band, không có per-criterion (TR/CC/LR/GRA). Metrics per-criterion tính trên subset nhỏ hơn.

**Giải pháp:** Annotate đủ 4 criteria cho tất cả N=50 essays. Dùng Cambridge Band Descriptors làm reference.

---

## 📊 Metric Projection Per Phase

| Metric | Hiện tại (v3) | Sau Phase 1 | Sau Phase 2 | Sau Phase 3 |
|:---|:---:|:---:|:---:|:---:|
| **QWK** | 0.7345 | ~0.78 | ~0.83 | **≥0.85** |
| **MAE Overall** | 0.700 | ~0.550 | ~0.450 | **≤0.40** |
| **AAR (±0.5)** | 60% | ~70% | ~77% | **≥80%** |
| **GRA MAE** | 1.050 | **~0.40** | ~0.38 | ≤0.40 |
| **CC MAE** | 1.075 | **~0.60** | ~0.55 | ≤0.50 |
| **LR MAE** | 1.075 | 1.075 | **~0.55** | ≤0.50 |
| **TR MAE** | 0.950 | 0.950 | **~0.50** | ≤0.50 |
| **CC Pearson** | 0.252 | **~0.65** | ~0.68 | ≥0.70 |
| **Bias** | +0.250 | ~+0.05 | ~0.00 | |

> [!NOTE]
> Projection dựa trên nguyên nhân gốc đã được verify từ per-case analysis. Phase 1 có impact cao nhất vì fix GRA+CC — 2 criteria đang sai nặng nhất.

---

## ⚙️ Effort Estimate

| Fix | Effort | Dependency |
|:---|:---:|:---|
| LanguageTool integration (Python) | 1-2 ngày | `pip install language_tool_python` |
| spaCy advanced struct detection | 1 ngày | spaCy đã có (python bridge) |
| CC adaptive blending | 4 giờ | `scoring.engine.js` only |
| Implicit cohesion signal | 1 ngày | `rule-based.service.js` |
| Expand AWL (~400 domain words) | 1 ngày | Data work |
| LR collocation calibration | 4 giờ | `scoring.engine.js` only |
| TR multi-signal (BM25 + semantic) | 2 ngày | `topic-relevance.service.js` |
| Checklist band mapping tighten | 1 giờ | `rubric-checklist.service.js` |
| Eval set expansion N→50 | 2-3 ngày | Data collection + annotation |
| **Tổng Phase 1+2** | **~7-10 ngày** | |
| **Tổng Phase 3** | **~3-5 ngày** | |

---

## 🔑 Thứ Tự Ưu Tiên Tuyệt Đối

Nếu chỉ làm được 1 việc, làm việc này trước:

```
1️⃣  LanguageTool thay Small LLM cho GRA error detection
    → Đây là fix có ROI cao nhất: GRA MAE 1.05 → 0.40 trong 2 ngày
    → Fix được GT_010 (+3.0 delta), GT_011 (+2.5 delta) — worst cases

2️⃣  CC adaptive blending (giảm graph weight khi uncertain)
    → Đây là fix dễ nhất (chỉ sửa 15 dòng trong scoring.engine.js)
    → CC Pearson 0.252 → 0.65+ ngay

3️⃣  Expand AWL + LR collocation calibration
    → LR MAE 1.075 → 0.55

4️⃣  TR BM25 + semantic hybrid
    → TR false PARTIAL verdicts biến mất
```

---

## 🎓 Tác Động Lên IELTS Pedagogical Accuracy (8/10)

Khi benchmark đúng (điểm đúng), pedagogy tự nhiên cải thiện theo:
- **GRA feedback đúng**: LanguageTool detect đúng lỗi → feedback chỉ ra đúng lỗi thực tế
- **CC feedback đúng**: Adaptive blending → CC score phản ánh thực tế → LLM feedback giải thích đúng
- **LR feedback đúng**: Expanded AWL + precision scoring → không inflate LR cho low-band essays
- **TR feedback đúng**: BM25 hybrid → không falsely penalize ADEQUATE essays

Chỉ cần Phase 1 + Phase 2 là đủ để đạt IELTS Pedagogical Accuracy 8/10, vì:
- Prompt design đã xuất sắc (9 Critical Rules)
- Feedback LLM đã tốt khi điểm đúng
- Vấn đề duy nhất là **điểm sai → feedback sai** → fix scoring = fix pedagogy

---

*Kế hoạch này ready để chuyển sang `/code` mode.*
*Phase 1 implementation: LanguageTool + CC adaptive blending có thể bắt đầu ngay.*
