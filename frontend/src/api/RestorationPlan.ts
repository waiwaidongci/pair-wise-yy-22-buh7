import { mockData } from "../mocks/seedData";
import type { RestorationPlan, ApprovalVote } from "../types/RestorationPlan";
import { createRestorationPlanResponse } from "../constructors/RestorationPlanConstructor";

const endpoint = "/api/restoration-plan";

const applyLocally = (id: number, mutate: (row: RestorationPlan) => void): RestorationPlan | undefined => {
  const row = (mockData.restorationPlan as unknown as RestorationPlan[]).find((item) => item.id === id);
  if (row) mutate(row);
  return row;
};

export async function listRestorationPlan(): Promise<RestorationPlan[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return [...(mockData.restorationPlan as unknown as RestorationPlan[])];
}

export async function getRestorationPlan(id: number): Promise<RestorationPlan> {
  try {
    const res = await fetch(`${endpoint}/${id}`);
    if (res.ok) return await res.json();
  } catch {
    // fallback below
  }
  const row = (mockData.restorationPlan as unknown as RestorationPlan[]).find((item) => item.id === id);
  return row ? { ...row } : createRestorationPlanResponse();
}

export async function saveRestorationPlan(payload: RestorationPlan) {
  console.info("save RestorationPlan", payload);
  return payload;
}

// 送审：后端冻结当时文物状态与病害分级
export async function submitRestorationPlan(id: number): Promise<RestorationPlan> {
  try {
    const res = await fetch(`${endpoint}/${id}/submit`, { method: "POST" });
    if (res.ok) return await res.json();
  } catch {
    // mock fallback
  }
  return applyLocally(id, (row) => {
    row.approval_status = "SUBMITTED";
  })!;
}

// 专家同意/驳回
export async function voteRestorationPlan(
  id: number,
  payload: { expert_id: number; expert_name?: string; decision: "APPROVED" | "REJECTED"; comment?: string }
): Promise<RestorationPlan> {
  try {
    const res = await fetch(`${endpoint}/${id}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
    const body = await res.json().catch(() => null);
    throw Object.assign(new Error(body?.message ?? "表决失败"), { code: body?.code, status: res.status });
  } catch (error) {
    if ((error as { status?: number }).status) throw error;
  }
  const vote: ApprovalVote = {
    expert_id: payload.expert_id,
    expert_name: payload.expert_name ?? `专家${payload.expert_id}`,
    decision: payload.decision,
    comment: payload.comment ?? "",
    decided_at: new Date().toISOString()
  };
  return applyLocally(id, (row) => {
    if (row.basis_changes.length > 0) throw Object.assign(new Error("依据已变化，请重新送审"), { code: "BASIS_STALE" });
    if (row.votes.some((v) => v.expert_id === payload.expert_id)) {
      throw Object.assign(new Error("同一名专家不能重复表态"), { code: "EXPERT_DUPLICATE" });
    }
    row.votes = [...row.votes, vote];
    if (payload.decision === "REJECTED") {
      row.approval_status = "REJECTED";
      row.decided_at = vote.decided_at;
    } else if (row.votes.filter((v) => v.decision === "APPROVED").length >= row.required_approvals) {
      row.approval_status = "APPROVED";
      row.decided_at = vote.decided_at;
    }
  })!;
}

// 修改方案内容：意见按新版本重新收集
export async function updateRestorationPlanContent(
  id: number,
  patch: { plan_title?: string; method?: string; risk_assessment?: string }
): Promise<RestorationPlan> {
  try {
    const res = await fetch(`${endpoint}/${id}/content`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (res.ok) return await res.json();
  } catch {
    // mock fallback
  }
  return applyLocally(id, (row) => {
    if (patch.plan_title !== undefined) row.plan_title = patch.plan_title;
    if (patch.method !== undefined) row.method = patch.method;
    if (patch.risk_assessment !== undefined) row.risk_assessment = patch.risk_assessment;
    row.content_version += 1;
    if (row.approval_status === "SUBMITTED") {
      row.votes = [];
      row.votes_content_version = row.content_version;
      row.opinions_reset_reason = "CONTENT_CHANGED";
    }
  })!;
}
