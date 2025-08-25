#!/usr/bin/env tsx
// Indian Kanoon API scraper for case law
// Fetches judgments from Supreme Court and High Courts

import fs from 'fs/promises'
import path from 'path'
import { z } from 'zod'
import dotenv from 'dotenv'
import type { Case } from '../types/case'
import { Client, Databases, ID } from 'appwrite'

dotenv.config({ path: '.env.local' })

const API_KEY = process.env.INDIANKANOON_API_KEY
const API_BASE = 'https://api.indiankanoon.org'

if (!API_KEY) {
  console.error('Missing INDIANKANOON_API_KEY in .env.local')
  process.exit(1)
}

// Indian Kanoon search result schema
const IKSearchResultSchema = z.object({
  tid: z.string(),
  title: z.string(),
  docsource: z.string(),
  headline: z.string().optional(),
  docsize: z.number().optional(),
})

const IKSearchResponseSchema = z.object({
  docs: z.array(IKSearchResultSchema),
  found: z.number(),
  pagenum: z.number(),
})

// Indian Kanoon document schema
const IKDocumentSchema = z.object({
  doc: z.string(), // HTML content
  tid: z.string(),
  title: z.string(),
  docsource: z.string(),
  publishdate: z.string().optional(),
  author: z.string().optional(),
  bench: z.string().optional(),
  citeList: z.array(z.object({
    title: z.string(),
    tid: z.string(),
  })).optional(),
  citedbyList: z.array(z.object({
    title: z.string(),
    tid: z.string(),
  })).optional(),
})

// Helper to make API requests
async function makeAPIRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(endpoint, API_BASE)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Token ${API_KEY}`,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Extract parties from case title
function extractParties(title: string): { title: string, appellant?: string, respondent?: string } {
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

// Extract court from docsource
function extractCourt(docsource: string): string {
  // Examples: "Supreme Court of India", "Delhi High Court"
  return docsource.replace(/\s*\d{4}\s*$/, '').trim()
}

// Extract date from publishdate or title
function extractDate(publishdate?: string, title?: string): string {
  if (publishdate) {
    // Convert DD-MM-YYYY to ISO format
    const match = publishdate.match(/(\d{2})-(\d{2})-(\d{4})/)
    if (match) {
      return new Date(`${match[3]}-${match[2]}-${match[1]}`).toISOString()
    }
  }
  
  // Try to extract from title if no publishdate
  if (title) {
    const yearMatch = title.match(/\b(19\d{2}|20\d{2})\b/)
    if (yearMatch) {
      return new Date(`${yearMatch[1]}-01-01`).toISOString()
    }
  }
  
  return new Date().toISOString()
}

// Search for recent cases
async function searchCases(fromDate: string, toDate: string, doctypes: string, pagenum: number = 0) {
  console.log(`Searching cases from ${fromDate} to ${toDate}, page ${pagenum}`)
  
  const params = {
    fromdate: fromDate,
    todate: toDate,
    doctypes,
    pagenum: pagenum.toString(),
    formInput: '', // Empty query to get all cases in date range
  }

  const response = await makeAPIRequest('/search/', params)
  const validated = IKSearchResponseSchema.parse(response)
  
  console.log(`Found ${validated.found} total cases, returning ${validated.docs.length} on page ${pagenum}`)
  
  // Filter out very short documents (routine orders)
  return validated.docs.filter(doc => (doc.docsize || 0) > 5000)
}

// Fetch full document
async function fetchDocument(tid: string) {
  console.log(`Fetching document ${tid}`)
  
  const params = {
    maxcites: '20',
    maxcitedby: '20',
  }

  const response = await makeAPIRequest(`/doc/${tid}/`, params)
  return IKDocumentSchema.parse(response)
}

// Convert IK document to our Case format
function convertToCase(doc: IKDocumentSchema): Partial<Case> {
  const parties = extractParties(doc.title)
  const court = extractCourt(doc.docsource)
  const date = extractDate(doc.publishdate, doc.title)
  
  // Extract citation from title or docsource
  let neutralCitation: string | undefined
  const citationMatch = doc.title.match(/\[(\d{4})\]\s+(\d+\s+)?(\w+)\s+(\d+)/)
  if (citationMatch) {
    neutralCitation = citationMatch[0]
  }

  // Create Case object
  return {
    id: doc.tid,
    jurisdiction: 'IN' as const,
    court,
    date,
    parties,
    source: 'Indian Kanoon',
    url: `https://indiankanoon.org/doc/${doc.tid}/`,
    neutralCitation,
    judges: doc.bench?.split(',').map(j => j.trim()),
    // These will be filled by summarizer
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
    statutes: [],
    reporterCitations: [],
    significance: 'medium',
    rawText: doc.doc, // Store HTML for summarizer
  }
}

// Main scraper function
async function scrapeIndianKanoon() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // Format dates as DD-MM-YYYY
  const fromDate = `${yesterday.getDate().toString().padStart(2, '0')}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getFullYear()}`
  const toDate = fromDate // Same day
  
  console.log(`Scraping Indian Kanoon cases for ${fromDate}`)
  
  const allCases: Partial<Case>[] = []
  
  // Scrape Supreme Court
  try {
    const scCases = await searchCases(fromDate, toDate, 'supremecourt', 0)
    console.log(`Found ${scCases.length} Supreme Court cases`)
    
    // Fetch full documents for top cases
    for (const searchResult of scCases.slice(0, 10)) {
      try {
        const doc = await fetchDocument(searchResult.tid)
        const caseData = convertToCase(doc)
        allCases.push(caseData)
        
        // Rate limiting - wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Failed to fetch document ${searchResult.tid}:`, error)
      }
    }
  } catch (error) {
    console.error('Failed to search Supreme Court cases:', error)
  }
  
  // Scrape important High Courts
  const highCourts = ['delhi', 'bombay', 'chennai', 'kolkata', 'karnataka']
  for (const hc of highCourts) {
    try {
      const hcCases = await searchCases(fromDate, toDate, hc, 0)
      console.log(`Found ${hcCases.length} ${hc} High Court cases`)
      
      // Fetch top 2 cases from each HC
      for (const searchResult of hcCases.slice(0, 2)) {
        try {
          const doc = await fetchDocument(searchResult.tid)
          const caseData = convertToCase(doc)
          allCases.push(caseData)
          
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`Failed to fetch document ${searchResult.tid}:`, error)
        }
      }
    } catch (error) {
      console.error(`Failed to search ${hc} High Court cases:`, error)
    }
  }
  
  // Store cases in Appwrite
  console.log(`Storing ${allCases.length} cases to Appwrite`)  
  await ensureSession()
  for (const c of allCases) {
    try {
      await databases.createDocument(DB_ID, CASES_COL_ID, ID.unique(), {
        id: c.id,
        type: 'case',
        data: JSON.stringify(c),
      })
    } catch (err) {
      console.error(`Failed to store case ${c.id}:`, err)
    }
    // optional delay to avoid rate limits
    await new Promise(r => setTimeout(r, 200))
  }
  console.log(`Stored ${allCases.length} cases to Appwrite`)
  // Print cost estimate
  const searchRequests = 1 + highCourts.length // 1 SC + 5 HCs
  const docRequests = allCases.length
  const totalCost = (searchRequests * 0.50) + (docRequests * 0.50)
  console.log(`API Cost: ₹${totalCost.toFixed(2)} (${searchRequests} searches + ${docRequests} documents)`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeIndianKanoon().catch(console.error)
}

export { scrapeIndianKanoon }
