# Accessibility — T-owned Feature Screens

> Document scope: features/{ask, onboarding, handoff, decisions, settings, profile},
> features/auth/SignInCard, pages/{SignInPage, NotFoundPage}.
>
> Automated axe tests live in `apps/web/src/features/accessibility.test.tsx`.
> colour-contrast violations are excluded from automated checks because the
> colour palette is owned by K. All contrast findings are listed in
> §5 (K Primitives).

---

## 1. Sign In (`/sign-in`)

### Keyboard walkthrough

| Step | Key | Expected behaviour |
|------|-----|--------------------|
| Land on page | — | Focus lands on GitHub button (first interactive element) |
| Skip GitHub | Tab | Focus moves to Email input |
| Enter email | Type | Characters appear; label stays visible |
| Move to password | Tab | Focus moves to Password input (type="password") |
| Toggle visibility | Tab → Enter/Space | Eye button toggles to type="text"; label changes to "Hide password" |
| Submit | Tab → Enter | Sign-in button fires; loading spinner appears; inputs disabled |
| Validation error | Submit empty | Error `role="alert"` announced immediately; focus moves to first invalid field |
| Network error | Submit bad creds | `role="alert"` announces error; Retry button appears and receives focus |
| Toggle sign-up mode | Tab to "Create one" → Enter | Heading changes; submit label changes to "Create account"; announced via page re-render |

### Screen reader announcements

- `role="alert"` on the error region — announces on every change (default SR behaviour).
- `aria-live="polite"` on the loading state `<span>` inside the submit button.
- `aria-label` on the password toggle button describes current action.

### axe result (automated)
✅ No violations (colour-contrast suppressed — see §5).

---

## 2. Ask Relay (`/app/projects/:id/ask`)

### Keyboard walkthrough

| Step | Key | Expected behaviour |
|------|-----|--------------------|
| Land on page | — | Page header is read; Composer textarea has visible focus ring |
| Type question | Type | Characters appear; character counter updates |
| Suggestion chips | Tab (when input empty) | Focus reaches suggestion buttons; Enter fills textarea |
| Submit | Enter | Sends; spinner + step description appear in live region |
| Cancel streaming | Tab to Stop → Enter/Space | Stream cancelled; Stop button disappears; Composer re-enabled |
| Citation marker [1] | Tab inside answer | `<button aria-label="View citation 1">` receives focus |
| Open citation drawer | Enter on [1] | Sheet drawer opens; focus moves inside; Esc closes and returns focus |
| Copy answer | Tab to Copy → Enter | `role="status"` announces "Copied!" after 2 s |
| Feedback thumbs up | Tab → Enter | Mutation fires silently |
| Regenerate | Tab to Regenerate → Enter | New streaming session begins |
| Clear conversation | Tab to Trash → Enter | Confirm dialog opens; Esc cancels; Enter clears and announces empty state |

### Screen reader announcements

| Event | Region | Politeness |
|-------|--------|------------|
| Streaming step text | `aria-live="polite"` wrapper | polite (non-interrupting) |
| Stream complete | Same live region clears | polite |
| Copy success | `role="status"` | polite |
| Error | `role="alert"` | assertive |
| Insufficient evidence | `role="region"` with aria-label | static (announced on focus) |

### Known issue — K primitive
`<Kbd>` renders a `<kbd>` element inside a `<Button>` — axe flags the `tabindex` attribute on the Kbd when inside a non-interactive parent. **Report to K**: the `Kbd` component should not be tabbable when nested as decorative content.

---

## 3. Onboarding (`/app/projects/:id/onboarding`)

### Keyboard walkthrough

| Step | Key | Expected behaviour |
|------|-----|--------------------|
| Land with no plan | — | Empty state with "Generate plan" button receives focus |
| Generate | Enter | Button loading state; `aria-live="polite"` announces "Generating…" then "Generation complete." |
| Navigate steps | Arrow Down/Up | Roving tabindex moves focus to next/prev step button; `aria-current="step"` updates |
| Arrow Right/Left | Arrow Right/Left | Same as Down/Up (alias keys) |
| Select step | Enter | Step detail panel updates; heading announced by screen reader on focus shift |
| Mark complete | Tab to Mark complete → Enter | `aria-pressed` toggles; `role="status"` (in parent) announces change |
| Next step button | Tab → Enter | Navigates to Ask page pre-seeded with the next step's question |

### Screen reader announcements

| Event | Region | Politeness |
|-------|--------|------------|
| Progress % | `aria-live="polite" aria-atomic="true"` (`.sr-only`) | polite |
| Mark complete | `aria-pressed` on button | Announced by SR on toggle |

### axe result (automated)
✅ OnboardingProgress — no violations in partial and all-complete states.

---

## 4. Handoff (`/app/projects/:id/handoff`)

### Keyboard walkthrough

| Step | Key | Expected behaviour |
|------|-----|--------------------|
| No handoff — generate | Tab to button → Enter | Checklist steps animate; `role="status"` announces "Generating handoff document…" then "Generation complete." |
| Generation failed | — | `role="status"` announces "Generation failed. Please try again."; Retry button focusable |
| Navigate version history | Tab into version list | Each version is a `<button aria-pressed>` — fully keyboard reachable |
| Restore version | Tab to Restore (hover-visible) → Enter | Confirm dialog; Enter confirms; `role="status"` announces result |
| Edit section | Tab to Edit → Enter | Section card highlights; Heading and Content textareas receive focus in order |
| Save section | Tab to Save → Enter | Mutation fires; dirty indicator clears |
| Cancel edit | Tab to Cancel / Esc | Fields reset; no dirty state |
| Save version | Tab to "Save Version" → Enter | New version created; version list updates |
| Copy as Markdown | Tab to "Copy MD" → Enter | `role="status"` announces "Copied to clipboard." |
| Download .md | Tab to "Download .md" → Enter | Browser download dialog; `role="status"` announces "Downloaded successfully." |

