"use client";

import Reveal from "@/components/reveal";

export default function QuoteStrip() {
  return (
    <section className="py-6">
      <div className="container">
        <Reveal>
          <div className="rounded-xl border border-border bg-secondary/60 p-6 text-center">
            <p className="text-lg">
              <span className="text-accent text-2xl" aria-hidden>
                “
              </span>
              Art is not what you see, but what you make others see.
              <span className="text-accent text-2xl" aria-hidden>
                ”
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
