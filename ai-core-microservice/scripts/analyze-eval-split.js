/**
 * scripts/analyze-eval-split.js
 *
 * name: Evaluation Split-Metrics Analyzer
 * description: Reads eval_results.json and produces academically honest
 *   performance metrics split by data group:
 *     Group A — GT_001 to GT_020: standard band range test (4.0–8.5).
 *               These are the cases that ran through the full engine pipeline.
 *     Group B — GT_021 to GT_030: high-band ceiling test (7.5–8.5).
 *               Added for ceiling-effect analysis; should be reported separately.
 *
 *   Combined metrics that mix Groups A and B inflate QWK and AAR because
 *   Group B has zero delta by design (or by data leakage). This script
 *   surfaces that split transparently for the thesis defense committee.
 *
 * Usage:
 *   node scripts/analyze-eval-split.js
 *   node scripts/analyze-eval-split.js --input ./eval_results.json
 */

const path = require('path');
const fs   = require('fs');

// ─── Config ──────────────────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const inputIdx  = args.indexOf('--input');
const inputPath = inputIdx !== -1
  ? args[inputIdx + 1]
  : path.join(__dirname, '../eval_results.json');

// ─── QWK Helper ──────────────────────────────────────────────────────────────
/**
 * Compute Quadratic Weighted Kappa between two arrays of scores.
 * Scores are scaled to integer bins of 0.5 steps in range [1, 9].
 *
 * @param {number[]} humanScores
 * @param {number[]} predScores
 * @returns {number} QWK in [-1, 1]
 */
function computeQWK(humanScores, predScores) {
  const n       = humanScores.length;
  if (n === 0) return NaN;

  // Convert to bin indices: band 1.0 → 0, 1.5 → 1, … 9.0 → 16
  const toBin = s => Math.round((s - 1.0) / 0.5);
  const maxBin = 16; // 9.0 → bin 16
  const numBins = maxBin + 1;

  const W = Array.from({ length: numBins }, (_, i) =>
    Array.from({ length: numBins }, (_, j) => ((i - j) ** 2) / (maxBin ** 2))
  );

  // Observed matrix O
  const O = Array.from({ length: numBins }, () => new Array(numBins).fill(0));
  for (let k = 0; k < n; k++) {
    const i = toBin(humanScores[k]);
    const j = toBin(predScores[k]);
    if (i >= 0 && i < numBins && j >= 0 && j < numBins) O[i][j]++;
  }

  // Marginals
  const hMarg = new Array(numBins).fill(0);
  const pMarg = new Array(numBins).fill(0);
  for (let i = 0; i < numBins; i++)
    for (let j = 0; j < numBins; j++) {
      hMarg[i] += O[i][j];
      pMarg[j] += O[i][j];
    }

  // Expected matrix E
  const E = Array.from({ length: numBins }, (_, i) =>
    Array.from({ length: numBins }, (_, j) => (hMarg[i] * pMarg[j]) / n)
  );

  let numW = 0, denW = 0;
  for (let i = 0; i < numBins; i++)
    for (let j = 0; j < numBins; j++) {
      numW += W[i][j] * O[i][j];
      denW += W[i][j] * E[i][j];
    }

  return denW === 0 ? 1.0 : 1.0 - numW / denW;
}

/**
 * Compute Pearson correlation between two arrays.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function pearson(a, b) {
  const n = a.length;
  if (n < 2) return NaN;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - meanA) * (b[i] - meanB);
    da  += (a[i] - meanA) ** 2;
    db  += (b[i] - meanB) ** 2;
  }
  return (da === 0 || db === 0) ? NaN : num / Math.sqrt(da * db);
}

/**
 * Compute all metrics for a set of per-case results.
 *
 * @param {Object[]} cases - Array of per_case entries from eval_results.json
 * @returns {Object} metrics summary
 */
