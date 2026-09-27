import { seed } from "../seed";
import type { RelicItem } from "../models/RelicItem";
import type { DamageRecord } from "../models/DamageRecord";
import type { RestorationPlan } from "../models/RestorationPlan";
import type { RestorationStep } from "../models/RestorationStep";
import type { ImageVersion } from "../models/ImageVersion";

// 运行期内存数据：服务启动后馆员、专家的改动都写入这里，避免直接改坏只读种子。
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const dataStore: {
  relicItem: RelicItem[];
  damageRecord: DamageRecord[];
  restorationPlan: RestorationPlan[];
  restorationStep: RestorationStep[];
  imageVersion: ImageVersion[];
  auditLog: Array<{ id: number; actor: string; action: string; target_type: string; target_id: string; detail?: string; created_at: string }>;
} = {
  relicItem: clone(seed.relicItem) as unknown as RelicItem[],
  damageRecord: clone(seed.damageRecord) as unknown as DamageRecord[],
  restorationPlan: clone(seed.restorationPlan) as unknown as RestorationPlan[],
  restorationStep: clone(seed.restorationStep) as unknown as RestorationStep[],
  imageVersion: clone(seed.imageVersion) as unknown as ImageVersion[],
  auditLog: []
};

let auditLogId = 1;

export const appendAuditLog = (entry: {
  actor: string;
  action: string;
  target_type: string;
  target_id: string | number;
  detail?: string;
}) => {
  dataStore.auditLog.unshift({
    id: auditLogId++,
    actor: entry.actor,
    action: entry.action,
    target_type: entry.target_type,
    target_id: String(entry.target_id),
    detail: entry.detail,
    created_at: new Date().toISOString()
  });
  return entry.action;
};
