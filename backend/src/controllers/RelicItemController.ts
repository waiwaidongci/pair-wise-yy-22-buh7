import type { Request, Response } from "express";
import { relicItemService } from "../services/RelicItemService";
import { DomainError } from "../utils/httpError";

export const relicItemController = {
  list: (_req: Request, res: Response) => res.json(relicItemService.list()),
  create: (req: Request, res: Response) => res.status(201).json(relicItemService.create(req.body)),

  /** PATCH /api/relic-item/:id/condition  { current_condition } */
  updateCondition: (req: Request, res: Response) => {
    try {
      const relic = relicItemService.updateCondition(Number(req.params.id), String(req.body?.current_condition ?? ""));
      res.json(relic);
    } catch (error) {
      if (error instanceof DomainError) {
        res.status(error.status).json({ code: error.code, message: error.message });
        return;
      }
      throw error;
    }
  }
};
