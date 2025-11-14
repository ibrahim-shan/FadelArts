import { Schema, model, models } from "mongoose";
import type { Types } from "mongoose";

// --- NEW: Define the sub-document for a specific combination ---
export interface ProductVariant {
  _id?: Types.ObjectId;
  options: { name: string; value: string }[]; // e.g., [{ name: "Color", value: "Red" }, { name: "Size", value: "Small" }]
  price: number;
  inventory?: number;
  sku?: string;
}

const ProductVariantSchema = new Schema<ProductVariant>(
  {
    options: {
      type: [new Schema({ name: String, value: String }, { _id: false })],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    inventory: { type: Number, default: 0 },
    sku: { type: String, unique: true, sparse: true, index: true },
  },
  { timestamps: true },
);
// --- END NEW ---

export interface ProductDoc {
  slug: string;
  title: string;
  artist: string;
  price: number; // This will now be the "base" or "default" price
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
  inventory?: number; // Base inventory (if no variants)
  published?: boolean;
  sku?: string;
  barcode?: string;

  // --- RENAMED: from `variants` to `options` ---
  // This stores the *available* options to build selectors, e.g., "Color: [Red, Green]", "Size: [S, M]"
  options?: { name: string; values: string[] }[];

  // --- NEW: This stores the purchasable combinations ---
  productVariants?: ProductVariant[];

  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<ProductDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }, // Base price
    compareAtPrice: { type: Number, min: 0 },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    images: { type: [String], default: [] },
    dimensions: String,
    medium: String,
    year: Number,
    materials: String,
    categories: { type: [String], index: true, default: [] },
    styles: { type: [String], index: true, default: [] },
    colors: { type: [String], index: true, default: [] },
    size: String,
    inventory: { type: Number, default: 0 }, // Base inventory
    published: { type: Boolean, default: true },
    sku: { type: String, unique: true, sparse: true, index: true },
    barcode: { type: String, unique: true, sparse: true, index: true },

    // --- RENAMED: from `variants` to `options` ---
    options: {
      type: [
        new Schema(
          {
            name: { type: String, required: true },
            values: { type: [String], default: [] },
          },
          { _id: false },
        ),
      ],
      default: [],
    },

    // --- NEW: Field for purchasable combinations ---
    productVariants: {
      type: [ProductVariantSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export const Product = models.Product || model<ProductDoc>("Product", ProductSchema);
