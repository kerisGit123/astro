'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, FileDown, Loader2, Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ReportActionsProps {
  predictionId: string
  reportElementId: string
  reportTitle: string
  translations?: {
    share?: string
    exportPdf?: string
    shareReport?: string
    shareDescription?: string
    expiryDays?: string
    days?: string
    generateLink?: string
    shareLink?: string
    copyLink?: string
    linkCopied?: string
  }
}

export function ReportActions({
  predictionId,
  reportElementId,
  reportTitle,
  translations = {}
}: ReportActionsProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [expiryDays, setExpiryDays] = useState('7')
  const [copied, setCopied] = useState(false)

  const t = {
    share: translations.share || 'Share',
    exportPdf: translations.exportPdf || 'Export PDF',
    shareReport: translations.shareReport || 'Share Report',
    shareDescription: translations.shareDescription || 'Generate a shareable link that expires after a set number of days',
    expiryDays: translations.expiryDays || 'Expiry Days',
    days: translations.days || 'days',
    generateLink: translations.generateLink || 'Generate Link',
    shareLink: translations.shareLink || 'Share Link',
    copyLink: translations.copyLink || 'Copy Link',
    linkCopied: translations.linkCopied || 'Link copied to clipboard!'
  }

  const handleExportPDF = () => {
    // Use browser's native print dialog instead of html2canvas to avoid color parsing issues
    window.print()
  }

  const handleGenerateShareLink = async () => {
    setIsSharing(true)
    try {
      const res = await fetch('/api/reports/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predictionId,
          expiryDays: parseInt(expiryDays)
        })
      })

      if (!res.ok) {
        throw new Error('Failed to generate share link')
      }

      const data = await res.json()
      setShareUrl(data.shareUrl)
      toast.success('Share link generated!')
    } catch (error) {
      console.error('Error generating share link:', error)
      toast.error('Failed to generate share link')
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success(t.linkCopied)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setShareDialogOpen(true)}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          {t.share}
        </Button>
        <Button
          variant="outline"
          onClick={handleExportPDF}
          className="gap-2"
        >
          <FileDown className="h-4 w-4" />
          {t.exportPdf}
        </Button>
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.shareReport}</DialogTitle>
            <DialogDescription>
              {t.shareDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!shareUrl ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="expiry">{t.expiryDays}</Label>
                  <Select value={expiryDays} onValueChange={setExpiryDays}>
                    <SelectTrigger id="expiry">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 {t.days}</SelectItem>
                      <SelectItem value="3">3 {t.days}</SelectItem>
                      <SelectItem value="7">7 {t.days}</SelectItem>
                      <SelectItem value="14">14 {t.days}</SelectItem>
                      <SelectItem value="30">30 {t.days}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerateShareLink}
                  disabled={isSharing}
                  className="w-full"
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    t.generateLink
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>{t.shareLink}</Label>
                  <div className="flex gap-2">
                    <Input value={shareUrl} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
