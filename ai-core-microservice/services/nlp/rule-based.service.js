const path = require('path');
const fs = require('fs');
const nlp = require("compromise");

/**
 * Phase 1B: Rule-Based Heuristics
 * 
 * Uses 'compromise' (lightweight NLP) and heuristics to extract:
 * 1. Sentence structure (Simple, Compound, Complex)
 * 2. Linking words and their positions
 * 3. Paragraph count
 * 4. Academic words and Type-Token Ratio
 */

const SUBORDINATING_CONJUNCTIONS = [
  "after", "although", "as", "as if", "as long as", "as much as", "as soon as",
  "as though", "because", "before", "even if", "even though", "how", "if",
  "in order that", "once", "provided that", "rather than", "since", "so that",
  "than", "that", "though", "unless", "until", "when", "whenever", "where",
  "whereas", "wherever", "whether", "while"
];

const COORDINATING_CONJUNCTIONS = ["for", "and", "nor", "but", "or", "yet", "so"];

const LINKING_WORDS = [
  // Addition
  "furthermore", "moreover", "in addition", "additionally", "besides", "also", "as well as",
  // Contrast / Concession
  "however", "nevertheless", "nonetheless", "on the other hand", "on the contrary", "conversely", "in contrast", "although", "even though", "despite", "in spite of",
  // Result / Consequence
  "consequently", "therefore", "thus", "hence", "as a result", "for this reason",
  // Example
  "specifically", "for instance", "for example", "to illustrate",
  // Sequence
  "firstly", "secondly", "thirdly", "finally", "lastly", "subsequently", "meanwhile", "next",
  // Conclusion
  "in conclusion", "to conclude", "to sum up"
];

/**
 * CLICHÉ / TEMPLATE PHRASE BLACKLIST
 * Grouped by severity tier:
 *  - MECHANICAL: Overused structural connectors that signal rote memorization (most penalized).
 *  - TEMPLATE:   Cookie-cutter openers/closers that examiners see thousands of times.
 *  - COLLOCATION: Overused topic-generic collocations that show lack of lexical flexibility.
 */
const CLICHE_PHRASES = {
  MECHANICAL: [
    "first and foremost", "last but not least", "all in all",
    "another point is", "another reason is", "another advantage is", "another disadvantage is",
    "the main reason is", "the first point to note is"
  ],
  TEMPLATE: [
    "in today's society", "in the modern world", "in today's world", "in this day and age",
    "it is a controversial topic", "it is widely believed", "it is undeniable that",
    "it goes without saying", "needless to say", "it is obvious that", "it is clear that",
    "in my opinion", "from my point of view", "from my perspective",
    "i strongly agree", "i strongly disagree", "i completely agree",
    "this essay will discuss", "this essay will explore",
    "in the following paragraphs", "as mentioned above", "as stated above"
  ],
  COLLOCATION: [
    "major advantage", "major disadvantage", "major benefit", "major problem",
    "economic growth", "economic development", "economic benefits",
    "play an important role", "plays a key role", "play a vital role",
    "a wide range of", "a variety of", "various aspects",
    "have a negative impact", "have a positive impact", "negative effects", "positive effects",
    "the younger generation", "the older generation", "the government should",
    "raise awareness", "take measures", "take steps",
    "solve this problem", "tackle this problem", "address this issue"
  ]
};

/**
 * INFORMAL / CONVERSATIONAL REGISTER BLACKLIST
 * Cambridge Band Descriptors penalize "informal" and "inappropriate register" under LR.
 * Three tiers ordered by severity:
 *   CONTRACTION     — grammatically wrong in formal academic writing (I'm, don't...)
 *   SLANG_CASUAL    — clearly informal/colloquial vocabulary
 *   COLLOQUIAL_PHRASE — conversational phrases native speakers avoid in formal essays
 */
const INFORMAL_REGISTER = {
  CONTRACTION: [
    "i'm", "i've", "i'll", "i'd", "you're", "you've", "you'll", "you'd",
    "he's", "she's", "it's", "we're", "we've", "we'll", "we'd",
    "they're", "they've", "they'll", "they'd", "that's", "there's",
    "who's", "what's", "isn't", "aren't", "wasn't", "weren't",
    "don't", "doesn't", "didn't", "won't", "wouldn't", "can't",
    "couldn't", "shouldn't", "haven't", "hasn't", "hadn't"
  ],
  SLANG_CASUAL: [
    "gonna", "wanna", "gotta", "kinda", "sorta", "yeah", "yep", "nope",
    "stuff", "lots of", "a lot of", "tons of", "super",
    "basically", "literally", "totally", "awesome", "crazy",
    "big deal", "no way", "for sure", "pretty much"
  ],
  COLLOQUIAL_PHRASE: [
    "in my country", "back in the day", "at the end of the day",
    "to be honest", "believe it or not", "a piece of cake",
    "the bottom line is", "long story short", "needless to say"
  ]
};

// Bộ nhớ động cho các quy tắc từ Markdown
let DYNAMIC_GRAMMAR_RULES = [];
let TOPIC_VOCABULARY = new Set();

