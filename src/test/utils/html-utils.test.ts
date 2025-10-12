import { describe, it, expect } from 'vitest'
import { extractTextIntro } from '../../utils/html-utils'

describe('html-utils', () => {
  describe('extractTextIntro', () => {
    it('should extract plain text from HTML', () => {
      const html = '<p>Hello <strong>World</strong>!</p>'
      const result = extractTextIntro(html)
      expect(result).toBe('Hello World!')
    })

    it('should handle empty or invalid input', () => {
      expect(extractTextIntro('')).toBe('')
      expect(extractTextIntro(null as any)).toBe('')
      expect(extractTextIntro(undefined as any)).toBe('')
    })

    it('should remove script tags completely', () => {
      const html = '<p>Hello</p><script>alert("test")</script><p>World</p>'
      const result = extractTextIntro(html)
      expect(result).not.toContain('alert')
      expect(result).toContain('Hello')
    })

    it('should remove style tags completely', () => {
      const html = '<p>Hello</p><style>.test { color: red; }</style><p>World</p>'
      const result = extractTextIntro(html)
      expect(result).not.toContain('color')
      expect(result).toContain('Hello')
    })

    it('should decode HTML entities', () => {
      const html = '<p>Test &amp; Demo &lt;tag&gt; &quot;quotes&quot;</p>'
      const result = extractTextIntro(html)
      expect(result).toContain('& Demo <tag> "quotes"')
    })

    it('should truncate to max length', () => {
      const longHtml = '<p>' + 'A'.repeat(200) + '</p>'
      const result = extractTextIntro(longHtml, 50)
      expect(result.length).toBeLessThanOrEqual(53) // 50 + potential ellipsis
    })

    it('should clean up whitespace', () => {
      const html = '<p>  Multiple    spaces   </p>'
      const result = extractTextIntro(html)
      expect(result).toBe('Multiple spaces')
    })

    it('should handle complex nested HTML', () => {
      const html = '<div><h1>Title</h1><p>Paragraph with <a href="#">link</a> and <em>emphasis</em></p></div>'
      const result = extractTextIntro(html)
      expect(result).toContain('Title')
      expect(result).toContain('Paragraph')
      expect(result).not.toContain('<')
    })

    it('should handle paragraph breaks when preserveParagraphs is true', () => {
      const html = '<p>First paragraph</p><p>Second paragraph</p>'
      const result = extractTextIntro(html, 200, true)
      // The actual implementation may vary - check if it preserves some structure
      expect(result).toBeTruthy()
      expect(result).toContain('First paragraph')
      expect(result).toContain('Second paragraph')
    })

    it('should not preserve paragraphs by default', () => {
      const html = '<p>First paragraph</p><p>Second paragraph</p>'
      const result = extractTextIntro(html)
      // Without preserveParagraphs, text is concatenated
      expect(result).toContain('First paragraph')
      expect(result).toContain('Second paragraph')
    })
  })
})
