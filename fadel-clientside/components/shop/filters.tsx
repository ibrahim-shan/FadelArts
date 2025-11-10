"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox as UICheckbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";

type CheckboxOption = { id: string; label: string };

const CATEGORIES: CheckboxOption[] = [
  { id: "painting", label: "Painting" },
  { id: "print", label: "Print" },
  { id: "original", label: "Original" },
  { id: "limited", label: "Limited Edition" },
];

const STYLES: CheckboxOption[] = [
  { id: "abstract", label: "Abstract" },
  { id: "minimal", label: "Minimal" },
  { id: "nature", label: "Nature" },
  { id: "portrait", label: "Portrait" },
  { id: "geometric", label: "Geometric" },
];

const SIZES: CheckboxOption[] = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
  { id: "xl", label: "XL" },
];

const COLORS: { id: string; name: string; value: string }[] = [
  { id: "gold", name: "Gold", value: "#9c6f00" },
  { id: "blue", name: "Blue", value: "#4682b4" },
  { id: "teal", name: "Teal", value: "#2f4f4f" },
  { id: "black", name: "Black", value: "#111" },
  { id: "white", name: "White", value: "#fff" },
];

// Collapsible defined at module scope to preserve state across parent re-renders
function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-2 border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-2 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// *** FIX: Moved Section component outside ShopFilters ***
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-border/60 last:border-b-0">
      <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// *** FIX: Moved Checkbox component outside ShopFilters ***
// It now takes `isOn` and `onToggle` as props
function Checkbox({
  id,
  label,
  isOn,
  onToggle,
}: CheckboxOption & { isOn: boolean; onToggle: (id: string) => void }) {
  return (
    <label
      className="flex items-center gap-3 py-1.5 cursor-pointer"
      // <-- onClick IS NOW REMOVED
    >
      <UICheckbox
        checked={isOn}
        onCheckedChange={() => onToggle(id)} // <-- This correctly handles the click
        aria-label={label}
        className="sr-only"
      />
      <span
        className={`relative inline-flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors ${
          isOn ? "bg-primary border-primary" : "bg-background border-border/70"
        }`}
      >
        {isOn && (
          <svg viewBox="0 0 12 10" className="h-2.5 w-2.5 text-primary-foreground">
            <path
              d="M1 5.5 4.5 9 11 1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="text-sm">{label}</span>
    </label>
  );
}

export default function ShopFilters() {
  const [selected, setSelected] = useState<Record<string, boolean>>({}); // Price range (slider + inputs)
  const PRICE_MIN = 0;
  const PRICE_MAX = 10000;
  const PRICE_STEP = 10;
  const [rangeMin, setRangeMin] = useState<number>(100);
  const [rangeMax, setRangeMax] = useState<number>(2000);
  const [priceMin, setPriceMin] = useState<string>(String(rangeMin));
  const [priceMax, setPriceMax] = useState<string>(String(rangeMax));

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const clearAll = () => {
    setSelected({});
    setRangeMin(PRICE_MIN);
    setRangeMax(PRICE_MAX);
    setPriceMin(String(PRICE_MIN));
    setPriceMax(String(PRICE_MAX));
  }; // *** FIX: Removed Section and Checkbox definitions from here ***

  return (
    <aside className="rounded-xl border border-border bg-card p-4 shadow-brand-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Filters
        </h2>
        <Button variant="ghost" className="h-8 px-3" onClick={clearAll}>
          Clear
        </Button>
      </div>
      <Collapsible title="Categories">
        <div className="grid gap-1.5">
          {CATEGORIES.map(
            (
              o, // *** FIX: Pass isOn and onToggle props to Checkbox ***
            ) => (
              <Checkbox key={o.id} {...o} isOn={!!selected[o.id]} onToggle={toggle} />
            ),
          )}
        </div>
      </Collapsible>
      <Collapsible title="Style">
        <div className="grid gap-1.5">
          {STYLES.map(
            (
              o, // *** FIX: Pass isOn and onToggle props to Checkbox ***
            ) => (
              <Checkbox key={o.id} {...o} isOn={!!selected[o.id]} onToggle={toggle} />
            ),
          )}
        </div>
      </Collapsible>
      <Section title="Price Range">
        <DualRangeSlider
          value={[rangeMin, rangeMax]}
          onValueChange={([minV, maxV]) => {
            setRangeMin(minV);
            setRangeMax(maxV);
            setPriceMin(String(minV));
            setPriceMax(String(maxV));
          }}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
        />
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor="min" className="text-xs">
              Min
            </Label>
            <Input
              id="min"
              type="text"
              value={priceMin}
              onChange={(e) => {
                setPriceMin(e.target.value);
              }}
              onBlur={() => {
                const v = Number(priceMin);
                if (!Number.isNaN(v)) {
                  const clamped = Math.max(PRICE_MIN, Math.min(v, rangeMax - PRICE_STEP));
                  setRangeMin(clamped);
                  setPriceMin(String(clamped));
                } else {
                  setPriceMin(String(rangeMin));
                }
              }}
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="max" className="text-xs">
              Max
            </Label>
            <Input
              id="max"
              type="text"
              value={priceMax}
              onChange={(e) => {
                setPriceMax(e.target.value);
              }}
              onBlur={() => {
                const v = Number(priceMax);
                if (!Number.isNaN(v)) {
                  const clamped = Math.min(PRICE_MAX, Math.max(v, rangeMin + PRICE_STEP));
                  setRangeMax(clamped);
                  setPriceMax(String(clamped));
                } else {
                  setPriceMax(String(rangeMax));
                }
              }}
              placeholder="1000"
            />
          </div>
        </div>
      </Section>
      <Section title="Size">
        <div className="grid gap-1.5">
          {SIZES.map((o) => (
            // *** FIX: Pass isOn and onToggle props to Checkbox ***
            <Checkbox key={o.id} {...o} isOn={!!selected[o.id]} onToggle={toggle} />
          ))}
        </div>
      </Section>
      <Section title="Colors">
        <div className="flex flex-wrap gap-3">
          {COLORS.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2 cursor-pointer"
              // <-- onClick IS NOW REMOVED
            >
              <UICheckbox
                checked={!!selected[c.id]}
                onCheckedChange={() => toggle(c.id)} // <-- This correctly handles the click
                className="sr-only"
                aria-label={c.name}
              />
              <span
                className={`inline-block h-5 w-5 rounded-full ring-1 ${
                  selected[c.id] ? "ring-2 ring-primary" : "ring-border"
                }`}
                style={{ background: c.value }}
                aria-label={c.name}
                title={c.name}
              />
              <span className="text-xs text-muted-foreground">{c.name}</span>
            </label>
          ))}
        </div>
      </Section>
    </aside>
  );
}
