import { Outlet } from "react-router";
import ErrorBoundary from "@/components/common/ErrorBoundary";

/** Wrapper for all public (unauthenticated) routes. */
export function PublicLayout() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
}
