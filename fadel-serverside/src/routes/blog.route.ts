import { Router } from "express";
import { authRequired } from "../middleware/auth";
import {
  listBlogPosts,
  listPublicBlogPosts,
  getBlogPost,
  getPublicBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "../controllers/blog.controller";

const router = Router();

// --- Public Routes ---
router.get("/public", listPublicBlogPosts);
router.get("/public/:slug", getPublicBlogPost);

// --- Admin Routes ---
router.get("/", authRequired, listBlogPosts);
router.post("/", authRequired, createBlogPost);
router.get("/:id", authRequired, getBlogPost);
router.put("/:id", authRequired, updateBlogPost);
router.delete("/:id", authRequired, deleteBlogPost);

export default router;
