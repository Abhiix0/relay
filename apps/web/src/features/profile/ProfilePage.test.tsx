import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import * as apiHooks from "@/lib/api/hooks";
import { ProfilePage } from "./ProfilePage";

vi.mock("@/lib/api/hooks", async () => {
  const actual = await vi.importActual<typeof apiHooks>("@/lib/api/hooks");
  return {
    ...actual,
    useCurrentUser: vi.fn(),
    useProjects: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  };
});

describe("ProfilePage", () => {
  it("renders user details when data is present", () => {
    vi.mocked(apiHooks.useCurrentUser).mockReturnValue({
      data: {
        id: "usr-1",
        name: "Ada Lovelace",
        email: "ada@relay.dev",
        githubLogin: "adalovelace",
        avatarUrl: "https://example.com/avatar.jpg",
      },
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useCurrentUser>);

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    expect(screen.getByText("Developer Profile")).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@relay.dev")).toBeInTheDocument();
    expect(screen.getByText(/@adalovelace/)).toBeInTheDocument();
  });

  it("handles missing user profile gracefully", () => {
    vi.mocked(apiHooks.useCurrentUser).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof apiHooks.useCurrentUser>);

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    expect(screen.getByText("Developer Profile")).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();
  });
});
