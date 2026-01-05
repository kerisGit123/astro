"use client"

import { useEffect, useState } from "react"
import { Coins, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function UserInfoHeader() {
  const [tokenBalance, setTokenBalance] = useState<number | null>(null)
  const [subscription, setSubscription] = useState<string>("free")

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Fetch token balance
        const tokenRes = await fetch('/api/tokens/balance')
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          setTokenBalance(tokenData.balance)
        }

        // Fetch subscription info from profile
        const profileRes = await fetch('/api/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setSubscription(profileData.subscription_tier || 'free')
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
      }
    }

    fetchUserInfo()
  }, [])

  return (
    <div className="flex items-center gap-4">
      {/* Token Balance */}
      <Link href="/dashboard/tokens" className="hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Coins className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {tokenBalance !== null ? tokenBalance : '...'} tokens
          </span>
        </div>
      </Link>

      {/* Subscription Badge */}
      <Link href="/pricing" className="hover:opacity-80 transition-opacity">
        <Badge variant={subscription === 'free' ? 'outline' : 'default'} className="gap-1.5">
          <Crown className="h-3.5 w-3.5" />
          {subscription === 'free' ? 'Free Plan' : subscription.charAt(0).toUpperCase() + subscription.slice(1)}
        </Badge>
      </Link>
    </div>
  )
}
