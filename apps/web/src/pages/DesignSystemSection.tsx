/**
 * Shared layout helpers used only inside DesignSystemPage.
 * Kept separate to keep DesignSystemPage under the 200-line guidance.
 */
import { type ReactNode } from "react";

export function DSSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-5 font-serif text-2xl font-normal border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function DSLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
      {children}
    </p>
  );
}

export function ColorSwatch({
  label,
  cssVar,
}: {
  label: string;
  cssVar: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 w-full border border-border"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div>
        <p className="font-mono text-xs">{label}</p>
        <p className="font-mono text-[10px] text-text-muted">{cssVar}</p>
      </div>
    </div>
  );
}
