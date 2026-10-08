import * as React from "react";
import { Github } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RelayMark } from "@/components/ui/relay-mark";
import {
  signInSchema,
  signInWithEmail,
  signInWithGithub,
  type SignInInput,
} from "./api";

export function SignInCard() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<SignInInput>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof SignInInput, string>>>({});
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [isEmailLoading, setIsEmailLoading] = React.useState(false);
  const [isGithubLoading, setIsGithubLoading] = React.useState(false);

  const handleChange = (field: keyof SignInInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const result = signInSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignInInput, string>> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof SignInInput;
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsEmailLoading(true);
      await signInWithEmail(result.data);
      navigate("/dashboard");
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setGeneralError(null);
    try {
      setIsGithubLoading(true);
      await signInWithGithub();
      navigate("/dashboard");
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : "GitHub authentication failed");
    } finally {
      setIsGithubLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[420px] shadow-sm">
      <CardHeader className="items-center text-center pb-4 pt-8">
        <RelayMark className="mb-3" />
        <CardTitle className="text-3xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your Relay workspace to continue.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-8 pb-8">
        {generalError && (
          <div
            role="alert"
            className="border border-error/30 bg-error/10 px-4 py-2.5 text-xs text-error font-mono"
          >
            {generalError}
          </div>
        )}

        <Button
          type="button"
          variant="secondary"
          className="w-full bg-charcoal text-paper hover:bg-charcoal-soft border-charcoal hover:border-charcoal-soft"
          onClick={handleGithubSignIn}
          loading={isGithubLoading}
          disabled={isEmailLoading || isGithubLoading}
        >
          <Github className="h-4 w-4" />
          Continue with GitHub
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-border" />
          <span className="absolute bg-surface-accent px-3 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            or
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email" error={errors.email} required>
            <Input
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={isEmailLoading || isGithubLoading}
              autoComplete="email"
            />
          </Field>

          <Field label="Password" error={errors.password} required>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              disabled={isEmailLoading || isGithubLoading}
              autoComplete="current-password"
            />
          </Field>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            loading={isEmailLoading}
            disabled={isEmailLoading || isGithubLoading}
          >
            Sign in
          </Button>
        </form>

        <p className="text-center font-mono text-xs text-text-muted">
          Don't have an account?{" "}
          <a
            href="/sign-in"
            onClick={(e) => {
              e.preventDefault();
            }}
            className="text-copper-text hover:underline font-medium"
          >
            Create one
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
