import { dataStore } from "./dataStore";
import type { DamageRecord } from "../models/DamageRecord";

export const damageRecordRepository = {
  findAll: (): DamageRecord[] => dataStore.damageRecord,
  findById: (id: number): DamageRecord | undefined => dataStore.damageRecord.find((row) => row.id === id),
  findByRelicId: (relicId: number): DamageRecord[] => dataStore.damageRecord.filter((row) => row.relic_id === relicId),
  save: (row: DamageRecord): DamageRecord => {
    dataStore.damageRecord.push(row);
    return row;
  },
  update: (id: number, patch: Partial<DamageRecord>): DamageRecord | undefined => {
    const row = dataStore.damageRecord.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
