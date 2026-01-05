'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Sparkles, TrendingUp, Eye, Trash2, RefreshCw, Users } from 'lucide-react'
import { ZodiacProgress } from '@/components/zodiac-progress'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface Person {
  id: string
  name: string
  birth_date: string
}

interface Prediction {
  id: string
  analysis_type: string
  target_month: string
  life_focus: string | null
  result_data: {
    status: string
  }
  person: {
    id: string
    name: string
    birth_date: string
  }
  created_at: string
}

export default function MonthlyPredictionPage() {
  const router = useRouter()
  const t = useTranslations('monthlyPrediction')
  
  const [people, setPeople] = useState<Person[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [selectedPersonId, setSelectedPersonId] = useState<string>('')
  const [targetMonth, setTargetMonth] = useState<string>('')
  const [lifeFocus, setLifeFocus] = useState<string>('')
  const [currentConcern, setCurrentConcern] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [fetchingPredictions, setFetchingPredictions] = useState(true)

  useEffect(() => {
    fetchPeople()
    fetchPredictions()
    
    // Set default target month to current month
    const now = new Date()
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setTargetMonth(defaultMonth)
  }, [])

  const fetchPeople = async () => {
    try {
      const res = await fetch('/api/people/list')
      if (res.ok) {
        const data = await res.json()
        setPeople(data)
      }
    } catch (error) {
      console.error('Error fetching people:', error)
    }
  }

  const fetchPredictions = async () => {
    try {
      setFetchingPredictions(true)
      const res = await fetch('/api/predictions/list?analysisType=monthly')
      if (res.ok) {
        const data = await res.json()
        setPredictions(data)
      }
    } catch (error) {
      console.error('Error fetching predictions:', error)
    } finally {
      setFetchingPredictions(false)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedPersonId || !targetMonth) {
      toast.error('Please select a person and target month')
      return
    }

    setLoading(true)
    try {
      // Get user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      
      const res = await fetch('/api/predictions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId: selectedPersonId,
          analysisType: 'monthly',
          targetMonth,
          timezone: userTimezone,
          lifeFocus: lifeFocus && lifeFocus !== 'none' ? lifeFocus : undefined,
          currentConcern: currentConcern || undefined,
          language: 'zh'
        })
      })

      if (res.ok) {
        await res.json()
        toast.success('Your monthly prediction is being generated. Please wait...')
        
        // Refresh predictions list
        setTimeout(() => {
          fetchPredictions()
        }, 2000)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to start analysis')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to start analysis')
    } finally {
      setLoading(false)
    }
  }

  const handleViewPrediction = (id: string) => {
    router.push(`/dashboard/prediction-report?id=${id}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prediction?')) return

    try {
      const res = await fetch(`/api/predictions/${id}/delete`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Prediction deleted successfully')
        fetchPredictions()
      } else {
        toast.error('Failed to delete prediction')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete prediction')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  return (
    <>
      <ZodiacProgress isLoading={loading} message="Analyzing monthly prediction... 🌙" />
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t('newPrediction')}
          </CardTitle>
          <CardDescription>
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Person Selection */}
            <div className="space-y-2">
              <Label>{t('selectPerson')}</Label>
              <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('choosePerson')} />
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {person.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Month */}
            <div className="space-y-2">
              <Label>{t('targetMonth')}</Label>
              <Input
                type="month"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
              />
            </div>
          </div>

          {/* Life Focus (Optional) */}
          <div className="space-y-2">
            <Label>{t('lifeFocus')}</Label>
            <Select value={lifeFocus} onValueChange={setLifeFocus}>
              <SelectTrigger>
                <SelectValue placeholder="Select focus area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="career">Career</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="friend">Friendship</SelectItem>
                <SelectItem value="team">Team/Work</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Concern (Optional) */}
          <div className="space-y-2">
            <Label>{t('currentConcern')}</Label>
            <Textarea
              placeholder={t('concernPlaceholder')}
              value={currentConcern}
              onChange={(e) => setCurrentConcern(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !selectedPersonId || !targetMonth}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {t('analyzing')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t('analyze')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Previous Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('previousPredictions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fetchingPredictions ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('loading')}
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('noPredictions')}
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((prediction) => (
                <div
                  key={prediction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{prediction.person.name}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {formatMonth(prediction.target_month)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Created: {formatDate(prediction.created_at)}</span>
                      {prediction.life_focus && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{prediction.life_focus}</span>
                        </>
                      )}
                      {prediction.result_data.status === 'pending' && (
                        <>
                          <span>•</span>
                          <span className="text-yellow-600">Processing...</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPrediction(prediction.id)}
                      disabled={prediction.result_data.status === 'pending'}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t('viewReport')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(prediction.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  )
}
