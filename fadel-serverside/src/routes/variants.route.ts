import { Router } from "express";
import { authRequired } from "../middleware/auth";
import {
  listVariants,
  createVariant,
  updateVariant,
  deleteVariant,
} from "../controllers/variants.controller";

const router = Router();

router.get("/", authRequired, listVariants);
router.post("/", authRequired, createVariant);
router.put("/:id", authRequired, updateVariant);
router.delete("/:id", authRequired, deleteVariant);

export default router;
