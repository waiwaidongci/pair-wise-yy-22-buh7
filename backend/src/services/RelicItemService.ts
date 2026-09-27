import { relicItemRepository } from "../repositories/RelicItemRepository";
import { invalidatePlansForBasisChange } from "./RestorationPlanService";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { audit } from "../middlewares/auditLogMiddleware";
import { notFound } from "../utils/httpError";
import { RelicCondition } from "../constants/RelicCondition";
import type { RelicItem } from "../models/RelicItem";

export const relicItemService = {
  list: (): RelicItem[] => relicItemRepository.findAll(),
  create: (row: RelicItem): RelicItem => relicItemRepository.save(row),

  /**
   * 馆员改动藏品状态：更新后立即按当前情况核对该文物所有在审方案，
   * 状态快照不一致的方案作废已有意见并标出 RELIC_CONDITION 变更。
   */
  updateCondition(id: number, current_condition: string) {
    const relic = relicItemRepository.findById(id);
    if (!relic) throw notFound("RELIC_NOT_FOUND", `id=${id}`);
    if (!(RelicCondition as readonly string[]).includes(current_condition)) {
      throw new TypeError(`unknown RelicCondition: ${current_condition}`);
    }
    const from = relic.current_condition;
    relicItemRepository.update(id, { current_condition });
    audit(`${LOG_TEMPLATES.RelicItem[2]} relic#${id} ${from}->${current_condition}`, "librarian", "RelicItem", String(id));
    invalidatePlansForBasisChange(id, "RELIC_CONDITION", from, current_condition);
    return relicItemRepository.findById(id);
  }
};
