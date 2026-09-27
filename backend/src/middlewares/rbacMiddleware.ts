import type { RequestHandler } from "express";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

/** 角色守卫：方案送审/修订为修复师，出具意见为专家，状态/分级维护为馆员 */
export const rbacMiddleware = (roles: string[] = []): RequestHandler => (req, res, next) => {
  if (roles.length === 0 || roles.includes(req.user?.role) || req.user?.role === "ADMIN") {
    next();
    return;
  }
  res.status(403).json({ code: ERROR_CODES.RBAC_DENIED, message: ERROR_MESSAGES.RBAC_DENIED, required: roles });
};
