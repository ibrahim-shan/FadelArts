import { Router } from "express";
import { authRequired } from "../middleware/auth";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller";

const router = Router();

// Admin-protected endpoints
router.get("/", authRequired, listCategories);
router.post("/", authRequired, createCategory);
router.put("/:id", authRequired, updateCategory);
router.delete("/:id", authRequired, deleteCategory);

export default router;
