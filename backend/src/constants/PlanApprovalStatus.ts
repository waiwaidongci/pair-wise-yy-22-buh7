export const PlanApprovalStatus = ["DRAFT","SUBMITTED","APPROVED","REJECTED","ARCHIVED"] as const;
export type PlanApprovalStatus = (typeof PlanApprovalStatus)[number];

/** 送审依据可能发生变化的项：文物当前状态 / 病害分级 / 方案内容本身 */
export const PlanBasisChangeType = ["RELIC_CONDITION","DAMAGE_SEVERITY","CONTENT"] as const;
export type PlanBasisChangeType = (typeof PlanBasisChangeType)[number];

/** 单条审批意见的结论 */
export const PlanApprovalDecision = ["AGREED","REJECTED"] as const;
export type PlanApprovalDecision = (typeof PlanApprovalDecision)[number];

/** 需要两名不同专家分别同意的文物状态：脆弱、封存 */
export const DUAL_EXPERT_CONDITIONS = ["FRAGILE","SEALED"] as const;
export type DualExpertCondition = (typeof DUAL_EXPERT_CONDITIONS)[number];

export const DEFAULT_REQUIRED_APPROVALS = 1;
export const DUAL_EXPERT_REQUIRED_APPROVALS = 2;
