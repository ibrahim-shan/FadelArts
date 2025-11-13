import { Router } from "express";
import { authRequired } from "../middleware/auth";
import {
  getMediaSettings,
  updateMediaSettings,
  getPublicMediaSettings,
  getPublicContactSettings,
  getContactSettings,
  updateContactSettings,
} from "../controllers/settings.controller";

const router = Router();

router.get("/media/public", getPublicMediaSettings);
router.get("/contact/public", getPublicContactSettings);

// GET /api/settings/media
router.get("/media", authRequired, getMediaSettings);

// PUT /api/settings/media
router.put("/media", authRequired, updateMediaSettings);

router.get("/contact", authRequired, getContactSettings);
router.put("/contact", authRequired, updateContactSettings);

export default router;
