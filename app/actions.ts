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
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY puuttuu');
    }

    // Rakenna prompt
    const systemPrompt = `Olet suomalainen tarjouskonsultti, joka auttaa pienyrittäjiä. Kirjoitat selkeää ja ammattimaista suomea. Tehtäväsi on luonnostella sähköpostitarjous, joka perustuu tarjouspyyntöön ja yrittäjän omaan liiketoimintakuvaukseen.

YRITTÄJÄN PROFIILI:
${aiProfiiliKuvaus}

UUSI TARJOUSPYYNTÖ, JOHON VASTATAAN:
Otsikko: ${hankinta.otsikko}
Kunta: ${hankinta.kunta}
Tiivistelmä: ${hankinta.tiivistelma_ai || 'Ei tiivistelmää'}
Riskit: ${hankinta.riskit_ai || 'Ei riskejä'}

OHJEET:
1. Kirjoita ammattimainen, ystävällinen ja myyvä sähköpostiluonnos
2. Aloita tervehdyksellä (esim. "Hyvä vastaanottaja" tai "Hyvä ${hankinta.kunta}n hankintapalvelu")
3. Viittaa tarjouspyynnön keskeisiin vaatimuksiin
4. Korosta yrittäjän osaamista ja kokemusta
5. Mainitse relevantteja aiempia projekteja jos mahdollista
6. Päätä call-to-actioniin (esim. "Otan mielelläni yhteyttä...")
7. Lopeta kohteliaalla allekirjoituksella

ÄLÄ KEKSI tietoja, joita ei ole profiilissa. Pidä luonnos realistisena.`;

    const userPrompt = `Kirjoita tarjousluonnos tälle hankinnalle.`;

    // Kutsu Groq API:a
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API virhe: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const luonnos = data.choices?.[0]?.message?.content;

    if (!luonnos) {
      throw new Error('Groq ei palauttanut sisältöä');
    }

    return {
      success: true,
      luonnos,
    };
  } catch (error) {
    console.error('Virhe generateTarjousluonnos:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Tuntematon virhe tarjousluonnoksen generoinnissa',
    };
  }
}
