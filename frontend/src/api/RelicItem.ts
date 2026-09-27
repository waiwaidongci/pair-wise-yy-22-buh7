import { mockData } from "../mocks/seedData";
import type { RelicItem } from "../types/RelicItem";

const endpoint = "/api/relic-item";

export async function listRelicItem(): Promise<RelicItem[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return [...(mockData.relicItem as unknown as RelicItem[])];
}

export async function saveRelicItem(payload: RelicItem) {
  console.info("save RelicItem", payload);
  return payload;
}

// 馆员更新文物（current_condition 变化会由后端联动清空在审方案意见）
export async function updateRelicItem(id: number, patch: Partial<RelicItem>): Promise<RelicItem> {
  try {
    const res = await fetch(`${endpoint}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (res.ok) return await res.json();
  } catch {
    // mock fallback
  }
  const rows = mockData.relicItem as unknown as RelicItem[];
  const row = rows.find((item) => item.id === id);
  if (row) Object.assign(row, patch);
  return row!;
}
