#!/usr/bin/env tsx
// AI-powered case summarizer using Gemini and Perplexity
// Generates 60-word TL;DRs and 5-minute structured briefs

import fs from 'fs/promises'
import path from 'path'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Case, Brief5Min } from '../types/case'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Initialize AI clients (will use env vars when provided)
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

// Perplexity configuration
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'
const PERPLEXITY_MODEL = 'sonar-pro'

// Brand voice prompts
const TLDR_PROMPT = `You are 5 Min Case AI. Your personality is sharp, witty, and conversational like a senior lawyer explaining to a junior over coffee.

Generate a TL;DR in EXACTLY 60 words following this format:
[WHO] held that [WHAT] because [WHY]. This means [PRACTICAL IMPACT].

Rules:
- Use plain English, NO legal jargon
- Lead with the most important holding
- Be specific about the impact
- Sharp and conversational tone

Example good outputs:
- "Delhi HC struck down sedition charges against comedian for jokes. Court held satire is protected speech unless it incites violence. Police can't arrest for hurt feelings. This means comedians can mock politicians without criminal charges, but calls for violence remain illegal."
- "SC held denying bail after 3 years violates Article 21. Prolonged detention without trial = punishment before conviction. Lower courts must grant bail unless exceptional circumstances exist. This means undertrial prisoners languishing for years can cite this precedent for release."

Bad outputs to avoid:
- Using "Hon'ble", "elucidated", "jurisprudence", etc.
- Being vague about the holding
- Missing the practical impact`

const BRIEF_PROMPT = `You are 5 Min Case AI. Create a structured 5-minute brief that a tired lawyer can understand quickly.

Structure:
1. FACTS: What happened? (2-3 sentences max, focus on key facts only)
2. ISSUES: What legal questions did the court answer? (1-2 bullet points)
3. HOLDING: Court's answer in one clear sentence
4. REASONING: Why did the court decide this way? (2-3 sentences, focus on key logic)
5. DISPOSITION: What happens next? (1 sentence - remanded/affirmed/reversed etc.)

Rules:
- NO legal jargon or complex language
- Focus on what matters for practice
- Conversational but accurate
- If statute cited, explain what it does briefly`

const KEY_QUOTES_PROMPT = `Extract 2-3 powerful quotes from this judgment that lawyers would highlight.

Rules:
- Pick quotes that capture the essence of the ruling
- Include paragraph/page reference if available
- Choose clear, quotable language
- Avoid procedural language`

const TAGS_PROMPT = `Identify 2-3 practice areas for this case.

Common tags: Criminal Procedure, Constitutional, Commercial, Arbitration, IPR, Data Protection, 
Administrative, Tax, Labour, Family, Property, Torts, Contract, Media, Banking, Insurance, 
Environmental, Competition, Securities

Return only the relevant tags as a comma-separated list.`

// Mock summarizer for testing without API keys
function mockSummarize(caseData: Partial<Case>): {
  tldr60: string
  brief5min: Brief5Min
  keyQuotes: Array<{ quote: string; pin?: string }>
  tags: string[]
} {
  const templates = [
    {
      tldr60: "Court ruled that AI-generated legal summaries require human review before reliance. Automated tools can assist but cannot replace lawyer judgment. Sanctions possible for unchecked AI submissions. This means lawyers must verify AI output before filing, treating it like junior associate work requiring supervision.",
      brief5min: {
        facts: "Law firm submitted AI-generated brief with hallucinated cases. Opposing counsel discovered fake citations. Court sanctioned firm for lack of diligence.",
        issues: "Whether lawyers can rely on AI tools without verification. What level of review satisfies professional duties.",
        holding: "Lawyers remain fully responsible for AI-generated content and must verify all citations and arguments.",
        reasoning: "Professional responsibility rules require personal knowledge of filing contents. AI tools are assistants, not replacements for legal judgment. Blind reliance violates duty of candor to court.",
        disposition: "Sanctions imposed; brief stricken; leave to refile with verified content."
      },
      keyQuotes: [
        { quote: "AI is a tool, not a lawyer. The professional using it remains accountable.", pin: "¶45" },
        { quote: "Technological efficiency cannot compromise accuracy or candor before this Court.", pin: "¶62" }
      ],
      tags: ["Professional Responsibility", "Legal Tech", "Litigation"]
    }
  ]

  // Return a template for testing
  return templates[0]
}

