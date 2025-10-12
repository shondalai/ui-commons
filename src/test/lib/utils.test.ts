import { describe, it, expect } from 'vitest'
import { cn, generateAvatarUrl } from '../../lib/utils'

describe('utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', false && 'conditional', 'always')
      expect(result).toBe('base always')
    })

    it('should merge tailwind classes correctly', () => {
      // twMerge should handle conflicting Tailwind classes
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toBe('py-1 px-4')
    })

    it('should handle objects', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true,
      })
      expect(result).toContain('class1')
      expect(result).toContain('class3')
      expect(result).not.toContain('class2')
    })

    it('should handle arrays', () => {
      const result = cn(['class1', 'class2', false && 'class3'])
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).not.toContain('class3')
    })

    it('should handle undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle duplicate classes', () => {
      const result = cn('class1', 'class1', 'class2')
      // Note: cn doesn't deduplicate by default, it relies on tailwind-merge for Tailwind classes
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })
  })

  describe('generateAvatarUrl', () => {
    it('should return avatar URL if provided', () => {
      const user = {
        id: 1,
        avatar: 'https://example.com/avatar.jpg',
        name: 'Test User',
      }
      const result = generateAvatarUrl(user)
      expect(result).toBe('https://example.com/avatar.jpg')
    })

    it('should generate URL from name if no avatar', () => {
      const user = {
        id: 1,
        name: 'Test User',
      }
      const result = generateAvatarUrl(user)
      expect(result).toContain('ui-avatars.com')
      // encodeURIComponent converts spaces to %20, not +
      expect(result).toContain('Test')
      expect(result).toContain('User')
    })

    it('should use handle if no name', () => {
      const user = {
        id: 1,
        handle: 'testhandle',
      }
      const result = generateAvatarUrl(user)
      expect(result).toContain('testhandle')
    })

    it('should use default "User" if no name or handle', () => {
      const user = {
        id: 1,
      }
      const result = generateAvatarUrl(user)
      expect(result).toContain('User')
    })

    it('should encode special characters in name', () => {
      const user = {
        id: 1,
        name: 'Test & User',
      }
      const result = generateAvatarUrl(user)
      expect(result).toContain(encodeURIComponent('Test & User'))
    })

    it('should include size and background parameters', () => {
      const user = {
        id: 1,
        name: 'Test',
      }
      const result = generateAvatarUrl(user)
      expect(result).toContain('size=48')
      expect(result).toContain('background=random')
    })
  })
})
