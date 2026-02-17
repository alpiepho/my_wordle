import { useEffect, useState } from 'react'
import type { EvaluatedLetter } from '@/utils/evaluateGuess'

interface TileProps {
  letter?: string
  state?: 'idle' | 'tbd' | 'correct' | 'present' | 'absent'
  position?: number
  isRevealing?: boolean
  isBouncing?: boolean
  scale?: number
}

export default function Tile({ letter, state = 'idle', position = 0, isRevealing, isBouncing, scale = 1 }: TileProps) {
  const [phase, setPhase] = useState<'idle' | 'flip-in' | 'flip-out' | 'done'>('idle')
  const [displayState, setDisplayState] = useState(state)

  useEffect(() => {
    if (!isRevealing) {
      setDisplayState(state)
      setPhase('idle')
      return
    }

    // Start flip after staggered delay
    const delay = position * 300
    const flipInTimer = setTimeout(() => setPhase('flip-in'), delay)
    const midTimer = setTimeout(() => {
      setDisplayState(state)
      setPhase('flip-out')
    }, delay + 250)
    const doneTimer = setTimeout(() => setPhase('done'), delay + 500)

    return () => {
      clearTimeout(flipInTimer)
      clearTimeout(midTimer)
      clearTimeout(doneTimer)
    }
  }, [isRevealing, state, position])

  const colorClass = (() => {
    switch (displayState) {
      case 'correct': return 'bg-[var(--color-correct)] border-[var(--color-correct)] text-white'
      case 'present': return 'bg-[var(--color-present)] border-[var(--color-present)] text-white'
      case 'absent': return 'bg-[var(--color-absent)] border-[var(--color-absent)] text-white'
      case 'tbd': return 'border-wl-tile-active dark:border-gray-500 bg-transparent text-gray-900 dark:text-gray-100'
      default: return 'border-wl-tile-border dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100'
    }
  })()

  const animClass = (() => {
    if (phase === 'flip-in') return 'tile-flip-in'
    if (phase === 'flip-out') return 'tile-flip-out'
    if (isBouncing) return 'tile-bounce'
    if (letter && displayState === 'tbd') return 'tile-pop'
    return ''
  })()

  const tileSize = 62 * scale
  const fontSize = 2 * scale
  
  return (
    <div
      className={`
        border-2 flex items-center justify-center
        font-bold uppercase select-none
        ${colorClass} ${animClass}
      `}
      style={{
        width: `${tileSize}px`,
        height: `${tileSize}px`,
        maxWidth: `${tileSize}px`,
        maxHeight: `${tileSize}px`,
        fontSize: `${fontSize}rem`,
        animationDelay: isBouncing ? `${position * 100}ms` : undefined,
      }}
    >
      {letter || ''}
    </div>
  )
}

// Helper to convert EvaluatedLetter to Tile state
export function toTileState(el: EvaluatedLetter): 'correct' | 'present' | 'absent' {
  return el.state
}
