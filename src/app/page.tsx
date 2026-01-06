import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/landing/hero"
import { WhyChoose } from "@/components/landing/why-choose"
import { CoreFeatures } from "@/components/landing/core-features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { QuickAnalyzer } from "@/components/landing/quick-analyzer"
import { PricingSection } from "@/components/landing/pricing-section"
import { AstrologySection } from "@/components/landing/astrology-section"
import { CTASection } from "@/components/landing/cta-section"
import { SiteFooter } from "@/components/landing/site-footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background scroll-smooth">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <QuickAnalyzer />
        <WhyChoose />
        <CoreFeatures />
        <HowItWorks />
        <PricingSection />
        <AstrologySection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}
