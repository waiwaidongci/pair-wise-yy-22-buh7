import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { relicItemRepository } from "../repositories/RelicItemRepository";
import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { planApprovalOpinionRepository } from "../repositories/PlanApprovalOpinionRepository";
import {
  requiredApprovalsForCondition,
  diffBasis,
  countActiveAgreements,
  hasActiveRejection,
  agreedExpertIds,
  remainingApprovals,
  planContentSignature
} from "./planApprovalPolicy";
import { PLAN_APPROVAL_LOG_TEMPLATES } from "../constants/logTemplates";
import { DomainError, notFound, validationError, conflictError } from "../utils/httpError";
import { audit } from "../middlewares/auditLogMiddleware";
import type { RestorationPlan } from "../models/RestorationPlan";
import type { PlanApprovalOpinion } from "../models/PlanApprovalOpinion";
import type { PlanBasisChangeType } from "../constants/PlanApprovalStatus";

function nowIso(): string {
  return new Date().toISOString();
}

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => String(vars[key] ?? ""));
}

function requirePlan(id: number): RestorationPlan {
  const plan = restorationPlanRepository.findById(id);
  if (!plan) throw notFound("PLAN_NOT_FOUND", `id=${id}`);
  return plan;
}

function currentBasis(plan: RestorationPlan): { condition: string; severity: string } {
  const relic = relicItemRepository.findById(plan.relic_id);
  const damage = damageRecordRepository.findById(plan.damage_record_id);
  if (!relic) throw notFound("RELIC_NOT_FOUND", `id=${plan.relic_id}`);
  if (!damage) throw notFound("DAMAGE_NOT_FOUND", `id=${plan.damage_record_id}`);
  return { condition: relic.current_condition, severity: damage.severity };
}

/**
 * 依据守护：用文物当前状态/病害分级与送审快照比对。
 * 任一项变化即把方案标记为依据失效；bumpBasis=false 时只刷新差异，不改结论。
 */
export function refreshBasisStaleness(plan: RestorationPlan, at = nowIso()): RestorationPlan {
  if (plan.approval_status !== "SUBMITTED") return plan;
  const current = currentBasis(plan);
  plan.basis_changes = diffBasis(plan, current, at);
  plan.basis_stale = plan.basis_changes.length > 0;
  return plan;
}

/**
 * 依据变化时清空（作废）待审意见，并标出变更是哪一项。
 * 由文物状态更新、病害分级更新服务调用，每个变化项各记一条日志。
 */
export function invalidatePlansForBasisChange(
  relicId: number,
  changeType: Extract<PlanBasisChangeType, "RELIC_CONDITION" | "DAMAGE_SEVERITY">,
  fromValue: string,
  toValue: string,
  at = nowIso()
): number {
  const affected = restorationPlanRepository
    .findByRelic(relicId)
    .filter((plan) => plan.approval_status === "SUBMITTED");
  for (const plan of affected) {
    const current = currentBasis(plan);
    const before = new Set(plan.basis_changes.map((change) => change.change_type));
    plan.basis_changes = diffBasis(plan, current, at);
    plan.basis_stale = plan.basis_changes.length > 0;
    if (!before.has(changeType) && fromValue !== toValue) {
      const voided = planApprovalOpinionRepository.voidActiveByPlan(plan.id, plan.content_version, changeType);
      audit(fill(PLAN_APPROVAL_LOG_TEMPLATES.basisVoided, { planId: plan.id, changeType, count: voided }));
    }
  }
  return affected.length;
}

