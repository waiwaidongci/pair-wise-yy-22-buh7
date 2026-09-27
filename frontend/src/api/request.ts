import { ERROR_MESSAGES } from "../constants/errorMessages";

export interface SessionActor {
  role: "RESTORER" | "EXPERT" | "LIBRARIAN" | "VIEWER" | "ADMIN";
  userId: number;
  userName: string;
}

const SESSION_KEY = "relic-restore:session:v1";

const DEFAULT_ACTOR: SessionActor = { role: "EXPERT", userId: 901, userName: "周专家" };

export function readSession(): SessionActor {
  if (typeof localStorage !== "undefined") {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        return { ...DEFAULT_ACTOR, ...(JSON.parse(raw) as Partial<SessionActor>) };
      } catch {
        // fall through
      }
    }
  }
  return DEFAULT_ACTOR;
}

export function writeSession(actor: SessionActor) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(actor));
  }
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** 统一请求封装：注入角色头、解析领域错误码；离线时抛错由调用方回退 mock */
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const actor = readSession();
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-role": actor.role,
      "x-user-id": String(actor.userId),
      "x-user-name": encodeURIComponent(actor.userName),
      ...(options.headers ?? {})
    }
  });
  if (!res.ok) {
    let code = `HTTP_${res.status}`;
    let message = "";
    try {
      const body = (await res.json()) as { code?: string; message?: string };
      code = body.code ?? code;
      message = body.message ?? "";
    } catch {
      // non-json error body
    }
    throw new ApiError(res.status, code, message || ERROR_MESSAGES.VALIDATION_FAILED);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
