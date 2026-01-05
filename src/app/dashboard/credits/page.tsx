"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, TrendingUp, TrendingDown, Loader2, CheckCircle, CreditCard } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"

interface CreditBalance {
  balance: number
}

interface LedgerEntry {
  id: number
  tokens: number
  amount_paid: number
  currency: string
  reason: string
  stripe_payment_intent_id: string | null
  created_at: string
}

const CREDIT_PACKAGES = [
  { credits: 100, price: 20, popular: false },
  { credits: 300, price: 50, popular: true },
  { credits: 700, price: 100, popular: false },
  { credits: 1500, price: 200, popular: false },
]

export default function CreditsPage() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const [balance, setBalance] = useState<number | null>(null)
  const [ledger, setLedger] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasingPackage, setPurchasingPackage] = useState<number | null>(null)
  const [status, setStatus] = useState("")

  useEffect(() => {
    // Check for success/cancel messages from URL
    const creditsSuccess = searchParams.get("credits_success")
    const creditsCanceled = searchParams.get("credits_canceled")

    if (creditsSuccess === "true") {
      setStatus("✅ Payment successful! Credits have been added to your account.")
      // Clear URL params after showing message
      setTimeout(() => {
        window.history.replaceState({}, '', '/dashboard/credits')
        setStatus("")
      }, 5000)
    } else if (creditsCanceled === "true") {
      setStatus("⚠️ Payment was canceled. No charges were made.")
      setTimeout(() => {
        window.history.replaceState({}, '', '/dashboard/credits')
        setStatus("")
      }, 5000)
    }
  }, [searchParams])

  useEffect(() => {
    if (user?.id) {
      fetchBalance()
      fetchLedger()
    }
  }, [user?.id])

  const fetchBalance = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/credits/balance?companyId=${user.id}`)
      if (res.ok) {
        const data: CreditBalance = await res.json()
        setBalance(data.balance)
      }
    } catch (e) {
      console.error("Error fetching balance:", e)
    } finally {
      setLoading(false)
    }
  }

  const fetchLedger = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/credits/ledger?companyId=${user.id}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setLedger(data.ledger || [])
      }
    } catch (e) {
      console.error("Error fetching ledger:", e)
    }
  }

  const handlePurchase = async (credits: number, amount: number) => {
    if (!user?.id) {
      setStatus("❌ Please sign in to purchase credits")
      return
    }
    setPurchasingPackage(credits)
    try {
      const res = await fetch("/api/stripe/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: user.id,
          tokens: credits,
          amount: amount * 100, // Convert to cents
          currency: "myr",
        }),
      })

      if (res.ok) {
        const data = await res.json()
        window.location.href = data.url
      } else {
        setStatus("❌ Failed to create checkout session")
      }
    } catch (e) {
      console.error("Error creating checkout:", e)
      setStatus("❌ An error occurred")
    } finally {
      setPurchasingPackage(null)
    }
  }

  const totalPurchasedAmount = ledger
    .filter(entry => entry.tokens > 0)
    .reduce((sum, entry) => sum + (entry.amount_paid || 0), 0)

  const totalPurchasedCredits = ledger
    .filter(entry => entry.tokens > 0)
    .reduce((sum, entry) => sum + entry.tokens, 0)

  const totalUsed = ledger
    .filter(entry => entry.tokens < 0)
    .reduce((sum, entry) => sum + Math.abs(entry.tokens), 0)

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="h-8 w-8 text-emerald-500" />
          Manage Credits
        </h1>
        <p className="text-muted-foreground">
          Purchase credits for AI analysis and predictions. Credits never expire.
        </p>
      </div>

      {/* Status Message */}
      {status && (
        <div className={`p-4 rounded-lg border ${status.includes('✅') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
          <p className="font-medium">{status}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Credits</CardTitle>
            <Zap className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-emerald-500">{balance || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for use
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchased</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">RM {(totalPurchasedAmount / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalPurchasedCredits} credits
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Used</CardTitle>
            <TrendingDown className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalUsed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              credits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Packages */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Credit Packages</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.credits}
              className={`relative ${
                pkg.popular
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-border/40 bg-card/50"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold">{pkg.credits}</CardTitle>
                <CardDescription>credits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">RM {pkg.price}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    RM {(pkg.price / pkg.credits).toFixed(2)} per credit
                  </p>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  variant={pkg.popular ? "default" : "outline"}
                  onClick={() => handlePurchase(pkg.credits, pkg.price)}
                  disabled={purchasingPackage === pkg.credits}
                >
                  {purchasingPackage === pkg.credits ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Buy Now"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Purchase History */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Purchase History</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ledger.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No purchase history yet. Buy your first credit package above!
                      </td>
                    </tr>
                  ) : (
                    ledger
                      .filter(entry => entry.tokens > 0)
                      .map((entry) => (
                        <tr key={entry.id} className="hover:bg-muted/50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {new Date(entry.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            {entry.tokens} credits
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {entry.currency.toUpperCase()} {(entry.amount_paid / 100).toFixed(2)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                              <CheckCircle className="h-3 w-3" />
                              Completed
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {entry.reason}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
