
# 5 Min Case - Project Plan

## 🎯 Product Vision

**Tagline**: "Legal doomscroll: 60-word TL;DR → 5-minute brief → Swipe to next"

**Core Concept**: TikTok meets legal research. Daily judgments condensed into crisp, swipeable summaries that lawyers actually want to read during their commute.

**Target Users**:
- Law students (morning commute scroll)
- Associates (stay updated without drowning)
- In-house counsel (quick industry updates)
- Legal researchers (discover relevant cases)

## 🎨 Brand Guidelines

### Colors
```css
--dark-authority: #051F20    /* CTAs, emphasis */
--deep-emerald: #0B2B26     /* Primary UI, prestige */
--slate-green: #163832      /* Neutral, balance */
--muted-teal: #235547       /* Secondary text */
--soft-sage: #8EB9B8        /* Backgrounds */
--pale-mint: #DAF1DE        /* Highlights, freshness */
```

### Typography
- **Headlines**: Merriweather (Light, Normal)
- **Body**: Inter (Regular, Semibold, Bold)
- **Multi-language**: Noto Sans

### Voice & Tone
- Sharp, witty, conversational
- NO legal jargon ("Hon'ble", "elucidated", "tenets")
- Lead with impact: "[WHO] held [WHAT] because [WHY]"
- Example: "SC held that denying bail violates Article 21 — liberty > pendency"

## 📊 Data Architecture

### Case Schema
```typescript
{
  id: string
  jurisdiction: "US" | "IN" | "UK"
  court: string
  date: string (ISO)
  neutralCitation?: string
  reporterCitations?: string[]
  parties: { title: string }
  statutes: string[]
  outcome?: string
  source: "courtlistener" | "indiankanoon" | "judiciary-uk"
  url: string
  tldr60: string // EXACTLY 60 words
  brief5min: {
    facts: string
    issues: string
    holding: string
    reasoning: string
    disposition: string
  }
  keyQuotes: { quote: string, pin?: string }[]
  tags: string[] // practice areas
}
```

### Storage Structure (GitHub)
```
/data
  /cases
    /2025
      /01
        /15.json    # Array of cases for this day
        /16.json
  /index.json       # Master index with metadata
  /trending.json    # Updated hourly
  /search-index.json # Pre-built for client-side search
```

## 🔧 Tech Stack

### Phase 1 (MVP - $5/month)
- **Frontend**: Next.js 14 + Tailwind + Vercel (free)
- **Database**: GitHub repo (JSON files)
- **AI**: Gemini (free tier) + Perplexity ($5)
- **Search**: Client-side with Fuse.js
- **Auth**: None (localStorage only)
- **Automation**: GitHub Actions

### Phase 2 (Growth)
- **Auth**: Firebase Auth (free tier)
- **User Data**: Firebase Firestore
- **Search**: Typesense Cloud (free tier)
- **Analytics**: Vercel Analytics

## 📚 Data Sources

### Free & Legal Sources
1. **US**: 
   - CourtListener API (free, unlimited)
   - Case.law (500 cases/day free)
   
2. **India**:
   - eCourts (government, free)
   - Supreme Court RSS feeds
   - High Court websites (direct PDFs)
   
3. **UK**:
   - BAILII (respectful crawling)
   - Judiciary.uk RSS feeds

### Never Use
- Paid database content (Westlaw, LexisNexis)
- Proprietary headnotes
- Scraped commercial services

## 🚀 Implementation Phases

### Phase 1: Static MVP (Week 1-2)
**Goal**: Prove concept with 1000 cases

- [ ] Set up Next.js with brand styling
- [ ] Create GitHub Actions scraper
- [ ] Implement Gemini summarization
- [ ] Build swipeable case feed
- [ ] Deploy to Vercel
- [ ] Local bookmarks with localStorage

**Features**:
- Today's cases feed
- 60-word TL;DR + 5-min briefs
- Basic filters (court, jurisdiction)
- Keyboard navigation
- Share case (copy link)

### Phase 2: Personalization (Week 3-4)
**Goal**: 10k cases, 1000 users

- [ ] Add Firebase Auth (optional login)
- [ ] Sync bookmarks to cloud
- [ ] "Follow" courts/topics
- [ ] Daily email digest
- [ ] Trending cases
- [ ] Search improvements

### Phase 3: Scale (Month 2)
**Goal**: 50k cases, 5000 users

- [ ] Multi-jurisdiction expansion
- [ ] Advanced search with Typesense
- [ ] User-suggested corrections
- [ ] Export to PDF/Notion
- [ ] Analytics dashboard

## ✨ Core Features

### MVP Must-Haves
1. **Swipe Feed**: One case per screen, swipe up for next
2. **60-Word TL;DR**: AI-generated, brand voice enforced
3. **5-Min Brief**: Structured sections (Facts → Issues → Holding → Reasoning → Disposition)
4. **Filters**: Court, Year, Area, Jurisdiction chips
5. **Save Locally**: Bookmark cases to "Brief Bank"
6. **Source Links**: Always link to official judgment

### Nice-to-Haves
1. **Dark Mode**: System-aware theme
2. **Keyboard Nav**: Arrow keys for power users
3. **Trending Rail**: "Hot cases this week"
4. **Pull Quotes**: Key excerpts with paragraph pins
5. **Reading Time**: "5 min" badge on each case

### Future Features
1. **AI Explainers**: "What does this mean for..."
2. **Related Cases**: Perplexity-powered connections
3. **Practice Notes**: Role-specific summaries
4. **Audio Briefs**: TTS for commute
5. **Collaborative Notes**: Team annotations

## 📱 UI/UX Decisions

### Mobile-First
- Full-screen case cards
- Swipe gestures (up = next, left = save)
- Bottom navigation bar
- Minimal chrome

### Desktop Enhancement
- Sidebar navigation
- Trending rail
- Keyboard shortcuts
- Multi-column layout

### Accessibility
- Font size controls
- High contrast mode
- Screen reader friendly
- Reduced motion option

## 🤖 AI Prompts

### TL;DR Generation (Gemini)
```
You are 5 Min Case AI. Summarize in EXACTLY 60 words.
Format: [WHO] held [WHAT] because [WHY]. This means [IMPACT].
Use plain English. No jargon. Be sharp and conversational.
```

### 5-Min Brief (Gemini)
```
Create a structured brief with:
1. Facts: What happened? (2-3 sentences)
2. Issues: Legal questions (1-2 points)
3. Holding: Court's answer (1 sentence)
4. Reasoning: Why? (2-3 sentences)
5. Disposition: What happens next (1 sentence)
```

### Find Related (Perplexity)
```
Find recent cases similar to: [summary]
Focus on same jurisdiction and practice area.
Return top 3 with explanations.
```

## 📈 Success Metrics

### Phase 1
- 1000 cases indexed
- 100 daily users
- 50% return rate

### Phase 2  
- 10k cases indexed
- 1000 weekly actives
- 100 email subscribers
- 10 saves per user

### Phase 3
- 50k cases indexed
- 5000 monthly actives
- 20% pay for premium
- Featured in legal blogs

## 🚫 What We Won't Do

1. **Store full judgment text** (link only)
2. **Copy commercial headnotes**
3. **Require login for basic use**
4. **Charge for core features**
5. **Use invasive tracking**

## 🎯 North Star

Every decision should answer: **"Does this help a tired lawyer understand a case in 5 minutes?"**

If it doesn't make case law more accessible, we don't build it.

---

*Last updated: [Date]*
*Version: 1.0*
```
