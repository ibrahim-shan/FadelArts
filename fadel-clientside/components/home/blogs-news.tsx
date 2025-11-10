"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/reveal";
import { motion } from "framer-motion";

type Post = {
  title: string;
  href: string;
  image: string;
};

const POSTS: Post[] = [
  {
    title: "Inside the Abstract: Curating Bold Expression",
    href: "/blog/inside-the-abstract",
    image: "/blog-1.svg",
  },
  {
    title: "Minimal Forms, Maximum Calm",
    href: "/blog/minimal-forms",
    image: "/blog-2.svg",
  },
  {
    title: "Nature Tones We Love This Season",
    href: "/blog/nature-tones",
    image: "/blog-3.svg",
  },
];

function BlogCard({
  post,
  featured = false,
  fillHeight = false,
}: {
  post: Post;
  featured?: boolean;
  fillHeight?: boolean;
}) {
  return (
    <Link href={post.href} className="group">
      <motion.div
        className={(featured && fillHeight ? "h-full flex flex-col " : "") + "transform-gpu"}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
        style={{ willChange: "transform" }}
      >
        {featured ? (
          <>
            <div
              className={
                (fillHeight ? "flex-1 min-h-[220px] " : "") +
                "relative overflow-hidden rounded-xl shadow-brand-sm"
              }
            >
              <Image
                src={post.image}
                alt={post.title}
                fill
                priority={false}
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover"
                draggable={false}
              />
            </div>
            <div className="mt-3 rounded-xl bg-secondary p-4">
              <h3
                className="text-base sm:text-lg font-semibold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {post.title}
              </h3>
            </div>
          </>
        ) : (
          <>
            <div
              className="relative overflow-hidden rounded-xl shadow-brand-sm"
              style={{ aspectRatio: "16 / 10" }}
            >
              <Image
                src={post.image}
                alt={post.title}
                fill
                priority={false}
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
                draggable={false}
              />
            </div>
            <div className="mt-3 rounded-xl bg-secondary p-4">
              <h3
                className="text-base sm:text-lg font-semibold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {post.title}
              </h3>
            </div>
          </>
        )}
      </motion.div>
    </Link>
  );
}

export default function BlogsNews({ id = "blogs" }: { id?: string }) {
  const [first, second, third] = POSTS;
  return (
    <section id={id} className="py-12">
      <div className="container">
        <Reveal>
          <h2 className="mb-12 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            Blogs & News
          </h2>
        </Reveal>

        {/* Mobile: stack; Desktop: two-column flex with equal column heights */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-stretch md:gap-6">
            <div className="md:w-2/3 md:flex">
              <div className="w-full h-full">
                <BlogCard post={first} featured fillHeight />
              </div>
            </div>
            <div className="mt-6 md:mt-0 md:w-1/3 flex flex-col gap-6">
              <BlogCard post={second} />
              <BlogCard post={third} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
