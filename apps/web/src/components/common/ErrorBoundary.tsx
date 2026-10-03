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
      <main className="error-page">
        <AlertTriangle size={36} />
        <p className="not-found-kicker">RELAY / RUNTIME ERROR</p>
        <h1>
          Something went
          <br />
          <em>off track.</em>
        </h1>
        <pre>{this.state.error?.stack}</pre>
        <button
          className="button button-copper"
          onClick={() => window.location.reload()}
        >
          <RotateCcw size={15} /> Reload page
        </button>
      </main>
    );
  }
}
