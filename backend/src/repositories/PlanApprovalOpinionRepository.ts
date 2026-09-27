import { seed } from "../seed";
import type { PlanApprovalOpinion } from "../models/PlanApprovalOpinion";
import type { PlanBasisChangeType } from "../constants/PlanApprovalStatus";

const rows: PlanApprovalOpinion[] = seed.planApprovalOpinion.map((row) => ({ ...row }));
let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const planApprovalOpinionRepository = {
  findAll: (): PlanApprovalOpinion[] => rows,
  findByPlan: (planId: number): PlanApprovalOpinion[] => rows.filter((row) => row.plan_id === planId),
  /** 同一方案、同一内容版本下，该专家是否已给过仍然有效的意见（防止同一专家重复同意） */
  findActiveByExpert: (planId: number, expertId: number, contentVersion: number): PlanApprovalOpinion | undefined =>
    rows.find((row) =>
      row.plan_id === planId &&
      row.expert_id === expertId &&
      !row.voided &&
      row.content_version === contentVersion
    ),
  add: (opinion: Omit<PlanApprovalOpinion, "id">): PlanApprovalOpinion => {
    const row: PlanApprovalOpinion = { ...opinion, id: nextId++ };
    rows.push(row);
    return row;
  },
  /** 依据变化或方案改版时清空（作废）该版本尚未作废的待审意见，记录作废原因 */
  voidActiveByPlan: (planId: number, contentVersion: number, reason: PlanBasisChangeType): number => {
    let count = 0;
    for (const row of rows) {
      if (row.plan_id === planId && !row.voided && row.content_version === contentVersion) {
        row.voided = true;
        row.voided_change = reason;
        count += 1;
      }
    }
    return count;
  }
};
