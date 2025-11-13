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

// Define the Style type
type Style = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};

// Define the Product type
type Product = {
  _id: string;
  slug: string;
  title: string;
  artist: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
};

// Fetch styles data
async function getStyles(): Promise<Style[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(`${apiBase}/api/styles`, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error("Failed to fetch styles:", res.statusText);
      return [];
    }
    const data = await res.json();
    return data.ok && Array.isArray(data.items) ? data.items : [];
  } catch (error) {
    console.error("Fetch error for styles:", error);
    return [];
  }
}

// Fetch latest 8 products
async function getHomepageProducts(): Promise<Product[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    // Fetch 8 products
    const res = await fetch(`${apiBase}/api/products?sort=newest&pageSize=8`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error("Failed to fetch products:", res.statusText);
      return [];
    }
    const data = await res.json();
    return data.ok && Array.isArray(data.items) ? data.items : [];
  } catch (error) {
    console.error("Fetch error for products:", error);
    return [];
  }
}

// --- ADD THIS SHUFFLE FUNCTION ---
/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * We make a copy (...) so we don't modify the original array.
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
// --- END OF NEW FUNCTION ---

export default async function Home() {
  // Await both data fetches
  const styles = await getStyles();
  const allProducts = await getHomepageProducts(); // <-- Fetches 8

  // "New Arts" gets the first 4 products (newest)
  const newArts = allProducts.slice(0, 4);

  // --- THIS IS THE FIX ---
  // "More to Explore" gets ALL 8 products, but shuffled
  const randomProducts = shuffleArray(allProducts);

  return (
    <main>
      <HashScroll />
      <Hero id="hero" />
      <section id="new-arts" className="py-12">
        <div className="container">
          <h2 className="mb-12 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            New Arts
          </h2>

          {/* Desktop grid (shows 4 newest) */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-8">
            {newArts.map((art) => (
              <ProductCard
                key={art._id}
                imageSrc={art.images?.[0] || "/hero-1.svg"}
                title={art.title}
                artist={art.artist}
                price={art.price}
                compareAtPrice={art.compareAtPrice}
                href={`/product/${art.slug}`}
              />
            ))}
          </div>

          {/* Mobile carousel (shows 4 newest) */}
          <div className="sm:hidden">
            <NewArtsMobile products={newArts} />
          </div>
        </div>
      </section>
      <div className="container -mt-4 mb-12">
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/shop">View more</Link>
          </Button>
        </div>
      </div>

      <ExploreByStyle id="styles" styles={styles} />

      {/* --- THIS IS THE FIX --- */}
      {/* Pass the shuffled 8 products to "More to Explore" */}
      <BestSellers id="best-sellers" products={randomProducts} />

      <TrustBenefits />
      <FeaturedCollections id="collections" />
      <Testimonials id="testimonials" />
      <BlogsNews id="blogs" />
      <Subscription />
    </main>
  );
}
