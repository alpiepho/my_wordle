import { useEffect } from 'react'

interface UseKeyboardProps {
  onLetter: (letter: string) => void
  onEnter: () => void
  onBackspace: () => void
  disabled?: boolean
}

export function useKeyboard({ onLetter, onEnter, onBackspace, disabled }: UseKeyboardProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (disabled) return
      // Ignore if modifier keys are held
      if (e.ctrlKey || e.metaKey || e.altKey) return

      if (e.key === 'Enter') {
        e.preventDefault()
        onEnter()
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        onBackspace()
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        onLetter(e.key.toLowerCase())
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onLetter, onEnter, onBackspace, disabled])
}
