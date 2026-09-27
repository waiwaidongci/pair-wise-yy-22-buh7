export const LOG_TEMPLATES = {
  RelicItem: ["RelicItem.create", "RelicItem.update", "RelicItem.status", "RelicItem.export"],
  DamageRecord: ["DamageRecord.create", "DamageRecord.update", "DamageRecord.status", "DamageRecord.export"],
  RestorationPlan: ["RestorationPlan.create", "RestorationPlan.update", "RestorationPlan.status", "RestorationPlan.export"],
  RestorationStep: ["RestorationStep.create", "RestorationStep.update", "RestorationStep.status", "RestorationStep.export"],
  ImageVersion: ["ImageVersion.create", "ImageVersion.update", "ImageVersion.status", "ImageVersion.export"]
};

/** 方案审批领域动作模板：送审、依据失效、内容改版、专家意见、通过、驳回 */
export const PLAN_APPROVAL_LOG_TEMPLATES = {
  submitted: "RestorationPlan.submitted plan#{planId} basis=condition:{condition}|severity:{severity} required={required}",
  basisVoided: "RestorationPlan.basisVoided plan#{planId} change={changeType} opinionsVoided={count}",
  revised: "RestorationPlan.revised plan#{planId} contentVersion v{from}->v{to} opinionsVoided={count}",
  decided: "RestorationPlan.decided plan#{planId} expert={expertId} decision={decision}",
  approved: "RestorationPlan.approved plan#{planId} agreements={agreements}/{required}",
  resubmitted: "RestorationPlan.resubmitted plan#{planId} contentVersion v{version} required={required}"
} as const;
