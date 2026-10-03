import { type ReactNode, Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean; error: Error | null };

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen w-full bg-surface text-text flex flex-col items-center justify-center p-6">
        <AlertTriangle size={36} className="text-copper mb-4" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
          RELAY / RUNTIME ERROR
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-text mb-4 text-center">
          Something went
          <br />
          <em className="text-copper">off track.</em>
        </h1>
        <pre className="max-w-lg overflow-auto rounded-md border border-border bg-surface-raised p-4 text-xs text-text-muted mb-6 font-mono">
          {this.state.error?.stack}
        </pre>
        <button
          className="inline-flex items-center gap-2 rounded-sm bg-copper px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-white transition-colors hover:bg-copper-dark"
          onClick={() => window.location.reload()}
        >
          <RotateCcw size={15} /> Reload page
        </button>
      </main>
    );
  }
}
