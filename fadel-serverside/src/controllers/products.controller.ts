import type { Request, Response } from "express";
import { Product } from "../models/product.model";
import { asyncHandler } from "../utils/async";
import { getNextSequence, formatSku, formatBarcodeFromSeq } from "../services/sequence";

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    q,
    style,
    category,
    color,
    minPrice,
    maxPrice,
    page = "1",
    pageSize = "12",
    sort = "newest",
  } = req.query as Record<string, string | undefined>;

  const filter: any = { published: true };

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { artist: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }
  if (style) filter.styles = { $in: style.split(",") };
  if (category) filter.categories = { $in: category.split(",") };
  if (color) filter.colors = { $in: color.split(",") };

  const price: any = {};
  if (minPrice) price.$gte = Number(minPrice);
  if (maxPrice) price.$lte = Number(maxPrice);
  if (Object.keys(price).length) filter.price = price;

  let sortSpec: any = { createdAt: -1 };
  if (sort === "price_asc") sortSpec = { price: 1 };
  else if (sort === "price_desc") sortSpec = { price: -1 };
  else if (sort === "newest") sortSpec = { createdAt: -1 };

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const pageSizeNum = Math.min(48, Math.max(1, parseInt(String(pageSize), 10) || 12));
  const skip = (pageNum - 1) * pageSizeNum;

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sortSpec).skip(skip).limit(pageSizeNum).lean(),
    Product.countDocuments(filter),
  ]);

  res.json({ ok: true, items, total, page: pageNum, pageSize: pageSizeNum });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const product = await Product.findOne({ slug, published: true }).lean();
  if (!product) return res.status(404).json({ ok: false, error: "Not found" });
  res.json({ ok: true, product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const {
    slug,
    title,
    artist,
    price,
    compareAtPrice,
    description, // full description
    shortDescription,
    images,
    categories,
    styles,
    colors,
    size,
    year,
    inventory,
    published,
    variants,
  } = req.body as any;

  if (!title || typeof price === "undefined") {
    return res.status(400).json({ ok: false, error: "title and price are required" });
  }

  // Required field validation
  if (!title || !String(title).trim()) {
    return res.status(400).json({ ok: false, error: "Title is required" });
  }
  if (!artist || !String(artist).trim()) {
    return res.status(400).json({ ok: false, error: "Artist is required" });
  }
  if (typeof price !== "number" || isNaN(price)) {
    return res.status(400).json({ ok: false, error: "Price is required" });
  }
  if (!shortDescription || !String(shortDescription).trim()) {
    return res.status(400).json({ ok: false, error: "Short description is required" });
  }
  if (!description || !String(description).trim()) {
    return res.status(400).json({ ok: false, error: "Full description is required" });
  }
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ ok: false, error: "At least one image is required" });
  }
  if (typeof year !== "number" || isNaN(year)) {
    return res.status(400).json({ ok: false, error: "Year is required" });
  }
  if (typeof inventory !== "number" || isNaN(inventory)) {
    return res.status(400).json({ ok: false, error: "Quantity is required" });
  }
  if (!Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({ ok: false, error: "Select at least one category" });
  }

  const seq = await getNextSequence("product");
  const autoSku = formatSku(seq);
  const autoBarcode = formatBarcodeFromSeq(seq);

  const doc = await Product.create({
    slug:
      slug ||
      String(title)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"),
    title,
    artist,
    price,
    compareAtPrice,
    description,
    shortDescription: typeof shortDescription === "string" ? shortDescription : "",
    images,
    categories,
    styles: Array.isArray(styles) ? styles : [],
    colors: Array.isArray(colors) ? colors : [],
    size,
    year: typeof year === "number" ? year : undefined,
    inventory: typeof inventory === "number" ? inventory : 0,
    published: typeof published === "boolean" ? published : true,
    sku: autoSku,
    barcode: autoBarcode,
    // variants can be stored in a flexible way later; accept and keep if provided
    ...(variants ? { variants } : {}),
  });

  res.status(201).json({ ok: true, product: doc });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const update = req.body as any;
  const doc = await Product.findByIdAndUpdate(id, update, { new: true });
  if (!doc) return res.status(404).json({ ok: false, error: "Not found" });
  res.json({ ok: true, product: doc });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const r = await Product.findByIdAndDelete(id);
  if (!r) return res.status(404).json({ ok: false, error: "Not found" });
  res.json({ ok: true });
});
