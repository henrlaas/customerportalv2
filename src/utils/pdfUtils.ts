
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfMake with the fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export async function createPDF(content: string, filename: string) {
  try {
    console.log('PDF creation started');
    
    toast.info('Preparing PDF...', {
      description: 'Starting PDF generation'
    });

    // Sanitize filename to avoid special characters
    let sanitizedFilename = filename.replace(/[^\w.-]/gi, '_');
    if (!sanitizedFilename.endsWith('.pdf')) {
      sanitizedFilename += '.pdf';
    }
    
    // Split content into paragraphs
    const paragraphs = content.split('\n');
    
    // Create document definition for pdfMake
    const documentDefinition = {
      content: [
        { text: 'CONTRACT', style: 'header', alignment: 'center' },
        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2*40, y2: 5, lineWidth: 1 }] },
        { text: ' ', margin: [0, 10, 0, 0] }, // Spacer
        ...paragraphs.map(paragraph => {
          if (!paragraph.trim()) {
            return { text: ' ' }; // Empty line
          }
          
          // Check if it's a heading
          if (paragraph.startsWith('#')) {
            const headingLevel = paragraph.match(/^#+/)?.[0].length || 1;
            const headingText = paragraph.replace(/^#+\s/, '');
            
            return {
              text: headingText,
              style: `heading${headingLevel}`,
              margin: [0, 10, 0, 5]
            };
          }
          
          return { text: paragraph, margin: [0, 5, 0, 0] };
        })
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 20]
        },
        heading1: {
          fontSize: 16,
          bold: true,
        },
        heading2: {
          fontSize: 14,
          bold: true,
        },
        heading3: {
          fontSize: 12,
          bold: true,
        }
      },
      footer: function(currentPage: number, pageCount: number) {
        return {
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: 'center',
          margin: [0, 10, 0, 0]
        };
      },
      pageMargins: [40, 60, 40, 60],
    };
    
    // If there's signature data, add it
    if (content.includes('Signatur') && content.includes('_______')) {
      (documentDefinition.content as any).push({ 
        text: 'Signed electronically', 
        margin: [0, 20, 0, 0],
        fontSize: 12
      });
    }
    
    // Create PDF
    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
    
    // Download PDF
    pdfDocGenerator.download(sanitizedFilename);
    
    toast.success('PDF Generated', {
      description: 'Your contract PDF has been downloaded'
    });
    
  } catch (error) {
    console.error('Error creating PDF:', error);
    
    toast.error('PDF Creation Failed', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    
    throw error;
  }
}
