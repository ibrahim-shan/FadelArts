"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import ImageUploader from "@/components/uploader/image-uploader";
// shadcn components to install for this page
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase"; // *** 1. IMPORT SUPABASE ***

type Product = {
  _id: string;
  slug: string;
  title: string;
  artist: string;
  price: number;
  inventory?: number;
  published?: boolean;
  images?: string[];
  shortDescription?: string;
  description?: string;
  categories?: string[];
  variants?: { name: string; values: string[] }[];
  sku?: string;
  barcode?: string;
  year?: number;
};

export default function ProductsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [viewItem, setViewItem] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // for create product form
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [price, setPrice] = useState<string>("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // *** 2. ADD NEW STATE FOR STAGED FILES (FOR CREATE DIALOG) ***
  const [createImageFiles, setCreateImageFiles] = useState<File[]>([]);

  const [categories, setCategories] = useState<string[]>([]);
  const [variants, setVariants] = useState<
    { name: string; values: string[] }[]
  >([]);
  const [year, setYear] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [allCategories, setAllCategories] = useState<
    { _id: string; name: string }[]
  >([]);
  const [allVariants, setAllVariants] = useState<
    { _id: string; name: string; values: string[] }[]
  >([]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total]
  );

  // Lookup map for category id -> name for display in View dialog
  const categoryNameById = useMemo(() => {
    const m = new Map<string, string>();
    allCategories.forEach((c) => m.set(c._id, c.name));
    return m;
  }, [allCategories]);

  async function fetchData(signal?: AbortSignal) {
    setLoading(true);
    try {
      const url = new URL(`${apiBase}/api/products`);
      if (q) url.searchParams.set("q", q);
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", String(pageSize));
      const res = await fetch(url.toString(), {
        credentials: "include",
        signal,
      });
      const data = await res.json();
      if (!res.ok || !data?.ok)
        throw new Error(data?.error || "Failed to load products");
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      // ignore abort
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ctl = new AbortController();
    fetchData(ctl.signal);
    return () => ctl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page]);

  // fetch categories & variants for create form
  useEffect(() => {
    (async () => {
      try {
        const [cs, vs] = await Promise.all([
          fetch(`${apiBase}/api/categories?pageSize=100`, {
            credentials: "include",
          }).then((r) => r.json()),
          fetch(`${apiBase}/api/variants?pageSize=100`, {
            credentials: "include",
          }).then((r) => r.json()),
        ]);
        if (cs?.ok)
          setAllCategories(
            cs.items.map((c: any) => ({ _id: c._id, name: c.name }))
          );
        if (vs?.ok)
          setAllVariants(
            vs.items.map((v: any) => ({
              _id: v._id,
              name: v.name,
              values: v.values,
            }))
          );
      } catch {}
    })();
  }, [apiBase]);

  const resetCreate = () => {
    setTitle("");
    setArtist("");
    setPrice("");
    setShortDescription("");
    setDescription("");
    setImages([]);
    setCreateImageFiles([]); // *** 3. RESET STAGED FILES ***
    setCategories([]);
    setVariants([]);
    setYear("");
    setQuantity("");
    setFormError(null);
  };

  const populateFrom = (p: any) => {
    setTitle(p.title ?? "");
    setArtist(p.artist ?? "");
    setPrice(typeof p.price === "number" ? String(p.price) : "");
    setShortDescription(p.shortDescription ?? "");
    setDescription(p.description ?? "");
    setImages(Array.isArray(p.images) ? p.images : []);
    setCategories(Array.isArray(p.categories) ? p.categories : []);
    setVariants(Array.isArray(p.variants) ? p.variants : []);
    setYear(typeof p.year === "number" ? String(p.year) : "");
    setQuantity(typeof p.inventory === "number" ? String(p.inventory) : "");
  };

  // *** 4. ADD HANDLERS FOR STAGING/REMOVING FILES ***
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setCreateImageFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleImageRemove = (index: number) => {
    setCreateImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  async function createProduct() {
    // Client-side required validation
    if (!title.trim()) return setFormError("Title is required");
    if (!artist.trim()) return setFormError("Artist is required");
    if (!price || Number(price) <= 0) return setFormError("Price is required");
    if (!shortDescription.trim())
      return setFormError("Short description is required");
    if (!description.trim())
      return setFormError("Full description is required");

    // *** 5. MODIFY createProduct TO UPLOAD FILES FIRST ***

    // Use `createImageFiles` for validation
    if (createImageFiles.length === 0) {
      return setFormError("At least one image is required");
    }
    if (!year || Number.isNaN(Number(year)))
      return setFormError("Year is required");
    if (!quantity || Number.isNaN(Number(quantity)))
      return setFormError("Quantity is required");
    if (categories.length === 0)
      return setFormError("Select at least one category");

    setFormError(null);
    setLoading(true); // Use loading state for button

    let uploadedImageUrls: string[] = [];
    const pathPrefix = `${Date.now()}`;
    const bucket = "products";

    try {
      // 2. Upload all files from `createImageFiles`
      const uploadPromises = createImageFiles.map(async (file, idx) => {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `${pathPrefix}/${Date.now()}_${idx}_${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(key, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type,
          });

        if (uploadError) {
          throw new Error(
            `Failed to upload ${file.name}: ${uploadError.message}`
          );
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(key);
        return data.publicUrl;
      });

      uploadedImageUrls = await Promise.all(uploadPromises);

      // 3. All images are uploaded, now create the product in the DB
      const res = await fetch(`${apiBase}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          artist,
          price: Number(price),
          shortDescription,
          description,
          images: uploadedImageUrls, // Send the new URLs
          categories,
          variants,
          year: year ? Number(year) : undefined,
          inventory: quantity ? Number(quantity) : undefined,
          published: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        // In a real app, you might want to delete the uploaded images here
        throw new Error(data?.error || "Failed to create product in database");
      }

      // 4. Success
      setCreateOpen(false);
      resetCreate(); // This will clear createImageFiles
      await fetchData();
    } catch (e: any) {
      setFormError(e?.message || "Failed to create product");
    } finally {
      setLoading(false); // Hide loading state
    }
  }

  async function updateProductSubmit() {
    if (!editItem) return;
    try {
      const res = await fetch(`${apiBase}/api/products/${editItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          artist,
          price: Number(price),
          shortDescription,
          description,
          images, // Edit dialog still uses the 'images' state (string[])
          categories,
          variants,
          year: year ? Number(year) : undefined,
          inventory: quantity ? Number(quantity) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok)
        throw new Error(data?.error || "Failed to update");
      setEditOpen(false);
      setEditItem(null);
      await fetchData();
    } catch (e: any) {
      alert(e?.message || "Failed to update product");
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* ... (rest of the table and list UI, no changes needed here) ... */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <Input
            placeholder="Search products..."
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            className="w-full sm:w-[280px]"
          />
          <Button onClick={() => { resetCreate(); setEditItem(null); setCreateOpen(true); }}>Add Product</Button>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[220px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.artist}
                  </TableCell>
                  <TableCell>${p.price}</TableCell>
                  <TableCell>
                    {p.published === false ? (
                      <span className="rounded-full border px-2 py-0.5 text-xs bg-muted">
                        Draft
                      </span>
                    ) : (
                      <span className="rounded-full border px-2 py-0.5 text-xs bg-accent/30">
                        Published
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewItem(p);
                        setViewOpen(true);
                      }}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditItem(p);
                        populateFrom(p as any);
                        setEditOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setPendingDelete(p)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-10"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            {loading ? "Loading..." : `${total} total`}
          </div>
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
      </div>

      {/* Create Product Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(v) => {
          if (!v) resetCreate();
          setCreateOpen(v);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>New Product</DialogTitle>
            <DialogDescription>
              Here You Can Create New Product
            </DialogDescription>
          </DialogHeader>
          <Tabs
            defaultValue="details"
            className="w-full max-h-[70vh] overflow-y-auto pr-1 data-lenis-prevent data-lenis-prevent-wheel data-lenis-prevent-touch"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="org">Organization</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="pt-4">
              {/* ... (Details tab content is unchanged) ... */}
              <div className="grid gap-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1 block text-sm">Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Product title"
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block text-sm">Artist</Label>
                    <Input
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder="Artist name"
                    />
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1 block text-sm">Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* *** 6. REPLACE THE IMAGES TAB CONTENT *** */}
            <TabsContent value="images" className="pt-4">
              <div>
                <Label className="mb-1 block text-sm">Upload Images</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="mb-4"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mb-4">
                  Images will be staged here. They will be uploaded when you
                  click "Create".
                </p>
                {!!createImageFiles.length && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {createImageFiles.map((file, i) => (
                      <div key={i} className="relative group">
                        <div className="relative aspect-4/3 overflow-hidden rounded border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${file.name}`}
                            className="w-full h-full object-cover"
                            onLoad={(e) =>
                              URL.revokeObjectURL(e.currentTarget.src)
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => handleImageRemove(i)}
                          aria-label="Remove image"
                          disabled={loading}
                        >
                          ×
                        </Button>
                        <p
                          className="text-xs truncate text-muted-foreground mt-1"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="info" className="pt-4">
              {/* ... (Info tab content is unchanged) ... */}
              <div className="grid gap-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1 block text-sm">Year</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block text-sm">Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-1 block text-sm">
                    Short Description
                  </Label>
                  <textarea
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-border/40 bg-secondary/40 dark:bg-input/30 px-3 py-2 text-sm"
                    placeholder="1–3 lines summary"
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-sm">Full Description</Label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="w-full rounded-md border border-border/40 bg-secondary/40 dark:bg-input/30 px-3 py-2 text-sm"
                    placeholder="Details, story, materials, etc."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="org" className="pt-4">
              {/* ... (Organization tab content is unchanged) ... */}
              <div className="grid gap-6">
                <div>
                  <Label className="mb-1 block text-sm">Categories</Label>
                  <div className="flex flex-wrap gap-3">
                    {allCategories.map((c) => {
                      const checked = categories.includes(c._id);
                      return (
                        <label
                          key={c._id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            className="size-4"
                            checked={checked}
                            onChange={(e) => {
                              setCategories((prev) =>
                                e.target.checked
                                  ? [...prev, c._id]
                                  : prev.filter((id) => id !== c._id)
                              );
                            }}
                          />
                          {c.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="block text-sm">Variants</Label>
                  <div className="space-y-3">
                    {allVariants.map((v) => {
                      const existing = variants.find((x) => x.name === v.name);
                      const selected = existing ? existing.values : [];
                      const setSelected = (next: string[]) => {
                        setVariants((prev) => {
                          const idx = prev.findIndex((x) => x.name === v.name);
                          if (idx === -1)
                            return next.length
                              ? [...prev, { name: v.name, values: next }]
                              : prev;
                          const copy = [...prev];
                          if (!next.length) {
                            copy.splice(idx, 1);
                            return copy;
                          }
                          copy[idx] = { name: v.name, values: next };
                          return copy;
                        });
                      };
                      return (
                        <div key={v._id} className="rounded-md border p-3">
                          <div className="text-sm font-medium mb-1">
                            {v.name}
                          </div>
                          <VariantMultiSelect
                            values={v.values}
                            selected={selected}
                            onChange={setSelected}
                            placeholder={`Select ${v.name} values`}
                          />
                          {!!selected.length && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {selected.map((val) => (
                                <Badge
                                  key={val}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {val}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          {/* *** 7. UPDATE DIALOG FOOTER FOR ERROR AND LOADING STATE *** */}
          <DialogFooter>
            {formError && (
              <p className="text-destructive text-sm mr-auto">{formError}</p>
            )}
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={createProduct} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog
        open={viewOpen}
        onOpenChange={(v) => {
          if (!v) setViewItem(null);
          setViewOpen(v);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Review product information.</DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="grid gap-6 md:grid-cols-2 max-h-[70vh] overflow-y-auto pr-1" data-lenis-prevent data-lenis-prevent-wheel data-lenis-prevent-touch>
              <div className="space-y-3">
                {Array.isArray(viewItem.images) &&
                viewItem.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {viewItem.images.slice(0, 4).map((u, i) => (
                      <div
                        key={i}
                        className="relative aspect-4/3 overflow-hidden rounded bg-accent/20"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={u}
                          alt={`Image ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No images</p>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h3
                    className="font-semibold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {viewItem.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    By {viewItem.artist}
                  </p>
                </div>
                <div className="text-sm">
                  <p>
                    <span className="text-muted-foreground">Price:</span> $
                    {viewItem.price}
                  </p>
                  {typeof viewItem.inventory === "number" && (
                    <p>
                      <span className="text-muted-foreground">Quantity:</span>{" "}
                      {viewItem.inventory}
                    </p>
                  )}
                  {viewItem.year && (
                    <p>
                      <span className="text-muted-foreground">Year:</span>{" "}
                      {viewItem.year}
                    </p>
                  )}
                  {viewItem.sku && (
                    <p>
                      <span className="text-muted-foreground">SKU:</span>{" "}
                      {viewItem.sku}
                    </p>
                  )}
                  {viewItem.barcode && (
                    <p>
                      <span className="text-muted-foreground">Barcode:</span>{" "}
                      {viewItem.barcode}
                    </p>
                  )}
                  <p>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    {viewItem.published === false ? "Draft" : "Published"}
                  </p>
                </div>
                {viewItem.shortDescription && (
                  <div>
                    <p className="text-sm">{viewItem.shortDescription}</p>
                  </div>
                )}
                {viewItem.description && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-sm text-muted-foreground">
                      {viewItem.description}
                    </p>
                  </div>
                )}
                {Array.isArray(viewItem.categories) &&
                  viewItem.categories.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Categories:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {viewItem.categories.map((c) => {
                          const name = categoryNameById.get(c) ?? c;
                          return (
                            <span
                              key={c}
                              className="rounded-full border px-2 py-0.5 text-xs"
                            >
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                {Array.isArray(viewItem.variants) &&
                  viewItem.variants.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Variants:</span>
                      <div className="mt-1 space-y-1">
                        {viewItem.variants.map((v) => (
                          <div key={v.name}>
                            <span className="font-medium">{v.name}:</span>{" "}
                            <span className="text-muted-foreground">
                              {v.values.join(", ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog (This remains unchanged and will use ImageUploader) */}
      <Dialog
        open={editOpen}
        onOpenChange={(v) => {
          if (!v) setEditItem(null);
          setEditOpen(v);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-1" data-lenis-prevent data-lenis-prevent-wheel data-lenis-prevent-touch>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label className="mb-1 block text-sm">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1 block text-sm">Artist</Label>
                <Input
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label className="mb-1 block text-sm">Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1 block text-sm">Year</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label className="mb-1 block text-sm">Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="mb-1 block text-sm">Short Description</Label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border/40 bg-secondary/40 dark:bg-input/30 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Label className="mb-1 block text-sm">Full Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full rounded-md border border-border/40 bg-secondary/40 dark:bg-input/30 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Label className="mb-1 block text-sm">Images</Label>
              <ImageUploader
                value={images}
                onChange={setImages}
                bucket="products"
                pathPrefix={`${Date.now()}`}
              />
              {!!images.length && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {images.map((u, i) => (
                    <div
                      key={i}
                      className="relative aspect-4/3 overflow-hidden rounded"
                    >
                      <img
                        src={u}
                        alt={`Image ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label className="mb-1 block text-sm">Categories</Label>
              <div className="flex flex-wrap gap-3">
                {allCategories.map((c) => {
                  const checked = categories.includes(c._id);
                  return (
                    <label
                      key={c._id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={checked}
                        onChange={(e) => {
                          setCategories((prev) =>
                            e.target.checked
                              ? [...prev, c._id]
                              : prev.filter((id) => id !== c._id)
                          );
                        }}
                      />
                      {c.name}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="block text-sm">Variants</Label>
              <div className="space-y-3">
                {allVariants.map((v) => {
                  const existing = variants.find((x) => x.name === v.name);
                  const selected = existing ? existing.values : [];
                  const setSelected = (next: string[]) => {
                    setVariants((prev) => {
                      const idx = prev.findIndex((x) => x.name === v.name);
                      if (idx === -1)
                        return next.length
                          ? [...prev, { name: v.name, values: next }]
                          : prev;
                      const copy = [...prev];
                      if (!next.length) {
                        copy.splice(idx, 1);
                        return copy;
                      }
                      copy[idx] = { name: v.name, values: next };
                      return copy;
                    });
                  };
                  return (
                    <div key={v._id} className="rounded-md border p-3">
                      <div className="text-sm font-medium mb-1">{v.name}</div>
                      <VariantMultiSelect
                        values={v.values}
                        selected={selected}
                        onChange={setSelected}
                        placeholder={`Select ${v.name} values`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={updateProductSubmit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirm (Unchanged) */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(v) => !v && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "
              {pendingDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  const res = await fetch(
                    `${apiBase}/api/products/${pendingDelete._id}`,
                    { method: "DELETE", credentials: "include" }
                  );
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok || !data?.ok)
                    throw new Error(data?.error || "Failed to delete");
                  setPendingDelete(null);
                  await fetchData();
                } catch (e: any) {
                  alert(e?.message || "Failed to delete");
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ... (VariantMultiSelect component is unchanged) ...
function VariantMultiSelect({
  values,
  selected,
  onChange,
  placeholder,
}: {
  values: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (val: string) => {
    const exists = selected.includes(val);
    const next = exists
      ? selected.filter((v) => v !== val)
      : [...selected, val];
    onChange(next);
  };
  const buttonLabel = selected.length
    ? `${selected.length} selected`
    : placeholder || "Select values";
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {buttonLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No values found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {values.map((val) => {
                const isSelected = selected.includes(val);
                return (
                  <CommandItem key={val} onSelect={() => toggle(val)}>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggle(val)}
                      />
                      <span>{val}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
