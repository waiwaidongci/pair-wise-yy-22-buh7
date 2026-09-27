import { mockData } from "../mocks/seedData";
import type { DamageRecord } from "../types/DamageRecord";

const endpoint = "/api/damage-record";

export async function listDamageRecord(): Promise<DamageRecord[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return [...(mockData.damageRecord as unknown as DamageRecord[])];
}

export async function saveDamageRecord(payload: DamageRecord) {
  console.info("save DamageRecord", payload);
  return payload;
}

// 馆员调整病害分级（severity 变化会由后端联动清空在审方案意见）
export async function updateDamageRecord(id: number, patch: Partial<DamageRecord>): Promise<DamageRecord> {
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
  const rows = mockData.damageRecord as unknown as DamageRecord[];
  const row = rows.find((item) => item.id === id);
  if (row) Object.assign(row, patch);
  return row!;
}
