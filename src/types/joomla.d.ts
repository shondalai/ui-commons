// Joomla global type declarations
// Common type definitions for Joomla CMS integration

interface JoomlaText {
  _: (key: string, defaultValue?: string) => string
  load: (strings: Record<string, string>) => void
}

interface JoomlaOptions {
  'system.token'?: string
  'csrf.token'?: string

  [key: string]: any
}

interface Joomla {
  Text: JoomlaText
  getOptions: (namespace?: string) => JoomlaOptions | string
  submitbutton?: (task: string) => void
  submitform?: (task: string, form?: HTMLFormElement) => void
}

declare global {
  interface Window {
    Joomla?: Joomla
  }
}

export {}
