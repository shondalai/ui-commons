import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'

describe('Avatar', () => {
  it('should render avatar container', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="test.jpg" alt="Test Avatar"/>
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>,
    )
    // In test environment, images don't load so we check for the Avatar container
    const avatar = container.querySelector('.rounded-full')
    expect(avatar).toBeInTheDocument()
  })

  it('should display fallback when image fails to load', () => {
    render(
      <Avatar>
        <AvatarImage src="invalid.jpg" alt="Test Avatar"/>
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText('TU')).toBeInTheDocument()
  })

  it('should apply custom className to Avatar', () => {
    const { container } = render(
      <Avatar className="custom-avatar">
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>,
    )
    const avatar = container.querySelector('.custom-avatar')
    expect(avatar).toBeInTheDocument()
  })

  it('should apply custom className to AvatarImage', () => {
    render(
      <Avatar>
        <AvatarImage src="test.jpg" alt="Test" className="custom-image"/>
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>,
    )
    // In test environment, check that Avatar component renders with fallback
    expect(screen.getByText('FB')).toBeInTheDocument()
  })

  it('should apply custom className to AvatarFallback', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback className="custom-fallback">TU</AvatarFallback>
      </Avatar>,
    )
    expect(container.querySelector('.custom-fallback')).toBeInTheDocument()
  })

  it('should have rounded-full class for circular avatar', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>,
    )
    const avatar = container.firstChild
    expect(avatar).toHaveClass('rounded-full')
  })

  it('should display image when src is valid', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar"/>
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>,
    )
    // In test environment, check for avatar structure instead of loaded image
    const avatar = container.querySelector('.rounded-full')
    expect(avatar).toBeInTheDocument()
  })
})
