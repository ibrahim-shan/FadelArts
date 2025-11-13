import { Router } from "express";
import {
  getProduct,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getPriceRange,
  listColorsInUse,
  listRelatedProducts,
} from "../controllers/products.controller";
import { authRequired } from "../middleware/auth";

const router = Router();

// --- All specific GET routes must come first ---
router.get("/", listProducts);
router.get("/price-range/global", getPriceRange);
router.get("/colors/in-use", listColorsInUse);
router.get("/related", listRelatedProducts); // <-- MOVED UP

// --- Dynamic/parameterized GET routes come last ---
router.get("/:slug", getProduct); // <-- MOVED DOWN

// --- Admin routes ---
router.post("/", authRequired, createProduct);
router.put("/:id", authRequired, updateProduct);
router.delete("/:id", authRequired, deleteProduct);

export default router;
