import { dataStore } from "./dataStore";
import type { RelicItem } from "../models/RelicItem";

export const relicItemRepository = {
  findAll: (): RelicItem[] => dataStore.relicItem,
  findById: (id: number): RelicItem | undefined => dataStore.relicItem.find((row) => row.id === id),
  save: (row: RelicItem): RelicItem => {
    dataStore.relicItem.push(row);
    return row;
  },
  update: (id: number, patch: Partial<RelicItem>): RelicItem | undefined => {
    const row = dataStore.relicItem.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
