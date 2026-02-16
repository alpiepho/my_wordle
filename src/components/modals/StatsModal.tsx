import { useState } from 'react'
import Modal from './Modal'
import type { GameMode } from '@/hooks/useStats'
import { loadStats } from '@/hooks/useStats'

interface StatsModalProps {
  open: boolean
  onClose: () => void
  currentMode: GameMode
  onShare?: () => void
  showShare?: boolean
}

export default function StatsModal({ open, onClose, currentMode, onShare, showShare }: StatsModalProps) {
  const [mode, setMode] = useState<GameMode>(currentMode)
  const stats = loadStats(mode)

  const winPct = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0

  const maxDistribution = Math.max(...Object.values(stats.guessDistribution), 1)

  return (
    <Modal open={open} onClose={onClose} title="Statistics">
      <div className="space-y-4">
        {/* Mode tabs */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setMode('daily')}
            className={`px-4 py-1 text-sm font-medium rounded-full transition-colors cursor-pointer ${
              mode === 'daily'
                ? 'bg-[var(--color-correct)] text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setMode('unlimited')}
            className={`px-4 py-1 text-sm font-medium rounded-full transition-colors cursor-pointer ${
              mode === 'unlimited'
                ? 'bg-[var(--color-correct)] text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            Unlimited
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <StatBox value={stats.gamesPlayed} label="Played" />
          <StatBox value={winPct} label="Win %" />
          <StatBox value={stats.currentStreak} label="Current Streak" />
          <StatBox value={stats.maxStreak} label="Max Streak" />
        </div>

        {/* Guess distribution */}
        <div>
          <h3 className="font-bold text-sm mb-2">Guess Distribution</h3>
          <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6].map(n => {
              const count = stats.guessDistribution[n] || 0
              const width = Math.max(7, (count / maxDistribution) * 100)
              return (
                <div key={n} className="flex items-center gap-2 text-sm">
                  <span className="w-3 font-medium">{n}</span>
                  <div
                    className="bg-[var(--color-correct)] text-white text-right px-2 py-0.5 text-xs font-medium rounded-sm min-w-[24px]"
                    style={{ width: `${width}%` }}
                  >
                    {count}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Share button */}
        {showShare && mode === currentMode && (
          <div className="flex justify-center pt-2">
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-6 py-2 bg-[var(--color-correct)] text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
              Share
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  )
}
