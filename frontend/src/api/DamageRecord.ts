import { mockData } from "../mocks/seedData";
import { mockApprovalApi } from "../mocks/mockApprovalApi";
import { request } from "./request";
import type { DamageRecord } from "../types/DamageRecord";

const endpoint = "/api/damage-record";

export async function listDamageRecord(): Promise<DamageRecord[]> {
  try {
    return await request<DamageRecord[]>(endpoint);
  } catch (error) {
    if (error instanceof TypeError) return mockApprovalApi.listDamages();
  }
  return [...(mockData.damageRecord as unknown as DamageRecord[])];
}

/** 馆员改动病害等级：后端会同步核对关联在审方案的依据 */
export async function updateDamageSeverity(id: number, severity: string): Promise<DamageRecord> {
  try {
    return await request<DamageRecord>(`${endpoint}/${id}/severity`, {
      method: "PATCH",
      body: JSON.stringify({ severity })
    });
  } catch (error) {
    if (error instanceof TypeError) return mockApprovalApi.updateDamageSeverity(id, severity);
    throw error;
  }
}

export async function saveDamageRecord(payload: DamageRecord) {
  console.info("save DamageRecord", payload);
  return payload;
}
