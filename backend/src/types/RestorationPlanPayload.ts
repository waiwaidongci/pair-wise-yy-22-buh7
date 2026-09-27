import type { PlanApprovalDecision } from "../constants/PlanApprovalStatus";

/** PATCH /api/restoration-plan/:id/content */
export interface PlanContentPayload {
  plan_title?: string;
  method?: string;
  risk_assessment?: string;
}

/** POST /api/restoration-plan/:id/decisions */
export interface PlanDecisionPayload {
  decision: PlanApprovalDecision;
  comment?: string;
}

export type RestorationPlanPayload = Record<string, unknown> | PlanContentPayload | PlanDecisionPayload;
