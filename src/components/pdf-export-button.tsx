"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface PDFExportButtonProps {
  personName: string
}

export function PDFExportButton({ personName }: PDFExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const exportToPDF = async () => {
    setExporting(true)
    toast.info("Generating PDF...")

    try {
      // Get the report content
      const element = document.getElementById('report-content')
      if (!element) {
        toast.error("Report content not found")
        return
      }

      // Create canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0a0a0a', // Dark background to match theme
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      })

      // Calculate PDF dimensions
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Save PDF
      const fileName = `${personName}_Destiny_Analysis_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)

      toast.success("PDF exported successfully!")
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast.error("Failed to export PDF")
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button onClick={exportToPDF} disabled={exporting} variant="outline">
      {exporting ? (
        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exporting...</>
      ) : (
        <><FileDown className="h-4 w-4 mr-2" />Export PDF</>
      )}
    </Button>
  )
}
