"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, Lock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SharedReport {
  person_name: string
  analysis: any
  expires_at: string
  view_count: number
}

export default function SharedReportPage() {
  const params = useParams()
  const token = params.token as string
  const [report, setReport] = useState<SharedReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSharedReport()
  }, [token])

  const fetchSharedReport = async () => {
    try {
      const response = await fetch(`/api/shared/${token}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("This report link is invalid or has expired.")
        } else {
          setError("Failed to load report.")
        }
        return
      }

      const data = await response.json()
      setReport(data)
    } catch (err) {
      console.error("Error fetching shared report:", err)
      setError("An error occurred while loading the report.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <Lock className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                {error || "This report is not available."}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  const analysis = report.analysis
  const expiresAt = new Date(report.expires_at)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Destiny Analysis Report</h1>
            <p className="text-muted-foreground">
              {report.person_name} • Shared Report
            </p>
          </div>
          <div className="text-right">
            <Badge variant="outline">Public View</Badge>
            <p className="text-sm text-muted-foreground mt-1">
              Expires: {expiresAt.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Report Content - Same as main report but read-only */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Life Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {analysis.overall_structure}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Five Elements Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analysis.five_elements).map(([element, value]: [string, any]) => (
                <div key={element} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{element}</span>
                  <span className="text-sm text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Major Luck Cycles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.major_luck_cycles.map((cycle: any, index: number) => (
              <div key={index} className="border-l-2 border-primary pl-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{cycle.ageRange}</Badge>
                  <span className="text-sm font-medium">{cycle.luckType}</span>
                </div>
                <p className="text-sm text-muted-foreground">{cycle.keyEvents}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Shared Report</AlertTitle>
          <AlertDescription>
            This is a read-only view. For full interactive features and personalized analysis,
            please sign up for your own account.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
