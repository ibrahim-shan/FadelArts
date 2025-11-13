import type { Metadata } from "next";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Terms of Service — Fadel Art",
  description:
    "Terms of Service outlining the rules, obligations, and legal conditions governing the use of the Fadel Art platform.",
};

export default function TermsPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-secondary/50">
        <div className="container py-12 md:py-16">
          <Reveal as="h1" className="text-xl md:text-2xl font-semibold text-center" mode="mount">
            Terms of Service
          </Reveal>
          <Reveal as="p" className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully. By using our site and services you agree to the
            following terms.
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container prose prose-neutral max-w-3xl dark:prose-invert">
          <Reveal>
            <div className="space-y-8 md:space-y-10">
              <div>
                <h2 id="introduction">1. Introduction</h2>
                <p>
                  Welcome to Fadel Art Shop. These Terms of Service (&quot;Terms&quot;) govern your
                  access to and use of our website, products, and services. By accessing or using
                  the site, you agree to be bound by these Terms.
                </p>
              </div>

              <div>
                <h2 id="use">2. Use of the Site</h2>
                <p>
                  You agree to use the site only for lawful purposes and in accordance with these
                  Terms. You must not misuse any content, attempt to interfere with the site, or
                  engage in fraudulent activity.
                </p>
              </div>

              <div>
                <h2 id="orders">3. Orders & Availability</h2>
                <p>
                  All orders are subject to acceptance and availability. We may refuse or cancel an
                  order for any reason, including suspected fraud, pricing errors, or stock issues.
                </p>
              </div>

              <div>
                <h2 id="pricing">4. Pricing & Payments</h2>
                <p>
                  Prices are displayed in the currency stated at checkout and may change without
                  prior notice. You are responsible for any applicable taxes or duties. Payment is
                  processed securely through our providers.
                </p>
              </div>

              <div>
                <h2 id="ip">5. Intellectual Property</h2>
                <p>
                  All content, trademarks, and artworks on this site are protected by intellectual
                  property laws. You may not reproduce, distribute, or create derivative works
                  without prior written permission.
                </p>
              </div>

              <div>
                <h2 id="user-content">6. User Content</h2>
                <p>
                  If you submit reviews or other content, you grant us a non-exclusive, royalty-free
                  license to use, reproduce, and display that content in connection with the site
                  and our services.
                </p>
              </div>

              <div>
                <h2 id="prohibited">7. Prohibited Activities</h2>
                <p>
                  You must not use the site to violate laws, infringe third-party rights, distribute
                  malware, or engage in abusive behavior.
                </p>
              </div>

              <div>
                <h2 id="liability">8. Limitation of Liability</h2>
                <p>
                  To the fullest extent permitted by law, Fadel Art Shop will not be liable for
                  indirect, incidental, or consequential damages arising from your use of the site
                  or services.
                </p>
              </div>

              <div>
                <h2 id="law">9. Governing Law</h2>
                <p>
                  These Terms are governed by the laws of the applicable jurisdiction where Fadel
                  Art operates. Disputes will be resolved in courts of competent jurisdiction.
                </p>
              </div>

              <div>
                <h2 id="contact">10. Contact</h2>
                <p>Questions about these Terms? Contact us via the details on our Contact page.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
