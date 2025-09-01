'use client'

import React from 'react'
import { ExternalLink, Calendar, User, Tag } from 'lucide-react'
import type { NewsItem } from '@/types/news'

interface NewsCardProps {
  news: NewsItem
}

export function NewsCard({ news }: NewsCardProps) {
  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return iso
    }
  }

  return (
    <article className="rounded-2xl border border-neutral-200 dark:border-muted-teal bg-white/80 dark:bg-slate-green/80 backdrop-blur p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold leading-snug text-dark-authority dark:text-pale-mint mb-2">
            {news.title}
          </h3>
          
          <p className="text-sm text-muted-teal dark:text-soft-sage line-clamp-3 mb-3">
            {news.summary}
          </p>
          
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-muted-teal dark:text-soft-sage">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(news.publishedDate)}
            </span>
            
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-soft-sage/20 dark:bg-muted-teal/20 border border-soft-sage/40 dark:border-muted-teal/40">
              {news.source}
            </span>
            
            {news.category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-deep-emerald/10 dark:bg-pale-mint/10 text-deep-emerald dark:text-pale-mint">
                <Tag className="w-3.5 h-3.5" />
                {news.category}
              </span>
            )}
            
            {news.author && (
              <span className="inline-flex items-center gap-1 text-muted-teal dark:text-soft-sage">
                <User className="w-3.5 h-3.5" />
                {news.author}
              </span>
            )}
          </div>
        </div>
        
        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-2 rounded-xl border border-deep-emerald dark:border-pale-mint text-deep-emerald dark:text-pale-mint hover:bg-deep-emerald hover:text-pale-mint dark:hover:bg-pale-mint dark:hover:text-deep-emerald transition-colors"
          title="Read full article"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </article>
  )
}
