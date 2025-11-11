import { Router } from "express";
import {
  getProduct,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getPriceRange,
} from "../controllers/products.controller";
import { authRequired } from "../middleware/auth";

const router = Router();

router.get("/", listProducts);
router.get("/price-range/global", getPriceRange);
router.get("/:slug", getProduct);
router.post("/", authRequired, createProduct);
router.put("/:id", authRequired, updateProduct);
router.delete("/:id", authRequired, deleteProduct);

export default router;
