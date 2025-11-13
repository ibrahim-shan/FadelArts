import { Schema, model, models } from "mongoose";

// This defines one media link's properties
const MediaLinkSchema = new Schema(
  {
    url: { type: String, default: "" },
    isVisible: { type: Boolean, default: false },
  },
  { _id: false },
);

// --- 1. DEFINE THE CONTACT INFO TYPE ---
const ContactInfoSchema = new Schema(
  {
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    hours: { type: String, default: "" },
    mapEmbedUrl: { type: String, default: "" },
  },
  { _id: false },
);

// This defines the main settings document structure
export interface SettingsDoc {
  key: string; // We'll use a key like "media" or "contact"
  media?: {
    // <-- Make media optional
    instagram: { url: string; isVisible: boolean };
    facebook: { url: string; isVisible: boolean };
    tiktok: { url: string; isVisible: boolean };
    whatsapp: { url: string; isVisible: boolean };
  };
  // --- 2. ADD THE NEW CONTACT INFO FIELD ---
  contactInfo?: {
    email: string;
    phone: string;
    location: string;
    hours: string;
    mapEmbedUrl: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const SettingsSchema = new Schema<SettingsDoc>(
  {
    key: { type: String, required: true, unique: true, index: true },
    media: {
      type: new Schema({
        instagram: MediaLinkSchema,
        facebook: MediaLinkSchema,
        tiktok: MediaLinkSchema,
        whatsapp: MediaLinkSchema,
      }),
      default: () => ({}),
    },
    // --- 3. ADD THE NEW FIELD TO THE SCHEMA ---
    contactInfo: {
      type: ContactInfoSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

export const Setting = models.Setting || model<SettingsDoc>("Setting", SettingsSchema);
