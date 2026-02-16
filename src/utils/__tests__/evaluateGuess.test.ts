import { describe, it, expect } from 'vitest'
import { evaluateGuess } from '@/utils/evaluateGuess'

describe('evaluateGuess', () => {
  it('marks all correct when guess equals answer', () => {
    const result = evaluateGuess('apple', 'apple')
    expect(result.every(l => l.state === 'correct')).toBe(true)
  })

  it('marks all absent when no letters match', () => {
    const result = evaluateGuess('brick', 'mushy')
    expect(result.every(l => l.state === 'absent')).toBe(true)
  })

  it('handles mixed states correctly', () => {
    const result = evaluateGuess('crane', 'trace')
    // c: present (c in trace at pos 3), r: correct (both at pos 1),
    // a: correct (both at pos 2), n: absent, e: correct (both at pos 4)
    expect(result[0]).toEqual({ letter: 'c', state: 'present' })
    expect(result[1]).toEqual({ letter: 'r', state: 'correct' })
    expect(result[2]).toEqual({ letter: 'a', state: 'correct' })
    expect(result[3]).toEqual({ letter: 'n', state: 'absent' })
    expect(result[4]).toEqual({ letter: 'e', state: 'correct' })
  })

  it('handles duplicate letters — only one match', () => {
    // guess "speed" vs answer "abide"
    // s: absent, p: absent, e: present (e in abide pos 4), e: absent (no more e's), d: present
    const result = evaluateGuess('speed', 'abide')
    expect(result[0]).toEqual({ letter: 's', state: 'absent' })
    expect(result[1]).toEqual({ letter: 'p', state: 'absent' })
    expect(result[2]).toEqual({ letter: 'e', state: 'present' })
    expect(result[3]).toEqual({ letter: 'e', state: 'absent' })
    expect(result[4]).toEqual({ letter: 'd', state: 'present' })
  })

  it('handles duplicate letters — correct takes priority', () => {
    // guess "geese" vs answer "greet"
    // g: correct, e: present, e: correct, s: absent, e: absent (only 2 e's in greet)
    const result = evaluateGuess('geese', 'greet')
    expect(result[0]).toEqual({ letter: 'g', state: 'correct' })
    expect(result[1]).toEqual({ letter: 'e', state: 'present' })
    expect(result[2]).toEqual({ letter: 'e', state: 'correct' })
    expect(result[3]).toEqual({ letter: 's', state: 'absent' })
    expect(result[4]).toEqual({ letter: 'e', state: 'absent' })
  })

  it('handles all letters present but wrong positions', () => {
    const result = evaluateGuess('heart', 'earth')
    // h: present, e: present, a: present, r: present, t: present
    expect(result.every(l => l.state === 'present')).toBe(true)
  })

  it('handles repeated letter in answer, single in guess', () => {
    // guess "papal" vs answer "apple"
    // p: present (p in apple), a: present (a in apple), p: correct (both at pos 2),
    // a: absent (no more a's), l: present (l in apple)
    const result = evaluateGuess('papal', 'apple')
    expect(result[0]).toEqual({ letter: 'p', state: 'present' })
    expect(result[1]).toEqual({ letter: 'a', state: 'present' })
    expect(result[2]).toEqual({ letter: 'p', state: 'correct' })
    expect(result[3]).toEqual({ letter: 'a', state: 'absent' })
    expect(result[4]).toEqual({ letter: 'l', state: 'present' })
  })

  it('returns lowercase letters', () => {
    const result = evaluateGuess('CRANE', 'TRACE')
    for (const r of result) {
      expect(r.letter).toMatch(/^[a-z]$/)
    }
  })
})
