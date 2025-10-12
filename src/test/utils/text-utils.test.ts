import { describe, it, expect } from 'vitest'
import { stripHtml, getTextExcerpt, sanitizeHtmlContent } from '../../utils/text-utils'

describe('text-utils', () => {
  describe('stripHtml', () => {
    it('should strip HTML tags from a string', () => {
      const html = '<p>Hello <strong>World</strong>!</p>'
      const result = stripHtml(html)
      expect(result).toBe('Hello World!')
    })

    it('should handle empty string', () => {
      expect(stripHtml('')).toBe('')
    })

    it('should handle null and undefined', () => {
      expect(stripHtml(null)).toBe('')
      expect(stripHtml(undefined)).toBe('')
    })

    it('should trim whitespace', () => {
      const html = '  <p>  Hello World  </p>  '
      const result = stripHtml(html)
      expect(result).toBe('Hello World')
    })

    it('should truncate text when maxLength is provided', () => {
      const html = '<p>This is a very long text that should be truncated</p>'
      const result = stripHtml(html, 20)
      expect(result).toBe('This is a very long...')
      expect(result.length).toBeLessThanOrEqual(23) // 20 + '...'
    })

    it('should handle complex nested HTML', () => {
      const html = '<div><h1>Title</h1><p>Paragraph with <a href="#">link</a></p></div>'
      const result = stripHtml(html)
      expect(result).toBe('TitleParagraph with link')
    })

    it('should handle HTML entities', () => {
      const html = '<p>&lt;Hello&gt; &amp; &quot;World&quot;</p>'
      const result = stripHtml(html)
      expect(result).toBe('<Hello> & "World"')
    })

    it('should not truncate if text is shorter than maxLength', () => {
      const html = '<p>Short text</p>'
      const result = stripHtml(html, 100)
      expect(result).toBe('Short text')
      expect(result).not.toContain('...')
    })
  })

  describe('getTextExcerpt', () => {
    it('should return excerpt with default length of 150', () => {
      const longHtml = '<p>' + 'A'.repeat(200) + '</p>'
      const result = getTextExcerpt(longHtml)
      expect(result.length).toBeLessThanOrEqual(153) // 150 + '...'
      expect(result).toContain('...')
    })

    it('should accept custom max length', () => {
      const html = '<p>This is a test excerpt</p>'
      const result = getTextExcerpt(html, 10)
      expect(result).toBe('This is a...')
    })

    it('should handle null and undefined', () => {
      expect(getTextExcerpt(null)).toBe('')
      expect(getTextExcerpt(undefined)).toBe('')
    })

    it('should strip HTML from excerpt', () => {
      const html = '<div><strong>Bold</strong> and <em>italic</em> text</div>'
      const result = getTextExcerpt(html, 100)
      expect(result).toBe('Bold and italic text')
    })
  })

  describe('sanitizeHtmlContent', () => {
    it('should handle null and undefined', () => {
      expect(sanitizeHtmlContent(null)).toBe('')
      expect(sanitizeHtmlContent(undefined)).toBe('')
    })

    it('should handle empty string', () => {
      expect(sanitizeHtmlContent('')).toBe('')
    })

    // Note: The actual implementation would need to remove dangerous tags
    // This test assumes the function is fully implemented
    it('should return sanitized content for safe HTML', () => {
      const html = '<p>Safe content</p>'
      const result = sanitizeHtmlContent(html)
      expect(result).toBeTruthy()
    })
  })
})
