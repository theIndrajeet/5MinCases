'use client'

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check localStorage for dismissed prompt
    const dismissed = localStorage.getItem('5mc_install_dismissed')
    if (dismissed) {
      return
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after 30 seconds or 5 page views
      setTimeout(() => setShowPrompt(true), 30000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Install prompt error:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('5mc_install_dismissed', 'true')
  }

  if (!showPrompt || isInstalled) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-deep-emerald text-pale-mint rounded-2xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <Download className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Install 5 Min Case</h3>
            <p className="text-sm opacity-90 mb-3">
              Add to your home screen for the best experience with offline access
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-pale-mint text-deep-emerald rounded-xl font-medium text-sm"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-white/10 rounded-xl text-sm"
              >
                Not now
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
