import { useEffect } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { formatBasisChange } from "../utils/formatters";

export function DashboardPage() {
  const { rows, load } = useRestorationPlanStore();

  useEffect(() => {
    void load();
  }, [load]);

  const pending = rows.filter((detail) => detail.plan.approval_status === "SUBMITTED");
  const stale = pending.filter((detail) => detail.approval.basis_stale);
  const waitingDual = pending.filter((detail) => detail.plan.required_approvals === 2 && detail.approval.remaining > 0);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic-restore / dashboard</p>
          <h1>修复工作台</h1>
        </div>
      </section>

      <section className="metrics">
        <StatCard label="待审批方案" value={pending.length} />
        <StatCard label="依据已变化待重送" value={stale.length} />
        <StatCard label="双专家方案缺同意" value={waitingDual.reduce((sum, d) => sum + d.approval.remaining, 0)} />
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>待审批方案</h2>
          {pending.length === 0 && <EmptyState title="当前没有待审批方案" />}
          <div className="table">
            {pending.map((detail) => (
              <article key={detail.plan.id} className="row">
                <strong>{detail.plan.plan_title}</strong>
                <span>
                  {detail.approval.agreed}/{detail.approval.required} 同意
                  {detail.approval.remaining > 0 && `（还差 ${detail.approval.remaining} 名）`}
                </span>
                {detail.approval.basis_stale ? (
                  <StatusBadge value="BASIS_STALE" label="依据已变化" />
                ) : (
                  <StatusBadge value="SUBMITTED" />
                )}
              </article>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>依据变化提醒</h2>
          {stale.length === 0 && <p className="hint">所有在审方案的依据均与送审时一致。</p>}
          <ul className="stale-list">
            {stale.map((detail) => (
              <li key={detail.plan.id}>
                <strong>{detail.plan.plan_title}</strong>
                <ul>
                  {detail.approval.basis_changes.map((change, index) => (
                    <li key={index}>{formatBasisChange(change)}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