const STOP_WORDS = new Set([
  "of", "to", "and", "a", "an", "the", "in", "for", "on", "by", "with", "at", "from",
  "into", "during", "including", "until", "against", "among", "throughout", "despite",
  "towards", "upon", "concerning", "but", "or", "yet", "so", "nor", "it", "he", "she",
  "they", "we", "i", "you", "me", "him", "her", "them", "us", "my", "your", "his",
  "their", "our", "its", "this", "that", "these", "those", "is", "am", "are", "was",
  "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "can",
  "could", "will", "would", "shall", "should", "may", "might", "must", "also", "very",
  "too", "more", "most", "some", "any", "no", "not", "only", "own", "other", "same",
  "such", "than", "then", "there", "their", "about", "above", "after", "again", "all",
  "any", "both", "each", "few", "here", "just", "now", "once", "out", "over", "some",
  "then", "up", "very", "who", "which", "that", "whom", "whose"
]);

// Dynamic set for academic/advanced vocabulary check.
// Seed contains only B2+ level words per CEFR framework.
// B1-level words like 'benefit', 'factor', 'function', 'major', 'role', 'source'
// have been intentionally removed to prevent false positives in advanced_words output.
let ACADEMIC_WORDS = new Set([
  // ── AWL Sublist 1 (highest frequency academic words — Coxhead 2000) ────────
  // These appear in >60% of academic texts. Band 7 essays routinely use these.
  "analysis", "approach", "area", "assessment", "assume", "authority",
  "available", "concept", "consistent", "constitutional",
  "context", "contract", "create", "data", "definition", "derived",
  "distribution", "economic", "environment", "established", "estimate",
  "export", "financial", "formula",
  "identified", "income", "indicate", "individual", "interpretation",
  "involved", "issues", "labour", "legal", "legislation",
  "method", "period", "policy", "principle",
  "procedure", "process", "required", "research", "response",
  "section", "sector", "significant", "similar", "specific",
  "structure", "theory", "variables",

  // ── AWL Sublist 2 ─────────────────────────────────────────────────────────
  "acquisition", "administration", "affect", "appropriate",
  "aspects", "assistance", "categories", "chapter", "commission",
  "community", "complex", "compute", "conduct",
  "consequences", "construction", "consumer", "credit", "cultural",
  "design", "distinction", "elements", "equation", "evaluation",
  "features", "final", "focus", "impact", "injury", "institute",
  "investment", "items", "journal", "maintenance", "normal", "obtained",
  "participation", "perceived", "positive", "potential", "previous",
  "primary", "purchase", "range", "regions", "regulations", "relevant",
  "resident", "resources", "restricted", "security", "sought",
  "select", "site", "strategies", "survey", "text", "traditional",
  "transfer",

  // ── AWL Sublist 3 ─────────────────────────────────────────────────────────
  "alternative", "circumstances", "comments", "compensation",
  "components", "consent", "considerable", "constant", "constraint",
  "contribution", "convention", "coordinates", "core", "corporate",
  "corresponding", "criteria", "deduction", "demonstrate", "document",
  "dominant", "emphasis", "ensure", "excluded", "framework",
  "funds", "illustrated", "immigration", "implies", "initial",
  "instance", "interaction", "justification", "layer", "link",
  "location", "maximum", "minorities", "negative", "outcomes",
  "parameters", "philosophy", "physical", "proportion", "published",
  "reaction", "registered", "reliance", "removed", "scheme",
  "sequence", "shift", "specified", "sufficient", "task", "technical",
  "techniques", "technology", "validity", "volume",

  // ── AWL Sublist 4 ─────────────────────────────────────────────────────────
  "access", "adequate", "annual", "apparent", "approximated",
  "attitude", "attributed", "civil", "code", "commitment", "communication",
  "concentration", "conference", "contrast", "cycle", "debate",
  "despite", "dimensions", "domestic", "emerged", "error", "ethnic",
  "goals", "granted", "hence", "hypothesis", "implementation",
  "implications", "imposed", "integration", "internal", "levy",
  "likelihood", "maintained", "medical", "migration", "military",
  "minimum", "ministry", "motivation", "neutral", "nevertheless",
  "nonetheless", "obvious", "occupational", "option", "output",
  "overall", "parallel", "parameter", "phase", "predicted", "principal",
  "professional", "project", "promote", "regime", "resolution",
  "retained", "series", "status", "stress", "subsequent", "sum",
  "summary", "undertake",

  // ── AWL Sublist 5-10 (key terms for IELTS Task 2 topics) ─────────────────
  "amendment", "analogy", "anticipate", "assurance", "attain",
  "behalf", "bias", "capacity", "capable", "challenge", "citation",
  "civil", "clarify", "classic", "clause", "coherent", "coincide",
  "collapse", "colleague", "commence", "commodity", "compatible",
  "compile", "complement", "concurrent", "conform", "controversy",
  "conversely", "currency", "decline", "dedication", "deflect",
  "despite", "deviation", "differentiate", "dimension", "discriminate",
  "displacement", "distinct", "diversity", "domain", "efficient",
  "eliminate", "equity", "equivalent", "evolve", "exceed",
  "exclusive", "exhibit", "expertise", "exploitation", "expose",
  "facilitate", "flexible", "fluctuate", "forthcoming", "foundation",
  "generate", "global", "goal", "grant", "hierarchy", "hypothesis",
  "identical", "ideology", "implication", "impose", "incentive",
  "inevitable", "infrastructure", "inherent", "innovation",
  "insufficient", "integrate", "intention", "intervention", "invest",
  "isolation", "mandate", "mechanism", "mediate", "mental", "migrate",
  "minimal", "modification", "monitor", "mutual", "network",
  "neutral", "notion", "objective", "obligation", "occupation",
  "offset", "ongoing", "opposition", "orientation", "overlap",
  "paradigm", "participation", "pattern", "perspective", "phenomenon",
  "promote", "proportion", "prospect", "protocol", "qualitative",
  "quantitative", "ratio", "reform", "reliance", "resolution",
  "retention", "revenue", "simulation", "stability", "substitute",
  "sustainability", "symbolic", "transition", "trend", "uniformity",
  "unique", "utilise", "utilize", "whereas", "widespread",

  // ── IELTS Task 2 Topic-Specific Academic Terms ────────────────────────────
  // These are routinely used in Band 7-9 essays on standard IELTS topics
  // and are recognized as academic register by Cambridge examiners.

  // Technology & AI
  "automation", "algorithm", "cybersecurity", "digitalization",
  "technological", "advancement", "artificial", "intelligence",
  "productivity", "efficiency", "operational", "surveillance",
  "biometric", "blockchain", "autonomous", "computation",
  "platform", "digital", "virtual", "encryption", "bandwidth",

  // Employment & Economics
  "unemployment", "inequality", "retraining", "displacement",
  "workforce", "vulnerability", "vulnerable", "specialists",
  "instability", "substantially", "ultimately",
  "occupational", "occupations", "employers", "employment",
  "entrepreneurship", "globalisation", "globalization",
  "liberalisation", "privatisation", "subsidise", "subsidy",
  "expenditure", "fiscal", "monetary", "taxation", "tariff",
  "disposable", "outsourcing", "austerity", "recession",

  // Environment & Climate
  "renewable", "emissions", "deforestation", "biodiversity",
  "conservation", "contamination", "sustainability", "ecological",
  "mitigation", "adaptation", "fossil", "carbon", "ecosystem",
  "habitat", "extinction", "degradation", "afforestation",
  "precipitation", "atmospheric", "greenhouse", "meteorological",
  "desertification", "glacial", "tidal", "geothermal",

  // Health & Medicine
  "obesity", "pandemic", "vaccination", "pharmaceutical",
  "sedentary", "cardiovascular", "therapeutic", "malnutrition",
  "immunisation", "mortality", "morbidity", "epidemic",
  "antibiotics", "diagnosis", "pathogen", "symptom",
  "rehabilitation", "preventive", "healthcare", "wellness",
  "psychiatric", "psychological", "neurological", "hormonal",

  // Education & Cognition
  "curriculum", "academic", "intellectual", "pedagogical",
  "competency", "literacy", "numeracy", "institutional",
  "extracurricular", "vocational", "apprenticeship", "scholarship",
  "assessment", "standardised", "interdisciplinary", "experiential",
  "metacognition", "constructivism", "bilingual", "multilingual",

  // Society, Crime & Governance
  "demographic", "urbanisation", "urbanization", "legislation",
  "judicial", "constitutional", "governance", "accountability",
  "transparency", "corruption", "reformation",
  "recidivism", "rehabilitation", "incarceration", "deterrence",
  "surveillance", "prosecution", "jurisdiction", "sentencing",
  "trafficking", "criminalisation", "decriminalisation",
  "discrimination", "segregation", "assimilation", "multicultural",
  "multiculturalism", "xenophobia", "nationalism", "populism",

  // Urban Planning & Infrastructure
  "infrastructure", "urbanisation", "suburbanisation", "gentrification",
  "congestion", "metropolitan", "municipality", "residential",
  "sanitation", "sewage", "transit", "pedestrian", "commuter",

  // Media & Communication
  "journalism", "propaganda", "censorship", "disinformation",
  "misinformation", "broadcasting", "advertisement", "commercialism",
  "portrayal", "representation", "stereotyping", "sensationalism",

  // Psychology & Behaviour
  "motivation", "cognition", "perception", "behaviour", "behavioral",
  "behavioural", "socialisation", "socialization", "conformity",
  "individualism", "collectivism", "empathy", "resilience",
  "self-esteem", "anxiety", "depression", "therapy", "counselling",

  // High-register academic verbs & adjectives (IELTS Band 7.5-9 register)
  "exacerbate", "ameliorate", "catalyse", "catalyze", "constrain",
  "circumvent", "contravene", "galvanise", "galvanize", "incentivise",
  "incentivize", "propagate", "repudiate", "substantiate", "transcend",
  "unprecedented", "indispensable", "irreversible", "negligible",
  "paramount", "stringent", "pervasive", "autonomous", "consequential",
  "disproportionate", "inequitable", "unsustainable", "irrevocable",

  // ── B2/C1 Refined — EXAMINER GRADE ────────────────────────────────────────
  "constitute", "derive", "legislate", "undermine", "comprise",
  "demonstrate", "establish", "evaluate", "implement", "perceive",
  "regulate", "reinforce", "sustain",
  "conducive", "detrimental", "ubiquitous", "profound", "substantial",
  "prevalent", "contentious", "alleviate", "exacerbate", "mitigate",
  "proliferate", "advocate", "contend", "critique", "discern",
  "disparity", "endeavor", "foster", "illuminate", "perpetuate", "rectify",
  "scrutinize", "stimulate", "unprecedented", "attribute",
  "augment", "coerce", "cohesive", "comprehensive", "concede",
  "depict", "elicit", "embody", "empower", "encompass", "enhance",
  "ethical", "exemplify", "formulate", "highlight", "infer",
  "innovative", "instigate", "justify", "manifestation",
  "nuanced", "prioritize", "rationalize",
  "skeptical", "sophisticated", "speculate", "synthesize",
  "tentative", "underpin", "validate", "viability"
]);

