# Backlog

Derived from `design-refs/` — `zf-design-cannon.md` v0.42.1 (18 Aug 2026) for
components, `zf-colours.md` for colour, `zf-scales.md` for dimension. Those are
the design contract; this one is the **code** queue against them.

Flow: **backlog → `_incoming/` (built) → registry `stable` (admitted)**

---

## 1 · What is blocked on an export

### 1.1 Palette — **CLOSED**

`design-refs/zf-colours.md` landed the full set. `scripts/gen-tokens.mjs` parses
it and emits all four token files, verifying that **every alias resolves to the
hex the source table states** — 224 pairs, 0 mismatches.

| | |
| --- | --- |
| Primitives | **200** — 9 families × 22 steps + `base/white` and `base/black` |
| Semantic roles | **107**, each with a Light and a Dark value |
| Brand tokens | **5**, each with a Blue and a Red value |
| Total | **424 values**, all generated and verified |

Run `npm run tokens:sync` after any edit to the md. Never hand-edit
`primitives.css`, `semantic.css`, `brand.css` or `theme.css` — they are output.

**What this unblocked:** `overlay/scrim` (so `PopupModal` can ship), the entire
`info/*` group (so `Banner Tone=info` exists), `success/subtle` and
`danger/subtle`, `avatar/orange-surface`, the warning group in Dark, and a
`surface/canvas` role for the page ground — which had been an open question.

It also **corrected** several roles that had been inferred from the component
sections rather than stated: `surface/pressed` (neutral/500, not 400 — at 400 it
collided with `disabled`), `text/placeholder`, `icon/default` in Dark, and most of
the `primary/*` Dark ladder.

### 1.1a Contract discrepancies, resolved toward the newer docs

Recorded because the two design documents disagree and someone will hit this:

| | `zf-design-cannon.md` | `zf-colours.md` | Repo follows |
| --- | --- | --- | --- |
| Sky family | `--zf-sky-blue-*` (§1.1) | `sky/*` — ~10 consistent alias refs | **`sky`** |
| Theme attribute | `data-zf-theme` (§1.3) | `data-theme` / `data-brand` | **`data-theme`** |
| Role variable | `--zf-<role>` | `--zf-color-<role>` | **`--zf-color-`** |

The colours doc wins because it is the generated one, and because its §9
describes an `@zf/design-tokens` package with that exact contract — matching it
means the eventual swap is a drop-in rather than a rename sweep. **Worth
confirming**, since a bare `data-theme` is generic enough to collide with a host
application's own attribute.

Also from that contract: the theme selectors are **attribute-only, not
`:root`-scoped**, so a theme applies to any element — a dark panel inside a light
page is `<div data-theme="dark">` and nothing else. No context, no re-render, and
it works without React.

### 1.1b Scales — **CLOSED**

`design-refs/zf-scales.md` landed the dimension contract. Cross-checked line by
line against `scale.css`:

| | Doc | Repo | |
| --- | --- | --- | --- |
| Spacing | 12 steps, 2px base | 12 | **identical** |
| Radius | 7 steps | 7 | **identical** |
| Font sizes | 9 + `overline` | 9 + `overline` | **now identical** |
| Font weights | 4 | was 3 | **700 added** |

Four things were missing or wrong, all now fixed:

1. **Weight was fused into the size.** The old scale had 13 named styles where
   `body` / `body-strong` / `body-emphasis` were 13/20 at three weights. The doc
   is explicit — 9 sizes × 4 weights, composed from two classes — so `--text-*`
   no longer carries a `font-weight` and `--font-weight-*` is its own group.
   `Text` went from `variant` + `tone` to `size` + `weight` + `tone`.
   **This was the cannon's own most-flagged error, in our code.** It could also
   name only 6 of the 36 real styles.
2. **`bold` 700 did not exist** — not in `scale.css` and not in the Inter
   webfont request, so it would have silently synthesised. Both fixed.
3. **`label` was 12/16.** It is 11/16 +2%. Under item 1 the old 12/16 Medium is
   `body-sm` at `medium`, so the name was free and `label-sm` folded into it.
