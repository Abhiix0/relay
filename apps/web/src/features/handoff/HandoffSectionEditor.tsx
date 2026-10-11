import { useState } from "react";
import { Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { HandoffSection } from "@/lib/api/types";
import { HandoffEvidence } from "./HandoffEvidence";

interface HandoffSectionEditorProps {
  section: HandoffSection;
  projectId: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (section: HandoffSection) => void;
  onCancel: () => void;
}

export function HandoffSectionEditor({
  section,
  projectId,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
}: HandoffSectionEditorProps) {
  const [heading, setHeading] = useState(section.heading);
  const [body, setBody] = useState(section.body);

  const handleSave = () => {
    onSave({
      ...section,
      heading: heading.trim(),
      body: body.trim(),
    });
    
    // Reset local state
    setHeading(section.heading);
    setBody(section.body);
  };

  const handleCancel = () => {
    // Reset to original values
    setHeading(section.heading);
    setBody(section.body);
    onCancel();
  };

  const hasChanges = heading !== section.heading || body !== section.body;

  return (
    <Card className={cn(
      "border-border bg-surface-accent transition-colors",
      isEditing && "ring-2 ring-copper/20 border-copper/30"
    )}>
      <CardContent className="p-5 space-y-4">
        {isEditing ? (
          <>
            {/* Edit Mode */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor={`heading-${section.id}`} className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                  Section Heading
                </label>
                <Input
                  id={`heading-${section.id}`}
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  className="bg-surface border-border text-text text-sm font-mono"
                  placeholder="Enter section heading..."
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor={`body-${section.id}`} className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                  Section Content
                </label>
                <Textarea
                  id={`body-${section.id}`}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="bg-surface border-border text-text text-xs min-h-[120px] leading-relaxed font-sans"
                  placeholder="Enter section content... Use plain text or Markdown formatting."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="text-[11px] font-mono text-text-muted">
                {hasChanges ? "Unsaved changes" : "No changes"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="text-xs font-mono text-text-muted hover:text-text"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges || !heading.trim() || !body.trim()}
                  className="bg-copper hover:bg-copper-dark text-paper text-xs font-mono"
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* View Mode */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-text font-mono flex-1">
                {section.heading}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={onStartEdit}
                className="text-xs font-mono text-text-muted hover:text-copper shrink-0"
              >
                <Edit2 className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </div>

            <div className="text-xs text-text leading-relaxed whitespace-pre-line font-sans">
              {section.body}
            </div>
          </>
        )}

        {/* Evidence Section - always show in view mode, hide in edit mode */}
        {!isEditing && (
          <HandoffEvidence
            sources={section.sources}
            projectId={projectId}
            insufficientEvidence={section.insufficientEvidence}
          />
        )}
      </CardContent>
    </Card>
  );
}