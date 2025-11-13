// In: fadel-serverside/src/controllers/settings.controller.ts

import type { Request, Response } from "express";
import { Setting } from "../models/settings.model";
import { asyncHandler } from "../utils/async";

const MEDIA_KEY = "media";

// This is your existing function for the admin panel
export const getMediaSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await Setting.findOne({ key: MEDIA_KEY });

  if (!settings) {
    // If no settings exist, create and return the default empty state
    const newSettings = await Setting.create({
      key: MEDIA_KEY,
      media: {
        instagram: { url: "", isVisible: false },
        facebook: { url: "", isVisible: false },
        tiktok: { url: "", isVisible: false },
        whatsapp: { url: "", isVisible: false },
      },
    });
    return res.json({ ok: true, settings: newSettings.media });
  }

  res.json({ ok: true, settings: settings.media });
});

// This is your existing function for the admin panel
export const updateMediaSettings = asyncHandler(async (req: Request, res: Response) => {
  const mediaUpdates = req.body;

  const updatedDoc = await Setting.findOneAndUpdate(
    { key: MEDIA_KEY },
    { $set: { media: mediaUpdates } },
    { new: true, upsert: true, runValidators: true },
  );

  res.json({ ok: true, settings: updatedDoc.media });
});

// --- V V V ADD THIS NEW FUNCTION V V V ---

/**
 * @desc    Get ONLY visible media links for the public site
 * @route   GET /api/settings/media/public
 * @access  Public
 */
export const getPublicMediaSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await Setting.findOne({ key: MEDIA_KEY });

  if (!settings || !settings.media) {
    // If no settings, just return an empty object
    return res.json({ ok: true, links: {} });
  }

  // Filter for visible links and return a simple key:url map
  const publicLinks: { [key: string]: string } = {};

  if (settings.media.instagram?.isVisible && settings.media.instagram.url) {
    publicLinks.instagram = settings.media.instagram.url;
  }
  if (settings.media.facebook?.isVisible && settings.media.facebook.url) {
    publicLinks.facebook = settings.media.facebook.url;
  }
  if (settings.media.tiktok?.isVisible && settings.media.tiktok.url) {
    publicLinks.tiktok = settings.media.tiktok.url;
  }
  if (settings.media.whatsapp?.isVisible && settings.media.whatsapp.url) {
    publicLinks.whatsapp = settings.media.whatsapp.url;
  }

  res.json({ ok: true, links: publicLinks });
});
