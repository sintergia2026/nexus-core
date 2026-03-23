export const sectorSimulationRegistry: Record<string, string[]> = {
  restaurant: [
    "reassign_shift_ownership",
    "improve_reporting_visibility",
    "stabilize_inventory_control",
    "increase_service_capacity",
    "simulate_margin_pressure",
  ],
  retail: [
    "stabilize_inventory_control",
    "improve_store_reporting",
    "simulate_sales_drop",
    "reassign_floor_capacity",
  ],
  services: [
    "rebalance_service_capacity",
    "improve_visibility_control",
    "simulate_demand_variation",
    "formalize_reporting_owner",
  ],
  construction: [
    "reassign_site_coordination",
    "improve_project_reporting",
    "simulate_cost_pressure",
    "strengthen_planning_control",
  ],
  health: [
    "improve_schedule_integrity",
    "rebalance_administrative_load",
    "simulate_billing_pressure",
    "strengthen_visibility_control",
  ],
  logistics: [
    "reassign_dispatch_control",
    "improve_tracking_visibility",
    "simulate_route_pressure",
    "stabilize_fleet_coordination",
  ],
  technology: [
    "rebalance_delivery_load",
    "improve_operational_visibility",
    "simulate_revenue_pressure",
    "formalize_role_ownership",
  ],
  education: [
    "improve_schedule_control",
    "rebalance_admin_load",
    "simulate_enrollment_pressure",
    "strengthen_reporting_discipline",
  ],
  hospitality: [
    "rebalance_guest_flow_capacity",
    "improve_visibility_control",
    "simulate_occupancy_pressure",
    "stabilize_shift_execution",
  ],
  general: [
    "reassign_role_ownership",
    "improve_reporting_visibility",
    "simulate_financial_pressure",
    "stabilize_operational_control",
  ],
};

export function getSectorSimulationScenarios(sector: string): string[] {
  return sectorSimulationRegistry[sector] ?? sectorSimulationRegistry.general;
}