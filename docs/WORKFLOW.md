# Workflow

Two loops. Everything in this repo exists to serve them.

---

## Loop A — building a screen from a design

```
  design-refs/screen.png
        │
        ▼
  ① read registry.json ──► ② map design → existing canon components
        │
        ▼
  ③ GAP REPORT  ◄── the checkpoint. Nothing is built before this.
        │
        ├── everything maps ──────────► ④ build screen in src/app/screens/
        │
        └── something missing ────────► Loop B, then return here
```

**Step ③ is the whole point.** Before any code exists, you are told:

> Maps cleanly: page title, tabs, table, status badges, pagination.
> Missing: a date-range filter and a split-button for "Create ▾".
> Build those two first, or drop them from v1?

That checkpoint is what keeps the canon authoritative. Without it, gaps get
papered over with one-off markup and the canon quietly stops being the truth.

**Step ④** produces a screen that is pure composition — roughly:

```tsx
import { Stack, PageHeader, Tabs, DataTable, StatusBadge } from '@canon';

export function ActiveJobCards() {
  return (
    <Stack gap="lg">
      <PageHeader title="Active Job Cards" actions={<Button>Create</Button>} />
      <Tabs items={TABS} value={tab} onChange={setTab} />
      <DataTable columns={COLUMNS} rows={rows} />
    </Stack>
  );
}
```

No CSS. No colours. If a screen file starts accumulating class names, a
component is missing.

---

## Loop B — admitting a component to the canon

```
  gap identified
        │
        ▼
  ① build in src/canon/_incoming/<Name>/    ← quarantined; screens cannot import it
     ├── <Name>.tsx
     └── <Name>.stories.tsx                 ← every state, not just the happy one
        │
        ▼
  ② registry.json entry, "status": "incoming"
        │
        ▼
  ③ YOU REVIEW at localhost:6006 — in isolation
        │
        ├── not right ──► iterate on the story, back to ③
        │
        └── approved ──► ④ admit
                            git mv src/canon/_incoming/<Name> src/canon/components/<Name>
                            + export from src/canon/index.ts
                            + flip status to "stable"
                            + npm run canon:docs
```

### Why review in isolation, not inside the screen

Inside a screen a component is seen once, at one size, with one piece of content.
In the canon you see it hovered, disabled, empty, loading, and with text three
times longer than the design showed. That is where the flaws are — and finding
them before admission is the difference between a design system and a pile of
components.

### The stories that matter

A story set showing only the default state is worthless. Cover:

- every value of every variant axis — and, where two axes interact, the grid.
  `Text` needs `size` x `weight` as one story, not two lists: 500 against 600 at
  10px is the pair that fails first, and only the crossing shows it
- hover / focus / active / disabled
- empty, loading and error states where applicable
- **overflow** — the longest realistic content
- the smallest and largest size it must survive

---

## Cadence

| When | Do |
| --- | --- |
| Before a screen | Read the registry. Report gaps. |
| Before admitting | Review in the canon. |
| Before claiming done | `npm run check`. |
| After registry changes | `npm run canon:docs`. |
