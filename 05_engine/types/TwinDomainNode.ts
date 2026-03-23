export interface TwinDomainNode {
  domain_id: string;
  domain_name: string;
  domain_label: string;
  status: string;
  owner_role_id?: string;
  score: number;
  summary: string;
}