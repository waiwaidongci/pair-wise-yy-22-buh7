import { useState } from "react";
import type { RestorationPlan } from "../../types/RestorationPlan";
import { usePlanApproval } from "../../hooks/usePlanApproval";
import { ERROR_MESSAGES } from "../../constants/errorMessages";

type Props = {
  plan: RestorationPlan;
  expertId: number;
  expertName?: string;
  onVote: (
    id: number,
    payload: { expert_id: number; expert_name?: string; decision: "APPROVED" | "REJECTED"; comment?: string }
  ) => Promise<void>;
  onResubmit?: (id: number) => Promise<void>;
};

// 专家表态区：依据失效/已表态/门槛未满足时给出明确提示
export function ApprovalVotePanel({ plan, expertId, expertName, onVote, onResubmit }: Props) {
  const approval = usePlanApproval(plan, expertId);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  if (!approval.awaiting) return null;

  const submit = async (decision: "APPROVED" | "REJECTED") => {
    setBusy(true);
    try {
      await onVote(plan.id, { expert_id: expertId, expert_name: expertName, decision, comment });
      setComment("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel vote-panel">
      <h2>专家意见</h2>
      {approval.basisStale && (
        <p className="approval-blocked">{ERROR_MESSAGES.BASIS_STALE}</p>
      )}
      {approval.contentStale && !approval.basisStale && (
        <p className="approval-blocked">方案内容已有修改，请审阅最新版本后再表态。</p>
      )}
      {approval.alreadyVoted && <p className="muted">您已对当前版本表态，不能重复投票。</p>}
      {!approval.basisStale && !approval.alreadyVoted && (
        <>
          <textarea
            className="vote-comment-input"
            placeholder="审批意见（可选）"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={busy}
          />
          <div className="vote-actions">
            <button type="button" className="vote-btn approve" disabled={busy || approval.contentStale} onClick={() => submit("APPROVED")}>
              同意（{approval.agreed}/{approval.required}，还差 {approval.missing} 名）
            </button>
            <button type="button" className="vote-btn reject" disabled={busy || approval.contentStale} onClick={() => submit("REJECTED")}>
              驳回
            </button>
          </div>
          <p className="muted">
            依据快照：{approval.basis ? `${approval.basis.relic_condition} / ${approval.basis.damage_severity}` : "—"}
            {approval.required > 1 ? "；脆弱/封存文物须两名不同专家分别同意" : ""}
          </p>
        </>
      )}
      {approval.basisStale && onResubmit && (
        <button type="button" className="vote-btn resubmit" onClick={() => onResubmit(plan.id)}>
          按文物当前情况重新送审
        </button>
      )}
    </div>
  );
}
