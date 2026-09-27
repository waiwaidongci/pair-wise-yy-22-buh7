import type { Request, Response, NextFunction } from "express";
import { damageRecordService } from "../services/DamageRecordService";

const actorOf = (req: Request) => String((req as unknown as { user?: { id?: number } }).user?.id ?? "staff");

export const damageRecordController = {
  list: (_req: Request, res: Response) => res.json(damageRecordService.list()),
  create: (req: Request, res: Response) => res.status(201).json(damageRecordService.create(req.body)),
  // PATCH /api/damage-record/:id —— 馆员调整病害分级，触发方案依据联动
  update: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(damageRecordService.update(Number(req.params.id), req.body, actorOf(req)));
    } catch (error) {
      next(error);
    }
  }
};
