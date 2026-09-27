import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { ErrorCode } from "../constants/errorCodes";

/** Service/Controller 分别包装的领域异常，最终由 errorHandlerMiddleware 转成响应 */
export class DomainError extends Error {
  status: number;
  code: ErrorCode;

  constructor(code: ErrorCode, status = 400, detail?: string) {
    super(detail ? `${ERROR_MESSAGES[code]}: ${detail}` : ERROR_MESSAGES[code]);
    this.name = "DomainError";
    this.status = status;
    this.code = code;
  }
}

export const notFound = (code: ErrorCode, detail?: string) => new DomainError(code, 404, detail);
export const validationError = (detail?: string) => new DomainError("VALIDATION_FAILED", 400, detail);
export const conflictError = (code: ErrorCode, detail?: string) => new DomainError(code, 409, detail);

export { ERROR_CODES };
