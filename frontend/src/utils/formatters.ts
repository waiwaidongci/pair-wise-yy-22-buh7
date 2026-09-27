import { RelicConditionText } from "../constants/RelicCondition";
import { DamageSeverityText } from "../constants/DamageSeverity";
import { PlanBasisChangeTypeText, PlanApprovalStatusText } from "../constants/PlanApprovalStatus";
import type { PlanBasisChange } from "../types/RestorationPlan";

export const formatDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("zh-CN");
};
export const formatStatus = (value: string) =>
  PlanApprovalStatusText[value as keyof typeof PlanApprovalStatusText] ?? value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

export const formatCondition = (value: string | null) =>
  value === null ? "—" : RelicConditionText[value as keyof typeof RelicConditionText] ?? value;

export const formatSeverity = (value: string | null) =>
  value === null ? "—" : DamageSeverityText[value as keyof typeof DamageSeverityText] ?? value;

export const formatChangeType = (value: string) =>
  PlanBasisChangeTypeText[value as keyof typeof PlanBasisChangeTypeText] ?? value.replace(/_/g, " ");

/** 依据变化项：标出是哪一项，以及从什么值变成什么值 */
export const formatBasisChange = (change: PlanBasisChange): string =>
  `${formatChangeType(change.change_type)}：${formatValue(change.change_type, change.from_value)} → ${formatValue(
    change.change_type,
    change.to_value
  )}`;

function formatValue(changeType: string, value: string): string {
  if (changeType === "RELIC_CONDITION") return formatCondition(value);
  if (changeType === "DAMAGE_SEVERITY") return formatSeverity(value);
  return value;
}
