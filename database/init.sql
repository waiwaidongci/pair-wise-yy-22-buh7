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
  basis_condition TEXT,
  basis_severity TEXT,
  content_version INTEGER DEFAULT 1,
  required_approvals INTEGER DEFAULT 1,
  basis_stale BOOLEAN DEFAULT FALSE,
  submitted_at TEXT
);

CREATE TABLE IF NOT EXISTS plan_basis_change (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER,
  change_type TEXT,
  from_value TEXT,
  to_value TEXT,
  detected_at TEXT
);

CREATE TABLE IF NOT EXISTS plan_approval_opinion (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER,
  expert_id INTEGER,
  expert_name TEXT,
  decision TEXT,
  comment TEXT,
  content_version INTEGER DEFAULT 1,
  voided BOOLEAN DEFAULT FALSE,
  voided_change TEXT,
  created_at TEXT
);

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
  created_at TEXT
);
