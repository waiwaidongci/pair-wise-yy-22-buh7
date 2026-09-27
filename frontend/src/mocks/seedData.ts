import type { RelicItem } from "../types/RelicItem";
import type { DamageRecord } from "../types/DamageRecord";
import type { ImageVersion } from "../types/ImageVersion";
import type { RestorationStep } from "../types/RestorationStep";
import type { RestorationPlan, PlanApprovalOpinion } from "../types/RestorationPlan";

export const mockData = {
  "relicItem": [
    {
      "id": 1,
      "relic_code": "QY-001",
      "name": "青铜夔纹鼎",
      "era": "商代晚期",
      "material": "青铜",
      "collection_level": "一级",
      "storage_location": "青铜器库房 A-12",
      "current_condition": "FRAGILE"
    },
    {
      "id": 2,
      "relic_code": "TC-014",
      "name": "彩绘陶仓",
      "era": "汉代",
      "material": "陶",
      "collection_level": "二级",
      "storage_location": "陶器库房 B-03",
      "current_condition": "STABLE"
    },
    {
      "id": 3,
      "relic_code": "SJ-208",
      "name": "丝织品残卷",
      "era": "唐代",
      "material": "丝",
      "collection_level": "一级",
      "storage_location": "纺织品库房恒温柜 C-02",
      "current_condition": "SEALED"
    }
  ] as RelicItem[],
  "damageRecord": [
    {
      "id": 1,
      "relic_id": 1,
      "damage_type": "锈蚀",
      "position_desc": "口沿及腹部片状锈蚀",
      "severity": "HIGH",
      "discovered_by": "张修复",
      "discovered_at": "2026-06-11T09:00:00Z",
      "image_url": "/mock/image-1.png",
      "status": "OPEN"
    },
    {
      "id": 2,
      "relic_id": 2,
      "damage_type": "彩绘起翘",
      "position_desc": "仓盖顶部彩绘层起翘",
      "severity": "MEDIUM",
      "discovered_by": "李修复",
      "discovered_at": "2026-06-12T09:00:00Z",
      "image_url": "/mock/image-2.png",
      "status": "OPEN"
    },
    {
      "id": 3,
      "relic_id": 3,
      "damage_type": "丝纤维脆化",
      "position_desc": "卷轴中部横向折痕脆化",
      "severity": "CRITICAL",
      "discovered_by": "王修复",
      "discovered_at": "2026-06-13T09:00:00Z",
      "image_url": "/mock/image-3.png",
      "status": "OPEN"
    }
  ] as DamageRecord[],
  "restorationPlan": [
    {
      "id": 1,
      "relic_id": 1,
      "damage_record_id": 1,
      "plan_title": "青铜鼎除锈与缓蚀封护方案",
      "method": "机械除锈配合倍半碳酸钠缓蚀，最后 BTA 封护",
      "risk_assessment": "局部矿化严重，去锈力度需逐点控制，存在表层剥落风险",
      "approval_status": "SUBMITTED",
      "owner_id": 101,
      "basis_condition": "FRAGILE",
      "basis_severity": "HIGH",
      "content_version": 1,
      "required_approvals": 2,
      "basis_stale": false,
      "basis_changes": [],
      "submitted_at": "2026-09-20T02:00:00Z"
    },
    {
      "id": 2,
      "relic_id": 2,
      "damage_record_id": 2,
      "plan_title": "陶仓彩绘回贴加固方案",
      "method": "3% B72 丙酮溶液注射回贴，蚕纱轻压固定",
      "risk_assessment": "溶剂挥发快，需控制单次注射量，避免彩绘晕色",
      "approval_status": "APPROVED",
      "owner_id": 102,
      "basis_condition": "STABLE",
      "basis_severity": "MEDIUM",
      "content_version": 1,
      "required_approvals": 1,
      "basis_stale": false,
      "basis_changes": [],
      "submitted_at": "2026-09-15T02:00:00Z"
    },
    {
      "id": 3,
      "relic_id": 3,
      "damage_record_id": 3,
      "plan_title": "丝卷脆化部位托裱修复方案（草稿）",
      "method": "传统浆糊托裱，选用同色绢本加固",
      "risk_assessment": "封存文物，温湿度波动会加速脆化",
      "approval_status": "DRAFT",
      "owner_id": 103,
      "basis_condition": null,
      "basis_severity": null,
      "content_version": 1,
      "required_approvals": 2,
      "basis_stale": false,
      "basis_changes": [],
      "submitted_at": null
    }
  ] as RestorationPlan[],
  "planApprovalOpinion": [
    {
      "id": 1,
      "plan_id": 1,
      "expert_id": 901,
      "expert_name": "周专家",
      "decision": "AGREED",
      "comment": "除锈顺序合理，同意；第二名专家需确认封护厚度。",
      "content_version": 1,
      "voided": false,
      "voided_change": null,
      "created_at": "2026-09-21T03:10:00Z"
    },
    {
      "id": 2,
      "plan_id": 2,
      "expert_id": 902,
      "expert_name": "陈专家",
      "decision": "AGREED",
      "comment": "回贴浓度合适，同意实施。",
      "content_version": 1,
      "voided": false,
      "voided_change": null,
      "created_at": "2026-09-16T06:30:00Z"
    }
  ] as PlanApprovalOpinion[],
  "restorationStep": [
    {
      "id": 1,
      "plan_id": 2,
      "step_order": "1",
      "technique": "注射回贴",
      "material_used": "B72 / 丙酮 / 蚕纱",
      "operator_id": 102,
      "step_status": "IN_PROGRESS",
      "finished_at": ""
    }
  ] as RestorationStep[],
  "imageVersion": [
    {
      "id": 1,
      "relic_id": 1,
      "plan_id": 1,
      "version_no": "v1",
      "image_type": "BEFORE",
      "file_path": "/mock/bronze-before.png",
      "capture_at": "2026-09-10T09:00:00Z",
      "note": "送审前锈蚀现状"
    },
    {
      "id": 2,
      "relic_id": 2,
      "plan_id": 2,
      "version_no": "v1",
      "image_type": "BEFORE",
      "file_path": "/mock/pottery-before.png",
      "capture_at": "2026-09-12T09:00:00Z",
      "note": "彩绘起翘现状"
    }
  ] as ImageVersion[]
};
