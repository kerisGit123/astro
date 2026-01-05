"use client"

import { useUser } from "@clerk/nextjs"
import { PricingTable } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

export default function TestClerkBillingPage() {
  const { user, isLoaded } = useUser()
  const [subscription, setSubscription] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSubscriptionData()
    }
  }, [user])

  const fetchSubscriptionData = async () => {
    try {
      // Get current subscription from Clerk metadata
      const currentPlan = user?.publicMetadata?.subscriptionPlan || 'free'
      const currentStatus = user?.publicMetadata?.subscriptionStatus || 'active'
      
      setSubscription({
        plan: currentPlan,
        status: currentStatus,
        metadata: user?.publicMetadata
      })

      // Mock history for demonstration
      setHistory([
        {
          id: 1,
          plan: currentPlan,
          action: 'subscribed',
          date: new Date().toISOString(),
          status: currentStatus
        }
      ])
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    await user?.reload()
    await fetchSubscriptionData()
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Clerk Subscription Billing Test</h1>
          <p className="text-muted-foreground">
            Testing Clerk&apos;s native subscription billing system
          </p>
        </div>

        {/* Current Subscription Status */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {subscription?.status === 'active' ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Current Subscription
              </div>
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="text-lg font-semibold capitalize">{subscription?.plan || 'free'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold capitalize">{subscription?.status || 'active'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="text-sm font-mono">{user?.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>

            {/* Metadata Display */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-semibold mb-2">Public Metadata:</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(user?.publicMetadata, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Clerk Pricing Table */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Subscribe or Change Plan</CardTitle>
            <CardDescription>
              Use Clerk&apos;s PricingTable to manage your subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border p-6 bg-background">
              <PricingTable 
                appearance={{
                  variables: {
                    colorPrimary: '#8b5cf6',
                    colorBackground: '#09090b',
                    colorText: '#fafafa',
                    colorTextSecondary: '#a1a1aa',
                    colorInputBackground: '#18181b',
                    colorInputText: '#fafafa',
                    borderRadius: '0.5rem'
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscription History */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Subscription History</CardTitle>
            <CardDescription>
              Track all your plan changes and subscription events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((event) => (
                  <div 
                    key={event.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        event.status === 'active' ? 'bg-emerald-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-semibold capitalize">{event.action} - {event.plan} Plan</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('en-GB')} at {new Date(event.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold capitalize">{event.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No subscription history yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-blue-400">How to Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. Click on a plan in the Pricing Table above</p>
            <p>2. Complete the subscription process</p>
            <p>3. Click &quot;Refresh&quot; to see updated subscription status</p>
            <p>4. Your plan will be reflected in the metadata</p>
            <p>5. Try changing plans to see how it updates</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
