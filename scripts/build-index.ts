#!/usr/bin/env tsx
// Build search indexes and aggregated data for the frontend

import fs from 'fs/promises'
import path from 'path'
import type { Case, CaseIndex, SearchIndex } from '../types/case'

// Get all case files recursively
async function getAllCaseFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  
  async function scan(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      
      if (entry.isDirectory()) {
        await scan(fullPath)
      } else if (entry.name.endsWith('.json')) {
        files.push(fullPath)
      }
    }
  }
  
  await scan(dir)
  return files
}

// Load all cases
async function loadAllCases(): Promise<Case[]> {
  const casesDir = path.join(process.cwd(), 'data', 'cases')
  const allCases: Case[] = []
  
  try {
    const files = await getAllCaseFiles(casesDir)
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8')
        const cases = JSON.parse(content) as Case[]
        allCases.push(...cases)
      } catch (error) {
        console.error(`Failed to load ${file}:`, error)
      }
    }
  } catch (error) {
    console.error('Failed to scan cases directory:', error)
  }
  
  return allCases
}

// Build master index
async function buildMasterIndex(cases: Case[]) {
  const dataDir = path.join(process.cwd(), 'data')
  
  // Group cases by date
  const casesByDate = new Map<string, Case[]>()
  
  for (const case_ of cases) {
    const date = case_.date.split('T')[0]
    if (!casesByDate.has(date)) {
      casesByDate.set(date, [])
    }
    casesByDate.get(date)!.push(case_)
  }
  
  // Create index entries
  const indexEntries: CaseIndex[] = []
  
  for (const [date, dateCases] of casesByDate) {
    indexEntries.push({
      date,
      count: dateCases.length,
      cases: dateCases.map(c => ({
        id: c.id,
        title: c.parties.title,
        court: c.court,
        tags: c.tags
      }))
    })
  }
  
  // Sort by date descending
  indexEntries.sort((a, b) => b.date.localeCompare(a.date))
  
  // Save master index
  await fs.writeFile(
    path.join(dataDir, 'index.json'),
    JSON.stringify(indexEntries, null, 2)
  )
  
  console.log(`Built master index with ${indexEntries.length} days`)
}

// Build search index
async function buildSearchIndex(cases: Case[]) {
  const dataDir = path.join(process.cwd(), 'data')
  
  const searchIndex: SearchIndex = {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    cases: cases.map(c => ({
      id: c.id,
      searchText: [
        c.parties.title,
        c.court,
        c.tldr60,
        c.tags.join(' '),
        c.statutes.join(' '),
        c.neutralCitation || '',
        c.reporterCitations?.join(' ') || ''
      ].join(' ').toLowerCase(),
      jurisdiction: c.jurisdiction,
      court: c.court,
      date: c.date,
      tags: c.tags
    }))
  }
  
  await fs.writeFile(
    path.join(dataDir, 'search-index.json'),
    JSON.stringify(searchIndex, null, 2)
  )
  
  console.log(`Built search index with ${searchIndex.cases.length} cases`)
}

// Build trending data
async function buildTrendingData(cases: Case[]) {
  const dataDir = path.join(process.cwd(), 'data')
  
  // Get cases from last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const recentCases = cases.filter(c => 
    new Date(c.date) >= sevenDaysAgo
  )
  
  // For now, just take the 10 most recent as "trending"
  // In production, this would use view counts, shares, etc.
  const trending = recentCases
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)
  
  await fs.writeFile(
    path.join(dataDir, 'trending.json'),
    JSON.stringify({
      generated: new Date().toISOString(),
      period: 'week',
      cases: trending.map(c => ({
        id: c.id,
        title: c.parties.title,
        court: c.court,
        date: c.date,
        jurisdiction: c.jurisdiction,
        tldr60: c.tldr60,
        tags: c.tags
      }))
    }, null, 2)
  )
  
  console.log(`Built trending data with ${trending.length} cases`)
}

// Build static pages data
async function buildStaticData(cases: Case[]) {
  const publicDir = path.join(process.cwd(), 'public', 'data')
  await fs.mkdir(publicDir, { recursive: true })
  
  // Today's cases
  const today = new Date().toISOString().split('T')[0]
  const todaysCases = cases.filter(c => c.date.startsWith(today))
  
  await fs.writeFile(
    path.join(publicDir, 'today.json'),
    JSON.stringify({
      date: today,
      count: todaysCases.length,
      cases: todaysCases
    }, null, 2)
  )
  
  console.log(`Built today's data with ${todaysCases.length} cases`)
}

// Main function
async function main() {
  console.log('Building indexes...')
  const startTime = Date.now()
  
  try {
    // Load all cases
    const cases = await loadAllCases()
    console.log(`Loaded ${cases.length} total cases`)
    
    if (cases.length === 0) {
      console.log('No cases found - run scraper and summarizer first')
      return
    }
    
    // Build various indexes
    await Promise.all([
      buildMasterIndex(cases),
      buildSearchIndex(cases),
      buildTrendingData(cases),
      buildStaticData(cases)
    ])
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`Index building completed in ${duration} seconds`)
    
  } catch (error) {
    console.error('Index builder failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}
