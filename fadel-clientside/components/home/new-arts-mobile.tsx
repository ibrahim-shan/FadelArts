"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import ProductCard from "@/components/product-card";

const ITEMS = [
  {
    imageSrc: "/hero-1.svg",
    title: "Morning Light",
    artist: "A. Drawer",
    price: 350,
  },
  {
    imageSrc: "/hero-2.svg",
    title: "Urban Echoes",
    artist: "B. Painter",
    price: 420,
    compareAtPrice: 520,
  },
  {
    imageSrc: "/hero-3.svg",
    title: "Quiet Waters",
    artist: "C. Maker",
    price: 440,
  },
  {
    imageSrc: "/hero-4.svg",
    title: "Golden Hour",
    artist: "D. Artist",
    price: 610,
  },
];

export default function NewArtsMobile() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const positionsRef = useRef<number[]>([]);
  const [constraints, setConstraints] = useState<{ left: number; right: number }>({ left: 0, right: 0 });

  // Measure positions and center single card in viewport
  useEffect(() => {
    const measure = () => {
      const node = scrollerRef.current;
      const viewport = viewportRef.current;
      if (!node || !viewport) return;
      const children = Array.from(node.children) as HTMLElement[];
      const positions = children.map((el) => el.offsetLeft);
      positionsRef.current = positions;
      const lastLeft = positions[positions.length - 1] ?? 0;
      const viewportWidth = viewport.clientWidth;
      const itemWidth = children[0]?.clientWidth ?? 0;
      const centerOffset = itemWidth > 0 ? Math.max(0, (viewportWidth - itemWidth) / 2) : 0;
      setConstraints({ left: -(lastLeft - centerOffset), right: centerOffset });
      const currentLeft = positions[index] ?? 0;
      x.set(-(currentLeft - centerOffset));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      {/* Gradient edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-background to-transparent" />

      <div className="overflow-hidden py-3 touch-pan-y" ref={viewportRef}>
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
            const viewport = viewportRef.current;
            const node = scrollerRef.current;
            const children = node ? (Array.from(node.children) as HTMLElement[]) : [];
            const viewportWidth = viewport?.clientWidth ?? 0;
            const itemWidth = children[0]?.clientWidth ?? 0;
            const centerOffset = itemWidth > 0 ? Math.max(0, (viewportWidth - itemWidth) / 2) : 0;
            const leftNow = centerOffset - currentX;
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
            animate(x, -(target - centerOffset), { type: "spring", stiffness: 170, damping: 26 });
          }}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {ITEMS.map((item, idx) => (
            <motion.div
              key={idx}
              className="shrink-0 w-[80%] xs:w-[70%] transform-gpu"
              animate={idx === index ? { scale: 1.03, rotateZ: 0.25 } : { scale: 1, rotateZ: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
            >
              <ProductCard {...item} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          {ITEMS.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to item ${i + 1}`}
              onClick={() => {
                setIndex(i);
                const targetLeft = positionsRef.current[i] ?? 0;
                const viewport = viewportRef.current;
                const node = scrollerRef.current;
                const children = node ? (Array.from(node.children) as HTMLElement[]) : [];
                const viewportWidth = viewport?.clientWidth ?? 0;
                const itemWidth = children[0]?.clientWidth ?? 0;
                const centerOffset = itemWidth > 0 ? Math.max(0, (viewportWidth - itemWidth) / 2) : 0;
                animate(x, -(targetLeft - centerOffset), { type: "spring", stiffness: 170, damping: 26 });
              }}
              className={`h-2.5 rounded-full transition-colors ${
                i === index ? "bg-primary w-6" : "bg-muted w-2.5 hover:bg-accent"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
