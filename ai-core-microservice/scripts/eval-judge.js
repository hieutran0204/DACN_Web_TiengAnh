/**
 * scripts/eval-judge.js
 *
 * name: GPT-as-Judge Evaluator
 * description: Uses a strong LLM (Gemini / GPT) to judge the QUALITY of AI tutor
 *   feedback on 5 pedagogical dimensions. Does NOT judge band score accuracy.
 *   Designed for research-grade evaluation of educational AI systems.
 *
 * Dimensions judged:
 *   1. Relevance       — Does feedback address the student's actual weaknesses?
 *   2. Actionability    — Can the student act on this feedback immediately?
 *   3. Personalization  — Does feedback reference student history/progression?
 *   4. Hallucination    — Does feedback claim errors/strengths that don't exist?
 *   5. Pedagogical      — Does feedback suggest an appropriate next learning step?
 *
 * Usage:
 *   node scripts/eval-judge.js                    # Judge all eval results
 *   node scripts/eval-judge.js --limit 5          # Judge first 5 results
 *   node scripts/eval-judge.js --provider gemini  # Use Gemini as judge
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');

const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatOllama } = require('@langchain/ollama');

// ─── Constants ───────────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '../data/eval');
const EVAL_RESULTS_PATH = path.join(DATA_DIR, 'eval_results.json');
const JUDGE_RESULTS_PATH = path.join(DATA_DIR, 'judge_results.json');

// ─── CLI Arguments ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const limitIdx = args.indexOf('--limit');
const providerIdx = args.indexOf('--provider');

const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;
const PROVIDER = providerIdx !== -1 ? args[providerIdx + 1] : 'gemini';

// ─── Initialize Judge Model ─────────────────────────────────────────────────
let judgeModel;

function initJudge() {
  if (PROVIDER === 'gemini') {
    judgeModel = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      apiKey: process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY,
      temperature: 0.1, // Low temp for consistent judging
    });
    console.log('⚖️ Judge initialized: Gemini 2.5 Flash');
  } else {
    judgeModel = new ChatOllama({
      model: process.env.AI_MODEL || 'gpt-oss:20b-cloud',
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
      temperature: 0.1,
      format: 'json',
    });
    console.log(`⚖️ Judge initialized: Ollama (${process.env.AI_MODEL})`);
  }
}

// ─── Judge Prompt Builder ────────────────────────────────────────────────────

/**
 * Build the evaluation prompt for the judge LLM.
 * @param {Object} evalCase - The eval query
 * @param {Object} profile - Student learner profile
 * @param {Object} result - Pipeline result (from eval_results.json)
 * @returns {string}
 */
function buildJudgePrompt(evalCase, profile, result) {
  return `You are an expert evaluator of educational AI feedback systems for IELTS Writing.

Your task is to evaluate the QUALITY of feedback given by an AI tutor. You are NOT evaluating the band score accuracy — only the pedagogical quality of the feedback.

=== STUDENT CONTEXT ===
Student Level: ${profile?.level || 'unknown'}
Primary Weaknesses: ${profile?.primary_weakness?.join(', ') || 'unknown'}
Secondary Weaknesses: ${profile?.secondary_weakness?.join(', ') || 'unknown'}
Strengths: ${profile?.strength?.join(', ') || 'unknown'}
Learning Goal: ${profile?.learning_goal || 'unknown'}
Preferred Feedback Style: ${profile?.preferred_feedback_style || 'direct'}
Essays Previously Submitted: ${profile?.learning_history?.essays_submitted || 0}
Average Band: ${profile?.learning_history?.avg_band || 'unknown'}
Recurring Errors: ${profile?.learning_history?.recurring_errors?.join(', ') || 'none'}

=== THE ESSAY ===
Question: ${evalCase.question}
Essay: """${evalCase.essay.trim()}"""

=== AI TUTOR FEEDBACK (TO EVALUATE) ===
Overall Band Given: ${result.actual_band}
Band Breakdown: ${JSON.stringify(result.actual_breakdown)}

Feedback (Vietnamese): ${result.feedback_vn || 'N/A'}

Recommendations: ${result.recommendations_vn || 'N/A'}

Scaffolding Suggestions: ${JSON.stringify(result.scaffolding_suggestions || [], null, 2)}

Strengths Identified: ${JSON.stringify(result.strengths || [])}

Weaknesses Identified: ${JSON.stringify(result.weaknesses || [])}

Evidence-Based Justification: ${JSON.stringify(result.evidence_based_justification_vn || {}, null, 2)}

=== YOUR EVALUATION TASK ===
Rate each of the following dimensions from 1 to 5, where:
  1 = Very Poor, 2 = Poor, 3 = Adequate, 4 = Good, 5 = Excellent

*** SCORING GUIDELINES (FEW-SHOT EXAMPLES) ***
- Actionability = 5: "The feedback provides a specific template or grammar rule (e.g., 'Use Although + clause instead of But') and applies it to the student's exact sentence."
- Actionability = 2: "The feedback just says 'You need to improve your grammar and use more complex sentences' without showing how."
- Pedagogical Alignment = 5: "For a Band 4.5 student, the feedback focuses on fixing basic Subject-Verb Agreement before worrying about advanced nominalization."
- Pedagogical Alignment = 2: "For a Band 4.5 student, the feedback recommends using inversion and cleft sentences, which is too advanced and overwhelming."
- Hallucination-Free = 1: "The feedback praises the student for using 'excellent conditional sentences' when there are ZERO conditional sentences in the essay."

Return ONLY valid JSON:
{
  "relevance": {
    "score": <1-5>,
    "reasoning": "Does the feedback correctly identify and address the student's actual weaknesses? Is it about the right issues?"
  },
  "actionability": {
    "score": <1-5>,
    "reasoning": "Can the student immediately understand what to do differently? Are there concrete, specific suggestions?"
  },
  "personalization": {
    "score": <1-5>,
    "reasoning": "Does the feedback reference the student's history, recurring errors, or learning trajectory? Would a generic feedback be the same?"
  },
  "hallucination_free": {
    "score": <1-5>,
    "reasoning": "Does the feedback only mention errors that actually exist in the essay? Does it claim strengths that aren't there?"
  },
  "pedagogical_alignment": {
    "score": <1-5>,
    "reasoning": "Does the feedback suggest appropriate next learning steps for this student's level? Is it too easy or too hard? Does it follow sound teaching principles (scaffolding, ZPD)?"
  },
  "overall_summary": "A 1-2 sentence summary of the feedback quality."
}`;
}

