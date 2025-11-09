import { Truck, RotateCcw, ShieldCheck, Lock } from "lucide-react";
import Reveal from "@/components/reveal";

type Item = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
};

const ITEMS: Item[] = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $100" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: ShieldCheck, title: "Authenticity", desc: "Certified original art" },
  { icon: Lock, title: "Secure Checkout", desc: "256-bit encryption" },
];

export default function TrustBenefits() {
  return (
    <section aria-label="Shop benefits" className="py-10 hidden md:block">
      <div className="container">
        <Reveal>
        <div className="w-full rounded-xl bg-secondary/60 border border-border shadow-brand-sm">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {ITEMS.map(({ icon: Icon, title, desc }, i) => (
              <li key={i} className="flex items-center gap-4 p-6">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background text-accent shadow-brand-sm">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                    {title}
                  </p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
