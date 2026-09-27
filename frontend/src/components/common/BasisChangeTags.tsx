import type { BasisChange } from "../../types/RestorationPlan";
import { formatBasisValue, formatDate } from "../../utils/formatters";

// 标出送审后变了哪一项：文物状态 / 病害等级，以及旧值 -> 新值
export function BasisChangeTags({ changes }: { changes: BasisChange[] }) {
  if (changes.length === 0) return null;
  return (
    <div className="basis-changes" role="alert">
      <strong className="basis-changes-title">送审依据已变化，待审意见已清空：</strong>
      {changes.map((change) => (
        <span key={`${change.field}-${change.changed_at}`} className="badge basis-change">
          {change.label}：{formatBasisValue(change.from_value)} → {formatBasisValue(change.to_value)}
          <em className="basis-change-time">{formatDate(change.changed_at)}</em>
        </span>
      ))}
    </div>
  );
}
