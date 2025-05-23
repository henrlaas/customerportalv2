
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

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get credits from the API endpoint that returns a plain number
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

    fetchCredits();
  }, [toast]);

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

  // Display the credits alert
  const isLow = credits !== null && credits < 100;

  return (
    <Alert variant={isLow ? "destructive" : "default"}>
      <MessageSquare className="h-4 w-4" />
      <AlertTitle>SMS Credits</AlertTitle>
      <AlertDescription>
        You have {credits} SMS credits remaining.
        {isLow && " Consider purchasing more credits soon."}
      </AlertDescription>
    </Alert>
  );
};
