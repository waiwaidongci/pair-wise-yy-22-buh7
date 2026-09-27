import type { Request, Response, NextFunction } from "express";
import { restorationPlanService } from "../services/RestorationPlanService";
import type { PlanVotePayload, PlanContentPayload } from "../types/RestorationPlanPayload";

import { ServiceError } from "../utils/ServiceError";

const actorOf = (req: Request) =>
  String((req as unknown as { user?: { id?: number } }).user?.id ?? req.header("x-expert-id") ?? "expert");

export const restorationPlanController = {
  list: (_req: Request, res: Response) => res.json(restorationPlanService.list()),

  detail: (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = restorationPlanService.list().find((row) => row.id === Number(req.params.id));
      if (!plan) throw new ServiceError("PLAN_NOT_FOUND", 404);
      res.json(plan);
    } catch (error) {
      next(error);
    }
  },

  create: (req: Request, res: Response) => res.status(201).json(restorationPlanService.create(req.body)),

  // PUT /api/restoration-plan/:id/content —— 修改方案内容（标题/方法/风险评估）
  updateContent: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(restorationPlanService.updateContent(Number(req.params.id), req.body as PlanContentPayload, actorOf(req)));
    } catch (error) {
      next(error);
    }
  },

  // POST /api/restoration-plan/:id/submit —— 送审并冻结当时依据
  submit: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(restorationPlanService.submit(Number(req.params.id)));
    } catch (error) {
      next(error);
    }
  },

  // POST /api/restoration-plan/:id/votes —— 专家同意/驳回
  vote: (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload: PlanVotePayload = {
        ...(req.body as PlanVotePayload),
        expert_id: (req.body as PlanVotePayload).expert_id ?? Number(req.header("x-expert-id")),
        expert_name: (req.body as PlanVotePayload).expert_name ?? req.header("x-expert-name") ?? undefined
      };
      res.json(restorationPlanService.vote(Number(req.params.id), payload, actorOf(req)));
    } catch (error) {
      next(error);
    }
  }
};
