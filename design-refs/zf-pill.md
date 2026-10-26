# ZF Design Cannon — Pill

**Canon:** §2.9 · **Figma:** `Tin Tin` — page `Pills` (`30:15717`) — component set `zf-pill` (`30:15742`)
**CSS class:** `.zf-pill` · **Measured 2026-08-21 · three fixes applied to Figma the same day.**

> **Applied to `zf-pill` in Figma, and verified:**
>
> | | Was | Now |
> |---|---|---|
> | `Label` / `Icon Swap` wiring | 3 of 8 / **1 of 8** | **8 of 8 / 8 of 8** — 12 references re-attached |
> | Focus ring clearance | `INSIDE`, **0px** | `OUTSIDE`, **2px** |
> | Focus ring on a selected pill | 1.27:1 Light, **1.00:1** Dark | **4.32:1 / 7.69:1** |
> | Selected + disabled label | `primary/on-primary`, **1.65:1** | `text/default`, **9.18:1 / 8.72:1** |
>
> **Also created:** `border/control` in `ZF Semantic`, aliasing `color/neutral/1100` in both modes —
> 4.52:1 Light / 3.58:1 Dark, the first `border/*` role that clears 1.4.11 (§4.4).
> **Nothing is bound to it yet, deliberately** — see §4.4a.

> **This file is the implementation spec, not a transcription of Figma.**
>
> `zf-pill` is the **best-built component in the system** — 8 complete variants, 34 paints, **every one
> bound to a ZF Semantic role**, zero raw hex, zero primitives, zero remote references, padding and
> radius on tokens, a real text style.
>
> It also had **two defects a review cannot see**: `Label` and `Icon Swap` were wired to only 3 and 1 of
> the 8 variants, and the focus ring was invisible on a selected pill. **Where this file and Figma
> disagree, this file wins.** §9 is the code.

---

## 1. What this is

A **filter chip**: a toggle that switches a list or table between subsets. Not a button (no action), not
a badge (it is interactive), not a tab (it does not change a view). §7 has the decision rule.

| | |
|---|---|
| Variants | **8** of 8 — complete |
| Axes | `Selection` (unselected, selected) × `State` (default, hover, focus, disabled) |
| Size | **124 × 26** at the default label, HUG width / FIXED height |
| Properties | `Label` (TEXT), `Icon Swap` (INSTANCE_SWAP) |
| Instances | **18**, every one on the `Pills` page itself |

---

## 2. Two defects a review cannot see

### 2.1 `Label` works on 3 of 8 variants. `Icon Swap` works on 1 of 8.

The set declares both properties correctly. The **`componentPropertyReferences` on the child nodes** —
the wiring that connects a property to the node it drives — is missing from most variants.

**The likely cause, stated as a hypothesis:** `clone()` does not carry `componentPropertyReferences`, so
variants produced by duplicating the first lose their wiring silently.

**Reproduced live.** Setting `Label` on an unwired variant **does not fail, it just does nothing** — the
value is retained and reappears the moment you return to a wired variant. A designer disabling a chip
sees the label snap back to "All Transactions" with no way to tell why.

**Fixed** — 12 references re-attached node by node, never by cloning.

### 2.2 The focus ring is invisible on a selected pill

The ring is 2px, `strokeAlign: INSIDE`, absolutely positioned at (−2, −2) with `STRETCH/STRETCH`. The
constraints are right. The **stroke alignment** is what breaks it: `INSIDE` on a frame inset 2px means
the ring occupies exactly −2 to 0, and the pill's own border starts at 0. **No gap at all**, so the
ring's inner neighbour is the pill rather than the page:

| | Ring vs page (outer) | Ring vs pill (inner) | |
|---|---|---|---|
| unselected / focus — Light | 4.32 ✓ | **3.29** | narrow |
| unselected / focus — Dark | 7.69 ✓ | 6.10 | ✓ |
| **selected / focus — Light** | 4.32 ✓ | **1.27** | ✗ |
| **selected / focus — Dark** | 7.69 ✓ | **1.00** | ✗ **the same variable** |

In Dark, `focus/ring` and `primary/selected` both alias `color/blue/900`. The focus indicator does not
exist.

