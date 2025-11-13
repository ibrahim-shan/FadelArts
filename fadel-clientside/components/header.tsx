"use client";

import Link from "next/link";
import Image from "next/image"; // 1. Add Image import
import { startTransition, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Search, Sun, Moon, Menu, X } from "lucide-react";
import { Link as ScrollLink } from "react-scroll";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // 2. Add Button import

type NavLink = { label: string; href: string } | { label: string; scrollTo: string };

// 4. Define Product type
interface Product {
  _id: string;
  slug: string;
  title: string;
  artist: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
}

// 5. Add Click-Outside Hook
function useOnClickOutside(
  ref: React.RefObject<HTMLDivElement | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  excludeSelectors: string[] = [], // Add this parameter
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      // Check if click is on excluded elements
      const target = event.target as Element;
      if (excludeSelectors.some((selector) => target.closest(selector))) {
        return;
      }

      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, excludeSelectors]);
}

// 6. Create the new ProductSearch component
function ProductSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  // Focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      const fetchResults = async () => {
        const url = `${apiBase}/api/products?q=${query}&pageSize=5`;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();
          if (data.ok) setResults(data.items);
        } catch (e) {
          console.error(e);
          setResults([]);
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query, apiBase]);

  // Handle closing search when clicking outside
  useOnClickOutside(searchRef, onClose, [".search-toggle"]);

  return (
    <div ref={searchRef} className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search artworks, artists..."
        className="pl-9 h-11" // Match height
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      />
      <button
        type="button"
        className="h-9 w-9 inline-flex items-center justify-center rounded-md absolute right-1.5 top-1/2 -translate-y-1/2 hover:bg-muted"
        aria-label="Close search"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </button>

      {/* --- Search Results Dropdown --- */}
      {query.length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border shadow-lg rounded-md overflow-hidden animate-in fade-in-0 zoom-in-95">
          {loading && (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          )}
          {!loading && results.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}
          {!loading && results.length > 0 && (
            <ul className="divide-y divide-border">
              {results.map((product) => (
                <li key={product._id}>
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    // 1. Add "group" here
                    className="group flex items-center gap-3 p-3 dark:hover:bg-accent/50 hover:bg-accent transition-colors"
                  >
                    <Image
                      src={product.images?.[0] || "/hero-1.svg"}
                      alt={product.title}
                      width={40}
                      height={40}
                      className="rounded object-cover aspect-square bg-muted"
                    />
                    <div className="flex-1 overflow-hidden">
                      {/* 2. Add "group-hover:text-accent-foreground" here */}
                      <p className="font-medium truncate text-sm  group-hover:text-white">
                        {product.title}
                      </p>
                      {/* 3. Add "group-hover:text-accent-foreground" here */}
                      <p className="text-sm text-muted-foreground group-hover:text-accent-foreground dark:text-white">
                        ${product.price}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
              <li className="p-2">
                <Button
                  variant="ghost"
                  className="w-full hover:text-white"
                  asChild
                  onClick={onClose}
                >
                  <Link href={`/shop?q=${query}`}>View all results</Link>
                </Button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// --- (useTheme hook is unchanged) ---
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("theme")) as
      | "light"
      | "dark"
      | null;
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", initial === "dark");
    startTransition(() => setTheme(initial));
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark");
        localStorage.setItem("theme", next);
      }
      return next;
    });
  };

  return { theme, toggle };
}

export default function Header() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted] = useState(true);

  const [searchOpen, setSearchOpen] = useState(false);
  // This ref is no longer needed here, it's inside ProductSearch
  // const searchRef = useRef<HTMLInputElement | null>(null);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Focus logic is now inside ProductSearch

  const links: NavLink[] = [
    { label: "About", href: "/about" },
    { label: "Shop", href: "/shop" },
    { label: "New Arts", scrollTo: "new-arts" },
    // { label: "Collections", scrollTo: "collections" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70 border-b border-border"
    >
      <div className="container h-16 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group cursor-pointer"
          aria-label="Fadel Art Logo"
        >
          <Image
            src={theme === "dark" ? "/images/logo-light.png" : "/images/logo-dark.png"}
            alt="Fadel Art Logo"
            width={150}
            height={150}
            priority
          />
        </Link>

        {/* Middle: Nav Links (desktop) */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const key = "href" in link ? link.href : link.scrollTo;

            if ("href" in link) {
              return (
                <Link
                  key={key}
                  href={link.href}
                  className="text-sm hover:text-primary transition-base"
                >
                  {link.label}
                </Link>
              );
            }

            if ("scrollTo" in link) {
              const id = link.scrollTo;
              if (pathname !== "/") {
                return (
                  <Link
                    key={key}
                    href={`/#${id}`}
                    className="text-sm hover:text-primary transition-base"
                  >
                    {link.label}
                  </Link>
                );
              }
              return (
                <ScrollLink
                  key={key}
                  to={id}
                  spy={true}
                  smooth={true}
                  duration={500}
                  offset={-64}
                  className="text-sm hover:text-primary transition-base cursor-pointer"
                >
                  {link.label}
                </ScrollLink>
              );
            }

            return null;
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setSearchOpen((v) => !v);
              if (open) setOpen(false);
            }}
            className="search-toggle h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted text-foreground transition-base" // Added 'search-toggle' class
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggle}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted text-foreground transition-base"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </motion.button>
          {/* Mobile menu button (after toggle) */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setOpen(true); // Correct: open mobile menu
              setSearchOpen(false); // Close search panel if open
            }}
            className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted text-foreground transition-base"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Header search bar (slides under header) */}
      <motion.div
        initial={false}
        animate={searchOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
        className="border-t border-border"
      >
        <div className="container py-3">
          {/* 7. Replaced the simple Input with the ProductSearch component */}
          {searchOpen && <ProductSearch onClose={() => setSearchOpen(false)} />}
        </div>
      </motion.div>

      {/* Mobile full-screen menu via portal */}
      {mounted &&
        open &&
        createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-999 h-screen w-screen bg-gray-700/20 bg-clip-padding backdrop-filter supports-backdrop-filter:backdrop-blur-md backdrop-blur-md backdrop-saturate-150 will-change-[opacity]"
          >
            <motion.nav
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              className="absolute inset-0 h-full w-full px-6 pt-6 pb-10 flex flex-col transform-gpu will-change-[transform,opacity]"
              aria-label="Mobile menu"
            >
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-10 flex-1 grid place-items-center">
                <ul className="text-center space-y-6">
                  {links.map((link) => {
                    const key = "href" in link ? link.href : link.scrollTo;
                    const common =
                      "block text-2xl font-semibold hover:text-primary transition-colors text-foreground";

                    if ("href" in link) {
                      return (
                        <li key={key}>
                          <Link href={link.href} className={common} onClick={() => setOpen(false)}>
                            {link.label}
                          </Link>
                        </li>
                      );
                    }

                    if ("scrollTo" in link) {
                      const id = link.scrollTo;
                      if (pathname !== "/") {
                        return (
                          <li key={key}>
                            <Link
                              href={`/#${id}`}
                              className={common}
                              onClick={() => setOpen(false)}
                            >
                              {link.label}
                            </Link>
                          </li>
                        );
                      }
                      return (
                        <li key={key}>
                          <ScrollLink
                            to={id}
                            spy={true}
                            smooth={true}
                            duration={500}
                            offset={-64}
                            className={`${common} cursor-pointer`}
                            onClick={() => setOpen(false)}
                          >
                            {link.label}
                          </ScrollLink>
                        </li>
                      );
                    }

                    return null;
                  })}
                </ul>
              </div>
            </motion.nav>
          </motion.div>,
          document.body,
        )}
    </motion.header>
  );
}
