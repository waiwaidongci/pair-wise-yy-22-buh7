import { Router } from "express";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";
import { damageRecordController } from "../controllers/DamageRecordController";

const router = Router();
router.get("/", damageRecordController.list);
router.post("/", damageRecordController.create);
router.patch("/:id", rbacMiddleware(["CURATOR"]), damageRecordController.update);
export default router;
