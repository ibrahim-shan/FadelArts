import { Palette, Search, Handshake } from "lucide-react";
import Reveal from "@/components/reveal";

export default function ValuesStrip() {
  const items = [
    { icon: Palette, label: "Supporting Artists" },
    { icon: Search, label: "Curating Quality" },
    { icon: Handshake, label: "Customer Happiness" },
  ];

  return (
    <section className="py-12">
      <div className="container">
        <Reveal>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {items.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center text-foreground/80">
                  <Icon className="h-7 w-7" />
                </span>
                <p
                  className="text-[11px] uppercase tracking-wider text-foreground/80 font-bold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {label}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
