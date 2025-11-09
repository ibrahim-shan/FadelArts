import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/contact/form";
import Reveal from "@/components/reveal";
import Breadcrumb from "@/components/breadcrumb";

export const metadata: Metadata = {
  title: "Contact — Fadel Art",
  description: "Get in touch with Fadel Art: questions, commissions, support.",
};

export default function ContactPage() {
  const info = [
    { icon: Mail, label: "Email", value: "hello@fadelart.example" },
    { icon: Phone, label: "Phone", value: "+961 70 000 000" },
    { icon: MapPin, label: "Location", value: "Beirut, Lebanon" },
    { icon: Clock, label: "Hours", value: "Mon–Fri, 9am–6pm" },
  ];

  return (
    <main>
      <section className="relative overflow-hidden bg-secondary/50">
        <div className="container py-16">
          <Reveal mode="mount">
            <div className="mb-6"><Breadcrumb items={[{ label: "Contact" }]} /></div>
            <h1 className="mb-3 text-center md:text-left" style={{ fontFamily: "var(--font-heading)" }}>
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
                  <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
                    <iframe
                      title="Fadel Art location map"
                      aria-label="Fadel Art location map"
                      className="absolute inset-0 h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src="https://www.google.com/maps?q=Beirut%2C%20Lebanon&output=embed"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-secondary/60 p-6">
                  <p className="text-sm text-muted-foreground">Delivery</p>
                  <p className="text-base">We deliver all over Lebanon.</p>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {info.map(({ icon: Icon, label, value }) => (
                    <li key={label} className="rounded-xl border border-border bg-card p-5 shadow-brand-sm">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground/80">
                          <Icon className="h-5 w-5 text-accent" />
                        </span>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                          <p className="text-sm">{value}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
