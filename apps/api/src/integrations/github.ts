import { loadConfig } from "../config";

export interface GithubUser {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface GithubClient {
  buildAuthorizeUrl(state: string): string;
  exchangeCode(code: string): Promise<string>;
  getUser(token: string): Promise<GithubUser>;
  getPrimaryEmail(token: string): Promise<string | null>;
}

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "relay-api",
});

async function getJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, { headers: headers(token) });
  if (!res.ok) throw new Error(`GitHub request failed: ${res.status}`);
  return (await res.json()) as T;
}

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
  };
}
