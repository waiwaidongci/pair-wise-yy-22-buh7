import { mockApprovalApi, MockApiError } from "../mocks/mockApprovalApi";
import { request, ApiError, readSession } from "./request";
import type { RestorationPlan, PlanDetail } from "../types/RestorationPlan";
import type { PlanApprovalDecision } from "../constants/PlanApprovalStatus";

const endpoint = "/api/restoration-plan";

function isOffline(error: unknown): boolean {
  return error instanceof TypeError; // fetch network failure
}

export async function listRestorationPlan(): Promise<PlanDetail[]> {
  try {
    return await request<PlanDetail[]>(endpoint);
  } catch (error) {
    if (isOffline(error)) return mockApprovalApi.listPlans();
    throw error;
  }
}

export async function submitRestorationPlan(id: number): Promise<PlanDetail> {
  try {
    return await request<PlanDetail>(`${endpoint}/${id}/submit`, { method: "POST" });
  } catch (error) {
    if (isOffline(error)) return mockApprovalApi.submit(id);
    throw error;
  }
}

export async function resubmitRestorationPlan(id: number): Promise<PlanDetail> {
  try {
    return await request<PlanDetail>(`${endpoint}/${id}/resubmit`, { method: "POST" });
  } catch (error) {
    if (isOffline(error)) return mockApprovalApi.resubmit(id);
    throw error;
  }
}

export async function reviseRestorationPlan(
  id: number,
  patch: Pick<RestorationPlan, "plan_title" | "method" | "risk_assessment">
): Promise<PlanDetail> {
  try {
    return await request<PlanDetail>(`${endpoint}/${id}/content`, { method: "PATCH", body: JSON.stringify(patch) });
  } catch (error) {
    if (isOffline(error)) return mockApprovalApi.revise(id, patch);
    throw error;
  }
}

export async function decideRestorationPlan(
  id: number,
  decision: PlanApprovalDecision,
  comment: string
): Promise<PlanDetail> {
  try {
    return await request<PlanDetail>(`${endpoint}/${id}/decisions`, {
      method: "POST",
      body: JSON.stringify({ decision, comment })
    });
  } catch (error) {
    if (isOffline(error)) {
      const actor = readSession();
      return mockApprovalApi.decide(id, { id: actor.userId, name: actor.userName }, decision, comment);
    }
    throw error;
  }
}

export async function saveRestorationPlan(payload: RestorationPlan) {
  console.info("save RestorationPlan", payload);
  return payload;
}

export { ApiError, MockApiError };
