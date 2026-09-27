import { seed } from "../seed";
import type { RelicItem } from "../models/RelicItem";

const rows: RelicItem[] = seed.relicItem.map((row) => ({ ...row }));

export const relicItemRepository = {
  findAll: (): RelicItem[] => rows,
  findById: (id: number): RelicItem | undefined => rows.find((row) => row.id === id),
  update: (id: number, patch: Partial<RelicItem>): RelicItem | undefined => {
    const row = rows.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  },
  save: (row: RelicItem): RelicItem => row
};
