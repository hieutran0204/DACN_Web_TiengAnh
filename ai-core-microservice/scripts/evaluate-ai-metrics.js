/**
 * name: evaluate-ai-metrics.js
 * description: Standalone evaluation script for the IELTS AI scoring pipeline.
 *
 * Computes the following metrics against a labeled ground-truth dataset:
 *   - Quadratic Weighted Kappa (QWK)
 *   - Mean Absolute Error (MAE)
 *   - Adjacent Agreement Rate (AAR ±0.5 band)
 *   - Exact Match Rate (EMR)
 *   - Scoring Bias (Mean Signed Error)
 *   - Per-criterion Pearson correlation
 *
 * Usage:
 *   node scripts/evaluate-ai-metrics.js [--verbose] [--out results.json]
 *
 * Ground truth is defined in GROUND_TRUTH_DATASET below.
 * Replace placeholder bands with real human-examiner scores.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const writingService = require("../services/writing.service");
const fs = require("fs");
const path = require("path");

// ─── CLI flags ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const VERBOSE = args.includes("--verbose");
const outFlagIdx = args.indexOf("--out");
const OUT_FILE = outFlagIdx !== -1 ? args[outFlagIdx + 1] : null;

// ─── GROUND TRUTH DATASET ─────────────────────────────────────────────────────
// Source: Cambridge IELTS Official Band Sample Essays (Books 1-18, Task 2)
// Each entry has a question, essay text, and human examiner band scores.
// TODO: Replace all null band scores with real examiner-labeled values.
// ─────────────────────────────────────────────────────────────────────────────
const GROUND_TRUTH_DATASET = require("../data/eval/ground_truth_dataset.json");

// ─── Math helpers ─────────────────────────────────────────────────────────────

/**
 * Rounds a band score to the nearest valid IELTS 0.5 step.
 * @param {number} score
 * @returns {number}
 */
const roundToHalf = (score) => Math.round(score * 2) / 2;

/**
 * Computes Quadratic Weighted Kappa between two arrays of band scores.
 * Assumes IELTS scale: 0 – 9 in steps of 0.5 (19 possible values).
 * @param {number[]} predicted
 * @param {number[]} actual
 * @returns {number} QWK in range [-1, 1]
 */
function computeQWK(predicted, actual) {
  const minScore = 0;
  const maxScore = 9;
  const step = 0.5;
  const labels = [];
  for (let s = minScore; s <= maxScore; s += step) {
    labels.push(Math.round(s * 10) / 10);
  }
  const n = labels.length;
  const N = predicted.length;

  // Build observed and expected matrices
  const O = Array.from({ length: n }, () => new Array(n).fill(0));
  const E = Array.from({ length: n }, () => new Array(n).fill(0));

  const idx = (v) => Math.round((v - minScore) / step);

  for (let k = 0; k < N; k++) {
    const i = idx(roundToHalf(actual[k]));
    const j = idx(roundToHalf(predicted[k]));
    if (i >= 0 && i < n && j >= 0 && j < n) O[i][j]++;
  }

  // Marginals
  const rowSum = O.map((row) => row.reduce((a, b) => a + b, 0));
  const colSum = labels.map((_, j) => O.reduce((a, row) => a + row[j], 0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      E[i][j] = (rowSum[i] * colSum[j]) / N;
    }
  }

  // Quadratic weight
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const w = Math.pow((labels[i] - labels[j]) / (maxScore - minScore), 2);
      numerator += w * O[i][j];
      denominator += w * E[i][j];
    }
  }

  if (denominator === 0) return 1;
  return 1 - numerator / denominator;
}

