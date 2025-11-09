"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/auth/me`, { credentials: "include", cache: "no-store" });
        if (!res.ok) throw new Error("unauthorized");
        const data = await res.json();
        if (active && data?.ok) {
          setEmail(data.admin?.email ?? null);
          setReady(true);
        } else {
          throw new Error("unauthorized");
        }
      } catch {
        if (active) router.replace(`/signin?next=${encodeURIComponent("/dashboard")}`);
      }
    })();
    return () => {
      active = false;
    };
  }, [apiBase, router]);

  if (!ready) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <p className="text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
        Admin Dashboard
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Signed in as {email}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border p-6">
          <h2 className="font-semibold">Products</h2>
          <p className="text-sm text-muted-foreground">Create and manage artworks.</p>
        </section>
        <section className="rounded-xl border p-6">
          <h2 className="font-semibold">Orders</h2>
          <p className="text-sm text-muted-foreground">Coming soon.</p>
        </section>
      </div>
    </div>
  );
}
