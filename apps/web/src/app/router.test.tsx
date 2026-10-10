import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import { AppRoutes } from './router'

vi.mock('@/lib/api/hooks', () => ({
  useCurrentUser: () => ({
    data: { id: 'u1', name: 'Test User', email: 'test@example.com', githubLogin: 'testuser' },
    isLoading: false,
    error: null,
  }),
  useProjects: () => ({
    data: [
      {
        id: 'proj-1',
        name: 'relay',
        fullName: 'acme/relay',
        description: 'Codebase intelligence',
        syncStatus: 'synced',
        healthLabel: 'Healthy',
        updatedAt: '2026-03-01T00:00:00Z',
        stats: { commits: 10, pullRequests: 2, issues: 1, releases: 3, files: 5, branches: 1, contributors: 1 },
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useProject: () => ({
    data: {
      id: 'proj-1',
      name: 'relay',
      fullName: 'acme/relay',
      description: 'Codebase intelligence',
      syncStatus: 'synced',
      healthLabel: 'Healthy',
      updatedAt: '2026-03-01T00:00:00Z',
      stats: { commits: 10, pullRequests: 2, issues: 1, releases: 3, files: 5, branches: 1, contributors: 1 },
    },
    isLoading: false,
    error: null,
  }),
  useCreateProject: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useDeleteProject: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useTriggerSync: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useSyncStatus: () => ({
    data: null,
    refetch: vi.fn(),
  }),
  useProjectOverview: () => ({
    data: { health: { status: 'healthy', score: 98, passingChecks: 5, totalChecks: 5, checks: [] } },
    isLoading: false,
  }),
  useProjectActivity: () => ({
    data: [],
    isLoading: false,
  }),
  useAskEvidence: () => ({ data: null, isLoading: false }),
  useAskStats: () => ({ data: null, isLoading: false }),
  useGlobalSearch: () => ({ data: { results: [], total: 0 }, isLoading: false, error: null }),
  useProjectSearch: () => ({ data: { results: [], total: 0 }, isLoading: false }),
  useHandoffSummary: () => ({ data: null, isLoading: false }),
  useDecisions: () => ({ data: [], isLoading: false }),
  useOnboardingChecklist: () => ({ data: null, isLoading: false }),
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const renderWithRouter = (initialEntry: string) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Router', () => {
  it('renders landing page at root route', () => {
    renderWithRouter('/')
    expect(document.body).toBeTruthy()
  })

  it('renders sign-in page at /sign-in', () => {
    renderWithRouter('/sign-in')
    expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument()
  })

  it('redirects /app to /app/dashboard', () => {
    renderWithRouter('/app')
    expect(screen.getByText(/recent projects/i)).toBeInTheDocument()
  })

  it('redirects legacy /dashboard to /app/dashboard', () => {
    renderWithRouter('/dashboard')
    expect(screen.getByText(/recent projects/i)).toBeInTheDocument()
  })

  it('redirects legacy /search to /app/search', () => {
    renderWithRouter('/search')
    expect(screen.getByPlaceholderText(/search for functions, classes, documentation/i)).toBeInTheDocument()
  })

  it('redirects legacy /profile to /app/profile', () => {
    renderWithRouter('/profile')
    expect(screen.getByText(/developer identity/i)).toBeInTheDocument()
  })

  it('redirects legacy /projects to /app/projects', () => {
    renderWithRouter('/projects')
    expect(screen.getByText(/all repositories/i)).toBeInTheDocument()
  })

  it('redirects legacy /projects/:id to /app/projects/:id', () => {
    renderWithRouter('/projects/proj-1')
    expect(screen.getByRole('link', { name: /back to projects/i })).toBeInTheDocument()
  })

  it('renders 404 page for unknown routes', () => {
    renderWithRouter('/non-existent-route-xyz')
    expect(screen.getByText(/404/i)).toBeInTheDocument()
  })
})