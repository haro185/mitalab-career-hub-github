import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const payload = await request.json();
    const { candidateEmail, candidateName, jobTitle, subject, body } = payload;
    if (!candidateEmail || !candidateName || !subject || !body) {
      return new Response(JSON.stringify({ error: 'Missing required email fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: Deno.env.get('MAIL_FROM') || 'Mitalab Career Hub <tuyendung@mitalab.com>',
        to: [candidateEmail],
        reply_to: Deno.env.get('RECRUITMENT_EMAIL') || 'tuyendung@mitalab.com',
        subject,
        text: body,
        headers: { 'X-Mitalab-Job-Title': jobTitle || '' }
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Email provider rejected the message');
    return new Response(JSON.stringify({ ok: true, id: result.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Email failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
