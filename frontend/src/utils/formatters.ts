export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

// 审批依据/进度格式化：多页面共用，改文案只需动这里
export const formatBasisValue = (value: string) =>
  ({
    STABLE: "稳定",
    FRAGILE: "脆弱",
    DAMAGED: "已损",
    IN_RESTORATION: "修复中",
    SEALED: "封存",
    LOW: "低",
    MEDIUM: "中",
    HIGH: "高",
    CRITICAL: "严重"
  }[value] ?? value);

export const formatApprovalProgress = (agreed: number, required: number) =>
  `已同意 ${agreed}/${required} 名专家`;

export const formatMissingApprovals = (missing: number) =>
  missing > 0 ? `还差 ${missing} 名不同专家同意` : "同意人数已满足";