4. **`caption` had no tracking.** It is +2%. See the decision below.

Also added: **rule 9 in `check-boundaries.mjs`** — every retired value from the
doc is rejected if it reappears in `scale.css`, and a second line-height at one
size fails unless declared in `SCALE_EXCEPTIONS` with a reason. 11px is the one
declared exception, because upper-case `overline` has no descenders. Probed with
five deliberate violations; all five caught, and the declared exception did not
trip.

### 1.2 Icons — **CLOSED**. 47 of 51 glyphs ingested; the other 4 are derived

`design-refs/zf-icons.md` landed the contract — **51 icons**, 47 standalone plus a
4-variant `icon / chevron` set, measured and repaired 2026-08-20 with 16 of 18
defects closed. All 47 standalone SVGs were then exported and ingested.

```
roster     : 51 names
svgs found : 47 in design-refs/icons/
ingested   : 47
stroked    : 13 at 1.25px  ·  filled: 34
derived    : 4 render from paths.ts, no SVG needed (chevron-down up left right)
placeholder: 0 with no geometry at all
```

**The counts close exactly, in both directions.** 38 of the 47 exports match a name
the md states and 9 do not — precisely the 47 − 38 the md's own totals imply, so
nothing is missing and nothing was invented. And the ingest independently
reproduces §12's post-fix audit:

| | Ingest found | md §12 states | |
| --- | --- | --- | --- |
| Stroked | 13 standalone + 4 chevron = **17** | 17 | ✓ |
| Filled | **34** | 34 | ✓ |
| Distinct stroke weights | **{1.25}** | `1.25` × 17 | ✓ |

Zero warnings, which means every one of the 38 measured exports agrees with §3.1
on both stroked-vs-filled and weight. That is a real check: the script would have
flagged a filled glyph arriving on a stroked name, or a stroke weight left at the
pre-repair 1.2 / 1.5 / 2.2857.

#### What the ingest resolved

| | |
| --- | --- |
| Added to the roster | **3** — `bank`, `reports`, `sparkle`. `icons:sync` refused them until they were added by hand, which is the rule working: the roster is the contract, not a side effect of a file appearing |
| The 6 "unconfirmed" names | **all confirmed** — `attach` `more` `table-config` `build` `users` `bell` all have exports. An SVG is stronger evidence than a mention |
| Removed earlier | **2** — `calendar`, `eye`. §12.1 found them in a stale doc frame as icons that do not exist. In `RETIRED_ICON_NAMES`; the sync refuses an SVG under either name |
| Stroke weight | **1.5 → 1.25**, per md defect 4. Our derived chevron path is unchanged — the stroke moved, the geometry did not |

#### Still open on icons

- **17 of 51 glyphs are stroked** — canon open item 36, md defect 6, and now
  confirmed at exactly 17 by our own count. `SCALE` scales geometry but not stroke
  weight, so a stroked glyph in an 80px slot draws 80px of path at a 16px weight
  and reads as a hairline. Needs 17 redrawn as filled: a project, not a script.
  Everything the ingest can enforce it enforces; this it cannot.
- **`chevron` has no real export** — the four variants still render the geometry
  derived from §1.7.1 + §2.23.10. It is correct to 4 decimal places and it renders,
  but it is a reconstruction, and `chevron` has 312 instances. Export the four
  variants as `chevron-down.svg` etc. and the real geometry takes over
  automatically — the generated map is spread last.
- **§3.1 has no row for 9 glyphs** — `attach` `bank` `bell` `build` `more`
  `reports` `sparkle` `table-config` `users`. They all exist and all export filled,
  but for these nine `icons:sync` can only report what it found, not check it. A
  re-measure of the Figma page covering all 47 rather than 38 would close it.
- **Three models for directional icons** (md §7) — `chevron` is a `Direction`
  variant set, `arrow-up`/`arrow-down` are two components of the same glyph with
  `rotation: 180`, `caret-down` is alone. Worth settling before the set grows.
