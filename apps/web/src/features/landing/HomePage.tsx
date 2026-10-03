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
  Menu,
  MessageCircle,
  Network,
  Play,
  ScanLine,
  Search,
  Sparkles,
  SquareTerminal,
  X,
  Zap,
} from "lucide-react";

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

const features: Feature[] = [
  {
    id: "context",
    number: "01",
    label: "Project context",
    title: "See the shape of a repository in minutes.",
    description:
      "Relay turns commits, docs, issues, and pull requests into a living map of how your software is actually put together.",
    accent: "copper",
    icon: GitBranch,
    bullets: [
      "Architecture, ownership, and intent",
      "Evidence-linked project summaries",
      "Always fresh from your repository",
    ],
  },
  {
    id: "agent",
    number: "02",
    label: "AI agent",
    title: "Ask better questions. Get grounded answers.",
    description:
      "A context-aware agent connects the dots across your codebase, so answers come with the files, commits, and decisions behind them.",
    accent: "moss",
    icon: Sparkles,
    bullets: [
      "Answers with source trails",
      "Follow-up questions stay in context",
      "Shareable discoveries for the team",
    ],
  },
  {
    id: "onboarding",
    number: "03",
    label: "Onboarding",
    title: "Make the first week feel like a head start.",
    description:
      "Give every new teammate a clear route through the product: where to begin, what matters, and how the pieces connect.",
    accent: "sun",
    icon: BookOpen,
    bullets: [
      "Role-aware learning paths",
      "Milestones from first PR to confidence",
      "A guide that evolves with the code",
    ],
  },
  {
    id: "handoff",
    number: "04",
    label: "Handoff",
    title: "Leave context better than you found it.",
    description:
      "Capture the reasoning behind the work, not just the list of files changed. Relay makes handoffs useful on day one.",
    accent: "blue",
    icon: GitPullRequest,
    bullets: [
      "Decisions and trade-offs in one place",
      "Handoffs linked to the source",
      "Less archaeology between teams",
    ],
  },
  {
    id: "search",
    number: "05",
    label: "Search",
    title: "Find the answer hiding in plain sight.",
    description:
      "Search across code, issues, commits, and docs at once. Start with a phrase, then follow the thread until it makes sense.",
    accent: "charcoal",
    icon: Search,
    bullets: [
      "Semantic search across project history",
      "Filter by type, owner, or recency",
      "Jump from result to useful context",
    ],
  },
];

const workflow = [
  {
    number: "01",
    label: "Connect",
    title: "Point Relay at your GitHub.",
    detail:
      "Select the repositories that matter. Relay indexes the signal, not the noise.",
    icon: Github,
  },
  {
    number: "02",
    label: "Explore",
    title: "Follow the connections.",
    detail:
      "Move from a file to a feature, from a feature to a decision, without losing the thread.",
    icon: Network,
  },
  {
    number: "03",
    label: "Share",
    title: "Turn understanding into momentum.",
    detail:
      "Publish a clear handoff, a guided onboarding path, or an answer your team can trust.",
    icon: ArrowUpRight,
  },
];

function RelayMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`wordmark ${compact ? "wordmark-compact" : ""}`}
      aria-label="Relay"
    >
      <span className="mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="M11.7 17.2 17.2 11.7a3.7 3.7 0 0 1 5.2 5.2l-2.1 2.1"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="m20.3 14.8-5.5 5.5a3.7 3.7 0 0 1-5.2-5.2l2.1-2.1"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="m13.5 18.4 5-5"
            stroke="var(--copper)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!compact && <span>Relay</span>}
    </span>
  );
}

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
  const [activeFeature, setActiveFeature] = useState("context");
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = features.find(feature => feature.id === activeFeature);

  if (!active) {
    return null;
  }

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
      <header className="site-header">
        <a href="#top" className="header-logo" onClick={closeMenu}>
          <RelayMark />
        </a>
        <nav
          className={`main-nav ${mobileOpen ? "main-nav-open" : ""}`}
          aria-label="Primary navigation"
        >
          <a href="#product" onClick={closeMenu}>
            Product
          </a>
          <a href="#workflow" onClick={closeMenu}>
            How it works
          </a>
          <a href="#features" onClick={closeMenu}>
            Features
          </a>
          <a href="#about" onClick={closeMenu}>
            About
          </a>
        </nav>
        <div className="header-actions">
          <a className="text-link hide-mobile" href="#demo">
            Sign in <ArrowUpRight size={14} />
          </a>
          <button
            className="button button-copper button-small"
            onClick={() => scrollTo("demo")}
          >
            Get started <ArrowUpRight size={14} />
          </button>
        </div>
        <button
          className="menu-button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(open => !open)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <section className="hero-section section-wrap" id="top">
        <div className="hero-copy reveal-up">
          <div className="kicker">
            <span className="kicker-line" /> Developer context, without the
            archaeology
          </div>
          <h1>
            Understand any
            <br />
            <span>codebase</span> faster<span className="period">.</span>
          </h1>
          <p className="hero-lede">
            Connect your GitHub repositories, get instant project context, and
            use AI to onboard, search, and handoff — all in one place.
          </p>
          <div className="hero-actions">
            <button
              className="button button-copper"
              onClick={() => scrollTo("demo")}
            >
              Start with your repo <ArrowRight size={15} />
            </button>
            <button
              className="button button-ghost"
              onClick={() => scrollTo("product")}
            >
              <span className="play-icon">
                <Play size={12} fill="currentColor" />
              </span>{" "}
              Watch the idea
            </button>
          </div>
          <div className="hero-metrics">
            <div>
              <b>
                100<span>+</span>
              </b>
              <span>projects indexed</span>
            </div>
            <div>
              <b>
                10k<span>+</span>
              </b>
              <span>questions answered</span>
            </div>
            <div>
              <b>∞</b>
              <span>context retained</span>
            </div>
          </div>
        </div>
        <div className="hero-art reveal-right">
          <HeroDiagram />
        </div>
      </section>

      <section className="ticker-band" aria-label="Relay capabilities">
        <div className="ticker-label">ONE PLACE FOR</div>
        <div className="ticker-items">
          <span>PROJECT CONTEXT</span>
          <i>→</i>
          <span>AI AGENT</span>
          <i>→</i>
          <span>ONBOARDING</span>
          <i>→</i>
          <span>HANDOFF</span>
          <i>→</i>
          <span>SEARCH</span>
        </div>
      </section>

      <section className="overview-section section-wrap" id="product">
        <div className="section-aside">
          <span className="section-number">01</span>
          <span className="vertical-rule" />
          <span className="section-caption">The relay effect</span>
        </div>
        <div className="overview-content">
          <div className="eyebrow">
            PROJECT CONTEXT / A BETTER STARTING POINT
          </div>
          <h2>
            Less time tracing the past.
            <br />
            <em>More time building what’s next.</em>
          </h2>
          <div className="overview-lower">
            <p>
              Most codebases have the answer somewhere. Relay makes the
              somewhere legible — connecting the files, decisions, and
              conversations that explain how a project became what it is.
            </p>
            <a href="#features" className="arrow-link">
              Explore the system <ArrowDown size={15} />
            </a>
          </div>
        </div>
      </section>

      <section className="workflow-section section-wrap" id="workflow">
        <div className="workflow-head">
          <div>
            <div className="eyebrow">HOW IT WORKS / THREE MOVES</div>
            <h2>
              From codebase
              <br />
              <em>to context.</em>
            </h2>
          </div>
          <div className="workflow-note">
            <span className="note-mark">↗</span>
            <p>
              Relay follows the thread so you don’t have to hold the whole
              system in your head.
            </p>
          </div>
        </div>
        <div className="workflow-grid">
          {workflow.map(step => {
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

      <section className="features-section section-wrap" id="features">
        <div className="feature-index-panel">
          <div className="eyebrow">THE RELAY SYSTEM</div>
          <h2>
            Five ways to
            <br />
            <em>keep context.</em>
          </h2>
          <p>
            Select a capability to see how Relay turns repository signal into
            useful momentum.
          </p>
          <div
            className="feature-tabs"
            role="tablist"
            aria-label="Relay capabilities"
          >
            {features.map(feature => {
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
              {active.bullets.map(bullet => (
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

      <section className="dashboard-section section-wrap" id="demo">
        <div className="dashboard-heading">
          <div>
            <div className="eyebrow">A CALMER COMMAND CENTER</div>
            <h2>
              Good context
              <br />
              <em>looks like this.</em>
            </h2>
          </div>
          <div className="dashboard-heading-copy">
            <p>
              One view for the projects you’re learning, the questions you’re
              answering, and the context you’re leaving behind.
            </p>
            <a href="#contact" className="arrow-link">
              Get early access <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
        <DashboardPreview />
      </section>

      <section className="quote-section section-wrap">
        <div className="quote-mark">“</div>
        <blockquote>
          Relay gives the codebase a memory — so every new person can start from
          understanding, not assumptions.
        </blockquote>
        <div className="quote-credit">
          <span className="credit-line" />
          <span>Designed for teams inheriting ambitious software</span>
          <span className="credit-line" />
        </div>
      </section>

      <section className="final-cta section-wrap" id="contact">
        <div className="final-cta-inner">
          <div className="eyebrow">READY WHEN YOU ARE</div>
          <h2>
            Start with
            <br />
            <em>the unknown.</em>
          </h2>
          <p>
            Connect a repository and let Relay show you what’s already there.
          </p>
          <div className="final-actions">
            <button
              className="button button-copper"
              onClick={() => scrollTo("top")}
            >
              Bring your repo <ArrowRight size={15} />
            </button>
            <span className="final-note">
              <span className="live-dot" /> No credit card. Just context.
            </span>
          </div>
        </div>
        <div className="final-diagram">
          <div className="final-grid" />
          <div className="final-node final-node-a">
            <GitBranch size={14} /> repo
          </div>
          <div className="final-node final-node-b">
            <Sparkles size={14} /> context
          </div>
          <div className="final-node final-node-c">
            <ArrowUpRight size={14} /> momentum
          </div>
          <svg viewBox="0 0 460 250" preserveAspectRatio="none">
            <path d="M78 126 H205 L285 70 H395" />
            <path d="M205 126 285 182 H395" />
            <circle cx="205" cy="126" r="6" />
          </svg>
        </div>
      </section>

      <footer className="site-footer section-wrap">
        <div>
          <RelayMark />
          <p>From codebase to context.</p>
        </div>
        <div className="footer-links">
          <a href="#product">Product</a>
          <a href="#workflow">How it works</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="footer-meta">
          <span>© 2026 Relay</span>
          <span>Built for the curious</span>
        </div>
      </footer>
    </main>
  );
}
