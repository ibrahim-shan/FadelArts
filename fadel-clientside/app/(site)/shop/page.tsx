import type { Metadata } from "next";
import ShopFilters from "@/components/shop/filters";
import ProductCard from "@/components/product-card";
import Reveal from "@/components/reveal";
import PageHeader from "@/components/page-header";
import ShopToolbar from "@/components/shop/toolbar";
import Pagination from "@/components/ui/pagination";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shop — Fadel Art",
  description:
    "Shop page listing available artworks on Fadel Art, with filtering options for category, style, size, and color.",
};

type Product = {
  _id: string;
  slug: string;
  title: string;
  artist: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
};

type Category = { _id: string; name: string };
type Style = { _id: string; name: string };
type Variant = { _id: string; name: string; slug: string; values: string[] };

async function getFilterData() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  // Use a long revalidation time for this data, as it rarely changes
  const fetchOptions = { next: { revalidate: 3600 } }; // 1 hour

  try {
    const [catRes, styleRes, colorRes, varRes] = await Promise.all([
      fetch(`${apiBase}/api/categories/in-use`, fetchOptions),
      fetch(`${apiBase}/api/styles/in-use`, fetchOptions),
      fetch(`${apiBase}/api/products/colors/in-use`, fetchOptions),
      fetch(`${apiBase}/api/variants/in-use`, fetchOptions),
    ]);

    const categories: Category[] = (await catRes.json()).items || [];
    const styles: Style[] = (await styleRes.json()).items || [];
    const colors: string[] = (await colorRes.json()).items || [];
    const variants: Variant[] = (await varRes.json()).items || [];

    return { categories, styles, colors, variants };
  } catch (error) {
    console.error("Failed to fetch filter data:", error);
    return { categories: [], styles: [], colors: [], variants: [] };
  }
}

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const url = new URL(`${apiBase}/api/products`);

  // Pass all search params from the page URL to the API (normalize sort)
  const entries = Object.entries(searchParams).map(([k, v]) => [k, v ? String(v) : undefined]);
  const map: Record<string, string | undefined> = Object.fromEntries(entries);
  if (map.sort === "price-asc") map.sort = "price_asc";
  if (map.sort === "price-desc") map.sort = "price_desc";
  if (map.sort === "name") map.sort = "newest";
  Object.entries(map).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("[Shop/getProducts] searchParams=", map);
    console.log("[Shop/getProducts] API URL=", url.toString());
  }

  // Set default page size to 6 if not provided
  if (!url.searchParams.has("pageSize")) {
    url.searchParams.set("pageSize", "6");
  }

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });

    if (!res.ok) {
      console.error("Failed to fetch products:", res.statusText);
      return { items: [], total: 0, page: 1, pageSize: 6 };
    }

    const data = await res.json();
    if (process.env.NODE_ENV !== "production") {
      console.log("[Shop/getProducts] result:", {
        items: Array.isArray(data.items) ? data.items.length : 0,
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
      });
    }
    return {
      items: (data.items || []) as Product[],
      total: (data.total || 0) as number,
      page: (data.page || 1) as number,
      pageSize: (data.pageSize || 6) as number,
    };
  } catch (error) {
    console.error("Fetch error for products:", error);
    return { items: [], total: 0, page: 1, pageSize: 6 };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const [{ items: products, total, page, pageSize }, { categories, styles, colors, variants }] =
    await Promise.all([getProducts(sp), getFilterData()]);

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
            <ShopFilters
              categoriesData={categories}
              stylesData={styles}
              colorsData={colors}
              variantsData={variants}
            />
            <div>
              <Reveal>
                <ShopToolbar />

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.length === 0 ? (
                    <p className="col-span-full text-muted-foreground">No products found.</p>
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

                <Pagination current={page} total={totalPages} basePath="/shop" searchParams={sp} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
