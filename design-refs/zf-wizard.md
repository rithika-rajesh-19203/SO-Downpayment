# ZF Design Cannon — Wizard

**Canon:** §2.10 · **Figma:** `Tin Tin` — page `Wizard` (`30:15762`)
**Three component sets:** `zf-step` (`31:18540`) · `zf-step-card` (`30:15781`) · `zf-wizard` (`30:15789`)
**CSS classes:** `.zf-step` · `.zf-step-card` · `.zf-wizard` · **Measured 2026-08-21.**

> **This file is the implementation spec, not a transcription of Figma.**
>
> The wizard is the only **composed** component in the system and has been through at least two prior
> remediation passes: **106 of its 109 paints are on ZF Semantic roles**, both focus rings are correctly
> built with real 2px clearance, and the property wiring on `zf-step` is complete.
>
> Three things are still broken, and the first is the one that matters: **a completed step card is
> indistinguishable from an upcoming one.** Their borders are the same variable — a 1.00:1 ratio — and
> the card has no checkmark, no green, no completion mark of any kind. **Where this file and Figma
> disagree, this file wins.** §9 is the code.

---

## 1. What this is

A **stepper**. Three sets, and you need all three:

| Set | Variants | Role |
|---|---|---|
| **`zf-step`** | 8 — `State` (4) × `Focused` (2) | one marker + label. Used by `horizontal` and `vertical` |
| **`zf-step-card`** | 8 — same axes | a bordered card with a title. Used by `tabs` |
| **`zf-wizard`** | 3 — `Orientation` | the container |

| | |
|---|---|
| `State` values | `upcoming`, `current`, `completed`, `error` — all four, on both atoms |
| Instances | **42**, every one on the `Wizard` page |
| Paints | **109** — 106 on a role, 1 primitive, 2 Figma set-boundary strokes |

**Two atoms is one atom too many.** They share `State`, `Focused` and a purpose, and agree on almost
nothing else. §7 argues they should be one component with a `variant` prop.

---

## 2. Three defects

### 2.1 A completed step card looks exactly like an upcoming one

| State | Border | Title colour | Title weight |
|---|---|---|---|
| upcoming | **`border/divider`** | `text/tertiary` | Regular |
| current | `primary/selected` | `text/default` | Semi Bold |
| **completed** | **`border/divider`** | `text/default` | **Semi Bold** |
| error | `danger/border` | `danger/text` | Regular |

**`completed` and `upcoming` carry the same border variable** — not a similar value, the same one, so the
ratio is **1.00:1**. No checkmark, no green fill, no badge. The only difference is the title's colour and
weight: **3.35** Light, **2.65** Dark.

**The two atoms also disagree.** `zf-step` marks completed with `success/default` and a tick — 4.56:1,
unmistakable. `zf-step-card` marks it with nothing. So switching a wizard from `horizontal` to `tabs`
**loses the progress information entirely**, which is the one thing a stepper exists to convey.

**Fix:** give the card a completion mark. A tick badge in `success/default` matches the atom that already
works.

### 2.2 `Title` is wired to 3 of 8 card variants

The same defect the pill had. The property definition is correct; the `componentPropertyReferences` on
the title node are missing from five variants. The pattern is the `clone()` signature — the first three
built are wired, everything duplicated after is not.

**`zf-step` is clean by contrast** — `Label` on 8 of 8, `Number` on the 6 variants that have a numeral.
The two `completed` variants have a tick instead of a number node, so `Number` correctly has nothing to
drive. Intended, not a defect.

### 2.3 A step card changes width when its state changes

The card is HUG-width and the title's **weight changes with state** — Regular for `upcoming` and `error`,
Semi Bold for `current` and `completed`:

| State | Title width | Card width |
|---|---|---|
| upcoming · error | 86 | **146** |
| current · completed | 88 | **148** |

**Advancing a step makes its tab 2px wider** and shifts every tab after it.

Second problem in the same table: **weight groups `error` with `upcoming`.** A failed step is one the
user has visited and must return to; putting it in the same visual tier as one they have never seen is
backwards. §9 keeps one weight for all states.

