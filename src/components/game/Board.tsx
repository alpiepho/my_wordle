import { useEffect, useState } from 'react'
import Tile from './Tile'
import type { EvaluatedLetter } from '@/utils/evaluateGuess'

const WORD_LENGTH = 5

interface BoardProps {
  guesses: EvaluatedLetter[][]
  currentGuess: string
  shakeRow: boolean
  onShakeEnd: () => void
  revealRow: number | null
  onRevealEnd: () => void
  gameStatus: 'playing' | 'won' | 'lost'
  tenTriesMode?: boolean
}

export default function Board({
  guesses,
  currentGuess,
  shakeRow,
  onShakeEnd,
  revealRow,
  onRevealEnd,
  gameStatus,
  tenTriesMode = false,
}: BoardProps) {
  const maxGuesses = tenTriesMode ? 10 : 6
  const scale = tenTriesMode ? 0.75 : 1
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

  for (let i = 0; i < maxGuesses; i++) {
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
          scale={scale}
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
          scale={scale}
        />
      ))
    } else {
      // Empty row
      tiles = Array.from({ length: WORD_LENGTH }, (_, j) => (
        <Tile key={j} position={j} scale={scale} />
      ))
    }

    const shouldShake = isCurrentRow && shakeRow

    const gapSize = Math.round(5 * scale)
    rows.push(
      <div
        key={i}
        className={`flex ${shouldShake ? 'row-shake' : ''}`}
        style={{ gap: `${gapSize}px` }}
        onAnimationEnd={shouldShake ? onShakeEnd : undefined}
      >
        {tiles}
      </div>
    )
  }

  const verticalGapSize = Math.round(5 * scale)
  return (
    <div className="flex flex-col items-center py-2" style={{ gap: `${verticalGapSize}px` }}>
      {rows}
    </div>
  )
}
