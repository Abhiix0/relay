import { createBrowserRouter, RouterProvider } from "react-router";
import { LandingPage } from "@/pages/LandingPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/design-system",
    lazy: async () => {
      const { DesignSystemPage } = await import("@/pages/DesignSystemPage");
      return { Component: DesignSystemPage };
    },
  },
  {
    path: "/404",
    element: <NotFoundPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
