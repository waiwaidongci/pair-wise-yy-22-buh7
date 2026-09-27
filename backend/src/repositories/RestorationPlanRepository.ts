import { seed } from "../seed";
import type { RestorationPlan } from "../models/RestorationPlan";

const rows: RestorationPlan[] = seed.restorationPlan.map((row) => ({
  ...row,
  basis_changes: row.basis_changes.map((change) => ({ ...change }))
}));

export const restorationPlanRepository = {
  findAll: (): RestorationPlan[] => rows,
  findById: (id: number): RestorationPlan | undefined => rows.find((row) => row.id === id),
  findByRelic: (relicId: number): RestorationPlan[] => rows.filter((row) => row.relic_id === relicId),
  save: (row: RestorationPlan): RestorationPlan => row,
  update: (id: number, patch: Partial<RestorationPlan>): RestorationPlan | undefined => {
    const row = rows.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