// ── B2/C1 Refined — EXAMINER GRADE (Less Common Lexical Items) ──────────────
// These are true C1/C2 words used to impress examiners, explicitly separated 
// from basic AWL words so the UI doesn't praise simple words like "select".
const LESS_COMMON_WORDS = new Set([
  "constitute", "derive", "legislate", "undermine", "comprise",
  "demonstrate", "establish", "evaluate", "implement", "perceive",
  "regulate", "reinforce", "sustain",
  "conducive", "detrimental", "ubiquitous", "profound", "substantial",
  "prevalent", "contentious", "alleviate", "exacerbate", "mitigate",
  "proliferate", "advocate", "contend", "critique", "discern",
  "disparity", "endeavor", "foster", "illuminate", "perpetuate", "rectify",
  "scrutinize", "stimulate", "unprecedented", "attribute",
  "augment", "coerce", "cohesive", "comprehensive", "concede",
  "depict", "elicit", "embody", "empower", "encompass", "enhance",
  "ethical", "exemplify", "formulate", "highlight", "infer",
  "innovative", "instigate", "justify", "manifestation",
  "nuanced", "prioritize", "rationalize",
  "skeptical", "sophisticated", "speculate", "synthesize",
  "tentative", "underpin", "validate", "viability"
]);

// ── IELTS Band 7+ Collocations & Lexical Chunks ─────────────────────────────
// Cambridge IELTS values the use of natural word combinations over single complex words.
const ACADEMIC_COLLOCATIONS = [
  "equal proportions", "educational opportunities", "practical concerns",
  "based on merit", "socioeconomic status", "disproportionate impact",
  "technological advancement", "artificial intelligence", "empirical evidence",
  "fundamental shift", "widening disparity", "inextricably linked",
  "paradigm shift", "disposable income", "sedentary lifestyle",
  "broaden horizons", "allocate resources", "pressing issue",
  "viable alternative", "mitigating circumstances", "adverse effects",
  "root cause", "inextricably bound", "profound impact",
  "intrinsic value", "vicious cycle", "integral part",
  "admission criteria", "standardised testing", "academic qualifications"
];


