"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Search, Sun, Moon, Menu, X } from "lucide-react";
import { Link as ScrollLink, animateScroll as scroll } from "react-scroll";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const stored = (typeof window !== "undefined" && localStorage.getItem("theme")) as
      | "light"
      | "dark"
      | null;
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", initial === "dark");
    setTheme(initial);
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
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setMounted(true), []);

  // Focus the search input when opened
  useEffect(() => {
    if (searchOpen) {
      // slight delay to allow mount/animation
      const t = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const links = [
    { label: "About", href: "/about" },
    { label: "Shop", href: "/shop" },
    { label: "Collections", scrollTo: "collections" },
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
        <a
          onClick={() => scroll.scrollToTop({ duration: 500, smooth: true })}
          className="flex items-center gap-2 group cursor-pointer"
          aria-label="Fadel Art Home"
        >
          <span className="text-xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            Fadel Art
          </span>
        </a>

        {/* Middle: Nav Links (desktop) */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const key = (link as any).href ?? (link as any).scrollTo ?? link.label;
            if ((link as any).href) {
              return (
                <Link
                  key={key}
                  href={(link as any).href}
                  className="text-sm hover:text-primary transition-base"
                >
                  {link.label}
                </Link>
              );
            }
            if ((link as any).scrollTo) {
              const id = (link as any).scrollTo as string;
              // If not on home, link to /#id; otherwise use smooth scroll
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
            onClick={() => {
              setSearchOpen((v) => !v);
              setOpen(false);
            }}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted text-foreground transition-base"
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
            onClick={() => setOpen(true)}
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
        className="overflow-hidden border-t border-border"
      >
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <Input
              ref={searchRef as any}
              placeholder="Search artworks, artists, collections…"
              aria-label="Search"
              className="h-11 flex-1"
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchOpen(false);
              }}
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="h-11 px-3 rounded-md hover:bg-muted text-sm bg-muted/70"
              aria-label="Close search"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile full-screen menu via portal to avoid transform clipping & ensure proper backdrop blur */}
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
                    const key = (link as any).href ?? (link as any).scrollTo ?? link.label;
                    const common =
                      "block text-2xl font-semibold hover:text-primary transition-colors text-foreground";
                    if ((link as any).href) {
                      return (
                        <li key={key}>
                          <Link
                            href={(link as any).href}
                            className={common}
                            onClick={() => setOpen(false)}
                          >
                            {link.label}
                          </Link>
                        </li>
                      );
                    }
                    if ((link as any).scrollTo) {
                      const id = (link as any).scrollTo as string;
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
