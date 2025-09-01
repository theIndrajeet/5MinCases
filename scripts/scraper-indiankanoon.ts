#!/usr/bin/env tsx
// Indian Kanoon API scraper for case law
// Fetches judgments from Supreme Court and High Courts

import fs from 'fs/promises'
import path from 'path'
import { z } from 'zod'
import { databases, DB_ID, CASES_COL_ID, ID } from '../lib/appwrite-server'
import { Permission, Role } from 'node-appwrite'
import type { Case } from '../types/case'

const API_KEY = process.env.INDIANKANOON_API_KEY
const API_BASE = 'https://api.indiankanoon.org'

if (!API_KEY) {
  console.error('Missing INDIANKANOON_API_KEY in .env.local')
  process.exit(1)
}

// Indian Kanoon search result schema
const IKSearchResultSchema = z.object({
  tid: z.union([z.string(), z.number()]).transform(val => String(val)), // Handle both string and number
  title: z.string(),
  docsource: z.string(),
  headline: z.string().optional(),
  docsize: z.number().optional(),
})

const IKSearchResponseSchema = z.object({
  docs: z.array(IKSearchResultSchema),
  found: z.union([z.number(), z.string()]).transform(val => Number(val)), // Handle both string and number
  pagenum: z.number().optional().default(0), // Make pagenum optional with default
})

// Indian Kanoon document schema
const IKDocumentSchema = z.object({
  doc: z.string(), // HTML content
  tid: z.union([z.string(), z.number()]).transform(val => String(val)), // Handle both string and number
  title: z.string(),
  docsource: z.string(),
  publishdate: z.string().optional(),
  author: z.string().optional(),
  bench: z.string().optional(),
  citeList: z.array(z.object({
    title: z.string(),
    tid: z.union([z.string(), z.number()]).transform(val => String(val)),
  })).optional(),
  citedbyList: z.array(z.object({
    title: z.string(),
    tid: z.union([z.string(), z.number()]).transform(val => String(val)),
  })).optional(),
})

// Helper to make API requests
async function makeAPIRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(endpoint, API_BASE)
  
  // Indian Kanoon API requires POST requests with form data
  const formData = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value)
  })

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Token ${API_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
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

// Search for recent cases by court type
async function searchCases(searchTerm: string, pagenum: number = 0) {
  console.log(`Searching for "${searchTerm}" cases, page ${pagenum}`)
  
  // Use search terms that work with the API
  const params = {
    formInput: searchTerm,
    pagenum: pagenum.toString(),
  }

  const response = await makeAPIRequest('/search/', params)
  
  // The API returns a different structure for search results
  if (!response.docs || !Array.isArray(response.docs)) {
    console.log('No docs found in response')
    return []
  }
  
  console.log(`Found ${response.docs.length} cases for "${searchTerm}"`)
  
  // Return recent cases (they seem to be sorted by relevance/recency)
  return response.docs.slice(0, 10).map(doc => ({
    tid: String(doc.tid),
    title: doc.title,
    docsource: doc.docsource,
    headline: doc.headline,
    docsize: doc.numcitedby || 1000, // Use citation count as proxy for importance
  }))
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
function convertToCase(doc: z.infer<typeof IKDocumentSchema>): Partial<Case> {
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
    rawText: doc.doc, // Store HTML for summarizer
  }
}

// Main scraper function
async function scrapeIndianKanoon() {
  console.log('Scraping recent Indian Kanoon cases...')
  
  const allCases: Partial<Case>[] = []
  
  // Search for different types of cases using terms that work
  const searchTerms = [
    'supreme court',
    'high court',
    'fundamental rights',
    'constitutional law',
    'criminal law'
  ]
  
  for (const searchTerm of searchTerms) {
    try {
      const cases = await searchCases(searchTerm, 0)
      console.log(`Found ${cases.length} cases for "${searchTerm}"`)
      
      // Fetch full documents for top cases (limit to avoid rate limits)
      for (const searchResult of cases.slice(0, 2)) {
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
      console.error(`Failed to search for "${searchTerm}":`, error)
    }
    
    // Add delay between different searches
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // Store cases in Appwrite (server-side with API key auth)
  console.log(`Storing ${allCases.length} cases to Appwrite`)  
  // No session needed - using service API key
  for (const c of allCases) {
    try {
      await databases.createDocument(
        DB_ID,
        CASES_COL_ID,
        ID.unique(),
        {
          id: c.id,
          type: 'case',
          data: JSON.stringify(c),
        },
        [
          Permission.read(Role.any()),
          Permission.write(Role.team('server')),
        ]
      )
    } catch (err) {
      console.error(`Failed to store case ${c.id}:`, err)
    }
    // optional delay to avoid rate limits
    await new Promise(r => setTimeout(r, 200))
  }
  console.log(`Stored ${allCases.length} cases to Appwrite`)
  // Print cost estimate
  const searchRequests = searchTerms.length // 5 search terms
  const docRequests = allCases.length
  const totalCost = (searchRequests * 0.50) + (docRequests * 0.50)
  console.log(`API Cost: ₹${totalCost.toFixed(2)} (${searchRequests} searches + ${docRequests} documents)`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeIndianKanoon().catch(console.error)
}

export { scrapeIndianKanoon }
