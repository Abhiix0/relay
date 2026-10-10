import request from "supertest";
import { ObjectId, type Db } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { onboardingPlanSchema } from "@web-types/types";
import { createSyncRunner } from "../jobs/syncRunner";
import { run } from "../services/analysisService";
import { FakeGithub, FakeLlm } from "../test/fakes";
import { loginAs, makeTestApp, startTestDb, stopTestDb } from "../test/helpers";

let db: Db;
beforeAll(async () => {
  db = await startTestDb();
});
afterAll(stopTestDb);

async function setup() {
  const github = new FakeGithub();
  github.addRepo("acme/widget");
  github.addFile("README.md", "# Widget");
  github.addFile("package.json", JSON.stringify({ scripts: { dev: "tsx" } }));
  github.addFile("src/index.ts", "export {}");
  const llm = new FakeLlm();
  const app = makeTestApp({ db, github, llm });
  const user = await loginAs(db);
  const created = await request(app).post("/api/v1/projects").set("Cookie", user.cookie).send({ fullName: "acme/widget" });
  const id: string = created.body.id;
  const url = `/api/v1/projects/${id}/onboarding`;
  const generate = (cookie = user.cookie) => request(app).post(`${url}/generate`).set("Cookie", cookie).send({});
  const sync = async () => {
    llm.responses.push(new Error("x"), new Error("x")); // analysis + plan fall back to deterministic data
    await createSyncRunner({ db, github, afterSync: ({ projectId, signal }) => run(db, llm, projectId, signal) }).start(
      new ObjectId(id),
    );
  };
  return { app, user, llm, url, generate, sync };
}

const plan = (titles: string[]) => ({
  items: titles.map((title) => ({ title, description: "d", artifactIds: [] as string[] })),
});

describe("POST /onboarding/generate", () => {
  it("is 409 until the first sync has produced an analysis", async () => {
    const s = await setup();
    const res = await s.generate();
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Project has not finished indexing");
  });

  it("regenerates the plan and keeps completion for titles that persist", async () => {
    const s = await setup();
    await s.sync();
    const before = onboardingPlanSchema.parse((await request(s.app).get(s.url).set("Cookie", s.user.cookie)).body);
    expect(before.items.map((i) => i.title)).toContain("Read README.md");
    const readme = before.items.find((i) => i.title === "Read README.md")!;
    await request(s.app)
      .patch(`${s.url}/items/${readme.id}`)
      .set("Cookie", s.user.cookie)
      .send({ completed: true })
      .expect(200);

    s.llm.responses.push(plan(["Read README.md", "Run the dev server", "Tour src", "Add a test", "Open a PR"]));
    const res = await s.generate();
    expect(res.status).toBe(200);
    const after = onboardingPlanSchema.parse(res.body);
    expect(after.items.map((i) => i.title)).toEqual([
      "Read README.md",
      "Run the dev server",
      "Tour src",
      "Add a test",
      "Open a PR",
    ]);
    expect(after.items[0]).toMatchObject({ id: readme.id, completed: true });
    expect(after.items.slice(1).every((i) => !i.completed)).toBe(true);
    // the stored plan is the regenerated one
    const stored = (await request(s.app).get(s.url).set("Cookie", s.user.cookie)).body;
    expect(stored.items).toHaveLength(5);
  });

  it("other users get 404", async () => {
    const s = await setup();
    const other = await loginAs(db);
    const res = await s.generate(other.cookie);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Project not found");
  });
});
