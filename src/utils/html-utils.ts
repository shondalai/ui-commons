/**
 * HTML content utilities for components
 * Provides functions to extract clean text previews from HTML content
 */

/**
 * Extract plain text intro from HTML content
 * @param htmlContent - HTML string content
 * @param maxLength - Maximum length of the intro text
 * @param preserveParagraphs - Whether to preserve paragraph breaks
 * @returns Clean text intro
 */
export const extractTextIntro = (
  htmlContent: string,
  maxLength: number = 150,
  preserveParagraphs: boolean = false,
): string => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return ''
  }

  // Remove script and style elements completely
  let cleanContent = htmlContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

  if (preserveParagraphs) {
    // Replace paragraph and div tags with line breaks
    cleanContent = cleanContent.replace(/<\/?(p|div|br)[^>]*>/gi, '\n').replace(/<\/?(h[1-6])[^>]*>/gi, '\n\n')
  }

  // Remove all other HTML tags
  cleanContent = cleanContent.replace(/<[^>]*>/g, '')

  // Decode HTML entities
  cleanContent = cleanContent.replace(/&nbsp;/g, ' ').
    replace(/&amp;/g, '&').
    replace(/&lt;/g, '<').
    replace(/&gt;/g, '>').
    replace(/&quot;/g, '"').
    replace(/&#039;/g, '\'').
    replace(/&hellip;/g, '...')

  // Clean up whitespace
  cleanContent = cleanContent.replace(/\s+/g, ' ').replace(/\n\s+/g, '\n').trim()

  // Truncate to max length
  if (cleanContent.length > maxLength) {
    const truncated = cleanContent.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    const lastSentence = truncated.lastIndexOf('.')

    // Try to break at sentence end, then word boundary
    if (lastSentence > maxLength * 0.7) {
      return truncated.substring(0, lastSentence + 1)
    } else if (lastSpace > maxLength * 0.7) {
      return truncated.substring(0, lastSpace) + '...'
    } else {
      return truncated + '...'
    }
  }

  return cleanContent
}

/**
 * Extract intro with basic formatting preservation
 * @param htmlContent - HTML string content
 * @param maxLength - Maximum length of the intro text
 * @returns Text with minimal formatting
 */
export const extractFormattedIntro = (
  htmlContent: string,
  maxLength: number = 150,
): string => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return ''
  }

  // Remove dangerous elements
  let cleanContent = htmlContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')

  // Convert some formatting to simple text equivalents
  cleanContent = cleanContent.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**').
    replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**').
    replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*').
    replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*').
    replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')

  // Remove remaining HTML tags
  cleanContent = cleanContent.replace(/<[^>]*>/g, '')

  // Decode HTML entities and clean up
  cleanContent = cleanContent.replace(/&nbsp;/g, ' ').
    replace(/&amp;/g, '&').
    replace(/&lt;/g, '<').
    replace(/&gt;/g, '>').
    replace(/&quot;/g, '"').
    replace(/&#039;/g, '\'').
    replace(/\s+/g, ' ').
    trim()

  // Truncate intelligently
  if (cleanContent.length > maxLength) {
    const truncated = cleanContent.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    if (lastSpace > maxLength * 0.7) {
      return truncated.substring(0, lastSpace) + '...'
    }
    return truncated + '...'
  }

  return cleanContent
}

export default {
  extractTextIntro,
  extractFormattedIntro,
}
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateAvatarUrl (user: { id?: number; avatar?: string; name?: string; handle?: string }): string {
  if (user.avatar) {
    return user.avatar
  }

  const name = user.name || user.handle || 'User'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=48&background=random`
}

