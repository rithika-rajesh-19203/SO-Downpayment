# ZF Design Cannon — working rules

A canonical design system, and the application built from it, in one repo. The
application is assembled **exclusively** from canon components. Screens are
composition; every design decision lives in the canon.

The design contract is `design-refs/`, all read from Figma and never invented —
`zf-design-cannon.md` (24 components, 41 open items), `zf-colours.md` (424 colour
values), `zf-scales.md` (type, weight, space, radius), `zf-icons.md` (51 glyphs),
`zf-button.md` (the 208-variant button family), `zf-radio.md` and
`zf-input-field.md`. Per-component files supersede
the canon where they disagree: they are newer and measured. When Figma changes, those change, then the code changes. Never the
other way round.

Where `zf-design-cannon.md` §1.4 and `zf-scales.md` disagree about type,
**`zf-scales.md` wins** — its Divergences table records all four cases and why.

## Every screen starts as the shell

**`AppShell` is the default, not an option.** "Build me a screen" means the
shell first — `Nav` on the left, `TopBar` on top, the requested design inside
the body — and only then the body content. Do not build a bare page and add
chrome later; the shell is what makes a screen part of the application rather
than a mockup of one.

```tsx
<AppShell nav={<Nav …/>} topBar={<TopBar …/>}>
  {/* the requested design goes here, and nowhere else */}
</AppShell>
```

`src/app/data/books.tsx` already holds the nav tree, the product mark and the
bar actions, so the two chrome slots are one import each. A new screen adds a
file under `src/app/screens/` and nothing else.

The body is the only part that varies, and it is **composed from `@canon` and
from nothing else** — every colour, size, radius and space comes from a
component or a token. A screen that needs a look the canon does not have is a
gap in the canon, not a licence to write CSS in the screen: build the component
(see below), then compose it.

Ask before skipping the shell. A print view, an auth page or an embedded widget
may legitimately not want it — everything else does.

## Every list view is the same list view

A second list view is **not** a design exercise. `Purchases → Purchase Orders`
is the reference implementation and the next one composes the same parts in the
same order — only the columns, the data and the labels change.

```tsx
<AppShell nav={<Nav …/>} topBar={<TopBar …/>}>
  <PageChrome bar={selecting ? <ActionBar …/> : undefined}>
    <PageHeader type="list" views={…} cta={…} trailing={[more, filter]} />
  </PageChrome>

  <Menu anchor={moreRef.current} … />          {/* the ⋯, with sub-menus */}

  <Surface tone="default" pad={0} radius="none" className="flex-1 min-h-0">
    <Table placement="page" selection={…} sort={…} onConfigure={…} … />
  </Surface>

  <ColumnConfig … />                            {/* which renders a Modal */}
</AppShell>
```

Nine things carry over, and each one exists because getting it wrong was found
by measuring rather than by looking:

| | |
| --- | --- |
| `PageChrome` around the header | one fixed cell so nothing shifts when the bar swaps in; the header is `hidden`, never unmounted; focus never crosses |
| `Surface … flex-1 min-h-0` | bounded, so the **table** scrolls and the sticky chrome and header stay put |
| `Table placement="page"` | full-bleed, `pe-10` gutters, the header sticky, the config cell a sticky 36 square |
| the identifying column | `Text tone="link"` — `primary/text`, 5.92:1. `primary/default` fails at 13px |
| a status column | `StatusBadge`, never a coloured `Text`. Extend its variants before adding a component |
| a person or vendor | `Avatar` — the tint is hashed from the name, never chosen |
| a numeric column | `align: 'end'`, which moves the header **and** the data. Moving one is §2.24.2's defect |
| sorting | controlled. The table knows which column; it does not know how to compare two rows |
| every overlay | `Menu` for a dropdown, `Modal` for a dialog. Both already solve focus, Escape, click-outside and the scroll lock |

If a list view needs something this list does not have, that is a gap in the
canon — report it, build the component, then compose it. Do not solve it in the
screen.

## Every detail view is the same detail view

A row in a list view opens a detail view, and `Sales → Invoices → INV-4318` is
the reference implementation. Two columns: the **mini list** you arrived
through, and the **record**. Only the fields, the toolbar actions and the tab
labels change.

