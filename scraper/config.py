"""
Configuration for the procurement scraper system
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Supabase
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Groq AI
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

# Scraping targets - Finnish procurement websites
PROCUREMENT_SITES = {
    'hilma': {
        'name': 'HILMA (Julkisten hankintojen ilmoituskanava)',
        'base_url': 'https://www.hankintailmoitukset.fi',
        'search_url': 'https://www.hankintailmoitukset.fi/fi/public/procurement/search',
        'enabled': True,
        'scrape_interval_minutes': 60
    },
    'kuntien_hankinnat': {
        'name': 'Kuntien hankinnat',
        'urls': [
            'https://www.vantaa.fi/fi/tietoa-vantaasta/avoin-vantaa/hankinnat-ja-kilpailutukset',
            'https://www.espoo.fi/fi/tietoa-espoosta/avoin-espoo/hankinnat',
            'https://www.helsinki.fi/fi/tietoa-meista/hankinnat',
        ],
        'enabled': True,
        'scrape_interval_minutes': 120
    }
}

# AI Analysis settings
AI_MODEL = 'llama-3.3-70b-versatile'  # Groq model (updated 2025)
AI_TEMPERATURE = 0.3  # Lower for more consistent analysis
AI_MAX_TOKENS = 2000

# Scraper settings
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
REQUEST_TIMEOUT = 30  # seconds
RETRY_ATTEMPTS = 3
RATE_LIMIT_DELAY = 2  # seconds between requests
