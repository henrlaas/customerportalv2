
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
};

// Create a nodemailer transport
const createTransport = () => {
  const host = Deno.env.get("EMAIL_HOST") || "smtp.gmail.com";
  const port = parseInt(Deno.env.get("EMAIL_PORT") || "465");
  const secure = Deno.env.get("EMAIL_SECURE") === "false" ? false : true;
  const user = Deno.env.get("EMAIL_USER") || "noreply@box.no";
  const pass = Deno.env.get("EMAIL_PASSWORD") || "";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const emailData = await req.json();
    console.log("Received email request:", JSON.stringify(emailData));

    const transporter = createTransport();
    
    const mailOptions = {
      from: Deno.env.get("EMAIL_FROM") || 'Box Workspace <noreply@box.no>',
      to: Array.isArray(emailData.to) ? emailData.to.join(',') : emailData.to,
      subject: emailData.subject,
      html: emailData.html, // Use HTML content
      text: emailData.text, // Plain text fallback
      cc: emailData.cc ? (Array.isArray(emailData.cc) ? emailData.cc.join(',') : emailData.cc) : undefined,
      bcc: emailData.bcc ? (Array.isArray(emailData.bcc) ? emailData.bcc.join(',') : emailData.bcc) : undefined,
      attachments: emailData.attachments,
    };

    console.log("Sending email with options:", JSON.stringify(mailOptions));
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: info.messageId 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error sending email:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to send email" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
