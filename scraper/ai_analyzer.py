"""
AI Analyzer for procurement opportunities
Uses Groq AI to analyze, score, and provide recommendations
Optimized for batch processing and error handling
"""
import json
import time
import logging
from groq import Groq
from config import GROQ_API_KEY, AI_MODEL, AI_TEMPERATURE, AI_MAX_TOKENS
from typing import Dict, List, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ProcurementAnalyzer:
    """Analyzes procurement opportunities using AI with optimization"""

    def __init__(self):
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY not found in environment variables")

        self.client = Groq(api_key=GROQ_API_KEY)
        self.request_count = 0
        self.last_request_time = 0

    def _rate_limit(self):
        """Implement rate limiting to avoid API throttling"""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time

        # Minimum 1 second between requests
        if time_since_last_request < 1.0:
            sleep_time = 1.0 - time_since_last_request
            logger.debug(f"Rate limiting: sleeping {sleep_time:.2f}s")
            time.sleep(sleep_time)

        self.last_request_time = time.time()
        self.request_count += 1

    def analyze_procurement(self, procurement_data: dict, user_profile: str = None, retry_count: int = 3) -> dict:
        """
        Analyze a procurement opportunity with retry logic

        Args:
            procurement_data: Dictionary with procurement details
            user_profile: Optional user profile for matching score
            retry_count: Number of retries on failure

        Returns:
            Dictionary with analysis results
        """
        self._rate_limit()

        # Build the analysis prompt
        system_prompt = """Olet hankinta-asiantuntija, joka analysoi julkisia hankintailmoituksia suomalaisille yrityksille.
Tehtäväsi on:
1. Tiivistää hankinta selkeästi suomeksi (2-3 lausetta)
2. Tunnistaa toimiala tarkasti
3. Analysoida riskit ja huomioitavat asiat (3-5 kohtaa)
4. Jos budjetti tiedossa, ehdottaa realistinen tarjoushinta-alue

Vastaa AINA JSON-muodossa. Älä lisää muuta tekstiä."""

        # Build user prompt with procurement details
        user_prompt = f"""Analysoi tämä hankintailmoitus:

OTSIKKO: {procurement_data.get('title', 'Ei otsikkoa')[:200]}
ORGANISAATIO: {procurement_data.get('organization', 'Ei tiedossa')[:100]}
KUVAUS: {procurement_data.get('description', 'Ei kuvausta')[:1000]}
BUDJETTI: {procurement_data.get('budget_estimate', 'Ei tiedossa')} €
MÄÄRÄAIKA: {procurement_data.get('deadline', 'Ei määräaikaa')}

Anna analyysi JSON-muodossa seuraavilla kentillä:
{{
  "ai_summary": "Lyhyt 2-3 lauseen tiivistelmä suomeksi",
  "category": "Toimiala (esim. Rakentaminen, IT-palvelut, Siivouspalvelut, Kuljetuspalvelut, Koulutuspalvelut, jne.)",
  "ai_analysis": "Riskit ja huomioitavat asiat (3-5 kohtaa merkkijonona)",
  "ai_recommended_bid_min": 0,
  "ai_recommended_bid_max": 0
}}"""

        # If user profile provided, add matching analysis
        if user_profile:
            user_prompt += f"""

KÄYTTÄJÄN YRITYSPROFIILI:
{user_profile[:500]}

Lisää myös:
{{
  "ai_match_score": 0-100 (kuinka hyvin hankinta sopii tälle yritykselle)
}}"""

        for attempt in range(retry_count):
            try:
                logger.debug(f"AI analysis attempt {attempt + 1}/{retry_count}")

                # Call Groq API
                response = self.client.chat.completions.create(
                    model=AI_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=AI_TEMPERATURE,
                    max_tokens=AI_MAX_TOKENS,
                    response_format={"type": "json_object"}
                )

                # Parse response
                result = json.loads(response.choices[0].message.content)

                # Ensure all required fields exist
                analysis = {
                    'ai_summary': result.get('ai_summary', 'Analyysi ei onnistunut')[:500],
                    'category': result.get('category', 'Muut palvelut')[:100],
                    'ai_analysis': result.get('ai_analysis', 'Ei analyysiä')[:1000],
                    'ai_recommended_bid': None,
                    'ai_match_score': None
                }

                # Handle bid recommendation
                bid_min = result.get('ai_recommended_bid_min', 0)
                bid_max = result.get('ai_recommended_bid_max', 0)
                if bid_min > 0 and bid_max > 0:
                    analysis['ai_recommended_bid'] = int((bid_min + bid_max) / 2)

                # Handle match score
                if user_profile:
                    score = result.get('ai_match_score', 50)
                    analysis['ai_match_score'] = max(0, min(100, int(score)))

                logger.info(f"✓ AI analysis successful (request #{self.request_count})")
                return analysis

            except json.JSONDecodeError as e:
                logger.error(f"✗ JSON decode error on attempt {attempt + 1}: {e}")
                if attempt < retry_count - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue

            except Exception as e:
                logger.error(f"✗ AI analysis error on attempt {attempt + 1}: {e}")
                if attempt < retry_count - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue

        # All retries failed
        logger.error("All AI analysis attempts failed")
        return {
            'ai_summary': 'Analyysi epäonnistui - yritä myöhemmin uudelleen',
            'category': 'Muut palvelut',
            'ai_analysis': 'Automaattinen analyysi ei onnistunut. Tarkista hankinta manuaalisesti.',
            'ai_recommended_bid': None,
            'ai_match_score': None
        }

    def batch_analyze(self, procurements: List[Dict], user_profile: str = None, batch_size: int = 5) -> List[Dict]:
        """
        Analyze multiple procurements with rate limiting

        Args:
            procurements: List of procurement dictionaries
            user_profile: Optional user profile for matching
            batch_size: Number of procurements to process before a longer pause

        Returns:
            List of analysis results
        """
        results = []
        total = len(procurements)

        logger.info(f"Starting batch analysis of {total} procurements")

        for i, procurement in enumerate(procurements):
            try:
                logger.info(f"Analyzing {i+1}/{total}: {procurement.get('title', 'Unknown')[:50]}...")

                analysis = self.analyze_procurement(procurement, user_profile)
                results.append(analysis)

                # Longer pause after each batch
                if (i + 1) % batch_size == 0 and i + 1 < total:
                    logger.info(f"Batch pause after {i+1} items...")
                    time.sleep(2)

            except Exception as e:
                logger.error(f"Error analyzing procurement {i+1}: {e}")
                results.append({
                    'ai_summary': 'Analyysi epäonnistui',
                    'category': 'Muut palvelut',
                    'ai_analysis': 'Virhe',
                    'ai_recommended_bid': None,
                    'ai_match_score': None
                })

        logger.info(f"✓ Batch analysis complete: {len(results)} analyzed")
        return results

    def generate_proposal(self, procurement_data: dict, user_profile: str) -> str:
        """
        Generate a professional proposal draft

        Args:
            procurement_data: Procurement details
            user_profile: User company profile

        Returns:
            Professional proposal text in Finnish
        """
        system_prompt = """Olet suomalainen tarjouskonsultti, joka auttaa pienyrittäjiä.
Kirjoitat selkeää ja ammattimaista suomea.
Tehtäväsi on luonnostella sähköpostitarjous, joka perustuu tarjouspyyntöön ja yrittäjän omaan liiketoimintakuvaukseen."""

        user_prompt = f"""YRITTÄJÄN PROFIILI:
{user_profile}

UUSI TARJOUSPYYNTÖ, JOHON VASTATAAN:
Otsikko: {procurement_data.get('title', 'Ei otsikkoa')}
Organisaatio: {procurement_data.get('organization', 'Ei tiedossa')}
Kuvaus: {procurement_data.get('description', 'Ei kuvausta')}
Määräaika: {procurement_data.get('deadline', 'Ei määräaikaa')}

OHJEET:
1. Kirjoita ammattimainen, ystävällinen ja myyvä sähköpostiluonnos
2. Aloita tervehdyksellä
3. Viittaa tarjouspyynnön keskeisiin vaatimuksiin
4. Korosta yrittäjän osaamista ja kokemusta
5. Mainitse relevantteja aiempia projekteja jos mahdollista
6. Päätä call-to-actioniin
7. Lopeta kohteliaalla allekirjoituksella

ÄLÄ KEKSI tietoja, joita ei ole profiilissa. Pidä luonnos realistisena."""

        try:
            response = self.client.chat.completions.create(
                model=AI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=AI_MAX_TOKENS
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"Proposal generation error: {e}")
            return f"Tarjousluonnoksen generointi epäonnistui: {str(e)}"


# Test function
if __name__ == "__main__":
    analyzer = ProcurementAnalyzer()

    # Test data
    test_procurement = {
        'title': 'Koulun maalaustyöt',
        'organization': 'Vantaan kaupunki',
        'description': 'Alakoulun sisätila- ja ulkotilamaalaukset. Sisältää 2000m2 sisätiloja ja 500m2 ulkoseinää.',
        'budget_estimate': 50000,
        'deadline': '2025-02-15'
    }

    test_profile = "Olemme 3 hengen maalausliike Vantaalta. Erikoistuneita ulkomaalaustyöhön julkisille rakennuksille. Meillä on 10 vuoden kokemus ja kaikki tarvittavat sertifioinnit."

    # Test analysis
    print("Testing AI Analysis...")
    result = analyzer.analyze_procurement(test_procurement, test_profile)
    print(json.dumps(result, indent=2, ensure_ascii=False))

    # Test proposal
    print("\nTesting Proposal Generation...")
    proposal = analyzer.generate_proposal(test_procurement, test_profile)
    print(proposal)
