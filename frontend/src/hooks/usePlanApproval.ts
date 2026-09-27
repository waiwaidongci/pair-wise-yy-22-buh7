import { useCallback, useMemo, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import type { PlanDetail } from "../types/RestorationPlan";
import type { PlanApprovalDecision } from "../constants/PlanApprovalStatus";

/**
 * 方案审批 hook：
 * - 分页浏览方案
 * - 绑定单个方案时给出：送审依据快照、谁已同意、还差几名专家、依据是否失效
 * - 暴露送审 / 重新送审 / 改版 / 出具意见动作
 */
export function usePlanApproval(rows: PlanDetail[] = []) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page]);

  const submit = useRestorationPlanStore((state) => state.submit);
  const resubmit = useRestorationPlanStore((state) => state.resubmit);
  const revise = useRestorationPlanStore((state) => state.revise);
  const decide = useRestorationPlanStore((state) => state.decide);

  const forPlan = useCallback(
    (detail: PlanDetail) => {
      const { plan, opinions, approval } = detail;
      return {
        submittedBasis: {
          condition: plan.basis_condition,
          severity: plan.basis_severity,
          submittedAt: plan.submitted_at,
          contentVersion: plan.content_version
        },
        agreedOpinions: opinions.filter((o) => !o.voided && o.decision === "AGREED"),
        voidedOpinions: opinions.filter((o) => o.voided),
        submit: () => submit(plan.id),
        resubmit: () => resubmit(plan.id),
        revise: (patch: { plan_title: string; method: string; risk_assessment: string }) =>
          revise(plan.id, patch),
        decide: (decision: PlanApprovalDecision, comment: string) => decide(plan.id, decision, comment),
        approval
      };
    },
    [submit, resubmit, revise, decide]
  );

  return { page, setPage, pageSize, pageRows, total: rows.length, forPlan };
}