export const restorationPlanApprovalService = {
  list() {
    const plans = restorationPlanRepository.findAll().map((plan) => refreshBasisStaleness({ ...plan, basis_changes: [...plan.basis_changes] }));
    return plans.map((plan) => restorationPlanApprovalService.detail(plan.id));
  },

  detail(id: number) {
    const plan = refreshBasisStaleness(requirePlan(id));
    const opinions = planApprovalOpinionRepository.findByPlan(id);
    const agreements = countActiveAgreements(opinions, plan.content_version);
    return {
      plan,
      opinions,
      approval: {
        required: plan.required_approvals,
        agreed: agreements,
        agreed_expert_ids: agreedExpertIds(opinions, plan.content_version),
        remaining: remainingApprovals(plan, opinions),
        rejected: hasActiveRejection(opinions, plan.content_version),
        basis_stale: plan.basis_stale,
        basis_changes: plan.basis_changes,
        can_decide: plan.approval_status === "SUBMITTED" && !plan.basis_stale,
        can_approve:
          plan.approval_status === "SUBMITTED" &&
          !plan.basis_stale &&
          !hasActiveRejection(opinions, plan.content_version) &&
          agreements >= plan.required_approvals
      }
    };
  },

  /** 送审：固化送审时文物状态与病害分级作为审批依据 */
  submit(id: number) {
    const plan = requirePlan(id);
    if (plan.approval_status !== "DRAFT" && plan.approval_status !== "REJECTED") {
      throw conflictError("PLAN_NOT_SUBMITTABLE", `id=${id},status=${plan.approval_status}`);
    }
    const current = currentBasis(plan);
    plan.basis_condition = current.condition;
    plan.basis_severity = current.severity;
    plan.basis_changes = [];
    plan.basis_stale = false;
    plan.required_approvals = requiredApprovalsForCondition(current.condition);
    plan.approval_status = "SUBMITTED";
    plan.submitted_at = nowIso();
    audit(fill(PLAN_APPROVAL_LOG_TEMPLATES.submitted, {
      planId: plan.id,
      condition: current.condition,
      severity: current.severity,
      required: plan.required_approvals
    }));
    return restorationPlanApprovalService.detail(plan.id);
  },

  /**
   * 修改方案内容：方案内容再有修改就重新收集意见。
   * 内容版本 +1，当前版本的待审意见全部作废；已通过/已归档方案不允许直接改内容。
   */
  revise(id: number, patch: { plan_title?: string; method?: string; risk_assessment?: string }) {
    const plan = requirePlan(id);
    if (plan.approval_status === "APPROVED" || plan.approval_status === "ARCHIVED") {
      throw new DomainError("VALIDATION_FAILED", 409, `approved/archived plan cannot be revised directly, id=${id}`);
    }
    const fields = ["plan_title", "method", "risk_assessment"] as const;
    const next = {
      plan_title: patch.plan_title ?? plan.plan_title,
      method: patch.method ?? plan.method,
      risk_assessment: patch.risk_assessment ?? plan.risk_assessment
    };
    if (planContentSignature(next) === planContentSignature(plan)) {
      throw validationError("plan content is unchanged");
    }
    const from = plan.content_version;
    Object.assign(plan, next);
    plan.content_version = from + 1;
    const voided = planApprovalOpinionRepository.voidActiveByPlan(plan.id, from, "CONTENT");
    // 回到草稿：旧依据快照保留可追溯，但必须重新送审、重新收集意见
    plan.approval_status = "DRAFT";
    plan.basis_stale = false;
    plan.basis_changes = [];
    audit(fill(PLAN_APPROVAL_LOG_TEMPLATES.revised, { planId: plan.id, from, to: plan.content_version, count: voided }));
    return restorationPlanApprovalService.detail(plan.id);
  },

  /**
   * 重新送审：依据失效或内容改版后，按当前文物情况重新固化依据并重新收集意见。
   * - 内容改版后方案为 DRAFT：版本沿用新版，重新固化依据
   * - 依据失效时方案仍为 SUBMITTED：仅刷新依据快照
   */
  resubmit(id: number) {
    const plan = requirePlan(id);
    if (plan.approval_status !== "SUBMITTED" && plan.approval_status !== "DRAFT") {
      throw conflictError("PLAN_NOT_SUBMITTABLE", `id=${id},status=${plan.approval_status}`);
    }
    const current = currentBasis(plan);
    plan.basis_condition = current.condition;
    plan.basis_severity = current.severity;
    plan.basis_changes = [];
    plan.basis_stale = false;
    plan.required_approvals = requiredApprovalsForCondition(current.condition);
    plan.approval_status = "SUBMITTED";
    plan.submitted_at = nowIso();
    audit(fill(PLAN_APPROVAL_LOG_TEMPLATES.resubmitted, { planId: plan.id, version: plan.content_version, required: plan.required_approvals }));
    return restorationPlanApprovalService.detail(plan.id);
  },

  /** 专家出具意见；同意人数满足门槛且无驳回时自动通过 */
  decide(id: number, expert: { id: number; name: string }, decision: "AGREED" | "REJECTED", comment: string) {
    const plan = refreshBasisStaleness(requirePlan(id));
    if (plan.approval_status !== "SUBMITTED") {
      throw conflictError("PLAN_NOT_DECIDABLE", `id=${id},status=${plan.approval_status}`);
    }
    if (plan.basis_stale) {
      throw conflictError("PLAN_BASIS_STALE", `id=${id},changes=${plan.basis_changes.map((c) => c.change_type).join(",")}`);
    }
    if (planApprovalOpinionRepository.findActiveByExpert(plan.id, expert.id, plan.content_version)) {
      throw conflictError("PLAN_DUPLICATE_EXPERT", `plan=${id},expert=${expert.id}`);
    }
    const opinion: Omit<PlanApprovalOpinion, "id"> = {
      plan_id: plan.id,
      expert_id: expert.id,
      expert_name: expert.name,
      decision,
      comment: comment ?? "",
      content_version: plan.content_version,
      voided: false,
      voided_change: null,
      created_at: nowIso()
    };
    planApprovalOpinionRepository.add(opinion);
    audit(fill(PLAN_APPROVAL_LOG_TEMPLATES.decided, { planId: plan.id, expertId: expert.id, decision }));

    const opinions = planApprovalOpinionRepository.findByPlan(plan.id);
    if (hasActiveRejection(opinions, plan.content_version)) {
      plan.approval_status = "REJECTED";
    } else if (countActiveAgreements(opinions, plan.content_version) >= plan.required_approvals) {
      plan.approval_status = "APPROVED";
      audit(fill(PLAN_APPROVAL_LOG_TEMPLATES.approved, {
        planId: plan.id,
        agreements: countActiveAgreements(opinions, plan.content_version),
        required: plan.required_approvals
      }));
    }
    return restorationPlanApprovalService.detail(plan.id);
  }
};
