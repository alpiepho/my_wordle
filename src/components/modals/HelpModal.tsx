import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import Modal from './Modal'

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

const GAME_URL = 'https://alpiepho.github.io/my_wordle/'

export default function HelpModal({ open, onClose }: HelpModalProps) {
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    // Generate QR code as data URL
    QRCode.toDataURL(GAME_URL, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 256,
      margin: 2,
    })
      .then((url: string) => setQrCodeUrl(url))
      .catch((err: Error) => console.error('Failed to generate QR code:', err))
  }, [])

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(GAME_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="How To Play">
      <div className="space-y-4 text-sm max-h-[80vh] overflow-y-auto">
        <p>Guess the <strong>Word</strong> in 6 tries.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Each guess must be a valid 5-letter word.</li>
          <li>The color of the tiles will change to show how close your guess was to the word.</li>
        </ul>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="font-bold mb-2">Examples</p>

          <div className="space-y-3">
            <div>
              <div className="flex gap-1 mb-1">
                <ExampleTile letter="W" state="correct" />
                <ExampleTile letter="E" />
                <ExampleTile letter="A" />
                <ExampleTile letter="R" />
                <ExampleTile letter="Y" />
              </div>
              <p><strong>W</strong> is in the word and in the correct spot.</p>
            </div>

            <div>
              <div className="flex gap-1 mb-1">
                <ExampleTile letter="P" />
                <ExampleTile letter="I" state="present" />
                <ExampleTile letter="L" />
                <ExampleTile letter="L" />
                <ExampleTile letter="S" />
              </div>
              <p><strong>I</strong> is in the word but in the wrong spot.</p>
            </div>

            <div>
              <div className="flex gap-1 mb-1">
                <ExampleTile letter="V" />
                <ExampleTile letter="A" />
                <ExampleTile letter="G" />
                <ExampleTile letter="U" state="absent" />
                <ExampleTile letter="E" />
              </div>
              <p><strong>U</strong> is not in the word in any spot.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="font-bold mb-2">Modes</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Daily:</strong> Everyone gets the same word each day. One puzzle per day.</li>
            <li><strong>Unlimited:</strong> Play as many games as you want with random words.</li>
          </ul>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="font-bold mb-2">Hard Mode</p>
          <p>Any revealed hints must be used in subsequent guesses. Can be toggled in Settings before starting a game.</p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-lg font-bold mb-3">Share This Game</p>
          <p className="text-xs mb-3">Share My Wordle with friends:</p>
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleCopyUrl}
              className="w-full px-3 py-2 text-xs font-medium rounded bg-[var(--color-correct)] text-white hover:opacity-90 cursor-pointer transition-opacity"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          {qrCodeUrl && (
            <div className="flex justify-center mb-3">
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 border-2 border-gray-200 dark:border-gray-700 p-2" />
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="font-bold mb-2">Install as an App</p>
          <p className="text-xs mb-3">Get a native app-like experience that works offline!</p>
          
          <div className="mb-3">
            <p className="font-semibold text-xs mb-2">iPhone / iPad (Safari)</p>
            <ol className="list-decimal pl-5 space-y-1 text-xs">
              <li>Open this game in <strong>Safari</strong></li>
              <li>Tap the <strong>Share</strong> button (square with arrow)</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
              <li>Tap <strong>"Add"</strong></li>
            </ol>
          </div>

          <div>
            <p className="font-semibold text-xs mb-2">Android (Chrome)</p>
            <ol className="list-decimal pl-5 space-y-1 text-xs">
              <li>Open this game in <strong>Chrome</strong></li>
              <li>Tap the <strong>three-dot menu</strong> (⋮)</li>
              <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
              <li>Tap <strong>"Install"</strong></li>
            </ol>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function ExampleTile({ letter, state }: { letter: string; state?: 'correct' | 'present' | 'absent' }) {
  const colorClass = (() => {
    switch (state) {
      case 'correct': return 'bg-[var(--color-correct)] border-[var(--color-correct)] text-white'
      case 'present': return 'bg-[var(--color-present)] border-[var(--color-present)] text-white'
      case 'absent': return 'bg-[var(--color-absent)] border-[var(--color-absent)] text-white'
      default: return 'border-gray-300 dark:border-gray-600'
    }
  })()

  return (
    <div className={`w-10 h-10 border-2 flex items-center justify-center text-lg font-bold uppercase ${colorClass}`}>
      {letter}
    </div>
  )
}
