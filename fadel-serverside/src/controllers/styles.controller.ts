import type { Request, Response } from "express";
import { Style } from "../models/style.model";
import { Product } from "../models/product.model";
import { asyncHandler } from "../utils/async";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Public: list all styles (with pagination)
export const listStyles = asyncHandler(async (req: Request, res: Response) => {
  const { q, page = "1", pageSize = "20" } = req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = {};
  if (q) {
    filter.name = { $regex: q, $options: "i" };
  }

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const pageSizeNum = Math.min(100, Math.max(1, parseInt(String(pageSize), 10) || 20));
  const skip = (pageNum - 1) * pageSizeNum;

  const [items, total] = await Promise.all([
    Style.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSizeNum).lean(),
    Style.countDocuments(filter),
  ]);

  res.json({ ok: true, items, total, page: pageNum, pageSize: pageSizeNum });
});

// Public: styles currently used by published products
export const listStylesInUse = asyncHandler(async (_req: Request, res: Response) => {
  const usedStyleNames = await Product.distinct("styles", { published: true });
  const items = await Style.find({ name: { $in: usedStyleNames } }).lean();
  res.json({ ok: true, items, total: items.length, page: 1, pageSize: items.length });
});

// Admin: create a new style
export const createStyle = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image } = req.body as {
    name?: string;
    description?: string;
    image?: string;
  };

  if (!name || !name.trim()) {
    return res.status(400).json({ ok: false, error: "Name is required" });
  }

  const slug = slugify(name);
  const exists = await Style.findOne({ $or: [{ name }, { slug }] }).lean();
  if (exists) {
    return res.status(409).json({ ok: false, error: "Style already exists" });
  }

  const doc = await Style.create({ name, slug, description, image });
  res.status(201).json({ ok: true, style: doc });
});

// Admin: update an existing style
export const updateStyle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { name, description, image } = req.body as {
    name?: string;
    description?: string;
    image?: string;
  };

  const update: Record<string, unknown> = { description, image };
  if (name) {
    update.name = name;
    update.slug = slugify(name);
  }

  const doc = await Style.findByIdAndUpdate(id, update, { new: true });
  if (!doc) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  res.json({ ok: true, style: doc });
});

// Admin: delete a style (only if not used)
export const deleteStyle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const v = await Style.findById(id);
  if (!v) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }

  const inUse = await Product.countDocuments({ styles: v.name });
  if (inUse > 0) {
    return res
      .status(409)
      .json({ ok: false, error: "Style is in use by products and cannot be deleted." });
  }

  await Style.findByIdAndDelete(id);
  res.json({ ok: true });
});