- **Bundle cost: +21.5 kB gzipped** (+51.9 kB raw) for the full set. `iconPaths` is
  one object literal, so all 47 glyphs ship whether a screen uses three or thirty.
  Fine for an ERP where the sidebar rail alone uses eleven; revisit only if a
  lightweight surface needs a handful. The median glyph is 846 chars and the
  largest, at 6,660, is worth a look — it may be an unsimplified path.

---

## 2 · Decisions only you can make

Six, and the first one is worth more than the other five together.

| # | Decision | Cost of not deciding | md |
| --- | --- | --- | --- |
| ~~1~~ | ~~**Add `border/control` at neutral-1100?**~~ **DONE, 2026-08-21** — added to `zf-colours.md`, `neutral/1100` Light (4.52:1) and `neutral/1000` Dark (5.67:1), both values stated by `zf-input-field.md` §4.2. (First added with a mirror-derived `neutral/1200` Dark; corrected once the input-field md supplied the real value.) **Additive**: `border/default` is unchanged, so nothing that used it moved. `Radio` and `InputField` are the consumers. **`Button` secondary is not retrofitted** — that is a visible change to every secondary button and it is yours. | — | open 12 · 35 · radio §5.1 · button §5.4 |
| **2** | **The `primary/*` ladder shift.** `primary/default` + `primary/on-primary` is **4.32:1** in Light — under 1.4.3, *by construction*. It cannot be one edit: `primary/hover` and `primary/selected` are already on blue/1300, so moving default there makes three states identical. The shape is **default → blue/1300, hover → blue/1400, selected → 1400 or 1500**. | **Any surface in the system that puts on-primary text on a primary surface fails 4.5:1.** `npm run tokens:sync` warns on it. Blocks `Button`'s admission. Also fixes open 24 — hovering something already selected currently renders no change. | open 24 · button §5.2 |
| 3 | ~~The intent ladder for buttons~~ — **resolved by building it.** `success` / `warning` / `danger` already sit at the step that passes (`{family}/default` = 4.56 / 6.07 / 6.09), so `Button` binds straight to the roles. Only `primary` cannot, which is decision 2. | — | open 17 |
| 4 | Own the bright blue (~`#4A8DF8`) and the deep blue (~`#2077E8`), or forbid them. | **Eight independent appearances, three intended values, none owned.** Not drift — a palette people keep reaching past. | open 25 |
| 5 | Wordmark: artwork or text? | It is a vector in the top bar and a text layer in the sidebar. Settle before both ship. | open 32 |
| 6 | Confirm the full brand hue set. §1.3 plans Blue · Green · Red · Orange; only Blue and Red are specified. | One hue is five declarations now, and a sweep after the rail is instanced everywhere. | open 29 |
| 7 | **`caption` tracking: +2% or none?** *(the only scale item still open)* `zf-scales.md` says +2%; `zf-design-cannon.md` §1.4 says none. Built at +2%, following the newer file. | The only value where the scales doc *adds* rather than reorganises, so it is the one that might be a transcription slip rather than a decision. Affects every 10px string. | — |
| ~~8~~ | ~~**Do the CSS variable names follow the doc?**~~ **Done.** `scale.css` now declares `--zf-space-*`, `--zf-radius-*`, `--zf-text-*`, `--zf-font-weight-*`, `--zf-icon-*`, `--zf-chrome-*`, `--zf-shadow-*` on `:root` and maps them through `@theme inline`. Every utility is unchanged; every literal is declared exactly once, by a `--zf-` variable. | — | zf-scales.md |

### Also unresolved, lower stakes

- **No inverse border role**, so a dark surface cannot carry a divider (open 26).
- **Five roles are defined and never applied** — `overlay/scrim`,
  `text/placeholder`, `focus/halo`, `surface/raised`, `nav/border`. Each one means
  some component is using a near-enough role instead. Bind them as those
  components get built rather than leaving the substitute in place.
- **Three role pairs collide where they must not** (colours doc §7):
  `primary/hover` = `primary/selected`, `surface/disabled` = `surface/sunken`,
  `border/disabled` = `border/divider`. The last is the nastiest — a disabled
  input's boundary reads as a divider, so it stops reading as a control at all.
  The test is not "are these the same value" but "do these two ever need telling
  apart".
