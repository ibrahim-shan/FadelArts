"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/reveal";
import { FaWhatsapp } from "react-icons/fa";
import VariantSelector from "@/components/product/variant-selector"; // We will modify this next
import Image from "next/image";

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
  options?: { name: string; values: string[] }[];
  productVariants?: {
    _id?: string;
    options: { name: string; value: string }[];
    price: number;
    inventory?: number;
  }[];
}

export default function ProductDetailsClient({
  product,
  phoneNumber,
  productUrlPath,
}: {
  product: Product;
  phoneNumber?: string;
  productImage?: string; // <-- ADD THIS
  productUrlPath?: string; // <-- ADD THIS
}) {
  const {
    title,
    artist,
    price,
    compareAtPrice,
    shortDescription,
    description,
    options = [],
    productVariants = [],
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
  const activeOptions = options.filter((opt) => Array.isArray(opt.values) && opt.values.length > 0);
  const requiresSelection = activeOptions.length > 0;
  const allVariantsSelected =
    !requiresSelection || activeOptions.length === Object.keys(selectedValues).length;

  const matchedCombination =
    requiresSelection && allVariantsSelected && productVariants.length
      ? productVariants.find((combo) => {
          if (!Array.isArray(combo.options) || combo.options.length !== activeOptions.length) {
            return false;
          }
          return combo.options.every(
            (opt) => selectedValues[opt.name] && selectedValues[opt.name] === opt.value,
          );
        })
      : undefined;

  const displayPrice = matchedCombination?.price ?? price;

  // 3. Build the WhatsApp message with selected variants
  // ... (inside the ProductDetailsClient component) ...

  // ... (inside the ProductDetailsClient component) ...

  const buildWhatsAppMessage = () => {
    const selectedVariantsText = Object.entries(selectedValues)
      .map(([name, value]) => `- ${name}: ${value}`)
      .join("\n");

    const fullProductUrl = productUrlPath
      ? `${window.location.origin}${productUrlPath}`
      : "Link not available";

    const messageParts = [
      `✨ *New Order Inquiry!*`,
      `\n🎨 *Product:* ${title}`,
      `\n🔗 *Link:* ${fullProductUrl}`,
    ];

    if (selectedVariantsText) {
      messageParts.push(`\n✅ *Options Selected:*`);
      messageParts.push(selectedVariantsText);
    }

    messageParts.push(`\n\nHello, I’m interested in this product. 👋`);

    const fullMessage = messageParts.join("\n");

    const cleanPhoneNumber = phoneNumber ? phoneNumber.replace(/[\s+()-]/g, "") : "";

    // Use api.whatsapp.com/send first (better emoji support)
    // Fallback to wa.me if necessary
    const encodedText = encodeURIComponent(fullMessage);
    const apiHref = `https://api.whatsapp.com/send?phone=${cleanPhoneNumber}&text=${encodedText}`;

    // You might choose to always use api.whatsapp.com/send,
    // or branch based on environment or user agent.
    return apiHref; // ← return this as default

    // return waMeHref; // ← option if you choose to use wa.me instead
  };

  // ... (rest of the component) ...

  return (
    <Reveal>
      <h1 className="text-2xl md:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
        {title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">By {artist}</p>

      {/* Price Display */}
      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-xl font-semibold">${displayPrice}</p>
        {compareAtPrice && (
          <p className="text-lg text-muted-foreground line-through">${compareAtPrice}</p>
        )}
      </div>

      <p className="mt-4 text-sm text-muted-foreground prose-max">
        {shortDescription || description}
      </p>

      {requiresSelection && !allVariantsSelected && (
        <p className="mt-6 text-xs text-accent font-bold">Please select all options to order.</p>
      )}
      {/* 4. Pass state and handler down to the (now controlled) selector */}
      <VariantSelector
        variants={activeOptions}
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
          disabled={requiresSelection && !allVariantsSelected}
        >
          <a
            href={!requiresSelection || allVariantsSelected ? buildWhatsAppMessage() : undefined}
            target="_blank"
            rel="noopener noreferrer"
            // Prevent clicking if disabled
            onClick={(e) => requiresSelection && !allVariantsSelected && e.preventDefault()}
            aria-disabled={requiresSelection && !allVariantsSelected}
          >
            <FaWhatsapp />
            Order Now
          </a>
        </Button>
      </div>
      <div className="flex items-center gap-2 mt-8 ">
        <Image src="/images/flag/lebanon-flag.webp" alt="Fadel Art Shop" width={20} height={20} />
        <p className=" text-sm font-semibold text-foreground">Delivery all over Lebanon</p>
      </div>
    </Reveal>
  );
}
