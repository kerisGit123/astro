"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function ProfileForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Form state
    const [formData, setFormData] = useState({
        birthDate: "",
        birthTime: "",
        birthLocation: "",
        gender: "",
        zodiacSign: "" // Optional manual input or auto-calc later
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                // Determine Western Zodiac Sign (Basic logic or leave for backend)
                // For now, reloading page to fetch updated state
                window.location.reload()
            } else {
                console.error("Failed to save profile")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-lg mx-auto border-primary/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-primary text-2xl">Complete Your Profile</CardTitle>
                <CardDescription>
                    To generate your Destiny Charts, we need your precise birth details.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label>Date of Birth</Label>
                    <Input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleChange("birthDate", e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Time of Birth (Approximate is okay)</Label>
                    <Input
                        type="time"
                        value={formData.birthTime}
                        onChange={(e) => handleChange("birthTime", e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Birth Location (City, Country)</Label>
                    <Input
                        placeholder="e.g., Kuala Lumpur, Malaysia"
                        value={formData.birthLocation}
                        onChange={(e) => handleChange("birthLocation", e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Gender</Label>
                    <Select onValueChange={(val: string) => handleChange("gender", val)} value={formData.gender}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleSubmit} disabled={loading || !formData.birthDate || !formData.birthLocation}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save & Generate Charts
                </Button>
            </CardFooter>
        </Card>
    )
}
