
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

// Create a more comprehensive browser-compatible environment for blob-stream and pdfkit
const createBrowserCompatibleEnvironment = () => {
  if (typeof window !== 'undefined') {
    // Create a robust polyfill for 'util.inherits' which blob-stream uses
    // Some libraries access it directly, others via a 'U' object
    const inheritsFunction = function(ctor: any, superCtor: any) {
      // Simple inheritance polyfill
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    };
    
    // Add inherits to multiple possible locations
    (window as any).util = {
      inherits: inheritsFunction
    };
    
    // Some libraries may access it as U.inherits
    (window as any).U = {
      inherits: inheritsFunction
    };
    
    // Make sure 'global' is defined for browser environment
    (window as any).global = window;
    
    // Some modules expect process.nextTick
    (window as any).process = (window as any).process || {};
    (window as any).process.nextTick = (window as any).process.nextTick || setTimeout;
  }
};

export async function createPDF(content: string, filename: string) {
  try {
    // Set up the browser environment before importing any modules
    createBrowserCompatibleEnvironment();
    
    toast.info('Preparing PDF...', {
      description: 'Starting PDF generation'
    });
    
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
          
          // Sanitize filename to avoid special characters
          const sanitizedFilename = filename.replace(/[^\w.-]/gi, '_');
          
          saveAs(blob, sanitizedFilename);
          console.log('File saved as:', sanitizedFilename);
          
          toast.success('PDF Generated', {
            description: 'Your contract PDF has been downloaded'
          });
          
          resolve();
        } catch (err) {
          console.error('Error in stream finish handler:', err);
          
          toast.error('Download Failed', {
            description: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
          });
          
          reject(err);
        }
      });
      
      stream.on('error', (err) => {
        console.error('Stream error:', err);
        
        toast.error('PDF Generation Failed', {
          description: `Stream error: ${err.message || 'Unknown error'}`
        });
        
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error creating PDF:', error);
    
    toast.error('PDF Creation Failed', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    
    throw error;
  }
}
