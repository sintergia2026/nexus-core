import { execSync } from "child_process";
import path from "path";

function getScenarioFileName(): string {
  const arg = process.argv[2];
  return arg && arg.trim().length > 0
    ? arg.trim()
    : "sample_restaurant_week_reporting_failure.json";
}

function runStep(label: string, command: string): void {
  console.log("--------------------------------------------------");
  console.log(label);
  console.log("--------------------------------------------------");
  execSync(command, {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
  });
  console.log("");
}

function main(): void {
  const scenarioFile = getScenarioFileName();

  console.log("==================================================");
  console.log("NEXUS PHASE 2 SYSTEM CHECK");
  console.log("==================================================");
  console.log(`Scenario File: ${scenarioFile}`);
  console.log("");

  runStep("STEP 1 — TYPECHECK", "npm run typecheck");
  runStep("STEP 2 — PHASE 1 LOCKED BASELINE", "npm run phase1:contrast");
  runStep("STEP 3 — PHASE 2 CANDIDATE REVIEW", "npm run phase2:candidates");
  runStep("STEP 4 — OUTPUT CONTRACT CHECK", "npm run phase2:contracts-check");
  runStep(
    "STEP 5 — BUNDLE ASSEMBLY",
    `npm run phase2:bundle -- ${scenarioFile}`
  );
  runStep(
    "STEP 6 — BUNDLE CHECK",
    `npm run phase2:bundle-check -- ${scenarioFile}`
  );

  console.log("==================================================");
  console.log("PHASE 2 SYSTEM CHECK PASSED");
  console.log("==================================================");
}

main();