import type { ApprovalBasis } from "../../types/RestorationPlan";
import { formatBasisValue, formatDate } from "../../utils/formatters";
import { requiredApprovalsForCondition } from "../../constants/ApprovalPolicy";

// 送审时冻结的依据：专家看到的是这一版，而不是文物实时状态
export function BasisSnapshotCard({ basis }: { basis: ApprovalBasis | null }) {
  if (!basis) {
    return (
      <div className="panel basis-snapshot">
        <h2>审批依据</h2>
        <p className="muted">方案尚未送审，暂无冻结依据。</p>
      </div>
    );
  }
  const required = requiredApprovalsForCondition(basis.relic_condition);
  return (
    <div className="panel basis-snapshot">
      <h2>送审依据（送审时冻结）</h2>
      <dl className="basis-grid">
        <div>
          <dt>文物状态</dt>
          <dd>{formatBasisValue(basis.relic_condition)}</dd>
        </div>
        <div>
          <dt>病害等级</dt>
          <dd>{formatBasisValue(basis.damage_severity)}</dd>
        </div>
        <div>
          <dt>送审时间</dt>
          <dd>{formatDate(basis.submitted_at)}</dd>
        </div>
        <div>
          <dt>同意门槛</dt>
          <dd>{required} 名不同专家{required > 1 ? "（脆弱/封存件双审）" : ""}</dd>
        </div>
      </dl>
    </div>
  );
}
