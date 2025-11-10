"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// shadcn components to install
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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

type Variant = {
  _id: string;
  name: string;
  values: string[];
  slug: string;
};

export default function VariantsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [items, setItems] = useState<Variant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Variant | null>(null);
  const [editItem, setEditItem] = useState<Variant | null>(null);

  const [formName, setFormName] = useState("");
  const [formValuesRaw, setFormValuesRaw] = useState("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const parseValues = (raw: string) =>
    Array.from(
      new Set(
        raw
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      ),
    );

  async function fetchData(signal?: AbortSignal) {
    setLoading(true);
    try {
      const url = new URL(`${apiBase}/api/variants`);
      if (q) url.searchParams.set("q", q);
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", String(pageSize));
      const res = await fetch(url.toString(), { credentials: "include", signal });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load variants");
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      // ignore abort or surface minimal in UI via loading
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

  const resetForm = () => {
    setFormName("");
    setFormValuesRaw("");
  };

  async function createVariant() {
    const values = parseValues(formValuesRaw);
    try {
      const res = await fetch(`${apiBase}/api/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: formName, values }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to create");
      setAddOpen(false);
      resetForm();
      await fetchData();
    } catch (e: any) {
      alert(e?.message || "Failed to create variant");
    }
  }

  async function updateVariant() {
    if (!editItem) return;
    try {
      const res = await fetch(`${apiBase}/api/variants/${editItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: formName, values: parseValues(formValuesRaw) }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to update");
      setEditOpen(false);
      setEditItem(null);
      resetForm();
      await fetchData();
    } catch (e: any) {
      alert(e?.message || "Failed to update variant");
    }
  }

  async function deleteVariant(id: string) {
    try {
      const res = await fetch(`${apiBase}/api/variants/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to delete");
      setPendingDelete(null);
      await fetchData();
    } catch (e: any) {
      alert(e?.message || "Failed to delete variant");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search variants..."
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            className="w-full sm:w-[280px]"
          />
        </div>
        <Button
          onClick={() => {
            resetForm();
            setAddOpen(true);
          }}
        >
          Add Variant
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Name</TableHead>
              <TableHead>Values</TableHead>
              <TableHead className="w-[160px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((v) => (
              <TableRow key={v._id}>
                <TableCell className="font-medium">{v.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {v.values.map((val, i) => (
                      <span
                        key={i}
                        className="rounded-full border px-2 py-0.5 text-xs bg-accent/30"
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditItem(v);
                      setFormName(v.name);
                      setFormValuesRaw(v.values.join(", "));
                      setEditOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setPendingDelete(v)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                  No variants found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Variant</DialogTitle>
            <DialogDescription>
              Define a product option with multiple values (e.g., Size: S, M, L).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1 block text-sm">Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Size"
              />
            </div>
            <div>
              <Label className="mb-1 block text-sm">Values (comma separated)</Label>
              <Input
                value={formValuesRaw}
                onChange={(e) => setFormValuesRaw(e.target.value)}
                placeholder="e.g., S, M, L"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={createVariant}>Save</Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Variant</DialogTitle>
            <DialogDescription>Update the variant name and values.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1 block text-sm">Name</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block text-sm">Values (comma separated)</Label>
              <Input value={formValuesRaw} onChange={(e) => setFormValuesRaw(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={updateVariant}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete variant?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the variant "
              {pendingDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && deleteVariant(pendingDelete._id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