// ─── Invoke Judge with Retry ─────────────────────────────────────────────────
async function invokeJudge(prompt, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await judgeModel.invoke(prompt);
      const cleaned = response.content.replace(/```json|```/g, '').trim();

      // Extract JSON
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in judge response');

      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      const isRateLimit = (err.message || '').includes('429') || (err.message || '').toLowerCase().includes('quota');
      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = 15000 * (attempt + 1);
        console.warn(`   ⚠️ Rate limited. Waiting ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      } else if (attempt < maxRetries - 1) {
        console.warn(`   ⚠️ Judge attempt ${attempt + 1} failed: ${err.message}. Retrying...`);
        await new Promise(r => setTimeout(r, 3000));
      } else {
        throw err;
      }
    }
  }
}

// ─── Main Runner ─────────────────────────────────────────────────────────────
async function runJudgeEvaluation() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  ⚖️ GPT-as-Judge — Pedagogical Feedback Quality Evaluator');
  console.log(`  Provider: ${PROVIDER.toUpperCase()} | Limit: ${LIMIT === Infinity ? 'ALL' : LIMIT}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Check eval results exist
  if (!fs.existsSync(EVAL_RESULTS_PATH)) {
    console.error('❌ No eval_results.json found. Run "node scripts/run-eval.js" first.');
    process.exit(1);
  }

  const evalResults = JSON.parse(fs.readFileSync(EVAL_RESULTS_PATH, 'utf-8'));
  const profiles = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'learner_profiles.json'), 'utf-8'));
  const queries = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'eval_queries.json'), 'utf-8'));

  const profileMap = {};
  for (const p of profiles) profileMap[p.id] = p;
  const queryMap = {};
  for (const q of queries) queryMap[q.id] = q;

  // Filter to completed cases only
  const completedCases = evalResults.per_case_results
    .filter(r => r.status === 'OK')
    .slice(0, LIMIT);

  if (completedCases.length === 0) {
    console.error('❌ No completed eval cases found in results.');
    process.exit(1);
  }

  console.log(`📋 Found ${completedCases.length} completed eval cases to judge.\n`);

  // 2. Init judge
  initJudge();

  // 3. Run judge for each case
  const judgeResults = [];
  const aggregated = {
    relevance: 0,
    actionability: 0,
    personalization: 0,
    hallucination_free: 0,
    pedagogical_alignment: 0,
    count: 0,
  };

  for (let i = 0; i < completedCases.length; i++) {
    const caseResult = completedCases[i];
    const evalCase = queryMap[caseResult.id];
    const profile = profileMap[caseResult.student];

    if (!evalCase) {
      console.warn(`   ⚠️ No matching query for ${caseResult.id}, skipping.`);
      continue;
    }

    console.log(`──────────────────────────────────────────────────────────────`);
    console.log(`⚖️ [${i + 1}/${completedCases.length}] Judging: ${caseResult.id} — ${caseResult.scenario}`);

    try {
      // Reconstruct a simplified result object for the judge
      // (The actual result is stored in eval_results.json during run-eval)
      const resultForJudge = {
        actual_band: caseResult.actual_band,
        actual_breakdown: caseResult.actual_breakdown,
        // These fields need to come from the original pipeline run
        // For now, use what we have from the eval results
        feedback_vn: caseResult.feedback_vn || 'N/A',
        recommendations_vn: caseResult.recommendations_vn || 'N/A',
        scaffolding_suggestions: caseResult.scaffolding_suggestions || [],
        strengths: caseResult.strengths || [],
        weaknesses: caseResult.weaknesses || [],
        evidence_based_justification_vn: caseResult.evidence_based_justification_vn || {},
      };

      const prompt = buildJudgePrompt(evalCase, profile, resultForJudge);
      const judgment = await invokeJudge(prompt);

      const judgeEntry = {
        id: caseResult.id,
        scenario: caseResult.scenario,
        student: caseResult.student,
        scores: {
          relevance: judgment.relevance?.score || 0,
          actionability: judgment.actionability?.score || 0,
          personalization: judgment.personalization?.score || 0,
          hallucination_free: judgment.hallucination_free?.score || 0,
          pedagogical_alignment: judgment.pedagogical_alignment?.score || 0,
        },
        reasoning: {
          relevance: judgment.relevance?.reasoning || '',
          actionability: judgment.actionability?.reasoning || '',
          personalization: judgment.personalization?.reasoning || '',
          hallucination_free: judgment.hallucination_free?.reasoning || '',
          pedagogical_alignment: judgment.pedagogical_alignment?.reasoning || '',
        },
        overall_summary: judgment.overall_summary || '',
      };

      judgeResults.push(judgeEntry);

      // Accumulate
      aggregated.relevance += judgeEntry.scores.relevance;
      aggregated.actionability += judgeEntry.scores.actionability;
      aggregated.personalization += judgeEntry.scores.personalization;
      aggregated.hallucination_free += judgeEntry.scores.hallucination_free;
      aggregated.pedagogical_alignment += judgeEntry.scores.pedagogical_alignment;
      aggregated.count++;

      // Print
      console.log(`   📊 Relevance: ${judgeEntry.scores.relevance}/5 | Action: ${judgeEntry.scores.actionability}/5 | Personal: ${judgeEntry.scores.personalization}/5 | Halluc: ${judgeEntry.scores.hallucination_free}/5 | Pedagogy: ${judgeEntry.scores.pedagogical_alignment}/5`);
      console.log(`   💬 ${judgeEntry.overall_summary}`);

    } catch (err) {
      console.error(`   ❌ Judge failed for ${caseResult.id}: ${err.message}`);
      judgeResults.push({
        id: caseResult.id,
        scenario: caseResult.scenario,
        status: 'JUDGE_FAILED',
        error: err.message,
      });
    }

    // Rate limit delay
    if (i < completedCases.length - 1) {
      const delay = PROVIDER === 'gemini' ? 4000 : 2000;
      await new Promise(r => setTimeout(r, delay));
    }
  }

  // ── Final Report ───────────────────────────────────────────────
  const n = aggregated.count;
  const report = {
    meta: {
      judge_provider: PROVIDER,
      total_judged: n,
      timestamp: new Date().toISOString(),
    },
    average_scores: {
      relevance: n > 0 ? parseFloat((aggregated.relevance / n).toFixed(2)) : 0,
      actionability: n > 0 ? parseFloat((aggregated.actionability / n).toFixed(2)) : 0,
      personalization: n > 0 ? parseFloat((aggregated.personalization / n).toFixed(2)) : 0,
      hallucination_free: n > 0 ? parseFloat((aggregated.hallucination_free / n).toFixed(2)) : 0,
      pedagogical_alignment: n > 0 ? parseFloat((aggregated.pedagogical_alignment / n).toFixed(2)) : 0,
    },
    per_case_judgments: judgeResults,
  };

  // Compute overall average (out of 5)
  const avgScores = report.average_scores;
  const overallAvg = (avgScores.relevance + avgScores.actionability + avgScores.personalization +
    avgScores.hallucination_free + avgScores.pedagogical_alignment) / 5;

  fs.writeFileSync(JUDGE_RESULTS_PATH, JSON.stringify(report, null, 2), 'utf-8');

  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  ⚖️ JUDGE EVALUATION REPORT');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Cases Judged: ${n}`);
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`  Relevance:             ${avgScores.relevance}/5.0`);
  console.log(`  Actionability:         ${avgScores.actionability}/5.0`);
  console.log(`  Personalization:       ${avgScores.personalization}/5.0`);
  console.log(`  Hallucination-Free:    ${avgScores.hallucination_free}/5.0`);
  console.log(`  Pedagogical Alignment: ${avgScores.pedagogical_alignment}/5.0`);
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`  Overall Average:       ${overallAvg.toFixed(2)}/5.0`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  💾 Results saved to: ${JUDGE_RESULTS_PATH}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  process.exit(0);
}

runJudgeEvaluation().catch(err => {
  console.error('💥 Judge runner crashed:', err);
  process.exit(1);
});
