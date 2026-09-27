import type { RestorationPlan } from "../../types/RestorationPlan";
import { StatusBadge } from "./StatusBadge";
import { BasisChangeTags } from "./BasisChangeTags";
import { BasisSnapshotCard } from "./BasisSnapshotCard";
import { usePlanApproval } from "../../hooks/usePlanApproval";
import { APPROVAL_DECISION_TEXT, OPINIONS_RESET_TEXT } from "../../constants/approvalText";
import { formatApprovalProgress, formatBasisValue, formatDate, formatMissingApprovals } from "../../utils/formatters";

type Props =
  | { title?: string; value?: string; plan?: never }
  | { title?: string; value?: never; plan: RestorationPlan; expertId?: number };

// 审批记录：能看出依据（冻结快照）、谁已同意、还差什么、为何意见被清空
export function ApprovalTimeline(props: Props) {
  if (!("plan" in props) || !props.plan) {
    const { title = "ApprovalTimeline", value = "READY" } = props;
    return <div className="shared-widget"><strong>{title}</strong><StatusBadge value={value} /></div>;
  }

  const { plan, expertId } = props;
  const approval = usePlanApproval(plan, expertId);

  return (
    <div className="approval-timeline">
      <div className="approval-head">
        <h2>审批记录</h2>
        <StatusBadge value={plan.approval_status} />
      </div>

      <BasisSnapshotCard basis={plan.approval_basis} />

      {approval.basisStale && <BasisChangeTags changes={approval.changes} />}
      {!approval.basisStale && approval.resetReason && (
        <div className="approval-notice" role="status">{OPINIONS_RESET_TEXT[approval.resetReason]}</div>
      )}

      <div className="panel approval-progress-panel">
        <div className="approval-progress-line">
          <strong>{formatApprovalProgress(approval.agreed, approval.required)}</strong>
          {approval.awaiting && <span className="muted">{formatMissingApprovals(approval.missing)}</span>}
          {approval.alreadyVoted && <StatusBadge value="您已表态" />}
        </div>
        {approval.basisStale && <p className="approval-blocked">依据已变化，须由方案编制人重新送审后才能继续收集意见。</p>}
        {!approval.basisStale && approval.contentStale && (
          <p className="approval-blocked">方案内容已更新到 v{plan.content_version}，正在按新版本重新收集意见。</p>
        )}
      </div>

      <ol className="vote-list">
        {plan.votes.length === 0 && <li className="muted">暂无专家意见。</li>}
        {[...plan.votes]
          .sort((a, b) => a.decided_at.localeCompare(b.decided_at))
          .map((vote) => (
            <li key={`${vote.expert_id}-${vote.decided_at}`} className={`vote-item vote-${vote.decision.toLowerCase()}`}>
              <div className="vote-main">
                <StatusBadge value={APPROVAL_DECISION_TEXT[vote.decision] ?? vote.decision} />
                <strong>{vote.expert_name}（#{vote.expert_id}）</strong>
                <span className="muted">{formatDate(vote.decided_at)}</span>
              </div>
              {vote.comment && <p className="vote-comment">{vote.comment}</p>}
            </li>
          ))}
      </ol>

      {plan.decided_at && (
        <p className="muted approval-decided">形成决定时间：{formatDate(plan.decided_at)}</p>
      )}
      {plan.approval_basis && (
        <p className="muted approval-foot">
          当前文物实际状态以档案页为准；本记录仅以
          “{formatBasisValue(plan.approval_basis.relic_condition)} / {formatBasisValue(plan.approval_basis.damage_severity)}”
          为该次送审依据。
        </p>
      )}
    </div>
  );
}
