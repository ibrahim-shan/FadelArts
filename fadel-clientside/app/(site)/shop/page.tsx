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

// --- ADD PRODUCT TYPE ---
type Product = {
  _id: string;
  slug: string;
  title: string;
  artist: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
};

// --- ADD DATA FETCHING FUNCTION ---
async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const url = new URL(`${apiBase}/api/products`);

  // Pass all search params from the page URL to the API
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, String(value));
    }
  });

  // --- THIS WAS THE FIX ---
  // Set default page size to 6 if not provided
  if (!url.searchParams.has("pageSize")) {
    url.searchParams.set("pageSize", "6");
  }

  try {
    const res = await fetch(url.toString(), {
      cache: "no-store", // Don't cache shop pages
    });

    if (!res.ok) {
      console.error("Failed to fetch products:", res.statusText);
      // --- THIS WAS THE FIX (fallback) ---
      return { items: [], total: 0, page: 1, pageSize: 6 };
    }
    
    const data = await res.json();
    return {
      items: (data.items || []) as Product[],
      total: (data.total || 0) as number,
      page: (data.page || 1) as number,
      // --- THIS WAS THE FIX (default) ---
      pageSize: (data.pageSize || 6) as number,
    };
  } catch (error) {
    console.error("Fetch error for products:", error);
    // --- THIS WAS THE FIX (error) ---
    return { items: [], total: 0, page: 1, pageSize: 6 };
  }
}

// --- UPDATE THE COMPONENT SIGNATURE ---
export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  
  // --- FETCH DATA ---
  const { items: products, total, page, pageSize } = await getProducts(searchParams);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(total / pageSize);

  return (
    <main>
      <PageHeader
        title="Shop"
        subtitle="Browse paintings by category, style, size, and color."
        crumbs={[{ label: "Shop" }]}
      />
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
            <ShopFilters />
            <div>
              <Reveal>
                <ShopToolbar />
                
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.length === 0 ? (
                    <p className="col-span-full text-muted-foreground">
                      No products found.
                    </p>
                  ) : (
                    products.map((product) => (
                      <ProductCard
                        key={product._id}
                        imageSrc={product.images?.[0] || "/hero-1.svg"}
                        title={product.title}
                        artist={product.artist}
                        price={product.price}
                        compareAtPrice={product.compareAtPrice}
                        href={`/product/${product.slug}`}
                      />
                    ))
                  )}
                </div>
                

                <Pagination
                  current={page}
                  total={totalPages}
                  basePath="/shop"
                  searchParams={searchParams}
                />
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}