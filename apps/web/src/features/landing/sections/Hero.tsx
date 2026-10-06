/**
 * Hero — landing page hero section with headline, CTA, metrics, and ticker band.
 * Includes the main value proposition and visual diagram.
 */

import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { heroContent, tickerItems } from "../content";

interface HeroProps {
  HeroVisual: React.ComponentType;
}

export function Hero({ HeroVisual }: HeroProps) {
  return (
    <>
      <section className="hero-section section-wrap" id="top">
        <div className="hero-copy reveal-up">
          <div className="kicker">
            <span className="kicker-line" aria-hidden="true" /> {heroContent.kicker}
          </div>
          <h1>
            {heroContent.title.line1}
            <br />
            <span>{heroContent.title.highlight}</span> {heroContent.title.line2}
            <span className="period">.</span>
          </h1>
          <p className="hero-lede">{heroContent.lede}</p>
          <div className="hero-actions">
            <Link to="/sign-in" className="button button-copper">
              {heroContent.cta.primary} <ArrowRight size={15} />
            </Link>
          </div>
          <div className="hero-metrics">
            {heroContent.metrics.map((metric, idx) => (
              <div key={idx}>
                <b>
                  {metric.value}
                  {metric.suffix && <span>{metric.suffix}</span>}
                </b>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-art reveal-right">
          <HeroVisual />
        </div>
      </section>

      <section className="ticker-band" aria-label="Relay capabilities">
        <div className="ticker-label">ONE PLACE FOR</div>
        <div className="ticker-items">
          {tickerItems.flatMap((item, idx) => {
            const elements = [];
            if (idx > 0) elements.push(<i key={`sep-${idx}`}>→</i>);
            elements.push(<span key={`item-${idx}`}>{item}</span>);
            return elements;
          })}
        </div>
      </section>
    </>
  );
}
