import type { Metadata } from "next";
import AboutHero from "@/components/about/hero";
import MyStorySection from "@/components/about/my-story";
import QuoteStrip from "@/components/about/quote";
import ValuesStrip from "@/components/about/values-strip";

export const metadata: Metadata = {
  title: "About — Fadel Art",
  description:
    "Information about Fadel Art, including its purpose, the type of artwork offered, and the structure of the platform.",
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
