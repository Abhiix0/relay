/**
 * Workflow — three-step workflow section showing how Relay works.
 * Features workflow cards with icons, titles, and details for Connect/Explore/Share.
 */

import { ArrowUpRight } from "lucide-react";
import { workflow, workflowContent } from "../content";

export function Workflow() {
  return (
    <section className="workflow-section section-wrap" id="workflow">
      <div className="workflow-head">
        <div>
          <div className="eyebrow">{workflowContent.eyebrow}</div>
          <h2>
            {workflowContent.title.line1}
            <br />
            <em>{workflowContent.title.line2}</em>
          </h2>
        </div>
        <div className="workflow-note">
          <span className="note-mark">↗</span>
          <p>{workflowContent.note}</p>
        </div>
      </div>
      <div className="workflow-grid">
        {workflow.map((step) => {
          const Icon = step.icon;
          return (
            <article className="workflow-card" key={step.number}>
              <div className="workflow-card-top">
                <span>{step.number}</span>
                <Icon size={19} />
              </div>
              <div className="workflow-card-line" />
              <div className="workflow-card-body">
                <span className="eyebrow">{step.label}</span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </div>
              <a
                href="#features"
                className="card-arrow"
                aria-label={`Learn about ${step.label}`}
              >
                <ArrowUpRight size={16} />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
