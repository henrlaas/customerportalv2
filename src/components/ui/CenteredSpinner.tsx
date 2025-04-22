
import { loaderCircle } from "lucide-react";
import { Icon } from "lucide-react";

export function CenteredSpinner({ className = "" }: { className?: string }) {
  // The Icon component from lucide-react lets us display any icon, here loader-circle.
  return (
    <div className={`flex justify-center items-center py-12 w-full ${className}`}>
      {/* Accessible, animated spinner */}
      <Icon 
        iconNode={loaderCircle}
        className="animate-spin text-primary"
        size={48}
        aria-label="Loading"
        role="status"
      />
    </div>
  );
}
