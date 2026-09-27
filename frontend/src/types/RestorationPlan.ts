import type { PlanApprovalDecision, PlanBasisChangeType } from "../constants/PlanApprovalStatus";

/** 送审依据快照与当前值的差异（标出变更是哪一项） */
export interface PlanBasisChange {
  change_type: PlanBasisChangeType;
  from_value: string;
  to_value: string;
  detected_at: string;
}

/** 专家审批意见；作废后仍保留在审批记录里 */
export interface PlanApprovalOpinion {
  id: number;
  plan_id: number;
  expert_id: number;
  expert_name: string;
  decision: PlanApprovalDecision;
  comment: string;
  content_version: number;
  voided: boolean;
  voided_change: PlanBasisChangeType | null;
  created_at: string;
}

export interface RestorationPlan {
  id: number;
  relic_id: number;
  damage_record_id: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
  approval_status: string;
  owner_id: number;
  /** 送审时固化的文物状态依据 */
  basis_condition: string | null;
  /** 送审时固化的病害分级依据 */
  basis_severity: string | null;
  content_version: number;
  required_approvals: number;
  basis_stale: boolean;
  basis_changes: PlanBasisChange[];
  submitted_at: string | null;
}

/** 审批进度：能看出依据、谁已同意、还差什么 */
export interface PlanApprovalSummary {
  required: number;
  agreed: number;
  agreed_expert_ids: number[];
  remaining: number;
  rejected: boolean;
  basis_stale: boolean;
  basis_changes: PlanBasisChange[];
  can_decide: boolean;
  can_approve: boolean;
}

export interface PlanDetail {
  plan: RestorationPlan;
  opinions: PlanApprovalOpinion[];
  approval: PlanApprovalSummary;
}
