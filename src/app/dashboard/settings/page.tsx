"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, User, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { EditProfileDialog } from "./edit-profile-dialog"
import { useTranslations } from "next-intl"
export default function SettingsPage() {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { user } = useUser()
  const [selfProfile, setSelfProfile] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    gender: "",
    additionalInfo: "",
    familyZodiac: "",
    currentBusiness: "",
  })

  const fetchSelfProfile = async () => {
    try {
      const response = await fetch("/api/people")
      if (response.ok) {
        const people = await response.json()
        const self = people.find((p: { is_user_self: boolean }) => p.is_user_self)
        setSelfProfile(self)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  useEffect(() => {
    fetchSelfProfile()
  }, [])

  const handleReOnboarding = () => {
    if (confirm(t('reOnboardingConfirm'))) {
      router.push("/onboarding")
    }
  }

  const handleEditProfile = () => {
    if (!selfProfile) return
    
    // Format birth_date to YYYY-MM-DD for date input
    let birthDate = ""
    if (selfProfile.birth_date) {
      if (typeof selfProfile.birth_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(selfProfile.birth_date)) {
        birthDate = selfProfile.birth_date
      } else {
        const dateStr = selfProfile.birth_date.toString()
        if (dateStr.includes('T')) {
          birthDate = dateStr.split('T')[0]
        } else {
          const parts = dateStr.split(/[-\/]/)
          if (parts.length === 3) {
            birthDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
          }
        }
      }
    }
    
    setFormData({
      name: selfProfile.name,
      birthDate: birthDate,
      birthTime: selfProfile.birth_time || "",
      birthLocation: selfProfile.birth_location || "",
      gender: selfProfile.gender || "",
      additionalInfo: selfProfile.additional_info || "",
      familyZodiac: selfProfile.family_zodiac || "",
      currentBusiness: selfProfile.current_business || "",
    })
    setEditDialogOpen(true)
  }
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selfProfile) return
    
    try {
      const response = await fetch(`/api/people/${selfProfile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        toast.success("Profile updated successfully")
        setEditDialogOpen(false)
        fetchSelfProfile()
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('account')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('name')}</p>
              <p className="text-sm text-muted-foreground">{user?.fullName || tCommon('notSet')}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('email')}</p>
              <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('memberSince')}</p>
              <p className="text-sm text-muted-foreground">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : tCommon('unknown')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('profile')}
          </CardTitle>
          <CardDescription>
            {t('profileDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selfProfile ? (
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium mb-1">{t('yourProfile')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('born')}: {new Date(selfProfile.birth_date).toLocaleDateString()}
                  {selfProfile.birth_time && ` at ${selfProfile.birth_time}`}
                </p>
                {selfProfile.birth_location && (
                  <p className="text-sm text-muted-foreground">
                    📍 {selfProfile.birth_location}
                  </p>
                )}
              </div>
              <Button onClick={handleEditProfile} variant="outline" className="w-full">
                <User className="mr-2 h-4 w-4" />
                {t('editProfile')}
              </Button>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('noProfileFound')}</AlertTitle>
              <AlertDescription>
                {t('noProfileDesc')}
                <Button onClick={handleReOnboarding} variant="link" className="p-0 h-auto ml-1">
                  {t('completeOnboarding')}
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Subscription (Future) */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current Plan</p>
                <p className="text-sm text-muted-foreground">Free Tier</p>
              </div>
            </div>
            <Button variant="outline" disabled className="w-full">
              Upgrade to Premium (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dataPrivacy')}</CardTitle>
          <CardDescription>{t('dataPrivacyDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full" onClick={() => router.push("/privacy")}>
            {t('viewPrivacy')}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push("/terms")}>
            {t('viewTerms')}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t('dangerZone')}</CardTitle>
          <CardDescription>{t('deleteAccountDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('deleteAccount')}</AlertTitle>
            <AlertDescription>
              {t('deleteAccountDesc')}
              <Button variant="destructive" className="mt-3 w-full" disabled>
                {t('deleteAccountButton')}
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        formData={formData}
        onFormDataChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
        onSubmit={handleUpdateProfile}
      />
    </div>
  )
}
