import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DecisionCard } from "./DecisionCard";

const base = {
  id: "d1",
  projectId: "p1",
  title: "ADR-001",
  summary: "Use Rust",
  rationale: "",
  sources: [],
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("DecisionCard", () => {
  it("shows a placeholder when the rationale is empty", () => {
    render(<DecisionCard decision={base} />);
    expect(screen.getByText("No rationale recorded")).toBeInTheDocument();
  });

  it("shows the rationale when present", () => {
    render(<DecisionCard decision={{ ...base, rationale: "GC pauses" }} />);
    expect(screen.getByText("GC pauses")).toBeInTheDocument();
    expect(screen.queryByText("No rationale recorded")).toBeNull();
  });
});
