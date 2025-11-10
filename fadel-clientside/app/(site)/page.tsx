import { Hero } from "@/components/home/hero";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ExploreByStyle from "@/components/home/explore-by-style";
import BestSellers from "@/components/home/best-sellers";
import NewArtsMobile from "@/components/home/new-arts-mobile";
import TrustBenefits from "@/components/home/trust-benefits";
import FeaturedCollections from "@/components/home/featured-collections";
import Testimonials from "@/components/home/testimonials";
import BlogsNews from "@/components/home/blogs-news";
import HashScroll from "@/components/hash-scroll";
import Subscription from "@/components/home/subscription";

export default function Home() {
  return (
    <main>
      <HashScroll />
      <Hero id="hero" />
      <section id="new-arts" className="py-12">
        <div className="container">
          <h2 className="mb-12 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            New Arts
          </h2>
          {/* Desktop/tablet grid */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-8">
            <ProductCard
              imageSrc="/hero-1.svg"
              title="Morning Light"
              artist="A. Drawer"
              price={350}
              href="/product/morning-light"
            />
            <ProductCard
              imageSrc="/hero-2.svg"
              title="Urban Echoes"
              artist="B. Painter"
              price={420}
              compareAtPrice={520}
              href="/product/urban-echoes"
            />
            <ProductCard
              imageSrc="/hero-3.svg"
              title="Quiet Waters"
              artist="C. Maker"
              price={440}
              href="/product/quiet-waters"
            />
            <ProductCard
              imageSrc="/hero-4.svg"
              title="Golden Hour"
              artist="D. Artist"
              price={610}
              href="/product/golden-hour"
            />
          </div>
          {/* Mobile carousel to match Best Sellers feel */}
          <div className="sm:hidden">
            <NewArtsMobile />
          </div>
        </div>
      </section>
      <div className="container -mt-4 mb-12">
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/gallery">View more</Link>
          </Button>
        </div>
      </div>
      <ExploreByStyle id="styles" />
      <BestSellers id="best-sellers" />
      <TrustBenefits />
      <FeaturedCollections id="collections" />
      <Testimonials id="testimonials" />
      <BlogsNews id="blogs" />
      <Subscription />
    </main>
  );
}
