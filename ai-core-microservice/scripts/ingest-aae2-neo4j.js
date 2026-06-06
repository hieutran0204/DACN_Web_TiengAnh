/**
 * scripts/ingest-aae2-neo4j.js
 *
 * Ingests AAE2 Golden Argumentation Triplets into Neo4j (Layer 3) as GoldenPattern nodes.
 *
 * Graph Schema:
 *   (GoldenPattern:Claim {text, source:"AAE2"}) -[:SUPPORTS]-> (GoldenPattern:Evidence {text})
 *
 * Purpose: Provides deterministic argumentation patterns so Layer 3 Coherence Scan
 * can detect missing Evidence (Unsupported Claims) by comparing against these golden patterns.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const neo4jDriver = require('../database/neo4j');

const AAE_JSON_PATH = path.join(__dirname, '../data/aae_golden_graph.json');

async function ingestTriplet(session, triplet, essayId) {
  const { subject, relationship, object: obj } = triplet;

  // Merge subject node as GoldenPattern with its argumentation role label
  await session.run(
    `MERGE (sub:GoldenPattern {text: $subText, source: "AAE2", essayId: $essayId})
     SET sub.role = $subLabel, sub.createdAt = timestamp()`,
    { subText: subject.name, subLabel: subject.label, essayId }
  );

  // Merge object node
  await session.run(
    `MERGE (obj:GoldenPattern {text: $objText, source: "AAE2", essayId: $essayId})
     SET obj.role = $objLabel, obj.createdAt = timestamp()`,
    { objText: obj.name, objLabel: obj.label, essayId }
  );

  // Create the relationship (SUPPORTS or ATTACKS)
  const relType = relationship === 'ATTACKS' ? 'ATTACKS' : 'SUPPORTS';
  await session.run(
    `MATCH (sub:GoldenPattern {text: $subText, essayId: $essayId})
     MATCH (obj:GoldenPattern {text: $objText, essayId: $essayId})
     MERGE (sub)-[:${relType} {source: "AAE2"}]->(obj)`,
    { subText: subject.name, objText: obj.name, essayId }
  );
}

async function main() {
  console.log("🚀 Ingesting AAE2 Golden Triplets into Neo4j (Layer 3)...");

  if (!fs.existsSync(AAE_JSON_PATH)) {
    console.error("❌ File not found: aae_golden_graph.json");
    console.log("👉 Run 'python scripts/fetch_aae2_golden.py' first.");
    process.exit(1);
  }

  const goldenData = JSON.parse(fs.readFileSync(AAE_JSON_PATH, 'utf-8'));
  console.log(`✅ Loaded ${goldenData.length} essays from aae_golden_graph.json`);

  const session = neo4jDriver.session();
  let totalTriplets = 0;

  try {
    // Create uniqueness constraint once
    await session.run(
      `CREATE CONSTRAINT golden_pattern_unique IF NOT EXISTS
       FOR (n:GoldenPattern) REQUIRE (n.text, n.essayId) IS UNIQUE`
    ).catch(() => {
      // Constraint may already exist — safe to ignore
    });

    for (const essay of goldenData) {
      if (!essay.triplets || essay.triplets.length === 0) continue;

      for (const triplet of essay.triplets) {
        await ingestTriplet(session, triplet, essay.essayId);
        totalTriplets++;
      }

      console.log(`  ✓ Essay [${essay.essayId}]: ${essay.triplets.length} triplets ingested.`);
    }
  } catch (err) {
    console.error("❌ Neo4j Ingest Error:", err.message);
  } finally {
    await session.close();
    await neo4jDriver.close();
  }

  console.log(`\n🎉 Done! Total triplets ingested into Neo4j: ${totalTriplets}`);
  console.log("📊 You can now verify in Neo4j Browser:");
  console.log("   MATCH (n:GoldenPattern) RETURN n LIMIT 25");
  process.exit(0);
}

main();
