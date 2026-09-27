import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { appendAuditLog } from "../repositories/dataStore";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ServiceError } from "../utils/ServiceError";
import { restorationPlanService } from "./RestorationPlanService";

export const damageRecordService = {
  list: () => damageRecordRepository.findAll(),

  create: (row: unknown) => {
    const saved = damageRecordRepository.save(row as never);
    appendAuditLog({ actor: "staff", action: LOG_TEMPLATES.DamageRecord[0], target_type: "DamageRecord", target_id: (saved as { id: number }).id });
    return saved;
  },

  // 馆员调整病害分级：引用该病害的在审方案必须重新校验依据
  update: (id: number, patch: { severity?: string; status?: string; position_desc?: string }, actor: string) => {
    const before = damageRecordRepository.findById(id);
    if (!before) throw new ServiceError("DAMAGE_NOT_FOUND", 404);
    // 仓储就地更新，先缓存旧分级
    const previousSeverity = before.severity;
    const updated = damageRecordRepository.update(id, patch);
    if (!updated) throw new ServiceError("DAMAGE_NOT_FOUND", 404);

    if (patch.severity && patch.severity !== previousSeverity) {
      appendAuditLog({
        actor,
        action: `${LOG_TEMPLATES.DamageRecord[2]}: severity ${previousSeverity} -> ${patch.severity}`,
        target_type: "DamageRecord",
        target_id: id
      });
      restorationPlanService.reconcileBasis(before.relic_id, actor);
    }
    return updated;
  }
};
