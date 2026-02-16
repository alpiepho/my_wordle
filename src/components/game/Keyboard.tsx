import type { LetterState } from '@/utils/evaluateGuess'

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
]

interface KeyboardProps {
  usedLetters: Record<string, LetterState>
  onKey: (key: string) => void
  disabled?: boolean
}

export default function Keyboard({ usedLetters, onKey, disabled }: KeyboardProps) {
  const getKeyClass = (key: string): string => {
    const base = 'flex items-center justify-center rounded font-bold uppercase select-none cursor-pointer transition-colors'
    const state = usedLetters[key]

    if (key === 'enter' || key === 'backspace') {
      return `${base} px-2 sm:px-4 h-[58px] text-xs sm:text-sm bg-wl-key-bg dark:bg-gray-600 text-gray-900 dark:text-gray-100 hover:opacity-80`
    }

    const size = `w-[32px] sm:w-[43px] h-[58px] text-sm sm:text-base`

    switch (state) {
      case 'correct':
        return `${base} ${size} bg-[var(--color-correct)] text-white`
      case 'present':
        return `${base} ${size} bg-[var(--color-present)] text-white`
      case 'absent':
        return `${base} ${size} bg-[var(--color-absent)] text-white dark:bg-gray-700`
      default:
        return `${base} ${size} bg-wl-key-bg dark:bg-gray-500 text-gray-900 dark:text-gray-100 hover:opacity-80`
    }
  }

  const renderKey = (key: string) => {
    let label: React.ReactNode = key

    if (key === 'enter') label = 'Enter'
    if (key === 'backspace') label = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
        <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z" />
      </svg>
    )

    return (
      <button
        key={key}
        className={getKeyClass(key)}
        onClick={() => !disabled && onKey(key)}
        aria-label={key}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 items-center w-full max-w-[500px] mx-auto px-1 pb-2">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1.5 w-full justify-center">
          {i === 1 && <div className="w-[15px] sm:w-[22px] flex-shrink-0" />}
          {row.map(renderKey)}
          {i === 1 && <div className="w-[15px] sm:w-[22px] flex-shrink-0" />}
        </div>
      ))}
    </div>
  )
}
