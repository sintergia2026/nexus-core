export interface SectorRoleDefinition {
  role_id: string;
  label: string;
  role_type: "executive" | "managerial" | "operational" | "support" | "control";
  primary_domains: string[];
}

export const sectorRoleRegistry: Record<string, SectorRoleDefinition[]> = {
  restaurant: [
    {
      role_id: "owner",
      label: "Owner",
      role_type: "executive",
      primary_domains: ["identity", "finance", "sales", "planning"],
    },
    {
      role_id: "general_manager",
      label: "General Manager",
      role_type: "managerial",
      primary_domains: ["operations", "staffing", "reporting", "planning"],
    },
    {
      role_id: "kitchen_lead",
      label: "Kitchen Lead",
      role_type: "operational",
      primary_domains: ["operations", "inventory", "staffing"],
    },
    {
      role_id: "floor_lead",
      label: "Floor Lead",
      role_type: "operational",
      primary_domains: ["operations", "customer_flow", "staffing"],
    },
    {
      role_id: "cashier",
      label: "Cashier",
      role_type: "operational",
      primary_domains: ["sales", "customer_flow", "reporting"],
    },
    {
      role_id: "reporting_responsible",
      label: "Reporting Responsible",
      role_type: "control",
      primary_domains: ["reporting", "finance", "planning"],
    },
  ],

  retail: [
    {
      role_id: "owner",
      label: "Owner",
      role_type: "executive",
      primary_domains: ["identity", "finance", "sales", "planning"],
    },
    {
      role_id: "store_manager",
      label: "Store Manager",
      role_type: "managerial",
      primary_domains: ["operations", "staffing", "reporting", "inventory"],
    },
    {
      role_id: "inventory_responsible",
      label: "Inventory Responsible",
      role_type: "control",
      primary_domains: ["inventory", "reporting", "operations"],
    },
    {
      role_id: "sales_floor",
      label: "Sales Floor",
      role_type: "operational",
      primary_domains: ["sales", "operations"],
    },
  ],

  services: [
    {
      role_id: "owner",
      label: "Owner",
      role_type: "executive",
      primary_domains: ["identity", "finance", "sales", "planning"],
    },
    {
      role_id: "operations_manager",
      label: "Operations Manager",
      role_type: "managerial",
      primary_domains: ["operations", "staffing", "reporting"],
    },
    {
      role_id: "service_lead",
      label: "Service Lead",
      role_type: "operational",
      primary_domains: ["operations", "staffing"],
    },
    {
      role_id: "reporting_responsible",
      label: "Reporting Responsible",
      role_type: "control",
      primary_domains: ["reporting", "finance"],
    },
  ],

  construction: [
    {
      role_id: "owner",
      label: "Owner",
      role_type: "executive",
      primary_domains: ["identity", "finance", "planning"],
    },
    {
      role_id: "project_manager",
      label: "Project Manager",
      role_type: "managerial",
      primary_domains: ["operations", "planning", "reporting"],
    },
    {
      role_id: "site_supervisor",
      label: "Site Supervisor",
      role_type: "operational",
      primary_domains: ["operations", "staffing"],
    },
    {
      role_id: "cost_control",
      label: "Cost Control",
      role_type: "control",
      primary_domains: ["finance", "reporting"],
    },
  ],

  health: [
    {
      role_id: "owner",
      label: "Owner",
      role_type: "executive",
      primary_domains: ["identity", "finance", "planning"],
    },
    {
      role_id: "administrator",
      label: "Administrator",
      role_type: "managerial",
      primary_domains: ["operations", "reporting", "staffing"],
    },
    {
      role_id: "medical_director",
      label: "Medical Director",
      role_type: "managerial",
      primary_domains: ["operations", "staffing"],
    },
    {
      role_id: "billing_responsible",
      label: "Billing Responsible",
      role_type: "control",
      primary_domains: ["finance", "reporting"],
    },
  ],

  logistics: [
    {
      role_id: "owner",
      label: "Owner",
      role_type: "executive",
      primary_domains: ["identity", "finance", "planning"],
    },
    {
      role_id: "dispatch_manager",
      label: "Dispatch Manager",
      role_type: "managerial",
      primary_domains: ["operations", "reporting", "planning"],
    },
    {
      role_id: "fleet_lead",
      label: "Fleet Lead",
      role_type: "operational",
      primary_domains: ["operations", "staffing"],
    },
    {
      role_id: "control_responsible",
      label: "Control Responsible",
      role_type: "control",
      primary_domains: ["reporting", "finance"],
    },
  ],

  technology: [
    {
      role_id: "founder",
      label: "Founder",
      role_type: "executive",
      primary_domains: ["identity", "finance", "sales", "planning"],
    },
    {
      role_id: "operations_lead",
      label: "Operations Lead",
      role_type: "managerial",
      primary_domains: ["operations", "reporting", "planning"],
    },
    {
      role_id: "delivery_lead",
      label: "Delivery Lead",
      role_type: "operational",
      primary_domains: ["operations", "staffing"],
    },
    {
      role_id: "finance_reporting",
      label: "Finance / Reporting",
      role_type: "control",
      primary_domains: ["finance", "reporting"],
    },
  ],

  education: [
    {
      role_id: "director",
      label: "Director",
      role_type: "executive",
      primary_domains: ["identity", "finance", "planning"],
    },
    {
      role_id: "academic_coordinator",
      label: "Academic Coordinator",
      role_type: "managerial",
      primary_domains: ["operations", "staffing", "planning"],
    },
    {
      role_id: "admin_responsible",
      label: "Admin Responsible",
      role_type: "control",
      primary_domains: ["reporting", "finance"],
    },
  ],

  hospitality: [
    {
      role_id: "owner",
      label: "Owner",
      role_type: "executive",
      primary_domains: ["identity", "finance", "sales", "planning"],
    },
    {
      role_id: "operations_manager",
      label: "Operations Manager",
      role_type: "managerial",
      primary_domains: ["operations", "staffing", "reporting"],
    },
    {
      role_id: "front_desk_lead",
      label: "Front Desk Lead",
      role_type: "operational",
      primary_domains: ["operations", "sales"],
    },
    {
      role_id: "reporting_responsible",
      label: "Reporting Responsible",
      role_type: "control",
      primary_domains: ["reporting", "finance"],
    },
  ],

  general: [
    {
      role_id: "owner",
      label: "Owner",
      role_type: "executive",
      primary_domains: ["identity", "finance", "planning"],
    },
    {
      role_id: "manager",
      label: "Manager",
      role_type: "managerial",
      primary_domains: ["operations", "staffing", "reporting"],
    },
    {
      role_id: "operator",
      label: "Operator",
      role_type: "operational",
      primary_domains: ["operations"],
    },
    {
      role_id: "reporting_responsible",
      label: "Reporting Responsible",
      role_type: "control",
      primary_domains: ["reporting", "finance"],
    },
  ],
};

export function getSectorRoles(sector: string): SectorRoleDefinition[] {
  return sectorRoleRegistry[sector] ?? sectorRoleRegistry.general;
}