- **27 of 112 roles have no consumer.** Most are deliberate reserves (all four
  `accent/*`, all eight `chart/*`, the interactive halves of the status
  families). Do not delete them; do not invent uses for them either.
- **`chrome/surface` and `nav/brand-surface` are one step apart** — blue-2000 vs
  blue-2100 — because the source drew them so. If the bar and the logo band ever
  sit adjacent, the seam shows (open 31).
- **Avatar is 32px in the top bar**, which is not one of the four declared sizes
  (open 33). Add 32, or move the top bar to 40.
- **Avatar tint selection is undefined** — hash the name in code so the same
  person is the same colour everywhere (open 34).
- **`zf-tab` is unmigrated**: 8 off-scale type combinations including
  `11.25 / AUTO Semibold +1.13px`, plus 12 unbound paints (open 37 · 40).

### From building `StatusBadge` — admitted, with four things carried forward

**Resolved while building.** Mirroring the neutral ladder into Dark put `draft`
solid at 4.02:1, under AA. Fixed by shifting the whole neutral Dark solid ladder
one step lighter — 1000 / 900 / 700 / 600 instead of 1100 / 1000 / 800 / 700.
The family shifts rather than the one state because moving `draft` alone collides
with `void`, and §2.1.7 records that Draft and Void once shared a solid fill and
were "indistinguishable in Solid emphasis". Walking further inverts the ladder,
which §2.1.7 also rejects. **All 56 pairings now pass AA**; the weakest is Solid
Draft in *Light* at 5.02:1, which is §2.1.6's own weakest pairing. The generator
asserts uniqueness and monotonicity in both panes so the override cannot silently
undo what it fixed.

**Still yours to decide:**

- **Should Dark be specified rather than derived?** All 28 Light pairings are
  verified against §2.1.6 and every one reproduces the stated ratio exactly. The
  28 Dark ones are ours: mirrored (dark step = 2300 − light step), with one
  documented family override. Sound, but still a derivation.
- **Badge type is off §1.4's scale.** §2.1.3 asks for 12 / 19.2 / Medium /
  +0.2px. Built as `body-sm` + `medium` (12 / 16 / 500, no tracking): 19.2 is not
  on the scale and §1.4.5 retired the `0.2px` tracking unit. At a fixed 22px
  height the line-height is moot. Confirm, or add a documented dense variant.
- **`ageneratedPurple` ships as `unclassified`** — §2.1.10 issue 1 calls it a
  placeholder that "carries a full colour pair and will ship". It does, under a
  name that reads as unfinished. Rename to its real state or delete it.
- **§2.1.2's `1px solid #FFFFFF` border is bound to `surface/default`**, not to
  white — white in Light, near-black in Dark. A literal white would draw a bright
  hairline around every badge on a dark table.
- **In Dark the four neutral solid fills sit closer together** than in Light,
  because the shift moved them into the lighter half of the ramp. Worth an eye.

### From building `InputField` + `Field`

**A correction to yesterday's work.** `border/control`'s Dark value was
`neutral/1200` — I derived it from the mirror the other five `border/*` roles
follow (Light step + Dark step = 2300). **zf-input-field.md §4.2 states the value:
`neutral/1000`.** It is measurably better — **5.67:1** in Dark against the 3.22:1
the mirror produced. Corrected and regenerated; `Radio` inherits the fix.
*The mirror is a heuristic for filling a gap, not a substitute for a stated value.*

**Two components, and the md is explicit about which to reach for.** `Field` is
the whole thing — label, required marker, input, message — and `InputField` is
the bare box, public only for a table's inline-edit cell or a toolbar search.

**18 Figma variants collapse to 2.** `States` (5) are pseudo-classes — and §5
measures Hover and On-Click as rendering *identically*, so five options already
produce four appearances. `Content` (placeholder vs value) is not a variant in a
real input; it is whether the element has a value, and `::placeholder` is the
selector. §3.2 exists because a designer had to override the text colour by hand
on every field. That leaves `error`.

