import { http, HttpResponse } from "msw";
import { mockRepositoryTree, mockFileContents } from "../data/repository";

export const repositoryHandlers = [
  http.get("/api/v1/projects/:id/repository/tree", () => {
    return HttpResponse.json(mockRepositoryTree);
  }),

  http.get("/api/v1/projects/:id/repository/files/*", ({ params }) => {
    const filePath = String(params["*"]);
    const fileContent = mockFileContents[filePath];
    if (!fileContent) {
      return HttpResponse.json(
        { message: "File not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    return HttpResponse.json(fileContent);
  }),
];
