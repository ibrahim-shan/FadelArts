import { Router } from "express";
import { health } from "../controllers/health.controller";
import products from "./products.route";
import auth from "./auth.route";
import categories from "./categories.route";
import variants from "./variants.route";
import styles from "./styles.route";
import settings from "./settings.route";
import blogs from "./blog.route";

const router = Router();

router.get("/health", health);
router.use("/auth", auth);
router.use("/products", products);
router.use("/categories", categories);
router.use("/variants", variants);
router.use("/styles", styles);
router.use("/settings", settings);
router.use("/blogs", blogs);

export default router;
