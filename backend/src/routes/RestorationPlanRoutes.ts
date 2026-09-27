import { Router } from "express";
import { restorationPlanController } from "../controllers/RestorationPlanController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", restorationPlanController.list);
router.get("/:id", restorationPlanController.detail);
// 送审 / 重新送审 / 方案内容修订：修复师
router.post("/:id/submit", rbacMiddleware(["RESTORER"]), restorationPlanController.submit);
router.post("/:id/resubmit", rbacMiddleware(["RESTORER"]), restorationPlanController.resubmit);
router.patch("/:id/content", rbacMiddleware(["RESTORER"]), restorationPlanController.revise);
// 专家意见：同意 / 驳回
router.post("/:id/decisions", rbacMiddleware(["EXPERT"]), restorationPlanController.decide);

export default router;
