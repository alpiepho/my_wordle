import Modal from './Modal'
import { useTheme } from '@/context/ThemeContext'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  hardMode: boolean
  onToggleHardMode: () => void
}

export default function SettingsModal({ open, onClose, hardMode, onToggleHardMode }: SettingsModalProps) {
  const { darkMode, setDarkMode, highContrast, setHighContrast } = useTheme()

  return (
    <Modal open={open} onClose={onClose} title="Settings">
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
        className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
          checked ? 'bg-[var(--color-correct)]' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
