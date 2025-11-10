import type { Metadata } from "next";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Privacy Policy — Fadel Art",
  description: "How Fadel Art Shop collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-secondary/50">
        <div className="container py-12 md:py-16">
          <Reveal as="h1" className="text-xl md:text-2xl font-semibold text-center" mode="mount">
            Privacy Policy
          </Reveal>
          <Reveal as="p" className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">
            Your privacy matters to us. This policy explains what we collect, why we collect it, and
            how we protect it.
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container prose prose-neutral max-w-3xl dark:prose-invert">
          <Reveal>
            <div className="space-y-8 md:space-y-10">
              <div>
                <h2 id="overview">1. Overview</h2>
                <p>
                  This Privacy Policy describes how Fadel Art Shop ("we", "our", or "us") collects,
                  uses, and shares personal information when you use our website and services.
                </p>
              </div>

              <div>
                <h2 id="data-we-collect">2. Data We Collect</h2>
                <ul>
                  <li>Contact details such as name, email address, and phone number.</li>
                  <li>
                    Order information and payment status (processed via third-party providers).
                  </li>
                  <li>Usage data like pages visited, device information, and cookies.</li>
                </ul>
              </div>

              <div>
                <h2 id="how-we-use">3. How We Use Data</h2>
                <ul>
                  <li>
                    To provide and improve our services, fulfill orders, and process payments.
                  </li>
                  <li>
                    To communicate with you about orders, updates, and promotions (with consent).
                  </li>
                  <li>To secure our site, prevent fraud, and comply with legal obligations.</li>
                </ul>
              </div>

              <div>
                <h2 id="cookies">4. Cookies & Tracking</h2>
                <p>
                  We use cookies and similar technologies to remember preferences and analyze site
                  traffic. You can control cookies through your browser settings.
                </p>
              </div>

              <div>
                <h2 id="sharing">5. Sharing Information</h2>
                <p>
                  We may share information with service providers (e.g., payment processors,
                  analytics) who help us operate the site. We do not sell your personal data.
                </p>
              </div>

              <div>
                <h2 id="retention">6. Data Retention</h2>
                <p>
                  We retain personal information only as long as necessary for the purposes outlined
                  in this policy, unless a longer retention period is required by law.
                </p>
              </div>

              <div>
                <h2 id="rights">7. Your Rights</h2>
                <p>
                  Depending on your location, you may have rights to access, correct, delete, or
                  restrict the processing of your personal information. Contact us to exercise these
                  rights.
                </p>
              </div>

              <div>
                <h2 id="security">8. Security</h2>
                <p>
                  We implement reasonable technical and organizational measures to protect personal
                  information, but no method of transmission or storage is 100% secure.
                </p>
              </div>

              <div>
                <h2 id="children">9. Children’s Privacy</h2>
                <p>
                  Our services are not directed to children under 13, and we do not knowingly
                  collect personal information from children.
                </p>
              </div>

              <div>
                <h2 id="changes">10. Changes to this Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. Material changes will be
                  posted on this page with an updated effective date.
                </p>
              </div>

              <div>
                <h2 id="contact">11. Contact</h2>
                <p>Questions about this policy? Contact us via the details on our Contact page.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
