import Link from "next/link";

type PageItem = number | "ellipsis";

function buildPages(current: number, total: number, maxLength = 7): PageItem[] {
  if (total <= maxLength) return Array.from({ length: total }, (_, i) => i + 1);
  const side = 1; // how many pages to show near ends
  const around = 1; // how many pages around current
  const pages = new Set<number>();
  // Always include first/last
  pages.add(1);
  pages.add(total);
  // Near start and end blocks
  for (let i = 1; i <= side; i++) {
    pages.add(i);
    pages.add(total - i + 1);
  }
  // Around current
  for (let i = current - around; i <= current + around; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: PageItem[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    if (i === 0) {
      result.push(p);
      continue;
    }
    const prev = sorted[i - 1];
    if (p - prev === 1) {
      result.push(p);
    } else {
      result.push("ellipsis");
      result.push(p);
    }
  }
  return result;
}

export default function Pagination({
  current = 1,
  total = 3,
  basePath = "/shop",
  searchParams,
}: {
  current?: number;
  total?: number;
  basePath?: string;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Pagination] render", { current, total, basePath, searchParams });
  }
  const items = buildPages(current, total);
  const prev = Math.max(1, current - 1);
  const next = Math.min(total, current + 1);

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => {
        if (typeof v === "undefined") return;
        // normalize values to string
        const sv = Array.isArray(v) ? v[0] : v;
        if (sv != null && sv !== "") params.set(k, String(sv));
      });
    }
    params.set("page", String(p));
    const href = `${basePath}?${params.toString()}`;
    if (process.env.NODE_ENV !== "production") {
      console.log("[Pagination] pageHref", p, "->", href);
    }
    return href;
  };

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
      <Link
        className={`px-3 h-10 inline-flex items-center rounded-md border border-border/60 text-sm hover:bg-muted ${
          current === 1 ? "pointer-events-none opacity-50" : ""
        }`}
        href={pageHref(prev)}
        scroll={true}
      >
        Previous
      </Link>
      <ul className="flex items-center gap-1">
        {items.map((it, idx) =>
          it === "ellipsis" ? (
            <li key={`e${idx}`} className="px-2 text-sm text-muted-foreground">
              …
            </li>
          ) : (
            <li key={it}>
              <Link
                href={pageHref(it)}
                scroll={true}
                className={`h-10 min-w-10 px-3 inline-flex items-center justify-center rounded-md border text-sm transition-colors ${
                  it === current
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/60 hover:bg-muted"
                }`}
                aria-current={it === current ? "page" : undefined}
              >
                {it}
              </Link>
            </li>
          ),
        )}
      </ul>
      <Link
        className={`px-3 h-10 inline-flex items-center rounded-md border border-border/60 text-sm hover:bg-muted ${
          current === total ? "pointer-events-none opacity-50" : ""
        }`}
        href={pageHref(next)}
        scroll={true}
      >
        Next
      </Link>
    </nav>
  );
}
