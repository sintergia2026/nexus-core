import fs from "fs";
import path from "path";
import { CrcpQuestion } from "../../types/CrcpQuestion";

function getContractsPath(filename: string): string {
  return path.resolve(__dirname, "../../../02_contracts", filename);
}

export function loadCrcpQuestionBank(): CrcpQuestion[] {
  const filePath = getContractsPath("crcp_question_bank.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as CrcpQuestion[];
}

export interface CrcpSectorProfile {
  domains_priority: string[];
  question_mix: {
    cross_sector: number;
    sector_specific: number;
  };
}

export function loadCrcpSectorProfiles(): Record<string, CrcpSectorProfile> {
  const filePath = getContractsPath("crcp_sector_profiles.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Record<string, CrcpSectorProfile>;
}