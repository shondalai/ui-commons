import { getDocumentLocale } from './locale-utils'

export const formatShortNumber = (num: number): string => {
  return new Intl.NumberFormat(getDocumentLocale(), {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat(getDocumentLocale()).format(num)
}

