import { http, HttpResponse } from "msw";
import { mockOnboardingData, mockOnboardingPlan } from "../data/onboarding";

const onboardingPlan = {
  ...mockOnboardingPlan,
  items: [...mockOnboardingPlan.items],
};

export const onboardingHandlers = [
  http.get("/api/v1/projects/:id/onboarding/data", ({ params }) => {
    return HttpResponse.json({
      ...mockOnboardingData,
      projectId: String(params.id),
    });
  }),

  http.get("/api/v1/projects/:id/onboarding", ({ params }) => {
    return HttpResponse.json({
      ...onboardingPlan,
      projectId: String(params.id),
    });
  }),

  http.patch(
    "/api/v1/projects/:id/onboarding/items/:itemId",
    async ({ request, params }) => {
      const { completed } = (await request.json()) as { completed: boolean };
      const item = onboardingPlan.items.find((i) => i.id === params.itemId);
      if (item) item.completed = completed;
      return HttpResponse.json(onboardingPlan);
    }
  ),
];
