const PREFIX_DOMAIN_MAP: Record<string, string> = {
  ID: "identity",
  OPS: "operations",
  STF: "staffing",
  REP: "reporting",
  FIN: "finance",
  SAL: "sales",
  CUS: "customer_flow",
  INV: "inventory",
  PLN: "planning",
};

export function mapQuestionToDomain(
  questionId: string,
  fallbackDomain?: string
): string {
  const normalized = String(questionId || "").trim().toUpperCase();
  const prefix = normalized.split("_")[0];

  if (PREFIX_DOMAIN_MAP[prefix]) {
    return PREFIX_DOMAIN_MAP[prefix];
  }

  if (fallbackDomain && fallbackDomain.trim()) {
    return fallbackDomain.trim();
  }

  return "operations";
}