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
  "furthermore", "moreover", "in addition", "consequently", "therefore",
  "however", "nevertheless", "on the other hand", "specifically", "for instance"
];

// Bộ nhớ động cho các quy tắc từ Markdown
let DYNAMIC_GRAMMAR_RULES = [];
let TOPIC_VOCABULARY = new Set();

// Dynamic set for academic/advanced vocabulary check
let ACADEMIC_WORDS = new Set([
  "analyze", "approach", "assess", "assume", "authority", "available", "benefit",
  "concept", "consist", "context", "constitute", "derive", "evident", "export",
  "factor", "finance", "formula", "function", "identify", "income", "indicate",
  "individual", "interpret", "involve", "issue", "labor", "legal", "legislate",
  "major", "method", "occur", "percent", "period", "policy", "principle", "proceed",
  "process", "require", "research", "respond", "role", "section", "sector",
  "significant", "similar", "source", "specific", "structure", "theory", "vary",
  "inevitable", "conducive", "detrimental", "ubiquitous", "paradigm", "phenomenon",
  "crucial", "vital", "essential", "fundamental", "profound", "substantial"
// ... (giữ nguyên ACADEMIC_WORDS cũ)
]);

const ADVANCED_STRUCTURE_PATTERNS = {
  PASSIVE_VOICE: /\b(am|is|are|was|were|be|been|being)\b\s+([a-z]+ed|gone|done|seen|written|taken|built|known|given|chosen)\b/i,
  CONDITIONAL: /\b(if|unless|provided that|as long as)\b/i,
  INVERSION: /^(never|seldom|rarely|hardly|only by|not only|at no time|under no circumstances)\b\s+(do|does|did|have|has|had|can|could|will|should|is|are|was|were)\b/i,
  CLEFT_SENTENCE: /^(it\s+(is|was)|what\s+.*?\s+(is|was))\b.*?\bthat\b/i,
  RELATIVE_CLAUSE: /\b(who|whom|whose|which|that)\b/i,
  PERFECT_TENSE: /\b(have|has|had)\b\s+([a-z]+ed|gone|done|seen|written|taken|built|known|given|chosen)\b/i
};

class RuleBasedService {
  /**
   * Cập nhật danh sách từ vựng từ Neo4j hoặc Crawler
   */
  setAcademicWords(wordsArray) {
    if (Array.isArray(wordsArray)) {
      wordsArray.forEach(word => ACADEMIC_WORDS.add(word.toLowerCase()));
      console.log(`📚 RuleBasedService: Đã nạp thêm ${wordsArray.length} từ vựng mới từ Graph. Tổng: ${ACADEMIC_WORDS.size}`);
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

  _detectAdvancedStructures(text) {
    const findings = [];
    for (const [key, regex] of Object.entries(ADVANCED_STRUCTURE_PATTERNS)) {
      if (regex.test(text)) {
        findings.push(key);
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

  _extractAcademicWords(text) {
    const words = text.match(/\b\w+\b/g) || [];
    return words.filter(w => {
      const lower = w.toLowerCase();
      return ACADEMIC_WORDS.has(lower) || TOPIC_VOCABULARY.has(lower);
    });
  }

  _extractTopicWords(text) {
    const words = text.match(/\b\w+\b/g) || [];
    return words.filter(w => TOPIC_VOCABULARY.has(w.toLowerCase()));
  }

  analyzeSentence(sentence, index) {
    const doc = nlp(sentence);
    
    const type = this._classifySentenceType(doc, sentence);
    const linkingWords = this._extractLinkingWords(sentence, index);
    const academicWords = this._extractAcademicWords(sentence);
    const topicWords = this._extractTopicWords(sentence);
    const advancedStructures = this._detectAdvancedStructures(sentence); // NEW
    const terms = doc.terms().out('array');
    
    // --- SMARTER FRAGMENT CHECK ---
    const lower = sentence.trim().toLowerCase();
    const startWords = ["because", "so", "but", "when", "although", "while", "if"];
    const startsWithSubordinator = startWords.some(w => lower.startsWith(w));
    
    // A sentence is a fragment if it starts with a subordinator but lacks a main verb phrase 
    // OR if it's very short and lacks a verb.
    // Note: We use a very low threshold to avoid False Positives on complex sentences.
    let isFragment = false;
    if (startsWithSubordinator && doc.verbs().length === 0) {
      isFragment = true;
    } else if (doc.terms().length < 4 && doc.verbs().length === 0) {
      isFragment = true;
    }

    return {
      sentence,
      sentence_index: index,
      type,
      word_count: terms.length,
      linking_words: linkingWords,
      academic_words: academicWords,
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

  calculateTTR(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    if (words.length === 0) return 0;
    const uniqueWords = new Set(words);
    return uniqueWords.size / words.length;
  }
}

module.exports = new RuleBasedService();
