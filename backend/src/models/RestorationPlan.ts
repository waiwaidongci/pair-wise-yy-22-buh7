export interface ApprovalVote {
  expert_id: number;
  expert_name: string;
  decision: "APPROVED" | "REJECTED";
  comment: string;
  decided_at: string;
}

export interface ApprovalBasis {
  // 送审时冻结的依据：专家看到的必须是这一版，而不是文物的实时状态
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

export interface RestorationPlan {
  id: number;
  relic_id: number;
  damage_record_id: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
  approval_status: string;
  owner_id: number;
  // 送审快照：提交审批那一刻文物的状态与病害分级
  approval_basis: ApprovalBasis | null;
  // 送审后文物状态/病害分级发生的变化，逐项标出
  basis_changes: BasisChange[];
  // 本方案内容（标题/方法/风险评估）的版本号，内容改动即递增
  content_version: number;
  // 收集意见时对应的内容版本，版本不一致意味着意见已过期
  votes: ApprovalVote[];
  votes_content_version: number;
  // 待审意见被清空的原因：依据变化 BASIS_CHANGED / 方案内容修改 CONTENT_CHANGED
  opinions_reset_reason: "BASIS_CHANGED" | "CONTENT_CHANGED" | null;
  // 依据快照要求的同意专家人数（脆弱/封存为 2，其余为 1）
  required_approvals: number;
  decided_at: string | null;
}
