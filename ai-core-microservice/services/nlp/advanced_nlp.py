"""
name: advanced_nlp.py
description: Advanced NLP pipeline using spaCy + LanguageTool + SentenceTransformers.
  Outputs per-sentence analysis plus document-level grammar metrics, advanced structure
  detection, and implicit cohesion signals. LanguageTool replaces Small LLM for
  deterministic grammar error counting — fixes systematic GRA over-scoring (GRA MAE=1.05).
"""

import sys
import json
import spacy
import os

os.environ['TRANSFORMERS_VERBOSITY'] = 'error'

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    print(json.dumps({"error": "Missing dependency: pip install sentence-transformers"}))
    sys.exit(1)


class AdvancedNLP:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print(json.dumps({"error": "Missing spaCy model: python -m spacy download en_core_web_sm"}))
            sys.exit(1)

        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')

        # ── LanguageTool — deterministic grammar error counting ─────────────────
        # Replaces Small LLM recall (~50%) with rule-based detection (~90%).
        # This is the primary fix for GRA over-scoring (GT_010: human 5.5 → predicted 8.5).
        self.lt_tool = None
        try:
            import language_tool_python
            # Try to connect to the separate LanguageTool Docker container first
            try:
                self.lt_tool = language_tool_python.LanguageTool('en-US', remote_server='http://localhost:8010')
            except Exception as e:
                sys.stderr.write(f"[WARNING] Could not connect to remote LanguageTool (http://localhost:8010): {e}. Falling back to local.\\n")
                self.lt_tool = language_tool_python.LanguageTool('en-US')
                
            # Rules to suppress: pure formatting/style, not grammar accuracy
            self.lt_disabled_rules = {
                'WHITESPACE_RULE', 'EN_QUOTES', 'PUNCTUATION_PARAGRAPH_END',
                'COMMA_PARENTHESIS_WHITESPACE', 'EN_UNPAIRED_BRACKETS',
                'UPPERCASE_SENTENCE_START', 'WORD_CONTAINS_UNDERSCORE',
                'DASH_RULE', 'WORD_REPEAT_BEGINNING_RULE',
            }
        except Exception as e:
            self.lt_tool = None
            sys.stderr.write(f"[WARNING] LanguageTool unavailable ({e}). GRA will fall back to LLM path.\n")
            sys.stderr.write("[INFO] Install: pip install language-tool-python\n")

    def _run_language_tool(self, text):
        """
        Run LanguageTool on the full essay and return structured grammar metrics.

        Parameters:
          text (str): Full essay text.

        Returns:
          dict: Grammar metrics including error_per_100_words (key input to GRA scoring),
                major_count (SVA/tense errors), and top_errors list.
          None: If LanguageTool is unavailable (caller uses LLM fallback).
        """
        if self.lt_tool is None:
            return None

        try:
            matches = self.lt_tool.check(text)

            # Keep only grammar/spelling categories — exclude style-only suggestions
            GRAMMAR_CATEGORIES = {
                'GRAMMAR', 'TYPOS', 'PUNCTUATION', 'CONFUSED_WORDS',
                'REDUNDANCY', 'CASING', 'SEMANTICS',
            }
            filtered = [
                m for m in matches
                if m.ruleId not in self.lt_disabled_rules
                and m.category in GRAMMAR_CATEGORIES
            ]

            word_count = len(text.split())
            error_rate = round((len(filtered) / word_count * 100), 2) if word_count > 0 else 0.0

            # Major errors: Agreement + Tense = Cambridge Band 5-6 markers
            # These rule IDs cover the most common SVA and verb form errors
            MAJOR_RULE_PATTERNS = (
                'AGREEMENT', 'SUBJECT_VERB', 'NON3PRS_VERB',
                'VERB_FORM', 'HE_VERB_AGR', 'EN_AGREEMENT',
            )
            major_count = sum(
                1 for m in filtered
                if any(p in m.ruleId for p in MAJOR_RULE_PATTERNS)
            )

            # Category breakdown for scoring engine context
            categories = {}
            for m in filtered:
                cat = m.category or 'OTHER'
                categories[cat] = categories.get(cat, 0) + 1

            # Top error snippets (for MicroEvaluator context injection — reduces LLM hallucination)
            top_errors = []
            for m in filtered[:15]:
                replacements = m.replacements[:2] if m.replacements else []
                top_errors.append({
                    'message': m.message,
                    'context': (m.context or '').strip(),
                    'rule_id': m.ruleId,
                    'suggestion': replacements[0] if replacements else '',
                    'category': m.category,
                })

            return {
                'total_errors': len(filtered),
                'error_per_100_words': error_rate,
                'major_count': major_count,
                'error_categories': categories,
                'top_errors': top_errors,
                'available': True,
            }

        except Exception as e:
            sys.stderr.write(f"[WARNING] LanguageTool check failed: {e}\n")
            return None

    def _detect_advanced_structures_doc(self, doc):
        """
        Detect advanced grammatical structures using spaCy dependency parse.

        Parameters:
          doc: spaCy Doc object for the full essay.

        Returns:
          set: Structure type names present (e.g. {'passive_voice', 'relative_clause'}).
               Size of this set = variety count for GRA range bonus.
        """
        structures = set()

        for token in doc:
            # Relative clause: relcl dependency arc
            if token.dep_ == 'relcl':
                structures.add('relative_clause')

            # Passive voice: nsubjpass or auxpass
            if token.dep_ in ('nsubjpass', 'auxpass'):
                structures.add('passive_voice')

            # Conditional: advcl child with 'if/unless/provided' mark
            if token.dep_ == 'advcl':
                marks = [c.lemma_.lower() for c in token.children if c.dep_ == 'mark']
                if any(m in ('if', 'unless', 'provided', 'assuming') for m in marks):
                    structures.add('conditional')

            # Perfect aspect: have/has/had + past participle (VBN)
            if token.lemma_ in ('have', 'has', 'had') and token.pos_ == 'AUX':
                for child in token.head.children:
                    if child.tag_ == 'VBN':
                        structures.add('perfect_aspect')
                        break

            # Nominalization: -tion/-ment/-ance/-ence/-ity nouns as core arguments
            if token.pos_ == 'NOUN' and token.dep_ in ('nsubj', 'dobj', 'pobj', 'attr'):
                if token.lemma_.lower().endswith(('tion', 'ment', 'ance', 'ence', 'ity', 'ness')):
                    structures.add('nominalization')

        # Cleft sentence: "It is/was ... that ..." (document-level pattern)
        text_lower = doc.text.lower()
        if (text_lower.startswith('it is ') or text_lower.startswith('it was ')) and ' that ' in text_lower:
            structures.add('cleft_sentence')

        # Inversion: starts with negative adverb + auxiliary verb
        first_three = [t.lemma_.lower() for t in list(doc)[:3]]
        if any(t in ('never', 'seldom', 'rarely', 'hardly', 'only') for t in first_three):
            structures.add('inversion')

        return structures

    def _detect_implicit_cohesion(self, doc):
        """
        Detect implicit cohesion signals — key differentiator between Band 6 and Band 8.

        Cambridge Band 8 essays use implicit cohesion (pronoun reference, lexical chains)
        rather than explicit linking words. Small LLMs miss this, causing CC under-scoring.
        This signal enriches the CC legacy physical path in scoring.engine.js.

        Parameters:
          doc: spaCy Doc object.

        Returns:
          dict: pronoun_reference_ratio, has_lexical_chains, lexical_chain_count.
        """
        ANAPHORIC_PRONOUNS = {'this', 'these', 'those', 'such', 'it', 'they', 'them', 'their'}
        pronoun_count = sum(
            1 for token in doc
            if token.text.lower() in ANAPHORIC_PRONOUNS
            and token.dep_ in ('nsubj', 'dobj', 'pobj', 'det', 'nsubjpass')
        )
        sentences = list(doc.sents)
        n_sents = max(len(sentences), 1)
        pronoun_ratio = round(pronoun_count / n_sents, 2)

        # Lexical chain heuristic: same lemma appearing across 3+ different sentences
        sent_lemma_sets = [
            set(t.lemma_.lower() for t in s if t.pos_ in ('NOUN', 'VERB') and not t.is_stop and len(t.lemma_) > 3)
            for s in sentences
        ]
        chain_count = 0
        if len(sent_lemma_sets) >= 2:
            all_lemmas = set().union(*sent_lemma_sets) if sent_lemma_sets else set()
            for lemma in all_lemmas:
                appearances = sum(1 for ls in sent_lemma_sets if lemma in ls)
                if appearances >= 3:
                    chain_count += 1

        return {
            'pronoun_reference_count': pronoun_count,
            'pronoun_reference_ratio': pronoun_ratio,
            'has_lexical_chains': chain_count >= 2,
            'lexical_chain_count': chain_count,
        }

    def process(self, text):
        """
        Main processing entry point. Analyzes essay text and returns:
          - sentences         : per-sentence analysis (text, lemmas, embeddings, structures)
          - grammar_errors    : LanguageTool metrics → injected into featureMap.grammar
          - advanced_structures: document-level variety set → GRA range bonus
          - implicit_cohesion : pronoun/lexical chain signals → CC legacy path

        Parameters:
          text (str): Full IELTS essay text.

        Returns:
          dict: Structured analysis result.
        """
        doc = self.nlp(text)
        sentences = []

        for i, sent in enumerate(doc.sents):
            roots = [token for token in sent if token.head == token]
            root_text = roots[0].text if roots else ""

            # Discourse markers (explicit cohesion signals for CC)
            markers = [
                token.text.lower() for token in sent
                if token.dep_ in ("advmod", "mark") and token.pos_ in ("ADV", "SCONJ")
            ]
            # Anaphoric pronouns (implicit cohesion signals)
            implicit_pronouns = {"this", "that", "these", "those", "such", "it", "they"}
            for token in sent:
                if token.text.lower() in implicit_pronouns:
                    markers.append(token.text.lower())

            lemmas = [token.lemma_.lower() for token in sent if not token.is_punct and not token.is_space]

            # Sentence-level advanced structure detection
            sent_structures = list(self._detect_advanced_structures_doc(sent.as_doc()))

            sentences.append({
                "index": i,
                "text": sent.text.strip(),
                "root": root_text,
                "markers": list(set(markers)),
                "lemmas": lemmas,
                "is_passive": any(token.dep_ == "nsubjpass" for token in sent),
                "sentence_type": self._classify_type(sent),
                "advanced_structures": sent_structures,
            })

        # Compute Semantic Embeddings (for TopicRelevanceService + discourse similarity)
        embeddings = self.embedder.encode([s["text"] for s in sentences]).tolist()
        for i in range(len(sentences)):
            sentences[i]["embedding"] = embeddings[i]

        # ── Document-level enrichment signals ────────────────────────────────────
        grammar_errors = self._run_language_tool(text)           # GRA fix
        doc_structures = self._detect_advanced_structures_doc(doc)  # GRA range variety
        implicit_cohesion = self._detect_implicit_cohesion(doc)     # CC implicit signal

        return {
            "sentences": sentences,
            "grammar_errors": grammar_errors,
            "advanced_structures": list(doc_structures),
            "implicit_cohesion": implicit_cohesion,
        }

    def _classify_type(self, sent):
        """
        Classify sentence type: simple / complex / compound.

        Parameters:
          sent: spaCy Span (sentence).

        Returns:
          str: 'simple', 'complex', or 'compound'.
        """
        n_subjects = len([t for t in sent if t.dep_ in ("nsubj", "nsubjpass")])
        if n_subjects <= 1:
            return "simple"
        has_subordinate = any(t.dep_ in ("mark", "relcl", "advcl") for t in sent)
        has_coordinate = any(t.dep_ == "cc" for t in sent)
        if has_subordinate:
            return "complex"
        if has_coordinate:
            return "compound"
        return "simple"


if __name__ == "__main__":
    try:
        analyzer = AdvancedNLP()
        input_text = sys.stdin.read()
        if not input_text.strip():
            print(json.dumps({
                "sentences": [],
                "grammar_errors": None,
                "advanced_structures": [],
                "implicit_cohesion": {}
            }))
        else:
            result = analyzer.process(input_text)
            print(json.dumps(result))
        
        if analyzer.lt_tool:
            analyzer.lt_tool.close()
    except Exception as e:
        print(json.dumps({"error": str(e)}))