// Non-global (/i only) — safe for .test() in _classifySentenceType which shares
// these regex objects across calls. Using /g here would cause lastIndex state
// pollution: after .test() advances lastIndex, the next call starts mid-string.
//
// _detectAdvancedStructures creates a fresh global regex per call for counting.
const ADVANCED_STRUCTURE_PATTERNS = {
  PASSIVE_VOICE:   /\b(am|is|are|was|were|be|been|being)\b\s+([a-z]+ed|gone|done|seen|written|taken|built|known|given|chosen)\b/i,
  CONDITIONAL:     /\b(if|unless|provided that|as long as)\b/i,
  INVERSION:       /^(never|seldom|rarely|hardly|only by|not only|at no time|under no circumstances)\b\s+(do|does|did|have|has|had|can|could|will|should|is|are|was|were)\b/i,
  CLEFT_SENTENCE:  /^(it\s+(is|was)|what\s+.*?\s+(is|was))\b.*?\bthat\b/i,
  // 'that' removed: as complementizer ('I believe that...') it fires on almost every
  // sentence and is not a relative clause. Keep who/whom/whose/which only.
  RELATIVE_CLAUSE: /\b(who|whom|whose|which)\b/i,
  PERFECT_TENSE:   /\b(have|has|had)\b\s+([a-z]+ed|gone|done|seen|written|taken|built|known|given|chosen)\b/i
};

