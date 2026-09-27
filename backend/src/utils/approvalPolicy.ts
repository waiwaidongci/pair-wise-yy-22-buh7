import type { ApprovalVote, BasisChange, RestorationPlan } from "../models/RestorationPlan";
import { requiredApprovalsForCondition } from "../constants/ApprovalPolicy";

export const CONTENT_FIELDS = ["plan_title", "method", "risk_assessment"] as const;

// 方案内容是否发生修改（标题、修复方法、风险评估）
export const diffPlanContent = (
  current: Pick<RestorationPlan, (typeof CONTENT_FIELDS)[number]>,
  incoming: Partial<Pick<RestorationPlan, (typeof CONTENT_FIELDS)[number]>>
): (typeof CONTENT_FIELDS)[number][] =>
  CONTENT_FIELDS.filter((field) => incoming[field] !== undefined && incoming[field] !== current[field]);

// 送审后文物现状是否已偏离送审依据
export const collectBasisChanges = (
  plan: RestorationPlan,
  condition: string,
  severity: string,
  now: string
): BasisChange[] => {
  const basis = plan.approval_basis;
  if (!basis) return [];
  const changes: BasisChange[] = [];
  if (basis.relic_condition !== condition) {
    changes.push({
      field: "RELIC_CONDITION",
      label: "文物状态",
      from_value: basis.relic_condition,
      to_value: condition,
      changed_at: now
    });
  }
  if (basis.damage_severity !== severity) {
    changes.push({
      field: "DAMAGE_SEVERITY",
      label: "病害等级",
      from_value: basis.damage_severity,
      to_value: severity,
      changed_at: now
    });
  }
  return changes;
};

export const isBasisStale = (plan: RestorationPlan): boolean => plan.basis_changes.length > 0;

export const approvalVotes = (plan: RestorationPlan): ApprovalVote[] =>
  plan.votes.filter((vote) => vote.decision === "APPROVED");

export const hasExpertVoted = (plan: RestorationPlan, expertId: number): boolean =>
  plan.votes.some((vote) => vote.expert_id === expertId);

export const isApprovalSatisfied = (plan: RestorationPlan): boolean =>
  approvalVotes(plan).length >= plan.required_approvals;

export const describePendingBasis = (condition: string) => ({
  condition,
  requiredApprovals: requiredApprovalsForCondition(condition)
});
