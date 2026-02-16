export type LetterState = 'correct' | 'present' | 'absent'

export interface EvaluatedLetter {
  letter: string
  state: LetterState
}

/**
 * Evaluate a guess against the answer.
 *
 * Algorithm:
 * 1. First pass — mark exact position matches as 'correct'.
 *    Track remaining (unmatched) answer letters in a frequency map.
 * 2. Second pass — for each non-correct letter, if it exists in the
 *    frequency map, mark 'present' and decrement. Otherwise 'absent'.
 *
 * This correctly handles duplicate letters.
 */
export function evaluateGuess(guess: string, answer: string): EvaluatedLetter[] {
  const g = guess.toLowerCase()
  const a = answer.toLowerCase()
  const result: EvaluatedLetter[] = Array.from({ length: 5 }, (_, i) => ({
    letter: g[i],
    state: 'absent' as LetterState,
  }))

  // Frequency map of unmatched answer letters
  const remaining: Record<string, number> = {}

  // First pass: exact matches
  for (let i = 0; i < 5; i++) {
    if (g[i] === a[i]) {
      result[i].state = 'correct'
    } else {
      remaining[a[i]] = (remaining[a[i]] || 0) + 1
    }
  }

  // Second pass: present letters
  for (let i = 0; i < 5; i++) {
    if (result[i].state === 'correct') continue
    if (remaining[g[i]] && remaining[g[i]] > 0) {
      result[i].state = 'present'
      remaining[g[i]]--
    }
  }

  return result
}
