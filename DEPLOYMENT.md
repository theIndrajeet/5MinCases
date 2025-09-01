# 🚀 5MinCase Deployment Guide

Your legal doomscroll app is ready for deployment! Here's how to deploy it to Vercel.

## ✅ Pre-Deployment Checklist

- [x] Next.js dev server working
- [x] Environment variables configured  
- [x] Production build successful
- [x] Appwrite database connected (9 cases + 27 news items)
- [x] AI summarization working (Gemini + Perplexity)
- [x] IndianKanoon API integration working

## 🌐 Deploy to Vercel

### 1. Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select your `5mincase` repository
5. Click "Import"

### 2. Configure Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables** and add:

```env
# Appwrite (Required)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68ac4c70000b38859c8d
APPWRITE_API_KEY=your_server_api_key_here
NEXT_PUBLIC_APPWRITE_DB_ID=your_database_id_here
NEXT_PUBLIC_APPWRITE_CASES_COL_ID=your_cases_collection_id_here
NEXT_PUBLIC_APPWRITE_NEWS_COL_ID=your_news_collection_id_here
NEXT_PUBLIC_APPWRITE_BOOKMARKS_COL_ID=your_bookmarks_collection_id_here

# AI APIs (Optional)
GEMINI_API_KEY=your_gemini_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Data Sources (Optional)
INDIANKANOON_API_KEY=your_indiankanoon_api_key_here
```

### 3. Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at `https://your-app-name.vercel.app`

## 📱 PWA Features

Your app includes:
- **Installable**: Users can add to home screen
- **Offline Support**: Service worker caches content
- **Mobile Gestures**: Swipe up/down/left/right
- **App-like Experience**: Full screen, no browser UI

## 🔄 Automatic Updates

### GitHub Actions (Optional)

To automatically scrape new cases daily:

1. Go to GitHub → Settings → Secrets
2. Add all environment variables as secrets
3. The workflow in `.github/workflows/daily-scrape.yml` will run every 6 hours

## 🧪 Testing Your Deployment

### Desktop
Visit your Vercel URL and test:
- [x] Cases load from Appwrite
- [x] News articles display
- [x] Search and filtering work
- [x] Dark mode toggle
- [x] Bookmark saving (localStorage)

### Mobile
1. Visit on mobile device
2. Test PWA installation:
   - **iOS**: Safari → Share → Add to Home Screen
   - **Android**: Chrome → Menu → Add to Home Screen
3. Test swipe gestures:
   - Swipe up: Next case
   - Swipe down: Previous case
   - Swipe left: Bookmark
   - Swipe right: Share

## 🎯 Current Content

Your app launches with:
- **9 Indian Legal Cases** (Constitution, Criminal Procedure)
- **27 Legal News Articles** (SCC Blog, Legal Blogs)
- **AI-Ready**: Gemini summarization configured

## 💰 Cost Breakdown

- **Vercel**: Free (Hobby plan)
- **Appwrite**: Free tier (up to 75k requests/month)
- **Gemini API**: Free tier (60 requests/minute)
- **Perplexity**: $5/month (optional)
- **IndianKanoon**: Pay-per-use (~₹10/month for daily scraping)

**Total: FREE to $5/month**

## 🔧 Customization

### Update Branding
- Edit `public/manifest.json` for PWA details
- Update `app/layout.tsx` for meta tags
- Modify colors in `tailwind.config.ts`

### Add More Data Sources
- Create new scrapers in `scripts/`
- Add to `daily-update` npm script
- Configure in GitHub Actions

## 🐛 Troubleshooting

### Build Fails
- Check environment variables in Vercel
- Ensure no TypeScript errors: `npm run build`

### Data Not Loading
- Verify Appwrite configuration
- Check browser console for errors
- Test API connection: `npm run test-apis`

### PWA Not Installing
- Ensure HTTPS in production
- Check `public/manifest.json`
- Clear browser cache

## 🚀 Next Steps

1. **Custom Domain**: Add your domain in Vercel settings
2. **Analytics**: Add Vercel Analytics for usage tracking
3. **More Content**: Run scrapers daily for fresh cases
4. **User Feedback**: Add feedback form for improvements

Your legal doomscroll is ready to launch! 🎉⚖️
