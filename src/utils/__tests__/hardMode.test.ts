import { describe, it, expect } from 'vitest'
import { validateHardMode } from '@/utils/hardMode'
import type { EvaluatedLetter } from '@/utils/evaluateGuess'

function makeLetter(letter: string, state: 'correct' | 'present' | 'absent'): EvaluatedLetter {
  return { letter, state }
}

describe('validateHardMode', () => {
  it('returns null for a valid hard mode guess', () => {
    const prev: EvaluatedLetter[][] = [
      [makeLetter('c', 'present'), makeLetter('r', 'correct'), makeLetter('a', 'absent'), makeLetter('n', 'absent'), makeLetter('e', 'absent')],
    ]
    // Guess "crust" — has c somewhere, r in position 1
    const result = validateHardMode('crust', prev)
    expect(result).toBeNull()
  })

  it('rejects guess missing a correct-position letter', () => {
    const prev: EvaluatedLetter[][] = [
      [makeLetter('c', 'correct'), makeLetter('r', 'absent'), makeLetter('a', 'absent'), makeLetter('n', 'absent'), makeLetter('e', 'absent')],
    ]
    // Guess "brake" — b is not c at position 0
    const result = validateHardMode('brake', prev)
    expect(result).not.toBeNull()
    expect(result).toContain('1st')
    expect(result).toContain('C')
  })

  it('rejects guess missing a present letter', () => {
    const prev: EvaluatedLetter[][] = [
      [makeLetter('c', 'present'), makeLetter('r', 'absent'), makeLetter('a', 'absent'), makeLetter('n', 'absent'), makeLetter('e', 'absent')],
    ]
    // Guess "brake" — no c
    const result = validateHardMode('brake', prev)
    expect(result).not.toBeNull()
    expect(result).toContain('C')
  })

  it('validates against multiple previous guesses', () => {
    const prev: EvaluatedLetter[][] = [
      [makeLetter('c', 'present'), makeLetter('r', 'absent'), makeLetter('a', 'absent'), makeLetter('n', 'absent'), makeLetter('e', 'absent')],
      [makeLetter('d', 'absent'), makeLetter('l', 'correct'), makeLetter('i', 'absent'), makeLetter('c', 'correct'), makeLetter('k', 'present')],
    ]
    // Need: c somewhere, l at pos 1, c at pos 3, k somewhere
    // Guess "click" — c at 0 (ok), l at 1 (correct!), i at 2, c at 3 (correct!), k at 4 (ok)
    const result = validateHardMode('click', prev)
    expect(result).toBeNull()
  })

  it('returns null when no previous guesses', () => {
    const result = validateHardMode('hello', [])
    expect(result).toBeNull()
  })
})
