// News item type for legal news
export interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedDate: string
  category?: string
  author?: string
  imageUrl?: string
}

export interface NewsData {
  date: string
  count: number
  news: NewsItem[]
}

export type NewsCategory = 
  | 'General'
  | 'Supreme Court'
  | 'High Courts'
  | 'Constitutional'
  | 'Criminal'
  | 'Corporate'
  | 'Tax'
  | 'Analysis'
  | 'Academic'

export type NewsSource = 
  | 'Bar & Bench'
  | 'LiveLaw'
  | 'Legally India'
  | 'SCC Blog'
  | 'Indian Constitutional Law'
  | 'Law and Other Things'
