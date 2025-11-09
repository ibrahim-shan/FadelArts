import { Schema, model, models } from 'mongoose';

export interface VariantDoc {
  name: string;
  values: string[];
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const VariantSchema = new Schema<VariantDoc>(
  {
    name: { type: String, required: true, unique: true, index: true },
    values: { type: [String], default: [] },
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export const Variant = models.Variant || model<VariantDoc>('Variant', VariantSchema);

