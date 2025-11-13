// fadel-clientside/components/product/related.tsx

"use client";

import ProductCard from "@/components/product-card";
import Reveal from "@/components/reveal";
import { useEffect, useState } from "react";

// ... (Product interface) ...
interface Product {
  _id: string;
  slug: string;
  title: string;
  artist: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categories?: string[];
  styles?: string[];
  colors?: string[];
}

export default function RelatedProducts({
  current,
  categories,
  styles,
  colors,
}: {
  current: string;
  categories?: string[];
  styles?: string[];
  colors?: string[];
}) {
  const [related, setRelated] = useState<Product[]>([]);
  // --- 1. ADD A LOADING STATE ---
  const [loading, setLoading] = useState(true);
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  useEffect(() => {
    (async () => {
      setLoading(true); // Start loading
      const url = new URL(`${apiBase}/api/products/related`);

      // ... (setting searchParams is correct) ...
      url.searchParams.set("currentSlug", current);
      if (categories && categories.length > 0) {
        url.searchParams.set("categories", categories.join(","));
      }
      if (styles && styles.length > 0) {
        url.searchParams.set("styles", styles.join(","));
      }
      if (colors && colors.length > 0) {
        url.searchParams.set("colors", colors.join(","));
      }

      try {
        const res = await fetch(url.toString());
        if (!res.ok) {
          setLoading(false); // Stop loading on error
          return;
        }

        const data = await res.json();

        if (data.ok && Array.isArray(data.items)) {
          setRelated(data.items);
        }
      } catch (error) {
        console.error("Failed to fetch related products:", error);
      }
      setLoading(false); // --- 2. STOP LOADING ON SUCCESS/CATCH ---
    })();
  }, [apiBase, current, categories, styles, colors]);

  // --- 3. ONLY RETURN NULL IF LOADING IS DONE AND THERE ARE NO ITEMS ---
  if (!loading && related.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container">
        <Reveal as="h2" className="text-center text-xl md:text-2xl font-semibold mb-8" mode="mount">
          You May Also Like
        </Reveal>

        {/* --- 4. SHOW THE GRID ONLY WHEN NOT LOADING --- */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <Reveal key={p.slug}>
                <ProductCard
                  imageSrc={p.images?.[0] || "/hero-1.svg"}
                  title={p.title}
                  artist={p.artist}
                  price={p.price}
                  compareAtPrice={p.compareAtPrice}
                  href={`/product/${p.slug}`}
                />
              </Reveal>
            ))}
          </div>
        )}

        {/* You can optionally add a loading skeleton here */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Placeholder for 4 loading cards */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-4/3 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
