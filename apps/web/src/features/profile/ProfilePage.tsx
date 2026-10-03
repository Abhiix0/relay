import { Github, Key, Shield } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/lib/api/hooks";

export function ProfilePage() {
  const { data: user } = useCurrentUser();

  return (
    <AppShell showProjectNav={false}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="border-b border-border pb-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-copper">
            User Account & Preferences
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-paper">
            Profile Settings
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage your connected GitHub identity, API keys, and evidence synthesis preferences.
          </p>
        </div>

        {/* Identity Card */}
        <Card className="border-border bg-surface-accent">
          <CardHeader className="p-5 pb-3 border-b border-border/40">
            <CardTitle className="text-base font-serif text-paper">
              Developer Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-copper">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || "User"} />
                <AvatarFallback className="bg-surface text-base font-mono text-paper">
                  {user?.name?.slice(0, 2).toUpperCase() || "AC"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="text-base font-semibold text-paper">{user?.name}</div>
                <div className="text-xs text-text-muted">{user?.email}</div>
                <Badge variant="copper" className="text-[10px] font-mono gap-1">
                  <Github className="h-3 w-3" /> @{user?.githubLogin}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 pt-3 border-t border-border/30 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-mono uppercase text-text-muted">Full Name</Label>
                <Input value={user?.name || ""} readOnly className="bg-surface border-border text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-mono uppercase text-text-muted">Email Address</Label>
                <Input value={user?.email || ""} readOnly className="bg-surface border-border text-xs" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Tokens */}
        <Card className="border-border bg-surface-accent">
          <CardHeader className="p-5 pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-copper" />
              <CardTitle className="text-base font-serif text-paper">
                GitHub App & Personal Access Tokens
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-text-muted">
              Used by Relay daemon to fetch AST nodes, commits, and private repository trees.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-paper">GitHub App Integration</div>
                <div className="text-xs text-moss flex items-center gap-1 mt-0.5 font-mono text-[11px]">
                  <Shield className="h-3 w-3" /> Connected & Authorized
                </div>
              </div>
              <Button size="sm" variant="secondary" className="border-border text-xs font-mono">
                Re-authenticate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
