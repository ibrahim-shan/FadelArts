import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";

const headingFont = Montserrat({
  variable: "--font-heading",
  weight: ["300", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = Open_Sans({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fadel Art — New Website",
  description: "E-commerce for art paintings (coming soon).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${headingFont.variable} ${bodyFont.variable} antialiased`}
      >
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
