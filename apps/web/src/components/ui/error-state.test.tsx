import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ErrorState } from './error-state'

describe('ErrorState', () => {
  it('renders with default props', () => {
    render(<ErrorState />)
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('An error occurred while loading this content.')).toBeInTheDocument()
  })

  it('renders with custom title and description', () => {
    render(
      <ErrorState 
        title="Custom Error" 
        description="Custom error description" 
      />
    )
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument()
    expect(screen.getByText('Custom error description')).toBeInTheDocument()
  })

  it('shows retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    
    render(<ErrorState onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    await user.click(retryButton)
    
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('has proper accessibility role', () => {
    render(<ErrorState />)
    
    const errorState = screen.getByRole('alert')
    expect(errorState).toBeInTheDocument()
  })
})