
// Import dynamically to prevent 'require' errors in the browser
import { saveAs } from 'file-saver';

export async function createPDF(content: string, filename: string) {
  try {
    // Dynamically import pdfkit and blob-stream for client-side PDF generation
    const [PDFKitModule, blobStreamModule] = await Promise.all([
      import('pdfkit/js/pdfkit.standalone.js'),
      import('blob-stream')
    ]);
    
    const PDFDocument = PDFKitModule.default;
    const blobStream = blobStreamModule.default;
    
    // Create a document
    const doc = new PDFDocument({
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });
    
    // Pipe its output to a blob
    const stream = doc.pipe(blobStream());
    
    // Add content
    const paragraphs = content.split('\n');
    
    let currentY = 50;
    const pageHeight = 792 - 100; // Letter size minus margins
    const lineHeight = 14;
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        currentY += lineHeight;
        
        // Check if we need a new page
        if (currentY > pageHeight) {
          doc.addPage();
          currentY = 50;
        }
        continue;
      }
      
      // Check if it's a heading (starts with #)
      if (paragraph.startsWith('#')) {
        const headingText = paragraph.replace(/^#+\s/, '');
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text(headingText, 50, currentY);
        currentY += 24;
      } else {
        doc.fontSize(12).font('Helvetica');
        doc.text(paragraph, {
          width: 500,
          align: 'left'
        });
        currentY += doc.heightOfString(paragraph, { width: 500 }) + 5;
      }
      
      // Check if we need a new page
      if (currentY > pageHeight) {
        doc.addPage();
        currentY = 50;
      }
    }
    
    // If there's signature data, add it
    if (content.includes('Signatur') && content.includes('_______')) {
      doc.fontSize(12).text('Signed electronically', 50, currentY + 20);
    }
    
    // Finalize the PDF
    doc.end();
    
    // Get the blob when it's ready
    return new Promise<void>((resolve, reject) => {
      stream.on('finish', () => {
        const blob = stream.toBlob('application/pdf');
        saveAs(blob, filename);
        resolve();
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error creating PDF:', error);
    throw error;
  }
}
