/**
 * Dashboard — dashboard preview section showing the Relay app interface.
 * Features heading with title, description, and CTA, plus dashboard mock frame.
 */

import { dashboardContent } from "../content";
import { DashboardPreview } from "./DashboardPreview";

export function Dashboard() {
  return (
    <section className="dashboard-section section-wrap" id="demo">
      <div className="section-aside">
        <span className="section-number">04</span>
        <span className="vertical-rule" aria-hidden="true" />
        <span className="section-caption">A calmer command center</span>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-heading">
          <div className="dashboard-heading-title">
            <h2>
              {dashboardContent.title.line1}
              <br />
              <em>{dashboardContent.title.line2}</em>
            </h2>
          </div>
          <div className="dashboard-heading-copy">
            <p>{dashboardContent.body}</p>
          </div>
        </div>
        <DashboardPreview />
      </div>
    </section>
  );
}
