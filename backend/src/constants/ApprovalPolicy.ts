// 脆弱、封存文物的修复方案必须由两名不同专家分别同意
import { RelicCondition } from "./RelicCondition";

export const DUAL_APPROVAL_CONDITIONS: readonly string[] = [RelicCondition[1], RelicCondition[4]];

export const requiredApprovalsForCondition = (condition: string): number =>
  DUAL_APPROVAL_CONDITIONS.includes(condition) ? 2 : 1;
