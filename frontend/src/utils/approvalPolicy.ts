import type { RestorationPlan } from "../types/RestorationPlan";

// 审批派生规则：所有"还差什么、依据是否失效"的判断集中在这里，页面与 hook 共用
export const agreedVotes = (plan: RestorationPlan) => plan.votes.filter((vote) => vote.decision === "APPROVED");

export const rejectedVotes = (plan: RestorationPlan) => plan.votes.filter((vote) => vote.decision === "REJECTED");

export const isBasisStale = (plan: RestorationPlan): boolean => plan.basis_changes.length > 0;

export const isContentStale = (plan: RestorationPlan): boolean =>
  plan.approval_status === "SUBMITTED" && plan.votes_content_version !== plan.content_version;

export const isAwaitingApproval = (plan: RestorationPlan): boolean => plan.approval_status === "SUBMITTED";

// 专家是否还能对该方案表态：在审、依据未变、意见与内容版本一致
export const canVote = (plan: RestorationPlan): boolean =>
  isAwaitingApproval(plan) && !isBasisStale(plan) && !isContentStale(plan);

// 还差几名不同专家同意
export const missingApprovals = (plan: RestorationPlan): number =>
  Math.max(0, plan.required_approvals - agreedVotes(plan).length);

export const hasExpertVoted = (plan: RestorationPlan, expertId: number): boolean =>
  plan.votes.some((vote) => vote.expert_id === expertId);

export const approvalProgress = (plan: RestorationPlan) => ({
  agreed: agreedVotes(plan).length,
  required: plan.required_approvals,
  missing: missingApprovals(plan)
});
