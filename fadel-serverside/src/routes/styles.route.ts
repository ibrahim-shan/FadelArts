import { Router } from "express";
import { authRequired } from "../middleware/auth";
import {
  listStyles,
  createStyle,
  updateStyle,
  deleteStyle,
} from "../controllers/styles.controller";

const router = Router();

router.get("/", authRequired, listStyles);
router.post("/", authRequired, createStyle);
router.put("/:id", authRequired, updateStyle);
router.delete("/:id", authRequired, deleteStyle);

export default router;
