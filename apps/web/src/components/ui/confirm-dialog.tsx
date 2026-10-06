import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Input } from "./input";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** When set, user must type this exact string to enable the confirm button */
  confirmText?: string;
  destructive?: boolean;
  loading?: boolean;
}

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmText,
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  const [typed, setTyped] = React.useState("");

  const canConfirm = confirmText ? typed === confirmText : true;

  // Reset typed value when dialog closes
  React.useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md bg-charcoal border-border text-paper">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {destructive && (
              <AlertTriangle
                className="h-5 w-5 text-error shrink-0"
                aria-hidden="true"
              />
            )}
            <DialogTitle className="font-serif text-xl font-normal">
              {title}
            </DialogTitle>
          </div>
          {description && (
            <DialogDescription className="text-xs text-text-muted">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {confirmText && (
          <div className="space-y-2">
            <p className="text-xs text-text-muted">
              Type{" "}
              <code className="font-mono text-paper bg-surface-code px-1.5 py-0.5 rounded-sm">
                {confirmText}
              </code>{" "}
              to confirm.
            </p>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={confirmText}
              aria-label="Confirmation input"
              className="bg-surface-accent border-border text-paper font-mono text-xs"
            />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            size="sm"
            onClick={onConfirm}
            disabled={!canConfirm || loading}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ConfirmDialog };