**Fixed with one property** — `strokeAlign` → `OUTSIDE` moves the band from −2…0 to −4…−2, leaving a
real 2px gap. Both neighbours are now the page: 4.32 / 7.69 on every focus variant. In CSS the
equivalent is `outline` + `outline-offset: 2px` — the identical fix the toggle needed.

---

## 3. Geometry — measured

| Property | Value |
|---|---|
| Size | **124 × 26** — HUG horizontally, **FIXED** vertically |
| Padding | **6 / 10** — `space/3` / `space/5`, bound |
| Gap | **4** — `space/2`, bound |
| Radius | **999** — `radius/full`, bound |
| Border | 1px, `INSIDE` |
| Icon | **12 × 12**, instanced from a **16 × 16** master — §3.3 |
| Label | Inter Medium **11 / 16**, 2% tracking — `zf/label/medium` |

Every geometric value is on a token. Unique in this file.

### 3.1 The vertical padding is decorative

`space/3` = 6, so the declared box is 6 + 16 + 6 = **28**. The frame is `FIXED` at **26**. The fixed
height wins and the effective padding is **5** — not a token, not on the spacing scale.

**In CSS the number lands somewhere else again.** With no explicit height, an `inline-flex` button is
16 + 12 + **2 (border)** = **30px**. Figma's 1px stroke is `INSIDE` and consumes part of its 26; a CSS
border adds to an auto height.

| | Height |
|---|---|
| Figma declares | 28 |
| Figma renders | **26** |
| §9's CSS renders | **30** |

§9 takes **30px** — the only one that keeps the padding on a token instead of on a magic 5. §11 Q2b.

### 3.2 Horizontal geometry is exact

`10 + 12 + 4 + 88 + 10 = 124` ✓. But **124 is not the implementation target**: §9 uses the icon at its
native 16px and a CSS border that adds to the box, so the same chip is
`1 + 10 + 16 + 4 + 88 + 10 + 1 =` **130px**.

### 3.3 The icon is scaled down from 16px, and swapping a stroked icon breaks it

The pill instances 16 × 16 icons at **12 × 12** — a 0.75 resize. For the four preferred (filled) icons
this is harmless. But `Icon Swap` does not restrict the user, and the Icons page holds **51 components,
34 filled and 17 stroked at 1.25px**.

| | At the 16px master | Resized to 12px |
|---|---|---|
| Path geometry | 6 × 6 | 4.5 × 4.5 — scaled ✓ |
| `strokeWeight` | 1.25 | **1.25 — unchanged** ✗ |

**Figma scales geometry on resize but not stroke weight**, so a stroked icon renders proportionally
**33% heavier**. A third of the library will look wrong. **Fix:** use the icon at native 16px. §9 does.

### 3.4 The icon default is semantically wrong

`Icon Swap` defaults to **`icon / learn`** — an open book — on a chip labelled "All Transactions". The
four preferred values are an onboarding set; none is a filter.

### 3.5 The label grows without bound

HUG width · `textTruncation: DISABLED` · `maxWidth: null` · `clipsContent: false`. Filter chips carry
user-generated category names, so this will happen. §9.2 sets a max width with real truncation.

### 3.6 Target size — the first component in the system to pass

124 × **26** clears 24 in **both** dimensions, and §9's 30px clears it with room. The toggle, checkbox
and radio all fail. (2.5.8 is **WCAG 2.2**, not 2.1.)

---

## 4. Colour — 34 paints, all 34 on a role

| Bound to | Paints |
|---|---|
| **`ZF Semantic` roles** | **34** |
| `ZF Primitives` · raw · remote | **0** |

This has not happened anywhere else in the file.

### 4.1 The state matrix

| Selection · State | Fill | Border | Label + icon |
|---|---|---|---|
| unselected · default | `surface/default` | `border/default` | `text/default` |
| unselected · hover | `surface/default` | **`primary/default`** | `text/default` |
| unselected · focus | `surface/default` | `border/default` | `text/default` |
| unselected · disabled | `surface/disabled` | `border/disabled` | `text/disabled` |
| selected · default | `primary/selected` | `primary/selected` | `primary/on-primary` |
| selected · hover | `primary/active` | `primary/active` | `primary/on-primary` |
| selected · focus | `primary/selected` | `primary/selected` | `primary/on-primary` |
| selected · disabled | `primary/border` | `primary/border` | **`primary/on-primary`** — §4.3 |

