import type { PlanBasisChangeType } from "../constants/PlanApprovalStatus";

/** 送审时固化的依据快照与当前依据之间的差异（标出变更是哪一项） */
export interface PlanBasisChange {
  change_type: PlanBasisChangeType;
  from_value: string;
  to_value: string;
  detected_at: string;
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
  /** 送审时文物的当前状态（依据快照） */
  basis_condition: string | null;
  /** 送审时病害的分级（依据快照） */
  basis_severity: string | null;
  /** 送审时的方案内容版本；方案内容每改一次 +1 */
  content_version: number;
  /** 当前需要的不同专家同意人数（脆弱/封存为 2） */
  required_approvals: number;
  /** 依据是否已变化（任一快照项或内容版本失效） */
  basis_stale: boolean;
  /** 相比送审快照发生了哪些变化（标出是哪一项） */
  basis_changes: PlanBasisChange[];
  /** 最后一次送审/重新送审时间 */
  submitted_at: string | null;
}
