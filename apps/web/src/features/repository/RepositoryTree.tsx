import { useState } from "react";
import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import type { RepositoryTreeItem } from "@/lib/api/types";

interface RepositoryTreeProps {
  tree: RepositoryTreeItem[];
  selectedPath: string | null;
  onFileSelect: (path: string) => void;
  projectId: string;
}

export function RepositoryTree({
  tree,
  selectedPath,
  onFileSelect,
}: RepositoryTreeProps) {
  return (
    <div className="rounded border border-border bg-surface-accent p-4 overflow-y-auto max-h-[calc(100vh-300px)]">
      <div className="space-y-1" role="tree" aria-label="Repository file tree">
        {tree.map((item) => (
          <RepositoryTreeItem
            key={item.id}
            item={item}
            selectedPath={selectedPath}
            onFileSelect={onFileSelect}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}

interface RepositoryTreeItemProps {
  item: RepositoryTreeItem;
  selectedPath: string | null;
  onFileSelect: (path: string) => void;
  level: number;
}

function RepositoryTreeItem({
  item,
  selectedPath,
  onFileSelect,
  level,
}: RepositoryTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const isFolder = item.type === "folder";
  const isSelected = selectedPath === item.path;
  const hasChildren = isFolder && item.children && item.children.length > 0;

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(item.path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    } else if (isFolder && hasChildren) {
      if (e.key === "ArrowRight" && !isExpanded) {
        e.preventDefault();
        setIsExpanded(true);
      } else if (e.key === "ArrowLeft" && isExpanded) {
        e.preventDefault();
        setIsExpanded(false);
      }
    }
  };

  return (
    <div role="treeitem" aria-expanded={isFolder ? isExpanded : undefined} aria-selected={isSelected}>
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs font-mono transition",
          "hover:bg-surface focus:outline-none focus:ring-1 focus:ring-copper",
          isSelected && "bg-surface border-l-2 border-copper font-semibold",
          !isSelected && "text-text-muted hover:text-paper"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        aria-label={`${item.type === "folder" ? "Folder" : "File"}: ${item.name}`}
      >
        {isFolder ? (
          <>
            {hasChildren && (
              <span className="shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </span>
            )}
            {!hasChildren && <span className="w-3" />}
            {isExpanded ? (
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-sun" />
            ) : (
              <Folder className="h-3.5 w-3.5 shrink-0 text-sun" />
            )}
          </>
        ) : (
          <>
            <span className="w-3" />
            <File className="h-3.5 w-3.5 shrink-0 text-copper" />
          </>
        )}
        <span className="truncate">{item.name}</span>
      </button>

      {isFolder && hasChildren && isExpanded && item.children && (
        <div className="space-y-1 mt-1">
          {item.children.map((child: RepositoryTreeItem) => (
            <RepositoryTreeItem
              key={child.id}
              item={child}
              selectedPath={selectedPath}
              onFileSelect={onFileSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
