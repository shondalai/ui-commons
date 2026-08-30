import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { configureRelativeTime, humanReadableDate } from '../../utils/date-utils'

describe('date-utils', () => {
  describe('humanReadableDate', () => {
    beforeEach(() => {
      // Mock the current date to ensure consistent test results
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-10-11T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should format recent date correctly', () => {
      const dateString = '2025-10-11T11:00:00Z' // 1 hour ago
      const result = humanReadableDate(dateString)
      expect(result).toContain('hour')
      expect(result).toContain('ago')
    })

    it('should format date from yesterday', () => {
      const dateString = '2025-10-10T12:00:00Z' // 1 day ago
      const result = humanReadableDate(dateString)
      expect(result).toContain('day')
      expect(result).toContain('ago')
    })

    it('should format date from weeks ago', () => {
      const dateString = '2025-09-27T12:00:00Z' // 2 weeks ago
      const result = humanReadableDate(dateString)
      expect(result).toContain('ago')
    })

    it('should handle empty string', () => {
      const result = humanReadableDate('')
      expect(result).toBe('')
    })

    it('should handle invalid date string', () => {
      const result = humanReadableDate('invalid-date')
      expect(result).toBe('')
    })

    it('should handle various date formats', () => {
      // ISO format
      const isoDate = '2025-10-11T10:00:00Z'
      const result1 = humanReadableDate(isoDate)
      expect(result1).toBeTruthy()

      // Date string
      const dateString = '2025-10-11'
      const result2 = humanReadableDate(dateString)
      expect(result2).toBeTruthy()
    })

    it('should handle future dates', () => {
      const futureDate = '2025-10-12T12:00:00Z' // 1 day in future
      const result = humanReadableDate(futureDate)
      expect(result).toContain('in')
    })

    it('should format minutes ago correctly', () => {
      const dateString = '2025-10-11T11:55:00Z' // 5 minutes ago
      const result = humanReadableDate(dateString)
      expect(result).toContain('minute')
    })
  })

  describe('humanReadableDate translation', () => {
    const registry = (globalThis as any).window.Joomla.Text
    let original: any

    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-10-11T12:00:00Z'))
      original = registry._
    })

    afterEach(() => {
      vi.useRealTimers()
      registry._ = original
      configureRelativeTime({ keyPrefix: '' })
    })

    it('should resolve labels through the configured key prefix', () => {
      registry._ = vi.fn((key: string) => (key === 'COM_CJFORUM_TIME_HOURS_AGO' ? 'vor etwa %s Stunden' : key))
      configureRelativeTime({ keyPrefix: 'COM_CJFORUM_' })

      expect(humanReadableDate('2025-10-11T09:00:00Z')).toBe('vor etwa 3 Stunden')
    })

    it('should substitute the count into a plural key', () => {
      registry._ = vi.fn((key: string) => (key === 'COM_CJFORUM_TIME_DAYS_AGO' ? '%s jours' : key))
      configureRelativeTime({ keyPrefix: 'COM_CJFORUM_' })

      expect(humanReadableDate('2025-10-06T12:00:00Z')).toBe('5 jours')
    })

    it('should use the singular key without a placeholder', () => {
      registry._ = vi.fn((key: string) => (key === 'COM_CJFORUM_TIME_MINUTE_AGO' ? 'il y a 1 minute' : key))
      configureRelativeTime({ keyPrefix: 'COM_CJFORUM_' })

      expect(humanReadableDate('2025-10-11T11:58:50Z')).toBe('il y a 1 minute')
    })

    it('should fall back to English when the key is unregistered', () => {
      // The real Joomla.Text._ returns the key itself for an unregistered key.
      registry._ = vi.fn((key: string) => key)
      configureRelativeTime({ keyPrefix: 'COM_CJFORUM_' })

      expect(humanReadableDate('2025-10-11T09:00:00Z')).toBe('about 3 hours ago')
    })

    it('should accept a per-call prefix without leaking it', () => {
      registry._ = vi.fn((key: string) => (key === 'COM_OTHER_TIME_HOURS_AGO' ? 'anders' : key))

      expect(humanReadableDate('2025-10-11T09:00:00Z', { keyPrefix: 'COM_OTHER_' })).toBe('anders')
      expect(humanReadableDate('2025-10-11T09:00:00Z')).toBe('about 3 hours ago')
    })

    it('should treat a small future skew as just now', () => {
      registry._ = vi.fn((key: string) => key)

      expect(humanReadableDate('2025-10-11T12:00:20Z')).toBe('just now')
    })
  })
})
