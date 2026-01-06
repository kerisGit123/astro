'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Map, Heart, TrendingUp, Clock, Users, Building, User, AlertTriangle } from "lucide-react"
import { useTranslations } from 'next-intl'

const features = [
    {
        title: "Life Destiny Reader",
        description: "Understand your overall life direction and potential.",
        icon: Map,
        color: "text-primary",
    },
    {
        title: "Love & Marriage",
        description: "Detailed analysis of relationship luck and partner fit.",
        icon: Heart,
        color: "text-pink-500",
    },
    {
        title: "Career & Wealth",
        description: "Forecast financial trends and best career paths.",
        icon: TrendingUp,
        color: "text-secondary",
    },
    {
        title: "Timing & Opportunities",
        description: "Know exactly when to act and when to wait.",
        icon: Clock,
        color: "text-blue-400",
    },
    {
        title: "Compatibility Detector",
        description: "Check harmony with friends, partners, or colleagues.",
        icon: Users,
        color: "text-green-500",
    },
    {
        title: "Business Partner Eval",
        description: "Assess professional synergy and potential risks.",
        icon: Building,
        color: "text-orange-500",
    },
    {
        title: "Personality Profiler",
        description: "Deep dive into your behavioral patterns.",
        icon: User,
        color: "text-indigo-400",
    },
    {
        title: "Risk & Warning System",
        description: "Alerts for upcoming challenges or conflicts.",
        icon: AlertTriangle,
        color: "text-red-500",
    },
]

export function CoreFeatures() {
    const t = useTranslations('coreFeatures')
    
    return (
        <section id="features" className="container px-4 md:px-6 py-20 mx-auto bg-muted/20 rounded-3xl">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    {t('title')}
                </h2>
                <p className="mt-4 mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                    {t('subtitle')}
                </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                    <Card key={index} className="bg-background/60 border-border/50 hover:bg-background/80 transition-colors">
                        <CardHeader className="pb-2">
                            <feature.icon className={`h-8 w-8 mb-2 ${feature.color}`} />
                            <CardTitle className="text-lg">{t(`features.${index}.title`)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {t(`features.${index}.description`)}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}
