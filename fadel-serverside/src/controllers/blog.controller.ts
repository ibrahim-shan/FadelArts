import type { Request, Response } from "express";
import { Blog } from "../models/blog.model";
import { asyncHandler } from "../utils/async";
import { Types } from "mongoose";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * @desc    List all blog posts for admin
 * @route   GET /api/blogs
 * @access  Admin
 */
export const listBlogPosts = asyncHandler(async (req: Request, res: Response) => {
  const { q, page = "1", pageSize = "10" } = req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = {};
  if (q) {
    const searchRegex = { $regex: q, $options: "i" };
    filter.$or = [{ title: searchRegex }, { author: searchRegex }];
  }

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const pageSizeNum = Math.min(100, Math.max(1, parseInt(String(pageSize), 10) || 10));
  const skip = (pageNum - 1) * pageSizeNum;

  const [items, total] = await Promise.all([
    Blog.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(pageSizeNum).lean(),
    Blog.countDocuments(filter),
  ]);

  res.json({ ok: true, items, total, page: pageNum, pageSize: pageSizeNum });
});

/**
 * @desc    List public blog posts
 * @route   GET /api/blogs/public
 * @access  Public
 */
export const listPublicBlogPosts = asyncHandler(async (req: Request, res: Response) => {
  const { page = "1", pageSize = "3" } = req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = { published: true };

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const pageSizeNum = Math.min(20, Math.max(1, parseInt(String(pageSize), 10) || 3));
  const skip = (pageNum - 1) * pageSizeNum;

  const [items, total] = await Promise.all([
    Blog.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(pageSizeNum)
      .select("-content")
      .lean(),
    Blog.countDocuments(filter),
  ]);

  res.json({ ok: true, items, total, page: pageNum, pageSize: pageSizeNum });
});

/**
 * @desc    Get single blog post by ID (for admin)
 * @route   GET /api/blogs/:id
 * @access  Admin
 */
export const getBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ ok: false, error: "Invalid ID" });
  }
  const post = await Blog.findById(id).lean();
  if (!post) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  res.json({ ok: true, post });
});

/**
 * @desc    Get single public blog post by slug
 * @route   GET /api/blogs/public/:slug
 * @access  Public
 */
export const getPublicBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const post = await Blog.findOne({ slug, published: true }).lean();
  if (!post) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  res.json({ ok: true, post });
});

/**
 * @desc    Create new blog post
 * @route   POST /api/blogs
 * @access  Admin
 */
export const createBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { title, author, excerpt, image, content, published, publishedAt } = req.body;

  if (!title || !author || !excerpt || !image) {
    return res
      .status(400)
      .json({ ok: false, error: "Title, Author, Excerpt, and Image are required" });
  }

  const slug = slugify(title);
  const exists = await Blog.findOne({ slug }).lean();
  if (exists) {
    return res.status(409).json({
      ok: false,
      error: "A post with this title already exists. Please change the title.",
    });
  }

  const post = await Blog.create({
    title,
    slug,
    author,
    excerpt,
    image,
    content: Array.isArray(content) ? content : [],
    published: typeof published === "boolean" ? published : true,
    publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
  });

  res.status(201).json({ ok: true, post });
});

/**
 * @desc    Update blog post
 * @route   PUT /api/blogs/:id
 * @access  Admin
 */
export const updateBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ ok: false, error: "Invalid ID" });
  }

  const { title, slug } = req.body;

  if (!title) {
    return res.status(400).json({ ok: false, error: "Title is required" });
  }

  const update: Record<string, unknown> = { ...req.body };
  // Ensure slug is updated if title changes, or use provided slug
  update.slug = slug || slugify(title);

  const post = await Blog.findByIdAndUpdate(id, update, { new: true });
  if (!post) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  res.json({ ok: true, post });
});

/**
 * @desc    Delete blog post
 * @route   DELETE /api/blogs/:id
 * @access  Admin
 */
export const deleteBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ ok: false, error: "Invalid ID" });
  }

  const post = await Blog.findByIdAndDelete(id);
  if (!post) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }

  // Note: This does not delete the image from Supabase.
  // You would need to add that logic here if required.

  res.json({ ok: true });
});
