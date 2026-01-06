"use client"

import { useTranslations } from 'next-intl'
import { PricingTable } from "@clerk/nextjs"

export function PricingSection() {
    const t = useTranslations('pricing')
    
    return (
        <section id="pricing" className="py-16 md:py-24 bg-gradient-to-b from-background via-purple-500/5 to-background">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                        {t('title')}
                    </h2>
                    <p className="mt-4 text-muted-foreground md:text-xl max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="flex justify-center w-full">
                    <PricingTable 
                        appearance={{
                            elements: {
                                rootBox: "w-full max-w-7xl",
                                card: "border-2 border-gray-500 rounded-2xl shadow-lg hover:shadow-purple-500/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-card via-card to-purple-500/5 backdrop-blur-sm",
                                cardBox: "p-8 md:p-10",
                                cardHeader: "border-b border-purple-500/20 pb-6 mb-6",
                                cardTitle: "text-2xl md:text-3xl font-bold text-foreground",
                                cardDescription: "text-muted-foreground mt-2 text-base",
                                cardPriceText: "text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent",
                                cardFeatureList: "space-y-4 my-8",
                                cardFeatureItem: "flex items-center gap-3 text-foreground/90 text-base",
                                cardFeatureItemIcon: "text-purple-500 flex-shrink-0 w-5 h-5",
                                cardButton: "w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 rounded-xl font-semibold py-4 px-6 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02]",
                                badge: "bg-gradient-to-r from-purple-500/20 to-purple-400/10 text-purple-600 border border-purple-500/40 font-semibold px-3 py-1 rounded-full",
                            },
                            variables: {
                                colorPrimary: "#a855f7",
                                colorBackground: "hsl(var(--card))",
                                colorText: "hsl(var(--foreground))",
                                colorTextSecondary: "hsl(var(--muted-foreground))",
                                colorInputBackground: "hsl(var(--background))",
                                colorInputText: "hsl(var(--foreground))",
                                borderRadius: "1rem",
                                fontFamily: "inherit",
                                fontSize: "16px",
                            }
                        }}
                    />
                </div>
            </div>
        </section>
    )
}
