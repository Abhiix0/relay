import request from "supertest";
import { ObjectId, type Db } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { activityEventSchema, onboardingDataSchema, onboardingPlanSchema } from "@web-types/types";
import { getCollections } from "../db/collections";
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
  github.addFile("package.json", JSON.stringify({ dependencies: { express: "1", zod: "1" }, scripts: { dev: "tsx watch", test: "vitest" } }));
  github.addFile("src/index.ts", "export {}");
  github.addFile("src/util/a.ts", "export {}");
  github.addFile("docs/x.md", "doc");
  const app = makeTestApp({ db, github });
  const user = await loginAs(db);
  const created = await request(app).post("/api/v1/projects").set("Cookie", user.cookie).send({ fullName: "acme/widget" });
  const id: string = created.body.id;
  const pid = new ObjectId(id);
  const get = (p: string) => request(app).get(`/api/v1/projects/${id}${p}`).set("Cookie", user.cookie);
  const sync = async (afterSync: Parameters<typeof createSyncRunner>[0]["afterSync"]) => {
    await request(app).post(`/api/v1/projects/${id}/sync`).set("Cookie", user.cookie).send({});
    await createSyncRunner({ db, github, afterSync }).start(pid);
  };
  const syncWith = (llm: FakeLlm) => sync(({ projectId, signal }) => run(db, llm, projectId, signal));
  return { app, user, id, pid, get, sync, syncWith };
}

const goodAnalysis = {
  summary: "A widget service.",
  modules: [
    { path: "src", description: "Application code" },
    { path: "ghost", description: "does not exist" },
  ],
  steps: [{ title: "Start dev", description: "Run the dev script" }],
};
const goodPlan = (user: string) => ({
  items: Array.from({ length: 5 }, (_, i) => ({
    title: `Step ${i}`,
    description: "d",
    artifactIds: i === 0 ? [user.split(" ")[0], "bogus", "aaaaaaaaaaaaaaaaaaaaaaaa"] : [],
  })),
});

describe("onboarding", () => {
  it("returns pending shapes before any analysis", async () => {
    const s = await setup();
    const data = onboardingDataSchema.parse((await s.get("/onboarding/data")).body);
    expect(data).toMatchObject({
      id: "pending",
      keyFiles: [],
      gettingStarted: [],
      architecture: { mainModules: [] },
      progress: { repositoryConnected: true, structureAnalyzed: false, handoffReady: false },
    });
    const plan = onboardingPlanSchema.parse((await s.get("/onboarding")).body);
    expect(plan).toMatchObject({ id: "pending", title: "Onboarding plan", items: [] });
    expect(await getCollections(db).onboardingPlans.countDocuments({ projectId: s.pid })).toBe(0);
  });

  it("falls back to deterministic data when the LLM fails", async () => {
    const s = await setup();
    const llm = new FakeLlm();
    llm.responses.push(new Error("x"), new Error("x"));
    await s.syncWith(llm);
    const data = onboardingDataSchema.parse((await s.get("/onboarding/data")).body);
    expect(data.id).not.toBe("pending");
    expect(data.progress).toMatchObject({ repositoryIndexed: true, structureAnalyzed: true });
    expect(data.projectOverview.technologies).toEqual(expect.arrayContaining(["express", "zod", "Markdown"]));
    expect(data.keyFiles.map((k) => [k.path, k.category])).toEqual([
      ["README.md", "readme"],
      ["package.json", "config"],
      ["src/index.ts", "entry"],
    ]);
    expect(data.architecture.mainModules).toEqual(
      expect.arrayContaining([{ name: "src", path: "src", description: "2 files" }]),
    );
    expect(data.gettingStarted.map((g) => g.title)).toEqual(['Run "dev"', 'Run "test"']);
    const plan = onboardingPlanSchema.parse((await s.get("/onboarding")).body);
    expect(plan.items.map((i) => i.title)).toEqual(["Read README.md", "Read package.json", "Read src/index.ts"]);
    expect(plan.items.every((i) => i.artifactIds.length === 1)).toBe(true);
  });

  it("drops unknown LLM paths and artifact ids", async () => {
    const s = await setup();
    const llm = new FakeLlm();
    llm.responses.push(goodAnalysis, goodPlan);
    await s.syncWith(llm);
    const data = onboardingDataSchema.parse((await s.get("/onboarding/data")).body);
    expect(data.architecture.summary).toBe("A widget service.");
    expect(data.architecture.mainModules.find((m) => m.path === "src")?.description).toBe("Application code");
    expect(data.architecture.mainModules.some((m) => m.path === "ghost")).toBe(false);
    expect(data.gettingStarted).toEqual([{ step: 1, title: "Start dev", description: "Run the dev script" }]);
    const plan = onboardingPlanSchema.parse((await s.get("/onboarding")).body);
    expect(plan.items).toHaveLength(5);
    expect(plan.items[0]!.artifactIds).toEqual([data.keyFiles[0]!.id]);
  });

  it("does not regenerate the plan on a second sync", async () => {
    const s = await setup();
    const llm = new FakeLlm();
    llm.responses.push(goodAnalysis, goodPlan, goodAnalysis);
    await s.syncWith(llm);
    const first = (await s.get("/onboarding")).body;
    await s.syncWith(llm);
    expect(llm.calls).toHaveLength(3);
    expect((await s.get("/onboarding")).body).toEqual(first);
  });

  it("sync succeeds when analysis throws", async () => {
    const s = await setup();
    await s.sync(async () => {
      throw new Error("boom");
    });
    const p = await getCollections(db).projects.findOne({ _id: s.pid });
    expect(p?.syncStatus).toBe("succeeded");
  });

  it("toggles an item, logs activity once, 404s unknown items", async () => {
    const s = await setup();
    await s.syncWith(Object.assign(new FakeLlm(), { responses: [new Error("x"), new Error("x")] }));
    const plan = (await s.get("/onboarding")).body;
    const itemId: string = plan.items[0].id;
    const patch = (id: string, body: unknown, cookie = s.user.cookie) =>
      request(s.app).patch(`/api/v1/projects/${s.id}/onboarding/items/${id}`).set("Cookie", cookie).send(body as object);

    const done = await patch(itemId, { completed: true });
    expect(done.status).toBe(200);
    expect(onboardingPlanSchema.parse(done.body).items[0]!.completed).toBe(true);
    expect((await s.get("/onboarding")).body.items[0].completed).toBe(true);
    await patch(itemId, { completed: true });
    await patch(itemId, { completed: false });
    expect(((await patch(itemId, { completed: false })).body.items[0]).completed).toBe(false);

    const act = (await s.get("/activity")).body.filter((e: { type: string }) => e.type === "onboarding");
    expect(act).toHaveLength(1);
    activityEventSchema.array().parse(act);

    const missing = await patch("nope", { completed: true });
    expect(missing.status).toBe(404);
    expect(missing.body.message).toBe("Onboarding item not found");
    expect((await patch(itemId, { completed: "yes" })).status).toBe(422);
  });
});
