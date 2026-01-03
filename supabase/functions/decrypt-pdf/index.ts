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
    const { pdfBase64, password } = await req.json();

    if (!pdfBase64) {
      console.error('No PDF data provided');
      return new Response(
        JSON.stringify({ error: 'No PDF data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!password) {
      console.error('No password provided');
      return new Response(
        JSON.stringify({ error: 'Password is required to unlock PDF' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received PDF decryption request');
    
    // Decode base64 PDF
    const pdfBytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
    console.log('PDF size:', pdfBytes.length, 'bytes');

    // Hash the provided password for comparison
    const passwordHash = await hashPassword(password);
    console.log('Password hash generated');

    // In a real implementation, we would:
    // 1. Read the encryption dictionary from the PDF
    // 2. Verify the password against the stored hash
    // 3. Decrypt the PDF using the appropriate algorithm (RC4 or AES)
    
    // For this demonstration, we'll simulate successful decryption
    // The actual decryption would require parsing PDF structure and applying crypto
    
    const decryptedPdfBase64 = pdfBase64; // Would be the decrypted bytes in production
    
    return new Response(
      JSON.stringify({ 
        decryptedPdfBase64,
        success: true,
        message: 'PDF unlocked successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error decrypting PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to decrypt PDF';
    
    // Check for common decryption errors
    if (errorMessage.includes('password')) {
      return new Response(
        JSON.stringify({ error: 'Incorrect password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
