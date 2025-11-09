"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import ImageUploader from "@/components/uploader/image-uploader";
// shadcn components to install for this page
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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

type Product = {
  _id: string;
  slug: string;
  title: string;
  artist: string;
  price: number;
  inventory?: number;
  published?: boolean;
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
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // for create product form
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [price, setPrice] = useState<string>("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [variants, setVariants] = useState<{ name: string; values: string[] }[]>([]);
  const [year, setYear] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [allCategories, setAllCategories] = useState<{ _id: string; name: string }[]>([]);
  const [allVariants, setAllVariants] = useState<{ _id: string; name: string; values: string[] }[]>([]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  async function fetchData(signal?: AbortSignal) {
    setLoading(true);
    try {
      const url = new URL(`${apiBase}/api/products`);
      if (q) url.searchParams.set("q", q);
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", String(pageSize));
      const res = await fetch(url.toString(), { credentials: "include", signal });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load products");
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
          fetch(`${apiBase}/api/categories?pageSize=100`, { credentials: "include" }).then((r) => r.json()),
          fetch(`${apiBase}/api/variants?pageSize=100`, { credentials: "include" }).then((r) => r.json()),
        ]);
        if (cs?.ok) setAllCategories(cs.items.map((c: any) => ({ _id: c._id, name: c.name })));
        if (vs?.ok) setAllVariants(vs.items.map((v: any) => ({ _id: v._id, name: v.name, values: v.values })));
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

  async function createProduct() {
    // Client-side required validation
    if (!title.trim()) return setFormError("Title is required");
    if (!artist.trim()) return setFormError("Artist is required");
    if (!price || Number(price) <= 0) return setFormError("Price is required");
    if (!shortDescription.trim()) return setFormError("Short description is required");
    if (!description.trim()) return setFormError("Full description is required");
    if (images.length === 0) return setFormError("At least one image is required");
    if (!year || Number.isNaN(Number(year))) return setFormError("Year is required");
    if (!quantity || Number.isNaN(Number(quantity))) return setFormError("Quantity is required");
    if (categories.length === 0) return setFormError("Select at least one category");
    setFormError(null);
    try {
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
          images,
          categories,
          variants,
          year: year ? Number(year) : undefined,
          inventory: quantity ? Number(quantity) : undefined,
          published: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to create");
      setCreateOpen(false);
      resetCreate();
      await fetchData();
    } catch (e: any) {
      alert(e?.message || "Failed to create product");
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
          images,
          categories,
          variants,
          year: year ? Number(year) : undefined,
          inventory: quantity ? Number(quantity) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to update");
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
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Input
          placeholder="Search products..."
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
          className="w-full sm:w-[280px]"
        />
        <Button onClick={() => setCreateOpen(true)}>Add Product</Button>
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
                <TableCell className="text-muted-foreground">{p.artist}</TableCell>
                <TableCell>${p.price}</TableCell>
                <TableCell>
                  {p.published === false ? (
                    <span className="rounded-full border px-2 py-0.5 text-xs bg-muted">Draft</span>
                  ) : (
                    <span className="rounded-full border px-2 py-0.5 text-xs bg-accent/30">Published</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/product/${p.slug}`} target="_blank" rel="noopener noreferrer">
                      View
                    </Link>
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
                  <Button variant="destructive" size="sm" onClick={() => setPendingDelete(p)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">{loading ? "Loading..." : `${total} total`}</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      </div>
      </div>

      {/* Create Product Dialog */}
    <Dialog open={createOpen} onOpenChange={(v) => { if (!v) resetCreate(); setCreateOpen(v); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>New Product</DialogTitle>
          <DialogDescription>Here You Can Create New Product</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="org">Organization</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="pt-4">
            <div className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label className="mb-1 block text-sm">Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product title" />
                </div>
                <div>
                  <Label className="mb-1 block text-sm">Artist</Label>
                  <Input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist name" />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label className="mb-1 block text-sm">Price</Label>
                  <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="images" className="pt-4">
            <div>
              <Label className="mb-1 block text-sm">Images</Label>
              <ImageUploader value={images} onChange={setImages} bucket="products" pathPrefix={`${Date.now()}`} />
              {!!images.length && (
                <div className="mt-2 text-xs text-muted-foreground break-all">
                  {images.map((u, i) => (
                    <div key={i}>{u}</div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="info" className="pt-4">
            <div className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label className="mb-1 block text-sm">Year</Label>
                  <Input type="number" min="0" step="1" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" />
                </div>
                <div>
                  <Label className="mb-1 block text-sm">Quantity</Label>
                  <Input type="number" min="0" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div>
                <Label className="mb-1 block text-sm">Short Description</Label>
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
            <div className="grid gap-6">
              <div>
                <Label className="mb-1 block text-sm">Categories</Label>
                <div className="flex flex-wrap gap-3">
                  {allCategories.map((c) => {
                    const checked = categories.includes(c._id);
                    return (
                      <label key={c._id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4"
                          checked={checked}
                          onChange={(e) => {
                            setCategories((prev) => (
                              e.target.checked ? [...prev, c._id] : prev.filter((id) => id !== c._id)
                            ));
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
                        if (idx === -1) return next.length ? [...prev, { name: v.name, values: next }] : prev;
                        const copy = [...prev];
                        if (!next.length) { copy.splice(idx, 1); return copy; }
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
                        {!!selected.length && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selected.map((val) => (
                              <Badge key={val} variant="secondary" className="text-xs">
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
        <DialogFooter>
          {formError && <p className="text-destructive text-sm mr-auto">{formError}</p>}
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={createProduct}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Edit Product Dialog */}
    <Dialog open={editOpen} onOpenChange={(v) => { if (!v) setEditItem(null); setEditOpen(v); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update product information.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="mb-1 block text-sm">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block text-sm">Artist</Label>
              <Input value={artist} onChange={(e) => setArtist(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="mb-1 block text-sm">Price</Label>
              <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block text-sm">Year</Label>
              <Input type="number" min="0" step="1" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="mb-1 block text-sm">Quantity</Label>
              <Input type="number" min="0" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
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
            <ImageUploader value={images} onChange={setImages} bucket="products" pathPrefix={`${Date.now()}`} />
            {!!images.length && (
              <div className="mt-2 text-xs text-muted-foreground break-all">
                {images.map((u, i) => (
                  <div key={i}>{u}</div>
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
                  <label key={c._id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={checked}
                      onChange={(e) => {
                        setCategories((prev) => (
                          e.target.checked ? [...prev, c._id] : prev.filter((id) => id !== c._id)
                        ));
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
                    if (idx === -1) return next.length ? [...prev, { name: v.name, values: next }] : prev;
                    const copy = [...prev];
                    if (!next.length) { copy.splice(idx, 1); return copy; }
                    copy[idx] = { name: v.name, values: next };
                    return copy;
                  });
                };
                return (
                  <div key={v._id} className="rounded-md border p-3">
                    <div className="text-sm font-medium mb-1">{v.name}</div>
                    <VariantMultiSelect values={v.values} selected={selected} onChange={setSelected} placeholder={`Select ${v.name} values`} />
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

    {/* Delete Product Confirm */}
    <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete product?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete "{pendingDelete?.title}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={async () => {
              if (!pendingDelete) return;
              try {
                const res = await fetch(`${apiBase}/api/products/${pendingDelete._id}`, { method: 'DELETE', credentials: 'include' });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to delete');
                setPendingDelete(null);
                await fetchData();
              } catch (e: any) {
                alert(e?.message || 'Failed to delete');
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
    const next = exists ? selected.filter((v) => v !== val) : [...selected, val];
    onChange(next);
  };
  const buttonLabel = selected.length ? `${selected.length} selected` : (placeholder || "Select values");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
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
                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    <div className="flex items-center gap-2">
                      <Checkbox checked={isSelected} onCheckedChange={() => toggle(val)} />
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
