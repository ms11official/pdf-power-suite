import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, language = 'en' } = await req.json();

    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Starting OCR extraction with GPT-4 Vision...');

    // Use GPT-4 Vision for OCR
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an OCR (Optical Character Recognition) assistant. Your task is to extract ALL text visible in the provided image. 
            
Instructions:
- Extract all visible text, preserving the original layout as much as possible
- Maintain paragraph breaks and structure
- If there are tables, try to preserve the table structure using spaces or tabs
- If the image contains handwriting, do your best to transcribe it
- If certain text is unclear, indicate with [unclear] marker
- Output ONLY the extracted text, no additional commentary
- The text may be in ${language} language, process accordingly`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please extract all text from this image/PDF page.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0]?.message?.content || '';

    console.log('OCR extraction complete. Text length:', extractedText.length);

    return new Response(
      JSON.stringify({ 
        success: true,
        text: extractedText,
        language: language
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('OCR error:', error);
    const errorMessage = error instanceof Error ? error.message : 'OCR extraction failed';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
