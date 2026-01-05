'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Sparkles, Users, Trash2, FileText, Star, Grid3x3, LayoutGrid, List, Search } from 'lucide-react'
import { ZodiacProgress } from '@/components/zodiac-progress'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import { useLocale, useTranslations } from 'next-intl'

interface Person {
  id: string
  name: string
  birth_date: string
  gender: string | null
}

interface ZodiacPrediction {
  id: string
  analysis_type: string
  result_data: {
    status: string
    westernZodiac?: {
      sign?: string
      element?: string
      coreTraits?: string[]
    }
    chineseZodiac?: {
      animal?: string
      element?: string
      coreCharacteristics?: string[]
    }
    combinedProfile?: {
      title?: string
      combinationName?: string
      combinationNumber?: string
      overview?: string
    }
  }
  person: {
    id: string
    name: string
    birth_date: string
  }
  created_at: string
}

export default function ZodiacAnalysisPage() {
  const router = useRouter()
  const { user } = useUser()
  const locale = useLocale()
  const t = useTranslations('zodiacAnalysis')
  
  const [people, setPeople] = useState<Person[]>([])
  const [predictions, setPredictions] = useState<ZodiacPrediction[]>([])
  const [selectedPersonId, setSelectedPersonId] = useState<string>('')
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingPredictions, setFetchingPredictions] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'card' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchPeople()
    fetchPredictions()
  }, [])

  useEffect(() => {
    if (selectedPersonId && people.length > 0) {
      const person = people.find(p => p.id === selectedPersonId)
      setSelectedPerson(person || null)
    } else {
      setSelectedPerson(null)
    }
  }, [selectedPersonId, people])

  const fetchPeople = async () => {
    try {
      const res = await fetch('/api/people/list')
      if (res.ok) {
        const data = await res.json()
        setPeople(data)
      }
    } catch (error) {
      console.error('Error fetching people:', error)
      toast.error('Failed to load people')
    }
  }

  const fetchPredictions = async () => {
    try {
      setFetchingPredictions(true)
      const res = await fetch('/api/predictions/list?analysisType=wczodiac')
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

  const getPersonCategory = (personId: string): string => {
    const person = people.find(p => p.id === personId)
    if (!person) return 'all'
    // This would come from person metadata - for now return 'all'
    // In a real implementation, you'd have a category field on the person object
    return 'all'
  }

  const filteredPredictions = predictions.filter(prediction => {
    const matchesSearch = prediction.person.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || getPersonCategory(prediction.person.id) === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatBirthdate = (dateString: string): string => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleAnalyze = async () => {
    if (!selectedPersonId || !selectedPerson) {
      toast.error('Please select a person')
      return
    }

    if (!selectedPerson.gender) {
      toast.error('Selected person must have gender information')
      return
    }

    setLoading(true)
    try {
      const payload = {
        language: locale || 'en',
        type: 'wczodiac',
        personId: selectedPerson.id,
        userId: user?.id || '',
        birthdate: formatBirthdate(selectedPerson.birth_date),
        gender: selectedPerson.gender,
        name: selectedPerson.name
      }

      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF || 
                         'https://n8n.srv1010007.hstgr.cloud/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f'

      const res = await fetch('/api/predictions/zodiac-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          webhookUrl: webhookUrl
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      const data = await res.json()
      
      toast.success('Zodiac analysis started! Processing your request...')
      
      await fetchPredictions()
      
      if (data.predictionId) {
        setTimeout(() => {
          router.push(`/dashboard/prediction-report/${data.predictionId}`)
        }, 2000)
      }
      
    } catch (error: unknown) {
      console.error('Error analyzing:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start analysis'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const viewReport = (predictionId: string) => {
    router.push(`/dashboard/prediction-report?id=${predictionId}`)
  }

  const deleteAnalysis = async (predictionId: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return
    
    try {
      const res = await fetch(`/api/predictions/${predictionId}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error('Failed to delete analysis')
      
      toast.success('Analysis deleted successfully')
      await fetchPredictions()
    } catch (error) {
      console.error('Error deleting analysis:', error)
      toast.error('Failed to delete analysis')
    }
  }

  const getZodiacEmoji = (sign?: string, animal?: string) => {
    const westernZodiacs: Record<string, string> = {
      '白羊座': '♈', 'Aries': '♈',
      '金牛座': '♉', 'Taurus': '♉',
      '双子座': '♊', 'Gemini': '♊',
      '巨蟹座': '♋', 'Cancer': '♋',
      '狮子座': '♌', 'Leo': '♌',
      '处女座': '♍', 'Virgo': '♍',
      '天秤座': '♎', 'Libra': '♎',
      '天蝎座': '♏', 'Scorpio': '♏',
      '射手座': '♐', 'Sagittarius': '♐',
      '摩羯座': '♑', 'Capricorn': '♑',
      '水瓶座': '♒', 'Aquarius': '♒',
      '双鱼座': '♓', 'Pisces': '♓'
    }
    
    const chineseZodiacs: Record<string, string> = {
      '鼠': '🐭', 'Rat': '🐭',
      '牛': '🐮', 'Ox': '🐮',
      '虎': '🐯', 'Tiger': '🐯',
      '兔': '🐰', 'Rabbit': '🐰',
      '龙': '🐲', 'Dragon': '🐲',
      '蛇': '🐍', 'Snake': '🐍',
      '马': '🐴', 'Horse': '🐴',
      '羊': '🐑', 'Goat': '🐑',
      '猴': '🐵', 'Monkey': '🐵',
      '鸡': '🐔', 'Rooster': '🐔',
      '狗': '🐶', 'Dog': '🐶',
      '猪': '🐷', 'Pig': '🐷'
    }
    
    const western = sign ? westernZodiacs[sign] || '' : ''
    const chinese = animal ? chineseZodiacs[animal] || '' : ''
    
    return { western, chinese }
  }

  return (
    <>
      <ZodiacProgress isLoading={loading} message="Analyzing zodiac signs... 🌟" />
      <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Star className="h-8 w-8 text-yellow-500" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* New Zodiac Analysis - Full Width */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t('newAnalysis')}
          </CardTitle>
          <CardDescription>
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="person">{t('selectPerson')}</Label>
              <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                <SelectTrigger id="person">
                  <SelectValue placeholder={t('choosePerson')} />
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} ({formatBirthdate(person.birth_date)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPerson && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Name:</span>
                    <span className="text-sm">{selectedPerson.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Birthdate:</span>
                    <span className="text-sm">{formatBirthdate(selectedPerson.birth_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Gender:</span>
                    <span className="text-sm">{selectedPerson.gender || 'Not specified'}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={handleAnalyze} 
              disabled={loading || !selectedPersonId}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('analyzing')}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('analyze')}
                </>
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/people')}
              className="w-full"
            >
              <Users className="mr-2 h-4 w-4" />
              Manage People
            </Button>
          </CardContent>
      </Card>

      {/* Previous Analyses - Full Width with Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>{t('previousAnalyses')}</CardTitle>
              <CardDescription>
                {t('subtitle')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchByName')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-6 w-full md:w-auto">
                <TabsTrigger value="all">{t('categories.all')}</TabsTrigger>
                <TabsTrigger value="self">{t('categories.self')}</TabsTrigger>
                <TabsTrigger value="family">{t('categories.family')}</TabsTrigger>
                <TabsTrigger value="friends">{t('categories.friends')}</TabsTrigger>
                <TabsTrigger value="business">{t('categories.business')}</TabsTrigger>
                <TabsTrigger value="team">{t('categories.team')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Results */}
            {fetchingPredictions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPredictions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery || categoryFilter !== 'all' ? t('noResults') : t('noAnalyses')}
              </p>
            ) : (
              <div className={viewMode === 'list' ? 'space-y-2' : viewMode === 'card' ? 'grid gap-4 md:grid-cols-2' : 'grid gap-4 md:grid-cols-2 lg:grid-cols-3'}>
                {filteredPredictions.map((prediction) => {
                  const zodiacs = getZodiacEmoji(
                    prediction.result_data?.westernZodiac?.sign,
                    prediction.result_data?.chineseZodiac?.animal
                  )
                  
                  return viewMode === 'list' ? (
                    <Card key={prediction.id} className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-2">
                              {zodiacs.western && <span className="text-xl">{zodiacs.western}</span>}
                              {zodiacs.chinese && <span className="text-xl">{zodiacs.chinese}</span>}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{prediction.person.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatBirthdate(prediction.person.birth_date)} • {prediction.result_data?.westernZodiac?.sign} • {prediction.result_data?.chineseZodiac?.animal}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                              prediction.result_data?.status === 'completed' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                              {prediction.result_data?.status || 'processing'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => viewReport(prediction.id)}
                              disabled={prediction.result_data?.status !== 'completed'}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteAnalysis(prediction.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card key={prediction.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header with Zodiac Icons */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {zodiacs.western && (
                                <span className="text-2xl" title={prediction.result_data?.westernZodiac?.sign}>
                                  {zodiacs.western}
                                </span>
                              )}
                              {zodiacs.chinese && (
                                <span className="text-2xl" title={prediction.result_data?.chineseZodiac?.animal}>
                                  {zodiacs.chinese}
                                </span>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              prediction.result_data?.status === 'completed' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                              {prediction.result_data?.status || 'processing'}
                            </span>
                          </div>

                          {/* Person Info */}
                          <div>
                            <p className="font-semibold text-lg">{prediction.person.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatBirthdate(prediction.person.birth_date)}
                            </p>
                          </div>

                          {/* Zodiac Signs */}
                          {(prediction.result_data?.westernZodiac || prediction.result_data?.chineseZodiac) && (
                            <div className="space-y-1">
                              {prediction.result_data?.westernZodiac?.sign && (
                                <p className="text-sm">
                                  <span className="font-medium">Western:</span> {prediction.result_data.westernZodiac.sign}
                                </p>
                              )}
                              {prediction.result_data?.chineseZodiac?.animal && (
                                <p className="text-sm">
                                  <span className="font-medium">Chinese:</span> {prediction.result_data.chineseZodiac.animal}
                                  {prediction.result_data.chineseZodiac.element && ` (${prediction.result_data.chineseZodiac.element})`}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Combined Profile Title */}
                          {prediction.result_data?.combinedProfile?.title && (
                            <p className="text-sm italic text-muted-foreground">
                              &quot;{prediction.result_data.combinedProfile.title}&quot;
                            </p>
                          )}

                          {/* Created Date */}
                          <p className="text-xs text-muted-foreground">
                            {formatBirthdate(new Date(prediction.created_at).toISOString().split('T')[0])} {new Date(prediction.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => viewReport(prediction.id)}
                              className="flex-1"
                              disabled={prediction.result_data?.status !== 'completed'}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View Report
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteAnalysis(prediction.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Zodiac Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">144 Unique Combinations</h3>
            <p className="text-sm text-muted-foreground">
              By combining 12 Western zodiac signs with 12 Chinese zodiac animals, we create 144 unique personality profiles. 
              Each combination offers deep insights into your character, strengths, weaknesses, and life path.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What You&apos;ll Discover</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Your Western zodiac sign and its characteristics</li>
              <li>Your Chinese zodiac animal and its traits</li>
              <li>How these two systems combine to create your unique personality</li>
              <li>Strengths and areas for personal growth</li>
              <li>Career guidance and life path insights</li>
              <li>Relationship patterns and compatibility</li>
              <li>Personalized advice for personal development</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  )
}
