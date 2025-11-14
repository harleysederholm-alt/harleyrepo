/**
 * Server Actions
 *
 * Next.js Server Actions, jotka ajetaan palvelinpuolella.
 */

'use server';

import { GROQ_CONFIG } from '@/lib/constants';
import type { Hankinta } from '@/types/database.types';

/**
 * Generoi tarjousluonnos Groq AI:lla
 */
export async function generateTarjousluonnos(
  hankinta: Hankinta,
  aiProfiiliKuvaus: string
): Promise<{ success: boolean; luonnos?: string; error?: string }> {
  try {
    console.log('[generateTarjousluonnos] Starting proposal generation...');

    if (!process.env.GROQ_API_KEY) {
      console.error('[generateTarjousluonnos] GROQ_API_KEY missing');
      throw new Error('GROQ_API_KEY puuttuu');
    }

    console.log('[generateTarjousluonnos] API key found, length:', process.env.GROQ_API_KEY.length);

    // Rakenna prompt
    const systemPrompt = `Olet suomalainen tarjouskonsultti, joka auttaa pienyrittäjiä. Kirjoitat selkeää ja ammattimaista suomea. Tehtäväsi on luonnostella sähköpostitarjous, joka perustuu tarjouspyyntöön ja yrittäjän omaan liiketoimintakuvaukseen.

YRITTÄJÄN PROFIILI:
${aiProfiiliKuvaus}

UUSI TARJOUSPYYNTÖ, JOHON VASTATAAN:
Otsikko: ${hankinta.title}
Organisaatio: ${hankinta.organization}
Tiivistelmä: ${hankinta.ai_summary || 'Ei tiivistelmää'}
Analyysi: ${hankinta.ai_analysis ? JSON.stringify(hankinta.ai_analysis) : 'Ei analyysiä'}

OHJEET:
1. Kirjoita ammattimainen, ystävällinen ja myyvä sähköpostiluonnos
2. Aloita tervehdyksellä (esim. "Hyvä vastaanottaja" tai "Hyvä ${hankinta.organization}n hankintapalvelu")
3. Viittaa tarjouspyynnön keskeisiin vaatimuksiin
4. Korosta yrittäjän osaamista ja kokemusta
5. Mainitse relevantteja aiempia projekteja jos mahdollista
6. Päätä call-to-actioniin (esim. "Otan mielelläni yhteyttä...")
7. Lopeta kohteliaalla allekirjoituksella

ÄLÄ KEKSI tietoja, joita ei ole profiilissa. Pidä luonnos realistisena.`;

    const userPrompt = `Kirjoita tarjousluonnos tälle hankinnalle.`;

    // Kutsu Groq API:a
    console.log('[generateTarjousluonnos] Calling Groq API:', GROQ_CONFIG.API_URL);
    console.log('[generateTarjousluonnos] Using model:', GROQ_CONFIG.PROPOSAL_MODEL);

    const response = await fetch(GROQ_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        model: GROQ_CONFIG.PROPOSAL_MODEL,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
        stream: false,
      }),
    });

    console.log('[generateTarjousluonnos] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generateTarjousluonnos] API error:', errorText);
      throw new Error(`Groq API virhe: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('[generateTarjousluonnos] Response data received, has choices:', !!data.choices);

    const luonnos = data.choices?.[0]?.message?.content;

    if (!luonnos) {
      console.error('[generateTarjousluonnos] No content in response:', data);
      throw new Error('Groq ei palauttanut sisältöä');
    }

    console.log('[generateTarjousluonnos] Success! Generated proposal length:', luonnos.length);

    return {
      success: true,
      luonnos,
    };
  } catch (error) {
    console.error('[generateTarjousluonnos] Error:', error);

    // More detailed error message
    const errorMessage = error instanceof Error
      ? error.message
      : 'Tuntematon virhe tarjousluonnoksen generoinnissa';

    return {
      success: false,
      error: errorMessage,
    };
  }
}