function computeMetrics(cases) {
  if (cases.length === 0) return { n: 0 };

  const human   = cases.map(c => c.human.overall);
  const pred    = cases.map(c => c.predicted.overall);
  const deltas  = cases.map(c => c.delta_overall);
  const latency = cases.map(c => c.latency_s).filter(v => typeof v === 'number');

  const mae  = deltas.reduce((s, d) => s + Math.abs(d), 0) / deltas.length;
  const bias = deltas.reduce((s, d) => s + d, 0) / deltas.length;
  const aar  = cases.filter(c => c.within_half_band).length / cases.length * 100;
  const emr  = cases.filter(c => c.delta_overall === 0).length / cases.length * 100;
  const qwk  = computeQWK(human, pred);

  // Per-criterion MAE
  const criteria = ['tr', 'cc', 'lr', 'gra'];
  const criteriaMap = { tr: 'tr', cc: 'cc', lr: 'lr', gra: 'gra' };
  const perCritMAE = {};
  for (const crit of criteria) {
    const diffs = cases.map(c => {
      const h = c.human[crit];
      const p = c.predicted[crit];
      return (typeof h === 'number' && typeof p === 'number') ? Math.abs(h - p) : null;
    }).filter(v => v !== null);
    perCritMAE[crit] = diffs.length > 0
      ? parseFloat((diffs.reduce((s, v) => s + v, 0) / diffs.length).toFixed(3))
      : null;
  }

  // Pearson per criterion
  const perCritPearson = {};
  for (const crit of criteria) {
    const h = cases.map(c => c.human[crit]).filter(v => typeof v === 'number');
    const p = cases.map(c => c.predicted[crit]).filter(v => typeof v === 'number');
    perCritPearson[crit] = h.length >= 2 ? parseFloat(pearson(h, p).toFixed(4)) : null;
  }

  const p50  = latency.length > 0 ? latency.sort((a, b) => a - b)[Math.floor(latency.length * 0.5)] : null;
  const p95  = latency.length > 0 ? latency[Math.floor(latency.length * 0.95)] : null;

  return {
    n:    cases.length,
    qwk:  parseFloat(qwk.toFixed(4)),
    mae:  parseFloat(mae.toFixed(3)),
    bias: parseFloat(bias.toFixed(3)),
    aar_pct: parseFloat(aar.toFixed(1)),
    emr_pct: parseFloat(emr.toFixed(1)),
    pearson_overall: parseFloat(pearson(human, pred).toFixed(4)),
    per_criterion_mae:    perCritMAE,
    per_criterion_pearson: perCritPearson,
    latency: p50 !== null ? { p50_s: p50, p95_s: p95 } : null,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  const raw  = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const all  = raw.per_case || [];

  // Split groups
  // Group A: real pipeline cases (GT_001 – GT_020)
  const groupA = all.filter(c => {
    const num = parseInt(c.id.replace('GT_', ''), 10);
    return num >= 1 && num <= 20;
  });

  // Group B: high-band ceiling cases (GT_021 – GT_030)
  // NOTE: These may have predicted=human if the pipeline was not re-run on them.
  // Report their delta=0 rate as a DATA INTEGRITY WARNING, not as a performance metric.
  const groupB = all.filter(c => {
    const num = parseInt(c.id.replace('GT_', ''), 10);
    return num >= 21 && num <= 30;
  });

  const metricsA = computeMetrics(groupA);
  const metricsB = computeMetrics(groupB);
  const metricsAll = computeMetrics(all);

  // Data integrity check for Group B
  const groupBZeroDelta = groupB.filter(c => c.delta_overall === 0).length;
  const groupBDataWarning = groupBZeroDelta === groupB.length
    ? 'WARNING: ALL Group B cases have delta_overall=0. This indicates predicted scores were ' +
      'manually set equal to human scores (or engine was not re-run on these cases). ' +
      'Group B metrics MUST NOT be combined with Group A for QWK/MAE reporting.'
    : groupBZeroDelta >= groupB.length * 0.8
    ? 'CAUTION: Over 80% of Group B cases have delta_overall=0. Verify pipeline was run on these cases.'
    : 'OK: Group B shows natural score variation.';

  // Output report
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  IELTS AI Scoring — Split Evaluation Metrics Report');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`  Source: ${inputPath}`);
  console.log(`  Total cases: ${all.length} (Group A: ${groupA.length}, Group B: ${groupB.length})`);

  console.log('\n─── GROUP A — Standard Test Set (GT_001–020) ────────────────');
  console.log(`  ⚠️  USE THESE METRICS FOR THESIS REPORTING`);
  console.log(`  N:                ${metricsA.n}`);
  console.log(`  QWK:              ${metricsA.qwk}`);
  console.log(`  MAE (overall):    ${metricsA.mae}`);
  console.log(`  Bias:             ${metricsA.bias} (negative = under-score)`);
  console.log(`  AAR (±0.5 band):  ${metricsA.aar_pct}%`);
  console.log(`  EMR (exact match):${metricsA.emr_pct}%`);
  console.log(`  Pearson (overall):${metricsA.pearson_overall}`);
  console.log('  Per-criterion MAE:');
  for (const [k, v] of Object.entries(metricsA.per_criterion_mae)) {
    console.log(`    ${k.toUpperCase().padEnd(5)}: MAE=${v}  Pearson=${metricsA.per_criterion_pearson[k]}`);
  }
  if (metricsA.latency) {
    console.log(`  Latency P50:      ${metricsA.latency.p50_s}s`);
    console.log(`  Latency P95:      ${metricsA.latency.p95_s}s`);
  }

  console.log('\n─── GROUP B — High-Band Ceiling Set (GT_021–030) ────────────');
  console.log(`  ⚠️  DATA INTEGRITY: ${groupBDataWarning}`);
  console.log(`  N:                ${metricsB.n}`);
  console.log(`  Cases with delta=0: ${groupBZeroDelta}/${groupB.length}`);
  console.log(`  QWK (if valid):   ${metricsB.qwk}`);
  console.log(`  MAE (if valid):   ${metricsB.mae}`);
  console.log(`  Bias (if valid):  ${metricsB.bias}`);

  console.log('\n─── COMBINED (informational only) ───────────────────────────');
  console.log(`  N:                ${metricsAll.n}`);
  console.log(`  QWK:              ${metricsAll.qwk}`);
  console.log(`  MAE (overall):    ${metricsAll.mae}`);
  console.log(`  AAR (±0.5 band):  ${metricsAll.aar_pct}%`);
  console.log('  ⚠️  Combined QWK/MAE is inflated if Group B has delta=0. Use Group A metrics for defense.');

  // Write JSON report
  const reportPath = path.join(path.dirname(inputPath), 'eval_split_metrics.json');
  const report = {
    generated_at: new Date().toISOString(),
    source_file:  inputPath,
    group_a: {
      label: 'Standard Test Set — GT_001 to GT_020',
      description: 'Cases that ran through the full pipeline. Use these for thesis QWK/MAE reporting.',
      case_ids: groupA.map(c => c.id),
      metrics: metricsA,
    },
    group_b: {
      label: 'High-Band Ceiling Set — GT_021 to GT_030',
      description: 'Added for ceiling-effect analysis. Data integrity must be verified before reporting.',
      case_ids: groupB.map(c => c.id),
      data_integrity_warning: groupBDataWarning,
      zero_delta_count: groupBZeroDelta,
      metrics: metricsB,
    },
    combined: {
      label: 'All cases — informational only',
      warning: 'Do not use combined metrics if Group B has delta=0 leakage.',
      metrics: metricsAll,
    },
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n  Report saved to: ${reportPath}`);
  console.log('════════════════════════════════════════════════════════════\n');
}

main();
