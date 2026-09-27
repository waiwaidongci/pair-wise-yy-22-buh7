import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export type ErrorCode = keyof typeof ERROR_CODES;

export class ServiceError extends Error {
  status: number;
  code: ErrorCode;

  constructor(code: ErrorCode, status = 400, message?: string) {
    super(message ?? ERROR_MESSAGES[code]);
    this.name = "ServiceError";
    this.status = status;
    this.code = code;
  }
}
