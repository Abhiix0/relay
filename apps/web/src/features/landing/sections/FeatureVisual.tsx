/**
 * FeatureVisual — visual mock for each feature capability.
 * Renders different layouts for "context" vs other features (agent/onboarding/handoff/search).
 */

import {
  BookOpen,
  Boxes,
  Check,
  ChevronRight,
  Copy,
  FileCode2,
  Sparkles,
} from "lucide-react";
import { RelayMark } from "../parts";
import type { Feature } from "../content";

interface FeatureVisualProps {
  feature: Feature;
}

export function FeatureVisual({ feature }: FeatureVisualProps) {
  const Icon = feature.icon;
  return (
    <div className={`feature-visual feature-visual-${feature.accent}`}>
      <div className="visual-window-bar">
        <span />
        <span />
        <span />
        <code>relay / {feature.id}</code>
        <span className="window-dots">•••</span>
      </div>
      {feature.id === "context" && (
        <div className="context-visual-grid">
          <div className="tree-panel">
            <div className="mini-label">REPOSITORY</div>
            <div className="tree-item tree-root">
              <Boxes size={14} /> spawn
            </div>
            <div className="tree-item indent-1">
              <ChevronRight size={12} /> src
            </div>
            <div className="tree-item indent-2 active">
              <FileCode2 size={13} /> middleware/auth.ts
            </div>
            <div className="tree-item indent-2">
              <FileCode2 size={13} /> services/queue.ts
            </div>
            <div className="tree-item indent-1">
              <ChevronRight size={12} /> docs
            </div>
            <div className="tree-item indent-2">
              <BookOpen size={13} /> decisions.md
            </div>
          </div>
          <div className="code-panel">
            <div className="mini-label">CONTEXT TRAIL / 04 SOURCES</div>
            <div className="code-line">
              <span>01</span>
              <i>export</i> <b>const</b> verifyToken = <em>async</em> (req)
              =&gt; &#123;
            </div>
            <div className="code-line">
              <span>02</span>&nbsp;&nbsp;<i>const</i> token =
              req.headers.authorization;
            </div>
            <div className="code-line">
              <span>03</span>&nbsp;&nbsp;<i>return</i> validate(token,
              authConfig);
            </div>
            <div className="code-line">
              <span>04</span>&#125;
            </div>
            <div className="code-note">
              <Sparkles size={14} />
              <span>
                Auth middleware feeds the job queue. See <u>PR #143</u>.
              </span>
            </div>
          </div>
        </div>
      )}
      {feature.id !== "context" && (
        <div className="feature-abstract">
          <div className="abstract-heading">
            <Icon size={18} />
            <span>{feature.label.toUpperCase()}</span>
            <small>LIVE VIEW</small>
          </div>
          <div className="abstract-title">
            {feature.id === "agent"
              ? "Why is Redis used here?"
              : feature.id === "onboarding"
                ? "Your path through Spawn"
                : feature.id === "handoff"
                  ? "Handoff / Spawn · v2.4"
                  : "Search across the project"}
          </div>
          <div className="abstract-lines">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="abstract-response">
            <div className="response-mark">
              <RelayMark compact />
            </div>
            <div>
              <b>
                {feature.id === "agent"
                  ? "Relay found 4 connected sources"
                  : "Relay assembled the context"}
              </b>
              <p>
                {feature.id === "agent"
                  ? "queue.ts · docker-compose.yml · PR #143 · decisions.md"
                  : "A concise answer with the files and decisions behind it."}
              </p>
            </div>
          </div>
          <div className="abstract-footer">
            <span>
              <Check size={12} /> evidence linked
            </span>
            <span>
              <Copy size={12} /> copy answer
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
