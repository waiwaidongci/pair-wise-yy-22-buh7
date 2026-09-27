export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  PLAN_NOT_FOUND: "修复方案不存在",
  RELIC_NOT_FOUND: "文物藏品不存在",
  DAMAGE_NOT_FOUND: "病害记录不存在",
  PLAN_NOT_SUBMITTABLE: "只有草稿或已驳回的方案可以送审",
  PLAN_NOT_DECIDABLE: "只有依据有效的在审方案可以出具意见",
  PLAN_BASIS_STALE: "送审依据已变化，历史意见已清空，请修复师重新送审后再出具意见",
  PLAN_DUPLICATE_EXPERT: "同一名专家对同一版本只能出具一次意见",
  PLAN_QUORUM_MISMATCH: "同意人数门槛只能是 1 或 2"
};
