import type { GithubClient, GithubUser } from "../integrations/github";

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
}
