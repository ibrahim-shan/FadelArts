import type { Metadata } from "next";
import ShopFilters from "@/components/shop/filters";
import ProductCard from "@/components/product-card";
import Reveal from "@/components/reveal";
import PageHeader from "@/components/page-header";
import ShopToolbar from "@/components/shop/toolbar";
import Pagination from "@/components/ui/pagination";

export const metadata: Metadata = {
  title: "Shop — Fadel Art",
  description: "Browse paintings by category, style, size, and color.",
};

export default function ShopPage() {
  return (
    <main>
      <PageHeader title="Shop" subtitle="Browse paintings by category, style, size, and color." crumbs={[{ label: "Shop" }]} />
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
            <ShopFilters />
            <div>
              <Reveal>
                <ShopToolbar />
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ProductCard imageSrc="/hero-1.svg" title="Morning Light" artist="A. Drawer" price={350} />
                  <ProductCard imageSrc="/hero-2.svg" title="Urban Echoes" artist="B. Painter" price={420} compareAtPrice={520} />
                  <ProductCard imageSrc="/hero-3.svg" title="Quiet Waters" artist="C. Maker" price={440} />
                  <ProductCard imageSrc="/hero-4.svg" title="Golden Hour" artist="D. Artist" price={610} />
                  <ProductCard imageSrc="/hero-2.svg" title="City Mist" artist="E. Color" price={390} />
                  <ProductCard imageSrc="/hero-1.svg" title="Waking Dawn" artist="F. Lines" price={510} />
                </div>
                <Pagination current={1} total={5} basePath="/shop" />
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
