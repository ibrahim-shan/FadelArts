import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/breadcrumb";
import Reveal from "@/components/reveal";
import { getProductBySlug } from "@/data/products";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/gallery";
import ProductTabs from "@/components/product/tabs";
import RelatedProducts from "@/components/product/related";
import { FaArrowCircleRight, FaWhatsapp } from "react-icons/fa";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  if (!p) return { title: "Product — Fadel Art" };
  return { title: `${p.title} — Fadel Art`, description: p.description };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return notFound();

  const { title, artist, price, images, description } = product;

  return (
    <main>
      <section className="relative overflow-hidden bg-secondary/50">
        <div className="container py-10">
          <Breadcrumb
            items={[{ label: "Shop", href: "/shop" }, { label: title }]}
          />
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="grid gap-10 md:grid-cols-2">
            {/* Gallery */}
            <div>
              <Reveal>
                <ProductGallery images={images} title={title} />
              </Reveal>
            </div>

            {/* Details */}
            <div>
              <Reveal>
                <h1
                  className="text-2xl md:text-3xl"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  By {artist}
                </p>
                <p className="mt-4 text-xl font-semibold">${price}</p>
                <p className="mt-4 text-sm text-muted-foreground prose-max">
                  {description}
                </p>
                <div className="mt-6">
                  {(() => {
                    const msg = encodeURIComponent(
                      `Hello, I'm interested in "${title}" (${slug}).`
                    );
                    const waHref = `https://wa.me/${
                      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""
                    }?text=${msg}`;
                    return (
                      <Button
                        variant="whatsapp"
                        size="lg"
                        asChild
                        className="h-11 px-6"
                      >
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaWhatsapp />
                          Order Now
                        </a>
                      </Button>
                    );
                  })()}
                  <p className="mt-2 text-xs text-muted-foreground flex items-center justify-start gap-1">
                    <FaArrowCircleRight className="text-[#25D366]" />
                    Chat on WhatsApp
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs: Description / Details / Artist */}
      <section className="pb-16">
        <div className="container">
          <Reveal>
            <ProductTabs product={product} />
          </Reveal>
        </div>
      </section>

      {/* Related */}
      <RelatedProducts current={slug} />
    </main>
  );
}
