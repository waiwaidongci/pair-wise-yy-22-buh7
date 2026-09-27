import { mockData } from "../mocks/seedData";
import { mockApprovalApi } from "../mocks/mockApprovalApi";
import { request } from "./request";
import type { RelicItem } from "../types/RelicItem";

const endpoint = "/api/relic-item";

export async function listRelicItem(): Promise<RelicItem[]> {
  try {
    return await request<RelicItem[]>(endpoint);
  } catch (error) {
    if (error instanceof TypeError) return mockApprovalApi.listRelics();
  }
  return [...(mockData.relicItem as unknown as RelicItem[])];
}

/** 馆员改动藏品状态：后端会同步核对该文物在审方案的依据 */
export async function updateRelicCondition(id: number, current_condition: string): Promise<RelicItem> {
  try {
    return await request<RelicItem>(`${endpoint}/${id}/condition`, {
      method: "PATCH",
      body: JSON.stringify({ current_condition })
    });
  } catch (error) {
    if (error instanceof TypeError) return mockApprovalApi.updateRelicCondition(id, current_condition);
    throw error;
  }
}

export async function saveRelicItem(payload: RelicItem) {
  console.info("save RelicItem", payload);
  return payload;
}