### 4.2 Contrast, both modes

| | Light | Dark | Needs | |
|---|---|---|---|---|
| unselected label vs fill | 15.15 | 15.00 | 4.5 | ✓ |
| **unselected border vs page** | **1.31** | **1.26** | 3.0 | ✗ §4.4 |
| unselected hover border vs page | 4.32 | 5.86 | 3.0 | ✓ |
| selected label vs fill | 5.48 | 8.62 | 4.5 | ✓ |
| selected fill vs page | 5.48 | 7.69 | 3.0 | ✓ |
| selected hover label vs fill | 6.94 | 10.98 | 4.5 | ✓ |
| **selected disabled label vs fill** | **1.65** | **1.93** | exempt | ✗ §4.3 |
| unselected disabled label vs fill | 1.89 | 2.49 | exempt | ⚠️ |
| focus ring vs page | 4.32 | 7.69 | 3.0 | ✓ |
| **focus ring vs a selected pill** | **1.27** | **1.00** | 3.0 | ✗ §2.2 |

**`primary/selected` is why the label passes:** at `blue/1300` it gives white 5.48:1, where
`primary/default` `blue/1200` would give 4.32 and fail. The Primary button, which does use
`primary/default`, fails 1.4.3 for exactly this reason. **The pill sidesteps the system's most
consequential colour defect by using a different role.**

### 4.3 Selected + disabled is illegible, and the fix is one token

`primary/border` is a **light** blue in Light and a **dark** blue in Dark. The label is
`primary/on-primary` — white then near-black. So in each mode the label is the *same lightness as its
background*: **1.65** and **1.93**.

**Bind the label to `text/default` instead.** It inverts with the mode: **9.18** and **8.72**. One
token, both modes, no trade-off — `primary/on-primary` is simply the wrong role on a fill that is not a
primary surface. **Fixed.**

The unselected disabled state (1.89 / 2.49) is a limit of `text/disabled`, not of this component. Even
`neutral/1100` only reaches 4.02 / 3.75. §11 Q3.

### 4.4 The unselected border: sixth component, same failure

`border/default` = `neutral/600` = **1.31:1**. **No `border/*` role reaches 3:1** — divider 1.20,
default 1.31, strong 1.71, hover 2.85. Even `border/strong`, whose *name* promises a visible boundary,
is 1.71.

**`border/control` at `neutral/1100`** is 4.52 / 3.58. One new role clears a 1.4.11 failure in six
components. **The role now exists. Nothing is bound to it yet** — for the reason below.

### 4.4a Rebinding the border breaks the hover state

The unselected pill's hover feedback today is *entirely* a border colour change:
`border/default` → `primary/default`. That works because the two are 37 L\* apart.

| | L\* | Ratio to the resting border |
|---|---|---|
| `border/default` `neutral/600` (today) | 88.0 | — |
| **`border/control` `neutral/1100`** | **49.8** | — |
| `primary/default` `blue/1200` (hover) | **51.1** | **1.05** |
| `primary/hover` `blue/1300` | 44.5 | 1.21 |

`neutral/1100` and `blue/1200` are **1.3 L\* apart**, so hover becomes a pure *hue* shift — invisible in
greyscale, invisible with a blue-yellow deficiency, and 1.05:1 carries no non-text contrast at all.

| Option | Effect |
|---|---|
| **A** — hover thickens the border to 2px | works in greyscale and for any colour deficiency; the only robust option |
| **B** — hover moves the **fill** to a light primary tint | a real lightness change, but there is no `primary/subtle` role to bind it to |
| **C** — accept the hue-only hover | cheapest, weakest |

§11 Q2. This is why the role was created and left unbound: creating it is free, rebinding it is a design
change with a consequence.

### 4.5 Hovering a selected pill is barely visible

| | Light | Dark |
|---|---|---|
| unselected → hover (border) | **3.29** | 4.65 |
| **selected → hover (fill)** | **1.27** | **1.27** |

Backwards: the selected chip is the one the user is about to click to *remove* a filter. No clean fix
inside one hue ramp — `blue/1600` reaches only 1.72. §11 Q4.

The **direction inverts between modes** — Light darkens, Dark lightens. Both increase contrast against
their page, so it is defensible, but know it before "fixing" one side.