/**
 * Pearson correlation coefficient between two arrays.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function pearson(a, b) {
  const n = a.length;
  if (n === 0) return 0;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - meanA) * (b[i] - meanB);
    da += (a[i] - meanA) ** 2;
    db += (b[i] - meanB) ** 2;
  }
  const denom = Math.sqrt(da * db);
  return denom === 0 ? 0 : num / denom;
}

// ─── Main evaluation loop ─────────────────────────────────────────────────────

async function runEvaluation() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║       DACN IELTS AI — EVALUATION METRICS RUNNER             ║");
  console.log(`║       N = ${GROUND_TRUTH_DATASET.length} test cases                                   ║`);
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  const records = []; // { id, human, predicted, latencyMs }

  for (let i = 0; i < GROUND_TRUTH_DATASET.length; i++) {
    const gt = GROUND_TRUTH_DATASET[i];
    console.log(`\n[${i + 1}/${GROUND_TRUTH_DATASET.length}] Running: ${gt.id} — ${gt.source}`);

    const start = Date.now();
    let predicted = null;

    try {
      const result = await writingService.analyzeWriting(
        gt.essay.trim(),
        gt.question,
        "ielts-task2",
        `eval_student_${gt.id}`,
        `eval_essay_${gt.id}`
      );

      const latencyMs = Date.now() - start;

      predicted = {
        overall: roundToHalf(result.overall_band ?? 0),
        tr:      roundToHalf(result.band_breakdown?.task_response ?? 0),
        cc:      roundToHalf(result.band_breakdown?.coherence_cohesion ?? 0),
        lr:      roundToHalf(result.band_breakdown?.lexical_resource ?? 0),
        gra:     roundToHalf(result.band_breakdown?.grammatical_range_accuracy ?? 0),
      };

      records.push({ id: gt.id, human: gt.human, predicted, latencyMs });

      if (VERBOSE) {
        console.log("  Human  :", gt.human);
        console.log("  AI     :", predicted);
        console.log(`  Δ Overall: ${(predicted.overall - gt.human.overall).toFixed(1)}`);
        console.log(`  Latency: ${(latencyMs / 1000).toFixed(1)}s`);
        if (result.hard_caps_applied?.reasons?.length > 0) {
          console.log("  Caps   :", result.hard_caps_applied.reasons);
        }
      } else {
        const delta = (predicted.overall - gt.human.overall).toFixed(1);
        const sign = delta >= 0 ? "+" : "";
        console.log(`  Human=${gt.human.overall}  AI=${predicted.overall}  Δ=${sign}${delta}  (${(latencyMs / 1000).toFixed(1)}s)`);
      }

    } catch (err) {
      console.error(`  ❌ FAILED: ${err.message}`);
      records.push({ id: gt.id, human: gt.human, predicted: null, latencyMs: Date.now() - start, error: err.message });
    }

    // Pause between calls to avoid VRAM saturation on Ollama
    if (i < GROUND_TRUTH_DATASET.length - 1) {
      console.log("  ⏳ Cooling down 3s...");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  // ─── Compute Metrics ──────────────────────────────────────────────────────
  const valid = records.filter((r) => r.predicted !== null);
  const N = valid.length;

  if (N === 0) {
    console.error("\n❌ No valid results to compute metrics. Check AI pipeline.");
    process.exit(1);
  }

  const humanOverall = valid.map((r) => r.human.overall);
  const aiOverall    = valid.map((r) => r.predicted.overall);

  const humanTR  = valid.map((r) => r.human.tr);
  const humanCC  = valid.map((r) => r.human.cc);
  const humanLR  = valid.map((r) => r.human.lr);
  const humanGRA = valid.map((r) => r.human.gra);

  const aiTR  = valid.map((r) => r.predicted.tr);
  const aiCC  = valid.map((r) => r.predicted.cc);
  const aiLR  = valid.map((r) => r.predicted.lr);
  const aiGRA = valid.map((r) => r.predicted.gra);

  // QWK
  const qwk = computeQWK(aiOverall, humanOverall);

  // MAE
  const mae = humanOverall.reduce((s, h, i) => s + Math.abs(aiOverall[i] - h), 0) / N;

  // AAR ±0.5
  const aarCount = humanOverall.filter((h, i) => Math.abs(aiOverall[i] - h) <= 0.5).length;
  const aar = (aarCount / N) * 100;

  // EMR
  const emrCount = humanOverall.filter((h, i) => aiOverall[i] === h).length;
  const emr = (emrCount / N) * 100;

  // Bias
  const bias = aiOverall.reduce((s, a, i) => s + (a - humanOverall[i]), 0) / N;

  // Pearson
  const rOverall = pearson(aiOverall, humanOverall);
  const rTR      = pearson(aiTR, humanTR);
  const rCC      = pearson(aiCC, humanCC);
  const rLR      = pearson(aiLR, humanLR);
  const rGRA     = pearson(aiGRA, humanGRA);

  // Per-criterion MAE
  const maeTR  = humanTR.reduce((s, h, i) => s + Math.abs(aiTR[i] - h), 0) / N;
  const maeCC  = humanCC.reduce((s, h, i) => s + Math.abs(aiCC[i] - h), 0) / N;
  const maeLR  = humanLR.reduce((s, h, i) => s + Math.abs(aiLR[i] - h), 0) / N;
  const maeGRA = humanGRA.reduce((s, h, i) => s + Math.abs(aiGRA[i] - h), 0) / N;

  // Latency
  const latencies = valid.map((r) => r.latencyMs).sort((a, b) => a - b);
  const p50 = latencies[Math.floor(N * 0.5)] / 1000;
  const p95 = latencies[Math.floor(N * 0.95)] / 1000;

  // ─── Print Results ────────────────────────────────────────────────────────
  console.log("\n");
  console.log("══════════════════════════════════════════════════════════════");
  console.log("  📊 EVALUATION RESULTS");
  console.log(`  N = ${N} valid / ${records.length} total`);
  console.log("══════════════════════════════════════════════════════════════");
  console.log("\n  ── PRIMARY METRICS ─────────────────────────────────────────");
  console.log(`  QWK (Overall)          : ${qwk.toFixed(4)}   (target ≥ 0.65)`);
  console.log(`  MAE (band)             : ${mae.toFixed(4)}   (target ≤ 0.50)`);
  console.log(`  AAR ±0.5 band          : ${aar.toFixed(1)}%   (target ≥ 70%)`);
  console.log(`  EMR (exact match)      : ${emr.toFixed(1)}%   (target ≥ 40%)`);
  console.log(`  Scoring Bias           : ${bias >= 0 ? "+" : ""}${bias.toFixed(4)}  (target |bias| < 0.25)`);

  console.log("\n  ── PER-CRITERION MAE ────────────────────────────────────────");
  console.log(`  TR  MAE : ${maeTR.toFixed(4)}`);
  console.log(`  CC  MAE : ${maeCC.toFixed(4)}`);
  console.log(`  LR  MAE : ${maeLR.toFixed(4)}`);
  console.log(`  GRA MAE : ${maeGRA.toFixed(4)}`);

  console.log("\n  ── PEARSON CORRELATION ─────────────────────────────────────");
  console.log(`  r Overall : ${rOverall.toFixed(4)}  (target ≥ 0.60)`);
  console.log(`  r TR      : ${rTR.toFixed(4)}`);
  console.log(`  r CC      : ${rCC.toFixed(4)}`);
  console.log(`  r LR      : ${rLR.toFixed(4)}`);
  console.log(`  r GRA     : ${rGRA.toFixed(4)}`);

  console.log("\n  ── LATENCY ─────────────────────────────────────────────────");
  console.log(`  P50       : ${p50.toFixed(1)}s  (target < 8s)`);
  console.log(`  P95       : ${p95.toFixed(1)}s  (target < 15s)`);

  console.log("\n  ── PER-CASE SUMMARY ─────────────────────────────────────────");
  valid.forEach((r) => {
    const delta = (r.predicted.overall - r.human.overall).toFixed(1);
    const sign = delta >= 0 ? "+" : "";
    const aarLabel = Math.abs(r.predicted.overall - r.human.overall) <= 0.5 ? "✅" : "❌";
    console.log(`  ${aarLabel} ${r.id}: Human=${r.human.overall} | AI=${r.predicted.overall} | Δ=${sign}${delta}`);
  });

  // ─── Verdict ──────────────────────────────────────────────────────────────
  const verdicts = [];
  if (qwk >= 0.65) verdicts.push("✅ QWK: Substantial agreement");
  else if (qwk >= 0.41) verdicts.push("⚠️ QWK: Moderate agreement");
  else verdicts.push("❌ QWK: Below target");

  if (mae <= 0.5) verdicts.push("✅ MAE: Within acceptable range");
  else verdicts.push("❌ MAE: Exceeds ±0.5 band");

  if (aar >= 70) verdicts.push("✅ AAR: Meets 70% target");
  else verdicts.push("❌ AAR: Below 70% target");

  if (Math.abs(bias) < 0.25) verdicts.push("✅ Bias: Neutral");
  else if (bias > 0) verdicts.push("⚠️ Bias: AI is INFLATING scores");
  else verdicts.push("⚠️ Bias: AI is DEFLATING scores");

  console.log("\n  ── VERDICT ──────────────────────────────────────────────────");
  verdicts.forEach((v) => console.log("  " + v));
  console.log("══════════════════════════════════════════════════════════════\n");

  // ─── Output JSON ──────────────────────────────────────────────────────────
  const output = {
    evaluated_at: new Date().toISOString(),
    n_total: records.length,
    n_valid: N,
    metrics: {
      qwk: +qwk.toFixed(4),
      mae: +mae.toFixed(4),
      aar_pct: +aar.toFixed(2),
      emr_pct: +emr.toFixed(2),
      bias: +bias.toFixed(4),
      pearson: {
        overall: +rOverall.toFixed(4),
        tr: +rTR.toFixed(4),
        cc: +rCC.toFixed(4),
        lr: +rLR.toFixed(4),
        gra: +rGRA.toFixed(4),
      },
      per_criterion_mae: {
        tr: +maeTR.toFixed(4),
        cc: +maeCC.toFixed(4),
        lr: +maeLR.toFixed(4),
        gra: +maeGRA.toFixed(4),
      },
    },
    latency: { p50_s: +p50.toFixed(2), p95_s: +p95.toFixed(2) },
    per_case: valid.map((r) => ({
      id: r.id,
      source: GROUND_TRUTH_DATASET.find((g) => g.id === r.id)?.source,
      human: r.human,
      predicted: r.predicted,
      delta_overall: +(r.predicted.overall - r.human.overall).toFixed(1),
      within_half_band: Math.abs(r.predicted.overall - r.human.overall) <= 0.5,
      latency_s: +(r.latencyMs / 1000).toFixed(2),
    })),
    failed_cases: records.filter((r) => r.predicted === null).map((r) => ({
      id: r.id,
      error: r.error,
    })),
  };

  if (OUT_FILE) {
    const outPath = path.resolve(OUT_FILE);
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
    console.log(`💾 Results saved to: ${outPath}`);
  }

  return output;
}

runEvaluation().catch((err) => {
  console.error("💥 Evaluation crashed:", err);
  process.exit(1);
});
