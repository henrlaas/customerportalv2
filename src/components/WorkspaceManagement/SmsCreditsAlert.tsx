
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageSquare, AlertTriangle } from "lucide-react";

export const SmsCreditsAlert = () => {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://sveve.no/SMS/AccountAdm?cmd=sms_count&user=box&passwd=4bbc3a48af044f74');
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const textResponse = await response.text();
        const creditsValue = parseInt(textResponse.trim(), 10);
        
        if (isNaN(creditsValue)) {
          throw new Error("Invalid response format from API");
        }
        
        setCredits(creditsValue);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load SMS credits:", err);
        setError("Could not load SMS credits");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredits();
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
