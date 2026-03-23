import { TwinRoot } from "./TwinRoot";
import { TwinDomainNode } from "./TwinDomainNode";
import { TwinRoleNode } from "./TwinRoleNode";
import { TwinEvidenceItem } from "./TwinEvidenceItem";
import { TwinDependencyEdge } from "./TwinDependencyEdge";
import { TwinActivationLayer } from "./TwinActivationLayer";
import { TwinSimulationLayer } from "./TwinSimulationLayer";

export interface TwinStructure {
  twin_id: string;
  twin_name: string;
  twin_version: string;
  lineage_id: string;
  root: TwinRoot;
  domains: TwinDomainNode[];
  roles: TwinRoleNode[];
  evidence: TwinEvidenceItem[];
  dependencies: TwinDependencyEdge[];
  activation: TwinActivationLayer;
  simulation: TwinSimulationLayer;
  created_at: string;
  updated_at: string;
}