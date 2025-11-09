"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactForm() {
  const [status, setStatus] = React.useState<"idle" | "success">("idle");
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Placeholder: plug into an API route or 3rd‑party service here.
    setTimeout(() => {
      setLoading(false);
      setStatus("success");
    }, 600);
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-border bg-secondary/60 p-6">
        <p className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Thank you!
        </p>
        <p className="text-sm text-muted-foreground">We received your message and will get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" placeholder="Your first name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" placeholder="Your last name" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" name="email" placeholder="you@example.com" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" placeholder="How can we help?" />
      </div>
      <div className="space-y-1.5 flex-1 flex flex-col">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          required
          className="w-full flex-1 rounded-md border border-border/40 hover:border-border/60 bg-secondary/40 dark:bg-input/30 p-3 text-foreground placeholder:text-muted-foreground transition-[colors,box-shadow] focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2 resize-none"
          placeholder="Write your message here..."
        />
      </div>
      <div className="pt-2">
        <Button type="submit" disabled={loading} className="min-w-36">
          {loading ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
