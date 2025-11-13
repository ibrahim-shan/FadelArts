import { Schema, model, models } from "mongoose";

// Define the structure for a single content block
const ContentBlockSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["paragraph", "heading", "image", "list"],
    },
    // For paragraph or heading
    text: { type: String, sparse: true },
    // For heading
    level: { type: Number, sparse: true },
    // For image
    src: { type: String, sparse: true },
    alt: { type: String, sparse: true },
    caption: { type: String, sparse: true },
    // For list
    items: { type: [String], sparse: true },
  },
  { _id: false },
);

export interface ContentBlock {
  type: "paragraph" | "heading" | "image" | "list";
  text?: string;
  level?: number;
  src?: string;
  alt?: string;
  caption?: string;
  items?: string[];
}

export interface BlogDoc {
  slug: string;
  title: string;
  author: string;
  excerpt: string;
  image: string; // Feature image URL
  content: ContentBlock[];
  publishedAt: Date;
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const BlogSchema = new Schema<BlogDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    excerpt: { type: String, required: true },
    image: { type: String, required: true },
    content: { type: [ContentBlockSchema], default: [] },
    publishedAt: { type: Date, default: () => new Date() },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Blog = models.Blog || model<BlogDoc>("Blog", BlogSchema);
