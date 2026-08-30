/**
 * Relative time formatting.
 *
 * Buckets follow date-fns' formatDistanceToNow thresholds so the wording matches
 * what this function used to emit, but every label now resolves through Joomla's
 * language strings instead of date-fns' built-in English locale. date-fns took no
 * `locale` option here, so its output ("about 10 hours ago") was hardcoded English
 * living inside the library, which is why translators could never find it.
 *
 * ui-commons is shared by several components, so it owns no language keys of its
 * own. The host app calls configureRelativeTime() once at bootstrap to say which
 * key prefix to look under. An app that does not configure a prefix keeps the
 * previous English wording via the fallbacks below, so nothing regresses.
 */

/** Key suffixes this module looks up, appended to the configured prefix. */
const KEY = {
  justNow: 'TIME_JUST_NOW',
  minute: 'TIME_MINUTE_AGO',
  minutes: 'TIME_MINUTES_AGO',
  hour: 'TIME_HOUR_AGO',
  hours: 'TIME_HOURS_AGO',
  day: 'TIME_DAY_AGO',
  days: 'TIME_DAYS_AGO',
  month: 'TIME_MONTH_AGO',
  months: 'TIME_MONTHS_AGO',
  year: 'TIME_YEAR_AGO',
  years: 'TIME_YEARS_AGO',
  inMinute: 'TIME_IN_MINUTE',
  inMinutes: 'TIME_IN_MINUTES',
  inHour: 'TIME_IN_HOUR',
  inHours: 'TIME_IN_HOURS',
  inDay: 'TIME_IN_DAY',
  inDays: 'TIME_IN_DAYS',
  inMonth: 'TIME_IN_MONTH',
  inMonths: 'TIME_IN_MONTHS',
  inYear: 'TIME_IN_YEAR',
  inYears: 'TIME_IN_YEARS',
} as const

let configuredPrefix = ''

export interface RelativeTimeOptions {
  /** Language key prefix, e.g. 'COM_CJFORUM_'. Overrides the configured default. */
  keyPrefix?: string
}

/**
 * Tell this module which language key prefix to resolve relative time labels
 * under. Call once from the host app's entry point, before React renders.
 *
 * @example configureRelativeTime({ keyPrefix: 'COM_CJFORUM_' })
 */
export const configureRelativeTime = (options: RelativeTimeOptions): void => {
  if (typeof options?.keyPrefix === 'string') {
    configuredPrefix = options.keyPrefix
  }
}

/**
 * Resolve one label through Joomla's client-side string registry.
 *
 * Mirrors what the LanguageProvider's t() does, but as a plain function: t() is a
 * hook and this helper has ~100 call sites that are not all inside a provider.
 * t() holds no React state, so the behaviour is reproducible here.
 */
const translate = (suffix: string, fallback: string, count?: number): string => {
  let text = fallback

  try {
    const registry = (globalThis as any)?.window?.Joomla?.Text

    if (registry && typeof registry._ === 'function') {
      const key = configuredPrefix + suffix
      const resolved = registry._(key, fallback)

      // Joomla.Text._ hands back the key itself when the key was never registered
      // with Text::script(). Treat that as "no translation" rather than printing
      // COM_CJFORUM_TIME_HOURS_AGO at the user.
      if (typeof resolved === 'string' && resolved !== '' && resolved !== key) {
        text = resolved
      }
    }
  }
  catch {
    // A missing or hostile window.Joomla must never break a timestamp.
    text = fallback
  }

  if (count !== undefined) {
    // Support the positional and plain sprintf placeholders Joomla INI files use.
    text = text.replace(/%1\$[sd]/g, String(count)).replace(/%[sd]/g, String(count))
  }

  return text
}

/**
 * Format a timestamp as a translated, human readable distance from now.
 *
 * Returns an empty string for a missing or unparseable value, which several
 * call sites rely on to render nothing at all.
 */
