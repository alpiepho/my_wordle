import { describe, it, expect } from 'vitest'
import { ANSWER_WORDS } from '@/data/words'
import { VALID_GUESSES } from '@/data/validGuesses'

describe('Word Lists', () => {
  it('all answer words are exactly 5 lowercase alpha characters', () => {
    const regex = /^[a-z]{5}$/
    for (const word of ANSWER_WORDS) {
      expect(word).toMatch(regex)
    }
  })

  it('has at least 500 answer words', () => {
    expect(ANSWER_WORDS.length).toBeGreaterThanOrEqual(500)
  })

  it('has no duplicate answer words', () => {
    const set = new Set(ANSWER_WORDS)
    expect(set.size).toBe(ANSWER_WORDS.length)
  })

  it('every answer word is in the valid guesses set', () => {
    for (const word of ANSWER_WORDS) {
      expect(VALID_GUESSES.has(word)).toBe(true)
    }
  })

  it('valid guesses set has more words than answer list', () => {
    expect(VALID_GUESSES.size).toBeGreaterThan(ANSWER_WORDS.length)
  })
})
