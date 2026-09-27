import { Router } from "express";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";
import { restorationPlanController } from "../controllers/RestorationPlanController";

const router = Router();

router.get("/", restorationPlanController.list);
router.get("/:id", restorationPlanController.detail);
router.post("/", restorationPlanController.create);
// 方案编制人送审
router.post("/:id/submit", rbacMiddleware(["RESTORER"]), restorationPlanController.submit);
// 专家对当前版本表态
router.post("/:id/votes", rbacMiddleware(["EXPERT"]), restorationPlanController.vote);
// 修改方案内容，触发意见重新收集
router.put("/:id/content", rbacMiddleware(["RESTORER"]), restorationPlanController.updateContent);

export default router;
