import { useEffect, useState } from "react";
import { useDamageRecordStore } from "../stores/DamageRecordStore";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { updateDamageRecord } from "../api/DamageRecord";
import { DamageSeverity, DamageSeverityText } from "../constants/DamageSeverity";
import { isAwaitingApproval } from "../utils/approvalPolicy";
import { formatBasisValue } from "../utils/formatters";
import { StatusBadge } from "../components/common/StatusBadge";
import { SeverityBadge } from "../components/common/SeverityBadge";

// 馆员调整病害分级：在审方案的依据会被自动校验，旧意见清空并标出“病害等级”变化
export function DamagesPage() {
  const damageStore = useDamageRecordStore();
  const planStore = useRestorationPlanStore();
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    void damageStore.load();
    void planStore.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeSeverity = async (id: number, severity: string) => {
    setBusyId(id);
    await updateDamageRecord(id, { severity });
    await Promise.all([damageStore.load(), planStore.load()]);
    setBusyId(null);
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>病害记录</h1>
        </div>
        <StatusBadge value="分级变更联动审批" />
      </section>
      <section className="panel">
        <h2>病害分级维护</h2>
        <p className="muted">
          调整“病害等级”后，引用该病害的在审方案会立即作废已收集意见，方案页标出旧分级 → 新分级，需重新送审后专家才能继续表态。
        </p>
        <div className="table">
          {damageStore.rows.map((damage) => {
            const linked = planStore.rows.filter((plan) => plan.damage_record_id === damage.id && isAwaitingApproval(plan));
            return (
              <article key={damage.id} className="row relic-row">
                <div>
                  <strong>病害 #{damage.id}</strong>
                  <span className="muted"> 文物#{damage.relic_id} · {damage.position_desc}</span>
                  <div><SeverityBadge title="当前分级" value={formatBasisValue(damage.severity)} /></div>
                  <div className="muted">在审方案 {linked.length} 个{linked.length > 0 ? `（#${linked.map((p) => p.id).join("、#")}）` : ""}</div>
                </div>
                <label className="condition-select">
                  病害等级
                  <select
                    value={damage.severity}
                    disabled={busyId === damage.id}
                    onChange={(event) => void changeSeverity(damage.id, event.target.value)}
                  >
                    {DamageSeverity.map((value) => (
                      <option key={value} value={value}>{DamageSeverityText[value]}（{formatBasisValue(value)}）</option>
                    ))}
                  </select>
                </label>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
