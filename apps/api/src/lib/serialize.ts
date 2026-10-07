import type { UserDoc } from "../db/collections";

export const iso = (d: Date): string => d.toISOString();

export const toUser = (u: UserDoc) => ({
  id: u._id.toHexString(),
  email: u.email,
  name: u.name,
  avatarUrl: u.avatarUrl,
  githubLogin: u.githubLogin,
  createdAt: iso(u.createdAt),
});
