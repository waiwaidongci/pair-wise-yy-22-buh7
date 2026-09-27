import type { PlanApprovalOpinion } from "../types/RestorationPlan";

/** 专家意见表单默认结构 */
export const createDefaultPlanApprovalOpinion = (
  overrides: Partial<PlanApprovalOpinion> = {}
): PlanApprovalOpinion => ({
  id: 0,
  plan_id: 0,
  expert_id: 0,
  expert_name: "",
  decision: "AGREED",
  comment: "",
  content_version: 1,
  voided: false,
  voided_change: null,
  created_at: new Date(0).toISOString(),
  ...overrides
});
