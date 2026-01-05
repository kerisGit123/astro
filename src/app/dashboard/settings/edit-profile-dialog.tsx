"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: {
    name: string
    birthDate: string
    birthTime: string
    birthLocation: string
    gender: string
    additionalInfo: string
    familyZodiac: string
    currentBusiness: string
  }
  onFormDataChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function EditProfileDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
}: EditProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Enter birth information to generate charts and compatibility analysis
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormDataChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => onFormDataChange("birthDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthTime">Birth Time (Optional)</Label>
              <Input
                id="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={(e) => onFormDataChange("birthTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender (Optional)</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => onFormDataChange("gender", value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthLocation">Birth Location (Optional)</Label>
            <Input
              id="birthLocation"
              value={formData.birthLocation}
              onChange={(e) => onFormDataChange("birthLocation", e.target.value)}
              placeholder="e.g., New York, USA"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Life Events & Milestones (Optional)</Label>
            <Input
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => onFormDataChange("additionalInfo", e.target.value)}
              placeholder="e.g., 1992-1995 bullied, 1999-2000 study turning point"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="familyZodiac">Family Zodiac Animals (Optional)</Label>
            <Input
              id="familyZodiac"
              value={formData.familyZodiac}
              onChange={(e) => onFormDataChange("familyZodiac", e.target.value)}
              placeholder="e.g., father tiger, mother rabbit"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentBusiness">Current Business/Career (Optional)</Label>
            <Input
              id="currentBusiness"
              value={formData.currentBusiness}
              onChange={(e) => onFormDataChange("currentBusiness", e.target.value)}
              placeholder="e.g., software engineer, restaurant owner"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Update Profile
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
