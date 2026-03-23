export interface SectorDomainDefinition {
  code: string;
  label: string;
  description: string;
}

export const sectorDomainRegistry: Record<string, SectorDomainDefinition[]> = {
  restaurant: [
    {
      code: "identity",
      label: "Identity",
      description: "Business identity, operating model, and commercial format.",
    },
    {
      code: "operations",
      label: "Operations",
      description: "Daily execution, service flow, and operating discipline.",
    },
    {
      code: "staffing",
      label: "Staffing",
      description: "People coverage, role clarity, and labor coordination.",
    },
    {
      code: "reporting",
      label: "Reporting",
      description: "Visibility, reporting rhythm, and information reliability.",
    },
    {
      code: "finance",
      label: "Finance",
      description: "Cash control, margins, financial pressure, and financial discipline.",
    },
    {
      code: "sales",
      label: "Sales",
      description: "Demand capture, conversion, and revenue generation.",
    },
    {
      code: "customer_flow",
      label: "Customer Flow",
      description: "Client throughput, service timing, and experience continuity.",
    },
    {
      code: "inventory",
      label: "Inventory",
      description: "Stock control, replenishment, and product traceability.",
    },
    {
      code: "planning",
      label: "Planning",
      description: "Planning cadence, anticipation, and execution alignment.",
    },
  ],

  retail: [
    { code: "identity", label: "Identity", description: "Store identity and positioning." },
    { code: "operations", label: "Operations", description: "Store execution and operating discipline." },
    { code: "staffing", label: "Staffing", description: "People coverage and shift consistency." },
    { code: "reporting", label: "Reporting", description: "Visibility and reporting reliability." },
    { code: "finance", label: "Finance", description: "Cash, margins, and financial control." },
    { code: "sales", label: "Sales", description: "Demand generation and conversion quality." },
    { code: "inventory", label: "Inventory", description: "Stock control and replenishment logic." },
    { code: "planning", label: "Planning", description: "Forecasting and operating preparation." },
  ],

  services: [
    { code: "identity", label: "Identity", description: "Service model and commercial identity." },
    { code: "operations", label: "Operations", description: "Delivery execution and workflow stability." },
    { code: "staffing", label: "Staffing", description: "Role clarity and service capacity." },
    { code: "reporting", label: "Reporting", description: "Visibility and reporting cadence." },
    { code: "finance", label: "Finance", description: "Financial control and pressure handling." },
    { code: "sales", label: "Sales", description: "Lead generation and conversion strength." },
    { code: "planning", label: "Planning", description: "Commitment planning and execution readiness." },
  ],

  construction: [
    { code: "identity", label: "Identity", description: "Company identity and project model." },
    { code: "operations", label: "Operations", description: "Site execution and delivery control." },
    { code: "staffing", label: "Staffing", description: "Crew structure and field coordination." },
    { code: "reporting", label: "Reporting", description: "Project reporting and control visibility." },
    { code: "finance", label: "Finance", description: "Cost pressure and financial discipline." },
    { code: "planning", label: "Planning", description: "Project planning and sequencing." },
  ],

  health: [
    { code: "identity", label: "Identity", description: "Care model and operating identity." },
    { code: "operations", label: "Operations", description: "Clinical/administrative execution stability." },
    { code: "staffing", label: "Staffing", description: "Coverage, roles, and care coordination." },
    { code: "reporting", label: "Reporting", description: "Visibility, records, and reporting integrity." },
    { code: "finance", label: "Finance", description: "Billing, pressure, and financial control." },
    { code: "planning", label: "Planning", description: "Scheduling and forward operational readiness." },
  ],

  logistics: [
    { code: "identity", label: "Identity", description: "Operating identity and transport model." },
    { code: "operations", label: "Operations", description: "Dispatch execution and route discipline." },
    { code: "staffing", label: "Staffing", description: "Driver/team role clarity and coverage." },
    { code: "reporting", label: "Reporting", description: "Tracking, reporting, and control visibility." },
    { code: "finance", label: "Finance", description: "Cost pressure and financial control." },
    { code: "planning", label: "Planning", description: "Scheduling, routing, and readiness." },
  ],

  technology: [
    { code: "identity", label: "Identity", description: "Product/service identity and operating model." },
    { code: "operations", label: "Operations", description: "Delivery execution and process discipline." },
    { code: "staffing", label: "Staffing", description: "Team structure and accountability clarity." },
    { code: "reporting", label: "Reporting", description: "Visibility, metrics, and reporting cadence." },
    { code: "finance", label: "Finance", description: "Burn, revenue discipline, and control." },
    { code: "sales", label: "Sales", description: "Pipeline and conversion strength." },
    { code: "planning", label: "Planning", description: "Roadmapping and execution planning." },
  ],

  education: [
    { code: "identity", label: "Identity", description: "Institutional/service identity." },
    { code: "operations", label: "Operations", description: "Delivery execution and scheduling flow." },
    { code: "staffing", label: "Staffing", description: "Faculty/team role clarity and coverage." },
    { code: "reporting", label: "Reporting", description: "Visibility, records, and reporting." },
    { code: "finance", label: "Finance", description: "Financial pressure and operating control." },
    { code: "planning", label: "Planning", description: "Calendar planning and capacity readiness." },
  ],

  hospitality: [
    { code: "identity", label: "Identity", description: "Hospitality model and positioning." },
    { code: "operations", label: "Operations", description: "Guest service and daily execution." },
    { code: "staffing", label: "Staffing", description: "Coverage, shifts, and role coordination." },
    { code: "reporting", label: "Reporting", description: "Operational visibility and reporting." },
    { code: "finance", label: "Finance", description: "Financial pressure and performance control." },
    { code: "sales", label: "Sales", description: "Demand capture and booking/commercial strength." },
    { code: "planning", label: "Planning", description: "Occupancy/service planning readiness." },
  ],

  general: [
    { code: "identity", label: "Identity", description: "Entity identity and basic operating definition." },
    { code: "operations", label: "Operations", description: "Execution discipline and operational consistency." },
    { code: "staffing", label: "Staffing", description: "People structure and accountability." },
    { code: "reporting", label: "Reporting", description: "Visibility and reporting reliability." },
    { code: "finance", label: "Finance", description: "Financial pressure and control." },
    { code: "sales", label: "Sales", description: "Demand and conversion strength." },
    { code: "planning", label: "Planning", description: "Planning rhythm and preparedness." },
  ],
};

export function getSectorDomains(sector: string): SectorDomainDefinition[] {
  return sectorDomainRegistry[sector] ?? sectorDomainRegistry.general;
}