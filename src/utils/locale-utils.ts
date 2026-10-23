/** The Joomla page language takes precedence over the visitor's browser language. */
export function getDocumentLocale(): string {
  const language = globalThis.document?.documentElement?.lang?.trim()

  if (!language) return 'en-GB'

  try {
    return Intl.getCanonicalLocales(language.replace(/_/g, '-'))[0]
  }
  catch {
    return 'en-GB'
  }
}

/**
 * Exact-number keys retain Joomla's existing _1 convention. Translators may
 * additionally supply CLDR categories (_ONE, _FEW, _MANY, etc.). Never use an
 * exact _1 string for another number: existing catalogs may contain literal 1.
 */
export function getPluralTranslationKeys(key: string, count: number): string[] {
  const category = new Intl.PluralRules(getDocumentLocale()).select(count).toUpperCase()

  return [...new Set([
    ...(Number.isSafeInteger(count) ? [`${key}_${count}`] : []),
    `${key}_${category}`,
    `${key}_N`,
    key,
  ])]
}
