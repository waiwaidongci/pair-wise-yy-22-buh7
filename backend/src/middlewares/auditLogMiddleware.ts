import type { RequestHandler } from "express";

export interface AuditLogEntry {
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  created_at: string;
}

/** 与 database/init.sql 的 audit_log 表对应，保存进程内审批/状态变更记录 */
export const auditLogs: AuditLogEntry[] = [];

/** Service 层领域动作统一走这里，保证所有写操作都记录日志 */
export function audit(message: string, actor = "system", targetType = "RestorationPlan", targetId = "-"): AuditLogEntry {
  const entry: AuditLogEntry = {
    actor,
    action: message,
    target_type: targetType,
    target_id: String(targetId),
    created_at: new Date().toISOString()
  };
  auditLogs.push(entry);
  console.info("audit", entry.action);
  return entry;
}

export const auditLogMiddleware: RequestHandler = (req, _res, next) => {
  audit(`${req.method} ${req.path}`, String((req as { user?: { id?: number } }).user?.id ?? "anon"), "HttpRequest", req.path);
  next();
};
