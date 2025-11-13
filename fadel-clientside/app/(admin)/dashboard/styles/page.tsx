"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
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
import { supabase } from "@/lib/supabase";

type Style = {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  slug: string;
};

export default function StylesPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [loadingAction, setLoadingAction] = useState(false);

  const [items, setItems] = useState<Style[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Style | null>(null);
  const [editItem, setEditItem] = useState<Style | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stagedFile, setStagedFile] = useState<File | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  async function deleteImageFromSupabase(imageUrl: string | undefined) {
    if (!imageUrl) return;

    const bucketName = "products";
    const pathPrefix = `/${bucketName}/`;
    const pathIndex = imageUrl.indexOf(pathPrefix);

    if (pathIndex === -1) {
      console.warn("Could not determine image path from URL:", imageUrl);
      return;
    }

    const imagePath = imageUrl.substring(pathIndex + pathPrefix.length);

    if (!imagePath) {
      console.warn("Extracted image path is empty:", imageUrl);
      return;
    }

    try {
      console.log(`Deleting image from Supabase: ${imagePath}`);
      const { error } = await supabase.storage.from(bucketName).remove([imagePath]);
      if (error) {
        console.warn("Failed to delete old image from Supabase:", error.message);
      }
    } catch (e: unknown) {
      console.warn(
        "Error during Supabase image deletion:",
        e instanceof Error ? e.message : "Unknown error",
      );
    }
  }

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const url = new URL(`${apiBase}/api/styles`);
        if (q) url.searchParams.set("q", q);
        url.searchParams.set("page", String(page));
        url.searchParams.set("pageSize", String(pageSize));

        const res = await fetch(url.toString(), {
          credentials: "include",
          signal,
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load styles");

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
    setName("");
    setDescription("");
    setImageUrl("");
    setStagedFile(null);
  };

  async function uploadImage(file: File): Promise<string> {
    const path = `styles/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("products").upload(path, file);
    if (error) throw error;
    const { data: publicUrl } = supabase.storage.from("products").getPublicUrl(path);
    return publicUrl.publicUrl;
  }

  async function createStyle() {
    setLoadingAction(true);
    try {
      let uploadedUrl = imageUrl;
      if (stagedFile) uploadedUrl = await uploadImage(stagedFile);

      const res = await fetch(`${apiBase}/api/styles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description, image: uploadedUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to create");

      setAddOpen(false);
      resetForm();
      await fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to create style");
    } finally {
      setLoadingAction(false);
    }
  }

  async function updateStyleSubmit() {
    if (!editItem) return;
    setLoadingAction(true);
    const oldImageUrl = editItem.image;
    let finalImageUrl = imageUrl;
    try {
      if (stagedFile) {
        finalImageUrl = await uploadImage(stagedFile); // Upload new image
      }

      const res = await fetch(`${apiBase}/api/styles/${editItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description, image: finalImageUrl }),
      });

      const data = await res.json();

      // *** START OF FIX ***

      // 1. Check for failure and throw an error first.
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to update style");
      }

      // 2. If the update succeeded, *now* delete the old image.
      if (oldImageUrl && oldImageUrl !== finalImageUrl) {
        await deleteImageFromSupabase(oldImageUrl);
      }

      // *** END OF FIX ***

      setEditOpen(false);
      setEditItem(null);
      resetForm();
      await fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to update style");
    } finally {
      setLoadingAction(false);
    }
  }

  async function deleteStyle(styleToDelete: Style) {
    setLoadingAction(true);
    try {
      // First, delete the item from the database
      const res = await fetch(`${apiBase}/api/styles/${styleToDelete._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to delete");

      // *** 7. AFTER SUCCESSFUL DB DELETE, DELETE FROM SUPABASE ***
      if (styleToDelete.image) {
        await deleteImageFromSupabase(styleToDelete.image);
      }

      setPendingDelete(null);
      await fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete style");
    } finally {
      setLoadingAction(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Input
          placeholder="Search styles..."
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          className="w-full sm:w-[280px]"
        />
        <Button
          onClick={() => {
            resetForm();
            setAddOpen(true);
          }}
        >
          Add Style
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead className="w-[30%]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[160px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((s) => (
              <TableRow key={s._id}>
                <TableCell>
                  {s.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.image}
                      alt={s.name}
                      className="h-12 w-16 object-cover rounded border"
                    />
                  ) : (
                    <div className="h-12 w-16 rounded border bg-accent/20" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-muted-foreground">{s.description}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditItem(s);
                      setName(s.name);
                      setDescription(s.description ?? "");
                      setImageUrl(s.image ?? "");
                      setEditOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setPendingDelete(s)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  No styles found
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

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Style</DialogTitle>
            <DialogDescription>Create a new style.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Image</Label>
              <Input
                type="file"
                accept="image/*"
                disabled={loadingAction}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setStagedFile(f);
                }}
              />
              {(stagedFile || imageUrl) && (
                <div className="mt-3 w-40 aspect-4/3 overflow-hidden rounded border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stagedFile ? URL.createObjectURL(stagedFile) : imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {(stagedFile || imageUrl) && (
                <div className="mt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setStagedFile(null);
                      setImageUrl("");
                    }}
                    disabled={loadingAction}
                  >
                    Remove Image
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={createStyle}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(v) => {
          if (!v) setEditItem(null);
          setEditOpen(v);
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Style</DialogTitle>
            <DialogDescription>Update this style.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setStagedFile(f);
                }}
              />
              {(stagedFile || imageUrl) && (
                <div className="mt-3 w-40 aspect-4/3 overflow-hidden rounded border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stagedFile ? URL.createObjectURL(stagedFile) : imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {(stagedFile || imageUrl) && (
                <div className="mt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setStagedFile(null);
                      setImageUrl("");
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={updateStyleSubmit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete style?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete “{pendingDelete?.name}”.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && deleteStyle(pendingDelete)}
              className="bg-destructive hover:bg-destructive/90"
              disabled={loadingAction}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
