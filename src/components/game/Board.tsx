import { useEffect, useState } from 'react'
import Tile from './Tile'
import type { EvaluatedLetter } from '@/utils/evaluateGuess'

const MAX_GUESSES = 6
const WORD_LENGTH = 5

interface BoardProps {
  guesses: EvaluatedLetter[][]
  currentGuess: string
  shakeRow: boolean
  onShakeEnd: () => void
  revealRow: number | null
  onRevealEnd: () => void
  gameStatus: 'playing' | 'won' | 'lost'
}

export default function Board({
  guesses,
  currentGuess,
  shakeRow,
  onShakeEnd,
  revealRow,
  onRevealEnd,
  gameStatus,
}: BoardProps) {
  const [bounceRow, setBounceRow] = useState<number | null>(null)

  // After reveal animation finishes, trigger bounce on win
  useEffect(() => {
    if (revealRow !== null && gameStatus === 'won') {
      // Wait for all tiles to flip (5 tiles × 300ms stagger + 500ms animation)
      const timer = setTimeout(() => {
        setBounceRow(revealRow)
        onRevealEnd()
      }, 5 * 300 + 200)
      return () => clearTimeout(timer)
    } else if (revealRow !== null) {
      const timer = setTimeout(onRevealEnd, 5 * 300 + 200)
      return () => clearTimeout(timer)
    }
  }, [revealRow, gameStatus, onRevealEnd])

  // Clear bounce after animation
  useEffect(() => {
    if (bounceRow !== null) {
      const timer = setTimeout(() => setBounceRow(null), 1000)
      return () => clearTimeout(timer)
    }
  }, [bounceRow])

  const rows = []

  for (let i = 0; i < MAX_GUESSES; i++) {
    const isCurrentRow = i === guesses.length
    const isRevealing = i === revealRow
    const isBouncing = i === bounceRow

    let tiles: React.ReactNode[]

    if (i < guesses.length) {
      // Completed guess row
      tiles = guesses[i].map((el, j) => (
        <Tile
          key={j}
          letter={el.letter}
          state={el.state}
          position={j}
          isRevealing={isRevealing}
          isBouncing={isBouncing}
        />
      ))
    } else if (isCurrentRow) {
      // Current guess row (being typed)
      tiles = Array.from({ length: WORD_LENGTH }, (_, j) => (
        <Tile
          key={j}
          letter={currentGuess[j] || ''}
          state={currentGuess[j] ? 'tbd' : 'idle'}
          position={j}
        />
      ))
    } else {
      // Empty row
      tiles = Array.from({ length: WORD_LENGTH }, (_, j) => (
        <Tile key={j} position={j} />
      ))
    }

    const shouldShake = isCurrentRow && shakeRow

    rows.push(
      <div
        key={i}
        className={`flex gap-[5px] ${shouldShake ? 'row-shake' : ''}`}
        onAnimationEnd={shouldShake ? onShakeEnd : undefined}
      >
        {tiles}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[5px] items-center py-2">
      {rows}
    </div>
  )
}
