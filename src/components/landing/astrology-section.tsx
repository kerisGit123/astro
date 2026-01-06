'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, BookOpen, Compass, Star, Zap, Calendar } from "lucide-react"

export function AstrologySection() {
  const t = useTranslations('astrology')

  const systems = [
    {
      id: 'ziwei',
      icon: Star,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      id: 'bazi',
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'qimen',
      icon: Compass,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      id: 'western',
      icon: Sparkles,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    },
    {
      id: 'chinese',
      icon: Calendar,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20'
    }
  ]

  return (
    <section id="astrology" className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Systems Grid */}
        <div className="max-w-6xl mx-auto space-y-8">
          {systems.map((system) => {
            const Icon = system.icon
            return (
              <Card key={system.id} className={`${system.borderColor} hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${system.bgColor}`}>
                      <Icon className={`h-6 w-6 ${system.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">
                        {t(`${system.id}.name`)}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {t(`${system.id}.origin`)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{t('coreConcept')}</h4>
                    <p className="text-muted-foreground">
                      {t(`${system.id}.concept`)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('whatItDescribes')}</h4>
                    <p className="text-muted-foreground">
                      {t(`${system.id}.describes`)}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${system.bgColor} border ${system.borderColor}`}>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className={`h-4 w-4 ${system.color}`} />
                      {t('analogy')}
                    </h4>
                    <p className="text-muted-foreground italic">
                      {t(`${system.id}.analogy`)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Comparison Table */}
        <div className="max-w-6xl mx-auto mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('comparison.title')}</CardTitle>
              <CardDescription>{t('comparison.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">{t('comparison.system')}</th>
                      <th className="text-left p-4 font-semibold">{t('comparison.focus')}</th>
                      <th className="text-left p-4 font-semibold">{t('comparison.timeFrame')}</th>
                      <th className="text-left p-4 font-semibold">{t('comparison.complexity')}</th>
                      <th className="text-left p-4 font-semibold">{t('comparison.bestFor')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systems.map((system) => (
                      <tr key={system.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-4 font-medium">{t(`${system.id}.name`)}</td>
                        <td className="p-4 text-muted-foreground">{t(`comparison.${system.id}.focus`)}</td>
                        <td className="p-4 text-muted-foreground">{t(`comparison.${system.id}.timeFrame`)}</td>
                        <td className="p-4 text-muted-foreground">{t(`comparison.${system.id}.complexity`)}</td>
                        <td className="p-4 text-muted-foreground">{t(`comparison.${system.id}.bestFor`)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-2xl">{t('summary.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {systems.map((system) => (
                <div key={system.id} className="flex items-start gap-3">
                  <div className={`mt-1 p-1.5 rounded ${system.bgColor}`}>
                    <div className={`h-2 w-2 rounded-full ${system.color.replace('text-', 'bg-')}`} />
                  </div>
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{t(`${system.id}.name`)}</span>{' '}
                    {t(`summary.${system.id}`)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
