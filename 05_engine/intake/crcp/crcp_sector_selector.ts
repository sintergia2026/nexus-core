import { CrcpQuestion } from "../../types/CrcpQuestion";
import { loadCrcpQuestionBank } from "./crcp_question_registry";
import sectorProfiles from "../../../02_contracts/crcp_sector_profiles.json";

type SectorProfile = {
  sector: string;
  priority_domains: string[];
  required_sector_questions: string[];
  preferred_cross_questions?: string[];
  adaptive_question_target: number;
};

type SectorProfileMap = Record<string, SectorProfile>;

export interface CrcpQuestionSelection {
  identityQuestions: string[];
  adaptiveQuestions: string[];
}

const sectorProfilesTyped = sectorProfiles as SectorProfileMap;

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function byWeightDesc(a: CrcpQuestion, b: CrcpQuestion): number {
  return b.weight - a.weight;
}

export function selectCrcpQuestionsForSector(
  sector: string
): CrcpQuestionSelection {
  const questionBank = loadCrcpQuestionBank() as CrcpQuestion[];
  const profile = sectorProfilesTyped[sector];

  if (!profile) {
    throw new Error(`CRCP sector profile not found for sector: ${sector}`);
  }

  const identityQuestions = questionBank
    .filter((q) => q.domain === "identity")
    .sort(byWeightDesc)
    .map((q) => q.question_id);

  const nonIdentityQuestions = questionBank.filter((q) => q.domain !== "identity");

  const crossQuestions = nonIdentityQuestions.filter((q) => q.cross_sector);

  const sectorQuestions = nonIdentityQuestions.filter(
    (q) =>
      !q.cross_sector &&
      Array.isArray(q.applicable_sectors) &&
      q.applicable_sectors.includes(sector)
  );

  const crossQuestionIds = new Set(crossQuestions.map((q) => q.question_id));
  const sectorQuestionIds = new Set(sectorQuestions.map((q) => q.question_id));

  const requiredSector = (profile.required_sector_questions ?? []).filter((id) =>
    sectorQuestionIds.has(id)
  );

  const preferredCross = (profile.preferred_cross_questions ?? []).filter((id) =>
    crossQuestionIds.has(id)
  );

  const prioritizedCross = crossQuestions
    .filter(
      (q) =>
        profile.priority_domains.includes(q.domain) &&
        !preferredCross.includes(q.question_id)
    )
    .sort(byWeightDesc)
    .map((q) => q.question_id);

  const remainingSector = sectorQuestions
    .filter((q) => !requiredSector.includes(q.question_id))
    .sort(byWeightDesc)
    .map((q) => q.question_id);

  const remainingCross = crossQuestions
    .filter(
      (q) =>
        !preferredCross.includes(q.question_id) &&
        !prioritizedCross.includes(q.question_id)
    )
    .sort(byWeightDesc)
    .map((q) => q.question_id);

  const candidateAdaptive = unique([
    ...requiredSector,
    ...preferredCross,
    ...prioritizedCross,
    ...remainingSector,
    ...remainingCross,
  ]);

  const adaptiveQuestions = candidateAdaptive.slice(
    0,
    profile.adaptive_question_target || 42
  );

  return {
    identityQuestions,
    adaptiveQuestions,
  };
}