```tsx
<SplitView list={<MiniList … bar={selecting ? <ActionBar density="compact" …/> : undefined} />}>
  <PageHeader type="detail" title={record.number} parent={…} onBack={…} />
  <DetailsToolbar groups={TOOLBAR} overflow={{ ref: moreRef, … }} />
  <Menu anchor={moreRef.current} align="start" emphasis="strong" entries={MORE} />

  <Surface tone="canvas" pad={0} radius="none" className="flex-1 min-h-0 overflow-y-auto">
    <Stack gap={8} className="p-section">
      <Surface pad={10} radius="card" border="default">…</Surface>       {/* section 1 */}
      <Surface pad={0}  radius="card" border="default" className="overflow-hidden">
        <Tabs items={…} trailing={<Segmented size="sm" …/>}>…</Tabs>     {/* section 2 */}
      </Surface>
    </Stack>
  </Surface>
</SplitView>
```

**The mini list is where you came from, not a navigation rail.** It is shown
because the user arrived through a list view, so it lists that view's records
and its selection drives the route. A detail view opened any other way — a
search result, a deep link — has no list to show and should render the record
column alone.

| | |
| --- | --- |
| `SplitView` | each column scrolls on its own; `min-w-0` on the record, or a wide table shoves the 353 list off the left edge |
| `MiniList` rows | fixed **99**, so 400 of them can be virtualised. The active row is `surface/hover`, **not** `surface/selected` — that role is 1.02:1 in Dark |
| a status in a row | `StatusBadge`, never coloured text. Overdue is the **orange** `overdue`, not a red one: it is collectable, not over |
| the bulk bar | in the **mini list's own toolbar**, on the same side as the checkboxes that filled it, and `density="compact"` — 353px has room for the count and nothing else |
| `PageHeader type="detail"` | title, parent link, back. **No actions and no CTA** — they are all toolbar items |
| `DetailsToolbar` | four actions out, the rest behind the `⋯`. A rule between every pair, owning all 8 of the space either side; every glyph `tone="inherit"` so an icon is exactly its label's colour |
| its `⋯` | a `Menu` with `align="start"` (the trigger is on the left) and `emphasis="strong"` |
| sections | `Surface radius="card"` — 10, a named role, because 10 is a **retired** radius |
| the tabbed section | `pad={0}` + `overflow-hidden`, or the tab strip's rule stops short of the card's edges |
| the view switch | `Segmented size="sm"` in the tabs' `trailing` slot. **Not a fourth tab** — "PDF" is another rendering of what you are reading, not another thing to read |

**Two selections coexist and must never be confused.** `activeId` is the record
being *read* — the route. `selection` is the records being *acted on* — the
checkboxes. Ticking a box must not navigate, and the record on the right stays
exactly where it was.

**The details toolbar stays up during a bulk selection.** The bar is over in the
mini list, so the columns do the disambiguating: the left owns the ticked
records, the right owns the one being read. It only steps aside when the bar
shares its column.

**A fill that is about to hold text uses the `/hover` role, never `/default`.**
Landed on three times in this family — the strong menu row, its danger row, the
tab count. `primary/default` is 4.32:1 under white and fails 1.4.3; `/hover` is
5.48. `/default` is for lines and glyphs, which answer 1.4.11's 3:1.

## Every line-item table is the same table

Anywhere the user **authors** rows — an invoice's items, a purchase agreement's
products, a quote, a sales order, a bill, a credit note — it is `ProductTable`.
Only the columns, the options and the totals change.

**Which of the two tables.** `Table` is for rows that already exist: it sorts,
paginates, and selects for bulk actions, and its cells render values.
`ProductTable` is for rows being written: every data cell is an input or a
select. §1 is explicit that one component must not do both — *a data table's row
click navigates; a product table's row click puts a cursor in a cell.*

```tsx
<CreatePage reserveEndLane footer={…}>          {/* 20 / 30, NOT 20 / 20 */}
  <FormSection dividerGap="tight" …/>
  <ProductTable title="Add Products" columns={…} rows={…} onRowsChange={…} totals={…} />
</CreatePage>
```

Everything below carries over to the next one. Each exists because getting it
wrong was found by measuring.

