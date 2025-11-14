# Python Scraper Setup Instructions

## Prerequisites

The Python scraper requires pip to install dependencies. Your current Python 3.13.7 installation does not have pip.

## Option 1: Reinstall Python with pip

1. Download Python from https://www.python.org/downloads/
2. **IMPORTANT**: During installation, check "Add Python to PATH" and "Install pip"
3. Verify installation:
   ```bash
   python --version
   pip --version
   ```

## Option 2: Install pip manually

```bash
python -m ensurepip --upgrade
```

## Once pip is installed:

1. Navigate to scraper directory:
   ```bash
   cd harleyrepo/scraper
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Verify .env file has correct values:
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY
   - GROQ_API_KEY

4. Test the scraper:
   ```bash
   python main.py
   ```

## Expected Output

The scraper should:
1. Connect to HILMA website
2. Scrape latest procurement announcements
3. Save them to Supabase database
4. Analyze each with Groq AI
5. Update database with AI analysis results

## Troubleshooting

### HILMA Website Changes
If scraping fails, the HILMA website HTML structure may have changed. Update the CSS selectors in `hilma_scraper.py`:
- Line 45-70: Procurement item parsing

### Rate Limiting
Groq API has rate limits. The scraper includes 1-second delays between API calls. If you hit limits, increase the delay in `main.py` line 67.

### Database Connection
Ensure your Supabase service key has write permissions to the `hankinnat` table.

## Production Deployment

For production, run the scraper on a schedule:

### Option 1: Windows Task Scheduler
1. Create a batch file: `run_scraper.bat`
   ```batch
   cd C:\Users\harle\OneDrive\Tiedostot\GitHub\harleyrepo\scraper
   python main.py
   ```
2. Add to Task Scheduler to run every hour

### Option 2: Cloud Service (Recommended)
Deploy to a cloud service that supports cron jobs:
- Railway.app
- Render.com
- Heroku
- DigitalOcean App Platform

Example cron schedule: `0 * * * *` (every hour)

## Next Steps

1. Install pip
2. Install dependencies
3. Test scraper locally
4. Verify data appears in Supabase
5. Verify dashboard shows new procurements with AI analysis
6. Deploy to production with cron schedule
