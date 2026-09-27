import { useEffect, useState } from "react";
import { useDamageRecordStore } from "../stores/DamageRecordStore";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useSessionStore } from "../stores/SessionStore";
import { updateDamageSeverity } from "../api/DamageRecord";
import { listRestorationPlan } from "../api/RestorationPlan";
import { StatusBadge } from "../components/common/StatusBadge";
import { SeverityBadge } from "../components/common/SeverityBadge";
import { EmptyState } from "../components/common/EmptyState";
import { DamageSeverity, DamageSeverityText } from "../constants/DamageSeverity";
import { formatSeverity } from "../utils/formatters";
import type { DamageSeverity as DamageSeverityValue } from "../constants/DamageSeverity";

export function DamagesPage() {
  const { rows, load } = useDamageRecordStore();
  const planRows = useRestorationPlanStore((state) => state.rows);
  const setPlanRows = useRestorationPlanStore.setState;
  const role = useSessionStore((state) => state.role);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  const changeSeverity = async (id: number, severity: DamageSeverityValue) => {
    setBusyId(id);
    setNotice(null);
    await updateDamageSeverity(id, severity);
    await load();
    const plans = await listRestorationPlan();
    setPlanRows({ rows: plans });
    const affected = plans.filter((detail) =>
      detail.approval.basis_changes.some((change) => change.change_type === "DAMAGE_SEVERITY")
    );
    setNotice(
      affected.length > 0
        ? `已更新病害分级；${affected.length} 个在审方案依据失效，待审意见已清空并标出“病害分级”变化。`
        : "已更新病害分级；当前没有依据受影响的在审方案。"
    );
    setBusyId(null);
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic-restore / damages</p>
          <h1>病害记录</h1>
          <p className="subtitle">馆员调整病害等级后，关联该病害的在审方案会立即按新分级核对依据。</p>
        </div>
      </section>

      {notice && <div className="info-banner" role="status">{notice}</div>}

      <section className="panel">
        <h2>病害列表（{rows.length}）</h2>
        {rows.length === 0 && <EmptyState title="暂无病害记录" />}
        <div className="card-list">
          {rows.map((damage) => {
            const stalePlans = planRows.filter(
              (detail) =>
                detail.plan.damage_record_id === damage.id &&
                detail.approval.basis_changes.some((change) => change.change_type === "DAMAGE_SEVERITY")
            );
            return (
              <article key={damage.id} className="record-card">
                <div className="record-main">
                  <strong>{damage.damage_type}</strong>
                  <span className="muted">文物 #{damage.relic_id} · {damage.position_desc}</span>
                  <span className="muted">发现人：{damage.discovered_by}</span>
                  <div className="badge-row">
                    <SeverityBadge value={damage.severity} title="当前分级" />
                    <StatusBadge value={damage.status} label={damage.status === "OPEN" ? "未关闭" : damage.status} />
                    {stalePlans.length > 0 && (
                      <StatusBadge value="BASIS_STALE" label={`${stalePlans.length} 个方案依据失效`} />
                    )}
                  </div>
                </div>
                <div className="record-action">
                  <label>
                    维护病害分级（当前：{formatSeverity(damage.severity)}）
                    <select
                      value={damage.severity}
                      disabled={(role !== "LIBRARIAN" && role !== "ADMIN") || busyId === damage.id}
                      onChange={(event) => void changeSeverity(damage.id, event.target.value as DamageSeverityValue)}
                    >
                      {DamageSeverity.map((value) => (
                        <option key={value} value={value}>{DamageSeverityText[value]}</option>
                      ))}
                    </select>
                  </label>
                  {role !== "LIBRARIAN" && role !== "ADMIN" && (
                    <p className="hint">仅馆员可维护病害分级</p>
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
