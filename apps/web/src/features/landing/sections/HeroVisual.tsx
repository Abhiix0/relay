/**
 * HeroVisual — animated diagram showing codebase transformation to context.
 * Displays the Relay context engine with nodes, connections, and context card.
 */

import {
  ArrowUpRight,
  BookOpen,
  CircleDot,
  FileCode2,
  FileText,
  GitPullRequest,
  MessageCircle,
} from "lucide-react";

export function HeroVisual() {
  return (
    <div
      className="hero-diagram"
      role="img"
      aria-label="Illustration of a codebase becoming project context"
    >
      <div className="diagram-topline">
        <span>RELAY / CONTEXT ENGINE</span>
        <span className="diagram-live">
          <span className="live-dot" /> syncing
        </span>
      </div>
      <div className="diagram-grid" aria-hidden="true" />
      <div className="diagram-caption caption-a">
        FROM
        <br />
        CODEBASE
      </div>
      <div className="diagram-caption caption-b">
        TO
        <br />
        CONTEXT
      </div>
      <div className="diagram-cross cross-a" />
      <div className="diagram-cross cross-b" />
      <div className="diagram-node node-a">
        <FileCode2 size={15} />
        <span>src / auth.ts</span>
        <b>92%</b>
      </div>
      <div className="diagram-node node-b">
        <GitPullRequest size={15} />
        <span>PR #184 · rationale</span>
        <b>linked</b>
      </div>
      <div className="diagram-node node-c">
        <BookOpen size={15} />
        <span>onboarding / week-01</span>
        <b>new</b>
      </div>
      <div className="diagram-node node-d">
        <MessageCircle size={15} />
        <span>"Why Redis here?"</span>
        <b>answer</b>
      </div>
      <svg
        className="diagram-lines"
        viewBox="0 0 720 410"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path d="M190 47 H310 V173" />
        <path d="M200 173 H310" />
        <path d="M215 313 H310 V173" />
        <path d="M310 173 H410" />
        <path d="M560 250 V275" />
        <circle cx="310" cy="173" r="7" />
        <circle cx="360" cy="173" r="5" />
      </svg>
      <svg
        className="diagram-lines diagram-lines-mobile"
        viewBox="0 0 360 440"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path d="M200 120 H220 V174" />
        <path d="M200 174 H220" />
        <path d="M200 220 H220 V174" />
        <path d="M220 174 H270 V248" />
        <path d="M265 360 V376" />
        <circle cx="220" cy="174" r="7" />
        <circle cx="238" cy="174" r="5" />
      </svg>
      <div className="context-card">
        <div className="context-card-head">
          <span className="eyebrow">PROJECT CONTEXT</span>
          <span className="signal-pill">
            <CircleDot size={11} /> grounded
          </span>
        </div>
        <div className="context-card-title">Authentication flow</div>
        <p>
          Token validation runs at the edge before background jobs are queued.
        </p>
        <div className="context-card-foot">
          <span>
            <FileText size={12} /> 12 sources
          </span>
          <span>
            <ArrowUpRight size={12} /> View trail
          </span>
        </div>
      </div>
      <div className="diagram-index">01 — 05</div>
    </div>
  );
}
