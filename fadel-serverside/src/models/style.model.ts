import { Schema, model, models } from "mongoose";

export interface StyleDoc {
  name: string;
  description?: string;
  slug: string;
  image?: string; // public URL
  createdAt?: Date;
  updatedAt?: Date;
}

const StyleSchema = new Schema<StyleDoc>(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    slug: { type: String, required: true, unique: true, index: true },
    image: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Style = models.Style || model<StyleDoc>("Style", StyleSchema);
