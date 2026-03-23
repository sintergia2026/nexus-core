export function mapQuestionToRole(
  questionId: string,
  domain: string
): string[] {
  const normalizedQuestionId = String(questionId || "").trim().toUpperCase();
  const normalizedDomain = String(domain || "").trim().toLowerCase();

  if (normalizedQuestionId.startsWith("REP")) {
    return ["reporting_responsible", "manager", "general_manager"];
  }

  if (normalizedQuestionId.startsWith("FIN")) {
    return ["owner", "finance_reporting", "billing_responsible", "reporting_responsible"];
  }

  if (normalizedQuestionId.startsWith("OPS")) {
    return ["manager", "general_manager", "operations_manager", "operator"];
  }

  if (normalizedQuestionId.startsWith("PLN")) {
    return ["owner", "manager", "general_manager"];
  }

  if (normalizedQuestionId.startsWith("SAL")) {
    return ["owner", "cashier", "sales_floor", "front_desk_lead"];
  }

  if (normalizedQuestionId.startsWith("INV")) {
    return ["inventory_responsible", "kitchen_lead", "store_manager"];
  }

  switch (normalizedDomain) {
    case "identity":
      return ["owner", "founder", "director"];
    case "operations":
      return ["manager", "general_manager", "operations_manager", "operator"];
    case "staffing":
      return ["manager", "general_manager", "operations_manager"];
    case "reporting":
      return ["reporting_responsible", "finance_reporting"];
    case "finance":
      return ["owner", "finance_reporting", "billing_responsible"];
    case "sales":
      return ["owner", "cashier", "sales_floor", "front_desk_lead"];
    case "inventory":
      return ["inventory_responsible", "kitchen_lead"];
    case "planning":
      return ["owner", "manager", "general_manager"];
    default:
      return ["owner", "manager"];
  }
}