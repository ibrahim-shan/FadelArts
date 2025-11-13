"use client";

import Image from "next/image";
import Reveal from "@/components/reveal";

export default function MyStorySection() {
  return (
    <section id="my-story" className="py-12">
      <div className="container">
        <Reveal>
          <div className="grid gap-8 md:grid-cols-2 items-stretch">
            <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-brand-md">
              <Image
                src="/images/about/about-2.webp"
                alt="Founder portrait"
                width={1000}
                height={1200}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                My Story
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  Fadel Art began with a simple belief: art has the power to shape spaces and
                  reflect the stories we carry. Over the years, that belief turned into a curated
                  destination for original paintings and thoughtful collections.
                </p>
                <p>
                  What started as a personal journey of collecting and studying textures, color, and
                  light, evolved into a platform that brings artists and collectors closer. Each
                  piece is chosen with care for its character, craft, and the emotion it evokes.
                </p>
                <p>
                  Today, our vision is to make discovering and collecting art welcoming, inspiring,
                  and beautifully simple.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-secondary p-4">
                  <p
                    className="text-2xl font-semibold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    7+
                  </p>
                  <p className="text-xs text-muted-foreground">Years curating</p>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <p
                    className="text-2xl font-semibold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    250+
                  </p>
                  <p className="text-xs text-muted-foreground">Original works</p>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <p
                    className="text-2xl font-semibold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    40+
                  </p>
                  <p className="text-xs text-muted-foreground">Artists</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
