import { useEffect, useState } from "react";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useSessionStore } from "../stores/SessionStore";
import { updateRelicCondition } from "../api/RelicItem";
import { listRestorationPlan } from "../api/RestorationPlan";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { RelicCondition, RelicConditionText } from "../constants/RelicCondition";
import { formatCondition } from "../utils/formatters";
import type { RelicCondition as RelicConditionValue } from "../constants/RelicCondition";

export function RelicsPage() {
  const { rows, load } = useRelicItemStore();
  const planRows = useRestorationPlanStore((state) => state.rows);
  const setPlanRows = useRestorationPlanStore.setState;
  const role = useSessionStore((state) => state.role);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  const changeCondition = async (id: number, condition: RelicConditionValue) => {
    setBusyId(id);
    setNotice(null);
    await updateRelicCondition(id, condition);
    await load();
    const plans = await listRestorationPlan();
    setPlanRows({ rows: plans });
    const affected = plans.filter((detail) =>
      detail.approval.basis_changes.some((change) => change.change_type === "RELIC_CONDITION")
    );
    setNotice(
      affected.length > 0
        ? `已更新文物状态；${affected.length} 个在审方案依据失效，待审意见已清空并标出“文物状态”变化。`
        : "已更新文物状态；当前没有依据受影响的在审方案。"
    );
    setBusyId(null);
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic-restore / relics</p>
          <h1>文物档案</h1>
          <p className="subtitle">馆员改动藏品状态后，该文物所有在审方案会立即按当前情况核对依据。</p>
        </div>
      </section>

      {notice && <div className="info-banner" role="status">{notice}</div>}

      <section className="panel">
        <h2>藏品列表（{rows.length}）</h2>
        {rows.length === 0 && <EmptyState title="暂无藏品" />}
        <div className="card-list">
          {rows.map((relic) => {
            const linkedPlans = planRows.filter((detail) => detail.plan.relic_id === relic.id);
            const stalePlans = linkedPlans.filter((detail) =>
              detail.approval.basis_changes.some((change) => change.change_type === "RELIC_CONDITION")
            );
            return (
              <article key={relic.id} className="record-card">
                <div className="record-main">
                  <strong>{relic.name}</strong>
                  <span className="muted">{relic.relic_code} · {relic.era} · {relic.material}</span>
                  <span className="muted">{relic.storage_location}</span>
                  <div className="badge-row">
                    <StatusBadge value={relic.current_condition} label={formatCondition(relic.current_condition)} />
                    {stalePlans.length > 0 && (
                      <StatusBadge value="BASIS_STALE" label={`${stalePlans.length} 个方案依据失效`} />
                    )}
                  </div>
                </div>
                <div className="record-action">
                  <label>
                    维护当前状态
                    <select
                      value={relic.current_condition}
                      disabled={(role !== "LIBRARIAN" && role !== "ADMIN") || busyId === relic.id}
                      onChange={(event) => void changeCondition(relic.id, event.target.value as RelicConditionValue)}
                    >
                      {RelicCondition.map((value) => (
                        <option key={value} value={value}>{RelicConditionText[value]}</option>
                      ))}
                    </select>
                  </label>
                  {role !== "LIBRARIAN" && role !== "ADMIN" && (
                    <p className="hint">仅馆员可维护藏品状态</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
