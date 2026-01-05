import { ArrowRight } from "lucide-react"

export function HowItWorks() {
    return (
        <section id="how-it-works" className="container px-4 md:px-6 py-20 mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    How It Works
                </h2>
                <p className="mt-4 text-muted-foreground md:text-lg">
                    Your path to clarity in 3 simple steps.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 relative">
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-2 border-primary text-3xl font-bold text-primary shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                        1
                    </div>
                    <h3 className="text-xl font-bold">Enter Birth Details</h3>
                    <p className="text-muted-foreground">
                        Provide your birth date, time, and location. We protect your privacy with encryption.
                    </p>
                </div>

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary/10 border-2 border-secondary text-3xl font-bold text-secondary shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        2
                    </div>
                    <h3 className="text-xl font-bold">AI Analysis</h3>
                    <p className="text-muted-foreground">
                        Our multi-system engine calculates your Zi Wei, Western, and Chinese charts instantly.
                    </p>
                </div>

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-500/10 border-2 border-blue-500 text-3xl font-bold text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        3
                    </div>
                    <h3 className="text-xl font-bold">Get Insights</h3>
                    <p className="text-muted-foreground">
                        Receive a clear, actionable dashboard explaining your destiny and timing.
                    </p>
                </div>
            </div>
        </section>
    )
}
