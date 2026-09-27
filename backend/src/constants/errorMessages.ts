export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  PLAN_NOT_FOUND: "restoration plan not found",
  RELIC_NOT_FOUND: "relic item not found",
  DAMAGE_NOT_FOUND: "damage record not found",
  PLAN_NOT_SUBMITTABLE: "only a draft or rejected plan can be submitted for review",
  PLAN_NOT_DECIDABLE: "only a submitted plan with a current basis can receive an expert decision",
  PLAN_BASIS_STALE: "the review basis has changed; existing opinions are voided and the plan must be resubmitted",
  PLAN_DUPLICATE_EXPERT: "an expert may only agree once for the same plan revision",
  PLAN_QUORUM_MISMATCH: "the number of required approvals must be 1 or 2"
};
