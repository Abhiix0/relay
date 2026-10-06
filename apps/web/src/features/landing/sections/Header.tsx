/**
 * Header — landing page header with navigation, mobile menu, and CTAs.
 * Manages mobile menu open/closed state and navigation clicks.
 */

import { useEffect, useRef } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link } from "react-router";
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
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key to close menu
  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onMenuClose();
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen, onMenuClose]);

  // Focus management: move focus to first link when menu opens
  useEffect(() => {
    if (mobileOpen && navRef.current) {
      const firstLink = navRef.current.querySelector("a");
      firstLink?.focus();
    }
  }, [mobileOpen]);

  return (
    <header className="site-header">
      <a
        href="#top"
        className="header-logo"
        onClick={(event) => {
          if (!mobileOpen) {
            onMenuClose();
            return;
          }
          event.preventDefault();
          onNavClick("top");
          menuButtonRef.current?.focus();
        }}
      >
        <RelayMark />
      </a>
      <nav
        ref={navRef}
        id="primary-navigation"
        className={`main-nav ${mobileOpen ? "main-nav-open" : ""}`}
        aria-label="Primary navigation"
      >
        <ul className="main-nav-links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(event) => {
                  if (!mobileOpen) return;
                  event.preventDefault();
                  onNavClick(link.href.slice(1));
                  menuButtonRef.current?.focus();
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="header-actions">
        <Link to="/sign-in" className="text-link hide-mobile" onClick={onMenuClose}>
          Sign in <ArrowUpRight size={14} />
        </Link>
        <Link to="/sign-in" className="button button-copper button-small" onClick={onMenuClose}>
          Get started <ArrowUpRight size={14} />
        </Link>
      </div>
      <button
        ref={menuButtonRef}
        className="menu-button"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        aria-controls="primary-navigation"
        onClick={onMenuToggle}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </header>
  );
}
