
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  
  try {
    // Email configuration from environment variables
    const SMTP_HOST = Deno.env.get("SMTP_HOST") || "smtp.gmail.com";
    const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "465");
    const SMTP_USER = Deno.env.get("SMTP_USER") || "noreply@box.no";
    const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");
    const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "Box Workspace <noreply@box.no>";
    
    if (!SMTP_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Email configuration missing. SMTP_PASSWORD must be provided in environment variables." }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const { to, subject, text, html, cc, bcc, attachments } = await req.json();
    
    if (!to || !subject || (!text && !html)) {
      return new Response(
        JSON.stringify({ error: "Missing required email fields: to, subject, and either text or html" }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: true,
        auth: {
          username: SMTP_USER,
          password: SMTP_PASSWORD,
        },
      },
    });

    // Send email
    await client.send({
      from: EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      subject: subject,
      content: html || undefined,
      html: html || undefined,
      text: text || undefined,
      attachments: attachments || undefined,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