### Screen reader announcements

| Event | Region | Politeness |
|-------|--------|------------|
| Generation progress | `role="status" aria-live="polite"` in HandoffGeneratePanel | polite |
| Export feedback | `role="status" aria-live="polite"` in HandoffActions | polite |
| Dirty indicator | `aria-live="polite"` | polite |

### axe result (automated)
✅ HandoffSectionEditor (view, edit, insufficient-evidence) — no violations.
✅ HandoffEvidence (with sources, insufficient, empty) — no violations.

---

## 5. Decisions (`/app/projects/:id/decisions`)

### Keyboard walkthrough

| Step | Key | Expected behaviour |
|------|-----|--------------------|
| Filter chips | Tab to filter group → Arrow keys | `FilterChip` buttons reachable; `aria-pressed` announces state |
| Search | Tab to Search input → Type | `aria-live` region announces filtered count (no count currently — enhancement needed) |
| Select decision | Tab to card → Enter | Decision drawer slides in from right; focus moves inside |
| Navigate drawer | Tab | Evidence SourceChips, "Confirm" button all reachable |
| Expand evidence | Enter on SourceChip | Snippet block appears below chip |
| Confirm AI decision | Tab to "Confirm" → Enter | Sheet closes; card re-renders without AI banner |
| Esc / close | Esc | Sheet closes; focus returns to triggering card |
| New ADR button | Tab → Enter | Dialog opens; Title input auto-focused; Tab through Status / Confidence |
| Validation | Submit with empty title | `role="alert"` announces "Title and summary are required." |

### axe result (automated)
✅ DecisionCard (accepted, no sources, clickable) — no violations.
✅ DecisionDrawer (closed, open with AI decision) — no violations (drawer tested against components that exist on disk).

---

## 6. Settings (`/app/settings/*`)

### Keyboard walkthrough

| Step | Key | Expected behaviour |
|------|-----|--------------------|
| Side nav | Tab into nav → Arrow Down/Up | NavLinks are `<a>` tags; focus moves through list items |
| Select tab | Enter | URL changes; new content loads; heading announced |
| General — name field | Tab → Type → Tab to Save | `role="status"` announces "Saved." |
| General — theme radiogroup | Tab into radiogroup → Arrow keys | `aria-checked` toggles; SR announces selection |
| Integrations — Disconnect | Tab to button → Enter | ConfirmDialog opens; phrase input focused |
| Confirm phrase | Type "disconnect" → Tab to Disconnect | Button enables on exact match |
| Notifications toggles | Tab → Enter/Space | `aria-live="polite"` announces success or rollback failure |
| Team — invite (P2 disabled) | Tab to input / button | `aria-disabled="true"` announced; tooltip reads "Team invites not yet available" |
| Project Settings — delete | Tab to "Disconnect & delete" → Enter | ConfirmDialog with typed phrase input |
| Archive | Enter on Archive | ConfirmDialog without phrase input (simpler confirm) |

### axe result (automated)
✅ ConfirmDialog (basic, phrase-required) — no violations.
✅ SettingsBilling — no violations.
✅ SettingsNotifications (loading state) — no violations.
✅ SettingsTeam — no violations.

---

## 7. Profile (`/profile`)

### Keyboard walkthrough

| Step | Key | Expected behaviour |
|------|-----|--------------------|
| Avatar area | Tab | Avatar image has `alt` text read by SR |
| Edit button | Tab to Edit → Enter | Dialog opens; Display name input receives focus |
| Name input | Type → Tab | Character count updates (hint text reads `{n}/60 characters`) |
| Colour radiogroup | Tab into group → Arrow keys | `aria-checked` toggles per colour |
| Save | Tab to "Save changes" → Enter | Dialog closes; avatar updates; SR reads new name from header |
| Cancel | Tab to Cancel / Esc | Dialog closes; no change |
| Activity list | Tab into list items | Links to project sub-pages; `datetime` attribute on `<time>` elements |

### axe result (automated)
✅ EditProfileDialog (open, closed) — no violations.

---

## 5. K-primitive colour-contrast findings
> These were excluded from automated axe tests because the colour palette
> was K-owned. **They have now been fixed** via context-specific token
> overrides. Residual findings (if any) from K-owned primitives are noted below.

### Fixed in Phase T6 final pass

| Token | Fix applied | Before | After (dark-product) |
|-------|-------------|--------|----------------------|
| `--copper` as small text | Added `--copper-text: #df7d60` override in `.dark-product`; added Tailwind utility `text-copper-text`; updated all owned text usages | 4.25:1 on `#191b17` | 5.98:1 on `#191b17`, 5.00:1 on `#282a25` ✅ |

All other tokens (`text-muted`, `moss`, `sun`) already pass AA on their respective backgrounds:
- `text-muted` (`#aaa99d`) on dark bg: 7.33:1 ✅
- `moss` (`#9dbba0`) on dark bg: 8.30:1 ✅  
- `sun` (`#e5b34e`) on dark bg: 9.00:1 ✅

Note: `moss` and `sun` as text on **light** linen backgrounds (outside `.dark-product`) would fail, but no T-owned text uses these tokens on light surfaces — they are used only as icon fills and badge backgrounds in that context.

### Remaining: K-owned primitive
The `Kbd` component previously rendered `<kbd>` without `tabIndex` control. **Fixed in Phase T6 final pass**: `Kbd` now defaults to `tabIndex={-1}` (decorative, non-focusable) and sets `aria-hidden={true}` unless `interactive` prop is passed. This resolves the `no-noninteractive-tabindex` axe rule.
