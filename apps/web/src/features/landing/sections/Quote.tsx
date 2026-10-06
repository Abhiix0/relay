/**
 * Quote — testimonial/quote section with attribution.
 * Features large quote mark, blockquote text, and centered credit with decorative lines.
 */

import { quoteContent } from "../content";

export function Quote() {
  return (
    <section className="quote-section section-wrap" id="about">
      <div className="quote-mark">"</div>
      <blockquote>{quoteContent.quote}</blockquote>
      <div className="quote-credit">
        <span className="credit-line" aria-hidden="true" />
        <span>{quoteContent.attribution}</span>
        <span className="credit-line" aria-hidden="true" />
      </div>
    </section>
  );
}
