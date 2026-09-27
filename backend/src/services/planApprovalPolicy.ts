import {
  DUAL_EXPERT_CONDITIONS,
  DEFAULT_REQUIRED_APPROVALS,
  DUAL_EXPERT_REQUIRED_APPROVALS
} from "../constants/PlanApprovalStatus";
import type { PlanBasisChangeType } from "../constants/PlanApprovalStatus";
import type { PlanBasisChange } from "../models/RestorationPlan";
import type { RestorationPlan } from "../models/RestorationPlan";
import type { PlanApprovalOpinion } from "../models/PlanApprovalOpinion";

/** 脆弱、封存文物的修复方案必须由两名不同专家分别同意 */
export function requiredApprovalsForCondition(condition: string): number {
  return (DUAL_EXPERT_CONDITIONS as readonly string[]).includes(condition)
    ? DUAL_EXPERT_REQUIRED_APPROVALS
    : DEFAULT_REQUIRED_APPROVALS;
}

/** 判断文物当前状态是否触发双专家门槛 */
export function needsDualExperts(condition: string): boolean {
  return (DUAL_EXPERT_CONDITIONS as readonly string[]).includes(condition);
}

function buildChange(changeType: PlanBasisChangeType, fromValue: string, toValue: string, at: string): PlanBasisChange {
  return { change_type: changeType, from_value: fromValue, to_value: toValue, detected_at: at };
}

/**
 * 对比送审时固化的依据快照与文物/病害的当前值，找出所有不一致的项。
 * 只比较送审后才有意义的字段：文物当前状态、病害分级。
 */
export function diffBasis(
  plan: Pick<RestorationPlan, "basis_condition" | "basis_severity">,
  current: { condition: string; severity: string },
  at: string
): PlanBasisChange[] {
  const changes: PlanBasisChange[] = [];
  if (plan.basis_condition !== null && plan.basis_condition !== current.condition) {
    changes.push(buildChange("RELIC_CONDITION", plan.basis_condition, current.condition, at));
  }
  if (plan.basis_severity !== null && plan.basis_severity !== current.severity) {
    changes.push(buildChange("DAMAGE_SEVERITY", plan.basis_severity, current.severity, at));
  }
  return changes;
}

/** 方案内容字段：方案内容再有修改就要重新收集意见 */
export function planContentSignature(plan: Pick<RestorationPlan, "plan_title" | "method" | "risk_assessment">): string {
  return [plan.plan_title, plan.method, plan.risk_assessment].join("#");
}

export function countActiveAgreements(opinions: PlanApprovalOpinion[], contentVersion: number): number {
  return opinions.filter((opinion) =>
    !opinion.voided && opinion.decision === "AGREED" && opinion.content_version === contentVersion
  ).length;
}

export function hasActiveRejection(opinions: PlanApprovalOpinion[], contentVersion: number): boolean {
  return opinions.some((opinion) =>
    !opinion.voided && opinion.decision === "REJECTED" && opinion.content_version === contentVersion
  );
}

export function agreedExpertIds(opinions: PlanApprovalOpinion[], contentVersion: number): number[] {
  return opinions
    .filter((opinion) => !opinion.voided && opinion.decision === "AGREED" && opinion.content_version === contentVersion)
    .map((opinion) => opinion.expert_id);
}

/** 还差几名不同专家同意 */
export function remainingApprovals(plan: RestorationPlan, opinions: PlanApprovalOpinion[]): number {
  return Math.max(0, plan.required_approvals - countActiveAgreements(opinions, plan.content_version));
}
