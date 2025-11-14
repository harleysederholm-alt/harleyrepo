# Scraper Setup Instructions

## Step 1: Install Python and pip

Your Python installation is missing pip. Here's how to fix it:

### Option A: Install pip using ensurepip (Recommended)

```bash
python -m ensurepip --upgrade
```

### Option B: Download and install pip manually

```bash
# Download get-pip.py
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py

# Run it
python get-pip.py
```

### Option C: Reinstall Python

Download and reinstall Python from: https://www.python.org/downloads/

**IMPORTANT**: Check "Add Python to PATH" and "Install pip" during installation!

## Step 2: Verify pip installation

```bash
python -m pip --version
```

Should show something like: `pip 24.0 from C:\...\site-packages\pip (python 3.13)`

## Step 3: Install scraper dependencies

```bash
cd harleyrepo/scraper
pip install -r requirements.txt
```

## Step 4: Configure environment variables

```bash
# Copy the example file
copy .env.example .env

# Edit .env and add your credentials:
# - NEXT_PUBLIC_SUPABASE_URL (from Supabase dashboard)
# - SUPABASE_SERVICE_ROLE_KEY (from Supabase dashboard → Settings → API)
# - GROQ_API_KEY (from https://console.groq.com/keys)
```

## Step 5: Test the scraper

```bash
# Test with mock data (doesn't require HILMA access)
python main.py
```

Expected output:
```
╔══════════════════════════════════════════════════╗
║   PienHankinta-Vahti Scraper & Analyzer         ║
║   Finnish Public Procurement Intelligence       ║
╚══════════════════════════════════════════════════╝

============================================================
Starting scraper pipeline at 2025-11-14 22:30:00
============================================================

[1/4] Scraping HILMA...
2025-11-14 22:30:01 - INFO - Starting HILMA scraper (max_results=20)
2025-11-14 22:30:01 - INFO - Trying method: API
2025-11-14 22:30:02 - WARNING - ✗ API returned no results
2025-11-14 22:30:02 - INFO - Trying method: RSS Feed
2025-11-14 22:30:03 - WARNING - ✗ RSS Feed returned no results
2025-11-14 22:30:03 - INFO - Trying method: Mock Data
2025-11-14 22:30:03 - INFO - ✓ Mock Data succeeded: 20 procurements
✓ Scraped 20 procurements

[2/4] Saving to database...
✓ Saved: Helsinki kaupunki - Julkisivu 2025...
✓ Saved: Espoo kaupunki - Saneeraus 2025...
...
✓ Saved 20 procurements to database

[3/4] Running AI analysis...
Found 20 procurements without analysis
Analyzing: Helsinki kaupunki - Julkisivu 2025...
  ✓ Category: Rakentaminen
  ✓ Summary: Helsinki kaupunki hakee julkisivumaalauspalveluja...
...
✓ Analyzed 20 procurements

[4/4] Matching with user profiles...
Found 0 user profiles

============================================================
Pipeline complete at 2025-11-14 22:35:00
Total procurements processed: 20
Total procurements analyzed: 20
============================================================
```

## Troubleshooting

### "No module named 'X'"

Solution: Install requirements again
```bash
pip install -r requirements.txt
```

### "GROQ_API_KEY not found"

Solution: Check your .env file
```bash
cat .env
# Make sure GROQ_API_KEY is set
```

### "Database error: Invalid API key"

Solution: Use SERVICE_ROLE_KEY, not ANON_KEY
```bash
# In Supabase Dashboard:
# Settings → API → service_role key (keep secret!)
```

### Scraper hangs or times out

Solution: Check internet connection, HILMA website might be down. Mock data will work anyway!

## Next Steps

Once the scraper works:

1. **Schedule it**: Use cron, GitHub Actions, or Railway to run hourly
2. **Monitor logs**: Check Supabase for new data
3. **Test dashboard**: Refresh your app at https://pienhankinta-vahti.vercel.app
4. **See procurements**: New data should appear in your dashboard!

## Need Help?

Check these files:
- `README.md` - Full scraper documentation
- `FINAL_SUMMARY.md` (in root) - Complete project status
- `TESTING_GUIDE.md` (in root) - Testing procedures
