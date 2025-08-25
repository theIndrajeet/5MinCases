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
  "Commercial",
];

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN'); } catch { return iso; }
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

  // Load cases and news on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Load cases
        const casesResponse = await fetch('/data/today.json')
        if (casesResponse.ok) {
          const casesData = await casesResponse.json()
          setCases(casesData.cases || [])
        }
        
        // Load news
        const newsResponse = await fetch('/data/today-news.json')
        if (newsResponse.ok) {
          const newsData = await newsResponse.json()
          setNews(newsData.news || [])
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
    let res = cases;
    if (selectedAreas.length) res = res.filter(c => c.tags.some(t => selectedAreas.includes(t)));
    if (query.trim()) {
      const q = query.toLowerCase();
      res = res.filter(c => (
        c.parties.title.toLowerCase().includes(q) ||
        c.court.toLowerCase().includes(q) ||
        (c.neutralCitation?.toLowerCase() ?? "").includes(q) ||
        c.statutes.join(" ").toLowerCase().includes(q) ||
        c.tags.join(" ").toLowerCase().includes(q) ||
        c.tldr60.toLowerCase().includes(q)
      ));
    }
    return res;
  }, [query, selectedAreas, cases]);

  // Filter news
  const filteredNews = useMemo(() => {
    let res = news;
    if (query.trim()) {
      const q = query.toLowerCase();
      res = res.filter(n => (
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.source.toLowerCase().includes(q) ||
        (n.category?.toLowerCase() ?? "").includes(q)
      ));
    }
    return res;
  }, [query, news]);

  const showingCase = filteredCases[cursor];
  const savedCases = cases.filter(c => savedIds.includes(c.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-pale-mint dark:bg-slate-green flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-deep-emerald animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-teal dark:text-soft-sage">Loading...</p>
        </div>
      </div>
    )
  }

  // Show mobile interface on mobile devices
  if (isMobile) {
    return <MobilePage initialCases={filteredCases} />
  }

  return (
    <div className="min-h-screen bg-pale-mint dark:bg-neutral-950 text-dark-authority dark:text-pale-mint">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-pale-mint/70 bg-pale-mint/80 dark:bg-neutral-950/70 border-b border-neutral-200 dark:border-muted-teal">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 grid place-items-center rounded-lg bg-deep-emerald text-pale-mint dark:bg-pale-mint dark:text-deep-emerald">
                    <Sparkles className="w-5 h-5"/>
                  </div>
                  <div className="font-bold text-lg tracking-tight text-deep-emerald dark:text-pale-mint">5 Min Case</div>
                </div>
                
                {/* Content Type Toggle */}
                <div className="flex items-center bg-white/50 dark:bg-slate-green/50 rounded-xl p-1 border border-neutral-200 dark:border-muted-teal">
                  <button
                    onClick={() => setContentType('cases')}
                    className={classNames(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      contentType === 'cases' 
                        ? "bg-deep-emerald text-pale-mint dark:bg-pale-mint dark:text-deep-emerald" 
                        : "text-muted-teal dark:text-soft-sage hover:text-deep-emerald dark:hover:text-pale-mint"
                    )}
                  >
                    <Scale className="w-4 h-4"/>
                    Cases
                  </button>
                  <button
                    onClick={() => setContentType('news')}
                    className={classNames(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      contentType === 'news' 
                        ? "bg-deep-emerald text-pale-mint dark:bg-pale-mint dark:text-deep-emerald" 
                        : "text-muted-teal dark:text-soft-sage hover:text-deep-emerald dark:hover:text-pale-mint"
                    )}
                  >
                    <Newspaper className="w-4 h-4"/>
                    News
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setDark(!dark)}
                className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border border-deep-emerald dark:border-pale-mint hover:bg-deep-emerald hover:text-pale-mint dark:hover:bg-pale-mint dark:hover:text-deep-emerald transition-colors"
                title="Toggle theme"
              >
                {dark ? <SunMedium className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
                {dark ? "Light" : "Dark"}
              </button>
            </div>
          </div>
        </header>

        <main className="py-6">
          {/* Hero */}
          <section className="mx-6 rounded-3xl border border-neutral-200 dark:border-muted-teal bg-white/70 dark:bg-slate-green/70 backdrop-blur p-6 case-card-gradient">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-teal dark:text-soft-sage">
                  {contentType === 'cases' ? 'Daily Judgments' : 'Legal News'}
                </div>
                <h1 className="text-2xl md:text-3xl font-heading font-semibold leading-tight mt-1 text-dark-authority dark:text-pale-mint">
                  {contentType === 'cases' 
                    ? 'Fresh cases from Indian courts.' 
                    : 'Latest legal news & analysis.'}
                </h1>
                <p className="text-sm text-muted-teal dark:text-soft-sage mt-1">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                  {contentType === 'cases' 
                    ? ` · ${filteredCases.length} judgments` 
                    : ` · ${filteredNews.length} news items`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {contentType === 'cases' ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-soft-sage/20 dark:bg-muted-teal/20 border border-soft-sage dark:border-muted-teal">
                      <Bell className="w-3.5 h-3.5"/> Powered by Indian Kanoon
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-soft-sage/20 dark:bg-muted-teal/20 border border-soft-sage dark:border-muted-teal">
                      <BookOpen className="w-3.5 h-3.5"/> 5‑minute briefs
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-soft-sage/20 dark:bg-muted-teal/20 border border-soft-sage dark:border-muted-teal">
                    <Newspaper className="w-3.5 h-3.5"/> Curated from top sources
                  </span>
                )}
              </div>
            </div>
          </section>
          
          {/* Search */}
          <div className="mx-6 mt-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-teal" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={contentType === 'cases' 
                  ? "Search by party, citation, court…" 
                  : "Search news by title, source…"}
                className="w-full pl-10 pr-3 py-3 rounded-2xl bg-white/90 dark:bg-slate-green/90 border border-neutral-200 dark:border-muted-teal text-sm focus:outline-none focus:ring-2 focus:ring-deep-emerald dark:focus:ring-pale-mint shadow-sm"
              />
            </div>
          </div>

          {/* Content */}
          <div className="mt-6 px-6">
            {contentType === 'cases' ? (
              // Cases view
              <div className="max-w-3xl mx-auto space-y-4">
                {showingCase ? (
                  <CaseCard
                    c={showingCase}
                    expanded={expandedId === showingCase.id}
                    onExpand={() => setExpandedId((id) => id === showingCase.id ? null : showingCase.id)}
                    saved={savedIds.includes(showingCase.id)}
                    onToggleSave={() => setSavedIds((ids) => 
                      ids.includes(showingCase.id) 
                        ? ids.filter(x => x !== showingCase.id) 
                        : [...ids, showingCase.id]
                    )}
                  />
                ) : (
                  <div className="text-center text-sm text-muted-teal dark:text-soft-sage py-20">
                    {cases.length === 0 
                      ? "No cases yet. Run the Indian Kanoon scraper to fetch today's judgments." 
                      : "No results. Try clearing filters."}
                  </div>
                )}
              </div>
            ) : (
              // News view
              <div className="max-w-3xl mx-auto space-y-4">
                {filteredNews.length > 0 ? (
                  filteredNews.map((item) => (
                    <NewsCard key={item.id} news={item} />
                  ))
                ) : (
                  <div className="text-center text-sm text-muted-teal dark:text-soft-sage py-20">
                    {news.length === 0 
                      ? "No news yet. Run the news scraper to fetch latest legal news." 
                      : "No results. Try clearing the search."}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Navigation footer for cases */}
      {contentType === 'cases' && filteredCases.length > 0 && (
        <div className="sticky bottom-4 z-40">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between rounded-2xl border border-deep-emerald dark:border-pale-mint bg-white/80 dark:bg-slate-green/80 backdrop-blur px-2 py-1 shadow-md mx-4">
              <button 
                onClick={() => setCursor((i) => Math.max(0, i - 1))} 
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-soft-sage/20 dark:hover:bg-muted-teal/20"
              >
                <ChevronLeft className="w-4 h-4"/> Prev
              </button>
              <div className="text-xs text-muted-teal dark:text-soft-sage">
                {cursor + 1} / {filteredCases.length} 
                <span className="ml-2 opacity-60">(← / →)</span>
              </div>
              <button 
                onClick={() => setCursor((i) => Math.min(filteredCases.length - 1, i + 1))} 
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-soft-sage/20 dark:hover:bg-muted-teal/20"
              >
                Next <ChevronRight className="w-4 h-4"/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Case Card Component (extracted from original)
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 420);
      return () => clearTimeout(t);
    }
  }, [expanded]);

  return (
    <article className="rounded-3xl border border-neutral-200 dark:border-muted-teal bg-white/80 dark:bg-slate-green/80 backdrop-blur p-6 shadow-sm transition-all hover:shadow-md">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg md:text-xl font-heading font-semibold leading-snug text-dark-authority dark:text-pale-mint">
            {c.parties.title}
          </h2>
          <div className="mt-2">
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <MetaBadge>{c.court}</MetaBadge>
              <MetaBadge>{formatDate(c.date)}</MetaBadge>
              {c.neutralCitation && <MetaBadge>{c.neutralCitation}</MetaBadge>}
              {c.reporterCitations?.length ? <MetaBadge>{c.reporterCitations.join(" · ")}</MetaBadge> : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            title={saved ? "Unsave" : "Save"} 
            onClick={onToggleSave} 
            className={classNames(
              "p-2 rounded-xl border transition-colors", 
              saved 
                ? "border-deep-emerald bg-deep-emerald/10 dark:bg-pale-mint/10" 
                : "border-neutral-200 dark:border-muted-teal hover:bg-soft-sage/20 dark:hover:bg-muted-teal/20"
            )}
          >
            <Bookmark className="w-4 h-4"/>
          </button>
          <a 
            href={c.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-neutral-200 dark:border-muted-teal hover:bg-soft-sage/20 dark:hover:bg-muted-teal/20" 
            title="Open on Indian Kanoon"
          >
            <LinkIcon className="w-4 h-4"/>
          </a>
          <button 
            title="Share" 
            className="p-2 rounded-xl border border-neutral-200 dark:border-muted-teal hover:bg-soft-sage/20 dark:hover:bg-muted-teal/20"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: c.parties.title,
                  text: c.tldr60,
                  url: window.location.href
                })
              }
            }}
          >
            <Share2 className="w-4 h-4"/>
          </button>
        </div>
      </header>

      <p className="text-[15px] leading-7 mt-4 text-dark-authority dark:text-pale-mint font-body">
        {c.tldr60}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <MetaBadge><Clock className="w-3.5 h-3.5"/> 5‑min</MetaBadge>
        <MetaBadge><BookOpen className="w-3.5 h-3.5"/> {c.tags.join(" · ")}</MetaBadge>
        {c.judges?.length && <MetaBadge>Bench: {c.judges.slice(0, 2).join(", ")}</MetaBadge>}
      </div>

      {!expanded && (
        <div className="mt-5">
          <button 
            onClick={onExpand} 
            className="text-sm inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-deep-emerald text-deep-emerald dark:border-pale-mint dark:text-pale-mint hover:bg-deep-emerald hover:text-pale-mint dark:hover:bg-pale-mint dark:hover:text-deep-emerald transition-colors"
          >
            Read the 5‑minute brief <ChevronRight className="w-4 h-4"/>
          </button>
        </div>
      )}

      {expanded && (
        <div className="mt-5 space-y-4 text-[15px] leading-7">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-soft-sage/30 dark:bg-muted-teal/30 rounded"/>
              <div className="h-4 bg-soft-sage/30 dark:bg-muted-teal/30 rounded w-11/12"/>
              <div className="h-4 bg-soft-sage/30 dark:bg-muted-teal/30 rounded w-10/12"/>
              <div className="h-4 bg-soft-sage/30 dark:bg-muted-teal/30 rounded w-9/12"/>
            </div>
          ) : (
            <div className="grid gap-4">
              <SectionNumbered n={1} title="Facts" text={c.brief5min.facts} />
              <SectionNumbered n={2} title="Issues" text={c.brief5min.issues} />
              <SectionNumbered n={3} title="Holding" text={c.brief5min.holding} />
              <SectionNumbered n={4} title="Reasoning" text={c.brief5min.reasoning} />
              <SectionNumbered n={5} title="Disposition" text={c.brief5min.disposition} />
              {c.keyQuotes?.length > 0 && (
                <div className="pt-3 border-t border-dotted border-soft-sage dark:border-muted-teal space-y-2">
                  <div className="text-xs uppercase tracking-wide text-muted-teal dark:text-soft-sage">Pull‑quotes</div>
                  {c.keyQuotes.map((q, idx) => (
                    <figure key={idx} className="border-l-2 border-deep-emerald dark:border-soft-sage pl-3 italic text-sm text-slate-green dark:text-soft-sage">
                      "{q.quote}" {q.pin && <span className="not-italic text-muted-teal dark:text-soft-sage/70">{q.pin}</span>}
                    </figure>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function MetaBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-soft-sage/20 dark:bg-muted-teal/20 border border-soft-sage/40 dark:border-muted-teal/40 text-dark-authority dark:text-pale-mint">
      {children}
    </span>
  );
}

function SectionNumbered({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <section>
      <div className="flex items-baseline gap-2">
        <div className="w-6 h-6 rounded-lg grid place-items-center text-xs font-semibold bg-deep-emerald text-pale-mint dark:bg-pale-mint dark:text-deep-emerald">
          {n}
        </div>
        <h3 className="text-sm uppercase tracking-wide text-muted-teal dark:text-soft-sage">{title}</h3>
      </div>
      <p className="mt-2 text-dark-authority dark:text-pale-mint">{text}</p>
    </section>
  );
}
