# 5 Min Case - Legal Doomscroll

> Case closed, in 60 words. Your daily legal scroll.

5 Min Case is a legal doomscroll app that condenses complex judgments into 60-word TL;DRs and 5-minute structured briefs. Built for lawyers, law students, and legal enthusiasts who need to stay updated without drowning in PDFs.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
5mincase/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main feed page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── scripts/               # Data processing scripts
│   ├── scraper.ts        # Fetches cases from sources
│   ├── summarizer.ts     # AI-powered summarization
│   └── build-index.ts    # Builds search indexes
├── data/                  # Case data (git-tracked)
│   ├── cases/            # Processed cases by date
│   ├── index.json        # Master index
│   └── trending.json     # Trending cases
├── types/                 # TypeScript types
└── .github/workflows/     # GitHub Actions
```

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run scrape` - Manually run case scraper
- `npm run summarize` - Process raw cases with AI
- `npm run build-index` - Build search indexes
- `npm run daily-update` - Run full pipeline

## 🤖 Automated Updates

GitHub Actions runs every 6 hours to:
1. Scrape new cases from legal sources
2. Generate AI summaries
3. Build search indexes
4. Commit changes to the repo
5. Trigger Vercel deployment

## 📊 Data Sources

- **US**: CourtListener (free API)
- **India**: Indian Kanoon RSS, eCourts
- **UK**: Judiciary.uk RSS feeds

All sources are free and legal to use.

## 🎨 Brand Guidelines

- **Colors**: Deep emerald (#0B2B26), Pale mint (#DAF1DE)
- **Typography**: Merriweather (headings), Inter (body)
- **Voice**: Sharp, witty, conversational - no legal jargon

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

The app auto-deploys on every push to main.

### Manual Deployment

```bash
npm run build
npm start
```

## 🔐 API Keys

Get your free API keys:
- **Gemini**: https://makersuite.google.com/app/apikey
- **Perplexity**: https://www.perplexity.ai/settings/api ($5/month)

## 📱 Features

- ✅ 60-word TL;DR summaries
- ✅ 5-minute structured briefs
- ✅ Swipeable case feed
- ✅ Local bookmarks
- ✅ Dark mode
- ✅ Keyboard navigation
- ✅ Mobile responsive

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **AI**: Gemini (free tier), Perplexity ($5)
- **Database**: GitHub (JSON files)
- **Hosting**: Vercel (free)
- **Automation**: GitHub Actions

## 📄 License

MIT - Use freely for any purpose.

## 🤝 Contributing

PRs welcome! Please follow the existing code style.

---

Built with ❤️ for the legal community. Law in 5 minutes.
