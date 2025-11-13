import { Router } from "express";
import { authRequired } from "../middleware/auth";
import {
  getMediaSettings,
  updateMediaSettings,
  getPublicMediaSettings,
} from "../controllers/settings.controller";

const router = Router();

router.get("/media/public", getPublicMediaSettings);

// GET /api/settings/media
router.get("/media", authRequired, getMediaSettings);

// PUT /api/settings/media
router.put("/media", authRequired, updateMediaSettings);

export default router;
