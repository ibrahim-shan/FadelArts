"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Reveal from "@/components/reveal";

// --- ADD THIS TYPE DEFINITION ---
type Product = {
  _id: string;
  slug: string;
  title: string;
  artist: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
};

// --- REMOVE THE HARDCODED 'ITEMS' ARRAY ---

// --- UPDATE THE COMPONENT PROPS ---
export default function BestSellers({
  id = "best-sellers",
  products = [], // Accept products as a prop
}: {
  id?: string;
  products: Product[];
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const positionsRef = useRef<number[]>([]);
  const [constraints, setConstraints] = useState<{ left: number; right: number }>({
    left: 0,
    right: 0,
  });
  const [visibleCount, setVisibleCount] = useState(1);
  const centerOffsetRef = useRef(0);

  // Align and measure on mount and window resize
  useEffect(() => {
    const measure = () => {
      const node = scrollerRef.current;
      const viewport = viewportRef.current;
      if (!node || !viewport) return;
      const children = Array.from(node.children) as HTMLElement[];
      if (children.length === 0) return; // Add check for empty
      const positions = children.map((el) => el.offsetLeft);
      positionsRef.current = positions;
      const lastLeft = positions[positions.length - 1] ?? 0;
      let viewportWidth = 0;
      let itemWidth = 0;
      if (viewport && children[0]) {
        viewportWidth = viewport.clientWidth;
        itemWidth = children[0].clientWidth;
      }
      const count = itemWidth > 0 ? Math.max(1, Math.round(viewportWidth / itemWidth)) : 1;
      setVisibleCount(count);
      const centerOffset =
        count === 1 && itemWidth > 0 ? Math.max(0, (viewportWidth - itemWidth) / 2) : 0;
      centerOffsetRef.current = centerOffset;
      setConstraints({ left: -(lastLeft - centerOffset), right: centerOffset });
      const currentLeft = positions[index] ?? 0;
      x.set(-(currentLeft - centerOffset));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]); // <-- Re-run when products data loads

  return (
    <section id={id} className="py-12">
      <div className="container">
        <Reveal>
          <div className="mb-12">
            <h2 className="text-center" style={{ fontFamily: "var(--font-heading)" }}>
              {/* --- CHANGE THE TITLE --- */}
              More to Explore
            </h2>
          </div>
        </Reveal>

        <div className="relative">
          {/* Gradient edges for scroll hint */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-background to-transparent" />

          <Reveal>
            <div className="overflow-hidden py-3 md:py-0 touch-pan-y" ref={viewportRef}>
              <motion.div
                ref={scrollerRef}
                className="flex gap-6 pb-2 cursor-grab select-none transform-gpu"
                style={{ x, cursor: dragging ? "grabbing" : "grab", willChange: "transform" }}
                drag="x"
                dragElastic={0.04}
                dragMomentum={false}
                dragConstraints={constraints}
                onDragStart={() => setDragging(true)}
                onDragEnd={(_, info) => {
                  setDragging(false);
                  const positions = positionsRef.current;
                  if (!positions.length) return;
                  const currentX = x.get();
                  const c = centerOffsetRef.current;
                  const leftNow = c - currentX;
                  const predictedLeft = leftNow - info.velocity.x * 0.2;
                  let nearestIndex = 0;
                  let nearestDist = Infinity;
                  positions.forEach((pos, i) => {
                    const d = Math.abs(pos - predictedLeft);
                    if (d < nearestDist) {
                      nearestDist = d;
                      nearestIndex = i;
                    }
                  });
                  setIndex(nearestIndex);
                  const target = positions[nearestIndex] ?? 0;
                  animate(x, -(target - c), { type: "spring", stiffness: 170, damping: 26 });
                }}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {/* --- UPDATE THIS MAP --- */}
                {products.map((item, idx) => {
                  const isActive = idx === index;
                  return (
                    <motion.div
                      key={item._id} // Use unique ID
                      className="snap-start shrink-0 w-[76%] xs:w-[60%] sm:w-[42%] md:w-[32%] lg:w-[24%] transform-gpu"
                      animate={isActive ? { scale: 1.03, rotateZ: 0.25 } : { scale: 1, rotateZ: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    >
                      {/* Pass dynamic props */}
                      <ProductCard
                        imageSrc={item.images?.[0] || "/hero-1.svg"}
                        title={item.title}
                        artist={item.artist}
                        price={item.price}
                        compareAtPrice={item.compareAtPrice}
                        href={`/product/${item.slug}`}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </Reveal>

          {/* Page-based dots */}
          <Reveal>
            <div className="mt-4 flex items-center justify-center">
              {(() => {
                // --- UPDATE THIS LINE ---
                const totalPages = Math.max(1, Math.ceil(products.length / visibleCount));
                const currentPage = Math.floor(index / visibleCount);
                return (
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }).map((_, p) => (
                      <button
                        key={p}
                        aria-label={`Go to page ${p + 1}`}
                        onClick={() => {
                          // --- UPDATE THIS LINE ---
                          const targetIndex = Math.min(products.length - 1, p * visibleCount);
                          setIndex(targetIndex);
                          const targetLeft = positionsRef.current[targetIndex] ?? 0;
                          const c = centerOffsetRef.current;
                          animate(x, -(targetLeft - c), {
                            type: "spring",
                            stiffness: 170,
                            damping: 26,
                          });
                        }}
                        className={`h-2.5 rounded-full transition-colors ${
                          p === currentPage ? "bg-primary w-6" : "bg-muted w-2.5 hover:bg-accent"
                        }`}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          </Reveal>

          {/* View more */}
          <div className="mt-8 flex items-center justify-center">
            <Button asChild>
              <Link href="/shop">View more</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}