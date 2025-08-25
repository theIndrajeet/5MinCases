#!/usr/bin/env tsx
// Scraper for multiple legal data sources
// Runs via GitHub Actions to fetch daily cases

import fs from 'fs/promises'
import path from 'path'
import Parser from 'rss-parser'
import { z } from 'zod'
import type { Case, Jurisdiction, Source } from '../types/case'

const parser = new Parser()

// Data source configurations
const SOURCES = {
  US: {
    courtlistener: {
      name: 'CourtListener',
      type: 'api',
      url: 'https://www.courtlistener.com/api/rest/v3/opinions/',
      params: {
        filed_after: '', // Will be set dynamically
        court: 'scotus,ca1,ca2,ca3,ca4,ca5,ca6,ca7,ca8,ca9,ca10,ca11,cadc',
        order_by: '-date_filed',
      }
    },
    caselaw: {
      name: 'Harvard Case.law',
      type: 'api',
      url: 'https://api.case.law/v1/cases/',
      params: {
        ordering: '-decision_date',
        page_size: 20,
        full_case: 'true'
      }
    }
  },
  IN: {
    supremecourt: {
      name: 'Supreme Court of India',
      type: 'rss',
      url: 'https://indiankanoon.org/feeds/supremecourt.xml'
    },
    delhihc: {
      name: 'Delhi High Court',
      type: 'rss',
      url: 'https://indiankanoon.org/feeds/delhihc.xml'
    },
    bombayhc: {
      name: 'Bombay High Court',
      type: 'rss',
      url: 'https://indiankanoon.org/feeds/bombayhc.xml'
    },
    sci_official: {
      name: 'Supreme Court Official',
      type: 'rss',
      url: 'https://main.sci.gov.in/rss/judgment'
    },
    ecourts: {
      name: 'eCourts Portal',
      type: 'api',
      url: 'https://judgments.ecourts.gov.in'
    }
  },
  UK: {
    judiciary: {
      name: 'UK Judiciary',
      type: 'web',
      url: 'https://www.judiciary.uk/feed/'
    }
  }
}

// Raw case schema from sources
const RawCaseSchema = z.object({
  title: z.string(),
  link: z.string(),
  pubDate: z.string().optional(),
  content: z.string().optional(),
  contentSnippet: z.string().optional(),
  court: z.string().optional(),
})

// Helper to extract court from various sources
function extractCourt(source: Source, data: any): string {
  switch (source) {
    case 'indiankanoon':
      if (data.link?.includes('supremecourt')) return 'Supreme Court of India'
      if (data.link?.includes('delhihc')) return 'Delhi High Court'
      if (data.link?.includes('bombayhc')) return 'Bombay High Court'
      return 'High Court'
    case 'courtlistener':
      return data.court_name || 'Federal Court'
    case 'judiciary-uk':
      return 'UK Courts'
    default:
      return 'Court'
  }
}

// Helper to extract parties from title
function extractParties(title: string): { title: string, appellant?: string, respondent?: string } {
  // Common patterns: "A v. B", "A vs B", "State of X v. Y"
  const patterns = [
    /^(.+?)\s+v\.\s+(.+)$/i,
    /^(.+?)\s+vs\.?\s+(.+)$/i,
    /^(.+?)\s+versus\s+(.+)$/i,
  ]

  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) {
      return {
        title: title.trim(),
        appellant: match[1].trim(),
        respondent: match[2].trim()
      }
    }
  }

  return { title: title.trim() }
}

// Scrape RSS feeds
async function scrapeRSSFeed(url: string, jurisdiction: Jurisdiction, source: Source): Promise<Partial<Case>[]> {
  try {
    console.log(`Scraping RSS feed: ${url}`)
    const feed = await parser.parseURL(url)
    
    return feed.items.slice(0, 20).map(item => {
      const validated = RawCaseSchema.parse(item)
      const parties = extractParties(validated.title)
      
      return {
        jurisdiction,
        court: extractCourt(source, validated),
        date: validated.pubDate ? new Date(validated.pubDate).toISOString() : new Date().toISOString(),
        parties,
        source,
        url: validated.link,
        // These will be filled by the summarizer
        tldr60: '',
        brief5min: {
          facts: '',
          issues: '',
          holding: '',
          reasoning: '',
          disposition: ''
        },
        keyQuotes: [],
        tags: [],
        statutes: []
      }
    })
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error)
    return []
  }
}

