import { Navigate, useSearchParams } from "react-router";
import { SignInCard } from "@/features/auth/SignInCard";
import { useSession } from "@/app/session/SessionContext";
import { routes } from "@/lib/routes";

export function SignInPage() {
  const { status } = useSession();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") ?? routes.app.root();

  // Already authenticated — redirect immediately
  if (status === "authenticated") {
    return <Navigate to={next} replace />;
  }

  return (
    <main className="min-h-screen w-full bg-surface flex flex-col items-center justify-center p-4 sm:p-6">
      <SignInCard />
    </main>
  );
}
