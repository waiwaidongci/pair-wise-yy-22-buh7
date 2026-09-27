import { Router } from "express";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";
import { relicItemController } from "../controllers/RelicItemController";

const router = Router();
router.get("/", relicItemController.list);
router.post("/", relicItemController.create);
router.patch("/:id", rbacMiddleware(["CURATOR"]), relicItemController.update);
export default router;
