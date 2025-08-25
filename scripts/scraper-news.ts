#!/usr/bin/env tsx
// Legal news scraper for Indian legal media
// Fetches news from Bar & Bench, LiveLaw, Legally India

import fs from 'fs/promises'
import path from 'path'
import Parser from 'rss-parser'
import { z } from 'zod'

const parser = new Parser()

// News item schema
export const NewsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  url: z.string(),
  source: z.string(),
  publishedDate: z.string(),
  category: z.string().optional(),
  author: z.string().optional(),
  imageUrl: z.string().optional(),
})

export type NewsItem = z.infer<typeof NewsItemSchema>

// RSS feed configurations
const NEWS_SOURCES = {
  'Bar & Bench': {
    url: 'https://www.barandbench.com/feed',
    category: 'General',
  },
  'LiveLaw': {
    url: 'https://www.livelaw.in/rss.xml',
    category: 'General',
  },
  'LiveLaw Supreme Court': {
    url: 'https://www.livelaw.in/supreme-court/rss.xml',
    category: 'Supreme Court',
  },
  'LiveLaw High Court': {
    url: 'https://www.livelaw.in/high-court/rss.xml',
    category: 'High Courts',
  },
  'Legally India': {
    url: 'https://www.legallyindia.com/rss.xml',
    category: 'General',
  },
  'SCC Blog': {
    url: 'https://www.scconline.com/blog/feed/',
    category: 'Analysis',
  },
  'Indian Constitutional Law': {
    url: 'https://indconlawphil.wordpress.com/feed/',
    category: 'Constitutional',
  },
  'Law and Other Things': {
    url: 'https://lawandotherthings.com/feed/',
    category: 'Academic',
  },
}

// Generate unique ID from URL
function generateId(url: string): string {
  return Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)
}

// Clean and truncate summary
function cleanSummary(content: string, maxLength: number = 300): string {
  // Remove HTML tags
  let clean = content.replace(/<[^>]*>/g, '')
  // Remove extra whitespace
  clean = clean.replace(/\s+/g, ' ').trim()
  // Truncate
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength - 3) + '...'
  }
  return clean
}

// Scrape RSS feed
async function scrapeNewsFeed(sourceName: string, config: { url: string, category: string }): Promise<NewsItem[]> {
  try {
    console.log(`Scraping ${sourceName}...`)
    const feed = await parser.parseURL(config.url)
    
    const newsItems: NewsItem[] = []
    
    // Process latest 20 items
    for (const item of feed.items.slice(0, 20)) {
      if (!item.title || !item.link) continue
      
      const newsItem: NewsItem = {
        id: generateId(item.link),
        title: item.title.trim(),
        summary: cleanSummary(item.contentSnippet || item.content || item.title),
        url: item.link,
        source: sourceName,
        publishedDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        category: config.category,
        author: item.creator || item.author,
        imageUrl: item.enclosure?.url,
      }
      
      newsItems.push(newsItem)
    }
    
    console.log(`Scraped ${newsItems.length} items from ${sourceName}`)
    return newsItems
  } catch (error) {
    console.error(`Failed to scrape ${sourceName}:`, error)
    return []
  }
}

// Main scraper function
async function scrapeLegalNews() {
  console.log('Starting legal news scraper...')
  
  const allNews: NewsItem[] = []
  
  // Scrape all sources
  for (const [sourceName, config] of Object.entries(NEWS_SOURCES)) {
    const newsItems = await scrapeNewsFeed(sourceName, config)
    allNews.push(...newsItems)
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Sort by published date (newest first)
  allNews.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
  
  // Remove duplicates based on title similarity
  const uniqueNews: NewsItem[] = []
  const seenTitles = new Set<string>()
  
  for (const item of allNews) {
    const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!seenTitles.has(normalizedTitle)) {
      seenTitles.add(normalizedTitle)
      uniqueNews.push(item)
    }
  }
  
  // Save to file
  const today = new Date()
  const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
  
  const dataDir = path.join(process.cwd(), 'data', 'news', today.getFullYear().toString(), (today.getMonth() + 1).toString().padStart(2, '0'))
  await fs.mkdir(dataDir, { recursive: true })
  
  const filename = `${today.getDate().toString().padStart(2, '0')}.json`
  const filepath = path.join(dataDir, filename)
  
  // Create news data structure
  const newsData = {
    date: today.toISOString(),
    count: uniqueNews.length,
    news: uniqueNews.slice(0, 50), // Top 50 news items
  }
  
  await fs.writeFile(filepath, JSON.stringify(newsData, null, 2))
  console.log(`Saved ${newsData.count} news items to ${filepath}`)
  
  // Also save a "today's news" file for easy access
  const todayPath = path.join(process.cwd(), 'public', 'data', 'today-news.json')
  await fs.mkdir(path.dirname(todayPath), { recursive: true })
  await fs.writeFile(todayPath, JSON.stringify(newsData, null, 2))
  console.log(`Saved today's news to ${todayPath}`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeLegalNews().catch(console.error)
}

export { scrapeLegalNews }