### 4.6 `primary/selected` and `primary/hover` are the same value

Both alias `blue/1300` in Light **and `blue/900` in Dark**. So **a selected pill at rest is
pixel-identical to a hovered Primary button, everywhere.** Same collision that blocks the obvious fix
for the button's 1.4.3 failure.

---

## 5. States

Four states × two selections, all eight present and correctly distinguished. `focus` correctly changes
nothing but the ring, so a focused chip still reads as selected or not.

**Missing:** no `focus`+`hover` and no pressed state. Neither is a defect — CSS composes the first for
free, and a chip's "press" is the selection flip itself.

---

## 6. Accessibility

| Requirement | Status | Detail |
|---|---|---|
| **1.4.11** unselected border | ✗ **fail** | 1.31:1 — needs `border/control` §4.4 |
| **1.4.11** ring on a selected pill | ✗ **fail** | 1.27 / **1.00** §2.2 |
| **2.4.7** focus visible | ✗ **fail** | invisible on the selected variant |
| 1.4.3 text | ✓ | 15.15 / 5.48 / 6.94 Light |
| **2.5.8** target size *(WCAG 2.2)* | ✓ | 26px clears 24 in both dimensions |
| 1.4.1 colour independence | ✓ | selection carries on `aria-pressed` |
| Role announced | ⚠️ | needs `aria-pressed` |
| Disabled legibility | ⚠️ | 1.65:1 selected — exempt but illegible §4.3 |
| Text size | ⚠️ | 11px is below the smallest documented label |

**Three failures, two fixes.** The ring failures are one defect counted twice; `outline-offset: 2px`
clears both.

---

## 7. Pill, badge, button or tab?

| | Click does | Selection |
|---|---|---|
| **Pill** | filters the data in place | **yes** — persistent, multiple can be on |
| **Badge** | nothing — not interactive | no |
| **Button** | performs an action | no |
| **Tab** | swaps which view is shown | one at a time, exclusive |

- **If only one can be on at a time and they change the view, it is a tab.**
- **If clicking does nothing, it is a badge** — a non-interactive pill will be tabbed to by keyboard
  users expecting something to happen.

---

## 8. Selector strategy

Build on a native `<button type="button">` with `aria-pressed`.

| Figma | Selector |
|---|---|
| `Selection=selected` | **`[aria-pressed="true"]`** — the attribute *is* the state |
| `State=hover` | `:hover:not(:disabled)` |
| `State=focus` | `:focus-visible` |
| `State=disabled` | `:disabled` |

**Do not add a `.zf-pill--selected` class.** `aria-pressed` already carries the state and it is what the
screen reader reads; duplicating it creates two sources of truth that will drift.

Unlike the checkbox and toggle, the pill needs **no hidden input and no wrapper** — a `<button>` is
hoverable and focusable itself. The `pointer-events: none` trap that broke both of those files does not
apply here.

---

## 9. Code

### 9.2 The load-bearing decisions

- **Truncation goes on the label span, not the button.** Three declarations, all load-bearing:
  `min-width: 0` defeats the flex item's automatic minimum (which with `nowrap` is the whole string);
  `text-overflow` only applies to a **block container**, so on the `inline-flex` button you get a hard
  clip mid-glyph with no ellipsis; and `max-width: 20ch` on the span means 20 characters **of label**,
  where on the button it would also pay for padding, border, icon and gap — roughly 13.
- **The icon colour is not set.** Export with `currentColor` and it follows `color` in every state. A
  CSS `fill: currentColor` does **not** work — a presentation attribute on the child beats an inherited
  value from the parent — and it would flood-fill the stroked icons.
- **`flex: none` on the icon** so it does not shrink when the label truncates.
- **Focus:** `outline` + `outline-offset: 2px`. The whole fix for §2.2.
- **Selected + disabled** uses `text/default`, and wins on **specificity** (0,3,0) against (0,2,0) —
  order is irrelevant here, unlike the checkbox and toggle error blocks.
- **The resting border stays `border/default` and is flagged.** The fix is a system decision, not a
  component one — six components need the same role, and §4.4a gates it.

### 9.3 React

```ts
export interface PillProps {
  label: string;
  selected: boolean;
  onSelectedChange: (next: boolean) => void;
  icon?: React.ReactNode;   // optional — Figma has no way to hide it
  disabled?: boolean;
}
```

