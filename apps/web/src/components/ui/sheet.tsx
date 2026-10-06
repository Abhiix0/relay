import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Focus-trap hook ─────────────────────────────────────────── */

function useFocusTrap(active: boolean, ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;

    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    el.addEventListener("keydown", trap);
    return () => el.removeEventListener("keydown", trap);
  }, [active, ref]);
}

/* ── Types ───────────────────────────────────────────────────── */

interface SheetProps {
  open: boolean;
  onClose: () => void;
  side?: "right" | "left";
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/* ── Component ───────────────────────────────────────────────── */

function Sheet({
  open,
  onClose,
  side = "right",
  title,
  description,
  children,
  className,
}: SheetProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  useFocusTrap(open, panelRef);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll while open
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-[var(--overlay)] animate-in fade-in-0 duration-200"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed inset-y-0 z-50 flex w-full max-w-sm flex-col bg-surface border-border shadow-xl",
          "animate-in duration-300",
          side === "right"
            ? "right-0 border-l slide-in-from-right"
            : "left-0 border-r slide-in-from-left",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div className="space-y-0.5">
            <h2
              id="sheet-title"
              className="font-serif text-xl font-normal leading-tight"
            >
              {title}
            </h2>
            {description && (
              <p className="text-xs text-text-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="ml-4 rounded p-1 text-text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

export { Sheet };
