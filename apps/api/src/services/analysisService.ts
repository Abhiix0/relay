import { ObjectId, type Db } from "mongodb";
import type { Logger } from "pino";
import { z } from "zod";
import { getCollections, type ProjectAnalysisDoc } from "../db/collections";
import type { LlmClient } from "../integrations/llm";
import { isObjectIdHex } from "../lib/ids";

type KeyFile = ProjectAnalysisDoc["keyFiles"][number];

const MANIFESTS = ["package.json", "Cargo.toml", "pyproject.toml", "go.mod"];
const CONFIGS = new Set([...MANIFESTS, "tsconfig.json", "Dockerfile", "docker-compose.yml", "Makefile"]);
const DESCRIPTIONS: Record<KeyFile["category"], string> = {
  readme: "Project documentation",
  config: "Build and configuration",
  entry: "Application entry point",
  important: "Contributor guidance",
};

const analysisSchema = z.object({
  summary: z.string().trim().max(1000),
  modules: z.array(z.object({ path: z.string(), description: z.string().trim().max(300) })).max(20),
  steps: z.array(z.object({ title: z.string().trim().min(1).max(120), description: z.string().trim().max(500) })).max(8),
});
const planSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(200),
        description: z.string().trim().max(1000),
        artifactIds: z.array(z.string()).max(10),
      }),
    )
    .min(5)
    .max(8),
});

/** shortcut: manifests are parsed at the repo root only, monorepo packages are not read; upgrade if needed. */
function manifestDeps(name: string, text: string): string[] {
  try {
    if (name === "package.json") {
      const j = JSON.parse(text) as { dependencies?: object; devDependencies?: object };
      return Object.keys({ ...j.dependencies, ...j.devDependencies });
    }
    if (name === "Cargo.toml") {
      const sec = /\[(?:dev-|build-)?dependencies\]([\s\S]*?)(?=\n\[|$)/g;
      return [...text.matchAll(sec)].flatMap((m) => [...(m[1] ?? "").matchAll(/^\s*([\w-]+)\s*=/gm)].map((k) => k[1]!));
    }
    if (name === "pyproject.toml") {
      const arr = /^dependencies\s*=\s*\[([\s\S]*?)\]/m.exec(text)?.[1] ?? "";
      return [...arr.matchAll(/["']([A-Za-z0-9_.-]+)/g)].map((k) => k[1]!);
    }
    const req = [...text.matchAll(/^\s*(?:require\s+)?([\w.-]+\.[\w.-]+\/[^\s]+)\s+v/gm)];
    return req.map((m) => m[1]!.split("/").slice(-1)[0]!);
  } catch {
    return [];
  }
}

function manifestSteps(text: string): ProjectAnalysisDoc["gettingStarted"] {
  try {
    const scripts = (JSON.parse(text) as { scripts?: Record<string, string> }).scripts ?? {};
    return ["dev", "start", "build", "test"]
      .filter((s) => typeof scripts[s] === "string")
      .map((s, i) => ({ step: i + 1, title: `Run "${s}"`, description: `package.json script: ${scripts[s]}` }));
  } catch {
    return [];
  }
}

function classify(path: string): KeyFile["category"] | null {
  if (/^readme(\.[a-z]+)?$/i.test(path)) return "readme";
  if (CONFIGS.has(path)) return "config";
  if (/^(src\/)?(index|main|app|server)\.[a-z]+$/.test(path) || /^(cmd\/.*\/)?main\.(go|rs)$/.test(path)) return "entry";
  if (/^(contributing|architecture)(\.[a-z]+)?$/i.test(path)) return "important";
  return null;
}

const ORDER = ["readme", "config", "entry", "important"] as const;

export async function run(
  db: Db,
  llm: LlmClient | undefined,
  projectId: ObjectId,
  signal: AbortSignal,
  logger?: Logger,
): Promise<void> {
  const c = getCollections(db);
  const project = await c.projects.findOne({ _id: projectId });
  if (!project || signal.aborted) return;
  const gen = project.syncGeneration;

  const files = await c.repoFiles.find({ projectId, gen }, { projection: { path: 1, language: 1 } }).toArray();
  const paths = new Set(files.map((f) => f.path));
  const read = async (p: string): Promise<string> =>
    paths.has(p) ? ((await c.repoFiles.findOne({ projectId, gen, path: p }))?.content ?? "") : "";

  // technologies: top 12 manifest dependency names + top 5 languages by file count
  const manifestName = MANIFESTS.find((m) => paths.has(m));
  const manifest = manifestName ? await read(manifestName) : "";
  const deps = manifestName ? [...new Set(manifestDeps(manifestName, manifest))].slice(0, 12) : [];
  const langCount = new Map<string, number>();
  for (const f of files) if (f.language) langCount.set(f.language, (langCount.get(f.language) ?? 0) + 1);
  const langs = [...langCount].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([l]) => l.charAt(0).toUpperCase() + l.slice(1));

  // key files: <= 12, readme > config > entry > important
  const artIds = new Map(
    (await c.artifacts.find({ projectId, gen, type: "file" }, { projection: { path: 1 } }).toArray()).map((a) => [a.path, a._id.toHexString()]),
  );
  const keyFiles: KeyFile[] = files
    .flatMap((f) => {
      const category = classify(f.path);
      return category ? [{ f, category }] : [];
    })
    .sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category) || (a.f.path < b.f.path ? -1 : 1))
    .slice(0, 12)
    .map(({ f, category }) => ({
      id: artIds.get(f.path) ?? f._id.toHexString(),
      path: f.path,
      description: DESCRIPTIONS[category],
      category,
    }));

  // modules: top-level directories with their real file counts
  const dirCount = new Map<string, number>();
  for (const p of paths) {
    const i = p.indexOf("/");
    if (i > 0 && !p.startsWith(".")) dirCount.set(p.slice(0, i), (dirCount.get(p.slice(0, i)) ?? 0) + 1);
  }
  const mainModules = [...dirCount]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, 8)
    .map(([d, n]) => ({ name: d, path: d, description: `${n} ${n === 1 ? "file" : "files"}` }));

  let summary = `${project.name} has ${files.length} indexed files across ${dirCount.size} top-level directories.`;
  let gettingStarted = manifestName === "package.json" ? manifestSteps(manifest) : [];

  if (llm) {
    try {
      const readmePath = keyFiles.find((k) => k.category === "readme")?.path;
      const out = await llm.generateJson({
        system:
          "You describe a code repository for new contributors. Use only the provided README, manifest and directory listing. " +
          'Reply with JSON: {"summary": string, "modules": [{"path": string, "description": string}], "steps": [{"title": string, "description": string}]}. ' +
          "Do not invent files, commands or technologies.",
        user: [
          `README:\n${readmePath ? (await read(readmePath)).slice(0, 4000) : "(none)"}`,
          `MANIFEST (${manifestName ?? "none"}):\n${manifest.slice(0, 2000)}`,
          `DIRECTORIES:\n${mainModules.map((m) => `${m.path} (${m.description})`).join("\n")}`,
        ].join("\n\n"),
        schema: analysisSchema,
        maxTokens: 1200,
        timeoutMs: 30_000,
      });
      if (out.summary) summary = out.summary;
      const byPath = new Map(out.modules.map((m) => [m.path.replace(/\/$/, ""), m.description]));
      for (const m of mainModules) if (byPath.get(m.path)) m.description = byPath.get(m.path)!;
      if (out.steps.length) gettingStarted = out.steps.map((s, i) => ({ step: i + 1, ...s }));
    } catch (err) {
      logger?.warn({ projectId: projectId.toHexString(), err: (err as Error).message }, "analysis llm failed, using deterministic data");
    }
  }
  if (signal.aborted || !(await c.projects.findOne({ _id: projectId }, { projection: { _id: 1 } }))) return;

  const { _id, ...fields }: ProjectAnalysisDoc = {
    _id: new ObjectId(),
    projectId,
    projectOverview: {
      name: project.name,
      description: project.description,
      repository: project.fullName,
      primaryLanguage: project.language,
      technologies: [...new Set([...langs, ...deps])],
    },
    architecture: { summary, mainModules },
    keyFiles,
    gettingStarted,
    generatedAt: new Date(),
  };
  await c.projectAnalysis.updateOne({ projectId }, { $set: fields, $setOnInsert: { _id } }, { upsert: true });

  await createPlan(db, llm, projectId, project.ownerId, keyFiles, artIds, signal, logger);
}