---

## 3. Geometry — measured

### 3.1 `zf-step`

| Property | Value |
|---|---|
| Size | **63 × 24** — HUG / HUG |
| Gap | **10** — `space/5`, bound |
| Marker | **24 × 24**, radius **999** |
| Number | 13 / 16 Semi Bold, centred — x = 8.5 = (24 − 7)/2 ✓ |
| Label | 13 / 16 Medium |
| Tick | 9 × 6 path, stroke **2** `ROUND`, `CENTER` align — visual extent **11 × 8** |
| Focus ring | 71 × 32 at (−4, −4), 2px `INSIDE`, radius 6, `STRETCH/STRETCH` — **2px clear** ✓ |

**The focus ring is correct** — worth saying plainly because the pill's was not. The frame is 4px out and
the stroke is `INSIDE`, so the band occupies −4…−2 and leaves a real 2px gap: 4.32 / 7.69 on every
variant. Nothing to change.

### 3.2 `zf-step-card`

| Property | Value |
|---|---|
| Size | **146–148 × 68** — §2.3 |
| Padding | **20 / 30** — vertical bound; **horizontal 30 is raw and off-scale** |
| Radius | **10** — not bound; the scale has 8 and 12 |
| Shadow | `0 2px 4px` `#181C2E` @ 6% — **raw, no binding** |
| Title | **20 / 28**, `zf/title/*` — real styles ✓ |
| Focus ring | +8 at (−4, −4), 2px `INSIDE`, radius **14** — 2px clear, and **concentric** ✓ |

**Radius 14 on the ring is exactly right**: at a 4px offset from a radius-10 card the outer radius must be
14 and the inner 12. Credit where due.

### 3.3 `zf-wizard` — and two different connectors

| Orientation | Steps | Connector |
|---|---|---|
| `horizontal` | 4 `zf-step` | bare `RECTANGLE` 59 × 1, **`FILL`** width |
| `vertical` | 6 `zf-step` | `FRAME` 24 × 30 wrapping a 1 × 30 line, **`FIXED`** |
| `tabs` | 3 `zf-step-card` | none |

