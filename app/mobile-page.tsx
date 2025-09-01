'use client'

import { useState, useEffect } from 'react'
import { SwipeableCase } from '@/components/SwipeableCase'
import { InstallPrompt } from '@/components/InstallPrompt'
import type { Case } from '@/types/case'

export function MobilePage({ initialCases }: { initialCases: Case[] }) {
  const [cases, setCases] = useState<Case[]>(initialCases)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [savedIds, setSavedIds] = useState<string[]>([])

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

  const currentCase = cases[currentIndex]
  const hasNext = currentIndex < cases.length - 1
  const hasPrev = currentIndex > 0

  const handleSwipeUp = () => {
    if (hasNext) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleSwipeDown = () => {
    if (hasPrev) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleBookmark = () => {
    if (!currentCase) return
    
    setSavedIds(prev => 
      prev.includes(currentCase.id)
        ? prev.filter(id => id !== currentCase.id)
        : [...prev, currentCase.id]
    )
  }

  const handleShare = async () => {
    if (!currentCase) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentCase.parties.title,
          text: currentCase.tldr60,
          url: window.location.href
        })
      } catch (error) {
        // User cancelled or error
        console.log('Share cancelled')
      }
    } else {
      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(
        `${currentCase.parties.title}\n\n${currentCase.tldr60}\n\nRead more: ${window.location.href}`
      )
      // You could show a toast here
    }
  }

  if (!currentCase) {
    return (
      <div className="fixed inset-0 bg-pale-mint dark:bg-slate-green flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-deep-emerald animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-teal dark:text-soft-sage">Loading cases...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SwipeableCase
        currentCase={currentCase}
        onSwipeUp={handleSwipeUp}
        onSwipeDown={handleSwipeDown}
        onBookmark={handleBookmark}
        onShare={handleShare}
        isBookmarked={savedIds.includes(currentCase.id)}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />
      <InstallPrompt />
      
      {/* Progress indicator */}
      <div className="fixed top-4 left-4 right-4 z-20">
        <div className="bg-white/80 dark:bg-slate-green/80 backdrop-blur rounded-full p-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-teal dark:text-soft-sage px-2">
              {currentIndex + 1} / {cases.length}
            </span>
            <div className="flex-1 mx-2">
              <div className="h-1 bg-soft-sage/30 dark:bg-muted-teal/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-deep-emerald dark:bg-pale-mint transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / cases.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