**Still yours to decide:**

- **§8 Q3 — `text/placeholder` is a trap.** It resolves to `neutral/1000`,
  **2.85:1**, below the 4.5:1 1.4.3 asks of text, so the component uses
  `text/tertiary` (4.52:1) instead. A role that cannot be used for the thing it
  is named after should be retuned to `neutral/1100` or retired. **Note our own
  `Text` component still offers `tone="placeholder"`** — same trap, one line to
  remove once you decide.
- **§8 Q2 — `On-Click`.** It renders identically to `Hover`, so it does not exist
  here: `:active` falls back to hover, which §5 notes "is what browsers do
  anyway". Give it a distinct appearance and it becomes a real state.
- **§8 Q7 — should `Field` forward a filled/empty axis?** Not needed: a real
  input has a value or it does not.
- **Focus offset is 3px; §6 asks for 2px** — the same open question as Button and
  Radio, and the third md to state 2px. Worth settling globally.
- **`Field` could serve the `RadioField` composite** (zf-radio.md §13 Q2) if its
  input slot were generalised to `children`. Not done — the md models `zf-field`
  as wrapping an input specifically, and generalising it is a design decision.

### From building `Radio`

**Resolved while building.** `border/control` now exists (decision 1 above), which
is what §5.1 and §10's own CSS both require: Figma's resting border is 1.26:1 and
the canon's proposed `neutral/600` snap is 1.31:1, so **the radio would have been
very nearly invisible in its most common state**. Defect 6 — selecting a radio
shrinking it from 13px to 12px — is fixed by `border-box` rather than by a value.

**Still yours to decide:**

- **§13 Q2 — the `RadioField` composite.** §11.1 lists it as an *absence*, not a
  defect: without it **2.5.8 cannot be met by any consumer**, because 12 × 12 is
  a quarter of the required 576px² target and only a `<label>` fixes that. The
  `<fieldset>` requirement is documentation rather than code for the same reason.
  This is the next thing `Radio` needs; the `InAFieldset` story is the pattern to
  copy until it exists.
- **§13 Q3 — `checked + error`.** Built as a real state, against the md's
  alternative of collapsing to one `Condition` axis. A selected option can be
  invalid, so they fail CLAUDE.md's first test for a fake axis; §3's own table
  lists `default + error, checked` under "should add". Confirm.
- **Two role values are one step off the md's nearest-ZF mapping.** Error border
  is `danger/default` (red/1300, 6.09:1) where §5 maps to red/1400 (6.32:1); and
  checked-hover is `primary/hover` (blue/1300, 5.48:1) where §5 maps to blue/1600
  (9.41:1). Both pass 1.4.11 comfortably. The second is worth an eye: **hovering a
  selected radio is a 1-step colour change where the design specifies 4**, so it
  may read as no change at all.
- **§13 Q6 — the halo on checked-hover.** Built as OFF, following §10's
  `:checked:hover { box-shadow: none }`. Figma carries it on 6 variants and shows
  it on 2, all four hidden ones being the checked column — "an abandoned decision
  rather than an oversight". Confirm the abandonment.
- **§13 Q7 — should a disabled radio be legible?** Figma's is 1.121:1 against its
  own fill. Ours is 1.167:1 with `surface/disabled` + `border/disabled` — no
  better. Exempt from WCAG, but invisible is not the same as dimmed.
- **Focus ring: ours is `focus/ring` (blue/1200, 4.32:1) at a 3px offset; §10 asks
  for blue/1600 (9.41:1) at 2px.** Both clear 1.4.11. Ours is the single
  system-wide treatment §2.6.9 demands after finding five different blues meaning
  "focused" — same question as Button's.

### From building `Button`

- **`success/active` and `warning/active` do not exist.** Only `primary` and
  `danger` have an `active` role, so a press on those two intents produces no
  visible change at all. Four token rows, not a component fix.