- **Horizontal** is `FILL` width, so the stepper stretches. Correct.
- **Vertical** is `FIXED` 30px with the line at x = 11.5 — the right *centring* ((24 − 1)/2, on the
  marker's axis) but the wrong *sizing*. The distance between steps is frozen at 10 + 30 + 10 = **50px**,
  a marker-to-marker pitch of **74px**.

Step counts also disagree — 4, 6 and 3 — so no single specimen shows one flow three ways. **Neither
`error` nor `Focused=yes` appears in any wizard specimen.**

### 3.4 Target size — passes everywhere

Marker **24 × 24** exactly; whole step 63 × 24; card 146 × 68. The doc frame records this as "REVIEW — a
24px circle is below the 24 × 24 minimum". **24 is not below 24.**

---

## 4. Colour — 106 of 109 on a role

| Bound to | Paints |
|---|---|
| **`ZF Semantic` roles** | **106** |
| `ZF Primitives` | **1** — the `tabs` strip, §4.3 |
| Raw | 2 — `#8A38F5`, Figma's component purple, on two set roots |

### 4.1 The state matrix — `zf-step`

| State | Marker | Numeral / tick | Label |
|---|---|---|---|
| upcoming | 1px `border/default`, no fill | `text/tertiary` | `text/tertiary` |
| current | `primary/selected` fill | `primary/on-primary` | `text/default` |
| completed | `success/default` fill | tick in `success/on-success` | `text/default` |
| error | `danger/default` fill | `danger/on-danger` | `danger/text` |

**Connectors:** `border/divider`, all of them, always.

### 4.2 Contrast, both modes

| | Light | Dark | Needs | |
|---|---|---|---|---|
| upcoming: **marker border vs page** | **1.31** | **1.26** | 3.0 | ✗ |
| upcoming: numeral and label vs page | 4.52 | 5.67 | 4.5 | ✓ *by 0.02 in Light* |
| current: marker vs page | 5.48 | 7.69 | 3.0 | ✓ |
| completed: marker vs page | 4.56 | 7.41 | 3.0 | ✓ |
| error: marker vs page | 6.09 | 5.56 | 3.0 | ✓ |
| error: label vs page | 7.04 | 9.27 | 4.5 | ✓ |
| **connector vs page** | **1.20** | **1.16** | 3.0 | ✗ |
| **card upcoming / completed border** | **1.20** | **1.16** | 3.0 | ✗ |
| card current border | 5.48 | 7.69 | 3.0 | ✓ |
| **card error border** | **1.75** | **1.69** | 3.0 | ✗ |
| focus ring vs page | 4.32 | 7.69 | 3.0 | ✓ |

**Every text pair passes in both modes. Every boundary drawn with a `border/*` role fails**, and so does
`danger/border`; every boundary drawn with a *fill* role passes. That is the whole shape of this
component's accessibility profile, and it is the system's border ramp rather than the wizard's doing.

Two numbers fragile rather than wrong:

- **`text/tertiary` at 4.52:1** passes by **0.02**. If it ever moves one step lighter, every upcoming step
  in the product fails 1.4.3.
- **completed vs current markers are 1.20:1 apart in Light and 1.04:1 in Dark** — green and blue are
  near-identical in *lightness*, so the two states are separated by hue alone. 1.4.1 still passes because
  completed shows a tick and current a numeral, but the colour is doing none of the work.

### 4.3 The `tabs` strip is a primitive, and it breaks dark mode

The `tabs` root is filled with **`color/neutral/100`** — the only primitive-bound paint in the wizard.

| | |
|---|---|
| **Light** | `#FAFAFC` on a `#FFFFFF` page is **1.04:1** — effectively invisible |
| **Dark** | one value, so the strip stays near-white while the page goes dark — with **dark** cards on it, because `surface/default` correctly inverts. Strip and contents swap polarity |

**There is no role to bind it to** — no `surface/subtle` for a recessed container. §9 uses
`surface/default` and separates the strip with a border rather than a fill, which needs no new token.

### 4.4 Two failing border roles, and the seventh component

`border/divider` 1.20 · `border/default` 1.31 · `border/strong` 1.71 · `border/hover` 2.85 —
**`border/control`** `neutral/1100` is **4.52**.

**This is the seventh component that needs it**, and the first to need it in *two* places. The connector
case is the most consequential in the system: **the connector is the progress track**, and at 1.20:1 the
line showing how far the user has come is not reliably visible.

**From the pill:** rebinding a resting border to `neutral/1100` can flatten whatever state change sat on
top of it. **Here it does not** — the marker's other states are *fills*, and the connector has no states.
**The wizard is the one component where the rebind is known to have no side effect.**

### 4.5 The connector does not show progress

All connectors are `border/divider` regardless of position. A stepper's connector conventionally carries
the travelled path — coloured up to the current step, plain after it. That is a second, non-numeric
channel for progress, and it costs one rule.

---

## 5. The state model

`State` (4) × `Focused` (2), 8 variants each, all present. The axis split is right.

**What is missing is the pointer and disabled dimension.** No `hover`, no `disabled` anywhere:

| | Typically clickable? |
|---|---|
| completed | yes — go back and review |
| current | no — you are here |
| upcoming | **depends on the product** |
| error | yes — go back and fix |

`upcoming` is doing double duty for "reachable later" and "not reachable yet". §9 handles it with a
`clickable` prop: a non-clickable step renders as a `<span>`, which removes it from the tab order and
from hover without needing a `disabled` variant at all.

---

## 6. Accessibility

| Requirement | Status | Detail |
|---|---|---|
| **1.4.11** marker border | ✗ | 1.31:1 |
| **1.4.11** connector | ✗ | **1.20:1**, and it is the progress track |
| **1.4.11** card border, upcoming and completed | ✗ | 1.20:1 |
| **1.4.11** card border, error | ✗ | 1.75:1 |
| **1.4.1** completed vs upcoming on the card | ⚠️ **judgment: fail** | weight alone, with the loudest signal saying nothing, and 2.65:1 of colour support in Dark |
| 1.4.1 completed vs current on the step | ✓ | tick vs numeral does all the work — the colours are 1.20:1 apart |
| 1.4.3 text | ✓ | every pair, both modes; `text/tertiary` by 0.02 |
| **2.4.7** focus visible | ✓ | 2px ring at real 2px clearance on both atoms. **The doc frame says this fails; it does not** |
| **2.5.8** target size | ✓ | 24 × 24 exactly |
| Progress announced | ⚠️ | needs `aria-current="step"` and a visually-hidden state word |

**Five 1.4.11 failures, and four are the same missing `border/control` binding.** The fifth is the error
card's `danger/border` at 1.75, which needs `danger/default` — `border/control` would make an error card
grey.

---

## 7. One atom, not two

| | `zf-step` | `zf-step-card` |
|---|---|---|
| Completion signal | green fill + tick | **nothing** |
| Numeral | its own `Number` property | **baked into the `Title` string** |
| Type | 13 / 16, **no text style** | 20 / 28, `zf/title/*` ✓ |
| Error border | `danger/default`, 6.09 ✓ | **`danger/border`, 1.75** ✗ |
| Error emphasis | same weight as others | **Regular, same tier as upcoming** ✗ |
| Surface | variants have **no fill** | `surface/default` ✓ |
| Width stability | stable | **changes 2px with state** ✗ |

Seven rows, seven disagreements, and in each one atom is right — but not consistently the same atom. That
is the signature of two components maintained separately rather than one with a presentation variant.

**§9 builds one step with a `variant` prop** (`marker` | `card`). State logic, ARIA, the completion mark
and the focus treatment are written once and cannot drift.

---

## 8. Selector strategy

A stepper is an **ordered list**.

| Figma | Markup |
|---|---|
| `zf-wizard` | `<ol role="list">` with `aria-label` |
| one step | `<li data-state="…">` |
| **all four `State` values** | **`data-state`** — one hook for all four |
| `State=current` | `aria-current="step"` **in addition**, plus visually-hidden text |
| clickable | `<button>`; non-clickable renders a `<span>` |

Three rules:

- **`data-state` is the styling hook for all four states, including `current`.** The pill uses
  `aria-pressed` because it is *binary*. `State` has four values and only one has an ARIA attribute, so
  styling `current` off `aria-current` would mean two mechanisms for one axis.
- **Clickability is expressed by the element, not a modifier.** A `<span>` is not focusable and not
  hoverable, so "not reachable" needs no `disabled`, no `pointer-events: none`, no state class. This also
  avoids the trap that broke the checkbox and toggle.
- **`role="list"` is not redundant.** Safari with VoiceOver drops list semantics from an `<ol>` with
  `list-style: none`, and this component relies on the list for position — the numeral is `aria-hidden`
  precisely so it is not announced twice.

---

## 9. Code

### 9.1 Markup decisions

- **The numeral is `aria-hidden`.** An `<ol role="list">` already conveys position. The tick likewise —
  the state word carries it.
- **A visually-hidden state word per step.** This is what closes the 1.4.1 failure for a screen reader;
  the visible completion mark closes it for everyone else. Both are needed. It also means `aria-current`
  on a `<span>` is belt-and-braces — support on a non-interactive element is uneven.
- **`current` is a `<span>`, not a button.** "You are here" is not a destination.
- **The connector is not a sibling node.** One fewer than the number of steps, always, and it cannot
  drift. Figma implements it as a sibling, which is why the two orientations ended up with two different
  implementations.

**The tick path** runs x 1 → 10 and y 1 → 7 inside an `11 × 8` viewBox — the measured 9 × 6 ink extent
inset by half of the 2px `CENTER`-aligned stroke, so the stroke lands flush. Same authoring rule as
`ZF-CHECKBOX.md` §9.3.

### 9.2 The load-bearing CSS decisions

- **`min-width: 0` on the control.** A flex item defaults to its min-content size, which with `nowrap`
  is the whole string — without this the control cannot shrink and the label never truncates.
- **One label weight for all states** — §2.3.
- **Focus:** `outline: 2px solid focus/ring`, `outline-offset: 2px`, `border-radius: radius/xs`. A browser
  draws the outline radius as border-radius + offset, so 2 + 2 ≈ Figma's 6. `radius/md` would draw 8–10
  and look noticeably rounder.
- **The connector is `border/control`** (4.52), not `border/divider` (1.20), and turns
  `success/default` for the travelled path.
- **Horizontal:** only non-last steps grow. Give `flex: 1 1 auto` to every step and the last absorbs free
  space as trailing dead air. The li's gap and the container's gap both supply 20px; a `margin-inline`
  would stack with the container gap and give 20 on one side, 40 on the other.
- **Vertical:** the line must span whatever pitch it is given rather than being frozen at 30px. `left`
  is 11.5 = (24 − 1)/2, the marker's centre axis — exact in CSS, with no INSIDE-stroke offset to
  compensate for.
- **`background: none` on the control.** A prior Figma pass bound every set *root* to `surface/default`
  to stop the sets disappearing against Figma's dark canvas. Instances inherit from the **variant**, not
  the root, so the fix never reached them — and it should not. A step belongs on whatever surface hosts
  it, and `text/default` is already mode-aware.

### 9.3 The card variant

- `flex-direction: column`, padding **20 / 32** (Figma's 30 is off-scale), radius **12** (Figma's 10 is
  off-scale), `surface/default`, `border/control`.
- **`flex-basis` a constant**, so width is not a function of the font weight — this is what stops the 2px
  reflow. A card becomes ~226px against Figma's 146–148; stated rather than left to be discovered.
- **One title weight, all states.**
- **The numeral is a real element**, not baked into the title string.
- **THE §2.1 FIX: a completion badge** — a `success/default` tick, the same signal the marker atom
  already uses. The card control is a column, so the badge sits above the title row, which is what a tab
  wants anyway.
- **Error border is `danger/default`** (6.09), not `danger/border` (1.75) — and this also removes a
  disagreement between the two atoms.
- **The tabs strip gets a border, not a fill** — until a `surface/subtle` role exists.

Two sizes do not match Figma, and both are the CSS box model rather than a choice: the card is **70**
against Figma's 68, and the strip **104** against 100, because a CSS border adds outside the padding box
where Figma's `INSIDE` stroke does not.

### 9.4 React + TypeScript

```ts
export type StepState = 'upcoming' | 'current' | 'completed' | 'error';

export interface Step {
  id: string;
  label: string;
  state: StepState;
  clickable?: boolean;      // §5 — a product decision per step, not a variant
}

export interface WizardProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical' | 'tabs';
  onStepClick?: (id: string) => void;
  label: string;            // required — an <ol> of steps needs a name
}
```

Four deliberate choices:

- **The numeral comes from the array index in *both* presentations.** Figma has a `Number` property on
  one atom and bakes the numeral into the `Title` string on the other — two mechanisms, both
  hand-maintained, and the doc frame records that the vertical layout once shipped "3" on four
  consecutive steps because of it.
- **`clickable` defaults by state, and renders a different element.** Completed and error are navigable;
  current and upcoming are not, unless the product says otherwise.
- **One `steps` array drives all three orientations.** Figma hardcodes 4, 6 and 3.
- **`label` is required.** An unlabelled `<ol>` of steps announces as a bare list.

Two typing traps: `Control` must be `React.ElementType`, not the inferred `'button' | 'span'` union — TS
rejects spreading a `type` prop into that union because `type` is not valid on `span`. And SVG props are
camelCase in TSX (`strokeWidth`, `strokeLinecap`, `strokeLinejoin`); the hyphenated HTML forms are a type
error.

### 9.5 Token caveats

This file uses `--zf-<role>`; **`ZF-COLORS.md` declares the generated convention as `--zf-color-<role>`.
Check what `tokens/semantic.css` emits** — and note this applies to spacing and radius names too.

| Token | Status |
|---|---|
| `--zf-border-control` | the role **exists** (created during the pill work), nothing bound yet |
| `--zf-font-family` | **not a Figma variable** — no collection holds typography |
| a shadow token | **does not exist** in Figma; §9.3 hardcodes it |

### 9.6 Verification checklist

| Check | Expected |
|---|---|
| **A completed card next to an upcoming card** | **visibly different at a glance** — a green tick badge |
| **Advance a step in `tabs`** | no horizontal reflow. ~2px shift means the title weight still changes with state |
| Connector **after** a completed step | **`success/default` green**; every connector from the current step on is grey |
| Connector visibility | ≥3:1 against the page. `border/divider` is **1.20** and must not be used |
| Marker border, upcoming | `border/control`, **not** `border/default` |
| Number of connectors | exactly `steps − 1`, both orientations |
| Current marker fill | `primary/selected`. `primary/default` is 4.32:1 with white and fails |
| Tab strip in **dark mode** | dark. Near-white means it is still on the `neutral/100` primitive |
| Step labels in dark mode | legible — the step needs **no** background fill of its own |
| Screen reader, per step | position, then label, then a state word. No numeral read twice |
| Tab through the stepper | only clickable steps receive focus |
| Focus ring | 2px, 2px clear of the marker *and* the card. Both correct in Figma — do not "fix" them |
| Long label | truncates in `horizontal`, wraps in the card. A hard clip means `min-width: 0` is missing |
| Horizontal spacing | uniform 20px. 20 one side and 40 the other means a margin is stacking with the gap |
| Last step in `horizontal` | flush, no trailing dead space |
| Error step | `danger/default` border on the card, not `danger/border` |

---

## 10. Defects in the Figma source

| # | Severity | Defect | Fix |
|---|---|---|---|
| 1 | **Critical** | A completed card is indistinguishable from an upcoming one — same border variable (1.00:1), no tick, no green | Give the card a completion mark |
| 2 | **Critical** | `Title` wired to 3 of 8 card variants | Re-attach the 5 missing references node by node |
| 3 | **High** | The connector is 1.20:1 and **is** the progress track. Three more boundaries fail the same way | Bind all four to `border/control` — no side effect here |
| 3b | **High** | Error card border `danger/border` at 1.75:1 where the marker atom uses `danger/default` at 6.09 | `danger/default`. **Not** `border/control` — that would make an error card grey |
| 4 | **High** | The `tabs` strip is the primitive `neutral/100` — 1.04:1 Light, inverted in Dark | Border instead of fill, or create `surface/subtle` |
| 5 | **High** | A card changes width with its state; the weight rule also groups `error` with `upcoming` | One weight for all states |
| 6 | Medium | `zf-step`'s type carries no text style — 13 / 16 is not in the scale | Add a tier, or move to 13 / 20 |
| 7 | Medium | The card's numeral is baked into the `Title` string | Split it out |
| 8 | Medium | No hover and no disabled anywhere, though clickability differs per state | Needs a product answer |
| 9 | Medium | The card's shadow is raw and unbindable | Create a shadow tier |
| 10 | Medium | The connector is implemented twice, and the vertical one cannot adapt | One implementation, as a pseudo-element |
| 11 | Low | Card padding 30 and radius 10 are off-scale and unbound | `space/16` and `radius/xl` |
| 12 | Low | Step counts differ per orientation — 4, 6, 3 | Use one flow |
| 13 | Low | Neither `error` nor `Focused=yes` appears in any specimen | Add specimens |
| 15 | Low | Text nodes carry `strokeWeight: 1` with zero strokes | Remove |
| 16 | Low | `zf-step`'s variants have no fill though the set root does — instances inherit from the variant | Leave them transparent |

**The ones that matter:** 1 and 2 (one destroys the component's purpose, one is a silent functional
break), 3 (four boundaries, one existing role), 4 (a dark-mode break).

### 10.1 What this component gets right

- **106 of 109 paints on semantic roles**, across three sets and 19 variants.
- **Both focus rings correctly built** — 2px stroke, `INSIDE` on a frame inset **4px**, a real 2px gap.
  The pill got this wrong with a 2px inset. The card's ring radius is **14** against a radius-10 card at
  a 4px offset — exactly concentric.
- **`STRETCH/STRETCH` on both rings**, so they track the label length.
- **`primary/selected` rather than `primary/default`** on the current marker.
- **`zf-step`'s property wiring is complete.**
- **All three sets have accurate descriptions.**
- **The horizontal connector is `FILL`-width.**
- **All four states on both atoms**, progress and focus correctly split into two axes.
- **2.5.8 passes** in every dimension.

### 10.2 The doc frame is thorough, and now contradicts itself

`30:16840` is the most detailed in the file — 22 tracked issues, real forensics. It is also describing an
**earlier state**, because a later pass added the `Focused` axis and the `error` state without updating
§03 and §08.

| Doc frame says | Measured |
|---|---|
| "Focus visible 2.4.7 — **FAILS** — no focus state exists" | **both atoms have 8 variants with a correct ring.** Its own issue 19 says this was rebuilt |
| "and there is no error state at all" | `error` exists on both atoms |
| "a 24px circle is **below** the 24 × 24 minimum" | 24 is not below 24 |
| "1.4.1 FAILS — completed is a tick and a green fill **only**" | a tick **is** a non-colour channel. The failure is real for the *card*, which has neither |
| "the ring is 28 × 28" | it is **71 × 32** and wraps marker *and* label |
| "61 paints bound, zero raw" | now **109** — 106 role-bound, 1 primitive, 2 raw |
| "every set root bound to `surface/default`" | true of the roots, but instances inherit from the **variant** |
| "all four states carry the border and title colour carrying the status" | the border does **not** carry the status — 1.00:1 |

---

## 11. Open decisions

| # | Question | Blocks |
|---|---|---|
| 1 | **Which steps are clickable?** Completed only, or completed + upcoming? Decides whether `upcoming` splits into "reachable" and "gated" | defect 8 |
| 2 | **Collapse the two atoms into one set with a presentation variant?** | defects 1, 5, 6, 7 |
| 3 | **Create `surface/subtle`** for recessed containers like the tabs strip? | defect 4 |
| 4 | **Bind the wizard's borders to `border/control`?** The role exists and this component has no state sitting on those borders — **so it can go first, with no side effect** | defect 3 |
| 5 | Add a **13 / 16** type tier, or move the step to 13 / 20? | defect 6 |
| 6 | Create a **shadow token tier**? | defect 9 |
| 7 | Add **30** to spacing and **10** to radius, or move to `space/16` and `radius/xl`? | defect 11 |
| 8 | Give **`border/control` a per-mode pair** instead of one value for both? | — |

**Decision 4 is the one to take first** — cheapest, clears four of five 1.4.11 failures, and this is the
one component where the rebind is known to be free.

---

**Provenance.** Measured in `Tin Tin` (`zZtArxOeRCjd7pKE25HQVS`), page `Wizard` (`30:15762`), on
2026-08-21 via the Figma Plugin API. All 19 variants and every descendant enumerated;
**`componentPropertyReferences` read as values rather than keys**, which is how defect 2 was found. All
109 paints resolved by variable ID through both modes. Contrast against 1.4.3 (4.5:1 — 20px Semi Bold
treated as normal text, *stricter* than WCAG's large-text threshold) and 1.4.11 (3:1, per boundary).

**Not measured:** the `clone()` mechanism for defect 2 is a hypothesis. The two `#8A38F5` strokes sit on
only two of three set roots, which is evidence they were authored rather than automatic — nothing depends
on the distinction. 1.4.11's *applicability* to a card border and a connector is argued, not measured.

**Companion files:** `ZF-DESIGN-CANNON.md` §2.10, `ZF-PILL.md` (where `border/control` was created, and
the same 3-of-8 defect), `ZF-BUTTON.md`, `ZF-TOGGLE.md`, `ZF-CHECKBOX.md`, `ZF-COLORS.md`,
`ZF-SCALES.md`.
