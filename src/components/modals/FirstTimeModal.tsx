import { useEffect, useState } from 'react'
import Modal from './Modal'

interface FirstTimeModalProps {
  open: boolean
  onClose: () => void
}

export default function FirstTimeModal({ open, onClose }: FirstTimeModalProps) {
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    // Check if app is running as PWA
    const checkPWA = () => {
      const isPwaMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      setIsPWA(isPwaMode)
    }

    checkPWA()
  }, [])

  return (
    <Modal open={open} onClose={onClose} title="Welcome to My Wordle">
      <div className="space-y-4 text-sm">
        <p>Welcome! Here are some ways to get the most out of the game:</p>

        {!isPWA && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-lg font-bold mb-3">Install as an App</p>
            <p className="text-xs mb-3">Get a native app-like experience that works offline!</p>

            <div className="mb-3">
              <p className="font-semibold text-xs mb-2">iPhone / iPad (Safari)</p>
              <ol className="list-decimal pl-5 space-y-1 text-xs">
                <li>Tap the <strong>Share</strong> button (square with arrow) at the bottom</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>"Add"</strong> to confirm</li>
              </ol>
            </div>

            <div>
              <p className="font-semibold text-xs mb-2">Android (Chrome)</p>
              <ol className="list-decimal pl-5 space-y-1 text-xs">
                <li>Tap the <strong>three-dot menu</strong> (⋮) in the upper right</li>
                <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
                <li>Tap <strong>"Install"</strong> to confirm</li>
              </ol>
            </div>
          </div>
        )}

        {isPWA && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 bg-green-50 dark:bg-green-900/20 p-3 rounded">
            <p className="text-xs text-green-700 dark:text-green-400">✓ You're running My Wordle as an installed app!</p>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="font-semibold text-sm mb-2">Quick Tips</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Daily:</strong> Everyone gets the same word each day</li>
            <li><strong>Unlimited:</strong> Play as many games as you want</li>
            <li><strong>Hard Mode:</strong> Use all revealed hints in your next guess</li>
            <li><strong>Offline:</strong> Works without internet connection</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-sm font-medium rounded bg-[var(--color-correct)] text-white hover:opacity-90 cursor-pointer transition-opacity mt-4"
        >
          Let's Play!
        </button>
      </div>
    </Modal>
  )
}