- **The hover ladder: no `{family}/hover` role matches md §4.1's `{hue}/1400`.**
  `primary/hover` is blue/**1300** — one step *lighter* — while `success`,
  `warning` and `danger` hover are all `/1500`, one step *darker*. The component
  binds to the roles, which is right per §4 ("bind to the role that means the
  right thing"); it is the roles' VALUES that diverge. For `primary` this is
  decision 2 in disguise: `primary/hover` sits on blue/1300 only because
  `primary/default` has not moved off blue/1200 yet. **After the ladder shift the
  component needs no change** — which is the argument for binding to roles.
- **Secondary's fill is white, not `neutral/100`.** §5.3 measures the rest fill at
  `neutral/100` #FAFAFC and hover at `neutral/200` #F7F8FC. **No semantic role
  holds either step** — `surface/default` and `surface/raised` are both
  `base/white`, `surface/hover` is `neutral/300`. Rendered contrast is 15.15 and
  14.05 against §5.3's 14.54 and 14.28. Not closed with two new tokens because
  §5.4 says the fill does no work anyway at 1.04:1; white makes that literal. If
  design wants the hair of separation it needs a role.
- **Focus offset is 3px; §11's CSS says 2px.** The source is inconsistent with
  itself — §2.11 specifies "2px `focus/ring`, 3px offset, radius 9" for the
  stepper. Ours is one system-wide treatment in `index.css`, which is what §2.6.9
  demands after finding five different blues meaning "focused". Confirm 2 or 3.
- **The md states no per-intent values for Secondary at all** — its own CSS has a
  single `.zf-btn--secondary` rule. Left as-is, `intent` would be a prop that does
  nothing on half the matrix, which is CLAUDE.md's fourth test for a fake axis.
  Built with the intent on the **label** (`{family}/text`, 5.92 – 8.06:1) and a
  neutral border, because the intent *borders* fail 1.4.11 exactly as hard as
  `border/default` does. Confirm, or supply Secondary's real values.
- **Button label weight is unstated.** §2 gives 13/21 and 12/19 but no weight, and
  neither is a named style in §1.4 anyway. Built as `body` / `body-sm` at
  `medium`. Confirm.
- **Icon slot — 16 / 14 / 12, DIVERGING from md §2's 13 / 12 / 11.** Decided,
  not transcribed. Neither 13 nor 11 is on any scale in this system and both
  carry the signature of the resize artefacts zf-icons.md §3.3 catalogues; and
  13 → 11 is an 18% span across a three-step ramp, which reads as drift rather
  than as a decision. 16 → 12 is 33%, visible at a glance, and lands exactly on
  the existing `icon-md` / `icon-sm` / `icon-xs` slots — so it needs no
  component-specific token at all. **Figma should be updated to match**, or the
  divergence accepted and recorded in the md.
- **Focus offset is 3px, not the md's 2px.** Deliberate: `index.css` sets one
  focus treatment for the whole system, and md §2.6.9 found five different blues
  meaning "focused" precisely because components each solved it locally. The 3px
  gap also mitigates defect 17 — on a blue Primary button the ring and the fill
  are the same colour, and the gap is what separates them.
- **No hover shadow.** Figma stacks four `DROP_SHADOW` effects on hover (defect 9)
  and the md's own CSS omits them entirely. Ours does too; the colour change is
  the affordance.

---

## 3 · The component queue — 24 components

**Built and admitted: 22.** `_incoming/` is empty — every component built so far was
promoted to `components/` and exported from `@canon` on 2026-08-25. Fixes land in
place from here rather than through a second review round.

An earlier pass built 22 more from `zf-design-cannon.md` alone. They were deleted
on 2026-08-21: the canon's §2.x sections are the *audit* of each component, not
its specification, and building from them produced components that looked wrong.
**The per-component md plus the Figma link is the input**, the way `zf-colours.md`,
`zf-scales.md`, `zf-icons.md`, `zf-button.md` and `zf-status-badge.md` were — one
component at a time, gap report first.

Nothing from that pass survives: no folders, no registry entries, no tokens, no
rule exemptions. `npm run check` reports 33 files and 7 components.

### Wave 1 — no component dependencies

| Component | md | Variants | State |
| --- | --- | --- | --- |
| `StatusBadge` | §2.1 · zf-status-badge.md | 28 | ✅ **admitted** |
| `Radio` | §2.2 | 16 (10 in Figma) | awaiting a per-component md |
| `Checkbox` | §2.3 | 24 valid (15 in Figma) | awaiting a per-component md |
| `Toggle` | §2.4 | 32 (20 in Figma) | awaiting a per-component md |
| `Pill` | §2.8 | 8 — complete | awaiting a per-component md |

### Wave 2 — needs `Icon`

| Component | md | State |
| --- | --- | --- |
| `Button` | §2.7 · zf-button.md | **ADMITTED** — `components/`, exported. Decisions 1 and 2 still open |
| `InputField` | §2.5 · zf-input-field.md | **ADMITTED** — `components/`, exported |
| `Stepper` | §2.11 · zf-input-stepper.md | **ADMITTED** — `components/`, exported |
| `Segmented` | §2.10 · zf-segmented.md | **ADMITTED** — `components/`, exported |
| `Avatar` | §2.22 | awaiting a per-component md |
| `Accordion` · `AccordionItem` | §2.16 · zf-accordion.md | **ADMITTED** — `components/`, exported |
| `Breadcrumb` | §2.19 | awaiting a per-component md. `StepTrail` is a separate component — different HTML |
| `Wizard` | §2.9 · zf-wizard.md | **ADMITTED** — `components/`, exported |
| `Tabs` | §2.6 | **blocked** — unmigrated in Figma (open 37 · 40). Rebuild or retire |

### Wave 3 — needs `Button`

**Admitted:** `SidePanel` §2.17 (zf-side-panel.md) · `PageHeader` §2.23
(zf-page-header.md).

**Still awaiting a per-component md:** `Banner` §2.13 · `Popover` §2.15 ·
`PopupModal` §2.14 · `ColorPicker` §2.12 · `DateRangePicker` §2.18.

Also from `zf-button.md`: **`Hyperlink`** (§7) and **`SplitButton`** (§8) are
separate components — an `<a>` and two interactive regions respectively.

### Wave 4 — composed

**Admitted:** `Nav` §2.20 (zf-lhs-menu.md) · `TopBar` §2.21 (zf-top-bar.md).

**Still awaiting a per-component md:** `Table` §2.24.

---

## 4 · Carried forward from the md that code must honour

These cannot be expressed in Figma and will be lost unless they are built in.

- **Indeterminate must be set in JavaScript** — `el.indeterminate = true`. There
  is no HTML attribute. The single most common checkbox mistake (§2.3.8).
- **`type="button"`** on every stepper arrow and header action, or it submits the
  form it sits in (§2.11.6).
- **`role="treegrid"`** for the hierarchical table, with `aria-level` — not nested
  tables (§2.24.7).
- **Roving tabindex** in the calendar grid. 42 tab stops per month is the most
  common date-picker failure (§2.18.8).
- **`aria-label` is mandatory when a label is hidden** — icon-only segments and
  actions announce only "button" otherwise (§2.10.6).
- **Modal focus trap + return + Esc**; popover and side panel get focus movement
  **without** the trap (§2.14.7 · §2.15.7 · §2.17.6).
- **A tick is not accessible.** Pair every completed step with visually hidden
  text (§2.9.6).
- **Collapsed rail labels need a tooltip and `aria-label`** — *Filing…*, *Custo…*
  are unusable by sight (open 28).
- **Let a CSS counter supply the wizard numeral**, not a hard-coded string
  (§2.9.6).
- **The text is the flexible part** in any cell ending in a fixed trailing
  element, or the trailing element becomes a function of the string (§2.24.10).

---

## 5 · Repo-side, not design-side

- [ ] Flip the a11y addon from `test: 'todo'` to `'error'` once real components
      exist. A placeholder that never runs reads as coverage you do not have.
- [ ] Extend `check-boundaries.mjs` to cover a root-level `site/` if a component
      website is ever built — it only walks `src/**` today, so a docs site would
      be a blind spot where a second design system could grow.
- [ ] Decide whether the `_incoming` body-slot placeholders ship or each product
      supplies its own (open 23).
