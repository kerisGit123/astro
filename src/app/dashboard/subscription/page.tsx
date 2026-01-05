"use client"

import { useUser } from "@clerk/nextjs"
import { PricingTable } from "@clerk/nextjs"
import { SubscriptionDetailsButton } from "@/components/subscription-details-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export default function SubscriptionPage() {
  const { user } = useUser()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Unlock the full power of AI-driven Zi Wei Dou Shu predictions with flexible subscription plans.
        </p>
      </div>

      {/* Subscription Details Button - Only show for paid plans */}
      {user?.publicMetadata?.subscriptionPlan && user.publicMetadata.subscriptionPlan !== 'free' && (
        <div className="max-w-2xl mx-auto w-full">
          <SubscriptionDetailsButton />
        </div>
      )}

      {/* Clerk Pricing Table */}
      <Card className="max-w-4xl mx-auto w-full bg-card/50">
        <CardHeader>
          <CardTitle>Subscribe or Change Plan</CardTitle>
          <CardDescription>
            Manage your subscription using Clerk&apos;s secure billing portal
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


      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto w-full mt-8 space-y-6">
        <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
        
        <div className="grid gap-4">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! You can cancel your subscription at any time through Clerk's billing portal. Your access will continue until the end of your billing period.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, and digital payment methods through Stripe, powered by Clerk.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Can I use both subscription and credits?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! Your subscription provides recurring benefits, while credits can be purchased separately for additional features or one-time services.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