class RuleBasedService {
  /**
   * Cập nhật danh sách từ vựng từ Neo4j hoặc Crawler
   */
  setAcademicWords(wordsArray) {
    if (Array.isArray(wordsArray)) {
      let addedAcademic = 0;
      let addedLessCommon = 0;
      
      wordsArray.forEach(item => {
        // Handle both string format (legacy) and object format {name, level}
        const word = typeof item === 'string' ? item : item.name;
        const level = typeof item === 'string' ? 'B2' : (item.level || 'B2');
        
        if (!word) return;
        const lower = word.toLowerCase().trim();
        
        if (lower.length > 2 && !STOP_WORDS.has(lower)) {
          ACADEMIC_WORDS.add(lower);
          addedAcademic++;
          
          if (level === 'C1' || level === 'C2') {
            LESS_COMMON_WORDS.add(lower);
            addedLessCommon++;
          }
        }
      });
      console.log(`📚 RuleBasedService: Đã nạp từ Graph -> ${addedAcademic} Academic Words, ${addedLessCommon} Less Common Words.`);
    }
  }

  /**
   * Tự động nạp kiến thức từ folder /md
   */
  async bootstrapFromMarkdown(mdFolderPath) {
    console.log("🧠 Knowledge Engine: Đang nạp kiến thức từ folder /md...");
    try {
      // 1. Nạp Grammar (Mệnh đề quan hệ, thì...)
      const grammarPath = path.join(mdFolderPath, 'grammar');
      if (fs.existsSync(grammarPath)) {
        const files = fs.readdirSync(grammarPath);
        files.forEach(file => {
          if (file.endsWith('.md')) {
            const content = fs.readFileSync(path.join(grammarPath, file), 'utf-8');
            this._parseGrammarRules(content, file);
          }
        });
      }

      // 2. Nạp Topic Vocabulary
      const topicPath = path.join(mdFolderPath, 'topic_vocabulary');
      if (fs.existsSync(topicPath)) {
        const files = fs.readdirSync(topicPath);
        files.forEach(file => {
          if (file.endsWith('.md')) {
            const content = fs.readFileSync(path.join(topicPath, file), 'utf-8');
            this._parseTopicVocabulary(content);
          }
        });
      }

      console.log(`✅ Đã nạp xong: ${DYNAMIC_GRAMMAR_RULES.length} quy tắc ngữ pháp, ${TOPIC_VOCABULARY.size} từ vựng chủ đề.`);
    } catch (error) {
      console.error("❌ Lỗi khi nạp Markdown Knowledge:", error);
    }
  }

