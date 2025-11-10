"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/reveal";
import Breadcrumb from "@/components/breadcrumb";

export default function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-secondary/50">
      <div className="container py-16">
        <Reveal mode="mount">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="mb-4">
                <Breadcrumb items={[{ label: "About" }]} />
              </div>
              <h1 className="mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                About Fadel Art
              </h1>
              <p className="text-muted-foreground prose-max">
                We curate original paintings that bring character and calm to modern spaces — guided
                by texture, color, light, and a love for storytelling.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/#collections">Explore Collections</Link>
                </Button>
              </div>
            </div>
            <div className="relative rounded-xl shadow-brand-md overflow-hidden">
              <Image
                src="/about-hero.svg"
                alt="Studio mood illustration"
                width={1200}
                height={900}
                className="w-full h-auto object-cover"
                priority
                draggable={false}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
