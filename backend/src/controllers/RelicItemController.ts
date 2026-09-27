import type { Request, Response, NextFunction } from "express";
import { relicItemService } from "../services/RelicItemService";

const actorOf = (req: Request) => String((req as unknown as { user?: { id?: number } }).user?.id ?? "staff");

export const relicItemController = {
  list: (_req: Request, res: Response) => res.json(relicItemService.list()),
  create: (req: Request, res: Response) => res.status(201).json(relicItemService.create(req.body)),
  // PATCH /api/relic-item/:id —— 馆员更新藏品状态/级别，触发方案依据联动
  update: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(relicItemService.update(Number(req.params.id), req.body, actorOf(req)));
    } catch (error) {
      next(error);
    }
  }
};
