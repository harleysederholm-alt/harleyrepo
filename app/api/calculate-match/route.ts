import { NextRequest, NextResponse } from 'next/server';
import { GROQ_CONFIG } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const { profiili, tiivistelma } = await request.json();

    if (!profiili || !tiivistelma) {
      return NextResponse.json(
        { error: 'Puuttuvat parametrit' },
        { status: 400 }
      );
    }

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
HANKINNAN KUVAUS: ${tiivistelma}`,
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

    if (!groqResponse.ok) {
      throw new Error(`Groq API virhe: ${groqResponse.statusText}`);
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices?.[0]?.message?.content?.trim();

    // Parsoi numero
    const match = parseInt(content || '50', 10);

    // Varmista että arvo on 0-100 välillä
    const clampedMatch = Math.max(0, Math.min(100, match));

    return NextResponse.json({ match: clampedMatch });
  } catch (error) {
    console.error('Virhe calculate-match API:ssa:', error);
    return NextResponse.json(
      { error: 'Sisäinen virhe', match: 50 },
      { status: 500 }
    );
  }
}
