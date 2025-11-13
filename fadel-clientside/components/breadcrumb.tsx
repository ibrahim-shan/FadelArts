import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = {
  label: string;
  href?: string;
};

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  const crumbs: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="text-xs sm:text-sm" data-slot="breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="inline-flex items-center gap-1.5">
              {c.href && !isLast ? (
                <Link
                  href={c.href}
                  className="hover:text-accent transition-colors duration-200 ease-(--easing)"
                >
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-foreground font-semibold">
                  {c.label}
                </span>
              )}
              {!isLast && <ChevronRight aria-hidden className="h-3.5 w-3.5 opacity-60" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
