import type { Metadata } from "next";
import AboutHero from "@/components/about/hero";
import MyStorySection from "@/components/about/my-story";
import QuoteStrip from "@/components/about/quote";
import ValuesStrip from "@/components/about/values-strip";

export const metadata: Metadata = {
  title: "About — Fadel Art",
  description:
    "Learn about Fadel Art: our story, vision, and the passion behind our curated paintings.",
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <MyStorySection />
      <ValuesStrip />
      <QuoteStrip />
    </main>
  );
}
