import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface PDFExportOptions {
  filename?: string
  quality?: number
  scale?: number
}

/**
 * Export a DOM element to PDF
 * @param element - The HTML element to export
 * @param options - Export options
 */
export async function exportToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'report.pdf',
    quality = 0.95,
    scale = 2
  } = options

  try {
    // Capture the element as canvas with grayscale conversion
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      foreignObjectRendering: false,
      imageTimeout: 0,
      removeContainer: true,
      onclone: (clonedDoc) => {
        // Force grayscale colors on all elements for better PDF compatibility
        const allElements = clonedDoc.querySelectorAll('*')
        allElements.forEach((el: Element) => {
          const htmlEl = el as HTMLElement
          const computedStyle = window.getComputedStyle(el)
          
          // Convert colors to grayscale
          const color = computedStyle.color
          const bgColor = computedStyle.backgroundColor
          
          // Set safe grayscale colors
          if (color && color !== 'rgba(0, 0, 0, 0)') {
            htmlEl.style.color = '#000000' // Black text
          }
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
            // Keep white backgrounds, convert others to light gray
            if (bgColor.includes('255, 255, 255') || bgColor === 'white') {
              htmlEl.style.backgroundColor = '#ffffff'
            } else {
              htmlEl.style.backgroundColor = '#f5f5f5' // Light gray
            }
          }
          
          // Remove problematic CSS properties
          htmlEl.style.boxShadow = 'none'
          htmlEl.style.textShadow = 'none'
        })
        
        // Remove all style tags that might have unsupported color functions
        const styleTags = clonedDoc.querySelectorAll('style')
        styleTags.forEach(style => style.remove())
      }
    })

    const imgData = canvas.toDataURL('image/png', quality)
    
    // Calculate PDF dimensions
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    let position = 0

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

    // Save the PDF
    pdf.save(filename)
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    throw new Error('Failed to export PDF')
  }
}

/**
 * Generate a unique share token
 */
export function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36)
}

/**
 * Calculate expiration date
 * @param days - Number of days until expiration
 */
export function getExpirationDate(days: number = 7): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}
