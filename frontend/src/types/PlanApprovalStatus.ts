export const PlanApprovalStatus = ["DRAFT","SUBMITTED","APPROVED","REJECTED","ARCHIVED"] as const;
export type PlanApprovalStatus = (typeof PlanApprovalStatus)[number];
export const PlanApprovalStatusText: Record<PlanApprovalStatus, string> = {
  DRAFT: "草稿",
  SUBMITTED: "待审批",
  APPROVED: "已通过",
  REJECTED: "已驳回",
  ARCHIVED: "已归档"
};

/** 送审依据变化项：文物状态 / 病害分级 / 方案内容 */
export const PlanBasisChangeType = ["RELIC_CONDITION","DAMAGE_SEVERITY","CONTENT"] as const;
export type PlanBasisChangeType = (typeof PlanBasisChangeType)[number];
export const PlanBasisChangeTypeText: Record<PlanBasisChangeType, string> = {
  RELIC_CONDITION: "文物状态",
  DAMAGE_SEVERITY: "病害分级",
  CONTENT: "方案内容"
};

export const PlanApprovalDecision = ["AGREED","REJECTED"] as const;
export type PlanApprovalDecision = (typeof PlanApprovalDecision)[number];

/** 脆弱、封存文物需要两名不同专家分别同意 */
export const DUAL_EXPERT_CONDITIONS = ["FRAGILE","SEALED"] as const;
export const DEFAULT_REQUIRED_APPROVALS = 1;
export const DUAL_EXPERT_REQUIRED_APPROVALS = 2;