// Scrape CourtListener API (completely FREE - no API key needed!)
async function scrapeCourtListener(): Promise<Partial<Case>[]> {
  try {
    console.log('Fetching from CourtListener (free API)...')
    
    // Get cases from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const dateFilter = sevenDaysAgo.toISOString().split('T')[0]
    
    const url = `https://www.courtlistener.com/api/rest/v4/search/?type=o&filed_after=${dateFilter}&court=scotus&order_by=-dateFiled`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': '5MinCase/1.0 (legal research tool)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`CourtListener API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`Found ${data.results?.length || 0} US cases from CourtListener`)
    
    return (data.results || []).slice(0, 10).map((item: any) => ({
      jurisdiction: 'US' as const,
      court: item.court || 'Federal Court',
      date: item.dateFiled || new Date().toISOString(),
      parties: {
        title: item.caseName || 'Unknown Case'
      },
      source: 'courtlistener' as const,
      url: item.absolute_url || `https://www.courtlistener.com/opinion/${item.id}/`,
      tldr60: '',
      brief5min: {
        facts: '',
        issues: '',
        holding: '',
        reasoning: '',
        disposition: ''
      },
      keyQuotes: [],
      tags: [],
      statutes: []
    }))
    
  } catch (error) {
    console.error('CourtListener scraping failed:', error)
    return []
  }
}

// Scrape Harvard Case.law API (FREE - 500 cases/day)
async function scrapeCaseLaw(): Promise<Partial<Case>[]> {
  try {
    console.log('Fetching from Harvard Case.law (free API)...')
    
    const url = 'https://api.case.law/v1/cases/?ordering=-decision_date&page_size=20&jurisdiction=us'
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': '5MinCase/1.0 (legal research tool)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Case.law API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`Found ${data.results?.length || 0} cases from Harvard Case.law`)
    
    return (data.results || []).slice(0, 10).map((item: any) => ({
      jurisdiction: 'US' as const,
      court: item.court?.name || 'US Court',
      date: item.decision_date || new Date().toISOString(),
      parties: {
        title: item.name_abbreviation || item.name || 'Unknown Case'
      },
      source: 'caselaw' as const,
      url: item.frontend_url || `https://cite.case.law/${item.citations?.[0]?.cite}`,
      neutralCitation: item.citations?.[0]?.cite,
      tldr60: '',
      brief5min: {
        facts: '',
        issues: '',
        holding: '',
        reasoning: '',
        disposition: ''
      },
      keyQuotes: [],
      tags: [],
      statutes: []
    }))
    
  } catch (error) {
    console.error('Case.law scraping failed:', error)
    return []
  }
}

// Main scraper function
export async function scrapeAllSources(): Promise<Partial<Case>[]> {
  const allCases: Partial<Case>[] = []
  
  // Scrape Indian sources
  for (const [key, config] of Object.entries(SOURCES.IN)) {
    if (config.type === 'rss') {
      const cases = await scrapeRSSFeed(config.url, 'IN', 'indiankanoon')
      allCases.push(...cases)
    }
  }
  
  // Scrape UK sources
  for (const [key, config] of Object.entries(SOURCES.UK)) {
    if (config.type === 'web') {
      // For now, treat as RSS
      const cases = await scrapeRSSFeed(config.url, 'UK', 'judiciary-uk')
      allCases.push(...cases)
    }
  }
  
  // Scrape US sources (completely FREE!)
  const courtListenerCases = await scrapeCourtListener()
  allCases.push(...courtListenerCases)
  
  const caseLawCases = await scrapeCaseLaw()
  allCases.push(...caseLawCases)
  
  return allCases
}

// Save cases to data directory
async function saveCases(cases: Partial<Case>[]) {
  const dataDir = path.join(process.cwd(), 'data', 'raw')
  await fs.mkdir(dataDir, { recursive: true })
  
  const today = new Date().toISOString().split('T')[0]
  const filename = path.join(dataDir, `${today}-raw.json`)
  
  // If file exists, merge with existing cases
  let existingCases: Partial<Case>[] = []
  try {
    const existing = await fs.readFile(filename, 'utf-8')
    existingCases = JSON.parse(existing)
  } catch (error) {
    // File doesn't exist yet
  }
  
  // Merge and deduplicate by URL
  const urlSet = new Set(existingCases.map(c => c.url))
  const newCases = cases.filter(c => !urlSet.has(c.url))
  const allCases = [...existingCases, ...newCases]
  
  await fs.writeFile(filename, JSON.stringify(allCases, null, 2))
  console.log(`Saved ${newCases.length} new cases (${allCases.length} total) to ${filename}`)
}

// Run scraper
async function main() {
  console.log('Starting case scraper...')
  const startTime = Date.now()
  
  try {
    const cases = await scrapeAllSources()
    console.log(`Scraped ${cases.length} cases`)
    
    if (cases.length > 0) {
      await saveCases(cases)
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`Scraping completed in ${duration} seconds`)
  } catch (error) {
    console.error('Scraper failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}
