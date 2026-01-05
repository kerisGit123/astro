"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, User, Heart, Briefcase, Users, Loader2, UserCircle, Sparkles, FileText, Power, PowerOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TopicSelector, type Topic } from "@/components/topic-selector"
import { ZodiacProgress } from "@/components/zodiac-progress"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface Person {
  id: string
  name: string
  birth_date: string
  birth_time?: string
  birth_location?: string
  gender?: string
  is_user_self: boolean
  relationship_type?: string
  label?: string
  additional_info?: string
  family_zodiac?: string
  current_business?: string
  is_active?: boolean
  category?: string
}

export default function PeoplePage() {
  const t = useTranslations('people')
  const tCommon = useTranslations('common')
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [showInactive, setShowInactive] = useState(false)
  const [analyzingPersonId, setAnalyzingPersonId] = useState<string | null>(null)
  const [topicDialogOpen, setTopicDialogOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    gender: "",
    relationshipType: "other",
    label: "",
    additionalInfo: "",
    familyZodiac: "",
    currentBusiness: "",
    isActive: true,
    category: "friend",
  })

  useEffect(() => {
    fetchPeople()
  }, [])

  const fetchPeople = async () => {
    try {
      const response = await fetch("/api/people")
      if (response.ok) {
        const data = await response.json()
        setPeople(data)
      }
    } catch (error) {
      console.error("Error fetching people:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if trying to create another 'self' profile
    if (!editingPerson && formData.relationshipType === 'self') {
      const hasSelf = people.some(p => p.is_user_self)
      if (hasSelf) {
        alert('You can only have one Self profile. Please edit the existing one.')
        return
      }
    }
    
    setLoading(true)

    try {
      const url = editingPerson ? `/api/people/${editingPerson.id}` : "/api/people"
      const method = editingPerson ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime || null,
          birthLocation: formData.birthLocation || null,
          gender: formData.gender || null,
          relationshipType: formData.relationshipType,
          label: formData.label || null,
          additionalInfo: formData.additionalInfo || null,
          familyZodiac: formData.familyZodiac || null,
          currentBusiness: formData.currentBusiness || null,
        }),
      })

      if (response.ok) {
        await fetchPeople()
        setDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving person:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return

    try {
      const response = await fetch(`/api/people/${id}`, { method: "DELETE" })
      if (response.ok) {
        await fetchPeople()
      }
    } catch (error) {
      console.error("Error deleting person:", error)
    }
  }

  const handleToggleActive = async (personId: string, currentIsActive: boolean) => {
    try {
      const response = await fetch('/api/people/toggle-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId, isActive: currentIsActive })
      })

      if (response.ok) {
        toast.success(currentIsActive ? t('deactivate') : t('activate'))
        await fetchPeople()
      } else {
        toast.error('Failed to update person status')
      }
    } catch (error) {
      console.error('Error toggling person active status:', error)
      toast.error('Failed to update person status')
    }
  }

  const handleEdit = (person: Person) => {
    setEditingPerson(person)
    // Format birth_date to YYYY-MM-DD for date input, avoiding timezone issues
    let birthDate = ""
    if (person.birth_date) {
      // If it's already in YYYY-MM-DD format, use it directly
      if (typeof person.birth_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(person.birth_date)) {
        birthDate = person.birth_date
      } else {
        // Parse as local date to avoid timezone shifts
        // Split the date string and construct YYYY-MM-DD directly
        const dateStr = person.birth_date.toString()
        if (dateStr.includes('T')) {
          // ISO format - extract date part only
          birthDate = dateStr.split('T')[0]
        } else {
          // Try parsing as date and format manually
          const parts = dateStr.split(/[-\/]/)
          if (parts.length === 3) {
            // Assume YYYY-MM-DD or YYYY/MM/DD
            birthDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
          } else {
            // Fallback to ISO split
            const date = new Date(person.birth_date)
            birthDate = date.toISOString().split('T')[0]
          }
        }
      }
    }
    setFormData({
      name: person.name,
      birthDate: birthDate,
      birthTime: person.birth_time || "",
      birthLocation: person.birth_location || "",
      gender: person.gender || "",
      relationshipType: person.relationship_type || "other",
      label: person.label || "",
      additionalInfo: person.additional_info || "",
      familyZodiac: person.family_zodiac || "",
      currentBusiness: person.current_business || "",
      isActive: person.is_active !== false,
      category: person.category || "friend",
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingPerson(null)
    setFormData({
      name: "",
      birthDate: "",
      birthTime: "",
      birthLocation: "",
      gender: "",
      relationshipType: "other",
      label: "",
      additionalInfo: "",
      familyZodiac: "",
      currentBusiness: "",
      isActive: true,
      category: "friend",
    })
  }

  const getRelationshipIcon = (type?: string) => {
    switch (type) {
      case "self":
        return <User className="h-4 w-4" />
      case "romantic_partner":
        return <Heart className="h-4 w-4" />
      case "business_partner":
        return <Briefcase className="h-4 w-4" />
      case "friend":
      case "family":
        return <Users className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRelationshipColor = (type?: string) => {
    switch (type) {
      case "self":
        return "bg-primary/10 text-primary border-primary/20"
      case "romantic_partner":
        return "bg-pink-500/10 text-pink-500 border-pink-500/20"
      case "business_partner":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "friend":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "family":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleAnalyze = (personId: string) => {
    setAnalyzingPersonId(personId)
    setTopicDialogOpen(true)
  }

  const handleTopicSelect = async () => {
    if (!analyzingPersonId || (!selectedTopic && !customPrompt)) {
      toast.error("Please select a topic or type your question")
      return
    }

    console.log('Starting analysis for person:', analyzingPersonId)
    console.log('Selected topic:', selectedTopic)
    console.log('Custom prompt:', customPrompt)

    try {
      setTopicDialogOpen(false)
      setIsAnalyzing(true)
      
      // Get current language from cookie
      const cookieLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1] || 'en'
      
      const response = await fetch(`/api/people/${analyzingPersonId}/reanalyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedTopic: selectedTopic || 'custom',
          topicPrompt: customPrompt,
          language: cookieLocale,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Analysis response:', result)
        toast.success(`Analysis started! 2 credits deducted. ${result.creditsRemaining || 0} credits remaining.`)
        setTopicDialogOpen(false)
        setAnalyzingPersonId(null)
        setSelectedTopic(null)
        setCustomPrompt('')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Analysis failed:', errorData)
        toast.error(errorData.error || "Failed to start analysis")
      }
    } catch (error) {
      console.error("Error starting analysis:", error)
      toast.error(error instanceof Error ? error.message : "Failed to start analysis")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleViewReport = (personId: string) => {
    router.push(`/dashboard/report?personId=${personId}`)
  }

  if (loading && people.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <ZodiacProgress isLoading={isAnalyzing} message="Analyzing destiny... 🔮" />
      <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('addPerson')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPerson ? t('editPerson') : t('addNewPerson')}</DialogTitle>
              <DialogDescription>
                {t('enterBirthInfo')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender (Optional)</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
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
                  onChange={(e) => setFormData({ ...formData, birthLocation: e.target.value })}
                  placeholder="City, Country"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="relationshipType">Relationship Type</Label>
                  <Select
                    value={formData.relationshipType}
                    onValueChange={(value) => setFormData({ ...formData, relationshipType: value })}
                  >
                    <SelectTrigger id="relationshipType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Self</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="romantic_partner">Romantic Partner</SelectItem>
                      <SelectItem value="business_partner">Business Partner</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Custom Label (Optional)</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g., My spouse, Co-founder"
                  />
                </div>
              </div>

              {editingPerson?.is_user_self && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">Life Events & Milestones (Optional)</Label>
                    <Input
                      id="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                      placeholder="e.g., 1992-1995 bullied, 1999-2000 study turning point"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="familyZodiac">Family Zodiac Animals (Optional)</Label>
                    <Input
                      id="familyZodiac"
                      value={formData.familyZodiac}
                      onChange={(e) => setFormData({ ...formData, familyZodiac: e.target.value })}
                      placeholder="e.g., father tiger, mother rabbit, wife ox"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentBusiness">Current Business/Career (Optional)</Label>
                    <Input
                      id="currentBusiness"
                      value={formData.currentBusiness}
                      onChange={(e) => setFormData({ ...formData, currentBusiness: e.target.value })}
                      placeholder="e.g., drink retail, software service"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    resetForm()
                  }}
                >
                  {tCommon('cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editingPerson ? "Update" : "Add"} Person</>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {people.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noPeople')}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t('noPeopleDesc')}
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addPerson')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList>
                <TabsTrigger value="all">{t('all')} ({people.filter(p => showInactive || p.is_active !== false).length})</TabsTrigger>
                <TabsTrigger value="self">Self ({people.filter(p => (showInactive || p.is_active !== false) && p.is_user_self).length})</TabsTrigger>
                <TabsTrigger value="family">Family ({people.filter(p => (showInactive || p.is_active !== false) && p.relationship_type === 'family').length})</TabsTrigger>
                <TabsTrigger value="friend">Friends ({people.filter(p => (showInactive || p.is_active !== false) && p.relationship_type === 'friend').length})</TabsTrigger>
                <TabsTrigger value="business">Business ({people.filter(p => (showInactive || p.is_active !== false) && p.relationship_type === 'business_partner').length})</TabsTrigger>
                <TabsTrigger value="team">Team ({people.filter(p => (showInactive || p.is_active !== false) && (p.category === 'team' || p.category === 'worker')).length})</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
              className="ml-4"
            >
              {showInactive ? <Power className="h-4 w-4 mr-2" /> : <PowerOff className="h-4 w-4 mr-2" />}
              {showInactive ? t('hideInactive') : t('showInactive')}
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          <TabsContent value="all" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {people.filter(p => showInactive || p.is_active !== false).map((person) => (
                <Card key={person.id} className={person.is_user_self ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {person.name}
                          {person.is_user_self && (
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              You
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>Born: {new Date(person.birth_date).toLocaleDateString()}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {person.is_active === false && (
                          <Badge variant="outline" className="bg-gray-500/10 text-gray-500">
                            {t('inactive')}
                          </Badge>
                        )}
                        <Badge variant="outline" className={getRelationshipColor(person.relationship_type)}>
                          <span className="flex items-center gap-1">
                            {getRelationshipIcon(person.relationship_type)}
                            <span className="text-xs">{person.label || person.relationship_type?.replace('_', ' ')}</span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAnalyze(person.id)}
                          className="flex-1"
                        >
                          <Sparkles className="h-4 w-4 mr-1" />
                          {t('analyze')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReport(person.id)}
                          className="flex-1"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          {t('viewReport')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(person)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!person.is_user_self && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(person.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Button
                        variant={person.is_active === false ? "outline" : "secondary"}
                        size="sm"
                        onClick={() => handleToggleActive(person.id, person.is_active !== false)}
                        className="w-full"
                      >
                        {person.is_active === false ? <PowerOff className="h-4 w-4 mr-2" /> : <Power className="h-4 w-4 mr-2" />}
                        {person.is_active === false ? t('activate') : t('deactivate')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {['self', 'family', 'friend', 'business'].map(category => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {people
                  .filter(p => {
                    if (category === 'self') return p.is_user_self
                    if (category === 'business') return p.relationship_type === 'business_partner'
                    return p.relationship_type === category
                  })
                  .map((person) => (
                    <Card key={person.id} className={person.is_user_self ? "border-primary" : ""}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              {person.name}
                              {person.is_user_self && (
                                <Badge variant="outline" className="bg-primary/10 text-primary">
                                  You
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>Born: {new Date(person.birth_date).toLocaleDateString()}</CardDescription>
                          </div>
                          <Badge variant="outline" className={getRelationshipColor(person.relationship_type)}>
                            <span className="flex items-center gap-1">
                              {getRelationshipIcon(person.relationship_type)}
                              <span className="text-xs">{person.label || person.relationship_type?.replace('_', ' ')}</span>
                            </span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAnalyze(person.id)}
                              className="flex-1"
                            >
                              <Sparkles className="h-4 w-4 mr-1" />
                              {t('analyze')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReport(person.id)}
                              className="flex-1"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              {t('viewReport')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(person)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {!person.is_user_self && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(person.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <Button
                            variant={person.is_active === false ? "outline" : "secondary"}
                            size="sm"
                            onClick={() => handleToggleActive(person.id, person.is_active !== false)}
                            className="w-full"
                          >
                            {person.is_active === false ? <PowerOff className="h-4 w-4 mr-2" /> : <Power className="h-4 w-4 mr-2" />}
                            {person.is_active === false ? t('activate') : t('deactivate')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        </>
      )}

      {/* Topic Selector Dialog */}
      <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Analysis Topic</DialogTitle>
            <DialogDescription>
              Choose a topic or type your specific question
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <TopicSelector
              selectedTopic={selectedTopic}
              onTopicChange={setSelectedTopic}
              customPrompt={customPrompt}
              onCustomPromptChange={setCustomPrompt}
              showLanguageSelector={false}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setTopicDialogOpen(false)}>
                {tCommon('cancel')}
              </Button>
              <Button onClick={handleTopicSelect} disabled={!selectedTopic && !customPrompt}>
                Start Analysis
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}
