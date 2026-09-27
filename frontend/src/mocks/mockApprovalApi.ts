import { mockData } from "../mocks/seedData";
import { createDefaultPlanApprovalOpinion } from "../constructors/PlanApprovalOpinionConstructor";
import {
  requiredApprovalsForCondition,
  diffBasis,
  summarizeApproval,
  planContentSignature
} from "../utils/planApprovalPolicy";
import type { RelicItem } from "../types/RelicItem";
import type { DamageRecord } from "../types/DamageRecord";
import type {
  RestorationPlan,
  PlanApprovalOpinion,
  PlanDetail,
  PlanBasisChange
} from "../types/RestorationPlan";
import type { PlanApprovalDecision, PlanBasisChangeType } from "../constants/PlanApprovalStatus";

const STORE_KEY = "relic-restore:mock-store:v1";

interface MockStore {
  relicItem: RelicItem[];
  damageRecord: DamageRecord[];
  restorationPlan: RestorationPlan[];
  planApprovalOpinion: PlanApprovalOpinion[];
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function freshStore(): MockStore {
  return clone({
    relicItem: mockData.relicItem,
    damageRecord: mockData.damageRecord,
    restorationPlan: mockData.restorationPlan,
    planApprovalOpinion: mockData.planApprovalOpinion
  });
}

function load(): MockStore {
  if (typeof sessionStorage !== "undefined") {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as MockStore;
      } catch {
        // fall through to fresh store
      }
    }
  }
  return freshStore();
}

let store: MockStore = load();

function persist() {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(store));
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function findPlan(id: number): RestorationPlan {
  const plan = store.restorationPlan.find((row) => row.id === id);
  if (!plan) throw new MockApiError(404, "PLAN_NOT_FOUND", `restoration plan not found: id=${id}`);
  return plan;
}

function currentBasis(plan: RestorationPlan): { condition: string; severity: string } {
  const relic = store.relicItem.find((row) => row.id === plan.relic_id);
  const damage = store.damageRecord.find((row) => row.id === plan.damage_record_id);
  if (!relic) throw new MockApiError(404, "RELIC_NOT_FOUND", `relic not found: id=${plan.relic_id}`);
  if (!damage) throw new MockApiError(404, "DAMAGE_NOT_FOUND", `damage not found: id=${plan.damage_record_id}`);
  return { condition: relic.current_condition, severity: damage.severity };
}

function opinionsOf(planId: number): PlanApprovalOpinion[] {
  return store.planApprovalOpinion.filter((row) => row.plan_id === planId);
}

function refreshStaleness(plan: RestorationPlan): PlanBasisChange[] {
  if (plan.approval_status !== "SUBMITTED") return plan.basis_changes;
  const changes = diffBasis(plan, currentBasis(plan));
  plan.basis_changes = changes;
  plan.basis_stale = changes.length > 0;
  return changes;
}

function detailOf(plan: RestorationPlan): PlanDetail {
  const changes = refreshStaleness(plan);
  const opinions = opinionsOf(plan.id);
  return { plan: { ...plan }, opinions: clone(opinions), approval: summarizeApproval(plan, opinions, changes) };
}

function voidActive(planId: number, contentVersion: number, reason: PlanBasisChangeType): number {
  let count = 0;
  for (const opinion of store.planApprovalOpinion) {
    if (opinion.plan_id === planId && !opinion.voided && opinion.content_version === contentVersion) {
      opinion.voided = true;
      opinion.voided_change = reason;
      count += 1;
    }
  }
  return count;
}

/** 文物状态 / 病害分级变化：在审方案标记变化项并清空待审意见 */
function invalidateForBasis(relicId: number, changeType: "RELIC_CONDITION" | "DAMAGE_SEVERITY") {
  for (const plan of store.restorationPlan) {
    if (plan.approval_status !== "SUBMITTED") continue;
    const before = new Set(plan.basis_changes.map((c) => c.change_type));
    const changes = refreshStaleness(plan);
    if (!before.has(changeType) && changes.some((c) => c.change_type === changeType)) {
      voidActive(plan.id, plan.content_version, changeType);
    }
  }
}

export class MockApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "MockApiError";
    this.status = status;
    this.code = code;
  }
}

