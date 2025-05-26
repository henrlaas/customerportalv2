
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageSquare, AlertTriangle } from "lucide-react";
import { smsService } from "@/services/smsService";
import { useToast } from "@/components/ui/use-toast";

export const SmsCreditsAlert = () => {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCredits = async () => {
    try {
      setError(null);
      
      const creditsValue = await smsService.getSmsCredits();
      setCredits(creditsValue);
    } catch (err: any) {
      console.error("Failed to load SMS credits:", err);
      setError("Failed to load SMS credits");
      
      toast({
        title: "Error",
        description: "Could not retrieve SMS credits. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchCredits, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertTitle>SMS Credits</AlertTitle>
        <AlertDescription>Loading remaining SMS credits...</AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Determine alert variant based on credits
  const getAlertVariant = () => {
    if (credits === 0) return "destructive";
    if (credits !== null && credits < 100) return "warning";
    return "default";
  };

  const getAlertMessage = () => {
    if (credits === 0) {
      return "You have no SMS credits remaining. Please purchase more credits to continue sending SMS messages.";
    }
    if (credits !== null && credits < 100) {
      return `You have ${credits} SMS credits remaining. Consider purchasing more credits soon.`;
    }
    return `You have ${credits} SMS credits remaining.`;
  };

  return (
    <Alert variant={getAlertVariant()}>
      <MessageSquare className="h-4 w-4" />
      <AlertTitle>SMS Credits</AlertTitle>
      <AlertDescription>
        {getAlertMessage()}
      </AlertDescription>
    </Alert>
  );
};
