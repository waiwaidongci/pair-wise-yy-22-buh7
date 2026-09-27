import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { invalidatePlansForBasisChange } from "./RestorationPlanService";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { audit } from "../middlewares/auditLogMiddleware";
import { notFound } from "../utils/httpError";
import { DamageSeverity } from "../constants/DamageSeverity";
import type { DamageRecord } from "../models/DamageRecord";

export const damageRecordService = {
  list: (): DamageRecord[] => damageRecordRepository.findAll(),
  create: (row: DamageRecord): DamageRecord => damageRecordRepository.save(row),

  /**
   * 馆员改动病害等级：更新后立即按当前分级核对关联在审方案，
   * 分级快照不一致的方案作废已有意见并标出 DAMAGE_SEVERITY 变更。
   */
  updateSeverity(id: number, severity: string) {
    const damage = damageRecordRepository.findById(id);
    if (!damage) throw notFound("DAMAGE_NOT_FOUND", `id=${id}`);
    if (!(DamageSeverity as readonly string[]).includes(severity)) {
      throw new TypeError(`unknown DamageSeverity: ${severity}`);
    }
    const from = damage.severity;
    damageRecordRepository.update(id, { severity });
    audit(`${LOG_TEMPLATES.DamageRecord[2]} damage#${id} ${from}->${severity}`, "librarian", "DamageRecord", String(id));
    invalidatePlansForBasisChange(damage.relic_id, "DAMAGE_SEVERITY", from, severity);
    return damageRecordRepository.findById(id);
  }
};
