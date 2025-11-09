"use client";

import Image from "next/image";
import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type ProductCardProps = {
  imageSrc: string;
  imageAlt?: string;
  title: string;
  artist: string; // drawer name
  price: number | string; // current price
  compareAtPrice?: number | string; // original price for sale display
  currency?: string; // ISO currency code, default USD
  className?: string;
  href?: string;
};

function formatPrice(value: number | string, currency = "USD") {
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return String(value);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(num);
}

export function ProductCard({
  imageSrc,
  imageAlt,
  title,
  artist,
  price,
  compareAtPrice,
  currency = "USD",
  className,
  href,
}: ProductCardProps) {
  const toNum = (v: number | string | undefined) =>
    typeof v === "string" ? Number(v) : v;
  const current = toNum(price);
  const compare = toNum(compareAtPrice);
  const onSale =
    current !== undefined &&
    compare !== undefined &&
    Number.isFinite(current) &&
    Number.isFinite(compare) &&
    (compare as number) > (current as number);

  // Subtle parallax on hover
  const [hovered, setHovered] = React.useState(false);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    const range = 8; // max px offset
    setOffset({ x: (px - 0.5) * range, y: (py - 0.5) * range });
  };
  const handleLeave = () => {
    setHovered(false);
    setOffset({ x: 0, y: 0 });
  };

  const content = (
    <div className={"group flex flex-col items-center " + (className ?? "")}>
      <div className="relative w-full overflow-hidden">
        {onSale ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-brand-sm">
            Sale
          </span>
        ) : null}
        {/* Image without any border; default to 4:5 ratio common for art prints */}
        <motion.div
          className="relative w-full"
          style={{ aspectRatio: "4 / 5" }}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          animate={{ scale: hovered ? 1.02 : 1, x: offset.x, y: offset.y }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
        >
          <Image
            src={imageSrc}
            alt={imageAlt ?? title}
            draggable={false}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority={false}
          />
        </motion.div>
      </div>

      <div className="mt-4 w-full text-center">
        <h3
          className="text-base sm:text-lg font-semibold tracking-tight transition-colors duration-200 group-hover:text-primary"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground font-light">
          {artist}
        </p>
        {onSale ? (
          <div className="mt-2 flex items-baseline justify-center gap-2">
            <span className="text-base font-semibold text-primary">
              {formatPrice(price, currency)}
            </span>
            <span className="text-sm line-through text-muted-foreground">
              {formatPrice(compareAtPrice as number, currency)}
            </span>
          </div>
        ) : (
          <p className="mt-2 text-base font-semibold text-foreground">
            {formatPrice(price, currency)}
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export default ProductCard;
