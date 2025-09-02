#!/usr/bin/env tsx
// Legal news scraper for Indian legal media
// Fetches news from Bar & Bench, LiveLaw, Legally India

import fs from 'fs/promises'
import path from 'path'
import Parser from 'rss-parser'
import { z } from 'zod'
import { databases, DB_ID, NEWS_COL_ID, ID } from '../lib/appwrite-server'
import { Permission, Role, Query } from 'node-appwrite'

// Be lenient with feeds that have bad entities
const parser = new Parser({
  // @ts-ignore internal option pass-through
  xml2js: { explicitArray: false, strict: false, preserveChildrenOrder: true },
  headers: { 'user-agent': '5mincase-scraper/1.0' },
  timeout: 15000,
})

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

// Defensively scrape RSS feed - return [] on any error
async function scrapeNewsFeed(sourceName: string, config: { url: string, category: string }): Promise<NewsItem[]> {
  try {
    console.log(`Scraping ${sourceName}...`)
    const feed = await parser.parseURL(config.url)
    
    const newsItems: NewsItem[] = []
    
    // Process latest 20 items
    const items = feed.items || []
    for (const item of items.slice(0, 20)) {
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
  } catch (error: any) {
    console.warn(`Skip feed ${sourceName} (${config.url}):`, error?.message || error)
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
  
  // Store news in Appwrite with proper permissions
  console.log(`Storing ${newsData.count} news items to Appwrite`)
  let successCount = 0
  
  for (const item of newsData.news) {
    try {
      await databases.createDocument(
        DB_ID, 
        NEWS_COL_ID, 
        ID.unique(), 
        {
          id: item.id,
          type: 'news',
          data: JSON.stringify(item),
        },
        [
          Permission.read(Role.any()),  // Anyone can read
          Permission.write(Role.team('server')), // Only server can write
        ]
      )
      successCount++
    } catch (err: any) {
      if (err?.code === 409) {
        // Document already exists - that's ok
        successCount++
      } else {
        console.error(`Failed to store news ${item.id}:`, err?.message || err)
      }
    }
    await new Promise(r => setTimeout(r, 100)) // Rate limit
  }
  console.log(`Successfully stored ${successCount}/${newsData.count} news items to Appwrite`)
  
  // Clean up old news (older than 7 days)
  await cleanupOldNews()
}

// Clean up old news items
async function cleanupOldNews() {
  console.log('Cleaning up old news items...')
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 7) // Keep news for 7 days
  const cutoffISO = cutoffDate.toISOString()
  
  let totalDeleted = 0
  let offset = 0
  const pageSize = 100
  
  while (true) {
    try {
      const result = await databases.listDocuments(DB_ID, NEWS_COL_ID, [
        Query.limit(pageSize),
        Query.offset(offset)
      ])
      
      if (!result.documents || result.documents.length === 0) break
      
      const documentsToDelete: string[] = []
      
      for (const doc of result.documents as any[]) {
        try {
          const newsData = JSON.parse(doc.data)
          const publishedDate = new Date(newsData.publishedDate)
          
          if (publishedDate < cutoffDate) {
            documentsToDelete.push(doc.$id)
          }
        } catch (error) {
          // Skip malformed documents
        }
      }
      
      // Delete old documents
      for (const docId of documentsToDelete) {
        try {
          await databases.deleteDocument(DB_ID, NEWS_COL_ID, docId)
          totalDeleted++
          await new Promise(resolve => setTimeout(resolve, 100)) // Rate limit
        } catch (error) {
          console.error(`Failed to delete old news ${docId}:`, error)
        }
      }
      
      if (result.documents.length < pageSize) break
      offset += result.documents.length
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error('Error during news cleanup:', error)
      break
    }
  }
  
  console.log(`Cleaned up ${totalDeleted} old news items`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeLegalNews().catch(console.error)
}

export { scrapeLegalNews }
