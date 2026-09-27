import {
  DUAL_EXPERT_CONDITIONS,
  DEFAULT_REQUIRED_APPROVALS,
  DUAL_EXPERT_REQUIRED_APPROVALS
} from "../constants/PlanApprovalStatus";
import type { PlanBasisChange, RestorationPlan, PlanApprovalOpinion, PlanApprovalSummary } from "../types/RestorationPlan";
import type { PlanApprovalDecision, PlanBasisChangeType } from "../constants/PlanApprovalStatus";

/** 脆弱、封存文物需两名不同专家分别同意 */
export function requiredApprovalsForCondition(condition: string): number {
  return (DUAL_EXPERT_CONDITIONS as readonly string[]).includes(condition)
    ? DUAL_EXPERT_REQUIRED_APPROVALS
    : DEFAULT_REQUIRED_APPROVALS;
}

export function needsDualExperts(condition: string): boolean {
  return (DUAL_EXPERT_CONDITIONS as readonly string[]).includes(condition);
}

function change(changeType: PlanBasisChangeType, fromValue: string, toValue: string, at: string): PlanBasisChange {
  return { change_type: changeType, from_value: fromValue, to_value: toValue, detected_at: at };
}

/** 对比送审快照与当前情况，标出变化项 */
export function diffBasis(
  plan: Pick<RestorationPlan, "basis_condition" | "basis_severity">,
  current: { condition: string; severity: string },
  at = new Date().toISOString()
): PlanBasisChange[] {
  const changes: PlanBasisChange[] = [];
  if (plan.basis_condition !== null && plan.basis_condition !== current.condition) {
    changes.push(change("RELIC_CONDITION", plan.basis_condition, current.condition, at));
  }
  if (plan.basis_severity !== null && plan.basis_severity !== current.severity) {
    changes.push(change("DAMAGE_SEVERITY", plan.basis_severity, current.severity, at));
  }
  return changes;
}

export function planContentSignature(plan: Pick<RestorationPlan, "plan_title" | "method" | "risk_assessment">): string {
  return [plan.plan_title, plan.method, plan.risk_assessment].join("#");
}

export function activeOpinions(opinions: PlanApprovalOpinion[], contentVersion: number): PlanApprovalOpinion[] {
  return opinions.filter((opinion) => !opinion.voided && opinion.content_version === contentVersion);
}

export function countAgreements(opinions: PlanApprovalOpinion[], contentVersion: number): number {
  return activeOpinions(opinions, contentVersion).filter((opinion) => opinion.decision === "AGREED").length;
}

export function hasRejection(opinions: PlanApprovalOpinion[], contentVersion: number): boolean {
  return activeOpinions(opinions, contentVersion).some((opinion) => opinion.decision === "REJECTED");
}

export function summarizeApproval(
  plan: RestorationPlan,
  opinions: PlanApprovalOpinion[],
  basisChanges: PlanBasisChange[] = plan.basis_changes
): PlanApprovalSummary {
  const agreed = countAgreements(opinions, plan.content_version);
  const rejected = hasRejection(opinions, plan.content_version);
  const basisStale = basisChanges.length > 0;
  return {
    required: plan.required_approvals,
    agreed,
    agreed_expert_ids: activeOpinions(opinions, plan.content_version)
      .filter((opinion) => opinion.decision === "AGREED")
      .map((opinion) => opinion.expert_id),
    remaining: Math.max(0, plan.required_approvals - agreed),
    rejected,
    basis_stale: basisStale,
    basis_changes: basisChanges,
    can_decide: plan.approval_status === "SUBMITTED" && !basisStale,
    can_approve:
      plan.approval_status === "SUBMITTED" && !basisStale && !rejected && agreed >= plan.required_approvals
  };
}

export type { PlanApprovalDecision };
