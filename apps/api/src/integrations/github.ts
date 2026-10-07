import { loadConfig } from "../config";

export interface GithubUser {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface GithubRepo {
  id: number;
  full_name: string;
  name: string;
  owner: string;
  description: string | null;
  language: string | null;
  default_branch: string;
  private: boolean;
}

export class GithubAccessError extends Error {
  constructor(readonly status: number) {
    super("GitHub access revoked or rate limited");
    this.name = "GithubAccessError";
  }
}

export interface GithubTreeEntry {
  path: string;
  sha: string;
  size: number;
}
export interface GithubCommit {
  sha: string;
  message: string;
  url: string;
  authorName: string;
  date: Date;
}
export interface GithubThread {
  number: number;
  title: string;
  body: string;
  url: string;
  state: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface GithubReadme {
  path: string;
  content: string;
  url: string;
}

export interface GithubClient {
  buildAuthorizeUrl(state: string): string;
  exchangeCode(code: string): Promise<string>;
  getUser(token: string): Promise<GithubUser>;
  getPrimaryEmail(token: string): Promise<string | null>;
  getRepo(token: string, fullName: string): Promise<GithubRepo | null>;
  /** blobs only */
  getTree(token: string, full: string, branch: string): Promise<GithubTreeEntry[]>;
  /** decoded text, or null when the blob is binary */
  getBlob(token: string, full: string, sha: string): Promise<string | null>;
  listCommits(token: string, full: string, limit: number): Promise<GithubCommit[]>;
  /** excludes pull requests */
  listIssues(token: string, full: string, limit: number): Promise<GithubThread[]>;
  listPulls(token: string, full: string, limit: number): Promise<GithubThread[]>;
  getReadme(token: string, full: string): Promise<GithubReadme | null>;
  countCommits(token: string, full: string): Promise<number>;
  countReleases(token: string, full: string): Promise<number>;
  searchCount(token: string, full: string, kind: "issue" | "pr"): Promise<number>;
}

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "relay-api",
});

async function getJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, { headers: headers(token) });
  return (await check(res)).json() as Promise<T>;
}

async function check(res: Response): Promise<Response> {
  if (res.status === 401 || res.status === 403) throw new GithubAccessError(res.status);
  if (!res.ok) throw new Error(`GitHub request failed: ${res.status}`);
  return res;
}

const API = "https://api.github.com";

/** per_page=1 trick: the last page number in the Link header is the total count. */
async function countViaLink(url: string, token: string): Promise<number> {
  const res = await check(await fetch(url, { headers: headers(token) }));
  const last = /[?&]page=(\d+)>; rel="last"/.exec(res.headers.get("link") ?? "");
  if (last) return Number(last[1]);
  return ((await res.json()) as unknown[]).length;
}

interface RawThread {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: string;
  created_at: string;
  updated_at: string;
  pull_request?: unknown;
}
const toThread = (t: RawThread): GithubThread => ({
  number: t.number,
  title: t.title,
  body: t.body ?? "",
  url: t.html_url,
  state: t.state,
  createdAt: new Date(t.created_at),
  updatedAt: new Date(t.updated_at),
});

export function createGithubClient(): GithubClient {
  return {
    buildAuthorizeUrl(state) {
      const c = loadConfig();
      const u = new URL("https://github.com/login/oauth/authorize");
      u.searchParams.set("client_id", c.GITHUB_CLIENT_ID);
      u.searchParams.set("scope", c.GITHUB_SCOPE);
      u.searchParams.set("state", state);
      return u.toString();
    },
    async exchangeCode(code) {
      const c = loadConfig();
      const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: c.GITHUB_CLIENT_ID,
          client_secret: c.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      if (!res.ok) throw new Error(`GitHub token exchange failed: ${res.status}`);
      const body = (await res.json()) as { access_token?: string };
      if (!body.access_token) throw new Error("GitHub token exchange returned no token");
      return body.access_token;
    },
    async getUser(token) {
      const u = await getJson<{
        id: number;
        login: string;
        name: string | null;
        avatar_url: string | null;
      }>("https://api.github.com/user", token);
      return { id: u.id, login: u.login, name: u.name, avatarUrl: u.avatar_url };
    },
    async getPrimaryEmail(token) {
      const emails = await getJson<{ email: string; primary: boolean; verified: boolean }[]>(
        "https://api.github.com/user/emails",
        token,
      );
      return emails.find((e) => e.primary && e.verified)?.email ?? null;
    },
    async getRepo(token, fullName) {
      const res = await fetch(`https://api.github.com/repos/${fullName}`, {
        headers: headers(token),
      });
      if (res.status === 404) return null;
      await check(res);
      const r = (await res.json()) as {
        id: number;
        full_name: string;
        name: string;
        owner: { login: string };
        description: string | null;
        language: string | null;
        default_branch: string;
        private: boolean;
      };
      return {
        id: r.id,
        full_name: r.full_name,
        name: r.name,
        owner: r.owner.login,
        description: r.description,
        language: r.language,
        default_branch: r.default_branch,
        private: r.private,
      };
    },
    async getTree(token, full, branch) {
      const t = await getJson<{
        tree: { path: string; type: string; sha: string; size?: number }[];
      }>(`${API}/repos/${full}/git/trees/${encodeURIComponent(branch)}?recursive=1`, token);
      return t.tree
        .filter((e) => e.type === "blob")
        .map((e) => ({ path: e.path, sha: e.sha, size: e.size ?? 0 }));
    },
    async getBlob(token, full, sha) {
      const b = await getJson<{ content: string }>(`${API}/repos/${full}/git/blobs/${sha}`, token);
      const buf = Buffer.from(b.content, "base64");
      return buf.includes(0) ? null : buf.toString("utf8");
    },
    async listCommits(token, full, limit) {
      const raw = await getJson<
        {
          sha: string;
          html_url: string;
          commit: { message: string; author: { name: string; date: string } | null };
        }[]
      >(`${API}/repos/${full}/commits?per_page=${limit}`, token);
      return raw.map((c) => ({
        sha: c.sha,
        message: c.commit.message,
        url: c.html_url,
        authorName: c.commit.author?.name ?? "unknown",
        date: new Date(c.commit.author?.date ?? 0),
      }));
    },
    async listIssues(token, full, limit) {
      const raw = await getJson<RawThread[]>(
        `${API}/repos/${full}/issues?state=all&per_page=${limit}`,
        token,
      );
      return raw.filter((t) => !t.pull_request).map(toThread);
    },
    async listPulls(token, full, limit) {
      const raw = await getJson<RawThread[]>(
        `${API}/repos/${full}/pulls?state=all&per_page=${limit}`,
        token,
      );
      return raw.map(toThread);
    },
    async getReadme(token, full) {
      const res = await fetch(`${API}/repos/${full}/readme`, { headers: headers(token) });
      if (res.status === 404) return null;
      await check(res);
      const r = (await res.json()) as { path: string; content: string; html_url: string };
      return {
        path: r.path,
        content: Buffer.from(r.content, "base64").toString("utf8"),
        url: r.html_url,
      };
    },
    countCommits: (token, full) => countViaLink(`${API}/repos/${full}/commits?per_page=1`, token),
    countReleases: (token, full) =>
      countViaLink(`${API}/repos/${full}/releases?per_page=1`, token),
    async searchCount(token, full, kind) {
      const q = encodeURIComponent(`repo:${full} type:${kind}`);
      const r = await getJson<{ total_count: number }>(
        `${API}/search/issues?q=${q}&per_page=1`,
        token,
      );
      return r.total_count;
    },
  };
}
