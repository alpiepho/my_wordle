import type { EvaluatedLetter } from './evaluateGuess'

/**
 * Validate a guess against hard mode rules.
 * Returns an error message string if invalid, or null if valid.
 *
 * Rules:
 * - Any letter marked 'correct' in a prior guess must be in the same position.
 * - Any letter marked 'present' in a prior guess must appear somewhere in the guess.
 */
export function validateHardMode(
  guess: string,
  previousGuesses: EvaluatedLetter[][],
): string | null {
  const g = guess.toLowerCase()

  for (const prev of previousGuesses) {
    for (let i = 0; i < 5; i++) {
      if (prev[i].state === 'correct' && g[i] !== prev[i].letter) {
        return `${ordinal(i + 1)} letter must be ${prev[i].letter.toUpperCase()}`
      }
    }
    for (let i = 0; i < 5; i++) {
      if (prev[i].state === 'present' && !g.includes(prev[i].letter)) {
        return `Guess must contain ${prev[i].letter.toUpperCase()}`
      }
    }
  }

  return null
}

function ordinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}
