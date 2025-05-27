
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, language, platform } = await req.json();

    if (!prompt || !language || !platform) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: prompt, language, platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert ad copywriter. Generate compelling ad content for ${platform} platform in ${language}. 

Requirements:
- Generate 5 unique headlines (max 30 characters for Google, 40 for Meta, 34 for Snapchat, 25 for TikTok, 30 for LinkedIn)
- Generate 4 unique descriptions (max 90 characters for Google, 125 for Meta, no limit for others)
- Generate 4 unique main text variations (max 125 characters for Meta/LinkedIn, no limit for others)
- Generate 5 keyword sets (max 80 characters each)
- Suggest a brand name if not obvious from the prompt

Return ONLY a valid JSON object with this exact structure:
{
  "headlines": ["headline1", "headline2", "headline3", "headline4", "headline5"],
  "descriptions": ["desc1", "desc2", "desc3", "desc4"],
  "main_texts": ["text1", "text2", "text3", "text4"],
  "keywords": ["keywords1", "keywords2", "keywords3", "keywords4", "keywords5"],
  "brand_name": "suggested brand name"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Try to parse the JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedContent);
      throw new Error('Invalid response format from AI');
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ad-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
