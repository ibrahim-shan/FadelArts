"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/reveal";

export default function Subscription() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "success">("idle");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // Placeholder submit logic. Wire to your backend or service later.
    setStatus("success");
  }

  return (
    <section id="subscribe" className="py-12">
      <div className="container">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              Stay in the loop
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Subscribe to get updates on new artworks, collections, and stories.
            </p>

            {status === "success" ? (
              <div className="rounded-lg bg-secondary p-4 text-sm">Thanks! You’re subscribed.</div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-11 sm:max-w-md"
                  aria-label="Email address"
                />
                <Button type="submit" className="h-11 px-6">
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
