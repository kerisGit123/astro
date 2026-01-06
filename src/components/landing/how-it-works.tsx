'use client'

import { ArrowRight } from "lucide-react"
import { useTranslations } from 'next-intl'

export function HowItWorks() {
    const t = useTranslations('howItWorks')
    
    return (
        <section id="how-it-works" className="container px-4 md:px-6 py-20 mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    {t('title')}
                </h2>
                <p className="mt-4 text-muted-foreground md:text-lg">
                    {t('subtitle')}
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 relative">
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-2 border-primary text-3xl font-bold text-primary shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                        1
                    </div>
                    <h3 className="text-xl font-bold">{t('step1.title')}</h3>
                    <p className="text-muted-foreground">
                        {t('step1.description')}
                    </p>
                </div>

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary/10 border-2 border-secondary text-3xl font-bold text-secondary shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        2
                    </div>
                    <h3 className="text-xl font-bold">{t('step2.title')}</h3>
                    <p className="text-muted-foreground">
                        {t('step2.description')}
                    </p>
                </div>

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-500/10 border-2 border-blue-500 text-3xl font-bold text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        3
                    </div>
                    <h3 className="text-xl font-bold">{t('step3.title')}</h3>
                    <p className="text-muted-foreground">
                        {t('step3.description')}
                    </p>
                </div>
            </div>
        </section>
    )
}
