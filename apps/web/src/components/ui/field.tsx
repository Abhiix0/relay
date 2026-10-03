import * as React from "react";
import { cn } from "@/lib/cn";
import { Label } from "./label";

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: FieldProps) {
  const id = React.useId();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </Label>
      )}
      {React.cloneElement(children as React.ReactElement<{ id?: string }>, {
        id,
      })}
      {hint && !error && (
        <p className="text-xs text-text-muted font-mono">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-error font-mono" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
