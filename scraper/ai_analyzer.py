"""
AI Analyzer for procurement opportunities
Uses Groq AI to analyze, score, and provide recommendations
"""
import json
from groq import Groq
from config import GROQ_API_KEY, AI_MODEL, AI_TEMPERATURE, AI_MAX_TOKENS


class ProcurementAnalyzer:
    """Analyzes procurement opportunities using AI"""

    def __init__(self):
        self.client = Groq(api_key=GROQ_API_KEY)

    def analyze_procurement(self, procurement_data: dict, user_profile: str = None) -> dict:
        """
        Analyze a procurement opportunity

        Args:
            procurement_data: Dictionary with procurement details (title, description, organization, etc.)
            user_profile: Optional user profile for matching score

        Returns:
            Dictionary with analysis results:
                - ai_summary: Brief summary in Finnish
                - ai_analysis: Risk analysis and key points
                - category: Detected industry category
                - ai_match_score: Match percentage if user_profile provided
                - ai_recommended_bid: Recommended bid range if budget available
        """

        # Build the analysis prompt
        system_prompt = """Olet hankinta-asiantuntija, joka analysoi julkisia hankintailmoituksia suomalaisille yrityksille.
Tehtäväsi on:
1. Tiivistää hankinta selkeästi suomeksi
2. Tunnistaa toimiala
3. Analysoida riskit ja huomioitavat asiat
4. Jos budjetti tiedossa, ehdottaa realistinen tarjoushinta-alue

Vastaa AINA JSON-muodossa. Älä lisää muuta tekstiä."""

        # Build user prompt with procurement details
        user_prompt = f"""Analysoi tämä hankintailmoitus:

OTSIKKO: {procurement_data.get('title', 'Ei otsikkoa')}
ORGANISAATIO: {procurement_data.get('organization', 'Ei tiedossa')}
KUVAUS: {procurement_data.get('description', 'Ei kuvausta')}
BUDJETTI: {procurement_data.get('budget_estimate', 'Ei tiedossa')} €
MÄÄRÄAIKA: {procurement_data.get('deadline', 'Ei määräaikaa')}

Anna analyysi JSON-muodossa seuraavilla kentillä:
{{
  "ai_summary": "Lyhyt 2-3 lauseen tiivistelmä suomeksi",
  "category": "Toimiala (esim. Rakentaminen, IT-palvelut, Siivouspalvelut, jne.)",
  "ai_analysis": "Riskit ja huomioitavat asiat (3-5 kohtaa)",
  "ai_recommended_bid_min": 0,
  "ai_recommended_bid_max": 0
}}"""

        # If user profile provided, add matching analysis
        if user_profile:
            user_prompt += f"""

KÄYTTÄJÄN YRITYSPROFIILI:
{user_profile}

Lisää myös:
{{
  "ai_match_score": 0-100 (kuinka hyvin hankinta sopii tälle yritykselle)
}}"""

        try:
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
                'ai_summary': result.get('ai_summary', 'Analyysi ei onnistunut'),
                'category': result.get('category', 'Muut palvelut'),
                'ai_analysis': result.get('ai_analysis', 'Ei analyysiä'),
                'ai_recommended_bid': None,
                'ai_match_score': None
            }

            # Handle bid recommendation
            bid_min = result.get('ai_recommended_bid_min', 0)
            bid_max = result.get('ai_recommended_bid_max', 0)
            if bid_min > 0 and bid_max > 0:
                analysis['ai_recommended_bid'] = (bid_min + bid_max) / 2

            # Handle match score
            if user_profile:
                analysis['ai_match_score'] = result.get('ai_match_score', 50)

            return analysis

        except Exception as e:
            print(f"AI analysis error: {e}")
            return {
                'ai_summary': 'Analyysi epäonnistui',
                'category': 'Muut palvelut',
                'ai_analysis': f'Virhe analyysissä: {str(e)}',
                'ai_recommended_bid': None,
                'ai_match_score': None
            }

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
