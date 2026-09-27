export const LOG_TEMPLATES = {
  RelicItem: ["RelicItem.create", "RelicItem.update", "RelicItem.status", "RelicItem.export"],
  DamageRecord: ["DamageRecord.create", "DamageRecord.update", "DamageRecord.status", "DamageRecord.export"],
  RestorationPlan: ["RestorationPlan.create", "RestorationPlan.update", "RestorationPlan.status", "RestorationPlan.export"],
  RestorationStep: ["RestorationStep.create", "RestorationStep.update", "RestorationStep.status", "RestorationStep.export"],
  ImageVersion: ["ImageVersion.create", "ImageVersion.update", "ImageVersion.status", "ImageVersion.export"],
  PlanApproval: [
    "PlanApproval.submit: plan #{planId} submitted on basis condition={condition} severity={severity}, required approvals={requiredApprovals}",
    "PlanApproval.vote: expert {expertName}#{expertId} {decision} plan #{planId} ({agreed}/{requiredApprovals})",
    "PlanApproval.basisChanged: plan #{planId} pending opinions cleared, field {field} {from} -> {to}",
    "PlanApproval.contentChanged: plan #{planId} content reached version v{version}, opinions reset",
    "PlanApproval.resubmit: plan #{planId} resubmitted on fresh basis, required approvals={requiredApprovals}",
    "PlanApproval.decided: plan #{planId} final status {status}"
  ]
};
