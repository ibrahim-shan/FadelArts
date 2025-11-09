import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";
import { SiTiktok, SiWhatsapp } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="mt-16 border-t border-border bg-secondary/40">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-3 items-start text-center md:text-left">
          {/* Brand + Tagline + Delivery */}
          <div>
            <h3
              className="text-xl font-semibold tracking-tight mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Fadel Art Shop
            </h3>
            <p className="text-sm text-muted-foreground prose-max mx-auto md:mx-0">
              Art is a form of expression that transcends boundaries and speaks to the depths of the human experience.
            </p>
            <p className="mt-3 text-sm font-semibold text-foreground">Delivery all over Lebanon</p>
          </div>

          {/* Navigation split into two columns */}
          <nav aria-label="Footer navigation">
            <div className="grid grid-cols-2 gap-8">
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-accent transition-base">Home</Link></li>
                <li><Link href="/gallery" className="hover:text-accent transition-base">Gallery</Link></li>
                <li><Link href="/shop" className="hover:text-accent transition-base">Shop</Link></li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-accent transition-base">About</Link></li>
                <li><Link href="/contact" className="hover:text-accent transition-base">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-accent transition-base">Privacy</Link></li>
              </ul>
            </div>
          </nav>

          {/* Social + Meta */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex items-center gap-4">
              <Link aria-label="Instagram" href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground hover:text-accent shadow-brand-sm transition-base">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link aria-label="Facebook" href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground hover:text-accent shadow-brand-sm transition-base">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link aria-label="TikTok" href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground hover:text-accent shadow-brand-sm transition-base">
                <SiTiktok className="h-4 w-4" />
              </Link>
              <Link aria-label="WhatsApp" href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground hover:text-accent shadow-brand-sm transition-base">
                <SiWhatsapp className="h-4 w-4" />
              </Link>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-3">
              <Link href="/terms" className="hover:text-accent transition-base">Terms</Link>
              <span aria-hidden>•</span>
              <Link href="/privacy" className="hover:text-accent transition-base">Privacy</Link>
            </div>
            <p className="text-sm text-muted-foreground">© {year} Fadel Art. All rights reserved.</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-3">
            <p>Crafted with care for art lovers worldwide.</p>
            <p className="md:text-right">Secure checkout • Authentic artworks • Easy returns</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
