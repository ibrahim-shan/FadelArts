import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Breadcrumb from "../../../../components/breadcrumb";
import Reveal from "../../../../components/reveal";
import { Calendar, User } from "lucide-react";
import React from "react";

// --- 1. DEFINE THE NEW CONTENT BLOCK TYPES ---
type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "list"; items: string[] };

// --- 2. DEFINE THE BLOG POST DATA STRUCTURE ---
interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  author: string;
  publishedAt: string; // ISO string
  image: string; // Feature image URL
  excerpt: string;
  content: ContentBlock[]; // Changed from string to ContentBlock[]
}

// --- 3. MOCK DATA REMOVED ---

// --- 4. UPDATED getPost FUNCTION ---
/**
 * Fetches a single post by slug from the database.
 */
async function getPost(slug: string): Promise<BlogPost | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    // Fetch from the public API route
    const res = await fetch(`${apiBase}/api/blogs/public/${slug}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!res.ok) {
      return null; // This will trigger notFound()
    }

    const data = await res.json();
    if (!data.ok || !data.post) {
      return null;
    }

    return data.post; // Return the post from the API
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return null;
  }
}

// --- 5. NEW CONTENT RENDERER COMPONENT ---
/**
 * Renders structured blog content using Tailwind classes.
 */
function BlogContentRenderer({ content }: { content: ContentBlock[] }) {
  return (
    <div className="text-foreground">
      {content.map((block, index) => {
        const key = `${block.type}-${index}`;

        switch (block.type) {
          case "paragraph":
            return (
              <p key={key} className="mb-6 leading-relaxed text-muted-foreground">
                {block.text}
              </p>
            );

          case "heading":
            if (block.level === 2) {
              return (
                <h2
                  key={key}
                  className="mt-10 mb-4 text-2xl font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <h3
                key={key}
                className="mt-8 mb-4 text-xl font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {block.text}
              </h3>
            );

          case "image":
            return (
              <figure key={key} className="my-8">
                <div className="relative w-full overflow-hidden rounded-lg border">
                  {/* Using an 'img' tag here as 'Image' requires height/width or fill, 
                      which can be complex for dynamic markdown-style content.
                      This is a common practice for blog content. */}
                  <Image src={block.src} alt={block.alt} className="w-full h-auto object-cover" />
                </div>
                {block.caption && (
                  <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case "list":
            return (
              <ul key={key} className="my-6 ml-4 list-disc space-y-2 pl-4 text-muted-foreground">
                {block.items.map((item, i) => (
                  <li key={i} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

// --- 6. GENERATE METADATA FOR SEO (Unchanged) ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} — Fadel Art Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

// --- 7. THE PAGE COMPONENT (Updated) ---
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main>
      {/* Header with Breadcrumbs */}
      <section className="relative overflow-hidden bg-secondary/50">
        <div className="container py-10">
          <Reveal mode="mount">
            <Breadcrumb items={[{ label: "Blog", href: "/#blogs" }, { label: post.title }]} />
          </Reveal>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 md:py-16">
        <div className="container max-w-3xl">
          <article>
            <Reveal>
              {/* Featured Image */}
              <div
                className="relative mb-8 w-full overflow-hidden rounded-xl border shadow-brand-sm"
                // Using a standard 16:9 aspect ratio for blog hero images
                style={{ aspectRatio: "16 / 9" }}
              >
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  priority
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-cover"
                />
              </div>

              {/* Title */}
              <h1 className="mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                {post.title}
              </h1>

              {/* Meta */}
              <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>By {post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.publishedAt}>{formattedDate}</time>
                </div>
              </div>
            </Reveal>

            {/* Post Body (No longer uses 'prose') */}
            <Reveal>
              <BlogContentRenderer content={post.content} />
            </Reveal>
          </article>
        </div>
      </section>
    </main>
  );
}
