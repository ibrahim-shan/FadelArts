import type { Metadata } from "next";
import Breadcrumb from "@/components/breadcrumb";
import Reveal from "@/components/reveal";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/gallery";
import ProductTabs from "@/components/product/tabs";
import RelatedProducts from "@/components/product/related";
import ProductDetailsClient from "@/components/product/product-details";

type ContactInfo = {
  email?: string;
  phone?: string;
  location?: string;
  hours?: string;
  mapEmbedUrl?: string;
};
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
  options?: { name: string; values: string[] }[];
  productVariants?: {
    _id?: string;
    options: { name: string; value: string }[];
    price: number;
    inventory?: number;
  }[];
}

async function getContactInfo(): Promise<ContactInfo> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(`${apiBase}/api/settings/contact/public`, {
      // Revalidate this data, e.g., every 15 minutes
      next: { revalidate: 900 },
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.ok ? data.info : {};
  } catch (error) {
    console.error("Failed to fetch contact info:", error);
    return {};
  }
}

// 2. Create a new data-fetching function (no change)
async function getProduct(slug: string): Promise<Product | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(`${apiBase}/api/products/${slug}`, {
      next: { revalidate: 3600 },
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
  const [product, contactInfo] = await Promise.all([getProduct(slug), getContactInfo()]);
  if (!product) return notFound();

  const { title, images } = product;
  const mainImage = product.images?.[0];
  const productPath = `/product/${product.slug}`;

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
              <ProductDetailsClient
                product={product}
                phoneNumber={contactInfo.phone}
                productImage={mainImage}
                productUrlPath={productPath}
              />
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
