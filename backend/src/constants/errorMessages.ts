export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  PLAN_NOT_FOUND: "restoration plan not found",
  RELIC_NOT_FOUND: "relic item not found",
  DAMAGE_NOT_FOUND: "damage record not found",
  PLAN_NOT_SUBMITTED: "plan is not awaiting approval",
  BASIS_STALE: "the approval basis has changed; opinions were cleared and the plan must be resubmitted",
  EXPERT_DUPLICATE: "an expert may only vote once per plan version; the second approval must come from another expert",
  APPROVAL_THRESHOLD: "not enough distinct expert approvals for a fragile or sealed relic"
};
