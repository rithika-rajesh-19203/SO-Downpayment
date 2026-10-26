# ZF Design Cannon — Design System

**Source of truth:** Figma → `Tin-Tin` (`zZtArxOeRCjd7pKE25HQVS`)
**Version:** 0.42.1
**Last updated:** 18 August 2026

This document is the contract between design and code. Every value here is read
from Figma, not invented. When Figma changes, this file changes, then the code
changes. Never the other way round.

---

## Table of contents

1. [Foundations](#1-foundations)
   - [1.1 Colour primitives](#11-colour-primitives)
   - [1.2 Semantic roles](#12-semantic-roles)
   - [1.3 Theming model](#13-theming-model)
   - [1.4 Typography](#14-typography)
   - [1.5 Radius scale](#15-radius-scale)
   - [1.6 Spacing scale](#16-spacing-scale)
   - [1.7 Icons](#17-icons)
2. [Components](#2-components)
   - [2.1 Status Badge](#21-status-badge)
   - [2.2 Radio Button](#22-radio-button)
   - [2.3 Checkbox](#23-checkbox)
   - [2.4 Toggle](#24-toggle)
   - [2.5 Input Field](#25-input-field)
   - [2.6 Tabs — `zf-tab`](#26-tabs--zf-tab)
   - [2.7 Button family — `zf-btn`](#27-button-family--zf-btn)
   - [2.8 Pill — `zf-pill`](#28-pill--zf-pill)
   - [2.9 Wizard — `zf-wizard`](#29-wizard--zf-wizard)
   - [2.10 Segmented control — `zf-segmented`](#210-segmented-control--zf-segmented)
   - [2.11 Input stepper — `zf-stepper`](#211-input-stepper--zf-stepper)
   - [2.12 Colour picker — `zf-color-picker`](#212-colour-picker--zf-color-picker)
   - [2.13 Banner — `zf-banner`](#213-banner--zf-banner)
   - [2.14 Popup modal — `zf-popup-modal`](#214-popup-modal--zf-popup-modal)
   - [2.15 Popover — `zf-popover`](#215-popover--zf-popover)
   - [2.16 Accordion — `zf-accordion`](#216-accordion--zf-accordion)
   - [2.17 Side panel — `zf-sidebar`](#217-side-panel--zf-sidebar)
   - [2.18 Date range picker — `zf-date-range-picker`](#218-date-range-picker--zf-date-range-picker)
   - [2.19 Breadcrumb — `zf-breadcrumb`](#219-breadcrumb--zf-breadcrumb)
   - [2.20 Sidebar navigation — `zf-sidebar-nav`](#220-sidebar-navigation--zf-sidebar-nav)
   - [2.21 Top bar — `zf-topbar`](#221-top-bar--zf-topbar)
   - [2.22 Avatar — `zf-avatar`](#222-avatar--zf-avatar)
   - [2.23 Page header — `zf-page-header`](#223-page-header--zf-page-header)
   - [2.24 Tables — `zf-table-list` · `zf-table-grid`](#224-tables--zf-table-list--zf-table-grid)
3. [Conventions](#3-conventions)
4. [Open items](#4-open-items)

---

# 1. Foundations

## 1.1 Colour primitives

**Source:** node `3:2` — "ERP colour palette", Spectrum 1.0 Perceptual Uniform Colours
**File:** `zf-color-variables.css`

Nine hue families × 22 steps (100 → 2200) = 198 primitives.

| Family | Variable prefix | Steps |
|---|---|---|
| Yellow | `--zf-yellow-*` | 100–2200 |
| Orange | `--zf-orange-*` | 100–2200 |
| Sky Blue | `--zf-sky-blue-*` | 100–2200 |
| Blue | `--zf-blue-*` | 100–2200 |
| Red | `--zf-red-*` | 100–2200 |
| Cyan | `--zf-cyan-*` | 100–2200 |
| Green | `--zf-green-*` | 100–2200 |
| Purple | `--zf-purple-*` | 100–2200 |
| Neutral | `--zf-neutral-*` | 100–2200 |

Ramp behaviour is consistent across all nine families:

| Range | Character | Typical use |
|---|---|---|
| 100–400 | Near-white tints | Page and surface washes |
| 500–700 | Light tints | Subtle fills, hover, disabled |
| 800–900 | Light-mid | Borders, chips, large icons |
| 1000–1200 | Core | Brand, action, icon |
| 1300–1500 | Deep | Hover/pressed, text on light fills |
| 1600–1800 | Dark | High-contrast text, dark surfaces |
| 1900–2200 | Near-black | Dark-mode canvas, deepest text |

Primitives are never referenced by a component. They exist only to be pointed at
by the semantic layer.

---

## 1.2 Semantic roles

### Text group — confirmed

Names taken directly from the Figma variable group.

| Token | Role |
|---|---|
| `default` | Body copy, headings, table cell values |
| `secondary` | Field labels, table headers, card meta |
| `tertiary` | Helper text, hints, timestamps |
| `placeholder` | Ghost text in an empty input |
| `disabled` | Text in a non-interactive control |
| `inverse` | Text on a dark or coloured fill |

`default → secondary → tertiary` is a contrast ladder; the decreasing contrast
*is* the hierarchy. `placeholder` and `disabled` sit outside the ladder because
they encode state, not emphasis.

### Status role mapping — confirmed

| Role | Family | Confirmed |
|---|---|---|
| Warning | Orange | ✅ — `warning/*` re-pointed from Yellow to Orange, 17 Aug. See §2.7.6 |
| Info | Blue | ✅ |
| Danger | Red | ✅ |
| Success | Green | ✅ |

### Unassigned families

Yellow, Sky Blue, Cyan, Purple. Available for accents, module identity, tags, or
chart series. Neutral carries surfaces, borders, and text.

### Status colour is scoped per component — confirmed

A status meaning does **not** resolve to a single colour across the product.
"Success" as a badge, as a banner, as an icon, and as inline validation are four
different problems: different fill sizes, different text sizes, different
surrounding contrast. One hex cannot serve all four without compromising some of
them.

So each component that carries status owns its own status scale:

| Component | Class prefix | Status |
|---|---|---|
| Status badge | `.zf-badge--*` | ✅ Defined — §2.1 |
| Banner | `.zf-banner--*` | Pending design |
| Toast | `.zf-toast--*` | Pending design |
| Icon | `.zf-icon--*` | Pending design |
| Inline validation | `.zf-field--*` | Pending design |

**The rule:** a component uses its own status classes and no other component's.
Two scales for the same meaning is correct — a badge and a banner may pick
different steps of Green. What they must not do is read each other's tokens,
because that produces colours that look almost right and nobody can trace why.

All scales resolve against the same ERP palette. Independent *selection* from a
shared palette, not independent palettes.

The `.zf-{component}--*` prefix makes ownership visible in markup and CSS alike.
A `.zf-badge--*` class appearing on anything that is not a badge is a review
comment.

These are component-level choices rather than semantic tokens because the value
is chosen per component, not derived from a shared role. They reference primitives
directly, so the flow in §3 is intact — nothing holds a literal hex.

---

## 1.3 Theming model

Two classes of colour, and they must never share a token.

### Themeable — swaps per theme

| Token | Consumers |
|---|---|
| `--zf-color-primary` | Nav active state, buttons |

Planned themes: Blue (default), Green, Red, Orange.

```css
[data-zf-theme="blue"]   { --zf-color-primary: var(--zf-blue-1200);   }
[data-zf-theme="green"]  { --zf-color-primary: var(--zf-green-1300);  }
[data-zf-theme="red"]    { --zf-color-primary: var(--zf-red-1300);    }
[data-zf-theme="orange"] { --zf-color-primary: var(--zf-orange-1300); }
```

### Fixed — identical in every theme

| Token | Family | Rationale |
|---|---|---|
| `--zf-color-link` | Blue | Blue means link, universally |
| `--zf-color-danger` | Red | Delete must read as destructive in all themes |
| `--zf-color-success` | Green | Meaning would break if themed |
| `--zf-color-warning` | Orange | Meaning would break if themed |

Fixed tokens are declared outside every `[data-zf-theme]` block so no theme can
reach them.

### Button hierarchy

| Level | Treatment |
|---|---|
| Primary CTA | Filled |
| Secondary CTA | Outlined |

**Known collision:** in the Red theme, a filled primary button and a delete
button are both red. In the Green theme, primary and success collide the same
way. The filled/outlined split carries CTA hierarchy; destructive intent is
carried additionally by label and icon. Revisit at button design.

---

## 1.4 Typography

**Figma:** 13 text styles, `zf/*`. **Family:** Inter throughout — Regular, Medium, Semi Bold.

Drawn from what the 52 built sets were already using: **1,306 text nodes measured**, and the scale
chosen so the largest number of them did not have to move.

| Style | Size / line-height | Ratio | Weight | Tracking | Case | Nodes it covers |
|---|---|---|---|---|---|---|
| `zf/display` | 40 / 48 | 1.20 | Semi Bold | — | — | *new* |
| `zf/title-lg` | 24 / 32 | 1.33 | Semi Bold | — | — | *new* |
| `zf/title` | 20 / 28 | 1.40 | Semi Bold | — | — | 20px, was 20/22.4 |
| `zf/heading` | 18 / 24 | 1.33 | Semi Bold | — | — | 18px, was 18/22.4 and 18/28.8 |
| `zf/subheading` | 16 / 24 | 1.50 | Semi Bold | — | — | 16/24 |
| **`zf/body`** | **13 / 20** | **1.54** | Regular | — | — | **682** |
| `zf/body-strong` | 13 / 20 | 1.54 | Medium | — | — | 178 |
| `zf/body-emphasis` | 13 / 20 | 1.54 | Semi Bold | — | — | 9 |
| `zf/body-sm` | 12 / 16 | 1.33 | Regular | — | — | 38 |
| `zf/label` | 12 / 16 | 1.33 | Medium | — | — | 29 |
| `zf/label-sm` | 11 / 16 | 1.45 | Medium | +2% | — | 82 |
| `zf/overline` | 11 / 17.6 | 1.60 | Semi Bold | +0.6px | UPPER | 12 |
| `zf/caption` | 10 / 12 | 1.20 | Regular | — | — | 8 |

### 1.4.1 One line-height per size, and case

The rule the scale enforces, and the reason it exists:

**13px — 72% of all text in the system — had five different line-heights.**

| On 13px | Nodes | Ratio |
|---|---|---|
| **20** | **731** | 1.538 |
| 20.8 | 91 | 1.600 |
| `AUTO` | 47 | font-dependent |
| 21 | 39 | 1.615 |
| 16 | 32 | 1.231 |

`20`, `20.8` and `21` are within a pixel of each other. Nobody chose three of them; they arrived
with the components they came in. They only become visible when two components sit in the same
row, which is the one comparison a component-by-component review never makes.

**`20.8` is ambiguous by construction.** It is 13 × 1.6 **and** 16 × 1.3. Both readings exist in
this file, so the same number encodes two different rules depending on which component you opened.

**`AUTO` appeared 95 times and is not a value.** It is whatever the font's metrics report, so it
cannot be tokenised, cannot be matched in CSS, and changes if the font is ever swapped. Every one
is now a number.

**The scale breaks its own rule once, and the check caught it rather than me.** 11px carries two
line-heights: `zf/label-sm` at 16 and `zf/overline` at 17.6. The defence is that upper-case text
has no descenders and can legitimately take different leading at the same size — so the rule is
*one line-height per size **and case***, not per size alone. That is a real distinction and it is
also a convenient one, which is why open item 39 keeps the decision live.

It is enforced in code rather than trusted: `npm run verify` fails on any size with more than one
line-height unless the exception is declared with a reason in `SCALE_EXCEPTIONS`. A rule that only
lives in a document is a rule that drifts.

### 1.4.2 The two exceptions, both deliberate

**`zf/overline` is 11 / 17.6** — the only non-integer line-height in the scale, and the only
pixel-unit tracking. 17.6 is 160%, matching the label pattern this file confirmed on the Status
Badge, and it is kept exactly as drawn so that no table or column header row moves. The cost is
that the scale is not all whole pixels. **Your decision, taken.**

**`label` and `label-sm` are not one style at two sizes.** `11 / 16 Medium +2%` (82 nodes) and
`11 / 17.6 Semi Bold +0.6px UPPER` (12 nodes) look adjacent and are not: one is a form label, the
other is an uppercase column header. Collapsing them would have changed every table header.

### 1.4.3 What is deliberately off the scale

**The avatar's numerals — 47 nodes.** `10/12`, `16/20`, `24/30`, `40/50`, all Medium. §2.22.2
defines the avatar initial as 40% of the diameter with a line-height of 1.25 × the type, at four
fixed sizes. That is a coherent internal rule and it is not the text scale — a numeral centred in
a circle is not body copy. It stays component-local.

The `+N` overflow chip in `zf-avatar-group` runs smaller again — 9, 13, 19, 32 against the
initials' 10, 16, 24, 40 — because "+8" is two characters where an initial is one. Sound
reasoning, inconsistent execution: the ratios are 90%, 81%, 79%, 80%. Open item 41.

### 1.4.4 Coverage, and what the gap is telling you

**1,158 of 1,306 nodes carry a style — 88.7%.** The remaining 148 are not noise; they are a list
of the places where the drawing disagrees with the scale.

| Group | Nodes | Where | What it means |
|---|---|---|---|
| The avatar's numerals | 51 | `zf-avatar`, `zf-avatar-group`, `zf-table-list-row` | intentional, §1.4.3 |
| **A tight 13 / 16 family** | **32** | `zf-wizard` (18), `zf-step` (14) | a real question — see below |
| **`zf-tab`** | **15** | `zf-tab` alone, across 8 combinations | the least-migrated set in the file |
| Weight siblings at scale sizes | 34 | banner, sidebar, topbar, nav-logo, date picker | 16/24 in three weights; 18/24 in two |
| 11 / 14 Semi Bold | 16 | `zf-accordion-item` | one component, one value |

**The 13 / 16 question is yours to settle.** The wizard and the step card pack 13px text at a 1.23
ratio inside tight cards. Folding them to `zf/body` adds 4px to each card — the geometry table
below shows exactly that happening to `zf-step-card`. Either accept the 4px and have one
line-height for 13px, or declare a documented dense variant. **Two line-heights for 13px is what
this whole section exists to remove, so I have not added one without your say.**

**`zf-tab` carries 8 off-scale type combinations, including `11.25 / AUTO Semibold +1.13px`** — a
non-integer size, an unresolvable line-height, a misspelled weight and a pixel tracking, in one
node. It is also the set holding the 12 unbound paints in open item 37. It has not been migrated;
everything else has.

### 1.4.5 Two things that were one thing spelled twice

**`Semi Bold` × 87 and `Semibold` × 2.** Different PostScript style names for the same weight. A
code generator emits two different `font-weight` values from those, and no review catches it
because they render identically. Both survivors are in `zf-tab`.

**Tracking mixes units** — `2%` × 42, `0.6px` × 12, `0.2px` × 3, `1.13px` × 2, `0.8%` × 1.
Percent scales with the size; pixels do not. The scale uses `%` everywhere except `zf/overline`,
which keeps `+0.6px` because that is what is drawn. Open item 40.

### 1.4.6 Geometry that moved

Applying the scale changed 37 variants, none by more than 4px. Recorded because a retrofit that
silently changes geometry is not a retrofit:

| Component | Change | Variants | Cause |
|---|---|---|---|
| `zf-pill` | width **+4** | 8 | tracking normalised to +2% on an 11px label |
| `zf-accordion-item` | height **−2** | 8 | 12/18 → 12/16 |
| `zf-stepper-field` | height −2 | 6 | 12/18 → 12/16 |
| `zf-step-card` | height **+4** | 4 | 20/`AUTO` → 20/28 |
| `zf-color-picker` | height +4 | 3 | 12/`AUTO` → 12/16 |
| `zf-table-delta` · `zf-table-link` | height −1 | 6 | 13/20.8 → 13/20 |
| `zf-wizard` | height +4 | 1 | 20/`AUTO` → 20/28 |
| `zf-tab` | height +1 | 1 | 13/20.8 → 13/20 |

Every one is the consequence of removing a value nobody chose. The `+4` on `zf-pill` is the one
worth looking at: it is 18 characters × 0.22px of tracking, and it is the correct width for an
11px label — the 29 nodes that had no tracking were the inconsistency, not the 42 that did.

---

## 1.5 Radius scale

**Figma:** collection `ZF Radius`, 7 `FLOAT` variables, one mode.

| Token | Value | Uses | Where |
|---|---|---|---|
| `radius/xs` | 2 | 7 | |
| `radius/sm` | 4 | 263 | Status badge, small controls |
| **`radius/md`** | **6** | **371** | the default — buttons, inputs, header actions |
| `radius/lg` | 8 | 48 | cards, tables, doc panels |
| `radius/xl` | 12 | 50 | |
| `radius/2xl` | 16 | 17 | |
| `radius/full` | 999 | 39 + every avatar | a capsule or a circle |

**Prefer `radius/full` over `size ÷ 2`.** §2.22.2 recorded an avatar drawn with `cornerRadius: 50`
on one size and `999` on three others — two ways of writing "circle", and only one of them
survives a resize. 999 always resolves to a capsule; 50 is a circle at exactly 100px and a rounded
rectangle at every other size.

**Retired:** `1`, `1.6`, `3`, `7`, `9`, `10`, `11`, `11.75`, `14`, `18`. The `1.6` (12 uses) and
`11.75` (27 uses) are the tell — they are scaled values from a source drawn at another size.

---

## 1.6 Spacing scale

**Figma:** collection `ZF Spacing`, 12 `FLOAT` variables, one mode.

### 1.6.1 The base unit is 2px, and this settles it

The stub that used to be here asked whether the base was 2px or 4px. Measured across 2,021
auto-layout frames:

```
8  ████████████████████████████████████████  484
10 █████████████████████████████████████████ 506
6  ████████████████████████████████          386
12 ███████████████████                       238
4  ██████████████████                        224
20 ████████████████                          198
16 ███████████                               135
2  ██████████                                128
```

**`2`, `6` and `10` account for 1,020 uses and none of them is a multiple of 4.** A 4px base would
forbid the first, third and eighth most common values in the system. It is a 2px base, with 4px
steps once past 12.

### 1.6.2 The scale

Named by **step**, not by pixel value, so a future density change rescales without renaming a
single token. `space-4` is 8px because 4 × 2 = 8.

| Token | Value | Uses |
|---|---|---|
| `space/0` | 0 | — |
| `space/1` | 2 | 128 |
| `space/2` | 4 | 224 |
| `space/3` | 6 | 386 |
| `space/4` | 8 | 484 |
| `space/5` | 10 | 506 |
| `space/6` | 12 | 238 |
| `space/8` | 16 | 135 |
| `space/10` | 20 | 198 |
| `space/12` | 24 | 14 |
| `space/16` | 32 | 12 |
| `space/20` | 40 | 12 |

**Your decision, taken:** step-indexed names over pixel-valued ones.

### 1.6.3 Retired values, and who owns them

The off-scale values are not scattered. They cluster in the components imported from outside this
file, which is what makes them safe to remove.

| Value | Component | Uses |
|---|---|---|
| 5 | `zf-date-range-picker` | **44** |
| 11 | `zf-accordion-item` | 32 |
| 1 | `zf-nav-item` · `zf-sidebar-nav` | 32 · 26 |
| 7 | `zf-sidebar-nav` · `zf-nav-collapsed-item` | 26 · 16 |
| 30 | `zf-step-card` · `zf-wizard` | 16 · 6 |
| 14 | `zf-topbar-tile` · `zf-tab` | 12 · 6 |
| 5 | `zf-color-mode` · `zf-preset-item` | 12 · 8 |
| 15 | `zf-tab` | 5 |

**The date range picker's 44 uses of `5` is the clearest case.** §2.18.1 recorded that its 204
paints were all Tailwind v4 — and Tailwind's spacing is 4px-based with a `1.25rem` step that lands
on 5. It is a foreign scale, not a decision. The sidebar's `1` and `7` came in with the remote
`Color Modes` library (§2.20.1) for the same reason.

**Negative gaps are not spacing.** `−6`, `−10`, `−15`, `−25` are the avatar stack's deliberate
−25% overlap (§2.22.6), and `−14` is the step trail's interlock (§2.19). §3's *Overlap:
interlocking versus compensating* covers when a negative gap is legitimate.

---

## 1.7 Icons

**Figma:** page `Icons` → `icon / chevron` (component set), `icon / search`
**Slot:** 16 × 16
**Source:** chevron geometry taken from node `13:8742` on the Input Field page

Every icon is a **16 × 16 component with one vector inside, optically centred**.
Components live on the Icons page so any screen pulls an instance rather than
pasting a vector.

### 1.7.1 Chevron

| Property | Value |
|---|---|
| Source path | `M 0 0 L 4 0 L 4 4` — a 4 × 4 corner, not a chevron |
| Stroke | 2px, round cap, round join |
| Colour | Neutral 1100 `#71758F` — 4.52:1 on white, clears the 3:1 for graphics |
| Directions | Down `-135°` · Up `45°` · Right `-45°` · Left `135°` |
| Visual size | 7.66 × 4.83 (down/up), 4.83 × 7.66 (left/right) |

Rotation does all the work — one path serves four directions, so they can't drift
apart.

### 1.7.2 The centring trap

Rotating a 4 × 4 path by 45° makes its **rendered** bounds 7.66 × 4.83, but Figma
still reports `width`/`height` as 4 × 4. Centring on the reported size leaves the
glyph visibly off-centre — which is exactly what was wrong in the input field
documentation before this fix.

```
✅  centre on  node.absoluteRenderBounds   (includes stroke)
❌  centre on  node.width / node.height    (pre-transform, excludes stroke)
```

### 1.7.3 Rules for adding an icon

| Step | What to do | Why |
|---|---|---|
| 1 | 16 × 16 component frame, no fill, `clipsContent` off | A uniform slot means swapping icons never shifts layout |
| 2 | One vector inside. 2px stroke, round cap and join, Neutral 1100 | Single-colour strokes can be recoloured downstream; multi-path fills can't |
| 3 | Centre on render bounds, then set constraints to **scale / scale** | Centring survives rotation; **scaling is what survives a resized slot** — §1.7.6 |
| 4 | Name `icon / {name}`. Use a Direction variant only when the same path rotates | Rotations belong in one set; different shapes belong in different sets |

Multiple subpaths inside a single vector are fine — `icon / search` is one vector
containing a bezier circle plus the handle stroke.

### 1.7.4 Naming

```
icon / chevron     Direction = Down · Up · Left · Right
icon / search
icon / close
icon / calendar
icon / eye         State = Open · Closed
icon / attach
icon / edit
```

**47 icons, and they are not authored the same way: 34 filled, 13 stroked, plus the four-way
`icon / chevron` set which is stroked.** A filled glyph recolours through `fills` and a stroked
one through `strokes`, so any script that rebinds one silently skips the other — which has now
cost four separate passes across four components (§2.21.9, §2.23.8, §2.23.10). Pick one and
convert the rest: open item 36.

`icon / attach` and `icon / edit` were authored for the page header, then **replaced with the
source's own vector data** in §2.23.10, along with `icon / settings` and `icon / close`.

`icon / more`, `icon / pin`, `icon / table-config`, `icon / arrow-up` and `icon / arrow-down`
were added for the tables (§2.24), all five from the source's own vector data. The arrows replace
a chevron that was standing in for a sort indicator — §2.24.10.

### 1.7.5 Applied to the Input Field

All 44 icons in the Input Field documentation are now instances of these two
components — 22 chevrons and 22 search icons. Previously they were hand-drawn
frames at 16 × 12 with the glyph positioned by hand, which is what caused the
alignment drift. Every one now sits at a **0.00px offset** from its field's
vertical centre.

The original component set still uses 16 × 12 icon frames — see issue 10 in
§2.5.10. Standardising those on this 16 × 16 slot closes it.

### 1.7.6 The resize trap

Rule 3 above used to say *centre / centre*, and that is what broke the avatar's admin
badge (§2.22.10). The 16 × 16 slot is a default, not a law — a badge glyph is 8, 12 or
20 — and **`CENTER` constraints re-centre the art on resize without scaling it.**

Resize a 16px slot down to 8 and the vector stays 16 wide. It is still perfectly
centred, which is why it does not read as a bug: it reads as an icon that has outgrown
its badge. Measured on the avatar:

| Slot | Vector, `CENTER` | Vector, `SCALE` |
|---|---|---|
| 8 | **16 × 13.52** — twice the slot | 8 × 6.76 |
| 12 | **16 × 13.52** | 12 × 10.14 |
| 20 | 16 × 13.52 — inside, by luck | 20 × 16.90 |

The 20px case is the dangerous one. It happens to fit, so the largest instance looks
correct and only the small ones are visibly wrong — which reads as "the small sizes need
work" rather than "the constraint is wrong on all of them".

```
✅  constraints = { horizontal: 'SCALE', vertical: 'SCALE' }
❌  constraints = { horizontal: 'CENTER', vertical: 'CENTER' }
```

Changing the constraint on the component does **not** retroactively fix instances that
were already resized — the art only scales during a resize. Set the constraint, then
resize each instance back to 16 and out to its target again.

An audit of every icon instance in this file whose slot is not 16 found **one** offender,
and it was this one.

**And the geometry is the only thing that scales.** `SCALE` constraints move and resize the
path; they do not touch `strokeWeight`. So a **stroked** glyph in a 32px slot draws 32px of
geometry with a 16px-slot outline weight, and reads hairline — which is why the 80px preview of
`icon / chevron` in §2.23.10 looked like a different icon from the 16px one. Only filled glyphs
survive a resize intact. That is the strongest argument in open item 36 for making the whole set
filled: `SCALE` fixes half the problem, and fills fix the other half.

The icon set is now **uniformly `SCALE`** — the audit above found 13 more `CENTER` vectors after
the avatar fix, and all of them are converted.

# 2. Components

## 2.1 Status Badge

**Figma:** page `Status Badge` → component set `status-badge` (`9:1134`)
**CSS prefix:** `.zf-badge`
**Variants:** 28 (2 emphasis × 14 states) — complete matrix, no gaps

A non-interactive, read-only label that communicates the current state of a
record. Appears in table cells, list rows, detail headers, and cards.

### 2.1.1 Anatomy

```
┌──────────────────────────┐
│ ←6px→  Status  ←6px→     │  height 22px fixed
└──────────────────────────┘
         radius 4px
```

Single-element component: a container with one text child. No icon, no dot, no
dismiss affordance in the current design.

### 2.1.2 Geometry

| Property | Value | Notes |
|---|---|---|
| Height | **22px** | Fixed — does not grow with content |
| Width | **Hug contents** | Grows with label |
| Max width | **200px** | Truncation ceiling |
| Padding — horizontal | **6px** | Left and right |
| Padding — vertical | **2px** | Moot at fixed height, but declared |
| Corner radius | **4px** | All corners |
| Item spacing | **10px** | Gap between children; unused at one child |
| Border | **1px solid #FFFFFF** | Inside-aligned |
| Layout | Horizontal, centre / centre | Both axes centred |

The 1px white inside border is deliberate: it lets adjacent badges in a dense
table row read as separate objects without needing a gap. On a white surface it
is invisible; on a tinted row it does the work.

### 2.1.3 Typography

| Property | Value |
|---|---|
| Family | Inter |
| Weight | 500 (Medium) |
| Size | 12px |
| Line height | 19.2px (160%) |
| Letter spacing | +0.2px |
| Case | As authored — sentence case recommended |

Positive letter spacing at 12px is correct practice: small text with tight
tracking loses legibility, particularly at the low contrast end of a tinted fill.

### 2.1.4 Variant axes

| Axis | Figma name | Options |
|---|---|---|
| Emphasis | `Light` | `Default`, `Solid` |
| State | `State` | 14 values — see table below |

**`Default`** — tinted background, dark text. Low visual weight. Use in tables
and lists where many badges appear at once.

**`Solid`** — saturated background, white text. High visual weight. Use where a
single status must be read at a glance: detail page headers, alerts, or to draw
attention to a terminal state.

### 2.1.5 Component properties

| Property | Type | Default |
|---|---|---|
| `Status Name` | TEXT | `Status` |

### 2.1.6 Colour specification

All values read from Figma. Contrast measured against WCAG 2.1 AA for normal
text (4.5:1 required). Class names are component-scoped — see §2.1.11.

| State | Class | Default fill / label | Palette | Ratio | Solid class | Solid fill / label | Palette | Ratio |
|---|---|---|---|---|---|---|---|---|
| Success | `.zf-badge--success` | `#D7F5E9` / `#095C3B` | Green 500 / 1600 | 6.96 ✅ | `.zf-badge--success-solid` | `#127A51` / `#FFFFFF` | Green 1400 | 5.35 ✅ |
| Accepted | `.zf-badge--accepted` | `#A3EBCE` / `#143025` | Green 700 / 1900 | 10.36 ✅ | `.zf-badge--accepted-solid` | `#095C3B` / `#FFFFFF` | Green 1600 | 8.06 ✅ |
| Approved | `.zf-badge--approved` | `#DCFAFA` / `#0F5454` | Cyan 400 / 1600 | 7.90 ✅ | `.zf-badge--approved-solid` | `#0F5454` / `#FFFFFF` | Cyan 1600 | 8.69 ✅ |
| Submitted / open / sent | `.zf-badge--submitted` | `#EBF2FC` / `#1A4291` | Blue 400 / 1600 | 8.35 ✅ | `.zf-badge--submitted-solid` | `#1A4291` / `#FFFFFF` | Blue 1600 | 9.41 ✅ |
| In progress | `.zf-badge--in-progress` | `#E6F3FA` / `#0D3E57` | Sky Blue 400 / 1700 | 10.07 ✅ | `.zf-badge--in-progress-solid` | `#13628A` / `#FFFFFF` | Sky Blue 1500 | 6.68 ✅ |
| Pending | `.zf-badge--pending` | `#FCF3E1` / `#593D04` | Yellow 300 / 1600 | 9.10 ✅ | `.zf-badge--pending-solid` | `#593D04` / `#FFFFFF` | Yellow 1600 | 10.03 ✅ |
| Overdue | `.zf-badge--overdue` | `#FAEEE3` / `#964600` | Orange 400 / 1400 | 5.80 ✅ | `.zf-badge--overdue-solid` | `#964600` / `#FFFFFF` | Orange 1400 | 6.62 ✅ |
| Cancelled | `.zf-badge--cancelled` | `#FAD7D9` / `#822127` | Red 600 / 1600 | 7.19 ✅ | `.zf-badge--cancelled-solid` | `#5C161B` / `#FFFFFF` | Red 1800 | 13.24 ✅ |
| Failed / stopped | `.zf-badge--failed` | `#FAEDEE` / `#822127` | Red 400 / 1600 | 8.38 ✅ | `.zf-badge--failed-solid` | `#822127` / `#FFFFFF` | Red 1600 | 9.56 ✅ |
| Draft | `.zf-badge--draft` | `#F0F1FA` / `#565A70` | Neutral 400 / 1300 | 6.04 ✅ | `.zf-badge--draft-solid` | `#6A6E85` / `#FFFFFF` | Neutral 1200 | 5.02 ✅ |
| Void | `.zf-badge--void` | `#E9EAF5` / `#4A4D63` | Neutral 500 / 1500 | 6.93 ✅ | `.zf-badge--void-solid` | `#565A70` / `#FFFFFF` | Neutral 1300 | 6.79 ✅ |
| Inactive | `.zf-badge--inactive` | `#DFE0EB` / `#3A3E53` | Neutral 600 / 1600 | 8.02 ✅ | `.zf-badge--inactive-solid` | `#4A4D63` / `#FFFFFF` | Neutral 1500 | 8.29 ✅ |
| Expired / written off | `.zf-badge--expired` | `#CED0DE` / `#3A3E53` | Neutral 700 / 1600 | 6.87 ✅ | `.zf-badge--expired-solid` | `#3A3E53` / `#FFFFFF` | Neutral 1600 | 10.53 ✅ |
| `ageneratedPurple` | `.zf-badge--TBD` | `#EEE6FA` / `#2B1F3D` | Purple 500 / 1900 | 12.69 ✅ | `.zf-badge--TBD-solid` | `#3F216B` / `#FFFFFF` | Purple 1700 | 12.80 ✅ |

**Every one of the 28 variants passes AA.** The weakest pairing is Solid Draft
at 5.02:1, still above the 4.5 threshold.

### Palette alignment — history

The component was originally built against a **superseded palette**. None of the
28 values matched a current primitive; every one sat 0.7–16.4 ΔE away from its
nearest step.

All 28 have now been snapped onto the current ERP palette (node `3:2`) by nearest
CIELAB distance. Results of that migration:

| Check | Outcome |
|---|---|
| WCAG AA, all 28 pairings | ✅ pass, with no manual adjustment needed |
| 14 normal fills unique | ✅ |
| 14 solid fills unique | ✅ |
| Neutral lightness ladder | ✅ preserved as Neutral 400 → 500 → 600 → 700 |

The snap was clean because the light tints were already within ΔE 0.7–2.9 of the
ERP steps — visually identical. The dark labels and solid fills moved further,
which is where the visible change is, though every one gained contrast headroom
rather than losing it.

**Weakest pairing shifted** from Solid Success (5.24:1) to Solid Draft (5.02:1).
Still above the 4.5 threshold, but it is now the value to watch if any neutral
step is ever retuned.

### Class naming

Each state is **one class carrying both the fill and the label colour**, with a
second class for solid emphasis. 28 classes for 28 variants.

```css
.zf-badge--success {
  background: var(--zf-green-500);
  color:      var(--zf-green-1600);
}

.zf-badge--success-solid {
  background: var(--zf-green-1400);
  color:      var(--zf-white);
}
```

Usage:

```html
<span class="zf-badge zf-badge--success">Approved</span>
<span class="zf-badge zf-badge--success-solid">Approved</span>
```

**Why classes, not tokens.** A variable holds one value, so it cannot carry a
fill and a label together — that is what forced the earlier `-bg` / `-fg` split.
A class body carries both, which collapses four names per state down to two and
removes the intermediate layer entirely. Classes reference primitives directly,
so the palette remains the single source of truth.

Slugs collapse the synonyms: `Submitted / open / sent` becomes `submitted`, not
`submitted-open-sent`. Those are alternate names different modules use for the
same state, so they share one class.

`ageneratedPurple` has no slug. It cannot have a class name until it has a real
state name — see issue 1 in §2.1.10. `TBD` is a deliberate placeholder so the gap
stays visible in the developer-facing column.

**Trade-off accepted.** With no `--zf-badge-*` variables, these colours cannot be
read from outside a stylesheet — for example from JavaScript for a canvas or
chart. Not a concern for badges; worth remembering if a future component needs its
status colours at runtime.

### 2.1.7 Semantic grouping

The 14 states resolve into six meaning families. This is what the tokens should
be named after — not the individual business states, which vary per module.

| Family | States | Hue |
|---|---|---|
| Positive / terminal-good | Success, Accepted, Approved | Green → Teal |
| Active / in-flight | Submitted / open / sent, In progress | Blue → Sky Blue |
| Attention | Pending, Overdue | Yellow-brown → Orange |
| Negative / terminal-bad | Cancelled, Failed / stopped | Red |
| Neutral / dormant | Draft, Void, Inactive, Expired / written off | Neutral |
| Unclassified | `ageneratedPurple` | Purple |

Note the deliberate weight gradient inside each family. Accepted is a heavier
green than Success; Cancelled Solid is deeper than Failed Solid. Progression
within a family encodes finality — the further along a workflow, the heavier the
badge.

### The neutral ladder — confirmed decision

`Draft / inactive` was originally one variant. It is now three separate states,
because they mean different things: Draft has never been submitted, Void was
nullified, Inactive was active and has been switched off.

Fills run light to dark in the order a record moves through them:

| Order | State | Normal fill | Solid fill |
|---|---|---|---|
| 1 | Draft | Neutral 400 `#F0F1FA` | Neutral 1200 `#6A6E85` |
| 2 | Void | Neutral 500 `#E9EAF5` | Neutral 1300 `#565A70` |
| 3 | Inactive | Neutral 600 `#DFE0EB` | Neutral 1500 `#4A4D63` |
| 4 | Expired / written off | Neutral 700 `#CED0DE` | Neutral 1600 `#3A3E53` |

The ladder now maps cleanly onto four consecutive palette steps — 400, 500, 600,
700 — which is a stronger result than the hand-picked values it replaced.

Two things were deliberate here:

**The swap.** Void previously held the lightest fill. Draft now holds it, so the
gradation runs monotonically in workflow order. Without the swap the ladder steps
darker then lighter, which reads as accidental rather than systematic.

**Void's solid changed**, because Draft and Void previously shared an identical
solid fill and were indistinguishable in Solid emphasis. After the palette
migration they sit at Neutral 1200 and 1300 respectively. All 14 normal fills and
all 14 solid fills are unique.

**Known limitation.** These four greys sit within roughly 1.1–1.2:1 of each other,
which is below the threshold of visible difference. Users will **not** distinguish these
states by colour in a live table — the label does that work, consistent with the
rule in §2.1.8 that colour reinforces meaning rather than carrying it. The
gradation earns its keep in legends, filter lists, and status keys where all four
appear together and a visible ordering helps.

### 2.1.8 Usage

**Do**

- Use `Default` in tables and lists. Many `Solid` badges in one view compete with
  each other and with the page's actual primary action.
- Keep labels to one or two words. The 200px ceiling exists to stop long labels
  breaking row height.
- Keep one state name per meaning across the whole product. If Sales says
  "Submitted" and Purchasing says "Sent", pick one.
- Reuse an existing state before adding a new one. Thirteen is already a lot for
  a user to learn.

**Don't**

- Don't make a badge clickable. It reports state; it does not change state. If
  the user can act on it, that is a button or a select.
- Don't rely on colour alone. The label carries the meaning; the colour
  reinforces it. Never ship a badge that is only a coloured dot.
- Don't override the fill to signal something new. Add a state to the set
  instead, so it exists once and is reusable.
- Don't put a badge inside a form field.

### 2.1.9 Accessibility

- All 28 variants meet WCAG 2.1 AA for normal text.
- Meaning is carried by the text label, so the component is not colour-dependent.
- Non-interactive: must not be focusable and must not appear in the tab order.
- For screen readers, the visible label is sufficient. Where the surrounding
  context does not make it obvious what the badge describes, associate it with
  its record rather than adding a hidden label to the badge itself.

### 2.1.10 Issues found in the Figma source

Five items to fix at source. Listed in priority order.

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | **High** | `ageneratedPurple` is a placeholder name, not a business state. It carries a full colour pair and will ship. | Rename to its real state, or delete the variant. |
| 2 | **High** | The `Accepted` variants (`9:1137`, `9:1141`) are not wired to the `Status Name` text property. Their labels cannot be overridden by consumers. | Bind `characters` to `Status Name#142:27`. |
| 3 | Medium | Vertical padding is inconsistent. Most variants declare `2px` top/bottom; `Solid/Success`, `Solid/Accepted`, `Default/Approved`, and `Solid/Approved` declare none. | Apply `2px` uniformly. |
| 4 | Medium | `maxWidth: 200` is set only on `Default/Success`. The other 25 variants have no truncation ceiling. | Apply `200px` to all variants. |
| 5 | Medium | `Expired/Written off` and `Void` bind their text colour to a **style** (`9:1125`, `9:1127`) rather than a variable, unlike every other variant. | Rebind to variables for consistent theming. |
| 6 | **High** | `Draft / inactive` has been split into three states (Draft, Void, Inactive). The component set still holds the old combined variant and has no Inactive variant, so it lags this document — 26 variants in Figma against 28 specified here. | Rename `Draft / inactive` → `Draft`, add `Inactive` in both emphases. |
| 7 | **High** | The component set still carries the superseded palette's hexes. All 28 values in this document are the new primitives; Figma has the old ones. | Re-bind all 28 fills and label colours to the current ERP palette variables. |

### 2.1.11 Palette source — superseded, now aligned

**Previous position (superseded).** These colours were treated as a deliberate
second collection, on the reasoning that success-as-a-badge and
success-as-a-banner are different problems needing different values.

**Current position.** The divergence was not a design decision — the component
predated the current ERP palette. All 28 values are now exact primitives. See
"Palette alignment — history" above for the migration record.

**What this changes:** the palette is a single source of truth again. Editing a
primitive now reaches the badges.

**What it does not change:** the colours stay component-scoped. They live inside
`.zf-badge--*` rules and nowhere else.

```css
.zf-badge--success       { background: var(--zf-green-500);  color: var(--zf-green-1600); }
.zf-badge--success-solid { background: var(--zf-green-1400); color: var(--zf-white); }
```

There is no intermediate `--zf-badge-*` variable layer. Classes reference
primitives directly, which keeps the palette as the single source of truth and
removes a layer that existed only because a variable cannot hold a fill and a
label at once.

The boundary from the original decision still holds:

| | |
|---|---|
| Defines | Status badge fills and label colours, all 28 classes |
| Does **not** define | Banners, toasts, icons, inline validation, alerts, charts, borders |
| Scope | `.zf-badge--*` rules only |

Other status-carrying components write their own classes against the same palette
— see §1.2. Two components may legitimately pick different steps of Green for
"success"; what they must not do is reuse each other's classes.

## 2.2 Radio Button

**Figma:** page `radio button` → component set `radio` (`11:3779`)
**CSS class:** `.zf-radio`
**Axes:** 3 — `State` (4) × `Is Active` (2) × `Is Error` (2) = 16 combinations
**Variants present:** **10 of 16** — incomplete matrix, see §2.2.9

A single-select control. Exactly one option in a group may be chosen, and
choosing one clears the others. This component is the **control only** — no label
is included.

### 2.2.1 Anatomy

```
      ○            ◉            ⦿
   resting     selected     focused
   12px         12px        12px + 16px ring
```

| Part | Detail |
|---|---|
| Control | 12 × 12 circle, `border-radius: 999px` |
| Border | 1px resting, **3px when selected** |
| Fill | White; Neutral 400 when disabled |
| Focus ring | Separate 16 × 16 circle, absolutely positioned, 2px outside the control |
| Hover halo | 3px spread shadow at 20% opacity, no blur |

**There is no centre dot.** Selection is shown by thickening the border to 3px,
which leaves a 6px white core. This is a ring treatment, not a filled dot —
developers must not add a dot.

### 2.2.2 Geometry

| Property | Value | Notes |
|---|---|---|
| Size | **12 × 12** | Bound to variables: min 12, max 14 |
| Corner radius | 999px | Full circle |
| Border — resting | 1px, centre-aligned | |
| Border — selected | **3px, inside-aligned** | Leaves a 6px white core |
| Focus ring size | 16 × 16 | 2px clear of the control on all sides |
| Focus ring stroke | 1.1428571px, outside | ⚠ Not a round number — see issue 5 |
| Hover halo | 0px offset, 0px blur, 3px spread, 20% alpha | Solid ring, not a soft glow |

The control can grow to 14px via its bound variables, but the focus ring is a
fixed 16px. At 14px the ring gap collapses from 2px to 1px. See issue 6.

### 2.2.3 Variant axes

| Axis | Figma name | Options |
|---|---|---|
| Interaction state | `State` | `default`, `hover`, `focus`, `disabled` |
| Selection | `Is Active` | `no`, `yes` |
| Validation | `Is Error` | `no`, `yes` |

### 2.2.4 Colour specification

Snapped to the ERP palette by nearest CIELAB distance. Contrast measured to
**WCAG 1.4.11 non-text contrast — 3:1 required** for control boundaries, not the
4.5:1 text threshold.

| Role | Original | Palette | Snapped | ΔE | vs white | Verdict |
|---|---|---|---|---|---|---|
| Border — resting | `#E4E4F0` | Neutral 600 | `#DFE0EB` | 1.6 | 1.31:1 | ❌ **fails 3:1** |
| Border — selected / hover | `#1B6DE0` | Blue 1200 | `#3874EB` | 4.1 | 4.32:1 | ✅ |
| Border — hover selected | `#1B4C91` | Blue 1600 | `#1A4291` | 8.8 | 9.41:1 | ✅ |
| Focus ring | `#1B4C91` | Blue 1600 | `#1A4291` | 8.8 | 9.41:1 | ✅ |
| Border — error | `#CC2132` | Red 1400 | `#B22D36` | 14.1 | 6.32:1 | ✅ |
| Border — disabled selected | `#A7C7F5` | Blue 800 | `#B1CAFC` | 3.5 | 1.65:1 | ✅ exempt |
| Fill — disabled | `#F2F2FA` | Neutral 400 | `#F0F1FA` | 0.7 | 1.12:1 | ✅ decorative |
| Fill — resting | `#FFFFFF` | — | `#FFFFFF` | 0 | — | Add `--zf-white` |

Disabled controls are explicitly exempt from 1.4.11, so Blue 800 is acceptable
there. The **resting border is not exempt** — see issue 1.

### 2.2.5 State matrix — the 10 variants that exist

| # | Selector | Border | Fill | Extra |
|---|---|---|---|---|
| 1 | `.zf-radio` | 1px Neutral 600 | White | — |
| 2 | `.zf-radio:checked` | 3px Blue 1200 | White | — |
| 3 | `.zf-radio--error` | 1px Red 1400 | White | — |
| 4 | `.zf-radio:hover` | 1px Blue 1200 | White | Halo, Blue 1200 20% |
| 5 | `.zf-radio:checked:hover` | 3px Blue 1600 | White | — |
| 6 | `.zf-radio--error:hover` | 1px Red 1400 | White | Halo, Red 1400 20% |
| 7 | `.zf-radio:focus-visible` | 1px Neutral 600 | White | Ring, Blue 1600 |
| 8 | `.zf-radio:checked:focus-visible` | 3px Blue 1200 | White | Ring, Blue 1600 |
| 9 | `.zf-radio:disabled` | 1px Neutral 600 | Neutral 400 | — |
| 10 | `.zf-radio:checked:disabled` | 3px Blue 800 | White | — |

### 2.2.6 Missing variants — 6 of 16

| State | Checked | Error | Consequence of absence |
|---|---|---|---|
| default | yes | yes | A selected option cannot show a validation error |
| hover | yes | yes | Same, on hover |
| **focus** | no | **yes** | **A keyboard user in an error state gets no focus indication** |
| **focus** | yes | **yes** | Same |
| disabled | no | yes | Undefined — arguably correct to omit |
| disabled | yes | yes | Undefined — arguably correct to omit |

The two focus + error gaps are the serious ones. Error styling replaces the
border colour, and focus is shown by a separate ring — so the two are
compositionally independent and should combine cleanly. Their absence means
keyboard users cannot see focus on an invalid radio group, which is precisely
when they most need it.

The four disabled + error combinations are defensible omissions: a disabled
control cannot be corrected, so surfacing an error on it is arguably wrong.
Worth deciding explicitly rather than leaving implicit.

### 2.2.7 Selector strategy

Unlike the status badge, radio states map onto **native CSS pseudo-classes**, so
no state classes are invented:

| Figma axis value | Selector | Why |
|---|---|---|
| `State = default` | `.zf-radio` | Base |
| `State = hover` | `:hover` | Native |
| `State = focus` | `:focus-visible` | Native — `:focus-visible`, not `:focus`, so the ring appears for keyboard only |
| `State = disabled` | `:disabled` | Native |
| `Is Active = yes` | `:checked` | Native |
| `Is Error = yes` | `.zf-radio--error` | **Not** a native state — needs a class |

Only validation needs a class, because the browser has no concept of "this radio
group is invalid" that CSS can select on reliably. Everything else the browser
already tracks, and using the native state keeps the control accessible for free.

```css
.zf-radio {
  width: 12px; height: 12px; border-radius: 999px;
  background: var(--zf-white);
  border: 1px solid var(--zf-neutral-600);
}
.zf-radio:checked        { border: 3px solid var(--zf-blue-1200); }
.zf-radio:hover          { border-color: var(--zf-blue-1200);
                           box-shadow: 0 0 0 3px rgb(56 116 235 / .2); }
.zf-radio:checked:hover  { border-color: var(--zf-blue-1600); box-shadow: none; }
.zf-radio:focus-visible  { outline: 2px solid var(--zf-blue-1600);
                           outline-offset: 2px; }
.zf-radio:disabled       { background: var(--zf-neutral-400); }
.zf-radio:checked:disabled { border-color: var(--zf-blue-800); }
.zf-radio--error         { border-color: var(--zf-red-1400); }
.zf-radio--error:hover   { box-shadow: 0 0 0 3px rgb(178 45 54 / .2); }
```

Note the focus ring is expressed as `outline` with `outline-offset`, not as a
separate element. It reproduces the 16px ring geometry exactly, follows the
control if it grows to 14px, and never affects layout.

### 2.2.8 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Non-text contrast 1.4.11 | ❌ **fail** | Resting border is 1.31:1 against white; 3:1 required |
| Target size 2.5.8 | ❌ **fail** | 12 × 12 control; 24 × 24 minimum |
| Focus visible 2.4.7 | ⚠ partial | Ring exists, but not for error states |
| Focus contrast | ✅ | Blue 1600 ring at 9.41:1 |
| Colour independence | ⚠ | Error is conveyed by border colour alone |
| Keyboard operation | ✅ | Arrow keys and Space, if a native `<input type="radio">` |

**Target size.** The control must not be the hit area. Wrap it in a label with at
least 24 × 24 of clickable space — which is good practice anyway, since clicking
the text label should select the radio.

**Error by colour alone.** A red border is the only error signal. Pair it with a
text message referenced by `aria-describedby`, and set `aria-invalid="true"` on
the input.

**Grouping.** Radios must sit in a `<fieldset>` with a `<legend>`, or a container
with `role="radiogroup"` and an accessible name. Without it, a screen reader
announces the options but not what they are choosing between.

### 2.2.9 Issues found in the Figma source

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | **High** | Resting border fails WCAG 1.4.11 at 1.31:1 against white. Snapping to Neutral 600 does not fix it — the first Neutral step that passes 3:1 is **Neutral 1100** (`#71758F`, 4.52:1). | Darken the resting border to Neutral 1100. This is a visible change, so it needs a design decision, not a silent edit. |
| 2 | **High** | 12 × 12 control is half the WCAG 2.5.8 minimum target size of 24 × 24. | Add a label wrapper component with a ≥24px hit area. The 12px circle can stay as the visual. |
| 3 | **High** | 6 of 16 variants missing, including both **focus + error** combinations. | Add `focus / error` for checked and unchecked at minimum. Decide explicitly whether disabled + error is intentionally excluded. |
| 4 | Medium | Variant `11:3780` contains a stray empty 100 × 100 frame named `Frame 38` inside a 12 × 12 control. | Delete it. |
| 5 | Medium | Focus ring stroke is `1.1428571px` — exactly 16/14, a scaling artifact from a 14px original. Sub-pixel strokes render blurry. | Set to 2px. |
| 6 | Medium | Control can grow to 14px via bound variables, but the focus ring is a fixed 16px, so the 2px gap collapses to 1px at max size. | Make the ring relative, or use CSS `outline-offset` as in §2.2.7. |
| 7 | Medium | Hover halo is inconsistent: visible on unchecked hover, present but hidden on checked hover. | Decide one behaviour and apply it to both. |
| 8 | Low | Variants declare `layoutMode: VERTICAL` with `itemSpacing: 10` despite having no children. | Remove the auto-layout. |
| 9 | Low | No label is part of the component, and no guidance accompanies it, so labelling is left entirely to consumers. | Ship a `radio + label` composite alongside the bare control. |

## 2.3 Checkbox

**Figma:** page `Check box` → `checkbox` (`13:4746`) and `checkbox_defined` (`13:4782`)
**CSS class:** `.zf-checkbox`
**Axes:** 4 — `State` (4) × `is_active` (2) × `is_indeterminate` (2) × `is_error` (2)
**Variants present:** **15 of 24 valid** — see §2.3.6

A multi-select control. Each checkbox is independent — any number may be on or
off. Supports a third **indeterminate** state for parent rows whose children are
partly selected.

### 2.3.1 Palette status — already migrated

**Eight of twelve colour values are exact ERP primitives.** Unlike the status
badge and radio button, this component was built against the current palette.

| Needs attention | Current | Target | ΔE |
|---|---|---|---|
| Border — resting | `#E4E4F0` | Neutral 600 | 1.6 |
| Label text | `#202433` | Neutral 1900 | 1.6 |
| Description text | `#58627F` | Neutral 1300 | 5.4 |
| Glyph white | `#FFFFFF` | needs `--zf-white` | — |

### 2.3.2 Anatomy

A 12px rounded square. Selection is a white glyph on a filled box — a checkmark
when on, a horizontal bar when indeterminate.

### 2.3.3 Geometry

| Property | Value | Notes |
|---|---|---|
| Size | **12 × 12** | Locked — min and max both 12, unlike the radio's 14 |
| Corner radius | **2px** | A rounded square, not a circle |
| Border | 1px, centre-aligned | Fails 1.4.11 at resting |
| Fill — unchecked | `#FFFFFF` | Needs `--zf-white` |
| Fill — checked | Blue 1200 | Border matches the fill exactly |
| Check glyph | 7.32 × 5.46, stroke 1.75px | Round cap and join, white |
| Indeterminate glyph | 7.89 × 2, radius 1px | A drawn bar, not a dash character |
| Icon frame | 9.192388 × 9.192388 | = 6.5 × √2 → a 45° rotated frame. Issue 6 |
| Focus ring | 16 × 16, radius 4.2666669px | Stroke 1.0666667px = 16 ÷ 15 |
| Hover halo | 0 offset, 0 blur, 3px spread, 20% | Unchecked and error only |
| Padding | 10px all sides | Cannot take effect. Issue 7 |

### 2.3.4 Colour specification

Measured to **WCAG 1.4.11 non-text contrast — 3:1** for control boundaries.

| Role | Value | Palette | Status | vs white | Verdict |
|---|---|---|---|---|---|
| Border — resting | `#E4E4F0` | Neutral 600 | legacy | 1.26:1 | ❌ **fails** |
| Border / fill — checked, hover | `#3874EB` | Blue 1200 | **exact** | 4.32:1 | ✅ |
| Fill — hover checked | `#2762D9` | Blue 1300 | **exact** | 5.48:1 | ✅ |
| Fill — hover indeterminate | `#1C5BD9` | Blue 1400 | **exact** | 5.92:1 | ✅ |
| Focus ring | `#1E53BD` | Blue 1500 | **exact** | 6.94:1 | ✅ |
| Border — error | `#C9474F` | Red 1200 | **exact** | 4.67:1 | ✅ |
| Fill — disabled checked | `#B1CAFC` | Blue 800 | **exact** | 1.65:1 | ✅ exempt |
| Fill — disabled unchecked | `#F5F6FC` | Neutral 300 | **exact** | 1.08:1 | ✅ exempt |
| Border — disabled unchecked | `#DFE0EB` | Neutral 600 | **exact** | 1.31:1 | ✅ exempt |
| Label — 13px | `#202433` | Neutral 1900 | legacy | 15.42:1 | ✅ |
| Description — 12px | `#58627F` | Neutral 1300 | legacy | 6.05:1 | ✅ |
| Glyph | `#FFFFFF` | add `--zf-white` | missing | — | ⚠ |

White glyph on Blue 1200 is 4.32:1, comfortably over the 3:1 needed for graphics.

### 2.3.5 State matrix — the 15 variants that exist

| # | Selector | Fill / border | Glyph | Extra |
|---|---|---|---|---|
| 1 | `.zf-checkbox` | White / Neutral 600 | — | — |
| 2 | `:hover` | White / Blue 1200 | — | Halo Blue 1200 20% |
| 3 | `:focus-visible` | White / Neutral 600 | — | Ring Blue 1500 |
| 4 | `:disabled` | Neutral 300 / Neutral 600 | — | — |
| 5 | `:checked` | Blue 1200 / Blue 1200 | Check | — |
| 6 | `:checked:hover` | Blue 1300 / Blue 1300 | Check | No halo |
| 7 | `:checked:focus-visible` | Blue 1200 / Blue 1200 | Check | Ring Blue 1500 |
| 8 | `:checked:disabled` | Blue 800 / Blue 800 | Check | — |
| 9 | `:indeterminate` | Blue 1200 / Blue 1200 | Bar | — |
| 10 | `:indeterminate:hover` | Blue 1400 / Blue 1400 | Bar | Blue 1400, not 1300 |
| 11 | `:indeterminate:focus-visible` | Blue 1200 / Blue 1200 | Bar | Ring Blue 1500 |
| 12 | `:indeterminate:disabled` | Blue 800 / Blue 800 | Bar | — |
| 13 | `.zf-checkbox--error` | White / Red 1200 | — | — |
| 14 | `.zf-checkbox--error:hover` | White / Red 1200 | — | Halo Red 1200 20% |
| 15 | `.zf-checkbox--error:focus-visible` | White / Red 1200 | — | Ring Blue 1500 |

Variant 15 is worth noting: the checkbox **has** focus + error, which the radio
button lacks entirely. Whatever was done here should be back-ported to the radio.

### 2.3.6 The axis modelling problem

Four booleans give 32 combinations, but `is_active` and `is_indeterminate` are
mutually exclusive — a checkbox cannot be both. That makes **8 combinations
logically impossible**, so the real matrix is 24, of which 15 exist.

Nothing stops a designer selecting both booleans in Figma, producing a state with
no styling. A single `Selection` axis with `unchecked · checked · indeterminate`
would make the invalid combination unrepresentable and cut the matrix to 24
without losing anything.

**The 9 missing valid variants:**

| Selection | State | Consequence |
|---|---|---|
| Checked | default, hover, focus | ❗ A ticked box in an invalid group shows no error |
| Indeterminate | default, hover, focus | A partly-selected parent row cannot show an error |
| All three | disabled | Undefined — likely correct to omit |

Error styling exists **only for the unchecked box**. That is the significant gap.

### 2.3.7 Composite — `checkbox_defined`

A second component set pairs the control with a label and optional description.
This is what teams should use, because the label provides the hit area.

| Property | Value |
|---|---|
| Gap — control to text | 8px |
| Gap — label to description | 4px |
| Control column top padding | 4px, in the `with_description` variant only |
| Label | Inter **Regular** 13 / 20px, Neutral 1900 |
| Description | Inter Regular 12 / 19.2px, Neutral 1300 |
| Text properties | `Label Text`, `Description Text` — both overridable |

**But the composite has no state axes.** It exposes only `with_description`, and
its nested control is pinned to default / unchecked / no error. So it cannot
represent a checked, hovered, focused, disabled or invalid row — every consumer
must override the nested instance by hand, which is exactly the drift this project
exists to prevent. It also has no error styling for the label or description text.

### 2.3.8 Selector strategy

Checkbox has more native state than any component so far, including
`:indeterminate` — a real CSS pseudo-class that many designers don't know exists.

| Figma axis value | Selector |
|---|---|
| `State = default` | `.zf-checkbox` |
| `State = hover` | `:hover` |
| `State = focus` | `:focus-visible` |
| `State = disabled` | `:disabled` |
| `is_active = yes` | `:checked` |
| `is_indeterminate = yes` | `:indeterminate` |
| `is_error = yes` | `.zf-checkbox--error` |

```css
.zf-checkbox {
  width: 12px; height: 12px; border-radius: 2px;
  background: var(--zf-white);
  border: 1px solid var(--zf-neutral-600);
}
.zf-checkbox:hover                  { border-color: var(--zf-blue-1200);
                                      box-shadow: 0 0 0 3px rgb(56 116 235 / .2); }
.zf-checkbox:focus-visible          { outline: 2px solid var(--zf-blue-1500);
                                      outline-offset: 2px; }
.zf-checkbox:disabled               { background: var(--zf-neutral-300); }

.zf-checkbox:checked,
.zf-checkbox:indeterminate          { background: var(--zf-blue-1200);
                                      border-color: var(--zf-blue-1200); }
.zf-checkbox:checked:hover          { background: var(--zf-blue-1300);
                                      border-color: var(--zf-blue-1300); }
.zf-checkbox:indeterminate:hover    { background: var(--zf-blue-1400);
                                      border-color: var(--zf-blue-1400); }
.zf-checkbox:checked:disabled,
.zf-checkbox:indeterminate:disabled { background: var(--zf-blue-800);
                                      border-color: var(--zf-blue-800); }

.zf-checkbox--error                 { border-color: var(--zf-red-1200); }
.zf-checkbox--error:hover           { box-shadow: 0 0 0 3px rgb(201 71 79 / .2); }
```

**Indeterminate must be set in JavaScript** — `el.indeterminate = true`. There is
no HTML attribute for it, which is the single most common implementation mistake
with this control.

Draw the glyphs as inline SVG or a CSS mask rather than a background image, so
they inherit `currentColor` and stay crisp at any zoom.

### 2.3.9 Usage

**Do**

- Use checkboxes when options are independent. If exactly one must be chosen, use
  a radio group.
- Use `checkbox_defined` rather than the bare control — the label provides the
  24px hit area.
- Reserve indeterminate for parent rows whose children are partly selected. Never
  let a user set it directly.
- Write labels as positive statements. "Send me email" reads clearly; "Do not send
  me email" inverts twice when unticked.

**Don't**

- Don't use a checkbox for an action that takes effect immediately. That's a
  switch.
- Don't use indeterminate as a third user-selectable value. It's a computed
  summary, not a choice.
- Don't rely on the red border alone for errors.
- Don't make the 12px box the click target.
- Don't set `indeterminate` as an HTML attribute — it doesn't exist.

### 2.3.10 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Non-text contrast 1.4.11 | ❌ fail | Resting border 1.26:1 against white |
| Target size 2.5.8 | ❌ fail | 12 × 12 against a 24 × 24 minimum |
| Focus visible 2.4.7 | ✅ | Ring present for every state including error |
| Focus ring contrast | ✅ | Blue 1500 at 6.94:1 |
| Glyph contrast | ✅ | White on Blue 1200 at 4.32:1 |
| Colour independence 1.4.1 | ⚠ | Error conveyed by border colour alone |
| Indeterminate announced | ⚠ | Native inputs announce "mixed". A `div` with `role="checkbox"` needs `aria-checked="mixed"` |
| Keyboard operation 2.1.1 | ✅ | Space toggles, inherited from the native input |

### 2.3.11 Cross-component drift

Checkbox and radio share three roles and disagree on two of them.

| Role | Checkbox | Radio | Same? |
|---|---|---|---|
| Focus ring | Blue 1500 `#1E53BD` | `#1B4C91` → Blue 1600 | ❌ different |
| Error border | Red 1200 `#C9474F` | `#CC2132` → Red 1400 | ❌ different |
| Resting border | `#E4E4F0` → Neutral 600 | `#E4E4F0` → Neutral 600 | ✅ |
| Hover halo | 3px spread, 20% | 3px spread, 20% | ✅ |
| Disabled selected fill | Blue 800 | `#A7C7F5` → Blue 800 | ✅ after snap |
| Control size | 12 × 12 locked | 12 × 12, max 14 | ⚠ different |

A focus ring should look identical on every control — it's the same signal. Two
values means a keyboard user watches the indicator shift as they tab from a
checkbox to a radio. Same for error.

**These belong in the semantic layer**, defined once and referenced by both:

```css
--zf-color-focus:         var(--zf-blue-1500);
--zf-color-danger-border: var(--zf-red-1200);
```

Pick one value per role. Checkbox's values are the better starting point, since
they're already exact primitives.

### 2.3.12 Issues found in the Figma source

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | **High** | Resting border fails 1.4.11 at 1.26:1. Neutral 600 gives 1.31:1 — still failing. First passing step is Neutral 1100 (4.52:1). | Darken to Neutral 1100. Needs a design decision. |
| 2 | **High** | 12 × 12 control against the 24 × 24 minimum target size. | Mandate `checkbox_defined` with a ≥24px row hit area. |
| 3 | **High** | Four booleans permit `is_active` + `is_indeterminate` together — 8 unstyled combinations. | Replace with one `Selection` axis: unchecked · checked · indeterminate. |
| 4 | **High** | 9 of 24 valid variants missing. Error exists only for unchecked. | Add error for checked and indeterminate across default, hover, focus. |
| 5 | **High** | `checkbox_defined` exposes only `with_description`; its nested control is pinned and cannot express any state. | Expose State, Selection and Error and wire them through. |
| 6 | Medium | Icon frame is 9.192388 × 9.192388 = 6.5 × √2, indicating a 45° rotated frame. | Reset rotation, size to whole pixels. |
| 7 | Medium | 10px padding on all variants despite a locked 12px size and no children. | Remove the padding and auto-layout. |
| 8 | Medium | Hover halo present on unchecked and error, absent on checked and indeterminate which darken the fill instead. | Pick one hover language and document it. |
| 9 | Medium | Hover darkens checked to Blue 1300 but indeterminate to Blue 1400. | Use one step for both. |
| 10 | Medium | Focus ring stroke 1.0666667px, radius 4.2666669px — sub-pixel, renders blurry. | Stroke 2px, radius 4px. |
| 11 | Low | Label uses Inter Regular 400 where form labels are usually Medium 500. | Confirm whether Regular is intentional. |

## 2.4 Toggle

**Figma:** page `Toggle` → component set `Toggle` (`13:6181`)
**CSS class:** `.zf-toggle`
**Axes:** 4 — `Is on` (2) × `State` (4) × `is_error` (2) × `is_small` (2) = 32
**Variants present:** **20 of 32** — see §2.4.5

A binary switch that takes effect **immediately**. Unlike a checkbox, a toggle
needs no Save — flipping it *is* the action. Ships in two sizes and has no label
of its own.

### 2.4.1 The critical failure

**The white knob is 1.48:1 against the grey off-track**, where WCAG 1.4.11
requires 3:1. The knob's position is what tells a user whether the switch is on,
so the single most important visual signal in this component is the one that
fails. The off-track is also 1.48:1 against the page, meaning the control barely
reads as a control until it is switched on.

**Two ways to fix it:**

| Option | Change | Result | Trade-off |
|---|---|---|---|
| **A** | Track → Neutral 1100 `#71758F` | 4.52:1 for both track and knob | Off state becomes visually heavy; a column of off toggles reads dark |
| **B** | Keep track, add 1px Neutral 1100 border to the knob | Knob edge carries the boundary | Off state stays light. More common in mature systems |

I'd lean **B**. Your call — it's a visible design change either way.

### 2.4.2 Anatomy

A pill-shaped track with a circular knob. Position carries the state — left is
off, right is on. No label, icon or text inside the control.

### 2.4.3 Geometry

| Property | Large | Small (`is_small=yes`) | Notes |
|---|---|---|---|
| Track | 30 × 18 | 24 × 14 | Both FIXED |
| Corner radius | 20px | 16px | Both exceed half the height → fully round |
| Padding | 2px | 2px | **Identical in both sizes** |
| Knob | 14 × 14 | 10 × 10 | = height − 2 × padding. Consistent |
| Knob travel | 12px | 10px | = width − 2 × padding − knob |
| Focus ring | 34 × 22 | 28 × 18 | 2px clear on all sides |
| Focus ring stroke | 1.0285714865px | 0.8228572011px | Sub-pixel — issue 6 |
| Alignment off / on | MIN / MAX | MIN / MAX | This is the whole mechanism |

**The small size is not a uniform scale.** Width × 0.800, height × 0.778, knob
× 0.714 — three different ratios. Because padding stays 2px, it takes a
proportionally larger bite from the smaller track.

### 2.4.4 Colour specification

Five of eight values are exact ERP primitives. Contrast measured **twice** — the
track against the page, and the knob against its own track.

| Role | Value | Palette | Status | vs page | Knob vs track | Verdict |
|---|---|---|---|---|---|---|
| Track — off | `#D3D3E5` | Neutral 700 | legacy ΔE 2.6 | 1.48:1 | 1.48:1 | ❌ **both fail** |
| Track — off hover | `#BCBCD1` | Neutral 800 | legacy ΔE 4.5 | 1.87:1 | 1.87:1 | ❌ **both fail** |
| Track — on | `#3874EB` | Blue 1200 | **exact** | 4.32:1 | 4.32:1 | ✅ |
| Track — on hover | `#2762D9` | Blue 1300 | **exact** | 5.48:1 | 5.48:1 | ✅ |
| Track — on disabled | `#94B3F2` | Blue 900 | **exact** | 2.10:1 | 2.10:1 | ✅ exempt |
| Focus ring | `#1C5BD9` | Blue 1400 | **exact** | 5.92:1 | — | ✅ |
| Focus ring — error | `#C9474F` | Red 1200 | **exact** | 4.67:1 | — | ✅ |
| Knob | `#FFFFFF` | add `--zf-white` | missing | — | — | ⚠ |

### 2.4.5 State matrix and missing variants

Ten combinations × 2 sizes = the 20 present variants.

| # | Selector | Track | Knob | Extra |
|---|---|---|---|---|
| 1 | `.zf-toggle` | Neutral 700 | left | — |
| 2 | `:hover` | Neutral 800 | left | — |
| 3 | `:focus-visible` | Neutral 700 | left | Ring Blue 1400 |
| 4 | `:disabled` | Neutral 800 @ 50% | left | Uses the **hover** track — issue 4 |
| 5 | `:checked` | Blue 1200 | right | — |
| 6 | `:checked:hover` | Blue 1300 | right | — |
| 7 | `:checked:focus-visible` | Blue 1200 | right | Ring Blue 1400 |
| 8 | `:checked:disabled` | Blue 900 @ 50% | right | — |
| 9 | `--error:focus-visible` | Neutral 700 | left | Ring Red 1200 |
| 10 | `--error:checked:focus-visible` | Blue 1200 | right | Ring Red 1200 |

**Error is modelled as a focus treatment, not a state.** The only error variants
are focus variants, so error is expressed purely by swapping the ring from blue to
red. Nothing about the track or knob changes. That makes error invisible to a
mouse user, invisible in a screenshot, and invisible to anyone who hasn't tabbed
to the control.

The 12 missing variants are all non-focus error combinations:

| Missing | Count | Severity |
|---|---|---|
| Default + error, on and off | 4 | ❗ Must add |
| Hover + error, on and off | 4 | Should add |
| Disabled + error, on and off | 4 | Likely omit |

### 2.4.6 Selector strategy

A toggle is a checkbox in a different coat. Build it on a native
`<input type="checkbox">` or a `<button role="switch">` — that gives `:checked`,
`:disabled`, `:focus-visible` and keyboard support for free, and screen readers
announce "on" / "off" rather than "ticked".

| Figma axis value | Selector |
|---|---|
| `Is on = On` | `:checked` or `[aria-checked="true"]` |
| `State = Hover` | `:hover` |
| `State = focus` | `:focus-visible` |
| `State = Disabled` | `:disabled` |
| `is_error = yes` | `.zf-toggle--error` |
| `is_small = yes` | `.zf-toggle--sm` — a size modifier, not a state |

```css
.zf-toggle {
  width: 30px; height: 18px; padding: 2px; border-radius: 999px;
  background: var(--zf-neutral-700);
  display: flex; align-items: center; justify-content: flex-start;
}
.zf-toggle__knob {
  width: 14px; height: 14px; border-radius: 999px;
  background: var(--zf-white);
  transition: transform 150ms ease;
}
.zf-toggle[aria-checked='true']       { background: var(--zf-blue-1200);
                                        justify-content: flex-end; }
.zf-toggle:hover                      { background: var(--zf-neutral-800); }
.zf-toggle[aria-checked='true']:hover { background: var(--zf-blue-1300); }
.zf-toggle:focus-visible              { outline: 2px solid var(--zf-blue-1400);
                                        outline-offset: 2px; }
.zf-toggle:disabled                   { opacity: .5; }
.zf-toggle--error:focus-visible       { outline-color: var(--zf-red-1200); }
.zf-toggle--sm                        { width: 24px; height: 14px; }
.zf-toggle--sm .zf-toggle__knob       { width: 10px; height: 10px; }
```

Animate with `transform: translateX` rather than by changing `justify-content`, so
the movement is composited. **The component set defines no motion at all**, which
is a gap for a control whose entire affordance is a sliding knob.

### 2.4.7 Toggle or checkbox?

The most common misuse. The distinction is **when the change takes effect**, not
how it looks.

**Use a toggle when** the change is immediate with no Save; the setting is a
system preference; the label describes a state ("Email notifications") not an
action ("Enable email"); it stands alone rather than sitting in a list of options.

**Use a checkbox when** the change is submitted with a form; the user is selecting
from a set; you need a third indeterminate state; or you need to show a validation
error at rest — which the toggle currently cannot do.

### 2.4.8 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Non-text contrast — knob | ❌ fail | 1.48:1 on the off track. This conveys state |
| Non-text contrast — track | ❌ fail | 1.48:1 against the page when off |
| Target size 2.5.8 | ❌ fail | 30 × 18 and 24 × 14 against a 24 × 24 minimum — height fails in both |
| Focus visible 2.4.7 | ✅ | Ring present for every state including error |
| Focus ring contrast | ✅ | Blue 1400 at 5.92:1 |
| Error at rest 1.4.1 | ❌ fail | Error renders only on focus |
| Role announced | ⚠ | Use `role="switch"` so it announces on / off |
| Reduced motion | ⚠ | The knob slides. Wrap the transition in `prefers-reduced-motion` |

### 2.4.9 Cross-component drift — three focus rings

| Component | Focus ring | Error | Disabled mechanism |
|---|---|---|---|
| Toggle | Blue 1400 `#1C5BD9` | Red 1200 `#C9474F` | `opacity: .5` |
| Checkbox | Blue 1500 `#1E53BD` | Red 1200 `#C9474F` | Neutral 300 fill / Blue 800 |
| Radio | Blue 1600 `#1B4C91` | Red 1400 `#CC2132` | Neutral 400 fill / Blue 800 |
| **Verdict** | ❌ 3 values | ❌ 2 values | ❌ 3 mechanisms |

A keyboard user tabbing across a form watches the focus ring change colour three
times. Nothing justifies three indicators for the same signal. Disabled is worse —
opacity on one, specific fills on the others, so a disabled toggle and a disabled
checkbox side by side won't look related.

```css
--zf-color-focus:         var(--zf-blue-1500);   /* pick one */
--zf-color-danger-border: var(--zf-red-1200);    /* pick one */
--zf-disabled-opacity:    .5;                    /* or fills — pick one */
```

### 2.4.10 Issues found in the Figma source

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | **High** | White knob is 1.48:1 against the off track; off track is 1.48:1 against the page. | Darken track to Neutral 1100, or add a 1px Neutral 1100 knob border. See §2.4.1. |
| 2 | **High** | Error exists only on focus. 12 of 32 variants missing, all non-focus error. | Add a persistent error treatment — a red track border — then default and hover error variants. |
| 3 | **High** | 30 × 18 and 24 × 14 against a 24 × 24 minimum target size. | Ship a label composite with a ≥24px row hit area, as `checkbox_defined` does. |
| 4 | **High** | Disabled-off uses the **hover** track colour, so a disabled toggle is darker than an idle one. | Use the default track at 50% opacity. |
| 5 | Medium | Small size is not a uniform scale — 0.800 / 0.778 / 0.714. Padding stays 2px. | Scale the padding to 1.6px, or document the ratios as deliberate. |
| 6 | Medium | Focus ring strokes are 1.0285714865px and 0.8228572011px — sub-pixel, unreproducible in CSS. | Set both to 2px. |
| 7 | Medium | Focus ring is a child frame, so it participates in layout and is clipped by `clipsContent` parents. | Express as a CSS `outline`. |
| 8 | Medium | No motion defined anywhere, yet the affordance is a sliding knob. | Specify 150ms ease and honour `prefers-reduced-motion`. |
| 9 | Medium | No label component. Checkbox ships `checkbox_defined`; toggle ships nothing. | Add a Toggle + label composite with the same 8px gap. |
| 10 | Low | Item spacing 10px / 8px on a container with one child. | Remove it. |

## 2.5 Input Field

**Figma:** page `Input Field` → `Input Field/States` (`13:7334`), plus loose `Label` (`13:7320`) and `Help Text` (`13:7327`) instances
**CSS class:** `.zf-input`
**Axes:** `States` (5) × `is_error` (2) — 9 variants
**Properties:** `Icon Left` (bool), `Icon Right` (bool), `Placeholder` (text)

A single-line text entry control. Optional icons sit inside the field on either
side. Label and help text are separate components, so the full form field is
assembled by the consumer rather than shipped composed.

### 2.5.1 Error state — added

**Delivered.** The `is_error` axis now exists on component set `13:7334` with four
new variants, all using **Red 1200 `#C9474F`** to match the checkbox.

Error is a **variant, not a boolean** — a Figma boolean can only toggle layer
visibility, it cannot change a stroke colour. This is also how the radio, checkbox
and toggle already model error.

| Variant | Border | Extra | Notes |
|---|---|---|---|
| `States=Default, is_error=yes` | Red 1200 | — | The resting invalid field — the one that was missing entirely |
| `States=Hover, is_error=yes` | Red 1200 | — | Border is already red, so hover doesn't darken |
| `States=On-Click, is_error=yes` | Red 1200 | Halo 3px at 16% | Halo recoloured from Blue 1200; opacity kept at 16% to match its sibling |
| `States=Focus, is_error=yes` | Red 1200 | Ring Red 1200 | Border **and** ring are red, so error focus isn't weaker than error hover |
| `States=Disabled, is_error=yes` | — | — | ⚠ Deliberately absent — a disabled field can't be corrected |

The set went from 5 variants to **9**.

**A red border alone fails WCAG 1.4.1** — colour can't be the only carrier of
meaning. Pair it with the existing Help Text component below the field, recoloured
Red 1200:

```html
<input class="zf-input zf-input--error" aria-invalid="true" aria-describedby="email-err">
<p id="email-err" class="zf-help zf-help--error">Enter a valid email address</p>
```

```css
.zf-input--error               { border-color: var(--zf-red-1200); }
.zf-input--error:active        { box-shadow: 0 0 0 3px rgb(201 71 79 / .16); }
.zf-input--error:focus-visible { outline-color: var(--zf-red-1200); }
.zf-help--error                { color: var(--zf-red-1200); }
```

### 2.5.2 Geometry

| Property | Value | Notes |
|---|---|---|
| Height | **34px** | FIXED on every variant |
| Width | 280 → 400 | min 280, max 400 |
| Corner radius | **6px** | vs the checkbox's 2px |
| Border | 1px, all states | Only the colour changes |
| Padding | 10px all sides | Vertical is nominal — height is fixed |
| Item spacing | 10px | Between icon, text, icon |
| Icon frame | **16 × 12** | Not square — issue 10 |
| Text | Inter Regular 13 / auto | Truncates with an ellipsis |
| Text max width | 328px | = 400 − 20 padding − 32 icons − 20 gaps ✓ |
| Focus ring | 284 × 38, radius 8 | 2px outside the field |
| On-Click halo | 3px spread, **16%** | Every other component uses 20% |

### 2.5.3 Colour specification

Six of eight values are already exact ERP primitives.

| Role | Value | Palette | Status | Required | vs white | Verdict |
|---|---|---|---|---|---|---|
| Border — resting, disabled | `#CED0DE` | Neutral 700 | **exact** | 3:1 | 1.53:1 | ❌ **fails** |
| Border — hover, active, ring | `#3874EB` | Blue 1200 | **exact** | 3:1 | 4.32:1 | ✅ |
| Fill — resting | `#FFFFFF` | add `--zf-white` | missing | — | — | ⚠ |
| Fill — disabled | `#F7F8FC` | Neutral 200 | **exact** | — | 1.06:1 | ✅ exempt |
| Icon — both sides | `#71758F` | Neutral 1100 | **exact** | 3:1 | 4.52:1 | ✅ |
| Text — placeholder | `#71758F` | Neutral 1100 | **exact** ✅ fixed | 4.5:1 | 4.52:1 | ✅ |
| Text — value | `#222536` | Neutral 1900 | **exact** | 4.5:1 | 15.15:1 | ✅ |
| Label — 13px | `#21263C` | Neutral 1900 | legacy ΔE 3.3 | 4.5:1 | 14.92:1 | ✅ |
| Help text — 12px | `#4A4D63` | Neutral 1500 | **exact** | 4.5:1 | 8.29:1 | ✅ |

**Placeholder colour — fixed.** It was Neutral 1900, the same colour as text a
user has typed, so an empty field looked identical to a completed one. It is now
**Neutral 1100** across all nine variants.

Neutral 1100 was chosen over the lighter Neutral 1000 (`#9598AB`, 2.85:1) because
it clears 4.5:1 at **4.52:1**, so the field keeps a full pass on WCAG 1.4.3 while
still reading as clearly quieter than a value. Placeholder text is sometimes
argued to be exempt from 1.4.3 as incidental, but that reading is contested —
Neutral 1100 sidesteps the argument at no visual cost.

In CSS these are separate properties, so no extra variant is needed:

```css
.zf-input              { color: var(--zf-neutral-1900); }   /* the value       */
.zf-input::placeholder { color: var(--zf-neutral-1100); }   /* the placeholder */
```

In Figma the text node represents the empty state, so a filled field is shown by
overriding the instance's text colour to Neutral 1900.

### 2.5.4 State matrix

| # | Selector | Border | Fill | Extra |
|---|---|---|---|---|
| 1 | `.zf-input` | Neutral 700 | White | — |
| 2 | `:hover` | Blue 1200 | White | — |
| 3 | `:active` | Blue 1200 | White | Halo 3px at 16% |
| 4 | `:focus-visible` | **Neutral 700** | White | Ring Blue 1200 |
| 5 | `:disabled` | Neutral 700 | Neutral 200 | — |

**Focus is less prominent than hover.** Hover paints the whole border Blue 1200;
focus leaves it Neutral 700 and adds only a thin ring 2px outside. So moving the
mouse over a field marks it more strongly than actually being inside it. Focus
should colour the border *and* draw the ring.

### 2.5.5 Composition

Three separate components, none composed:

| Component | Spec |
|---|---|
| Label | Inter Regular 13 / auto, Neutral 1900, 4px gap to a 16 × 16 trailing icon |
| Input Field | 34px, 280 → 400 |
| Help Text | Inter Regular 12 / auto, Neutral 1500, 12 × 12 leading icon, 4px gap |
| Vertical rhythm | ⚠ **not defined** — every consumer picks their own |
| Required marker | ⚠ **not defined** — no asterisk or Optional treatment |

### 2.5.6 Selector strategy

```css
.zf-input {
  height: 34px; min-width: 280px; max-width: 400px;
  padding: 0 10px; border-radius: 6px;
  background: var(--zf-white);
  border: 1px solid var(--zf-neutral-700);
  font: 400 13px Inter;
  color: var(--zf-neutral-1900);
}
.zf-input::placeholder      { color: var(--zf-neutral-1000); }
.zf-input:hover             { border-color: var(--zf-blue-1200); }
.zf-input:active            { border-color: var(--zf-blue-1200);
                              box-shadow: 0 0 0 3px rgb(56 116 235 / .16); }
.zf-input:focus-visible     { border-color: var(--zf-blue-1200);
                              outline: 1px solid var(--zf-blue-1200);
                              outline-offset: 2px; }
.zf-input:disabled          { background: var(--zf-neutral-200);
                              color: var(--zf-neutral-1100); cursor: not-allowed; }
.zf-input--error            { border-color: var(--zf-red-1200); }
```

Two deliberate departures from the Figma spec: `::placeholder` is separated from
the value colour, and `:focus-visible` colours the border as well as drawing the
ring.

**Icons can't live inside an `<input>`** — the element takes no children. Wrap the
input and its icons in a `.zf-input-group` and move the border to the wrapper.

Rename the `On-Click` variant to **Active**; `On-Click` is an event, not a state,
and doesn't map to a pseudo-class.

### 2.5.7 Usage

**Do** — always pair with a visible Label (a placeholder is not a label, it
vanishes on typing); use Help Text for format hints and error messages; put a
leading icon where it *describes* the field and a trailing icon where it *acts* on
it; make an action icon a real button.

**Don't** — use the placeholder as the label; put a decorative icon where users
expect an action (a trailing chevron implies a dropdown); rely on colour alone for
errors; leave disabled text at full strength; exceed 400px.

### 2.5.8 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Non-text contrast 1.4.11 | ❌ fail | Resting border 1.53:1 against white |
| Error identification 3.3.1 | ✅ | Four error variants added — see §2.5.1 |
| Labels or instructions 3.3.2 | ⚠ | Label exists but isn't part of the field; no `for`/`id` specified |
| Text contrast 1.4.3 | ✅ | Value 15.15:1, label 14.92:1, help 8.29:1, placeholder 4.52:1 |
| Icon contrast | ✅ | Neutral 1100 at 4.52:1 |
| Focus visible 2.4.7 | ⚠ weak | Ring exists but border stays grey in the non-error focus state |
| Target size 2.5.8 | ✅ | 34px tall — **the only control in this system that passes** |
| Disabled text | ⚠ | Stays Neutral 1900, so it still looks editable |

### 2.5.9 Cross-component drift — four focus rings

| Component | Focus ring | Error | Radius | Halo |
|---|---|---|---|---|
| Input Field | Blue 1200 `#3874EB` | Red 1200 ✅ | 6px | 16% |
| Toggle | Blue 1400 `#1C5BD9` | Red 1200 | 999px | — |
| Checkbox | Blue 1500 `#1E53BD` | Red 1200 | 2px | 20% |
| Radio | Blue 1600 `#1B4C91` | Red 1400 | 999px | 20% |
| **Verdict** | ❌ 4 values | ❌ 2 values | expected to differ | ❌ 2 values |

Blue 1200, 1400, 1500 and 1600 all mean *this control has keyboard focus*. A user
tabbing through one form sees the indicator change colour at every field.

```css
--zf-color-focus:         var(--zf-blue-1500);   /* one ring for every control */
--zf-color-danger-border: var(--zf-red-1200);    /* one error red */
--zf-halo-opacity:        .2;                    /* one halo strength */
```

### 2.5.10 Issues found in the Figma source

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | ✅ **resolved** | No error state and no `is_error` property. | **Done** — `is_error` axis added with four variants in Red 1200. See §2.5.1. |
| 2 | ✅ **resolved** | Placeholder was Neutral 1900 — the same as an entered value, so an empty field was indistinguishable from a completed one. | **Done** — placeholder is Neutral 1100 (4.52:1) across all nine variants. Value stays Neutral 1900. |
| 3 | **High** | Resting border 1.53:1 against white. Fourth component with this failure. | Darken to Neutral 1100. Fix once at the semantic layer. |
| 4 | ✅ **withdrawn** | Reported as the focus ring being in the auto-layout flow. On re-inspection via the plugin API, `Rectangle 4` already has `layoutPositioning: ABSOLUTE` — the earlier reading came from a data source that omits that field. | **No change needed.** Kept here so the correction is on record. |
| 5 | Medium | Focus is less prominent than hover. | Colour the border on focus as well as drawing the ring. |
| 6 | Medium | On-Click halo is 16%; siblings use 20%. | Standardise on 20% in a token. |
| 7 | Medium | `On-Click` is an event name, not a state. | Rename to `Active`. |
| 8 | Medium | Disabled changes only the fill; text stays Neutral 1900. | Disabled text → Neutral 1100, icons → Neutral 900. |
| 9 | Medium | Label and Help Text are loose instances; no vertical rhythm defined. | Ship a Form Field composite with defined spacing. |
| 10 | Low | Icon frames are 16 × 12, not square. | Standardise on the 16 × 16 `icon /` components — see §1.7. |
| 11 | Low | Label has no Required treatment. | Add a `Required` boolean to the Label component. |

## 2.6 Tabs — `zf-tab`

**Figma:** page `Tab` → component set `zf-tab` (`15:9299`)
**CSS class:** `.zf-tab`
**Axis:** `Style` — 6 values, `tabstyle_01` … `tabstyle_06`
**Tab items:** 4 component sets — **all remote**, held in an external library

Six tab styles on one axis. Each bar is a two-tab arrangement built from tab-item
components that live outside this file.

### 2.6.1 Naming — renamed

The set was `Tab Style`, its axis was the Figma default `Property 1`, and its six
values used three different spacing conventions in one dropdown — `HT 1`, `ST2`,
`HT1 with count`. Figma and code now use the same names.

| Figma variant | Was | CSS modifier |
|---|---|---|
| `Style=tabstyle_01` | HT 1 | `.zf-tab--tabstyle_01` |
| `Style=tabstyle_02` | HT 1 with count | `.zf-tab--tabstyle_02` |
| `Style=tabstyle_03` | HT 2 | `.zf-tab--tabstyle_03` |
| `Style=tabstyle_04` | ST 1 | `.zf-tab--tabstyle_04` |
| `Style=tabstyle_05` | ST 2 | `.zf-tab--tabstyle_05` |
| `Style=tabstyle_06` | ST 3 | `.zf-tab--tabstyle_06` |

Numbering follows canvas order, which is also the order in §2.6.6. Zero-padded to
two digits so the list still sorts correctly past nine.

**The old names are not lost.** Each variant carries a Figma description holding
its former name, its role, and its CSS modifier — `tabstyle_03 — was HT 2. Dark
application bar / module switcher…`. HT/ST meant *header tab* and *section tab*;
that distinction now lives in the description and in §2.6.6 rather than in the
variant name, because a name that encodes a taxonomy has to be renamed every time
the taxonomy shifts.

### 2.6.2 Alignment — fixed

Active and inactive labels sat on different baselines in three of the six styles.

| Style | Before | After | Change |
|---|---|---|---|
| `tabstyle_01` | −3.0px | **0.0px** | Inactive item `padding-bottom` 0 → 6 |
| `tabstyle_02` | −3.0px | **0.0px** | Inactive item `padding-bottom` 0 → 6 |
| `tabstyle_03` | 0.0px | 0.0px | none |
| `tabstyle_04` | 0.0px | **0.0px** | Inactive item `padding-top` 0 → 6, after the line-height fix |
| `tabstyle_05` | −1.0px | **0.0px** | Inactive item padding 15/17 → **16/16** — see §2.6.3 |
| `tabstyle_06` | 0.0px | 0.0px | none |

Verified by measuring `absoluteRenderBounds` on every label: all six styles report
a 0.00px delta between the active and inactive baseline.

One caveat on `tabstyle_06`: a naive render-bounds comparison reports a 3.06px
delta there. That is a descender artifact — "Uncategorized Summary" carries a `g`
and a `y` that extend the rendered box below the baseline. The text boxes all sit
at the same top. Measure boxes, not render bounds, when glyphs differ.

**Cause.** The two states are built from different internal structures. The
inactive item is a HORIZONTAL frame containing just the label. The active item is
a VERTICAL frame containing the label plus a 3px underline, with 3px bottom
padding. Both are 66px tall — so the active centres its label in 60px of remaining
space while the inactive centres in the full 66px. A 3px difference that only
appears when the two sit side by side.

**The durable fix is structural, not numeric.** Build both states from the same
VERTICAL frame with an indicator slot, and make the indicator transparent when
inactive. Then the label cannot move, because nothing about the layout changes
between states. In CSS this is a transparent 3px `border-bottom` on every tab:

```css
.zf-tab [role='tab']            { border-bottom: 3px solid transparent; }
.zf-tab [aria-selected='true']  { border-bottom-color: var(--zf-blue-1200); }
```

That change belongs in the library file. What is applied here is an
instance-level override on the six bar variants, so the numbers currently cancel
out rather than being structurally prevented from diverging.

### 2.6.3 The `tabstyle_05` bottom rule — fixed

`tabstyle_05` shows the active section as a bordered container. To make the
container read as continuous with the panel below it, the item carries a 1px white
rectangle at its bottom edge, whose job is to punch a hole in the bar's bottom
rule.

**It missed by exactly 1px.** The bar's rule occupied 251→252; the white mask sat
at 250→251. So the rule drew straight across the bottom of the container, which is
the one thing the container treatment exists to prevent.

The cause was the item's own height. The bar is 55px; the active item hugs at
53px; the bar centred it, leaving 1px of slack above *and below*, so the mask
floated one pixel clear of the rule it was meant to cover.

**Fix.** The bar's `counterAxisAlignItems` is now `MAX`, so items are
bottom-aligned and the mask lands on the rule exactly. The inactive item is a full
55px so bottom-aligning it changes nothing. The active item drops 1px, which moved
its label 1px, so the inactive item's padding went from an asymmetric **15/17 to a
symmetric 16/16** to follow it. Both labels remain at 0.00px.

| | Before | After |
|---|---|---|
| Bar counter-axis alignment | `CENTER` | `MAX` |
| Active item bounds | 198 → 251 | 199 → 252 |
| White mask | 250 → 251 ❌ | **251 → 252** ✅ |
| Bar rule | 251 → 252 | 251 → 252 |
| Inactive item padding | 15 top / 17 bottom | **16 / 16** |

The 15/17 asymmetry was itself a leftover from the earlier alignment pass. Two
odd numbers that happen to sum correctly are harder to maintain than two equal
ones, so the symmetric pair is the better resting state.

In CSS none of this arises — the active tab is a sibling of the rule rather than a
box floating above it:

```css
.zf-tab--tabstyle_05                          { border-bottom: 1px solid var(--zf-neutral-600); }
.zf-tab--tabstyle_05 [aria-selected='true']   { border: 1px solid var(--zf-neutral-600);
                                                border-top: 3px solid var(--zf-blue-1200);
                                                border-bottom-color: transparent;
                                                margin-bottom: -1px; }
```

The `margin-bottom: -1px` is the same trick the white rectangle is doing in Figma,
expressed as layout rather than as a patch drawn on top.

### 2.6.4 Geometry

| Style | Bar height | Width | Label | Gap | Indicator |
|---|---|---|---|---|---|
| `tabstyle_01` | 66px | hug — 298px | 18 / 28.8px | 25px | 3px underline |
| `tabstyle_02` | 66px | hug — 329.2px | 18 / 28.8px | 25px | 3px underline |
| `tabstyle_03` | 44px | hug — 271px | 14 / 22.4px | 0 | 3px bottom stroke on a filled block |
| `tabstyle_04` | 55px | hug — 246px | 14 / 22.4px ✅ | 25px | 3px underline |
| `tabstyle_05` | 55px | hug — 301px | 14 / 22.4px ✅ | 25px | 3px top edge on a bordered box |
| `tabstyle_06` | 73px | hug — 545px | 15 + 12 / auto | 8px | none — weight only |

**Width — fixed.** Every bar was a fixed 1200px canvas holding two tabs, which
made the component look like a full-width layout rather than a tab bar. All six
now hug their contents, matching `tabstyle_06` which always did. The component set
frame went from 1240 × 575 to 585 × 557.

The consequence is that the bottom rule now spans only the content width. In code
that rule belongs to the page container, not to the tab list, so this is the more
honest representation:

```css
.zf-tab-container { border-bottom: 1px solid var(--zf-neutral-600); }
.zf-tab          { display: flex; gap: 25px; }   /* hugs, like the component */
```

**`tabstyle_02` is 329.2px, not a whole number.** The fraction comes from the
count badge's 11.25px font size, set in the library — see issue 8.

**Line height — fixed.** `tabstyle_04` and `tabstyle_05` both used a 14px label
with a 28.8px line height (206%). That value is 160% of 18px, the `tabstyle_01`
size, carried over when the label was scaled down. Now 22.4px, matching
`tabstyle_03`, and both bars have settled at 55px.

Correcting it shifted the `tabstyle_04` active label down 3px, which was
re-balanced immediately afterwards — a reminder that type metrics and layout
alignment are coupled, and that a line-height change needs the alignment
re-measured.

### 2.6.5 Colour — re-bound to the palette

**All 13 values are exact ERP primitives.** Verified by sweeping the set: zero
legacy colours remain.

| Role | Was | Now | Primitive | Contrast |
|---|---|---|---|---|
| Indicator + chevron | `#1B6DE0` | `#3874EB` | Blue 1200 | 4.32:1 ✅ |
| Label | `#292E40` | `#282B3D` | Neutral 1800 | 13.97:1 ✅ |
| Bar bottom rule | `#E4E4F0` | `#DFE0EB` | Neutral 600 | decorative |
| Count badge fill | `#D3D3E5` | `#CED0DE` | Neutral 700 | decorative |
| Count badge text | `#434C69` | `#4A4D63` | Neutral 1500 | 5.41:1 ✅ |
| Count badge stroke | `#979797` | **removed** | — | — |
| `tabstyle_03` bar background | `#282E48` | `#2D3145` | Neutral 1700 | — |
| `tabstyle_03` active tab fill | `#2A4C81` | `#1E53BD` | Blue 1500 | 1.85:1 |
| `tabstyle_06` canvas | `#F9F9FB` | `#FAFAFC` | Neutral 100 | — |
| `tabstyle_06` card border | `#EBEAF2` | `#E9EAF5` | Neutral 500 | — |
| `tabstyle_06` title | `#21263C` | `#222536` | Neutral 1900 | 15.15:1 ✅ |
| `tabstyle_06` subtitle | `#4C526C` | `#51556B` | Neutral 1400 | 7.34:1 ✅ |

**Two were not straight snaps:**

**`tabstyle_03` active tab fill → Blue 1500, not Blue 1700.** The nearest primitive
by ΔE is Blue 1700, but that measures **1.06:1** against the bar — worse than the
1.56:1 it started at, making the active block nearly invisible. Blue 1500 gives
1.85:1, preserves the lighter-block intent, and holds white text at 6.94:1. A
blind snap would have made this worse.

**Count badge stroke removed, not re-bound.** `#979797` was ΔE 10.7 from anything
in the palette and sat at 1.98:1 on its own fill — a smudge rather than a border.
The badge fill already separates it from the bar. Neutral 1100 would reach 2.95:1
if a stroke is wanted back.

#### `tabstyle_03` uses opacity, not a second colour — correction

An earlier reading of this set recorded that every style leaves the active and
inactive labels the same colour, so selection rests on weight plus the indicator
alone. **That is true of five styles, not six.**

`tabstyle_03` sets its inactive label to **white at 80% opacity**, against 100%
for the active one. Composited over the Neutral 1700 bar that resolves to roughly
`#D5D6DA`, which is 8.8:1 against the bar — comfortably legible, and a genuine
second signal independent of weight.

The reason the original sweep missed it is that a colour sweep reads fill values,
and both labels have the identical fill `#FFFFFF`. The difference is in an opacity
property, not a colour. Worth remembering as a general point: a palette audit that
only reads `fills` will report two nodes as identical when one of them is
half-transparent.

It is still the odd one out mechanically. Opacity cannot be tokenised the way a
colour can, cannot be themed, and composites differently on every background. If
the inactive-label treatment in §2.6.9 issue 9 is taken up, `tabstyle_03` should
move to an explicit colour at the same time so all six styles express the same
idea the same way.

### 2.6.6 Which style, when

| Style | Was | Use for |
|---|---|---|
| `tabstyle_01` | HT 1 | Primary navigation of a page or record. One per screen |
| `tabstyle_02` | HT 1 with count | The same, when a tab holds a countable queue |
| `tabstyle_03` | HT 2 | A dark application bar — a module switcher |
| `tabstyle_04` | ST 1 | Sections within a panel, below a page that already has `tabstyle_01` |
| `tabstyle_05` | ST 2 | The same, when the active section should read as a container |
| `tabstyle_06` | ST 3 | A landing choice between destinations, each needing a subtitle |

**Don't** use tabs for steps in a sequence — that's a stepper, and tabs imply the
user may pick any of them at any time. **Don't** nest a style inside itself.

### 2.6.7 Selector strategy

A tab bar is a set of **buttons**, not links — it swaps a panel, it doesn't
navigate.

| Figma | Markup |
|---|---|
| Tab bar | `div[role="tablist"]` |
| Tab item | `button[role="tab"]` |
| Active | `[aria-selected="true"]` — native, announced |
| `Style` axis | `.zf-tab--tabstyle_0N`, on the tablist |

```html
<div role="tablist" class="zf-tab zf-tab--tabstyle_01">
  <button role="tab" aria-selected="false">Receipts Inbox</button>
  <button role="tab" aria-selected="true">Receipts Inbox</button>
</div>
```

```css
.zf-tab { display:flex; gap:25px; }
.zf-tab [role='tab'] {
  height:66px; font:400 18px/28.8px Inter; color:var(--zf-neutral-1800);
  border-bottom:3px solid transparent;
}
.zf-tab [aria-selected='true'] { font-weight:600; border-bottom-color:var(--zf-blue-1200); }
.zf-tab [role='tab']:focus-visible { outline:2px solid var(--zf-blue-1500); outline-offset:-2px; }
```

The style modifier goes on the tablist, not on each tab, because the style is a
property of the bar. A `.zf-tab--tabstyle_0N` class on a `[role="tab"]` is a
review comment.

### 2.6.8 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Focus visible 2.4.7 | ❌ **fail** | No focus state in any of the six styles |
| Colour independence 1.4.1 | ⚠ | Selection is weight + indicator; five of six styles share one label colour. `tabstyle_03` also varies opacity |
| Non-text contrast 1.4.11 | ⚠ | `tabstyle_03` active fill is 1.85:1 against its bar |
| Text contrast 1.4.3 | ✅ | 13.97:1 active, 8.8:1 for the `tabstyle_03` inactive label |
| Target size 2.5.8 | ✅ | 44px+ in every style |
| Keyboard pattern | ⚠ | A tablist needs arrow-key navigation and one tab stop |

### 2.6.9 Cross-component drift — a fifth blue

| Component | Accent / focus blue | Nearest | On palette? |
|---|---|---|---|
| Tab indicator | `#1B6DE0` | Blue 1200 (ΔE 4.1) | ❌ |
| Radio focus ring | `#1B4C91` | Blue 1600 (ΔE 8.8) | ❌ |
| Toggle focus ring | `#1C5BD9` | Blue 1400 | ✅ exact |
| Checkbox focus ring | `#1E53BD` | Blue 1500 | ✅ exact |
| Input focus ring | `#3874EB` | Blue 1200 | ✅ exact |

**Five values, one meaning.** Nothing distinguishes these roles — they all mean
*this element is active or focused*. Defining `--zf-color-accent` and
`--zf-color-focus` once and pointing all six components at them is now the single
highest-value change left in the system.

### 2.6.10 Issues found in the Figma source

**Every tab item is a remote component.** All nine instances across the six bars
resolve to main components in an external library — `header Tab Text`, `HT 3`,
`ST 4`, `ST 5`, `ST 3/Variant3`, `ST 3/Variant4`. Anything internal to an item
cannot be fixed from this file, which is what the "Where" column records.

| # | Severity | Issue | Fix | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | Active and inactive labels on different baselines — 3px in `tabstyle_01` and `tabstyle_02`, 1px in `tabstyle_05`. | **Done** — equal bottom reserve on the inactive item. All six now 0.00px. | This file |
| 2 | ✅ **resolved** | The `tabstyle_05` active container's 1px white mask sat one pixel above the bar's bottom rule, so the rule drew through the container. | **Done** — bar bottom-aligns its items; inactive padding evened to 16/16. See §2.6.3. | This file |
| 3 | ✅ **resolved** | Axis was the Figma default `Property 1`; the six values used three spacing conventions. | **Done** — axis `Style`, values `tabstyle_01`…`tabstyle_06`, old names preserved in variant descriptions. | This file |
| 4 | ✅ **resolved** | Every bar was 1200px fixed with two hardcoded tabs. | **Done** — all six hug their contents. The bottom rule moves to the page container in code. | This file |
| 5 | ✅ **resolved** | None of the 13 colours was an ERP primitive. | **Done** — all 13 re-bound. Zero legacy values remain. | This file |
| 6 | ✅ **resolved** | Count badge stroke was `#979797`, ΔE 10.7 from the palette, at 1.98:1 on its fill. | **Done** — removed. The badge fill already separates it. | This file |
| 7 | ✅ **resolved** | `tabstyle_04` and `tabstyle_05` used 14px text with a 28.8px line height (206%). | **Done** — 22.4px. Both bars now 55px; alignment re-verified. | This file |
| 8 | ✅ **improved** | `tabstyle_03` active tab fill was 1.56:1 against its bar. | Blue 1500 lifts it to 1.85:1. The 3px underline still carries the state. | This file |
| 9 | **High** | No focus state in any style. | Add a focus treatment to the item components; `:focus-visible` with an inset outline. | **Library** |
| 10 | Medium | Items define a Hover state that no bar variant uses. | Surface hover at bar level or remove it. | **Library** |
| 11 | Medium | Count badge node named `02` contains `03`; font size 11.25px, which is what makes `tabstyle_02` 329.2px wide; style `Semibold` not `Semi Bold`. | Rename, round to 11px, confirm the style resolves. | **Library** |
| 12 | Medium | The active and inactive items are structurally different frames, so the §2.6.2 alignment holds by arithmetic rather than by construction. | Rebuild both states from one frame with a transparent indicator slot. | **Library** |
| 13 | Low | `tabstyle_06` shows the active card by font weight alone — same fill, same border as the inactive cards. Applies to the label colour in the other styles too. | Add a fill or border difference, and lighten the inactive label to Neutral 1400. If taken up, move `tabstyle_03` off opacity at the same time — see §2.6.5. | **Library** |
| 14 | Low | `tabstyle_06` has a 1px divider between cards 2 and 3 but none between 1 and 2, drawn as a 0-width vector with a centre-aligned stroke inside the auto-layout. | Remove it, or add matching dividers in every gap. | This file |

## 2.7 Button family — `zf-btn`

**Figma:** page `Buttons` → four component sets
**CSS class:** `.zf-btn`

| Set | Node | Variants | Matrix |
|---|---|---|---|
| `Button` | `23:10457` | **96** | Intent (4) × Type (2) × State (4) × Size (3) — complete |
| `Button Icons` | `23:10866` | **96** | Same four axes — complete |
| `Hyperlink` | `23:11086` | **8** | State (4) × Color (1) × Size (2) — complete |
| `Split Button` | `23:11121` | **8** | State (4) × Type (2) — complete |

208 variants across four sets, and **every matrix is complete** — no gaps. That
makes the button family the only part of the system with no missing variants, in
contrast to the radio (10 of 16), checkbox (15 of 24) and toggle (20 of 32).

### 2.7.1 The Intent axis — renamed

**Resolved.** `Button` and `Button Icons` each carried an `Accent Color` axis with
four values — Blue, Green, Orange, Red. Those were the same four names as the
planned themes in §1.3, and the axis was doing two incompatible jobs at once.

| Axis | Was | Now |
|---|---|---|
| Name | `Accent Color` | **`Intent`** |
| Values | Blue · Green · Orange · Red | **default · success · warning · danger** |
| Default | Blue | default |

**Why this was the wrong axis, not just the wrong name.** An axis is one dimension
of independent choice, and the variant count is the product of all of them:
4 × 2 × 4 × 3 = 96. The other three axes describe decisions made *per button* —
this button is secondary, small, currently hovered. Blue/Green/Orange/Red are not
per-button decisions; they are either a theme, chosen once for a screen, or an
intent, chosen from meaning. Naming them after hues made a designer re-declare the
colour on every button, and would have required 24 new variants per future theme.

**The resolution is that both readings were partly right.** §1.3 already separates
them: the primary accent is *themeable*, while success, warning and danger are
*fixed* because their meaning would break if themed. So the axis is an `Intent`
whose `default` value is themeable and whose other three values are not — which is
exactly §1.3's model, expressed on the component.

Renaming used `editComponentProperty`, so Figma remapped by property identity
rather than by name. All 96 variants in each set were preserved and all 20 instances
across the documentation frames re-resolved; nothing broke.

**Colours were deliberately not changed.** The fills stay on `color/{hue}/1200`
primitives rather than moving to the semantic roles, because the roles sit one step
away — see §2.7.6.

### 2.7.6 Intent values vs their semantic roles

With the axis renamed, each intent has an obvious semantic role. Three of the four
do not yet resolve to the same value.

| Intent | Button default | Semantic role | Role value | Gap |
|---|---|---|---|---|
| `default` | Blue 1200 `#3874EB` | `primary/default` | Blue 1200 `#3874EB` | **none — exact** ✅ |
| `success` | Green 1200 `#259669` | `success/default` | Green 1300 `#068754` | one step |
| `warning` | Orange 1200 `#B25F17` | `warning/default` | Orange 1300 `#9E4B03` | one step |
| `danger` | Red 1200 `#C9474F` | `danger/default` | Red 1300 `#B2343C` | one step |

**`warning` was the blocker, and it was a variable bug, not a button bug.** §1.2
records Warning = Orange as a confirmed decision, but `ZF Semantic` had the whole
`warning/*` group bound to the **Yellow** family. Binding the orange button to
`warning/default` would have turned 24 variants bright yellow — which read as the
button being wrong, when in fact the token was.

`warning/*` is now re-pointed to Orange in both modes, mirroring the construction
`success`, `danger` and `info` already use:

| Role | Was | Now — Light | Now — Dark |
|---|---|---|---|
| `warning/default` | Yellow 900 `#F1AB1F` | Orange 1300 `#9E4B03` | Orange 1000 |
| `warning/hover` | Yellow 1100 | Orange 1500 `#80420D` | Orange 900 |
| `warning/subtle` | Yellow 300 | Orange 300 `#FCF2E8` | Orange 2000 |
| `warning/border` | Yellow 800 | Orange 800 `#FFB87B` | Orange 1600 |
| `warning/text` | Yellow 1400 | Orange 1500 `#80420D` | Orange 800 |
| `warning/on-warning` | Yellow 2200 — **dark** | **White** | Orange 2200 |

Nothing consumed `warning/*` yet, so the change was free. It also removes an
inconsistency: `warning` was the only status family whose `on-` colour was dark,
because a yellow fill cannot carry white text. Orange 1300 holds white at
**6.07:1**, so `on-warning` is now white like the other three, and the four status
families are finally built the same way.

**What remains is one decision, not four.** All three non-default intents sit
exactly one palette step below their role — 1200 against 1300. Shifting the button
ladder from `{hue}/1200 · 1400 · 1200 · 800` to `{hue}/1300 · 1500 · 1300 · 800`
would bind all four intents to `primary/*`, `success/*`, `warning/*` and `danger/*`
in a single pass, giving the whole component Dark mode. That is a visible change to
72 variants, so it is yours to call.

### 2.7.2 Geometry

Read from the Blue variants; the other three accents are identical but for hue.

| Property | Large | Medium | Small |
|---|---|---|---|
| Height | **32px** | **30px** | **28px** |
| Width | Hug | Hug | Hug |
| Padding — horizontal | 12px | 8px | 6px |
| Padding — vertical | 10px | 10px | 10px |
| Gap | 10px | 10px | 6px |
| Corner radius | **6px** | 6px | 6px |
| Label | Inter Regular 13 / 21px | 13 / 21px | **12 / 19px** |
| Border | 1px | 1px | 1px |

**The size scale is 2px per step.** 32 → 30 → 28 is a 6% difference between
Large and Small; at a glance the three sizes are hard to tell apart. Horizontal
padding does more work than height does (12 → 8 → 6), so the sizes differ more in
width than in height.

**Vertical padding is 10px on all three sizes and cannot take effect.** Height is
FIXED and the label's line box is 21px, so 10 + 21 + 10 = 41px against a declared
32px. The value is inert — the same pattern as the Status Badge's 2px vertical
padding (§2.1.2) and the tab items.

**Radius 6px matches the Input Field**, which is the one radius agreement in the
system so far — the checkbox is 2px, the badge 4px, the radio and toggle fully
round.

### 2.7.3 Colour

All values below are now bound. Provenance is recorded because it is the point of
this pass — see §2.7.5.

**Primary, per accent**

| State | Fill | Bound to |
|---|---|---|
| Default | Blue 1200 `#3874EB` | `color/blue/1200` |
| Hover | Blue 1400 `#1C5BD9` | `color/blue/1400` |
| Focus | Blue 1200 — unchanged from Default, plus a ring | `color/blue/1200` |
| Disabled | Blue 800 `#B1CAFC` | `color/blue/800` |

Label is white throughout, bound to `color/base/white`. Green, Orange and Red
follow the same 1200 / 1400 / 1200 / 800 ladder in their own hue.

**Secondary**

| State | Fill | Border | Label |
|---|---|---|---|
| Default | Neutral 100 `#FAFAFC` | Neutral 600 → `border/default` | `#202432` raw |
| Hover | Neutral 200 `#F7F8FC` | Neutral 700 `#CED0DE` | `#202432` raw |
| Focus | **`#FAFAFF` raw** | Neutral 600 → `border/default` | `#202432` raw |
| Disabled | Neutral 100 `#FAFAFC` | Neutral 300 `#F5F6FC` | `#929BB8` raw |

**Secondary Focus has its own fill for no reason.** `#FAFAFF` against Default's
`#FAFAFC` is a difference of 3 in the blue channel — ΔE 1.0, below the threshold
of visible difference. It is a distinct value that looks identical, which is worse
than either sharing the value or differing visibly. The focus ring is what
actually carries the state.

### 2.7.4 The focus ring

Every Focus variant carries a real ring, and it is the best-built focus indicator
in the system.

| Property | Value |
|---|---|
| Node | `Rectangle 47` — `Rectangle 48` on the square icon buttons |
| Geometry | Button + 4px in each dimension, offset −2px |
| Radius | **8px** — button radius 6 + 2px offset, so it is concentric |
| Stroke | 1px, inside |
| Colour | Blue 1200 → **`focus/ring`** |
| Positioning | **`layoutPositioning: ABSOLUTE`** — outside the auto-layout flow |

Two things it gets right that the other components get wrong. It is **absolute**,
so unlike the toggle's ring (§2.4.10 issue 7) it never participates in layout or
gets clipped. And its radius is **8px, derived from the button's 6px plus the 2px
offset** — the ring is actually concentric with the shape it surrounds, which no
other ring in the system bothers to do.

**It is the same Blue 1200 on all four accents,** so a green button gets a blue
focus ring. That is correct: a focus ring means "this element has keyboard focus"
and should not change meaning with the button's hue. It is the one component that
already behaves the way §2.6.9 argues the whole system should.

Two remaining gaps:

- **1px, where every other ring in the system is being standardised to 2px** —
  see the radio (issue 5), checkbox (issue 10) and toggle (issue 6), all of which
  are moving to 2px. Button is the odd one at 1px, though at least it is a whole
  pixel rather than the sub-pixel values the others carry.
- **Blue 1200 ring around a Blue 1200 button.** For `Intent=default,
  Type=Primary` the ring is the same colour as the fill, separated by a 2px
  transparent gap. Against a white page the ring reads at 4.32:1, so it passes —
  but the strongest version of this would give the ring a white inner gap of its
  own, so it reads against both the button and the page.

### 2.7.5 Palette provenance — the legacy library

**This is the substantive finding of the audit, and it is not what a hex-based
review would have reported.**

The Buttons page was not holding stale hex values. All 367 of its bound paints
were wired to a **second, external variable collection** — a different palette
library attached to this file, using near-identical names (`Blue/1200`,
`Neutral/600`) on its own scale.

That distinction matters because the two failure modes look the same in a colour
picker and are completely different problems. A stale hex is a value someone typed.
A binding to another library is a **live dependency**: it updates when that library
updates, and it will keep diverging from the ERP palette on its own.

**All 18 legacy variables in use had an exact local twin — same name, same hex:**

| Legacy | Local | Value | Paints |
|---|---|---|---|
| `Blue/1200` | `color/blue/1200` | `#3874EB` | 78 |
| `Neutral/100` | `color/neutral/100` | `#FAFAFC` | 63 |
| `Neutral/600` | `color/neutral/600` | `#DFE0EB` | 55 |
| `Neutral/700` | `color/neutral/700` | `#CED0DE` | 25 |
| `Neutral/200` | `color/neutral/200` | `#F7F8FC` | 24 |
| `Neutral/300` | `color/neutral/300` | `#F5F6FC` | 24 |
| `Blue/1400` | `color/blue/1400` | `#1C5BD9` | 13 |
| `Green/1200`, `Orange/1200`, `Red/1200` | same names | — | 12 each |
| 8 further hue steps | same names | — | 6–7 each |

So the migration cost nothing. **367 paints re-pointed, zero visual change** — 280
to primitives, 87 to semantic roles where exactly one role held the value
(`border/default` ×55, `primary/text` ×13, `primary/border` ×7, `success/border`
×6, `danger/border` ×6). Zero legacy bindings remain on the page.

The status badge is the counter-example and is **not** safe to migrate the same
way: there, legacy `Green/300` is `#D2F3E6` where local `color/green/500` is
`#D7F5E9`. Same mechanism, different values, so that one is a real recolour. See
§2.1.10 issue 7, whose diagnosis should be corrected from "carries superseded
hexes" to "is bound to a superseded library".

**Four raw values remain unbound**, because each needs a colour decision rather
than a name:

| Value | Count | Where | Nearest | ΔE |
|---|---|---|---|---|
| `#31384D` | 108 | Icon glyphs on Secondary | `neutral/1600` | 3.1 |
| `#929BB8` | 51 | Disabled labels and icons | `neutral/1000` | 5.9 |
| `#202432` | 45 | Secondary label, Split Button chevron | `neutral/2000` | 1.9 |
| `#FAFAFF` | 12 | Secondary Focus fill | `neutral/200` | 1.0 |

Two of these are drift against roles that already exist. The Secondary label at
`#202432` is 1.5 from `text/default` (Neutral 1900) — moving it there costs
nothing visible and puts the label on a role. The disabled label at `#929BB8` is
the awkward one: `text/disabled` is Neutral 900 `#AEB1C2`, which is *lighter*, so
adopting the role would make disabled text harder to read, not easier.

**Icon glyphs at `#31384D` are the real outlier.** §1.7 specifies Neutral 1100
`#71758F` for icons; these are Neutral 1600 territory — five steps darker, and
108 paints of it.

### 2.7.6 Icons — now local, per §1.7

**Resolved.** Every icon in the four sets came from an external library component,
`Iconography - Caesarzkn/Upload/False/16px`, which broke three of the four rules in
§1.7.3:

| §1.7 rule | The old library icon |
|---|---|
| 16 × 16 component frame | ❌ **13 × 13** — the name said `16px`, the frame was 13 |
| One vector, 2px stroke, round cap | ❌ `BOOLEAN_OPERATION` shapes with **fills** |
| Centre on render bounds | Inner group 10.8 × 10.8 inside a 13px frame |
| Named `icon / {name}` | ❌ carried a personal handle and a stray `False` segment |

The fill-not-stroke point was the one with consequences, and §1.7 rule 2 states the
reason directly: single-colour strokes can be recoloured downstream, multi-path
fills cannot. That is exactly why 108 icon paints sat at `#31384D` as an orphan
value instead of inheriting the label's colour.

**Two icons were authored on the Icons page** to §1.7 — one vector, 2px round-cap
and round-join stroke, Neutral 1100 bound to the variable, centred on
`absoluteRenderBounds` with centre/centre constraints, verified at 0.000px offset.
`Chevron Down` needed nothing: `icon / chevron, Direction=Down` already existed.

| Icon | Instances | Sizes | Now points at |
|---|---|---|---|
| Upload | 288 | 13 / 12 / 11px | `icon / upload` — **new** |
| Arrow Right | 16 | 13px | `icon / arrow-right` — **new** |
| Chevron Down | 8 | 12px | `icon / chevron`, `Direction=Down` — existed |

All 312 instances were retargeted with `swapComponent` rather than
delete-and-recreate, so node identity survived and the `Icon Left Swap` /
`Icon Right Swap` instance-swap property bindings were not orphaned.

**Icon specification — corrected after a visual review.**

The icons first shipped at §1.7's 2px stroke with a glyph filling most of the 16px
box, and read visibly heavier than the label beside them. The reason was not stroke
scaling. **§1.7 rule 3 sets the vector's constraints to centre / centre, so the
glyph does not scale with its frame at all** — resizing an instance from 16 to 13
moves the glyph, it does not shrink it. A full 2px stroke on a 13.5px-tall glyph sat
next to a label whose cap height is 9.6px.

That has a consequence worth stating plainly: **the 13 / 12 / 11 frame ramp has no
effect on how the icon renders.** It only changes how much horizontal room the icon
occupies in the button's auto-layout. The glyph is identical in all three sizes.

So a button icon has to be authored at its final rendered size:

| | Before | After | Reference |
|---|---|---|---|
| Stroke | 2px | **1.25px** | Inter Regular 13px stems ≈ 1.15px |
| Glyph — upload | 13 × 13.5 | **9.65 × 9.91** | Label cap height 9.6px |
| Glyph — arrow-right | 13 × 10 | **9.28 × 6.48** | — |
| Stroke : glyph ratio | 1 : 6.75 | **1 : 7.9** | `icon / search` is 1 : 7 |

The ratio is what actually carries optical weight, and 1 : 8 for an outline icon
puts it level with Inter Regular. `icon / search` at 2px on a 14px glyph is already
1 : 7, so the two are consistent — it is `icon / chevron`, a deliberately sparse
mark, that sits outside the ratio.

**§1.7 should state a ratio, not a fixed 2px.** A 2px stroke is correct for a glyph
that fills the 16px box; it is too heavy for one sized to match a 13px label. The
rule as written produces the wrong result for any icon that is not full-bleed in its
slot.

**Icons inherit the label's paint.** Rather than the Neutral 1100 that §1.7
specifies for standalone icons, each icon carries the same paint as the label beside
it — white on a filled button, `#202432` on Secondary, the disabled grey when
disabled. This is what removed the 108-paint orphan: the icon is part of the label,
not a separate mark, so it should not have a colour of its own to drift.
`Button Icons` has no visible label to inherit from, so its 96 icons were mapped
from the matching `Button` variant by axis, which keeps the two sets identical.

**A note on propagation.** `swapComponent` on an instance that is the target of an
`INSTANCE_SWAP` property does not stay local to that variant — it propagates
across the set through the property. One call retargeted all 192 icons in
`Button`. Convenient, but it also **reset the Large icons to the new component's
16 × 16**, silently, while Medium and Small kept their sizes. Sizes have to be
captured before the swap and reapplied after. Worth knowing before anyone repeats
this on another component.

### 2.7.7 Naming — fixed

| Was | Now | Where |
|---|---|---|
| Axis `States` | **`State`** | Button, Button Icons — now matches Hyperlink and Split Button |
| `State=Focused` | **`State=Focus`** | Hyperlink |
| Property `Lable#55:0` | **`Label`** | Button Icons |
| Property `Link Lable#337:43` | **`Link Label`** | Hyperlink |
| Two properties both shown as `Icon Left` | **`Icon Left`** (bool) + **`Icon Left Swap`** | Hyperlink — matches Button's convention |

All four sets now expose a `State` axis with the same four values — `Default ·
Hover · Focus · Disabled`.

### 2.7.8 Remaining structural issues

**`Hyperlink` has a dead axis.** `Color` has exactly one value, `Primary`. A
one-value axis is a dropdown a consumer cannot change; it should be removed, or
given the values it was created in anticipation of. Removing it is a breaking
change to the API, hence not done here.

**No pressed state anywhere.** All four sets are `Default · Hover · Focus ·
Disabled`. The Input Field models this (§2.5.4, its `On-Click` / Active state), so
the system already has the concept — buttons, the one control where a press is the
entire point, do not. `:active` is a native pseudo-class and costs nothing.

**Both icons default to on.** `Icon Left#55:5` and `Icon Right#55:20` both default
to `true`, so a freshly placed Button arrives with two upload icons flanking the
label. The common case is no icon.

**Hover is the only state with elevation, via four stacked shadows.** The Hover
variants carry four `DROP_SHADOW` effects (r4 s0, r0 s1, r1 s1, r0 s4). No other
component in the system uses a shadow at all, and there is no elevation scale in
§1 to source them from. Four layers is also more than the effect needs.

### 2.7.9 Selector strategy

A button is a `<button>`. The `State` axis maps entirely onto native
pseudo-classes, so no state classes are invented — the same conclusion as the
radio (§2.2.7).

| Figma | Selector |
|---|---|
| `State=Default` | `.zf-btn` |
| `State=Hover` | `:hover` |
| `State=Focus` | `:focus-visible` |
| `State=Disabled` | `:disabled` |
| `Type=Primary` / `Secondary` | `.zf-btn--primary` / `.zf-btn--secondary` |
| `Size=Large` / `Medium` / `Small` | `.zf-btn--lg` / `--md` / `--sm` |
| `Intent` | `.zf-btn--success` / `--warning` / `--danger`; `default` inherits the theme |

```css
.zf-btn {
  display: inline-flex; align-items: center; gap: 10px;
  height: 32px; padding: 0 12px; border-radius: 6px;
  border: 1px solid transparent;
  font: 400 13px/21px Inter;
  cursor: pointer;
}
.zf-btn--md { height: 30px; padding: 0 8px; }
.zf-btn--sm { height: 28px; padding: 0 6px; gap: 6px; font: 400 12px/19px Inter; }

.zf-btn--primary            { background: var(--zf-color-primary); color: var(--zf-color-on-primary); }
.zf-btn--primary:hover      { background: var(--zf-color-primary-hover); }
.zf-btn--primary:disabled   { background: var(--zf-blue-800); }

.zf-btn--secondary          { background: var(--zf-neutral-100); color: var(--zf-color-text);
                              border-color: var(--zf-color-border); }
.zf-btn--secondary:hover    { background: var(--zf-neutral-200); border-color: var(--zf-neutral-700); }
.zf-btn--secondary:disabled { border-color: var(--zf-neutral-300); color: var(--zf-neutral-1000); }

/* one ring, concentric, outside the flow — as the component already builds it */
.zf-btn:focus-visible       { outline: 2px solid var(--zf-color-focus); outline-offset: 2px; }
.zf-btn:disabled            { cursor: not-allowed; }
```

Two deliberate departures from the Figma spec: the focus ring is `2px` for
consistency with every other control, and the vertical padding is dropped in favour
of the fixed height that is actually doing the work.

Express the ring as `outline` with `outline-offset`, never as a child element.
`outline` follows the border radius automatically, so the 8px-vs-6px concentricity
the component computes by hand comes for free.

### 2.7.10 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Target size 2.5.8 | ✅ | 32 / 30 / 28px tall — the second control after Input Field to pass |
| Focus visible 2.4.7 | ✅ | A real ring on all 24 Focus variants, absolute and concentric |
| Focus ring contrast | ✅ | Blue 1200 at 4.32:1 against white |
| Focus appearance 2.4.11 | ⚠ | 1px where the system is standardising on 2px; blue ring on a blue button |
| Non-text contrast 1.4.11 | ⚠ | Secondary border Neutral 600 at 1.31:1 — the same failure as four other components |
| Text contrast 1.4.3 | ❌ **fail** | White on Blue 1200 is **4.32:1** — below 4.5:1 for the 13px label. Secondary label passes at 15:1. Corrected 17 Aug; see §2.8.3 |
| Disabled contrast | ⚠ exempt | White on Blue 800 is 1.65:1 — legal, but illegible |
| Colour independence 1.4.1 | ⚠ | `Intent=danger` now names the meaning, but the button still carries it in colour alone — pair with a label or icon |
| Keyboard operation 2.1.1 | ✅ | Enter and Space, if a native `<button>` |
| Reduced motion | ⚠ | Hover shadows should be wrapped in `prefers-reduced-motion` if animated |

### 2.7.11 Issues found in the Figma source

| # | Severity | Issue | Fix | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | `Accent Color` (Blue/Green/Orange/Red) conflated theme with intent and named an axis after hues. | **Done** — renamed to `Intent` with `default · success · warning · danger`, all 192 variants preserved, instances remapped. See §2.7.1. | This file |
| 1b | **High** | `warning/*` was bound to the Yellow family despite §1.2 confirming Warning = Orange. | **Done** — re-pointed to Orange in both modes; `on-warning` is now white at 6.07:1. See §2.7.6. | ZF Semantic |
| 1c | Medium | The three non-default intents sit one palette step below their semantic role — 1200 against 1300. | Shift the button ladder one step to bind all four intents and gain Dark mode. Visible on 72 variants. | Your decision |
| 2 | ✅ **resolved** | Icons were 13 × 13 `BOOLEAN_OPERATION` fills from an external library named `…/16px`, breaking three of four §1.7 rules. | **Done** — `icon / upload` and `icon / arrow-right` authored on the Icons page; all 312 instances retargeted via `swapComponent`. See §2.7.6. | This file |
| 3 | ✅ **resolved** | All 367 bound paints were wired to an external legacy variable library, not the ERP palette. | **Done** — 280 to primitives, 87 to semantic roles, zero visual change. Zero legacy bindings remain. See §2.7.5. | This file |
| 4 | ✅ **resolved** | Axis named `States` on two sets and `State` on the other two; Hyperlink used `Focused` where the rest used `Focus`. | **Done** — all four sets expose `State` with `Default · Hover · Focus · Disabled`. | This file |
| 5 | ✅ **resolved** | `Lable` typo in two property names; two Hyperlink properties both displayed as `Icon Left`. | **Done** — `Label`, `Link Label`, and `Icon Left` / `Icon Left Swap`. | This file |
| 6 | ✅ **resolved** | Focus rings were bound to the `color/blue/1200` primitive rather than a focus role. | **Done** — all 49 rings bound to `focus/ring`. | This file |
| 7 | ✅ **resolved** | Icon glyphs were `#31384D`, roughly Neutral 1600, where §1.7 specifies Neutral 1100. 108 orphan paints. | **Done** — icons inherit the label's paint, so the orphan value is gone. | This file |
| 8 | Medium | Secondary label is raw `#202432`, 1.5 ΔE from `text/default` (Neutral 1900). | Snap to `text/default`. No visible change. | This file |
| 9 | Medium | Disabled label is raw `#929BB8`; `text/disabled` is Neutral 900, which is *lighter*. Adopting the role would reduce legibility. | Decide whether `text/disabled` is too light system-wide, then bind both. | Semantic layer |
| 10 | Medium | Secondary Focus fill is `#FAFAFF`, ΔE 1.0 from the Default fill — a distinct value that looks identical. | Reuse the Default fill; the ring carries the state. | This file |
| 11 | Medium | No pressed state in any of the four sets, though `:active` is native and the Input Field already models it. | Add `State=Active` or document the omission. | This file |
| 12 | Medium | Focus ring is 1px where the radio, checkbox and toggle are all standardising on 2px. | Set to 2px, or record 1px as the system-wide decision. | This file |
| 13 | Medium | Hover carries four stacked drop shadows; no elevation scale exists in §1 and no other component uses one. | Define an elevation scale, or reduce to one shadow. | §1 + this file |
| 14 | Low | `Icon Left` and `Icon Right` both default to `true`, so a new Button arrives with two icons. | Default both to `false`. | This file |
| 15 | Low | `Hyperlink` has a `Color` axis with a single value, `Primary`. | Remove it, or give it the values it anticipates. Breaking API change. | This file |
| 16 | Low | Size scale is 2px per step — 32 / 30 / 28 — so the three sizes are hard to distinguish; horizontal padding differentiates them more than height does. | Confirm the ladder is deliberate, or widen it. | This file |
| 17 | Low | Vertical padding is 10px on every size and cannot take effect against the fixed height. | Remove it. | This file |
| 18 | ✅ **resolved** | Icon component name carried a personal handle and a stray boolean. | **Done** — the sets now consume `icon / upload`, `icon / arrow-right` and `icon / chevron` from the Icons page. | This file |

## 2.8 Pill — `zf-pill`

**Figma:** page `Pills` → component set `zf-pill` (`30:15742`)
**CSS class:** `.zf-pill`
**Axes:** `Selection` (2) × `State` (4) = **8 variants — complete**
**Properties:** `Label` (TEXT), `Icon Swap` (INSTANCE_SWAP)

A filter chip. Selection is the primary axis — a pill is either applied or not —
and interaction state sits on top of it.

**This is the first component built to the full process end to end**, and it is
worth stating the order, because it is the order that produced the findings:
inspect → measure every raw value against the palette → fix structure and naming →
bind colours to semantic roles → localise icons → document in Figma and markdown
together → verify by screenshot. Colour was mapped *after* the structure was
right, because binding a broken matrix just preserves the break in a token.

### 2.8.1 What was wrong

The pill was built entirely against the superseded palette. **All five of its
colours were raw hex and off-palette, and three were values already catalogued as
legacy elsewhere in this system:**

| Role | Was | Nearest | ΔE | Also seen in |
|---|---|---|---|---|
| Border — default | `#E4E4F0` | Neutral 600 | 1.63 | **Radio §2.2.4 · Checkbox §2.3.4** |
| Border — hover | `#1B6DE0` | Blue 1200 | 4.07 | **Tab indicator §2.6.7** |
| Fill — active | `#1B6DE0` | Blue 1200 | 4.07 | same |
| Label | `#292E40` | Neutral 1800 | 1.47 | **Tab label §2.6.3** |
| Icon | `#408DFB` | Blue 1100 | **10.69** | nothing — worst value in the file |

Structurally:

- The axis was the Figma default **`Property 1`**, with values `Default`, `hover`,
  `active` — three casings in one dropdown.
- **`hover` and `active` were modelled as siblings.** They are not the same kind of
  thing: hover is what the pointer is doing, "active" was really *selected*. One
  axis cannot hold both, which is why the matrix could not express a hovered
  selected pill.
- **No focus state and no disabled state existed** — 0 of 3 variants.
- Vertical padding was **6 top / 7 bottom**, putting the label half a pixel off
  centre.
- Corner radius was **30px** — it happened to exceed half the height, so it read as
  round by accident rather than intent.
- The icon was a **remote library component literally named `1`**, while an unused
  local set of four icons sat on the same page.
- Properties were `label` and `icon`, lower case, against the system convention.

### 2.8.2 Structure — now

| | Was | Now |
|---|---|---|
| Set name | `Pills state` | **`zf-pill`** |
| Axes | `Property 1` (3 values) | **`Selection` (2) × `State` (4)** |
| Variants | 3 | **8 — complete** |
| Height | 26px, hug | 26px, **fixed** |
| Padding | 6 / 10 / **7** / 10 | **6 / 10 / 6 / 10** |
| Radius | 30px | **999px** |
| Focus ring | none | **+4px, radius 999, 2px `focus/ring`, absolute** |
| Properties | `label`, `icon` | **`Label`, `Icon Swap`** |

The focus ring is 2px, making the pill **the first component to adopt the weight
the rest of the system is moving toward** (§2.2.9 issue 5, §2.3.12 issue 10,
§2.4.10 issue 6, §2.7.11 issue 13 all call for 2px). It is absolute and radius 999,
so it is concentric and never affects layout.

### 2.8.3 Colour — 34 paints, all semantic

Not one primitive and not one literal. Every paint resolves through `ZF Semantic`,
so the component follows theme and Dark mode with no further work.

| Role | Semantic role | Resolves to | Contrast |
|---|---|---|---|
| Border — default | `border/default` | Neutral 600 | 1.31:1 ❌ 1.4.11 |
| Border — hover | `primary/default` | Blue 1200 | 4.32:1 ✅ |
| Fill — selected | **`primary/selected`** | Blue 1300 | 5.48:1 ✅ |
| Fill — selected hover | `primary/active` | Blue 1500 | 6.94:1 ✅ |
| Fill — disabled | `surface/disabled` | Neutral 400 | exempt |
| Label — unselected | `text/default` | Neutral 1900 | 15.15:1 ✅ |
| Label — selected | `primary/on-primary` | White | 5.48:1 ✅ |
| Label — disabled | `text/disabled` | Neutral 900 | exempt |
| Icon | **inherits the label** | — | — |
| Focus ring | `focus/ring` | Blue 1200 | 4.32:1 ✅ |

**A new role was needed, and it exposed a bug in the Button docs.** The obvious
role for a selected chip is `primary/default`, but **white on Blue 1200 is 4.32:1**
— below the 4.5:1 that 1.4.3 requires for normal text. Binding to it would have
been a regression, because the old off-palette `#1B6DE0` was 4.87:1 and *passed*.

So `primary/selected` was added at Blue 1300, where white reaches 5.48:1. It also
names the state properly: selected is neither hover nor pressed, and the system had
no role for it.

**The same arithmetic applies to the Primary button.** Its 13px white label on Blue
1200 is also 4.32:1, and §2.7.10 previously recorded that as passing — which was
wrong. See §2.7.11 issue 2; it is a semantic-layer decision, not a per-component
one.

Note `primary/selected` and `primary/hover` both resolve to Blue 1300. Two roles
sharing a value is fine — `border/divider` and `border/disabled` already do — and
it means a selected chip sits at the same weight as a hovered primary surface,
which reads correctly.

### 2.8.4 Selector strategy

A pill is a **toggle button** — not a link, not a checkbox. Build it on a native
`<button>` with `aria-pressed` and every state comes free.

| Figma | Markup / selector |
|---|---|
| Component | `button[aria-pressed]` |
| `Selection=selected` | `[aria-pressed="true"]` |
| `State=hover` | `:hover` |
| `State=focus` | `:focus-visible` |
| `State=disabled` | `:disabled` |
| Icon | `currentColor` |

```css
.zf-pill {
  display: inline-flex; align-items: center; gap: 4px;
  height: 26px; padding: 0 10px; border-radius: 999px;
  background: var(--zf-surface-default);
  border: 1px solid var(--zf-border-default);
  color: var(--zf-text-default);
  font: 500 11px/16px Inter;
  cursor: pointer;
}
.zf-pill svg              { color: currentColor; }   /* icon inherits the label */
.zf-pill:hover            { border-color: var(--zf-primary-default); }
.zf-pill:focus-visible    { outline: 2px solid var(--zf-focus-ring); outline-offset: 2px; }
.zf-pill:disabled         { background: var(--zf-surface-disabled);
                            border-color: var(--zf-border-disabled);
                            color: var(--zf-text-disabled); cursor: not-allowed; }

.zf-pill[aria-pressed='true']                { background: var(--zf-primary-selected);
                                               border-color: var(--zf-primary-selected);
                                               color: var(--zf-primary-on-primary); }
.zf-pill[aria-pressed='true']:hover          { background: var(--zf-primary-active);
                                               border-color: var(--zf-primary-active); }
.zf-pill[aria-pressed='true']:disabled       { background: var(--zf-primary-border);
                                               border-color: var(--zf-primary-border); }
```

`aria-pressed` does the work of the `Selection` axis, so selection is not carried
by a class the browser cannot see, and a screen reader announces "pressed" without
any extra labelling.

**A group of pills is a set of independent toggles**, each with its own
`aria-pressed`. If exactly one may be active, that is a radio group —
`role="radiogroup"` with `aria-checked` — and the component becomes a segmented
control rather than a filter chip.

### 2.8.5 Icons

| | Was | Now |
|---|---|---|
| Source | Remote library component named **`1`** | `icon / learn` on the Icons page |
| The unused set | An `icon` set sitting on the Pills page | Four components on the Icons page |
| Frames | 16 × 13.52, 16 × 12.71, 16 × 14.56, 16 × 16 | **16 × 16 uniform** |
| Structure | Four shapes in one variant set | **Four separate components** |
| Fill | `#408DFB` raw on every glyph | Bound; inherits the label |

Four different shapes belong in four components, not one variant set — §1.7.4 is
explicit that only a rotating path belongs in a set. They are now
`icon / configure`, `icon / publish`, `icon / build` and `icon / learn`.

**One rule had to be broken, deliberately.** These are filled vectors, not 2px
strokes, so their constraints are **SCALE** rather than centre — a fill scales
cleanly where a stroke would thin. §1.7 rule 3 says centre; that rule assumes a
stroked icon. **§1.7 should distinguish stroked icons from filled ones**, because
the correct constraint differs and the current wording gives the wrong answer for
half the icons in the file.

### 2.8.6 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Focus visible 2.4.7 | ✅ | 2px `focus/ring` on both focus variants — added in this pass |
| Text contrast 1.4.3 | ✅ | 15.15:1 unselected, 5.48:1 selected, 6.94:1 selected hover |
| Colour independence 1.4.1 | ✅ | `aria-pressed` carries selection independently of the fill |
| Keyboard operation 2.1.1 | ✅ | Inherited from a native `<button>` |
| Non-text contrast 1.4.11 | ❌ | Unselected border 1.31:1 — the **sixth** component with this failure |
| Target size 2.5.8 | ⚠ | 26px clears the 24px minimum, but only just; a dense filter row needs spacing too |
| Text size | ⚠ | 11px is below the documented `label-sm` of 12px |
| Disabled contrast | ⚠ exempt | 1.89:1 unselected, 1.65:1 selected — legal, the selected one illegible |

### 2.8.7 Issues found in the Figma source

| # | Severity | Issue | Fix | Where |
|---|---|---|---|---|
| 1 | **High** | Unselected border resolves to 1.31:1 where 1.4.11 requires 3:1. Sixth component with this value. | One fix at the semantic layer: darken `border/default`, or add a `border/control` role at Neutral 1100. | ZF Semantic |
| 2 | **High** | White on `primary/default` is 4.32:1, failing 1.4.3 for normal text. Affects the Primary button at 13px; the pill sidesteps it via `primary/selected`. | Darken `primary/default` to Blue 1300, or restrict `primary/on-primary` to large text. | ZF Semantic · Button |
| 3 | Medium | Label is Inter Medium 11 / auto — below `label-sm` (12 / 19.2), with an auto line height where the system specifies px. | Confirm 11px is deliberate for chips, or raise to 12 / 19.2 and add a chip entry to §1.4. | `30:15742` · §1.4 |
| 4 | Medium | The four pill icons are filled vectors, not 2px strokes, so they break §1.7 rule 2 and needed SCALE constraints. | Redraw as single-stroke glyphs, or amend §1.7 to cover filled icons explicitly. | Icons page · §1.7 |
| 5 | ✅ **resolved** | Axis was `Property 1` with `Default / hover / active` — mixed casing, two dimensions collapsed into one. | **Done** — `Selection` × `State`, 8 complete variants. | `30:15742` |
| 6 | ✅ **resolved** | All five colours were raw off-palette hex; three were legacy values catalogued elsewhere. | **Done** — 34 paints, all on semantic roles. Zero raw, zero primitives. | `30:15742` |
| 7 | ✅ **resolved** | No focus state and no disabled state existed. | **Done** — both added per selection, with a 2px absolute ring. | `30:15742` |
| 8 | ✅ **resolved** | Vertical padding 6 / 7 put the label half a pixel off centre. | **Done** — 6 / 6 against a fixed 26px height. | `30:15742` |
| 9 | ✅ **resolved** | Corner radius was 30px — round by accident. | **Done** — 999px. | `30:15742` |
| 10 | ✅ **resolved** | Icon was a remote component named `1`; an unused icon set sat on the Pills page. | **Done** — four icons moved to the Icons page as separate 16 × 16 components. | Icons page |
| 11 | ✅ **resolved** | Properties named `label` and `icon`, lower case. | **Done** — `Label` and `Icon Swap`, preferred values pointing at the Icons page. | `30:15742` |
| 12 | ✅ **resolved** | No role existed for a selected surface. | **Done** — `primary/selected` added at Blue 1300, white at 5.48:1. | ZF Semantic |

## 2.9 Wizard — `zf-wizard`

**Figma:** page `Wizard` → `zf-wizard` (`30:15789`), `zf-step` (`30:15764`), `zf-step-card` (`30:15781`)
**CSS class:** `.zf-wizard`
**Axes:** `zf-wizard` → `Orientation` (3) · `zf-step` → `State` (3) · `zf-step-card` → `State` (3)

A stepper, built from three sets: `zf-step` is one marker, `zf-step-card` is the
tab-style step, and `zf-wizard` composes either into a horizontal, vertical or
tabbed arrangement.

### 2.9.1 What was wrong

Everything was on Figma defaults. **All three sets carried generated names** —
`Component 6`, `Component 13`, and a `Wizard` set nested inside a plain
`Frame 15`. Every axis was default-named (`Wizard`, `Property 1`, `wizard`), and
one value was misspelled **`Vetical`**. All seven colours were raw hex.

| Set | Was | Now |
|---|---|---|
| Container | `Wizard`, inside `Frame 15` | **`zf-wizard`** — a page child; wrapper deleted |
| Marker | `Component 6` | **`zf-step`** |
| Tab step | `Component 13` | **`zf-step-card`** |
| Axes | `Wizard` · `Property 1` · `wizard` | **`State` · `State` · `Orientation`** |
| Values | `Completed / Default / Active`, `Vetical` | **lower-cased; spelling fixed** |

### 2.9.2 Two structural bugs

Neither was a colour or a naming problem, and both would have shipped.

**The active step was 4px taller than its siblings.** Its 28px ring sat *in the
auto-layout flow*, so a row of steps grew taller wherever the user happened to be —
the stepper moved as you progressed through it. The ring is now
`layoutPositioning: ABSOLUTE`, and all three variants are 24px. This is the same
class of error as the toggle's ring (§2.4.10 issue 7), and the opposite of what the
Button gets right.

**Five stray rectangles in Figma's default grey.** Each vertical connector had a
`Rectangle 185` at `#D9D9D9` sitting beneath it — a second, off-system connector
line nobody could see was there. Deleted, and the remaining connectors centred
under the circle rather than left-aligned.

| | Was | Now |
|---|---|---|
| Active step height | **28px** vs 24px siblings | 24px, ring absolute |
| Vertical connector | two overlapping lines, left-aligned | one, centred |
| Step gap | 8px active / 10px others | 10px throughout |
| Card gap | 4px with a single child | 0 |
| Horizontal connector | fixed 60px | **`layoutGrow: 1`** — stretches to fill |

### 2.9.3 Properties — the biggest handoff win

The step number and label were **nested text with no property**, so every consumer
had to reach inside the instance and edit a layer.

**This was already visible in the file.** The vertical layout rendered **"3" on four
consecutive steps** — Terms, Documents, Bidding and Award, and Point of contact —
because each was an instance of `State=default` and nobody had overridden the
nested numeral. That is exactly the drift §2.3.7 warns about with
`checkbox_defined`: if a consumer must override a nested layer by hand, sooner or
later they won't.

| Property | Set | Type | Default |
|---|---|---|---|
| **`Number`** | `zf-step` | TEXT | `1` |
| **`Label`** | `zf-step` | TEXT | `Step` |
| **`Title`** | `zf-step-card` | TEXT | `Step title` |

**A caution for anyone repeating this.** Adding a text property **resets existing
instance overrides to the property default** — Figma binds the layer to the
property and the property wins. All thirteen labels and numerals across the three
orientations had to be restored afterwards via `setProperties`, which is now the
only way they should ever be set.

### 2.9.4 Colour — 61 paints, and two repairs

Every value was raw hex. Binding them **fixed two real contrast failures** rather
than merely renaming them.

| Role | Was | Now | Resolves to | Contrast |
|---|---|---|---|---|
| Circle — active | `#408DFB` | `primary/selected` | Blue 1300 | **3.27 → 5.48:1** ✅ |
| Circle — completed | `#22B378` | `success/default` | Green 1300 | **2.70 → 4.56:1** ✅ |
| Circle — upcoming | `#D7D5E2` | `border/default` | Neutral 600 | 1.31:1 ❌ |
| Numeral · tick | `#FFFFFF` | `on-primary` · `on-success` | White | — |
| Label · numeral | `#21263C` | `text/default` | Neutral 1900 | 15.15:1 ✅ |
| Connector · card border | `#EBEAF2` | `border/divider` | Neutral 500 | decorative |
| Tabs background | `#FAFAFC` | `color/neutral/100` | Neutral 100 | exact |
| Stray connector | `#D9D9D9` | **deleted** | — | — |

**The white numeral on the active circle was 3.27:1** — failing 1.4.3. **The white
tick on the completed circle was 2.70:1** — failing 1.4.11's 3:1 for graphics. Both
now pass, purely by binding to the role that was always correct. This is the
clearest argument yet for the semantic layer: the right token was not merely tidier,
it was accessible where the hand-picked value wasn't.

`#21263C` is the same legacy label value the Input Field carries (§2.5.3).

### 2.9.5 The state model — rebuilt

Progress and interaction are two dimensions. Both sets are now
**`State` × `Focused` — 8 variants each.**

| Axis | Values |
|---|---|
| `State` | **upcoming · current · completed · error** |
| `Focused` | no · yes |

**`default` became `upcoming`.** In a sequence there is no neutral state: a step is
either done, being done, or still ahead. "Default" was borrowed from controls that
sit still, and it hid the fact that a third progress state existed at all.

| State | Circle / border | Glyph | Label |
|---|---|---|---|
| `upcoming` | `border/default` | `text/tertiary` | `text/tertiary` |
| `current` | `primary/selected` | `primary/on-primary` | `text/default` |
| `completed` | `success/default` | `success/on-success` | `text/default` |
| `error` | `danger/default` | `danger/on-danger` | `danger/text` |
| `Focused=yes` | + 2px `focus/ring`, absolute, radius 999 | — | — |

Three things this fixed beyond adding variants:

**Upcoming is now genuinely de-emphasised** at `text/tertiary` (Neutral 1100,
4.52:1 — still passing AA). Previously all three progress states used
`text/default`, so they read as three equally weighted rows rather than a
hierarchy. Progress should be visible at a glance.

**Error exists.** A step that fails validation can now be shown, using
`danger/default` for the circle and `danger/text` for the label — no new tokens
needed.

**The focus ring surrounds the whole step, label included**, because the label is
part of the click target. That also eases the 2.5.8 target-size problem: the
focusable region is the whole step, not a 24px circle.

The tab card got the same four states, and each is now visually distinct —
previously completed and upcoming differed only in font weight, and two of the
three had no visible surface at all:

| State | Fill | Border | Title |
|---|---|---|---|
| `upcoming` | `surface/default` | `border/divider` | `text/tertiary` |
| `current` | `surface/default` | **`primary/selected`** | `text/default` |
| `completed` | `surface/default` | `border/divider` | `text/default` |
| `error` | `surface/default` | `danger/border` | `danger/text` |

**Hover is deliberately not a variant.** It is a single colour shift with no
structural change, so it belongs in CSS. Modelling it here would double the matrix
to 16 per set for no design value.

### 2.9.6 Selector strategy

A stepper is a navigation landmark, not a form control, and the markup should carry
progress that colour cannot.

| Figma | Markup |
|---|---|
| `zf-wizard` | `nav > ol` |
| `zf-step` | `li > button` when reachable, `li > span` when not |
| `State=active` | **`aria-current="step"`** |
| `State=completed` | `data-state="completed"` + visually hidden "completed" |
| `State=default` | `data-state="upcoming"` |
| `Number` | the `ol` counter, not a hard-coded numeral |
| `Orientation` | `.zf-wizard--vertical` / `--tabs` |
| Connector | `::after` on the `li` |

```css
.zf-wizard ol            { display: flex; align-items: center; gap: 20px; list-style: none;
                           counter-reset: step; }
.zf-wizard li            { counter-increment: step; display: flex; align-items: center; gap: 10px; }
.zf-wizard li::after     { content: ''; flex: 1; height: 1px; background: var(--zf-border-divider); }
.zf-wizard li:last-child::after { display: none; }

.zf-step__marker         { width: 24px; height: 24px; border-radius: 999px;
                           border: 1px solid var(--zf-border-default);
                           display: grid; place-items: center; }
.zf-step__marker::before { content: counter(step); color: var(--zf-text-default); }

[aria-current='step'] .zf-step__marker      { background: var(--zf-primary-selected);
                                              border-color: var(--zf-primary-selected);
                                              color: var(--zf-primary-on-primary);
                                              box-shadow: 0 0 0 2px var(--zf-primary-selected); }
[data-state='completed'] .zf-step__marker   { background: var(--zf-success-default);
                                              border-color: var(--zf-success-default);
                                              color: var(--zf-success-on-success); }
.zf-wizard--vertical ol  { flex-direction: column; align-items: flex-start; }
```

Two things Figma cannot express but the markup must. **A tick alone is not
accessible** — pair every completed step with visually hidden text, because 1.4.1
does not accept iconography as the sole carrier of meaning. And **`aria-current="step"`**
belongs on the active step: it is the one attribute purpose-built for this, it
survives theming, and it is what assistive technology actually queries.

Let a **CSS counter** supply the numeral rather than hard-coding one per instance —
it makes reordering free and is what the `Number` property exists to seed, not to
replace.

### 2.9.7 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Text contrast — active numeral | ✅ **fixed** | 3.27:1 → 5.48:1 via `primary/selected` |
| Non-text contrast — tick | ✅ **fixed** | 2.70:1 → 4.56:1 via `success/default` |
| Text contrast 1.4.3 — labels | ✅ | `text/default` at 15.15:1 |
| Non-text contrast 1.4.11 — circle | ❌ | Upcoming circle 1.31:1 — **seventh** component with this value |
| Focus visible 2.4.7 | ❌ | No focus state on either step component, and steps are clickable |
| Colour independence 1.4.1 | ❌ | Completed carried by tick + fill; the tab card by weight alone |
| Target size 2.5.8 | ⚠ | A 24px circle is below the minimum once the label is outside the target |


### 2.9.9 Two fixes found only by looking at a dark canvas

**Both step sets were invisible.** Their labels are `text/default`, a near-black,
and the sets had no surface of their own — so on Figma's dark canvas the components
disappeared entirely. My own PNG exports had hidden this: a transparent component
set exports on transparent, which renders as white, so every screenshot looked fine.

**Only 1 of the 16 component sets in this file carried a fill** — `zf-tab`. Every
set root is now bound to `surface/default`. This is a file-wide fix, not a wizard
one, and it means a component reads correctly wherever it is viewed.

**The vertical connectors were at x=0, not on the 12px marker centre.** Worse, an
earlier attempt to fix this reported success and did nothing: **the vertical variant
is an auto-layout frame, so assigning `x` to a child is ignored by the layout
engine.** The measurement afterwards was taken from the value I had set rather than
the value Figma had computed.

Each connector is now a **fixed 24px column with the line centred inside it** —
which is also what the CSS does, where the connector is a pseudo-element on the
marker column rather than a sibling of the steps.

**A third thing surfaced while fixing that.** Instances held stale height
overrides: the active step stayed 28px after the component became 24px, because an
instance created at the old size keeps it. Resetting to hug fixed it — but note the
trap, because it caught me: **`zf-step` and `zf-step-card` use identical variant
names** (`State=active`, `State=completed`, `State=default`). Matching an instance
to a target height by variant name alone matched the tab cards against the step
heights and crushed them from 64px to 24px. Match on the parent set, not the
variant name.

| | Was | Now |
|---|---|---|
| Component set fill | none, on 15 of 16 sets | `surface/default`, all 16 |
| Vertical connector | x=0, 12px off the marker | fixed 24px column, centred |
| Active step instance | 28px, stale override | 24px, hug |


### 2.9.10 Two scripting traps worth recording

Both of these produced components that looked broken in the editor while my own
verification reported success. They are the reason this section exists.

**A rotated zero-height vector is the wrong primitive for a straight line.** The
vertical connectors were rotated vectors. When they were re-parented into new
frames, every line kept a stale `y` — drawing **74, 152, 226, 284 and 374px below
its own frame**, cascading further down the column each time, with `clipsContent`
off so nothing stopped it. One was clipped to 14px by the variant bounds. They are
now plain **1px rectangles in a clipped 24px column**, centred on the marker, and
verified at zero overflow.

**`setBoundVariableForPaint` attaches the variable but does not always rewrite the
paint literal.** A circle could therefore carry `fillVar: success/default` while
still rendering `#FFFFFF` — a white circle on a white background, invisible. Worse,
reading the paint immediately after binding returned the *resolved* value, so the
bind looked correct and only reverted later.

The fix is to **resolve the role to its RGB and set that as the literal at the same
time as binding**, so the two can never disagree:

```js
function paint(role) {
  const rgb = resolve(role);                 // follow aliases down to a primitive
  return figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: rgb }, 'color', V[role]);
}
```

Anything that scripts variable binding in this file should use that shape. Binding
without setting the literal is the single most misleading failure encountered
across all nine components, because it passes every automated check.


### 2.9.11 zf-step rebuilt from scratch

The set was replaced rather than patched, because **two outlines were overlapping**
and both came from structure rather than colour:

- The `current` marker still carried a **legacy 28px ring ellipse** around its 24px
  circle, in the same blue. Its edge read as doubled.
- The focus ring was a **pill at radius 999**, whose left cap curved right alongside
  the circle — two near-concentric arcs a few pixels apart.

Rebuilt at identical measurements — 24px marker, 10px gap, Inter 13 — with three
structural changes:

| | Was | Now |
|---|---|---|
| Marker | `GROUP` › 24px ellipse + 28px ring ellipse | **one round `FRAME`** with either a fill or a stroke, never both |
| Glyph | positioned by hand inside the group | centred by the marker's own auto-layout |
| Focus ring | pill, radius 999 | **rounded rectangle, radius 6** — a straight edge cannot chase a circle |

The old set was deleted only after all **18 instances** — across the wizard's three
orientations and this documentation frame — had been repointed and verified at zero
remaining references.

**A third ordering trap, same shape as the other two.** Setting `layoutMode` on a
frame **resets its sizing to hug**. The marker was created, resized to 24 × 24, and
only then given `layoutMode = HORIZONTAL` — which silently collapsed it to 14px,
hugging the numeral. The order must be: `layoutMode` first, then `layoutSizing*`,
then `resize`.

All three traps in this component share one characteristic: an operation that reads
as declarative but depends on order or on a side effect, and which leaves the file
in a state that passes a property check while looking wrong on screen. **Screenshot
after every structural change, on a background that contrasts with the content.**

### 2.9.8 Issues found in the Figma source

| # | Severity | Issue | Fix | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | `State` held progress only — no focus, no error. A clickable step gave no keyboard feedback and a failed step could not be shown. | **Done** — both sets are `State` (upcoming/current/completed/error) × `Focused`, 8 variants each. See §2.9.5. | `zf-step` · `zf-step-card` |
| 2 | **High** | Upcoming circle resolves to 1.31:1 where 1.4.11 requires 3:1. Seventh component with this value. | One fix at the semantic layer. | ZF Semantic |
| 3 | ✅ **resolved** | The tab card showed completed and upcoming identically apart from weight, and two of three had no visible surface. | **Done** — all four states carry `surface/default`, with the border and title colour carrying status. Visually hidden text is still required in code. | `zf-step-card` |
| 4 | Medium | Tab numbering is baked into the title string — `"1.  Overview"` — so it cannot be counted, styled or reordered. | Split the numeral out, or use a CSS counter. | `zf-step-card` |
| 5 | Low | The numeral is Semi Bold on the active step and Medium on an upcoming one. | Confirm the emphasis is deliberate, or let the circle carry the state alone. | `zf-step` |
| 6 | ✅ **resolved** | All three sets carried Figma default names, one nested inside a plain frame. | **Done** — `zf-wizard`, `zf-step`, `zf-step-card`; wrapper deleted. | All three |
| 7 | ✅ **resolved** | Axes named `Wizard`, `Property 1`, `wizard`; one value misspelled `Vetical`. | **Done** — `State` and `Orientation`, lower-cased, spelling fixed. | All three |
| 8 | ✅ **resolved** | Active step was 28px against 24px siblings — its ring sat in the layout flow, so a step row changed height as the user progressed. | **Done** — ring absolute; all variants 24px. | `zf-step` |
| 9 | ✅ **resolved** | Five stray `Rectangle 185` nodes in `#D9D9D9` sat beneath the vertical connectors. | **Done** — deleted; connectors centred. | `zf-wizard` |
| 10 | ✅ **resolved** | Number and label were nested text with no property — the vertical layout rendered "3" four times. | **Done** — `Number`, `Label`, `Title` added and wired; 13 instances restored. | `zf-step` · `zf-step-card` |
| 11 | ✅ **resolved** | All seven colours were raw off-palette hex, including two contrast failures. | **Done** — 61 paints bound, zero raw, zero legacy; both failures repaired. | All three |
| 12 | ✅ **resolved** | Layers named `Ellipse 29`, `Group 2863`, `Vector 38`, `Component 7`–`15`. | **Done** — `circle`, `ring`, `check`, `number`, `label`, `connector`, `step`, `tab`. | All three |
| 13 | ✅ **resolved** | Horizontal connector fixed at 60px, so the stepper could not adapt to its container. | **Done** — `layoutGrow: 1`. | `zf-wizard` |
| 14 | ✅ **resolved** | Step gap 8px on active vs 10px elsewhere; card gap 4px with a single child. | **Done** — 10px throughout; card 0. | `zf-step` · `zf-step-card` |
| 15 | ✅ **resolved** | No component set had a surface fill except `zf-tab`, so near-black labels vanished on a dark canvas. | **Done** — all 16 set roots bound to `surface/default`. | File-wide |
| 16 | ✅ **resolved** | Vertical connectors sat at x=0, 12px off the marker centre; an earlier fix failed silently because auto-layout ignores child `x`. | **Done** — fixed 24px columns with the line centred. | `zf-wizard` |
| 18 | ✅ **resolved** | Connectors were rotated zero-height vectors; on re-parenting each kept a stale `y` and drew up to 374px below its frame. | **Done** — 1px rectangles in a clipped 24px column, centred. Verified zero overflow. See §2.9.10. | `zf-wizard` |
| 20 | ✅ **resolved** | The `current` marker carried a legacy 28px ring around its 24px circle, and the focus ring was a pill whose cap curved alongside it — two overlapping outlines. | **Done** — `zf-step` rebuilt from scratch: one marker frame per state, rounded-rect focus ring. 18 instances repointed, old set deleted. See §2.9.11. | `zf-step` |
| 21 | ✅ **resolved** | Setting `layoutMode` after sizing reset the marker to hug, collapsing it to 14px. | **Done** — order is `layoutMode`, then sizing, then resize. | `zf-step` |
| 19 | ✅ **resolved** | `setBoundVariableForPaint` attached variables without rewriting the literal, so a circle read `success/default` while rendering `#FFFFFF`. | **Done** — the role is resolved to RGB and set as the literal alongside the binding. See §2.9.10. | `zf-step` · `zf-step-card` |
| 17 | ✅ **resolved** | Instances held stale height overrides — the active step stayed 28px after the component became 24px. | **Done** — reset to hug. Match on the parent set, not the variant name: both sets share `State=active`. | `zf-wizard` |

## 2.10 Segmented control — `zf-segmented`

**Figma:** page `Segmentation tab` → `zf-segmented` (`31:18861`), `zf-segment` (`31:18821`)
**CSS class:** `.zf-segmented` · `.zf-segment`
**Axes:** `zf-segmented` → `Content` (3) · `zf-segment` → `Selection` (2) × `State` (4) = 8

A single-choice view switcher. Two sets: `zf-segment` is one option, `zf-segmented`
is the track that holds them. Exactly one segment is selected at a time — which is
what separates this from the Tab (§2.6, navigation) and from the Pill (§2.8, a filter
that may be multi-select).

**This product ships two options — Card View and List View — in three presentations:**
icon with text, icon only, and text only. The track carries those three as a `Content`
axis; see §2.10.2 for why that is a preset rather than a repeat of the error the old
set made.

### 2.10.1 What was wrong

One set, `Segmentation Tab` (`31:18756`), with **its axis named after itself** and
values `Only text` / `only icon` / `Icon + Text`.

That axis varies **content composition**. It does not vary state. And the state that
actually matters — **which segment is selected** — was not an axis at all: the
selected segment was a hard-coded white frame called `Frame 1`. Choosing the second
option meant reaching into the instance and moving a fill by hand.

This is the same error as the Pill's merged hover/active axis (§2.8.2), the Button's
`Accent Color` (§2.7.2) and the Wizard's `State` (§2.9.5) — **the fourth component in
a row where one axis was carrying the wrong dimension.** It is now clearly the
system's most common modelling mistake, and §3 should say so.

| | Was | Now |
|---|---|---|
| Sets | 1 (`Segmentation Tab`) | **2** — `zf-segmented` + `zf-segment` |
| Axis | `Segmentation Tab` = `Only text` / `only icon` / `Icon + Text` | **`Content`** on the track; **`Selection` × `State`** on the segment |
| Selection | hard-coded white `Frame 1` | `Selection` variant |
| Segments | plain frames | components, instanced into the track |
| States | default only | default · hover · focus · disabled |
| Content composition | three variants, no properties | two boolean properties on the segment, three presets on the track |
| Track height | 35 / 35 / **31.39** | **32px** throughout |

**The two segments inside the icon-only variant differed from each other by 3.8px.**
Not from the other variants — from their own sibling, in the same row. Nothing in the
old file was auto-layout-driven, so every measurement was whatever the last drag left
behind.

### 2.10.2 Content composition is a property; the track axis is a preset

Text-only, icon-only and icon-plus-text were three variants **on the only axis the
component had**, which is why selection had nowhere to live. Composition now belongs
to the segment as two booleans, the same reduction the Button got in §2.7.3.

| Property | Type | Default | Purpose |
|---|---|---|---|
| **`Label`** | TEXT | `Card View` | the option name |
| **`Show icon`** | BOOLEAN | `true` | icon-only or icon+text |
| **`Show label`** | BOOLEAN | `true` | text-only or icon+text |
| **`Icon`** | INSTANCE_SWAP | `icon / card-view` | per-option glyph |

Three content variants × 2 selections × 4 states would have been **24 variants**.
As properties it is **8**, and the fourth combination the old set could not express —
neither icon nor label — is now simply both booleans off, which the consumer can see
is wrong without a designer having to model it.

**The track then re-exposes three of those combinations as a `Content` axis.**

| `Content` | Segments | Composition |
|---|---|---|
| `icon + text` | Card View · List View | both booleans on — 199px |
| `icon only` | Card View · List View | `Show label` off — 74px, 34px per segment |
| `text only` | Card View · List View | `Show icon` off — 159px |

This looks like the error §2.10.1 describes and is not, and the difference is worth
being precise about because it is the line between a preset and a mis-modelled axis:

- **The segment still owns composition.** Every combination is reachable there,
  including ones the track does not name.
- **The track axis adds no capability.** It names the three arrangements this product
  actually ships so a designer picks one instead of setting four booleans by hand.
- **It is not state**, and the track has no state — so it cannot collide with one.
- **It emits no class.** There is no `.zf-segmented--icon-only`; in code it is simply
  which children get rendered.

An axis that only *selects among* property combinations is a preset. An axis that is
the *only way to reach* those combinations — which is what the old set had — is the
error. If a fourth arrangement is ever needed, it is a property change, not a new
variant.

### 2.10.3 Geometry

All eight segment variants are **28px tall**, and the track is **32px** in all three
widths. Nothing hugs a stale drag.

| | Value | Note |
|---|---|---|
| Segment height | **28px** | fixed on all 8 variants |
| Segment width | hug | 10px side padding, 6px gap |
| Segment radius | **6px** | |
| Track height | **32px** | 28 + 2px padding top and bottom |
| Track radius | **8px** | 6 + 2 — concentric with the segment inside it |
| Track padding | 2px | all four sides |
| Track gap | 2px | |
| Icon slot | **14×14** | glyph 11px, **1.2px** stroke — 1 : 9.2 |
| Label | Inter Medium **12/16** | `label-sm` |

**The track radius is the segment radius plus the track padding.** 8 = 6 + 2, so the
selected segment's corner sits parallel to the track's corner instead of cutting
across it. This is the same concentric rule the Button's focus ring follows (§2.7.4)
and the rule the old set broke by having no relationship between the two at all.

### 2.10.4 Colour — 43 paints, all bound

| Element | Role | Resolves to (Light) | Dark |
|---|---|---|---|
| Track | `surface/sunken` | Neutral 400 `#F0F1FA` | Neutral 2100 `#191C29` |
| Segment — selected | `surface/default` | White | Neutral 2000 `#1D202E` |
| Segment — unselected | none (transparent) | — | — |
| Segment — hover | `surface/hover` | Neutral 300 `#F5F6FC` | Neutral 1900 `#222536` |
| Label · icon — selected | `text/default` | Neutral 1900 `#222536` | Neutral 300 |
| Label · icon — unselected | `text/secondary` | Neutral 1300 `#565A70` | Neutral 800 |
| Label · icon — disabled | `text/disabled` | Neutral 900 `#AEB1C2` | Neutral 1300 |
| Focus ring | `focus/ring` | Blue 1200 `#3874EB` | Blue 900 |
| Selected elevation | drop shadow, 2px, 8% | — | — |

Every value in the old set was raw hex: track `#EDEDF7`, label `#292E40`, icons
`#21263C` and `#4C526C`. The track was the interesting one — `#EDEDF7` is **ΔE 1.26**
from `color/neutral/500`, so it read as an intentional custom grey while being a
rounding error away from a token that already existed. `#4C526C` and `#21263C` are the
same pair of legacy values the Input Field (§2.5.3) and the Wizard (§2.9.4) carry;
this is the third component to inherit them.

**Selection is carried by elevation and text colour, not by a hue.** A segmented
control is a neutral switcher. Tinting the selected segment blue would put it in
direct competition with the primary action on the same screen — which is exactly what
the Tab does deliberately, because a tab *is* the primary navigation of its region.

### 2.10.5 The state matrix

| | `default` | `hover` | `focus` | `disabled` |
|---|---|---|---|---|
| **`unselected`** | transparent, `text/secondary` | `surface/hover` | + 2px ring | `text/disabled` |
| **`selected`** | `surface/default` + shadow | *identical to default* | + 2px ring | `surface/default`, `text/disabled` |

**`selected` + `hover` is deliberately inert.** A selected segment is not a target;
lighting it up on hover tells the user something will change when nothing will. The
variant exists so the matrix is complete and a consumer never lands on a missing
combination — not because it renders differently.

The focus ring is a 104×32 rectangle, `layoutPositioning: ABSOLUTE` at −2/−2 with
**`STRETCH` on both axes**, so it tracks the segment as the label changes length. A
fixed-size ring would have been correct only for the word "Card View". On an end
segment the ring's outer edge lands exactly on the track's edge — nothing clips,
because neither node clips, but there is no outer gap either.

### 2.10.6 Selector strategy

```html
<div class="zf-segmented" role="radiogroup" aria-label="View">
  <button class="zf-segment is-selected" role="radio" aria-checked="true">
    <svg class="zf-segment__icon">…</svg>
    <span class="zf-segment__label">Card View</span>
  </button>
  <button class="zf-segment" role="radio" aria-checked="false">…</button>
</div>
```

| Figma | CSS | Note |
|---|---|---|
| `Content` = icon only / text only | — | not a class; which children render |
| `Selection` = selected | `.is-selected` | mirror to `aria-checked` |
| `State` = hover | `:hover` | only on `:not(.is-selected)` |
| `State` = focus | `:focus-visible` | never `:focus` |
| `State` = disabled | `[disabled]` | on the button, not the group |
| `Show icon` = false | omit the `<svg>` | |
| `Show label` = false | omit the `<span>` | **requires `aria-label`** |

**Icon-only is the case most often shipped broken.** With `Show label` off there is
no accessible name at all — a screen reader announces "button". The property makes
that state one click away in Figma, so the code must make `aria-label` mandatory
whenever the label is hidden.

`Content` is not a modifier. It exists in Figma because a variant has to have a fixed
set of children; in code the track renders what it is given. Do not emit
`.zf-segmented--icon-only` — pass the same two options and omit the label node.

### 2.10.7 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Focus visible 2.4.7 | ✅ | 2px `focus/ring` on both selections — did not exist before |
| Text contrast 1.4.3 | ✅ | selected 15.15:1 on white; unselected `text/secondary` **6.04:1** on the track |
| Colour independence 1.4.1 | ✅ | `aria-checked` carries selection; elevation and colour reinforce it |
| **Non-text contrast 1.4.11** | ❌ | **selected surface vs track is 1.12:1** — see below |
| Target size 2.5.8 | ⚠️ | 28px tall — above the 24px minimum but tight; icon-only segments are 34px wide |
| Accessible name | ⚠️ | icon-only has none unless `aria-label` is supplied in code |
| Keyboard 2.1.1 | ✅ | radio-group semantics give arrow-key navigation for free |

**`surface/default` on `surface/sunken` is 1.12:1.** White on Neutral 400. The
white-card-on-grey-track pattern is what iOS, Chrome and most systems ship, but the
boundary itself carries no measurable contrast — the selected state is conveyed by a
2px 8% shadow and by the label moving from `text/secondary` to `text/default`, and
neither of those is a 3:1 edge.

This is **the same root cause as `border/default` at 1.31:1** across seven
components (open item 12): the low neutral steps are spaced for aesthetics, not for
1.4.11. Fixing it once at the semantic layer — a `border/control` at Neutral 1100,
which measures **4.02:1** on the track — would give the selected segment a legible
boundary and resolve seven other components in the same edit. I have not applied it,
because it changes the look of every bordered control in the file and that is your
call.

### 2.10.8 Icons

Four icons were authored on the Icons page per §1.7 — 16×16 slot, one vector,
1.5px round stroke, centred on render bounds to **0.000px**, `text/secondary` by
default.

| Icon | Node | Glyph | Path | Used here |
|---|---|---|---|---|
| `icon / card-view` | `31:18783` | 11 × 11 | four rounded squares, 4.3 with a 2.4 gap | ✅ |
| `icon / list-view` | `31:18785` | 11 × 8 | three rows, bullet + rule | ✅ |
| `icon / table-view` | `31:19501` | 11 × 10 | frame, header rule, one divider | — |
| `icon / board-view` | `31:19504` | 11 × 10 | three columns of unequal height | — |

`table-view` and `board-view` were authored while the track still had a 4-segment
variant and remain on the Icons page for whatever needs them. The control itself uses
only `card-view` and `list-view`.

**The stroke is 1.2px, not the 1.5px they were authored at.** At 1.5 on an 11px glyph
the ratio is 1 : 7.3, and the grid glyph in particular read as a solid block of ink
beside a 12px label — four 4.5px squares separated by 2px leaves interior holes of
3px, so the eye sees mass rather than shape. Two changes fixed it: the stroke dropped
to **1.2px (1 : 9.2)** and the squares opened to **4.3 with a 2.4px gap** and a 1px
corner radius, which is the proportion the open-source icon sets converge on. The
other three were taken to 1.2px at the same time so the page stays consistent.

This is the second time a fixed stroke has been the wrong instruction (§2.7.6 was the
first), which is why open item 11 asks §1.7 to state a **ratio**. The evidence now
says the ratio should be **1 : 9** for a glyph that fills its box, not 1 : 8.

All four are instanced into the segment at **14×14, not 16**. §1.7's centre/centre
constraints mean the 11px glyph does not scale when the slot shrinks, so the icon is
identical and only its padding changes. 14px was chosen against the 12px label: a
16px slot beside 12/16 text reads as an icon with a caption rather than a labelled
control. **§1.7 should record the slot size as a per-component decision** and state
only that the glyph is authored at 16 — the current wording implies the slot is
always 16, which four components now contradict.

### 2.10.9 Three traps worth recording

**Instance swap drops the icon's colour.** Swapping `Icon` replaces the entire
instance, and the new one arrives carrying its own paints — the segment's stroke
override does not survive. Three selected segments in `zf-segmented` came back bound
to `color/neutral/1100` (the icon component's own default) instead of `text/default`,
which is both the wrong role *and* a primitive reference in a component, breaking the
one rule in §3. Caught only by re-reading the bound variable name after the swap.
**Re-bind the stroke after every `swapComponent` or `setProperties` that changes an
INSTANCE_SWAP value.** This is a cousin of the `swapComponent` size reset in §2.7.5.

**A preset axis and a mis-modelled axis look identical in the layers panel.** The
track's `Content` axis and the old set's only axis both list three composition values.
The difference is whether the properties underneath exist: with them, the axis is a
shortcut; without them, it is the only door. Anyone auditing this file by axis names
alone will flag `Content` as a violation of §3 — §2.10.2 is the answer, and the test is
whether the same result is reachable from the segment's booleans.

**Verify the paint literal, not the binding.** The same failure mode as §2.9.10:
reading a fill straight after binding it returns the resolved value, so a wrong
binding looks right. Both sets were re-read from scratch afterwards — **43 paints, 43
bound, 0 raw** across both sets (47 including the four icon components), and no role resolving to two different literals.

### 2.10.10 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | The only axis was named after the component and its values varied content composition (`Only text` / `only icon` / `Icon + Text`), not state. | **Done** — composition is two booleans on the segment; the segment's axes are `Selection` × `State`, and the track's `Content` axis is a preset over those booleans (§2.10.2). | both |
| 2 | ✅ **resolved** | Selection was not an axis. The selected segment was a hard-coded white `Frame 1`; choosing another option meant editing fills by hand. | **Done** — `Selection` = unselected / selected. | `zf-segment` |
| 3 | ✅ **resolved** | No hover, focus or disabled state existed. A keyboard user got no feedback at all. | **Done** — 4 states, 2px `focus/ring`. | `zf-segment` |
| 4 | ✅ **resolved** | Segments were plain frames, not components — nothing to instance, nothing to override. | **Done** — `zf-segment` is a set; `zf-segmented` instances it. | both |
| 5 | ✅ **resolved** | Track heights were 35 / 35 / **31.39px**, and the two segments inside the icon-only variant differed from each other by 3.8px. | **Done** — 28px segment, 32px track, auto-layout throughout. | both |
| 6 | ✅ **resolved** | All colours raw hex: track `#EDEDF7` (ΔE 1.26 from Neutral 500), label `#292E40`, icons `#21263C` / `#4C526C`. | **Done** — 43 paints, all semantic. | both |
| 7 | ✅ **resolved** | No relationship between track and segment radius. | **Done** — 8 = 6 + 2, concentric. | `zf-segmented` |
| 8 | ✅ **resolved** | Swapping the icon silently rebound its stroke to `color/neutral/1100`, a primitive inside a component. | **Done** — re-bound to `text/default`; recorded in §2.10.9. | `zf-segmented` |
| 9 | ⚠️ **open** | Selected surface vs track is **1.12:1**, failing 1.4.11 for a state boundary. | Needs `border/control` at Neutral 1100 — the same fix as open item 12. **Your decision.** | `zf-segment` |
| 10 | ⚠️ **open** | The 14px icon slot contradicts §1.7's 16px slot, as do three other components. | Amend §1.7: glyph authored at 16, slot is a per-component decision. | §1.7 |
| 11 | ✅ **resolved** | Icons were authored at a 1.5px stroke — 1 : 7.3 on an 11px glyph. The grid glyph read as a solid block beside a 12px label. | **Done** — 1.2px (1 : 9.2), squares opened to 4.3 with a 2.4px gap and a 1px radius. All four icons on the page moved together. | Icons page |
| 12 | ✅ **resolved** | The track carried `Segments` = 2 / 3 / 4, and the 3- and 4-segment variants used placeholder options this product does not have. | **Done** — `Content` = icon + text / icon only / text only, two options throughout: Card View and List View. | `zf-segmented` |
| 13 | ⚠️ **note** | 28px height passes 2.5.8's 24px minimum but leaves 34px-wide icon-only targets. | Acceptable for a desktop-density control; revisit for touch. | `zf-segment` |

## 2.11 Input stepper — `zf-stepper`

**Figma:** page `Input Stepper` → `zf-stepper` (`33:20136`), `zf-stepper-btn` (`33:19849`), `zf-stepper-field` (`33:20272`)
**CSS class:** `.zf-stepper` · `.zf-stepper-btn` · `.zf-stepper-field`
**Axes:** `zf-stepper` → `Position` (2) × `State` (6) × `Validation` (3) = **28** · `zf-stepper-btn` → `Direction` (2) × `State` (4) = 8 · `zf-stepper-field` → `Layout` (2) × `Tone` (3) = 6

A numeric field with increment and decrement controls. Three sets: `zf-stepper-btn`
is one arrow, `zf-stepper` is the field that holds two of them, and
`zf-stepper-field` adds the label and help text.

**The value is always editable by typing.** The arrows are an accelerator, not the
only way in — which is what makes the 17px arrow height defensible under 2.5.8, and
what decides most of the markup in §2.11.6.

### 2.11.1 What was wrong

Two sets, `Stepper Field` (`33:19553`) with 16 variants and `Component With Label`
(`33:19543`) with 2, plus a third — `Stepper Button` — that **lives in a library and
cannot be edited from this file.**

**Ten of the sixteen variants were structurally a different component.** In
`Default`, `Inactive` and `Read Only State` a single frame carried the fill, the
border and the radius around everything. In `Hover`, `On Click`, `Success`, `Error`
and `Error On Click` there were **two siblings** — a bordered text box called
`Frame 2` at 135px, and a separate, separately-bordered arrow column called `Frame 9`
sitting outside it.

So in every state a user reaches *by interacting with the control*, the control stops
looking like one control: a coloured box with a grey box stuck to its side.

**A colour audit passes on all sixteen.** Every paint was bound to something. What
was wrong was the tree, and nothing but a screenshot shows it. This is the mirror
image of the §2.9.10 trap — there the bindings were right and the literals were wrong;
here the paints were fine and the structure was wrong.

| | Was | Now |
|---|---|---|
| Sets | 1 local + 1 read-only library set + a wrapper | **`zf-stepper` · `zf-stepper-btn` · `zf-stepper-field`** — all local |
| Structure | 10 of 16 variants put the arrow column **outside** the border | one container carries fill, border and radius |
| Arrow set | remote, read-only | local, 8 variants |
| Corners | the down arrow's 6px radius was on the **top-right** corner | the column clips at radius 5 = 6 − 1 |
| Arrows left | the column rotated **−180°** | child order + which side the divider sits on |
| Colour | **100% bound to the remote legacy library** | 337 paints, all `ZF Semantic` |
| Focus | 1px ring on the arrow; **none on the field** | 2px `focus/ring`, 3px offset, radius 9 |
| Value | nested text, no property | **`Value`** TEXT property |

### 2.11.2 The axis was carrying four dimensions

`State` held `Default`, `Hover`, `Inactive`, `Read Only State`, `On Click`, `Success`,
`Error`, `Error On Click`. Sort those and there are four groups:

| Dimension | Values that were in `State` |
|---|---|
| Interaction | `Default` · `Hover` · `On Click` |
| Availability | `Inactive` · `Read Only State` |
| Validation | `Success` · `Error` |
| **Two at once** | **`Error On Click`** |

**`Error On Click` is the tell.** When a variant value is two values concatenated, the
axis is carrying two dimensions — and the moment you accept one compound value you
need `Error On Hover`, `Success On Click` and the rest, which is why they were missing.
It is the cheapest signal there is, and it was sitting in the layers panel.

This is the **fifth** component with this error (§2.7.2, §2.8.2, §2.9.5, §2.10.1), and
the first where the concatenation makes it unarguable. §3's *One axis, one dimension*
now has a worked example.

**The split follows the Input Field, not a fresh idea.** §2.5 already models this
correctly as `States` × `is_error`, so the stepper adopts the same shape one level up:

| Axis | Values |
|---|---|
| `State` | `default` · `hover` · `focus` · `active` · `disabled` · `read-only` |
| `Validation` | `none` · `success` · `error` |
| `Position` | `right` · `left` |

`Inactive` became **`disabled`**, and `Read Only State` became **`read-only`** — the
old name said "state" twice. `On Click` split in two: **`focus`** is the field having
the caret, **`active`** is an arrow being pressed. The old set had both on one value
and gave the arrows their own `On Click` that changed only the glyph colour.

**14 of the 18 `State` × `Validation` combinations are authored, not 18.** `disabled`
and `read-only` are not crossed with `success` or `error`: a control nobody can edit
cannot be mid-correction. §2.5 makes the same omission for `Disabled` + `is_error`.

### 2.11.3 Geometry

Matched to the Input Field (§2.5) so the two line up in a form — 34px tall, radius 6,
1px border, 10px padding, focus ring 2px outside at radius 8/9.

| | Value | Note |
|---|---|---|
| Field height | **34px** | same as `Input Field/States` |
| Field radius | **6px** | |
| Border | **1px**, `INSIDE` | so the inner radius is 5 |
| Padding | **10px** left and right | on the `field` child, not the root |
| Arrow column | **28 × 34** | two arrows of 28 × 17 |
| Column radius | **5px** on the outer corners | 6 − 1, and the column clips |
| Divider | 1px `border/divider` | on the column's inner edge, and under the up arrow |
| Icon slot | **14 × 14** | `icon / chevron`, glyph 6.91 × 4.08, 1.25px |
| Value | Inter Regular **13**, auto line-height | same as §2.5 |
| Focus ring | 2px, offset **−3**, radius **9** | see §2.11.9 |

**The column clips instead of rounding its children.** The old set gave each arrow its
own partial radius, which is how the down arrow ended up rounded on the top-right. One
`clipsContent` on a frame with two rounded outer corners replaces four per-corner
values that had to be kept in sync — and it mirrors correctly for `Position=left`
because it is one frame, not two.

### 2.11.4 Colour — 337 paints, all semantic

Every paint in the old sets was bound to the **remote legacy library** — `Neutral/600`,
`Foundation/white`, `Neutral/1800`, `Blue/1200`, `Green/800`, `Red/700`. Not raw hex:
*bound to the wrong collection*, which passes any check that only asks whether a paint
has a variable attached.

| Element | Role | Light | Contrast |
|---|---|---|---|
| Field fill | `surface/default` | White | — |
| Field fill — disabled | `surface/disabled` | Neutral 400 | — |
| Field fill — read-only | `surface/sunken` | Neutral 400 | — |
| Border — rest | `border/default` | Neutral 600 `#DFE0EB` | **1.31:1** ❌ |
| Border — hover | `border/hover` | Neutral 1000 `#9598AB` | 2.85:1 ❌ |
| Border — focus · active | `primary/default` | Blue 1200 | 4.32:1 ✅ |
| Border — success | `success/default` | Green 1300 | 4.56:1 ✅ |
| Border — error | `danger/default` | Red 1300 | 6.09:1 ✅ |
| Value | `text/default` | Neutral 1900 | 15.15:1 ✅ |
| Arrow glyph — rest | `icon/default` | Neutral 1300 | 6.79:1 ✅ |
| Arrow glyph — hover | `text/default` | Neutral 1900 | 15.15:1 ✅ |
| Arrow glyph — active | `primary/default` | Blue 1200 | 4.32:1 ✅ |
| Arrow fill — hover · active | `surface/hover` · `surface/sunken` | Neutral 300 · 400 | — |
| Divider | `border/divider` | Neutral 500 | decorative |
| Focus ring | `focus/ring` | Blue 1200 | 4.32:1 ✅ |
| Help text | `text/secondary` · `success/text` · `danger/text` | — | 6.79 · 8.06 · 7.04 ✅ |

**The arrow glyph was going to fail 1.4.11 and I nearly shipped it.** My first pass
bound the resting chevron to `icon/subtle` — **2.85:1**, under the 3:1 that 1.4.11
requires. The chevrons are the only thing that says "this is a stepper", so they are
meaningful graphics, not decoration. Rebound to `icon/default` at **6.79:1**, and hover
now moves to `text/default` so the state still reads even though the surface also
changes.

**`*/border` roles are decorative tints, not accessible borders.** `success/border` is
1.42:1 and `danger/border` is 1.75:1 — the obvious-looking choice for a validation
border fails by a wide margin. The `*/default` roles are the ones that pass.

### 2.11.5 The state matrix

| `State` | Border | Fill | Value | Arrows |
|---|---|---|---|---|
| `default` | `border/default` | `surface/default` | `text/default` | `default` |
| `hover` | `border/hover` | `surface/default` | `text/default` | `default` |
| `focus` | `primary/default` + 2px ring | `surface/default` | `text/default` | `default` |
| `active` | `primary/default` | `surface/default` | `text/default` | **`active`** |
| `disabled` | `border/disabled` | `surface/disabled` | `text/disabled` | `disabled` |
| `read-only` | `border/default` | `surface/sunken` | **`text/default`** | `disabled` |

**Validation only overrides the border.** It never touches the fill or the value
colour — a field being corrected still has to be readable, and tinting the whole
control would make one invalid number look like a system-wide error.

**`read-only` and `disabled` differ in exactly one paint.** Both are grey and
non-interactive; the read-only value stays `text/default` at 13.47:1 while the disabled
value drops to `text/disabled` at 1.89:1. That single difference is the whole semantic
distinction: read-only means *you may read and copy this*, disabled means *this does
not apply to you*. The old set had them both, correctly, and named neither well.

### 2.11.6 Selector strategy

```html
<div class="zf-stepper" data-validation="error">
  <input type="number" class="zf-stepper__value" value="0001"
         aria-invalid="true" aria-describedby="qty-help">
  <div class="zf-stepper__arrows">
    <button type="button" class="zf-stepper-btn" aria-label="Increase">…</button>
    <button type="button" class="zf-stepper-btn" aria-label="Decrease">…</button>
  </div>
</div>
```

| Figma | Markup | Why |
|---|---|---|
| `zf-stepper` | `div` + `input[type=number]` | the native input brings arrow keys, `min`, `max`, `step` |
| `zf-stepper-btn` | `button[type=button]` | never a `div`; both arrows need an `aria-label` |
| `State=hover · focus · active` | `:hover` · `:focus-visible` · `:active` | focus on the wrapper via `:focus-within` |
| `State=disabled` | `[disabled]` on the input **and both buttons** | disabling only the input leaves two live buttons |
| `State=read-only` | `[readonly]` on the input, `[disabled]` on the buttons | `readonly` keeps the value selectable and copyable |
| `Validation=error` | `aria-invalid="true"` + `aria-describedby` | the border is the visual half; `aria-invalid` is the other |
| `Validation=success` | `aria-describedby` only | there is no `aria-valid` — say it in the help text |
| `Position=left` | `flex-direction: row-reverse` | **not a rotation**; also flips the divider side |
| `Value` | `value`, not `placeholder` | `0001` is a value here; a placeholder would vanish on typing |

`type="button"` matters: inside a form a bare `<button>` submits, so an unqualified
increment button posts the form.

### 2.11.7 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Focus visible 2.4.7 | ✅ | 2px `focus/ring`, 3px offset, radius 9 — **the field had no focus state at all** |
| Text contrast 1.4.3 | ✅ | value 15.15:1; help text 6.79 / 8.06 / 7.04:1 |
| Arrow glyph 1.4.11 | ✅ | `icon/default` 6.79:1 — was 2.85:1, see §2.11.4 |
| Colour independence 1.4.1 | ✅ | `aria-invalid` carries error; the help text carries the reason in words |
| Keyboard 2.1.1 | ✅ | `input[type=number]` gives ArrowUp / ArrowDown with no script |
| **Non-text contrast 1.4.11** | ❌ | `border/default` 1.31:1 — see below |
| Target size 2.5.8 | ⚠️ | each arrow is **28 × 17**, under the 24px minimum |
| Accessible name | ⚠️ | both arrows need `aria-label`; the label needs `for` / `id` |
| Disabled contrast | exempt | 1.89:1 — 1.4.3 exempts inactive controls |

**No border role in this system reaches 3:1 on white.** `border/default` is 1.31:1,
`border/strong` is 1.71:1, and `border/hover` — the darkest of the three — is 2.85:1.
For a *text input* the border is the only thing that marks where the control is, so
1.4.11 applies squarely and there is no compliant token to reach for. That is a
stronger statement of open item 12 than the segmented control could make: this is not
one component's border being too light, it is a gap in the semantic layer. Neutral 1100
measures **4.52:1** on white and would close it.

**The 17px arrows fail 2.5.8's 24px minimum, and are allowed anyway** — but only under
the *equivalent control* exception: the same function is available by typing in the
field, which is a target that does meet the criterion. That rationale has to travel
with the component, because it stops being true the moment someone builds a read-only
stepper whose only affordance is the arrows.

### 2.11.8 The wrapper — `zf-stepper-field`

`Component With Label` had two variants and three defects.

**`Label=Left` had no auto-layout at all.** `layoutMode: NONE`, the label pinned at
`x=0` and the control at `x=94`. A longer label overlaps the field; a translated label
certainly does.

**Nothing was exposed.** The wrapper's only properties were `Show Help Text` and the
`Label` variant. The label text, the help text and the value all lived in nested
instances with no property on the wrapper, so **a consumer could not set the label** —
they had to reach inside the instance, which is the drift §2.3.7 warns about.

**The help icon was hard-coded green** in every case, inside a `Group 828` wrapping a
frame with a hidden white fill. Green help text under an error field.

| | Was | Now |
|---|---|---|
| Axes | `Label` = Left / Top | **`Layout`** = top / left · **`Tone`** = neutral / success / error |
| `Layout=left` | no auto-layout, magic `x=94` | HORIZONTAL, 84px label column, 12px gap, label offset 7px to centre on the 34px field |
| Label text | not exposed | **`Label`** TEXT |
| Help text | not exposed | **`Help text`** TEXT + `Show help text` BOOL |
| Value | not exposed | the nested `zf-stepper` is an **exposed instance** — `Position`, `State`, `Validation` and `Value` all reachable |
| Help icon | green always, in a junk group | `Tone` drives glyph **and** colour |
| Label icon | 3 raw `#838195` vectors, hidden | `icon / info`, bound, off by default |

`Tone` deliberately mirrors `Validation` rather than deriving from it — Figma cannot
read a nested variant into a parent's colour. **In code they are one value**: the
consumer sets one flag and both the border and the help text follow. The two axes
existing separately in Figma is a modelling limit, not an invitation to set them
independently, and §2.11.6's markup makes that explicit.

### 2.11.9 Icons

| Icon | Node | Glyph | Note |
|---|---|---|---|
| `icon / chevron` | `13:8763` | 6.91 × 4.08 | `Direction` = Up / Down / Right / Left |
| `icon / info` | `33:20139` | 12.2 × 12.2 | authored here |
| `icon / check-circle` | `33:20142` | 12.2 × 12.2 | authored here |
| `icon / alert-circle` | `33:20145` | 12.2 × 12.2 | authored here |

The arrows were an 8 × 5 **filled** vector with no component behind it, rotated ±180°
for direction. They now use the existing `icon / chevron` set, which already had
`Direction` — the glyph was in the file all along.

**The chevron's stroke went from 2px to 1.25px.** At 2px on a 6.91px glyph the ratio
was 1 : 3.5, far heavier than anything else on the Icons page. This is a **shared**
icon: the change also relights the Input Field (19 instances) and the Button family
(8). That is the point — a fixed stroke was never the right instruction, and open
item 11 now has three components' worth of evidence.

`icon / info`, `icon / check-circle` and `icon / alert-circle` were authored because
the help text needs a tone glyph and the page had none, which is why the old one was
hard-coded green. Circles are four cubic Béziers in a single vector path, so §1.7's
one-vector rule holds.

### 2.11.10 Traps worth recording

**The arrow set was read-only.** `Stepper Button` reported `remote: true` and every
write threw `Cannot write to internal and read-only node`. It lives in a library, like
the Tab (open item 8). A local twin plus a swap is the only route, and it is the third
time this session — worth checking `remote` **before** planning any component's fix.

**`createFrame()` is 100 × 100 and stays `FIXED`.** The wrapper's label and help rows
came out 100px tall and the variants measured 246px instead of 84. Nothing errored —
auto-layout faithfully honoured a size I never meant to set. Set both sizing axes
explicitly, after appending, every time.

**A 2px ring at −2 is not a ring.** With `strokeAlign: CENTER` the stroke spans −3 to
−1 and the 1px border occupies 0 to 1, so the two read as a single 3px band. −3 with
radius 9 restores the 2px gap the Button uses. §2.5's ring has the same problem at
1px, which is already open item 13's territory.

**Rotation is not reordering.** `Position=Left` was the arrow column at −180°. The
rotation carried the corner radii and the up/down order with it, so the down arrow's
rounded corner landed on the top-right and every fix had to be applied twice, mirrored.
This is the third rotation hack in the file (§2.9.10's connectors, §2.11.1's arrows,
and the glyph itself) and the third time reordering was the actual answer.

### 2.11.11 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | 10 of 16 variants placed the arrow column outside the bordered box — the control visibly split in two in every interactive state. | **Done** — one container carries fill, border and radius. | `zf-stepper` |
| 2 | ✅ **resolved** | `State` carried interaction, availability, validation **and** a compound value, `Error On Click`. | **Done** — `State` (6) × `Validation` (3), 14 authored combinations per position. | `zf-stepper` |
| 3 | ✅ **resolved** | The arrow set was a read-only library component; nothing in it could be fixed. | **Done** — local `zf-stepper-btn`, `Direction` × `State`. | new set |
| 4 | ✅ **resolved** | Every paint was bound to the remote legacy library, not `ZF Semantic`. | **Done** — 337 paints, 337 bound, 0 raw, 0 remote. | all three |
| 5 | ✅ **resolved** | The down arrow's 6px radius sat on the top-right corner. | **Done** — the column clips at radius 5. | `zf-stepper` |
| 6 | ✅ **resolved** | `Position=Left` was a −180° rotation of the arrow column. | **Done** — child order plus divider side. | `zf-stepper` |
| 7 | ✅ **resolved** | The field had **no focus state**. `On Click` changed a glyph colour inside the arrow. | **Done** — 2px `focus/ring`, 3px offset, radius 9. | `zf-stepper` |
| 8 | ✅ **resolved** | Arrows were a filled 8 × 5 vector, no component, rotated for direction. | **Done** — `icon / chevron` `Direction=Up/Down`. | Icons page |
| 9 | ✅ **resolved** | The chevron's 2px stroke was 1 : 3.5 on its glyph. | **Done** — 1.25px, and 27 instances elsewhere improve with it. | Icons page |
| 10 | ✅ **resolved** | The value had no property; the label and help text were unreachable from an instance. | **Done** — `Value`, `Label`, `Help text`, `Show help text`, and an exposed nested instance. | `zf-stepper` · `zf-stepper-field` |
| 11 | ✅ **resolved** | `Label=Left` had no auto-layout — the label was pinned at `x=0`, the control at `x=94`. | **Done** — 84px label column, 12px gap, 7px optical offset. | `zf-stepper-field` |
| 12 | ✅ **resolved** | The help icon was hard-coded green regardless of tone, inside a group with a hidden white fill. | **Done** — `Tone` axis; three new icons authored. | `zf-stepper-field` |
| 13 | ✅ **resolved** | The resting chevron bound to `icon/subtle` — 2.85:1, failing 1.4.11 for a meaningful graphic. | **Done** — `icon/default` at 6.79:1. Caught in review, not in authoring. | `zf-stepper-btn` |
| 14 | ⚠️ **open** | `border/default` is 1.31:1 and **no** border role reaches 3:1 on white. | Add `border/control` at Neutral 1100 — 4.52:1. Same fix as open item 12. **Your decision.** | `ZF Semantic` |
| 15 | ⚠️ **note** | Each arrow is 28 × 17, under 2.5.8's 24px minimum. | Allowed under the equivalent-control exception because the value can be typed. Revisit for touch, and never ship an arrows-only stepper. | `zf-stepper-btn` |
| 16 | ⚠️ **open** | `zf-stepper-field` duplicates label and help-text furniture that the Input Field gets from the legacy library. | Promote `zf-label` and `zf-help-text` to local shared sets when §2.5 is migrated. | `ZF Semantic` · §2.5 |

## 2.12 Colour picker — `zf-color-picker`

**Figma:** page `Color Picker` → `zf-color-picker` (`38:21787`), `zf-color-mode` (`38:21371`), `zf-swatch` (`38:21242`), `zf-swatch-grid` (`38:21243`)
**CSS class:** `.zf-color-picker` · `.zf-color-mode` · `.zf-swatch`
**Axes:** `zf-color-picker` → `View` (2) × `Nose` (3) = 6 · `zf-color-mode` → `Mode` (3) · `zf-swatch` → `Selected` (2) × `State` (3) = 6

A popover for choosing an arbitrary colour. Four sets: `zf-color-picker` is the
popover, `zf-color-mode` is the value row, `zf-swatch` is one preset chip and
`zf-swatch-grid` is the 63-chip palette.

**This is the first component in the file where raw hex is the correct answer.** The
gradients and the swatches are *content* the user picks, not *chrome* the system
styles — §2.12.3 draws the line and §3 now states it as a rule.

### 2.12.1 What was wrong

One set, `Color Picker` (`36:20965`), four variants, and an axis that did not do what
it said.

**`Tooltip` = `Top Nose` / `Bottom Nose` was wrong in three of four variants.** The
nose is a `POLYGON` at `y = -6` — above the card — in `Top Nose, Default`,
`Top Nose, Swatches` **and `Bottom Nose, Swatches`**. Only `Bottom Nose, Default`
moved it to `y = 406`, and it was left **unrotated**, so the triangle still pointed
up, into the card it was supposed to point away from.

So of the two things the axis promised, one was drawn correctly once out of two, and
the other never. Side by side the two columns of the set look identical, which is
exactly how it survived.

**A variant axis is a claim about what the component can do, and nothing in Figma
checks that claim.** This is the strongest argument in the file for screenshotting
every value of every axis rather than the default and a spot check.

| | Was | Now |
|---|---|---|
| Sets | 1 set, 4 variants, everything inline | **4 sets**, composed |
| Nose | `Tooltip` = Top / Bottom, wrong in 3 of 4 | **`Nose`** = top / bottom / none, drawn correctly in all |
| Naming | a **boolean** `Swatches` *and* a **variant value** `Swatches` | `View` = picker / swatches · `Show swatch link` |
| Structure | **9 nested `GROUP`s** of absolute nodes in an auto-layout root | frames throughout |
| Sliders | 260px tracks inside a **240px** parent | tracks FILL and STRETCH |
| Value row | remote, read-only `Color Mode Options` | local `zf-color-mode` |
| Chevrons | rotated 4×4 vectors named `Rectangle 11` / `Rectangle 12` | `icon / chevron` instances |
| Save · Cancel | hand-built frames duplicating the Button | **Button instances**, Primary + Secondary, Medium |
| Alpha track | a **raster checkerboard image** | `surface/sunken` + a gradient, no asset |
| Selected swatch | **did not exist** | `Selected` = no / yes |
| Elevation | none — a popover with a 1px border only | 0 8 24 at 12% |
| Stray node | `Vector 66`, a 280 × 0 vector at `y = 337.69` | deleted |

### 2.12.2 The naming collision

A **boolean property** called `Swatches` showed the *Standard Colors* link row. A
**variant value** called `Swatches` showed the *grid*. Same word, same component, two
different things — and the boolean was still `true` in the variant where the row does
not exist.

`View` names the step; `Show swatch link` names the toggle. The rename costs nothing
and removes a class of bug that no amount of care prevents: two controls with one
name will eventually be set as if they were the same control.

### 2.12.3 Chrome is styled, content is data

Every previous component in this file had the same verdict — raw hex is a defect. Here
it is not, and the distinction is worth stating precisely because it is the first
exception in twelve components.

| Element | Layer | Treatment |
|---|---|---|
| Card · nose · footer · dividers | chrome | `surface/default` · `border/default` · `border/divider` |
| Field boxes · mode select | chrome | same roles and geometry as §2.5 and §2.11 |
| `Back` · `Standard Colors` | chrome | `primary/text` · `text/default` |
| Slider handle **rings** | chrome | `surface/default` stroke |
| Saturation / value area | **content** | two raw gradients |
| Hue track | **content** | raw 7-stop gradient |
| Alpha track | **both** | `surface/sunken` base + raw gradient |
| 63 swatch fills | **content** | raw hex |
| Preview chip · handle **fills** | **content** | raw hex |

**452 of 746 solid paints are bound.** The other 294 are content: 252 swatch fills
across the grid and its instances, 9 preview chips, 9 handle fills, plus 15 gradients.
**Zero raw paints remain in the chrome, and zero paints anywhere are bound to the
remote legacy library.**

The test is not "is it a colour" but **"does the theme own it?"** A hue wheel is a fact
about colour. A swatch is a value the user chose. Neither changes when the file goes
dark; the card behind them does.

### 2.12.4 Why the swatches are not the palette

Every one of the 63 chips was measured against all 200 primitives by CIELAB ΔE — the
same test that caught the segmented control's track at ΔE 1.26 from Neutral 500.

| Measure | Value | Reading |
|---|---|---|
| Exact matches | **1 of 63** | only `#000000`, which is `color/base/black` |
| Within ΔE 2.0 | 1 of 63 | the threshold at which two colours are indistinguishable |
| Within ΔE 5.0 | 4 of 63 | all four are purples, and all four are coincidence |
| Over ΔE 10 | **37 of 63** | more than half the grid is nowhere near the palette |
| **Median ΔE** | **13.3** | the segmented control's track was **1.26** |
| Worst | 31.2 — `#CE33C5` | a vivid magenta the system does not contain |

The grid is a saturated wheel: nine hues at seven tints, with **pure** greys down the
last column. The ZF palette is a muted brand ramp with **blue-tinted** neutrals —
`color/neutral/1800` is `#282B3D`, the picker's fourth grey is `#393939`.

Forcing one onto the other goes wrong in both directions. Snapping the swatches to
brand tokens desaturates the picker until users cannot find the colour they want.
Adding the swatches to the palette drags 63 tokens into a system they were never meant
to serve. **The measurement is what makes this a decision rather than an excuse** — at
median ΔE 1.3 I would have bound them without hesitating.

### 2.12.5 The swatch had no states

A 63-chip palette whose entire purpose is showing which colour is chosen had no way to
show it, and no hover or focus either.

| Selector | Treatment |
|---|---|
| `zf-swatch` | 1px `border/default` inside — a white or pale chip needs an edge or it disappears |
| `:hover` | 2px `border/hover` ring at −3, outside the chip |
| `.is-selected` | 2px `surface/default` inset **+** 2px `text/default` ring at −2 |
| `.is-selected:hover` | the hover ring moves out to −5 so it never collides |
| `:focus-visible` | 2px `focus/ring` at −3, or −5 when selected |

**The selection marker cannot use a hue, because the thing it marks is a hue.** A blue
ring is invisible on the blue column and reads as "blue is selected" everywhere else.
Colour → white gap → dark ring is the only treatment that survives all 63 values,
including `#000000` and the palest yellow.

It also keeps the chip at its full 24px. My first attempt put the white ring *inside*
the chip and the dark ring *inside that*, which made the selected swatch look **smaller**
rather than chosen — and the white ring, being drawn last, covered the dark one
entirely. Both rings have to be outside the colour.

### 2.12.6 The value row — `zf-color-mode`

| `Mode` | Properties bound | Markup |
|---|---|---|
| `hex` | `Value` | one input, `pattern="#?[0-9a-fA-F]{6}"` |
| `rgb` | `Channel 1` · `2` · `3` | three `input[type=number]`, 0–255 |
| `hsl` | `Channel 1` · `2` · `3` | three inputs, 0–360 then 0–100 then 0–100 |

`Channel 1`–`3` are shared across `rgb` and `hsl` because **Figma property defaults
belong to the set, not the variant** — switching to `hsl` in Figma still shows the rgb
numbers. That is a Figma limit, not a spec: in code the channels come from state and
change with the mode. Worth knowing before someone files it as a bug.

The preview chip carries a 1px `border/default` so `#FFFFFF` reads as a chip rather
than a hole — the same reason the swatch has one.

### 2.12.7 Selector strategy

```html
<div class="zf-color-picker" role="dialog" aria-modal="false" data-placement="bottom">
  <div class="zf-color-picker__area" role="application" aria-label="Saturation and brightness">…</div>
  <input type="range" class="zf-color-picker__hue"   aria-label="Hue"   aria-valuetext="208 degrees">
  <input type="range" class="zf-color-picker__alpha" aria-label="Alpha" aria-valuetext="100 percent">
  <div class="zf-color-mode" data-mode="hex">…</div>
  <button class="zf-color-picker__link">Standard Colors</button>
  <footer><button type="button">Save</button><button type="button">Cancel</button></footer>
</div>
```

| Figma | Markup | Why |
|---|---|---|
| `zf-color-picker` | `div[role=dialog] aria-modal="false"` | a popover, not a modal — clicking outside cancels |
| `Nose` = top / bottom | `data-placement` from the positioning library | the trigger decides, not the designer |
| `View` = picker / swatches | two panels, one visible | a step, not a type — `Back` returns |
| `Show swatch link` | render the row or not | products with no preset palette lose nothing |
| `zf-swatch-grid` | `div[role=radiogroup]` | exactly one preset at a time |
| `zf-swatch` | `button[role=radio] aria-label="#FF0054"` | **the accessible name is the value** |
| Hue · alpha | `input[type=range]` + `aria-valuetext` | a slider a screen reader can read out |
| Saturation area | `div[role=application]`, 2-D arrow keys | the one part with no native equivalent |
| Save · Cancel | `button[type=button]` | Cancel restores the colour the popover opened with |

`Nose` exists as an axis precisely because a positioning library flips placement at
runtime. Both directions have to be drawn, which is what the old set failed to do.

### 2.12.8 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Focus visible 2.4.7 | ✅ | 2px `focus/ring` at −3, or −5 when selected. **Nothing had focus before** |
| Text contrast 1.4.3 | ✅ | labels 15.15:1; `Back` and the link `primary/text` 5.92:1 |
| Selected indication 1.4.1 | ✅ | the marker is a ring, not a colour |
| Target size 2.5.8 | ✅ | swatches are 24 × 24 with a 4px gap |
| **Non-text contrast 1.4.11** | ❌ | card and field borders are `border/default` at 1.31:1 — open item 12, unchanged |
| Swatch contrast 1.4.11 | ⚠️ | a swatch is content; its contrast cannot be guaranteed. The 1px border keeps a white chip visible |
| Saturation area 2.1.1 | ⚠️ | no native control exists — arrow keys must move both axes and announce the value |
| Accessible name | ⚠️ | every swatch needs `aria-label`; both sliders need `aria-valuetext` |

The saturation area is the honest gap. Everything else here maps to a native control
that brings its own keyboard behaviour; a two-dimensional colour field does not, and no
amount of Figma work fixes that. It is a code requirement, recorded here so it is not
discovered late.

### 2.12.9 Traps worth recording

**An axis can be a lie.** `Tooltip` promised two placements and delivered one, badly.
Nothing in Figma validates that a variant does what its name says. Screenshot every
value of every axis — the two columns of this set looked identical, which is why four
variants shipped with three of them wrong.

**A nose needs two nodes.** A rotated square above the card shows all four edges — a
diamond, not a triangle. Behind the card, the card's fill hides the inner half but the
card's *border* still cuts across the base. The answer is a clipped frame showing only
the outer half plus a 2px mask over the border segment. One node cannot do it, and the
original's answer — a borderless `POLYGON` on a bordered card — is why the nose never
looked attached.

**Groups look like layout and are not.** Nine nested `GROUP`s held absolutely-placed
children inside an auto-layout root. It rendered correctly at exactly one size, and the
hue and alpha tracks were **already 20px wider** than the group holding them. A group
is a selection, saved — it has no layout, so nothing inside it can respond to anything.

**Consuming a component audits it.** Instancing the Button for Save and Cancel
surfaced **215 raw paints inside the Button family that §2.7 reported as migrated** —
`#202432` on 150 secondary labels and icon strokes, `#929BB8` on 50 disabled ones,
`#FAFAFF` on 12 focus fills. I had migrated the fills and borders I enumerated and
never re-read the family for zero-raw, which is the check I now run on everything.
Fixed here: **796 paints, 0 raw** across `Button`, `Button Icons`, `Hyperlink` and
`Split Button`, with the 204 white labels moved from `color/base/white` to
`{intent}/on-{intent}` at zero visual change.

Two consequences worth being explicit about. Disabled secondary labels moved from
`#929BB8` (2.66:1) to `text/disabled` (1.93:1) — both exempt under 1.4.3, and if the
team wants the darker value **the fix belongs in the role, not in 50 places**. And
~200 Button paints are still bound to *primitives* rather than roles, which is the
intent-ladder decision already sitting in the open items.

### 2.12.10 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | `Tooltip` = Top / Bottom Nose was drawn at the top in 3 of 4 variants, and the 4th was unrotated so it pointed into the card. | **Done** — `Nose` = top / bottom / none, verified in every variant. | `zf-color-picker` |
| 2 | ✅ **resolved** | A boolean `Swatches` and a variant value `Swatches` controlled different things. | **Done** — `View` and `Show swatch link`. | `zf-color-picker` |
| 3 | ✅ **resolved** | The body was 9 nested `GROUP`s of absolute nodes inside an auto-layout root. | **Done** — frames throughout; only the handles and the nose are absolute. | `zf-color-picker` |
| 4 | ✅ **resolved** | Hue and alpha tracks were 260px inside a 240px parent. | **Done** — FILL with STRETCH constraints. | `zf-color-picker` |
| 5 | ✅ **resolved** | `Color Mode Options` was a read-only library set. | **Done** — local `zf-color-mode`, `Mode` = hex / rgb / hsl. | new set |
| 6 | ✅ **resolved** | The 63-chip palette had no selected, hover or focus state. | **Done** — `zf-swatch`, `Selected` × `State`. | new set |
| 7 | ✅ **resolved** | Chevrons were rotated 4×4 vectors named `Rectangle 11` / `Rectangle 12`. | **Done** — `icon / chevron` instances. | `zf-color-picker` |
| 8 | ✅ **resolved** | Save and Cancel were hand-built frames duplicating the Button. | **Done** — Button instances, Primary + Secondary, Size=Medium. | `zf-color-picker` |
| 9 | ✅ **resolved** | The alpha track carried a raster checkerboard `IMAGE` fill. | **Done** — `surface/sunken` + a transparent-to-colour gradient. No asset. | `zf-color-picker` |
| 10 | ✅ **resolved** | A popover with a 1px border and no elevation. | **Done** — 0 8 24 at 12%. Still needs the elevation scale — §2.8 issue 13. | `zf-color-picker` |
| 11 | ✅ **resolved** | `Vector 66`, a 280 × 0 vector at `y = 337.69`. | **Done** — deleted. | `zf-color-picker` |
| 12 | ✅ **resolved** | The SV handle's fill was `#D9D9D9` and **hidden**; the hue and alpha handles were a fixed Blue 1200. | **Done** — all three carry the selected colour with a `surface/default` ring. | `zf-color-picker` |
| 13 | ✅ **resolved** | 215 raw paints in the Button family, reported as migrated in §2.7. | **Done** — 796 paints, 0 raw. See §2.12.9. | `Button` family |
| 14 | ⚠️ **open** | The card and every field border are `border/default` at 1.31:1. | Same fix as open item 12. **Your decision.** | `ZF Semantic` |
| 15 | ⚠️ **open** | The saturation area has no native control and so no keyboard behaviour. | Code requirement: 2-D arrow keys, `role="application"`, announce the value. | Implementation |
| 16 | ⚠️ **open** | ~200 Button paints are bound to primitives rather than roles. | The intent-ladder decision, already open. | §2.7 |

## 2.13 Banner — `zf-banner`

**Figma:** page `Banners` → `zf-banner` (`40:23157`)
**CSS class:** `.zf-banner`
**Axes:** `Layout` (3) × `Tone` (5) = **15**

A page-level message. **`Layout` says how much there is to say; `Tone` says what kind
of message it is.** They are independent, which is the whole point — the three banners
that existed were three unrelated objects, and none of them could become either of the
others.

### 2.13.1 What was wrong

| The three banners | What it actually was |
|---|---|
| One-line | a local set, `Warning Banners`, 4 variants |
| Title + description | an **instance of a read-only library set** |
| Promotional | a **`GROUP`** of loose rectangles |

**Warning was red and alert was orange.** `Warning Banner` was `Red/400` with a red
icon; `Alert Banner` was `Orange/400`. §1.2 says **warning is orange and danger is
red** — the pair you fixed earlier in this file when you asked for warning to be
orange. So a designer choosing "Warning" got the colour of an error, and every one of
those banners was **bound to a variable**, consistently, and wrong.

**Bound is not the same as correct.** Every automated check this file runs would pass
on that set: no raw hex on the surfaces, no unbound fills, no stale values. The only
way to catch it is to read the role name against the meaning the axis claims, one value
at a time.

| | Was | Now |
|---|---|---|
| Objects | a set, a library instance, and a group | **one set**, 15 variants, all local |
| Set name | **`Warning Banners`** — named after one of its own values | `zf-banner` |
| Axis | **`one line banners`** — the *layout*, holding *tone* values | `Layout` × `Tone` |
| warning · danger | **swapped** against §1.2 | warning orange, danger red |
| Tone glyphs | red and orange shared one filled triangle | four tones, **four shapes** |
| Colour | fills on the remote legacy library; 3 of 4 icons and every label **raw** | 161 paints, all semantic |
| Promo | a `GROUP`: vector background, two absolute texts, a white rectangle, a hand-drawn button in **`#1B6DE0`** | `Layout=promo` |
| Title + desc | read-only library instance | `Layout=stacked` |
| Width | fixed **520** and fixed **1000** | FILL |
| Dismiss | did not exist on any of the three | `Show dismiss` |
| Surfaces | **three** different pale blues for one idea | one role per tone |

### 2.13.2 Tone

| `Tone` | Surface | Border | Icon | Glyph | Icon contrast |
|---|---|---|---|---|---|
| `info` | `info/subtle` Sky 300 | `info/border` | `info/default` Sky 1300 | circle-**i** | 4.58:1 ✅ |
| `success` | `success/subtle` Green 300 | `success/border` | `success/default` Green 1300 | circle-**check** | 4.23:1 ✅ |
| `warning` | `warning/subtle` Orange 300 | `warning/border` | `warning/default` Orange 1300 | triangle-**!** | 5.49:1 ✅ |
| `danger` | `danger/subtle` Red 300 | `danger/border` | `danger/default` Red 1300 | circle-**×** | 5.47:1 ✅ |
| `brand` | `primary/subtle` Blue 400 | `primary/border` | `primary/default` Blue 1200 | circle-**i** | 3.83:1 ✅ |

**Every tone has a different shape, not just a different colour.** The old set gave
warning and alert the same filled triangle and asked hue to carry the entire
distinction — which 1.4.1 forbids and which a colour-blind user cannot resolve at all.
`icon / alert-triangle` and `icon / x-circle` were authored for this; `icon / close`
came with the dismiss.

**`brand` exists because a promotional banner is not a status.** It is the one tone
that means "this is us talking" rather than "here is what happened", and it is what the
old promo and title banners were actually using: `primary/subtle` resolves to **Blue
400**, the exact value they carried.

**`info` now resolves to sky, not blue**, because that is what the semantic layer says
`info` is. The old one-line info banner was brand blue, which put it in direct
competition with the primary button beside it. If you prefer the old look it is
`Tone=brand` — one property, no rebuild.

### 2.13.3 Layout

| `Layout` | Height | Padding · gap | Title | Message | Leading element |
|---|---|---|---|---|---|
| `inline` | **42px** | 10/12 · 8 | — | Regular 13/20 `text/default` | icon 16, centred |
| `stacked` | **78px** | 16 · 12 | Medium 13/20 | Regular 13/20 `text/secondary` | icon 16, top-aligned |
| `promo` | **138px** | 20 · 20 | Medium 16/24 | Regular 13/20 `text/secondary` | media 152 × 96, radius 10 |

Radius is 8 on `inline` and `stacked`, **12** on `promo` — the promo card is a wider,
heavier object and the original had it at 12 too.

`inline` centres its icon on a single line. `stacked` **top-aligns** it, because the
icon belongs to the title rather than to the block. `promo` has no status icon at all:
it has a media slot, and its action is always present rather than optional, because a
promotional banner with nothing to click is not one.

### 2.13.4 Properties

| Property | Type | Default | Bound in |
|---|---|---|---|
| `Title` | TEXT | `Title content display here` | stacked · promo |
| `Message` | TEXT | `Banner message display here` | all |
| `Show icon` | BOOLEAN | `true` | inline · stacked |
| `Show media` | BOOLEAN | `true` | promo |
| `Show action` | BOOLEAN | `false` | inline · stacked |
| `Show dismiss` | BOOLEAN | `false` | all |
| `action` | exposed instance | Button | all |

**Two properties are deliberately bound in some layouts and not others.** Figma
defaults belong to the set, so one `Show action` cannot be `false` for `inline` and
`true` for `promo`. Binding it only where the part is genuinely optional is the honest
version — and it is why `promo` shows no checkbox for an action it must have. Same
reasoning for `Show icon`, which `promo` does not bind because it has no icon node.

Without these, the matrix would need another 40 variants to express the same
combinations.

### 2.13.5 Selector strategy

```html
<div class="zf-banner zf-banner--danger zf-banner--inline" role="alert" aria-live="assertive">
  <svg class="zf-banner__icon" aria-hidden="true">…</svg>
  <p class="zf-banner__message">Banner message display here</p>
  <button class="zf-btn zf-btn--secondary zf-btn--sm">Learn more</button>
  <button class="zf-banner__dismiss" aria-label="Dismiss">…</button>
</div>
```

| Figma | Markup | Why |
|---|---|---|
| `Tone` = info · success · brand | `role="status"` `aria-live="polite"` | announced when the user finishes what they are doing |
| `Tone` = warning · danger | `role="alert"` `aria-live="assertive"` | interrupts, because it affects what happens next |
| `Layout` · `Tone` | `.zf-banner--{layout}` **and** `.zf-banner--{tone}` | two independent modifiers, never one combined class |
| `Show icon` | render the `<svg>`, `aria-hidden="true"` | the tone is in the text and the role, not the glyph |
| `Show dismiss` | `button aria-label="Dismiss"` | focus must move somewhere sensible afterwards |
| `Show action` | the Button component | never a bare link styled as a button |
| `Layout=promo` | `<img>` with real `alt` | the only image here that carries meaning |
| Width | fills its container | the fixed 520 and 1000 were canvas artefacts |

**`role="status"` versus `role="alert"` is the one decision in this component that
cannot be seen.** It is why `Tone` maps to two different live-region politenesses
rather than one, and getting it wrong means either interrupting a user for a success
message or staying silent about a failure.

### 2.13.6 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Colour independence 1.4.1 | ✅ | four tones, **four glyph shapes** — warning and danger no longer share a triangle |
| Text contrast 1.4.3 | ✅ | `text/default` **13.62–14.05:1** on every tone surface; `text/secondary` 6.03–6.30:1 |
| Icon contrast 1.4.11 | ✅ | 4.23 success · 4.58 info · 5.47 danger · 5.49 warning · 3.83 brand |
| Status announcement 4.1.3 | ✅ | `role=status` for info/success/brand, `role=alert` for warning/danger |
| Target size 2.5.8 | ⚠️ | the dismiss hit area is **20 × 20** — pad to 24 in code, 44 on touch |
| Container border 1.4.11 | n/a | `{tone}/border` is 1.32–1.57:1 — decorative. A banner is a container, not a control |
| Focus order | ⚠️ | dismiss is last in the DOM but sits rightmost — check the order matches the reading order |

This is the first component in the file whose **icon contrast passes on every tone
without an adjustment**, because `{tone}/default` on `{tone}/subtle` was designed as a
pair. It is what the semantic layer is for, and a good counterweight to open item 12,
where the neutral roles were not designed as pairs and nothing reaches 3:1.

### 2.13.7 Traps worth recording

**A tone can be wired to the wrong colour and pass every check.** `Warning Banner` was
Red 400, `Alert Banner` was Orange 400. Both bound, both internally consistent, both
wrong against §1.2. Automated auditing tells you a paint *has* a variable; it cannot
tell you the variable *means* what the layer name says. Read the role against the
meaning, one axis value at a time.

**Named after one of its own values.** The set was `Warning Banners` and held four
tones — the same mistake the segmented control made with its axis (§2.10.1). When a
container is named after one of the things it contains, everything else looks like an
exception to it.

**A group is not a component.** The promo banner was a `GROUP` holding a vector
background, two absolutely-placed texts, a white rectangle and a hand-drawn button in
`#1B6DE0` — a blue in no palette, 8 ΔE from `primary/default`. Nothing in it could
respond to a longer title, a narrower container or a theme. It rendered correctly at
exactly one size, which is precisely what the colour picker's nine groups did
(§2.12.9). **Three components in a row have now failed the same way.**

**Three blues for one idea.** `Blue/400` on the one-line info banner, `#EBF3FE` on the
title banner, `#EBF3FE` again on the promo. Three near-identical values for one
meaning, drifting a little further apart every time someone edited one of them. One
role per tone is the fix, and it is why the surface count went from three to one.

### 2.13.8 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | `Warning Banner` was Red 400 and `Alert Banner` was Orange 400 — swapped against §1.2. | **Done** — warning is orange, danger is red. | `zf-banner` |
| 2 | ✅ **resolved** | The set was named `Warning Banners` and its axis `one line banners` — a layout name holding tone values. | **Done** — `Layout` × `Tone`. | `zf-banner` |
| 3 | ✅ **resolved** | Warning and danger shared one filled triangle; hue carried the whole distinction. | **Done** — four tones, four shapes. `icon / alert-triangle` and `icon / x-circle` authored. | Icons page |
| 4 | ✅ **resolved** | Three of four icons and every message label were raw hex; surfaces were on the remote legacy library. | **Done** — 161 paints, 161 bound, 0 raw, 0 remote. | `zf-banner` |
| 5 | ✅ **resolved** | The promotional banner was a `GROUP`, not a component, with a hand-drawn button in `#1B6DE0`. | **Done** — `Layout=promo`, auto-layout, a Button instance. | `zf-banner` |
| 6 | ✅ **resolved** | The title-and-description banner was an instance of a read-only library set. | **Done** — `Layout=stacked`, local. | `zf-banner` |
| 7 | ✅ **resolved** | Widths were fixed at 520 and 1000. | **Done** — FILL. | `zf-banner` |
| 8 | ✅ **resolved** | No dismiss existed on any of the three banners. | **Done** — `Show dismiss`; `icon / close` authored. | `zf-banner` |
| 9 | ✅ **resolved** | Three different pale blues expressed one meaning. | **Done** — one role per tone. | `zf-banner` |
| 10 | ✅ **resolved** | Icon frames named `Frame 5` and `Layer_1`, one with a hidden white fill. | **Done** — `icon`, `media`, `text`, `title`, `message`, `action`, `dismiss`. | `zf-banner` |
| 11 | ⚠️ **note** | `info` moved from brand blue to sky, per the semantic layer. | Deliberate — it stops an informational banner competing with the primary button. `Tone=brand` restores the old look. | `zf-banner` |
| 12 | ⚠️ **open** | The dismiss hit area is 20 × 20, under 2.5.8's 24px. | Pad to 24 in code, 44 on touch. The glyph stays 10px. | Implementation |
| 13 | ⚠️ **open** | The nested Button instances still carry `color/blue/1200` and `color/neutral/100`. | Open item 17 — the intent-ladder decision. | §2.7 |

## 2.14 Popup modal — `zf-popup-modal`

**Figma:** page `Popup modal` → `zf-popup-modal` (`40:24083`)
**CSS class:** `.zf-popup-modal`
**Axis:** `Media` (6)

An interrupting card for announcements, promotions and release notes. **One axis:
`Media` says where the creative sits.** Everything else — the title, the description,
the buttons, the close — is a property, and the card is as tall as what is in it.

### 2.14.1 What was wrong

**36 solid paints, none of them bound to anything.** Not raw where it should have been
semantic — *100% literal hex*, plus four raw gradients. Every other component in this
file had at least a partial binding; this one had none, and nothing about looking at it
says so.

| Raw value | Count | Nearest primitive | ΔE |
|---|---|---|---|
| `#FFFFFF` | 11 | `color/base/white` | **0.00** |
| `#EBEAF2` | 9 | `color/neutral/500` | 1.69 |
| `#202432` | 4 | `color/neutral/2000` | 1.90 |
| `#434C69` | 4 | `color/neutral/1500` | 4.82 |
| `#408DFB` | 6 | `color/blue/1100` | **10.69** |
| `#21263C` | 1 | `color/neutral/1900` | 3.52 |
| `#F2F3F9` | 1 | `color/neutral/300` | 1.04 |

`#408DFB` is the interesting one: **10.69 ΔE from the nearest primitive** and used on
six CTA fills and borders. It is not a rounding error from the palette, it is a
different blue — the legacy library's, which the Wizard and the Input Field also carry
(§2.9.4, §2.5.3). Every other value here is within 5 ΔE of something that already
existed.

| | Was | Now |
|---|---|---|
| Paints | **36 solid, 0 bound** + 4 raw gradients | 107 paints, all semantic |
| Axis | **`Variant`** — Figma's default name | `Media` |
| Compound value | **`Right/Left Creative Aligned Modal`**, only the right one drawn | `side-left` **and** `side-right` |
| Height | **800 × 600 fixed** while the content hugged | the card hugs |
| Card | **three** nested cards — radius 16, 11, 10; two shadows; two borders | one card |
| Buttons | hand-built frames in `#408DFB` | **Button instances** |
| Close | **did not exist** | `Show close` |
| Overlay | **did not exist** | `overlay/scrim` added to `ZF Semantic` |
| Media slot | an empty frame; only one variant had a fill | `surface/sunken` + a removable label |
| Divider | a `FRAME` of height 1 with a fill, in one variant only | none — the gap does it |
| Missing value | no layout without a creative | `Media=none` |

### 2.14.2 Fixed size plus hugging content

Every variant was **800 × 600 `FIXED`** while its contents hugged. The consequences were
visible and had been for a long time:

- `Mini-creative Top-Aligned Modal` carried roughly **260px of empty white** below the text
- `Right/Left Creative Aligned Modal` had an **empty column** where the creative should be
- `Creative-Focused Modal` had a **405px empty creative area** below a 185px header block

Nothing overflowed and nothing errored. The frame was simply bigger than the thing
inside it, and had been since someone drew the artboard. Every media slot is now a
stated size — 280 top and bottom, 120 banner, 260 wide on the side — and the card's
height follows from them.

### 2.14.3 Three cards pretending to be one

| Node | Radius | Fill | Border | Shadow |
|---|---|---|---|---|
| the component root | 16 | white | `#EBEAF2` | yes |
| `Modal Container` | 11 | a raw gradient | — | — |
| `Info Section` | 10 | white | `#EBEAF2` | **yes** |

Three radii, two borders and two shadows for one card. The visible result is the **line
across the middle of the top-aligned variant** — the `Info Section`'s own border, which
reads as a divider nobody designed and which does not appear in the other three.

One card now: radius 16, one 1px `border/default`, one shadow at `0 16 48` / 16%.

### 2.14.4 Media

| `Media` | Slot | Text align | Card height | Use |
|---|---|---|---|---|
| `top` | 640 × 280 above | centre | 472px | the announcement people should look at first |
| `banner` | 640 × 120 above | centre | 312px | a strip of brand, not the message itself |
| `bottom` | 640 × 280 below | centre | 472px | read this, then look at it |
| `side-left` | 260 wide, fills | left | 212px | a portrait creative beside a short message |
| `side-right` | 260 wide, fills | left | 212px | the same, mirrored |
| `none` | — | centre | 192px | a release note with nothing to show |

**`Right/Left Creative Aligned Modal` was one value claiming two placements**, and only
the right one was ever drawn. Compare `Error On Click` on the stepper (§2.11.2): when a
variant value contains a slash or the word "and", the axis is carrying more than one
thing. Two values, both built, is the whole fix.

`side-left` and `side-right` differ by child order — `flex-direction: row` versus
`row-reverse`. **Not a rotation**, which is how the stepper's arrows and the wizard's
connectors went wrong (§2.11.10).

### 2.14.5 Properties

| Property | Type | Default | Note |
|---|---|---|---|
| `Title` | TEXT | `Here's what you need to know` | every layout |
| `Description` | TEXT | `Use informational modals…` | every layout |
| `Show close` | BOOLEAN | **`true`** | a promotional modal the user cannot dismiss is a trap |
| `Show secondary` | BOOLEAN | `false` | an announcement usually has one way out |
| `Show media label` | BOOLEAN | `true` | the word *Creative* in the slot — off once a real image is in |
| `primary` · `secondary` | exposed instances | Button | `Label`, `Type` and `Intent` live on the nested Button |

### 2.14.6 The overlay

There was no scrim, and no role for one. **`overlay/scrim` is now in `ZF Semantic`** —
Neutral 2200 at **48%** in Light, black at **64%** in Dark.

It is the first role in the file with an alpha channel, which is deliberate: a scrim
has to dim whatever is behind it, so it cannot alias an opaque primitive. That makes it
a literal value in the semantic layer, which is exactly where literals belong.

The scrim itself is not a component — it is a full-viewport layer, which is a layout
concern, not a component one. §2.14.7 says where it goes in markup.

### 2.14.7 Selector strategy

```html
<dialog class="zf-popup-modal zf-popup-modal--top" aria-labelledby="m-title" aria-describedby="m-body">
  <img class="zf-popup-modal__media" src="…" alt="Webinar on invoice management">
  <div class="zf-popup-modal__content">
    <h2 id="m-title">Here's what you need to know</h2>
    <p id="m-body">…</p>
    <footer><button class="zf-btn zf-btn--primary">Got it</button></footer>
  </div>
  <button class="zf-popup-modal__close" aria-label="Close">…</button>
</dialog>
```

| Figma | Markup | Why |
|---|---|---|
| `zf-popup-modal` | `<dialog aria-modal="true">` | the native element brings focus trapping and Esc |
| `Title` | `aria-labelledby` → the `h2` | the accessible name must be the visible title |
| `Description` | `aria-describedby` | so the body is read *after* the name, not instead of it |
| `overlay/scrim` | `::backdrop`, or a sibling `div` | click-outside closes only if the modal is dismissible |
| `Media` = side-left / side-right | `flex-direction: row` / `row-reverse` | not a rotation, and not two components |
| `Show close` | `button aria-label="Close"` | **and Esc must do the same thing** |
| `Media` | `<img alt="…">`, or `aria-hidden` if decorative | a promotional creative usually carries meaning |
| Focus | moves in on open, returns to the trigger on close | the single most-missed requirement in a modal |

### 2.14.8 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Text contrast 1.4.3 | ✅ | title `text/default` 15.15:1; description `text/secondary` 6.79:1 |
| Dismissible 2.1.2 | ✅ | **a close control now exists** — before there was no way out at all |
| Target size 2.5.8 | ✅ | the close chip is 28 × 28 |
| Focus management 2.4.3 | ⚠️ | trap focus in the dialog, return it to the trigger — code only |
| Close on Esc 2.1.1 | ⚠️ | Esc must do what the close button does |
| Media alt text | ⚠️ | a promotional creative carries meaning and needs real `alt` |
| Non-text contrast 1.4.11 | ❌ | the card border is `border/default` at 1.31:1 — open item 12 |

**A modal with no way out was the most serious defect here** and the easiest to miss:
every screenshot showed a modal that had just opened, and in that frame the absence of
a close button looks like restraint rather than a dead end.

### 2.14.9 Traps worth recording

**Zero bound paints still looks finished.** 36 solid paints, none bound, four raw
gradients — and it renders perfectly. Nothing about looking at a component tells you
this; the count does, and the count is one script.

**Fixed size plus hugging content.** A frame bigger than its contents produces no
warning, no overflow and no error. It just quietly ships a modal that is 260px of white
below the message. §2.12 had the same shape of problem in groups; here it was in the
frames themselves.

**A value that names two things.** `Right/Left` in a variant value is the same signal as
`Error On Click` (§2.11.2) — a slash or an "and" in a value means the axis is carrying
more than one dimension, and one of them is usually not drawn.

**Nested cards produce dividers nobody designed.** Three stacked radii with two borders
and two shadows put a line across the middle of one variant and not the others, which is
how an inconsistency becomes a "style".

### 2.14.10 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | 36 solid paints, **zero bound**, plus 4 raw gradients. | **Done** — 107 paints, all `ZF Semantic`, 0 raw, 0 remote. | `zf-popup-modal` |
| 2 | ✅ **resolved** | The axis was named `Variant`, Figma's default. | **Done** — `Media`. | `zf-popup-modal` |
| 3 | ✅ **resolved** | `Right/Left Creative Aligned Modal` was one value for two placements; only the right was drawn. | **Done** — `side-left` and `side-right`, both built. | `zf-popup-modal` |
| 4 | ✅ **resolved** | Every variant was 800 × 600 fixed while its content hugged — up to 260px of dead space. | **Done** — the card hugs; every media slot has a stated size. | `zf-popup-modal` |
| 5 | ✅ **resolved** | Three nested cards: radius 16 / 11 / 10, two borders, two shadows. | **Done** — one card, one border, one shadow. | `zf-popup-modal` |
| 6 | ✅ **resolved** | Both CTAs were hand-built frames in `#408DFB`, 10.69 ΔE from the nearest primitive. | **Done** — Button instances, Primary and Secondary, Size=Medium. | `zf-popup-modal` |
| 7 | ✅ **resolved** | No close control in any of the four variants. | **Done** — `Show close`, on by default. | `zf-popup-modal` |
| 8 | ✅ **resolved** | No overlay, and no role for one. | **Done** — `overlay/scrim` added to `ZF Semantic`, Neutral 2200 @ 48% / black @ 64%. | `ZF Semantic` |
| 9 | ✅ **resolved** | The creative area was an empty frame — three of four had no fill at all. | **Done** — `surface/sunken` with a removable label. | `zf-popup-modal` |
| 10 | ✅ **resolved** | The divider was a `FRAME` of height 1 with a fill, present in one variant only. | **Done** — removed; the 24px gap separates the footer in every layout. | `zf-popup-modal` |
| 11 | ✅ **resolved** | No layout existed without a creative. | **Done** — `Media=none`. | `zf-popup-modal` |
| 12 | ⚠️ **open** | Focus trapping, focus return and Esc-to-close cannot be expressed in Figma. | Code requirement — see §2.14.7. | Implementation |
| 13 | ⚠️ **open** | The card border is `border/default` at 1.31:1. | Open item 12. **Your decision.** | `ZF Semantic` |

## 2.15 Popover — `zf-popover`

**Figma:** page `Non Modal` → `zf-popover` (`42:24944`)
**CSS class:** `.zf-popover`
**Axis:** `Nose` (5)

A non-modal card anchored to something on the page — a coach mark, a preview, a
promotion. **One axis: `Nose` says which edge the pointer is on**, which is the only
thing that varies structurally.

What was three named "types" is now three settings of one component.

### 2.15.1 What was wrong

Three variants on an axis called **`Variant`**, with values that each repeated the word
"Pop-over". Nothing structural varied between them — what varied was which content
parts were switched on.

| Old name | What it actually held |
|---|---|
| `Promotion Pop-over` | creative + a divider + `Got It`. **No text at all** |
| `Preview Pop-over` | creative + a **description** + `Got It`. No header |
| `Default Contextual Pop-over` | creative + header + description + `Got It` + `Cancel` |

**The names had drifted from the contents.** The promotion had no words in it, and the
most complete of the three was called "Default". Names describe intent at the moment of
drawing; contents change afterwards.

| | Was | Now |
|---|---|---|
| Axis | **`Variant`** — Figma's default | `Nose` |
| What varied | which content parts were present | **properties** |
| Pointer | **none on any of the three** | top · right · bottom · left · none |
| Primary button | `#1B6DE0` on two variants, raw **`#2454DE`** on the third | one Button instance |
| Description colour | **`Neutral/900`** on two, **`Neutral/650`** on the third | `text/secondary` |
| Secondary button | a frame with a **`#CCCCCC`** stroke | Button instance, Secondary |
| Paints | 8 raw values + 3 on the remote legacy library | 103 paints, all semantic |
| Left inset | 6 + 16 on two variants, 6 + 10 on the third | 16, from one value |
| Naming | a frame called **`Modal Container`** in a *non-modal* component | `body` · `media` · `stack` · `text` · `footer` |
| Divider | a 1px `RECTANGLE`, in one variant only | none — the gap does it |
| Sizing | one `FIXED/FIXED`, two `FIXED/HUG` | every variant hugs |
| Close | did not exist | `Show close` |

**The left inset differed across variants**, so the primary button did not line up
between them: 6 + 16 = 22px in two, 6 + 10 = 16px in the third. Two paddings on two
different nodes, neither of them wrong on its own.

### 2.15.2 The same name, two different colours

Two of the three bound their description to **`Neutral/900`** in the remote legacy
library, where it resolves to `#202432` — near-black. In `ZF Primitives`,
`color/neutral/900` is `#AEB1C2` — light grey.

| Variable name | Legacy library | `ZF Primitives` | ΔE |
|---|---|---|---|
| `Neutral/900` | `#202432` near-black | `#AEB1C2` light grey | **58.06** |
| `Blue/700` | `#1B6DE0` brand blue | `#C0D5FD` pale blue | **59.84** |

Both collections use the same `{family}/{step}` naming on **incompatible scales** — the
legacy library's 900 is dark where ours is light. A component bound to `Neutral/900`
renders correctly today only because the literal travelled with it. Re-point the
library, or open the file where that name resolves differently, and the description
turns pale grey on white.

This is the clearest measurement yet of what open item 16 is actually asking about. It
is also the mirror image of §2.9.10: there the binding was right and the literal was
stale; **here the literal is right and the binding is wrong**, and only the stale
literal is holding it together.

**Check which collection a variable belongs to, not just that one exists.**

### 2.15.3 The three types are presets

| Old name | Setting | What it means |
|---|---|---|
| `Promotion Pop-over` | `Show text = false` | media, one action |
| `Preview Pop-over` | `Show title = false` | media, description, one action |
| `Default Contextual Pop-over` | the default, `Show secondary = true` | everything on, two actions |
| *(new)* | `Show media = false` | text with no creative — the old set could not express it |

Presets in the documentation keep the intent; properties keep the component honest.
This is the §3 preset rule applied without needing an axis: the combinations exist
below, so the names can live in prose.

### 2.15.4 Nose

| `Nose` | Geometry | Constraints | Meaning |
|---|---|---|---|
| `top` | 20 × 12 clip, square at −10 | CENTER / MIN | the popover sits **below** its trigger |
| `right` | 12 × 20 clip, square at x = 298 | MAX / CENTER | the popover sits **left of** its trigger |
| `bottom` | 20 × 12 clip, square at y = h − 2 | CENTER / MAX | the popover sits **above** its trigger |
| `left` | 12 × 20 clip, square at −10 | MIN / CENTER | the popover sits **right of** its trigger |
| `none` | — | — | a detached card, pointing at nothing |

The nose is a **clipped frame + a 10px square rotated 45° + a 2px mask** over the card
border — the same two-node construction as the colour picker (§2.12.9). One node cannot
do it: above the card a rotated square shows all four edges and reads as a diamond;
behind it, the card's border still cuts across the base.

Positioning is by **constraint**, not coordinate, so the nose stays centred when the
card grows.

**Anchoring is the only thing that separates a popover from a floating card**, so the
old set was missing its defining feature — and it looked fine, because a card centred
on a canvas has nothing to point at.

### 2.15.5 Geometry

| | Value |
|---|---|
| Card width | **300px** |
| Card radius | **12px**, one border, one shadow at `0 8 24` / 12% |
| Inner clip | a `body` frame at radius 11 — 12 minus the 1px border |
| Media | 300 × 160, `surface/sunken`, full-bleed |
| Padding | **16** on all four sides of `stack` |
| Gaps | 16 between the text block and the footer; 6 between title and description |
| Title | Inter Semi Bold **16/24**, `text/default` |
| Description | Inter Regular **13/20**, `text/secondary` |
| Buttons | Button, `Size=Small` — 28px |
| Close | 24 × 24 chip, `surface/default` + 1px border, radius 999 |

The `body` wrapper exists so the media's top corners follow the card's radius while the
nose stays *outside* the clip. Without it, clipping the card clips the nose too.

### 2.15.6 Properties

| Property | Type | Default | Note |
|---|---|---|---|
| `Title` | TEXT | `Header` | — |
| `Description` | TEXT | `Description to be having…` | — |
| `Show media` | BOOLEAN | `true` | off gives a text-only popover |
| **`Show text`** | BOOLEAN | `true` | hides the whole text block — see below |
| `Show title` | BOOLEAN | `true` | description-only |
| `Show description` | BOOLEAN | `true` | title-only |
| `Show secondary` | BOOLEAN | `false` | the Cancel button |
| `Show close` | BOOLEAN | `false` | off by default — the popover dismisses on outside click |

**`Show text` exists because of a Figma mechanic.** An auto-layout frame with all its
children hidden **still applies its own padding**. Hiding the title and the description
left a 16px band of empty white between the creative and the button; hiding the frame
that holds them collapses it properly. It is a layout quirk leaking into the property
list, and naming it is better than leaving a mystery gap in the media-only preset.

### 2.15.7 Selector strategy

```html
<div class="zf-popover" role="dialog" aria-modal="false" data-placement="bottom"
     aria-labelledby="p-title">
  <div class="zf-popover__body">
    <img class="zf-popover__media" src="…" alt="">
    <div class="zf-popover__stack">
      <div class="zf-popover__text">
        <h3 id="p-title">Header</h3>
        <p>…</p>
      </div>
      <footer><button class="zf-btn zf-btn--primary zf-btn--sm">Got it</button></footer>
    </div>
  </div>
  <span class="zf-popover__nose" aria-hidden="true"></span>
</div>
```

| Figma | Markup | Why |
|---|---|---|
| `zf-popover` | `div[role=dialog] aria-modal="false"` | **a dialog that does not trap** — the page stays usable |
| — | the trigger carries `aria-expanded` + `aria-controls` | so the popover is known to belong to it |
| `Nose` | `data-placement` from the positioning library | flipped at runtime, which is why all four are drawn |
| `Title` | `aria-labelledby`, or `aria-label` when `Show title` is off | a popover with no visible title still needs a name |
| `Show close` | `button aria-label="Close"` | and Esc must do the same |
| `Show text` | render the block or not | not a class — the absence of children |
| `Media` | `alt`, or `aria-hidden` if decorative | a promotion carries meaning; a coach-mark illustration may not |
| Focus | moves in on open, returns to the trigger | same as a modal, **without the trap** |

**Non-modal is the whole specification**: no focus trap, no scrim, closes on outside
click. `aria-modal="false"` is what says so, and it is the one line that separates this
component from §2.14.

### 2.15.8 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Text contrast 1.4.3 | ✅ | title 15.15:1, description 6.79:1 on white |
| Dismissible 2.1.2 | ✅ | `Got it`, an optional close, outside click and Esc |
| Target size 2.5.8 | ⚠️ | the close chip is 24 × 24 — **exactly** the minimum; pad it on touch |
| Accessible name | ⚠️ | with `Show title` off there is no name unless `aria-label` is set |
| Focus management 2.4.3 | ⚠️ | move focus in, return it to the trigger — and **do not trap** |
| Non-text contrast 1.4.11 | ❌ | card and nose borders are `border/default` at 1.31:1 — open item 12 |

### 2.15.9 Traps worth recording

**A bound variable can be the wrong library.** Two variants bound their description to
`Neutral/900` and rendered near-black. In this file's own collection that name is light
grey, 58 ΔE away. The binding is real, the name is familiar, and the result is correct
only by accident of the stored literal.

**One button, three colours.** `#1B6DE0` on two variants, `#2454DE` on the third, 19 ΔE
apart, **within one set** — and neither is `primary/default`. Hand-built buttons drift
inside a single component, not just across a file.

**Hidden children still reserve padding.** Hiding the title and description left a 16px
band of white, because the frame holding them kept its own padding. This is why
`Show text` is a property.

**Names drift from contents.** "Promotion" held no words; the most complete variant was
called "Default". Intent belongs in documentation, composition belongs in properties.

### 2.15.10 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | The axis was named `Variant`; its three values varied content composition, not structure. | **Done** — `Nose`, and composition is six booleans. | `zf-popover` |
| 2 | ✅ **resolved** | None of the three had a pointer — the defining feature of a popover was missing. | **Done** — `Nose` = top / right / bottom / left / none. | `zf-popover` |
| 3 | ✅ **resolved** | The description was bound to `Neutral/900` on two variants and `Neutral/650` on the third — both in the remote legacy library. | **Done** — `text/secondary` everywhere. | `zf-popover` |
| 4 | ✅ **resolved** | The primary button was `#1B6DE0` on two variants and raw `#2454DE` on the third, 19 ΔE apart. | **Done** — one Button instance, Primary, Size=Small. | `zf-popover` |
| 5 | ✅ **resolved** | The secondary button's border was `#CCCCCC` — a pure grey in no palette, 7.6 ΔE from Neutral 700. | **Done** — Button instance, Secondary. | `zf-popover` |
| 6 | ✅ **resolved** | 8 raw values plus 3 bound to the remote library. | **Done** — 103 paints, all `ZF Semantic`, 0 raw, 0 remote. | `zf-popover` |
| 7 | ✅ **resolved** | The left inset was 22px on two variants and 16px on the third, so the buttons did not line up. | **Done** — 16px from one padding value. | `zf-popover` |
| 8 | ✅ **resolved** | A frame called `Modal Container` inside a **non-modal** component. | **Done** — `body`, `media`, `stack`, `text`, `footer`. | `zf-popover` |
| 9 | ✅ **resolved** | A 1px `RECTANGLE` divider, present in one variant only. | **Done** — removed; the 16px gap separates in every layout. | `zf-popover` |
| 10 | ✅ **resolved** | One variant was `FIXED/FIXED` while two hugged. | **Done** — every variant hugs. | `zf-popover` |
| 11 | ✅ **resolved** | No close control, and no text-only composition. | **Done** — `Show close`, `Show media`. | `zf-popover` |
| 12 | ⚠️ **open** | The close chip is 24 × 24 — exactly 2.5.8's minimum. | Pad to 44 on touch. | Implementation |
| 13 | ⚠️ **open** | Focus in, focus return, Esc, outside-click and `aria-expanded` on the trigger cannot be expressed in Figma. | Code requirement — see §2.15.7. | Implementation |
| 14 | ⚠️ **open** | The card border is `border/default` at 1.31:1. | Open item 12. | `ZF Semantic` |

## 2.16 Accordion — `zf-accordion`

**Figma:** page `Accordion` → `zf-accordion-item` (`42:26707`), `zf-accordion` (`42:26708`), `zf-accordion-note` (`42:26477`)
**CSS class:** `.zf-accordion` · `.zf-accordion-item`
**Axes:** `Chevron` (2) × `Expanded` (2) × `State` (4) = **16**

A disclosure: a header you click and a body that appears. Two components —
`zf-accordion-item` is one disclosure, `zf-accordion` is the bordered group that holds
several.

What was four separate sets, each differing only in **what its body contained**, is now
one item with a swappable body.

### 2.16.1 One of the four sets did not work

`Accordion / Section List` held six sections and an `Expanded` axis that toggled
**only the third one**. The other five each carried a hidden 100px `Content` frame that
no property could ever reveal — switching the axis did nothing to them at all.

| Variant | Section 1 | 2 | **3** | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| `Expanded=false` | 41px | 41 | **41** | 41 | 41 | 41 |
| `Expanded=true` | 41px | 41 | **141** | 41 | 41 | 41 |

It looked like a working accordion list because a screenshot of a working accordion
list is exactly what it was. **Set every axis to every value and count what actually
moves.**

It was also the wrong unit: three of the four sets were *one* accordion and the fourth
was *six* of them, filed on the same page under the same axis name. A list and its item
are different components — and the giveaway is that the list had no way to say which
item was open.

### 2.16.2 Twelve values, six roles

All four sets were 100% literal hex: **111 solid paints, 0 bound**, 12 distinct values.
Sorted, they are six roles with drift on top.

| Values | ΔE apart | Nearest primitive | Used | What it is |
|---|---|---|---|---|
| `#21263C` vs `#21263D` | **0.71** | `color/neutral/1900` | 28 + 6 | body text — one hex digit apart |
| `#6C718A` vs `#6B708A` | **0.71** | `color/neutral/1200` | 4 + 6 | column header — same |
| `#F9F9FB` · `#FAFAFD` · `#FAFAFF` | 0.63–1.58 | `color/neutral/100` | 3 + 1 + 1 | three near-whites, one header surface |
| `#EBEAF2` · `#DEDEE3` · `#DDDDEC` | 4.65–5.80 | `color/neutral/500` · `600` | 18 + 2 + 2 | three borders — **these you can see** |
| `#408DFB` | — | `color/blue/1100` at **10.69** | 22 | the legacy blue, not `primary/default` |
| `#434C69` | — | `color/neutral/1500` at 4.82 | 12 | the legacy body-secondary |

**The 0.71 ΔE pairs are the interesting ones.** Nobody *chose* two values one hex digit
apart — they arrived by paste and nudge, and then propagated to 34 and 10 nodes. No
review catches them, because no eye resolves 0.71 ΔE. No amount of care prevents them,
because care is not the mechanism.

A role is. This is the plainest evidence in the file for why §3's one rule exists, and
it is worth contrasting with §2.12.4: there, raw hex was **correct** because the values
were content. Here they are chrome, and the drift is exactly what §3 predicts.

### 2.16.3 What changed

| | Was | Now |
|---|---|---|
| Sets | **4 local** + a remote `Accordion / Section Item` | `zf-accordion-item` · `zf-accordion` · `zf-accordion-note` |
| What differed | only what the body contained | a swappable **`Body`** property |
| `Section List` | an axis that toggled 1 of its 6 sections | not a component — the group is `zf-accordion` |
| Paints | 111 solid, **0 bound**, 12 raw values | 220 paints, all semantic, 0 raw, 0 remote |
| States | `Expanded` only | `Expanded` × `Chevron` × `State` |
| Chevron | a rotated 4×4 vector in three sets, a **filled 6×6** in the fourth | `icon / chevron`, four directions, 1.25px |
| Chevron direction | right→down in two, down→up in two | tied to the chevron's side — §2.16.4 |
| Collapsed vs expanded | **structurally different frames** — one HORIZONTAL, one VERTICAL wrapping a header | one structure, body visibility toggled |
| Overlap hack | **`itemSpacing: -1`** to collapse doubled borders | one border on the group, dividers between items |
| Stray node | `Bottom Spacer` — an empty 30px frame | removed |
| Title size | 15 / 13 / 13 / 13 across the four sets | 13/20 Medium |

**Collapsed and expanded were different components.** `Expanded=false` was a HORIZONTAL
frame that *was* the header; `Expanded=true` was a VERTICAL frame containing a header
frame that carried its own fill and border. Same class of error as the popup modal
(§2.14.3) and the input stepper (§2.11.1) — the two states of one thing built as two
things.

### 2.16.4 The chevron convention

The four sets disagreed about which way the chevron points. They were **not**
inconsistent at random.

| `Chevron` | Collapsed | Expanded | Reads as |
|---|---|---|---|
| `leading` | right | down | a disclosure triangle — the row opens downward from the marker |
| `trailing` | down | up | an expander — the arrow points at where the content will go |

Data Table and Grouped Data Row put the chevron on the **left** and used right→down.
Section List and Inline Toggle put it on the **right** and used down→up. Both
conventions are correct *for the position they were in*.

Tying the direction to the side turns two contradictions into one rule, and it is why
`Chevron` is an axis rather than a coin toss.

### 2.16.5 States

The header is a button. It had none of these.

| `State` | Header | Title | Chevron |
|---|---|---|---|
| `default` | `surface/default` | `text/default` | `icon/default` |
| `hover` | `surface/hover` | `text/default` | `icon/default` |
| `focus` | `surface/default` + 2px `focus/ring` | `text/default` | `icon/default` |
| `disabled` | `surface/disabled` | `text/disabled` | `icon/disabled` |

**The old header was a flat `#F9F9FB` tint in every state, which left hover nowhere to
go.** Moving the rest state to `surface/default` frees the tint for hover — the header
now says "I am clickable" by *responding* rather than by being permanently shaded.

The chevron also moved from `#408DFB` on `#F9F9FB` — **3.24:1**, marginal against
1.4.11 — to `icon/default` at 6.79:1.

### 2.16.6 Properties

| Property | Type | Default | Note |
|---|---|---|---|
| `Title` | TEXT | `Section title` | every variant |
| `Show count` | BOOLEAN | `false` | the badge after the title — the old Grouped Data Row |
| `Count` | TEXT | `00` | |
| `Show action` | BOOLEAN | `false` | the trailing link — the old Data Table |
| `Action label` | TEXT | `Action` | |
| **`Body`** | INSTANCE_SWAP | `zf-accordion-note` | swap in a table, a form, a list |

**`Body` is the property that collapses four sets into one.** The old file made a new
component every time the content changed, so a table accordion and a message accordion
were unrelated objects that happened to look alike. A swap says the opposite: **the
disclosure is the component, and what it discloses is the consumer's business.**

`zf-accordion-note` is the default body — a centred `text/secondary` message with its
own `Message` property, standing in for the "No Contact Person found" state the
original used. A real data table goes in via the swap once a table component exists;
there isn't one in this file yet, which is now open item 22.

### 2.16.7 Selector strategy

```html
<div class="zf-accordion">
  <details class="zf-accordion-item" open>
    <summary>
      <span class="zf-accordion-item__title">Section title</span>
      <span class="zf-accordion-item__count">12</span>
      <button type="button" class="zf-accordion-item__action">Add contact</button>
      <svg class="zf-accordion-item__chevron" aria-hidden="true">…</svg>
    </summary>
    <div class="zf-accordion-item__body">…</div>
  </details>
</div>
```

| Figma | Markup | Why |
|---|---|---|
| `zf-accordion-item` | `<details>` | open, toggle and keyboard for free — **no state to manage** |
| header | `<summary>` | already a button, already focusable, already announces expanded |
| `Expanded` | the `open` attribute | not a class — the attribute *is* the state |
| `State=hover · focus · disabled` | `:hover` · `:focus-visible` · `[aria-disabled]` | `details` has no `disabled` |
| `Chevron` | `::marker` or an `<svg>`, `list-style: none` | rotate with a transform so it animates |
| `Body` | the rest of `<details>` | wrap it if you want a height transition |
| `Show action` | a `<button>` inside `<summary>` | **`stopPropagation`** |
| `zf-accordion` | a plain `div` with the border | one-at-a-time is the `name` attribute on `details` |

**The action inside a clickable header is the one real trap.** A button nested in a
`<summary>` inherits the toggle, so an "Add" action opens the section as a side effect.
It needs `stopPropagation`, and it needs its own accessible name — "Action" on its own
tells a screen-reader user nothing.

### 2.16.8 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Focus visible 2.4.7 | ✅ | 2px `focus/ring` at a 2px offset — **the header had no focus state** |
| Text contrast 1.4.3 | ✅ | title 15.15:1; body `text/secondary` 6.79:1 |
| Chevron contrast 1.4.11 | ✅ | `icon/default` 6.79:1 — was `#408DFB` on `#F9F9FB` at **3.24:1** |
| Keyboard 2.1.1 | ✅ | `details` / `summary` toggles on Enter and Space |
| Name, role, value 4.1.2 | ✅ | `summary` announces expanded/collapsed without any aria |
| Target size 2.5.8 | ✅ | the header is 42px tall and full width |
| Nested action | ⚠️ | needs its own name, and must not toggle the section |
| Disabled semantics | ⚠️ | `details` has no `disabled` — use `aria-disabled` and guard the click |

This is the first component in the file where the **native element supplies the entire
interaction model**. `details`/`summary` is focusable, keyboard-operable and
self-announcing; everything §2.14 and §2.15 had to specify by hand comes free here.
Worth saying out loud, because the temptation with an accordion is always to build it
from divs.

### 2.16.9 Traps worth recording

**An axis that toggles one child.** Six sections, an `Expanded` axis, and only the third
one moved. The other five carried hidden content no property could reach. Set every
axis to every value and count what changes — the failure is invisible in the default
state, which is the state everyone reviews.

**A group filed as a component.** Three sets were one accordion; the fourth was six of
them. Same page, same axis name, different unit.

**Colour drift you cannot see.** `#21263C` / `#21263D` and `#6C718A` / `#6B708A`, both
at **0.71 ΔE** — closer than any monitor or eye resolves. They spread to 34 and 10
nodes. This is the failure mode a token system exists for, and the only review that
catches it is a script.

**Two conventions, both correct.** The chevron disagreement looked like carelessness and
was not — each direction was right for the side it was on. The fix was to name the rule,
not to pick a winner. Worth checking for before "unifying" anything.

**`itemSpacing: -1`.** Used to collapse the doubled 1px borders where a header met a
table. It works, and it means every future change to either border has to remember the
overlap. One border on the container and dividers between children needs no arithmetic.

### 2.16.10 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | `Section List`'s `Expanded` axis toggled 1 of its 6 sections; the other five held unreachable hidden content. | **Done** — a group is `zf-accordion`, an item is `zf-accordion-item`, and every item toggles. | new sets |
| 2 | ✅ **resolved** | Four sets differed only in what their body contained. | **Done** — one item with a `Body` instance-swap. | `zf-accordion-item` |
| 3 | ✅ **resolved** | 111 solid paints, **zero bound**, 12 distinct raw values including two 0.71 ΔE pairs. | **Done** — 220 paints, all `ZF Semantic`, 0 raw, 0 remote. | all three |
| 4 | ✅ **resolved** | Collapsed and expanded were structurally different frames. | **Done** — one structure; the body's visibility is the state. | `zf-accordion-item` |
| 5 | ✅ **resolved** | The header had no hover, focus or disabled state. | **Done** — `State` × 4, with a 2px focus ring. | `zf-accordion-item` |
| 6 | ✅ **resolved** | Chevron direction contradicted itself across the four sets. | **Done** — `Chevron=leading` is right→down, `trailing` is down→up. | `zf-accordion-item` |
| 7 | ✅ **resolved** | Chevrons were rotated 4×4 vectors in three sets and a filled 6×6 in the fourth. | **Done** — `icon / chevron` instances at 1.25px. | Icons page |
| 8 | ✅ **resolved** | The chevron was `#408DFB` on `#F9F9FB` — 3.24:1, marginal for 1.4.11. | **Done** — `icon/default` at 6.79:1. | `zf-accordion-item` |
| 9 | ✅ **resolved** | `itemSpacing: -1` collapsed doubled 1px borders. | **Done** — one border on the group, dividers between items. | `zf-accordion` |
| 10 | ✅ **resolved** | `Bottom Spacer` — an empty 30px frame at the end of the expanded table. | **Done** — removed. | `zf-accordion-item` |
| 11 | ✅ **resolved** | Title size was 15 / 13 / 13 / 13 across the four sets. | **Done** — 13/20 Medium everywhere. | `zf-accordion-item` |
| 12 | ✅ **resolved** | The action was a hand-built link with a blue icon and a **dark** label. | **Done** — `icon / plus-circle` + `primary/text`, both link-coloured. | `zf-accordion-item` |
| 13 | ⚠️ **open** | The `Action` button inside the header will toggle the section unless the click is stopped. | Code requirement, plus a real accessible name. §2.16.7 | Implementation |
| 14 | ⚠️ **open** | There is **no table component** in this file, so a data-table body cannot be authored properly. | Author `zf-table`, then swap it into `Body`. The three original table bodies are waiting on it. | New component |
| 15 | ⚠️ **open** | `Accordion / Section Item` is a read-only library set, now unused. | Open item 16 — library ownership. | Library |

## 2.17 Side panel — `zf-sidebar`

**Figma:** page `side bar` → `zf-sidebar` (`42:27652`), `zf-sidebar-body` (`42:27619`)
**CSS class:** `.zf-sidebar`
**Axis:** `Footer` (2)

A drawer that slides in from the edge of the page, keeps the page behind it usable, and
closes without taking you anywhere.

**460 × 769 exactly, on both variants** — the size was the one thing about this
component that was already decided, so it is the one thing that did not move.

### 2.17.1 The two variants were not the same component

| | `Header=Default` | `Header=Grey` |
|---|---|---|
| Root sizing | **`FIXED/HUG`** | **`FIXED/FIXED`** |
| Body sizing | `FILL/FIXED` | `FILL/FILL` |
| Measured | 460 × 769 | 460 × 769 |

They measured the same, so nothing looked wrong. One was **pinned** at 769; the other
**hugged** to 769 because its contents happened to add up. The first time real content
went into either, they would have diverged — and the cause would have been three levels
down in a variant nobody was looking at.

Both are now `FIXED`, and the height is arithmetic rather than coincidence:
**50 + 719 = 769** with no footer, **50 + 654 + 65 = 769** with one.

### 2.17.2 An axis that names a colour

`Header` = `Default` / `Grey`. The **axis** is named after a part; its **values** name a
hex. Nothing anywhere says when a panel should be grey.

Compare `Warning Banners` (§2.13.1), a set named after one of its own values. Both are
the same failure: **the name records what was drawn, not what it means.** And it fails
both §3 tests — a header tint is not a dimension, and "grey" is not a state.

The tint is a fill, so it is now a boolean (`Tinted header`). That frees the axis for
`Footer`, which genuinely changes the layout: with a footer the body is 654px, without
it 719px.

### 2.17.3 What changed

| | Was | Now |
|---|---|---|
| **Size** | 460 × 769 | **460 × 769 — unchanged** |
| Axis | `Header` = Default / Grey | `Footer` = none / actions |
| Header tint | a whole variant | `Tinted header`, a boolean |
| Sizing | one `FIXED/HUG`, one `FIXED/FIXED` | both `FIXED` |
| Body sizing | `FILL/FIXED` and `FILL/FILL` | `layoutGrow: 1` |
| Close | a bare **11.55px** `Vector` filled **`Red/700`** | `icon / close` in a 28 × 28 target, `icon/default` |
| Header layout | `VERTICAL`, one child, **`itemSpacing: 246`** next to `SPACE_BETWEEN` | `HORIZONTAL`, title grows, close at the end |
| Shadows | **two** — panel and header, both offset (−2, 5) | one, offset **(−8, 0)** |
| Header separator | a shadow bleeding onto the content | a 1px `border/default` bottom edge |
| Paints | 12 solid, **0 bound to this file** — 7 raw, 5 remote | 32 paints, all semantic |
| Body | an empty clipped frame | a `Body` instance-swap |
| Footer | did not exist | `Footer=actions` with Button instances |
| Overlay | did not exist | `overlay/scrim`, the role §2.14.6 added |
| Title line-height | 16 / **25.6** — a 160% artefact | 16/24 |

### 2.17.4 Geometry

| | Value | Note |
|---|---|---|
| Panel | **460 × 769** | `FIXED` on both variants |
| Header | 50px | 20 left, 16 right, 12 gap, 1px `border/default` bottom |
| Body | fills what is left | `layoutGrow: 1` — 719px or 654px |
| Footer | 65px | 20 sides, 10 gap, 1px `border/default` top |
| Close target | **28 × 28** | the glyph is 16px; the target is what 2.5.8 measures |
| Title | Inter Medium **16/24** | |
| Shadow | `−8 0 32` at 12% | one, on the edge the panel slid from |

**The shadow direction is the tell that this is a right-hand drawer.** The original's
`(−2, 5)` pointed left *and* down — half right, and duplicated on the header where it
became a soft grey band across the top of the content.

### 2.17.5 Properties

| Property | Type | Default | Note |
|---|---|---|---|
| `Title` | TEXT | `Header label` | |
| `Show close` | BOOLEAN | **`true`** | a panel with no way out is a trap |
| `Tinted header` | BOOLEAN | `false` | `surface/sunken` — the old `Header=Grey` |
| `Body` | INSTANCE_SWAP | `zf-sidebar-body` | swap in a form, a list, a detail view |
| `primary` · `secondary` | exposed instances | Button | `Footer=actions` only |

### 2.17.6 Selector strategy

```html
<div class="zf-sidebar" role="dialog" aria-modal="false" aria-labelledby="p-title">
  <header class="zf-sidebar__header">
    <h2 id="p-title">Header label</h2>
    <button type="button" aria-label="Close panel">…</button>
  </header>
  <div class="zf-sidebar__body">…</div>
  <footer class="zf-sidebar__footer">
    <button class="zf-btn zf-btn--primary">Save</button>
    <button class="zf-btn zf-btn--secondary">Cancel</button>
  </footer>
</div>
```

| Figma | Markup | Why |
|---|---|---|
| `zf-sidebar` | `div[role=dialog] aria-modal="false"` | **the page behind stays usable** — that is what makes it a panel |
| `Title` | `aria-labelledby` → the `h2` | the accessible name must be the visible title |
| `Show close` | `button aria-label="Close panel"` | and Esc must do the same |
| `Footer=actions` | buttons **outside** the scroll area | so Save never scrolls out of reach |
| `Body` | `overflow-y: auto` | the body scrolls; the header and footer do not |
| `Tinted header` | a modifier class, or nothing | it carries no meaning, so it needs no state |
| `overlay/scrim` | optional | use it when the panel *is* modal — then `aria-modal` becomes `true` |
| Enter / exit | `transform: translateX` | animate the panel, **never its width** — width reflows the page |

**A side panel is the popover's behaviour at the modal's scale**: a dialog that does not
trap focus and does not dim the page. `aria-modal="false"` is the line that says so —
the same line that separates §2.15 from §2.14.

### 2.17.7 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Text contrast 1.4.3 | ✅ | title `text/default` 15.15:1 on both header surfaces |
| Target size 2.5.8 | ✅ | the close target is **28 × 28** — it was an 11.55px vector with no frame |
| Icon contrast 1.4.11 | ✅ | `icon/default` 6.79:1 |
| Colour meaning 1.4.1 | ✅ | close is neutral — red said "delete" |
| Dismissible 2.1.2 | ⚠️ | Esc must close it, and focus must return to whatever opened it |
| Focus management 2.4.3 | ⚠️ | move focus in on open; **do not trap** while `aria-modal` is false |
| Non-text contrast 1.4.11 | ❌ | header and footer rules are `border/default` at 1.31:1 — open item 12 |

**The red close is an accessibility issue, not a taste one.** §1.2 gives red a meaning —
danger — and §2.13.2 spent a whole section making sure shape carries tone so colour
would not have to lie. A red × on a panel that neither saves nor deletes tells everyone
who reads colour that this action is dangerous. Same category as the banner's warning
being red.

### 2.17.8 Traps worth recording

**Two variants, two sizing modes.** `FIXED/HUG` and `FIXED/FIXED`, both measuring
460 × 769. Nothing looked wrong because nothing *was* wrong yet. Check the sizing mode,
not the measurement — the measurement is what the sizing mode produced today.

**An axis that names a colour.** `Header = Default / Grey` records what was drawn rather
than what it means, and gives a consumer no basis for choosing.

**A dead gap next to space-between.** `itemSpacing: 246` alongside `SPACE_BETWEEN`.
Figma ignores the gap, so 246 does nothing — until someone changes the alignment, at
which point a number from an old drag suddenly takes effect. **Stale values in inactive
properties are landmines, not clutter.**

**A shadow used as a border.** The header carried its own drop shadow at 25%, which bled
onto the content below and read as a soft grey band. A 1px border is a boundary; a
shadow is elevation. The header is not floating above the panel — it is part of it.

### 2.17.9 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | `Header=Default` was `FIXED/HUG` and `Header=Grey` was `FIXED/FIXED`; their bodies were `FILL/FIXED` and `FILL/FILL`. | **Done** — both `FIXED` at 460 × 769; the body uses `layoutGrow: 1`. | `zf-sidebar` |
| 2 | ✅ **resolved** | The axis was `Header` = Default / Grey — a part name holding colour names. | **Done** — `Footer` = none / actions; the tint is a boolean. | `zf-sidebar` |
| 3 | ✅ **resolved** | The close was a bare 11.55px `Vector` — no frame, no hit area, 2.5.8 fail. | **Done** — 28 × 28 target with a 16px glyph. | `zf-sidebar` |
| 4 | ✅ **resolved** | The close was filled `Red/700` — danger colour on a non-destructive action. | **Done** — `icon/default`. | `zf-sidebar` |
| 5 | ✅ **resolved** | 12 solid paints, **0 bound to this file**: 7 raw, 5 on the remote legacy library. | **Done** — 32 paints, all `ZF Semantic`, 0 raw, 0 remote. | both |
| 6 | ✅ **resolved** | `Header Content` had `itemSpacing: 246` alongside `SPACE_BETWEEN`. | **Done** — a horizontal header with a growing title. | `zf-sidebar` |
| 7 | ✅ **resolved** | The header was a `VERTICAL` auto-layout holding a single child. | **Done** — `HORIZONTAL`. | `zf-sidebar` |
| 8 | ✅ **resolved** | Two drop shadows, both offset (−2, 5); the header's bled onto the content. | **Done** — one shadow at (−8, 0); the header uses a 1px border. | `zf-sidebar` |
| 9 | ✅ **resolved** | The body was an empty clipped frame with no slot. | **Done** — `Body` instance-swap with a placeholder. | `zf-sidebar-body` |
| 10 | ✅ **resolved** | No footer, so a panel that saves had nowhere to put Save. | **Done** — `Footer=actions`, Button instances, outside the scroll area. | `zf-sidebar` |
| 11 | ✅ **resolved** | Title line-height was 25.6px — a 160% artefact. | **Done** — 16/24. | `zf-sidebar` |
| 12 | ⚠️ **open** | Esc-to-close, focus-in on open and focus-return on close cannot be expressed in Figma. | Code requirement — see §2.17.6. | Implementation |
| 13 | ⚠️ **open** | The header and footer rules are `border/default` at 1.31:1. | Open item 12. | `ZF Semantic` |

## 2.18 Date range picker — `zf-date-range-picker`

**Figma:** page `Date Range Picker` → `zf-date-range-picker` (`43:30270`),
`zf-calendar-month` (`42:28712`), `zf-calendar-day` (`42:28682`),
`zf-preset-item` (`42:28711`)
**CSS class:** `.zf-daterange`
**Axes:** `Months` (2) × `Presets` (2) = 4

A dialog for picking a start and an end date: a rail of named ranges beside one or
two months, and a footer that states the range in words before you commit to it.

### 2.18.1 It was not a component, and it was not this design system

`Dialog - Date range picker` was a **`FRAME`**. No variants, no properties, nothing to
instance — nine levels of nested frames, every one of them named `Container`.

That was the smaller half of the finding. **All 204 of its solid paints were literal
hex: 0 bound, 0 remote.** And every one of them was a Tailwind v4 token.

| Raw hex | Tailwind v4 | Uses | Nearest ZF primitive | ΔE |
|---|---|---|---|---|
| `#DBEAFE` | `blue-100` | 78 | `color/blue/500` | 2.31 |
| `#1E2939` | `gray-800` | 77 | `color/neutral/1900` | 3.48 |
| `#155DFC` | `blue-600` | 16 | `color/blue/1400` | **18.73** |
| `#364153` | `gray-700` | 12 | `color/neutral/1600` | 3.55 |
| `#99A1AF` | `gray-400` | 6 | `color/neutral/1000` | 4.50 |

Those five are 189 of the 204. Across all eleven distinct values the median is
**ΔE 4.07**, and **only one of the eleven is inside ΔE 2** of anything ZF owns.

This is a different class of finding from everything before it in this file:

| | Distance | What it is |
|---|---|---|
| Accordion (§2.16) | 0.71 ΔE across 34 nodes | **drift** — below perception, invisible, harmless until it multiplies |
| Legacy library (§2.15, open item 21) | 58 ΔE on a shared name | **collision** — the right name pointing at the wrong scale |
| Date range picker | median 4.07 ΔE, 0 bound | **a second design system**, pasted in whole |

Drift shows up as near-misses. A foreign palette shows up as *nothing at all* —
because it is internally consistent, it renders as a finished, deliberate design. The
only signal is the bound-paint count, and that is one script.

It is now four component sets: **1,210 paints, all `ZF Semantic`, 0 raw, 0 remote.**

### 2.18.2 Overlap used as a layout tool

Day cells were **36 × 36, spaced 33.28px apart** — a **2.72px overlap on every cell**.

The reason is visible once you know it: the range band is the cell's own fill, and
with any gap at all the band breaks into 36px chunks. Overlapping the cells made it
continuous.

It also meant every cell partly covered its neighbour, so the hit areas were wrong by
2.72px, and no measurement anywhere in the grid was what it appeared to be.

**A zero-gap auto-layout row gets the same band honestly.** `itemSpacing: 0`
horizontally, `2` vertically; the band is continuous by construction and each cell owns
exactly the 36px it occupies.

### 2.18.3 The range needed five values, not one

There was **one selected cell** in the whole grid. A range picker that can draw a
range but cannot say where it starts.

`Range` is now five values, and it is a genuine dimension — a cell is exactly one of
them, and every one can co-occur with every `State`:

| `Range` | Band | Cap | Label |
|---|---|---|---|
| `none` | — | — | `text/default` |
| `start` | right half | ● | `primary/on-primary` |
| `middle` | full width | — | `text/default` |
| `end` | left half | ● | `primary/on-primary` |
| `single` | — | ● | `primary/on-primary` |

**The band is a half-cell rectangle on `start` and `end`, not a rounded cell fill.**
The first build filled the whole cell and rounded the outer corners, which put a 3px
ring of band on the *outside* of the start cap — a band pointing back at dates that
are not in the range. The half rectangle points only where the range goes.

`State` = `default` / `hover` / `focus` / `disabled` — 20 variants.

### 2.18.4 The preset rail

Eleven presets — Today through Previous Year — each a frame with
**`layoutMode: NONE` and its text absolutely placed.**

`Previous Quarter` was **52px tall in a rail of 32px items**. It was the only
`FIXED`/`FILL` child in the column, and its `TEXT` node had been dragged to 57px wide,
so the label wrapped to two lines and the item grew. One item out of eleven, three
levels down, in a rail nobody scrolls past.

**And no preset had a selected state**, so there was no way to show which range was
active — the thing a preset rail exists to do. `zf-preset-item` has four:

| `State` | Fill | Label |
|---|---|---|
| `default` | — | `text/secondary` |
| `hover` | `surface/hover` | `text/default` |
| `selected` | `primary/subtle` | `primary/text`, Medium |
| `focus` | `surface/hover` + 2px `focus/ring` | `text/default` |

### 2.18.5 Geometry

| | Value | Note |
|---|---|---|
| Day cell | **36 × 36** | 2.5.8 asks for 24 × 24 |
| Selected cap | 30px ellipse | absolutely centred, so it never affects the cell box |
| Week row gap | **0 horizontal**, 2 vertical | zero horizontal is what makes the band continuous |
| Month | **252 × 286** | 7 × 36 wide; header 28, weekday row 16, six week rows |
| Month gap | 24 | |
| Focus ring | **36 × 36**, 2px, inset | concentric with the 30px cap, a 2px gap, fully inside the cell |
| Preset item | 160 × 30 | padding 12 / 5, radius 6 |
| Rail | 176 wide | 8px padding, 1px `border/divider` right edge, fills the body height |
| Footer | 64 | 16 / 12 padding, 1px `border/divider` top edge |
| Card | radius 12, 1px `border/default`, `0 16 48` at 16% | the same elevation as §2.14 |
| Minimum width | **384** | below it the summary and the two buttons collide |
| Largest variant | 738 × 448 | `Months=2, Presets=on` |

**The focus ring is inset, not offset.** Open item 14 asks for a 2px ring at a 3px
offset; inside a 36px cell holding a 30px cap there is no 3px to give. A 40px ring at
−2 was the first build, and in a zero-gap week row it hung 4px over both neighbours —
so the ring of a focused Tuesday drew on top of Monday and Wednesday. It is now 36 × 36
with the stroke inside, which is the largest ring the cell can hold on its own.

Six week rows always, never five — a month grid that changes height between April and
May makes the dialog jump when you page through it.

### 2.18.6 Properties

| Property | Type | Default | Note |
|---|---|---|---|
| `Months` | VARIANT | `2` | one month or two; the dialog is 354px wider with two |
| `Presets` | VARIANT | `on` | the rail is 177px of chrome — a compact picker drops it |
| `Range summary` | TEXT | `10 Apr 2026 – 20 Apr 2026` | the range in words, before Apply |
| `primary` · `secondary` | exposed instances | Button | Apply and Cancel |
| `Month` | TEXT | `April 2026` | on `zf-calendar-month` |
| `Show prev` · `Show next` | BOOLEAN | `true` | see below |
| `Day` | TEXT | `15` | on `zf-calendar-day`; drives **both** labels |
| `Outside month` | BOOLEAN | `false` | §2.18.7 |
| `Label` | TEXT | `This Month` | on `zf-preset-item` |

**`Show prev` is bound to the chevron glyph, not to its 28px frame.** In a two-month
view the left month shows only a back arrow and the right only a forward one. Hiding
the whole button would collapse it out of the header's auto-layout and re-centre the
month name, so April and May would sit at different offsets. Hiding the glyph leaves
the frame as a spacer and both labels stay put.

The **range summary** was the one good idea in the source and it is kept: a picker
that shows two months of grid and a blue smear should still say, in words, what you
are about to apply.

### 2.18.7 `Outside month` is a role, not an opacity

The usual way to grey a leading or trailing day is `opacity: .4`. That produces a
colour nobody chose and a contrast ratio nobody measured — the source's outside days
came out at `#99A1AF`, which is **2.9:1**, a 1.4.3 fail on a cell you can still click.

`Outside month` instead shows a `surface/default` cover carrying the same number in
**`text/tertiary` — 4.52:1**, a stated role that passes. The `Day` text property drives
both labels, so there is one number to set, not two.

The cover is opaque, and that is deliberate: **an outside-month cell never carries the
range band.** The same date is drawn as a real cell in the adjacent month, so
highlighting it in both places would mean one date, two bands, and no way to tell which
grid owns it.

### 2.18.8 Selector strategy

```html
<div class="zf-daterange" role="dialog" aria-modal="true" aria-label="Choose a date range">
  <ul class="zf-daterange__presets">
    <li><button type="button" aria-pressed="true">This Month</button></li>
  </ul>
  <table role="grid" class="zf-cal">
    <caption>April 2026</caption>
    <tr><td><button aria-label="10 April 2026" aria-selected="true" class="is-start">10</button></td></tr>
  </table>
  <footer>
    <p aria-live="polite">10 Apr 2026 – 20 Apr 2026</p>
    <button class="zf-btn zf-btn--secondary">Cancel</button>
    <button class="zf-btn zf-btn--primary">Apply</button>
  </footer>
</div>
```

| Figma | Markup | Why |
|---|---|---|
| `zf-date-range-picker` | `div[role=dialog] aria-modal="true"` | it traps focus and Esc closes it — same contract as §2.14 |
| `zf-calendar-month` | `table[role=grid]` with a `caption` | a calendar **is** a table of dates; `role=grid` brings arrow-key navigation |
| `week-n` | `tr` | one row per week, always seven cells |
| `zf-calendar-day` | `td > button aria-label="10 April 2026"` | the visible label is `10`; the accessible name must carry month and year |
| `Range` = start · end | `aria-selected="true"` + `.is-start` / `.is-end` | shape carries the ends, `aria-selected` carries the meaning |
| `Range` = middle | `aria-selected="true"` `.in-range` | the band is decoration; the selection state is what is announced |
| `Outside month` | `.is-outside`, **still focusable** | clicking a trailing day should move the view, not do nothing |
| `Show prev` · `Show next` | `button aria-label="Previous month"` | a chevron with no name is unusable by voice or screen reader |
| `zf-preset-item` | `button` in a list, `aria-pressed` on the active one | presets set the range — they are toggles, not links |
| `Range summary` | `aria-live="polite"` | when a preset changes the range, say so; the grid update alone is silent |
| Roving tabindex | one cell in the tab order, arrows move within the grid | **42 tab stops per month is the most common date-picker failure** |

### 2.18.9 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Text contrast 1.4.3 | ✅ | days `text/default` 15.15:1; outside days and weekday heads `text/tertiary` 4.52:1 |
| Selected day 1.4.3 | ✅ | white on `primary/selected` **5.48:1** |
| In-range 1.4.3 | ✅ | `text/default` on `primary/subtle` 13.45:1 |
| Target size 2.5.8 | ✅ | days 36 × 36, presets 160 × 30, chevrons 28 × 28 |
| Focus visible 2.4.7 | ✅ | 2px `focus/ring` at 4.32:1, on days and presets alike |
| Colour meaning 1.4.1 | ✅ | blue now means *selected* only |
| Keyboard 2.1.1 | ⚠️ | roving tabindex, arrows, PageUp/Down for months, Esc to close — code only |
| Name, role, value 4.1.2 | ⚠️ | every cell needs a full date as its accessible name |
| Status messages 4.1.3 | ⚠️ | the summary must be a live region or a preset click is silent |
| Non-text contrast 1.4.11 | ❌ | the card border is `border/default` at 1.31:1 — open item 12 |

**The selected cap is the catch worth naming.** The obvious role for a selected day is
`primary/default`, which is white at **4.32:1** — below the 4.5:1 that 1.4.3 requires
for a 13px numeral. `primary/selected` exists for exactly this and reads **5.48:1**.
The pill hit the same wall in §2.8.3; the Button family still carries it as open item 17.
That is three components now. **A role that fails contrast is not a component bug the
third time it appears.**

The source used `#155DFC` for the weekday headers, the chevrons and the selected day
alike. When the only selected-state signal is a colour that three other things already
wear, colour has stopped carrying the state.

### 2.18.10 Traps worth recording

**A different design system, rendered perfectly.** 204 paints, 0 bound, all Tailwind.
Internally consistent, so it looks intentional. Drift you can spot by eye; a foreign
palette you cannot. Count the bound paints.

**Overlap used as a layout tool.** 36px cells 33.28px apart, to make a band
continuous. It works, and it makes every hit area and every measurement in the grid a
lie. When a geometry number is not a round one, something is being compensated for.

**`16777200`.** Figma's fully-rounded sentinel, on 77 cells. It is a real number that
behaves like a keyword, so it survives every copy and never looks wrong — until someone
resizes the cell and the radius silently stops being half the height.

**Nine levels of `Container`.** Nothing is broken by it and nothing can be found in it.
Naming is not decoration, it is addressing.

**`itemSpacing` next to `SPACE_BETWEEN`.** `161.171875` on the footer. Figma ignores
it, so it does nothing — until the alignment changes and a number from an old drag
takes effect. The same landmine as the side panel's `246` (§2.17.8), in a different
component, from a different author.

**One item sized differently.** `Previous Quarter` was 52px in a rail of 32px items —
the only `FIXED`/`FILL` child, its text dragged to 57px so the label wrapped. The
symptom was visible; the cause was three levels down and one item wide.

**Two roles, one value.** `primary/hover` and `primary/selected` both resolve to
`#2762D9`, so hovering an already-selected day changed nothing. Caught only by
resolving both and comparing — the bindings were correct, the names were distinct, and
the render was identical. See open item 24.

### 2.18.11 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | It was a `FRAME`, not a component — no variants, no properties, nothing to instance. | **Done** — four component sets. | `Dialog - Date range picker` |
| 2 | ✅ **resolved** | 204 solid paints, **0 bound, 0 remote** — every one a literal Tailwind v4 hex, median ΔE 4.07 from the ZF palette. | **Done** — 1,210 paints, all `ZF Semantic`, 0 raw, 0 remote. | all four sets |
| 3 | ✅ **resolved** | Nine levels of nested frames, all named `Container`. | **Done** — named parts throughout. | all four sets |
| 4 | ✅ **resolved** | Day cells 36 × 36 spaced **33.28px** apart — a 2.72px overlap per cell. | **Done** — zero-gap auto-layout row. | `zf-calendar-month` |
| 5 | ✅ **resolved** | `cornerRadius: 16777200` on 77 cells. | **Done** — stated radii: 18 on caps, half-cell bands on the ends. | `zf-calendar-day` |
| 6 | ✅ **resolved** | One selected cell; the range start had no cap and no state. | **Done** — `Range` × `State`, 20 variants. | `zf-calendar-day` |
| 7 | ✅ **resolved** | Weekday headers, chevrons and the selected day were all `#155DFC`. | **Done** — heads and chevrons neutral; blue means selected. | `zf-calendar-month` |
| 8 | ✅ **resolved** | The 11 rail items were frames with `layoutMode: NONE` and absolutely-placed text. | **Done** — instances in a vertical auto-layout. | `zf-preset-item` |
| 9 | ✅ **resolved** | No preset had a selected state. | **Done** — `default` · `hover` · `selected` · `focus`. | `zf-preset-item` |
| 10 | ✅ **resolved** | `Previous Quarter` was 52px in a rail of 32px items — the only `FIXED`/`FILL` child, text dragged to 57px. | **Done** — 160 × 30 like every other item; the label truncates. | `zf-preset-item` |
| 11 | ✅ **resolved** | The two-month container was `layoutMode: NONE` with a 0.92px divider. | **Done** — a 24px-gap auto-layout, no divider. | `zf-date-range-picker` |
| 12 | ✅ **resolved** | The footer carried `itemSpacing: 161.171875` alongside `SPACE_BETWEEN`. | **Done** — a growing summary and a hugging actions group. | `zf-date-range-picker` |
| 13 | ✅ **resolved** | Cancel and Apply were hand-built frames. | **Done** — Button instances, exposed. | `zf-date-range-picker` |
| 14 | ✅ **resolved** | Outside-month days were `#99A1AF` at 2.9:1 on a still-clickable cell. | **Done** — `text/tertiary` at 4.52:1, via a bound boolean. | `zf-calendar-day` |
| 15 | ✅ **resolved** | No compact form — the rail and the second month were not optional. | **Done** — `Months` × `Presets`. | `zf-date-range-picker` |
| 16 | ⚠️ **open** | `primary/hover` and `primary/selected` resolve to the same hex. | Open item 24. | `ZF Semantic` |
| 17 | ⚠️ **open** | Roving tabindex, arrow-key grid navigation, Esc and the live region cannot be expressed in Figma. | Code requirement — see §2.18.8. | Implementation |
| 18 | ⚠️ **open** | The card border is `border/default` at 1.31:1. | Open item 12. | `ZF Semantic` |

## 2.19 Breadcrumb — `zf-breadcrumb`

**Figma:** page `Bread Crum` → `zf-breadcrumb` (`52:32260`), `zf-crumb` (`50:32001`),
`zf-crumb-sep` (`52:32014`), `zf-trail-segment` (`53:32297`), `zf-step-trail` (`53:32298`)
**CSS class:** `.zf-breadcrumb`
**Axes:** `Size` (2) × `Separator` (2) × `Collapsed` (2) = 8

A trail that says where you are in a hierarchy, and lets you climb back out of it.

### 2.19.1 One axis held four components, and one of them was not a breadcrumb

`Bread crumb` had a single axis — `Property 1`, Figma's default name — carrying four
values. Read across the row: no two of them differ in only one thing.

| `Property 1` = | Scale | Chrome | Separator | Scheme | What it actually is |
|---|---|---|---|---|---|
| `Without band` | 36px chip | filled chip | 4×4 vector | light | a breadcrumb |
| `With Band` | 48px band | dark arrow tabs | the tab shape itself | **dark** | **a step trail** |
| `Section Navigation` | 15px text | none | 4×4 vector | light | a breadcrumb |
| `URl Navigation` | 15px text | none | a `/` **text node** | light | a breadcrumb |

Four dimensions fused into one axis: **scale, chrome, separator glyph and colour
scheme.** §3 asks whether a value from axis A can co-occur with a value from axis B — a
compact breadcrumb with slash separators is an obvious combination, and this axis could
not express it. It is now `Size` × `Separator` × `Collapsed`, which can.

**`With Band` left the set entirely.** It is a dark chevron trail — Learn ▸ Build ▸
Configure ▸ Publish with one segment lit. That is not a hierarchy, it is a sequence:

| | Breadcrumb | Step trail |
|---|---|---|
| Question | where am I **in the hierarchy** | where am I **in the sequence** |
| Markup | `nav[aria-label=Breadcrumb] > ol > li > a` | `ol[aria-label=Progress]`, `aria-current="step"` |
| Items | links, except the last | **not links** |
| Order | fixed by the tree | fixed by the flow |

**If two values need different HTML, they are different components.** That is the
sharpest form of the §3 axis test, and it is the one this set failed.

### 2.19.2 Four variants, four answers to the same question

Which crumb is the current page?

| Variant | Current crumb |
|---|---|
| `Without band` | the **first** |
| `With Band` | the **second** |
| `Section Navigation` | **none** |
| `URl Navigation` | the **last** ✅ |

Only one is right. A breadcrumb's entire contract is *the last item is where you are,
and it is not a link.*

The **order** disagreed too: `Without band` ran Learn → Build → Configure → Publish;
`With Band` ran Build → Learn → Configure → Publish. Same four labels, same component,
different sequence.

Each variant was drawn on a different day and nothing forced them to agree. **A set is
not a set until every variant answers the same questions the same way.**

### 2.19.3 The palette

43 solid paints, **0 bound**. Seven design values.

| Raw hex | Uses | Nearest ZF primitive | ΔE | Where |
|---|---|---|---|---|
| `#408DFB` | 12 | `color/blue/1100` | **10.69** | every icon, and the active trail segment |
| `#4C526C` | 10 | `color/neutral/1400` | 2.91 | link labels |
| `#21263C` | 6 | `color/blue/2000` | 3.26 | current label, and the "hover" trail segment |
| `#9391A2` | 6 | `color/neutral/1000` | 3.12 | the 4×4 chevron separators |
| `#FFFFFF` | 6 | `color/base/white` | 0.00 | labels inside the dark band |
| `#333850` | 1 | `color/neutral/1600` | 3.42 | the trail background |
| `#F1F1FA` | 1 | `color/neutral/400` | 0.35 | the current-page chip |

Median **3.26 ΔE**; only two of seven are inside 2 ΔE of anything ZF owns, one of which
is white. `#8A38F5` is excluded — that is Figma's own component-set outline, not a
design decision.

**`#408DFB` is the finding.** 10.69 ΔE from the nearest ZF blue, and this is its
**fourth** appearance: the Input Field (§2.5.3), the Wizard (§2.9.4), the Popup modal
(§2.14.1), now the Breadcrumb. It has stopped being a stray value and become an
**unowned fifth blue** — open item 25.

### 2.19.4 Everything it was built from is read-only

| Child set | Variants | Editable from `Tin-Tin`? |
|---|---|---|
| `no boand` | Active · Default · Hover | ❌ remote |
| `with band` | Default · **Ative** · Hover | ❌ remote |
| `Section nav states` | Default · Active | ❌ remote |
| `icon` | Learn · Build · Configure · Publish | ❌ remote |

All four are library sets with no page parent in this file. Not one of the defects below
could be corrected in place — which is why the rebuild is four **local** sets rather
than a set of patches. Open item 16 grows by four.

**And the typos ship.** `no boand`. `Property 1=Ative`. `URl Navigation`. A consumer
picking `Ative` from a dropdown cannot tell a typo from a distinct state, and cannot
fix it either.

### 2.19.5 The icons already existed, locally, in better slots

The `icon` set's four glyphs are **the same four the wizard uses** — and `icon / learn`,
`icon / build`, `icon / configure` and `icon / publish` were authored on the Icons page
during §2.9. The breadcrumb instanced **remote duplicates**.

| | Remote `icon` set | Local Icons page |
|---|---|---|
| Learn | 16 × **13.52** | 16 × 16 |
| Build | 16 × **12.71** | 16 × 16 |
| Configure | 16 × **14.56** | 16 × 16 |
| Publish | 16 × 16 | 16 × 16 |

Not one remote glyph sits in a square slot, which §1.7 requires — the frame is the
glyph's bounding box, so every icon lands at a different optical height.

**The separator was worse.** `Rectangle 11`, `Rectangle 12`, `Rectangle 13` — three
copies of a **4 × 4 vector with a 2px stroke** and a `MITER` join. That is a stroke
**half the size of its glyph**, where open item 11 puts the ratio at 1 : 9, and a sharp
spike at the vertex where §1.7 asks for round. It is now `icon / chevron` in a 16px slot
at 1.25px — 1 : 9.

**A by-product worth recording: the Icons page had no convention for its own default
paint.** Across 19 icons there were three strategies — one raw hex (`icon / search`),
seven on the **primitive** `color/neutral/1100`, and eleven on roles, split between
`text/secondary` and `text/tertiary`. All 19 now bind to **`icon/default`**. This is not
cosmetic: it is what made the swap bug in §2.19.10 silent.

### 2.19.6 The dark trail, rebuilt honestly

| | Was | Now |
|---|---|---|
| Container | `#333850` raw | `surface/inverse` |
| Segment — default | no fill | no fill (shows the container) |
| Segment — current | `#408DFB`, white label at **3.27:1** ❌ | `primary/selected`, white at **5.48:1** ✅ |
| Segment — hover | `#21263C` — **darker** than the band | `surface/inverse-hover` — **lighter** |
| Shape | one vector per segment, `Rectangle 184` **120px wide inside a 115px component** | `Shape` = `flat-start` / `notched` |
| Layout | `layoutMode: NONE`, absolute children | auto-layout, `itemSpacing: −14` |

**Hover went the wrong way.** On a dark surface, hover lightens — that is the whole
convention. The source darkened, which reads as *pressed* or *disabled*, and it was
being used as a resting appearance for the third segment rather than as a state at all.

**Two roles were missing, so they were added:** `surface/inverse` (Neutral 1900 in
Light, Neutral 300 in Dark) and `surface/inverse-hover` (Neutral 1700 / Neutral 400).
The system already had `text/inverse` and `icon/inverse` — **it had the foreground half
of an inverse pair and not the background half**, so every dark surface in the file was
a literal. It still has no inverse *border* role — open item 26.

### 2.19.7 Overlap, again — but this time it is legitimate

The band used **`itemSpacing: −2`**, and the active segment's vector was 120px wide
inside a 115px component, so the arrow point poked 5px into its neighbour. The overflow
was load-bearing.

§2.18.2 recorded overlap as a trap when the date picker used a 2.72px cell overlap to
fake a continuous range band. **This one is not the same.** The distinction is worth
stating:

- **Illegitimate** — overlap compensating for a gap the layout should not have had. A
  zero-gap auto-layout gives the same result honestly.
- **Legitimate** — overlap because the shapes genuinely interlock. A chevron trail's
  point *is* the next segment's notch; there is no non-overlapping way to draw it.

The test is whether removing the overlap breaks the *drawing* or only the *illusion*.
Here it breaks the drawing, so the trail keeps `itemSpacing: −14` — stated, round, and
equal to the notch depth rather than left over from a drag.

### 2.19.8 Geometry

| | `default` | `compact` | Note |
|---|---|---|---|
| Crumb height | 32 | 20 | padding 8 / 6 and 4 / 2 |
| Crumb radius | 6 | 4 | only ever painted on hover and focus |
| Label | Inter 13 / 20 | Inter 12 / 16 | Medium on the current crumb |
| Icon | 16 | 14 | off by default in compact |
| Gap — inside a crumb | 6 | 4 | |
| Gap — between crumbs | 2 | 2 | the separator carries the visual gap |
| Separator glyph | 16 | 14 | `icon / chevron` Direction=Right, or a `/` text node |
| Focus ring | 2px inset | 2px inset | a rectangle, not a stroke — §2.19.10 |
| Trail segment | 150 × 40 | — | fixed width; the notch is **14** |
| Trail | 566 × 48 | — | padding 4, radius 10, clipped, `itemSpacing: −14` |

Every text node in the source had **`lineHeight: AUTO`**. Not wrong, like the side
panel's 25.6px artefact (§2.17.3) — *unstated*, which is the version that survives
review because there is nothing to notice.

**The trail segment is a fixed width** because the notch is a vector and the angle has
to stay constant; scaling the vector would splay it. In CSS it is
`clip-path: polygon(…)` on a flex item and the width flows freely. That is a Figma
limitation being recorded, not a design decision.

### 2.19.9 Properties

| Property | Type | Default | Note |
|---|---|---|---|
| `Size` | VARIANT | `default` | 32px chips with icons, or a 20px text trail |
| `Separator` | VARIANT | `chevron` | chevron for hierarchy, slash for paths and URLs |
| `Collapsed` | VARIANT | `false` | first · … · parent · current |
| `State` | VARIANT | `default` | on `zf-crumb`: default · hover · **current** · focus |
| `Label` | TEXT | `Learn` | on `zf-crumb` and `zf-trail-segment` |
| `Show icon` | BOOLEAN | `true` | off by default at `Size=compact` |
| `Icon` | INSTANCE_SWAP | `icon / learn` | any glyph from the Icons page |
| `Glyph` | VARIANT | `chevron` | on `zf-crumb-sep` |
| `Shape` | VARIANT | `notched` | on `zf-trail-segment`: `flat-start` for the first |

**`Collapsed` is a real dimension, not a state.** It can co-occur with any `Size` and
any `Separator`, and it changes the layout rather than the appearance — which is exactly
the §3 test. The source had no collapse at all: no ellipsis, no max width, no overflow
behaviour, on any of the four variants. **Overflow is the hardest real problem a
breadcrumb has**, and it was the one thing not drawn.

### 2.19.10 Selector strategy

```html
<nav aria-label="Breadcrumb" class="zf-breadcrumb">
  <ol>
    <li><a href="/learn">Learn</a></li>
    <li><button aria-expanded="false" aria-haspopup="menu">…</button></li>
    <li><a href="/learn/configure">Configure</a></li>
    <li><span aria-current="page">Publish</span></li>
  </ol>
</nav>
```

| Figma | Markup | Why |
|---|---|---|
| `zf-breadcrumb` | `nav[aria-label="Breadcrumb"] > ol` | the landmark is how a screen-reader user skips to it or past it |
| `zf-crumb` | `li > a href` | one list item per level, in hierarchy order |
| `State=current` | `li > span aria-current="page"` — **no `a`** | you do not link to the page you are on |
| `zf-crumb-sep` | `li::after`, or an `aria-hidden` span | decoration — the list already carries the structure |
| `Separator=chevron` | a hierarchy: Learn › Build | use it when the crumbs are levels |
| `Separator=slash` | a path: docs / api / auth | use it when the crumbs are literal path segments |
| `Collapsed=true` | `button` "…" opening a menu | it reveals hidden levels, so it is a button, not a link |
| `Show icon` | `aria-hidden` svg inside the `a` | the label carries the name; the icon must not be read twice |
| `Size=compact` | a modifier class | 12px is a density choice, not a different control |
| `zf-step-trail` | `ol[aria-label="Progress"]`, `aria-current="step"` | a sequence, and the segments are **not links** |

**Collapse is measured, not authored.** Render the full trail, measure it, swap to the
collapsed form when it exceeds its box. The Figma boolean exists so a designer can show
both states — not so a developer ships two markups.

### 2.19.11 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Text contrast 1.4.3 | ✅ | links `text/secondary` 6.79:1; current `text/default` 15.15:1 |
| Separator 1.4.11 | ✅ | `text/tertiary` 4.52:1 — the source was `#9391A2` at **3.08:1** |
| Icon 1.4.11 | ✅ | `icon/default` 6.79:1 — the source was `#408DFB` at **3.27:1** |
| Trail 1.4.3 | ✅ | white on `surface/inverse` 15.15:1, on `primary/selected` 5.48:1 |
| Focus visible 2.4.7 | ✅ | 2px `focus/ring` at 4.32:1, and **the box does not change size** |
| Colour meaning 1.4.1 | ✅ | the current crumb is Medium weight as well as darker |
| Target size 2.5.8 | ⚠️ | a compact crumb is 20px — give the link 24px of padded hit area in code |
| Name, role, value 4.1.2 | ⚠️ | `aria-current="page"`, `aria-label` on the nav — code only |
| Keyboard 2.1.1 | ⚠️ | the overflow "…" is a menu button: Enter, Escape, arrow keys |

**The current-page chip was the real defect.** `#F1F1FA` on white is **1.12:1** — the
same number the segmented control's selected surface produced in §2.10, from the same
cause. It was also the *only* signal that a crumb was current, so removing colour left
the trail saying nothing at all: a 1.4.1 failure on top of a 1.4.11 one. Medium weight
plus `text/default` fixes both and costs nothing.

### 2.19.12 Traps worth recording

**A component set that is two components.** One axis held a breadcrumb and a step trail.
They look adjacent — both are horizontal rows of labelled steps. The tell is the markup:
`nav > ol` of links versus `ol` of non-links.

**Four variants, four answers.** Which crumb is current had four different answers in
one set. Nothing in Figma forces variants to agree, so nothing did.

**Typos in a read-only source.** `no boand`, `Ative`, `URl`. Remote means you read them
in a dropdown and cannot fix them.

**Duplicated icons that already existed locally.** Four glyphs Tin-Tin authored in
§2.9, re-instanced from a library in non-square slots.

**A stroke half the size of its glyph.** 4 × 4 vector, 2px stroke, mitred join.

**Instance swap renames the layer and drops its paint.** Swapping `Icon` reset every
bound fill to the source component's own default *and* renamed the layer from `icon` to
`icon / build` — so a rebind script matching on the name silently misses it. **Third
form of this trap in the file**; §2.10 and §2.18 have the others. The reason it was
silent here is §2.19.5: the fallback was a primitive grey that looked plausible.

**An `INSTANCE_SWAP` default needs a node id, not a key.**
`addComponentProperty(…, 'INSTANCE_SWAP', component.key)` throws *"Property value is
incompatible with component property type"*. It wants `component.id`. The key is a valid
40-character string, so the error reads like a type problem rather than a
wrong-identifier problem.

**An inset stroke still changes the box.** A 2px stroke with `strokeAlign: INSIDE` grew
a hugging auto-layout crumb from 73 × 32 to **77 × 36**. A focus ring that resizes its
own control moves everything after it. The ring is an absolutely-positioned rectangle
instead — the same fix §2.18.5 needed for the calendar day.

### 2.19.13 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | One axis, `Property 1`, carried four presentations differing in scale, chrome, separator and colour scheme. | **Done** — `Size` × `Separator` × `Collapsed`. | `Bread crumb` |
| 2 | ✅ **resolved** | `With Band` was a step trail inside a breadcrumb set. | **Done** — `zf-step-trail`, its own component. | `Bread crumb` |
| 3 | ✅ **resolved** | 43 solid paints, **0 bound**; median 3.26 ΔE. | **Done** — 162 paints, all roles, 0 raw, 0 primitive, 0 remote. | all sets |
| 4 | ✅ **resolved** | The current page was the first crumb, the second, none, and the last — one per variant. | **Done** — always last, always `State=current`. | `zf-breadcrumb` |
| 5 | ✅ **resolved** | Crumb order differed between variants. | **Done** — one order. | `zf-breadcrumb` |
| 6 | ✅ **resolved** | Current was signalled only by a `#F1F1FA` chip at 1.12:1. | **Done** — Medium weight and `text/default` at 15.15:1. | `zf-crumb` |
| 7 | ✅ **resolved** | Separators were three copies of a 4 × 4 vector, 2px mitred stroke, named `Rectangle 11/12/13`. | **Done** — `zf-crumb-sep`, `icon / chevron` at 1 : 9. | `zf-crumb-sep` |
| 8 | ✅ **resolved** | One variant used a `/` **text node** as its separator; the others used a vector. | **Done** — `Glyph` = chevron / slash, one component. | `zf-crumb-sep` |
| 9 | ✅ **resolved** | Icons were remote duplicates of four glyphs already on the Icons page, in non-square slots. | **Done** — local instances, 16 × 16. | `zf-crumb` |
| 10 | ✅ **resolved** | `lineHeight: AUTO` on every text node. | **Done** — 13/20 and 12/16. | all sets |
| 11 | ✅ **resolved** | Trail hover was **darker** than its container. | **Done** — `surface/inverse-hover`, lighter. | `zf-trail-segment` |
| 12 | ✅ **resolved** | The active trail label was white on `#408DFB` — **3.27:1**. | **Done** — `primary/selected`, 5.48:1. | `zf-trail-segment` |
| 13 | ✅ **resolved** | No dark-surface role existed, so the band was a literal. | **Done** — `surface/inverse` and `surface/inverse-hover` added. | `ZF Semantic` |
| 14 | ✅ **resolved** | No collapse, ellipsis or overflow behaviour on any variant. | **Done** — `Collapsed`, with an overflow crumb. | `zf-breadcrumb` |
| 15 | ✅ **resolved** | The Icons page used three different default-paint strategies across 19 icons. | **Done** — all bind to `icon/default`. | Icons page |
| 16 | ⚠️ **open** | `#408DFB`, 10.69 ΔE from the nearest ZF blue, now in four components. | Open item 25. | legacy library |
| 17 | ⚠️ **open** | The typos `no boand`, `Ative` and `URl Navigation` are in read-only sets. | Open item 16 — ownership. | legacy library |
| 18 | ⚠️ **open** | There is no inverse **border** role, so a dark surface cannot carry a divider. | Open item 26. | `ZF Semantic` |
| 19 | ⚠️ **open** | `aria-current`, the overflow menu button and collapse-on-measure cannot be expressed in Figma. | Code requirement — §2.19.10. | Implementation |

## 2.20 Sidebar navigation — `zf-sidebar-nav`

**Figma:** page `LHS Menu` → `zf-sidebar-nav` (`58:39920`), `zf-nav-item` (`58:39378`),
`zf-nav-parent` (`58:39205`), `zf-nav-collapsed-item` (`58:39451`),
`zf-nav-flyout` (`58:39524`), `zf-nav-section` (`58:39578`), `zf-nav-logo` (`58:39389`),
`zf-nav-collapse-toggle` (`58:39408`), `zf-logo-mark` (`58:42529`)
**CSS class:** `.zf-nav`
**Axes:** `View` (2) on the rail; `Indent` × `Active` × `State` (16) on the item;
`Open` × `Active` × `State` (16) on the parent

The left-hand rail, in full and collapsed form. It appears on every screen in the
product, so the two things it has to get exactly right are **the spacing grid every row
shares** and **the difference between a parent that contains the current page and the
page itself**.

### 2.20.1 A perfect bound-paint count, pointing at the wrong system

**803 solid paints. 755 bound — 94%, the best ratio of any component in this file.**

And not one of the 755 was bound to `ZF Semantic`. Every one pointed at a remote
library. §3's first check — count the bound paints — passes this component cleanly and
tells you nothing.

| | Popup modal §2.14 | Date picker §2.18 | Breadcrumb §2.19 | **LHS menu** |
|---|---|---|---|---|
| Solid paints | 36 | 204 | 43 | **803** |
| Bound | 0 | 0 | 0 | **755** |
| Bound to *this* file | 0 | 0 | 0 | **0** |

That is the sharper form of the rule: **count where they are bound to, not just whether
they are bound.** §3 now says so.

**34 read-only component sets fed one rail** — every atom, every icon, the logo, the
collapse control. Nothing in it could be corrected in place, which is why the rebuild is
eight local sets rather than a set of patches. Open item 16 grows again.

### 2.20.2 The spacing contract

You said the padding had to carry evenly. It did not. Four row types stacked directly on
each other put their labels in **three different places**:

| Row type | `padding-left` | Label x | |
|---|---|---|---|
| Parent — *Sales* | 10 | **58** | the reference |
| Leaf — *Home* | 24 | **58** | correct by coincidence — a different padding reaching the same place |
| Child — *Customers* | 46 | **56** | **2px LEFT of its own parent** |
| Leaf + badge — *Documents* | 26 | **60** | and its icon at 36 where every other icon was at 34 |
| Flyout row | 16 | 26 | while the flyout's own header sat at 20 |

26 rows, three alignments, 4px of spread. The one that reads as broken even when you
cannot measure it is the **child sitting 2px left of its parent** — a sub-item hanging
outside the thing it belongs to.

**The fix is one rule instead of four paddings.** Every row is:

| Slot | Width | Ends at | Filled with |
|---|---|---|---|
| padding-left | 10 | 10 | — |
| chevron slot | 14 | 24 | a 10px chevron on a parent, **empty on a leaf or child** |
| icon slot | 24 | 48 | a 16px icon + 8px gap, **empty on a child** |
| label | fills | — | **starts at 48 on every row type** |
| action slot | 20 | — | the hover-only plus, right-aligned |
| padding-right | 8 | — | — |

A slot is either filled or an **empty spacer of the same width**. That makes the
alignment structural rather than arithmetic: verified on all **32** variants of
`zf-nav-item` and `zf-nav-parent`, label x = 48, no exceptions. The flyout's header and
its rows both land at 27.

### 2.20.3 Parent active is not item active

You asked for two different colours. The source had two treatments — but the parent's
*was the hover token*, so a hovered row and the active section were the same pixel.

| | Source | Now |
|---|---|---|
| Leaf / child active | `Primary` fill, white label | `brand/solid` + `brand/on-solid` |
| Parent active | **`Hover State- Not Active`** | `nav/item-selected` + Semi Bold — **no bar, no icon recolour** |
| Hover | `Hover State- Not Active` | `nav/item-hover` |
| Selected vs hover | **identical** | bar + weight |
| Parent active while closed | **impossible** — active *was* `State=Open` | `Open` × `Active`, independent |
| Collapsed rail active | **identical to hover**, with no bar and no weight change | `brand/solid` |

Two things follow from this.

**`nav/item-selected` against `nav/item-hover` was 1.10:1** — so the tint alone could not
carry the state. §2.20.5 moves it two steps from the pane instead of one, which raises
that to 1.28:1 on light and 1.55:1 on dark. Your design settles what does: **no left stroke and no icon recolour**,
which leaves **weight** as the distinguishing mark, and the distinct tint as support. The
first build added a 3px `brand/accent` bar and tinted the parent's icon; both are removed.

That leaves 1.4.1 partly unmet — weight is a real, non-colour signal, but a 1.10:1 tint
difference is not one, so a user who cannot perceive weight difference at 13px has little
to go on. The cheapest fix, if you want it, is **one value**: move `nav/item-selected` a
step further from `nav/item-hover` (Neutral 700 in Light, Neutral 1500 in Dark) and the
separation becomes visible without adding any new shape. That is open item 30.

**The parent could not say "the current page is inside me" while closed.** Because
active was expressed as `Open`, collapsing a group erased the only trace of where you
were. `Open` and `Active` are now independent axes, which is what the §3 test says they
must be: a closed parent containing the current page is a real, common state.

### 2.20.4 Modes multiply exactly like variants

The rail is themed through a remote collection called `Color Modes` with four modes:
`LightPane-Blue`, `DarkPane-Blue`, `LightPane-Red`, `DarkPane-Red`. That is **two
dimensions fused into one mode axis** — pane lightness × brand hue.

Of its 12 live tokens:

| Varies with | Count | Consequence |
|---|---|---|
| pane only | 5 | duplicated across both hues |
| hue only | 3 | duplicated across both panes |
| neither | 2 | duplicated four times |
| both | 1 | **already inconsistent** |
| nothing at all | 1 | `mauve/11` — a Radix name with no value in any mode, still bound on two nodes |

**Two thirds of the table was duplicated data**, and the one token that genuinely varied
on both had already drifted: `Hover-pressing LHS` is `#DCDDFB` / `#282F50` / `#D5D5E5` /
`#282F50` — hue-tinted in the light panes, but `DarkPane-Red` reuses the Blue value,
because nobody has to keep four cells in step when the tool does not make them.

It is now **two collections**:

| Group | Varies with | Lives in |
|---|---|---|
| `nav/surface` · `item-hover` · `item-selected` · `item-pressed` | pane | `ZF Semantic` (Light / Dark) |
| `nav/text` · `text-secondary` · `text-tertiary` · `border` | pane | `ZF Semantic` |
| `brand/solid` · `solid-hover` · `solid-pressed` · `accent` | hue | **`ZF Brand` (Blue / Red)** |
| `brand/on-solid` · `nav/brand-text` · `nav/brand-surface` | neither | constant |

The same instance now renders all four combinations, and **a third hue costs one mode
and five values instead of four modes and twelve.** This is the "one axis, one
dimension" rule applied to variable collections rather than component sets — the first
time this file has met it there. §3 now carries it.

`nav/brand-surface` and `nav/brand-text` are the pair the logo band needs: it is dark in
*both* panes, so it must not flip. Binding its label to `text/inverse` produced dark
text on a dark band the moment Dark mode was applied — caught only by rendering all four
combinations side by side.

### 2.20.5 Every colour, traced to the palette

Each nav and brand role, the source token it replaces, the ZF primitive it now resolves
to, and the CIELAB distance between them.

| Role | Mode | Source token | ZF primitive | ΔE |
|---|---|---|---|---|
| `nav/surface` | Light | `LHS Pane Colors` `#F7F7FE` | `neutral/300` `#F5F6FC` | **0.76** |
| `nav/surface` | Dark | `LHS Pane Colors` `#21263C` | `neutral/1900` `#222536` | **3.52** |
| `nav/item-hover` | Light | `Hover State- Not Active` `#EAEAFB` | `neutral/500` `#E9EAF5` | **3.13** |
| `nav/item-hover` | Dark | `Hover State- Not Active` `#333850` | `neutral/1700` `#2D3145` | **4.04** |
| `nav/item-selected` | Light | *(reused the hover token)* | `neutral/700` `#CED0DE` | 9.57 |
| `nav/item-selected` | Dark | *(reused the hover token)* | `neutral/1500` `#4A4D63` | 9.48 |
| `nav/item-pressed` | Light | `Hover-pressing LHS` `#DCDDFB` | `neutral/800` `#C3C5D4` | 11.90 |
| `nav/item-pressed` | Dark | `Hover-pressing LHS` `#282F50` | `neutral/1400` `#51556B` | 18.50 |
| `nav/text` | Light | `Text Primary LHS` `#181C2E` | `blue/2100` `#161E2E` | **2.40** |
| `nav/text` | Dark | `Text Primary LHS` `#EBEAF2` | `neutral/500` `#E9EAF5` | **1.69** |
| `nav/text-secondary` | Light | `Text Secondary LHS` `#434C69` | `neutral/1500` `#4A4D63` | **4.82** |
| `nav/text-secondary` | Dark | `Text Secondary LHS` `#ADAEBA` | `neutral/900` `#AEB1C2` | **2.98** |
| `nav/text-tertiary` | Light | `Teritary-color` `#838195` | `neutral/1200` `#6A6E85` | 8.44 |
| `nav/text-tertiary` | Dark | `Teritary-color` `#838195` | `neutral/1000` `#9598AB` | 8.67 |
| `nav/brand-surface` | both | *raw hex* `#181C2E` | `blue/2100` `#161E2E` | **2.40** |
| `brand/solid` | Blue | `Primary` `#1B6DE0` | `blue/1300` `#2762D9` | 6.26 |
| `brand/solid` | Red | `Primary` `#F8525A` | `red/1200` `#C9474F` | 16.94 |
| `brand/solid-hover` | Blue | `Primary-On Hover` `#4E8FEA` | `blue/1400` `#1C5BD9` | 31.95 |
| `brand/solid-hover` | Red | `Primary-On Hover` `#CC434A` | `red/1300` `#B2343C` | 7.97 |
| `brand/solid-pressed` | Blue | `Primary On Press` `#1B4C91` | `blue/1600` `#1A4291` | 8.81 |
| `brand/solid-pressed` | Red | `Primary On Press` `#B83D43` | `red/1400` `#B22D36` | 5.92 |

Eleven of the twenty-one rows are inside ΔE 5. **Every row outside it is a deliberate
choice, not a rounding artefact**, and there are three reasons.

**Contrast.** `brand/solid` in Red is 16.94 away because `#F8525A` puts white at
**3.31:1** and fails 1.4.3; `red/1200` is the nearest step that passes, at 4.67:1.
`brand/solid-hover` in Blue is 31.95 away for the same reason — `#4E8FEA` reads
**3.26:1**, so hovering an active row made it *less* legible. The ladder now darkens
instead of lightening. `Teritary-color` is 8.4 away because `#838195` reads 3.55:1 on the
light pane and 3.94:1 on the dark, below 4.5:1 in both.

**A ladder that has to be monotonic.** The two `nav/item-pressed` rows are the furthest
non-contrast deviations, and the reason is that the source's four tints did not run in the
same direction in both panes:

| | Light | Dark |
|---|---|---|
| Source order | pane → hover → **pressed** | pane → **pressed** → hover |
| Effect | pressing darkens | pressing *lightens*, and lands between pane and hover |

So pressing a row moved it one way in the light theme and the other way in the dark. The
four tints are now one ladder in both panes — **pane → hover → selected → pressed**, each
one step further from the surface — which is why pressed lands on a neutral step rather
than the source's blue-tinted one.

**A collision.** `nav/item-selected` no longer borrows the hover token. It sits two steps
from the pane instead of one, which lifts selected-versus-hover from **1.10:1** to
**1.28:1** on light and **1.55:1** on dark, and closes open item 30. This is the one place
the rail reads slightly stronger than your drawing — the parent-active band is a touch
darker. One value reverts it to `neutral/600` if you want it subtler; at that step it is
1.10:1 and effectively invisible again.

### 2.20.5 A hard cap hidden in a boolean list

`LHS-Parent-Child` carried **`Child Menu 1` through `Child Menu 25`** — twenty-five
boolean properties.

- A group with 26 children was **unbuildable**.
- A group with 3 children still shipped **22 hidden rows** in every instance.
- The properties panel showed 25 toggles for one menu group.

**A cap expressed as booleans looks like flexibility.** There is no cap now: children
are ordinary instances in the group frame, and the count is whatever the product needs.

### 2.20.6 Geometry

| | `full` | `collapsed` | Note |
|---|---|---|---|
| Rail width | **220** | **72** | fixed; height fills the viewport |
| Logo band | 220 × 48 | 72 × 48 | `nav/brand-surface` — dark in both panes |
| Row | 200 × 30 | 56 × 58 | radius 6 |
| Row gap | 2 | 8 | |
| Body padding | 10 sides, 14 top/bottom | 8 sides, 10 top/bottom | |
| Section gap | 14 | — | |
| Label | Inter Medium **13 / 20** | Inter Regular **10 / 12** | every source text node was `lineHeight: AUTO` |
| Icon | 16 | 16 | in a 42 × 24 box when collapsed |
| Chevron | 10 in a 14 slot | — | |
| Flyout | 220 wide, padding 16 / 10, gap 10 | — | radius 10, 1px `nav/border`, `0 8 24` at 16% |
| Collapse toggle | **40 × 40 corner tab** | **72 × 40 full-width strip** | flush bottom-right / bottom; radius `6 0 0 0` and `0`; arrow **left** when full, **right** when collapsed |

The collapsed label still truncates at 42px — *Filing…*, *Custo…*, *Invent…* — because
that is how it is drawn, and you chose to keep it. §2.20.9 records what code has to do
about it.

### 2.20.7 Properties

| Property | Type | Default | On |
|---|---|---|---|
| `View` | VARIANT | `full` | `zf-sidebar-nav` |
| `Indent` | VARIANT | `rail` | `zf-nav-item` — `rail` keeps the slot grid, `flush` is for the flyout |
| `Active` | VARIANT | `false` | item · parent · collapsed item |
| `Open` | VARIANT | `false` | `zf-nav-parent` — **independent of `Active`** |
| `State` | VARIANT | `default` | `default` · `hover` · `pressed` · `focus` |
| `View` | VARIANT | `full` | `zf-nav-collapse-toggle` — replaces the first build's `Direction`, which was never independent of the view |
| `Label` | TEXT | `Home` | every row |
| `Show icon` | BOOLEAN | `true` | off makes a rail row a child; off in `flush` removes the slot |
| `Icon` | INSTANCE_SWAP | `icon / home` | any glyph on the Icons page |
| `Show action` | BOOLEAN | `false` | the hover-only plus |
| `Show badge` · `Badge` | BOOLEAN · TEXT | `false` · `999 M+` | |
| `Has submenu` | BOOLEAN | `true` | `zf-nav-collapsed-item` — the corner triangle that says a flyout will open |
| `Header` · `Show header` | TEXT · BOOLEAN | `Apps` · `true` | section and flyout |
| `Product name` · `Mark` | TEXT · INSTANCE_SWAP | `Books` · `Product=books` | `zf-nav-logo` |
| `Product` | VARIANT | `books` | `zf-logo-mark` — `books` · `billing` · `erp` |

**`zf-logo-mark` carries the real marks.** You supplied three — Books, Billing and ERP —
and they are re-authored locally as one set with a `Product` axis at 24 × 24. `zf-nav-logo`
takes any of them through its `Mark` swap, so adding a product later is one more variant
and nothing else in the rail moves. That is the separate logo component you asked for.

All three are **monochrome white glyphs**, so their fills are bound to `nav/brand-text` —
the same role as the product name — and they stay correct on the dark band in both panes.
Left as raw `#FFFFFF` they would have been right by luck rather than by rule. A
*multi-coloured* brand mark would be the exception: its colours belong to the brand, not
to the system, and would stay literal — the same carve-out §2.12 makes for the colour
picker's swatches.

Two things came off the marks in the process. Each arrived with a `Size` axis
(`Default` / `L`, and `Default` / `Variant2` on the ERP mark) whose two values were
**geometrically identical at 24 × 24** — an axis that costs a dimension and can never
change anything. And the source's brand row carried `padding: 12, 64, 12, 16`; the 64px
right padding is why the header looked off-centre against every row below it. It is 16
both sides now.

The collapsed logo **never** shows the product name: its text layer is hidden inside the
variant rather than bound to `Show product name`, so the boolean cannot accidentally
reveal a name in a 72px column.

### 2.20.8 Selector strategy

```html
<nav aria-label="Main" class="zf-nav">
  <ul>
    <li><a href="/home">Home</a></li>
    <li>
      <button aria-expanded="true" aria-controls="g-sales" class="is-within">Sales</button>
      <ul id="g-sales">
        <li><a href="/sales/retainer" aria-current="page">Retainer Invoices</a></li>
      </ul>
    </li>
  </ul>
  <button aria-expanded="true" aria-controls="nav-body">Collapse</button>
</nav>
```

| Figma | Markup | Why |
|---|---|---|
| `zf-sidebar-nav` | `nav[aria-label="Main"] > ul` | one landmark; the rail is the primary one |
| `zf-nav-item` | `li > a href` | a leaf navigates |
| `Active=true` | `a aria-current="page"` | the only place `aria-current` belongs |
| `zf-nav-parent` | `li > button aria-expanded aria-controls` | a parent discloses; it does not navigate |
| `Open` | `aria-expanded` | the chevron is decoration |
| `Active` on a parent | `.is-within` — **no `aria-current`** | it *contains* the current page |
| `zf-nav-section` | `li > h3 + ul`, or `ul[aria-labelledby]` | a named group needs a heading |
| `zf-nav-collapsed-item` | `a` with `aria-label` + a tooltip | the visible stub is truncated |
| `zf-nav-flyout` | `div[role=menu] > [role=menuitem]` | a menu, not a dialog |
| `View` | a class on the nav | one component, two widths — **not two navs** |
| `zf-nav-collapse-toggle` | `button aria-expanded aria-controls="nav"` | and the choice persists across sessions |
| `Show action` | `button aria-label="Add…"` inside the `li` | a second control needs its own name and tab stop |
| `Show badge` | `span` with visually-hidden text | "12" alone says nothing; "12 unread" does |

Two rules that only bite at scale. **One landmark:** if the rail is
`nav[aria-label="Main"]`, nothing else on the page may be an unlabelled `nav`, or a
screen-reader user gets a list of identical "navigation" entries. **The collapsed rail
must not become a second tab order:** collapsing changes the width, not the sequence, so
the same stops appear in the same order in both views.

### 2.20.9 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Text 1.4.3 — light pane | ✅ | `nav/text` 14.05:1, secondary 6.30:1, tertiary **4.66:1** |
| Text 1.4.3 — dark pane | ✅ | `nav/text` 12.66:1, secondary 7.12:1, tertiary 5.31:1 |
| Active label 1.4.3 — Blue | ✅ | white on `brand/solid` **5.48:1** (source 4.87:1) |
| Active label 1.4.3 — Red | ✅ | white on `brand/solid` **4.67:1** — the source's `#F8525A` was **3.31:1** and failed |
| Active bar 1.4.11 | ✅ | `brand/accent` 4.00:1 light / 3.51:1 dark; red 4.33 / 3.25 |
| Focus visible 2.4.7 | ✅ | 2px ring; `focus/ring` on tints, `brand/on-solid` on solid fills; **the box never resizes** |
| Colour meaning 1.4.1 | ✅ | parent active carries a bar and Semi Bold as well as a tint |
| Target size 2.5.8 | ✅ | rows 200 × 30, collapsed 56 × 58, toggle 40 × 40 |
| Hover direction | ✅ | hover lightens on **both** panes — the source darkened on dark |
| Name, role, value 4.1.2 | ⚠️ | `aria-expanded`, `aria-current`, `aria-controls` — code only |
| Keyboard 2.1.1 | ⚠️ | the flyout needs arrow keys and Escape |
| Collapsed label | ⚠️ | *Filing…* and *Custo…* are ambiguous by sight — the tooltip and `aria-label` **must** carry the full name |

**Three source values failed, and the third is the interesting one.**

`Teritary-color` `#838195` was **3.55:1** on the light pane and **3.94:1** on the dark —
a section-header colour below 4.5:1 in both. `Primary-On Hover` `#4E8FEA` put white at
**3.26:1**, so hovering an active row made it *less* readable, not more — the same
wrong-direction hover as §2.19.6.

And **the red theme failed where the blue passed.** `#1B6DE0` gives white 4.87:1;
`#F8525A` gives 3.31:1. The hue swap changed the colour without checking the luminance —
which is the exact hazard of putting hue and pane on one mode axis, because nothing in
the table invites you to compare the two hues at the same pane.

### 2.20.10 Traps worth recording

**A perfect bound-paint count pointing at the wrong system.** 755 of 803 bound, 0 to
this file. The count is necessary and not sufficient.

**Modes multiply exactly like variants.** Pane × hue on one axis, two thirds duplicated,
and the one genuinely two-dimensional token already inconsistent.

**A hard cap hidden in a boolean list.** `Child Menu 1…25`.

**Active borrowed from hover.** And the two neutral tints are 1.10:1 apart, so even a
distinct token would have been invisible. It only shows up with a pointer, which is why
static review never catches it.

**Four paddings reaching for one grid.** 10 · 24 · 26 · 46 → labels at 58 · 58 · 56 · 60,
two of them agreeing by coincidence.

**State axes named one letter apart.** `State` = Open/Closed and `States` =
Default/While Pressing, on the same set, adjacent in the panel.

**An axis with one value.** `Type` = `Parent`, and nothing else, ever.

**Context as a variant.** `Used In` = `Child` / `Popovers` names the container the row
happens to sit in. What differs is the indent, which is a layout property — so it is now
`Indent` = `rail` / `flush`, and a third container needs no new value.

**Icons carrying their own size scale.** 20 remote sets × 6 t-shirt sizes; the axis
called `Property 1` on eighteen and `Icon Sizes` on one; values `l/m/s/xl/xs/xxl` with
one stray capital `L`; and every glyph drawn on a **14px** grid then displayed at 16.
Re-authored as 16 local `icon / *` components at 16 × 16, glyph centred to 0.00.

**One wrapper, four names.** The same layer was called `Icon and Label Container`,
`Icon Container` and `Icon and Label` across four variants of one set, which silently
breaks Figma's override matching — change a label on one variant and it does not carry.

**Dead values in inactive properties, again.** `itemSpacing: 100` and `itemSpacing: 10`
on single-child frames. Same landmine as §2.17.8 and §2.18.10.

**And one I got wrong.** I also called the 56 × 6 frame at the bottom of each collapsed
item a dead spacer. It is not. It holds a **5.89px corner triangle** marking *this opens a
flyout* — the only signal in the 72px rail about which items have children. Dropping it
removed that signal, and the rebuild had to be corrected. **A frame that measures like
padding can still be doing work**, and "I cannot see what this is for" is not the same as
"this is for nothing." The marker is now a `Has submenu` boolean, on for the eight parents
and off for the six leaves.

### 2.20.11 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | 803 solid paints, 755 bound — **every one to a remote library, none to `ZF Semantic`**. | **Done** — 389 paints, all `ZF Semantic` / `ZF Brand`, 0 raw, 0 primitive, 0 remote. | all 8 sets |
| 2 | ✅ **resolved** | 34 read-only sets fed one rail. | **Done** — 8 local sets + 16 local icons. | all |
| 3 | ✅ **resolved** | Label x was 58 · 58 · 56 · 60 across four row types; the child sat 2px left of its parent. | **Done** — a slot grid; label x = 48 on all 32 variants. | item · parent |
| 4 | ✅ **resolved** | Parent active used the hover token, and the two tints are 1.10:1 apart. | **Done** — `nav/item-selected` + `brand/accent` bar + Semi Bold. | `zf-nav-parent` |
| 5 | ✅ **resolved** | Parent active was expressed as `State=Open`, so a closed group could not show it. | **Done** — `Open` × `Active`. | `zf-nav-parent` |
| 6 | ✅ **resolved** | Collapsed-rail active was identical to hover, with no other signal. | **Done** — `brand/solid`, matching the expanded leaf. | `zf-nav-collapsed-item` |
| 7 | ✅ **resolved** | `Color Modes` fused pane × hue into 4 modes; 8 of 12 tokens duplicated. | **Done** — `ZF Semantic` Light/Dark × new **`ZF Brand`** Blue/Red. | variables |
| 8 | ✅ **resolved** | `LHS-Parent-Child` had 25 `Child Menu` booleans — a hard cap and 22 hidden rows per instance. | **Done** — no cap; children are instances. | `zf-sidebar-nav` |
| 9 | ✅ **resolved** | `State` mixed the row with its plus button (`Plus Hover`, `->Press plus`). | **Done** — `State` is the row; the plus is a slot. | item |
| 10 | ✅ **resolved** | `LHS-Collapse-Controls` had axes `State` and `States`. | **Done** — `Direction` × `State`. | toggle |
| 11 | ✅ **resolved** | `LHS-Parent-Menu` had `Type` with one value. | **Done** — removed. | parent |
| 12 | ✅ **resolved** | `LHS-Child` had `Used In` = Child / Popovers — a place, not a property. | **Done** — `Indent` = rail / flush. | item |
| 13 | ✅ **resolved** | 20 remote icon sets × 6 t-shirt sizes, drawn at 14 and shown at 16. | **Done** — 16 local 16 × 16 components. | Icons page |
| 14 | ✅ **resolved** | `Teritary-color` was 3.55:1 light and 3.94:1 dark. | **Done** — `nav/text-tertiary` at 4.66 / 5.31. | `ZF Semantic` |
| 15 | ✅ **resolved** | `Primary-On Hover` put white at 3.26:1 — hover reduced contrast. | **Done** — hover darkens the solid; 5.92:1. | `ZF Brand` |
| 16 | ✅ **resolved** | The Red theme failed 1.4.3 where Blue passed (3.31:1 vs 4.87:1). | **Done** — `red/1200`, 4.67:1. | `ZF Brand` |
| 17 | ✅ **resolved** | Flyout header at 20, its own rows at 26. | **Done** — both at 27. | `zf-nav-flyout` |
| 18 | ✅ **resolved** | `lineHeight: AUTO` on every text node. | **Done** — 13/20 and 10/12. | all |
| 19 | ✅ **resolved** | One wrapper layer had three names across four variants. | **Done** — one name per layer. | collapsed item |
| 20 | ✅ **resolved** | Dead values: `itemSpacing` 100 and 10 on single-child frames, a 56 × 6 spacer. | **Done** — removed. | rail |
| 21 | ✅ **resolved** | Typos `no boand`, `Ative`, `URl`, `Teritary-color`. | **Done** — new names. | all |
| 22 | ⚠️ **open** | `mauve/11` — a Radix token with no value in any of the four modes, bound on two nodes. | Dead in the remote library; nothing to fix locally. Open item 27. | `Color Modes` |
| 23 | ⚠️ **open** | Collapsed labels truncate to ambiguous stubs (*Filing…*, *Custo…*). | **Your decision, taken:** keep as drawn. Code must supply a tooltip and `aria-label`. Open item 28. | `zf-nav-collapsed-item` |
| 24 | ⚠️ **open** | `ZF Brand` carries Blue and Red because that is what the source had. | Confirm the full hue set before this ships. Open item 29. | `ZF Brand` |
| 25 | ✅ **resolved** | The three product marks arrived with a `Size` axis whose two values were identical at 24 × 24, and raw `#FFFFFF` fills. | **Done** — one `Product` axis; fills bound to `nav/brand-text`. | `zf-logo-mark` |
| 26 | ✅ **resolved** | The brand row had `padding: 12, 64, 12, 16` — a 64px right inset that pushed the header off the rail's grid. | **Done** — 16 both sides. | `zf-nav-logo` |
| 27 | ✅ **resolved** | The collapse toggle was a left-aligned 40 × 40 in both views, with the arrow directions inverted. | **Done** — 40 × 40 corner tab bottom-right in full (radius `6 0 0 0`, arrow left); 72 × 40 full-width strip in collapsed (arrow right). Matches your reference exactly. | `zf-nav-collapse-toggle` |
| 28 | ✅ **resolved** | The first build added a `brand/accent` left bar and recoloured the parent icon — neither is in your design. | **Done** — removed; weight and tint carry parent-active. | `zf-nav-parent` |
| 29 | ✅ **resolved** | **My error:** I read the 56 × 6 frame on each collapsed item as a dead spacer and dropped it. It is the has-submenu corner marker. | **Done** — `Has submenu` boolean, on for the 8 parents, off for the 6 leaves. | `zf-nav-collapsed-item` |
| 30 | ⚠️ **open** | `aria-expanded`, `aria-current`, roving keys in the flyout, and persisting the collapsed choice. | Code requirement — §2.20.8. | Implementation |

## 2.21 Top bar — `zf-topbar`

**Figma:** page `Top bar` → `zf-topbar` (`67:49832`), `zf-topbar-brand` (`67:49826`),
`zf-topbar-search` (`67:49746`), `zf-topbar-action` (`67:49773`),
`zf-topbar-tile` (`67:49807`), `zf-topbar-org` (`67:49825`), `zf-avatar` (`67:49808`),
`zf-wordmark` (`67:49714`)
**CSS class:** `.zf-topbar`
**Size:** 1492 × 48 as drawn; the width fills the viewport in use

The application header: brand, a scoped search, and a right cluster of account actions.
It is the second half of the app chrome — the same permanently-dark band the sidebar's
logo sits in — so it gets its own role group rather than borrowing the sidebar's.

### 2.21.1 A drawing with no auto-layout

The source was a flat `GROUP` of absolutely-placed rectangles and vectors. **One
auto-layout frame in the entire bar** (the org switcher), and ten distinct paints, none
of them bound.

Every position is now produced by auto-layout rather than by coordinates, and the result
lands **within 1px of the drawing on all ten elements**. The 1px comes from the search
field's inside border, which the source drew as a separate rectangle behind the content.

### 2.21.2 The spacing, measured

| Element | Size | Source x | Rebuild x | How it is produced |
|---|---|---|---|---|
| Bar | 1492 × 48 | — | — | padding-left 20, padding-right 0 |
| Brand mark | 24 × 24 | 20 | **20** | the bar's left padding |
| Wordmark | 78 × 18 | 52 | **52** | 8px gap after the mark |
| Brand column | 200 wide | — | — | fixed, so the search always starts in the same place |
| Search field | 300 × 36 | 253 | **252** | 220 + 32 |
| — search icon | 16 | 263 | **263** | field padding-left 10 |
| — scope caret | 8 glyph | 283 | **283** | a 16px slot holding an 8px glyph |
| — divider | 1 × 26 | 297 | **296** | 2px after the caret slot |
| — placeholder | 16 / 24 | 303 | **302** | 5px after the divider |
| Org switcher | hug × 32 | 1136 | 1126 | padded to a 32px target — §2.21.5 |
| Divider | 1 × 20 | 1205 | **1203** | 16px from the org label |
| Add button | 32 × 32 | 1221 | **1220** | 16px after the divider |
| Icon actions | 32 × 32 | 1269 · 1317 · 1365 | **1268 · 1316 · 1364** | 16px pitch |
| Avatar tile | 48 × 48 | 1397 | **1396** | flush against the actions |
| Apps tile | 48 × 48 | 1445 | **1444** | flush right; the bar ends at 1492 |

**One number is worth naming.** The search starts at **253**, which is **220 + 33** — and
220 is the sidebar's width. So the brand column is the rail's column, and the search
begins just after it. Building it as `220 + 32` makes that relationship explicit and
costs 1px.

The only element more than 1px out is the **org switcher**, and only because it now has
padding: the label sits 10px left of where it was drawn because it has become a 32px
target instead of a bare 20px text node. The gap from the label to the divider is still 16.

### 2.21.3 Every colour, traced to the palette

Ten distinct paints, **none bound**.

| Role | Source | ZF primitive | ΔE | Note |
|---|---|---|---|---|
| `chrome/surface` | `#21263C` | `blue/2000` `#182236` | **3.26** | the bar |
| `chrome/raised` | `#333850` | `neutral/1600` `#3A3E53` | **3.42** | the search field |
| `chrome/border` | `#6C718A` | `neutral/1000` `#9598AB` | 15.68 | the field border was **2.10:1** and failed 1.4.11; now 3.69:1 |
| `chrome/text` | `#FFFFFF` | `base/white` | **0.00** | 15.9:1 on the bar, 10.5:1 on the field |
| `chrome/text-muted` | `#838195` | `neutral/900` `#AEB1C2` | 17.95 | the placeholder was **3.04:1** on the field; now 4.95:1 |
| `chrome/accent` | `#408DFB` | `blue/900` `#94B3F2` | 31.39 | the scope caret — 5.01:1 on the field |
| `chrome/item-hover` | *not drawn* | `neutral/1700` `#2D3145` | — | |
| `chrome/item-pressed` | *not drawn* | `neutral/1500` `#4A4D63` | — | |
| `brand/solid` | `#408DFB` | `blue/1300` `#2762D9` | 19.27 | the add button; white on `#408DFB` is **3.27:1** |
| — | `#757575` | *no ZF equivalent* | 13.88 | a pure grey divider from no family in the palette |
| — | `#D9D9D9` · `#D8D8D8` · `#F7F5F5` | *Figma defaults* | — | placeholder rectangles behind the avatar and the apps grid |

**Three of the ten paints are Figma's own defaults** — the colour a new rectangle gets —
sitting behind the avatar and the apps icon. A fourth, `#757575`, is a true neutral grey
with no equivalent anywhere in the palette: its nearest step is **13.88 ΔE** away,
because every other neutral in this file carries a blue cast.

The large deviations are all contrast. The field border, the placeholder and the add
button each failed at the drawn value. And the scope caret's `#408DFB` is the same legacy
blue this file has now met **five times** (§2.5.3, §2.9.4, §2.14.1, §2.19.3, here) — see
open item 25. On dark chrome it needs a far lighter step, which is what `chrome/accent` is.

### 2.21.4 Why chrome needs its own roles

The top bar is dark whether the product is in Light or Dark mode, exactly like the
sidebar's logo band. A role that flips cannot describe it — bind the placeholder to
`text/secondary` and it inverts the moment Dark mode is applied, which is the bug
§2.20.4 caught on the logo band's product name.

So eight `chrome/*` roles were added, all with the same value in both modes:

| | |
|---|---|
| `chrome/surface` · `chrome/raised` | the bar and the field |
| `chrome/border` | the field edge and the cluster dividers |
| `chrome/text` · `chrome/text-muted` | the label and the placeholder |
| `chrome/accent` | an interactive mark on dark, where `brand/solid` is unreadable |
| `chrome/item-hover` · `chrome/item-pressed` | states the source never drew |

`chrome/surface` is `blue/2000`; `nav/brand-surface` — the sidebar's logo band — is
`blue/2100`. They are one step apart because the source drew them one step apart
(`#21263C` and `#181C2E`). **If the bar and the logo band ever sit adjacent, that seam
will show.** Open item 31.

### 2.21.5 Geometry

| | Value | Note |
|---|---|---|
| Bar | 48 tall | padding-left 20, padding-right **0** |
| Brand column | 200 wide | mark 24, gap 8, wordmark 78 |
| Search field | 300 × 36 | radius 6, 1px `chrome/border` |
| Field internals | 10 · 16 · 16 · 2 · 1 · 5 | padding, icon slot, caret slot, gap, divider, gap |
| Placeholder | Inter Regular **16 / 24** | the source had `lineHeight: AUTO` |
| Org switcher | hug × **32** | padding 8 / 6, radius 6 — was a bare 20px text node |
| Action button | **32 × 32** | radius 6, 16px icon, **16px pitch** |
| Tile | **48 × 48** | full bar height, 20px icon, no radius, flush |
| Avatar | 32 circle | inside a 48 tile |

The two right-hand tiles are **full-height and butted together with no gap**, unlike the
32px actions before them which sit on a 16px pitch. That is deliberate in the drawing —
the account and app-switcher controls read as part of the bar's edge rather than as
buttons on it — and it is preserved.

### 2.21.6 Properties

| Property | Type | Default | On |
|---|---|---|---|
| `Style` | VARIANT | `ghost` | `zf-topbar-action` — ghost, or a filled brand button |
| `State` | VARIANT | `default` | `default` · `hover` · `pressed` · `focus` |
| `Placeholder` | TEXT | `Search in Customers ( / )` | `zf-topbar-search` |
| `Label` | TEXT | `Zylker` | `zf-topbar-org` |
| `Initials` | TEXT | `JD` | `zf-avatar` |
| `Icon` | INSTANCE_SWAP | `icon / plus` · `icon / apps` | action and tile |
| `Mark` | INSTANCE_SWAP | `Product=expense` | `zf-topbar-brand` — a fourth `zf-logo-mark` variant |
| `Wordmark` | INSTANCE_SWAP | `Product=expense` | `zf-wordmark`, so a product swaps both assets |

**The wordmark is a vector, not text.** In your drawing "Expense" is drawn artwork, so it
is a swappable asset rather than a TEXT property. That is the opposite of the sidebar,
where the product name is a text layer with a `Product name` property — worth settling one
way before both ship. Open item 32.

Six icons were authored locally from the source vectors: `users`, `bell`, `settings`,
`apps`, `caret-down`, and a rescaled `search`. `icon / search` was drawn at 12px inside a
16px box while every other icon fills its slot, so it read visibly smaller wherever it
appeared; it now fills 16.

### 2.21.7 Selector strategy

```html
<header class="zf-topbar">
  <a class="zf-topbar__brand" href="/"><svg …><span class="visually-hidden">Expense home</span></a>
  <div role="search">
    <button aria-label="Search scope: Customers" aria-haspopup="menu">…</button>
    <input type="search" placeholder="Search in Customers ( / )" aria-label="Search">
  </div>
  <nav aria-label="Account">
    <button aria-haspopup="menu">Zylker</button>
    <button aria-label="Create new">…</button>
    <button aria-label="Notifications" aria-describedby="unread">…</button>
  </nav>
</header>
```

| Figma | Markup | Why |
|---|---|---|
| `zf-topbar` | `header` | one per page, above the `nav` landmark |
| `zf-topbar-brand` | `a href="/"` with a visually-hidden name | a logo that links home needs a name |
| `zf-topbar-search` | `div[role=search] > input[type=search]` | the wrapper carries the landmark |
| scope caret | a **separate** `button aria-haspopup="menu"` | it opens a menu; it is not part of the input |
| `zf-topbar-action` | `button aria-label="…"` | four of the five have no visible label |
| `Style=filled` | the primary action, one per bar | more than one filled button and neither is primary |
| `zf-topbar-tile` | `button aria-haspopup="menu"` | account and app switcher both open menus |
| `zf-avatar` | `img alt=""` inside the button, name on the button | the photo is decorative; the button is not |
| `/` shortcut | focus the input, and say so in the placeholder | it is already in the copy, so it must actually work |

### 2.21.8 Accessibility

| Requirement | Status | Detail |
|---|---|---|
| Text contrast 1.4.3 | ✅ | `chrome/text` 15.9:1 on the bar, 10.5:1 on the field |
| Placeholder 1.4.3 | ✅ **fixed** | was `#838195` at **3.04:1** on the field; now 4.95:1 |
| Field border 1.4.11 | ✅ **fixed** | was `#6C718A` at **2.10:1**; now 3.69:1 |
| Add button 1.4.3 | ✅ **fixed** | white on `#408DFB` was **3.27:1**; on `brand/solid` it is 5.48:1 |
| Target size 2.5.8 | ✅ **fixed** | the org switcher was a bare 20px-tall text node; now 32 |
| Focus visible 2.4.7 | ✅ | 2px ring on the search and the actions; the box never resizes |
| Button vs bar 1.4.11 | ⚠️ | `brand/solid` against `chrome/surface` is **2.9:1** — the glyph inside is 5.48:1, but the button's own edge is under 3:1 |
| Icon-only actions 4.1.2 | ⚠️ | four of the five right-hand controls have no visible label |
| Search role 4.1.2 | ⚠️ | `role="search"`, and the scope caret is a separate button |

### 2.21.9 Traps worth recording

**A backing rectangle inside the glyph.** Two icons carried a solid square behind the
shape — the people icon had a white 16 × 16 frame fill under a white glyph, and the apps
grid had an `#F7F5F5` square under nine white dots. Cloned as-is they render as solid
blocks. **An icon that looks right only because something opaque is hiding behind it is
not an icon.**

**Nine rectangles are not a vector.** My rebind script matched on `type === 'VECTOR'`, so
the apps grid — nine rectangles — silently kept the fallback grey through three separate
passes. Match on *has a fill*, not on the node type.

**Swapping to the component you already have.** Setting `Icon` to the same component it
already pointed at still counts as a swap, and still resets every paint override
underneath. The fix was to not set the property at all when the default is already right.
Fourth form of this trap in the file.

**A pure grey with no home.** `#757575`'s nearest palette step is **13.88 ΔE** away.
Every other neutral here carries a blue cast, so a true grey reads as foreign the moment
it sits beside one.

**Figma's default fill as a design decision.** `#D9D9D9` twice and `#F7F5F5` once — the
colour Figma gives a new rectangle. **Three of the bar's ten paints are the tool's
defaults rather than anyone's choice.**

**A 20px-tall click target.** The org switcher was a bare text node with no padding and
no background — 52.86 × 20. It reads as a control and cannot be hit like one.

### 2.21.10 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | A flat `GROUP` of absolutely-placed shapes; one auto-layout frame in the whole bar. | **Done** — 8 component sets, everything positioned by layout, within 1px. | all |
| 2 | ✅ **resolved** | 10 distinct paints, **0 bound**. | **Done** — 149 paints, all `ZF Semantic` / `ZF Brand`, 0 raw, 0 primitive, 0 remote. | all |
| 3 | ✅ **resolved** | No role could describe permanently-dark chrome. | **Done** — 8 `chrome/*` roles, same value in both modes. | `ZF Semantic` |
| 4 | ✅ **resolved** | The field border was `#6C718A` at 2.10:1 — a 1.4.11 fail. | **Done** — `chrome/border`, 3.69:1. | `zf-topbar-search` |
| 5 | ✅ **resolved** | The placeholder was `#838195` at 3.04:1 on the field. | **Done** — `chrome/text-muted`, 4.95:1. | `zf-topbar-search` |
| 6 | ✅ **resolved** | White on the add button's `#408DFB` was 3.27:1. | **Done** — `brand/solid`, 5.48:1. | `zf-topbar-action` |
| 7 | ✅ **resolved** | The org switcher was a bare text node, 52.86 × 20. | **Done** — 32px padded target with hover and pressed. | `zf-topbar-org` |
| 8 | ✅ **resolved** | No hover, pressed or focus state existed anywhere in the bar. | **Done** — every control has four. | all |
| 9 | ✅ **resolved** | `lineHeight: AUTO` on both text nodes. | **Done** — 16/24 and 14/20. | search · org |
| 10 | ✅ **resolved** | The people and apps icons carried opaque backing rectangles. | **Done** — re-authored as 16 × 16 glyphs, centred. | Icons page |
| 11 | ✅ **resolved** | `icon / search` was drawn at 12px in a 16px box and read small everywhere. | **Done** — fills 16. | Icons page |
| 12 | ⚠️ **open** | `#757575` has no equivalent in the palette — nearest step 13.88 ΔE. | Retire it, or add a true-grey family. §2.21.3 | `ZF Primitives` |
| 13 | ⚠️ **open** | `chrome/surface` and `nav/brand-surface` are one step apart because the source drew them so. | Decide whether the bar and the logo band are the same surface. Open item 31. | `ZF Semantic` |
| 14 | ⚠️ **open** | The wordmark is a vector here and a text layer in the sidebar. | Settle one before both ship. Open item 32. | `zf-topbar-brand` |
| 15 | ⚠️ **open** | `brand/solid` against `chrome/surface` is 2.9:1 — the button's edge is under 3:1. | Either accept it (the glyph is 5.48:1) or add a lighter on-dark brand step. | `ZF Brand` |
| 16 | ⚠️ **open** | `aria-label` on four icon-only controls, `role="search"`, and the `/` shortcut. | Code requirement — §2.21.7. | Implementation |

## 2.22 Avatar — `zf-avatar`

**Figma:** page `Avatar` → `zf-avatar` (`68:50978`), `zf-avatar-group` (`70:51107`),
`icon / admin` (`68:50850`)
**CSS class:** `.zf-avatar`
**Sizes:** 24 · 40 · 60 · 100

A person, shown as a photograph or as the first letter of their name, in one of six
identity tints. Four sizes, an admin badge, and an overlapping stack for groups.

**28 variants, 263 solid paints, all bound to `ZF Semantic`** — 0 raw, 0 primitive,
0 remote — plus 4 image paints carried over from the source.

### 2.22.1 Two axes encoding one dimension

The source declared `Size` (4) × `Color` (7) × `is_image` (2) = **56 combinations, and
28 existed.** The other 28 are not missing work; they are impossible:

| | `is_image = no` | `is_image = yes` | What that means |
|---|---|---|---|
| `Color = Green … Blue` (6) | **24 variants exist** | 24 cells, none built | a tint with a photo over it is not a thing |
| `Color = None` | 4 cells, none built | **4 variants exist** | "None" is not a colour, it is a flag saying *ignore the colour* |

Only the diagonal is real. `Color = None` and `is_image = yes` are **the same statement
made twice**, and the moment a value on one axis means "ignore the other axis", the two
are one axis.

The failure mode is quiet. Ask Figma for `Size=Large, Color=Red, is_image=yes` and it
does not error — it picks something. Half the matrix resolves to whatever the resolver
finds nearest.

The fix is not to build the missing 28. It is to fold the sentinel into the axis it was
hiding in: **`Size` (4) × `Fill` (7) = exactly 28**, with no undefined cell. `Fill` is
`green · cyan · blue · orange · red · purple · image` — *what fills the circle*, which
is one question with seven answers.

### 2.22.2 The four sizes

You asked for 100, 60, 40 and 24. All four were there. Almost nothing about them scaled.

| Size | Source radius | Source type | Source badge | Now |
|---|---|---|---|---|
| 24 | 999 | 12 / 12 | — | radius **12** · type 10/12 · badge 8 |
| 40 | **50** | 16 / 20.8 | 20 × 20 | radius **20** · type 16/20 · badge 14 |
| 60 | 999 | **16 / 20.8** | none | radius **30** · type 24/30 · badge 20 |
| 100 | 999 | 36 / AUTO | none | radius **50** · type 40/50 · badge 32 |

Three faults, none of them visible in a single screenshot:

- **Two ways of writing "circle".** `cornerRadius` was 999 on three sizes and 50 on the
  fourth, and neither is half the width. Both render as a circle at the size they were
  drawn; neither survives a resize. The radius is now `size / 2`.
- **Type that stops scaling halfway.** 12, 16, 16, 36 across 24, 40, 60, 100 — identical
  at 40 and 60, so a 60px avatar carried a 40px avatar's initial. As a share of the
  diameter the letter goes 50% → 40% → 27% → 36%, with no rule behind any of it. It is
  now **40% of the diameter at every size**.
- **Three line-height treatments across four sizes.** 12, 20.8, 20.8 and `AUTO` — with
  20.8 the familiar 130% artefact seen in §2.5 and §2.9. Now `1.25 × type` throughout.

### 2.22.3 A property that worked on one size in four

`is_super_admin` was declared on the set and **drawn only at Medium**.

| Size | Source | Now |
|---|---|---|
| 24 | the boolean does nothing | an 8px dot, no glyph |
| 40 | 20 × 20 badge — **50% of the avatar** | 14px badge with an 8px crown |
| 60 | the boolean does nothing | 20px badge with a 12px crown |
| 100 | the boolean does nothing | 32px badge with a 20px crown |

**A boolean that silently no-ops is worse than a missing one.** The properties panel says
the option is there, the toggle moves, and nothing happens on three sizes in four. A
missing property gets noticed the first time someone looks for it; this one gets noticed
in QA.

The badge is now drawn at every size and scaled to **a third** of the avatar rather than
the source's half. At 24 it is an **8px dot with no glyph** — a crown drawn at 5px is a
smudge, so the mark is dropped and the colour carries it. That is a deliberate stop, not
an omission: below a certain size a badge can only be a dot.

### 2.22.4 Every colour, traced to the palette

Six tint/text pairs, **all raw hex** — and one bound paint, discussed below.

| Tint | Source surface / text | ZF primitive | ΔE | Contrast |
|---|---|---|---|---|
| green | `#D2F3E6` / `#165840` | `green/500` / `green/1600` | **1.50** / 6.74 | 7.07 → **6.96** |
| cyan | `#D3F5F5` / `#175C5E` | `cyan/400` / `cyan/1600` | **2.41** / 3.56 | 6.65 → **7.90** |
| blue | `#E9F2FD` / `#1B4C91` | `blue/400` / `blue/1600` | **0.85** / 8.81 | 7.47 → **8.35** |
| orange | `#FDE5D4` / `#90340D` | `orange/500` / `orange/1400` | **1.52** / 11.49 | 6.46 → **5.47** |
| red | `#FCE8EA` / `#811C26` | `red/400` / `red/1600` | **2.85** / 1.77 | 8.40 → **8.38** |
| purple | `#F7E9FE` / `#633C76` | `purple/500` / `purple/1700` | **2.64** / 16.44 | 7.40 → **10.56** |

**Every tint is inside ΔE 2.9.** The backgrounds were already palette values in all but
name — nobody bound them, but somebody picked them from the same place. The text tones
drift much further because they are custom mixes rather than steps: purple's `#633C76`
is **16.44** from the nearest purple, orange's `#90340D` is **11.49**.

Both were already passing contrast, so this is not a fix. It is the palette absorbing six
one-off colours. Every pair still clears 4.5:1 and the lowest is orange at **5.47:1**.

**Dark mode did not exist in the source.** Each tint now has a Dark value — surface drops
to the 1900 step, text rises to 500–700 — and all six pairs clear **9.40:1** there:

| Tint | Dark surface | Dark text | Contrast |
|---|---|---|---|
| green | `green/1900` `#143025` | `green/600` `#B6F6DC` | 11.63 |
| cyan | `cyan/1900` `#132E2E` | `cyan/500` `#C3FAFA` | **12.60** |
| blue | `blue/1900` `#15274D` | `blue/600` `#D8E4FB` | 11.48 |
| orange | `orange/1900` `#38210C` | `orange/600` `#FCDCC0` | 11.60 |
| red | `red/1900` `#4D1518` | `red/700` `#FFBFC3` | **9.40** |
| purple | `purple/1900` `#2B1F3D` | `purple/600` `#E7D8FD` | 11.45 |

The **ring** that separates stacked avatars is bound to `surface/default`, not to white.
It is a cut-out against whatever the avatar sits on rather than a white line drawn on a
dark page — the same reasoning as the segmented control's separator in §2.10.

**The one bound paint pointed somewhere else.** The admin badge was the only bound paint
in the whole set, and it pointed at the legacy library's `Orange/1100` — which puts white
at **3.99:1**, a 1.4.11 fail. It now uses `avatar/admin` (`orange/1300` `#9E4B03`), where
white is **6.07:1**. See §3's *Count the bound paints*: one binding out of 263 is not
evidence of a system, it is evidence of one lucky node.

### 2.22.5 Geometry

| | 24 | 40 | 60 | 100 |
|---|---|---|---|---|
| Frame | 24 × 24 | 40 × 40 | 60 × 60 | 100 × 100 |
| Radius | 12 | 20 | 30 | 50 |
| Initial | 10 / 12 | 16 / 20 | 24 / 30 | 40 / 50 |
| Badge | 8 | 14 | 20 | 32 |
| Badge glyph | — | 8 | 12 | 20 |
| Ring weight | 1 | 1.5 | 2 | 3 |
| Stack overlap | −6 | −10 | −15 | −25 |

The badge and the ring are **absolutely positioned children** pinned `MAX / MAX` and
`STRETCH / STRETCH` respectively; the initial is the only node in flow, centred by the
frame's own alignment. The stack overlap is **−25% of the diameter at every size**, which
is why the four-avatar group measures 4 × size − 3 × overlap and the chip adds one more.

### 2.22.6 The stack

`zf-avatar-group` is four avatars plus a `+N` chip, at 24, 40, 60 and 100.

| Size | Group width | Gap | Chip |
|---|---|---|---|
| 24 | 96 | −6 | 24, ring 1 |
| 40 | 160 | −10 | 40, ring 1.5 |
| 60 | 240 | −15 | 60, ring 2 |
| 100 | 400 | −25 | 100, ring 3 |

**The cap is a design decision, not a limit.** Four slots and an overflow chip, because
past four faces nobody counts them. Compare the sidebar's `Child Menu 1…25` (§2.20.5),
where twenty-five booleans were a cap pretending to be flexibility. This is the opposite:
a small number chosen because the pattern stops working above it, with the chip carrying
the remainder. §3's *A cap expressed as booleans* covers the distinction.

### 2.22.7 Properties

| Property | Type | Default | Note |
|---|---|---|---|
| `Size` | VARIANT | `24` | 24 · 40 · 60 · 100 |
| `Fill` | VARIANT | `green` | six identity tints, or `image` |
| `Initial` | TEXT | `A` | one letter; two is a common variant, so the box does not clip |
| `Show admin` | BOOLEAN | `false` | works at **all four** sizes |
| `Show ring` | BOOLEAN | `true` | the cut-out that separates stacked avatars |
| `Size` (group) | VARIANT | `24` | on `zf-avatar-group` |
| `Show 3` · `Show 4` | BOOLEAN | `true` | a stack of two, three or four |
| `Show overflow` | BOOLEAN | `true` | the `+N` chip |
| `Overflow count` | TEXT | `+8` | |

### 2.22.8 Selector strategy

```
.zf-avatar                      /* 24 by default */
.zf-avatar--40 | --60 | --100
.zf-avatar--green | --cyan | --blue | --orange | --red | --purple
.zf-avatar--image               /* img child, no tint, no initial */
.zf-avatar__initial
.zf-avatar__badge               /* [hidden] unless admin */
.zf-avatar-group
.zf-avatar-group__overflow
```

`Fill` emits one class. The `image` value emits `--image` **and** changes the markup —
an `<img>` replaces the initial — which is the boundary §3's *markup test* draws. It stays
one component here because the frame, the radius, the ring and the badge are identical and
only the fill area differs; if the image variant ever needs its own badge placement or its
own fallback chain, it becomes `zf-avatar-image`.

Tint selection belongs to code, not to the designer: **derive it from a hash of the
person's name** so the same person is the same colour everywhere. A tint picked by hand
per instance means the same face changes colour between two screens.

### 2.22.9 Accessibility

| Requirement | Verdict | Detail |
|---|---|---|
| Initial contrast — 1.4.3 | ✅ **passes** | 5.47:1 to 10.56:1 Light, 9.40:1 to 12.60:1 Dark |
| Admin glyph — 1.4.11 | ✅ **fixed** | white on the source's `Orange/1100` was **3.99:1**; on `avatar/admin` it is **6.07:1** |
| Colour is not meaning — 1.4.1 | ✅ **passes** | the tint is derived from the name, so it carries identity, not status. It must never be read as state |
| Image alt — 1.1.1 | ⚠️ **review** | the photo is decorative when a name sits beside it and needs `alt=""`; otherwise the name goes on the `img` |
| The initial is not a name — 4.1.2 | ⚠️ **review** | "A" is not an accessible name. The full name belongs on the element or in a tooltip |
| Admin badge — 4.1.2 | ⚠️ **review** | a coloured dot with no text says nothing. It needs visually-hidden "Administrator" |
| Stack count — 4.1.2 | ⚠️ **review** | `+8` must expand to "8 more people" for a screen reader |

An avatar that is a link or a button takes the interactive role and the 2.5.8 target size;
a decorative one takes neither. **The 24px avatar is below the 24 × 24 minimum once the
ring is inside it**, so it must not be the only hit target for an action.

### 2.22.10 Traps worth recording

**A sentinel value hiding a second axis.** `Color=None` and `is_image=yes` are one
statement made twice. Together they claim 56 combinations and define 28, and Figma hands
you one of the undefined 28 without complaining. **When one axis has a value meaning
"ignore the other axis", the two are one axis.**

**A property that works on one size in four.** `is_super_admin` was declared on the set
and drawn only at Medium. Harder to catch than a missing property, because the panel says
it is there.

**Two ways of writing "circle".** Radius 999 on three sizes and 50 on the fourth, and
neither is half the width. Both look correct at the size they were drawn.

**Type that stops scaling halfway.** 12, 16, 16, 36. Nothing looks wrong until two sizes
sit side by side.

**A layer named after another component.** The initial's text layer was called `Weekly`
in all 28 variants, carried in from whatever the set was copied from. It never renders,
so it never gets fixed — and it is exactly what a code generator reads.

**One bound paint, to a library you do not own.** A single binding out of 263 is not a
system. It was also the one paint that failed contrast.

**Absolute children keep stale coordinates.** Correcting the 100px variants' width left
the admin badge at **x = 137 on a 100px avatar** — a `MAX` constraint holding a position
from the broken geometry. Resizing a frame does not re-place what was pinned to its edge.
Reset the position explicitly after any resize.

**A resized icon slot does not resize the icon.** The admin glyph's frame was set to 8,
12 and 20, and the crown inside stayed **16 × 13.52 in all three** — `CENTER`
constraints re-centre without scaling. At the 14px badge a 16px crown is wider than the
badge it sits in, so the circle looked deformed rather than overfilled. At 20 it fits by
luck, so the largest size looked right and only the small ones looked broken. §1.7.6

**`resize()` before the sizing mode is a no-op.** All 28 variants collapsed to 31 × 100
capsules because `resize()` ran while the frame was still hugging. Set
`layoutSizingHorizontal = 'FIXED'` first, then resize.

### 2.22.11 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | `Size` × `Color` × `is_image` claimed 56 combinations; 28 existed and 28 were undefined. | **Done** — `Size` (4) × `Fill` (7) = 28, nothing undefined. | `zf-avatar` |
| 2 | ✅ **resolved** | 263 paints, **1 bound** — and that one to a remote library. | **Done** — 263 paints, all `ZF Semantic`, 0 raw, 0 primitive, 0 remote. | all |
| 3 | ✅ **resolved** | White on the badge's `Orange/1100` was **3.99:1** — a 1.4.11 fail. | **Done** — `avatar/admin`, 6.07:1. | badge |
| 4 | ✅ **resolved** | `is_super_admin` no-opped on three sizes in four. | **Done** — the badge is drawn at every size. | `zf-avatar` |
| 5 | ✅ **resolved** | `cornerRadius` 999 / 999 / 50 / 999 — neither value is half the width. | **Done** — `size / 2`. | all sizes |
| 6 | ✅ **resolved** | Type 12 / 16 / 16 / 36 — identical at 40 and 60. | **Done** — 40% of the diameter at every size. | all sizes |
| 7 | ✅ **resolved** | Line-height 12 / 20.8 / 20.8 / `AUTO` — three treatments, one of them the 130% artefact. | **Done** — 1.25 × type. | all sizes |
| 8 | ✅ **resolved** | No Dark values existed for any tint. | **Done** — 14 `avatar/*` roles, both modes, all pairs ≥ 9.40:1. | `ZF Semantic` |
| 9 | ✅ **resolved** | The ring was white, so it only worked on a white page. | **Done** — bound to `surface/default`. | ring |
| 10 | ✅ **resolved** | The initial's text layer was named `Weekly` in all 28 variants. | **Done** — `initial`. | `zf-avatar` |
| 11 | ⚠️ **open** | The top bar's avatar is **32px**, which is not one of the four declared sizes. | Add 32 to the scale, or move the top bar to 40 and retire `zf-topbar-avatar`. Open item 33. | `zf-topbar` |
| 12 | ⚠️ **open** | Which tint a person gets is undefined — the source picked by hand. | Hash the name in code so the same person is the same colour everywhere. Open item 34. §2.22.8 | Implementation |
| 13 | ✅ **resolved** | The admin glyph kept its 16px art in an 8, 12 and 20px slot — `CENTER` constraints, not `SCALE`. | **Done** — the master's vector is `SCALE`; all 28 re-resized. §1.7.6 | `icon / admin` |
| 14 | ⚠️ **open** | The 24px avatar is under the 24 × 24 target minimum once the ring is inside it. | Do not make it the sole hit target, or pad it to 24 with a transparent margin. | `zf-avatar` |
| 15 | ⚠️ **open** | `alt`, the accessible name, the badge's hidden text and the `+N` expansion. | Code requirement — §2.22.9. | Implementation |

---

## 2.23 Page header — `zf-page-header`

**Figma:** page `Page header` → `zf-page-header` (`85:8393`), `zf-header-actions` (`86:8479`),
`zf-header-action` (`85:8270`), `zf-header-switcher` (`85:8288`), `zf-header-cta` (`85:8310`)
**CSS class:** `.zf-page-header`
**Size:** 1325 × 64 as drawn; the width fills the content column in use

The band above page content. Three page contexts — a module list view, a creation page and a
detail view — as **one component with one axis** over four shared controls.

**147 solid paints, all bound** — 119 to `ZF Semantic`, 28 to `ZF Brand`, 0 raw, 0 primitive,
0 remote. The source was 45 nodes, **36 paints, none bound**, and two auto-layout frames in
the whole page.

### 2.23.1 Three drawings, one structure

Every part below exists in all three variants. What `Type` changes is which are shown, and
how the leading edge aligns.

| Part | `Type=list` | `Type=create` | `Type=detail` |
|---|---|---|---|
| Back button | — | — | 32 × 32, chevron Left |
| Eyebrow | — | — | 11 / 17.6 +0.2, `text/secondary` |
| Title | 18 / 24, inside a menu button | 18 / 24 | 18 / 24 |
| Caret | 16px slot, `primary/default` | — | — |
| Trailing cluster | CTA only | 3 icon actions | 2 icon actions |
| Left gutter | 14, plus the switcher's 6 → text at 20 | 20 → text at 20 | 20 → box at 20, title at 60 |

**The leading region is one dimension with three values: what identifies the page.** On a list
it is a switchable view name, on a creation page a plain title, on a detail page a title with
its parent above it and a way back.

§3's second test asks whether an axis changes what the component *contains* rather than what it
is *doing* — and this one does. It is still an axis rather than a set of booleans because the
three compositions are **mutually exclusive alternatives, not additions**. A page is exactly one
of the three. That distinction is now written into §3.

### 2.23.2 The spacing, measured

| Measure | Source | Rebuild | How it is produced |
|---|---|---|---|
| Band height | 65 · 70 · 70 | **64 on all three** | a 32px control with 16 above and below |
| Title left edge — list | 20 | **20** | padding-left 14 plus the switcher's 6 |
| Title left edge — create | 20 | **20** | padding-left 20 |
| Back button left edge — detail | 20 | **20** | padding-left 20 |
| Title left edge — detail | 61 | **60** | 20 + 32 + 8 |
| Title to caret | 4.06 | **4** | `itemSpacing` on the switcher row |
| Action pitch | 43 · 42.8 | **42** | 32 + 10 |
| Action cluster right margin | 20.31 · 20.4 · **53.4** | **20 · 20 · 20** | padding-right 20 |
| Primary action | 64.98 × 29.71 | 75 × 32 | padding 12, gap 6, height matched to the actions |
| Icon glyph size | 6.41 · 10 · 13.95 · 14 · 14.72 | **16 slot on all five** | §1.7 |

**Two rows are not rounding.**

The action cluster sits 20.3 and 20.4 from the right edge on the list and creation headers and
**53.4 on the detail header** — a full button pitch out. On its own page it looks deliberate. It
only becomes wrong the moment a user navigates from a record back to its parent list, which is
the one comparison a page-by-page review never makes.

And five identical 32.8px buttons held **five different glyph sizes**. Every button looks the
same until you select what is inside it.

**Optical alignment is why the left gutter differs by type.** A padded control aligns by its
text; a bordered control aligns by its box. So the list header's padding-left is 14 and its
switcher carries 6, putting the label's glyph edge at 20 — the same place the creation header's
title starts with padding-left 20 and no inner padding. The detail header's back button is a
bordered box, so its box edge goes at 20. All three match the source within 1px.

### 2.23.3 What a Figma property cannot do

This decided the whole model, so it is recorded as three measurements rather than as an opinion.

| What was tried | What happened | What it means |
|---|---|---|
| Attach `Show CTA` to the `cta` node in all three variants, default `false` | The list header's CTA went **visible → hidden**. All three collapsed to the property's single default | A non-variant property holds **one value for the entire set** |
| Set the list variant's `cta` back to visible | **All three became visible** | Once property-driven, the variants' nodes are no longer independent |
| Drive the list title from a nested `zf-header-switcher` instance | A parent `TEXT` property cannot reach a text node **inside an instance** | The list header inlines the switcher's layout instead |

**Consequence one:** `Type` owns the back button, the eyebrow and the caret rather than three
booleans, because a boolean would have to default the same way on all three page types and no
default is right for more than one of them.

**Consequence two:** the trailing cluster is its own set, `zf-header-actions`, with two axes —
`Count` = 0 · 1 · 2 · 3 and `CTA` = yes · no. **A nested instance's variant selection is stored
per node**, so each header variant can point at a different composition and the defaults come
out right on all three types. Eight variants, no undefined cell.

**Consequence three:** `zf-header-switcher` exists as a component *and* is inlined in the list
header. That is duplication with a reason — the component is where the state ladder lives and
can be reviewed; the inlined copy is what lets a single `Title` property drive all three types.
Recorded rather than hidden, because two nodes of duplication for one clean property is a trade
someone should be able to re-examine.

### 2.23.4 Every colour, traced to the palette

Ten distinct paints in the source, **none bound**. Eight map cleanly; two are blues the palette
does not own.

| Role | Source | ZF primitive | ΔE | Contrast on the band |
|---|---|---|---|---|
| `surface/default` | `#FFFFFF` | `base/white` | **0.00** | the band, and every control on it |
| `border/divider` | `#EBEAF2` | `neutral/500` `#E9EAF5` | **1.69** | 1.20:1 — a divider, not a boundary |
| `text/default` | `#21263C` | `neutral/1900` `#222536` | **3.52** | 14.92 → **15.15** |
| `text/secondary` | `#58627F` | `neutral/1300` `#565A70` | 5.41 | 6.05 → **6.79** |
| `icon/default` | `#4C526C` | `neutral/1300` `#565A70` | 4.33 | 7.69 → **6.79** |
| `icon/default` (back) | `#413F53` | `neutral/1600` `#3A3E53` | **2.57** | a stroked path, not a fill — folded in |
| `icon/default` (edit) | `#000000` | `base/black` | 0.00 | the only pure black in any component |
| `border/default` | `#D4D4DE` · `#D7D5E2` | `neutral/600` `#DFE0EB` | 4.25 · 3.94 | 1.47 → **1.31** — see §2.23.6 |
| `primary/default` | `#528EF4` | `blue/1100` `#4F7EDB` | 7.45 | 3.21 → **4.32** |
| `brand/solid` | `#1B6DE0` | `blue/1200` `#3874EB` | 4.07 | white 4.87 → **5.48** |

**Three greys for two jobs.** `#D4D4DE` on the icon buttons and `#D7D5E2` on the back button
differ by **1.1 ΔE** and were drawn as separate values. Both fold into `border/default`. The
third, `#EBEAF2`, is the band's bottom edge and becomes `border/divider`.

**The two blues are the finding.** `#1B6DE0` on the primary button is 4.07 ΔE from `blue/1200`
and 6.26 from `blue/1300` — close to both, equal to neither. `#528EF4` on the caret is 7.45 from
`blue/1100`, and it is **4.79 ΔE from `#408DFB`**, the unowned blue already recorded in five
other components: the same intended colour, drawn twice with different numbers.

Both are bound to **roles** here rather than to their nearest step — `brand/solid` for the
button, `primary/default` for the caret. **The role carries the meaning; the nearest step only
carries the pixel.** Where those disagree, take the role and report the distance, which is what
the ΔE column is for. That is now a §3 convention.

**Dark mode did not exist in the source, and needed no new roles.** The band, the buttons, the
title, the eyebrow and the glyphs all resolve from roles that already had both panes. The one
gap was a neutral pressed surface:

| | Default | Hover | Pressed |
|---|---|---|---|
| Light | `#FFFFFF` | `neutral/300` `#F5F6FC` | `neutral/400` `#F0F1FA` |
| Dark | `neutral/2000` `#1D202E` | `neutral/1900` `#222536` | `neutral/1800` `#282B3D` |

Added as **`surface/pressed`**. Both ladders are monotonic — darker at every step in Light,
lighter at every step in Dark — which is what open item 30 cost the sidebar to learn.

### 2.23.5 Properties

| Property | Type | Default | Note |
|---|---|---|---|
| `Type` | VARIANT | `list` | `list` · `create` · `detail` |
| `Title` | TEXT | `Page title` | one property, all three types |
| `Eyebrow` | TEXT | `Module` | the node exists in all three; only `detail` shows it |
| `Count` | VARIANT | — | on the exposed `trailing` instance: 0 · 1 · 2 · 3 |
| `CTA` | VARIANT | — | on the exposed `trailing` instance: yes · no |
| `Icon` | INSTANCE_SWAP | `icon / close` | on each `zf-header-action` |
| `Label` | TEXT | `New` | on `zf-header-cta` |
| `Show icon` | BOOLEAN | `true` | on `zf-header-cta` |
| `State` | VARIANT | `default` | on all three controls |

**The header has no `State` axis and should not get one.** Hover, pressed and focus belong to
the controls, and in code they are pseudo-classes rather than props. A header with 3 types × 5
states would be 15 variants describing something CSS already knows how to do. The controls carry
the ladder so it can be reviewed; the header instances them at rest.

### 2.23.6 Selector strategy

```
.zf-page-header                     /* the 64px band */
.zf-page-header--list | --create | --detail
.zf-page-header__leading
.zf-page-header__back               /* button, detail only */
.zf-page-header__eyebrow            /* a link to the parent, not a heading */
.zf-page-header__title              /* h1 in all three */
.zf-page-header__switcher           /* button wrapping the h1, list only */
.zf-page-header__actions
.zf-page-header__action             /* 32x32 icon button */
.zf-page-header__cta
```

The three types are three markup shapes around the same `h1`:

```html
<!-- list -->
<header class="zf-page-header zf-page-header--list">
  <button class="zf-page-header__switcher" aria-haspopup="listbox" aria-expanded="false">
    <h1 class="zf-page-header__title">All Plans</h1><svg …/>
  </button>
  …
<!-- detail -->
<header class="zf-page-header zf-page-header--detail">
  <button class="zf-page-header__back" aria-label="Back to Production Planning">…</button>
  <div><a class="zf-page-header__eyebrow" href="…">Production Planning</a>
       <h1 class="zf-page-header__title">Q2 Bicycle Production</h1></div>
  …
```

This is the one place where §3's *markup test* comes close to firing and does not. The three
values do need different HTML — but all three are a `<header>` containing an `<h1>` and a
trailing action group, and the differences are in the wrapper and the siblings, not in what the
element *is*. The test is about the element's role, not about whether optional children appear
or a wrapper is added. `Bread crumb` (§2.19.1) failed it because one value was a `nav` of links
and the other an `ol` of non-links — two different things claiming to be one.

### 2.23.7 Accessibility

Measured in both panes. The band is `surface/default`, so every figure is against white in Light
and `neutral/2000` in Dark.

| Requirement | Verdict | Detail |
|---|---|---|
| Title — 1.4.3 | ✅ **passes** | 15.15:1 Light, 15.00:1 Dark |
| Eyebrow — 1.4.3 | ✅ **passes** | 6.79:1 Light, 9.44:1 Dark |
| Icon glyphs — 1.4.11 | ✅ **passes** | 6.79:1 Light, 7.60:1 Dark |
| Caret — 1.4.11 | ✅ **fixed** | the source's `#528EF4` was **3.21:1**; `primary/default` is 4.32:1 Light, 5.86:1 Dark |
| Primary action label — 1.4.3 | ✅ **fixed** | white on the source's `#1B6DE0` was **4.87:1**; on `brand/solid` it is **5.48:1** |
| Action button border — 1.4.11 | ⚠️ **review** | **1.31:1** Light, 1.26:1 Dark — below 3:1. The glyph identifies the control at 6.79:1, which is the standard's escape |
| Focus visible — 2.4.7 | ✅ **fixed** | **no state existed anywhere in the source.** Every control now has a 2px `focus/ring`; on the solid CTA the ring is `brand/on-solid` so it is not blue on blue |
| Target size — 2.5.8 | ✅ **passes** | 32 × 32 on every control |
| Interaction states — 4.1.2 | ✅ **fixed** | default · hover · pressed · focus · disabled, monotonic in both panes |
| Back button name — 4.1.2 | ⚠️ **review** | a bare chevron needs `aria-label="Back to Production Planning"`, not "Back" |
| Switcher semantics — 4.1.2 | ⚠️ **review** | the list title is a menu button: `aria-haspopup="listbox"` and `aria-expanded`, with the `h1` inside |
| Icon-only actions — 4.1.2 | ⚠️ **review** | attach, settings, close, edit each need an accessible name; a tooltip alone is not one |
| Heading order — 1.3.1 | ⚠️ **review** | the title is the page `h1`; the eyebrow is a **link to the parent**, not an `h2` |

**The border row is worth stating carefully, because the rebuild is fractionally worse than the
source.** `#D4D4DE` was 1.47:1 and `border/default` is 1.31:1. That is still the right trade —
one owned value beats two unowned ones — but it exposes a real gap: **the neutral ramp jumps
from 2.85:1 at `neutral/1000` straight to 4.52:1 at `neutral/1100`**, so no step lands near
3:1. Any control whose boundary is its only affordance cannot be made compliant from this
palette today. Recorded as open item 35 rather than patched locally, because a border colour
invented for one component is how a system ends up with three greys 1.1 ΔE apart — which is
exactly what this source did.

### 2.23.8 Traps worth recording

**A property default that cannot vary per variant.** Attaching a boolean to a node collapses
that node's visibility to one set-wide value, and then setting one variant moves all of them.
Anything that must default differently per variant has to be part of the variant — or a nested
set whose variant selection is stored per node. Measured in §2.23.3.

**A property that cannot cross an instance boundary.** A parent `TEXT` property cannot reach a
text node inside a nested instance. Together with the trap above, these two are the whole reason
this component is shaped the way it is.

**An alignment error of one button pitch.** 20.3, 20.4, and then 53.4.

**Five identical buttons, five glyph sizes.** 6.41, 10, 13.95, 14 and 14.72 inside five 32.8px
boxes.

**Two ways to draw the same shape.** The back chevron is a **stroked** path at 1.5; every other
glyph in the source is a **filled** path. They recolour through different properties, so a
rebind script that matches on fills silently skips one — the same class of miss as the
nine-rectangle apps icon in §2.21.9. Our own set has the same split, measured in §1.7.4: 29
filled, 17 stroked. **The icon set needs one rule, and does not have one yet** (open item 36).

**Pure black in a system with no black.** The edit glyph was `#000000`. Every neutral in this
palette carries a blue cast, so a true black reads as foreign the moment it sits beside one —
and it is the third time a Figma default has arrived as a design decision (§2.21.9).

**A text layer named after a person.** The "All Plans" label is a layer called `John doe`. It
never renders and it never gets fixed, and it is what a code generator reads. Third instance of
this in the file, after the avatar's `Weekly` (§2.22.10).

**Three sizes for one element.** The page title is 18/22.4, 20/22.4 and 18/28.8 across the three
headers — two sizes and three line-heights for what is the same `h1`. Unified at **18/24**. The
eyebrow's 11/17.6 was **left alone**: 160% matches the label pattern already confirmed in §1.4,
so the source was right about that one.

**A frame that hugs after `resize()`.** Calling `resize()` on a frame whose primary axis is
`AUTO` silently switches it to `FIXED`. Three verification panes came back 10px tall. Set the
sizing mode **after** resizing — the mirror image of the avatar's trap in §2.22.10, where the
sizing mode had to be set **before**. The rule that covers both: **`resize()` and the sizing
mode are not independent, so always assert the geometry afterwards.**

### 2.23.10 The icons, replaced with yours

The first build used glyphs I authored for `attach` and `edit`, and the system's existing
`settings`, `close` and `chevron`. **All five were visibly different from the drawing** — a
symmetric U instead of your paperclip, a six-tooth gear instead of your eight, a 1.2px hairline
X instead of your filled one, a solid wedge instead of your outlined pencil, and a chevron half
the size and weight.

They are now your geometry:

| Glyph | Your drawing | Ours | How |
|---|---|---|---|
| `icon / attach` | 6.41 × 14, filled | **6.41 × 14** | your vector path |
| `icon / settings` | 14 × 14.72, two subpaths | **14 × 14.72** | your vector path |
| `icon / close` | 10 × 10, filled | **10 × 10** | your vector path — was a 1.2px stroke |
| `icon / edit` | 13.95 × 14, body + ferrule | **13.95 × 14** | your two paths merged into one vector |
| `icon / chevron` | renders 5.7426 × 9.9853 | **renders 5.74 × 9.99** | kept our path, took your 6 × 6 at 1.5 |

The chevron is the one that is *matched* rather than *copied*: it is a shared four-direction set
used by eight other components, so rather than replace its path with your rotated `L`, it took
your dimensions and weight on the path it already had. The rendered bounds agree to 0.003px.

**Mutating a master's art wipes every instance paint override.** Sixth form of this trap in the
file, and the first that was self-inflicted rather than caused by an instance swap. All **363**
icon bindings across the file were recorded first and re-applied after; every one came back:

| Icon | Instances | Where |
|---|---|---|
| `icon / chevron` | **262** | Input Field, Buttons, Input Stepper, Colour Picker, Accordion, Date Range Picker, Breadcrumb, LHS Menu, Page header |
| `icon / close` | **67** | Banners, Popup modal, Non Modal, Side panel, Page header |
| `icon / settings` | 10 | Top bar, Page header |
| `icon / attach` · `icon / edit` | 12 | Page header |

Every affected component was re-rendered and checked. The visible effect outside this page is
that **chevrons are now 50% larger and 20% heavier everywhere** and the close X is filled rather
than hairline. Both are your drawing's values, so this is the system moving toward the design
rather than away from it — but it is a change to eight components made from one page's evidence,
and it reverts in one line if you would rather it did not: the chevron was `4 × 4` at `1.25`, and
`icon / close` was the path `M 0 0 L 9 9 M 9 0 L 0 9` at `1.2`.

### 2.23.9 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | Three flat `GROUP`s, 45 nodes, two auto-layout frames in the whole page. | **Done** — 5 component sets, everything positioned by layout, within 1px. | all |
| 2 | ✅ **resolved** | 36 paints, **0 bound**. | **Done** — 147 paints, all `ZF Semantic` / `ZF Brand`, 0 raw, 0 primitive, 0 remote. | all |
| 3 | ✅ **resolved** | The detail header's action cluster sat **53.4px** from the right edge; the other two at 20.3 and 20.4. | **Done** — 20 on all three. | `zf-page-header` |
| 4 | ✅ **resolved** | Three band heights: 65, 70, 70. | **Done** — 64 on all three, derived from the 32px control. | `zf-page-header` |
| 5 | ✅ **resolved** | The page title was 18/22.4, 20/22.4 and 18/28.8 — two sizes, three line-heights. | **Done** — 18/24 everywhere. | title |
| 6 | ✅ **resolved** | Five identical buttons held glyphs at 6.41, 10, 13.95, 14 and 14.72. | **Done** — one 16px slot, §1.7. | `zf-header-action` |
| 7 | ✅ **resolved** | **No hover, pressed, focus or disabled state existed anywhere.** | **Done** — five states on the action and the CTA, four on the switcher. | all controls |
| 8 | ✅ **resolved** | The caret's `#528EF4` was **3.21:1** — a 1.4.11 fail. | **Done** — `primary/default`, 4.32:1. | switcher |
| 9 | ✅ **resolved** | Two border greys 1.1 ΔE apart, `#D4D4DE` and `#D7D5E2`. | **Done** — both are `border/default`. | buttons |
| 10 | ✅ **resolved** | The edit glyph was `#000000`. | **Done** — `icon/default`. | `icon / edit` |
| 11 | ✅ **resolved** | The back chevron was a stroked path where every sibling was filled. | **Done** — folded into the same 16px slot and role. | back button |
| 12 | ✅ **resolved** | The "All Plans" text layer is named `John doe`. | **Done** — `title`. | `zf-page-header` |
| 13 | ✅ **resolved** | The switcher was a bare text node with no hit area. | **Done** — 6/4 padding, radius 6, four states, optical alignment preserved. | `zf-header-switcher` |
| 14 | ✅ **resolved** | No Dark values, and no neutral pressed surface to build a ladder from. | **Done** — `surface/pressed` added, monotonic in both panes. | `ZF Semantic` |
| 15 | ⚠️ **open** | `#1B6DE0` and `#528EF4` are two more unowned blues; `#528EF4` is 4.79 ΔE from `#408DFB`. | Fold into open item 25 — the palette needs to own its bright blue and its deep blue, or retire them. §2.23.4 | `ZF Primitives` |
| 16 | ⚠️ **open** | No neutral step lands near 3:1, so a control border cannot meet 1.4.11. | Open item 35 — add a step, or accept that the glyph carries identification. §2.23.7 | `ZF Primitives` |
| 17 | ✅ **resolved** | The five glyphs were mine, not yours — a different paperclip, gear, X, pencil and chevron. | **Done** — rebuilt from your vector data; the chevron matched to your 6 × 6 at 1.5. §2.23.10 | Icons page |
| 18 | ✅ **resolved** | 13 icons still carried `CENTER` constraints — the §1.7.6 resize trap. | **Done** — the set of 42 is now uniformly `SCALE`. | Icons page |
| 19 | ⚠️ **open** | The icon set mixes stroked and filled glyphs with no rule — 29 filled, 17 stroked. | Open item 36 — pick one and convert. §1.7.4 · §2.23.8 | Icons page |
| 20 | ⚠️ **open** | `zf-header-cta` duplicates what the system Button should provide. | Retire it once open item 17's intent ladder is settled. | `zf-header-cta` |
| 21 | ⚠️ **open** | `aria-label` on four icon-only controls, the switcher's menu semantics, the eyebrow as a link. | Code requirement — §2.23.6 · §2.23.7. | Implementation |

---

## 2.24 Tables — `zf-table-list` · `zf-table-grid`

**Figma:** page `Table` → `zf-table-list` (`93:10129`), `zf-table-grid` (`93:10403`),
`zf-table-list-head` (`93:9975`), `zf-table-list-row` (`93:10079`), `zf-grid-head` (`93:10206`),
`zf-grid-row` (`93:10402`), `zf-table-head-cell` (`92:9814`), `zf-table-cell` (`92:9871`),
`zf-table-delta` (`93:9878`), `zf-table-user` (`93:9879`), `zf-table-action` (`93:9911`),
`zf-grid-index` (`93:9924`), `zf-table-link` (`93:9956`)
**CSS class:** `.zf-table`
**Header:** 36 · **Rows:** 44 (list) · 40 (grid) · **Widths:** 1285 (list) · 1275 (grid)

Two tables with two jobs. **Type 1** is a borderless list for module list views and side detail
views. **Type 2** is a bordered grid whose parent and child rows are held together by what looks
like a merged cell.

**571 solid paints, all bound** — 539 to `ZF Semantic`, and **32 that are not, all from one
place**: the system checkbox, which binds its fill to the `base/white` primitive and its border
to a remote library. Nothing else in either table reaches outside.

The source was **164 nodes, 148 paints, 5 bound, 24 distinct colours**, and 11 auto-layout frames
— six of which are the action cells.

### 2.24.1 Two tables, two jobs

They look alike and they are not the same component.

| | Type 1 — `zf-table-list` | Type 2 — `zf-table-grid` |
|---|---|---|
| Used for | module list views, side detail views | a parent record and its breakdown |
| Cell boundaries | none — rows separated by a rule | a vertical rule on every cell |
| Header height | 35 → **36** | 33 → **36** |
| Row height | **44** | **40** |
| Cell inset | **12** | **20** |
| Header fill | `#FAFAFD` | `#FAFAFF` — **which is also Type 1's hover row** |
| Row rule | `#EDEDF7` | `#EBEAF2` inner, `#E4E4EF` and `#E4E4F0` outer |
| Body text | `#222222` — a pure grey | `#292E40` · `#31384D` · `#21263C` |
| Checkbox | **drawn by hand at 14 × 14** | **an instance of the system checkbox at 12 × 12** |
| Hierarchy | none | parent · child · child-last, and a merged `#` column |
| Row actions | an overflow `⋯` revealed on hover | a split link in every row |

Three of those rows are the same value doing two jobs, or the same job done two ways.

**`#FAFAFF` is Type 2's header and Type 1's hover row.** Neither is wrong on its own page.
Together they mean a hovered list row and a grid header are the same colour, so one of the two
loses its meaning.

**The body text is four values across two tables**, and `#222222` is **17.59 ΔE** from `#31384D`
— because it is a pure grey among neutrals that all carry a blue cast, the same problem as
`#757575` in the top bar (open item 12).

**The checkbox is drawn in one table and instanced in the other**, at 14 and 12. Two tables in
one drawing, two checkboxes, two sizes.

### 2.24.2 The header band, measured

| Property | Type 1 source | Type 2 source | Now |
|---|---|---|---|
| Height | 35 | 33 | **36** — 17.6 of text with 9.2 above and below |
| Fill | `#FAFAFD` | `#FAFAFF` | **`table/head`** → Neutral 400 Light, Neutral 1800 Dark |
| Bottom rule | 1px `#EDEDF7` | part of the 33px rect | 1px `border/divider`, on the header not the first row |
| Label type | 11 / 17.6 Semi Bold +0.6 UPPER | identical | **unchanged — the source was right** |
| Label colour | `#6C718A` | `#6C718A` | `text/secondary` — 6.04:1 on the band |
| Numeric label | left-aligned | left-aligned | **right-aligned to the same edge as its data** |
| Sort indicator | `#408DFB` **arrow** on Created Date | none | `icon / arrow-up` · `-down`, `primary/default`, any column — §2.24.11 |
| Column config | a 36 × 33.24 white button at the far right | none | a 60px cell holding `icon / table-config` |

**The header fill is the only colour that moved for a reason other than palette membership.**
`#FAFAFD` against a white row is **1.02:1** — the band is present in the file and effectively
absent on screen; what reads in a screenshot is the rule beneath it, not the fill. `table/head`
is Neutral 400 at **1.12:1** against a row and **1.04:1** against a hovered row, so the header
stays distinguishable from both. It is ΔE 4.35 from the source.

`table/head` is a new role rather than `surface/sunken`, which shares its Light value. In Dark,
`surface/sunken` is Neutral 2100 — *darker* than the surface — while a header needs to be
lighter. `table/head` is Neutral 1800.

**The alignment edge made of words.** Type 1's `Total QTY` header sits at x=884 and its numbers
right-align at **951** — which is not the column's right edge, it is the right edge of the words
"Total QTY". Rename the column to "Qty" and the data moves. Both header and data now right-align
to the column, which is why `383` sits **65.6px** further right than the source drew it: the one
large deviation in the rebuild, and it is the bug being removed.

### 2.24.3 Row and cell spacing, measured

Content positions relative to each table's own left edge.

| Measure | Source | Rebuild | Δ | Why |
|---|---|---|---|---|
| T1 · row height | 44 | 44 | 0 | — |
| T1 · first row top | **221** (9px below the rule) | 36 | — | the source left a gap under the header |
| T1 · Plan Name | 44.25 | 57.73 | **+13.5** | a 12px cell inset the source did not have |
| T1 · Plan # | 299.14 | 312.14 | +13.0 | same |
| T1 · Created Date | 462.22 | 474.98 | +12.8 | same |
| T1 · Items | 685.38 | 697.78 | +12.4 | same |
| T1 · Total QTY right edge | 907.09 | 972.66 | **+65.6** | right-aligned to the column, not to the header's words |
| T1 · Created By | 1040.68 | 1030.78 | −9.9 | the column absorbed the QTY change |
| T2 · row height | **40 · 39.5 · 45.5** | 40 | — | the first parent row was 5.5 taller than the rest |
| T2 · Item / Location | 101.77 | 113.78 | +12.0 | the source inset this column 9.34 and every other 20 |
| T2 · child indent | +16.3 | +22.4 | +6.1 | a 16px pin slot with a 6px gap |
| T2 · Unit | 360.94 | 360.78 | **−0.2** | — |
| T2 · Required right edge | 647.46 | **647.46** | **0** | — |
| T2 · Available right edge | 808.26 | **808.26** | **0** | — |
| T2 · Shortage right edge | 1005.27 | 1004.27 | −1.0 | — |
| T2 · Actions label | 1044.73 | 1046.73 | +2.0 | — |
| T2 · Actions divider | **1247.5 · 1263.5** | **1231 on all six rows** | — | the column was 24px too narrow — §2.24.11 |

**Type 2 lands on the source to within 2px on five of seven columns and exactly on two.** Type 1
moves uniformly by 12–13px because the source had **no cell inset at all** — the Plan Name text
began 1.25px after the column boundary and every column after it inherited the same near-zero
padding. Twelve pixels is the smallest inset that stops a left-aligned value touching the cell
edge once a border or a selected background appears behind it.

**Two source row heights were nobody's decision.** Type 1's first row begins **9px** below the
header rule — a gap that exists in no other row. Type 2's first parent row is **45.5** tall where
every other row is 40 or 39.5. Both read as intentional until you measure four rows in a column.

### 2.24.4 How the parent and child rows hold together

You described it as cells. That is exactly what it is, and it is done with one line.

| Device | In the source | Now |
|---|---|---|
| The `#` column | a full-height vertical rule at x=138.65, unbroken from header to table bottom | a right border on every `#` cell — they stack into one continuous line |
| A child's bottom rule | starts at x=144.5, **inside** the Item column | starts at the `#` column's right edge, 92px in |
| The last child's rule | full width, x=47.5 | full width — `Kind=child-last` |
| What that produces | the `#` cell appears to span the group, because nothing crosses it | the same, and it survives resizing |
| A child's identity | a 9 × 10 pin glyph before the label; no number, no checkbox | `icon / pin` in a 16px slot; the `#` cell is empty |
| A cell-level alert | a 1px × 39 red line on the left edge of one Shortage cell | `alert-rule`, hidden, shown per instance |
| A row-level alert | a red triangle at the right of the Item cell on two parents | `Icon=trailing`, glyph tinted `danger/default` |

**A table with no rowspan can still express one, by breaking the row rule instead of merging the
cell.** The child rows' bottom rules stop short of the `#` column, so that column reads as a
single tall cell holding the group's number, checkbox and collapse control. The last child closes
the group with a full-width rule.

In HTML that is `:last-child`, which is why **`Kind=child-last` is a variant and not a boolean**:
Figma cannot give a boolean a per-variant default (§2.23.3), and the last child of a group is a
position, not an option.

### 2.24.5 Every colour, traced to the palette

24 distinct paints across the two tables, **5 of 148 bound**. Nine roles cover all of them.

| Role | Source | ZF primitive | ΔE | Note |
|---|---|---|---|---|
| `table/head` | `#FAFAFD` · `#FAFAFF` | `neutral/400` `#F0F1FA` | 4.35 · 3.74 | moved on purpose — §2.24.2 |
| `surface/hover` | `#FAFAFF` | `neutral/300` `#F5F6FC` | **1.56** | Type 1's hovered row |
| `border/divider` | `#EDEDF7` · `#EBEAF2` | `neutral/500` `#E9EAF5` | **1.26 · 1.69** | row rules and cell rules, one value |
| `border/default` | `#E4E4EF` · `#E4E4F0` | `neutral/600` `#DFE0EB` | **1.53 · 1.63** | the outer border, drawn twice **0.52 ΔE apart** |
| `text/secondary` | `#6C718A` | `neutral/1200` `#6A6E85` | 1.66 → **9.48** | the nearest step has no role — see below |
| `text/default` | `#222222` · `#292E40` · `#31384D` · `#21263C` | `neutral/1900` `#222536` | 12.18 · 4.18 · 8.95 · 3.52 | **four body-text values become one** |
| `primary/text` | `#2577F0` · `#1B6DE0` | `blue/1400` `#1C5BD9` | 12.84 · 11.44 | both links; **4.22:1 → 5.92:1** |
| `primary/default` | `#408DFB` | `blue/1200` `#3874EB` | 12.47 | the sort caret — the unowned bright blue again |
| `success/text` | `#197B55` | `green/1600` `#095C3B` | 12.71 | surplus; 5.24:1 → **8.06:1** |
| `danger/text` | `#CC2132` | `red/1500` `#A62932` | **17.86** | shortage; 5.48:1 → **7.04:1** |
| `icon/default` | `#58627F` | `neutral/1300` `#565A70` | 5.41 | pins, collapse chevrons, overflow |
| — *dead fill* | `#D8D8D8` | `neutral/600`, 6.49 away | — | **a fill under every 1px divider stroke, never seen** |

**Three link blues.** `#2577F0` and `#1B6DE0` are **4.74 ΔE** apart and `#408DFB` is the sort
caret — all three unowned, and open item 25 now stands at eight independent appearances.

**`#CC2132` is 14.08 ΔE from the nearest red in the palette.**

**Every 1px divider is a vector with an `#EDEDF7` stroke over a `#D8D8D8` fill** — a second
colour on 17 nodes that nothing can ever render. Same class as a backing rectangle behind a
glyph (§2.21.9): a colour in the file that is not a colour on screen.

**`text/secondary` is where the nearest step and the right role disagree, with a measurement
behind it.** `#6C718A`'s nearest step is Neutral 1200 at 1.66 ΔE, which has no role.
`text/tertiary` is 1.82 away and reads **4.02:1** on the header band — below 4.5:1.
`text/secondary` is 9.48 away and reads **6.04:1**. The larger move is the accessible one, which
is §3's *Bind to the role, not to the nearest step* with numbers.

### 2.24.6 Properties

| Property | Type | On | Note |
|---|---|---|---|
| `Style` | VARIANT | head cell · cell | `list` = no rule, 12 inset · `grid` = right rule, 20 inset |
| `Align` | VARIANT | head cell · cell | `left` · `right` — a numeric column right-aligns both |
| `Sort` | VARIANT | head cell | `none` · `asc` · `desc` |
| `Icon` | VARIANT | cell | `none` · `leading` · `trailing` |
| `Value` · `Label` | TEXT | cell · head cell | one per cell, through the exposed instance |
| `Glyph` | INSTANCE_SWAP | cell | the leading or trailing 16px slot |
| `Tone` | VARIANT | delta | `positive` · `negative` · `zero` |
| `State` | VARIANT | link · action · list row | list row: `default` · `hover` · `selected` |
| `State` | VARIANT | grid index | `collapsed` · `expanded` · `child` |
| `Kind` | VARIANT | grid row | `parent` · `child` · `child-last` |
| `alert-rule` | hidden layer | cell · delta cell | a 1px `danger` rule on the cell's left edge |

**Every cell in an assembled row is an exposed nested instance**, which is the only way a
7-column row can carry 7 editable values: a parent `TEXT` property cannot reach inside an
instance (§2.23.3), so the values live on the cells and the cells are exposed. `alert-rule` is a
hidden layer rather than a boolean for the same reason — a boolean would default the same way on
every variant of every row.

`Style` is one axis carrying both the rule and the inset, and that is deliberate. It is not two
dimensions: it is one — *is this a bordered grid cell or a borderless list cell* — and a bordered
cell needs more inset than a borderless one because the border crowds the text. It emits one
class, `.zf-table-cell--grid`.

### 2.24.7 Selector strategy

```
.zf-table                          /* both */
.zf-table--list | --grid
.zf-table__head
.zf-table__th                      /* aria-sort on the th, button inside */
.zf-table__tr                      /* --hover --selected */
.zf-table__td                      /* --right --grid */
.zf-table__td--alert               /* border-left: 1px solid danger */
.zf-table__index                   /* the merged # cell */
.zf-table__tr--child               /* rule inset by the # column width */
.zf-table__tr--child-last          /* :last-child — full-width rule */
.zf-table__delta                   /* --positive --negative --zero */
.zf-table__action                  /* the split link */
```

Type 1 is a `<table>`. **Type 2 is a `treegrid`, not nested tables** — one table whose rows carry
`aria-level` and `aria-expanded`, because the children are rows of the same grid and not a table
inside a cell. Getting that wrong is the most common way a hierarchical table becomes
unnavigable.

The `#` column's merged appearance is presentational: in code the cell is not merged, the child
rows' `border-bottom` simply starts after it. Do not reach for `rowspan` — it breaks row
selection, sorting and virtual scrolling.

### 2.24.8 Accessibility

| Requirement | Verdict | Detail |
|---|---|---|
| Header label — 1.4.3 | ✅ **passes** | 6.04:1 on the band Light, 8.15:1 Dark |
| Body text — 1.4.3 | ✅ **passes** | 15.15:1 Light, 15.00:1 Dark |
| Link — 1.4.3 | ✅ **fixed** | the source's `#2577F0` was **4.22:1** — a fail at 13px. `primary/text` is 5.92:1 Light, 7.69:1 Dark |
| Surplus — 1.4.3 | ✅ **fixed** | `#197B55` 5.24:1 → `success/text` 8.06:1 Light, 11.38:1 Dark |
| Shortage — 1.4.3 | ✅ **fixed** | `#CC2132` 5.48:1 → `danger/text` 7.04:1 Light, 9.27:1 Dark |
| Sort caret — 1.4.11 | ✅ **passes** | `primary/default` 4.32:1; the source's `#408DFB` was 3.27:1 |
| Row rule — 1.4.11 | — **n/a** | 1.19:1, and exempt: a divider is decoration, not a control boundary |
| Checkbox border — 1.4.11 | ❌ **fails** | the source is `#AEB0C8` at **2.13:1** and the system checkbox is no better. **A checkbox's border is its only affordance** |
| Checkbox in Dark | ❌ **fails** | the system checkbox binds its fill to the `base/white` **primitive**, so it stays white in Dark |
| Colour is not meaning — 1.4.1 | ⚠️ **review** | `+ 03` and `− 10` carry the sign as well as the colour, which is correct. The red triangle needs a text alternative |
| Sort state — 4.1.2 | ⚠️ **review** | `aria-sort="ascending"` on the `th`, and the button must be the `th`'s content |
| Expand control — 4.1.2 | ⚠️ **review** | `aria-expanded` on the row's toggle, `aria-level` for the group |
| Row selection — 4.1.2 | ⚠️ **review** | the header checkbox needs an indeterminate state and a label naming what it selects |
| Table semantics — 1.3.1 | ⚠️ **review** | a real `table` with `th scope="col"`; the grid is a `treegrid` |
| Target size — 2.5.8 | ⚠️ **review** | the 12px checkbox needs the row cell as its hit area, not the box |

### 2.24.9 Traps worth recording

**A colour that means two things.** `#FAFAFF` is Type 2's header band and Type 1's hovered row.

**Two greys one hex digit apart.** `#E4E4EF` and `#E4E4F0`, five uses each, **ΔE 0.52**. Nobody
chose two values; somebody sampled the same border twice.

**An alignment edge made of words.** Numbers right-aligned to the width of the header's text.

**A fill under a 1px stroke.** 17 divider vectors carry a `#D8D8D8` fill beneath an `#EDEDF7`
stroke.

**Four values for one meaning.** Body text spans 17.59 ΔE.

**One component drawn, one instanced.** The same checkbox, by hand at 14 and as an instance at 12.

**A theme-blind primitive inside a reused component.** The system checkbox binds its fill to
`color/base/white` rather than `surface/default`, so **every checkbox in the file stays white in
Dark mode**. Reusing it was correct — and it is the only thing keeping these tables off 100%
`ZF Semantic`: 16 primitive bindings and 16 remote ones, all from that one component. Open item 38.

**A row height nobody chose.** A 9px gap under one header; a first row 5.5px taller than its
siblings.

**A spacer that stopped filling.** `resize()` after `layoutSizingHorizontal = 'FILL'` silently
returns the node to `FIXED`, so a trailing icon that should sit at the cell's right edge sat next
to the label instead. **Set the sizing mode last** — the same ordering trap as §2.23.8 and the
opposite of the avatar's in §2.22.10.

**A table with no flexible column.** Every column fixed means the surplus width has nowhere to go,
so it collects at the right edge as void space — up to 207px of it — and the last column's content
drifts away from the border. One column must grow, and it is the primary text column. §2.24.10

**A trailing element anchored to the text instead of the cell.** The action divider and caret
followed the label's width, so one long label moved them 16px right of the other five. Measured
in §2.24.10, and present in the source too.

**A chevron standing in for an arrow.** A sort indicator is an arrow — it points the direction the
values run. A chevron points at something. They are not interchangeable and the source used the
arrow; the first build did not. §2.24.10

**`findAll` returns the first match, not the right one.** The alert rule was switched on in the
wrong cell because both the name cell and the delta cell contain a layer called `alert-rule`.
Scope the search to the cell, not to the row.

### 2.24.10 The sort arrow, and getting the action column to line up

Two corrections after the first build. Both were mine, and one of them exposed a real problem in
the source.

| What | Was | Now |
|---|---|---|
| Sort indicator | `icon / chevron` Up and Down — **a chevron, not an arrow** | `icon / arrow-up` · `icon / arrow-down`, from your own vector path. 10.38 × 13 in the 16px slot |
| Action divider · caret | followed the label: **x=1223 on five rows, 1238 on the sixth** | **x=1231 on all six**; the caret is x=1240 on all six |
| Action label | hugged its text, so a longer label pushed the divider right | **fills the cell and truncates**, so the divider cannot move |
| Actions column | 226 — **narrower than its own longest label needs (214)** | **250**, which makes the grid table 1275 |
| Surplus width | **nowhere — every column was fixed, so it pooled at the right edge** | the name column is flexible and absorbs it |
| In the source | the divider sat at **1247.5** on five rows and **1263.5** on the sixth | — |

**The drift was not a rounding error, it was a layout with no anchor.** A hugging label followed
by a divider puts the divider wherever the text ends, so "Create Transaction Order" moved it 16px
right of every other row — and the source does the same thing, 1247.5 against 1263.5.

The fix is to **give the label the cell and let it truncate**. The trailing group is then always
flush against the cell's right inset, so the divider and the caret land on the same x on every row
no matter what the label says. In CSS that is `flex: 1` plus `text-overflow: ellipsis` on the
label, with the trailing group as a sibling — not a margin, which would drift again the moment
someone translates the string.

**Widening the column is part of the same finding.** "Create Transaction Order" needs 165px, plus
12 of space and 25 for the divider and caret — 202 inside a 210 inner width. At 226 the column was
**24px short of holding its own content**, which is why the label was pushing the divider at all.
Every other column keeps its width, so Required at 647.46, Available at 808.26 and Shortage at
1004.27 are unchanged; only the table's right edge moves out by 24.

**A general rule falls out of it.** Any cell whose content ends in a fixed trailing element — a
caret, a unit, a percentage sign, an icon — needs the *text* to be the flexible part. If the text
hugs, the trailing element becomes a function of the string, and a table's worth of them stops
being a column.

**And one column has to be flexible, for the same reason at table scale.** A table wider than the
sum of its columns has nowhere to put the surplus, so it pools at the right edge as void space and
the trailing content drifts away from the table's border. In a table the flexible column is always
the primary text column — `Plan Name` in Type 1, `Item / Location` in Type 2. Every other column
keeps its width:

| Width | Surplus goes to | Right inset — Type 1 | Right inset — Type 2 |
|---|---|---|---|
| at base — 1285 · 1275 | `Plan Name` · `Item / Location` | **12** | **20** |
| stretched to 1480 | the same column, +195 · +205 | **12** | **20** |
| before this fix | nowhere — it pooled at the right edge | up to **207** of void | up to **205** of void |

The inset does not move, which is the test: a column layout that only works at one width is not a
column layout. In CSS this is `table-layout: fixed` with widths on every `col` except the name
column, or `flex: 1` on that one cell if the rows are flex.

### 2.24.11 Issues found in the Figma source

| # | Status | Issue | Resolution | Where |
|---|---|---|---|---|
| 1 | ✅ **resolved** | 164 nodes, 148 paints, **5 bound**, 11 auto-layout frames. | **Done** — 13 components, 571 paints, all bound, 0 raw. | all |
| 2 | ✅ **resolved** | Two header heights (35, 33) and, in Type 2, three row heights (40, 39.5, 45.5). | **Done** — one header at 36, one row height per table. | all |
| 3 | ✅ **resolved** | Type 1 had **no cell inset** — text began 1.25px after the column boundary. | **Done** — 12 for the list, 20 for the grid. | `zf-table-cell` |
| 4 | ✅ **resolved** | Numeric columns right-aligned to the header **label's** width, not the column's. | **Done** — header and data share the column's right edge. | `zf-table-head-cell` |
| 5 | ✅ **resolved** | Four body-text values, 17.59 ΔE apart at the extremes. | **Done** — `text/default`. | all |
| 6 | ✅ **resolved** | Three link blues, two of them 4.74 ΔE apart. | **Done** — `primary/text`, which also fixes a 4.22:1 fail. | links |
| 7 | ✅ **resolved** | `#E4E4EF` and `#E4E4F0`, ΔE 0.52, five uses each. | **Done** — `border/default`. | outer border |
| 8 | ✅ **resolved** | Every 1px divider carried a `#D8D8D8` fill under its stroke. | **Done** — one bound stroke, no fill. | dividers |
| 9 | ✅ **resolved** | Type 1's header fill was 1.02:1 against a row — present in the file, absent on screen. | **Done** — `table/head`, 1.12:1. | `ZF Semantic` |
| 10 | ✅ **resolved** | No hover, selected or focus state on any row; no sort direction other than one asc caret. | **Done** — three row states, `Sort` on every head cell. | rows · head cells |
| 11 | ✅ **resolved** | Two checkboxes: hand-drawn 14 × 14 in Type 1, instanced 12 × 12 in Type 2. | **Done** — one instance of the system checkbox at 12. | select cells |
| 12 | ✅ **resolved** | The avatar in Created By is **26px** — not one of the four declared sizes. | **Done** — `zf-avatar` at 24. Third off-scale avatar; open item 33. | `zf-table-user` |
| 13 | ✅ **resolved** | No Dark values existed. | **Done** — both panes, one new role (`table/head`). | `ZF Semantic` |
| 14 | ⚠️ **open** | The system checkbox binds its fill to `base/white` and its border to a remote library, so it is white in Dark and 2.13:1 in Light. | Open item 38 — rebind to `surface/default` and `border/strong`. One change fixes every checkbox in the file. | `checkbox` |
| 15 | ⚠️ **open** | `#CC2132` is 14.08 ΔE from the nearest red; `#408DFB` and `#2577F0` are unowned blues. | Open item 25, now at eight appearances. §2.24.5 | `ZF Primitives` |
| 16 | ⚠️ **open** | Column widths are fixed in the component and every product will want different ones. | Decide whether widths are a token set, a per-product override, or content-driven. A 7-column component is a sample, not a contract. | both tables |
| 17 | ⚠️ **open** | `aria-sort`, `aria-expanded`, `aria-level`, the treegrid role, and the indeterminate header checkbox. | Code requirement — §2.24.7 · §2.24.8. | Implementation |

---

---

# 3. Conventions

## Naming

- CSS class prefix: `zf-`
- Custom property prefix: `--zf-`
- Primitives: `--zf-{family}-{step}`
- Semantics: `--zf-color-{role}`
- Component classes: `.zf-{component}--{modifier}`

## Component set surfaces

Every component set root carries `surface/default`. A set with no fill exports on
transparent, which renders as white in a PNG and vanishes on a dark canvas — so an
unfilled set looks correct in every screenshot and wrong in the editor. Measured on
this file: **64 component sets, 52 of them `zf-`, and exactly one carries no fill** —
`LHS Navigation`, your source set. Check this on any new set before reviewing it
visually.

## Count the bound paints before you look at anything

The first measurement on any component is `solid paints` versus `bound paints`. Not
because binding is the goal, but because the ratio names the problem:

| Bound | What it means | Example |
|---|---|---|
| all, to roles | nothing to find here | |
| all, to primitives | a role is missing, or the ladder is wrong | Button, open item 17 |
| all, to a remote library | the name may be right and the value wrong | §2.15.2, open item 21 |
| some | drift — measure the ΔE of the rest | accordion, 0.71 ΔE (§2.16) |
| **none** | either nobody bound it, **or it is not this design system** | popup modal (§2.14.1), date range picker (§2.18.1) |

**And count *where* they bind, not just whether.** The sidebar navigation (§2.20.1) had
**755 of 803 paints bound — 94%, the best ratio in this file — and not one of them to
`ZF Semantic`.** Every binding pointed at a remote library. A component can pass this
check perfectly and still share nothing with the system it ships inside.

The last row is the one worth stating. A component with **zero** bound paints and a
tight internal palette is not unfinished — it is finished, somewhere else. The date
range picker's 204 paints were all Tailwind v4, consistent with each other and
consistent with nothing here, and it rendered beautifully. Nothing about looking at it
said so. The count did.

## One axis, one dimension

A variant axis holds exactly one dimension. If a value from axis A can sensibly
co-occur with a value from axis B, they are two axes.

Five components arrived with this wrong in the same way — the Button's `Accent Color`
mixed intent with emphasis (§2.7.2), the Pill's single axis mixed hover with active
(§2.8.2), the Wizard's `State` mixed progress with interaction (§2.9.5), the segmented
control's only axis varied content composition while selection was not an axis at all
(§2.10.1), and the stepper's `State` carried four dimensions including a compound value
(§2.11.2). It is by a wide margin the most frequent modelling error in this file.

Three tests before adding an axis:

1. **Can two of its values be true at once?** Then it is two axes.
2. **Does it change what the component *contains* rather than what it *is doing*?**
   Then it is a boolean or an instance-swap property, not a variant.
3. **Is any value two values concatenated?** `Error On Click` is the whole diagnosis in
   one string. If a compound value exists, the axis is already carrying two dimensions
   and the other compounds are missing.
4. **Does one value mean "ignore another axis"?** Then the two are one axis. The
   avatar's `Color=None` and `is_image=yes` were the same statement made twice
   (§2.22.1) — together they claimed 56 combinations and defined 28, and Figma resolves
   the undefined half to whatever it finds rather than erroring.

**Test 2 has an exception, and it is worth naming precisely.** An axis may change what the
component contains when the values are **mutually exclusive alternatives rather than additive
options**. The page header's `Type` (§2.23.1) is three different leading regions — a switchable
view name, a plain title, a title with a parent and a way back — and a page is exactly one of
the three. That is one dimension with three values. Compare the accordion's `Expanded`, which
*adds* content to what is already there: that is a boolean. The question to ask is whether the
values could ever be combined. If combining two of them is meaningless, they are values on an
axis; if combining them is a real state, they are booleans.

And once the axis exists, **set it to every value and count what actually moves.** The
colour picker's `Nose` was drawn wrongly in three of four variants (§2.12.1); the
accordion's `Expanded` toggled one of its six sections and left five carrying hidden
content no property could reach (§2.16.1). Both looked right in the default state, which
is the state everyone reviews.

A slash counts too, and it fails differently. The modal's `Right/Left Creative Aligned
Modal` (§2.14.4) was one value naming two placements, and **only one of them was ever
drawn** — so the axis under-delivered rather than over-collapsed. Both are the same
tell: read every value as a sentence, and if it contains "and", "or" or a slash, it is
two values.

The second test is what collapses 24 variants to 8 on the segmented control and what
collapsed the Button's icon variants in §2.7.3.

**A preset axis is the exception, and it has to earn the name.** A container may carry
an axis whose values *select among* property combinations that already exist below it —
`zf-segmented`'s `Content` is one (§2.10.2). It qualifies only when all three hold: the
properties exist and every combination is reachable through them, the axis adds no
capability, and it emits no class in code. If any of the three fails, it is not a
preset; it is the error above wearing a better name.

## What a component property cannot do

Two limits in Figma's property model, both measured on the page header (§2.23.3), because
together they decide how any container component has to be shaped.

**A non-variant property holds one value for the entire set.** Attaching a boolean to a node
collapses that node's visibility across every variant to the property's single default — and
then setting one variant moves all of them. There is no such thing as a per-variant default for
a boolean, a text or an instance swap.

**A property cannot cross an instance boundary.** A parent `TEXT` property cannot reach a text
node inside a nested instance. Exposing the instance surfaces *its* properties separately; it
does not let the parent drive them.

Three consequences follow, and they are the standard moves:

1. **Anything that must default differently per variant belongs to the variant, not to a
   property.** The page header's back button, eyebrow and caret are part of `Type` for exactly
   this reason.
2. **A nested instance's *variant* selection is stored per node**, so a nested component set is
   the escape hatch: each parent variant can point at a different variant of the child, and the
   child's axes still show up in the panel when the instance is exposed. `zf-header-actions`
   exists only because of this.
3. **If one text property must drive content that appears in more than one composition, the text
   node has to be owned by the component**, which sometimes means inlining a child's layout
   instead of instancing it. Record it when you do — it is duplication, and the reason for it is
   not visible in the file.

The general shape of the rule: **variant axes are per-variant, everything else is per-set.**

## Bind to the role, not to the nearest step

Every component in this file gets its source colours matched by ΔE against `ZF Primitives`, and
most of the time the nearest step and the right role agree. When they disagree, **take the
role.**

The page header's caret was `#528EF4`. Its nearest step is `blue/1100` at 7.45 ΔE, which has no
role; the owned interactive blue is `primary/default` at 15.32 ΔE. Binding to `primary/default`
moves the colour further and makes it correct: the caret means *this opens a menu*, which is the
same thing a link or a focus ring means, and it lifted contrast from 3.21:1 to 4.32:1 on the way.
Binding to `blue/1100` would have preserved the pixel and taught the system nothing.

So the ΔE column in every §*.x* colour table is not a score to minimise. It measures **how far
the source was from the system**, which is the interesting number whether it is 0.85 or 16.44.
A large ΔE against a correct role is a finding about the source. A small ΔE against a primitive
with no role is open item 17 waiting to happen.

### The markup test

The sharpest form of the axis test is not about dimensions at all:

> **If two values need different HTML, they are different components.**

`Bread crumb` (§2.19.1) held `Without band` and `With Band` on one axis. Both are
horizontal rows of labelled steps, so they look adjacent. But one is
`nav[aria-label=Breadcrumb] > ol > li > a` and the other is `ol[aria-label=Progress]`
whose items are **not links** — a hierarchy versus a sequence. No amount of variant
plumbing makes those one control.

Apply it before the other three tests. It is faster, and it catches the case they miss:
two values that share a shape but not a meaning.

## Overlap: interlocking versus compensating

Negative gaps and overflowing children turn up whenever something is being made to look
continuous. Two of them are now recorded, and they are not the same defect:

| | §2.18.2 date picker | §2.19.7 step trail |
|---|---|---|
| What | day cells 36px wide, **33.28px apart** | segments at **`itemSpacing: −2`**, one vector 5px wider than its frame |
| Why | to make the range band continuous | because a chevron's point *is* the next notch |
| Remove it and | the band still draws — a zero-gap row gives it for free | **the drawing breaks** |
| Verdict | **illegitimate** — it was faking a gap away | **legitimate** — the shapes genuinely interlock |

**The test is whether removing the overlap breaks the drawing or only the illusion.**
Where it is legitimate, state it: the trail's `−14` equals the notch depth, so it is a
number with a reason rather than a number left over from a drag.

## Modes multiply exactly like variants

The one-axis-one-dimension rule is usually applied to component sets. It applies to
**variable collections** in exactly the same way, and the cost of getting it wrong is
higher because a mode table has no visual to review.

The sidebar's remote `Color Modes` collection had four modes — `LightPane-Blue`,
`DarkPane-Blue`, `LightPane-Red`, `DarkPane-Red` — fusing **pane lightness × brand hue**.
Of its 12 live tokens, 5 varied with pane alone, 3 with hue alone, 2 with neither, and 1
with both. So **two thirds of the table was duplicated data**, and the single token that
genuinely varied on both had already drifted: `DarkPane-Red` reused the Blue value,
because nothing makes you keep four cells in step.

Split them, and each dimension gets its own collection:

| Collection | Modes | Holds |
|---|---|---|
| `ZF Semantic` | Light · Dark | everything that depends on the surface |
| `ZF Brand` | Blue · Red · … | everything that depends on the brand hue |

A third hue then costs **one mode and five values**, not four modes and twelve. And the
red-fails-where-blue-passes contrast bug (§2.20.9) becomes visible, because the two hues
now sit in one column instead of in different rows of a cross-product.

**Two tests before adding a mode.** Does every variable in the collection actually change
across it? If some do not, they are being duplicated. And can you name the mode without a
hyphen joining two nouns? `DarkPane-Blue` fails both.

## Check the sizing mode, not the measurement

Two variants of the side panel both measured 460 × 769. One was `FIXED/HUG` and the
other `FIXED/FIXED`, and their bodies were `FILL/FIXED` and `FILL/FILL` (§2.17.1). They
agreed only because the hugging one's contents happened to add up. Nothing was wrong
yet — the divergence was scheduled for whenever someone put real content in.

A measurement is what a sizing mode produced today. Read the mode.

The same reading catches the popup modal's 800 × 600 frames wrapped around hugging
content (§2.14.2), and the accordion's collapsed and expanded variants built as two
different structures (§2.16.3).

## Bound is not the same as correct

A binding says a paint *has* a variable. It says nothing about whether the variable
means what the layer claims. The banner shipped `Warning Banner` on `Red/400` and
`Alert Banner` on `Orange/400` — both bound, both internally consistent, both the
opposite of what §1.2 defines (§2.13.1). Every automated check in this file passed on
it.

So the audit has two halves, and only the first can be scripted:

1. **Is every paint bound, to this file's collections, with a literal that matches?**
   Countable. Run it on every component. *To this file's collections* is load-bearing:
   the remote legacy library uses the same `{family}/{step}` names on an incompatible
   scale, and its `Neutral/900` is **58 ΔE** from ours (§2.15.2). A binding to a
   familiar name can still be a binding to the wrong library.
2. **Does each bound role mean what the layer or axis value says it means?** Read it,
   one axis value at a time. Nothing catches this but attention.

The second check is also what catches an axis whose values are drawn wrongly
(§2.12.1) — the failure is never in the value, it is in the gap between the value and
its name.

## The one rule

A component may reference a semantic token. It may not reference a primitive, and
it may never contain a literal hex value.

```css
✅  color: var(--zf-color-text);
❌  color: var(--zf-neutral-1900);   /* skips the semantic layer */
❌  color: #222536;                  /* invisible to the system */
```

Both wrong forms render identically today. They only break later, when the theme
changes and they do not follow.

**The rule governs chrome, not content.** A colour the *theme* owns must go through a
role. A colour the *user* picks, or that is a fact about colour itself, is data and
stays raw: the colour picker's hue wheel, its saturation field, its 63 preset swatches
and its preview chip (§2.12.3). The test is not "is it a colour" but **"does the theme
own it?"** — nothing in that list changes when the file goes dark, while the card behind
them does.

Do not reach for this exception to justify a hard-coded brand colour. Twelve components
in, it has applied exactly once, and it was settled by measurement: the swatches sit at
a **median ΔE 13.3** from the nearest primitive (§2.12.4). At ΔE 1.3 they would have
been bound.

**What the rule actually prevents is drift you cannot see.** The accordion carried
`#21263C` *and* `#21263D` for one body colour, and `#6C718A` *and* `#6B708A` for one
column header — both pairs **0.71 ΔE** apart, closer than any monitor or eye resolves,
and spread across 34 and 10 nodes (§2.16.2). Nobody chose them. They arrived by paste
and nudge and then propagated, and no review that is not a script will ever find them.

## Layer flow

```
Primitive  →  Semantic  →  Component
198 values    role names    consumes semantics only
```

Flow is one-directional. Nothing reaches backwards.

---

# 4. Open items

| # | Item | Blocked on |
|---|---|---|
| 1 | Five Figma source fixes | Your decision — §2.1.10 |
| 2 | Status scales for banner, toast, icon, inline validation | Awaiting those designs |
| 3 | Full type scale | Awaiting typography design |
| 4 | Full spacing scale — confirm 2px vs 4px base | Awaiting layout design |
| 5 | Full radius scale | Awaiting further components |
| 6 | Surface, border, and icon semantic groups | Awaiting Figma variable groups |
| 7 | Which primitive step each theme's primary uses | Awaiting button design |
| 8 | Tab focus state, hover surfacing, count badge, structural rebuild | The external library — §2.6.10 issues 9–13. Not editable from `Tin-Tin` |
| 9 | `--zf-color-focus` and `--zf-color-accent` | Your decision — one value each, replacing five blues. §2.6.9 |
| 10 | §1.7 assumes stroked icons — it gives the wrong constraint and the wrong weight for filled ones | Amend §1.7 to cover filled icons: SCALE constraints, and a stroke-to-glyph ratio rather than a fixed 2px. §2.8.5 |
| 11 | §1.7 specifies a fixed 2px stroke; optical weight depends on the stroke-to-glyph ratio, not the stroke alone | Amend §1.7 to state a ratio. Two components now put the figure at **1 : 9**, not 1 : 8 — §2.7.6 and §2.10.8. Density matters too: a glyph made of four shapes needs a lighter stroke than one made of three lines. |
| 12 | **No border role in the system reaches 3:1 on white** — `border/default` 1.31, `border/strong` 1.71, `border/hover` 2.85. Nine components fail 1.4.11, and the selected segment's surface at 1.12:1 is the same root cause | Your decision — add `border/control` at Neutral 1100 (4.52:1 on white, 4.02:1 on the sunken track). This is a gap in the semantic layer, not one component's mistake. §2.10.7 · §2.11.7 |
| 13 | §1.7 states a 16×16 slot; five components now instance icons at 14px | Amend §1.7: the glyph is authored at 16, the slot is a per-component decision. §2.10.8 |
| 14 | Focus rings are 2px everywhere except the Input Field, which is 1px | Standardise on 2px, at a 3px offset with a concentric radius. §2.11.10 |
| 15 | `zf-stepper-field` duplicates label and help-text furniture the Input Field takes from the legacy library | Promote `zf-label` and `zf-help-text` to local shared sets when §2.5 is migrated. §2.11.8 |
| 16 | Four components now depend on read-only library sets — Tab, Status Badge, the old Stepper Button and the old Color Mode Options | Decide whether `Tin-Tin` owns these or the library does. Until then every fix is a local twin plus a swap. §2.11.10 · §2.12.1 |
| 21 | The remote legacy library shares `{family}/{step}` names with `ZF Primitives` on **incompatible scales** — `Neutral/900` differs by **58 ΔE**, `Blue/700` by **60 ΔE** | Rename one side, or retire the dependency. Until then a binding to a familiar name is not evidence of a correct binding. §2.15.2 |
| 22 | **There is no table component**, so the accordion's three original data-table bodies cannot be authored properly | Author `zf-table`, then swap it into `zf-accordion-item`'s `Body`. §2.16.6 |
| 23 | Four components now use an `INSTANCE_SWAP` body slot with a placeholder — accordion, side panel, popup modal, popover | Decide whether these placeholders ship or whether each product supplies its own. They are scaffolding, not design. §2.16.6 · §2.17.5 |
| 17 | ~200 Button paints are bound to **primitives** rather than roles, and the intent ladder is `{hue}/1200·1400·1200·800` | The intent-ladder decision. Binding `color/blue/1200` → `primary/default` is zero-change; the other three hues move a step. 72 variants. §2.12.9 |
| 18 | The colour picker's saturation field has no native control, so no keyboard behaviour | Code requirement: `role="application"`, 2-D arrow keys, announce the value. §2.12.8 |
| 19 | `overlay/scrim` is the first role with an alpha channel, and there is no elevation or overlay group in §1.2 | Add an `overlay/` group alongside the elevation scale §2.8 already asks for. §2.14.6 |
| 20 | Modal focus trapping, focus return and Esc-to-close cannot be expressed in Figma | Code requirement, recorded so it is not found late. §2.14.7 |
| 24 | **`primary/hover` and `primary/selected` resolve to the same hex** — `#2762D9`. Hovering anything already selected renders no change, system-wide | Move `primary/hover` one step (Blue 1300) or accept that selected outranks hover and say so in §1.2. Both bindings are correct; the values are not distinct. §2.18.10 |
| 25 | **The palette does not own its blues.** `#408DFB` is 10.69 ΔE from `color/blue/1100` and appears in Input Field (§2.5.3), Wizard (§2.9.4), Popup modal (§2.14.1), Breadcrumb (§2.19.3) and now the table sort caret (§2.24.5). The page header (§2.23.4) adds `#528EF4`, **4.79 ΔE from `#408DFB` — the same intended colour drawn twice** — and `#1B6DE0` on the primary button, 4.07 from `blue/1200` and 6.26 from `blue/1300`, close to both and equal to neither. The tables add `#2577F0`, **4.74 ΔE from `#1B6DE0`** — the same second colour drawn twice. **Eight appearances, three intended values, none owned** | Two decisions, not one. **A bright blue** around `#4A8DF8` is being chosen independently in six places, so it is a value the system needs or must forbid. **A deep blue** near `#2077E8` sits between two existing steps — either it replaces one or it goes. Eight independent appearances is not drift; it is a palette someone keeps reaching past. |
| 26 | **The inverse pair is incomplete.** `text/inverse` and `icon/inverse` existed; `surface/inverse` and `surface/inverse-hover` were added in §2.19.6. There is still no inverse **border** role, so a dark surface cannot carry a divider or a boundary | Add `border/inverse`. Until then, adjacent segments on a dark trail have no visible seam. §2.19.6 |
| 27 | The remote `Color Modes` collection is the LHS theme's source of truth, and **34 read-only component sets** feed the rail. It also contains `mauve/11`, a Radix token with no value in any of its four modes, still bound on two nodes | Same ownership decision as open item 16, at a larger scale. `ZF Brand` now covers the hue dimension locally, so the dependency can be retired once the rail ships. §2.20.1 · §2.20.4 |
| 28 | Collapsed rail labels truncate at 42px to ambiguous stubs — *Filing…*, *Custo…*, *Recei…* | **Your decision, taken:** keep the stub as drawn. Code must supply a tooltip and an `aria-label` carrying the full name, or the 72px rail is unusable by sight. §2.20.6 · §2.20.9 |
| 29 | `ZF Brand` ships with Blue and Red because that is what the source had. The hue looks like a per-product choice, not a two-value one | Confirm the full hue set — one new mode and five aliases each. Adding them now is cheap; adding them after the rail is instanced everywhere is not. §2.20.4 |
| 30 | ~~Parent-active rests on weight alone~~ — **closed** | `nav/item-selected` moved to Neutral 700 (Light) and Neutral 1500 (Dark), lifting selected-versus-hover from 1.10:1 to 1.28:1 and 1.55:1. Revert to Neutral 600 if you want it subtler. §2.20.5 |
| 31 | **The top bar and the sidebar's logo band are one step apart** — `chrome/surface` is `blue/2000`, `nav/brand-surface` is `blue/2100`, because the source drew `#21263C` and `#181C2E` | Decide whether they are the same surface. If the bar and the band ever sit adjacent the seam will show; if the brand only ever lives in the top bar, the sidebar's band is redundant. §2.21.4 |
| 32 | **The product wordmark is a vector in the top bar and a text layer in the sidebar** — `Wordmark` INSTANCE_SWAP versus `Product name` TEXT | Settle one before both ship. Artwork is more faithful; text is translatable and needs no asset per product. §2.21.6 |
| 33 | **The top bar's avatar is 32px, which is not one of the four declared sizes** — 24, 40, 60 and 100. It ships as a separate set, `zf-topbar-avatar` | Either add 32 to the scale as a fifth size, or move the top bar to 40 and retire the second set. A size that exists in one place only is a size the system does not have. §2.21.5 · §2.22.5 |
| 34 | **Which tint a person gets is undefined.** The source picked by hand, so the same face can be green on one screen and red on the next | Hash the name in code and map to the six tints. It is three lines and it has to be decided once, because it becomes identity. §2.22.8 |
| 35 | **No neutral step lands near 3:1.** The ramp goes 2.85:1 at `neutral/1000` straight to 4.52:1 at `neutral/1100`, so no value exists for a control border that must meet 1.4.11. `border/default` is 1.31:1 | Add a step around 3.1:1, or state in §1.2 that a control's boundary is never its only affordance and the glyph or label carries identification. Until then every bordered control in the file is in the same position. §2.23.7 |
| 36 | **The icon set mixes stroked and filled glyphs with no rule** — measured: **29 filled, 13 stroked, plus the four-variant `icon / chevron` set**. The two recolour through different properties, and a rebind script has now missed the odd one out four times | **Filled should win, and there is now a measurement behind that.** `SCALE` constraints scale geometry but **not `strokeWeight`**, so a stroked glyph in a 32px slot draws its outline at 16px weight and reads hairline (§1.7.6). Filled glyphs survive a resize intact; stroked ones do not. Converting the 17 is a day's work and it closes both this and the rebind-miss class of bug. §1.7.4 · §2.23.10 |
| 39 | **`zf/overline` is the only non-integer line-height and the only pixel-unit tracking in the scale** — 11 / 17.6 with +0.6px, kept as drawn so no table header moves | Either accept it as the one exception, or move to 11 / 16 with +5.5% and re-centre every table and column header row by 0.8px. Percent tracking is the version that survives a size change. §1.4.2 · §1.4.5 |
| 40 | **`zf-tab` has not been migrated.** 8 off-scale type combinations including `11.25 / AUTO Semibold +1.13px UPPER` — a non-integer size, an unresolvable line-height, a misspelled weight and pixel tracking in one node — plus the 12 unbound paints in open item 37 | Rebuild it the way every other set was, or retire it. It is the only set that is off-scale in both colour and type, and both `Semibold` survivors are in it. §1.4.4 · §1.4.5 |
| 41 | **13px has two line-heights again if the wizard and step cards keep theirs.** 32 nodes at 13 / 16 against the scale's 13 / 20 | Fold them and accept +4px per card, or declare a documented dense variant. Removing the second 13px line-height is what §1.4 exists to do, so this is not mine to decide. Separately, `zf-avatar-group`'s +N chip runs at 90%, 81%, 79% and 80% of its initial — one ratio, four values. §1.4.3 · §1.4.4 |
| 38 | **The system checkbox is theme-blind and under-contrast.** Its fill is bound to the `color/base/white` **primitive** rather than `surface/default`, so every checkbox in the file renders as a white block in Dark mode; its border is bound to a **remote** variable and measures 2.13:1, where a checkbox's border is its only affordance | Rebind the fill to `surface/default` and the border to something at or above 3:1. It is 16 nodes on one component set and it fixes every table, form and list in the file at once. It is also the only thing keeping §2.24's tables off 100% `ZF Semantic`. §2.24.9 |
| 37 | **`zf-tab` has 12 of its 57 paints unbound** — raw `#FFFFFF` text fills, found by the file-wide audit run in §2.23.10, not by anything on the page header | Unrelated to the page header and recorded so it is not lost. Bind them, or find out whether the white is deliberate on a dark tab and needs `text/inverse`. |
