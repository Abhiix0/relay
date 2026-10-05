import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { ApiError } from "@/lib/api/client";

/**
 * Retry policy:
 * - Never retry 4xx (client errors) except 429 (rate limited).
 * - Retry retryable errors (429, 5xx) up to 2 times with exponential back-off.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && !error.retryable) return false;
  return failureCount < 2;
}

function retryDelay(attempt: number): number {
  // 1s, 2s — capped at 2 retries by shouldRetry above
  return Math.min(1000 * 2 ** attempt, 30_000);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: shouldRetry,
      retryDelay,
    },
    mutations: {
      retry: shouldRetry,
      retryDelay,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
