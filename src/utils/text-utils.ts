/**
 * Text processing utilities for handling HTML content
 */

/**
 * Strip HTML tags from a string and return plain text
 * @param html - HTML string to strip (can be undefined/null)
 * @param maxLength - Optional maximum length to truncate to
 * @returns Plain text string
 */
export const stripHtml = (html: string | undefined | null, maxLength?: number): string => {
  if (!html) {
    return ''
  }

  // Create a temporary div element to parse HTML
  const div = document.createElement('div')
  div.innerHTML = html

  // Get text content (this automatically strips HTML tags)
  let text = div.textContent || div.innerText || ''

  // Trim whitespace
  text = text.trim()

  // Truncate if maxLength is specified
  if (maxLength && text.length > maxLength) {
    text = text.substring(0, maxLength).trim() + '...'
  }

  return text
}

/**
 * Get a truncated intro/excerpt from HTML content
 * @param html - HTML string (can be undefined/null)
 * @param maxLength - Maximum length of the excerpt (default: 150)
 * @returns Plain text excerpt
 */
export const getTextExcerpt = (html: string | undefined | null, maxLength: number = 150): string => {
  return stripHtml(html, maxLength)
}

/**
 * Sanitize HTML content for safe rendering (removes potentially dangerous tags)
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtmlContent = (html: string | undefined | null): string => {
  if (!html) {
    return ''
  }

  const div = document.createElement('div')
  div.innerHTML = html

  // List of allowed tags
  const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'div']

  // Remove all tags except allowed ones
  const walker = document.createTreeWalker(
    div,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node: Element) => {
        if (allowedTags.includes(node.tagName.toLowerCase())) {
          return NodeFilter.FILTER_ACCEPT
        }
        return NodeFilter.FILTER_REJECT
      },
    },
  )

  const nodesToRemove: Element[] = []
  let node: Element | null

  while (node = walker.nextNode() as Element) {
    if (!allowedTags.includes(node.tagName.toLowerCase())) {
      nodesToRemove.push(node)
    }
  }

  // Remove disallowed nodes
  nodesToRemove.forEach(node => {
    if (node.parentNode) {
      // Replace with text content
      const textNode = document.createTextNode(node.textContent || '')
      node.parentNode.replaceChild(textNode, node)
    }
  })

  return div.innerHTML
}

export default {
  stripHtml,
  getTextExcerpt,
  sanitizeHtmlContent,
}

