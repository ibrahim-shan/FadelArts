"use client";

import Link from "next/link";
import Image from "next/image";
import Reveal from "../reveal";
import { motion } from "framer-motion";

// --- 1. UPDATE POST TYPE TO MATCH FETCHED DATA ---
type Post = {
  _id: string;
  slug: string;
  title: string;
  image: string;
};

// --- 2. REMOVE STATIC POSTS ARRAY ---

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
    // --- 3. UPDATE LINK TO USE SLUG ---
    <Link href={`/blog/${post.slug}`} className="group">
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

// --- 4. ACCEPT 'posts' PROP ---
export default function BlogsNews({ id = "blogs", posts = [] }: { id?: string; posts: Post[] }) {
  // --- 5. SAFELY DESTRUCTURE POSTS ---
  const first = posts[0];
  const second = posts[1];
  const third = posts[2];

  // --- 6. HANDLE CASE WHERE POSTS AREN'T LOADED ---
  if (!first) {
    // You can return null or a loading/empty state
    return null;
  }

  return (
    <section id={id} className="py-12">
      <div className="container">
        <Reveal>
          <h2 className="mb-12 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            Blogs & News
          </h2>
        </Reveal>

        {/* --- 7. ADD CONDITIONAL RENDERING --- */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-stretch md:gap-6">
            <div className="md:w-2/3 md:flex">
              <div className="w-full h-full">
                {first && <BlogCard post={first} featured fillHeight />}
              </div>
            </div>
            <div className="mt-6 md:mt-0 md:w-1/3 flex flex-col gap-6">
              {second && <BlogCard post={second} />}
              {third && <BlogCard post={third} />}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
