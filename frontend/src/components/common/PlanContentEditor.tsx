import { useEffect, useState } from "react";
import type { RestorationPlan } from "../../types/RestorationPlan";

type Props = {
  plan: RestorationPlan;
  onSave: (id: number, patch: { plan_title?: string; method?: string; risk_assessment?: string }) => Promise<void>;
  onSubmit?: (id: number) => Promise<void>;
};

// 方案内容编辑：任一内容字段保存都会让待审意见作废并重新收集
export function PlanContentEditor({ plan, onSave, onSubmit }: Props) {
  const [draft, setDraft] = useState({
    plan_title: plan.plan_title,
    method: plan.method,
    risk_assessment: plan.risk_assessment
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft({ plan_title: plan.plan_title, method: plan.method, risk_assessment: plan.risk_assessment });
  }, [plan.id, plan.plan_title, plan.method, plan.risk_assessment]);

  const dirty =
    draft.plan_title !== plan.plan_title || draft.method !== plan.method || draft.risk_assessment !== plan.risk_assessment;

  const save = async () => {
    setBusy(true);
    try {
      const patch: { plan_title?: string; method?: string; risk_assessment?: string } = {};
      if (draft.plan_title !== plan.plan_title) patch.plan_title = draft.plan_title;
      if (draft.method !== plan.method) patch.method = draft.method;
      if (draft.risk_assessment !== plan.risk_assessment) patch.risk_assessment = draft.risk_assessment;
      await onSave(plan.id, patch);
    } finally {
      setBusy(false);
    }
  };

  const field = (label: string, key: keyof typeof draft, multiline = false) => (
    <label className="plan-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={draft[key]} onChange={(event) => setDraft((d) => ({ ...d, [key]: event.target.value }))} disabled={busy} />
      ) : (
        <input value={draft[key]} onChange={(event) => setDraft((d) => ({ ...d, [key]: event.target.value }))} disabled={busy} />
      )}
    </label>
  );

  return (
    <div className="panel plan-editor">
      <h2>方案内容 <span className="muted">v{plan.content_version}</span></h2>
      {field("方案标题", "plan_title")}
      {field("修复方法", "method", true)}
      {field("风险评估", "risk_assessment", true)}
      <div className="vote-actions">
        <button type="button" className="vote-btn approve" disabled={busy || !dirty} onClick={save}>
          保存修改{plan.approval_status === "SUBMITTED" ? "（意见将重新收集）" : ""}
        </button>
        {onSubmit && plan.approval_status !== "SUBMITTED" && plan.approval_status !== "APPROVED" && (
          <button type="button" className="vote-btn resubmit" disabled={busy} onClick={() => onSubmit(plan.id)}>
            送审
          </button>
        )}
      </div>
      {plan.approval_status === "SUBMITTED" && (
        <p className="muted">方案在审期间修改内容，已收集的专家意见会立即清空，需要专家对新版本重新表态。</p>
      )}
    </div>
  );
}
