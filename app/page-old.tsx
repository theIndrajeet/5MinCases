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
} from "lucide-react"
import type { Case } from "@/types/case"
import { useIsMobile } from "@/hooks/useIsMobile"
import { MobilePage } from "./mobile-page"

// Helper function for class names
function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// Constants
const areas = [
  "Arbitration",
  "Criminal Procedure",
  "Data Protection",
  "IPR",
  "Media",
  "Health Privacy",
  "Administrative",
  "Commercial",
];

const jurisdictions = ["India", "US", "UK"];

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
}

// Components
function Sidebar({ tab, setTab }: { tab: string; setTab: (s: string) => void }) {
  const Item = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <button
      onClick={() => setTab(id)}
      className={classNames(
        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm border transition-all",
        tab === id 
          ? "bg-deep-emerald text-pale-mint border-deep-emerald dark:bg-pale-mint dark:text-deep-emerald" 
          : "bg-white/80 dark:bg-slate-green/80 border-neutral-200 dark:border-muted-teal hover:bg-soft-sage/20 dark:hover:bg-muted-teal/20"
      )}
    >
      <Icon className="w-4 h-4"/>
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <aside className="hidden lg:flex lg:flex-col gap-2 w-60 sticky top-0 h-[100dvh] p-4 border-r border-neutral-200 dark:border-muted-teal bg-pale-mint/60 dark:bg-slate-green/60 backdrop-blur">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 grid place-items-center rounded-lg bg-deep-emerald text-pale-mint dark:bg-pale-mint dark:text-deep-emerald">
          <Sparkles className="w-4 h-4"/>
        </div>
        <div className="font-semibold tracking-tight text-deep-emerald dark:text-pale-mint">5 Min Case</div>
      </div>
      <Item id="today" label="Today" icon={Home} />
      <Item id="trending" label="Trending" icon={LineChart} />
      <Item id="library" label="Library" icon={Library} />
      <Item id="saved" label="Saved" icon={Star} />
      <div className="mt-auto space-y-2 text-xs text-muted-teal dark:text-soft-sage">
        <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Public-domain texts only</div>
        <div className="flex items-center gap-2"><Info className="w-4 h-4"/> Law in 5 minutes</div>
      </div>
    </aside>
  );
}

function Hero({ casesCount }: { casesCount: number }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <section className="rounded-3xl border border-neutral-200 dark:border-muted-teal bg-white/70 dark:bg-slate-green/70 backdrop-blur p-6 case-card-gradient">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-teal dark:text-soft-sage">Daily Digest</div>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold leading-tight mt-1 text-dark-authority dark:text-pale-mint">
            Fresh cases, five‑minute briefs.
          </h1>
          <p className="text-sm text-muted-teal dark:text-soft-sage mt-1">{dateStr} · {casesCount} curated decisions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-soft-sage/20 dark:bg-muted-teal/20 border border-soft-sage dark:border-muted-teal">
            <Bell className="w-3.5 h-3.5"/> Case closed, in 60 words
          </span>
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-soft-sage/20 dark:bg-muted-teal/20 border border-soft-sage dark:border-muted-teal">
            <BookOpen className="w-3.5 h-3.5"/> 5‑minute standard
          </span>
        </div>
      </div>
    </section>
  );
}

function MetaBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-soft-sage/20 dark:bg-muted-teal/20 border border-soft-sage/40 dark:border-muted-teal/40 text-dark-authority dark:text-pale-mint">
      {children}
    </span>
  );
}

function CaseMetaRow({ c }: { c: Case }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[13px]">
      <MetaBadge>{c.court}</MetaBadge>
      <MetaBadge>{formatDate(c.date)}</MetaBadge>
      {c.neutralCitation && <MetaBadge>{c.neutralCitation}</MetaBadge>}
      {c.reporterCitations?.length ? <MetaBadge>{c.reporterCitations.join(" · ")}</MetaBadge> : null}
    </div>
  );
}

