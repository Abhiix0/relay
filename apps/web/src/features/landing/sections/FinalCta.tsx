/**
 * FinalCta — final call-to-action section with visual diagram.
 * Features centered CTA copy, button, note, and animated flow diagram showing repo → context → momentum.
 */

import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { finalCtaContent } from "../content";

export function FinalCta() {
  return (
    <section className="final-cta section-wrap" id="contact">
      <div className="final-cta-inner">
        <h2>
          {finalCtaContent.title.line1}
          <br />
          <em>{finalCtaContent.title.line2}</em>
        </h2>
        <p>{finalCtaContent.body}</p>
        <div className="final-actions">
          <Link to="/sign-in" className="button button-copper">
            {finalCtaContent.cta} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
