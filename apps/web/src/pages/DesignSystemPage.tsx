/**
 * Design System Showcase — DEV only (excluded from production bundle).
 * Rendered at /design-system, lazy-loaded in the router.
 */
import { useState } from "react";
import {
  ArrowRight, FileCode2, GitBranch, Github,
  Loader2, Search, Settings, Trash2, User,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Field } from "@/components/ui/field";
import { FilePath } from "@/components/ui/file-path";
import { FilterChip } from "@/components/ui/filter-chip";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/menu";
import { Panel } from "@/components/ui/panel";
import { Progress } from "@/components/ui/progress";
import { RelayMark } from "@/components/ui/relay-mark";
import { SearchInput } from "@/components/ui/search-input";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceChip } from "@/components/ui/source-chip";
import { Spinner } from "@/components/ui/spinner";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Stepper } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { DSSection, ColorSwatch, DSLabel } from "./DesignSystemSection";

/* ── Inner page (needs ToastProvider context) ─────────────────── */

function DesignSystemInner() {
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [stepperStep, setStepperStep] = useState("s2");
  const { toast } = useToast();

  const stepperSteps = [
    { id: "s1", title: "Connect repository", description: "Authorise GitHub access and select your repo." },
    { id: "s2", title: "Index files", description: "Relay processes commits, PRs, and docs." },
    { id: "s3", title: "Ask questions", description: "Query your codebase with grounded AI answers." },
  ];

  const tableRows = [
    { repo: "vercel/turbo",       lang: "Rust",       status: "healthy",  health: "98%" },
    { repo: "prisma/prisma",      lang: "TypeScript", status: "healthy",  health: "94%" },
    { repo: "calcom/cal.com",     lang: "TypeScript", status: "indexing", health: "68%" },
    { repo: "excalidraw/excalidraw", lang: "TypeScript", status: "idle",  health: "—" },
  ] as const;

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <header className="mb-12 border-b border-border pb-6">
          <div className="font-mono text-[10px] uppercase tracking-wider text-copper mb-1">
            DEV ONLY · /design-system
          </div>
          <h1 className="mb-2 font-serif text-5xl font-normal tracking-tight">
            Relay Design System
          </h1>
          <p className="text-text-muted text-sm">
            Token reference, component catalogue, and state showcase.
          </p>
        </header>

        <div className="grid gap-16">

          {/* ── Token decisions ───────────────────────────────── */}
          <DSSection title="Token Decisions (board-sampled)">
            <div className="border border-border bg-surface-accent p-5 space-y-2 font-mono text-xs">
              <p className="text-text-muted text-[10px] uppercase tracking-wider mb-3">
                Sampled pixel values from RELAY_Developer_Tool_Design_System_Board.png
              </p>
              {[
                ["--error",        "#c0392b", "Board 'Failing' red — distinct from --copper (#c6603e)"],
                ["--success",      "#9dbba0", "Board 'Healthy' moss — unchanged"],
                ["--warning",      "#e5b34e", "Board 'Indexing' amber — unchanged"],
                ["--sidebar-bg",   "#13150f", "Slightly darker than --charcoal for sidebar depth"],
                ["--surface-code", "#1e201b", "Code editor background — near carbon"],
                ["--overlay",      "rgba(25,27,23,0.72)", "Modal/drawer backdrop at 72% opacity"],
                ["--focus-ring",   "#c6603e (copper)", "Consistent with selection highlight"],
                ["--chart-healthy","#6f9a7d", "Saturated moss for data fills"],
              ].map(([token, value, note]) => (
                <div key={token} className="grid grid-cols-[180px_180px_1fr] gap-4 items-start py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-copper">{token}</span>
                  <span className="text-paper">{value}</span>
                  <span className="text-text-muted text-[10px]">{note}</span>
                </div>
              ))}
            </div>
          </DSSection>

          {/* ── Color palette ─────────────────────────────────── */}
          <DSSection title="Color Palette">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <ColorSwatch label="Linen"         cssVar="--linen" />
              <ColorSwatch label="Paper"          cssVar="--paper" />
              <ColorSwatch label="Charcoal"       cssVar="--charcoal" />
              <ColorSwatch label="Charcoal Soft"  cssVar="--charcoal-soft" />
              <ColorSwatch label="Copper"         cssVar="--copper" />
              <ColorSwatch label="Copper Dark"    cssVar="--copper-dark" />
              <ColorSwatch label="Moss / Success" cssVar="--success" />
              <ColorSwatch label="Sun / Warning"  cssVar="--warning" />
              <ColorSwatch label="Error (red)"    cssVar="--error" />
              <ColorSwatch label="Blue"           cssVar="--blue" />
              <ColorSwatch label="Sidebar BG"     cssVar="--sidebar-bg" />
              <ColorSwatch label="Surface Code"   cssVar="--surface-code" />
            </div>
          </DSSection>

          {/* ── Typography ────────────────────────────────────── */}
          <DSSection title="Typography">
            <div className="space-y-5 border border-border bg-surface-accent p-6">
              <div>
                <DSLabel>Serif Display (Georgia)</DSLabel>
                <h1 className="font-serif text-5xl font-normal mt-2">The quick brown fox</h1>
                <h2 className="font-serif text-3xl font-normal mt-1">jumps over the lazy dog</h2>
              </div>
              <div>
                <DSLabel>Sans UI (Inter)</DSLabel>
                <p className="text-base mt-1">The quick brown fox jumps over the lazy dog.</p>
                <p className="text-sm text-text-muted">Secondary / description text.</p>
              </div>
              <div>
                <DSLabel>Mono Code (JetBrains Mono)</DSLabel>
                <p className="font-mono text-[10px] uppercase tracking-wider mt-1">
                  Project Context / Status: Healthy
                </p>
                <code className="font-mono text-xs">const result = await fetchData();</code>
              </div>
            </div>
          </DSSection>

          {/* ── Buttons ───────────────────────────────────────── */}
          <DSSection title="Button">
            <div className="space-y-5">
              <div>
                <DSLabel>Variants</DSLabel>
                <div className="flex flex-wrap gap-3 mt-2">
                  <Button variant="primary">Primary</Button>
                  <Button variant="primary" loading>Loading</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive"><Trash2 className="h-4 w-4" />Destructive</Button>
                  <Button variant="icon" size="icon"><Settings className="h-4 w-4" /></Button>
                </div>
              </div>
              <div>
                <DSLabel>Sizes</DSLabel>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              <div>
                <DSLabel>States</DSLabel>
                <div className="flex flex-wrap gap-3 mt-2">
                  <Button disabled>Disabled</Button>
                  <Button><Github className="h-4 w-4" />With icon</Button>
                </div>
              </div>
            </div>
          </DSSection>

          {/* ── IconButton + Spinner + CopyButton ─────────────── */}
          <DSSection title="IconButton · Spinner · CopyButton">
            <div className="space-y-5">
              <div>
                <DSLabel>IconButton (with tooltip)</DSLabel>
                <div className="flex gap-3 mt-2">
                  <IconButton label="Settings"><Settings className="h-4 w-4" /></IconButton>
                  <IconButton label="User profile"><User className="h-4 w-4" /></IconButton>
                  <IconButton label="Delete" variant="destructive"><Trash2 className="h-4 w-4" /></IconButton>
                </div>
              </div>
              <div>
                <DSLabel>Spinner sizes</DSLabel>
                <div className="flex items-center gap-4 mt-2">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                </div>
              </div>
              <div>
                <DSLabel>CopyButton</DSLabel>
                <div className="flex gap-3 mt-2">
                  <CopyButton value="npm install relay-cli" label="Copy install" />
                  <CopyButton value="pnpm run dev" />
                </div>
              </div>
            </div>
          </DSSection>

          {/* ── Form inputs ───────────────────────────────────── */}
          <DSSection title="Inputs & Forms">
            <div className="max-w-md space-y-5">
              <Field label="Project name" hint="Choose a descriptive name" required>
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
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch id="sync-demo" aria-label="Enable automatic sync" />
                <Label htmlFor="sync-demo" className="cursor-pointer">Enable automatic sync</Label>
              </div>
            </div>
          </DSSection>

          {/* ── Badges + StatusPill + FilterChip ──────────────── */}
          <DSSection title="Badges · StatusPill · FilterChip">
            <div className="space-y-5">
              <div>
                <DSLabel>Badges</DSLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge>Default</Badge>
                  <Badge variant="copper">Copper</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                </div>
              </div>
              <div>
                <DSLabel>StatusPill — all states</DSLabel>
                <div className="flex flex-wrap gap-4 mt-2">
                  <StatusPill status="healthy">Healthy</StatusPill>
                  <StatusPill status="indexing">Indexing</StatusPill>
                  <StatusPill status="error">Failing</StatusPill>
                  <StatusPill status="idle">Idle</StatusPill>
                </div>
              </div>
              <div>
                <DSLabel>FilterChips</DSLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["all", "code", "issues", "prs", "commits", "docs"].map((f) => (
                    <FilterChip
                      key={f}
                      active={activeFilter === f}
                      onClick={() => setActiveFilter(f)}
                    >
                      {f}
                    </FilterChip>
                  ))}
                </div>
              </div>
            </div>
          </DSSection>

          {/* ── Breadcrumb ────────────────────────────────────── */}
          <DSSection title="Breadcrumb">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/app">Dashboard</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="/app/projects">Projects</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>turborepo</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </DSSection>

          {/* ── Table ─────────────────────────────────────────── */}
          <DSSection title="Table (dense list style)">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Repository</TableHead>
                  <TableHead scope="col">Language</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row) => (
                  <TableRow key={row.repo}>
                    <TableCell className="font-mono text-copper">{row.repo}</TableCell>
                    <TableCell className="text-text-muted">{row.lang}</TableCell>
                    <TableCell>
                      <StatusPill status={row.status}>{row.status}</StatusPill>
                    </TableCell>
                    <TableCell className="font-mono">{row.health}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DSSection>

          {/* ── Stepper ───────────────────────────────────────── */}
          <DSSection title="Stepper (vertical)">
            <div className="max-w-sm space-y-4">
              <Stepper steps={stepperSteps} currentStep={stepperStep} />
              <div className="flex gap-2 pt-2">
                {stepperSteps.map((s) => (
                  <Button
                    key={s.id}
                    size="sm"
                    variant={stepperStep === s.id ? "primary" : "secondary"}
                    onClick={() => setStepperStep(s.id)}
                  >
                    {s.title.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </div>
          </DSSection>

          {/* ── Menu ──────────────────────────────────────────── */}
          <DSSection title="Menu">
            <Menu className="max-w-xs">
              <MenuLabel>Actions</MenuLabel>
              <MenuItem icon={<FileCode2 className="h-4 w-4" />}>View Code</MenuItem>
              <MenuItem icon={<GitBranch className="h-4 w-4" />}>View History</MenuItem>
              <MenuSeparator />
              <MenuItem icon={<Trash2 className="h-4 w-4" />} destructive>Delete project</MenuItem>
            </Menu>
          </DSSection>

          {/* ── Sheet ─────────────────────────────────────────── */}
          <DSSection title="Sheet / Drawer">
            <div className="space-y-3">
              <Button variant="secondary" onClick={() => setSheetOpen(true)}>
                Open Sheet (right side)
              </Button>
              <p className="text-xs text-text-muted">
                Focus trap active · Esc to close · aria-modal + aria-labelledby
              </p>
            </div>
            <Sheet
              open={sheetOpen}
              onClose={() => setSheetOpen(false)}
              title="Repository Settings"
              description="Configure indexing preferences for this repository."
            >
              <div className="space-y-4">
                <Field label="Branch to index">
                  <Input defaultValue="main" />
                </Field>
                <div className="flex items-center gap-3">
                  <Switch id="sheet-sync" aria-label="Auto-sync on push" />
                  <Label htmlFor="sheet-sync" className="cursor-pointer">Auto-sync on push</Label>
                </div>
                <Button variant="primary" className="w-full" onClick={() => setSheetOpen(false)}>
                  Save changes
                </Button>
              </div>
            </Sheet>
          </DSSection>

          {/* ── Toast ─────────────────────────────────────────── */}
          <DSSection title="Toast">
            <div className="flex flex-wrap gap-3">
              {(["default", "success", "error", "warning"] as const).map((v) => (
                <Button
                  key={v}
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    toast({
                      title: `${v.charAt(0).toUpperCase() + v.slice(1)} toast`,
                      description: "This notification auto-dismisses in 4 s.",
                      variant: v,
                    })
                  }
                >
                  {v}
                </Button>
              ))}
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  toast({
                    title: "Sticky toast",
                    description: "duration: 0 — stays until dismissed.",
                    duration: 0,
                  })
                }
              >
                sticky
              </Button>
            </div>
          </DSSection>

          {/* ── ConfirmDialog ─────────────────────────────────── */}
          <DSSection title="ConfirmDialog">
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setConfirmOpen(true)}
              >
                Delete with typed confirm
              </Button>
            </div>
            <ConfirmDialog
              open={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              onConfirm={() => {
                toast({ title: "Project deleted", variant: "success" });
                setConfirmOpen(false);
              }}
              title="Delete turborepo?"
              description="This action cannot be undone. All indexed data will be permanently removed."
              confirmText="delete"
              confirmLabel="Delete project"
              destructive
            />
          </DSSection>

          {/* ── Evidence / Source chips ───────────────────────── */}
          <DSSection title="Evidence & Code">
            <div className="space-y-5">
              <div>
                <DSLabel>Source chips</DSLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  <SourceChip type="file" label="auth.ts:42" />
                  <SourceChip type="commit" label="a3f9c21" />
                  <SourceChip type="pr" label="PR #184" />
                  <SourceChip type="issue" label="Issue #42" />
                  <SourceChip type="doc" label="decisions.md" />
                </div>
              </div>
              <div>
                <DSLabel>FilePath</DSLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  <FilePath path="src/workers/queue.ts" />
                  <FilePath path="crates/turborepo-lib/src/engine/builder.rs" />
                </div>
              </div>
              <div>
                <DSLabel>Keyboard shortcuts</DSLabel>
                <div className="flex gap-3 mt-2">
                  <div className="flex items-center gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></div>
                  <div className="flex items-center gap-1"><Kbd>Ctrl</Kbd><span className="text-text-muted text-xs">+</span><Kbd>Shift</Kbd><span className="text-text-muted text-xs">+</span><Kbd>P</Kbd></div>
                </div>
              </div>
              <div>
                <DSLabel>CodeBlock — syntax highlighted (lazy)</DSLabel>
                <CodeBlock
                  code={`pub fn build_execution_graph(&self) -> Result<TaskGraph, EngineError> {
    if self.has_cycles() {
        return Err(EngineError::CyclicDependency);
    }
    Ok(TaskGraph { graph: self.graph.clone() })
}`}
                  language="rust"
                  showLineNumbers
                  className="mt-2"
                />
              </div>
            </div>
          </DSSection>

          {/* ── Cards + Tabs ──────────────────────────────────── */}
          <DSSection title="Cards · Tabs · Panel">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Context</CardTitle>
                  <CardDescription>Real-time insights from your repository</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Relay indexes commits, PRs, and docs to build living context.</p>
                </CardContent>
              </Card>
              <Panel>
                <p className="font-mono text-[9px] uppercase tracking-wider text-text-muted mb-2">Panel</p>
                <p className="text-sm">Simple bordered container.</p>
              </Panel>
              <StatCard value="87" label="Context coverage" accent="%" />
            </div>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="context">Context</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="overview"><p className="text-sm mt-4">Project overview.</p></TabsContent>
              <TabsContent value="context"><p className="text-sm mt-4">Context analysis.</p></TabsContent>
              <TabsContent value="activity"><p className="text-sm mt-4">Recent activity.</p></TabsContent>
            </Tabs>
          </DSSection>

          {/* ── Interactive (Dialog + Dropdown + Tooltip) ─────── */}
          <DSSection title="Dialog · Dropdown · Tooltip">
            <div className="flex flex-wrap gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Tooltip content</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Dialog>
                <DialogTrigger asChild><Button variant="secondary">Open Dialog</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect Repository</DialogTitle>
                    <DialogDescription>Select a GitHub repository to start building context.</DialogDescription>
                  </DialogHeader>
                  <Field label="Repository URL"><Input placeholder="https://github.com/..." /></Field>
                  <DialogFooter>
                    <Button variant="secondary">Cancel</Button>
                    <Button>Connect</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">Menu<ArrowRight className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem><FileCode2 className="mr-2 h-4 w-4" />View Code</DropdownMenuItem>
                  <DropdownMenuItem><GitBranch className="mr-2 h-4 w-4" />View History</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-error"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DSSection>

          {/* ── States ────────────────────────────────────────── */}
          <DSSection title="Loading · Empty · Error states">
            <div className="space-y-8">
              <div>
                <DSLabel>Skeleton</DSLabel>
                <div className="space-y-2 mt-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <div>
                <DSLabel>Progress (default · copper)</DSLabel>
                <div className="space-y-2 mt-2">
                  <Progress value={67} aria-label="Default progress" />
                  <Progress value={42} variant="copper" aria-label="Copper progress" />
                </div>
              </div>
              <div>
                <DSLabel>Spinners</DSLabel>
                <div className="flex items-center gap-4 mt-2">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-copper" />
                    <span className="text-sm text-text-muted font-mono">Loader2 icon</span>
                  </div>
                </div>
              </div>
              <EmptyState
                icon={<Search className="h-12 w-12" />}
                title="No results found"
                description="Try adjusting your search or filters."
                action={<Button variant="secondary" size="sm">Clear filters</Button>}
              />
              <ErrorState
                title="Failed to load"
                description="An error occurred while loading this content."
                onRetry={() => toast({ title: "Retrying…", variant: "default" })}
              />
            </div>
          </DSSection>

          {/* ── Avatars ───────────────────────────────────────── */}
          <DSSection title="Avatars · Brand marks">
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <Avatar><AvatarFallback>AC</AvatarFallback></Avatar>
              <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
              <Avatar className="h-12 w-12"><AvatarFallback>LG</AvatarFallback></Avatar>
            </div>
            <div className="flex flex-wrap items-center gap-8 border border-border bg-surface-accent p-5">
              <RelayMark />
              <RelayMark compact />
              <RelayMark showWordmark={false} />
              <div className="text-copper"><RelayMark compact /></div>
            </div>
          </DSSection>

        </div>
      </div>
    </div>
  );
}

/* ── Exported page (wraps with ToastProvider) ─────────────────── */

export function DesignSystemPage() {
  if (import.meta.env.PROD) return null;
  return (
    <ToastProvider>
      <DesignSystemInner />
    </ToastProvider>
  );
}
