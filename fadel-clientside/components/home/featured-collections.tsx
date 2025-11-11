"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Reveal from "@/components/reveal";
import { Button } from "@/components/ui/button";

const collections = [
  {
    slug: "abstract",
    title: "Abstract",
    blurb: "Expressive shapes and bold palettes.",
    image: "/collection-abstract.svg",
  },
  {
    slug: "minimal",
    title: "Minimal",
    blurb: "Quiet compositions for modern spaces.",
    image: "/collection-minimal.svg",
  },
  {
    slug: "nature",
    title: "Nature",
    blurb: "Organic textures and serene tones.",
    image: "/collection-nature.svg",
  },
];

export default function FeaturedCollections({ id = "collections" }: { id?: string }) {
  return (
    <section id={id} className="py-12">
      <div className="container">
        <Reveal>
          <h2 className="mb-12 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            Featured Collections
          </h2>
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((c) => (
              <Link key={c.slug} href={`/collections/${c.slug}`} className="group">
                <motion.div
                  className="relative overflow-hidden rounded-xl shadow-brand-md"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 200, damping: 24 }}
                  style={{ aspectRatio: "3 / 2" }}
                >
                  <Image
                    src={c.image}
                    alt={`${c.title} collection`}
                    fill
                    draggable={false}
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/15 to-transparent" />
                  <div className="absolute inset-0 grid place-items-center text-center px-6">
                    <div>
                      <h3
                        className="text-white text-2xl md:text-3xl font-semibold tracking-tight mb-2 drop-shadow"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {c.title}
                      </h3>
                      <p className="text-white/85 mb-4 drop-shadow-sm">{c.blurb}</p>
                      <Button variant="default" asChild>
                        <span>Explore Collection</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
