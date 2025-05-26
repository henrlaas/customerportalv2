
import { SmsForm } from "@/components/WorkspaceManagement/SmsForm";
import { Separator } from "@/components/ui/separator";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SmsToolsTab = () => {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          SMS Tools
        </h2>
        <p className="text-muted-foreground">
          Send SMS messages directly from your workspace.
        </p>
        <Separator />
      </div>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle>Send SMS</CardTitle>
        </CardHeader>
        <CardContent>
          <SmsForm />
        </CardContent>
      </Card>
    </div>
  );
};
