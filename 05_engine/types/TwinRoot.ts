export interface TwinRoot {
  entity_id: string;
  legal_name: string;
  display_name: string;
  sector: string;
  subsector?: string;
  country?: string;
  city?: string;
  lifecycle_stage: string;
  state_label: string;
}