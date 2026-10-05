/**
 * ArrowLink — directional link with arrow icon and hover animation.
 * Used in overview, workflow cards, dashboard heading, features.
 */

import type { LucideIcon } from "lucide-react";

interface ArrowLinkProps {
  href: string;
  children: React.ReactNode;
  icon: LucideIcon;
  className?: string;
}

export function ArrowLink({ href, children, icon: Icon, className = "" }: ArrowLinkProps) {
  return (
    <a href={href} className={`arrow-link ${className}`.trim()}>
      {children} <Icon size={15} />
    </a>
  );
}
