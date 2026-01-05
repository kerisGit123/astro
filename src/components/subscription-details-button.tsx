"use client"

import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function SubscriptionDetailsButton() {
  const { user } = useUser()
  
  const plan = (user?.publicMetadata?.subscriptionPlan as string) || 'free'
  const status = (user?.publicMetadata?.subscriptionStatus as string) || 'active'
  
  const handleManageSubscription = () => {
    window.open('https://accounts.clerk.com', '_blank')
  }
  
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <div>
          <p className="font-semibold capitalize">
            {plan} Plan
          </p>
          <p className="text-sm text-muted-foreground capitalize">
            Status: {status}
          </p>
        </div>
      </div>
      {plan !== 'free' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleManageSubscription}
        >
          Manage in Clerk
        </Button>
      )}
    </div>
  )
}
