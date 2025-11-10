"use client";

import ProductCard from "@/components/product-card";
import { products, type Product } from "@/data/products";
import Reveal from "@/components/reveal";

export default function RelatedProducts({ current }: { current: string }) {
  const related: Product[] = products.filter((p) => p.slug !== current).slice(0, 4);

  return (
    <section className="py-12">
      <div className="container">
        <Reveal as="h2" className="text-center text-xl md:text-2xl font-semibold mb-8" mode="mount">
          You May Also Like
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {related.map((p) => (
            <Reveal key={p.slug}>
              <ProductCard
                imageSrc={p.images[0]}
                title={p.title}
                artist={p.artist}
                price={p.price}
                href={`/product/${p.slug}`}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
