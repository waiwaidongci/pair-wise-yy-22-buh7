import type { Request, Response } from "express";
import { damageRecordService } from "../services/DamageRecordService";
import { DomainError } from "../utils/httpError";

export const damageRecordController = {
  list: (_req: Request, res: Response) => res.json(damageRecordService.list()),
  create: (req: Request, res: Response) => res.status(201).json(damageRecordService.create(req.body)),

  /** PATCH /api/damage-record/:id/severity  { severity } */
  updateSeverity: (req: Request, res: Response) => {
    try {
      const damage = damageRecordService.updateSeverity(Number(req.params.id), String(req.body?.severity ?? ""));
      res.json(damage);
    } catch (error) {
      if (error instanceof DomainError) {
        res.status(error.status).json({ code: error.code, message: error.message });
        return;
      }
      throw error;
    }
  }
};
