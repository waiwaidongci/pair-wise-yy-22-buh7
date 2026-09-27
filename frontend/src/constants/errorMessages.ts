export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  PLAN_NOT_FOUND: "修复方案不存在或已被删除",
  RELIC_NOT_FOUND: "文物藏品不存在",
  DAMAGE_NOT_FOUND: "病害记录不存在",
  PLAN_NOT_SUBMITTED: "方案当前不在待审状态，无法登记专家意见",
  BASIS_STALE: "送审依据已变化：文物状态或病害等级与送审时不一致，待审意见已清空，请重新送审后再表态",
  EXPERT_DUPLICATE: "同一名专家不能重复同意，脆弱/封存文物需要两名不同专家分别同意",
  APPROVAL_THRESHOLD: "脆弱/封存文物尚缺一名不同专家的同意"
};
