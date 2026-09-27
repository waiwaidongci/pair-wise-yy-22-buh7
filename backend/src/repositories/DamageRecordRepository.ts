import { seed } from "../seed";
import type { DamageRecord } from "../models/DamageRecord";

const rows: DamageRecord[] = seed.damageRecord.map((row) => ({ ...row }));

export const damageRecordRepository = {
  findAll: (): DamageRecord[] => rows,
  findById: (id: number): DamageRecord | undefined => rows.find((row) => row.id === id),
  findByRelic: (relicId: number): DamageRecord[] => rows.filter((row) => row.relic_id === relicId),
  update: (id: number, patch: Partial<DamageRecord>): DamageRecord | undefined => {
    const row = rows.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  },
  save: (row: DamageRecord): DamageRecord => row
};
