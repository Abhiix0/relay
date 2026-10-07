import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SignInCard } from "./SignInCard";

describe("SignInCard", () => {
  it("shows the banner for ?error=oauth_failed", () => {
    render(
      <MemoryRouter initialEntries={["/sign-in?error=oauth_failed"]}>
        <SignInCard />
      </MemoryRouter>
    );
    expect(screen.getByRole("alert").textContent).toBe(
      "GitHub sign-in failed. Please try again."
    );
  });

  it("shows no banner without the error param", () => {
    render(
      <MemoryRouter initialEntries={["/sign-in"]}>
        <SignInCard />
      </MemoryRouter>
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
