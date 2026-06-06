/**
 * scripts/cleanup-aae2-skeletons.js
 *
 * Removes incorrectly injected AAE2 entries from vector_store_skeletons.json.
 * AAE2 data belongs in Neo4j (Layer 3), NOT in the Skeleton Vector Store (Layer 4).
 */

const fs = require('fs');
const path = require('path');

const SKELETON_DB_PATH = path.join(__dirname, '../data/vector_store_skeletons.json');

function main() {
  console.log("🧹 Starting cleanup: Removing AAE2 entries from Skeleton Vector Store...");

  if (!fs.existsSync(SKELETON_DB_PATH)) {
    console.log("✅ File not found — nothing to clean.");
    return;
  }

  let skeletons = [];
  try {
    skeletons = JSON.parse(fs.readFileSync(SKELETON_DB_PATH, 'utf-8'));
  } catch (e) {
    console.error("❌ Cannot parse skeletons file:", e.message);
    return;
  }

  const before = skeletons.length;

  // Filter out entries that came from AAE2 (identified by the topic_category field)
  const cleaned = skeletons.filter(s => s.topic_category !== "Golden Argumentation (AAE2)");

  const removed = before - cleaned.length;

  fs.writeFileSync(SKELETON_DB_PATH, JSON.stringify(cleaned, null, 2), 'utf-8');

  console.log(`✅ Done. Removed ${removed} AAE2 entries. Skeletons remaining: ${cleaned.length}`);
}

main();
