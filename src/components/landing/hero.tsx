import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-24 md:pt-32 lg:pt-40 pb-24">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-[-1] bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

            {/* Hero Glow */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px] opacity-40 mix-blend-screen"
                aria-hidden="true"
            />

            <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center space-y-10">
                <div className="space-y-6 max-w-4xl relative">
                    <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary ring-offset-background transition-colors hover:bg-primary/20 mb-4">
                        <span className="font-semibold px-1">v1.0 Now Live</span>
                        <span className="ml-1 text-muted-foreground">- Start your journey</span>
                    </div>

                    <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-primary/50 drop-shadow-sm">
                        Your Destiny. <br className="hidden sm:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">Clearly Explained.</span>
                    </h1>

                    <p className="mx-auto max-w-[800px] text-lg text-muted-foreground/80 sm:text-xl md:text-2xl font-light leading-relaxed">
                        A modern fusion of <span className="text-foreground font-medium">紫微斗數</span>, <span className="text-foreground font-medium">Western Astrology</span> & <span className="text-foreground font-medium">Chinese Zodiac</span>.
                        <br />Unlock actionable insights for career, love, and timing.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 w-full justify-center px-4">
                    <Link href="/signup">
                        <Button size="lg" className="h-14 px-10 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] transition-all hover:scale-105 rounded-full">
                            Get Your Free Overview
                        </Button>
                    </Link>
                    <Link href="/pricing">
                        <Button variant="outline" size="lg" className="h-14 px-10 text-lg border-white/10 hover:bg-white/5 hover:text-white rounded-full bg-transparent backdrop-blur-sm">
                            View Pricing
                        </Button>
                    </Link>
                </div>

                {/* Abstract Visualization Placeholder */}
                <div className="relative mt-12 w-full max-w-6xl mx-auto rounded-[2rem] border border-white/10 bg-black/40 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                    <div className="aspect-[16/9] md:aspect-[21/9] rounded-[1.5rem] overflow-hidden border border-white/5 relative bg-black/50">
                        <Image
                            src="/hero-chart.png"
                            alt="Destiny Chart Visualization"
                            fill
                            className="object-cover opacity-90 hover:scale-105 transition-transform duration-700 ease-out"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    )
}
