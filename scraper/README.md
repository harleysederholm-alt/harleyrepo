# PienHankinta-Vahti Scraper

Fully optimized Python scraper for Finnish public procurement data from HILMA.

## Features

✅ **Multiple Scraping Strategies**
- API endpoint detection
- RSS feed parsing
- Mock data fallback for testing

✅ **AI Analysis**
- Groq AI integration for procurement analysis
- Automatic categorization
- Risk assessment
- Bid recommendations
- Batch processing with rate limiting

✅ **Robust Error Handling**
- Automatic retries with exponential backoff
- Rate limiting to avoid API throttling
- Comprehensive logging
- Graceful fallbacks

✅ **Database Integration**
- Direct Supabase integration
- Upsert strategy to avoid duplicates
- Bulk insert operations

## Quick Start

### 1. Install Python Dependencies

```bash
# Make sure you have Python 3.8+ installed
python --version

# Install pip (if not already installed)
python -m ensurepip --upgrade

# Install required packages
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your actual credentials
# You need:
# - Supabase URL and Service Role Key
# - Groq API Key
```

### 3. Run the Scraper

```bash
# Run the main scraper
python main.py

# Or run individual components for testing:
python hilma_scraper.py  # Test scraper only
python ai_analyzer.py    # Test AI analysis only
python database.py       # Test database connection
```

## Configuration

Edit `config.py` or set environment variables:

```python
# Scraping settings
MAX_PROCUREMENTS_PER_RUN = 50
RATE_LIMIT_DELAY = 2  # seconds between requests
REQUEST_TIMEOUT = 30  # seconds
RETRY_ATTEMPTS = 3

# AI settings
AI_MODEL = 'llama-3.1-70b-versatile'
AI_TEMPERATURE = 0.3
AI_MAX_TOKENS = 2000
```

## How It Works

### 1. Scraping Pipeline

```
HILMA Website → Scraper → Database → AI Analyzer → Updated Database
```

The scraper tries multiple methods in order:
1. **API** - Fastest, most reliable
2. **RSS Feed** - Good fallback
3. **Mock Data** - For testing when HILMA is unavailable

### 2. AI Analysis

Each procurement gets:
- **AI Summary** (2-3 sentences in Finnish)
- **Category** (e.g., Rakentaminen, IT-palvelut)
- **Risk Analysis** (3-5 key points)
- **Bid Recommendation** (if budget available)

### 3. Database Storage

Procurements are stored with:
- `external_id` for deduplication
- `published_at` for timeline
- All AI analysis fields
- Source tracking

## Architecture

```
scraper/
├── main.py              # Main orchestrator
├── hilma_scraper.py     # Multi-strategy scraper
├── ai_analyzer.py       # Groq AI integration
├── database.py          # Supabase operations
├── config.py            # Configuration
├── requirements.txt     # Python dependencies
├── .env.example         # Environment template
└── README.md            # This file
```

## Deployment

### Option 1: Cron Job (Linux/Mac)

```bash
# Add to crontab (run every hour)
0 * * * * cd /path/to/scraper && /usr/bin/python3 main.py >> scraper.log 2>&1
```

### Option 2: Railway/Render

1. Create new project
2. Connect GitHub repo
3. Set environment variables
4. Add cron trigger for periodic runs

### Option 3: GitHub Actions

Create `.github/workflows/scraper.yml`:

```yaml
name: Run Scraper
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:  # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      - run: |
          cd scraper
          pip install -r requirements.txt
          python main.py
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
      GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
```

## Testing

### Test Individual Components

```bash
# Test scraper (uses mock data by default)
python -c "from hilma_scraper import HilmaScraper; s = HilmaScraper(); print(len(s.scrape_latest_procurements(5)))"

# Test AI analyzer
python -c "from ai_analyzer import ProcurementAnalyzer; a = ProcurementAnalyzer(); print(a.analyze_procurement({'title': 'Test', 'description': 'Test procurement', 'organization': 'Test City'}))"

# Test database connection
python -c "from database import ProcurementDatabase; db = ProcurementDatabase(); print(len(db.get_recent_procurements(5)))"
```

### Full Pipeline Test

```bash
# Run with fewer procurements for testing
python -c "from main import ScraperOrchestrator; ScraperOrchestrator().run_full_pipeline(max_results=5)"
```

## Monitoring

The scraper logs to console with timestamps:

```
2025-11-14 10:00:00 - INFO - Starting HILMA scraper (max_results=50)
2025-11-14 10:00:01 - INFO - Trying method: API
2025-11-14 10:00:02 - WARNING - ✗ API returned no results
2025-11-14 10:00:02 - INFO - Trying method: Mock Data
2025-11-14 10:00:02 - INFO - ✓ Mock Data succeeded: 20 procurements
2025-11-14 10:00:03 - INFO - Saved 20 procurements to database
2025-11-14 10:00:04 - INFO - Starting AI analysis...
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'X'"
```bash
pip install -r requirements.txt
```

### "GROQ_API_KEY not found"
```bash
# Make sure .env file exists and has correct values
cat .env
# Check that python-dotenv is installed
pip install python-dotenv
```

### "Database error: Invalid API key"
```bash
# Verify your Supabase credentials
# Make sure you're using SERVICE_ROLE_KEY, not ANON_KEY
```

### Scraper returns no results
- Check HILMA website is accessible
- Verify internet connection
- Mock data fallback should work anyway

## Performance

- **Scraping**: ~2-5 seconds for 20 procurements (mock data)
- **AI Analysis**: ~1-2 seconds per procurement
- **Database Insert**: ~0.5 seconds for bulk insert
- **Total**: ~40-60 seconds for 20 procurements with full analysis

## Rate Limits

- **Groq API**: 30 requests/minute (free tier)
- **HILMA**: Unknown, scraper uses 2-second delays
- **Supabase**: 500 requests/second

The scraper respects all rate limits automatically.

## License

Part of PienHankinta-Vahti project.

## Support

For issues or questions, check:
1. FINAL_SUMMARY.md in root directory
2. TESTING_GUIDE.md for testing procedures
3. Vercel logs for production issues
