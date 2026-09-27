import { relicItemRepository } from "../repositories/RelicItemRepository";
import { appendAuditLog } from "../repositories/dataStore";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ServiceError } from "../utils/ServiceError";
import { restorationPlanService } from "./RestorationPlanService";

export const relicItemService = {
  list: () => relicItemRepository.findAll(),

  create: (row: unknown) => {
    const saved = relicItemRepository.save(row as never);
    appendAuditLog({ actor: "staff", action: LOG_TEMPLATES.RelicItem[0], target_type: "RelicItem", target_id: (saved as { id: number }).id });
    return saved;
  },

  // 馆员维护藏品：current_condition 变化必须联动在审方案的依据校验
  update: (id: number, patch: { current_condition?: string; collection_level?: string; storage_location?: string }, actor: string) => {
    const before = relicItemRepository.findById(id);
    if (!before) throw new ServiceError("RELIC_NOT_FOUND", 404);
    // 仓储就地更新，先缓存旧值，否则 before 会被一并改写
    const previousCondition = before.current_condition;
    const updated = relicItemRepository.update(id, patch);
    if (!updated) throw new ServiceError("RELIC_NOT_FOUND", 404);

    if (patch.current_condition && patch.current_condition !== previousCondition) {
      appendAuditLog({
        actor,
        action: `${LOG_TEMPLATES.RelicItem[2]}: ${previousCondition} -> ${patch.current_condition}`,
        target_type: "RelicItem",
        target_id: id
      });
      // 文物状态一变，在审方案的待审意见立即清空并标出依据差异
      restorationPlanService.reconcileBasis(id, actor);
    }
    return updated;
  }
};
