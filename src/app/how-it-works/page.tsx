'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { 
  Sparkles, Users, Calendar, Heart, TrendingUp, Zap, 
  CheckCircle2, Star, BarChart3, Shield, Globe, Rocket,
  UserPlus, FileText, Brain, Target, Award, Clock
} from "lucide-react"

export default function HowItWorksPage() {
  const t = useTranslations('howItWorks')

  const features = [
    {
      icon: UserPlus,
      titleKey: 'features.peopleManagement.title',
      descKey: 'features.peopleManagement.desc',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Brain,
      titleKey: 'features.aiAnalysis.title',
      descKey: 'features.aiAnalysis.desc',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Calendar,
      titleKey: 'features.predictions.title',
      descKey: 'features.predictions.desc',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Heart,
      titleKey: 'features.compatibility.title',
      descKey: 'features.compatibility.desc',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      icon: Star,
      titleKey: 'features.zodiacAnalysis.title',
      descKey: 'features.zodiacAnalysis.desc',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: Globe,
      titleKey: 'features.multilingual.title',
      descKey: 'features.multilingual.desc',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    }
  ]

  const steps = [
    {
      number: 1,
      icon: UserPlus,
      titleKey: 'steps.step1.title',
      descKey: 'steps.step1.desc',
      color: 'text-blue-500'
    },
    {
      number: 2,
      icon: FileText,
      titleKey: 'steps.step2.title',
      descKey: 'steps.step2.desc',
      color: 'text-purple-500'
    },
    {
      number: 3,
      icon: Zap,
      titleKey: 'steps.step3.title',
      descKey: 'steps.step3.desc',
      color: 'text-green-500'
    },
    {
      number: 4,
      icon: BarChart3,
      titleKey: 'steps.step4.title',
      descKey: 'steps.step4.desc',
      color: 'text-amber-500'
    }
  ]

  const ratings = [
    { category: 'accuracy', score: 9, icon: Target },
    { category: 'easeOfUse', score: 10, icon: Zap },
    { category: 'features', score: 9, icon: Star },
    { category: 'design', score: 10, icon: Sparkles },
    { category: 'value', score: 9, icon: Award }
  ]

  const improvements = [
    { icon: Rocket, textKey: 'improvements.item1' },
    { icon: Shield, textKey: 'improvements.item2' },
    { icon: Clock, textKey: 'improvements.item3' },
    { icon: Users, textKey: 'improvements.item4' },
    { icon: Brain, textKey: 'improvements.item5' }
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{t('badge')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {t('title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        
        {/* What is ZiWei Path */}
        <section className="mb-20">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                {t('whatIs.title')}
              </CardTitle>
              <CardDescription className="text-lg mt-4">
                {t('whatIs.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('whatIs.paragraph1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('whatIs.paragraph2')}
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Star className="h-6 w-6 text-purple-500 mb-2" />
                  <h4 className="font-semibold mb-1">{t('whatIs.system1')}</h4>
                  <p className="text-sm text-muted-foreground">{t('whatIs.system1Desc')}</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Calendar className="h-6 w-6 text-blue-500 mb-2" />
                  <h4 className="font-semibold mb-1">{t('whatIs.system2')}</h4>
                  <p className="text-sm text-muted-foreground">{t('whatIs.system2Desc')}</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Sparkles className="h-6 w-6 text-amber-500 mb-2" />
                  <h4 className="font-semibold mb-1">{t('whatIs.system3')}</h4>
                  <p className="text-sm text-muted-foreground">{t('whatIs.system3Desc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How It Works - Step by Step */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('steps.title')}</h2>
            <p className="text-muted-foreground text-lg">{t('steps.subtitle')}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className={`p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20`}>
                          <Icon className={`h-6 w-6 ${step.color}`} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {step.number}
                        </div>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{t(step.titleKey)}</CardTitle>
                        <CardDescription className="text-base">{t(step.descKey)}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-muted-foreground text-lg">{t('features.subtitle')}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg">{t(feature.titleKey)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{t(feature.descKey)}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* System Ratings */}
        <section className="mb-20">
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Award className="h-8 w-8 text-amber-500" />
                {t('ratings.title')}
              </CardTitle>
              <CardDescription className="text-lg">{t('ratings.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {ratings.map((rating, index) => {
                  const Icon = rating.icon
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="font-semibold">{t(`ratings.${rating.category}`)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">{rating.score}</span>
                          <span className="text-muted-foreground">/10</span>
                        </div>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000"
                          style={{ width: `${rating.score * 10}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                
                <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                    <span className="text-2xl font-bold">{t('ratings.overall')}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-amber-500">9.4</span>
                    <span className="text-xl text-muted-foreground">/10</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{t('ratings.overallDesc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Suggestions for Improvement */}
        <section className="mb-20">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Rocket className="h-8 w-8 text-blue-500" />
                {t('improvements.title')}
              </CardTitle>
              <CardDescription className="text-lg">{t('improvements.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {improvements.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground">{t(item.textKey)}</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Why Choose ZiWei Path */}
        <section className="mb-20">
          <Card className="border-2 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                {t('whyChoose.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">{t('whyChoose.reason1Title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('whyChoose.reason1Desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">{t('whyChoose.reason2Title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('whyChoose.reason2Desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">{t('whyChoose.reason3Title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('whyChoose.reason3Desc')}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">{t('whyChoose.reason4Title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('whyChoose.reason4Desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">{t('whyChoose.reason5Title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('whyChoose.reason5Desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">{t('whyChoose.reason6Title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('whyChoose.reason6Desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="border-2 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
            <CardContent className="p-12 text-center">
              <Sparkles className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('cta.description')}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link 
                  href="/signup" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Rocket className="h-5 w-5" />
                  {t('cta.getStarted')}
                </Link>
                <Link 
                  href="/astrology" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-background border-2 rounded-lg font-semibold hover:bg-muted transition-colors"
                >
                  <Star className="h-5 w-5" />
                  {t('cta.learnMore')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  )
}
