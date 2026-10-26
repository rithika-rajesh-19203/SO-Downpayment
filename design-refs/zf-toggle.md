# ZF Design Cannon — Toggle

**Canon:** §2.4 · **Figma:** `Tin Tin` — page `Toggle` (`13:6177`) — component set `Toggle` (`13:6181`)
**CSS class:** `.zf-toggle` · **Measured 2026-08-21 · rev 2.**

**rev 2 changes the recommendation.** The earlier draft recommended a knob border (option B) at a
claimed 3.06:1. That number was computed against the *literal* Figma hex; against the real primitive it
is **2.95:1 and fails**. Option A — darken the track — is now the recommendation.

Also corrected: `neutral/700`/`neutral/800` values, `primary/border` = `blue/800`, the disabled
composites, dark mode, the dead `:hover` selector, and the error class name. And the error ring itself —
the first pass drew it **inset**, which is 1.35:1 against the new track and 1.05:1 in Dark; it is now
drawn outside the track against the page at 6.09:1. §10.1 records why the original mistake happened.

> **This file is the implementation spec, not a transcription of Figma.**
>
> The toggle has the worst accessibility profile of any control in the system: **the knob is 1.48:1
> against the off track**, and the knob's position is the only thing that tells a user whether the
> switch is on. Both sizes also fail target size, and error only renders on focus. §4 and §6 give the
> values to build instead. **Where this file and Figma disagree, this file wins.** §9 is the code.
>
> **One change is deliberate and visible: the off track becomes `neutral/1100` `#71758F`** — a mid grey,
> not the near-white Figma draws. That is the only value that clears 1.4.11 on both boundaries (§2.1).
> A build that "restores" the Figma colour reintroduces the failure.

---

## 1. What this is

A binary switch that takes effect **immediately** — flipping it *is* the action, so there is no Save.
That is the whole distinction from a checkbox; §7 has the decision rule.

| | |
|---|---|
| Variants | **20** of 32 declared |
| Axes | `Is on` (2) × `State` (4) × `is_error` (2) × `is_small` (2) |
| Sizes | 30 × 18 and 24 × 14 |
| Label | **none** — the component is the control only |
| Instances in the file | **0** |
| Doc frame | `13:6231` — 1680 × 7,722, 10 sections |

**Zero instances.** Nothing in the file uses this component, which is why the failures below have never
surfaced in a review.

---

## 2. The critical failure

The off track is the raw literal `#D3D3E5`. The knob is `#FFFFFF`. Against each other, and against the
page:

| | Ratio | Needs | |
|---|---|---|---|
| **White knob against the off track** | **1.48** | 3.0 (1.4.11) | ✗ |
| **Off track against the white page** | **1.48** | 3.0 | ✗ |
| Off hover track, raw `#BCBCD1` | 1.87 | 3.0 | ✗ |
| On track `blue/1200` | 4.32 | 3.0 | ✓ |
| On hover `blue/1300` | 5.48 | 3.0 | ✓ |

**Knob position is the state.** So the single most important visual signal in the component is the one
that fails — and the off track barely reads as a control at all until it is switched on.

> **Neither raw value is a ZF primitive.** I enumerated every primitive in the file: nothing equals
> `#D3D3E5` and nothing equals `#BCBCD1`. `neutral/700` is `#CED0DE` and `neutral/800` is `#C3C5D4`.
> The canon is right to call these two "legacy, ΔE from Neutral 700/800" — they are off-palette values,
> not stale bindings, and **you cannot fix the toggle by binding them to the nearest step.** Doing so
> silently changes the colour *and still fails* (1.53 and 1.71). §2.1 is the only route.

### 2.1 The fix: darken the track

Two options were measured against the real primitive values. Only one passes.

