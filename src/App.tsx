import { useState, useCallback, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Board from '@/components/game/Board'
import Keyboard from '@/components/game/Keyboard'
import Toast from '@/components/game/Toast'
import HelpModal from '@/components/modals/HelpModal'
import StatsModal from '@/components/modals/StatsModal'
import SettingsModal from '@/components/modals/SettingsModal'
import FirstTimeModal from '@/components/modals/FirstTimeModal'
import UpdatePrompt from '@/components/UpdatePrompt'
import { useGameState } from '@/hooks/useGameState'
import { useKeyboard } from '@/hooks/useKeyboard'
import { generateShareText, copyToClipboard } from '@/utils/share'
import { useTheme } from '@/context/ThemeContext'

const FIRST_TIME_KEY = 'wordle-first-time-shown'

export default function App() {
  const [helpOpen, setHelpOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [firstTimeOpen, setFirstTimeOpen] = useState(false)
  const [shareToast, setShareToast] = useState<string | null>(null)
  const { highContrast, setDarkMode, setHighContrast } = useTheme()

  const game = useGameState('daily')

  // Show first-time modal on initial load
  useEffect(() => {
    const hasSeenFirstTime = localStorage.getItem(FIRST_TIME_KEY)
    if (!hasSeenFirstTime) {
      setFirstTimeOpen(true)
      localStorage.setItem(FIRST_TIME_KEY, 'true')
    }
  }, [])

  const anyModalOpen = helpOpen || statsOpen || settingsOpen || firstTimeOpen

  const handleKey = useCallback((key: string) => {
    if (key === 'enter') {
      game.submitGuess()
    } else if (key === 'backspace') {
      game.removeLetter()
    } else {
      game.addLetter(key)
    }
  }, [game])

  useKeyboard({
    onLetter: game.addLetter,
    onEnter: game.submitGuess,
    onBackspace: game.removeLetter,
    disabled: anyModalOpen || game.gameStatus !== 'playing',
  })

  // Auto-show stats after game ends
  const handleRevealEnd = useCallback(() => {
    game.clearRevealRow()
    if (game.gameStatus !== 'playing') {
      setTimeout(() => setStatsOpen(true), game.gameStatus === 'won' ? 1500 : 500)
    }
  }, [game])

  const handleShare = useCallback(async () => {
    const text = generateShareText(
      game.guesses,
      game.puzzleNumber,
      game.gameStatus === 'won',
      game.hardMode,
      highContrast,
    )
    const success = await copyToClipboard(text)
    setShareToast(success ? 'Copied results to clipboard!' : 'Failed to copy')
  }, [game.guesses, game.puzzleNumber, game.gameStatus, game.hardMode, highContrast])

  return (
    <div className="flex flex-col min-h-dvh">
      <Header
        mode={game.mode}
        onModeChange={game.setMode}
        onHelp={() => setHelpOpen(true)}
        onStats={() => setStatsOpen(true)}
        onSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 flex flex-col items-center justify-between max-w-lg mx-auto w-full">
        {/* Game board */}
        <div className="flex-1 flex items-center">
          <Board
            guesses={game.guesses}
            currentGuess={game.currentGuess}
            shakeRow={game.shakeRow}
            onShakeEnd={game.clearShake}
            revealRow={game.revealRow}
            onRevealEnd={handleRevealEnd}
            gameStatus={game.gameStatus}
            tenTriesMode={game.tenTriesMode}
          />
        </div>

        {/* New Game button for unlimited mode when game is over */}
        {game.gameStatus !== 'playing' && game.mode === 'unlimited' && (
          <button
            onClick={game.newGame}
            className="mb-2 px-6 py-2 bg-[var(--color-correct)] text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            New Game
          </button>
        )}

        {/* Keyboard */}
        <Keyboard
          usedLetters={game.usedLetters}
          onKey={handleKey}
          disabled={game.gameStatus !== 'playing'}
        />
      </main>

      {/* Toast for game messages */}
      <Toast
        message={game.toastMessage}
        onDone={game.clearToast}
        persist={game.gameStatus !== 'playing'}
        duration={game.gameStatus !== 'playing' ? 2000 : 1500}
      />

      {/* Toast for share */}
      <Toast
        message={shareToast}
        onDone={() => setShareToast(null)}
        duration={2000}
      />

      {/* Modals */}
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <StatsModal
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        currentMode={game.mode}
        onShare={handleShare}
        showShare={game.gameStatus !== 'playing'}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        hardMode={game.hardMode}
        onToggleHardMode={game.toggleHardMode}
        tenTriesMode={game.tenTriesMode}
        onToggleTenTriesMode={game.toggleTenTriesMode}
        onResetGame={game.resetGame}
        onResetAll={() => {
          game.resetAll()
          // Theme context reads from localStorage on init, which resetAll just cleared,
          // so reset theme to system defaults
          setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
          setHighContrast(false)
          // Clear first-time flag so modal shows again
          localStorage.removeItem(FIRST_TIME_KEY)
          setSettingsOpen(false)
          setFirstTimeOpen(true)
        }}
      />
      <FirstTimeModal open={firstTimeOpen} onClose={() => setFirstTimeOpen(false)} />

      <UpdatePrompt />
    </div>
  )
}
