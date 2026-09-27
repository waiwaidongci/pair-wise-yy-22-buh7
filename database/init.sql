CREATE TABLE IF NOT EXISTS relic_item (
  id INTEGER PRIMARY KEY,
  relic_code TEXT,
  name TEXT,
  era TEXT,
  material TEXT,
  collection_level TEXT,
  storage_location TEXT,
  current_condition TEXT
);

CREATE TABLE IF NOT EXISTS damage_record (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  damage_type TEXT,
  position_desc TEXT,
  severity TEXT,
  discovered_by TEXT,
  discovered_at TEXT,
  image_url TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS restoration_plan (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  damage_record_id TEXT,
  plan_title TEXT,
  method TEXT,
  risk_assessment TEXT,
  approval_status TEXT,
  owner_id TEXT,
  -- 送审时冻结的审批依据（文物状态/病害分级/送审时间，JSON）
  approval_basis TEXT,
  -- 送审后逐项标出的依据变化（JSON 数组）
  basis_changes TEXT DEFAULT '[]',
  -- 方案内容版本，内容修改即递增
  content_version INTEGER DEFAULT 0,
  -- 已收集意见对应的内容版本
  votes_content_version INTEGER DEFAULT 0,
  -- 待审意见清空原因：BASIS_CHANGED / CONTENT_CHANGED
  opinions_reset_reason TEXT,
  -- 送审依据要求的同意专家人数（脆弱/封存为 2）
  required_approvals INTEGER DEFAULT 1,
  decided_at TEXT
);

-- 专家审批意见：脆弱/封存文物需两名不同专家各一行 APPROVED
CREATE TABLE IF NOT EXISTS plan_approval_vote (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL,
  expert_id INTEGER NOT NULL,
  expert_name TEXT,
  decision TEXT NOT NULL,
  comment TEXT,
  decided_at TEXT,
  UNIQUE (plan_id, expert_id)
);
CREATE INDEX IF NOT EXISTS idx_plan_approval_vote_plan ON plan_approval_vote(plan_id);

CREATE TABLE IF NOT EXISTS restoration_step (
  id INTEGER PRIMARY KEY,
  plan_id TEXT,
  step_order TEXT,
  technique TEXT,
  material_used TEXT,
  operator_id TEXT,
  step_status TEXT,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS image_version (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  plan_id TEXT,
  version_no TEXT,
  image_type TEXT,
  file_path TEXT,
  capture_at TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  detail TEXT,
  created_at TEXT
);
