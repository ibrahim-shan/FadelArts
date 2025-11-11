import { Router } from "express";
import { authRequired } from "../middleware/auth";
import {
  listStyles,
  createStyle,
  updateStyle,
  deleteStyle,
  listStylesInUse,
} from "../controllers/styles.controller";

const router = Router();

// Public endpoint for in-use styles (for storefront filters)
router.get("/in-use", listStylesInUse);
router.get("/", listStyles);

// Admin-protected management endpoints
router.post("/", authRequired, createStyle);
router.put("/:id", authRequired, updateStyle);
router.delete("/:id", authRequired, deleteStyle);

export default router;
