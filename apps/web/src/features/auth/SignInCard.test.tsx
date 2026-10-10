import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { SignInCard } from "./SignInCard";

vi.mock("./api", () => ({
  signInSchema: {
    safeParse: (data: { email?: string; password?: string }) => {
      if (!data.email || !data.password) {
        return {
          success: false,
          error: {
            issues: [
              { path: ["email"], message: "Email is required" },
              { path: ["password"], message: "Password is required" },
            ],
          },
        };
      }
      return { success: true, data };
    },
  },
  signInWithEmail: vi.fn(),
  signInWithGithub: vi.fn(),
}));

describe("SignInCard", () => {
  it("renders welcome back heading and github sign-in button", () => {
    render(
      <BrowserRouter>
        <SignInCard />
      </BrowserRouter>
    );

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByText("Continue with GitHub")).toBeInTheDocument();
  });

  it("shows validation error on empty form submit", async () => {
    render(
      <BrowserRouter>
        <SignInCard />
      </BrowserRouter>
    );

    const submitBtn = screen.getByRole("button", { name: "Sign in" });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
  });
});
