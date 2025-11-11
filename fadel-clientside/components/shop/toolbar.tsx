"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function ShopToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read from URL so UI stays in sync with server params
  const currentQ = searchParams.get("q") || "";
  const currentSort = searchParams.get("sort") || "newest";

  // Local state mirrors URL for debounced typing
  const [q, setQ] = useState(currentQ);
  const [sort, setSort] = useState(currentSort);

  // Sync state when URL changes externally
  useEffect(() => setQ(currentQ), [currentQ]);
  useEffect(() => setSort(currentSort), [currentSort]);

  const pushParams = (next: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v) params.delete(k);
      else params.set(k, v);
    });
    // Reset to first page when search/sort changes
    params.delete("page");
    const href = `${pathname}?${params.toString()}`;
    if (process.env.NODE_ENV !== "production") {
      console.log("[Toolbar] push", next, "->", href);
    }
    // V-- ADD { scroll: false } HERE --V
    router.push(href, { scroll: false });
  };

  // Debounce search typing
  useEffect(() => {
    const id = setTimeout(() => {
      if (q !== currentQ) {
        if (process.env.NODE_ENV !== "production") {
          console.log("[Toolbar] debounce apply q=", q);
        }
        pushParams({ q });
      }
    }, 300);
    return () => clearTimeout(id);
  }, [q]);

  const handleSortChange = (value: string) => {
    // Server expects: newest | price_asc | price_desc
    if (process.env.NODE_ENV !== "production") {
      console.log("[Toolbar] sort=", value);
    }
    pushParams({ sort: value });
  };

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="sm:max-w-sm w-full">
        <Input
          placeholder="Search artworks, artists, collections"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search shop"
          className="h-11"
        />
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-sm text-muted-foreground">
          Sort by
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => {
            const v = e.target.value;
            setSort(v);
            handleSortChange(v);
          }}
          className="h-11 rounded-md border border-border/60 bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
