/**
 * Header — landing page header with navigation, mobile menu, and CTAs.
 * Manages mobile menu open/closed state and navigation clicks.
 */

import { ArrowUpRight, Menu, X } from "lucide-react";
import { RelayMark } from "../parts";
import { navLinks } from "../content";

interface HeaderProps {
  mobileOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  onNavClick: (id: string) => void;
}

export function Header({
  mobileOpen,
  onMenuToggle,
  onMenuClose,
  onNavClick,
}: HeaderProps) {
  return (
    <header className="site-header">
      <a href="#top" className="header-logo" onClick={onMenuClose}>
        <RelayMark />
      </a>
      <nav
        className={`main-nav ${mobileOpen ? "main-nav-open" : ""}`}
        aria-label="Primary navigation"
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onMenuClose}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <a className="text-link hide-mobile" href="/sign-in">
          Sign in <ArrowUpRight size={14} />
        </a>
        <a className="button button-copper button-small" href="/sign-in">
          Get started <ArrowUpRight size={14} />
        </a>
      </div>
      <button
        className="menu-button"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        onClick={onMenuToggle}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </header>
  );
}
