import { CrcpQuestion } from "../../types/CrcpQuestion";
import {
  CrcpSectorProfile,
  loadCrcpQuestionBank,
  loadCrcpSectorProfiles,
} from "./crcp_question_registry";

export interface CrcpQuestionSelection {
  identity_questions: CrcpQuestion[];
  adaptive_questions: CrcpQuestion[];
  all_questions: CrcpQuestion[];
  selection_meta: {
    sector: string;
    cross_sector_count: number;
    sector_specific_count: number;
    total_identity_count: number;
    total_adaptive_count: number;
    total_count: number;
    covered_domains: string[];
  };
}

const IDENTITY_DOMAIN = "identity";
const FIXED_IDENTITY_COUNT = 8;
const FIXED_ADAPTIVE_COUNT = 42;

function sortByWeightDesc(left: CrcpQuestion, right: CrcpQuestion): number {
  return right.weight - left.weight;
}

function uniqueByQuestionId(questions: CrcpQuestion[]): CrcpQuestion[] {
  const seen = new Set<string>();
  return questions.filter((question) => {
    if (seen.has(question.question_id)) {
      return false;
    }
    seen.add(question.question_id);
    return true;
  });
}

function takeByDomainPriority(
  questions: CrcpQuestion[],
  profile: CrcpSectorProfile,
  limit: number
): CrcpQuestion[] {
  const selected: CrcpQuestion[] = [];
  const used = new Set<string>();

  for (const domain of profile.domains_priority) {
    const domainQuestions = questions
      .filter((question) => question.domain === domain)
      .sort(sortByWeightDesc);

    for (const question of domainQuestions) {
      if (selected.length >= limit) {
        return selected;
      }

      if (used.has(question.question_id)) {
        continue;
      }

      selected.push(question);
      used.add(question.question_id);
    }
  }

  const fallbackQuestions = [...questions].sort(sortByWeightDesc);

  for (const question of fallbackQuestions) {
    if (selected.length >= limit) {
      break;
    }

    if (used.has(question.question_id)) {
      continue;
    }

    selected.push(question);
    used.add(question.question_id);
  }

  return selected;
}

function ensureMinimumDomainCoverage(
  selected: CrcpQuestion[],
  candidatePool: CrcpQuestion[],
  requiredDomains: string[]
): CrcpQuestion[] {
  const selectedDomains = new Set(selected.map((question) => question.domain));
  const usedIds = new Set(selected.map((question) => question.question_id));
  const result = [...selected];

  for (const domain of requiredDomains) {
    if (selectedDomains.has(domain)) {
      continue;
    }

    const replacement = candidatePool
      .filter(
        (question) =>
          question.domain === domain && !usedIds.has(question.question_id)
      )
      .sort(sortByWeightDesc)[0];

    if (!replacement) {
      continue;
    }

    result.push(replacement);
    usedIds.add(replacement.question_id);
    selectedDomains.add(domain);
  }

  return uniqueByQuestionId(result);
}

function topUpToRequiredCount(
  selected: CrcpQuestion[],
  crossSectorPool: CrcpQuestion[],
  sectorSpecificPool: CrcpQuestion[],
  profile: CrcpSectorProfile,
  requiredCount: number
): CrcpQuestion[] {
  const result = [...selected];
  const usedIds = new Set(result.map((question) => question.question_id));

  const prioritizedFallback = [...crossSectorPool, ...sectorSpecificPool].sort(
    (left, right) => {
      const leftPriority = profile.domains_priority.indexOf(left.domain);
      const rightPriority = profile.domains_priority.indexOf(right.domain);

      const normalizedLeft = leftPriority === -1 ? 999 : leftPriority;
      const normalizedRight = rightPriority === -1 ? 999 : rightPriority;

      if (normalizedLeft !== normalizedRight) {
        return normalizedLeft - normalizedRight;
      }

      return right.weight - left.weight;
    }
  );

  for (const question of prioritizedFallback) {
    if (result.length >= requiredCount) {
      break;
    }

    if (usedIds.has(question.question_id)) {
      continue;
    }

    result.push(question);
    usedIds.add(question.question_id);
  }

  return result;
}

export function selectCrcpQuestionsForSector(
  sector: string
): CrcpQuestionSelection {
  const bank = loadCrcpQuestionBank();
  const profiles = loadCrcpSectorProfiles();
  const profile = profiles[sector];

  if (!profile) {
    throw new Error(`CRCP sector profile not found for sector: ${sector}`);
  }

  const identityQuestions = bank
    .filter((question) => question.domain === IDENTITY_DOMAIN)
    .sort((a, b) => a.question_id.localeCompare(b.question_id))
    .slice(0, FIXED_IDENTITY_COUNT);

  const crossSectorPool = bank.filter(
    (question) =>
      question.domain !== IDENTITY_DOMAIN && question.cross_sector === true
  );

  const sectorSpecificPool = bank.filter(
    (question) =>
      question.domain !== IDENTITY_DOMAIN &&
      question.cross_sector === false &&
      question.applicable_sectors.includes(sector)
  );

  const selectedCrossSector = takeByDomainPriority(
    crossSectorPool,
    profile,
    profile.question_mix.cross_sector
  );

  const selectedSectorSpecific = takeByDomainPriority(
    sectorSpecificPool,
    profile,
    profile.question_mix.sector_specific
  );

  let adaptiveQuestions = uniqueByQuestionId([
    ...selectedCrossSector,
    ...selectedSectorSpecific,
  ]);

  adaptiveQuestions = ensureMinimumDomainCoverage(
    adaptiveQuestions,
    [...crossSectorPool, ...sectorSpecificPool],
    profile.domains_priority
  );

  adaptiveQuestions = topUpToRequiredCount(
    adaptiveQuestions,
    crossSectorPool,
    sectorSpecificPool,
    profile,
    FIXED_ADAPTIVE_COUNT
  );

  adaptiveQuestions = adaptiveQuestions
    .sort((left, right) => {
      const leftPriority = profile.domains_priority.indexOf(left.domain);
      const rightPriority = profile.domains_priority.indexOf(right.domain);

      if (leftPriority !== rightPriority) {
        const normalizedLeft = leftPriority === -1 ? 999 : leftPriority;
        const normalizedRight = rightPriority === -1 ? 999 : rightPriority;
        return normalizedLeft - normalizedRight;
      }

      return right.weight - left.weight;
    })
    .slice(0, FIXED_ADAPTIVE_COUNT);

  const allQuestions = [...identityQuestions, ...adaptiveQuestions];
  const coveredDomains = Array.from(
    new Set(adaptiveQuestions.map((question) => question.domain))
  );

  return {
    identity_questions: identityQuestions,
    adaptive_questions: adaptiveQuestions,
    all_questions: allQuestions,
    selection_meta: {
      sector,
      cross_sector_count: adaptiveQuestions.filter(
        (question) => question.cross_sector
      ).length,
      sector_specific_count: adaptiveQuestions.filter(
        (question) => !question.cross_sector
      ).length,
      total_identity_count: identityQuestions.length,
      total_adaptive_count: adaptiveQuestions.length,
      total_count: allQuestions.length,
      covered_domains: coveredDomains,
    },
  };
}