- **`aria-pressed` is driven straight off `selected`.** No className branch — one source of truth.
- **`icon` is optional.** Figma's `Icon Swap` has no boolean to hide it, so every Figma pill has one.
- **The icon wrapper is required, not cosmetic** — it applies `flex: none` and `aria-hidden` to a node
  the *consumer* owns. Render it bare and the icon shrinks when the label truncates, and any consumer
  SVG carrying `<title>` gets announced, doubling the accessible name.
- **No `title`.** On a button whose text content is already that string, several screen-reader/browser
  pairs surface `title` as the accessible *description* and read it twice. It is also unavailable to
  keyboard and touch users. If you need the full text on hover, detect the overflow
  (`scrollWidth > clientWidth`) and attach a real tooltip only then.

### 9.4 What this deliberately does not copy from Figma

| Figma | §9 | Why |
|---|---|---|
| ring `INSIDE`, 0px clear | `outline-offset: 2px` | 1.27 → 4.32, and 1.00 → 7.69 in Dark |
| selected+disabled `primary/on-primary` | **`text/default`** | 1.65 → 9.18, 1.93 → 8.72 |
| `FIXED` 26 overriding 6px padding | padding only, renders **30** | the declared token becomes the real value |
| icon 12 × 12 from a 16px master | icon at **16 × 16** | resizing does not scale stroke weight |
| icon always present, default `learn` | optional `icon`, no default | §3.4 |
| no truncation | `max-width: 20ch` + ellipsis **on the label** | §9.2 |
| selection as a variant axis | `aria-pressed` | one source of truth |
| `border/default` 1.31:1 | **kept, and flagged** | a system fix; §4.4a gates it |
| no motion | 150ms ease + `prefers-reduced-motion` | |

### 9.5 A token-naming caveat

This file uses `--zf-<role>`. **`ZF-COLORS.md` declares the generated convention as `--zf-color-<role>`.
Check what `tokens/semantic.css` emits and use that prefix.**

Separately: **`--zf-font-family` is not a Figma variable.** None of the five collections holds
typography. If it is undefined the declaration is invalid at computed-value time and `font-family`
silently falls back to inherited.

### 9.6 Verification checklist

| Check | Expected |
|---|---|
| **Tab to a selected pill** | a clearly visible ring **with a gap**. If it hugs the pill the offset is missing and the ring is 1.27:1 |
| Tab to a selected pill **in Dark** | ring visible. If it has vanished, ring = fill = `blue/900` |
| Selected + disabled | **dark** label on pale blue. White there is 1.65:1 |
| Selected + disabled **in Dark** | **light** label on dark blue |
| Selected fill | `primary/selected` `#2762D9`, **not** `primary/default` `#3874EB` |
| Selection in the DOM | `aria-pressed`, and **no** `--selected` class |
| Screen reader | "pressed" / "not pressed" |
| Icon colour | follows the label in every state, with no per-state icon rule |
| Icon does not shrink | truncate the label; the icon stays 16px |
| **Long label truncates with a real ellipsis** | `…`, not a hard clip mid-glyph |
| Truncation budget | 20 characters **of label** |
| No icon supplied | label-only, **no empty 4px gap** |
| Row height | **30px** as written; ≥ 24 either way |
| Unselected border | 1.31:1 — **expected to fail** until §4.4a is settled |
| Dark mode | fill, border, label and ring all flip |

---

## 10. Defects in the Figma source