// Perplexity API call helper
async function callPerplexity(prompt: string): Promise<string> {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('Perplexity API key not configured')
  }

  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
    },
    body: JSON.stringify({
      model: PERPLEXITY_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Parse brief sections from AI response
function parseBriefSections(text: string): Brief5Min {
  // Default structure
  const brief: Brief5Min = {
    facts: '',
    issues: '',
    holding: '',
    reasoning: '',
    disposition: ''
  }
  
  // Try to parse structured response
  const sections = text.toLowerCase()
  
  // Extract each section using regex or string matching
  const factsMatch = text.match(/facts?:?\s*(.+?)(?=issues?:|$)/is)
  const issuesMatch = text.match(/issues?:?\s*(.+?)(?=holding?:|$)/is)
  const holdingMatch = text.match(/holding?:?\s*(.+?)(?=reasoning?:|$)/is)
  const reasoningMatch = text.match(/reasoning?:?\s*(.+?)(?=disposition?:|$)/is)
  const dispositionMatch = text.match(/disposition?:?\s*(.+?)$/is)
  
  if (factsMatch) brief.facts = factsMatch[1].trim()
  if (issuesMatch) brief.issues = issuesMatch[1].trim()
  if (holdingMatch) brief.holding = holdingMatch[1].trim()
  if (reasoningMatch) brief.reasoning = reasoningMatch[1].trim()
  if (dispositionMatch) brief.disposition = dispositionMatch[1].trim()
  
  return brief
}

// Parse key quotes from AI response
function parseKeyQuotes(text: string): Array<{ quote: string; pin?: string }> {
  const quotes: Array<{ quote: string; pin?: string }> = []
  
  // Match quotes with optional paragraph references
  const quoteMatches = text.matchAll(/"([^"]+)"(?:\s*(?:\(|¶|para?\.?\s*)(\d+)\)?)?/g)
  
  for (const match of quoteMatches) {
    quotes.push({
      quote: match[1],
      pin: match[2] ? `¶${match[2]}` : undefined
    })
  }
  
  return quotes.slice(0, 3) // Limit to 3 quotes
}

// Generate case ID
function generateCaseId(caseData: Partial<Case>): string {
  const date = new Date(caseData.date || Date.now())
  const courtAbbr = caseData.court?.substring(0, 3).toUpperCase() || 'UNK'
  const random = Math.random().toString(36).substring(2, 6)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${courtAbbr}-${random}`
}

// Process a single case
async function processCase(rawCase: Partial<Case>): Promise<Case> {
  console.log(`Processing: ${rawCase.parties?.title || 'Unknown case'}`)

  let summaryData
  
  if (genAI && process.env.GEMINI_API_KEY) {
    // Use actual AI when API key is available
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      // Generate TL;DR
      const tldrResult = await model.generateContent(
        `${TLDR_PROMPT}\n\nCase: ${rawCase.parties?.title}\nCourt: ${rawCase.court}\nDate: ${rawCase.date}\nURL: ${rawCase.url}`
      )
      const tldr60 = tldrResult.response.text().trim()
      
      // Generate 5-minute brief
      const briefResult = await model.generateContent(
        `${BRIEF_PROMPT}\n\nCase: ${rawCase.parties?.title}\nCourt: ${rawCase.court}\nDate: ${rawCase.date}\nTL;DR: ${tldr60}`
      )
      const briefText = briefResult.response.text()
      
      // Parse the brief into sections
      const brief5min = parseBriefSections(briefText)
      
      // Generate key quotes
      const quotesResult = await model.generateContent(
        `${KEY_QUOTES_PROMPT}\n\nCase: ${rawCase.parties?.title}\nCourt: ${rawCase.court}`
      )
      const keyQuotes = parseKeyQuotes(quotesResult.response.text())
      
      // Generate tags
      const tagsResult = await model.generateContent(
        `${TAGS_PROMPT}\n\nCase: ${rawCase.parties?.title}\nTL;DR: ${tldr60}`
      )
      const tags = tagsResult.response.text().split(',').map(t => t.trim())
      
      summaryData = {
        tldr60,
        brief5min,
        keyQuotes,
        tags
      }
      
      // If Perplexity is available, find related cases for important ones
      if (process.env.PERPLEXITY_API_KEY && rawCase.court?.includes('Supreme')) {
        try {
          const relatedPrompt = `Find 2-3 recent related cases to: "${rawCase.parties?.title}" - ${tldr60}. Focus on ${rawCase.jurisdiction} jurisdiction.`
          const relatedCases = await callPerplexity(relatedPrompt)
          console.log('Related cases found:', relatedCases.substring(0, 100) + '...')
        } catch (perplexityError) {
          console.error('Perplexity search failed:', perplexityError)
        }
      }
      
    } catch (error) {
      console.error('AI generation failed, using mock data:', error)
      summaryData = mockSummarize(rawCase)
    }
  } else {
    // Use mock data when no API key
    summaryData = mockSummarize(rawCase)
  }

  // Construct complete case object
  const completeCase: Case = {
    id: generateCaseId(rawCase),
    jurisdiction: rawCase.jurisdiction!,
    court: rawCase.court!,
    date: rawCase.date!,
    parties: rawCase.parties!,
    source: rawCase.source!,
    url: rawCase.url!,
    statutes: rawCase.statutes || [],
    neutralCitation: rawCase.neutralCitation,
    reporterCitations: rawCase.reporterCitations,
    outcome: rawCase.outcome,
    ...summaryData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  return completeCase
}

// Process all raw cases
async function processRawCases() {
  const rawDir = path.join(process.cwd(), 'data', 'raw')
  const casesDir = path.join(process.cwd(), 'data', 'cases')
  
  // Ensure directories exist
  await fs.mkdir(casesDir, { recursive: true })
  
  // Find today's raw file
  const today = new Date().toISOString().split('T')[0]
  const rawFile = path.join(rawDir, `${today}-raw.json`)
  
  try {
    const rawData = await fs.readFile(rawFile, 'utf-8')
    const rawCases = JSON.parse(rawData) as Partial<Case>[]
    
    console.log(`Processing ${rawCases.length} raw cases...`)
    
    // Process each case
    const processedCases: Case[] = []
    for (const rawCase of rawCases) {
      try {
        const processed = await processCase(rawCase)
        processedCases.push(processed)
        
        // Add small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Failed to process case: ${rawCase.parties?.title}`, error)
      }
    }
    
    // Save by date
    const year = today.substring(0, 4)
    const month = today.substring(5, 7)
    const day = today.substring(8, 10)
    
    const outputDir = path.join(casesDir, year, month)
    await fs.mkdir(outputDir, { recursive: true })
    
    const outputFile = path.join(outputDir, `${day}.json`)
    await fs.writeFile(outputFile, JSON.stringify(processedCases, null, 2))
    
    console.log(`Saved ${processedCases.length} processed cases to ${outputFile}`)
    
  } catch (error) {
    console.error('No raw cases found for today:', error)
  }
}

// Main function
async function main() {
  console.log('Starting case summarizer...')
  console.log('API Keys configured:', {
    gemini: !!process.env.GEMINI_API_KEY,
    perplexity: !!process.env.PERPLEXITY_API_KEY
  })
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️  No Gemini API key found - using mock summaries for testing')
  }
  
  const startTime = Date.now()
  
  try {
    await processRawCases()
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`Summarization completed in ${duration} seconds`)
  } catch (error) {
    console.error('Summarizer failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}
