import {afterEach, describe, expect, it, vi} from 'vitest'
import {getDocumentLocale, getPluralTranslationKeys} from '../../utils/locale-utils'
import {formatNumber, formatShortNumber} from '../../utils/number-utils'
import {formatAbsoluteDate} from '../../utils/date-utils'

const originalLanguage = document.documentElement.lang
afterEach(() => {
  vi.unstubAllGlobals()
  document.documentElement.lang = originalLanguage
})

describe('Joomla page locale', () => {
  it('uses the Joomla language for numbers, compact counts and dates', () => {
    document.documentElement.lang = 'de-DE'
    expect(getDocumentLocale()).toBe('de-DE')
    expect(formatNumber(1234.5)).toBe('1.234,5')
    expect(formatShortNumber(1500000)).toBe(new Intl.NumberFormat('de-DE', {notation: 'compact', maximumFractionDigits: 1}).format(1500000))
    expect(formatAbsoluteDate(new Date(2026, 9, 22))).toBe('22. Oktober 2026')
  })

  it('normalizes Joomla language tags and handles absent or invalid tags', () => {
    document.documentElement.lang = 'fr_FR'
    expect(getDocumentLocale()).toBe('fr-FR')
    document.documentElement.lang = 'not a locale'
    expect(getDocumentLocale()).toBe('en-GB')
    vi.stubGlobal('document', undefined)
    expect(getDocumentLocale()).toBe('en-GB')
  })
})

describe('plural translation candidates', () => {
  it('uses the page language plural categories with exact-number and generic fallbacks', () => {
    document.documentElement.lang = 'ru-RU'
    expect(getPluralTranslationKeys('ITEMS', 2)).toEqual(['ITEMS_2', 'ITEMS_FEW', 'ITEMS_N', 'ITEMS'])
    expect(getPluralTranslationKeys('ITEMS', 5)).toEqual(['ITEMS_5', 'ITEMS_MANY', 'ITEMS_N', 'ITEMS'])
    expect(getPluralTranslationKeys('ITEMS', 21)).toEqual(['ITEMS_21', 'ITEMS_ONE', 'ITEMS_N', 'ITEMS'])
  })

  it('does not treat an exact _1 translation as the one category for another number', () => {
    document.documentElement.lang = 'fr-FR'
    expect(getPluralTranslationKeys('ITEMS', 0)).toEqual(['ITEMS_0', 'ITEMS_ONE', 'ITEMS_N', 'ITEMS'])
    expect(getPluralTranslationKeys('ITEMS', 1)).toEqual(['ITEMS_1', 'ITEMS_ONE', 'ITEMS_N', 'ITEMS'])
  })
})