export const mockApprovalApi = {
  reset() {
    store = freshStore();
    persist();
  },

  listPlans(): PlanDetail[] {
    return store.restorationPlan.map((plan) => detailOf(plan));
  },

  listRelics(): RelicItem[] {
    return clone(store.relicItem);
  },

  listDamages(): DamageRecord[] {
    return clone(store.damageRecord);
  },

  updateRelicCondition(id: number, condition: string): RelicItem {
    const relic = store.relicItem.find((row) => row.id === id);
    if (!relic) throw new MockApiError(404, "RELIC_NOT_FOUND", `relic not found: id=${id}`);
    relic.current_condition = condition;
    invalidateForBasis(id, "RELIC_CONDITION");
    persist();
    return clone(relic);
  },

  updateDamageSeverity(id: number, severity: string): DamageRecord {
    const damage = store.damageRecord.find((row) => row.id === id);
    if (!damage) throw new MockApiError(404, "DAMAGE_NOT_FOUND", `damage not found: id=${id}`);
    damage.severity = severity;
    invalidateForBasis(damage.relic_id, "DAMAGE_SEVERITY");
    persist();
    return clone(damage);
  },

  submit(id: number): PlanDetail {
    const plan = findPlan(id);
    if (plan.approval_status !== "DRAFT" && plan.approval_status !== "REJECTED") {
      throw new MockApiError(409, "PLAN_NOT_SUBMITTABLE", `status=${plan.approval_status}`);
    }
    const current = currentBasis(plan);
    plan.basis_condition = current.condition;
    plan.basis_severity = current.severity;
    plan.basis_changes = [];
    plan.basis_stale = false;
    plan.required_approvals = requiredApprovalsForCondition(current.condition);
    plan.approval_status = "SUBMITTED";
    plan.submitted_at = nowIso();
    persist();
    return detailOf(plan);
  },

  resubmit(id: number): PlanDetail {
    const plan = findPlan(id);
    if (plan.approval_status !== "SUBMITTED" && plan.approval_status !== "DRAFT") {
      throw new MockApiError(409, "PLAN_NOT_SUBMITTABLE", `status=${plan.approval_status}`);
    }
    const current = currentBasis(plan);
    plan.basis_condition = current.condition;
    plan.basis_severity = current.severity;
    plan.basis_changes = [];
    plan.basis_stale = false;
    plan.required_approvals = requiredApprovalsForCondition(current.condition);
    plan.approval_status = "SUBMITTED";
    plan.submitted_at = nowIso();
    persist();
    return detailOf(plan);
  },

  revise(id: number, patch: { plan_title?: string; method?: string; risk_assessment?: string }): PlanDetail {
    const plan = findPlan(id);
    if (plan.approval_status === "APPROVED" || plan.approval_status === "ARCHIVED") {
      throw new MockApiError(409, "VALIDATION_FAILED", "approved/archived plan cannot be revised");
    }
    const next = {
      plan_title: patch.plan_title ?? plan.plan_title,
      method: patch.method ?? plan.method,
      risk_assessment: patch.risk_assessment ?? plan.risk_assessment
    };
    if (planContentSignature(next) === planContentSignature(plan)) {
      throw new MockApiError(400, "VALIDATION_FAILED", "plan content is unchanged");
    }
    const from = plan.content_version;
    Object.assign(plan, next);
    plan.content_version = from + 1;
    voidActive(plan.id, from, "CONTENT");
    plan.approval_status = "DRAFT";
    plan.basis_stale = false;
    plan.basis_changes = [];
    persist();
    return detailOf(plan);
  },

  decide(id: number, expert: { id: number; name: string }, decision: PlanApprovalDecision, comment: string): PlanDetail {
    const plan = findPlan(id);
    refreshStaleness(plan);
    if (plan.approval_status !== "SUBMITTED") {
      throw new MockApiError(409, "PLAN_NOT_DECIDABLE", `status=${plan.approval_status}`);
    }
    if (plan.basis_stale) {
      throw new MockApiError(409, "PLAN_BASIS_STALE", `changes=${plan.basis_changes.map((c) => c.change_type).join(",")}`);
    }
    const duplicated = store.planApprovalOpinion.some(
      (opinion) =>
        opinion.plan_id === plan.id &&
        opinion.expert_id === expert.id &&
        !opinion.voided &&
        opinion.content_version === plan.content_version
    );
    if (duplicated) throw new MockApiError(409, "PLAN_DUPLICATE_EXPERT", `expert=${expert.id}`);
    store.planApprovalOpinion.push({
      ...createDefaultPlanApprovalOpinion(),
      id: store.planApprovalOpinion.reduce((max, row) => Math.max(max, row.id), 0) + 1,
      plan_id: plan.id,
      expert_id: expert.id,
      expert_name: expert.name,
      decision,
      comment,
      content_version: plan.content_version,
      created_at: nowIso()
    });
    const opinions = opinionsOf(plan.id);
    const summary = summarizeApproval(plan, opinions);
    if (summary.rejected) {
      plan.approval_status = "REJECTED";
    } else if (summary.agreed >= plan.required_approvals) {
      plan.approval_status = "APPROVED";
    }
    persist();
    return detailOf(plan);
  }
};
