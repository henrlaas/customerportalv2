
import { saveAs } from 'file-saver';

// Create a browser-compatible global
const createGlobal = () => {
  if (typeof window !== 'undefined') {
    // Make sure 'global' is defined for browser environment
    // This is needed for blob-stream which expects a Node.js environment
    (window as any).global = window;
  }
};

export async function createPDF(content: string, filename: string) {
  try {
    // Ensure global is defined before importing blob-stream
    createGlobal();
    
    console.log('PDF creation started');
    
    // Dynamically import pdfkit and blob-stream for client-side PDF generation
    const [PDFKitModule, blobStreamModule] = await Promise.all([
      import('pdfkit/js/pdfkit.standalone.js'),
      import('blob-stream')
    ]);
    
    console.log('Libraries loaded');
    
    const PDFDocument = PDFKitModule.default;
    const blobStream = blobStreamModule.default;
    
    // Create a document
    const doc = new PDFDocument({
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      },
      autoFirstPage: true // Ensure a page is created automatically
    });
    
    console.log('Document created');
    
    // Pipe its output to a blob
    const stream = doc.pipe(blobStream());
    
    console.log('Stream created');
    
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
    
    console.log('Content added to PDF');
    
    // Finalize the PDF
    doc.end();
    
    console.log('Document finalized');
    
    // Get the blob when it's ready
    return new Promise<void>((resolve, reject) => {
      stream.on('finish', () => {
        try {
          console.log('Stream finished');
          const blob = stream.toBlob('application/pdf');
          console.log('Blob created:', blob);
          saveAs(blob, filename);
          console.log('File saved');
          resolve();
        } catch (err) {
          console.error('Error in stream finish handler:', err);
          reject(err);
        }
      });
      
      stream.on('error', (err) => {
        console.error('Stream error:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error creating PDF:', error);
    throw error;
  }
}
