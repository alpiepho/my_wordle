import type { EvaluatedLetter } from './evaluateGuess'

/**
 * Generate a shareable emoji grid string.
 *
 * Example output:
 *   Wordle 42 4/6
 *
 *   ⬜🟨⬜⬜⬜
 *   ⬜🟩⬜🟨🟨
 *   🟩🟩🟨⬜🟩
 *   🟩🟩🟩🟩🟩
 */
export function generateShareText(
  guesses: EvaluatedLetter[][],
  puzzleNumber: number,
  won: boolean,
  hardMode: boolean,
  highContrast: boolean,
): string {
  const attempts = won ? `${guesses.length}/6` : 'X/6'
  const hardModeMarker = hardMode ? '*' : ''

  const emojiGrid = guesses
    .map(row =>
      row
        .map(({ state }) => {
          if (highContrast) {
            switch (state) {
              case 'correct': return '🟧'
              case 'present': return '🟦'
              case 'absent': return '⬛'
            }
          }
          switch (state) {
            case 'correct': return '🟩'
            case 'present': return '🟨'
            case 'absent': return '⬛'
          }
        })
        .join('')
    )
    .join('\n')

  return `Wordle ${puzzleNumber} ${attempts}${hardModeMarker}\n\n${emojiGrid}`
}

/**
 * Copy text to clipboard.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
