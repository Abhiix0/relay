import { useNavigate } from "react-router";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

interface ProjectNotFoundProps {
  projectId?: string;
}

export function ProjectNotFound({ projectId }: ProjectNotFoundProps) {
  const navigate = useNavigate();

  const handleBackToProjects = () => {
    navigate("/app/projects");
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <AlertTriangle className="h-12 w-12 text-warning" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-serif font-normal text-paper">
          Project not found
        </h1>
        <p className="text-sm text-text-muted max-w-md">
          {projectId 
            ? `We couldn't find the project "${projectId}" you're looking for. It may have been removed or you may not have access to it.`
            : "We couldn't find the project you're looking for. It may have been removed or you may not have access to it."
          }
        </p>
      </div>
      <Button
        onClick={handleBackToProjects}
        variant="primary"
        size="sm"
        className="bg-copper text-paper"
      >
        Back to Projects
      </Button>
    </div>
  );
}