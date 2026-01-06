'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'

export function CTASection() {
    const t = useTranslations('cta')
    
    return (
        <section className="container px-4 md:px-6 py-20 mx-auto">
            <div className="relative rounded-3xl bg-gradient-to-br from-indigo-900/50 via-slate-900 to-indigo-950/50 p-8 md:p-16 text-center border border-primary/20 overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10" />

                <div className="space-y-6 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        {t('title')}
                    </h2>
                    <p className="text-muted-foreground md:text-lg">
                        {t('description')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link href="/signup">
                            <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground text-base">
                                {t('getStarted')}
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                                {t('learnMore')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
