"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/reveal";
import { FaArrowCircleRight, FaWhatsapp } from "react-icons/fa";
import VariantSelector from "@/components/product/variant-selector"; // We will modify this next

// Copy the Product interface from your page.tsx
interface Product {
  _id: string;
  slug: string;
  title: string;
  artist: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  shortDescription?: string;
  images: string[];
  dimensions?: string;
  medium?: string;
  year?: number;
  materials?: string;
  categories?: string[];
  styles?: string[];
  colors?: string[];
  inventory?: number;
  published?: boolean;
  variants?: { name: string; values: string[] }[];
}

export default function ProductDetailsClient({ product }: { product: Product }) {
  const {
    title,
    slug,
    artist,
    price,
    compareAtPrice,
    shortDescription,
    description,
    variants = [],
  } = product;

  // 1. State is "lifted" to this parent component
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  const handleSelect = (name: string, value: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 2. Logic to check if all variants are selected
  const allVariantsSelected = variants.length === Object.keys(selectedValues).length;

  // 3. Build the WhatsApp message with selected variants
  const buildWhatsAppMessage = () => {
    // e.g., "Size: M, Frame: Black"
    const selectedVariantsText = Object.entries(selectedValues)
      .map(([name, value]) => `${name}: ${value}`)
      .join(", ");

    const baseMessage = `Hello, I'm interested in "${title}" (${slug})`;

    // Add variant text if it exists
    const fullMessage = selectedVariantsText
      ? `${baseMessage} - ${selectedVariantsText}.`
      : `${baseMessage}.`;

    const waHref = `https://wa.me/${
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""
    }?text=${encodeURIComponent(fullMessage)}`;

    return waHref;
  };

  return (
    <Reveal>
      <h1 className="text-2xl md:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
        {title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">By {artist}</p>

      {/* Price Display */}
      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-xl font-semibold">${price}</p>
        {compareAtPrice && (
          <p className="text-lg text-muted-foreground line-through">${compareAtPrice}</p>
        )}
      </div>

      <p className="mt-4 text-sm text-muted-foreground prose-max">
        {shortDescription || description}
      </p>

      {/* 4. Pass state and handler down to the (now controlled) selector */}
      <VariantSelector
        variants={variants}
        selectedValues={selectedValues}
        onSelect={handleSelect}
      />

      {/* 5. The WhatsApp button is now in the same component as the state */}
      <div className="mt-6">
        <Button
          variant="whatsapp"
          size="lg"
          asChild
          className="h-11 px-6"
          // 6. Add the disabled logic
          disabled={!allVariantsSelected}
        >
          <a
            href={allVariantsSelected ? buildWhatsAppMessage() : undefined}
            target="_blank"
            rel="noopener noreferrer"
            // Prevent clicking if disabled
            onClick={(e) => !allVariantsSelected && e.preventDefault()}
            aria-disabled={!allVariantsSelected}
          >
            <FaWhatsapp />
            Order Now
          </a>
        </Button>
        {!allVariantsSelected && (
          <p className="mt-2 text-xs text-muted-foreground">Please select all options to order.</p>
        )}
      </div>
    </Reveal>
  );
}
