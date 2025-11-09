"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";

type TabKey = "description" | "details" | "artist";

export default function ProductTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<TabKey>("description");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "description", label: "Description" },
    { key: "details", label: "Details" },
    { key: "artist", label: "Artist" },
  ];

  return (
    <div className="w-full">
      <div className="border-b border-border">
        <div className="flex gap-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={active === t.key}
              onClick={() => setActive(t.key)}
              className={cn(
                "relative py-3 text-sm font-medium transition-colors duration-200",
                active === t.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              {active === t.key && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute left-0 right-0 -bottom-px h-[2px] rounded bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 text-sm leading-6 text-muted-foreground min-h-[120px]">
        <AnimatePresence mode="wait">
          {active === "description" && (
            <motion.div
              key="description"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <p>{product.description}</p>
            </motion.div>
          )}

          {active === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-3 sm:grid-cols-2"
            >
              <DetailRow label="Title" value={product.title} />
              <DetailRow label="Artist" value={product.artist} />
              <DetailRow label="Price" value={`$${product.price}`} />
              <DetailRow label="SKU" value={product.slug.toUpperCase()} />
              {product.dimensions && <DetailRow label="Dimensions" value={product.dimensions} />}
              {product.medium && <DetailRow label="Medium" value={product.medium} />}
              {product.year && <DetailRow label="Year" value={String(product.year)} />}
              {product.materials && <DetailRow label="Materials" value={product.materials} />}
            </motion.div>
          )}

          {active === "artist" && (
            <motion.div
              key="artist"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <p>
                {product.artist} is featured in our curated collection. Each piece is
                selected for craftsmanship and originality.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-6 rounded-md border border-border bg-accent/30 px-4 py-3 dark:bg-accent/20">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
