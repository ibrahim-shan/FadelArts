"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="relative w-full overflow-hidden rounded-xl shadow-brand-md" style={{ aspectRatio: "4 / 5" }}>
        <Image
          src={images[active]}
          alt={title}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {images.slice(0, 4).map((src, idx) => (
          <button
            key={src}
            onClick={() => setActive(idx)}
            className={`relative overflow-hidden rounded-md ring-1 ${idx === active ? "ring-primary" : "ring-border"}`}
            style={{ aspectRatio: "1 / 1" }}
            aria-label={`View image ${idx + 1}`}
          >
            <Image src={src} alt={`${title} thumbnail ${idx + 1}`} fill sizes="120px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
