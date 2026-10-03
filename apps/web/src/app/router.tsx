import { createBrowserRouter, RouterProvider } from "react-router";
import { LandingPage } from "@/features/landing/LandingPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SignInPage } from "@/pages/SignInPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/sign-in",
    element: <SignInPage />,
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