| | |
| --- | --- |
| the host body | **`reserveEndLane`** — `padding-inline: 20px 30px`. At 20/20 the delete control is clipped by 10 and 62% of its target is unhittable |
| the lanes | **outside the card**, reclaimed with negative margins. The card *is* the 12 columns |
| the lane spacer | **35, not 34** — `calc(row + 1px)`, because the lane's top is the card's border box and the head starts inside its 1px border |
| the card | paints the frame and **does not scroll**; an inner port does. One box cannot both scroll and let children escape, and `clip auto` **computes to** `hidden auto` |
| the lane controls | siblings of the card, positioned at `35 + 34i`, revealed with **opacity** — never `display`, or they leave the tab order and `getBoundingClientRect` returns zeros |
| every cell | `box-border` **and** `padding-block: 0`, or Chromium's UA `td { padding: 1px }` renders the row at 37 |
| the flexible column | `w-max` + `min-w-full` + a **real `min`**. A `<col>` with no width gets the leftover *including none* — it renders at 0, not at its minimum |
| the rail | `sticky end-0` with **`bg-inherit`**, or the hovered row's tint stops dead at it and the row looks broken in half. Its shadow only once scrolled |
| a lifted row | a **1px `primary/default` inset border**, never `surface/raised` — that role aliases `surface/default` in Light and `surface/hover` in Dark, so it cannot raise anything |
| reorder and resize | both need the **keyboard** and both need `setPointerCapture`; reorder needs a polite live region. Pointer-only is not shippable |
| numeric columns | **left**-aligned in the grid, because they are typed. The totals card right-aligns, because those are read |
| the index | counts **across** group breaks — they are the document's line numbers |
| totals | `box-border`, or a 33.333% card renders 476 and the overshoot lands on its left edge |

A `<colgroup>` and `table-layout: fixed` are not optional: `auto` re-measures
every cell on every keystroke and silently undoes the user's column resize.

## Before writing any screen code

1. Read `src/canon/registry.json` — the authoritative list of what exists.
2. Map each region of the requested design onto existing components.
3. **Report the gap list before writing code.** State what maps cleanly and what
   does not. Do not silently invent a component to keep moving.

## Non-negotiable rules

| Rule | Why |
| --- | --- |
| Raw values (hex, `rgb()`, `text-[13px]`, `w-[247px]`) exist **only** in `tokens/primitives.css` (colour) and `tokens/scale.css` (dimension). | Retheming stays a two-file change. |
| **Nothing outside `tokens/` references a primitive.** Components consume semantic roles only. | `var(--zf-neutral-1900)` and `var(--zf-text-default)` render identically today and diverge the moment the theme changes. |
| `src/app/**` imports from `'@canon'` only. Never `@canon/components/...` or `../canon/...`. | Component internals stay refactorable. |
| Screens contain no styled bare markup — no `<div className="...">`. | Stops a second, unmanaged design system growing inside screens. |
| Nothing imports from `src/canon/_incoming/`. | Unadmitted components cannot leak into the product. |
| Every component folder has a `.stories.tsx` covering all states. | A component that cannot be reviewed in isolation cannot be admitted. |
| Every `'@canon'` export has a `registry.json` entry, and vice versa. | The component list cannot drift from reality. |
| No comment leaks into live CSS. | CSS has no nested comments; an early close silently stops emitting the tokens after it. This shipped once already. |
| No retired scale value comes back, and **one line-height per size and case**. | Rules 1 and 7 stop a raw value outside `tokens/`; nothing stopped a retired one being re-added inside `scale.css`. 13px carried five line-heights in the source. |

`npm run check` enforces all nine. It is not advisory — treat a failure as a
blocker, never as something to work around.

## The token layer

Six files, one direction. `primitives → semantic → component`, and nothing
reaches backwards.

**Five of the six are GENERATED.** `design-refs/zf-colours.md` is the source;
`npm run tokens:sync` parses it and emits the CSS, verifying that every alias
resolves to the hex the source table states. Never hand-edit the output — edit
the md and re-run.

| File | Holds | Generated? | Raw values? |
| --- | --- | --- | --- |
| `tokens/primitives.css` | The palette. **200 values** — 9 families × 22 steps + base. | yes | **yes — colour** |
| `tokens/semantic.css` | **113 roles**, Light + Dark. `var()` only. | yes | no |
| `tokens/brand.css` | **5 brand tokens** × 2 hues. | yes | no |
| `tokens/theme.css` | Roles → Tailwind utilities, via `@theme inline`. | yes | no |
| `tokens/scale.css` | Type, **weight**, spacing, radius, elevation, icon slots, chrome dims. | **no — hand-authored** | **yes — dimension** |
| `tokens/badge.css` | **The component layer** — 28 badge fill+label pairs, Light + Dark. | yes, from `zf-design-cannon.md` §2.1.6 | no |

