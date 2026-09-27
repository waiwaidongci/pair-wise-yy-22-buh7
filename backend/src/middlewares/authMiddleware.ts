import type { RequestHandler } from "express";

export type RequestRole = "RESTORER" | "EXPERT" | "LIBRARIAN" | "VIEWER" | "ADMIN";

export interface RequestUser {
  id: number;
  name: string;
  role: RequestRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: RequestUser;
    }
  }
}

/** 本地评审环境：身份由请求头传入（x-user-id / x-user-name / x-role） */
export const authMiddleware: RequestHandler = (req, _res, next) => {
  const role = (req.header("x-role") ?? "ADMIN") as RequestRole;
  req.user = {
    id: Number(req.header("x-user-id") ?? 1),
    name: req.header("x-user-name") ?? "当前用户",
    role
  };
  next();
};
