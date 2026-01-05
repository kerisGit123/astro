"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/landing/site-footer"
import { PricingTable } from "@clerk/nextjs"

export default function PricingPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="container px-4 md:px-6 py-16 mx-auto flex-1">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple Pricing for Your Destiny</h1>
                    <p className="mt-4 text-muted-foreground md:text-xl">Choose the plan that fits your journey.</p>
                </div>

                <div className="flex justify-center w-full">
                    <PricingTable 
                        appearance={{
                            elements: {
                                rootBox: "w-full max-w-7xl",
                                card: "border-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow",
                                cardBox: "p-6",
                                cardHeader: "border-b pb-4 mb-4",
                                cardTitle: "text-2xl font-bold",
                                cardDescription: "text-muted-foreground",
                                cardPriceText: "text-4xl font-bold",
                                cardFeatureList: "space-y-3 my-6",
                                cardFeatureItem: "flex items-center gap-2",
                                cardFeatureItemIcon: "text-primary",
                                cardButton: "w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold py-3 transition-colors",
                                badge: "bg-primary/10 text-primary border-primary/20",
                            },
                            variables: {
                                colorPrimary: "hsl(var(--primary))",
                                colorBackground: "hsl(var(--background))",
                                colorText: "hsl(var(--foreground))",
                                colorTextSecondary: "hsl(var(--muted-foreground))",
                                borderRadius: "0.5rem",
                                fontFamily: "inherit",
                            }
                        }}
                    />
                </div>
            </div>
            <SiteFooter />
        </div>
    )
}
