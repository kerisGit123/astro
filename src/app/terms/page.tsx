import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/landing/site-footer"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container px-4 md:px-6 py-20 mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using ZiWei Path (&quot;the Service&quot;), you accept and agree to be bound by these Terms of Use. 
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              ZiWei Path provides interpretative analysis based on 紫微斗數 (Zi Wei Dou Shu), Western Astrology, 
              and Chinese Zodiac systems. The Service offers insights into life patterns, timing, and compatibility 
              for educational and self-awareness purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Nature of Content</h2>
            <p className="text-muted-foreground mb-4">
              All content provided by ZiWei Path is:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Interpretative</strong> - Based on traditional metaphysical systems</li>
              <li><strong>Educational</strong> - For self-awareness and personal development</li>
              <li><strong>Not Predictive</strong> - Does not claim to predict specific future events</li>
              <li><strong>Not Professional Advice</strong> - See Disclaimer for details</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate birth data for chart calculations</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payment</h2>
            <p className="text-muted-foreground">
              Paid subscriptions are billed according to the plan you select. You may cancel at any time. 
              Refunds are handled according to our refund policy. Prices are subject to change with notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, features, and functionality of the Service are owned by ZiWei Path and are protected 
              by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, 
              or create derivative works without express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. User Conduct</h2>
            <p className="text-muted-foreground mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Share your account with others</li>
              <li>Scrape, copy, or reverse engineer any part of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              ZiWei Path is provided &quot;as is&quot; without warranties of any kind. We are not liable for any 
              decisions you make based on the information provided. See our Disclaimer for full details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account at any time for violation of these terms 
              or for any other reason at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may modify these terms at any time. Continued use of the Service after changes constitutes 
              acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Use, please contact us at support@ziwei-path.com
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8 pt-8 border-t border-border">
            Last updated: December 30, 2024
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
