import { Link } from "react-router";
import { File, FileCode2, FolderOpen, Settings, Book } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { OnboardingData } from "@/lib/api/types";

interface ImportantFilesProps {
  data: OnboardingData;
  projectId: string;
}

function getFileIcon(category: string) {
  switch (category) {
    case "readme":
      return Book;
    case "config":
      return Settings;
    case "entry":
      return FileCode2;
    case "important":
      return File;
    default:
      return File;
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case "readme":
      return "text-moss";
    case "config":
      return "text-sun";
    case "entry":
      return "text-copper";
    case "important":
      return "text-paper";
    default:
      return "text-text-muted";
  }
}

export function ImportantFiles({ data, projectId }: ImportantFilesProps) {
  const { keyFiles } = data;

  // Group files by category
  const groupedFiles = keyFiles.reduce((acc, file) => {
    if (!acc[file.category]) {
      acc[file.category] = [];
    }
    const categoryFiles = acc[file.category];
    if (categoryFiles) {
      categoryFiles.push(file);
    }
    return acc;
  }, {} as Record<string, typeof keyFiles>);

  const categoryLabels = {
    readme: "Documentation",
    config: "Configuration",
    entry: "Entry Points",
    important: "Important Files",
  };

  return (
    <Card className="border-border bg-surface-accent">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-copper" />
            <h2 className="text-sm font-semibold font-mono text-paper">Key Files</h2>
          </div>
          <Link to={`/app/projects/${projectId}/files`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-mono text-copper hover:text-paper"
            >
              Browse All Files
            </Button>
          </Link>
        </div>

        <p className="text-xs text-text-muted">
          Essential files to understand this project's structure and implementation.
        </p>

        <div className="space-y-4">
          {Object.entries(groupedFiles).map(([category, files]) => {
            const CategoryIcon = getFileIcon(category);
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <CategoryIcon className={`h-3.5 w-3.5 ${getCategoryColor(category)}`} />
                  <h3 className="text-xs font-semibold font-mono text-paper">
                    {categoryLabels[category as keyof typeof categoryLabels] || category}
                  </h3>
                </div>
                
                <div className="space-y-1.5 ml-5">
                  {files.map((file) => (
                    <Link
                      key={file.id}
                      to={`/app/projects/${projectId}/files?file=${encodeURIComponent(file.path)}`}
                      className="block group"
                    >
                      <div className="bg-surface/50 rounded border border-border/30 p-3 space-y-1 group-hover:border-copper/50 transition">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-copper group-hover:text-copper-light">
                            {file.path}
                          </code>
                        </div>
                        <p className="text-xs text-text-muted leading-relaxed">
                          {file.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}