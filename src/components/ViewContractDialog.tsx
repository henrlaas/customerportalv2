
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ContractWithDetails, signContract } from '@/utils/contractUtils';
import { createPDF } from '@/utils/pdfUtils';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import SignaturePad from 'signature_pad';
import { Download, CheckCircle, XCircle, Edit } from 'lucide-react';

interface ViewContractDialogProps {
  contract: ContractWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onContractSigned?: () => void;
}

export function ViewContractDialog({ contract, isOpen, onClose, onContractSigned }: ViewContractDialogProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [showSignature, setShowSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
  
  // Check if the current user is the contact for this contract
  const isContractContact = user?.id === contract.contact?.user_id;
  
  // Check if the contract can be signed (is unsigned and user is the contact)
  const canSign = contract.status === 'unsigned' && isContractContact && profile?.role === 'client';
  
  useEffect(() => {
    // Initialize signature pad when canvas is shown
    if (showSignature && canvasRef.current) {
      const canvas = canvasRef.current;
      const signaturePad = new SignaturePad(canvas);
      setSignaturePad(signaturePad);
      
      // Make the signature pad responsive
      const resizeCanvas = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d')?.scale(ratio, ratio);
        signaturePad.clear(); // Clear the canvas after resize
      };
      
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [showSignature]);
  
  // Handle when signature is cleared
  const clearSignature = () => {
    if (signaturePad) {
      signaturePad.clear();
    }
  };
  
  // Mutation for signing contract
  const signContractMutation = useMutation({
    mutationFn: async () => {
      if (!signaturePad || !user || signaturePad.isEmpty()) {
        throw new Error('Signature is required');
      }
      
      const signatureDataUrl = signaturePad.toDataURL();
      return await signContract(contract.id, signatureDataUrl);
    },
    onSuccess: () => {
      toast({
        title: 'Contract signed',
        description: 'The contract has been successfully signed.',
      });
      setShowSignature(false);
      
      if (onContractSigned) {
        onContractSigned();
      }
      
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error signing contract',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const downloadContract = async () => {
    try {
      const companyName = contract.company?.name || 'Company';
      const filename = `${contract.template_type}_${companyName.replace(/\s+/g, '_')}.pdf`;
      
      await createPDF(contract.content, filename);
      
      toast({
        title: 'Download started',
        description: 'Your contract PDF is being generated.',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download the contract PDF.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contract.template_type} Contract
            {contract.status === 'signed' && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Signed
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Contract metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Company</p>
              <p>{contract.company?.name}</p>
            </div>
            <div>
              <p className="font-medium">Contact</p>
              <p>{`${contract.contact?.first_name || ''} ${contract.contact?.last_name || ''}`.trim() || 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium">Created</p>
              <p>{format(new Date(contract.created_at), 'MMM d, yyyy')}</p>
            </div>
            {contract.status === 'signed' && contract.signed_at && (
              <div>
                <p className="font-medium">Signed</p>
                <p>{format(new Date(contract.signed_at), 'MMM d, yyyy')}</p>
              </div>
            )}
          </div>
          
          {/* Contract content */}
          <div className="bg-white p-6 rounded-md border whitespace-pre-wrap">
            {contract.content}
          </div>
          
          {/* Signature section */}
          {contract.status === 'signed' && contract.signature_data && (
            <div className="border-t pt-4">
              <p className="font-medium mb-2">Signature:</p>
              <img 
                src={contract.signature_data} 
                alt="Signature" 
                className="max-h-32 border p-2 rounded"
              />
            </div>
          )}
          
          {/* Signature pad */}
          {showSignature && canSign && (
            <div className="space-y-4 border-t pt-4">
              <p className="font-medium">Sign here:</p>
              <canvas 
                ref={canvasRef} 
                className="border rounded-md w-full h-32 touch-none"
                style={{ touchAction: 'none' }}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={clearSignature}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="space-x-2 flex justify-between">
          <Button variant="outline" onClick={downloadContract}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          
          <div className="space-x-2">
            {canSign && !showSignature && (
              <Button onClick={() => setShowSignature(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Sign Contract
              </Button>
            )}
            
            {showSignature && canSign && (
              <Button 
                onClick={() => signContractMutation.mutate()}
                disabled={signaturePad?.isEmpty() || signContractMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {signContractMutation.isPending ? 'Signing...' : 'Complete Signing'}
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
