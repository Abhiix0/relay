/**
 * Workflow — three-step workflow section showing how Relay works.
 * Features workflow cards with icons, titles, and details for Connect/Explore/Share.
 */

import { workflow, workflowContent } from "../content";

export function Workflow() {
  return (
    <section className="workflow-section section-wrap" id="workflow">
      <div className="section-aside">
        <span className="section-number">02</span>
        <span className="vertical-rule" aria-hidden="true" />
        <span className="section-caption">How it works</span>
      </div>
      <div className="workflow-content">
        <div className="workflow-head">
          <h2>
            {workflowContent.title.line1}
            <br />
            <em>{workflowContent.title.line2}</em>
          </h2>
          <div className="workflow-note">
            <span className="note-mark" aria-hidden="true">
              &gt;
            </span>
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
                <div className="workflow-card-heading">
                  <span className="eyebrow">{step.label}</span>
                  <h3>{step.title}</h3>
                </div>
                <div className="workflow-card-line" />
                <p className="workflow-card-detail">{step.detail}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
