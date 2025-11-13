import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/contact/form";
import Reveal from "@/components/reveal";
import Breadcrumb from "@/components/breadcrumb";

// This forces the page to be dynamic
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Contact — Fadel Art",
  description:
    "Contact information for Fadel Art, including available communication channels for inquiries and platform-related requests.",
};

type ContactInfo = {
  email?: string;
  phone?: string;
  location?: string;
  hours?: string;
  mapEmbedUrl?: string;
};

async function getContactInfo(): Promise<ContactInfo> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(`${apiBase}/api/settings/contact/public`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.ok ? data.info : {};
  } catch (error) {
    console.error("Failed to fetch contact info:", error);
    return {};
  }
}

export default async function ContactPage() {
  const contactInfo = await getContactInfo();

  const info = [
    { icon: Mail, label: "Email", value: contactInfo.email },
    { icon: Phone, label: "Phone", value: contactInfo.phone },
    { icon: MapPin, label: "Location", value: contactInfo.location },
    { icon: Clock, label: "Hours", value: contactInfo.hours },
  ].filter((item) => !!item.value); // Filter out any items that don't have a value

  return (
    <main>
      <section className="relative overflow-hidden bg-secondary/50">
        <div className="container py-16">
          <Reveal mode="mount">
            <div className="mb-6">
              <Breadcrumb items={[{ label: "Contact" }]} />
            </div>
            <h1
              className="mb-3 text-center md:text-left"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Contact Us
            </h1>
            <p className="text-center md:text-left text-muted-foreground">
              We’d love to hear from you. Send us a message and we’ll respond soon.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 items-stretch">
            <Reveal>
              <div className="rounded-xl border border-border bg-card p-6 shadow-brand-sm h-full">
                <ContactForm />
              </div>
            </Reveal>

            <Reveal>
              <div className="grid gap-4 h-full">
                {/* Map */}
                <div className="rounded-xl border border-border overflow-hidden">
                  {contactInfo.mapEmbedUrl && (
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
                        <iframe
                          title="Fadel Art location map"
                          aria-label="Fadel Art location map"
                          className="absolute inset-0 h-full w-full"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          // --- 3. USE THE DYNAMIC URL ---
                          src={contactInfo.mapEmbedUrl}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-secondary/60 p-6">
                  <p className="text-sm text-muted-foreground">Delivery</p>
                  <p className="text-base">We deliver all over Lebanon.</p>
                </div>
                {info.length > 0 && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {info.map(({ icon: Icon, label, value }) => (
                      <li
                        key={label}
                        className="rounded-xl border border-border bg-card p-5 shadow-brand-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground/80">
                            <Icon className="h-5 w-5 text-accent" />
                          </span>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              {label}
                            </p>
                            <p className="text-sm">{value}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
