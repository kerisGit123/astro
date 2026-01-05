'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface SharedReport {
  prediction: {
    id: string
    analysis_type: string
    result_data: Record<string, unknown>
    person: {
      name: string
      birth_date: string
    }
    created_at: string
  }
  expiresAt: string
}

export default function SharedReportPage() {
  const params = useParams()
  const token = params.token as string
  const [report, setReport] = useState<SharedReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSharedReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const fetchSharedReport = async () => {
    try {
      const res = await fetch(`/api/reports/shared/${token}`)
      
      if (!res.ok) {
        if (res.status === 404) {
          setError('This shared report link is invalid or has expired.')
        } else {
          setError('Failed to load report.')
        }
        return
      }

      const data = await res.json()
      setReport(data)
    } catch (err) {
      console.error('Error fetching shared report:', err)
      setError('Failed to load report.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Report Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render the report based on analysis type
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-4 text-sm text-muted-foreground">
        This is a shared report. Link expires on {new Date(report.expiresAt).toLocaleDateString()}
      </div>
      
      {/* Render report content based on type */}
      <div>
        <h1 className="text-3xl font-bold mb-4">
          {report.prediction.analysis_type === 'wczodiac' ? 'Zodiac Analysis Report' : 
           report.prediction.analysis_type === 'monthly' ? 'Monthly Prediction Report' :
           report.prediction.analysis_type === 'yearly' ? 'Yearly Prediction Report' :
           'Analysis Report'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {report.prediction.person.name} • Generated on {new Date(report.prediction.created_at).toLocaleDateString()}
        </p>

        {/* Report content will be rendered here based on type */}
        <Card>
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(report.prediction.result_data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
