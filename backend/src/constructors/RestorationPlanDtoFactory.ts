import type { RestorationPlan } from "../models/RestorationPlan";
import type { PlanApprovalOpinion } from "../models/PlanApprovalOpinion";

/** 默认对象 / 表单对象构造器：页面、store、service 不散写默认结构 */
export const createRestorationPlanDto = (overrides: Partial<RestorationPlan> = {}): RestorationPlan => ({
  id: 1,
  relic_id: 1,
  damage_record_id: 1,
  plan_title: "plan title 1",
  method: "method 1",
  risk_assessment: "risk assessment 1",
  approval_status: "DRAFT",
  owner_id: 1,
  basis_condition: null,
  basis_severity: null,
  content_version: 1,
  required_approvals: 1,
  basis_stale: false,
  basis_changes: [],
  submitted_at: null,
  ...overrides
});

export type PlanDetailView = {
  plan: RestorationPlan;
  opinions: PlanApprovalOpinion[];
  approval: {
    required: number;
    agreed: number;
    agreed_expert_ids: number[];
    remaining: number;
    rejected: boolean;
    basis_stale: boolean;
    basis_changes: RestorationPlan["basis_changes"];
    can_decide: boolean;
    can_approve: boolean;
  };
};

/** 响应对象构造器：审批记录里同时给出依据快照、谁已同意、还差什么 */
export const buildPlanDetailDto = (detail: PlanDetailView): PlanDetailView => ({
  plan: { ...detail.plan, basis_changes: detail.plan.basis_changes.map((change) => ({ ...change })) },
  opinions: detail.opinions.map((opinion) => ({ ...opinion })),
  approval: { ...detail.approval, basis_changes: detail.approval.basis_changes.map((change) => ({ ...change })) }
});
