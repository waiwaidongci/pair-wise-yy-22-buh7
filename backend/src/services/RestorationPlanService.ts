import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { relicItemRepository } from "../repositories/RelicItemRepository";
import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { appendAuditLog } from "../repositories/dataStore";
import type { RestorationPlan, ApprovalVote, BasisChange } from "../models/RestorationPlan";
import type { PlanVotePayload, PlanContentPayload } from "../types/RestorationPlanPayload";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { requiredApprovalsForCondition } from "../constants/ApprovalPolicy";
import { ServiceError } from "../utils/ServiceError";
import {
  CONTENT_FIELDS,
  collectBasisChanges,
  diffPlanContent,
  hasExpertVoted,
  isApprovalSatisfied
} from "../utils/approvalPolicy";
import { createRestorationPlanDto } from "../constructors/RestorationPlanDtoFactory";

const fillTemplate = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));

const newPlan = (row: Partial<RestorationPlan>): RestorationPlan =>
  createRestorationPlanDto({
    id: restorationPlanRepository.nextId(),
    approval_status: "DRAFT",
    ...row
  }) as RestorationPlan;

export const restorationPlanService = {
  list: (): RestorationPlan[] => restorationPlanRepository.findAll(),

  create: (row: Partial<RestorationPlan>): RestorationPlan =>
    restorationPlanRepository.save(newPlan(row)),

  // 送审：冻结当时的文物状态与病害分级，作为本版审批依据，意见从头收集
  submit: (planId: number): RestorationPlan => {
    const plan = restorationPlanRepository.findById(planId);
    if (!plan) throw new ServiceError("PLAN_NOT_FOUND", 404);
    const relic = relicItemRepository.findById(plan.relic_id);
    if (!relic) throw new ServiceError("RELIC_NOT_FOUND", 404);
    const damage = damageRecordRepository.findById(plan.damage_record_id);
    if (!damage) throw new ServiceError("DAMAGE_NOT_FOUND", 404);

    const now = new Date().toISOString();
    const requiredApprovals = requiredApprovalsForCondition(relic.current_condition);
    const updated = restorationPlanRepository.update(planId, {
      approval_status: "SUBMITTED",
      approval_basis: {
        relic_condition: relic.current_condition,
        damage_severity: damage.severity,
        submitted_at: now
      },
      basis_changes: [],
      votes: [],
      votes_content_version: plan.content_version,
      required_approvals: requiredApprovals,
      opinions_reset_reason: null,
      decided_at: null
    } as Partial<RestorationPlan>)!;

    appendAuditLog({
      actor: `owner#${plan.owner_id}`,
      action: fillTemplate(LOG_TEMPLATES.PlanApproval[0], {
        planId,
        condition: relic.current_condition,
        severity: damage.severity,
        requiredApprovals
      }),
      target_type: "RestorationPlan",
      target_id: planId
    });
    return updated;
  },

  // 专家表决：依据已变 / 方案内容已改时拒收，防止照旧通过
  vote: (planId: number, payload: PlanVotePayload, actor: string): RestorationPlan => {
    const plan = restorationPlanRepository.findById(planId);
    if (!plan) throw new ServiceError("PLAN_NOT_FOUND", 404);
    if (plan.approval_status !== "SUBMITTED") throw new ServiceError("PLAN_NOT_SUBMITTED", 409);
    if (plan.basis_changes.length > 0) throw new ServiceError("BASIS_STALE", 409);
    if (plan.votes_content_version !== plan.content_version) throw new ServiceError("BASIS_STALE", 409);

    const expertId = Number(payload.expert_id);
    const decision = payload.decision === "REJECTED" ? "REJECTED" : "APPROVED";
    if (!Number.isInteger(expertId)) throw new ServiceError("VALIDATION_FAILED", 400);
    // 脆弱/封存件要两名不同专家：同一专家在同一版本内不得重复表态
    if (hasExpertVoted(plan, expertId)) throw new ServiceError("EXPERT_DUPLICATE", 409);

    const vote: ApprovalVote = {
      expert_id: expertId,
      expert_name: payload.expert_name ?? `专家${expertId}`,
      decision,
      comment: payload.comment ?? "",
      decided_at: new Date().toISOString()
    };
    const votes = [...plan.votes, vote];

    let status = "SUBMITTED";
    let decidedAt: string | null = null;
    if (decision === "REJECTED") {
      status = "REJECTED";
      decidedAt = vote.decided_at;
    } else {
      const agreed = votes.filter((item) => item.decision === "APPROVED").length;
      if (agreed >= plan.required_approvals) {
        status = "APPROVED";
        decidedAt = vote.decided_at;
      }
    }

    const updated = restorationPlanRepository.update(planId, {
      votes,
      approval_status: status,
      decided_at: decidedAt
    } as Partial<RestorationPlan>)!;

    appendAuditLog({
      actor,
      action: fillTemplate(LOG_TEMPLATES.PlanApproval[1], {
        planId,
        expertId,
        expertName: vote.expert_name,
        decision,
        agreed: votes.filter((item) => item.decision === "APPROVED").length,
        requiredApprovals: plan.required_approvals
      }),
      target_type: "RestorationPlan",
      target_id: planId
    });

    if (status === "APPROVED" || status === "REJECTED") {
      appendAuditLog({
        actor,
        action: fillTemplate(LOG_TEMPLATES.PlanApproval[5], { planId, status }),
        target_type: "RestorationPlan",
        target_id: planId
      });
    }
    return updated;
  },

  // 方案内容（标题/方法/风险评估）修改：待审意见作废，按新版本重新收集
  updateContent: (planId: number, patch: PlanContentPayload, actor: string): RestorationPlan => {
    const plan = restorationPlanRepository.findById(planId);
    if (!plan) throw new ServiceError("PLAN_NOT_FOUND", 404);

    const changedFields = diffPlanContent(plan, patch);
    if (changedFields.length === 0) return plan;

    const contentPatch: Partial<RestorationPlan> = {};
    CONTENT_FIELDS.forEach((field) => {
      if (patch[field] !== undefined) contentPatch[field] = patch[field];
    });
    contentPatch.content_version = plan.content_version + 1;

    if (plan.approval_status === "SUBMITTED") {
      // 送审中改内容：已收集的意见全部清空，等待专家对新版本重新表态
      contentPatch.votes = [];
      contentPatch.votes_content_version = contentPatch.content_version;
      contentPatch.opinions_reset_reason = "CONTENT_CHANGED";
    } else if (plan.approval_status === "APPROVED" || plan.approval_status === "REJECTED") {
      // 已决方案被改动，退回草稿，需要重新送审
      contentPatch.approval_status = "DRAFT";
      contentPatch.votes = [];
      contentPatch.votes_content_version = 0;
      contentPatch.approval_basis = null;
      contentPatch.basis_changes = [];
      contentPatch.opinions_reset_reason = "CONTENT_CHANGED";
      contentPatch.decided_at = null;
    }

    const updated = restorationPlanRepository.update(planId, contentPatch)!;
    appendAuditLog({
      actor,
      action: fillTemplate(LOG_TEMPLATES.PlanApproval[3], {
        planId,
        version: contentPatch.content_version
      }),
      target_type: "RestorationPlan",
      target_id: planId,
      detail: `changed=${changedFields.join(",")}`
    });
    return updated;
  },

  // 馆员改了文物状态或病害分级后调用：送审中方案的待审意见清空，并标出是哪一项变化
  reconcileBasis: (relicId: number, actor: string): void => {
    const relic = relicItemRepository.findById(relicId);
    if (!relic) return;
    const now = new Date().toISOString();

    restorationPlanRepository.findByRelicId(relicId).forEach((plan) => {
      if (plan.approval_status !== "SUBMITTED" || !plan.approval_basis) return;
      const damage = damageRecordRepository.findById(plan.damage_record_id);
      const severity = damage?.severity ?? plan.approval_basis.damage_severity;

      const detected = collectBasisChanges(plan, relic.current_condition, severity, now);
      const appended = detected.filter((change) => {
        const last = [...plan.basis_changes].reverse().find((item) => item.field === change.field);
        return last ? last.to_value !== change.to_value : true;
      });
      if (appended.length === 0) return;

      const changes: BasisChange[] = [...plan.basis_changes, ...appended];
      restorationPlanRepository.update(plan.id, {
        basis_changes: changes,
        votes: [],
        opinions_reset_reason: "BASIS_CHANGED"
      } as Partial<RestorationPlan>);

      appended.forEach((change) => {
        appendAuditLog({
          actor,
          action: fillTemplate(LOG_TEMPLATES.PlanApproval[2], {
            planId: plan.id,
            field: change.field,
            from: change.from_value,
            to: change.to_value
          }),
          target_type: "RestorationPlan",
          target_id: plan.id,
          detail: change.label
        });
      });
    });
  }
};

export const planApprovalGuard = { isApprovalSatisfied };
