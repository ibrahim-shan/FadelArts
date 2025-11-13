import type { Request, Response } from "express";
import { Product, type ProductDoc } from "../models/product.model";
import { Variant } from "../models/variant.model";
import { asyncHandler } from "../utils/async";
import { getNextSequence, formatSku, formatBarcodeFromSeq } from "../services/sequence";
import { Category } from "../models/category.model";

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

  const filter: Record<string, unknown> = { published: true };

  if (q) {
    const searchRegex = { $regex: q, $options: "i" };
    const matchingCategories = await Category.find({ name: searchRegex }, { _id: 1 }).lean();
    const categoryIds = matchingCategories.map((c) => c._id);
    filter.$or = [
      { title: searchRegex },
      { artist: searchRegex },
      { description: searchRegex },
      { styles: searchRegex },
      { categories: { $in: categoryIds } },
    ];
  }

  if (style) {
    filter.styles = { $in: style.split(",") };
  }
  if (category) {
    filter.categories = { $in: category.split(",") };
  }
  if (color) {
    filter.colors = { $in: color.split(",") };
  }

  const price: Record<string, number> = {};
  if (minPrice) {
    price.$gte = Number(minPrice);
  }
  if (maxPrice) {
    price.$lte = Number(maxPrice);
  }
  if (Object.keys(price).length) {
    filter.price = price;
  }

  const variantDocs = await Variant.find().select("slug").lean();
  const variantSlugs = variantDocs.map((v) => v.slug);
  const variantFilters: Record<string, unknown>[] = [];

  for (const key in req.query) {
    if (variantSlugs.includes(key)) {
      const value = req.query[key];
      if (typeof value === "string" && value.length > 0) {
        const values = value.split(",");
        variantFilters.push({
          variants: {
            $elemMatch: { slug: key, values: { $in: values } },
          },
        });
      }
    }
  }

  if (variantFilters.length > 0) {
    filter.$and = variantFilters;
  }

  let sortSpec: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === "price_asc") {
    sortSpec = { price: 1 };
  } else if (sort === "price_desc") {
    sortSpec = { price: -1 };
  } else if (sort === "newest") {
    sortSpec = { createdAt: -1 };
  }

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
  if (!product) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  res.json({ ok: true, product });
});

export const listColorsInUse = asyncHandler(async (_req: Request, res: Response) => {
  const colors = await Product.distinct("colors", { published: true });
  const filtered = (colors || []).filter((c) => typeof c === "string" && c.trim().length);
  res.json({ ok: true, items: filtered });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;

  const {
    slug,
    title,
    artist,
    price,
    compareAtPrice,
    description,
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
  } = body;

  if (!title || typeof price === "undefined") {
    return res.status(400).json({ ok: false, error: "title and price are required" });
  }

  if (!String(title).trim()) {
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
      (slug as string) ||
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
    ...(variants ? { variants } : {}),
  });

  res.status(201).json({ ok: true, product: doc });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const update = req.body as Record<string, unknown>;

  const existingProduct = await Product.findById(id);
  if (!existingProduct) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }

  if (update.price !== undefined && update.price !== null) {
    const newPrice = Number(update.price);
    const oldPrice = existingProduct.price;

    if (!isNaN(newPrice)) {
      if (newPrice < oldPrice) {
        update.compareAtPrice = oldPrice;
      } else if (newPrice >= oldPrice) {
        update.compareAtPrice = null;
      }
    }
  }

  const doc = await Product.findByIdAndUpdate(id, update, { new: true });
  if (!doc) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  res.json({ ok: true, product: doc });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const r = await Product.findByIdAndDelete(id);
  if (!r) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  res.json({ ok: true });
});

export const listRelatedProducts = asyncHandler(async (req: Request, res: Response) => {
  const { currentSlug, categories, styles, colors } = req.query as Record<
    string,
    string | undefined
  >;

  if (!currentSlug) {
    return res.json({ ok: true, items: [] });
  }

  const baseFilter: Record<string, unknown> = {
    published: true,
    slug: { $ne: currentSlug },
  };

  const orConditions: Record<string, unknown>[] = [];
  if (categories) {
    orConditions.push({ categories: { $in: categories.split(",") } });
  }
  if (styles) {
    orConditions.push({ styles: { $in: styles.split(",") } });
  }
  if (colors) {
    orConditions.push({ colors: { $in: colors.split(",") } });
  }

  let items: ProductDoc[] = [];

  if (orConditions.length > 0) {
    const relatedFilter = { ...baseFilter, $or: orConditions };
    items = await Product.find(relatedFilter).sort({ createdAt: -1 }).limit(4);
  }

  if (items.length === 0) {
    items = await Product.find(baseFilter).sort({ createdAt: -1 }).limit(4);
  }

  res.json({ ok: true, items });
});

export const getPriceRange = asyncHandler(async (_req: Request, res: Response) => {
  const [minDoc] = await Product.find({ published: true, price: { $ne: null } })
    .sort({ price: 1 })
    .select("price")
    .limit(1)
    .lean();
  const [maxDoc] = await Product.find({ published: true, price: { $ne: null } })
    .sort({ price: -1 })
    .select("price")
    .limit(1)
    .lean();
  const min = 0;
  const max = typeof maxDoc?.price === "number" ? maxDoc.price : 0;
  res.json({ ok: true, min, max, actualMin: typeof minDoc?.price === "number" ? minDoc.price : 0 });
});
