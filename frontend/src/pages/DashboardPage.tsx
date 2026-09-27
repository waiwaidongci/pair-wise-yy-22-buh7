import { useEffect } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { BasisChangeTags } from "../components/common/BasisChangeTags";
import { agreedVotes, isAwaitingApproval, isBasisStale, missingApprovals } from "../utils/approvalPolicy";

export function DashboardPage() {
  const planStore = useRestorationPlanStore();

  useEffect(() => {
    void planStore.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = planStore.rows;
  const awaiting = rows.filter(isAwaitingApproval);
  const stale = awaiting.filter(isBasisStale);
  const actionable = awaiting.filter((plan) => !isBasisStale(plan));
  const missingVotes = awaiting.reduce((sum, plan) => sum + missingApprovals(plan), 0);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>修复工作台</h1>
        </div>
        <StatusBadge value={stale.length > 0 ? "有方案依据待核" : "审批依据正常"} />
      </section>
      <section className="metrics">
        <StatCard label="待审批方案" value={awaiting.length} />
        <StatCard label="依据已变待重新送审" value={stale.length} />
        <StatCard label="尚缺专家同意票数" value={missingVotes} />
      </section>
      <section className="workbench">
        <div className="panel wide">
          <h2>待办方案</h2>
          {actionable.length === 0 && stale.length === 0 && <p className="muted">暂无待办。</p>}
          <div className="table">
            {stale.map((plan) => (
              <article key={plan.id} className="row">
                <strong>#{plan.id} {plan.plan_title}</strong>
                <BasisChangeTags changes={plan.basis_changes} />
                <StatusBadge value="依据已变" />
              </article>
            ))}
            {actionable.map((plan) => (
              <article key={plan.id} className="row">
                <strong>#{plan.id} {plan.plan_title}</strong>
                <span className="muted">已同意 {agreedVotes(plan).length}/{plan.required_approvals}</span>
                <StatusBadge value={plan.approval_status} />
              </article>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>审批依据把关</h2>
          <p>方案送审时冻结文物状态与病害分级；之后任一项变化即清空待审意见并标注差异。脆弱、封存文物须两名不同专家分别同意；方案内容修改后重新收集意见。</p>
        </div>
      </section>
    </main>
  );
}
