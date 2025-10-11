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
