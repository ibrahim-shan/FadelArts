"use client"; // This must stay for framer-motion

import { motion } from "framer-motion";
import Reveal from "@/components/reveal";
import Image from "next/image"; // Import Image
import Link from "next/link"; // Import Link

// Define the Style type for the component's props
type Style = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};

// A fallback image in case a style doesn't have one
const FALLBACK_IMAGE = "/collection-abstract.svg";

export default function ExploreByStyle({
  id = "styles",
  styles = [], // Accept styles as a prop, default to an empty array
}: {
  id?: string;
  styles: Style[]; // This is now a required prop
}) {
  const hover = {
    whileHover: { scale: 1.06, y: -2, boxShadow: "var(--shadow-lg)" as any },
    whileTap: { scale: 0.98 },
    transition: { type: "spring" as const, stiffness: 260, damping: 24 },
  };

  // Use the passed `styles` prop, limiting to 6 for the homepage grid
  const stylesToDisplay = styles.length > 0 ? styles.slice(0, 6) : [];

  return (
    <section id={id} className="py-12">
      <div className="container">
        <Reveal>
          <h2 className="mb-12 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            Explore by style
          </h2>
          <div className="mx-auto grid max-w-4xl grid-cols-3 sm:grid-cols-6 gap-6 place-items-center">
            {/* Show a message if no styles are loaded */}
            {stylesToDisplay.length === 0 && (
              <p className="text-muted-foreground col-span-full">
                Styles are loading or not available.
              </p>
            )}

            {/* Map over the styles from props */}
            {stylesToDisplay.map((style) => (
              <Link
                key={style._id}
                href={`/shop?style=${style.name}`} // Link to a filtered shop page
                className="group"
                aria-label={`Explore ${style.name}`}
              >
                {/* The <p> tag that was here has been moved inside the motion.div
                */}

                {/* Motion div for the circular image */}
                <motion.div
                  className="relative h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 rounded-full bg-secondary shadow-brand-md overflow-hidden"
                  {...hover}
                >
                  <Image
                    src={style.image || FALLBACK_IMAGE} // Use style image or fallback
                    alt={style.name}
                    fill
                    sizes="(min-width: 1024px) 10vw, (min-width: 768px) 12vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* ADDED: Overlay */}
                  <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />

                  {/* ADDED: Centered text container */}
                  <div className="absolute inset-0 grid place-items-center p-4">
                    <p
                      className="text-white text-center text-sm md:text-base font-semibold drop-shadow"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {style.name}
                    </p>
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