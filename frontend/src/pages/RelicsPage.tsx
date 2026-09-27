import { useEffect, useState } from "react";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { updateRelicItem } from "../api/RelicItem";
import { RelicCondition, RelicConditionText } from "../constants/RelicCondition";
import { isAwaitingApproval } from "../utils/approvalPolicy";
import { formatBasisValue } from "../utils/formatters";
import { StatusBadge } from "../components/common/StatusBadge";

// 馆员维护文物状态：保存后在审方案的依据会被自动校验，意见清空并标出差异
export function RelicsPage() {
  const relicStore = useRelicItemStore();
  const planStore = useRestorationPlanStore();
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    void relicStore.load();
    void planStore.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeCondition = async (id: number, condition: string) => {
    setBusyId(id);
    await updateRelicItem(id, { current_condition: condition });
    await Promise.all([relicStore.load(), planStore.load()]);
    setBusyId(null);
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>文物档案</h1>
        </div>
        <StatusBadge value="状态变更联动审批" />
      </section>
      <section className="panel">
        <h2>藏品状态维护</h2>
        <p className="muted">
          修改“文物状态”后，任何引用本文物、正在审批中的修复方案都会立即清空待审意见，并在方案页标出变化项；专家须待重新送审后才能再次表态。脆弱/封存件重新送审时门槛为两名不同专家。
        </p>
        <div className="table">
          {relicStore.rows.map((relic) => {
            const pendingPlans = planStore.rows.filter((plan) => plan.relic_id === relic.id && isAwaitingApproval(plan));
            return (
              <article key={relic.id} className="row relic-row">
                <div>
                  <strong>{relic.name}</strong>
                  <span className="muted"> {relic.relic_code} · {relic.material}</span>
                  <div className="muted">在审方案 {pendingPlans.length} 个{pendingPlans.length > 0 ? `（#${pendingPlans.map((p) => p.id).join("、#")}）` : ""}</div>
                </div>
                <label className="condition-select">
                  当前状态
                  <select
                    value={relic.current_condition}
                    disabled={busyId === relic.id}
                    onChange={(event) => void changeCondition(relic.id, event.target.value)}
                  >
                    {RelicCondition.map((value) => (
                      <option key={value} value={value}>{RelicConditionText[value]}（{formatBasisValue(value)}）</option>
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
