# lib/api — Data Layer

All server communication flows through this directory. The rule is **additive-only**: existing exports never change shape; new endpoints are added alongside.

---

## Structure

```
lib/api/
├── client.ts          # fetch wrapper, ApiError, schema validation
├── query-keys.ts      # centralised TanStack Query key factories
├── README.md
├── types/             # domain interfaces (no runtime Zod)
│   ├── index.ts       # barrel
│   ├── user.ts
│   ├── project.ts
│   ├── artifact.ts    # Artifact, Source, ActivityEvent
│   ├── ask.ts
│   ├── decision.ts
│   ├── onboarding.ts
│   ├── handoff.ts
│   ├── sync.ts
│   ├── repository.ts
│   ├── search.ts
│   └── settings.ts
└── hooks/             # TanStack Query hooks, one file per domain
    ├── index.ts       # barrel
    ├── auth.ts
    ├── projects.ts
    ├── artifacts.ts
    ├── ask.ts
    ├── decisions.ts
    ├── onboarding.ts
    ├── handoff.ts
    ├── sync.ts
    ├── repository.ts
    └── search.ts
```

---

## Adding a new endpoint — checklist

### 1. Type (`types/<domain>.ts`)

```ts
// types/widget.ts
export interface Widget {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
}
```

Add the export to `types/index.ts`.

### 2. Query key (`query-keys.ts`)

```ts
widgets: {
  all: (projectId: string) => ["projects", projectId, "widgets"] as const,
  detail: (projectId: string, id: string) =>
    ["projects", projectId, "widgets", id] as const,
},
```

### 3. MSW handler (`mocks/handlers/<domain>.ts`)

```ts
export const widgetHandlers = [
  http.get("/api/v1/projects/:id/widgets", ({ params }) => {
    return HttpResponse.json(mockWidgets.filter(w => w.projectId === params.id));
  }),
];
```

Add to `mocks/handlers/index.ts`.

### 4. Mock data (`mocks/data/<domain>.ts`)

```ts
export const mockWidgets: Widget[] = [{ id: "w_1", projectId: "turborepo", ... }];
```

Add to `mocks/data/index.ts`.

### 5. Hook (`hooks/<domain>.ts`)

```ts
export function useWidgets(projectId?: string) {
  return useQuery({
    queryKey: queryKeys.widgets.all(projectId ?? ""),
    queryFn: () => api.get<Widget[]>(`/projects/${projectId}/widgets`),
    enabled: Boolean(projectId),
  });
}
```

Add to `hooks/index.ts`.

---

## Schema validation

Pass a Zod schema as the second argument to `api.get` to enable runtime validation:

```ts
import { z } from "zod";

const widgetSchema = z.object({ id: z.string(), name: z.string() });

api.get<Widget>("/projects/x/widgets/1", widgetSchema);
```

- **Dev**: a failed parse throws `ApiError { code: "SCHEMA_MISMATCH" }` immediately.
- **Prod**: logs once via `lib/log` and falls back to the raw response to avoid breaking the UI.

---

## Error handling

`ApiError` carries:

| Field | Type | Description |
|-------|------|-------------|
| `status` | `number` | HTTP status code (`0` for schema errors) |
| `code` | `string` | Machine-readable code from server or `"SCHEMA_MISMATCH"` |
| `requestId` | `string` | Correlation ID from `X-Request-Id` |
| `retryable` | `boolean` | `true` for 429 and 5xx; `false` for all other 4xx |

The `QueryClient` in `app/providers.tsx` retries only `retryable` errors, up to 2 attempts with exponential back-off.

---

## Mock gating

Set `VITE_USE_MOCKS=false` in `.env.local` to bypass MSW and hit a real API. When mocks are disabled, the MSW bundle is never loaded (dynamic import in `main.tsx`).
