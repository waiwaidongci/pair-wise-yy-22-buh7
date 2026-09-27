import type { RestorationPlan } from "../types/RestorationPlan";

export const createDefaultRestorationPlan = (overrides: Partial<RestorationPlan> = {}): RestorationPlan => ({
  id: 1 as never,
  relic_id: 1 as never,
  damage_record_id: 1 as never,
  plan_title: "未命名修复方案" as never,
  method: "" as never,
  risk_assessment: "" as never,
  approval_status: "DRAFT" as never,
  owner_id: 1 as never,
  basis_condition: null,
  basis_severity: null,
  content_version: 1,
  required_approvals: 1,
  basis_stale: false,
  basis_changes: [],
  submitted_at: null,
  ...overrides
});

export const createRestorationPlanForm = createDefaultRestorationPlan;
export const createRestorationPlanResponse = createDefaultRestorationPlan;
