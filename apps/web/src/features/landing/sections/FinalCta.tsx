/**
 * FinalCta — final call-to-action section with visual diagram.
 * Features centered CTA copy, button, note, and animated flow diagram showing repo → context → momentum.
 */

import { ArrowRight, ArrowUpRight, GitBranch, Sparkles } from "lucide-react";
import { finalCtaContent } from "../content";

export function FinalCta() {
  return (
    <section className="final-cta section-wrap" id="contact">
      <div className="final-cta-inner">
        <div className="eyebrow">{finalCtaContent.eyebrow}</div>
        <h2>
          {finalCtaContent.title.line1}
          <br />
          <em>{finalCtaContent.title.line2}</em>
        </h2>
        <p>{finalCtaContent.body}</p>
        <div className="final-actions">
          <a className="button button-copper" href="/sign-in">
            {finalCtaContent.cta} <ArrowRight size={15} />
          </a>
          <span className="final-note">
            <span className="live-dot" /> {finalCtaContent.note}
          </span>
        </div>
      </div>
      <div className="final-diagram">
        <div className="final-grid" />
        <div className="final-node final-node-a">
          <GitBranch size={14} /> repo
        </div>
        <div className="final-node final-node-b">
          <Sparkles size={14} /> context
        </div>
        <div className="final-node final-node-c">
          <ArrowUpRight size={14} /> momentum
        </div>
        <svg viewBox="0 0 460 250" preserveAspectRatio="none">
          <path d="M78 126 H205 L285 70 H395" />
          <path d="M205 126 285 182 H395" />
          <circle cx="205" cy="126" r="6" />
        </svg>
      </div>
    </section>
  );
}
