import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginModal } from '../../../components/ui/login-modal'

describe('LoginModal', () => {
  it('should render when open', () => {
    render(<LoginModal isOpen={true} onClose={() => {}}/>)
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(<LoginModal isOpen={false} onClose={() => {}}/>)
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument()
  })

  it('should display username and password fields', () => {
    render(<LoginModal isOpen={true} onClose={() => {}}/>)
    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
  })

  it('should allow typing in username field', async () => {
    const user = userEvent.setup()
    render(<LoginModal isOpen={true} onClose={() => {}}/>)

    const usernameInput = screen.getByPlaceholderText(/enter your username/i)
    await user.type(usernameInput, 'testuser')

    expect(usernameInput).toHaveValue('testuser')
  })

  it('should allow typing in password field', async () => {
    const user = userEvent.setup()
    render(<LoginModal isOpen={true} onClose={() => {}}/>)

    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    await user.type(passwordInput, 'password123')

    expect(passwordInput).toHaveValue('password123')
  })

  it('should toggle password visibility', async () => {
    const user = userEvent.setup()
    render(<LoginModal isOpen={true} onClose={() => {}}/>)

    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButton = screen.getByRole('button', { name: /show password/i })
    await user.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    render(<LoginModal isOpen={true} onClose={handleClose}/>)

    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(handleClose).toHaveBeenCalled()
  })

  it('should display custom labels', () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={() => {}}
        labels={{
          title: 'Sign In',
          subtitle: 'Enter your credentials',
          username: 'Email',
          password: 'Secret',
        }}
      />,
    )
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Enter your credentials')).toBeInTheDocument()
  })

  it('should show login button', () => {
    render(<LoginModal isOpen={true} onClose={() => {}}/>)
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('should show forgot password link when URL provided', () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={() => {}}
        urls={{ forgotPassword: '/forgot-password' }}
      />,
    )
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
  })

  it('should show register link when URL provided', () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={() => {}}
        urls={{ register: '/register' }}
      />,
    )
    expect(screen.getByText(/register/i)).toBeInTheDocument()
  })
})

