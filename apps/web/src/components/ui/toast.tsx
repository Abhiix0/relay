/**
 * Toast system — aria-live queue, 4 variants, auto-dismiss.
 * Usage:
 *   const { toast } = useToast()
 *   toast({ title: "Saved", variant: "success" })
 *
 * Mount <Toaster /> once near the app root (inside AppShell or AppProviders).
 */
import * as React from "react";
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Types ───────────────────────────────────────────────────── */

export type ToastVariant = "default" | "success" | "error" | "warning";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** ms before auto-dismiss; 0 = sticky */
  duration?: number;
}

/* ── Context ─────────────────────────────────────────────────── */

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

/* ── Provider ────────────────────────────────────────────────── */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((item: Omit<ToastItem, "id">) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setItems((prev) => [...prev, { duration: 4000, variant: "default", ...item, id }]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <Toaster items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────────────────── */

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/* ── Variant config ──────────────────────────────────────────── */

const variantConfig: Record<
  ToastVariant,
  { icon: React.ElementType; classes: string }
> = {
  default: {
    icon: Info,
    classes: "border-border bg-charcoal text-paper",
  },
  success: {
    icon: CheckCircle,
    classes: "border-success/40 bg-charcoal text-paper",
  },
  error: {
    icon: XCircle,
    classes: "border-error/40 bg-charcoal text-paper",
  },
  warning: {
    icon: AlertTriangle,
    classes: "border-warning/40 bg-charcoal text-paper",
  },
};

const iconColorMap: Record<ToastVariant, string> = {
  default:  "text-blue",
  success:  "text-success",
  error:    "text-error",
  warning:  "text-warning",
};

/* ── Single toast item ───────────────────────────────────────── */

function ToastItemEl({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const variant = item.variant ?? "default";
  const { icon: Icon, classes } = variantConfig[variant];

  React.useEffect(() => {
    if (!item.duration) return;
    const t = setTimeout(() => onDismiss(item.id), item.duration);
    return () => clearTimeout(t);
  }, [item.id, item.duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 border px-4 py-3 shadow-lg",
        "animate-in slide-in-from-bottom-2 fade-in-0 duration-200",
        classes
      )}
    >
      <Icon
        className={cn("mt-0.5 h-4 w-4 shrink-0", iconColorMap[variant])}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="font-mono text-xs font-semibold leading-snug">{item.title}</p>
        {item.description && (
          <p className="font-mono text-[10px] text-text-muted leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="ml-1 shrink-0 rounded p-0.5 text-text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

/* ── Toaster (mount once) ────────────────────────────────────── */

function Toaster({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2 pointer-events-none"
    >
      {items.map((item) => (
        <ToastItemEl key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export { Toaster };
