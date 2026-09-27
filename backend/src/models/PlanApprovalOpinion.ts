import type { PlanApprovalDecision, PlanBasisChangeType } from "../constants/PlanApprovalStatus";

/** 单条专家审批意见（作废后仍保留在审批记录中，可追溯旧结论） */
export interface PlanApprovalOpinion {
  id: number;
  plan_id: number;
  expert_id: number;
  expert_name: string;
  decision: PlanApprovalDecision;
  comment: string;
  /** 意见对应的方案内容版本 */
  content_version: number;
  /** 意见是否已因依据变化或方案改版而作废 */
  voided: boolean;
  /** 作废原因：文物状态变化 / 病害分级变化 / 方案内容修改 */
  voided_change: PlanBasisChangeType | null;
  created_at: string;
}
