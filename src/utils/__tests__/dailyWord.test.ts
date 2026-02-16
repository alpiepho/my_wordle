import { describe, it, expect } from 'vitest'
import { getDailyWordIndex, getDailyWord, getDailyNumber, getRandomWord, getTodayString } from '@/utils/dailyWord'
import { ANSWER_WORDS } from '@/data/words'

// Helper: create a local-time Date to avoid UTC-offset issues
function localDate(y: number, m: number, d: number): Date {
  return new Date(y, m - 1, d) // month is 0-indexed
}

describe('dailyWord', () => {
  it('getDailyWordIndex returns the same index for the same date', () => {
    const date = localDate(2026, 3, 1)
    const idx1 = getDailyWordIndex(date)
    const idx2 = getDailyWordIndex(date)
    expect(idx1).toBe(idx2)
  })

  it('getDailyWordIndex returns different indices for different dates', () => {
    const day1 = getDailyWordIndex(localDate(2026, 2, 17))
    const day2 = getDailyWordIndex(localDate(2026, 2, 18))
    expect(day1).not.toBe(day2)
  })

  it('getDailyWordIndex returns 0 for the epoch date', () => {
    const idx = getDailyWordIndex(localDate(2026, 2, 16))
    expect(idx).toBe(0)
  })

  it('getDailyWord returns a valid answer word', () => {
    const word = getDailyWord(localDate(2026, 3, 15))
    expect(ANSWER_WORDS).toContain(word)
  })

  it('getDailyNumber returns 0 for epoch date', () => {
    expect(getDailyNumber(localDate(2026, 2, 16))).toBe(0)
  })

  it('getDailyNumber returns positive for dates after epoch', () => {
    expect(getDailyNumber(localDate(2026, 2, 20))).toBe(4)
  })

  it('getRandomWord returns a valid answer word', () => {
    const word = getRandomWord()
    expect(ANSWER_WORDS).toContain(word)
  })

  it('getTodayString returns YYYY-MM-DD format', () => {
    const str = getTodayString(localDate(2026, 7, 4))
    expect(str).toBe('2026-07-04')
  })
})
