import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/landing/site-footer"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container px-4 md:px-6 py-20 mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">Account Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Email address (via OAuth providers)</li>
              <li>Name (from OAuth profile)</li>
              <li>Profile picture (optional)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Birth Data</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Birth date (required for chart calculations)</li>
              <li>Birth time (optional but recommended)</li>
              <li>Birth location (optional but recommended)</li>
              <li>Gender (optional)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">People You Add</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Names and birth data of people you add for analysis</li>
              <li>Relationship types and labels</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Pages visited and features used</li>
              <li>Time spent on the platform</li>
              <li>Browser type and device information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Chart Calculations</strong> - To generate your personalized astrological charts</li>
              <li><strong>Compatibility Analysis</strong> - To analyze relationships between people you add</li>
              <li><strong>Service Improvement</strong> - To understand usage patterns and improve features</li>
              <li><strong>Communication</strong> - To send service updates and important notifications</li>
              <li><strong>Subscription Management</strong> - To process payments and manage your subscription</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Security</h2>
            <p className="text-muted-foreground mb-4">
              Your data is stored securely using industry-standard practices:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Encrypted database connections (Neon DB with SSL)</li>
              <li>Secure authentication via Clerk (OAuth 2.0)</li>
              <li>Payment processing via Stripe (PCI DSS compliant)</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell your personal information. We share data only with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Service Providers</strong> - Clerk (auth), Stripe (payments), Neon (database), n8n (calculations)</li>
              <li><strong>Legal Requirements</strong> - When required by law or to protect our rights</li>
              <li><strong>Business Transfers</strong> - In the event of a merger or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights (GDPR Compliance)</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Access</strong> - Request a copy of your data</li>
              <li><strong>Correction</strong> - Update inaccurate information</li>
              <li><strong>Deletion</strong> - Request deletion of your account and data</li>
              <li><strong>Export</strong> - Download your data in a portable format</li>
              <li><strong>Opt-out</strong> - Unsubscribe from marketing communications</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, contact us at privacy@ziwei-path.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use essential cookies for authentication and session management. We do not use third-party 
              advertising cookies. You can control cookie preferences in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your data as long as your account is active. After account deletion, we may retain 
              certain data for legal compliance (e.g., payment records) for up to 7 years.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              ZiWei Path is not intended for users under 18. We do not knowingly collect data from children. 
              If you believe we have collected data from a minor, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. International Users</h2>
            <p className="text-muted-foreground">
              Your data may be transferred to and processed in countries outside your residence. We ensure 
              appropriate safeguards are in place for international data transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this policy from time to time. We will notify you of significant changes via 
              email or platform notification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground">
              For privacy-related questions or to exercise your rights, contact us at:
            </p>
            <p className="text-muted-foreground mt-2">
              Email: privacy@ziwei-path.com<br />
              Data Protection Officer: dpo@ziwei-path.com
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
