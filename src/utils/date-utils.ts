import { formatDistanceToNow } from 'date-fns'

export const humanReadableDate = (dateString: string): string => {
  if (!dateString) {
    return ''
  }

  try {
    const date = new Date(dateString)

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}`)
      return ''
    }

    return formatDistanceToNow(date, { addSuffix: true })
  }
  catch (error) {
    console.warn(`Error parsing date: ${dateString}`, error)
    return ''
  }
}

