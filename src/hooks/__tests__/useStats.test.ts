import { describe, it, expect, beforeEach } from 'vitest'
import { loadStats, saveStats, recordResult } from '@/hooks/useStats'

describe('useStats', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns default stats when nothing is saved', () => {
    const stats = loadStats('daily')
    expect(stats.gamesPlayed).toBe(0)
    expect(stats.gamesWon).toBe(0)
    expect(stats.currentStreak).toBe(0)
    expect(stats.maxStreak).toBe(0)
  })

  it('records a win correctly', () => {
    const stats = recordResult('daily', 3, '2026-02-16')
    expect(stats.gamesPlayed).toBe(1)
    expect(stats.gamesWon).toBe(1)
    expect(stats.guessDistribution[3]).toBe(1)
    expect(stats.currentStreak).toBe(1)
  })

  it('records a loss correctly', () => {
    const stats = recordResult('daily', null, '2026-02-16')
    expect(stats.gamesPlayed).toBe(1)
    expect(stats.gamesWon).toBe(0)
    expect(stats.currentStreak).toBe(0)
  })

  it('increments daily streak for consecutive days', () => {
    recordResult('daily', 4, '2026-02-16')
    const stats = recordResult('daily', 3, '2026-02-17')
    expect(stats.currentStreak).toBe(2)
    expect(stats.maxStreak).toBe(2)
  })

  it('resets daily streak when a day is skipped', () => {
    recordResult('daily', 4, '2026-02-16')
    const stats = recordResult('daily', 3, '2026-02-19') // skipped 2 days
    expect(stats.currentStreak).toBe(1)
  })

  it('keeps separate stats for daily and unlimited', () => {
    recordResult('daily', 3, '2026-02-16')
    recordResult('unlimited', 5, '2026-02-16')

    const daily = loadStats('daily')
    const unlimited = loadStats('unlimited')

    expect(daily.gamesPlayed).toBe(1)
    expect(unlimited.gamesPlayed).toBe(1)
    expect(daily.guessDistribution[3]).toBe(1)
    expect(unlimited.guessDistribution[5]).toBe(1)
  })

  it('tracks max streak correctly', () => {
    recordResult('unlimited', 2, '2026-02-16')
    recordResult('unlimited', 3, '2026-02-16')
    recordResult('unlimited', 4, '2026-02-16')
    recordResult('unlimited', null, '2026-02-16') // loss resets streak
    recordResult('unlimited', 1, '2026-02-16')

    const stats = loadStats('unlimited')
    expect(stats.maxStreak).toBe(3)
    expect(stats.currentStreak).toBe(1)
  })

  it('round-trips through save/load', () => {
    const stats = recordResult('daily', 2, '2026-02-16')
    const loaded = loadStats('daily')
    expect(loaded.gamesPlayed).toBe(stats.gamesPlayed)
    expect(loaded.gamesWon).toBe(stats.gamesWon)
    expect(loaded.currentStreak).toBe(stats.currentStreak)
  })
})
