import {
  ArrowRight,
  FileCode2,
  GitBranch,
  Github,
  Loader2,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Field } from "@/components/ui/field";
import { FilePath } from "@/components/ui/file-path";
import { FilterChip } from "@/components/ui/filter-chip";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/panel";
import { Progress } from "@/components/ui/progress";
import { RelayMark } from "@/components/ui/relay-mark";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceChip } from "@/components/ui/source-chip";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function DesignSystemPage() {
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Only show in development
  const isDev = process.env.NODE_ENV === "development";
  
  if (!isDev) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="mx-auto max-w-7xl px-6">
        <header className="mb-12 border-b border-border pb-6">
          <h1 className="mb-4 font-serif text-5xl font-normal tracking-tight">
            Relay Design System
          </h1>
          <p className="text-text-muted">
            Component showcase and token reference · DEV only
          </p>
        </header>

        <div className="grid gap-12">
          {/* Colors */}
          <section>
            <h2 className="mb-6 font-serif text-3xl font-normal">Color Palette</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ColorSwatch label="Linen" var="--linen" />
              <ColorSwatch label="Linen Deep" var="--linen-deep" />
              <ColorSwatch label="Paper" var="--paper" />
              <ColorSwatch label="Charcoal" var="--charcoal" />
              <ColorSwatch label="Charcoal Soft" var="--charcoal-soft" />
              <ColorSwatch label="Charcoal Muted" var="--charcoal-muted" />
              <ColorSwatch label="Carbon" var="--carbon" />
              <ColorSwatch label="Copper" var="--copper" />
              <ColorSwatch label="Copper Dark" var="--copper-dark" />
              <ColorSwatch label="Moss (Success)" var="--moss" />
              <ColorSwatch label="Sun (Warning)" var="--sun" />
              <ColorSwatch label="Blue" var="--blue" />
            </div>
          </section>

          {/* Typography */}
          <section>
            <h2 className="mb-6 font-serif text-3xl font-normal">Typography</h2>
            <div className="space-y-4 border border-border bg-surface-accent p-6">
              <div>
                <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Serif Headings (Georgia)
                </p>
                <h1 className="font-serif text-5xl font-normal">The quick brown fox</h1>
                <h2 className="font-serif text-3xl font-normal">jumps over the lazy dog</h2>
                <h3 className="font-serif text-xl font-normal">Pack my box with five dozen</h3>
              </div>
              <div>
                <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Sans Body (Inter)
                </p>
                <p className="text-base">
                  The quick brown fox jumps over the lazy dog. Pack my box with five dozen
                  liquor jugs.
                </p>
                <p className="text-sm text-text-muted">
                  Smaller text for descriptions and secondary content.
                </p>
              </div>
              <div>
                <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Mono Labels (JetBrains Mono)
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider">
                  Project Context / Status: Healthy
                </p>
                <code className="font-mono text-xs">const result = await fetchData();</code>
              </div>
            </div>
          </section>

          {/* Brand Marks */}
          <section>
            <h2 className="mb-6 font-serif text-3xl font-normal">Brand Marks</h2>
            <div className="flex flex-wrap items-center gap-8 border border-border bg-surface-accent p-6">
              <RelayMark />
              <RelayMark compact />
              <RelayMark showWordmark={false} />
              <div className="text-copper">
                <RelayMark compact />
              </div>
            </div>
          </section>

          {/* Buttons */}
          <section>
            <h2 className="mb-6 font-serif text-3xl font-normal">Buttons</h2>
            <div className="space-y-6">
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Variants
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="primary" loading>
                    Loading
                  </Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                  <Button variant="icon" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Sizes
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  States
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button>Hover me</Button>
                  <Button disabled>Disabled</Button>
                  <Button>
                    <Github className="h-4 w-4" />
                    With Icon
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Inputs */}
          <section>
            <h2 className="mb-6 font-serif text-3xl font-normal">Inputs & Forms</h2>
            <div className="max-w-md space-y-6">
              <Field label="Project Name" hint="Choose a descriptive name" required>
                <Input placeholder="my-awesome-project" />
              </Field>
              <Field label="Description" error="Description is required">
                <Textarea placeholder="Tell us about your project..." />
              </Field>
              <div>
                <Label>Search</Label>
                <SearchInput
                  placeholder="Search repositories..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClear={() => setSearchValue("")}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch id="sync" />
                <Label htmlFor="sync" className="cursor-pointer">
                  Enable automatic sync
                </Label>
              </div>
            </div>
          </section>

          {/* Badges & Pills */}
          <section>
            <h2 className="mb-6 font-serif text-3xl font-normal">Badges & Status</h2>
            <div className="space-y-6">
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Badges
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="copper">Copper</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                </div>
              </div>
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Status Pills
                </p>
                <div className="flex flex-wrap gap-4">
                  <StatusPill status="healthy">Healthy</StatusPill>
                  <StatusPill status="indexing">Indexing</StatusPill>
                  <StatusPill status="error">Failing</StatusPill>
                  <StatusPill status="idle">Idle</StatusPill>
                </div>
              </div>
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Filter Chips
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip active={activeFilter === "all"} onClick={() => setActiveFilter("all")}>
                    All
                  </FilterChip>
                  <FilterChip active={activeFilter === "code"} onClick={() => setActiveFilter("code")}>
                    Code
                  </FilterChip>
                  <FilterChip active={activeFilter === "issues"} onClick={() => setActiveFilter("issues")}>
                    Issues
                  </FilterChip>
                  <FilterChip active={activeFilter === "prs"} onClick={() => setActiveFilter("prs")}>
                    PRs
                  </FilterChip>
                  <FilterChip active={activeFilter === "commits"} onClick={() => setActiveFilter("commits")}>
                    Commits
                  </FilterChip>
                  <FilterChip active={activeFilter === "docs"} onClick={() => setActiveFilter("docs")}>
                    Docs
                  </FilterChip>
                </div>
              </div>
            </div>
          </section>

          {/* Evidence Chips */}
          <section>
            <h2 className="mb-6 font-serif text-3xl font-normal">Evidence & Code</h2>
            <div className="space-y-6">
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Source Chips
                </p>
                <div className="flex flex-wrap gap-2">
                  <SourceChip type="file" label="auth.ts:42" />
                  <SourceChip type="commit" label="a3f9c21" />
                  <SourceChip type="pr" label="PR #184" />
                  <SourceChip type="issue" label="Issue #42" />
                  <SourceChip type="doc" label="decisions.md" />
                </div>
              </div>
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  File Paths
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilePath path="src/workers/queue.ts" />
                  <FilePath path="apps/web/components/ui/button.tsx" />
                </div>
              </div>
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Keyboard Shortcuts
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1">
                    <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd>
                  </div>
                  <div className="flex items-center gap-1">
                    <Kbd>Ctrl</Kbd>
                    <span className="text-text-muted">+</span>
                    <Kbd>Shift</Kbd>
                    <span className="text-text-muted">+</span>
                    <Kbd>P</Kbd>
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Code Block
                </p>
                <CodeBlock
                  code={`export async function verifyToken(req) {
  const token = req.headers.authorization;
  return validate(token, authConfig);
}`}
                  language="typescript"
                  showLineNumbers
                />
              </div>
            </div>
          </section>

          {/* Cards */}
          <section>
            <h2 className="mb-6 font-serif text-3xl font-normal">Cards & Panels</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Project Context</CardTitle>
                  <CardDescription>
                    Real-time insights from your repository
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Relay indexes commits, PRs, and documentation to build a living context.
                  </p>
                </CardContent>
              </Card>
              <Panel>
                <p className="font-mono text-[9px] uppercase tracking-wider text-text-muted mb-3">
                  Panel Component
                </p>
                <p className="text-sm">
                  Simple bordered container for grouping content.
                </p>
              </Panel>
              <StatCard value="87" label="Context coverage" accent="%" />
            </div>
          </section>

          {/* Tabs */}
          <section>
            <h2 className="mb-6 font-serif text-3xl font-normal">Tabs</h2>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="context">Context</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <p className="text-sm">Project overview content goes here.</p>
              </TabsContent>
              <TabsContent value="context">
                <p className="text-sm">Context analysis and insights.</p>
              </TabsContent>
              <TabsContent value="activity">
                <p className="text-sm">Recent activity and changes.</p>
              </TabsContent>
            </Tabs>
          </section>

          {/* Interactive Components */}
          <section>
            <h2 className="mb-6 font-serif text-3xl font-normal">Interactive</h2>
            <div className="flex flex-wrap gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This is a tooltip</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect Repository</DialogTitle>
                    <DialogDescription>
                      Select a GitHub repository to start building context.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Field label="Repository URL">
                      <Input placeholder="https://github.com/..." />
                    </Field>
                  </div>
                  <DialogFooter>
                    <Button variant="secondary">Cancel</Button>
                    <Button>Connect</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">
                    Menu
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <FileCode2 className="mr-2 h-4 w-4" />
                    View Code
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <GitBranch className="mr-2 h-4 w-4" />
                    View History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-error">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </section>

          {/* States */}
          <section>
            <h2 className="mb-6 font-serif text-3xl font-normal">Loading & Empty States</h2>
            <div className="space-y-8">
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Skeleton
                </p>
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Progress
                </p>
                <Progress value={67} />
              </div>
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Empty State
                </p>
                <EmptyState
                  icon={<Search className="h-12 w-12" />}
                  title="No results found"
                  description="Try adjusting your search or filter to find what you're looking for."
                  action={<Button variant="secondary">Clear filters</Button>}
                />
              </div>
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  Error State
                </p>
                <ErrorState onRetry={() => alert("Retrying...")} />
              </div>
            </div>
          </section>

          {/* Avatars */}
          <section>
            <h2 className="mb-6 font-serif text-3xl font-normal">Avatars</h2>
            <div className="flex flex-wrap gap-4">
              <Avatar>
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarFallback>LG</AvatarFallback>
              </Avatar>
            </div>
          </section>

          {/* Loading Indicators */}
          <section>
            <h2 className="mb-6 font-serif text-3xl font-normal">Loading Indicators</h2>
            <div className="flex flex-wrap items-center gap-6">
              <Loader2 className="h-6 w-6 animate-spin text-copper" />
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-text-muted">Loading...</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ColorSwatch({ label, var: cssVar }: { label: string; var: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-24 w-full border border-border"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div>
        <p className="font-mono text-xs">{label}</p>
        <p className="font-mono text-[10px] text-text-muted">{cssVar}</p>
      </div>
    </div>
  );
}
