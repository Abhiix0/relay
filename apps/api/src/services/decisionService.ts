import { ObjectId, type Db } from "mongodb";
import { getCollections, type DecisionDoc, type ProjectDoc, type SourceValue } from "../db/collections";
import { conflict } from "../lib/errors";
import { artifactKey } from "../lib/ids";

export const MAX_DECISIONS = 200;

export interface DecisionInput {
  title: string;
  summary: string;
  rationale: string;
  sources: Omit<SourceValue, "id">[];
}

export function listDecisions(db: Db, project: ProjectDoc): Promise<DecisionDoc[]> {
  return getCollections(db).decisions.find({ projectId: project._id }).sort({ createdAt: -1, _id: -1 }).toArray();
}

/** Stores the decision plus a gen:null artifact and chunk so Ask/Handoff can cite it and sync never deletes it. */
export async function createDecision(
  db: Db,
  project: ProjectDoc,
  userId: ObjectId,
  input: DecisionInput,
): Promise<DecisionDoc> {
  const c = getCollections(db);
  if ((await c.decisions.countDocuments({ projectId: project._id })) >= MAX_DECISIONS) {
    throw conflict(`Decision limit reached (${MAX_DECISIONS} per project)`);
  }
  const now = new Date();
  const doc: DecisionDoc = {
    _id: new ObjectId(),
    projectId: project._id,
    ...input,
    sources: input.sources.map((s) => ({ ...s, id: new ObjectId().toHexString() })),
    createdBy: userId,
    createdAt: now,
  };
  const artifactId = new ObjectId();
  const projectId = project._id;
  await c.decisions.insertOne(doc);
  await c.artifacts.insertOne({
    _id: artifactId,
    projectId,
    type: "decision",
    externalId: `decision:${doc._id.toHexString()}`,
    key: artifactKey(projectId, `decision:${doc._id.toHexString()}`),
    title: doc.title,
    path: null,
    url: null,
    summary: doc.summary,
    body: `${doc.summary}\n\n${doc.rationale}`.trim(),
    createdAt: now,
    updatedAt: now,
    gen: null,
  });
  await c.chunks.insertOne({
    _id: new ObjectId(),
    projectId,
    artifactId,
    type: "decision",
    path: null,
    url: `https://github.com/${project.fullName}`,
    title: doc.title,
    language: null,
    startLine: 1,
    text: [doc.title, doc.summary, doc.rationale].filter(Boolean).join("\n\n"),
    gen: null,
  });
  await c.activityEvents.insertOne({
    _id: new ObjectId(),
    projectId,
    type: "decision",
    title: "Decision recorded",
    description: doc.title.slice(0, 200),
    createdAt: now,
  });
  return doc;
}
