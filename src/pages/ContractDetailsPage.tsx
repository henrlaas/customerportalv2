import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContractWithDetails } from '@/utils/contractUtils';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createPDF } from '@/utils/pdfUtils';
import SignaturePad from 'signature_pad';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signContract } from '@/utils/contractUtils';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  CheckCircle, 
  XCircle, 
  Edit, 
  FileText, 
  ArrowLeft, 
  Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CompanyFavicon } from '@/components/CompanyFavicon';
import { Card } from '@/components/ui/card';
import { DeleteContractDialog } from '@/components/DeleteContractDialog';

const ContractDetailsPage = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [contract, setContract] = useState<ContractWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [showContract, setShowContract] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const fetchContract = async () => {
      if (!contractId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('contracts')
          .select(`
            *,
            company:company_id (*),
            creator:created_by (
              id, 
              first_name, 
              last_name, 
              avatar_url
            ),
            contact:contact_id (
              id,
              user_id,
              position,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('id', contractId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Get the safe contact data, checking for nulls and errors
          const safeContact = data.contact && 
            typeof data.contact === 'object' && 
            !('error' in data.contact) ? {
              id: data.contact.id || '',
              user_id: data.contact.user_id || '',
              position: data.contact.position || null,
              first_name: data.contact.first_name || '',
              last_name: data.contact.last_name || '',
              avatar_url: data.contact.avatar_url || null
            } : {
              id: '',
              user_id: '',
              position: null,
              first_name: '',
              last_name: '',
              avatar_url: null
            };
          
          // Create a properly typed contract object
          const contractData: ContractWithDetails = {
            ...data,
            company: data.company || { 
              name: 'Unknown', 
              organization_number: null,
              website: null
            },
            contact: safeContact,
            creator: data.creator || null
          };
          
          setContract(contractData);
        }
      } catch (err: any) {
        console.error('Error fetching contract:', err);
        setError(err.message || 'Failed to load contract');
        toast({
          title: 'Error',
          description: 'Failed to load contract details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchContract();
  }, [contractId, toast]);
  
  // Initialize signature pad when canvas is shown
  useEffect(() => {
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
  
  // Check if the current user is the contact for this contract
  const isContractContact = user?.id === contract?.contact?.user_id;
  
  // Check if the contract can be signed (is unsigned and user is the contact)
  const canSign = contract?.status === 'unsigned' && isContractContact && profile?.role === 'client';
  
  // Handle when signature is cleared
  const clearSignature = () => {
    if (signaturePad) {
      signaturePad.clear();
    }
  };
  
  // Mutation for signing contract
  const signContractMutation = useMutation({
    mutationFn: async () => {
      if (!signaturePad || !user || signaturePad.isEmpty() || !contractId) {
        throw new Error('Signature is required');
      }
      
      const signatureDataUrl = signaturePad.toDataURL();
      return await signContract(contractId, signatureDataUrl);
    },
    onSuccess: () => {
      toast({
        title: 'Contract signed',
        description: 'The contract has been successfully signed.',
      });
      setShowSignature(false);
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      
      // Reload the contract data to show updated status
      if (contractId) {
        const fetchContract = async () => {
          try {
            const { data, error } = await supabase
              .from('contracts')
              .select(`
                *,
                company:company_id (*),
                creator:created_by (
                  id, 
                  first_name, 
                  last_name, 
                  avatar_url
                ),
                contact:contact_id (
                  id,
                  user_id,
                  position,
                  first_name,
                  last_name,
                  avatar_url
                )
              `)
              .eq('id', contractId)
              .single();
            
            if (error) throw error;
            
            if (data) {
              // Get the safe contact data, checking for nulls and errors
              const safeContact = data.contact && 
                typeof data.contact === 'object' && 
                !('error' in data.contact) ? {
                  id: data.contact.id || '',
                  user_id: data.contact.user_id || '',
                  position: data.contact.position || null,
                  first_name: data.contact.first_name || '',
                  last_name: data.contact.last_name || '',
                  avatar_url: data.contact.avatar_url || null
                } : {
                  id: '',
                  user_id: '',
                  position: null,
                  first_name: '',
                  last_name: '',
                  avatar_url: null
                };
              
              // Create a properly typed contract object
              const contractData: ContractWithDetails = {
                ...data,
                company: data.company || { 
                  name: 'Unknown', 
                  organization_number: null,
                  website: null
                },
                contact: safeContact,
                creator: data.creator || null
              };
              
              setContract(contractData);
            }
          } catch (err) {
            console.error('Error reloading contract:', err);
          }
        };
        
        fetchContract();
      }
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
    if (!contract) return;
    
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
  
  const handleContractDelete = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleContractDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ['contracts'] });
    navigate('/contracts');
    toast({
      title: 'Contract deleted',
      description: 'The contract has been successfully deleted.',
    });
  };
  
  if (loading) {
    return (
      <div className="container p-6 mx-auto">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="ghost" onClick={() => navigate('/contracts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contracts
          </Button>
        </div>
        <Card className="p-6">
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
        </Card>
      </div>
    );
  }
  
  if (error || !contract) {
    return (
      <div className="container p-6 mx-auto">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="ghost" onClick={() => navigate('/contracts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contracts
          </Button>
        </div>
        <Card className="p-6 text-center">
          <h2 className="text-lg font-medium mb-2">Error Loading Contract</h2>
          <p className="text-muted-foreground mb-4">{error || 'Contract not found'}</p>
          <Button onClick={() => navigate('/contracts')}>
            Return to Contracts
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/contracts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contracts
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={downloadContract}
            disabled={isDownloading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </Button>
          
          {(profile?.role === 'admin' || profile?.role === 'employee') && (
            <Button 
              variant="destructive" 
              onClick={handleContractDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Contract
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold">
                  {contract.template_type} Contract
                </h1>
              </div>
              
              {/* Contract content */}
              {showContract && (
                <div className="bg-white p-6 rounded-md border shadow-sm whitespace-pre-wrap mt-6">
                  <div className="prose max-w-none">
                    {contract.content}
                  </div>
                </div>
              )}
            </Card>
            
            {/* Signature section */}
            {contract.status === 'signed' && contract.signature_data && (
              <Card className="p-6">
                <h4 className="text-lg font-medium mb-3">Signature</h4>
                <div className="flex justify-center bg-white border p-4 rounded-md">
                  <img 
                    src={contract.signature_data} 
                    alt="Signature" 
                    className="max-h-32"
                  />
                </div>
              </Card>
            )}
            
            {/* Signature pad */}
            {showSignature && canSign && (
              <Card className="p-6">
                <h4 className="text-lg font-medium mb-3">Sign Contract</h4>
                <div className="bg-white border rounded-md p-2">
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-32 touch-none"
                    style={{ touchAction: 'none' }}
                  />
                </div>
                <div className="flex justify-between mt-4">
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
              </Card>
            )}
          </div>
          
          <div className="md:w-1/3">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Contract Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <Badge 
                    variant={contract.status === 'signed' ? "default" : "outline"} 
                    className={`inline-flex items-center gap-1 w-fit ${
                      contract.status === 'signed' 
                        ? "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-200 hover:text-amber-800"
                    }`}
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
                  <p className="text-sm text-gray-500 mb-1">Company</p>
                  <div className="flex items-center gap-2">
                    <CompanyFavicon 
                      companyName={contract.company?.name || 'Unknown'} 
                      website={contract.company?.website} 
                      logoUrl={contract.company?.logo_url}
                      size="sm"
                    />
                    <p className="font-medium">{contract.company?.name || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contact</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage 
                        src={contract.contact?.avatar_url || undefined} 
                        alt={`${contract.contact?.first_name || ''} ${contract.contact?.last_name || ''}`} 
                      />
                      <AvatarFallback className="text-[10px]">
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
                      <AvatarFallback className="text-[10px]">
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
                
                {contract.project_id && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Related Project</p>
                    <Button 
                      variant="link" 
                      className="px-0 text-primary" 
                      onClick={() => navigate(`/projects/${contract.project_id}`)}
                    >
                      View Project
                    </Button>
                  </div>
                )}
                
                <Separator />
                
                {/* Sign Contract button for clients */}
                {canSign && !showSignature && !contract.signature_data && (
                  <Button 
                    onClick={() => setShowSignature(true)}
                    className="w-full mt-2"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Sign Contract
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Delete Contract Dialog */}
      <DeleteContractDialog
        contractId={contract.id}
        contractName={`${contract.template_type} for ${contract.company?.name || 'Unknown Company'}`}
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDeleted={handleContractDeleted}
      />
    </div>
  );
};

export default ContractDetailsPage;
