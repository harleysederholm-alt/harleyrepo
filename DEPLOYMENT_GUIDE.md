# PienHankinta-Vahti - Deployment Guide

## 📋 Esivalmistelut

### 1. Vaadittavat Tilit
- ✅ Supabase-tili (tietokanta)
- ✅ Vercel-tili (hosting)
- ✅ Groq AI API-avain (AI-analyysi)

### 2. Environment Variables Vercelissä

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GROQ_API_KEY=gsk_your_api_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 🚀 Quick Deploy

```bash
# 1. Clone & Install
git clone https://github.com/harleysederholm-alt/harleyrepo.git
cd harleyrepo
npm install

# 2. Setup Vercel
vercel link
vercel env pull .env.local

# 3. Deploy
vercel --prod
```

## 🐍 Python Scraper

```bash
cd scraper
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys
python main.py
```

## 📊 Production URL
https://pienhankinta-vahti.vercel.app
