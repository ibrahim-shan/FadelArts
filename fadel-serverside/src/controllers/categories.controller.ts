import type { Request, Response } from "express";
import { Category } from "../models/category.model";
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

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const { q, page = "1", pageSize = "20" } = req.query as Record<string, string | undefined>;
  const filter: Record<string, unknown> = {};
  if (q) {
    filter.name = { $regex: q, $options: "i" };
  }
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const pageSizeNum = Math.min(100, Math.max(1, parseInt(String(pageSize), 10) || 20));
  const skip = (pageNum - 1) * pageSizeNum;
  const [items, total] = await Promise.all([
    Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSizeNum).lean(),
    Category.countDocuments(filter),
  ]);
  res.json({ ok: true, items, total, page: pageNum, pageSize: pageSizeNum });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body as { name?: string; description?: string };
  if (!name || !name.trim()) {
    return res.status(400).json({ ok: false, error: "Name is required" });
  }
  const slug = slugify(name);
  const exists = await Category.findOne({ $or: [{ name }, { slug }] }).lean();
  if (exists) {
    return res.status(409).json({ ok: false, error: "Category already exists" });
  }
  const cat = await Category.create({ name, description: description ?? "", slug });
  res.status(201).json({ ok: true, category: cat });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { name, description } = req.body as { name?: string; description?: string };
  const update: Record<string, unknown> = {};
  if (name) {
    update.name = name;
    update.slug = slugify(name);
  }
  if (typeof description === "string") {
    update.description = description;
  }
  const cat = await Category.findByIdAndUpdate(id, update, { new: true });
  if (!cat) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  res.json({ ok: true, category: cat });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const inUse = await Product.countDocuments({ categories: id });
  if (inUse > 0) {
    return res
      .status(409)
      .json({ ok: false, error: "Category is in use by products and cannot be deleted." });
  }
  const r = await Category.findByIdAndDelete(id);
  if (!r) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  res.json({ ok: true });
});

export const listCategoriesInUse = asyncHandler(async (_req: Request, res: Response) => {
  const ids = await Product.distinct("categories", { published: true });
  const filtered = (ids || []).filter(Boolean);
  if (!filtered.length) {
    return res.json({ ok: true, items: [], total: 0, page: 1, pageSize: 0 });
  }
  const items = await Category.find({ _id: { $in: filtered } })
    .select("name")
    .lean();
  res.json({ ok: true, items, total: items.length, page: 1, pageSize: items.length });
});
