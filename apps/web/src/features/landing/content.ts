/**
 * Landing page content — all copy, data arrays, and icon mappings.
 * Frozen with 'as const' to ensure type safety and prevent mutations.
 */

import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BookOpen,
  GitBranch,
  GitPullRequest,
  Github,
  Network,
  Search,
  Sparkles,
} from "lucide-react";

export type Feature = {
  readonly id: string;
  readonly number: string;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly accent: string;
  readonly icon: LucideIcon;
  readonly bullets: readonly string[];
};

export type WorkflowStep = {
  readonly number: string;
  readonly label: string;
  readonly title: string;
  readonly detail: string;
  readonly icon: LucideIcon;
};

export const features = [
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
] as const satisfies readonly Feature[];

export const workflow = [
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
] as const satisfies readonly WorkflowStep[];

export const heroContent = {
  kicker: "Developer context, without the archaeology",
  title: {
    line1: "Understand any",
    highlight: "codebase",
    line2: "faster",
  },
  lede: "Connect your GitHub repositories, get instant project context, and use AI to onboard, search, and handoff — all in one place.",
  cta: {
    primary: "Start with your repo",
  },
  metrics: [
    { value: "100", suffix: "+", label: "projects indexed" },
    { value: "10k", suffix: "+", label: "questions answered" },
    { value: "∞", suffix: "", label: "context retained" },
  ],
} as const;

export const overviewContent = {
  sectionNumber: "01",
  sectionCaption: "The relay effect",
  eyebrow: "PROJECT CONTEXT / A BETTER STARTING POINT",
  title: {
    line1: "Less time tracing the past.",
    line2: "More time building what's next.",
  },
  body: "Most codebases have the answer somewhere. Relay makes the somewhere legible — connecting the files, decisions, and conversations that explain how a project became what it is.",
  linkText: "Explore the system",
} as const;

export const workflowContent = {
  title: {
    line1: "From codebase",
    line2: "to context.",
  },
  note: "Relay follows the thread so you don't have to hold the whole system in your head.",
} as const;

export const featuresContent = {
  eyebrow: "THE RELAY SYSTEM",
  title: {
    line1: "Five ways to",
    line2: "keep context.",
  },
  intro:
    "Select a capability to see how Relay turns repository signal into useful momentum.",
} as const;

export const dashboardContent = {
  title: {
    line1: "Good context",
    line2: "looks like this.",
  },
  body: "One view for the projects you're learning, the questions you're answering, and the context you're leaving behind.",
} as const;

export const finalCtaContent = {
  title: {
    line1: "Start with",
    line2: "the unknown.",
  },
  body: "Connect a repository and let Relay show you what's already there.",
  cta: "Bring your repo",
} as const;

export const footerContent = {
  tagline: "From codebase to context.",
  meta: {
    copyright: "© 2026 Relay",
    tagline: "Built for the curious",
  },
} as const;

export const navLinks = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#workflow" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#demo" },
] as const;

export const tickerItems = [
  "PROJECT CONTEXT",
  "AI AGENT",
  "ONBOARDING",
  "HANDOFF",
  "SEARCH",
] as const;
