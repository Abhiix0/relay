import type { GithubClient, GithubRepo, GithubUser } from "../integrations/github";

export const FAKE_TOKEN = "gho_fake_secret_token";

export class FakeGithub implements GithubClient {
  profile: GithubUser = {
    id: 4242,
    login: "octo",
    name: "Octo Cat",
    avatarUrl: "https://avatars.example.com/u/4242",
  };
  email: string | null = "octo@example.com";

  buildAuthorizeUrl(state: string): string {
    return `https://github.com/login/oauth/authorize?state=${state}`;
  }
  async exchangeCode(code: string): Promise<string> {
    if (code === "bad") throw new Error("exchange failed");
    return FAKE_TOKEN;
  }
  async getUser(): Promise<GithubUser> {
    return this.profile;
  }
  async getPrimaryEmail(): Promise<string | null> {
    return this.email;
  }

  /** keyed by lowercase full name; absent => 404 */
  repos = new Map<string, GithubRepo>();
  addRepo(fullName: string, overrides: Partial<GithubRepo> = {}): GithubRepo {
    const [owner = "", name = ""] = fullName.split("/");
    const repo: GithubRepo = {
      id: Math.floor(Math.random() * 1e9),
      full_name: fullName,
      name,
      owner,
      description: "A test repo",
      language: "Rust",
      default_branch: "main",
      private: false,
      ...overrides,
    };
    this.repos.set(fullName.toLowerCase(), repo);
    return repo;
  }
  async getRepo(_token: string, fullName: string): Promise<GithubRepo | null> {
    return this.repos.get(fullName.toLowerCase()) ?? null;
  }
}
