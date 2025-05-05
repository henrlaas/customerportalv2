
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
        console.error("Failed to load SMS credits:", err);
        setError("Could not load SMS credits");
        // Don't show toast error since we know there might be CORS issues
        // but the API works
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

  // Always show the credits alert, even if we had an error
  // Display warning if credits are low
  const isLow = credits !== null && credits < 100;

  return (
    <Alert variant={isLow ? "destructive" : "default"}>
      <MessageSquare className="h-4 w-4" />
      <AlertTitle>SMS Credits</AlertTitle>
      <AlertDescription>
        You have {credits !== null ? credits : "unknown"} SMS credits remaining.
        {isLow && " Consider purchasing more credits soon."}
      </AlertDescription>
    </Alert>
  );
};
