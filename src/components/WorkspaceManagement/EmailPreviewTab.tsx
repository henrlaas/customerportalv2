
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, Loader2 } from "lucide-react";
import { workspaceService } from "@/services/workspaceService";

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Box Workspace</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 0 auto;">
                    <tr>
                        <td style="text-align: center; padding: 20px 0;">
                            <img src="https://shorturl.at/7WV73" alt="Box Marketing AS" width="150" style="display: block; margin: 0 auto;" />
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px;">
                            <h2 style="color: #004743; margin: 0 0 20px 0; font-size: 24px;">Hello 👋</h2>
                            <div style="margin-bottom: 20px; white-space: pre-wrap;">\${data.message}</div>
                            <p style="margin: 20px 0;">Thank you,<br>The Box Team</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding: 20px; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0 0 10px 0;">This email was sent to you because you have an association with Box Marketing AS.</p>
                            <p style="margin: 0;">© 2025 Box Marketing AS. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const EmailPreviewTab = () => {
  const [template, setTemplate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const settings = await workspaceService.getSettings();
        const templateSetting = settings.find(s => s.setting_key === 'email.template.default');
        
        if (templateSetting) {
          setTemplate(templateSetting.setting_value);
        } else {
          setTemplate(DEFAULT_TEMPLATE);
        }
      } catch (error) {
        console.error("Failed to load email template:", error);
        setError("Failed to load email template");
        setTemplate(DEFAULT_TEMPLATE);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, []);

  // Function to process template with sample data for preview
  const processTemplateForPreview = (template: string) => {
    let processedTemplate = template;
    
    // Replace template variables with sample data
    processedTemplate = processedTemplate.replace(/\$\{data\.message\}/g, 'This is a sample message to show how your email template will look when sent to recipients. You can customize this message when sending emails.');
    processedTemplate = processedTemplate.replace(/\$\{data\.subject\}/g, 'Sample Email Subject');
    
    return processedTemplate;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>Loading email template preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}. Showing default template instead.
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          This preview shows how your email template will appear to recipients. Template variables are replaced with sample data for demonstration.
        </AlertDescription>
      </Alert>
      
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Email Template Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <iframe
              srcDoc={processTemplateForPreview(template)}
              className="w-full h-[600px] border-0"
              title="Email Template Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
