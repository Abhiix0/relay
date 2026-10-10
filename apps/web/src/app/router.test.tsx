import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect } from 'vitest'
import { LandingPage } from '@/features/landing/LandingPage'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Router', () => {
  it('renders landing page at root route', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <LandingPage />,
      },
    ], {
      initialEntries: ['/'],
    })

    render(
      <TestWrapper>
        <RouterProvider router={router} />
      </TestWrapper>
    )
    
    // Landing page should render without errors
    expect(document.body).toBeTruthy()
  })
})