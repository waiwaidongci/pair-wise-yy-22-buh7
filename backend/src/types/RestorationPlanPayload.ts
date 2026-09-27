export interface PlanSubmitPayload {
  actor_id?: number;
}

export interface PlanVotePayload {
  expert_id?: number;
  expert_name?: string;
  decision?: "APPROVED" | "REJECTED";
  comment?: string;
}

export interface PlanContentPayload {
  plan_title?: string;
  method?: string;
  risk_assessment?: string;
}

export type RestorationPlanPayload = Record<string, unknown>;
