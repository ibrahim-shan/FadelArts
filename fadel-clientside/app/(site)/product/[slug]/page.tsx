import type { Metadata } from "next";
import Breadcrumb from "@/components/breadcrumb";
import Reveal from "@/components/reveal";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/gallery";
import ProductTabs from "@/components/product/tabs";
import RelatedProducts from "@/components/product/related";
import ProductDetailsClient from "@/components/product/product-details";

// 1. Define the Product type (no change)
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

// 2. Create a new data-fetching function (no change)
async function getProduct(slug: string): Promise<Product | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(`${apiBase}/api/products/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    if (!data.ok || !data.product) {
      return null;
    }
    return data.product;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

// 3. Update generateMetadata (WITH THE FIX)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>; // <-- Keep this as a Promise
}): Promise<Metadata> {
  const { slug } = await params; // <-- FIX: Add 'await' back
  const p = await getProduct(slug);
  if (!p) return { title: "Product — Fadel Art" };
  return {
    title: `${p.title} — Fadel Art`,
    description: p.shortDescription || p.description,
  };
}

// 4. Update ProductPage (WITH THE FIX)
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return notFound();

  const { title, images } = product;

  return (
    <main>
      <section className="relative overflow-hidden bg-secondary/50">
        <div className="container py-10">
          <Breadcrumb items={[{ label: "Shop", href: "/shop" }, { label: title }]} />
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="grid gap-10 md:grid-cols-2">
            {/* Gallery (Server) */}
            <div>
              <Reveal>
                <ProductGallery images={images} title={title} />
              </Reveal>
            </div>

            {/* 3. Render the new client component for all details */}
            <div>
              <ProductDetailsClient product={product} />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs: Description / Details / Artist */}
      <section className="pb-16">
        <div className="container">
          <Reveal>
            {/* Pass the full product object here */}
            <ProductTabs product={product} />
          </Reveal>
        </div>
      </section>

      {/* Related */}
      <RelatedProducts
        current={slug}
        categories={product.categories}
        styles={product.styles}
        colors={product.colors}
      />
    </main>
  );
}
