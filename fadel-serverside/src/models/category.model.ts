import { Schema, model, models } from "mongoose";

export interface CategoryDoc {
  name: string;
  description?: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true },
);

export const Category = models.Category || model<CategoryDoc>("Category", CategorySchema);
