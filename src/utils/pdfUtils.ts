
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

// Create a complete browser-compatible environment for pdfkit and blob-stream
const createBrowserCompatibleEnvironment = () => {
  if (typeof window !== 'undefined') {
    console.log('Setting up browser environment for PDF generation');
    
    // Create a comprehensive inherits function
    const inheritsFunction = function(ctor: any, superCtor: any) {
      ctor.super_ = superCtor;
      const tempObj = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      
      // Use Object.setPrototypeOf if available for better compatibility
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(ctor.prototype, tempObj);
      } else {
        ctor.prototype = Object.create(superCtor.prototype);
        ctor.prototype.constructor = ctor;
      }
    };
    
    // Ensure all possible variations of util.inherits are defined
    (window as any).util = (window as any).util || {};
    (window as any).util.inherits = inheritsFunction;
    
    // Define it on U object as well (blob-stream sometimes looks for U.inherits)
    (window as any).U = (window as any).U || {};
    (window as any).U.inherits = inheritsFunction;
    
    // Make global available (used by some Node-based libraries)
    (window as any).global = window;
    
    // Set up process for nextTick (used by some async operations)
    (window as any).process = (window as any).process || {
      env: { NODE_ENV: 'production' },
      nextTick: function(fn: Function) { setTimeout(fn, 0); },
      browser: true
    };
    
    // Provide fallbacks for Node.js Buffer if needed
    if (typeof (window as any).Buffer === 'undefined') {
      (window as any).Buffer = {
        isBuffer: function() { return false; }
      };
    }
    
    // Setup basic stream implementations if needed
    (window as any).stream = (window as any).stream || {
      Writable: function() {}
    };
    
    console.log('Browser environment setup completed');
  }
};

export async function createPDF(content: string, filename: string) {
  try {
    console.log('PDF creation started');
    
    // Set up the browser environment before importing modules
    createBrowserCompatibleEnvironment();
    
    toast.info('Preparing PDF...', {
      description: 'Starting PDF generation'
    });
    
    // Dynamically import pdfkit and blob-stream with better error handling
    const PDFKitModule = await import('pdfkit/js/pdfkit.standalone.js')
      .catch(err => {
        console.error('Error loading PDFKit:', err);
        throw new Error('Failed to load PDF generation library');
      });
    
    const blobStreamModule = await import('blob-stream')
      .catch(err => {
        console.error('Error loading blob-stream:', err);
        throw new Error('Failed to load PDF streaming library');
      });
    
    console.log('Libraries loaded successfully');
    
    const PDFDocument = PDFKitModule.default;
    const blobStream = blobStreamModule.default;
    
    if (!PDFDocument) {
      throw new Error('PDFDocument not available');
    }
    
    if (!blobStream) {
      throw new Error('blobStream not available');
    }
    
    // Create a document with error handling
    const doc = new PDFDocument({
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      },
      autoFirstPage: true
    });
    
    // Pipe its output to a blob stream
    const stream = doc.pipe(blobStream());
    
    console.log('Document and stream created');
    
    // Add content
    const paragraphs = content.split('\n');
    
    let currentY = 50;
    const pageHeight = 792 - 100; // Letter size minus margins
    const lineHeight = 14;
    
    // Add title
    doc.fontSize(18).font('Helvetica-Bold');
    doc.text('CONTRACT', { align: 'center' });
    currentY += 30;
    
    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 20;
    
    // Process each paragraph with better formatting
    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        currentY += lineHeight;
        
        if (currentY > pageHeight) {
          doc.addPage();
          currentY = 50;
        }
        continue;
      }
      
      // Check if it's a heading
      if (paragraph.startsWith('#')) {
        const headingLevel = paragraph.match(/^#+/)?.[0].length || 1;
        const headingText = paragraph.replace(/^#+\s/, '');
        
        // Set font size based on heading level
        const fontSize = 20 - (headingLevel * 2);
        doc.fontSize(fontSize).font('Helvetica-Bold');
        doc.text(headingText, 50, currentY);
        currentY += fontSize + 10;
      } else {
        doc.fontSize(12).font('Helvetica');
        const textHeight = doc.heightOfString(paragraph, { width: 500 });
        
        // Check if we need a new page before adding this paragraph
        if (currentY + textHeight > pageHeight) {
          doc.addPage();
          currentY = 50;
        }
        
        doc.text(paragraph, 50, currentY, {
          width: 500,
          align: 'left'
        });
        
        currentY += textHeight + 5;
      }
      
      // Check if we need a new page
      if (currentY > pageHeight) {
        doc.addPage();
        currentY = 50;
      }
    }
    
    // Add footer with page numbers
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(10).font('Helvetica');
      doc.text(
        `Page ${i + 1} of ${totalPages}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
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
          console.log('Blob created, size:', blob.size);
          
          // Sanitize filename to avoid special characters
          const sanitizedFilename = filename.replace(/[^\w.-]/gi, '_');
          if (!sanitizedFilename.endsWith('.pdf')) {
            sanitizedFilename += '.pdf';
          }
          
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
