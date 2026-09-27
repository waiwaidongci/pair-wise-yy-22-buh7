import { Router } from "express";
import { relicItemController } from "../controllers/RelicItemController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();
router.get("/", relicItemController.list);
router.post("/", relicItemController.create);
router.patch("/:id/condition", rbacMiddleware(["LIBRARIAN"]), relicItemController.updateCondition);
export default router;
