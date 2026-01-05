import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/landing/hero"
import { WhyChoose } from "@/components/landing/why-choose"
import { CoreFeatures } from "@/components/landing/core-features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { CTASection } from "@/components/landing/cta-section"
import { SiteFooter } from "@/components/landing/site-footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <WhyChoose />
        <CoreFeatures />
        <HowItWorks />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}
