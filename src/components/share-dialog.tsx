"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Share2, Copy, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ShareDialogProps {
  personId: string
}

interface ShareLink {
  id: string
  token: string
  expires_at: string
  created_at: string
}

export function ShareDialog({ personId }: ShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [expiryDays, setExpiryDays] = useState("3")
  const [loading, setLoading] = useState(false)
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([])
  const [generatedUrl, setGeneratedUrl] = useState("")

  useEffect(() => {
    if (open) {
      fetchShareLinks()
    }
  }, [open])

  const fetchShareLinks = async () => {
    try {
      const response = await fetch(`/api/share-links?personId=${personId}`)
      if (response.ok) {
        const data = await response.json()
        setShareLinks(data.shareLinks || [])
      }
    } catch (error) {
      console.error("Error fetching share links:", error)
    }
  }

  const createShareLink = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId,
          expiryDays: parseInt(expiryDays)
        })
      })

      if (response.ok) {
        const data = await response.json()
        const fullUrl = `${window.location.origin}/share/${data.shareLink.token}`
        setGeneratedUrl(fullUrl)
        toast.success("Share link created!")
        fetchShareLinks()
      } else {
        toast.error("Failed to create share link")
      }
    } catch (error) {
      console.error("Error creating share link:", error)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard!")
  }

  const revokeAllLinks = async () => {
    if (!confirm("Are you sure you want to revoke all share links?")) return

    try {
      const response = await fetch(`/api/share-links?personId=${personId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("All share links revoked")
        setShareLinks([])
        setGeneratedUrl("")
      } else {
        toast.error("Failed to revoke links")
      }
    } catch (error) {
      console.error("Error revoking links:", error)
      toast.error("An error occurred")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            Create a shareable link with expiry
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Expiry</label>
            <Select value={expiryDays} onValueChange={setExpiryDays}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={createShareLink} disabled={loading} className="w-full">
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
            ) : (
              <><Share2 className="mr-2 h-4 w-4" />Create Share Link</>
            )}
          </Button>

          {generatedUrl && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generatedUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(generatedUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {shareLinks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Active Share Links</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={revokeAllLinks}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Revoke All
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {shareLinks.map((link) => (
                  <div key={link.id} className="p-2 bg-muted rounded text-xs">
                    <p className="font-mono text-xs break-all">
                      {`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${link.token}`}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Expires: {new Date(link.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {shareLinks.length === 0 && !generatedUrl && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active share links
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
