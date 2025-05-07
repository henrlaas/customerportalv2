import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import SignaturePad from 'signature_pad';
import { fillContractTemplate, getTemplateTypeName } from '@/utils/contractUtils';
import { Contract } from '@/types/contract';

interface ViewContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract;
  onContractUpdated?: () => void;
}

export const ViewContractDialog: React.FC<ViewContractDialogProps> = ({ 
  open, 
  onOpenChange,
  contract,
  onContractUpdated
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [contractContent, setContractContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const signaturePadRef = useRef<HTMLCanvasElement>(null);
  const signaturePadInstance = useRef<SignaturePad | null>(null);
  const [canSign, setCanSign] = useState(false);

  useEffect(() => {
    if (open && contract) {
      loadContract();
      checkCanSign();
    }
  }, [open, contract]);

  useEffect(() => {
    if (showSignaturePad && signaturePadRef.current) {
      signaturePadInstance.current = new SignaturePad(signaturePadRef.current, {
        backgroundColor: 'rgb(255, 255, 255)'
      });
    }
  }, [showSignaturePad]);

  const loadContract = async () => {
    setLoading(true);
    try {
      const content = await fillContractTemplate(contract);
      setContractContent(content);
    } catch (error) {
      console.error("Error loading contract:", error);
      toast({
        title: "Error loading contract",
        description: "Failed to load the contract content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCanSign = async () => {
    if (!user || !contract) {
      setCanSign(false);
      return;
    }

    // Only unsigned contracts can be signed
    if (contract.status !== 'unsigned') {
      setCanSign(false);
      return;
    }

    // Check if the current user is the contact who should sign
    if (contract.contact_id) {
      try {
        const { data, error } = await supabase
          .from('company_contacts')
          .select('user_id')
          .eq('id', contract.contact_id)
          .single();
          
        if (error) throw error;
        
        setCanSign(data.user_id === user.id);
      } catch (error) {
        console.error("Error checking signing permission:", error);
        setCanSign(false);
      }
    } else {
      setCanSign(false);
    }
  };

  const handleSignContract = async () => {
    if (!signaturePadInstance.current) return;
    
    if (signaturePadInstance.current.isEmpty()) {
      toast({
        title: "Signature required",
        description: "Please provide your signature",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const signatureData = signaturePadInstance.current.toDataURL();
      
      const { error } = await supabase
        .from('contracts')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString(),
          signature_data: signatureData
        })
        .eq('id', contract.id);
        
      if (error) throw error;
      
      toast({
        title: "Contract signed",
        description: "The contract has been successfully signed",
      });
      
      if (onContractUpdated) {
        onContractUpdated();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error signing contract:", error);
      toast({
        title: "Error signing contract",
        description: "Failed to sign the contract. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetSignature = () => {
    if (signaturePadInstance.current) {
      signaturePadInstance.current.clear();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contract && getTemplateTypeName(contract.template_type)}
            {contract?.status === 'signed' && (
              <span className="ml-2 text-sm bg-green-500 text-white px-2 py-0.5 rounded-full">
                Signed
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">Loading contract...</div>
        ) : (
          <div className="space-y-6">
            {/* Contract Info */}
            <div className="bg-muted/50 p-4 rounded-md text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Company:</p>
                  <p>{contract?.companies?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium">Contact:</p>
                  <p>
                    {contract?.contacts?.user?.profiles?.[0]?.first_name || ''}{' '}
                    {contract?.contacts?.user?.profiles?.[0]?.last_name || ''}{' '}
                    {contract?.contacts?.position && `(${contract.contacts.position})`}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Created:</p>
                  <p>{contract?.created_at && format(new Date(contract.created_at), 'dd MMM yyyy')}</p>
                </div>
                {contract?.status === 'signed' && contract?.signed_at && (
                  <div>
                    <p className="font-medium">Signed:</p>
                    <p>{format(new Date(contract.signed_at), 'dd MMM yyyy')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contract Content */}
            <div className="border p-6 rounded-md text-sm whitespace-pre-line">
              {contractContent}
            </div>

            {/* Signature section if contract is signed */}
            {contract?.status === 'signed' && contract?.signature_data && (
              <div className="border p-4 rounded-md">
                <p className="font-medium mb-2">Signature:</p>
                <img 
                  src={contract.signature_data} 
                  alt="Signature" 
                  className="max-h-24 border" 
                />
              </div>
            )}

            {/* Signature Pad for signing */}
            {canSign && contract?.status === 'unsigned' && (
              <>
                {!showSignaturePad ? (
                  <div className="text-center">
                    <Button onClick={() => setShowSignaturePad(true)}>
                      Sign Contract
                    </Button>
                  </div>
                ) : (
                  <div className="border p-4 rounded-md">
                    <p className="font-medium mb-2">Please sign below:</p>
                    <div className="border bg-white mb-4">
                      <canvas
                        ref={signaturePadRef}
                        width={550}
                        height={200}
                        className="w-full signature-pad"
                      ></canvas>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={resetSignature} variant="outline">
                        Clear
                      </Button>
                      <Button onClick={handleSignContract}>
                        Submit Signature
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
