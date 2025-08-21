# 🚀 5 Min Case - Setup Guide

## ✅ What's Ready

Your 5 Min Case app is fully built and ready to go! Here's what you have:

- **Frontend**: Beautiful Next.js app with your brand colors
- **Scraper**: Fetches cases from legal sources
- **AI Pipeline**: Generates 60-word TL;DRs and 5-min briefs
- **Automation**: GitHub Actions for daily updates
- **Demo Data**: 3 sample cases to test immediately

## 📋 Quick Setup Steps

### 1. Create `.env.local` file

Create a new file called `.env.local` in the project root with your API keys:

```env
# API Keys
GEMINI_API_KEY=AIzaSyANEBeYiW3I_hYvfXWaP9-Un4bpY3R5Hr8
PERPLEXITY_API_KEY=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

# Development
NODE_ENV=development
```

### 2. Install Dependencies

```bash
cd /Users/issac/Desktop/5mincase
npm install
```

### 3. Test Your API Keys

Run this command to verify your APIs are working:

```bash
npm run test-apis
```

You should see:
- ✅ Gemini API Response
- ✅ Perplexity API Response
- ✅ A sample legal summary

### 4. Start the Development Server

```bash
npm run dev
```

Open http://localhost:3000 to see your app!

## 🧪 Test the Full Pipeline

### Option A: Test with Real Data (Recommended)

1. Run the scraper to fetch real cases:
```bash
npm run scrape
```

2. Generate AI summaries:
```bash
npm run summarize
```

3. Build search indexes:
```bash
npm run build-index
```

4. Refresh your browser - you'll see real cases!

### Option B: Manual Test

The app already has 3 demo cases loaded. Just run `npm run dev` and explore!

## 🚢 Deploy to Production

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - 5 Min Case"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/5mincase.git
git push -u origin main
```

### 2. Add Secrets to GitHub

Go to your repo Settings → Secrets and variables → Actions → New repository secret

Add these secrets:
- `GEMINI_API_KEY` = your Gemini key
- `PERPLEXITY_API_KEY` = your Perplexity key

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add the same environment variables
4. Deploy!

### 4. Enable GitHub Actions

Go to the Actions tab in your GitHub repo and enable workflows. The scraper will run automatically every 6 hours.

## 🎯 What Happens Next

Once deployed:

1. **Every 6 hours**: GitHub Actions runs automatically
2. **Scrapes**: New cases from Indian Kanoon, UK courts
3. **Summarizes**: Uses Gemini for TL;DRs, Perplexity for context
4. **Commits**: Updates to your repo
5. **Deploys**: Vercel auto-deploys the changes

## 🔧 Customization

### Change Scraping Frequency

Edit `.github/workflows/daily-scrape.yml`:
```yaml
schedule:
  - cron: '0 */6 * * *'  # Current: every 6 hours
  # - cron: '0 9 * * *'  # Alternative: daily at 9 AM
```

### Add More Courts

Edit `scripts/scraper.ts` to add more RSS feeds:
```typescript
IN: {
  // Add more High Courts
  karnatakaHC: {
    name: 'Karnataka High Court',
    type: 'rss',
    url: 'https://indiankanoon.org/feeds/karnatakaHC.xml'
  }
}
```

### Adjust AI Prompts

Edit `scripts/summarizer.ts` to refine the brand voice or summary style.

## 🐛 Troubleshooting

### "No cases found"
- Run `npm run scrape` first
- Check if `data/cases/` directory has JSON files

### "API error"
- Verify your keys in `.env.local`
- Run `npm run test-apis` to debug
- Check API usage limits

### "Build failed"
- Make sure you ran `npm install`
- Check Node version (should be 18+)

## 📊 Monitoring

- **GitHub Actions**: Check the Actions tab for scraper logs
- **Vercel**: See deployment logs in Vercel dashboard
- **Local logs**: Check terminal when running scripts

## 🎉 Success!

Your legal doomscroll app is live! Share it with:
- Law students who need daily updates
- Lawyers tracking specific courts
- Legal researchers building case databases

Remember: This is just the beginning. The more it runs, the more cases you'll accumulate!

---

Need help? Check the README.md or open an issue on GitHub.
