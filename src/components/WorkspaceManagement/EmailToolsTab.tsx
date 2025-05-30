
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, FileText, Eye } from "lucide-react";
import { EmailForm } from "./EmailForm";
import { EmailTemplateTab } from "./EmailTemplateTab";
import { EmailPreviewTab } from "./EmailPreviewTab";

export const EmailToolsTab = () => {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Tools
        </h2>
        <p className="text-muted-foreground">
          Send emails, manage email templates, and preview your templates.
        </p>
        <Separator />
      </div>

      <Tabs defaultValue="send-email" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send-email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Send Email
          </TabsTrigger>
          <TabsTrigger value="email-templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="email-preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Email Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send-email">
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle>Send Email</CardTitle>
            </CardHeader>
            <CardContent>
              <EmailForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email-templates">
          <EmailTemplateTab />
        </TabsContent>

        <TabsContent value="email-preview">
          <EmailPreviewTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
