import { selectCrcpQuestionsForSector } from "../05_engine/intake/crcp/crcp_sector_selector";

function main(): void {
  const sector = process.argv[2] ?? "restaurant";
  const selection = selectCrcpQuestionsForSector(sector);

  console.log("==================================================");
  console.log("CRCP QUESTION SELECTION");
  console.log("==================================================");
  console.log(`Sector: ${selection.selection_meta.sector}`);
  console.log(`Identity Questions: ${selection.selection_meta.total_identity_count}`);
  console.log(`Adaptive Questions: ${selection.selection_meta.total_adaptive_count}`);
  console.log(`Cross-Sector Selected: ${selection.selection_meta.cross_sector_count}`);
  console.log(`Sector-Specific Selected: ${selection.selection_meta.sector_specific_count}`);
  console.log(`Total Questions: ${selection.selection_meta.total_count}`);
  console.log(`Covered Domains: ${selection.selection_meta.covered_domains.join(", ")}`);
  console.log("--------------------------------------------------");
  console.log("IDENTITY QUESTIONS");
  console.log("--------------------------------------------------");

  for (const question of selection.identity_questions) {
    console.log(`${question.question_id} | ${question.domain} | ${question.text}`);
  }

  console.log("--------------------------------------------------");
  console.log("ADAPTIVE QUESTIONS");
  console.log("--------------------------------------------------");

  for (const question of selection.adaptive_questions) {
    console.log(
      `${question.question_id} | ${question.domain} | ${question.cross_sector ? "cross" : "sector"} | ${question.text}`
    );
  }

  console.log("==================================================");
}

main();