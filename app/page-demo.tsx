'use client'

import React, { useMemo, useState, useEffect } from "react"
import {
  Search,
  Bookmark,
  Share2,
  Link as LinkIcon,
  Clock,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Filter,
  Flame,
  BookOpen,
  Moon,
  SunMedium,
  Star,
  Home,
  LineChart,
  Library,
  Settings,
  Bell,
  ShieldCheck,
  Info,
  Newspaper,
  Scale,
} from "lucide-react"
import type { Case } from "@/types/case"
import type { NewsItem } from "@/types/news"
import { useIsMobile } from "@/hooks/useIsMobile"
import { MobilePage } from "./mobile-page"
import { NewsCard } from "@/components/NewsCard"

// Helper function for class names
function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// Constants
const areas = [
  "Constitutional",
  "Criminal",
  "Corporate", 
  "Tax",
  "IPR",
  "Environmental",
  "Administrative",
  "Labour",
  "Family",
  "Property",
]

const jurisdictions = ["IN", "US", "UK", "CA", "AU"]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric", 
    year: "numeric"
  })
}

// Main component with Cases/News toggle
export default function FiveMinCaseApp() {
  const [cases, setCases] = useState<Case[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [contentType, setContentType] = useState<'cases' | 'news'>('cases')
  const [query, setQuery] = useState("")
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [cursor, setCursor] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [tab, setTab] = useState<"today" | "trending" | "saved">("today")
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [dark, setDark] = useState(false)
  
  // Mobile detection
  const isMobile = useIsMobile()

  // Load demo data
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Load demo cases with AI summaries
        const caseResponse = await fetch('/data/today.json')
        if (caseResponse.ok) {
          const caseData = await caseResponse.json()
          setCases(caseData)
          console.log('✅ Loaded demo cases with AI summaries')
        }
        
        // Load news from Appwrite
        try {
          const { ensureSession, databases, DB_ID, NEWS_COL_ID } = await import('@/lib/appwrite')
          await ensureSession()
          const newsRes = await databases.listDocuments(DB_ID, NEWS_COL_ID)
          setNews(newsRes.documents.map((d: any) => JSON.parse(d.data)))
          console.log('✅ Loaded news from Appwrite')
        } catch (appwriteError) {
          console.log('Using fallback for news:', appwriteError)
          // Fallback news data
          setNews([
            {
              id: "demo-news-1",
              title: "Supreme Court Clarifies Bail Guidelines in UAPA Cases",
              summary: "The Supreme Court has issued comprehensive guidelines for bail in cases under the Unlawful Activities Prevention Act...",
              url: "https://example.com/news1",
              source: "Legal News Today",
              publishedDate: new Date().toISOString(),
              category: "Criminal Law"
            }
          ])
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Keyboard navigation for cases
  useEffect(() => {
    if (contentType === 'cases') {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") setCursor((i) => Math.min(filteredCases.length - 1, i + 1));
        if (e.key === "ArrowLeft") setCursor((i) => Math.max(0, i - 1));
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [contentType]);

  // Load saved IDs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('5mc_saved')
    if (saved) {
      setSavedIds(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('5mc_saved', JSON.stringify(savedIds))
  }, [savedIds])

  // Filter cases
  const filteredCases = useMemo(() => {
    let filtered = cases

    if (tab === "saved") {
      filtered = cases.filter(c => savedIds.includes(c.id))
    }

    if (query) {
      const q = query.toLowerCase()
      filtered = filtered.filter(c => 
        c.parties.title.toLowerCase().includes(q) ||
        c.court.toLowerCase().includes(q) ||
        c.tldr60?.toLowerCase().includes(q)
      )
    }

    if (selectedAreas.length > 0) {
      filtered = filtered.filter(c => 
        c.tags?.some(tag => selectedAreas.includes(tag))
      )
    }

    return filtered
  }, [cases, query, selectedAreas, tab, savedIds])

  // Filter news
  const filteredNews = useMemo(() => {
    let filtered = news

    if (query) {
      const q = query.toLowerCase()
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(q) ||
        n.source.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q)
      )
    }

    return filtered
  }, [news, query])

  if (loading) {
    return (
      <div className="min-h-screen bg-pale-mint dark:bg-slate-green flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-deep-emerald animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-teal dark:text-soft-sage">Loading demo cases...</p>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return <MobilePage initialCases={filteredCases} />
  }

  const currentCase = filteredCases[cursor]

  return (
    <div className="min-h-screen bg-pale-mint dark:bg-neutral-950">
      {/* Header */}
      <header className="border-b border-muted-teal/20 bg-white/80 dark:bg-slate-green/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-deep-emerald flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-deep-emerald dark:text-soft-sage">5 Min Case</h1>
              </div>
              
              {/* Content Type Toggle */}
              <div className="flex items-center bg-soft-sage/10 dark:bg-muted-teal/10 rounded-lg p-1">
                <button
                  onClick={() => setContentType('cases')}
                  className={classNames(
                    "flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    contentType === 'cases' 
                      ? "bg-deep-emerald text-white" 
                      : "text-muted-teal hover:text-deep-emerald"
                  )}
                >
                  <Scale className="w-4 h-4" />
                  <span>Cases</span>
                </button>
                <button
                  onClick={() => setContentType('news')}
                  className={classNames(
                    "flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    contentType === 'news' 
                      ? "bg-deep-emerald text-white" 
                      : "text-muted-teal hover:text-deep-emerald"
                  )}
                >
                  <Newspaper className="w-4 h-4" />
                  <span>News</span>
                </button>
              </div>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg text-muted-teal hover:text-deep-emerald hover:bg-soft-sage/10 transition-colors"
            >
              {dark ? <SunMedium className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="sr-only">Toggle dark mode</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {contentType === 'cases' ? (
          <>
            {/* Cases Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-deep-emerald dark:text-soft-sage mb-2">
                    DAILY JUDGMENTS
                  </h2>
                  <p className="text-muted-teal dark:text-soft-sage">
                    Fresh cases from Indian courts.
                  </p>
                  <p className="text-sm text-muted-teal/70 dark:text-soft-sage/70 mt-1">
                    Monday, 1 September • {filteredCases.length} judgments
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-teal dark:text-soft-sage">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-deep-emerald"></div>
                    <span>Powered by Indian Kanoon</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-soft-sage/10 dark:bg-muted-teal/10 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" />
                    <span>5-minute briefs</span>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-teal" />
                <input
                  type="text"
                  placeholder="Search by party, citation, court..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-muted-teal/20 rounded-lg bg-white dark:bg-slate-green dark:border-muted-teal/30 text-deep-emerald dark:text-soft-sage placeholder-muted-teal/60 focus:outline-none focus:ring-2 focus:ring-deep-emerald/20 focus:border-deep-emerald/30"
                />
              </div>

              {/* Tabs */}
              <div className="flex items-center space-x-1 bg-soft-sage/10 dark:bg-muted-teal/10 rounded-lg p-1 mb-6">
                {[
                  { key: "today", label: "Today", icon: Home },
                  { key: "trending", label: "Trending", icon: Flame },
                  { key: "saved", label: "Saved", icon: Bookmark },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key as any)}
                    className={classNames(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      tab === key 
                        ? "bg-white dark:bg-slate-green text-deep-emerald shadow-sm" 
                        : "text-muted-teal hover:text-deep-emerald"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                    {key === "saved" && savedIds.length > 0 && (
                      <span className="bg-deep-emerald text-white text-xs px-1.5 py-0.5 rounded-full">
                        {savedIds.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cases Grid */}
            {filteredCases.length === 0 ? (
              <div className="text-center py-12">
                <Scale className="w-12 h-12 text-muted-teal/40 mx-auto mb-4" />
                <p className="text-muted-teal dark:text-soft-sage">
                  {tab === "saved" ? "No saved cases yet." : "No cases yet. Run the Indian Kanoon scraper to fetch today's judgments."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCases.map((c, index) => (
                  <CaseCard 
                    key={c.id}
                    c={c} 
                    expanded={expandedId === c.id}
                    onExpand={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    saved={savedIds.includes(c.id)}
                    onToggleSave={() => {
                      if (savedIds.includes(c.id)) {
                        setSavedIds(savedIds.filter(id => id !== c.id))
                      } else {
                        setSavedIds([...savedIds, c.id])
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* News Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-deep-emerald dark:text-soft-sage mb-2">
                    LEGAL NEWS
                  </h2>
                  <p className="text-muted-teal dark:text-soft-sage">
                    Latest legal news & analysis.
                  </p>
                  <p className="text-sm text-muted-teal/70 dark:text-soft-sage/70 mt-1">
                    Monday, 1 September • {filteredNews.length} news items
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-teal dark:text-soft-sage">
                  <div className="flex items-center space-x-1 bg-soft-sage/10 dark:bg-muted-teal/10 px-2 py-1 rounded-md">
                    <Sparkles className="w-3 h-3" />
                    <span>Curated from top sources</span>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-teal" />
                <input
                  type="text"
                  placeholder="Search news by title, source..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-muted-teal/20 rounded-lg bg-white dark:bg-slate-green dark:border-muted-teal/30 text-deep-emerald dark:text-soft-sage placeholder-muted-teal/60 focus:outline-none focus:ring-2 focus:ring-deep-emerald/20 focus:border-deep-emerald/30"
                />
              </div>
            </div>

            {/* News Grid */}
            {filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <Newspaper className="w-12 h-12 text-muted-teal/40 mx-auto mb-4" />
                <p className="text-muted-teal dark:text-soft-sage">No news yet. Run the news scraper to fetch latest legal news.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

// Case Card Component
function CaseCard({ 
  c, 
  expanded, 
  onExpand, 
  saved, 
  onToggleSave 
}: { 
  c: Case; 
  expanded: boolean; 
  onExpand: () => void; 
  saved: boolean; 
  onToggleSave: () => void 
}) {
  return (
    <article className="bg-white dark:bg-slate-green rounded-xl border border-muted-teal/20 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-medium text-muted-teal dark:text-soft-sage bg-soft-sage/10 dark:bg-muted-teal/10 px-2 py-1 rounded">
              {c.court}
            </span>
            <span className="text-xs text-muted-teal/60 dark:text-soft-sage/60">
              {formatDate(c.date)}
            </span>
          </div>
          <h3 className="font-semibold text-deep-emerald dark:text-soft-sage leading-tight mb-2">
            {c.parties.title}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onToggleSave}
            className={classNames(
              "p-2 rounded-lg transition-colors",
              saved 
                ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20" 
                : "text-muted-teal hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            )}
          >
            <Bookmark className={classNames("w-4 h-4", saved && "fill-current")} />
          </button>
          <button 
            onClick={() => window.open(c.url, '_blank')}
            className="p-2 rounded-lg text-muted-teal hover:text-deep-emerald hover:bg-soft-sage/10 transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigator.share?.({ title: c.parties.title, url: c.url })}
            className="p-2 rounded-lg text-muted-teal hover:text-deep-emerald hover:bg-soft-sage/10 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TL;DR */}
      {c.tldr60 && (
        <div className="mb-4 p-4 bg-soft-sage/5 dark:bg-muted-teal/5 rounded-lg border border-soft-sage/20 dark:border-muted-teal/20">
          <p className="text-sm text-deep-emerald dark:text-soft-sage leading-relaxed">
            {c.tldr60}
          </p>
        </div>
      )}

      {/* 5-minute brief */}
      {c.brief5min && (
        <div className="border-t border-muted-teal/10 pt-4">
          <button
            onClick={onExpand}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-teal" />
              <span className="text-sm font-medium text-muted-teal dark:text-soft-sage">5-min brief</span>
            </div>
            <ChevronRight className={classNames(
              "w-4 h-4 text-muted-teal transition-transform",
              expanded && "transform rotate-90"
            )} />
          </button>
          
          {expanded && (
            <div className="mt-4 space-y-4">
              {[
                { key: 'facts', label: 'FACTS', content: c.brief5min.facts },
                { key: 'issues', label: 'ISSUES', content: c.brief5min.issues },
                { key: 'holding', label: 'HOLDING', content: c.brief5min.holding },
                { key: 'reasoning', label: 'REASONING', content: c.brief5min.reasoning },
                { key: 'disposition', label: 'DISPOSITION', content: c.brief5min.disposition },
              ].map(({ key, label, content }) => (
                <div key={key} className="border-l-2 border-deep-emerald/20 pl-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-deep-emerald text-white text-xs font-bold flex items-center justify-center">
                      {key === 'facts' ? '1' : key === 'issues' ? '2' : key === 'holding' ? '3' : key === 'reasoning' ? '4' : '5'}
                    </span>
                    <h4 className="font-semibold text-deep-emerald dark:text-soft-sage text-sm">
                      {label}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-teal dark:text-soft-sage leading-relaxed">
                    {content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {c.tags && c.tags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-muted-teal/10">
          <div className="flex flex-wrap gap-2">
            {c.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-deep-emerald/10 dark:bg-soft-sage/10 text-deep-emerald dark:text-soft-sage px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

