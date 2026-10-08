import { ChevronRight } from "lucide-react";

interface FileBreadcrumbsProps {
  path: string;
}

export function FileBreadcrumbs({ path }: FileBreadcrumbsProps) {
  const segments = path.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted overflow-x-auto scrollbar-thin pb-1">
      {segments.map((segment, idx) => (
        <div key={idx} className="flex items-center gap-1.5 shrink-0">
          {idx > 0 && <ChevronRight className="h-3 w-3" />}
          <span className={idx === segments.length - 1 ? "text-copper-text font-semibold" : ""}>
            {segment}
          </span>
        </div>
      ))}
    </div>
  );
}
