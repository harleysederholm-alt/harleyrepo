import { NextRequest, NextResponse } from 'next/server';
import { GROQ_CONFIG } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const { profiili, ai_summary } = await request.json();

    console.log('[calculate-match] Request received:', {
      hasProfiili: !!profiili,
      hasAiSummary: !!ai_summary
    });

    if (!profiili || !ai_summary) {
      console.error('[calculate-match] Missing parameters');
      return NextResponse.json(
        { error: 'Puuttuvat parametrit', match: 50 },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('[calculate-match] GROQ_API_KEY missing');
      return NextResponse.json(
        { error: 'API-avain puuttuu', match: 50 },
        { status: 500 }
      );
    }

    console.log('[calculate-match] Calling Groq API...');

    // Kutsu Groq API:a (Llama 3 8B - nopeampi ja halvempi)
    const groqResponse = await fetch(GROQ_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `Olet asiantuntija-agentti. Vertaat käyttäjän profiilia hankinnan kuvaukseen. Palauta VAIN numero 0-100, joka edustaa osuvuutta prosentteina. Älä selitä. Vastaa vain numerolla.

KÄYTTÄJÄN PROFIILI: ${profiili}
HANKINNAN KUVAUS: ${ai_summary}`,
          },
          {
            role: 'user',
            content:
              'Kuinka hyvin (0-100) tämä hankinta sopii tälle käyttäjälle?',
          },
        ],
        model: GROQ_CONFIG.MATCHING_MODEL,
        temperature: 0,
        max_tokens: 10,
        top_p: 1,
        stream: false,
      }),
    });

    console.log('[calculate-match] Groq response status:', groqResponse.status);

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('[calculate-match] Groq API error:', errorText);
      throw new Error(`Groq API virhe: ${groqResponse.statusText}`);
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices?.[0]?.message?.content?.trim();

    console.log('[calculate-match] Groq response content:', content);

    // Parsoi numero
    const match = parseInt(content || '50', 10);

    // Varmista että arvo on 0-100 välillä
    const clampedMatch = Math.max(0, Math.min(100, match));

    console.log('[calculate-match] Final match score:', clampedMatch);

    return NextResponse.json({ match: clampedMatch });
  } catch (error) {
    console.error('[calculate-match] Error:', error);
    return NextResponse.json(
      { error: 'Sisäinen virhe', match: 50 },
      { status: 500 }
    );
  }
}
