import { useEffect, useMemo, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useSessionStore } from "../stores/SessionStore";
import { usePlanApproval } from "../hooks/usePlanApproval";
import { ApprovalTimeline } from "../components/common/ApprovalTimeline";
import { StatusBadge } from "../components/common/StatusBadge";
import { SeverityBadge } from "../components/common/SeverityBadge";
import { EmptyState } from "../components/common/EmptyState";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { formatCondition } from "../utils/formatters";
import type { PlanDetail } from "../types/RestorationPlan";
import type { PlanApprovalDecision } from "../constants/PlanApprovalStatus";

function PlanContentForm({
  detail,
  editable,
  onSave
}: {
  detail: PlanDetail;
  editable: boolean;
  onSave: (patch: { plan_title: string; method: string; risk_assessment: string }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    plan_title: detail.plan.plan_title,
    method: detail.plan.method,
    risk_assessment: detail.plan.risk_assessment
  });

  useEffect(() => {
    setForm({
      plan_title: detail.plan.plan_title,
      method: detail.plan.method,
      risk_assessment: detail.plan.risk_assessment
    });
  }, [detail.plan.plan_title, detail.plan.method, detail.plan.risk_assessment]);

  if (!editing) {
    return (
      <div className="plan-content-view">
        <h3>{detail.plan.plan_title}</h3>
        <p><strong>修复方法：</strong>{detail.plan.method}</p>
        <p><strong>风险评估：</strong>{detail.plan.risk_assessment}</p>
        {editable && (
          <>
            <button className="btn" onClick={() => setEditing(true)}>修改方案内容</button>
            <p className="hint">注意：保存修改后内容版本 +1，已收集的待审意见将全部作废，需重新送审。</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="plan-content-form">
      <label>
        方案标题
        <input value={form.plan_title} onChange={(e) => setForm({ ...form, plan_title: e.target.value })} />
      </label>
      <label>
        修复方法（改动即触发内容版本 +1、重新收集意见）
        <textarea rows={3} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} />
      </label>
      <label>
        风险评估
        <textarea
          rows={2}
          value={form.risk_assessment}
          onChange={(e) => setForm({ ...form, risk_assessment: e.target.value })}
        />
      </label>
      <div className="form-actions">
        <button className="btn primary" onClick={() => { onSave(form); setEditing(false); }}>保存修改</button>
        <button className="btn" onClick={() => setEditing(false)}>取消</button>
      </div>
    </div>
  );
}

export function PlansPage() {
  const { rows, loading, error, load, submit, resubmit, revise, decide, clearError } = useRestorationPlanStore();
  const role = useSessionStore((state) => state.role);
  const userName = useSessionStore((state) => state.userName);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const { pageRows } = usePlanApproval(rows);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => rows.find((row) => row.plan.id === selectedId) ?? rows[0] ?? null,
    [rows, selectedId]
  );

  const canEditContent =
    !!selected &&
    (role === "RESTORER" || role === "ADMIN") &&
    selected.plan.approval_status !== "APPROVED" &&
    selected.plan.approval_status !== "ARCHIVED";

  const handleDecide = async (decision: PlanApprovalDecision) => {
    if (!selected) return;
    await decide(selected.plan.id, decision, comment);
    setComment("");
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic-restore / plans</p>
          <h1>修复方案审批</h1>
          <p className="subtitle">
            送审时固化文物状态与病害分级；任一项变化即清空待审意见并标出变化项。
            脆弱、封存文物需两名不同专家分别同意；方案内容修改后重新收集意见。
          </p>
        </div>
        <StatusBadge value={loading ? "LOADING" : "READY"} label={loading ? "加载中" : "数据就绪"} />
      </section>

      {error && (
        <div className="error-banner" role="alert">
          <strong>{ERROR_MESSAGES.VALIDATION_FAILED}</strong>
          <span>{error}</span>
          <button className="btn" onClick={clearError}>知道了</button>
        </div>
      )}

      <section className="split-layout">
        <div className="panel plan-list">
          <h2>方案列表（{rows.length}）</h2>
          {pageRows.length === 0 && <EmptyState title="暂无方案" />}
          {pageRows.map(({ plan, approval }) => (
            <button
              key={plan.id}
              className={"row plan-row" + (selected?.plan.id === plan.id ? " active-row" : "")}
              onClick={() => setSelectedId(plan.id)}
            >
              <strong>{plan.plan_title}</strong>
              <span className="plan-meta">
                <StatusBadge value={plan.approval_status} />
                {plan.required_approvals === 2 && <StatusBadge value="DUAL_EXPERT" label="双专家" />}
                {approval.basis_stale && <StatusBadge value="BASIS_STALE" label="依据已变化" />}
                <span className="agreement-count">
                  {approval.agreed}/{approval.required} 同意
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="panel plan-detail">
          {!selected && <EmptyState title="请选择左侧方案" />}
          {selected && (
            <>
              <div className="basis-current">
                <span>送审状态快照：<strong>{formatCondition(selected.plan.basis_condition)}</strong></span>
                <span>送审分级快照：<SeverityBadge value={selected.plan.basis_severity ?? "—"} /></span>
                <span>当前操作人：{userName}（{role}）</span>
              </div>

              {canEditContent ? (
                <PlanContentForm detail={selected} editable={canEditContent} onSave={(patch) => void revise(selected.plan.id, patch)} />
              ) : (
                <div className="plan-content-view">
                  <h3>{selected.plan.plan_title}</h3>
                  <p><strong>修复方法：</strong>{selected.plan.method}</p>
                  <p><strong>风险评估：</strong>{selected.plan.risk_assessment}</p>
                </div>
              )}

              <ApprovalTimeline
                detail={selected}
                actorRole={role}
                onSubmit={() => void submit(selected.plan.id)}
                onResubmit={() => void resubmit(selected.plan.id)}
                onDecide={(decision) => void handleDecide(decision)}
              />

              {selected.approval.can_decide && (role === "EXPERT" || role === "ADMIN") && (
                <div className="decision-box">
              <label>
                审批意见（{userName}）
                <textarea
                  rows={2}
                  placeholder="同意或驳回前可填写意见"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </label>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
