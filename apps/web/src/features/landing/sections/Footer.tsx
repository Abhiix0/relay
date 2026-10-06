/**
 * Footer — site footer with branding, navigation links, and meta info.
 * Features RelayMark logo, tagline, footer links, and copyright/meta text.
 */

import { RelayMark } from "../parts";
import { footerContent } from "../content";

export function Footer() {
  return (
    <footer className="site-footer section-wrap">
      <div>
        <RelayMark />
        <p>{footerContent.tagline}</p>
      </div>
      <div className="footer-meta">
        <span>{footerContent.meta.copyright}</span>
        <span>{footerContent.meta.tagline}</span>
      </div>
    </footer>
  );
}