async function createPlan(
  db: Db,
  llm: LlmClient | undefined,
  projectId: ObjectId,
  userId: ObjectId,
  keyFiles: KeyFile[],
  artIds: Map<string | null, string>,
  signal: AbortSignal,
  logger?: Logger,
): Promise<void> {
  const c = getCollections(db);
  if (await c.onboardingPlans.findOne({ projectId, userId }, { projection: { _id: 1 } })) return;
  const project = (await c.projects.findOne({ _id: projectId }))!;
  const valid = new Set(
    (
      await c.artifacts
        .find({ projectId, gen: { $in: [project.syncGeneration, null] } }, { projection: { _id: 1 } })
        .toArray()
    ).map((a) => a._id.toHexString()),
  );

  let items: { title: string; description: string; artifactIds: string[] }[] = [];
  if (llm && keyFiles.length) {
    try {
      const out = await llm.generateJson({
        system:
          "You write an onboarding checklist for a new contributor. Use only the listed files. " +
          'Reply with JSON: {"items": [{"title": string, "description": string, "artifactIds": string[]}]} with 5 to 8 items. ' +
          "artifactIds may only contain ids from the list.",
        user: keyFiles.map((k) => `${k.id} ${k.path}: ${k.description}`).join("\n"),
        schema: planSchema,
        maxTokens: 1200,
        timeoutMs: 30_000,
      });
      items = out.items.map((i) => ({ ...i, artifactIds: i.artifactIds.filter((id) => isObjectIdHex(id) && valid.has(id)) }));
    } catch (err) {
      logger?.warn({ projectId: projectId.toHexString(), err: (err as Error).message }, "plan llm failed, using fallback");
    }
  }
  if (!items.length) {
    items = keyFiles.slice(0, 4).map((k) => ({
      title: `Read ${k.path}`,
      description: k.description,
      artifactIds: artIds.has(k.path) ? [artIds.get(k.path)!] : [],
    }));
  }
  if (!items.length || signal.aborted) return;
  const now = new Date();
  await c.onboardingPlans.updateOne(
    { projectId, userId },
    {
      $setOnInsert: {
        _id: new ObjectId(),
        title: "Onboarding plan",
        items: items.map((i) => ({ id: new ObjectId().toHexString(), completed: false, ...i })),
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );
}
