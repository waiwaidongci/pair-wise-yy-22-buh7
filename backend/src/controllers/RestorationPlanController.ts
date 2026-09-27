import type { Request, Response } from "express";
import { restorationPlanApprovalService } from "../services/RestorationPlanService";
import { buildPlanDetailDto } from "../constructors/RestorationPlanDtoFactory";
import { DomainError } from "../utils/httpError";

/** Controller 层再包一层，Service/Controller 分别包装异常 */
function run(res: Response, fn: () => unknown) {
  try {
    return res.json(fn());
  } catch (error) {
    if (error instanceof DomainError) {
      return res.status(error.status).json({ code: error.code, message: error.message });
    }
    throw error;
  }
}

export const restorationPlanController = {
  list: (_req: Request, res: Response) =>
    run(res, () => restorationPlanApprovalService.list().map(buildPlanDetailDto)),

  detail: (req: Request, res: Response) =>
    run(res, () => buildPlanDetailDto(restorationPlanApprovalService.detail(Number(req.params.id)))),

  submit: (req: Request, res: Response) =>
    run(res, () => buildPlanDetailDto(restorationPlanApprovalService.submit(Number(req.params.id)))),

  revise: (req: Request, res: Response) =>
    run(res, () =>
      buildPlanDetailDto(
        restorationPlanApprovalService.revise(Number(req.params.id), {
          plan_title: req.body?.plan_title,
          method: req.body?.method,
          risk_assessment: req.body?.risk_assessment
        })
      )
    ),

  resubmit: (req: Request, res: Response) =>
    run(res, () => buildPlanDetailDto(restorationPlanApprovalService.resubmit(Number(req.params.id)))),

  decide: (req: Request, res: Response) => {
    const decision = String(req.body?.decision ?? "").toUpperCase();
    if (decision !== "AGREED" && decision !== "REJECTED") {
      return res.status(400).json({ code: "VALIDATION_FAILED", message: "decision must be AGREED or REJECTED" });
    }
    return run(res, () =>
      buildPlanDetailDto(
        restorationPlanApprovalService.decide(
          Number(req.params.id),
          { id: req.user.id, name: req.user.name },
          decision,
          String(req.body?.comment ?? "")
        )
      )
    );
  }
};
