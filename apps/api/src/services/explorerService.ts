import { ObjectId, type Db } from "mongodb";
import {
  getCollections,
  type ActivityEventDoc,
  type ArtifactDoc,
  type ProjectDoc,
  type RepoFileDoc,
} from "../db/collections";
import { isObjectIdHex } from "../lib/ids";

/** Every read is pinned to the current generation; artifact gen null = decision mirrors. */
const artifactGen = (p: ProjectDoc) => ({ $in: [p.syncGeneration, null] });

export async function listArtifacts(
  db: Db,
  project: ProjectDoc,
  type: string | undefined,
  q: string | undefined,
): Promise<ArtifactDoc[]> {
  const rx = q ? { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } : null;
  return getCollections(db)
    .artifacts.find({
      projectId: project._id,
      gen: artifactGen(project),
      ...(type && type !== "all" && { type }),
      ...(rx && { $or: [{ title: rx }, { summary: rx }, { path: rx }] }),
    })
    .sort({ updatedAt: -1, _id: -1 })
    .limit(200)
    .toArray();
}

export async function getArtifact(
  db: Db,
  project: ProjectDoc,
  artifactId: string,
): Promise<ArtifactDoc | null> {
  if (!isObjectIdHex(artifactId)) return null;
  return getCollections(db).artifacts.findOne({
    _id: new ObjectId(artifactId),
    projectId: project._id,
    gen: artifactGen(project),
  });
}

export function listActivity(db: Db, project: ProjectDoc): Promise<ActivityEventDoc[]> {
  return getCollections(db)
    .activityEvents.find({ projectId: project._id })
    .sort({ createdAt: -1, _id: -1 })
    .limit(50)
    .toArray();
}

export interface TreeItem {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeItem[];
  language?: string | null;
  size?: number;
}

export async function getTree(db: Db, project: ProjectDoc): Promise<TreeItem[]> {
  const files = await getCollections(db)
    .repoFiles.find(
      { projectId: project._id, gen: project.syncGeneration },
      { projection: { path: 1, name: 1, language: 1, size: 1 } },
    )
    .toArray();
  const root: TreeItem[] = [];
  const folders = new Map<string, TreeItem>();
  for (const f of files) {
    const parts = f.path.split("/");
    let siblings = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const path = parts.slice(0, i + 1).join("/");
      let folder = folders.get(path);
      if (!folder) {
        folder = { id: path, name: parts[i] as string, path, type: "folder", children: [] };
        folders.set(path, folder);
        siblings.push(folder);
      }
      siblings = folder.children as TreeItem[];
    }
    siblings.push({ id: f.path, name: f.name, path: f.path, type: "file", language: f.language, size: f.size });
  }
  const sort = (items: TreeItem[]): void => {
    items.sort((a, b) =>
      a.type !== b.type ? (a.type === "folder" ? -1 : 1) : a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
    );
    for (const i of items) if (i.children) sort(i.children);
  };
  sort(root);
  return root;
}

export function getFile(db: Db, project: ProjectDoc, path: string): Promise<RepoFileDoc | null> {
  return getCollections(db).repoFiles.findOne({
    projectId: project._id,
    path,
    gen: project.syncGeneration,
  });
}
