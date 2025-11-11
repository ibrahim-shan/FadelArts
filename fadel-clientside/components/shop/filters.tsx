"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox as UICheckbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";

type CheckboxOption = { id: string; label: string };
type Category = { _id: string; name: string };
type Style = { _id: string; name: string };

// Categories and styles are fetched from backend
// Categories will use their Mongo _id as filter values
// Styles will use their name as filter values (matches Product.styles)
const CATEGORIES_FALLBACK: CheckboxOption[] = [];
const STYLES_FALLBACK: CheckboxOption[] = [];

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
  const router = useRouter();
  const pathname = usePathname();
  const urlSearch = useSearchParams();

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [stylesData, setStylesData] = useState<Style[]>([]);

  const [selected, setSelected] = useState<Record<string, boolean>>({}); // Price range (slider + inputs)
  const PRICE_MIN = 0;
  const PRICE_STEP = 10;
  const [priceMaxBound, setPriceMaxBound] = useState<number | null>(null);
  const [rangeMin, setRangeMin] = useState<number>(0);
  const [rangeMax, setRangeMax] = useState<number>(0);
  const [priceMin, setPriceMin] = useState<string>(String(rangeMin));
  const [priceMax, setPriceMax] = useState<string>(String(rangeMax));

  // Helpers
  const buildAndPush = (
    nextSelected: Record<string, boolean>,
    nextMin?: number,
    nextMax?: number,
  ) => {
    const params = new URLSearchParams(urlSearch.toString());

    // Categories/styles/colors selected as comma lists
    // Categories use IDs; Styles use names
    const catSel = categoriesData.map((c) => c._id).filter((id) => !!nextSelected[id]);
    const styleSel = stylesData.map((s) => s.name).filter((name) => !!nextSelected[name]);
    const colorSel = COLORS.map((c) => c.id).filter((id) => !!nextSelected[id]);
    // Optional size param (not used on server yet, ignored if present)
    const sizeSel = SIZES.map((s) => s.id).filter((id) => !!nextSelected[id]);

    const setOrDel = (key: string, list: string[]) => {
      if (list.length) params.set(key, list.join(","));
      else params.delete(key);
    };
    setOrDel("category", catSel);
    setOrDel("style", styleSel);
    setOrDel("color", colorSel);
    if (sizeSel.length) params.set("size", sizeSel.join(","));
    else params.delete("size");

    // Price
    const minV = typeof nextMin === "number" ? nextMin : rangeMin;
    const maxV = typeof nextMax === "number" ? nextMax : rangeMax;
    if (minV > PRICE_MIN) params.set("minPrice", String(minV));
    else params.delete("minPrice");
    if (priceMaxBound !== null && maxV < priceMaxBound) params.set("maxPrice", String(maxV));
    else params.delete("maxPrice");

    // Reset to first page on filter changes
    params.delete("page");

    const href = `${pathname}?${params.toString()}`;
    if (process.env.NODE_ENV !== "production") {
      console.log("[Filters] push ->", href);
    }
    router.push(href);
  };

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = { ...s, [id]: !s[id] };
      buildAndPush(next);
      return next;
    });
  };

  const clearAll = () => {
    const cleared: Record<string, boolean> = {};
    setSelected(cleared);
    setRangeMin(PRICE_MIN);
    setRangeMax(priceMaxBound ?? 0);
    setPriceMin(String(PRICE_MIN));
    setPriceMax(String(priceMaxBound ?? 0));
    buildAndPush(cleared, PRICE_MIN, priceMaxBound ?? undefined as any);
  }; // *** FIX: Removed Section and Checkbox definitions from here ***

  // Initialize state from URL on mount and when URL changes externally
  useEffect(() => {
    if (priceMaxBound === null) return; // wait for bound to avoid 0-0 blink
    const params = urlSearch;
    const next: Record<string, boolean> = {};
    const readList = (key: string) => params.get(key)?.split(",").filter(Boolean) ?? [];
    // Categories are IDs; Styles are names
    readList("category").forEach((id) => (next[id] = true));
    readList("style").forEach((name) => (next[name] = true));
    readList("color").forEach((id) => (next[id] = true));
    readList("size").forEach((id) => (next[id] = true));
    setSelected(next);

    const minRaw = params.get("minPrice");
    const maxRaw = params.get("maxPrice");
    const minP = Number(minRaw);
    const maxP = Number(maxRaw);
    const hasMin = minRaw != null && minRaw !== "" && Number.isFinite(minP);
    // treat 0 as unset for max to avoid 0..0 on load
    const hasMax = maxRaw != null && maxRaw !== "" && Number.isFinite(maxP) && maxP > 0;
    const newMin = hasMin ? Math.max(PRICE_MIN, Math.min(minP, priceMaxBound)) : PRICE_MIN;
    const newMax = hasMax ? Math.max(newMin + PRICE_STEP, Math.min(maxP, priceMaxBound)) : priceMaxBound;
    setRangeMin(newMin);
    setRangeMax(newMax);
    setPriceMin(String(newMin));
    setPriceMax(String(newMax));
  }, [urlSearch, priceMaxBound]);

  // Fetch global price upper bound
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${apiBase}/api/products/price-range/global`).then((x) => x.json());
        if (r?.ok && typeof r.max === "number") {
          const bound = Math.max(0, r.max);
          if (bound <= 0) return; // keep existing bound if invalid
          setPriceMaxBound(bound);
          // Align to new bound unless URL overrides with valid values (max>0)
          const maxRaw = urlSearch.get("maxPrice");
          const minRaw = urlSearch.get("minPrice");
          const urlMax = Number(maxRaw);
          const urlMin = Number(minRaw);
          const useUrlMax = maxRaw != null && maxRaw !== "" && Number.isFinite(urlMax) && urlMax > 0;
          const useUrlMin = minRaw != null && minRaw !== "" && Number.isFinite(urlMin);
          const nextMax = useUrlMax ? Math.min(bound, Math.max(urlMax, PRICE_MIN + PRICE_STEP)) : bound;
          const nextMin = useUrlMin ? Math.max(PRICE_MIN, Math.min(urlMin, nextMax - PRICE_STEP)) : PRICE_MIN;
          setRangeMin(nextMin);
          setRangeMax(nextMax);
          setPriceMin(String(nextMin));
          setPriceMax(String(nextMax));
        }
      } catch {}
    })();
  }, [apiBase]);

  // Fetch categories and styles from backend
  useEffect(() => {
    (async () => {
      try {
        const [cs, ss] = await Promise.all([
          fetch(`${apiBase}/api/categories/in-use`)
            .then((r) => r.json())
            .catch(() => null),
          fetch(`${apiBase}/api/styles/in-use`)
            .then((r) => r.json())
            .catch(() => null),
        ]);
        if (cs && cs.ok && Array.isArray(cs.items)) setCategoriesData(cs.items);
        if (ss && ss.ok && Array.isArray(ss.items)) setStylesData(ss.items);
      } catch {}
    })();
  }, [apiBase]);

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
          {(categoriesData.length
            ? categoriesData.map((c) => ({ id: c._id, label: c.name }))
            : CATEGORIES_FALLBACK
          ).map((o) => (
            <Checkbox key={o.id} {...o} isOn={!!selected[o.id]} onToggle={toggle} />
          ))}
        </div>
      </Collapsible>
      <Collapsible title="Style">
        <div className="grid gap-1.5">
          {(stylesData.length
            ? stylesData.map((s) => ({ id: s.name, label: s.name }))
            : STYLES_FALLBACK
          ).map((o) => (
            <Checkbox key={o.id} {...o} isOn={!!selected[o.id]} onToggle={toggle} />
          ))}
        </div>
      </Collapsible>
      <Section title="Price Range">
        {priceMaxBound !== null ? (
          <DualRangeSlider
            value={[rangeMin, rangeMax]}
            onValueChange={([minV, maxV]) => {
              setRangeMin(minV);
              setRangeMax(maxV);
              setPriceMin(String(minV));
              setPriceMax(String(maxV));
              // debounce push
              window.clearTimeout((window as any).__priceDeb__);
              (window as any).__priceDeb__ = window.setTimeout(() => {
                buildAndPush(selected, minV, maxV);
              }, 250);
            }}
            min={PRICE_MIN}
            max={priceMaxBound}
            step={PRICE_STEP}
          />
        ) : (
          <div className="h-8 rounded-md bg-muted/40 animate-pulse" />
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor="min" className="text-xs">
              Min
            </Label>
            <Input
              id="min"
              type="text"
              value={priceMin}
              disabled={priceMaxBound === null}
              onChange={(e) => {
                setPriceMin(e.target.value);
              }}
              onBlur={() => {
                const v = Number(priceMin);
                if (!Number.isNaN(v)) {
                  const clamped = Math.max(PRICE_MIN, Math.min(v, rangeMax - PRICE_STEP));
                  setRangeMin(clamped);
                  setPriceMin(String(clamped));
                  buildAndPush(selected, clamped, rangeMax);
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
              disabled={priceMaxBound === null}
              onChange={(e) => {
                setPriceMax(e.target.value);
              }}
              onBlur={() => {
                const v = Number(priceMax);
                if (!Number.isNaN(v)) {
                  const clamped = Math.min(priceMaxBound, Math.max(v, rangeMin + PRICE_STEP));
                  setRangeMax(clamped);
                  setPriceMax(String(clamped));
                  buildAndPush(selected, rangeMin, clamped);
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
