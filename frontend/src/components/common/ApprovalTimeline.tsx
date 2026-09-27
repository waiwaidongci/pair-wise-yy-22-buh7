import { StatusBadge } from "./StatusBadge";
import { usePlanApproval } from "../../hooks/usePlanApproval";
import { useSessionStore } from "../../stores/SessionStore";
import {
  formatBasisChange,
  formatCondition,
  formatDate,
  formatSeverity
} from "../../utils/formatters";
import type { PlanDetail } from "../../types/RestorationPlan";
import type { PlanApprovalDecision } from "../../constants/PlanApprovalStatus";

export interface ApprovalTimelineProps {
  detail: PlanDetail;
  actorRole?: string;
  onSubmit?: () => void;
  onResubmit?: () => void;
  onDecide?: (decision: PlanApprovalDecision) => void;
}

/** 审批时间线：送审依据、每位专家的意见（含已作废）、同意进度、还差什么 */
export function ApprovalTimeline({ detail, actorRole, onSubmit, onResubmit, onDecide }: ApprovalTimelineProps) {
  const { forPlan } = usePlanApproval();
  const { submittedBasis, agreedOpinions } = forPlan(detail);
  const { plan, opinions, approval } = detail;
  const isRestorer = actorRole === "RESTORER" || actorRole === "ADMIN";
  const isExpert = actorRole === "EXPERT" || actorRole === "ADMIN";
  const currentUserId = useSessionStore((state) => state.userId);
  const currentExpertDecided = opinions.some(
    (opinion) => !opinion.voided && opinion.expert_id === currentUserId
  );

  return (
    <div className="approval-timeline">
      <div className="approval-head">
        <StatusBadge value={plan.approval_status} />
        <span className="content-version">内容版本 v{plan.content_version}</span>
        {approval.basis_stale && <StatusBadge value="BASIS_STALE" label="依据已变化" />}
        {approval.rejected && <StatusBadge value="REJECTED" label="本版已被驳回" />}
      </div>

      <article className="approval-basis">
        <h4>送审依据（送审时固化）</h4>
        <ul>
          <li>文物状态：{formatCondition(submittedBasis.condition)}</li>
          <li>病害分级：{formatSeverity(submittedBasis.severity)}</li>
          <li>送审时间：{formatDate(submittedBasis.submittedAt)}</li>
        </ul>
        {approval.basis_changes.length > 0 && (
          <div className="basis-changes" role="alert">
            <strong>当前情况与送审依据不一致：</strong>
            <ul>
              {approval.basis_changes.map((change, index) => (
                <li key={`${change.change_type}-${index}`}>
                  <StatusBadge value="BASIS_STALE" label={formatBasisChange(change)} />
                </li>
              ))}
            </ul>
            <p className="hint">待审意见已清空，历史意见保留但标记作废；需修复师重新送审后重新收集意见。</p>
          </div>
        )}
      </article>

      <article className="approval-progress">
        <h4>
          同意进度：{approval.agreed}/{approval.required} 名不同专家
          {plan.required_approvals === 2 && <span className="dual-tag">脆弱/封存文物需双专家</span>}
        </h4>
        <p className={approval.remaining > 0 ? "remaining" : "remaining done"}>
          {approval.remaining > 0 ? `还差 ${approval.remaining} 名不同专家同意` : "同意人数已满足门槛"}
        </p>
        {agreedOpinions.length > 0 && (
          <p className="who-agreed">
            已同意：{agreedOpinions.map((opinion) => opinion.expert_name).join("、")}
          </p>
        )}
      </article>

      <article className="approval-opinions">
        <h4>审批记录</h4>
        {opinions.length === 0 && <p className="hint">暂无专家意见</p>}
        <ol className="opinion-list">
          {opinions.map((opinion) => (
            <li key={opinion.id} className={opinion.voided ? "opinion voided" : "opinion"}>
              <div className="opinion-head">
                <strong>{opinion.expert_name}</strong>
                <StatusBadge
                  value={opinion.decision}
                  label={opinion.decision === "AGREED" ? "同意" : "驳回"}
                />
                <span className="opinion-version">v{opinion.content_version}</span>
                <time>{formatDate(opinion.created_at)}</time>
                {opinion.voided && (
                  <StatusBadge
                    value="BASIS_STALE"
                    label={`已作废·${opinion.voided_change === "CONTENT" ? "方案内容修改" : opinion.voided_change === "RELIC_CONDITION" ? "文物状态变化" : "病害分级变化"}`}
                  />
                )}
              </div>
              {opinion.comment && <p className="opinion-comment">{opinion.comment}</p>}
            </li>
          ))}
        </ol>
      </article>

      <div className="approval-actions">
        {isRestorer && (plan.approval_status === "DRAFT" || plan.approval_status === "REJECTED") && (
          <button className="btn primary" onClick={onSubmit}>
            送审
          </button>
        )}
        {isRestorer && plan.approval_status === "SUBMITTED" && approval.basis_stale && (
          <button className="btn primary" onClick={onResubmit}>
            按当前情况重新送审
          </button>
        )}
        {isRestorer && plan.approval_status === "DRAFT" && plan.content_version > 1 && (
          <button className="btn" onClick={onResubmit}>
            重新送审（v{plan.content_version}）
          </button>
        )}
        {isExpert && approval.can_decide && (
          <>
            {currentExpertDecided && (
              <p className="hint">您已对当前版本出具过意见；两名不同专家需分别登录后同意。</p>
            )}
            <button className="btn primary" disabled={currentExpertDecided} onClick={() => onDecide?.("AGREED")}>
              专家同意
            </button>
            <button className="btn danger" disabled={currentExpertDecided} onClick={() => onDecide?.("REJECTED")}>
              专家驳回
            </button>
          </>
        )}
      </div>
    </div>
  );
}