| # | Severity | Defect | Fix |
|---|---|---|---|
| 1 | ~~Critical~~ **FIXED** | `Label` wired to 3 of 8, `Icon Swap` to 1 of 8 | 12 references re-attached |
| 2 | ~~Critical~~ **FIXED** | Focus ring invisible on a selected pill — 1.27 / **1.00** | `strokeAlign` → `OUTSIDE` |
| 3 | **High** | Unselected border 1.31:1 — sixth component | Role created; binding blocked on §4.4a |
| 4a | ~~High~~ **FIXED** | Selected+disabled 1.65 / 1.93 | Bound to `text/default` — 9.18 / 8.72 |
| 4b | Medium | Unselected+disabled 1.89 / 2.49 | A limit of `text/disabled` |
| 15 | **High** | **Rebinding the border flattens hover** — 1.05:1 §4.4a | Pair the rebind with a 2px hover border or a fill tint |
| 5 | Medium | Icon 12 × 12 from a 16px master — stroke weight does not scale | Use 16px |
| 6 | Medium | No way to hide the icon; no dismiss affordance | Add a boolean and a `×` slot |
| 7 | Medium | The label grows without bound | Max width + truncation |
| 8 | Medium | Hovering a selected pill is a 1.27:1 change | Needs a decision |
| 9 | Medium | `Icon Swap` defaults to an onboarding set | Repoint |
| 10 | Medium | Label is 11 / 16, below the smallest documented label | Confirm or raise to 12 |
| 11 | Low | Vertical padding inert — real value is 5 | Drop the fixed height |
| 12 | Low | `primary/selected` = `primary/hover` | Ladder shift |
| 13 | Low | Label TEXT node carries `strokeWeight: 1` with zero strokes | Remove |
| 14 | Low | Hover direction inverts between modes | Document |

### 10.1 What this component gets right

- **34 of 34 paints on semantic roles.** Zero raw, zero primitives, zero remote. Unique in the file.
- **Padding, gap and radius all bound.** Also unique.
- **A real local text style**, a **component description**, **8 of 8 variants**.
- **`STRETCH/STRETCH` on the focus ring**, so it resizes with the label. The alignment is wrong; the
  constraints are right.
- **`primary/selected` rather than `primary/default`** — what keeps the label at 5.48 instead of 4.32.
- **2.5.8 passes** in both dimensions. Nothing else interactive in this file does.

### 10.2 The Figma doc frame is current — with three gaps

Unusually, `30:15905` was **not stale**. Three things it did not know: the property *references* were
missing (only the definitions were done); focus 2.4.7 passed on 2 of 4 cases, not 4; and issue 8's
"6 / 6 against a fixed 26px height" contradicts itself. All three now corrected in the frame.

---

## 11. Open decisions

| # | Question | Blocks |
|---|---|---|
| 1 | ~~Create `border/control`?~~ **DONE.** The remaining question is **which components to bind, and in what order** | defect 3 |
| 2 | **How does hover survive the rebind?** 2px border, a fill tint, or accept 1.05:1. **This gates decision 1** | defect 15 |
| 2b | **30px or 26px?** §9 renders 30 and keeps the padding on a token; `height: 26px` matches Figma but reproduces its defect on purpose | defect 11 |
| 3 | Move `text/disabled` to `neutral/1100`? Still short of 4.5, and touches every component | defect 4b |
| 4 | Accept a 1.27:1 hover on selected chips, or add a non-colour cue? | defect 8 |
| 5 | Is 11px deliberate for chips? | defect 10 |
| 6 | Add a `Show icon` boolean and a dismiss affordance? | defect 6 |
| 7 | Standardise on 16px icons, or add a 12px tier? | defect 5 |
| 8 | Shift the `primary/*` ladder so default, hover and selected are three distinct values? | defect 12 |
| 9 | Normalise the hover *direction* across modes, or document the inversion? | defect 14 |

Decisions 1, 3 and 8 are shared with five other components. Decision 2 is local and is the only one that
changes the pill's silhouette.

---

**Provenance.** Measured in `Tin Tin` (`zZtArxOeRCjd7pKE25HQVS`), page `Pills` (`30:15717`), set
`zf-pill` (`30:15742`), 2026-08-21 via the Figma Plugin API. All 34 paints resolved by variable ID
through both modes to terminal hex; contrast per boundary — the focus ring measured against **both** its
inner and outer neighbour, which is what exposed defect 2. **`componentPropertyReferences` read as
values rather than keys**, which is how defect 1 was found; a key-only read shows the properties as
present. Defect 1 reproduced live; defect 5 verified by instancing a stroked icon at 12px and re-reading
`strokeWeight`.

**Not measured:** the `clone()` mechanism in §2.1 is a hypothesis that fits the pattern, not an
observation.

**Companion files:** `ZF-DESIGN-CANNON.md` §2.9, `ZF-BUTTON.md`, `ZF-TOGGLE.md`, `ZF-CHECKBOX.md`,
`ZF-STATUS-BADGE.md` (the non-interactive sibling), `ZF-ICONS.md`, `ZF-COLORS.md`, `ZF-SCALES.md`.
