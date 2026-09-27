import { dataStore } from "./dataStore";
import type { RestorationPlan } from "../models/RestorationPlan";

export const restorationPlanRepository = {
  findAll: (): RestorationPlan[] => dataStore.restorationPlan,
  findById: (id: number): RestorationPlan | undefined => dataStore.restorationPlan.find((row) => row.id === id),
  findByRelicId: (relicId: number): RestorationPlan[] => dataStore.restorationPlan.filter((row) => row.relic_id === relicId),
  findByDamageRecordId: (damageRecordId: number): RestorationPlan[] =>
    dataStore.restorationPlan.filter((row) => row.damage_record_id === damageRecordId),
  save: (row: RestorationPlan): RestorationPlan => {
    dataStore.restorationPlan.push(row);
    return row;
  },
  update: (id: number, patch: Partial<RestorationPlan>): RestorationPlan | undefined => {
    const row = dataStore.restorationPlan.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  },
  nextId: (): number => dataStore.restorationPlan.reduce((max, row) => Math.max(max, row.id), 0) + 1
};
