
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageSquare, AlertTriangle } from "lucide-react";
import { smsService } from "@/services/smsService";
import { useToast } from "@/hooks/use-toast";

export const SmsCreditsAlert = () => {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setIsLoading(true);
        const smsCredits = await smsService.getSmsCredits();
        setCredits(smsCredits);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load SMS credits");
        toast({
          variant: "destructive",
          title: "Error loading SMS credits",
          description: err.message || "Failed to load remaining SMS credits"
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

  // Display warning if credits are low
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
