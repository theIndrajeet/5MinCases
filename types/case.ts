// Case data types matching our schema
export type Jurisdiction = 'US' | 'IN' | 'UK'
export type Source = 'courtlistener' | 'caselaw' | 'indiankanoon' | 'judiciary-uk' | 'ecourts' | 'sci-official'

export interface CaseParties {
  title: string
  appellant?: string
  respondent?: string
  petitioner?: string
  defendant?: string
}

export interface Brief5Min {
  facts: string
  issues: string
  holding: string
  reasoning: string
  disposition: string
}

export interface KeyQuote {
  quote: string
  pin?: string // Paragraph or page reference
}

export interface Case {
  id: string
  jurisdiction: Jurisdiction
  court: string
  date: string // ISO date
  neutralCitation?: string
  reporterCitations?: string[]
  parties: CaseParties
  statutes: string[]
  outcome?: string
  source: Source
  url: string
  tldr60: string // Exactly 60 words
  brief5min: Brief5Min
  keyQuotes: KeyQuote[]
  tags: string[] // Practice areas
  createdAt?: string
  updatedAt?: string
}

export interface CaseIndex {
  date: string
  count: number
  cases: Array<{
    id: string
    title: string
    court: string
    tags: string[]
  }>
}

export interface SearchIndex {
  version: string
  lastUpdated: string
  cases: Array<{
    id: string
    searchText: string // Concatenated searchable content
    jurisdiction: Jurisdiction
    court: string
    date: string
    tags: string[]
  }>
}
