import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/landing/site-footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container px-4 md:px-6 py-20 mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-12">
          Everything you need to know about ZiWei Path
        </p>
        
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="what-is" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              What is ZiWei Path?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              ZiWei Path is a modern SaaS platform that combines three powerful metaphysical systems: 
              紫微斗數 (Zi Wei Dou Shu), Western Astrology, and Chinese Zodiac. We transform traditional 
              destiny analysis into structured, actionable insights for life direction, relationships, 
              career timing, and compatibility.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-accurate" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              How accurate are the charts?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Chart accuracy depends on the accuracy of your birth data. The more precise your birth time 
              and location, the more accurate your charts will be. We use traditional calculation methods 
              that have been refined over centuries. However, remember that these are interpretative tools 
              for self-awareness, not absolute predictions.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="birth-time" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              What if I don&apos;t know my exact birth time?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              You can still get valuable insights without an exact birth time, though some aspects will be 
              less precise. We recommend checking your birth certificate or asking family members. If you 
              have an approximate time (morning, afternoon, evening), that&apos;s better than nothing. You can 
              always update your birth time later to recalculate your charts.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="systems" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              Why combine three different systems?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Each system offers unique perspectives: 紫微斗數 excels at life patterns and timing, 
              Western Astrology provides psychological insights and planetary influences, and Chinese Zodiac 
              reveals elemental balance and compatibility. By combining them, you get a more complete picture 
              of your life dynamics.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="free-vs-paid" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              What&apos;s included in the free tier?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              The free tier includes basic chart calculations and overview insights for your personal profile. 
              Paid tiers unlock advanced features like unlimited people profiles, detailed compatibility 
              analysis, timing forecasts, and priority support. Check our pricing page for full details.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="people-profiles" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              Can I add other people to analyze?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes! You can add multiple people (partners, friends, business associates, family members) and 
              run compatibility analysis between any two people. This is perfect for understanding relationship 
              dynamics, evaluating business partnerships, or exploring family patterns.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="privacy" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              Is my birth data private and secure?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Absolutely. Your data is encrypted and stored securely. We never sell or share your personal 
              information. Only you can access your charts and people profiles. See our Privacy Policy for 
              complete details on how we protect your data.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="calculation-time" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              How long does chart calculation take?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Chart calculations typically complete within 1-2 minutes. Complex calculations (like full 
              compatibility analysis) may take up to 5 minutes. You&apos;ll receive a notification when your 
              results are ready, and you can continue using the platform while calculations run in the background.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="update-data" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              Can I update my birth information later?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes, you can update your birth data at any time from your profile settings. When you update 
              your information, we&apos;ll automatically recalculate your charts with the new data. This is 
              useful if you discover more accurate birth time information.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="scientific" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              Is this scientifically proven?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              ZiWei Path is based on traditional metaphysical systems, not empirical science. These systems 
              have been used for centuries for self-reflection and pattern recognition. We present them as 
              tools for self-awareness and personal development, not as scientific predictions. Use them 
              alongside, not instead of, critical thinking and professional advice.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="compatibility" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              How does compatibility analysis work?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Compatibility analysis compares the charts of two people across all three systems. We analyze 
              palace interactions (Zi Wei), planetary aspects (Western), and elemental harmony (Chinese). 
              You&apos;ll receive a detailed report with strengths, challenges, and recommendations for the 
              relationship type you select (romantic, business, or friendship).
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cancel" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              Can I cancel my subscription anytime?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes, you can cancel your subscription at any time from your account settings. You&apos;ll retain 
              access to paid features until the end of your current billing period. No questions asked, 
              no cancellation fees.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="mobile" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              Is there a mobile app?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Currently, ZiWei Path is a responsive web application that works on all devices. We&apos;re 
              planning native mobile apps for iOS and Android in the future. You can add our web app to 
              your home screen for a near-native experience.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="support" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              How do I get help if I have issues?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              You can reach our support team at support@ziwei-path.com. Paid subscribers get priority 
              support with faster response times. We also have extensive documentation and guides in our 
              help center.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="languages" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              What languages are supported?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Currently, ZiWei Path is available in English. We&apos;re planning to add Chinese (Traditional 
              and Simplified) and other languages in future updates. Stay tuned!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="export" className="border border-border/50 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              Can I export or share my charts?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes! Paid tiers include the ability to export your charts and reports as PDF files. You can 
              also generate shareable links for specific insights (without revealing your full birth data). 
              Perfect for sharing with friends or consultants.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-12 p-6 bg-primary/10 border border-primary/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">
            We&apos;re here to help! Reach out to our support team.
          </p>
          <a 
            href="mailto:support@ziwei-path.com" 
            className="text-primary hover:underline font-medium"
          >
            support@ziwei-path.com
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
