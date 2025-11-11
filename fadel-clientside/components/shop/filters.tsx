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
type Variant = { _id: string; name: string; slug: string; values: string[] };

// Categories and styles are fetched from backend
const CATEGORIES_FALLBACK: CheckboxOption[] = [];
const STYLES_FALLBACK: CheckboxOption[] = [];

function Collapsible({
  title,
  children,
  open, // <-- 1. Accept 'open' prop
  onOpenChange, // <-- 2. Accept 'onOpenChange' prop
}: {
  title: string;
  children: React.ReactNode;
  open: boolean; // <-- 3. Make 'open' required
  onOpenChange: (open: boolean) => void; // <-- 4. Make 'onOpenChange' required
}) {
  // const [open, setOpen] = useState(defaultOpen); // <-- 5. REMOVE internal state

  return (
    <div className="py-2 border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={() => onOpenChange(!open)} // <-- 6. Use onOpenChange
        className="w-full flex items-center justify-between py-2 text-left"
        aria-expanded={open} // <-- 7. Use 'open' prop
      >
        <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && ( // <-- 8. Use 'open' prop
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

function Checkbox({
  id,
  label,
  isOn,
  onToggle,
}: CheckboxOption & { isOn: boolean; onToggle: (id: string) => void }) {
  return (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer">
      <UICheckbox
        checked={isOn}
        onCheckedChange={() => onToggle(id)}
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
  const [colorsData, setColorsData] = useState<string[]>([]);
  const [variantsData, setVariantsData] = useState<Variant[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // Price range
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

    // Categories use IDs; Styles use names
    const catSel = categoriesData.map((c) => c._id).filter((id) => !!nextSelected[id]);
    const styleSel = stylesData.map((s) => s.name).filter((name) => !!nextSelected[name]);

    // Colors are just names now
    const colorSel = colorsData.filter((colorName) => !!nextSelected[colorName]);

    const setOrDel = (key: string, list: string[]) => {
      if (list.length) params.set(key, list.join(","));
      else params.delete(key);
    };
    setOrDel("category", catSel);
    setOrDel("style", styleSel);
    setOrDel("color", colorSel);
    params.delete("size"); // Delete the old static "size" param

    // Add dynamic variant params
    variantsData.forEach((variant) => {
      // Find selected values for this variant, e.g., ["S", "M"]
      const selectedValues = variant.values.filter(
        (value) => !!nextSelected[`${variant.slug}_${value}`],
      );
      // Set the param, e.g., ?size=S,M
      setOrDel(variant.slug, selectedValues);
    });

    // Price
    const minV = typeof nextMin === "number" ? nextMin : rangeMin;
    const maxV = typeof nextMax === "number" ? nextMax : rangeMax;
    if (minV > PRICE_MIN) params.set("minPrice", String(minV));
    else params.delete("minPrice");
    if (priceMaxBound !== null && maxV < priceMaxBound) params.set("maxPrice", String(maxV));
    else params.delete("maxPrice");

    params.delete("page");

    const href = `${pathname}?${params.toString()}`;
    router.push(href, { scroll: false });
  };

  const toggle = (id: string) => {
    // 1. Calculate the next state based on the current state
    const nextSelected = { ...selected, [id]: !selected[id] };

    // 2. Update the state (this queues a re-render)
    setSelected(nextSelected);

    // 3. Call the function that pushes to the router (this is now safe)
    buildAndPush(nextSelected);
  };

  const clearAll = () => {
    const cleared: Record<string, boolean> = {};
    setSelected(cleared);
    setRangeMin(PRICE_MIN);
    setRangeMax(priceMaxBound ?? 0);
    setPriceMin(String(PRICE_MIN));
    setPriceMax(String(priceMaxBound ?? 0));
    buildAndPush(cleared, PRICE_MIN, priceMaxBound ?? (undefined as any));
  };
  const paramsString = urlSearch.toString();
  // Initialize state from URL on mount
  useEffect(() => {
    if (priceMaxBound === null) return;

    // This check helps prevent hydrating state before filter data is loaded
    if (!categoriesData.length && !stylesData.length && !variantsData.length && paramsString) {
      // If we have params but no data, wait for data
      return;
    }

    const params = urlSearch;
    const nextSelected: Record<string, boolean> = {};
    const nextOpenSections: Record<string, boolean> = {}; // <-- Create a new open state object
    const readList = (key: string) => params.get(key)?.split(",").filter(Boolean) ?? [];

    // --- Hydrate Categories ---
    let isCategoryActive = false;
    readList("category").forEach((id) => {
      nextSelected[id] = true;
      isCategoryActive = true;
    });
    // Set open state *only if* it's active. Otherwise, let user control it.
    if (isCategoryActive) nextOpenSections["Categories"] = true;

    // --- Hydrate Style ---
    let isStyleActive = false;
    readList("style").forEach((name) => {
      nextSelected[name] = true;
      isStyleActive = true;
    });
    if (isStyleActive) nextOpenSections["Style"] = true;

    // --- Hydrate Colors ---
    readList("color").forEach((id) => (nextSelected[id] = true));
    // (Colors is a Section, not Collapsible, so no open state needed)

    // --- Hydrate Variants ---
    variantsData.forEach((variant) => {
      const values = readList(variant.slug);
      let isVariantActive = false;
      values.forEach((value) => {
        if (variant.values.includes(value)) {
          nextSelected[`${variant.slug}_${value}`] = true;
          isVariantActive = true;
        }
      });
      if (isVariantActive) nextOpenSections[variant.name] = true; // Set open if active
    });

    setSelected(nextSelected);

    // Merge with existing open state to preserve manual toggles
    setOpenSections((prevOpen) => ({
      ...prevOpen, // Keep any sections the user manually opened
      ...nextOpenSections, // Add sections that are active based on URL
    }));

    // --- Price logic (unchanged) ---
    const minRaw = params.get("minPrice");
    const maxRaw = params.get("maxPrice");
    const minP = Number(minRaw);
    const maxP = Number(maxRaw);
    const hasMin = minRaw != null && minRaw !== "" && Number.isFinite(minP);
    const hasMax = maxRaw != null && maxRaw !== "" && Number.isFinite(maxP) && maxP > 0;
    const newMin = hasMin ? Math.max(PRICE_MIN, Math.min(minP, priceMaxBound)) : PRICE_MIN;
    const newMax = hasMax
      ? Math.max(newMin + PRICE_STEP, Math.min(maxP, priceMaxBound))
      : priceMaxBound;
    setRangeMin(newMin);
    setRangeMax(newMax);
    setPriceMin(String(newMin));
    setPriceMax(String(newMax));
  }, [paramsString, priceMaxBound, variantsData, categoriesData, stylesData]);

  // Fetch global price upper bound
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${apiBase}/api/products/price-range/global`).then((x) => x.json());
        if (r?.ok && typeof r.max === "number") {
          const bound = Math.max(0, r.max);
          if (bound <= 0) return;
          setPriceMaxBound(bound);
          const maxRaw = urlSearch.get("maxPrice");
          const minRaw = urlSearch.get("minPrice");
          const urlMax = Number(maxRaw);
          const urlMin = Number(minRaw);
          const useUrlMax =
            maxRaw != null && maxRaw !== "" && Number.isFinite(urlMax) && urlMax > 0;
          const useUrlMin = minRaw != null && minRaw !== "" && Number.isFinite(urlMin);
          const nextMax = useUrlMax
            ? Math.min(bound, Math.max(urlMax, PRICE_MIN + PRICE_STEP))
            : bound;
          const nextMin = useUrlMin
            ? Math.max(PRICE_MIN, Math.min(urlMin, nextMax - PRICE_STEP))
            : PRICE_MIN;
          setRangeMin(nextMin);
          setRangeMax(nextMax);
          setPriceMin(String(nextMin));
          setPriceMax(String(nextMax));
        }
      } catch {}
    })();
  }, [apiBase]);

  // Fetch categories, styles, COLORS, and VARIANTS
  useEffect(() => {
    (async () => {
      try {
        const [cs, ss, cos, vs] = await Promise.all([
          fetch(`${apiBase}/api/categories/in-use`)
            .then((r) => r.json())
            .catch(() => null),
          fetch(`${apiBase}/api/styles/in-use`)
            .then((r) => r.json())
            .catch(() => null),
          fetch(`${apiBase}/api/products/colors/in-use`)
            .then((r) => r.json())
            .catch(() => null),
          fetch(`${apiBase}/api/variants/in-use`) // Fetch variants
            .then((r) => r.json())
            .catch(() => null),
        ]);
        if (cs && cs.ok && Array.isArray(cs.items)) setCategoriesData(cs.items);
        if (ss && ss.ok && Array.isArray(ss.items)) setStylesData(ss.items);
        if (cos && cos.ok && Array.isArray(cos.items)) setColorsData(cos.items);
        if (vs && vs.ok && Array.isArray(vs.items)) setVariantsData(vs.items); // Set variants
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

      {/* Categories (defaultOpen removed) */}
      <Collapsible
        title="Categories"
        open={!!openSections["Categories"]}
        onOpenChange={(isOpen) => setOpenSections((s) => ({ ...s, Categories: isOpen }))}
      >
        <div className="grid gap-1.5">
          {(categoriesData.length
            ? categoriesData.map((c) => ({ id: c._id, label: c.name }))
            : CATEGORIES_FALLBACK
          ).map((o) => (
            <Checkbox key={o.id} {...o} isOn={!!selected[o.id]} onToggle={toggle} />
          ))}
        </div>
      </Collapsible>

      {/* Style (defaultOpen removed) */}
      <Collapsible
        title="Style"
        open={!!openSections["Style"]}
        onOpenChange={(isOpen) => setOpenSections((s) => ({ ...s, Style: isOpen }))}
      >
        <div className="grid gap-1.5">
          {(stylesData.length
            ? stylesData.map((s) => ({ id: s.name, label: s.name }))
            : STYLES_FALLBACK
          ).map((o) => (
            <Checkbox key={o.id} {...o} isOn={!!selected[o.id]} onToggle={toggle} />
          ))}
        </div>
      </Collapsible>

      {/* Dynamic Variants (defaultOpen removed) */}
      {variantsData.map((variant) => (
        <Collapsible
          title={variant.name}
          key={variant._id}
          open={!!openSections[variant.name]}
          onOpenChange={(isOpen) => setOpenSections((s) => ({ ...s, [variant.name]: isOpen }))}
        >
          <div className="grid gap-1.5">
            {variant.values.map((value) => (
              <Checkbox
                key={value}
                id={`${variant.slug}_${value}`} // e.g., id="size_S"
                label={value}
                isOn={!!selected[`${variant.slug}_${value}`]}
                onToggle={toggle}
              />
            ))}
          </div>
        </Collapsible>
      ))}

      {/* Price Range (was already correct, remains a Section) */}
      <Section title="Price Range">
        {priceMaxBound !== null ? (
          <DualRangeSlider
            value={[rangeMin, rangeMax]}
            onValueChange={([minV, maxV]) => {
              setRangeMin(minV);
              setRangeMax(maxV);
              setPriceMin(String(minV));
              setPriceMax(String(maxV));
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
              onChange={(e) => setPriceMin(e.target.value)}
              onBlur={() => {
                const v = Number(priceMin);
                if (!Number.isNaN(v)) {
                  const clamped = Math.min(
                    priceMaxBound ?? Infinity,
                    Math.max(v, rangeMin + PRICE_STEP),
                  );
                  setRangeMin(clamped);
                  setPriceMin(String(clamped));
                  buildAndPush(selected, rangeMin, clamped);
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
              onChange={(e) => setPriceMax(e.target.value)}
              onBlur={() => {
                const v = Number(priceMax);
                if (!Number.isNaN(v)) {
                  const clamped = Math.min(
                    priceMaxBound ?? Infinity,
                    Math.max(v, rangeMin + PRICE_STEP),
                  );
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

      {/* Colors (was already correct, remains a Section) */}
      <Section title="Colors">
        <div className="flex flex-wrap gap-3">
          {/* 'colorName' is the hex string, e.g., "#b5a264" */}
          {colorsData.map((colorName) => {
            const lowerColor = colorName.toLowerCase();
            return (
              <label
                key={colorName}
                className="flex items-center gap-2 cursor-pointer rounded-full p-0.5" // Make clickable area slightly bigger
              >
                <UICheckbox
                  checked={!!selected[colorName]}
                  onCheckedChange={() => toggle(colorName)}
                  className="sr-only"
                  aria-label={colorName} // Screen readers will still read the hex
                />
                <span
                  className={`inline-block h-5 w-5 rounded-full ring-1 ${
                    selected[colorName] ? "ring-2 ring-primary" : "ring-border"
                  }`}
                  style={{
                    // Use the fetched hex color directly as the background
                    background: lowerColor,
                    // Add a border for white/very light colors
                    border: lowerColor === "#ffffff" ? "1px solid #ccc" : "none",
                  }}
                  title={colorName} // This will show the hex code on hover
                />
                {/* The text span that displayed the color hex is now removed.
                 */}
              </label>
            );
          })}
        </div>
      </Section>
    </aside>
  );
}
