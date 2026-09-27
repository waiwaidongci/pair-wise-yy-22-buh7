import type { RestorationPlan } from "../types/RestorationPlan";

export const createDefaultRestorationPlan = (overrides: Partial<RestorationPlan> = {}): RestorationPlan => ({
  id: 0,
  relic_id: 0,
  damage_record_id: 0,
  plan_title: "",
  method: "",
  risk_assessment: "",
  approval_status: "DRAFT",
  owner_id: 0,
  approval_basis: null,
  basis_changes: [],
  content_version: 0,
  votes: [],
  votes_content_version: 0,
  opinions_reset_reason: null,
  required_approvals: 1,
  decided_at: null,
  ...overrides
});

export const createRestorationPlanForm = createDefaultRestorationPlan;
export const createRestorationPlanResponse = createDefaultRestorationPlan;
