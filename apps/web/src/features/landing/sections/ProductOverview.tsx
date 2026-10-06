/**
 * ProductOverview — first content section explaining the Relay value proposition.
 * Features section-aside layout with number, caption, and main content area.
 */

import { ArrowDown } from "lucide-react";
import { overviewContent } from "../content";

export function ProductOverview() {
  return (
    <section className="overview-section section-wrap" id="product">
      <div className="section-aside">
        <span className="section-number">{overviewContent.sectionNumber}</span>
        <span className="vertical-rule" aria-hidden="true" />
        <span className="section-caption">{overviewContent.sectionCaption}</span>
      </div>
      <div className="overview-content">
        <div className="eyebrow">{overviewContent.eyebrow}</div>
        <h2>
          {overviewContent.title.line1}
          <br />
          <em>{overviewContent.title.line2}</em>
        </h2>
        <div className="overview-lower">
          <p>{overviewContent.body}</p>
          <a href="#features" className="arrow-link">
            {overviewContent.linkText} <ArrowDown size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
