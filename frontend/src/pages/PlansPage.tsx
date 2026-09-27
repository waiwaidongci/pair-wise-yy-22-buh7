import { useEffect, useMemo, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { ApprovalTimeline } from "../components/common/ApprovalTimeline";
import { ApprovalVotePanel } from "../components/common/ApprovalVotePanel";
import { PlanContentEditor } from "../components/common/PlanContentEditor";
import { BasisChangeTags } from "../components/common/BasisChangeTags";
import { usePlanApproval } from "../hooks/usePlanApproval";
import { isBasisStale, missingApprovals } from "../utils/approvalPolicy";
import { formatMissingApprovals } from "../utils/formatters";
import type { RestorationPlan } from "../types/RestorationPlan";

export function PlansPage() {
  const planStore = useRestorationPlanStore();
  const relicStore = useRelicItemStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expertId, setExpertId] = useState(201);
  const [expertName, setExpertName] = useState("郑专家");

  useEffect(() => {
    void planStore.load();
    void relicStore.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(
    () => planStore.rows.find((plan) => plan.id === selectedId) ?? planStore.rows.find((plan) => plan.approval_status === "SUBMITTED") ?? planStore.rows[0] ?? null,
    [planStore.rows, selectedId]
  );

  const relicName = (relicId: number) => relicStore.rows.find((item) => item.id === relicId)?.name ?? `文物#${relicId}`;

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>修复方案审批</h1>
        </div>
        <label className="expert-switch">
          当前专家
          <input value={expertName} onChange={(e) => setExpertName(e.target.value)} />
          <input type="number" value={expertId} onChange={(e) => setExpertId(Number(e.target.value))} />
        </label>
      </section>

      {planStore.error && <div className="approval-notice error" role="alert">{planStore.error}</div>}

      <section className="plans-layout">
        <div className="panel plan-list">
          <h2>方案列表</h2>
          {planStore.loading && <p className="muted">加载中…</p>}
          {planStore.rows.map((plan) => (
            <PlanListItem
              key={plan.id}
              plan={plan}
              relic={relicName(plan.relic_id)}
              active={selected?.id === plan.id}
              onSelect={() => setSelectedId(plan.id)}
            />
          ))}
        </div>

        {selected && (
          <PlanDetail
            plan={selected}
            relicName={relicName(selected.relic_id)}
            expertId={expertId}
            expertName={expertName}
            onVote={planStore.vote}
            onSave={planStore.updateContent}
            onSubmit={planStore.submit}
          />
        )}
      </section>
    </main>
  );
}

function PlanListItem(props: { plan: RestorationPlan; relic: string; active: boolean; onSelect: () => void }) {
  const { plan } = props;
  const stale = isBasisStale(plan);
  const missing = missingApprovals(plan);
  return (
    <button type="button" className={`row plan-row ${props.active ? "active-row" : ""}`} onClick={props.onSelect}>
      <strong>#{plan.id} {plan.plan_title}</strong>
      <span className="muted">{props.relic}</span>
      <span className="plan-row-badges">
        {stale && <StatusBadge value="依据已变" />}
        {plan.approval_status === "SUBMITTED" && !stale && missing > 0 && <StatusBadge value={`差 ${missing} 票`} />}
        <StatusBadge value={plan.approval_status} />
      </span>
    </button>
  );
}

function PlanDetail(props: {
  plan: RestorationPlan;
  relicName: string;
  expertId: number;
  expertName: string;
  onVote: (id: number, payload: { expert_id: number; expert_name?: string; decision: "APPROVED" | "REJECTED"; comment?: string }) => Promise<void>;
  onSave: (id: number, patch: { plan_title?: string; method?: string; risk_assessment?: string }) => Promise<void>;
  onSubmit: (id: number) => Promise<void>;
}) {
  const { plan } = props;
  const approval = usePlanApproval(plan, props.expertId);
  return (
    <div className="plan-detail">
      <div className="panel">
        <h2>{plan.plan_title} <StatusBadge value={plan.approval_status} /></h2>
        <p className="muted">关联文物：{props.relicName} · 方案版本 v{plan.content_version}</p>
        <BasisChangeTags changes={plan.basis_changes} />
      </div>
      <div className="plan-detail-grid">
        <div>
          <PlanContentEditor plan={plan} onSave={props.onSave} onSubmit={props.onSubmit} />
          <ApprovalVotePanel
            plan={plan}
            expertId={props.expertId}
            expertName={props.expertName}
            onVote={props.onVote}
            onResubmit={props.onSubmit}
          />
        </div>
        <ApprovalTimeline plan={plan} expertId={props.expertId} />
      </div>
      {plan.approval_status === "SUBMITTED" && (
        <p className="muted">
          {approval.basisStale
            ? "该方案依据已失效，审批已挂起；编制人按文物当前情况重新送审前，专家无法表态。"
            : formatMissingApprovals(approval.missing)}
        </p>
      )}
    </div>
  );
}
