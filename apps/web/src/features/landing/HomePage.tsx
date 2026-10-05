import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  Check,
  ChevronRight,
  CircleDot,
  Copy,
  FileCode2,
  FileText,
  GitBranch,
  GitPullRequest,
  Github,
  MessageCircle,
  Network,
  Play,
  ScanLine,
  Search,
  Sparkles,
  SquareTerminal,
  Zap,
} from "lucide-react";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { HeroVisual } from "./sections/HeroVisual";
import { ProductOverview } from "./sections/ProductOverview";
import { Workflow } from "./sections/Workflow";
import { Features } from "./sections/Features";
import { Dashboard } from "./sections/Dashboard";
import { Quote } from "./sections/Quote";
import { FinalCta } from "./sections/FinalCta";
import { Footer } from "./sections/Footer";
import { workflow } from "./content";
import { RelayMark } from "./parts";

type Feature = {
  id: string;
  number: string;
  label: string;
  title: string;
  description: string;
  accent: string;
  icon: typeof GitBranch;
  bullets: string[];
};

function HeroDiagram() {
  return (
    <div
      className="hero-diagram"
      aria-label="Illustration of a codebase becoming project context"
    >
      <div className="diagram-topline">
        <span>RELAY / CONTEXT ENGINE</span>
        <span className="diagram-live">
          <span className="live-dot" /> syncing
        </span>
      </div>
      <div className="diagram-grid" />
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
        <span>“Why Redis here?”</span>
        <b>answer</b>
      </div>
      <svg
        className="diagram-lines"
        viewBox="0 0 720 410"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M120 88 H245 V170 H330" />
        <path d="M117 240 H245 V170 H330" />
        <path d="M330 170 H455 V86 H600" />
        <path d="M330 170 H455 V274 H600" />
        <circle cx="330" cy="170" r="7" />
        <circle cx="455" cy="170" r="5" />
      </svg>
      <div className="context-card">
        <div className="context-card-head">
          <span className="eyebrow">PROJECT CONTEXT</span>
          <span className="signal-pill">
            <CircleDot size={11} /> grounded
          </span>
        </div>
        <h3>Authentication flow</h3>
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

function FeatureVisual({ feature }: { feature: Feature }) {
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



function DashboardPreview() {
  return (
    <div className="dashboard-frame">
      <div className="dashboard-sidebar">
        <RelayMark compact />
        <div className="dash-nav">
          <span className="dash-nav-active">
            <SquareTerminal size={14} /> Home
          </span>
          <span>
            <Boxes size={14} /> Projects
          </span>
          <span>
            <Search size={14} /> Search
          </span>
          <span>
            <BookOpen size={14} /> Onboarding
          </span>
          <span>
            <GitPullRequest size={14} /> Handoff
          </span>
        </div>
        <span className="dash-settings">
          <Zap size={13} /> Pro workspace
        </span>
      </div>
      <div className="dashboard-main">
        <div className="dash-top">
          <div>
            <span className="mini-label">MONDAY, OCTOBER 06</span>
            <h3>
              Good to see you, Abhi<span className="copper-dot">.</span>
            </h3>
          </div>
          <div className="avatar">A</div>
        </div>
        <div className="dash-stats">
          <div>
            <b>03</b>
            <span>Projects</span>
          </div>
          <div>
            <b>14</b>
            <span>Open threads</span>
          </div>
          <div>
            <b>02</b>
            <span>Active handoffs</span>
          </div>
          <div>
            <b>87%</b>
            <span>Context coverage</span>
          </div>
        </div>
        <div className="dash-content-grid">
          <div className="recent-projects">
            <div className="dash-section-head">
              <span>Recent projects</span>
              <a href="#demo">
                View all <ArrowUpRight size={12} />
              </a>
            </div>
            <div className="project-row">
              <div className="project-icon project-icon-copper">S</div>
              <div>
                <b>Spawn</b>
                <span>AbhiXO / Spawn</span>
              </div>
              <em>Healthy</em>
              <small>4h ago</small>
            </div>
            <div className="project-row">
              <div className="project-icon project-icon-blue">P</div>
              <div>
                <b>Preflight</b>
                <span>AbhiXO / Preflight</span>
              </div>
              <em className="status-purple">Indexing…</em>
              <small>1d ago</small>
            </div>
            <div className="project-row">
              <div className="project-icon project-icon-moss">D</div>
              <div>
                <b>Dev tools</b>
                <span>AbhiXO / dev-tools</span>
              </div>
              <em>Healthy</em>
              <small>3d ago</small>
            </div>
          </div>
          <div className="activity-card">
            <div className="dash-section-head">
              <span>Context pulse</span>
              <ScanLine size={14} />
            </div>
            <div className="pulse-ring">
              <strong>
                87<span>%</span>
              </strong>
              <small>indexed</small>
            </div>
            <div className="pulse-bar">
              <span />
            </div>
            <div className="activity-list">
              <span>
                <CircleDot size={12} /> 42 commits connected
              </span>
              <span>
                <GitPullRequest size={12} /> 13 PRs explained
              </span>
              <span>
                <MessageCircle size={12} /> 08 questions answered
              </span>
            </div>
          </div>
        </div>
        <div className="dash-question">
          <div className="response-mark">
            <RelayMark compact />
          </div>
          <span>Ask Relay about this project…</span>
          <ArrowRight size={15} />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);
  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    closeMenu();
  };

  return (
    <main className="site-shell">
      <div className="grain" aria-hidden="true" />
      <Header
        mobileOpen={mobileOpen}
        onMenuToggle={() => setMobileOpen(o => !o)}
        onMenuClose={closeMenu}
        onNavClick={scrollTo}
      />

      <Hero onCtaClick={scrollTo} HeroVisual={HeroVisual} />

      <ProductOverview />

      <Workflow />

      <Features />

      <Dashboard />

      <Quote />

      <FinalCta />

      <Footer />
    </main>
  );
}
