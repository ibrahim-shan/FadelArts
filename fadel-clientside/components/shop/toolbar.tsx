"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function ShopToolbar() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="sm:max-w-sm w-full">
        <Input
          placeholder="Search artworks, artists, collections…"
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
          onChange={(e) => setSort(e.target.value)}
          className="h-11 rounded-md border border-border/60 bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name</option>
        </select>
      </div>
    </div>
  );
}