function PullQuote({ quote, pin }: { quote: string; pin?: string }) {
  return (
    <figure className="border-l-2 border-deep-emerald dark:border-soft-sage pl-3 italic text-sm text-slate-green dark:text-soft-sage">
      "{quote}" {pin && <span className="not-italic text-muted-teal dark:text-soft-sage/70">{pin}</span>}
    </figure>
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
          <div className="mt-2"><CaseMetaRow c={c} /></div>
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
            title="Open source"
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
        <MetaBadge>{c.jurisdiction}</MetaBadge>
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
                  {c.keyQuotes.map((q, idx) => <PullQuote key={idx} quote={q.quote} pin={q.pin} />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// Main component
export default function FiveMinCaseApp() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null)
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [cursor, setCursor] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [tab, setTab] = useState<"today" | "trending" | "saved">("today")
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [dark, setDark] = useState(false)
  
  // Mobile detection
  const isMobile = useIsMobile()

  // Load cases on mount
  useEffect(() => {
    async function loadCases() {
      try {
        // Try to load today's cases first
        const response = await fetch('/data/today.json')
        if (response.ok) {
          const data = await response.json()
          setCases(data.cases || [])
        } else {
          // Fallback to demo data
          console.log('Using demo data - run scraper to get real cases')
          // You can add demo cases here for testing
        }
      } catch (error) {
        console.error('Failed to load cases:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadCases()
  }, [])

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setCursor((i) => Math.min(filtered.length - 1, i + 1));
      if (e.key === "ArrowLeft") setCursor((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
  const filtered = useMemo(() => {
    let res = cases;
    if (selectedJurisdiction) res = res.filter(c => c.jurisdiction === selectedJurisdiction);
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
  }, [query, selectedJurisdiction, selectedAreas, cases]);

  const showing = filtered[cursor];
  const saved = cases.filter(c => savedIds.includes(c.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-pale-mint dark:bg-slate-green flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-deep-emerald animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-teal dark:text-soft-sage">Loading cases...</p>
        </div>
      </div>
    )
  }

  // Show mobile interface on mobile devices
  if (isMobile) {
    return <MobilePage initialCases={filtered} />
  }

  return (
    <div className="min-h-screen bg-pale-mint dark:bg-neutral-950 text-dark-authority dark:text-pale-mint">
      <div className="max-w-[96rem] mx-auto grid grid-cols-1 lg:grid-cols-[15rem_1fr]">
        <Sidebar tab={tab} setTab={setTab as any} />
        
        <div>
          {/* Top bar */}
          <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-pale-mint/70 bg-pale-mint/80 dark:bg-neutral-950/70 border-b border-neutral-200 dark:border-muted-teal">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
              <button 
                onClick={() => setDark(!dark)}
                className="ml-auto inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border border-deep-emerald dark:border-pale-mint hover:bg-deep-emerald hover:text-pale-mint dark:hover:bg-pale-mint dark:hover:text-deep-emerald transition-colors"
                title="Toggle theme"
              >
                {dark ? <SunMedium className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
                {dark ? "Light" : "Dark"}
              </button>
            </div>
          </div>

          <main className="max-w-7xl mx-auto py-6">
            <Hero casesCount={cases.length} />
            
            {/* Search and filters */}
            <div className="max-w-7xl mx-auto px-6 mt-6 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-teal" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by party, citation, statute, court…"
                  className="w-full pl-10 pr-3 py-3 rounded-2xl bg-white/90 dark:bg-slate-green/90 border border-neutral-200 dark:border-muted-teal text-sm focus:outline-none focus:ring-2 focus:ring-deep-emerald dark:focus:ring-pale-mint shadow-sm"
                />
              </div>
            </div>

            {/* Content */}
            <div className="mt-6 px-6">
              {tab === "today" && (
                <div className="max-w-3xl mx-auto space-y-4">
                  {showing ? (
                    <CaseCard
                      c={showing}
                      expanded={expandedId === showing.id}
                      onExpand={() => setExpandedId((id) => id === showing.id ? null : showing.id)}
                      saved={savedIds.includes(showing.id)}
                      onToggleSave={() => setSavedIds((ids) => 
                        ids.includes(showing.id) 
                          ? ids.filter(x => x !== showing.id) 
                          : [...ids, showing.id]
                      )}
                    />
                  ) : (
                    <div className="text-center text-sm text-muted-teal dark:text-soft-sage py-20">
                      {cases.length === 0 
                        ? "No cases yet. The scraper will run automatically to fetch new cases." 
                        : "No results. Try clearing filters."}
                    </div>
                  )}
                </div>
              )}

              {tab === "trending" && (
                <div className="max-w-3xl mx-auto space-y-4">
                  <p className="text-center text-muted-teal dark:text-soft-sage">
                    Trending cases will appear here once we have more data.
                  </p>
                </div>
              )}

              {tab === "saved" && (
                saved.length ? (
                  <div className="max-w-3xl mx-auto space-y-4">
                    {saved.map((c) => (
                      <CaseCard key={c.id}
                        c={c}
                        expanded={expandedId === c.id}
                        onExpand={() => setExpandedId((id) => id === c.id ? null : c.id)}
                        saved={savedIds.includes(c.id)}
                        onToggleSave={() => setSavedIds((ids) => 
                          ids.includes(c.id) 
                            ? ids.filter(x => x !== c.id) 
                            : [...ids, c.id]
                        )}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl grid place-items-center border border-dashed border-deep-emerald dark:border-pale-mint mb-4">
                      <Bookmark className="w-6 h-6"/>
                    </div>
                    <div className="font-medium text-lg">No saved cases yet</div>
                    <div className="text-sm text-muted-teal dark:text-soft-sage mt-1">
                      Tap the bookmark on any case to build your Brief Bank.
                    </div>
                  </div>
                )
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Navigation footer */}
      {tab === "today" && filtered.length > 0 && (
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
                {cursor + 1} / {filtered.length} 
                <span className="ml-2 opacity-60">(← / →)</span>
              </div>
              <button 
                onClick={() => setCursor((i) => Math.min(filtered.length - 1, i + 1))} 
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
