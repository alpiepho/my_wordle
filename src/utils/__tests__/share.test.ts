import { describe, it, expect } from 'vitest'
import { generateShareText } from '@/utils/share'
import type { EvaluatedLetter } from '@/utils/evaluateGuess'

function makeLetter(letter: string, state: 'correct' | 'present' | 'absent'): EvaluatedLetter {
  return { letter, state }
}

describe('generateShareText', () => {
  it('generates correct format for a win', () => {
    const guesses: EvaluatedLetter[][] = [
      [makeLetter('c', 'absent'), makeLetter('r', 'present'), makeLetter('a', 'present'), makeLetter('n', 'absent'), makeLetter('e', 'correct')],
      [makeLetter('t', 'correct'), makeLetter('r', 'correct'), makeLetter('a', 'correct'), makeLetter('c', 'correct'), makeLetter('e', 'correct')],
    ]

    const text = generateShareText(guesses, 42, true, false, false)
    expect(text).toContain('Wordle 42 2/6')
    expect(text).toContain('⬛🟨🟨⬛🟩')
    expect(text).toContain('🟩🟩🟩🟩🟩')
  })

  it('generates X/6 for a loss', () => {
    const guesses: EvaluatedLetter[][] = Array(6).fill(
      [makeLetter('a', 'absent'), makeLetter('b', 'absent'), makeLetter('c', 'absent'), makeLetter('d', 'absent'), makeLetter('e', 'absent')]
    )

    const text = generateShareText(guesses, 10, false, false, false)
    expect(text).toContain('Wordle 10 X/6')
  })

  it('adds * for hard mode', () => {
    const guesses: EvaluatedLetter[][] = [
      [makeLetter('a', 'correct'), makeLetter('b', 'correct'), makeLetter('c', 'correct'), makeLetter('d', 'correct'), makeLetter('e', 'correct')],
    ]

    const text = generateShareText(guesses, 1, true, true, false)
    expect(text).toContain('1/6*')
  })

  it('uses high contrast emoji when enabled', () => {
    const guesses: EvaluatedLetter[][] = [
      [makeLetter('a', 'correct'), makeLetter('b', 'present'), makeLetter('c', 'absent'), makeLetter('d', 'correct'), makeLetter('e', 'present')],
    ]

    const text = generateShareText(guesses, 5, true, false, true)
    expect(text).toContain('🟧')
    expect(text).toContain('🟦')
    expect(text).toContain('⬛')
    expect(text).not.toContain('🟩')
    expect(text).not.toContain('🟨')
  })
})
