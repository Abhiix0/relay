import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { BookOpen, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import {
  useHandoff,
  useHandoffs,
  useProject,
  useGenerateHandoff,
  useUpdateHandoff,
  useCreateHandoffVersion,
} from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import type { HandoffSection } from "@/lib/api/types";
import { HandoffSectionEditor } from "./HandoffSectionEditor";
import { HandoffVersionHistory } from "./HandoffVersionHistory";
import { HandoffActions } from "./HandoffActions";
import { HandoffEmptyState } from "./HandoffEmptyState";

export function HandoffPage() {
  const { id } = useParams<{ id: string }>();
  const [currentVersion, setCurrentVersion] = useState<number | undefined>();
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localSections, setLocalSections] = useState<HandoffSection[]>([]);

  const { data: project } = useProject(id);
  const { data: versions = [], isLoading: isLoadingVersions } = useHandoffs(id);
  const { data: currentHandoff, isLoading: isLoadingCurrent, error } = useHandoff(id, currentVersion);
  
  const generateMutation = useGenerateHandoff(id);
  const updateMutation = useUpdateHandoff(id);
  const createVersionMutation = useCreateHandoffVersion(id);

  // Set current version when versions load
  useEffect(() => {
    if (versions.length > 0 && currentVersion === undefined) {
      const latest = Math.max(...versions.map(v => v.version));
      setCurrentVersion(latest);
    }
  }, [versions, currentVersion]);

  // Update local sections when handoff changes
  useEffect(() => {
    if (currentHandoff) {
      setLocalSections(currentHandoff.sections);
      setHasUnsavedChanges(false);
      setEditingSectionId(null);
    }
  }, [currentHandoff]);

  const handleSectionEdit = (updatedSection: HandoffSection) => {
    setLocalSections(prev => 
      prev.map(section => 
        section.id === updatedSection.id ? updatedSection : section
      )
    );
    setHasUnsavedChanges(true);
    setEditingSectionId(null);
  };

  const handleSaveVersion = () => {
    if (!currentHandoff || !hasUnsavedChanges) return;

    updateMutation.mutate({
      sections: localSections,
    }, {
      onSuccess: () => {
        createVersionMutation.mutate(undefined, {
          onSuccess: (newVersion) => {
            setCurrentVersion(newVersion.version);
            setHasUnsavedChanges(false);
          },
        });
      },
    });
  };

  const handleRegenerate = () => {
    generateMutation.mutate(true, {
      onSuccess: () => {
        setHasUnsavedChanges(false);
        setEditingSectionId(null);
      },
    });
  };

  const handleGenerate = () => {
    generateMutation.mutate(false);
  };

  const handleVersionSelect = (version: number) => {
    setCurrentVersion(version);
  };

  const isLoading = isLoadingVersions || isLoadingCurrent || generateMutation.isPending;

  // 404 on the current handoff means none exists yet, not a failure
  if (error && !(error instanceof ApiError && error.status === 404)) {
    return (
      <AppShell>
        <ErrorState
          title="Failed to load handoff"
          description="We couldn't load the handoff documentation for this project."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-border/60 pb-6 mb-6">
          <div className="text-[10px] font-mono uppercase tracking-wider text-copper font-semibold">
            Engineering Documentation & Knowledge Transfer
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-text">
            Project Handoff
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Comprehensive architectural documentation and engineering context for {project?.name || "this project"}.
          </p>
        </div>

        {isLoading && !currentHandoff ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !currentHandoff ? (
          <HandoffEmptyState
            projectId={id || ""}
            onGenerate={handleGenerate}
            isGenerating={generateMutation.isPending}
            error={generateMutation.error?.message}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Version History Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <HandoffVersionHistory
                versions={versions}
                currentVersion={currentVersion || currentHandoff.version}
                onSelectVersion={handleVersionSelect}
                hasUnsavedChanges={hasUnsavedChanges}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Handoff Header */}
              <div className="bg-surface-accent border border-border rounded p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-copper" />
                    <h2 className="text-lg font-semibold font-mono text-text">
                      {currentHandoff.title}
                    </h2>
                  </div>
                  <div className="text-xs font-mono text-text-muted">
                    v{currentHandoff.version}
                  </div>
                </div>

                {currentHandoff.summary && (
                  <p className="text-sm text-text leading-relaxed bg-surface/50 p-4 rounded border border-border/30">
                    {currentHandoff.summary}
                  </p>
                )}

                <div className="text-[11px] font-mono text-text-muted">
                  Last updated: {new Date(currentHandoff.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long", 
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                {localSections.map((section) => (
                  <HandoffSectionEditor
                    key={section.id}
                    section={section}
                    projectId={id || ""}
                    isEditing={editingSectionId === section.id}
                    onStartEdit={() => setEditingSectionId(section.id)}
                    onSave={handleSectionEdit}
                    onCancel={() => setEditingSectionId(null)}
                  />
                ))}
              </div>

              {/* Loading overlay during regeneration */}
              {generateMutation.isPending && (
                <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-surface-accent border border-border rounded p-6 space-y-3 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-copper mx-auto" />
                    <div className="text-sm font-mono text-paper">Regenerating handoff...</div>
                    <div className="text-xs text-text-muted">Analyzing repository context and generating documentation</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions Bar */}
        {currentHandoff && (
          <HandoffActions
            handoff={currentHandoff}
            projectName={project?.name}
            hasUnsavedChanges={hasUnsavedChanges}
            onSaveVersion={handleSaveVersion}
            onRegenerate={handleRegenerate}
            isRegenerating={generateMutation.isPending}
            isSaving={updateMutation.isPending || createVersionMutation.isPending}
          />
        )}
      </div>
    </AppShell>
  );
}
