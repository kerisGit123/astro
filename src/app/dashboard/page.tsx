"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Calendar, Target, Loader2, TrendingUp, Zap, ArrowRight, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { ProfileForm } from "@/components/profile-form"
import { ZodiacProgress } from "@/components/zodiac-progress"
import { useUser } from "@clerk/nextjs"
import { useTranslations } from "next-intl"

interface Profile {
    id: string;
    birth_date: string;
    name?: string;
    birth_time?: string;
    birth_location?: string;
}

interface PredictionSummary {
    id: string;
    analysis_type: string;
    target_month?: string;
    target_year?: string;
    result_data: {
        status: string;
        monthlyLuck?: { overallScore?: number };
        yearlyLuck?: { overallScore?: number };
    };
    created_at: string;
}

export default function DashboardPage() {
    const t = useTranslations('dashboard')
    const { user } = useUser()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [predictions, setPredictions] = useState<any[]>([])
    const [latestMonthly, setLatestMonthly] = useState<any>(null)
    const [latestYearly, setLatestYearly] = useState<any>(null)
    const [peopleStats, setPeopleStats] = useState<any>(null)
    const [creditBalance, setCreditBalance] = useState<number | null>(null)
    const [clerkSubscription, setClerkSubscription] = useState<{plan: string, status: string} | null>(null)
    const [loading, setLoading] = useState(true)
    const [analyzingMonthly, setAnalyzingMonthly] = useState(false)
    const [analyzingYearly, setAnalyzingYearly] = useState(false)

    useEffect(() => {
        // Fetch Clerk subscription from user metadata
        if (user) {
            const plan = (user.publicMetadata?.subscriptionPlan as string) || 'free'
            const status = (user.publicMetadata?.subscriptionStatus as string) || 'active'
            setClerkSubscription({ plan, status })
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/profile")
                if (res.ok) {
                    const data = await res.json()
                    setProfile(data)
                } else if (res.status === 404) { // Assuming 404 means no profile found
                    setProfile(null);
                } else {
                    console.error("Failed to fetch profile:", res.status, res.statusText);
                    setProfile(null); // Treat other errors as no profile for now
                }
            } catch (e) {
                console.error("Error fetching profile:", e)
                setProfile(null);
            } finally {
                setLoading(false)
            }
        }
        
        const fetchPredictions = async () => {
            try {
                const predictionsRes = await fetch("/api/predictions/list?limit=5")
                if (predictionsRes.ok) {
                    const predictionsData = await predictionsRes.json()
                    setPredictions(predictionsData)
                    
                    // Find latest monthly and yearly predictions
                    const monthly = predictionsData.find((p: any) => p.analysis_type === 'monthly')
                    const yearly = predictionsData.find((p: any) => p.analysis_type === 'yearly')
                    
                    setLatestMonthly(monthly)
                    setLatestYearly(yearly)
                    
                    // Fetch people statistics
                    const peopleRes = await fetch('/api/people')
                    if (peopleRes.ok) {
                        const peopleData = await peopleRes.json()
                        const stats = {
                            total: peopleData.length,
                            active: peopleData.filter((p: any) => p.is_active !== false).length,
                            friends: peopleData.filter((p: any) => p.is_active !== false && p.relationship_type === 'friend').length,
                            partners: peopleData.filter((p: any) => p.is_active !== false && p.relationship_type === 'business_partner').length,
                            team: peopleData.filter((p: any) => p.is_active !== false && (p.category === 'team' || p.category === 'worker')).length,
                        }
                        setPeopleStats(stats)
                    }
                }
            } catch (e) {
                console.error("Error fetching predictions:", e)
            }
        }
        
        const fetchCreditBalance = async () => {
            if (!user?.id) return
            try {
                const creditRes = await fetch(`/api/credits/balance?companyId=${user.id}`)
                if (creditRes.ok) {
                    const creditData = await creditRes.json()
                    setCreditBalance(creditData.balance)
                }
            } catch (e) {
                console.error("Error fetching credit balance:", e)
            }
        }
        
        fetchProfile()
        fetchPredictions()
        if (user?.id) {
            fetchCreditBalance()
        }
    }, [user])
    
    const handleAnalyzeMonthly = async () => {
        if (!profile) return
        setAnalyzingMonthly(true)
        try {
            const now = new Date()
            const targetMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
            
            const res = await fetch("/api/predictions/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    personId: profile.id,
                    type: "monthly",
                    targetMonth,
                    language: "zh"
                })
            })
            
            if (res.ok) {
                const data = await res.json()
                window.location.href = `/dashboard/prediction-report?id=${data.predictionId}`
            }
        } catch (e) {
            console.error("Error analyzing monthly:", e)
        } finally {
            setAnalyzingMonthly(false)
        }
    }
    
    const handleAnalyzeYearly = async () => {
        if (!profile) return
        setAnalyzingYearly(true)
        try {
            const targetYear = new Date().getFullYear().toString()
            
            const res = await fetch("/api/predictions/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    personId: profile.id,
                    type: "yearly",
                    targetYear,
                    language: "zh"
                })
            })
            
            if (res.ok) {
                const data = await res.json()
                window.location.href = `/dashboard/prediction-report?id=${data.predictionId}`
            }
        } catch (e) {
            console.error("Error analyzing yearly:", e)
        } finally {
            setAnalyzingYearly(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex flex-1 items-center justify-center p-4">
                <div className="w-full max-w-2xl text-center space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">{t('welcomeNew')}</h2>
                        <p className="text-muted-foreground">{t('welcomeDesc')}</p>
                    </div>
                    <ProfileForm />
                </div>
            </div>
        )
    }

    const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
    const currentYear = new Date().getFullYear()
    
    return (
        <>
            <ZodiacProgress 
                isLoading={analyzingMonthly || analyzingYearly} 
                message={analyzingMonthly ? "Analyzing monthly prediction... 🌙" : "Analyzing yearly prediction... ✨"} 
            />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Hero Section with Quick Actions */}
            <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 md:p-8">
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight">{t('welcome')}</h1>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">
                        {t('description')}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 pt-2">
                        <Button 
                            size="lg" 
                            onClick={handleAnalyzeMonthly}
                            disabled={analyzingMonthly}
                            className="gap-2"
                        >
                            {analyzingMonthly ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Zap className="h-4 w-4" />
                            )}
                            {t('analyzeMonth')} {currentMonth}
                        </Button>
                        
                        <Button 
                            size="lg" 
                            variant="outline"
                            onClick={handleAnalyzeYearly}
                            disabled={analyzingYearly}
                            className="gap-2"
                        >
                            {analyzingYearly ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <TrendingUp className="h-4 w-4" />
                            )}
                            {t('analyzeYear')} {currentYear}
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Recent Predictions */}
            {predictions.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">{t('recentPredictions')}</h2>
                        <Button variant="ghost" size="sm" className="gap-2">
                            {t('viewAll')}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                        {latestMonthly && (
                            <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => window.location.href = `/dashboard/prediction-report?id=${latestMonthly.id}`}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            {t('getMonthlyPrediction')}
                                        </CardTitle>
                                        {latestMonthly.result_data.monthlyLuck?.overallScore && (
                                            <div className="text-2xl font-bold text-primary">
                                                {latestMonthly.result_data.monthlyLuck.overallScore}
                                            </div>
                                        )}
                                    </div>
                                    <CardDescription>
                                        {latestMonthly.target_month && new Date(latestMonthly.target_month + '-01').toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {t('status')}: {latestMonthly.result_data.status}
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        
                        {latestYearly && (
                            <Card className="bg-card/50 border-secondary/20 hover:border-secondary/40 transition-colors cursor-pointer" onClick={() => window.location.href = `/dashboard/prediction-report?id=${latestYearly.id}`}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-secondary" />
                                            {t('getYearlyPrediction')}
                                        </CardTitle>
                                        {latestYearly.result_data.yearlyLuck?.overallScore && (
                                            <div className="text-2xl font-bold text-secondary">
                                                {latestYearly.result_data.yearlyLuck.overallScore}
                                            </div>
                                        )}
                                    </div>
                                    <CardDescription>
                                        Year {latestYearly.target_year}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {t('status')}: {latestYearly.result_data.status}
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
            
            {/* Quick Stats */}
            {profile && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-card/50 border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('profile')}
                            </CardTitle>
                            <Sparkles className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{profile.name || t('user')}</div>
                            <p className="text-xs text-muted-foreground">
                                {profile.birth_date && new Date(profile.birth_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-secondary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('recentPredictions')}
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-secondary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{predictions.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {predictions.filter(p => p.analysis_type === 'monthly').length} {t('monthly')}, {predictions.filter(p => p.analysis_type === 'yearly').length} {t('yearly')}
                            </p>
                        </CardContent>
                    </Card>

                    {latestMonthly && latestMonthly.result_data.monthlyLuck?.overallScore && (
                        <Card className="bg-card/50 border-blue-500/20">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('latestMonthlyScore')}
                                </CardTitle>
                                <Target className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{latestMonthly.result_data.monthlyLuck.overallScore}/100</div>
                                <p className="text-xs text-muted-foreground">
                                    {latestMonthly.target_month && new Date(latestMonthly.target_month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {latestYearly && latestYearly.result_data.yearlyLuck?.overallScore && (
                        <Card className="bg-card/50 border-green-500/20">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('latestYearlyScore')}
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{latestYearly.result_data.yearlyLuck.overallScore}/100</div>
                                <p className="text-xs text-muted-foreground">
                                    Year {latestYearly.target_year}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    
                    {peopleStats && (
                        <Card className="bg-card/50 border-purple-500/20">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('peopleStats')}
                                </CardTitle>
                                <Users className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{peopleStats.active}</div>
                                <p className="text-xs text-muted-foreground">
                                    {peopleStats.friends} friends, {peopleStats.partners} partners, {peopleStats.team} team
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    
                    {clerkSubscription && (
                        <Card className="bg-card/50 border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-pointer" onClick={() => window.location.href = '/dashboard/subscription'}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {clerkSubscription.plan === 'free' ? t('plan') : t('subscription')}
                                </CardTitle>
                                <Sparkles className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                {clerkSubscription.plan !== 'free' && (
                                    <div className="text-2xl font-bold capitalize">{clerkSubscription.plan}</div>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {clerkSubscription.plan === 'free' ? t('clickToUpgrade') : t('clickToManagePlan')}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    
                    {creditBalance !== null && (
                        <Card className="bg-card/50 border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-pointer" onClick={() => window.location.href = '/dashboard/credits'}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('creditsRemaining')}
                                </CardTitle>
                                <Zap className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{creditBalance}</div>
                                <p className="text-xs text-muted-foreground">
                                    {t('clickToManageCredits')}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3 mt-6">
                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-pointer" onClick={() => window.location.href = '/dashboard/credits'}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-emerald-500" />
                            {t('manageCredits')}
                        </CardTitle>
                        <CardDescription>
                            {t('manageCreditsDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="ghost" className="w-full gap-2">
                            {t('manageCredits')}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
            </div>
        </>
    )
}
