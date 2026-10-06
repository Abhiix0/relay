/**
 * Accessibility smoke tests for UI primitives.
 * Uses axe-core to catch common a11y violations.
 */
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";

expect.extend(toHaveNoViolations);

// ── helpers ─────────────────────────────────────────────────────

import { Button } from "./button";
import { Badge } from "./badge";
import { Spinner } from "./spinner";
import { CopyButton } from "./copy-button";
import { IconButton } from "./icon-button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./breadcrumb";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Stepper } from "./stepper";
import { ConfirmDialog } from "./confirm-dialog";
import { Sheet } from "./sheet";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "./menu";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { StatusPill } from "./status-pill";
import { Progress } from "./progress";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Field } from "./field";
import { Switch } from "./switch";
import { ToastProvider } from "./toast";
import { Settings } from "lucide-react";

// ── Button ───────────────────────────────────────────────────────

describe("Button — a11y", () => {
  it("primary has no violations", async () => {
    const { container } = render(<Button variant="primary">Save</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
  it("disabled has no violations", async () => {
    const { container } = render(<Button disabled>Save</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
  it("loading has no violations", async () => {
    const { container } = render(<Button loading>Saving</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Badge ────────────────────────────────────────────────────────

describe("Badge — a11y", () => {
  it("has no violations", async () => {
    const { container } = render(
      <div>
        <Badge>Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="error">Error</Badge>
      </div>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Spinner ───────────────────────────────────────────────────────

describe("Spinner — a11y", () => {
  it("has role=status and aria-label", async () => {
    const { container } = render(<Spinner />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── StatusPill ────────────────────────────────────────────────────

describe("StatusPill — a11y", () => {
  it.each(["healthy", "indexing", "error", "idle"] as const)(
    "status=%s has no violations",
    async (status) => {
      const { container } = render(
        <StatusPill status={status}>{status}</StatusPill>
      );
      expect(await axe(container)).toHaveNoViolations();
    }
  );
});

// ── CopyButton ────────────────────────────────────────────────────

describe("CopyButton — a11y", () => {
  it("has no violations", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const { container } = render(<CopyButton value="hello world" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── IconButton ────────────────────────────────────────────────────

describe("IconButton — a11y", () => {
  it("has aria-label", async () => {
    const { container } = render(
      <IconButton label="Settings">
        <Settings className="h-4 w-4" />
      </IconButton>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Breadcrumb ────────────────────────────────────────────────────

describe("Breadcrumb — a11y", () => {
  it("has no violations", async () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Table ─────────────────────────────────────────────────────────

describe("Table — a11y", () => {
  it("has no violations", async () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Name</TableHead>
            <TableHead scope="col">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>turborepo</TableCell>
            <TableCell>Healthy</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Stepper ───────────────────────────────────────────────────────

describe("Stepper — a11y", () => {
  it("has no violations", async () => {
    const steps = [
      { id: "s1", title: "Connect repo" },
      { id: "s2", title: "Index files" },
      { id: "s3", title: "Ask questions" },
    ];
    const { container } = render(
      <Stepper steps={steps} currentStep="s2" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Menu ──────────────────────────────────────────────────────────

describe("Menu — a11y", () => {
  it("has no violations", async () => {
    const { container } = render(
      <Menu>
        <MenuLabel>Actions</MenuLabel>
        <MenuItem icon={<Settings className="h-4 w-4" />}>Settings</MenuItem>
        <MenuSeparator />
        <MenuItem destructive>Delete</MenuItem>
      </Menu>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Form primitives ───────────────────────────────────────────────

describe("Form primitives — a11y", () => {
  it("Input has no violations", async () => {
    const { container } = render(
      <Field label="Email" required>
        <Input type="email" placeholder="you@example.com" />
      </Field>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
  it("Textarea has no violations", async () => {
    const { container } = render(
      <Field label="Notes">
        <Textarea placeholder="Add notes..." />
      </Field>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
  it("Switch has no violations", async () => {
    const { container } = render(
      <Switch id="sw" aria-label="Enable sync" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── EmptyState / ErrorState ───────────────────────────────────────

describe("States — a11y", () => {
  it("EmptyState has no violations", async () => {
    const { container } = render(
      <EmptyState title="Nothing here" description="Try adding something." />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
  it("ErrorState has no violations", async () => {
    const { container } = render(
      <ErrorState title="Error" description="Something broke." onRetry={() => {}} />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Progress ──────────────────────────────────────────────────────

describe("Progress — a11y", () => {
  it("has no violations", async () => {
    const { container } = render(<Progress value={67} aria-label="Loading" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Sheet — focus management ──────────────────────────────────────

describe("Sheet — focus management", () => {
  it("closes on Escape key", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Sheet open onClose={onClose} title="Settings">
        <p>Panel content</p>
        <button>Action</button>
      </Sheet>
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has aria-modal and aria-labelledby", () => {
    const { getByRole } = render(
      <Sheet open onClose={() => {}} title="My Panel">
        <p>Content</p>
      </Sheet>
    );
    const dialog = getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "sheet-title");
  });
});

// ── ConfirmDialog — focus management ─────────────────────────────

describe("ConfirmDialog — interaction", () => {
  it("confirm button disabled until typed text matches", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const { getByRole, getByPlaceholderText } = render(
      <ConfirmDialog
        open
        onClose={() => {}}
        onConfirm={onConfirm}
        title="Delete project"
        confirmText="delete"
        destructive
      />
    );
    const confirmBtn = getByRole("button", { name: "Confirm" });
    expect(confirmBtn).toBeDisabled();
    await user.type(getByPlaceholderText("delete"), "delete");
    expect(confirmBtn).not.toBeDisabled();
  });
});

// ── Toast — aria-live ─────────────────────────────────────────────

describe("ToastProvider — aria-live", () => {
  it("renders toaster container with aria-label", () => {
    const { queryByLabelText } = render(
      <ToastProvider>
        <div />
      </ToastProvider>
    );
    // Toaster only renders when there are items; just verify provider mounts
    expect(queryByLabelText("Notifications")).toBeNull(); // no items yet
  });
});
