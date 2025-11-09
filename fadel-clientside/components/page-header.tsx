"use client";

import Reveal from "@/components/reveal";
import Breadcrumb, { type Crumb } from "@/components/breadcrumb";

export default function PageHeader({
  title,
  subtitle,
  crumbs = [],
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="relative overflow-hidden bg-secondary/50">
      <div className="container py-14">
        <Reveal mode="mount">
          {crumbs.length > 0 ? (
            <div className="mb-4">
              <Breadcrumb items={crumbs} />
            </div>
          ) : null}
          <h1 className="mb-3 text-center md:text-left" style={{ fontFamily: "var(--font-heading)" }}>
            {title}
          </h1>
          {subtitle ? (
            <p className="text-center md:text-left text-muted-foreground">{subtitle}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

