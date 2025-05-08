
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ContractWithDetails, signContract } from '@/utils/contractUtils';
import { createPDF } from '@/utils/pdfUtils';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import SignaturePad from 'signature_pad';
import { Download, CheckCircle, XCircle, Edit, FileText, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const [showContract, setShowContract] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
  
  // Check if the current user is the contact for this contract
  const isContractContact = user?.id === contract.contact?.user_id;
  
  // Check if the contract can be signed (is unsigned and user is the contact)
  const canSign = contract.status === 'unsigned' && isContractContact && profile?.role === 'client';
  
  useEffect(() => {
    // Reset the state when the dialog is opened
    if (isOpen) {
      setShowContract(false);
    }
  }, [isOpen]);
  
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
      setIsDownloading(true);
      
      const companyName = contract.company?.name || 'Company';
      // Sanitize filename to avoid special characters
      const sanitizedCompanyName = companyName.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
      const filename = `${contract.template_type}_${sanitizedCompanyName}.pdf`;
      
      toast({
        title: 'Preparing PDF',
        description: 'Starting PDF generation...',
      });
      
      await createPDF(contract.content, filename);
      
      toast({
        title: 'PDF Generated',
        description: 'Your contract PDF has been downloaded.',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download the contract PDF. Please check the console for details.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Helper function to get initials for avatar fallback
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <DialogTitle className="text-xl">
                {contract.template_type} Contract
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Contract metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md shadow-sm">
            <div>
              <p className="text-sm text-gray-500 mb-1">Company</p>
              <p className="font-medium">{contract.company?.name || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <Badge 
                variant={contract.status === 'signed' ? "default" : "outline"} 
                className={contract.status === 'signed' 
                  ? "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800 inline-flex items-center gap-1"
                  : "bg-amber-100 text-amber-800 hover:bg-amber-200 hover:text-amber-800 inline-flex items-center gap-1"
                }
              >
                {contract.status === 'signed' ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>Signed</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    <span>Unsigned</span>
                  </>
                )}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Contact</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage 
                    src={contract.contact?.avatar_url || undefined} 
                    alt={`${contract.contact?.first_name || ''} ${contract.contact?.last_name || ''}`} 
                  />
                  <AvatarFallback>
                    {getInitials(contract.contact?.first_name, contract.contact?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium">{`${contract.contact?.first_name || ''} ${contract.contact?.last_name || ''}`.trim() || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Created By</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage 
                    src={contract.creator?.avatar_url || undefined} 
                    alt={`${contract.creator?.first_name || ''} ${contract.creator?.last_name || ''}`} 
                  />
                  <AvatarFallback>
                    {getInitials(contract.creator?.first_name, contract.creator?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium">{`${contract.creator?.first_name || ''} ${contract.creator?.last_name || ''}`.trim() || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Created</p>
              <p className="font-medium">{format(new Date(contract.created_at), 'MMM d, yyyy')}</p>
            </div>
            
            {contract.status === 'signed' && contract.signed_at && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Signed</p>
                <p className="font-medium">{format(new Date(contract.signed_at), 'MMM d, yyyy')}</p>
              </div>
            )}
          </div>
          
          {/* Button row for actions */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setShowContract(!showContract)}
              className="flex items-center gap-2"
              variant={showContract ? "secondary" : "default"}
            >
              <Eye className="h-4 w-4" />
              {showContract ? 'Hide Contract' : 'Open Contract'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={downloadContract}
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </Button>
            
            {canSign && !showSignature && !contract.signature_data && (
              <Button 
                onClick={() => setShowSignature(true)}
                className="flex items-center gap-2 ml-auto"
                variant="default"
              >
                <Edit className="h-4 w-4" />
                Sign Contract
              </Button>
            )}
          </div>
          
          {/* Contract content - only shown when showContract is true */}
          {showContract && (
            <div className="bg-white p-6 rounded-md border shadow-sm whitespace-pre-wrap">
              <div className="prose max-w-none">
                {contract.content}
              </div>
            </div>
          )}
          
          {/* Signature display section */}
          {contract.status === 'signed' && contract.signature_data && (
            <>
              <Separator />
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-3 text-gray-700">Signature</h4>
                <div className="flex justify-center bg-white border p-4 rounded-md">
                  <img 
                    src={contract.signature_data} 
                    alt="Signature" 
                    className="max-h-32"
                  />
                </div>
              </div>
            </>
          )}
          
          {/* Signature pad */}
          {showSignature && canSign && (
            <>
              <Separator />
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-medium mb-3 text-gray-700">Sign here:</h4>
                <div className="bg-white border rounded-md p-2">
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-32 touch-none"
                    style={{ touchAction: 'none' }}
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={clearSignature}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  
                  <Button 
                    onClick={() => signContractMutation.mutate()}
                    disabled={signaturePad?.isEmpty() || signContractMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {signContractMutation.isPending ? 'Signing...' : 'Complete Signing'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
