import { Schema, model, models } from "mongoose";

// This defines one media link's properties
const MediaLinkSchema = new Schema(
  {
    url: { type: String, default: "" },
    isVisible: { type: Boolean, default: false },
  },
  { _id: false },
);

// This defines the main settings document structure
export interface SettingsDoc {
  key: string; // We'll use a key like "media"
  media: {
    instagram: { url: string; isVisible: boolean };
    facebook: { url: string; isVisible: boolean };
    tiktok: { url: string; isVisible: boolean };
    whatsapp: { url: string; isVisible: boolean };
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
  },
  { timestamps: true },
);

export const Setting = models.Setting || model<SettingsDoc>("Setting", SettingsSchema);
