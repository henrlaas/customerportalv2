
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TimeEntry } from "@/types/timeTracking";
import { exportTimeEntriesToCSV } from "@/utils/exportUtils";
import { DownloadCloud } from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";

interface ExportHoursButtonProps {
  selectedMonth: Date;
}

export const ExportHoursButton = ({ selectedMonth }: ExportHoursButtonProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const handleExport = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to export time entries",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get selected month's start and end dates
      const monthStart = startOfMonth(selectedMonth).toISOString();
      const monthEnd = endOfMonth(selectedMonth).toISOString();

      // Fetch time entries for selected month
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_time", monthStart)
        .lte("start_time", monthEnd)
        .order("start_time", { ascending: true });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        toast({
          title: "No entries found",
          description: `No time entries found for ${format(selectedMonth, 'MMMM yyyy')}`,
        });
        return;
      }

      // Format user name
      const userName = profile
        ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
        : "User";

      // Export the data
      await exportTimeEntriesToCSV(data as TimeEntry[], userName, selectedMonth);

      toast({
        title: "Export successful",
        description: `Time entries for ${format(selectedMonth, 'MMMM yyyy')} have been exported to CSV`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting time entries",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <DownloadCloud className="mr-2 h-4 w-4" />
      Export Hours
    </Button>
  );
};
