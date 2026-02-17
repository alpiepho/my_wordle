import { useState } from 'react'
import Modal from './Modal'
import { useTheme } from '@/context/ThemeContext'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  hardMode: boolean
  onToggleHardMode: () => void
  onResetGame: () => void
  onResetAll: () => void
}

declare const __APP_VERSION__: string

export default function SettingsModal({ open, onClose, hardMode, onToggleHardMode, onResetGame, onResetAll }: SettingsModalProps) {
  const { darkMode, setDarkMode, highContrast, setHighContrast } = useTheme()
  const [confirmReset, setConfirmReset] = useState<'game' | 'all' | null>(null)

  const handleClose = () => {
    setConfirmReset(null)
    onClose()
  }

  const handleResetGame = () => {
    onResetGame()
    setConfirmReset(null)
    handleClose()
  }

  const handleResetAll = () => {
    onResetAll()
    setConfirmReset(null)
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Settings">
      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">Version {__APP_VERSION__}</p>
      </div>
      <div className="space-y-4">
        <SettingRow
          label="Hard Mode"
          description="Any revealed hints must be used in subsequent guesses"
          checked={hardMode}
          onChange={onToggleHardMode}
        />
        <SettingRow
          label="Dark Theme"
          description=""
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
        />
        <SettingRow
          label="High Contrast Mode"
          description="For improved color vision"
          checked={highContrast}
          onChange={() => setHighContrast(!highContrast)}
        />
      </div>

      {/* Danger zone */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        {/* Reset Game */}
        {confirmReset === 'game' ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-red-600 dark:text-red-400">Reset current game?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmReset(null)}
                className="px-3 py-1 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetGame}
                className="px-3 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => setConfirmReset('game')}
              className="w-full py-2 text-sm font-medium rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors"
            >
              Reset Game
            </button>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
              Starts a fresh game in the current mode.
            </p>
          </>
        )}

        {/* Reset All */}
        {confirmReset === 'all' ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-red-600 dark:text-red-400">Erase all data?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmReset(null)}
                className="px-3 py-1 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAll}
                className="px-3 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset('all')}
            className="w-full py-2 text-sm font-medium rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 cursor-pointer transition-colors"
          >
            Reset All Data
          </button>
        )}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
          Reset All clears all settings, statistics, and saved games.
        </p>
      </div>
    </Modal>
  )
}

function SettingRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div>
        <div className="font-medium text-sm">{label}</div>
        {description && (
          <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
        )}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
          checked ? 'bg-[var(--color-correct)]' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
