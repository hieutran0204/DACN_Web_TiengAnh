/**
 * scripts/calibrate_cliche_threshold.js
 *
 * Calibration script for Cliché Density thresholds in BandConstraintEngine.
 * Runs detectClichePhrases() on 10 representative IELTS essays spanning Band 5-8.
 *
 * Usage: node scripts/calibrate_cliche_threshold.js
 *
 * Output: Density table per essay + recommended threshold values.
 */

const ruleBasedService = require('../services/nlp/rule-based.service');

// ─────────────────────────────────────────────────────────────────────────────
// 10 Representative IELTS Task 2 essays (2-3 paragraphs each, ~200-280 words)
// Band labels are based on typical examiner judgments for this writing profile.
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLE_ESSAYS = [
  {
    band: 5.0,
    label: "Band 5 — Heavy Template",
    text: `In today's society, technology plays a major role in our daily lives. On the one hand, it has many advantages. On the other hand, it also has many disadvantages. In my opinion, technology is both good and bad for society.

Firstly, technology helps people communicate with each other. For example, people can use smartphones to call their family and friends. Furthermore, the internet allows people to access information easily. Another advantage is that technology saves time. People can do many things faster with technology.

However, technology also has negative effects. Firstly, people spend too much time on their phones. Secondly, children do not play outside anymore. Another point is that technology causes health problems. In conclusion, I strongly believe that technology has both positive and negative impacts. The government should take measures to solve this problem and raise awareness about the dangers of technology.`
  },
  {
    band: 5.5,
    label: "Band 5.5 — Template + Some Ideas",
    text: `Nowadays, many people believe that education is very important for economic development. In today's world, getting a good education is considered essential for a successful life. This essay will discuss both the advantages and disadvantages of this view.

On the one hand, education provides people with knowledge and skills. Firstly, educated people can find better jobs. Secondly, education helps people think critically. Furthermore, a well-educated population contributes to economic growth. Another reason is that education reduces poverty.

On the other hand, not everyone has access to quality education. Moreover, the cost of education is very high. In addition, some people argue that practical skills are more important than academic knowledge. In conclusion, to sum up, education is very important but the government should make it more accessible to everyone. They should take steps to address this issue and solve this problem.`
  },
  {
    band: 6.0,
    label: "Band 6 — Moderate Template Use",
    text: `The question of whether young people should pursue higher education or enter the workforce immediately after school is increasingly debated. While there are clear benefits to gaining work experience early, I believe that a university education remains a valuable investment.

Those who advocate for early employment argue that hands-on experience is irreplaceable. Furthermore, earning money at a young age allows individuals to become financially independent sooner. On the other hand, university graduates tend to have access to a wider range of career opportunities. Moreover, the academic environment fosters critical thinking and problem-solving abilities that are valued by employers.

However, it is important to acknowledge that university is not the right path for everyone. Some individuals thrive in vocational training programs that directly prepare them for specific careers. In conclusion, the decision should be based on individual circumstances, but higher education generally offers advantages that extend beyond technical skills alone.`
  },
  {
    band: 6.5,
    label: "Band 6.5 — Mostly Natural with Some Clichés",
    text: `Urban migration has accelerated in recent decades, placing enormous pressure on infrastructure and housing in major cities. While this trend reflects genuine economic opportunity, it raises serious questions about sustainability and quality of life for residents.

The primary driver of rural-to-urban movement is employment. Cities concentrate industries and services, offering wages that agricultural communities simply cannot match. However, this concentration creates significant strain: public transport systems buckle under demand, housing becomes unaffordable, and social services struggle to keep pace. Furthermore, rapid urbanization often means that green spaces are sacrificed for development.

Despite these challenges, many argue that dense cities are actually more efficient — they consume less energy per capita and enable innovation through proximity. A more balanced approach, rather than attempting to reverse migration, would involve investing in secondary cities and improving rural infrastructure. This could distribute growth more equitably while preserving both urban vitality and rural communities.`
  },
  {
    band: 7.0,
    label: "Band 7 — Natural Flow, Few Clichés",
    text: `The growing prevalence of remote work arrangements has fundamentally altered the relationship between employers and employees. While this shift offers undeniable flexibility, it introduces complexities that organisations are only beginning to understand.

Proponents of remote work rightly point to productivity gains observed in many sectors. Without daily commutes, employees recover time previously lost to transit, often channelling it into professional output. Additionally, geographical barriers dissolve, enabling organisations to recruit from a global talent pool. The environmental benefits of reduced commuting are also substantial.

Yet sustained remote work carries hidden costs. The informal exchange of ideas that occurs naturally in shared physical spaces — often called "water cooler conversations" — is remarkably difficult to replicate digitally. Junior employees, in particular, miss critical mentoring interactions that typically happen organically on-site. There is also a documented risk of professional isolation, which can erode long-term motivation. Rather than adopting a binary approach, forward-thinking organisations are exploring hybrid models that preserve the benefits of both arrangements while mitigating their respective drawbacks.`
  },
  {
    band: 7.5,
    label: "Band 7.5 — Sophisticated, Minimal Clichés",
    text: `Biodiversity loss has emerged as one of the defining environmental challenges of our era, yet it receives considerably less public attention than climate change despite being deeply intertwined with it. Understanding why ecosystems matter — and why their degradation is irreversible — is essential for crafting effective conservation policy.

Ecosystems function as interconnected webs in which the removal of even a seemingly minor species can trigger cascading consequences. The decline of pollinators, for instance, threatens agricultural systems that underpin global food security. Similarly, coastal wetlands buffer communities against storm surges; their destruction amplifies flood risk far more effectively than any structural engineering solution could address.

The economic case for biodiversity preservation is equally compelling. Pharmaceutical research derives an estimated forty percent of its compounds from natural organisms — a figure that understates future potential. Rather than treating nature as an externality to be managed after economic decisions are made, policymakers must integrate ecological value into national accounting systems. This requires not incremental reform but a fundamental reconceptualisation of what constitutes wealth.`
  },
  {
    band: 8.0,
    label: "Band 8 — Examiner-Level, Virtually No Clichés",
    text: `The proposition that artificial intelligence will render human labour obsolete rests on a misreading of both technological history and the nature of work itself. While automation has consistently displaced specific task categories, it has simultaneously generated new forms of economic activity — a dynamic that shows little sign of reversing.

Historical precedent offers instructive context. The mechanisation of agriculture reduced the farm workforce from the majority of populations to a small fraction, yet employment did not collapse. Instead, displaced workers gradually absorbed into manufacturing, services, and eventually knowledge industries that did not exist prior to mechanisation. This adaptive capacity of labour markets, while painful in transitional periods, has proven remarkably durable.

What distinguishes contemporary AI is its incursion into cognitive domains previously considered beyond automation — legal analysis, medical imaging interpretation, financial modelling. This development warrants serious attention rather than dismissal. However, the more nuanced question is not whether AI will perform specific tasks better than humans, but whether the complementary skills that remain uniquely human — ethical judgment, contextual creativity, genuine relationship-building — will retain economic value. Evidence strongly suggests they will, not because nostalgia demands it, but because the most consequential decisions increasingly require precisely these capacities.`
  },
  {
    band: 6.0,
    label: "Band 6 — Second Sample (Different Topic)",
    text: `Some people think that children should learn a foreign language from a very young age, while others believe it is better to wait until they are older. This essay will discuss both views and give my opinion.

In today's world, learning a foreign language at an early age has many advantages. Firstly, children learn languages more easily than adults because their brains are more flexible. Secondly, being bilingual can improve children's cognitive abilities. Furthermore, it gives them better job opportunities in the future. On the other hand, some argue that focusing on the native language first is more important.

However, I strongly agree that children should learn foreign languages early. In conclusion, the benefits outweigh the disadvantages. The government should take steps to introduce foreign languages in primary schools. This is a major advantage for children's development and will have positive effects on society as a whole.`
  },
  {
    band: 7.0,
    label: "Band 7 — Second Sample (Social Topic)",
    text: `Volunteering has traditionally been viewed as a civic virtue — something performed out of genuine altruism without expectation of reward. The recent rise of "voluntourism," in which travellers pay to participate in charitable projects abroad, complicates this picture considerably.

Critics of voluntourism raise legitimate structural concerns. When unskilled volunteers are placed in roles that require professional expertise — teaching, construction, or healthcare — the short-term presence of well-intentioned outsiders can actively impede local capacity-building. Communities become accustomed to receiving external assistance rather than developing sustainable internal mechanisms. The economics are also questionable: the fees paid by volunteers often cover operational costs that could, alternatively, fund the employment of qualified local professionals.

Defenders argue that voluntourism builds cross-cultural empathy and fosters long-term commitment to global issues among participants who return home as advocates. There is validity to this claim when programs are well-designed. The critical distinction lies in whether the primary beneficiary of the experience is the host community or the volunteer. Responsible voluntourism programs orient their design around the former, treating participant enrichment as a by-product rather than the objective.`
  },
  {
    band: 5.5,
    label: "Band 5.5 — Second Sample (Technology Topic)",
    text: `Nowadays, social media has become a very important part of our daily lives. In today's society, people use social media to communicate, share information and entertain themselves. On the one hand, social media has many benefits. On the other hand, it also has many negative effects.

Firstly, social media helps people stay connected with their family and friends. Another advantage is that it allows people to access news and information quickly. Furthermore, businesses use social media to promote their products. However, social media also has many disadvantages. For example, people spend too much time on social media. Secondly, it can spread false information. In addition, young people may become addicted to social media.

In conclusion, I believe that social media is both good and bad. It is important for people to use social media responsibly. The government should raise awareness about the negative effects of social media and take measures to solve this problem. Both individuals and society should work together to address this issue.`
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Run calibration
// ─────────────────────────────────────────────────────────────────────────────
console.log("=".repeat(80));
console.log("  CLICHÉ DENSITY CALIBRATION REPORT");
console.log("  Running detectClichePhrases() on 10 representative IELTS essays");
console.log("=".repeat(80));
console.log("");

const results = [];

for (const sample of SAMPLE_ESSAYS) {
  const wordCount = (sample.text.match(/\b\w+\b/g) || []).length;
  const report = ruleBasedService.detectClichePhrases(sample.text);

  results.push({
    band: sample.band,
    label: sample.label,
    wordCount,
    density: report.density,
    total: report.total,
    mechanical: report.counts.MECHANICAL,
    template: report.counts.TEMPLATE,
    collocation: report.counts.COLLOCATION,
    has_mechanical: report.has_mechanical_transitions,
    detected: report.detected.map(d => `${d.phrase}(×${d.frequency})`).join(', ')
  });
}

// Sort by band
results.sort((a, b) => a.band - b.band);

// Print table
console.log("Band  | Density/100w | Mech | Tmpl | Coll | Total | Words | has_mech");
console.log("-".repeat(80));
for (const r of results) {
  console.log(
    `${r.band.toFixed(1)}   | ${r.density.toString().padEnd(12)} | ${r.mechanical.toString().padEnd(4)} | ${r.template.toString().padEnd(4)} | ${r.collocation.toString().padEnd(4)} | ${r.total.toString().padEnd(5)} | ${r.wordCount.toString().padEnd(5)} | ${r.has_mechanical}`
  );
}

// Compute averages per band group
console.log("\n" + "=".repeat(80));
console.log("  DENSITY STATISTICS BY BAND GROUP");
console.log("=".repeat(80));

const groups = {
  "Band 5.x": results.filter(r => r.band < 6.0),
  "Band 6.x": results.filter(r => r.band >= 6.0 && r.band < 7.0),
  "Band 7.x": results.filter(r => r.band >= 7.0 && r.band < 8.0),
  "Band 8.x": results.filter(r => r.band >= 8.0)
};

for (const [group, items] of Object.entries(groups)) {
  if (items.length === 0) continue;
  const avgDensity = items.reduce((s, r) => s + r.density, 0) / items.length;
  const maxDensity = Math.max(...items.map(r => r.density));
  const minDensity = Math.min(...items.map(r => r.density));
  console.log(`\n${group} (n=${items.length}):`);
  console.log(`  Avg density: ${avgDensity.toFixed(2)} | Min: ${minDensity} | Max: ${maxDensity}`);
}

// Threshold recommendation
console.log("\n" + "=".repeat(80));
console.log("  THRESHOLD RECOMMENDATION (based on data above)");
console.log("=".repeat(80));

const band5Densities = results.filter(r => r.band < 6.0).map(r => r.density);
const band6Densities = results.filter(r => r.band >= 6.0 && r.band < 7.0).map(r => r.density);
const band7Densities = results.filter(r => r.band >= 7.0 && r.band < 8.0).map(r => r.density);

const band5Avg = band5Densities.reduce((a, b) => a + b, 0) / (band5Densities.length || 1);
const band6Avg = band6Densities.reduce((a, b) => a + b, 0) / (band6Densities.length || 1);
const band7Avg = band7Densities.reduce((a, b) => a + b, 0) / (band7Densities.length || 1);

// Set thresholds at midpoints between bands
const highThreshold = parseFloat(((band5Avg + band6Avg) / 2).toFixed(1));
const medThreshold = parseFloat(((band6Avg + band7Avg) / 2).toFixed(1));
const lowThreshold = parseFloat((band7Avg * 1.2).toFixed(1)); // slightly above Band 7 avg

console.log(`\nBased on sample data:`);
console.log(`  Band 5 avg density: ${band5Avg.toFixed(2)}`);
console.log(`  Band 6 avg density: ${band6Avg.toFixed(2)}`);
console.log(`  Band 7 avg density: ${band7Avg.toFixed(2)}`);
console.log(`\nRecommended thresholds for band-constraint.engine.js:`);
console.log(`  HIGH   (≥ ${highThreshold}): CC/GRA/LR ≤ 5.5  [Band 5-ish essays]`);
console.log(`  MEDIUM (≥ ${medThreshold}): CC/GRA ≤ 6.0    [Band 6-ish essays]`);
console.log(`  LOW    (≥ ${lowThreshold} + mechanical): CC ≤ 6.5   [Band 6.5-ish essays]`);
console.log(`\n✅ Calibration complete. Update band-constraint.engine.js with these values.`);
