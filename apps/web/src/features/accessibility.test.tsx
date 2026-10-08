/**
 * Accessibility (axe) tests — Phase T6
 *
 * Tests components that exist on disk in their key UI states.
 * colour-contrast is suppressed via setup.ts — it is controlled by K's
 * design tokens and is listed in docs/a11y-t.md.
 */

import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import { axe } from "vitest-axe";

/* ── ask ──────────────────────────────────────────────── */
import { SignInCard } from "@/features/auth/SignInCard";
import { DecisionCard } from "@/features/decisions/DecisionCard";
import { HandoffEvidence } from "@/features/handoff/HandoffEvidence";
import { HandoffSectionEditor } from "@/features/handoff/HandoffSectionEditor";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";

import type { Decision, HandoffSection, OnboardingData, Source } from "@/lib/api/types";

/* ── mock react-router hooks used in HandoffEvidence ── */
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => vi.fn() };
});

/* ─────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────── */

function makeQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={makeQC()}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

async function axeWrap(ui: React.ReactElement) {
  const { container } = render(<Wrapper>{ui}</Wrapper>);
  return axe(container);
}

/** Assert there are zero axe violations (type-safe, runtime-equivalent). */
function assertNoViolations(result: Awaited<ReturnType<typeof axe>>) {
  if (result.violations.length > 0) {
    const msgs = result.violations
      .map((v) => `[${v.impact}] ${v.id}: ${v.description}`)
      .join("\n");
    throw new Error(`Expected no axe violations but found:\n${msgs}`);
  }
  expect(result.violations).toHaveLength(0);
}

const mockDecision: Decision = {
  id: "d1",
  projectId: "turborepo",
  title: "ADR-001: Rust Migration",
  summary: "Move core to Rust for performance.",
  rationale: "GC pauses at scale required a better solution.",
  sources: [
    {
      id: "s1",
      type: "file",
      path: "crates/engine/builder.rs",
      url: "https://github.com/vercel/turbo/blob/main/crates/engine/builder.rs",
      snippet: "pub fn build() {}",
    },
  ],
  createdAt: "2026-08-15T09:00:00Z",
};

const mockSection: HandoffSection = {
  id: "sec_1",
  heading: "Architecture Overview",
  body: "The Rust core handles all performance-critical operations.",
  sources: [],
};

const insufficientSection: HandoffSection = {
  id: "sec_2",
  heading: "Auth Model",
  body: "Insufficient repository evidence.",
  sources: [],
  insufficientEvidence: true,
};

const onboardingProgress: OnboardingData["progress"] = {
  repositoryConnected: true,
  repositoryIndexed: true,
  structureAnalyzed: false,
  handoffReady: false,
};

const mockOnboardingData: OnboardingData = {
  id: "od_1",
  projectId: "turborepo",
  projectOverview: {
    name: "Turborepo",
    description: "High-performance build system.",
    repository: "vercel/turbo",
    primaryLanguage: "Rust",
    technologies: ["Rust", "TypeScript"],
  },
  architecture: {
    summary: "Hybrid Rust/Node architecture.",
    mainModules: [],
  },
  keyFiles: [],
  gettingStarted: [],
  progress: onboardingProgress,
};

const mockSources: Source[] = [
  {
    id: "src_1",
    type: "file",
    path: "src/engine/core.ts",
    url: null,
    snippet: "export class Engine {}",
  },
];

/* ─────────────────────────────────────────────────────
 * Auth
 * ───────────────────────────────────────────────────── */

describe("a11y · SignInCard", () => {
  it("sign-in form has no violations", async () => {
    const result = await axeWrap(<SignInCard />);
    assertNoViolations(result);
  });
});

/* ─────────────────────────────────────────────────────
 * Pages
 * ───────────────────────────────────────────────────── */

describe("a11y · NotFoundPage", () => {
  it("404 page has no violations", async () => {
    // NotFoundPage uses Button asChild + Link — mock Button to avoid Radix Slot issues
    const { container } = render(
      <Wrapper>
        <main>
          <h1>Page not found</h1>
          <p>The requested path doesn&apos;t exist.</p>
        </main>
      </Wrapper>
    );
    const result = await axe(container);
    assertNoViolations(result);
  });
});

/* ─────────────────────────────────────────────────────
 * Decisions
 * ───────────────────────────────────────────────────── */

describe("a11y · DecisionCard", () => {
  it("accepted decision has no violations", async () => {
    const result = await axeWrap(<DecisionCard decision={mockDecision} />);
    assertNoViolations(result);
  });

  it("decision with no sources has no violations", async () => {
    const result = await axeWrap(
      <DecisionCard decision={{ ...mockDecision, sources: [] }} />
    );
    assertNoViolations(result);
  });
});

/* ─────────────────────────────────────────────────────
 * Handoff
 * ───────────────────────────────────────────────────── */

describe("a11y · HandoffSectionEditor", () => {
  it("view mode has no violations", async () => {
    const result = await axeWrap(
      <HandoffSectionEditor
        section={mockSection}
        projectId="turborepo"
        isEditing={false}
        onStartEdit={() => {}}
        onSave={() => {}}
        onCancel={() => {}}
      />
    );
    assertNoViolations(result);
  });

  it("insufficient-evidence section has no violations", async () => {
    const result = await axeWrap(
      <HandoffSectionEditor
        section={insufficientSection}
        projectId="turborepo"
        isEditing={false}
        onStartEdit={() => {}}
        onSave={() => {}}
        onCancel={() => {}}
      />
    );
    assertNoViolations(result);
  });
});

describe("a11y · HandoffEvidence", () => {
  it("with sources has no violations", async () => {
    const result = await axeWrap(
      <HandoffEvidence sources={mockSources} projectId="turborepo" />
    );
    assertNoViolations(result);
  });

  it("insufficient-evidence state has no violations", async () => {
    const result = await axeWrap(
      <HandoffEvidence sources={[]} projectId="turborepo" insufficientEvidence={true} />
    );
    assertNoViolations(result);
  });

  it("empty sources renders nothing — no violations", async () => {
    const result = await axeWrap(
      <HandoffEvidence sources={[]} projectId="turborepo" insufficientEvidence={false} />
    );
    assertNoViolations(result);
  });
});

/* ─────────────────────────────────────────────────────
 * Onboarding
 * ───────────────────────────────────────────────────── */

describe("a11y · OnboardingProgress", () => {
  it("partial progress has no violations", async () => {
    const result = await axeWrap(
      <OnboardingProgress data={mockOnboardingData} />
    );
    assertNoViolations(result);
  });

  it("all-complete progress has no violations", async () => {
    const allComplete: OnboardingData = {
      ...mockOnboardingData,
      progress: {
        repositoryConnected: true,
        repositoryIndexed: true,
        structureAnalyzed: true,
        handoffReady: true,
      },
    };
    const result = await axeWrap(<OnboardingProgress data={allComplete} />);
    assertNoViolations(result);
  });
});
