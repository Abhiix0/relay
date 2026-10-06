import { useState } from "react";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { HeroVisual } from "./sections/HeroVisual";
import { ProductOverview } from "./sections/ProductOverview";
import { Workflow } from "./sections/Workflow";
import { Features } from "./sections/Features";
import { Dashboard } from "./sections/Dashboard";
import { FinalCta } from "./sections/FinalCta";
import { Footer } from "./sections/Footer";

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);
  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    closeMenu();
  };

  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="grain" aria-hidden="true" />
      <Header
        mobileOpen={mobileOpen}
        onMenuToggle={() => setMobileOpen((open) => !open)}
        onMenuClose={closeMenu}
        onNavClick={scrollTo}
      />

      <main id="main-content" tabIndex={-1}>
        <Hero HeroVisual={HeroVisual} />
        <ProductOverview />
        <Workflow />
        <Features />
        <Dashboard />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
