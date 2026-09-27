import type { CSSProperties } from 'react'
import { Sparkles } from 'lucide-react'

export interface AiCreditsBadgeProps {
  enabled: boolean
  available?: number | null
  isLoading?: boolean
  isError?: boolean
  labels: {
    loading: string
    unavailable: string
    empty: string
    balance: (count: number) => string
  }
  className?: string
  style?: CSSProperties
}

const BILLING_URL = 'https://shondalai.com/account#/account/aicredits'

/** A compact, localized account balance for admin headers in any theme. */
export function AiCreditsBadge({
  enabled,
  available,
  isLoading = false,
  isError = false,
  labels,
  className,
  style,
}: AiCreditsBadgeProps) {
  if (!enabled) return null

  // A missing or failed balance must never look like an empty account.
  const unavailable = isError || available == null || !Number.isFinite(available) || available < 0
  const tone = isLoading ? 'loading'
    : unavailable ? 'unavailable'
    : available === 0 ? 'empty'
    : available! < 50 ? 'low' : 'healthy'
  const title = tone === 'loading' ? labels.loading
    : tone === 'unavailable' ? labels.unavailable
    : tone === 'empty' ? labels.empty
    : labels.balance(available!)
  const count = tone === 'loading' ? '…'
    : tone === 'unavailable' ? '!'
    : formatCredits(available!)
  const warning = tone === 'low' || tone === 'unavailable'
  const color = tone === 'empty' ? 'var(--ai-credits-danger, #d14343)'
    : warning ? 'var(--ai-credits-warning, #b77914)' : 'inherit'
  // Inline styles keep the badge consistent in apps with and without Tailwind.
  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    gap: 5,
    height: 26,
    boxSizing: 'border-box',
    padding: '0 8px',
    border: '1px solid color-mix(in srgb, currentColor 20%, transparent)',
    borderRadius: 4,
    background: tone === 'empty' || tone === 'low'
      ? 'color-mix(in srgb, currentColor 6%, transparent)' : 'transparent',
    color,
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    ...(tone === 'unavailable' ? { borderStyle: 'dashed' } : {}),
    ...style,
  }
  const content = (
    <>
      <Sparkles
        aria-hidden="true"
        size={12}
        style={{ flexShrink: 0, color: tone === 'healthy' ? 'var(--ai-credits-accent, #57876c)' : 'currentColor' }}
      />
      <span style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>{count}</span>
    </>
  )

  if (isLoading) {
    return <span className={className} style={badgeStyle} title={title} aria-label={title} aria-busy="true">{content}</span>
  }

  return (
    <a
      href={BILLING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={['ui-ai-credits-badge', className].filter(Boolean).join(' ')}
      style={badgeStyle}
      title={title}
      aria-label={title}
    >
      {content}
    </a>
  )
}

function formatCredits(count: number): string {
  if (count < 1000) return String(count)
  return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`
}
