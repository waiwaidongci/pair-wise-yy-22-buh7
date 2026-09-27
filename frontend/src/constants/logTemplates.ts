export const LOG_TEMPLATES = {
  RelicItem: ["文物藏品创建", "文物藏品更新", "文物藏品状态变更", "文物藏品导出"],
  DamageRecord: ["病害记录创建", "病害记录更新", "病害记录状态变更", "病害记录导出"],
  RestorationPlan: ["修复方案创建", "修复方案更新", "修复方案状态变更", "修复方案导出"],
  RestorationStep: ["修复步骤创建", "修复步骤更新", "修复步骤状态变更", "修复步骤导出"],
  ImageVersion: ["影像版本创建", "影像版本更新", "影像版本状态变更", "影像版本导出"]
};

/** 方案审批守护动作（前端操作埋点，与后端 PLAN_APPROVAL_LOG_TEMPLATES 对应） */
export const PLAN_APPROVAL_LOG_TEMPLATES = {
  submitted: "方案送审 #{planId}：固化依据 状态={condition} 分级={severity} 需 {required} 名专家",
  basisVoided: "方案 #{planId} 依据变化（{changeType}），已清空待审意见 {count} 条",
  revised: "方案 #{planId} 内容改版 v{from}->v{to}，重新收集意见（作废 {count} 条）",
  decided: "方案 #{planId} 收到专家 {expertName} 的{decision}",
  resubmitted: "方案 #{planId} 重新送审，内容版本 v{version}，需 {required} 名专家"
} as const;
