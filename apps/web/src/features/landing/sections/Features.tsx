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
            const selected = activeFeature === feature.id;
            return (
              <button
                id={`feature-tab-${feature.id}`}
                key={feature.id}
                className={`feature-tab ${activeFeature === feature.id ? "feature-tab-active" : ""}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveFeature(feature.id)}
                onKeyDown={(event) => {
                  const tabButtons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role='tab']");
                  let nextIndex = features.findIndex((item) => item.id === feature.id);

                  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    nextIndex = (nextIndex + 1) % features.length;
                  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                    nextIndex = (nextIndex - 1 + features.length) % features.length;
                  } else if (event.key === "Home") {
                    nextIndex = 0;
                  } else if (event.key === "End") {
                    nextIndex = features.length - 1;
                  } else {
                    return;
                  }

                  event.preventDefault();
                  const nextFeature = features[nextIndex];
                  if (nextFeature) {
                    setActiveFeature(nextFeature.id);
                    tabButtons?.[nextIndex]?.focus();
                  }
                }}
                role="tab"
                aria-selected={selected}
                aria-controls="feature-panel"
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
      <div
        id="feature-panel"
        className="feature-detail"
        key={active.id}
        role="tabpanel"
        aria-labelledby={`feature-tab-${active.id}`}
        tabIndex={0}
      >
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
