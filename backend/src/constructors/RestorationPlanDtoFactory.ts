export const createRestorationPlanDto = (overrides = {}) => ({
  id: 1,
  relic_id: 1,
  damage_record_id: 1,
  plan_title: "plan title 1",
  method: "method 1",
  risk_assessment: "risk assessment 1",
  approval_status: "DRAFT",
  owner_id: 1,
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