  _parseGrammarRules(content, fileName) {
    // Parser đơn giản: Tìm các từ khóa trong bảng Markdown
    // Ví dụ: Tìm who, which, that trong file Relative_clause.md
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.includes('|') && !line.includes('---')) {
        const match = line.match(/\*\*(.*?)\*\*/g); // Tìm các từ in đậm **word**
        if (match) {
          match.forEach(m => {
            const keyword = m.replace(/\*\*/g, '').trim();
            if (keyword.length > 1 && keyword.length < 20) {
              DYNAMIC_GRAMMAR_RULES.push({
                keyword: keyword.toLowerCase(),
                category: fileName.replace('.md', ''),
                pattern: new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i')
              });
            }
          });
        }
      }
    });
  }

  _parseTopicVocabulary(content) {
    // Parser cho từ vựng: Tìm các dòng có dấu gạch đầu dòng hoặc in đậm
    const matches = content.match(/\*\*(.*?)\*\*/g);
    if (matches) {
      matches.forEach(m => {
        const word = m.replace(/\*\*/g, '').trim();
        if (word.length > 2) TOPIC_VOCABULARY.add(word.toLowerCase());
      });
    }
  }
  
  _classifySentenceType(doc, text) {
    const lowerText = text.toLowerCase();
    
    // --- NEW LOGIC: More precise classification ---
    const hasSubordinating = SUBORDINATING_CONJUNCTIONS.some(conj => new RegExp(`\\b${conj}\\b`, "i").test(lowerText));
    const hasRelative = ADVANCED_STRUCTURE_PATTERNS.RELATIVE_CLAUSE.test(lowerText);
    const verbCount = doc.verbs().length;
    
    // Complex if it has a subordinating conjunction or relative clause and at least one verb
    if ((hasSubordinating || hasRelative) && verbCount >= 1) {
      return "complex";
    }

    const hasCoordinating = COORDINATING_CONJUNCTIONS.some(conj => new RegExp(`\\b${conj}\\b`, "i").test(lowerText));

    // Compound if it has a coordinating conjunction and at least two distinct verb phrases
    if (hasCoordinating && verbCount >= 2) {
      return "compound";
    }

    return "simple";
  }

  /**
   * Detect advanced grammatical structures and return an array with one entry
   * PER OCCURRENCE (not per type). This allows FeatureBuilder to correctly
   * compute both frequency (advancedStructureTotalCount) and variety
   * (advancedStructureGlobalSet.size) from a single array.
   *
   * Uses a FRESH global regex built from pattern.source each call.
   * Rationale: the shared ADVANCED_STRUCTURE_PATTERNS objects are non-global (/i)
   * for safe .test() usage in _classifySentenceType. Creating a new RegExp here
   * avoids lastIndex state pollution while still counting all occurrences.
   *
   * @param {string} text
   * @returns {string[]} repeated keys by occurrence count
   */
  _detectAdvancedStructures(text) {
    const findings = [];
    for (const [key, regex] of Object.entries(ADVANCED_STRUCTURE_PATTERNS)) {
      // Fresh global regex per call — no shared lastIndex state
      const globalRegex = new RegExp(regex.source, 'gi');
      const matches = text.match(globalRegex);
      if (matches) {
        for (let i = 0; i < matches.length; i++) {
          findings.push(key);
        }
      }
    }
    return findings;
  }

  _extractLinkingWords(text, sentenceIndex) {
    const lowerText = text.toLowerCase();
    const found = [];

    LINKING_WORDS.forEach(lw => {
      const regex = new RegExp(`\\b${lw}\\b`, "gi");
      let match;
      while ((match = regex.exec(lowerText)) !== null) {
        const positionRatio = match.index / text.length;
        const position = positionRatio < 0.2 ? "sentence_start" : "middle_or_end";
        
        found.push({
          word: lw,
          actual_match: text.substring(match.index, match.index + lw.length),
          position,
          sentence_index: sentenceIndex,
          start_index: match.index
        });
      }
    });

    return found;
  }

  _extractAcademicWords(text, lemmas = null) {
    const found_words = [];
    const found_less_common = [];
    
    // 1. DÒ TÌM COLLOCATIONS VỚI DYNAMIC REGEX & MASKING (DRY Code)
    const { maskedText, foundCollocations: found_collocations } = this._maskAndExtractCollocations(text);

    // 2. DÒ TÌM TỪ ĐƠN TRÊN PHẦN TEXT ĐÃ MASKED
    // Chỉ những từ chưa bị thay thế bằng '*' mới lọt vào đây
    const wordList = (Array.isArray(lemmas) && lemmas.length > 0) 
      ? lemmas // fallback
      : (maskedText.match(/\b[a-z]+\b/g) || []);
    
    wordList.forEach(w => {
      const lower = w.toLowerCase().trim();
      if (lower.length <= 2 || STOP_WORDS.has(lower)) return;
      
      // Ensure the word wasn't fully masked out (if lemmas are used, we must double check maskedText)
      if (Array.isArray(lemmas) && lemmas.length > 0 && !maskedText.includes(lower)) return;

      if (ACADEMIC_WORDS.has(lower) || TOPIC_VOCABULARY.has(lower)) {
        found_words.push(lower);
      }
      
      if (LESS_COMMON_WORDS.has(lower)) {
        found_less_common.push(lower);
      }
    });

    // 3. TÁCH BẠCH DỮ LIỆU ĐẦU RA
    return {
      collocations: Array.from(new Set(found_collocations)),
      words: Array.from(new Set(found_words)),
      less_common_words: Array.from(new Set(found_less_common))
    };
  }

  _extractTopicWords(text, lemmas = null) {
    if (Array.isArray(lemmas) && lemmas.length > 0) {
      return lemmas.filter(lemma => {
        const lower = lemma.toLowerCase().trim();
        if (lower.length <= 2) return false;
        return TOPIC_VOCABULARY.has(lower);
      });
    }
    const words = text.match(/\b\w+\b/g) || [];
    return words.filter(w => {
      const lower = w.toLowerCase().trim();
      if (lower.length <= 2) return false;
      return TOPIC_VOCABULARY.has(lower);
    });
  }

  analyzeSentence(sentence, index, lemmas = null) {
    const doc = nlp(sentence);
    
    const type = this._classifySentenceType(doc, sentence);
    const linkingWords = this._extractLinkingWords(sentence, index);
    const { collocations, words: academicWords, less_common_words: lessCommonWords } = this._extractAcademicWords(sentence, lemmas);
    const topicWords = this._extractTopicWords(sentence, lemmas);
    const advancedStructures = this._detectAdvancedStructures(sentence); // NEW
    const terms = doc.terms().out('array');
    
    // --- SAFE FRAGMENT CHECK (REVISED — Examiner + Senior Engineer Consensus) ---
    // compromise.js cannot build a dependency tree and regularly misclassifies
    // subordinate clauses (e.g. "Although technology has advanced, ...") as fragments.
    // The previous `startsWithSubordinator && !hasFiniteVerb` heuristic caused
    // systematic false positives that unfairly capped GRA by -0.5 to -1.0 band.
    //
    // Resolution: Remove the subordinator condition entirely.
    // Only flag as fragment when the sentence is undeniably incomplete:
    //   < 4 tokens AND no finite verb detectable by either compromise OR manual regex.
    const FINITE_VERB_REGEX = /\b(is|are|was|were|has|have|had|will|would|could|should|can|may|might|must|do|does|did|become|became|seem|seems|seemed|appear|appears|appeared|remain|remains|remained)\b/i;
    const hasFiniteVerb = FINITE_VERB_REGEX.test(sentence) || doc.verbs().length > 0;

    let isFragment = false;
    if (doc.terms().length < 4 && !hasFiniteVerb) {
      // Undeniably incomplete: very short phrase with no detectable finite verb.
      isFragment = true;
    }

    return {
      sentence,
      sentence_index: index,
      type,
      word_count: terms.length,
      linking_words: linkingWords,
      collocations: collocations,
      academic_words: academicWords,
      less_common_words: lessCommonWords,
      topic_words: topicWords,
      advanced_structures: advancedStructures, 
      is_fragment: isFragment
    };
  }

  splitSentences(text) {
    const doc = nlp(text);
    return doc.sentences().out("array");
  }

  splitParagraphs(text) {
    if (!text) return [];
    return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
  }

  /**
   * Calculate raw AWL Coverage ratio (academic token hits / total tokens).
   * Used as one signal in the LR formula — measures DENSITY of academic vocabulary.
   * NOTE: this counts token occurrences, not unique word families.
   * Pair with calculateWordFamilyCoverage() for RANGE/DIVERSITY assessment.
   *
   *
   * @param {string} text - Full essay text
   * @returns {number} ratio in [0, 1] (e.g. 0.05 = 5% of tokens are academic)
   */
  
  /**
   * Helper: Tìm và che phủ (mask) toàn bộ collocations.
   * @returns {{ maskedText: string, foundCollocations: string[] }}
   */
  _maskAndExtractCollocations(text) {
    let maskedText = text.toLowerCase();
    const foundCollocations = [];

    ACADEMIC_COLLOCATIONS.forEach(colloc => {
      const parts = colloc.split(' ').map(word => {
        if (word.endsWith('e')) {
          const base = word.slice(0, -1);
          return `(?:${word}s?|${base}ed|${base}ing)`;
        }
        return `${word}(?:s|es|d|ed|ing)?`;
      });
      const regexPattern = `\\b${parts.join('\\s+')}\\b`;
      const regex = new RegExp(regexPattern, 'gi');

      let match;
      while ((match = regex.exec(maskedText)) !== null) {
        foundCollocations.push(match[0].toLowerCase());
        const mask = '*'.repeat(match[0].length);
        maskedText = maskedText.substring(0, match.index) + mask + maskedText.substring(match.index + match[0].length);
      }
    });

    return { maskedText, foundCollocations };
  }

  calculateAWLCoverage(text) {
    // 1. Áp dụng Masking chặn Double Counting
    const maskedText = this._maskAndExtractCollocations(text).maskedText;
    
    // 2. Tách từ (dùng [a-z]+ để tự động phớt lờ các dấu ***)
    const words = maskedText.match(/[a-z]+/g) || [];
    if (words.length === 0) return 0;
    
    let academicWordHits = 0;
    for (const word of words) {
      if (ACADEMIC_WORDS.has(word)) {
        academicWordHits++;
      }
    }
    
    return academicWordHits / words.length;
  }

  /**
   * Calculate Word Family Diversity — the RANGE signal for LR scoring.
   *
   * Cambridge LR Band Descriptors assess RANGE, not frequency:
   *   Band 7: "uses a sufficient range of vocabulary to allow flexibility"
   *   Band 5: "may make noticeable errors in word choice"
   *
   * Problem with raw AWL Coverage: a student writing "economic", "economically",
   * "economy", "economists" four times is hitting 4 AWL tokens but showing only
   * ONE word family — this is NOT range, it is repetition.
   *
   * Solution: Strip common English morphological suffixes to a pseudo-stem,
   * then count UNIQUE stems that hit the AWL list. This approximates the
   * Cambridge examiner's intuition of "distinct vocabulary items".
   *
   * Suffix strip order matters — strip longer suffixes first to avoid partial stripping.
   *
   * @param {string} text - Full essay text
   * @returns {{ uniqueFamilies: number, familyRatio: number, families: string[] }}
   *   uniqueFamilies — count of distinct AWL word families used
   *   familyRatio    — uniqueFamilies / total AWL token hits (diversity index: 1.0 = perfect range)
   *   families       — list of unique stems for debugging
   */
  calculateWordFamilyCoverage(text) {
    const SUFFIXES = [
      // Longer suffixes first (order matters)
      'ization', 'isation', 'ational', 'ically', 'lessly', 'fulness',
      'ations', 'nesses', 'ments', 'ities', 'ation', 'izing', 'ising',
      'ality', 'ified', 'ifier', 'istic', 'ology', 'ified',
      'ness', 'ment', 'tion', 'sion', 'ance', 'ence', 'ity',
      'ive', 'ize', 'ise', 'ify', 'ous', 'ful', 'ing', 'ial',
      'ion', 'ist', 'ism', 'ies', 'ers', 'est', 'ary',
      'ed', 'er', 'ly', 'al', 'ic', 'en', 'ry', 'nt', 'cy'
    ];

    /**
     * Strip known morphological suffixes to get a pseudo-stem.
     * Minimum stem length of 4 characters prevents over-stripping.
     *
     * @param {string} word
     * @returns {string} pseudo-stem
     */
    const getStem = (word) => {
      for (const suffix of SUFFIXES) {
        if (word.endsWith(suffix) && word.length - suffix.length >= 4) {
          return word.slice(0, word.length - suffix.length);
        }
      }
      return word;
    };

    // 1. Áp dụng Masking chặn Double Counting
    const maskedText = this._maskAndExtractCollocations(text).maskedText;
    
    // 2. Tách từ (dùng [a-z]+ để tự động phớt lờ các dấu ***)
    const words = maskedText.match(/[a-z]+/g) || [];
    if (words.length === 0) return { uniqueFamilies: 0, familyRatio: 0, families: [] };

    const familySet  = new Set();
    let   awlHits    = 0;

    for (const word of words) {
      if (STOP_WORDS.has(word) || word.length <= 2) continue;
      if (ACADEMIC_WORDS.has(word)) {
        awlHits++;
        familySet.add(getStem(word));
      }
    }

    const familyRatio = awlHits > 0
      ? parseFloat((familySet.size / awlHits).toFixed(2))
      : 0;

    return {
      uniqueFamilies: familySet.size,
      familyRatio,
      families: Array.from(familySet)
    };
  }

  /**
   * Scan the full essay text for cliché and template phrases.
   * Returns a structured report used by FeatureBuilder and BandConstraintEngine.
   *
   * @param {string} text - Full essay text (lowercased internally)
   * @returns {{ detected: Array, counts: Object, density: number, has_mechanical_transitions: boolean }}
   */
  detectClichePhrases(text) {
    const lowerText = text.toLowerCase();
    const totalWords = (text.match(/\b\w+\b/g) || []).length;

    const detected = [];
    const counts = { MECHANICAL: 0, TEMPLATE: 0, COLLOCATION: 0 };

    for (const [tier, phrases] of Object.entries(CLICHE_PHRASES)) {
      for (const phrase of phrases) {
        // Use word-boundary aware regex to avoid partial matches
        const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          counts[tier] += matches.length;
          detected.push({
            phrase,
            tier,
            frequency: matches.length
          });
        }
      }
    }

    const totalClicheCount = counts.MECHANICAL + counts.TEMPLATE + counts.COLLOCATION;
    // Density: cliché hits per 100 words — the key metric for constraint engine
    const density = totalWords > 0 ? parseFloat(((totalClicheCount / totalWords) * 100).toFixed(2)) : 0;

    return {
      detected,
      counts,
      total: totalClicheCount,
      density,
      // True if MECHANICAL transitions dominate — triggers CC hard cap in BandConstraintEngine
      has_mechanical_transitions: counts.MECHANICAL >= 3
    };
  }
  /**
   * Scan the full essay for informal/conversational register violations.
   *
   * Cambridge LR descriptor penalizes "informal vocabulary" and
   * "inappropriate register" — particularly in Task 2 academic essays.
   * This method provides a signal complementary to cliché detection:
   *   - Cliché: formulaic STRUCTURE (mechanical transitions, templates)
   *   - Register: inappropriate VOCABULARY level (contractions, slang)
   *
   * Severity thresholds (per 100 words, calibrated empirically):
   *   NONE   : 0 hits
   *   LOW    : 1–2 hits  — minor (e.g. one "it's") — no penalty
   *   MEDIUM : 3–5 hits  — noticeable register inconsistency
   *   HIGH   : 6+ hits   — pervasive informal register (Band 5 territory)
   *
   * @param {string} text - Full essay text
   * @returns {{ detected: Array, counts: Object, density: number, severity: string }}
   */
  detectInformalRegister(text) {
    const lowerText = text.toLowerCase();
    const totalWords = (text.match(/\b\w+\b/g) || []).length;
    const detected = [];
    const counts = { CONTRACTION: 0, SLANG_CASUAL: 0, COLLOQUIAL_PHRASE: 0 };

    for (const [tier, terms] of Object.entries(INFORMAL_REGISTER)) {
      for (const term of terms) {
        // Word-boundary aware match — avoid partial hits inside longer words
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          counts[tier] += matches.length;
          detected.push({ term, tier, frequency: matches.length });
        }
      }
    }

    const totalHits = counts.CONTRACTION + counts.SLANG_CASUAL + counts.COLLOQUIAL_PHRASE;
    // Weight contractions more heavily (they are always wrong in formal writing)
    const weightedHits = counts.CONTRACTION * 1.5 + counts.SLANG_CASUAL * 1.0 + counts.COLLOQUIAL_PHRASE * 0.5;
    const density = totalWords > 0 ? parseFloat(((weightedHits / totalWords) * 100).toFixed(2)) : 0;

    let severity = 'NONE';
    if (density >= 3.0)      severity = 'HIGH';
    else if (density >= 1.0) severity = 'MEDIUM';
    else if (density > 0)    severity = 'LOW';

    return { detected, counts, total: totalHits, density, severity };
  }
}

module.exports = new RuleBasedService();
