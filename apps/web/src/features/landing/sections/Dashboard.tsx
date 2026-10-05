/**
 * Dashboard — dashboard preview section showing the Relay app interface.
 * Features heading with title, description, and CTA, plus dashboard mock frame.
 */

import { ArrowUpRight } from "lucide-react";
import { dashboardContent } from "../content";
import { DashboardPreview } from "./DashboardPreview";

export function Dashboard() {
  return (
    <section className="dashboard-section section-wrap" id="demo">
      <div className="dashboard-heading">
        <div>
          <div className="eyebrow">{dashboardContent.eyebrow}</div>
          <h2>
            {dashboardContent.title.line1}
            <br />
            <em>{dashboardContent.title.line2}</em>
          </h2>
        </div>
        <div className="dashboard-heading-copy">
          <p>{dashboardContent.body}</p>
          <a href="#contact" className="arrow-link">
            {dashboardContent.linkText} <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
      <DashboardPreview />
    </section>
  );
}
