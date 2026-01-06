'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Compass, Sun, Repeat } from "lucide-react"
import { useTranslations } from 'next-intl'

export function WhyChoose() {
    const t = useTranslations('whyChoose')
    
    return (
        <section className="container px-4 md:px-6 py-20 mx-auto">
            <div className="text-center mb-12 space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    {t('title')}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                    {t('subtitle')}
                </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-card/50 border-primary/20 backdrop-blur-sm">
                    <CardHeader>
                        <Compass className="h-10 w-10 text-primary mb-2" />
                        <CardTitle>{t('ziwei.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            {t('ziwei.description')}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-secondary/20 backdrop-blur-sm">
                    <CardHeader>
                        <Sun className="h-10 w-10 text-secondary mb-2" />
                        <CardTitle>{t('western.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            {t('western.description')}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-blue-500/20 backdrop-blur-sm">
                    <CardHeader>
                        <Repeat className="h-10 w-10 text-blue-400 mb-2" />
                        <CardTitle>{t('chinese.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            {t('chinese.description')}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
