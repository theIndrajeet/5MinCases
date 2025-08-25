#!/usr/bin/env tsx
// Test the Indian Kanoon and News scrapers

import { scrapeIndianKanoon } from './scraper-indiankanoon'
import { scrapeLegalNews } from './scraper-news'

async function testScrapers() {
  console.log('🧪 Testing scrapers...\n')
  
  // Test Indian Kanoon API
  console.log('1️⃣ Testing Indian Kanoon scraper...')
  console.log('   This will fetch yesterday\'s cases from Supreme Court and High Courts')
  console.log('   Cost estimate: ~₹10-15 for test run\n')
  
  try {
    await scrapeIndianKanoon()
    console.log('✅ Indian Kanoon scraper completed successfully!\n')
  } catch (error) {
    console.error('❌ Indian Kanoon scraper failed:', error)
    console.error('   Check your INDIANKANOON_API_KEY in .env.local\n')
  }
  
  // Test News scraper
  console.log('2️⃣ Testing News scraper...')
  console.log('   This will fetch latest legal news from RSS feeds (free)\n')
  
  try {
    await scrapeLegalNews()
    console.log('✅ News scraper completed successfully!\n')
  } catch (error) {
    console.error('❌ News scraper failed:', error)
  }
  
  console.log('🎉 Testing complete! Check the following files:')
  console.log('   - data/raw/*-indiankanoon.json (raw case data)')
  console.log('   - data/news/*/today.json (news data)')
  console.log('   - public/data/today-news.json (for frontend)')
  console.log('\nNext steps:')
  console.log('   1. Run summarizer on the raw cases: npm run summarize')
  console.log('   2. Build search index: npm run build-index')
  console.log('   3. Start dev server: npm run dev')
}

testScrapers().catch(console.error)
