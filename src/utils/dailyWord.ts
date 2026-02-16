import { ANSWER_WORDS } from '@/data/words'

/** Epoch date — the "day zero" for daily word selection */
const EPOCH = new Date('2026-02-16T00:00:00')

/**
 * Get the daily word index based on the current date.
 * Deterministic: same date → same index → same word for everyone.
 */
export function getDailyWordIndex(now: Date = new Date()): number {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const epoch = new Date(EPOCH.getFullYear(), EPOCH.getMonth(), EPOCH.getDate()).getTime()
  const daysDiff = Math.floor((start - epoch) / 86_400_000)
  // Ensure positive modulo
  return ((daysDiff % ANSWER_WORDS.length) + ANSWER_WORDS.length) % ANSWER_WORDS.length
}

/**
 * Get today's daily word.
 */
export function getDailyWord(now: Date = new Date()): string {
  return ANSWER_WORDS[getDailyWordIndex(now)]
}

/**
 * Get the daily puzzle number (days since epoch).
 */
export function getDailyNumber(now: Date = new Date()): number {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const epoch = new Date(EPOCH.getFullYear(), EPOCH.getMonth(), EPOCH.getDate()).getTime()
  return Math.floor((start - epoch) / 86_400_000)
}

/**
 * Get a random word for unlimited mode.
 */
export function getRandomWord(): string {
  return ANSWER_WORDS[Math.floor(Math.random() * ANSWER_WORDS.length)]
}

/**
 * Get today's date string in YYYY-MM-DD format for localStorage keying.
 */
export function getTodayString(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
