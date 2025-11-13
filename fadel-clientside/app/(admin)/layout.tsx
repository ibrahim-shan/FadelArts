"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/auth/me`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("unauthorized");
        const data = await res.json();
        if (active && data?.ok) setEmail(data.admin?.email ?? null);
        else throw new Error("unauthorized");
      } catch {
        if (active) router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
      }
    })();
    return () => {
      active = false;
    };
  }, [apiBase, pathname, router]);

  const logout = async () => {
    try {
      await fetch(`${apiBase}/api/auth/logout`, { method: "POST", credentials: "include" });
    } finally {
      router.replace("/signin");
    }
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`block rounded-md px-3 py-2 text-sm ${active ? "bg-accent/50 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/30"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] grid-rows-[56px_1fr]">
      {/* Sidebar */}
      <aside className="row-span-2 bg-sidebar border-r border-sidebar-border">
        <div
          className="h-14 flex items-center px-4 font-semibold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Admin
        </div>
        <nav className="px-3 space-y-1">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/dashboard/categories" label="Categories" />
          <NavLink href="/dashboard/variants" label="Variants" />
          <NavLink href="/dashboard/styles" label="Styles" />
          <NavLink href="/dashboard/products" label="Products" />
          <NavLink href="/dashboard/media" label="Media" />
          <NavLink href="/dashboard/settings" label="Settings" />
        </nav>
      </aside>

      {/* Topbar */}
      <header className="col-start-2 h-14 border-b flex items-center justify-between px-4 bg-background/80 backdrop-blur">
        <div className="text-sm text-muted-foreground">Signed in as {email ?? ""}</div>
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </header>

      {/* Main content */}
      <main className="col-start-2 p-6">{children}</main>
    </div>
  );
}