`scale.css` is two blocks and both are required. `:root` holds the values under
their public `--zf-` names — `--zf-space-4`, `--zf-radius-md` — which is the
contract `zf-scales.md` states and the same prefix the colour roles use.
`@theme inline` then maps them onto Tailwind's namespaces so `p-4` and
`rounded-md` exist. **`inline` is load-bearing**: without it Tailwind emits a
second custom property per token and every value has two names. Add a value to
`:root`, map it in `@theme inline` — never only one.

424 values is far past what anyone can hand-copy reliably, which is why it is a
script. The verification is the real product: because every role states *both*
its alias and its resolved hex, a transcription slip in either table makes the
pair disagree and fails the build.

**Two independent theme axes** — never fuse them:

```html
<html data-theme="light|dark" data-brand="blue|red">
```

The source library fused pane and hue into four modes, duplicated two thirds of
its table, and the one genuinely 2-D token had already drifted. Split, a third
hue costs five declarations.

The selectors are **attribute-only, not `:root`-scoped**, so a theme applies to
any element: a dark panel inside a light page is `<div data-theme="dark">` and
nothing else. No context, no re-render, works without React.

`overlay/scrim` is the one role with alpha, so it cannot alias an opaque
primitive. It is a `color-mix` against one rather than a literal `rgba()`, which
keeps `semantic.css` free of raw values and still follows a palette edit.

**`--spacing: initial` is deliberate.** It removes Tailwind's dynamic 4px scale,
so `p-7` is a build error rather than a silent 28px off-scale value — md §1.6.3
traced 44 off-scale values in one component to exactly that scale leaking in.
Component geometry that is not on the 2px step scale becomes a **named token** in
`scale.css`, the way the md names every one of them.

**The type scale is 9 sizes x 4 weights, composed — not 36 named styles.**
`zf-scales.md` states it outright: the line-height is part of the size, and
every size exists in every weight. So `--text-*` carries size, line-height and
tracking but **never a font-weight**, and `--font-weight-*` is its own group.
A weight on the size token would fuse the axes back together and would also
leave the cascade to arbitrate between `text-display` and `font-medium` by
stylesheet order. `Text` always emits both classes.

`--font-weight-*: initial` is there for the same reason as `--spacing: initial`
— it drops Tailwind's other six weights, so `font-thin` is a build error. Four
weights ship because four are drawn.

**Retired values are checked, not trusted.** Sizes 9 / 11.25 / 14 / 15 / 19 / 32,
line-heights 20.8 / 21 / 22.4 / 28.8, spacing 1 / 3 / 5 / 7 / 11 / 14 / 15 / 30 and
ten radii are all rejected by `npm run check` if they reappear in `scale.css`.
A second line-height at one size fails too, unless declared in
`SCALE_EXCEPTIONS` with a reason — 11px is the one entry, because upper-case
`overline` has no descenders.

**Two ways past a retired value, and only one of them is right.**

A retired value that is *component geometry* becomes a **named `--zf-chrome-*`
token** — `chrome/card` 10, `chrome/checkbox` 14, `chrome/section-pad` 30,
`icon/caret` 7.5. It sits beside the ramp instead of on it, so the ramp does not
grow and a second component cannot pick 11 by accident.

A retired **type size** does not get that treatment. A font size in a chrome
token is a font size outside the type scale, which is worse than the thing the
guard prevents — `Text` cannot express it and the one-line-height rule stops
applying. It goes back on the scale and the re-entry is declared in
`RETIRED_EXCEPTIONS` with its reason: **14px `body-lg` is the one entry**,
because the ramp jumps 13 → 16 and a tab label sits between them.

Both mechanisms cost a sentence, and that is the point. The guard exists because
"every one of them arrived with a component rather than being chosen" — it is
aimed at accidental re-entry, and a declaration is the difference. **Renaming a
token to slip a value past the guard is not one of the two ways.**

