export interface ApprovalVote {
  expert_id: number;
  expert_name: string;
  decision: "APPROVED" | "REJECTED";
  comment: string;
  decided_at: string;
}

export interface ApprovalBasis {
  // 送审那一刻冻结的依据
  relic_condition: string;
  damage_severity: string;
  submitted_at: string;
}

export interface BasisChange {
  field: "RELIC_CONDITION" | "DAMAGE_SEVERITY";
  label: string;
  from_value: string;
  to_value: string;
  changed_at: string;
}

export type OpinionsResetReason = "BASIS_CHANGED" | "CONTENT_CHANGED" | null;

export interface RestorationPlan {
  id: number;
  relic_id: number;
  damage_record_id: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
  approval_status: string;
  owner_id: number;
  approval_basis: ApprovalBasis | null;
  basis_changes: BasisChange[];
  content_version: number;
  votes: ApprovalVote[];
  votes_content_version: number;
  opinions_reset_reason: OpinionsResetReason;
  required_approvals: number;
  decided_at: string | null;
}
