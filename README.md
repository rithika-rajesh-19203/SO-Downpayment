# SO Advance Payment — prototype

A clickable prototype of **advance (down) payments on Sales Orders** in Zoho
Books, built on the ZF Design Cannon. Every screen is composed from existing
canon components — no new components, no screen-level styling.

```bash
npm install
npm run dev      # → http://localhost:5173 — opens on New Sales Order
```

## What it covers

| Screen | File | What to try |
| --- | --- | --- |
| New Sales Order | `src/app/screens/NewSalesOrder.tsx` | Tick **Collect advance payment**, switch Percentage / Fixed Amount, enter a value. The advance shows in the summary strip, the totals card and the footer. Save with no customer to see validation. |
| Sales Order details | `src/app/screens/SalesOrderDetails.tsx` | The **What's Next** card changes with the order's state. **SO Advance** tab lists advance payments; **Record Advance Payment** opens the dialog. **Convert to Invoice** applies the advance to the new invoice. |
| Data | `src/app/data/sales-orders.ts` | Seed orders in every state: awaiting advance, partly paid, fully paid, invoiced, no advance, draft. |

Behaviour follows NetSuite's model from the competitor study: an order that
asks for an advance stays **Awaiting Advance** until it is paid in full, then
becomes **Confirmed**; on conversion the advance is applied to the invoice.

Stubs: Share Payment Link, and Record Payment / Create Shipment after invoicing.

---

# ZF Design Cannon

A canonical design system, and the web application built from it — one repo,
with the boundary between them **mechanically enforced**.

```bash
npm install
npm run dev      # application → http://localhost:5173
npm run canon    # the canon   → http://localhost:6006
```

## The two surfaces

| Surface | Port | What it is |
| --- | --- | --- |
| **Application** | 5173 | Real screens, composed from canon components. Zero styling decisions. |
| **The canon** | 6006 | Every component in isolation, all states. Where components are reviewed and admitted. |

Both load the same `src/index.css`, so they can never disagree about tokens.

## Why it holds together

Five mechanisms, all checked by `npm run check`:

1. **A layered token model** — `primitives → semantic → component`, one
   direction. `tokens/primitives.css` and `tokens/scale.css` are the only files
   allowed a raw value, and **nothing outside `tokens/` may reference a
   primitive**: components consume semantic roles only, so retheming works.
   Inside `scale.css`, a retired size or a second line-height at one size fails
   the build — the file allowed to hold dimensions is where the drift began.
2. **Two independent theme axes** — `data-theme` (light/dark) and `data-brand`
   (hue), applicable to any element rather than just `:root`. Never fused: the
   source library fused them into four modes, duplicated two thirds of its table,
   and the one genuinely 2-D token had already drifted.
3. **One public API** — `src/canon/index.ts`. Screens import `'@canon'` and
   nothing else, so component internals stay free to refactor.
4. **One component list** — `src/canon/registry.json`, cross-checked against the
   real exports and the folders on disk. It cannot drift.
5. **An antechamber** — `src/canon/_incoming/` holds proposed components where
   screens cannot reach them until you admit them.

Documentation asks nicely; `npm run check` fails the build.

## Where things live

| Path | Holds |
| --- | --- |
| `src/canon/tokens/` | The token layer. Colour in `primitives.css`, roles in `semantic.css`, brand hue in `brand.css`, component pairs in `badge.css`, Tailwind mapping in `theme.css` — **all five generated** by `npm run tokens:sync`. Dimension in `scale.css`, hand-authored. |
| `src/canon/icons/` | `paths.ts` is the roster; `geometry.generated.ts` is the geometry, produced by `npm run icons:sync` from `design-refs/icons/`. `Icon.tsx` owns slot size, tone and accessibility. |
| `src/canon/primitives/` | `Stack`, `Inline`, `Text`, `Surface`. |
| `src/canon/components/` | Admitted components, one folder each. |
| `src/canon/_incoming/` | Proposed components. Quarantined — the build fails if anything imports from here. |
| `src/app/` | Screens. Composition only, zero styling. |
| `public/brand/` | Product wordmarks and marks that ship. |
| `design-refs/` | `zf-design-cannon.md` (the 24 components), `zf-colours.md` (the 424 colour values), `zf-scales.md` (type, weight, space, radius) and `zf-icons.md` (the 51 glyphs). Inputs, never shipped. |
| `design-refs/icons/` | **Drop icon SVGs here**, then `npm run icons:sync`. Figma's exports need no renaming. |

## State of play

The foundations are built. **Two of the 24 components exist** — `StatusBadge`
admitted, `Button` in `_incoming/` awaiting review. `docs/BACKLOG.md` carries the
24-component queue in dependency order, the palette and icon exports still
needed, and the six decisions that are blocking.

Short version: the **token layer is complete**. Colour is 424 values (200
primitives, 107 roles × 2 modes, 5 brand tokens × 2 hues), generated from
`design-refs/zf-colours.md` by `npm run tokens:sync` and verified alias by alias.
Dimension is 9 type sizes × 4 weights, 12 spacing steps and 7 radii, hand-authored
in `scale.css` under one `--zf-` prefix and guarded against every retired value by
`npm run check`.
**All 51 icon glyphs render** — 47 ingested from `design-refs/icons/` by
`npm run icons:sync`, plus the four `chevron` directions still using geometry
derived from the md. The ingest independently reproduces the Figma audit: 17
stroked, 34 filled, one stroke weight.

**`StatusBadge` is admitted** — the first of the 24, exported from `@canon` and
browsable at `localhost:6006` under **Components/StatusBadge**. 28 variants, all
28 Light pairings verified against the md's own hexes *and* its stated contrast
ratios, all 56 pairings passing AA in both panes.

Components are built **one at a time, from a per-component md plus the Figma
link** — the way `zf-colours.md`, `zf-scales.md`, `zf-icons.md` and
`zf-button.md` were. The canon's §2.x sections are the audit of a component, not
its specification; building from them alone does not work.

Two semantic-layer decisions block several components at once:
`primary/default` cannot carry white text (4.32:1), and no `border/*` role
reaches 3:1.

## Working on it

See **`docs/WORKFLOW.md`** for the two loops (build a screen / admit a
component), **`docs/BACKLOG.md`** for the queue and what is blocked,
**`docs/COMPONENTS.md`** for what exists, and **`CLAUDE.md`** for the rules
Claude follows.

Review every component in **all four pane x hue combinations** before admitting
it. Two components in the source were invisible in Dark, and every screenshot
had hidden it.

Drop design references in `design-refs/` and ask for the screen. You get a gap
report — what maps onto existing components and what does not — before any code
is written.