**The component layer exists now, and it is generated too.** `tokens/badge.css`
holds the status badge's 28 fill+label pairings, parsed out of
`zf-design-cannon.md` §2.1.6. A badge fill and its label colour are chosen
together and belong together, which is a component decision rather than two
independent roles — so they are one token pair per state. §2.1.11 says to
reference primitives directly and skip the layer; we cannot, because rule 7
forbids a primitive outside `tokens/`, and the md's stated reason ("a variable
cannot hold a fill and a label at once") is an argument about CSS variables, not
about components. A React variant map holds both.

`npm run tokens:sync` verifies all 28 against the hex AND the contrast ratio the
md prints for each. It also **warns** on any pairing it had to derive that lands
under 4.5:1 — Dark is derived for the badge, because §2.1 specifies one pane.

**Do not add a role by hand.** A role that does not exist yet is added to
`design-refs/zf-colours.md` with its Light value, its Dark value *and* the
primitive each aliases — then `npm run tokens:sync`. Adding it straight to the
CSS skips the verification and the next sync deletes it.

## Icons

| Path | Holds |
| --- | --- |
| `design-refs/icons/` | **Drop SVG exports here.** A design input; never shipped. |
| `src/canon/icons/paths.ts` | The **roster** — `ICON_NAMES`, plus the derived chevron. |
| `src/canon/icons/geometry.generated.ts` | Geometry. **Generated** by `npm run icons:sync`. |
| `src/canon/icons/Icon.tsx` | Slot size, tone, accessibility. |

**Adding a glyph is one SVG in `design-refs/icons/` plus `npm run icons:sync`.**
No registry entry, no new export, no component change. Figma's export lands as
`icon _ apps.svg` and needs no renaming.

The roster is the contract, so a *new* name is a deliberate line in `ICON_NAMES`
first — `icons:sync` skips an SVG whose name it does not know rather than adding
one as a side effect of a file appearing.

`icons:sync` checks the 16×16 viewBox, rejects `<rect>`/`<circle>` (they carry no
`d` — `apps` was nine rects and had to be flattened, §5.3), merges multiple
`<path>` into one `d` (§5.5 — one node, one fill), and **warns** when an export
disagrees with what `zf-icons.md` measured: filled arriving on a stroked name, or
a stale stroke weight.

- A name with no geometry renders a visible dashed placeholder. That is the
  tracking mechanism — never silence it with invented geometry.
- **One stroke weight: 1.25**, round cap and join. §3.1 found four (1.2, 1.25,
  1.5, 2.2857 — the last being 16/7, a scaling artefact); 1.25 won on instance
  count because `upload` has 542 instances and `chevron` 312.
- Prefer **filled** glyphs. `SCALE` scales geometry but not stroke weight, so a
  stroked glyph in a large slot reads hairline. 17 of 51 are stroked — confirmed by
  our own ingest — and that is **the only thing still open** on the icon page
  (open item 36 / defect 6).
- The md's §3.1 covers only 38 of the 47 standalone icons. For the other nine,
  listed in `ICONS_ABSENT_FROM_MD`, `icons:sync` reports what it found rather than
  checking it — there is no measurement to check against, and claiming one would
  be inventing a fact.
- `tone="inherit"` is the default and usually right: an icon beside a label is
  part of that label. md §2.7.6 found 108 orphan paints from icons carrying their
  own colour.
- **The slot ramp is xs 12 · sm 14 · md 16 · lg 20 · xl 24, and a component picks
  from it.** `Button` is 16/14/12 across its three sizes. If a measured slot is
  off the ramp, prefer the nearest slot on it over a new token — Figma's 13 and
  11 are resize residue (zf-icons.md §3.3), not design intent.
- `label` is **required** on an icon-only control, or it announces as "button".
- `calendar` and `eye` are in `RETIRED_ICON_NAMES` — §12.1 found them in a stale
  Figma doc frame as icons that **do not exist**. Do not re-add without a glyph.

## Assets

| Path | Holds |
| --- | --- |
| `public/brand/` | Product wordmarks and marks. Referenced as `/brand/x.svg`. |
| `design-refs/` | Design inputs — never shipped. |

Icons do **not** go in `public/`: a file cannot inherit `currentColor`, so it
cannot follow the theme.

## When a design needs something that does not exist

