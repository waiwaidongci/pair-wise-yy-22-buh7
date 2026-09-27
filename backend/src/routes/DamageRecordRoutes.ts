import { Router } from "express";
import { damageRecordController } from "../controllers/DamageRecordController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();
router.get("/", damageRecordController.list);
router.post("/", damageRecordController.create);
router.patch("/:id/severity", rbacMiddleware(["LIBRARIAN"]), damageRecordController.updateSeverity);
export default router;
