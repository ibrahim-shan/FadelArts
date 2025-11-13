// In: fadel-serverside/src/controllers/settings.controller.ts

import type { Request, Response } from "express";
import { Setting } from "../models/settings.model";
import { asyncHandler } from "../utils/async";

const MEDIA_KEY = "media";
const CONTACT_KEY = "contact";

// --- THIS FUNCTION IS NOW FIXED ---
// Uses findOneAndUpdate to prevent race conditions
export const getMediaSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await Setting.findOneAndUpdate(
    { key: MEDIA_KEY },
    {
      $setOnInsert: {
        key: MEDIA_KEY,
        media: {
          instagram: { url: "", isVisible: false },
          facebook: { url: "", isVisible: false },
          tiktok: { url: "", isVisible: false },
          whatsapp: { url: "", isVisible: false },
        },
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      projection: { media: 1 }, // Only return the 'media' field
    },
  );

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

// --- THIS FUNCTION IS NOW FIXED ---
// Uses findOneAndUpdate to prevent race conditions
/**
 * @desc    Get contact info settings for admin
 * @route   GET /api/settings/contact
 * @access  Admin
 */
export const getContactSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await Setting.findOneAndUpdate(
    { key: CONTACT_KEY },
    {
      $setOnInsert: {
        key: CONTACT_KEY,
        contactInfo: { email: "", phone: "", location: "", hours: "", mapEmbedUrl: "" },
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      projection: { contactInfo: 1 }, // Only return the 'contactInfo' field
    },
  );

  res.json({ ok: true, settings: settings.contactInfo });
});

/**
 * @desc    Update contact info settings
 * @route   PUT /api/settings/contact
 * @access  Admin
 */
export const updateContactSettings = asyncHandler(async (req: Request, res: Response) => {
  const contactUpdates = req.body;

  const updatedDoc = await Setting.findOneAndUpdate(
    { key: CONTACT_KEY },
    { $set: { contactInfo: contactUpdates } },
    { new: true, upsert: true, runValidators: true },
  );

  res.json({ ok: true, settings: updatedDoc.contactInfo });
});

/**
 * @desc    Get public contact info for the site
 * @route   GET /api/settings/contact/public
 * @access  Public
 */
export const getPublicContactSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await Setting.findOne({ key: CONTACT_KEY });

  if (!settings || !settings.contactInfo) {
    return res.json({ ok: true, info: {} });
  }

  res.json({ ok: true, info: settings.contactInfo });
});
