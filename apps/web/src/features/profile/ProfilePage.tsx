import { Github, Key, ShieldAlert, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/api/hooks";

export function ProfilePage() {
  const { data: user, isLoading, error, refetch } = useCurrentUser();

  if (error) {
    return (
      <AppShell showProjectNav={false}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="border-b border-border pb-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-copper">
              User Account & Identity
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-text mt-1">
              Developer Profile
            </h1>
          </div>
          <ErrorState
            title="Failed to load profile"
            description={error instanceof Error ? error.message : "Unable to retrieve user identity from backend."}
          >
            <button
              onClick={() => refetch()}
              className="mt-2 text-xs font-mono text-copper hover:underline"
            >
              Retry
            </button>
          </ErrorState>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell showProjectNav={false}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="border-b border-border pb-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-copper">
            User Account & Identity
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-text mt-1">
            Developer Profile
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage your connected GitHub identity, account details, and repository access authorizations.
          </p>
        </div>

        {/* Identity Card */}
        <Card className="border-border bg-surface-accent shadow-sm">
          <CardHeader className="p-5 pb-3 border-b border-border/40">
            <CardTitle className="text-base font-serif text-text font-normal">
              Developer Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {isLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-copper">
                  <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-charcoal text-paper text-base font-mono font-medium">
                    {user?.name?.slice(0, 2).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="text-base font-semibold text-text">{user?.name || "Developer"}</div>
                  <div className="text-xs text-text-muted">{user?.email || "No email configured"}</div>
                  {user?.githubLogin ? (
                    <Badge variant="copper" className="text-[10px] font-mono gap-1">
                      <Github className="h-3 w-3" /> @{user.githubLogin}
                    </Badge>
                  ) : (
                    <span className="text-[10px] font-mono text-text-muted">No GitHub account linked</span>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-3 pt-3 border-t border-border/30 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Full Name</Label>
                <Input value={user?.name || ""} readOnly placeholder="Not set" className="bg-surface border-border text-xs text-text" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Email Address</Label>
                <Input value={user?.email || ""} readOnly placeholder="Not set" className="bg-surface border-border text-xs text-text" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Tokens */}
        <Card className="border-border bg-surface-accent shadow-sm">
          <CardHeader className="p-5 pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-copper" />
              <CardTitle className="text-base font-serif text-text font-normal">
                GitHub App & Provider Integration
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-text-muted mt-1">
              Used by RELAY daemon to index AST nodes, commit trees, and private repository files.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-text">GitHub App OAuth Authorization</div>
                {user?.githubLogin ? (
                  <div className="text-xs text-moss flex items-center gap-1 mt-0.5 font-mono text-[11px]">
                    <ShieldCheck className="h-3 w-3" /> Connected via @{user.githubLogin}
                  </div>
                ) : (
                  <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5 font-mono text-[11px]">
                    <ShieldAlert className="h-3 w-3 text-warning" /> Backend auth integration not configured
                  </div>
                )}
              </div>
              <span className="text-[11px] font-mono text-text-muted bg-surface px-2.5 py-1 rounded border border-border/60 self-start sm:self-auto">
                {user?.githubLogin ? "Active" : "Not configured"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
