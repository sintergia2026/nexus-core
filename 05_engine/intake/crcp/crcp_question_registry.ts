import fs from "fs";
import path from "path";

export type CrcpQuestion = {
  question_id: string;
  text: string;
  domain: string;
  subdomain: string;
  type: string;
  weight: number;
  cross_sector: boolean;
  applicable_sectors: string[];
};

function resolveRepoRoot(): string {
  return path.resolve(process.cwd(), "..", "..");
}

export function loadCrcpQuestionBank(): CrcpQuestion[] {
  const repoRoot = resolveRepoRoot();
  const questionBankPath = path.join(
    repoRoot,
    "02_contracts",
    "crcp_question_bank.json"
  );

  const raw = fs.readFileSync(questionBankPath, "utf-8");
  return JSON.parse(raw) as CrcpQuestion[];
}