1. Build it in `src/canon/_incoming/<Name>/` with `<Name>.tsx` + `<Name>.stories.tsx`.
2. Add a `registry.json` entry with `"status": "incoming"`.
3. Do **not** export it from `src/canon/index.ts`.
4. Stop and tell the user it is ready for review at `localhost:6006`.
5. Only once they approve: `git mv` into `components/`, add the export, flip the
   status to `stable`, run `npm run canon:docs`.

Never skip to step 5. Review-in-isolation is what keeps the canon coherent
instead of accumulating six near-identical buttons.

**Review in all four pane × hue combinations.** md §2.9.9 is titled "Two fixes
found only by looking at a dark canvas" — two components were invisible in Dark
and every screenshot had hidden it. §2.20.9 is the same lesson on the hue axis:
the Red brand failed WCAG where Blue passed.

## Modelling components — one axis, one dimension

The most frequent error in the source, flagged five times (md §2.7.2, §2.8.2,
§2.9.5, §2.10.1, §2.11.2). Four tests before adding a variant axis:

1. **Can two of its values be true at once?** Then it is two axes.
2. **Does it change what the component *contains* rather than what it is *doing*?**
   Then it is a boolean or an instance-swap — unless the values are mutually
   exclusive alternatives, which is one dimension with N values.
3. **Is any value two values concatenated?** `Error On Click` is the whole
   diagnosis in one string. A slash or an "and" means two axes.
4. **Does one value mean "ignore another axis"?** Then the two are one axis.

And the sharpest test, applied first: **if two values need different HTML, they
are different components.** It cuts both ways. Figma's `Button` and
`Button Icons` are 192 variants across two sets and both render `<button>`, so
they are ONE component and icon-only is simply no children — which also dissolves
the dead `Label` property `Button Icons` carries. `Hyperlink` is an `<a>`, so it
is not.

**A native state is not a variant axis.** Figma enumerates `State` = Default /
Hover / Focus / Disabled on all four button sets. Those are `:hover`,
`:focus-visible` and `:disabled`; making them props would let a component render
"hover" while the pointer is elsewhere. That factor of four is not real.

Our own `Text` is three axes for this reason — `size` (9), `weight` (4) and
`tone` (11). It used to be two, with 13 fused type roles where `body`,
`body-strong` and `body-emphasis` were three names for 13/20 at three weights.
That failed test 1: `body` and `medium` can both be true at once. It also could
name only 6 of the 36 real styles — `heading` at `bold` had no name at all.

## Extending beats adding

Before creating a component, check whether an existing one should grow a variant
instead. A new `StatusBadge` variant beats a new `JobStatusChip`. Duplication in
a design system is worse than a slightly larger variant map.

## Naming

Props describe **intent**, not appearance: `status`, `tone`, `size`, `emphasis`.
Never `isBlue`, `paddingLeft`, `fontSize14`. Tokens are named by role
(`surface/sunken`, `text/secondary`), never by value (`gray-50`). Spacing is
named by **step** (`gap={4}` is 8px), never by pixel, so a density change
rescales without renaming anything.

## Commands

| Command | What |
| --- | --- |
| `npm run dev` | Application — http://localhost:5173 |
| `npm run canon` | The canon (browsable components) — http://localhost:6006 |
| `npm run check` | Types + the eight boundary rules. Run before claiming done. |
| `npm run canon:docs` | Regenerate `docs/COMPONENTS.md` from the registry. |
| `npm run tokens:sync` | Regenerate the five generated token files, verifying all 424 colour values and all 28 badge pairings. |
| `npm run icons:sync` | Ingest `design-refs/icons/*.svg` into `icons/geometry.generated.ts`, checking each against `zf-icons.md`. |

## Repo map

```
src/canon/            the design system — the only place design decisions live
  tokens/             five files, one direction. Four are generated (see above)
  icons/              paths.ts (roster) + geometry.generated.ts + Icon.tsx
  primitives/         Stack, Inline, Text, Surface
  components/         admitted components
  _incoming/          proposed, quarantined
  registry.json       THE component list (hand-authored)
  index.ts            the public API — the application's only entry point
src/app/              screens; composition only, zero styling
public/               static assets that ship (brand marks, favicon)
design-refs/          zf-design-cannon.md (components) + zf-colours.md (colour)
                      + zf-scales.md (type, weight, space, radius)
                      + zf-icons.md (51 glyphs) + icons/ (drop SVGs here)
docs/                 WORKFLOW.md, BACKLOG.md, COMPONENTS.md (generated)
```
