import { describe, it, expect } from 'vitest'
import { formatShortNumber, formatNumber } from '../../utils/number-utils'

describe('number-utils', () => {
  describe('formatShortNumber', () => {
    it('should format numbers less than 1000 as-is', () => {
      expect(formatShortNumber(0)).toBe('0')
      expect(formatShortNumber(1)).toBe('1')
      expect(formatShortNumber(999)).toBe('999')
    })

    it('should format thousands with K suffix', () => {
      expect(formatShortNumber(1000)).toBe('1K')
      expect(formatShortNumber(1500)).toBe('1.5K')
      expect(formatShortNumber(10000)).toBe('10K')
      expect(formatShortNumber(999999)).toBe('1000K')
    })

    it('should format millions with M suffix', () => {
      expect(formatShortNumber(1000000)).toBe('1M')
      expect(formatShortNumber(1500000)).toBe('1.5M')
      expect(formatShortNumber(10000000)).toBe('10M')
    })

    it('should remove trailing .0', () => {
      expect(formatShortNumber(1000)).toBe('1K')
      expect(formatShortNumber(2000000)).toBe('2M')
    })

    it('should keep one decimal place for fractional values', () => {
      expect(formatShortNumber(1234)).toBe('1.2K')
      expect(formatShortNumber(1567890)).toBe('1.6M')
    })
  })

  describe('formatNumber', () => {
    it('should format small numbers', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(1)).toBe('1')
      expect(formatNumber(999)).toBe('999')
    })

    it('should format numbers with thousand separators', () => {
      const result = formatNumber(1000)
      expect(result).toMatch(/1[,\s]000/) // Different locales use different separators
    })

    it('should format large numbers correctly', () => {
      const result = formatNumber(1234567)
      expect(result).toBeTruthy()
      expect(result.replace(/[,\s]/g, '')).toBe('1234567')
    })

    it('should handle negative numbers', () => {
      const result = formatNumber(-1000)
      expect(result).toContain('-')
    })

    it('should handle decimal numbers', () => {
      const result = formatNumber(1234.56)
      expect(result).toBeTruthy()
    })
  })
})
