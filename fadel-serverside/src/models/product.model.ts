import { Schema, model, models } from 'mongoose';

export interface ProductDoc {
  slug: string;
  title: string;
  artist: string;
  price: number;
  compareAtPrice?: number;
  description: string; // full description
  shortDescription?: string; // brief/summary
  images: string[];
  dimensions?: string;
  medium?: string;
  year?: number;
  materials?: string;
  categories?: string[];
  styles?: string[];
  colors?: string[];
  size?: string;
  inventory?: number;
  published?: boolean;
  sku?: string;
  barcode?: string;
  variants?: { name: string; values: string[] }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<ProductDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    description: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    images: { type: [String], default: [] },
    dimensions: String,
    medium: String,
    year: Number,
    materials: String,
    categories: { type: [String], index: true, default: [] },
    styles: { type: [String], index: true, default: [] },
    colors: { type: [String], index: true, default: [] },
    size: String,
    inventory: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    sku: { type: String, unique: true, sparse: true, index: true },
    barcode: { type: String, unique: true, sparse: true, index: true },
    variants: {
      type: [
        new Schema(
          {
            name: { type: String, required: true },
            values: { type: [String], default: [] },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Product = models.Product || model<ProductDoc>('Product', ProductSchema);
