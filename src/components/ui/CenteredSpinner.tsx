
import { LoaderCircle } from "lucide-react";

export function CenteredSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center py-12 w-full ${className}`}>
      <LoaderCircle 
        className="animate-spin text-primary"
        size={48}
        aria-label="Loading"
        role="status"
      />
    </div>
  );
}
