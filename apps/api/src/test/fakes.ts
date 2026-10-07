import type {
  GithubClient,
  GithubCommit,
  GithubReadme,
  GithubRepo,
  GithubThread,
  GithubTreeEntry,
  GithubUser,
} from "../integrations/github";

export const FAKE_TOKEN = "gho_fake_secret_token";

export class FakeGithub implements GithubClient {
  profile: GithubUser = {
    id: 4242,
    login: "octo",
    name: "Octo Cat",
    avatarUrl: "https://avatars.example.com/u/4242",
  };
  email: string | null = "octo@example.com";

  /** scope GitHub reports as granted */
  grantedScope = "read:user public_repo";
  /** redirect_uri passed to exchangeCode */
  exchangeRedirectUri: string | null = null;
  emailThrows = false;

  buildAuthorizeUrl(state: string, redirectUri: string): string {
    return `https://github.com/login/oauth/authorize?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  }
  async exchangeCode(
    code: string,
    redirectUri: string,
  ): Promise<{ accessToken: string; scope: string }> {
    this.exchangeRedirectUri = redirectUri;
    if (code === "bad") throw new Error("exchange failed");
    return { accessToken: FAKE_TOKEN, scope: this.grantedScope };
  }
  async getUser(): Promise<GithubUser> {
    return this.profile;
  }
  async getPrimaryEmail(): Promise<string | null> {
    if (this.emailThrows) throw new Error("emails down");
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
    this.maybeFail("getRepo");
    return this.repos.get(fullName.toLowerCase()) ?? null;
  }

  /** path -> text content, or null for a binary file */
  files = new Map<string, { content: string | null; size: number }>();
  commits: GithubCommit[] = [];
  issues: GithubThread[] = [];
  pulls: GithubThread[] = [];
  readme: GithubReadme | null = null;
  counts = { commits: 0, releases: 0, issue: 0, pr: 0 };
  /** make the named call throw */
  failOn: string | null = null;
  failWith: Error = new Error("boom");
  /** getTree waits on this before answering */
  gate: Promise<void> | null = null;

  addFile(path: string, content: string | null, size?: number): void {
    this.files.set(path, { content, size: size ?? Buffer.byteLength(content ?? "x") });
  }
  private maybeFail(name: string): void {
    if (this.failOn === name) throw this.failWith;
  }
  truncated = false;
  /** shas passed to getBlob */
  blobCalls: string[] = [];
  async getTree(): Promise<{ entries: GithubTreeEntry[]; truncated: boolean }> {
    if (this.gate) await this.gate;
    this.maybeFail("getTree");
    return {
      entries: [...this.files].map(([path, f]) => ({ path, sha: `sha:${path}`, size: f.size })),
      truncated: this.truncated,
    };
  }
  async getBlob(_t: string, _f: string, sha: string): Promise<string | null> {
    this.blobCalls.push(sha);
    this.maybeFail("getBlob");
    return this.files.get(sha.slice(4))?.content ?? null;
  }
  async listCommits(): Promise<GithubCommit[]> {
    this.maybeFail("listCommits");
    return this.commits;
  }
  async listIssues(): Promise<GithubThread[]> {
    this.maybeFail("listIssues");
    return this.issues;
  }
  async listPulls(): Promise<GithubThread[]> {
    this.maybeFail("listPulls");
    return this.pulls;
  }
  async getReadme(): Promise<GithubReadme | null> {
    return this.readme;
  }
  async countCommits(): Promise<number> {
    this.maybeFail("countCommits");
    return this.counts.commits;
  }
  async countReleases(): Promise<number> {
    return this.counts.releases;
  }
  async searchCount(_t: string, _f: string, kind: "issue" | "pr"): Promise<number> {
    return this.counts[kind];
  }
}
