import { useMemo, useState } from "react";
import type { RestorationPlan } from "../types/RestorationPlan";
import {
  agreedVotes,
  approvalProgress,
  canVote,
  hasExpertVoted,
  isAwaitingApproval,
  isBasisStale,
  isContentStale,
  missingApprovals
} from "../utils/approvalPolicy";

// 方案审批 hook：集中给出"依据是否有效、谁已同意、还差几人、能否表态"的派生结果
export function usePlanApproval(plan?: RestorationPlan, expertId?: number) {
  const [page, setPage] = useState(1);
  const pageSize = 8;

  return useMemo(() => {
    const fallback = {
      awaiting: false,
      basisStale: false,
      contentStale: false,
      canVote: false,
      agreed: 0,
      required: 1,
      missing: 1,
      alreadyVoted: false,
      agreedExperts: [] as RestorationPlan["votes"],
      progressText: "",
      basis: null,
      changes: [] as RestorationPlan["basis_changes"],
      resetReason: null as RestorationPlan["opinions_reset_reason"]
    };
    if (!plan) return { page, setPage, pageSize, ...fallback };
    return {
      page,
      setPage,
      pageSize,
      awaiting: isAwaitingApproval(plan),
      basisStale: isBasisStale(plan),
      contentStale: isContentStale(plan),
      canVote: canVote(plan),
      agreed: approvalProgress(plan).agreed,
      required: approvalProgress(plan).required,
      missing: missingApprovals(plan),
      alreadyVoted: expertId !== undefined ? hasExpertVoted(plan, expertId) : false,
      agreedExperts: agreedVotes(plan),
      progressText: `${agreedVotes(plan).length}/${plan.required_approvals}`,
      basis: plan.approval_basis,
      changes: plan.basis_changes,
      resetReason: plan.opinions_reset_reason
    };
  }, [plan, expertId, page]);
}

// 列表分页（历史调用方仍在用）
export function usePlanApprovalPaging<T>(rows: T[] = []) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page]);
  return { page, setPage, pageSize, pageRows, total: rows.length };
}