export const humanReadableDate = (dateString: string | Date, options?: RelativeTimeOptions): string => {
  if (!dateString) {
    return ''
  }

  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString)

    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}`)
      return ''
    }

    // Swap the prefix around the synchronous formatting call rather than
    // threading it through every branch. Safe because describeDistance never
    // awaits, so no other call can observe the swapped value.
    const previousPrefix = configuredPrefix

    if (typeof options?.keyPrefix === 'string') {
      configuredPrefix = options.keyPrefix
    }

    try {
      return describeDistance(date)
    }
    finally {
      configuredPrefix = previousPrefix
    }
  }
  catch (error) {
    console.warn(`Error parsing date: ${dateString}`, error)
    return ''
  }
}

/**
 * Format a timestamp as an absolute calendar date in the page's language.
 *
 * Use this wherever a relative distance would be wrong: a join date, an award
 * date, a ledger row, anything a reader may need to reconcile against another
 * record. "Member since about 3 years ago" is both ungrammatical and useless.
 *
 * The locale comes from the document language Joomla renders, not from the
 * browser, so the date matches the rest of the translated page.
 */
export const formatAbsoluteDate = (
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
): string => {
  if (!value) {
    return ''
  }

  try {
    const date = value instanceof Date ? value : new Date(value)

    if (isNaN(date.getTime())) {
      return ''
    }

    return date.toLocaleDateString(documentLocale(), options)
  }
  catch {
    return ''
  }
}

const documentLocale = (): string | undefined => {
  try {
    const lang = (globalThis as any)?.document?.documentElement?.lang
    return typeof lang === 'string' && lang !== '' ? lang : undefined
  }
  catch {
    return undefined
  }
}

const describeDistance = (date: Date): string => {
  const deltaMs = Date.now() - date.getTime()
  const future = deltaMs < 0
  const sec = Math.round(Math.abs(deltaMs) / 1000)

  // Below the first threshold the direction is noise: a client clock a few
  // seconds ahead of the server would otherwise render a just-posted reply as
  // "in 1 minute".
  if (sec < 45) {
    return translate(KEY.justNow, 'just now')
  }

  if (sec < 90) {
    return future
      ? translate(KEY.inMinute, 'in 1 minute')
      : translate(KEY.minute, '1 minute ago')
  }

  const min = Math.round(sec / 60)

  if (min < 45) {
    return future
      ? translate(KEY.inMinutes, `in ${min} minutes`, min)
      : translate(KEY.minutes, `${min} minutes ago`, min)
  }

  if (min < 90) {
    return future
      ? translate(KEY.inHour, 'in about 1 hour')
      : translate(KEY.hour, 'about 1 hour ago')
  }

  const hr = Math.round(min / 60)

  if (hr < 24) {
    return future
      ? translate(KEY.inHours, `in about ${hr} hours`, hr)
      : translate(KEY.hours, `about ${hr} hours ago`, hr)
  }

  if (hr < 42) {
    return future
      ? translate(KEY.inDay, 'in 1 day')
      : translate(KEY.day, '1 day ago')
  }

  const day = Math.round(hr / 24)

  if (day < 30) {
    return future
      ? translate(KEY.inDays, `in ${day} days`, day)
      : translate(KEY.days, `${day} days ago`, day)
  }

  if (day < 45) {
    return future
      ? translate(KEY.inMonth, 'in about 1 month')
      : translate(KEY.month, 'about 1 month ago')
  }

  const mon = Math.round(day / 30)

  if (mon < 12) {
    return future
      ? translate(KEY.inMonths, `in about ${mon} months`, mon)
      : translate(KEY.months, `about ${mon} months ago`, mon)
  }

  if (mon < 18) {
    return future
      ? translate(KEY.inYear, 'in about 1 year')
      : translate(KEY.year, 'about 1 year ago')
  }

  const yr = Math.round(mon / 12)

  return future
    ? translate(KEY.inYears, `in about ${yr} years`, yr)
    : translate(KEY.years, `about ${yr} years ago`, yr)
}