| Option | Change | Knob vs track | Track vs page | Verdict |
|---|---|---|---|---|
| **A** | Track → `neutral/1100` `#71758F`, knob `surface/raised`, **no knob border** | **4.52** ✓ | **4.52** ✓ | **recommended** |
| **B** | Bind the track to `neutral/700` `#CED0DE` (the nearest primitive to today's colour) and add a 1px `neutral/1100` border to the knob | **2.95** ✗ | 1.53 ✗ | **fails** |

Option B has to bind the track to *something*, and `neutral/700` is the only candidate — which is
exactly why it fails. Left as the raw literal `#D3D3E5` the border scores 3.06 and the track 1.48; but
the literal cannot be tokenised, so a real build cannot have those numbers.

**Option B was the earlier recommendation and it is wrong.** 3.06:1 is what the border scores against
the *literal* `#D3D3E5`; against the real `neutral/700` `#CED0DE` you actually get **2.95** — and since
the literal cannot be tokenised, a build that binds the track to `neutral/700` and adds the border
lands at 2.95 and fails. `neutral/1200` on the border reaches 3.28, but the track is still 1.53:1
against the page and the knob is carrying the whole boundary on a 1px edge.

**Option A passes both boundaries at 4.52 with no border at all**, and it is cheaper than it looks:

| | Light | Dark | |
|---|---|---|---|
| Off track vs page | 4.52 | **3.58** | ✓ both |
| Knob vs off track | 4.52 | **3.35** | ✓ both |
| Off hover track `neutral/1200` vs page | 5.02 | **3.22** | ✓ both |
| Knob vs off hover track | 5.02 | **3.02** | ✓ both — **thinnest margin in the proposal** |
| On track `primary/default` vs page | 4.32 | 5.86 | ✓ |
| Knob vs on track | 4.32 | 5.49 | ✓ |
| On hover track `primary/hover` vs page | 5.48 | 7.69 | ✓ |

Every boundary passes in both modes with no mode-specific override. The tightest is **3.02:1** — the knob
against the hovered off track in Dark — which clears 3:1 by 0.02. If `neutral/1200` ever moves, that is
the number that breaks first.

`neutral/1100` is also **the exact value the proposed `border/control` role needs** (canon open item:
no `border/*` role reaches 3:1 — the ramp tops out at 2.85). One new token fixes the toggle, the
checkbox, the radio, the input field and Secondary buttons.

**The trade-off is real:** an off toggle becomes visually heavy, and a settings page with a column of
them reads dark. That is a design decision, and it is the one this file recommends taking. **§9
implements A.**

---

## 3. Geometry — measured

| Property | Large | Small (`is_small=yes`) |
|---|---|---|
| Track | **30 × 18** | **24 × 14** |
| Corner radius | 20 | 16 — both exceed half the height, so fully round |
| Padding | **2** | **2** — identical |
| Knob | **14 × 14** | **10 × 10** |
| Knob travel | **12** | **10** |
| Alignment off / on | `MIN` / `MAX` | `MIN` / `MAX` — this *is* the mechanism |
| Knob `x` off / on | **2 / 14** | **2 / 12** — verified on all 20 variants |
| Focus ring frame | 34 × 22 at (−2, −2) | 28 × 18 at (−2, −2) |
| Focus ring stroke | **1.0285714865** | **0.8228572011** |
| `clipsContent` | `false` | `false` — correct, the ring overhangs |

`knob = height − 2 × padding` and `travel = width − 2 × padding − knob` hold exactly in both sizes, and
they agree with the measured knob positions: 14 − 2 = **12** large, 12 − 2 = **10** small. That part is
consistent and safe to copy — §9's `translateX` uses exactly this expression.

### 3.1 The small size is not a uniform scale

| | Ratio |
|---|---|
| Width 24 / 30 | **0.800** |
| Height 14 / 18 | **0.778** |
| Knob 10 / 14 | **0.714** |
| Padding 2 / 2 | **1.000** |

Four different ratios. Because the padding stays 2px it takes a proportionally larger bite out of the
smaller track, which is why the knob shrinks fastest. In CSS this does not matter — §9 declares both
sizes explicitly rather than deriving one from the other. Do **not** try to express the small size as a
`scale()` or a single multiplier; there isn't one.

### 3.2 The focus ring is sub-pixel, and its clearance is not 2px

| Figma | Equals | |
|---|---|---|
| ring stroke **1.0285714864730835** | `float32(36 ÷ 35)` | **exact** |
| small ring stroke **0.8228572010993958** | `float32(float32(36 ÷ 35) × 0.8)` | **exact** |

Both derivations are exact once you account for Figma storing stroke weights as **32-bit floats**, which
is where the arbitrary-looking tail digits come from. So the small ring is the large ring scaled by 0.8
— the *width* ratio (§3.1), applied to a stroke weight. Somebody resized a 35px-wide frame to 36px,
then scaled the result to the small size. Neither number was chosen.

The stroke is `INSIDE`-aligned on the ring frame, so the ring's **inner** edge is not 2px clear of the
track:

| | Frame clear | Ring inner edge clear |
|---|---|---|
| Large — 34 frame, 30 track | 2px | **0.97px** |
| Small — 28 frame, 24 track | 2px | **1.18px** |

The canon says "2px clear on all sides". That is true of the *frame*, not of the visible ring. §9 uses
`outline` with `outline-offset: 2px`, which gives a real 2px gap and a 2px stroke.

### 3.3 Two pieces of litter

| What | Where |
|---|---|
| The focus-ring frame carries a **hidden** `#D3D3E5` fill | all 8 focus variants |
| `itemSpacing` 10 (large) / 8 (small), inert in every variant | all 20 |

The gap is inert for two different reasons: **12 variants have exactly one child** (the knob
`Ellipse 7`), so there is no second item to space; the **8 focus variants have two**, but the ring frame
`Toggle` is `layoutPositioning: ABSOLUTE` at (−2, −2), so it is out of flow. Either way no gap is ever
applied — but "one child" is only true of 12 of the 20.

The hidden fill is worth knowing about only because if anyone toggles its visibility on, a 34 × 22 grey
pill lands on top of the whole control — the ring frame is the last child, so it renders above the track
and the knob.

Also note the knob carries `strokeWeight: 1` with **zero strokes**, so no knob border exists today —
the number is left over from something.

### 3.4 Target size — both sizes fail

| | Area | vs 24 × 24 = 576px² | Height |
|---|---|---|---|
| Large 30 × 18 | 540px² | 94% | **18 < 24** ✗ |
| Small 24 × 14 | 336px² | 58% | **14 < 24** ✗ |

Large is close on area and still fails, because **2.5.8 is a minimum in each dimension**, not a minimum
area. Both need a ≥24px row. There is no label composite — see §5.

---

## 4. Colour — 56 paints, 18 of them raw

| Bound to | Paints | |
|---|---|---|
| **Raw, unbound** | **18** | off track `#D3D3E5` ×6 and `#BCBCD1` ×4 (visible), plus 8 hidden ring fills |
| `ZF Primitives` | 32 | knob `base/white` ×20, `blue/1200` ×6, `red/1200` ×4, `blue/900` ×2 |
| `ZF Semantic` roles | 6 | `primary/hover` ×2, `primary/text` ×4 |

**The entire off state is hardcoded.** Ten visible raw paints, and they are the two values that fail
1.4.11 — so the failing colours are also the ones no token controls.

| # | What | Figma | Use instead | Why |
|---|---|---|---|---|
| 1 | Track — off | **RAW `#D3D3E5`** — no primitive matches | **`neutral/1100`** `#71758F` (§2.1 option A) | 1.48:1, fails 1.4.11. `neutral/700` is a *different* colour and still fails at 1.53 |
| 2 | Track — off hover | **RAW `#BCBCD1`** — no primitive matches | **`neutral/1200`** `#6A6E85` | 1.87:1; `neutral/800` is different and fails at 1.71 |
| 3 | Knob | `color/base/white` | **`surface/raised`** | a primitive — cannot theme. `surface/raised` already exists. §4.1 |
| 4 | Track — on | `color/blue/1200` | `primary/default` | **identical value in Light**, zero visual change |
| 5 | Track — on hover | `primary/hover` | keep ✓ | correct role |
| 6 | Track — on disabled | `color/blue/900` `#94B3F2` | `primary/default` at 50% | primitive; and see §4.2 |
| 7 | Focus ring | **`primary/text`** | `focus/ring` | a *text* role used as a stroke, and it disagrees with four other components. §4.3 |
| 8 | Focus ring — error | `color/red/1200` `#C9474F` | `danger/default` | primitive → role. `danger/default` resolves to `red/1300` `#B2343C`, so the ring gets slightly darker |
| 9 | Ring frame fill | RAW `#D3D3E5`, **hidden** | delete | §3.3 |

### 4.1 The knob cannot theme, and `surface/raised` already exists

`color/base/white` is a primitive with one value, so in Dark the knob stays `#FFFFFF`. That is **open
item 38** — the same defect that makes the checkbox render as a white block.

The right role is **`surface/raised`**, not `surface/default`: a switch knob should read as a raised
object sitting on the track. Both resolve to `#FFFFFF` in Light, so this is a zero-pixel change there;
they differ in Dark, and `surface/raised` is the lighter of the two, which is what a knob wants.

| Role | Light | Dark |
|---|---|---|
| `surface/default` | `base/white` `#FFFFFF` | `neutral/2000` `#1D202E` |
| **`surface/raised`** | `base/white` `#FFFFFF` | `neutral/1900` `#222536` |

**A note on dark mode.** An earlier draft claimed the dark theme "inverts" — it does not, and it
cannot: a raw literal and a primitive have one value each, so under option A both the track and the
knob must be roles for anything to change at all. With `neutral/1100` on the track and `surface/raised`
on the knob, Dark measures **3.35:1 knob-against-track and 3.58:1 track-against-page** — both pass,
without a mode-specific override.

### 4.2 Disabled — Figma's values, and what §9 builds

Two things stack in Figma: the off-disabled variant uses the **hover** track colour, and the whole
variant carries **`opacity: 0.5`**. So the rendered result is not the token value:

| Figma today | Token | Renders as | vs page |
|---|---|---|---|
| Off disabled | raw `#BCBCD1` @ 50% | **`#DEDEE8`** | **1.34** |
| On disabled | `blue/900` `#94B3F2` @ 50% | **`#CAD9F8`** | **1.42** |

The canon quotes 2.10:1 for on-disabled, which is `blue/900` at full opacity — it ignores the variant
opacity. The real number is **1.42**.

- **Off-disabled uses the *hover* colour**, so a disabled toggle derives from a darker base than an idle
  one. Use the default track at 50%.
- **`primary/border` is the wrong disabled token.** It resolves to `blue/800` `#B1CAFC`, not `blue/900`;
  at 50% it composites to `#D8E4FE`, **1.28:1** — *worse* than what Figma ships. §9 uses
  `primary/default` at 50% instead.

Under option A the disabled states improve as a side effect:

| §9 builds | Composites to | vs page |
|---|---|---|
| Off disabled — `neutral/1100` @ 50% | `#B8BAC7` | **1.93** |
| On disabled — `primary/default` @ 50% | `#9CBAF5` | **1.95** |

### 4.3 Five components, four focus-ring colours

| Component | Ring | Value |
|---|---|---|
| **toggle** | `primary/text` | `blue/1400` `#1C5BD9` |
| checkbox | `primary/active` | `blue/1500` `#1E53BD` |
| radio | a remote paint style | `#1B4C91` |
| button · input field | **`focus/ring`** | `blue/1200` `#3874EB` |

Five components, **four distinct ring colours**. Use `focus/ring`. (`ZF-CHECKBOX.md` states this as
"three"; four is the correct count.)

Disabled is worse: the toggle uses `opacity: 0.5`, the checkbox uses specific fills, the radio uses
different fills again. Pick one mechanism.

---

## 5. Error is a focus treatment, not a state

The only error variants are **focus** variants — 4 of them, on/off × two sizes — and the error changes
nothing but the ring colour. The track and knob are identical to the non-error variant.

**So error is invisible to a mouse user, invisible in a screenshot, and invisible to anyone who has not
tabbed to the control.**

The set declares 32 variants and ships 20. **All 12 missing ones are non-focus error combinations:**

| Missing | Count | |
|---|---|---|
| `Default` + error, on and off, both sizes | 4 | ❗ must add |
| `Hover` + error, on and off, both sizes | 4 | should add |
| `Disabled` + error, on and off, both sizes | 4 | reasonably omitted — a disabled control has nothing to validate |

In code this costs one rule. **§9 gives error a persistent red ring drawn outside the track** so it
renders at rest, in every state, at both sizes.

Two different 12s collide here. The axes admit **16** error combinations (`Is on` 2 × `State` 4 ×
`is_small` 2). Figma ships **4** and is missing **12**. §9's single rule covers **12** — all 16 except
the 4 `Disabled` ones, where the ring is deliberately suppressed. The two 12s are a coincidence.

There is also **no label composite.** The checkbox ships `checkbox_defined`; the toggle ships nothing.
§9 includes one.

---

## 6. Accessibility

| Requirement | Status | Detail |
|---|---|---|
| **1.4.11** — knob against track | ✗ **fail** | **1.48:1**, and this conveys the state. §9 → 4.52 |
| **1.4.11** — track against page | ✗ **fail** | 1.48:1 when off. §9 → 4.52 |
| **2.5.8** target size | ✗ **fail** | 18px and 14px tall against a 24px minimum |
| **1.4.1** error at rest | ✗ **fail** | error renders on focus only, §5 |
| 2.4.7 focus visible | ✓ | a ring exists for every state, including error |
| Focus ring contrast | ✓ | vs the page: 4.32:1 after moving to `focus/ring`. The 2px `outline-offset` puts page colour, not track colour, adjacent to the ring — so this is the ratio that governs. **Do not drop the offset to 0:** against the track the ring is **1.05:1** off and **1.00:1** on, where `focus/ring` and `primary/default` are both `blue/1200` |
| Error indicator contrast | ✓ | the error ring is drawn *outside* the track against the page — **6.09:1** Light, **5.56:1** Dark. An inset ring would be 1.35:1 / 1.05:1 — §9.2 |
| Role announced | ⚠️ | needs `role="switch"` so it announces **on / off**, not "ticked" |
| Reduced motion | ⚠️ | the knob slides — wrap the transition in `prefers-reduced-motion` |
| 2.1.1 keyboard | ✓ | free from a native `<input type="checkbox">` |

---

## 7. Toggle or checkbox?

**Toggle** — the change is immediate, no Save; it is a preference or a setting; the label names a state
("Email notifications") not an action ("Enable email"); it stands alone.

**Checkbox** — the change is submitted with a form; the user is picking from a set; you need an
indeterminate third state; or **you need to show a validation error at rest**, which the toggle
currently cannot do (§5).

---

## 8. Selector strategy

Build on a native `<input type="checkbox">` with `role="switch"`.

| Figma | Selector |
|---|---|
| `Is on=On` | `:checked` on the input |
| `State=Hover` | **`.zf-switch-field:hover`** — on the wrapper, *not* the input. §9.2 explains why |
| `State=focus` | `:focus-visible` on the input |
| `State=Disabled` | `:disabled` on the input |
| `is_error=yes` | **`.zf-toggle-input--error`** — on the input, so it can combine with `:checked` and `:disabled` in one selector |
| `is_small=yes` | `.zf-toggle--sm` — on the track span; a **size modifier**, not a state |

Two of these are easy to get wrong, so they are stated as rules:

- **The error class goes on the `<input>`, not the track.**
- **Hover goes on the wrapper `<label>`.** The input is visually hidden with `pointer-events: none`, so
  it can *never* match `:hover` — a rule written as `.zf-toggle-input:hover + .zf-toggle` is dead code
  that silently does nothing.

---

## 9. Code

### 9.1 Markup

Use a visually-hidden real input and a `<span>` that draws the track. `role="switch"` on the input is
what changes the announcement from "checkbox, ticked" to "switch, on".

### 9.2 CSS — the load-bearing decisions

- Track: `neutral/1100`, hover `neutral/1200`, on `primary/default`, on-hover `primary/hover`.
- Knob: `surface/raised`, **no border**. A 1px border with `border-box` would show 1px of track through
  the knob's edge, shrinking the visible knob from 14px to 12px.
- Travel: `translateX(width − 2·padding − knob)`. Moving the knob, not the justification, keeps the
  animation on the compositor.
- Focus: `outline: 2px solid focus/ring`, `outline-offset: 2px`. **Keep the offset.** At 0 the ring
  touches the track and measures 1.05:1 off / 1.00:1 on.
- Disabled: the **default** track at 50%, not the hover track, and not `primary/border`.
- Error: `box-shadow: 0 0 0 1px surface/default, 0 0 0 3px danger/default` — **outside, not inset**.
  An inset ring shares an edge with the track: 1.35:1 Light, **1.05:1 Dark on the on-state**. Outside,
  with a 1px page-coloured spacer, it is measured against the page at 6.09:1 / 5.56:1.
  `box-shadow` paints outside the border box, so there is no layout shift and the knob does not move.
  **One selector is enough** — nothing else sets `box-shadow`, so there is no specificity contest.
  (Contrast `ZF-CHECKBOX.md` §9.4, where the error sets `border-color` and therefore MUST mirror every
  state selector at equal specificity.)
- Focus + error: push the focus ring to `outline-offset: 5px` so both read as separate rings.
- Disabled + error: **suppress the ring.** `opacity: .5` would fade it to 1.20:1.
- Small: declared explicitly — there is no single scale factor (§3.1).
- Motion: 150ms ease, and honour `prefers-reduced-motion`.

**Vertical room.** With the error ring the control's visual extent is 18 + 2 × 3 = **24px**, exactly the
`min-height` of the row — so it fits, but flush. The error focus ring at `outline-offset: 5px` reaches
30px and will overflow the row; give stacked rows ~8px of vertical gap so two focus rings never touch.

### 9.3 React

```ts
export interface ToggleProps {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label: string;                    // required — the label IS the hit area, §3.4
  size?: 'md' | 'sm';
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  name?: string;
}
```

Three deliberate choices:

- **`label` is a required prop.** The toggle has no label in Figma and cannot pass 2.5.8 without one.
- **`aria-describedby` is only set when the message renders.** A dangling IDREF announces nothing.
- **The knob is animated with `transform`, not `justify-content`.** Figma expresses the two positions
  as `MIN` / `MAX` alignment, which in CSS would be an un-animatable jump.

The error message indent derives from the track width rather than a hardcoded 38px: the sm track is
24px, so a fixed 38 over-indents by 6px.

### 9.4 What this deliberately does not copy from Figma

| Figma | §9 | Why |
|---|---|---|
| off track raw `#D3D3E5` | **`neutral/1100`** | 1.48 → **4.52:1** — §2.1. The one change that alters how it looks |
| off hover raw `#BCBCD1` | **`neutral/1200`** | 1.87 → 5.02:1 |
| knob `color/base/white` | `surface/raised` | primitive → role; raised, not default — §4.1 |
| knob with no border | still **no border** | option A does not need one, and a border would shrink the visible knob 14 → 12px |
| focus ring `primary/text`, 1.0285714865px, 0.97px clear | `outline: 2px solid focus/ring`, offset 2px | one ring colour system-wide; whole-pixel stroke; a real 2px gap |
| error = a red ring, focus only | a persistent red ring **outside** the track | error must render at rest (§5) |
| hover expressed as a variant | on the wrapper | the hidden input can never match `:hover` — §8 |
| off-disabled built from the **hover** track | the **default** track at 50% | §4.2 |
| on-disabled `blue/900` | `primary/default` at 50%, **not `primary/border`** | `primary/border` = `blue/800` → 1.28:1 |
| radius 20 / 16 | `radius/full` | both already exceed half the height |
| `itemSpacing` 10 / 8 | omitted | inert in all 20 — §3.3 |
| knob `strokeWeight: 1` with no strokes | omitted | vestigial |
| no motion at all | 150ms ease + `prefers-reduced-motion` | the affordance is a sliding knob |
| no label | a required `label` prop | §3.4 |

### 9.5 A token-naming caveat

This file uses `--zf-<role>`. **`ZF-COLORS.md` declares the generated convention as
`--zf-color-<role>`. Check what `tokens/semantic.css` actually emits and use that prefix.**

### 9.6 Verification checklist

| Check | Expected |
|---|---|
| Off track colour | `neutral/1100` `#71758F`. **If it renders light grey, someone restored `#D3D3E5` or bound it to `neutral/700` — both fail** |
| Knob against the off track | **4.52:1** |
| Off track against the page | **4.52:1** — the check option B failed |
| Knob colour | `surface/raised` — not `surface/default`, not `base-white` |
| Knob has no border | visible knob is exactly **14px** (10px small), not 12px |
| **Hover actually fires** | mouse over the label — the track darkens to `#6A6E85`. If nothing happens, hover is on the input instead of the wrapper — §8 |
| Focus ring | `focus/ring`, identical to the button's, 2px, 2px offset. Offset must not be 0 |
| Error with no focus | **red ring visible** — Figma shows nothing |
| Error ring is **outside** the track | a 1px page-coloured gap between the track edge and the red |
| Error on hover, and when on | still red, and still outside |
| Error **when disabled** | **no ring** — deliberately suppressed |
| Error **and** focused | two concentric rings, not one thick band |
| Off-disabled | the *default* track at 50% → `#B8BAC7` |
| On-disabled | `primary/default` at 50% → `#9CBAF5`. **Not `primary/border`** |
| Knob travel | 12px large, 10px small |
| Small size | 24 × 14 with a 10px knob — not a scaled 30 × 18 |
| Row height | ≥ 24px |
| Screen reader | announces "switch, on" / "switch, off" |
| `prefers-reduced-motion` | the knob jumps instead of sliding |
| Dark mode | knob **3.35:1** against the off track, track **3.58:1** against the page |

---

## 10. Defects in the Figma source

| # | Severity | Defect | Fix |
|---|---|---|---|
| 1 | **Critical** | **White knob is 1.48:1 against the off track**, and knob position conveys the state. The off track is also 1.48:1 against the page | §2.1 — darken the track to `neutral/1100` (**4.52:1 both ways**). A knob border is *not* sufficient: 2.95:1 |
| 2 | **High** | **Error renders only on focus.** 12 of 32 variants missing, all non-focus error | Add a persistent error treatment, then the 8 default and hover variants |
| 3 | **High** | **Both sizes fail 2.5.8** — 18px and 14px tall against a 24px minimum, in a dimension not an area | Ship a label composite with a ≥24px row |
| 4 | **High** | **The whole off state is raw and unbound** — and **neither value exists as a ZF primitive**, so there is nothing to bind them *to* | Retire both values; bind `neutral/1100` / `neutral/1200` |
| 5 | **High** | Off-disabled is built from the **hover** track | Use the default track at 50% |
| 6 | Medium | Knob is `color/base/white` — a primitive, so it does not theme. Open item 38 | Bind **`surface/raised`** |
| 7 | Medium | Focus ring bound to **`primary/text`** — a text role used as a stroke — one of **four** distinct ring colours across five components | Bind `focus/ring` |
| 8 | Medium | Focus ring strokes are exactly `float32(36/35)` and that × 0.8 — sub-pixel, blurry, resize residue | 2px both |
| 9 | Medium | The ring's `INSIDE` stroke leaves **0.97px** clear, not the 2px the canon claims | CSS `outline` with `outline-offset: 2px` |
| 10 | Medium | **No motion defined anywhere**, yet the entire affordance is a sliding knob | 150ms ease, honour `prefers-reduced-motion` |
| 11 | Medium | **No label composite** | Add `Toggle + label`, 8px gap, ≥24px row |
| 12 | Medium | The small size is not a uniform scale — 0.800 / 0.778 / 0.714 with padding fixed at 1.000 | Document as deliberate, or scale the padding |
| 13 | Low | Error ring bound to the primitive `color/red/1200` | `danger/default` |
| 14 | Low | On-disabled bound to the primitive `color/blue/900` | A `primary/disabled` role |
| 15 | Low | The focus-ring frame carries a **hidden** `#D3D3E5` fill on all 8 focus variants | Delete |
| 16 | Low | `itemSpacing` 10 / 8, inert in all 20 | Remove |
| 17 | Low | Disabled uses `opacity: .5` where the checkbox and radio use fills — three mechanisms | Pick one |
| 18 | Low | The knob carries `strokeWeight: 1` with **zero strokes** | Remove |
| 19 | Low | The `State` axis is cased `Default` / `Hover` / `Disabled` but **`focus`** lowercase | Rename to `Focus` |

**The ones that matter:** 1 (the control's primary signal fails), 2 and 3 (both WCAG), 4 (the failing
colours are untokenised *and* unmatchable).

### 10.1 The canon, checked

Where it is **right**:

| Canon §2.4 says | Verdict |
|---|---|
| Track off `#D3D3E5` is "legacy, Neutral 700, **ΔE 2.6**" | ✓ **correct.** It is off-palette. An earlier draft of this file treated the canon as wrong and proposed binding to `neutral/700`; that would have changed the colour *and* still failed |
| Track off hover `#BCBCD1` is "legacy, Neutral 800" | ✓ **correct**, same way |

Where it is **stale or wrong**:

| Canon §2.4 says | Measured |
|---|---|
| Focus ring `#1C5BD9` "Blue 1400, **exact**" | bound to the **role** `primary/text` — better than stated, but the wrong role |
| Track on disabled `#94B3F2` at "2.10:1" | 2.10 is `blue/900` at full opacity; the variant is `opacity: .5`, so it renders `#CAD9F8` at **1.42:1** |
| Focus ring "2px clear on all sides" | the *frame* is 2px clear; the visible ring's inner edge is **0.97px** |
| "Five of eight values are exact ERP primitives" | 32 of 56 paints are primitive-bound, 6 role-bound, and **18 raw** |

> **The lesson, recorded because it keeps recurring:** a raw hex is not "really" the nearest palette
> step. Resolve the identifier, and when there is no identifier, check whether the value exists in the
> palette at all before proposing a binding. Here it does not, and the canon said so.

---

## 11. Open decisions

| # | Question | Blocks |
|---|---|---|
| 1 | **Accept the darker off track (`neutral/1100`, 4.52:1)?** The only option that passes, and it changes how every off toggle looks | defect 1 |
| 2 | Create **`border/control` = `neutral/1100`** as a role, so five components draw their boundary from one token? | defect 1 |
| 3 | Add a persistent error treatment and the **8** `Default` + `Hover` error variants? | defect 2 |
| 4 | Build a `Toggle + label` composite? Without one, 2.5.8 cannot be met | defects 3, 11 |
| 5 | Standardise the focus ring on `focus/ring` across all **five** controls? | defect 7 |
| 6 | One disabled mechanism — opacity, or fills? | defect 17 |
| 7 | Is the non-uniform small scale deliberate? | defect 12 |
| 8 | Adopt 150ms ease as the system's motion default, or define a motion scale first? | defect 10 |

Decision 2 is the highest-leverage change in the system: one new role clears a 1.4.11 failure in five
components.

---

**Provenance.** Measured in `Tin Tin` (`zZtArxOeRCjd7pKE25HQVS`), page `Toggle` (`13:6177`), component
set `Toggle` (`13:6181`), on 2026-08-21 via the Figma Plugin API. All 56 paints resolved by variable ID,
which is how the 18 raw values and the `primary/text` misuse were found. Contrast computed for the knob
against its own track **and** the track against the page, with the disabled states composited at their
actual 50% opacity. Target size against 2.5.8 per dimension.

**rev 2 additionally enumerated every variable in all five local collections** to establish that no
primitive equals `#D3D3E5` or `#BCBCD1`, and resolved every role through both Light and Dark modes to
its terminal hex. Every ratio in §2.1, §4.1, §4.2 and §9.6 was recomputed from those resolved values.

**Companion files:** `ZF-DESIGN-CANNON.md` §2.4, `ZF-CHECKBOX.md`, `ZF-RADIO.md`, `ZF-INPUT-FIELD.md`,
`ZF-BUTTON.md`, `ZF-COLORS.md`, `ZF-SCALES.md`.
