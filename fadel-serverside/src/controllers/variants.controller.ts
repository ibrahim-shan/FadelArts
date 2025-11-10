import type { Request, Response } from "express";
import { Variant } from "../models/variant.model";
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

export const listVariants = asyncHandler(async (req: Request, res: Response) => {
  const { q, page = "1", pageSize = "20" } = req.query as Record<string, string | undefined>;
  const filter: any = {};
  if (q) filter.name = { $regex: q, $options: "i" };
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const pageSizeNum = Math.min(100, Math.max(1, parseInt(String(pageSize), 10) || 20));
  const skip = (pageNum - 1) * pageSizeNum;
  const [items, total] = await Promise.all([
    Variant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSizeNum).lean(),
    Variant.countDocuments(filter),
  ]);
  res.json({ ok: true, items, total, page: pageNum, pageSize: pageSizeNum });
});

export const createVariant = asyncHandler(async (req: Request, res: Response) => {
  const { name, values } = req.body as { name?: string; values?: string[] };
  if (!name || !name.trim()) return res.status(400).json({ ok: false, error: "Name is required" });
  const slug = slugify(name);
  const exists = await Variant.findOne({ $or: [{ name }, { slug }] }).lean();
  if (exists) return res.status(409).json({ ok: false, error: "Variant already exists" });
  const cleanValues = (values || []).map((v) => String(v).trim()).filter(Boolean);
  const uniqValues = Array.from(new Set(cleanValues));
  const doc = await Variant.create({ name, slug, values: uniqValues });
  res.status(201).json({ ok: true, variant: doc });
});

export const updateVariant = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { name, values } = req.body as { name?: string; values?: string[] };
  const update: any = {};
  if (name) {
    update.name = name;
    update.slug = slugify(name);
  }
  if (values) {
    const clean = (values || []).map((v) => String(v).trim()).filter(Boolean);
    update.values = Array.from(new Set(clean));
  }
  const doc = await Variant.findByIdAndUpdate(id, update, { new: true });
  if (!doc) return res.status(404).json({ ok: false, error: "Not found" });
  res.json({ ok: true, variant: doc });
});

export const deleteVariant = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const v = await Variant.findById(id).lean();
  if (!v) return res.status(404).json({ ok: false, error: "Not found" });
  // Prevent delete if any product references this variant by name
  const inUse = await Product.countDocuments({ "variants.name": v.name });
  if (inUse > 0) {
    return res
      .status(409)
      .json({ ok: false, error: "Variant is in use by products and cannot be deleted." });
  }
  await Variant.findByIdAndDelete(id);
  res.json({ ok: true });
});
