"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// --- FIX: Corrected import path ---
import { supabase } from "../../../../lib/supabase";
// --- END FIX ---
import { Plus, Trash2, ArrowUp, ArrowDown, XIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// --- Types (from backend model) ---
type ContentBlock = {
  _id?: string; // Mongoose adds this
  type: "paragraph" | "heading" | "image" | "list";
  text?: string;
  level?: number;
  src?: string;
  alt?: string;
  caption?: string;
  items?: string[];
};

type Blog = {
  _id: string;
  slug: string;
  title: string;
  author: string;
  excerpt: string;
  image: string; // Feature image URL
  content: ContentBlock[];
  publishedAt: string;
  published: boolean;
};

// --- Initial Form State ---
const newFormState = {
  _id: "",
  title: "",
  author: "Fadel Art",
  excerpt: "",
  image: "",
  published: true,
  publishedAt: new Date().toISOString().split("T")[0], // YYYY-MM-DD
  content: [] as ContentBlock[],
};

export default function BlogsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [items, setItems] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Blog | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Blog | null>(null);

  const [form, setForm] = useState(newFormState);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const url = new URL(`${apiBase}/api/blogs`);
        if (q) url.searchParams.set("q", q);
        url.searchParams.set("page", String(page));
        url.searchParams.set("pageSize", String(pageSize));
        const res = await fetch(url.toString(), { credentials: "include", signal });
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load posts");
        setItems(data.items);
        setTotal(data.total);
      } catch {
        // ignore aborts
      } finally {
        setLoading(false);
      }
    },
    [apiBase, q, page, pageSize],
  );

  useEffect(() => {
    const ctl = new AbortController();
    fetchData(ctl.signal);
    return () => ctl.abort();
  }, [q, page, fetchData]);

  const resetForm = () => {
    setForm(newFormState);
    setStagedFile(null);
    setEditItem(null);
    setFormError(null);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (item: Blog) => {
    resetForm();
    setEditItem(item);
    setForm({
      ...item,
      publishedAt: new Date(item.publishedAt).toISOString().split("T")[0],
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    // Delay reset to allow dialog to fade out
    setTimeout(resetForm, 300);
  };

  async function uploadImage(file: File, pathPrefix = "blogs"): Promise<string> {
    const bucket = "products"; // Using the same bucket as products
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${pathPrefix}/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(key, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });
    if (uploadError) throw new Error(`Supabase upload error: ${uploadError.message}`);

    const { data } = supabase.storage.from(bucket).getPublicUrl(key);
    return data.publicUrl;
  }

  // --- MODIFIED: Renamed to be clearer ---
  async function deleteImageFromUrl(imageUrl: string | undefined) {
    if (!imageUrl) return;
    const bucketName = "products";
    // Construct the path prefix from the Supabase URL
    const urlPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/`;
    if (!imageUrl.startsWith(urlPrefix)) {
      console.warn("URL does not match Supabase structure:", imageUrl);
      return;
    }

    const imagePath = imageUrl.substring(urlPrefix.length);
    if (!imagePath) {
      console.warn("Extracted image path is empty:", imageUrl);
      return;
    }

    try {
      await supabase.storage.from(bucketName).remove([imagePath]);
    } catch (e) {
      console.warn("Failed to delete image", e);
    }
  }

  async function handleSubmit() {
    setLoadingAction(true);
    setFormError(null);
    let featureImageUrl = form.image;
    let newImageUploaded = false;
    const oldImageUrl = editItem?.image;

    // --- 1. GET A LIST OF OLD CONTENT IMAGES (before update) ---
    const oldContentImageUrls =
      editItem?.content.filter((b) => b.type === "image" && b.src).map((b) => b.src as string) ??
      [];

    try {
      // 2. Upload new feature image if staged
      if (stagedFile) {
        featureImageUrl = await uploadImage(stagedFile, "blogs/features");
        newImageUploaded = true;
      }
      if (!featureImageUrl) {
        throw new Error("A feature image is required.");
      }

      // 3. Upload any images *inside* the content blocks
      // (This is still simplified: assumes user pastes URLs for content images)
      const updatedContent = await Promise.all(
        form.content.map(async (block) => {
          if (block.type === "image" && block.src?.startsWith("blob:")) {
            // This is complex, so we'll skip it for now and assume user pastes URLs
            // In a real app, you'd handle file mapping here
            console.warn("Blob image found in content, skipping upload for this block.");
            return { ...block, src: "" }; // Clear blob URL
          }
          return block;
        }),
      );

      const payload = {
        ...form,
        image: featureImageUrl,
        content: updatedContent,
      };

      const url = editItem ? `${apiBase}/api/blogs/${editItem._id}` : `${apiBase}/api/blogs`;
      const method = editItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        // If create/update failed, and we uploaded a new image, delete it.
        if (newImageUploaded) await deleteImageFromUrl(featureImageUrl);
        throw new Error(data?.error || "Failed to save post");
      }

      // 4. CLEANUP ORPHANED IMAGES
      if (editItem) {
        // A. Clean up old feature image if it was replaced
        if (newImageUploaded && oldImageUrl && oldImageUrl !== featureImageUrl) {
          await deleteImageFromUrl(oldImageUrl);
        }

        // B. Clean up old CONTENT images that were removed
        const newContentImageUrls =
          payload.content.filter((b) => b.type === "image" && b.src).map((b) => b.src as string) ??
          [];

        const imagesToDelete = oldContentImageUrls.filter(
          (url) => !newContentImageUrls.includes(url),
        );

        if (imagesToDelete.length > 0) {
          await Promise.all(imagesToDelete.map(deleteImageFromUrl));
        }
      }

      closeDialog();
      await fetchData();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "An unknown error occurred");
    } finally {
      setLoadingAction(false);
    }
  }

  async function handleDeletePost() {
    if (!pendingDelete) return;
    setLoadingAction(true);
    const itemToDelete = pendingDelete;
    setPendingDelete(null);

    try {
      const res = await fetch(`${apiBase}/api/blogs/${itemToDelete._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to delete post");

      // --- 5. CLEANUP ALL IMAGES ON DELETE ---
      // A. Delete the feature image
      await deleteImageFromUrl(itemToDelete.image);

      // B. Delete all images from the content
      const contentImageUrls =
        itemToDelete.content
          .filter((b) => b.type === "image" && b.src)
          .map((b) => b.src as string) ?? [];

      if (contentImageUrls.length > 0) {
        await Promise.all(contentImageUrls.map(deleteImageFromUrl));
      }
      // --- END OF CLEANUP ---

      await fetchData(); // Refresh list
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete post");
    } finally {
      setLoadingAction(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Input
          placeholder="Search blogs..."
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          className="w-full sm:w-[280px]"
        />
        <Button onClick={openNewDialog}>
          <Plus className="-ml-1 h-4 w-4" />
          Add Post
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[160px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((post) => (
              <TableRow key={post._id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell className="text-muted-foreground">{post.author}</TableCell>
                <TableCell>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  {post.published ? (
                    <span className="rounded-full border px-2 py-0.5 text-xs bg-accent/30 text-green-700 border-green-300">
                      Published
                    </span>
                  ) : (
                    <span className="rounded-full border px-2 py-0.5 text-xs bg-muted">Draft</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(post)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setPendingDelete(post)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No posts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">{loading ? "Loading..." : `${total} total`}</div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Post" : "Create New Post"}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto p-1 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Post title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={form.author}
                      onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                      placeholder="Author name"
                    />
                  </div>
                </div>
                <div className="md:col-span-1 space-y-4">
                  <div>
                    <Label htmlFor="publishedAt">Publish Date</Label>
                    <Input
                      id="publishedAt"
                      type="date"
                      value={form.publishedAt}
                      onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <Switch
                      id="published"
                      checked={form.published}
                      onCheckedChange={(val) => setForm((f) => ({ ...f, published: val }))}
                    />
                    <Label htmlFor="published" className="text-sm">
                      Published
                    </Label>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-border/40 bg-secondary/40 dark:bg-input/30 px-3 py-2 text-sm"
                  placeholder="A short summary for the post..."
                />
              </div>
              <div>
                <Label>Feature Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  className="mb-2"
                  onChange={(e) => setStagedFile(e.target.files?.[0] || null)}
                />
                <div className="w-full max-w-sm aspect-video rounded border bg-accent/20 overflow-hidden relative">
                  {form.image || stagedFile ? (
                    <Image
                      src={stagedFile ? URL.createObjectURL(stagedFile) : form.image}
                      alt="Feature image preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full grid place-content-center">
                      <p className="text-sm text-muted-foreground">Image Preview</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="flex-1 overflow-y-auto p-1 py-4 space-y-4">
              <ContentEditor
                content={form.content}
                onChange={(newContent) => setForm((f) => ({ ...f, content: newContent }))}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-auto pt-4 border-t">
            {formError && <p className="text-destructive text-sm mr-auto">{formError}</p>}
            <DialogClose asChild>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={loadingAction}>
              {loadingAction ? "Saving..." : editItem ? "Save Changes" : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete &quot;
              {pendingDelete?.title}&quot; and ALL associated images (feature and content).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-destructive hover:bg-destructive/90"
              disabled={loadingAction}
            >
              {loadingAction ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- Structured Content Editor Component ---

function ContentEditor({
  content,
  onChange,
}: {
  content: ContentBlock[];
  onChange: (content: ContentBlock[]) => void;
}) {
  const [uploading, setUploading] = useState(false);

  // This is a simplified image uploader for the content blocks
  async function uploadContentImage(file: File): Promise<string> {
    setUploading(true);
    try {
      const bucket = "products"; // Using the same bucket
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `blogs/content/${Date.now()}_${safeName}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(key, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });
      if (uploadError) throw new Error(`Supabase upload error: ${uploadError.message}`);

      const { data } = supabase.storage.from(bucket).getPublicUrl(key);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  const updateBlock = (index: number, newBlock: ContentBlock) => {
    const newContent = [...content];
    newContent[index] = newBlock;
    onChange(newContent);
  };

  const addBlock = (type: ContentBlock["type"]) => {
    let newBlock: ContentBlock;
    switch (type) {
      case "heading":
        newBlock = { type: "heading", level: 2, text: "" };
        break;
      case "image":
        newBlock = { type: "image", src: "", alt: "", caption: "" };
        break;
      case "list":
        newBlock = { type: "list", items: [""] };
        break;
      case "paragraph":
      default:
        newBlock = { type: "paragraph", text: "" };
    }
    onChange([...content, newBlock]);
  };

  const removeBlock = (index: number) => {
    // Note: This only removes from state. The actual image file is deleted
    // when the user saves the post (in handleSubmit).
    onChange(content.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= content.length) return;
    const newContent = [...content];
    const [item] = newContent.splice(index, 1);
    newContent.splice(newIndex, 0, item);
    onChange(newContent);
  };

  return (
    <div className="space-y-4">
      {content.map((block, index) => (
        <div key={block._id || `block-${index}`} className="relative rounded-md border p-4 pr-12">
          {/* Block Controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => moveBlock(index, "up")}
              disabled={index === 0}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => moveBlock(index, "down")}
              disabled={index === content.length - 1}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => removeBlock(index)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Block Content */}
          {block.type === "paragraph" && (
            <div className="space-y-2">
              <Label>Paragraph</Label>
              <textarea
                value={block.text}
                onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                rows={4}
                className="w-full rounded-md border border-border/40 bg-secondary/40 dark:bg-input/30 px-3 py-2 text-sm"
                placeholder="Write your paragraph..."
              />
            </div>
          )}
          {block.type === "heading" && (
            <div className="space-y-2">
              <Label>Heading</Label>
              <div className="flex gap-2">
                <select
                  value={block.level}
                  onChange={(e) =>
                    updateBlock(index, { ...block, level: Number(e.target.value) as 2 | 3 })
                  }
                  className="rounded-md border border-border/40 bg-secondary/40 dark:bg-input/30 px-2 py-2 text-sm"
                >
                  <option value={2}>Heading 2</option>
                  <option value={3}>Heading 3</option>
                </select>
                <Input
                  value={block.text}
                  onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                  placeholder="Heading text..."
                  className="flex-1"
                />
              </div>
            </div>
          )}
          {block.type === "list" && (
            <div className="space-y-2">
              <Label>List</Label>
              {block.items?.map((item, itemIndex) => (
                <div key={itemIndex} className="flex gap-2">
                  <span className="text-muted-foreground pt-2">•</span>
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(block.items || [])];
                      newItems[itemIndex] = e.target.value;
                      updateBlock(index, { ...block, items: newItems });
                    }}
                    placeholder="List item..."
                    className="flex-1"
                  />
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => {
                      const newItems = [...(block.items || [])];
                      newItems.splice(itemIndex, 1);
                      updateBlock(index, { ...block, items: newItems });
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newItems = [...(block.items || []), ""];
                  updateBlock(index, { ...block, items: newItems });
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
          )}
          {block.type === "image" && (
            <div className="space-y-2">
              <Label>Image</Label>
              {block.src ? (
                <div className="w-full max-w-sm aspect-video rounded border bg-accent/20 overflow-hidden relative">
                  <Image
                    src={block.src}
                    alt={block.alt || "content image"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full max-w-sm aspect-video rounded border bg-accent/20 overflow-hidden relative grid place-content-center">
                  <p className="text-sm text-muted-foreground">Upload Image</p>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadContentImage(file);
                    updateBlock(index, { ...block, src: url, alt: file.name });
                  } catch {
                    alert("Image upload failed");
                  }
                }}
                className="mb-2"
              />
              <Input
                value={block.alt}
                onChange={(e) => updateBlock(index, { ...block, alt: e.target.value })}
                placeholder="Image alt text..."
              />
              <Input
                value={block.caption}
                onChange={(e) => updateBlock(index, { ...block, caption: e.target.value })}
                placeholder="Optional caption..."
              />
            </div>
          )}
        </div>
      ))}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => addBlock("paragraph")}>
          <Plus className="h-4 w-4 mr-1" /> Paragraph
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addBlock("heading")}>
          <Plus className="h-4 w-4 mr-1" /> Heading
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addBlock("image")}>
          <Plus className="h-4 w-4 mr-1" /> Image
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addBlock("list")}>
          <Plus className="h-4 w-4 mr-1" /> List
        </Button>
      </div>
    </div>
  );
}
