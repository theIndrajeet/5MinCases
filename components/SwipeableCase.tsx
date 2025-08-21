'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useAnimation, PanInfo } from 'framer-motion'
import { Bookmark, Share2, Link as LinkIcon, ChevronUp, ChevronDown } from 'lucide-react'
import type { Case } from '@/types/case'

interface SwipeableCaseProps {
  currentCase: Case
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onBookmark?: () => void
  onShare?: () => void
  isBookmarked?: boolean
  hasNext?: boolean
  hasPrev?: boolean
}

export function SwipeableCase({
  currentCase,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onBookmark,
  onShare,
  isBookmarked = false,
  hasNext = true,
  hasPrev = true
}: SwipeableCaseProps) {
  const controls = useAnimation()
  const [showFullBrief, setShowFullBrief] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Swipe thresholds
  const SWIPE_THRESHOLD = 50
  const VELOCITY_THRESHOLD = 500

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const { offset, velocity } = info
    
    // Vertical swipes (up/down for navigation)
    if (Math.abs(offset.y) > Math.abs(offset.x)) {
      if (offset.y < -SWIPE_THRESHOLD || velocity.y < -VELOCITY_THRESHOLD) {
        // Swipe up - next case
        if (hasNext && onSwipeUp) {
          setSwipeDirection('up')
          await controls.start({ y: '-100%', opacity: 0, transition: { duration: 0.3 } })
          onSwipeUp()
          // Reset position for next case
          controls.set({ y: 0, x: 0, opacity: 1 })
          setSwipeDirection(null)
        } else {
          // Bounce back if no next
          controls.start({ y: 0, x: 0 })
        }
      } else if (offset.y > SWIPE_THRESHOLD || velocity.y > VELOCITY_THRESHOLD) {
        // Swipe down - previous case
        if (hasPrev && onSwipeDown) {
          setSwipeDirection('down')
          await controls.start({ y: '100%', opacity: 0, transition: { duration: 0.3 } })
          onSwipeDown()
          // Reset position for previous case
          controls.set({ y: 0, x: 0, opacity: 1 })
          setSwipeDirection(null)
        } else {
          // Bounce back if no previous
          controls.start({ y: 0, x: 0 })
        }
      } else {
        // Not enough swipe distance, bounce back
        controls.start({ y: 0, x: 0 })
      }
    } 
    // Horizontal swipes (left/right for actions)
    else {
      if (offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) {
        // Swipe left - bookmark
        if (onSwipeLeft || onBookmark) {
          setSwipeDirection('left')
          await controls.start({ x: -50, transition: { duration: 0.2 } })
          if (onBookmark) onBookmark()
          controls.start({ x: 0 })
          setSwipeDirection(null)
        }
      } else if (offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) {
        // Swipe right - share
        if (onSwipeRight || onShare) {
          setSwipeDirection('right')
          await controls.start({ x: 50, transition: { duration: 0.2 } })
          if (onShare) onShare()
          controls.start({ x: 0 })
          setSwipeDirection(null)
        }
      } else {
        // Not enough swipe distance, bounce back
        controls.start({ y: 0, x: 0 })
      }
    }
  }

  // Format date helper
  const formatDate = (iso: string) => {
    try { 
      return new Date(iso).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch { 
      return iso 
    }
  }

  return (
    <div className="fixed inset-0 bg-pale-mint dark:bg-slate-green overflow-hidden touch-none">
      {/* Swipe indicators */}
      <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
        {hasPrev && (
          <div className="text-xs text-muted-teal dark:text-soft-sage opacity-50 animate-bounce">
            <ChevronDown className="w-5 h-5 mx-auto" />
            Swipe down for previous
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
        {hasNext && (
          <div className="text-xs text-muted-teal dark:text-soft-sage opacity-50 animate-bounce">
            Swipe up for next
            <ChevronUp className="w-5 h-5 mx-auto" />
          </div>
        )}
      </div>

      {/* Side action indicators */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <div className={`transition-opacity ${swipeDirection === 'left' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-deep-emerald text-pale-mint p-3 rounded-full">
            <Bookmark className="w-6 h-6" fill={isBookmarked ? 'currentColor' : 'none'} />
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
        <div className={`transition-opacity ${swipeDirection === 'right' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-deep-emerald text-pale-mint p-3 rounded-full">
            <Share2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <motion.div
        ref={containerRef}
        drag
        dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="h-full flex flex-col p-4 pt-12 pb-12"
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl font-heading font-semibold text-dark-authority dark:text-pale-mint mb-2">
              {currentCase.parties.title}
            </h1>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-soft-sage/20 dark:bg-muted-teal/20 rounded-full">
                {currentCase.court}
              </span>
              <span className="px-2 py-1 bg-soft-sage/20 dark:bg-muted-teal/20 rounded-full">
                {formatDate(currentCase.date)}
              </span>
              {currentCase.neutralCitation && (
                <span className="px-2 py-1 bg-soft-sage/20 dark:bg-muted-teal/20 rounded-full">
                  {currentCase.neutralCitation}
                </span>
              )}
            </div>
          </div>

          {/* TL;DR */}
          <div className="bg-white dark:bg-slate-green/50 rounded-2xl p-4 mb-4 shadow-sm">
            <h2 className="text-xs uppercase tracking-wide text-muted-teal dark:text-soft-sage mb-2">
              60-Word TL;DR
            </h2>
            <p className="text-dark-authority dark:text-pale-mint leading-relaxed">
              {currentCase.tldr60}
            </p>
          </div>

          {/* 5-Minute Brief (expandable) */}
          <motion.div 
            className="bg-white dark:bg-slate-green/50 rounded-2xl p-4 shadow-sm"
            animate={{ height: showFullBrief ? 'auto' : '120px' }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowFullBrief(!showFullBrief)}
          >
            <h2 className="text-xs uppercase tracking-wide text-muted-teal dark:text-soft-sage mb-2">
              5-Minute Brief {showFullBrief ? '(tap to collapse)' : '(tap to expand)'}
            </h2>
            
            <div className={showFullBrief ? '' : 'line-clamp-3'}>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-deep-emerald dark:text-soft-sage">Facts:</strong>
                  <p className="text-dark-authority dark:text-pale-mint mt-1">
                    {currentCase.brief5min.facts}
                  </p>
                </div>
                
                {showFullBrief && (
                  <>
                    <div>
                      <strong className="text-deep-emerald dark:text-soft-sage">Issues:</strong>
                      <p className="text-dark-authority dark:text-pale-mint mt-1">
                        {currentCase.brief5min.issues}
                      </p>
                    </div>
                    
                    <div>
                      <strong className="text-deep-emerald dark:text-soft-sage">Holding:</strong>
                      <p className="text-dark-authority dark:text-pale-mint mt-1">
                        {currentCase.brief5min.holding}
                      </p>
                    </div>
                    
                    <div>
                      <strong className="text-deep-emerald dark:text-soft-sage">Reasoning:</strong>
                      <p className="text-dark-authority dark:text-pale-mint mt-1">
                        {currentCase.brief5min.reasoning}
                      </p>
                    </div>
                    
                    <div>
                      <strong className="text-deep-emerald dark:text-soft-sage">Disposition:</strong>
                      <p className="text-dark-authority dark:text-pale-mint mt-1">
                        {currentCase.brief5min.disposition}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Key Quotes */}
          {currentCase.keyQuotes.length > 0 && (
            <div className="mt-4 bg-white dark:bg-slate-green/50 rounded-2xl p-4 shadow-sm">
              <h2 className="text-xs uppercase tracking-wide text-muted-teal dark:text-soft-sage mb-2">
                Key Quotes
              </h2>
              <div className="space-y-2">
                {currentCase.keyQuotes.map((quote, idx) => (
                  <blockquote key={idx} className="border-l-2 border-deep-emerald pl-3 italic text-sm">
                    "{quote.quote}"
                    {quote.pin && (
                      <span className="not-italic text-xs text-muted-teal dark:text-soft-sage ml-2">
                        {quote.pin}
                      </span>
                    )}
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {currentCase.tags.map((tag) => (
              <span 
                key={tag} 
                className="px-3 py-1 bg-deep-emerald text-pale-mint text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Fixed bottom actions */}
        <div className="flex justify-around items-center pt-4 border-t border-soft-sage/20 dark:border-muted-teal/20">
          <button 
            onClick={onBookmark}
            className="p-3 rounded-full bg-white dark:bg-slate-green/50 shadow-sm"
          >
            <Bookmark 
              className="w-5 h-5 text-deep-emerald dark:text-pale-mint" 
              fill={isBookmarked ? 'currentColor' : 'none'}
            />
          </button>
          
          <a 
            href={currentCase.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-white dark:bg-slate-green/50 shadow-sm"
          >
            <LinkIcon className="w-5 h-5 text-deep-emerald dark:text-pale-mint" />
          </a>
          
          <button 
            onClick={onShare}
            className="p-3 rounded-full bg-white dark:bg-slate-green/50 shadow-sm"
          >
            <Share2 className="w-5 h-5 text-deep-emerald dark:text-pale-mint" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
