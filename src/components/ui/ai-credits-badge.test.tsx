import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AiCreditsBadge } from './ai-credits-badge'

const labels = {
  loading: 'Loading AI credits',
  unavailable: 'AI credit balance unavailable',
  empty: 'No AI credits remaining. Buy credits',
  balance: (count: number) => `${count} AI credits available`,
}

describe('AiCreditsBadge', () => {
  it('hides the balance when AI is disabled', () => {
    const { container } = render(<AiCreditsBadge enabled={false} available={372} labels={labels} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows loading without claiming the account is empty', () => {
    render(<AiCreditsBadge enabled isLoading labels={labels} />)
    expect(screen.getByLabelText(labels.loading)).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it.each([null, undefined, NaN, -1])('treats an unknown or invalid balance (%s) as unavailable', (available) => {
    render(<AiCreditsBadge enabled available={available} labels={labels} />)
    expect(screen.getByRole('link', { name: labels.unavailable })).toHaveTextContent('!')
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('does not present a stale balance as current after a failed refresh', () => {
    render(<AiCreditsBadge enabled available={372} isError labels={labels} />)
    expect(screen.getByRole('link', { name: labels.unavailable })).toHaveTextContent('!')
  })

  it('links an empty account to the top-up page', () => {
    render(<AiCreditsBadge enabled available={0} labels={labels} />)
    const link = screen.getByRole('link', { name: labels.empty })
    expect(link).toHaveTextContent('0')
    expect(link).toHaveAttribute('href', 'https://shondalai.com/account#/account/aicredits')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it.each([[3, '3'], [49, '49'], [50, '50'], [372, '372'], [1000, '1k'], [12345, '12.3k']])(
    'formats %s credits compactly while preserving the exact accessible balance',
    (available, expected) => {
      render(<AiCreditsBadge enabled available={available as number} labels={labels} />)
      expect(screen.getByRole('link', { name: labels.balance(available as number) })).toHaveTextContent(String(expected))
    },
  )
})
