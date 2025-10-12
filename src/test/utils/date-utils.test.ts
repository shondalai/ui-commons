import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { humanReadableDate } from '../../utils/date-utils'

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
})
