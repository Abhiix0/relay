/**
 * Features — interactive feature showcase with tabs and detail view.
 * Manages active feature state and renders feature tabs + detail panel with FeatureVisual.
 */

import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { useState } from "react";
import { features, featuresContent } from "../content";
import { FeatureVisual } from "./FeatureVisual";

export function Features() {
  const [activeFeature, setActiveFeature] = useState("context");
  const active = features.find((feature) => feature.id === activeFeature);

  if (!active) {
    return null;
  }

  return (
    <section className="features-section section-wrap" id="features">
      <div className="feature-index-panel">
        <div className="eyebrow">{featuresContent.eyebrow}</div>
        <h2>
          {featuresContent.title.line1}
          <br />
          <em>{featuresContent.title.line2}</em>
        </h2>
        <p>{featuresContent.intro}</p>
        <div
          className="feature-tabs"
          role="tablist"
          aria-label="Relay capabilities"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                className={`feature-tab ${activeFeature === feature.id ? "feature-tab-active" : ""}`}
                onClick={() => setActiveFeature(feature.id)}
                role="tab"
                aria-selected={activeFeature === feature.id}
              >
                <span className="feature-tab-number">{feature.number}</span>
                <Icon size={15} />
                <span>{feature.label}</span>
                <ChevronRight className="feature-chevron" size={15} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="feature-detail" key={active.id}>
        <div className="feature-detail-copy">
          <div className={`feature-badge badge-${active.accent}`}>
            <active.icon size={16} /> {active.label}
          </div>
          <h2>{active.title}</h2>
          <p>{active.description}</p>
          <ul>
            {active.bullets.map((bullet) => (
              <li key={bullet}>
                <Check size={14} /> {bullet}
              </li>
            ))}
          </ul>
          <a href="#demo" className="arrow-link">
            See it in action <ArrowRight size={15} />
          </a>
        </div>
        <FeatureVisual feature={active} />
      </div>
    </section>
  );
}
