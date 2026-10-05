export interface RepositoryTreeItem {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: RepositoryTreeItem[];
  language?: string | null;
  size?: number;
}

export interface RepositoryTree {
  projectId: string;
  repository: string;
  tree: RepositoryTreeItem[];
}

export interface FileContent {
  projectId: string;
  path: string;
  name: string;
  language: string | null;
  content: string;
  size: number;
  isBinary?: boolean;
  isLarge?: boolean;
}
