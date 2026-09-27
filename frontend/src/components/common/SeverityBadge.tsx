import { StatusBadge } from "./StatusBadge";
import { formatSeverity } from "../../utils/formatters";

export function SeverityBadge({ value, title }: { value: string; title?: string }) {
  return (
    <span className="shared-widget severity-badge">
      {title ? <strong>{title}</strong> : null}
      <StatusBadge value={"SEVERITY_" + value} label={formatSeverity(value)} />
    </span>
  );
}
