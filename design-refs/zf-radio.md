# ZF Design Cannon — Radio Button

**Component:** §2.2 of the canon · **Figma:** `Tin Tin` — page `radio button` (`11:3768`) — component
set `radio` (`11:3779`) · **CSS class:** `.zf-radio`

**Measured 2026-08-20.** Every number here was read out of the component set. As with the status
badge there are three descriptions in play — the set itself, the Figma documentation frame `12:3795`
(stamped *v0.1.0 · 13 Aug 2026*), and canon §2.2 — and all three disagree. The set is the only one
that is not a claim, so it wins; §12 lists what the other two get wrong.

**Read this first.** Radio is one of the **12 legacy non-`zf-` component sets**, so every retrofit
pass skipped it — same as the badge. But radio is worse in one specific way: its five border colours
are bound to **remote paint styles**, not variables. A variable can at least be re-pointed by a mode.
A style cannot. The borders are the entire visual language of this control, and they are the part
furthest outside the system.

---

## 1. Identity

| | |
|---|---|
| Component set | `radio` — node `11:3779`, key `b74511bb…` |
| Page | `radio button` (`11:3768`) |
| Axes | 3 — `State` (4) × `Is Active` (2) × `Is Error` (2) = **16 combinations** |
| Variants present | **10 of 16** — incomplete, see §3 |
| Children | **none** on 7 variants; 1 on each of 3 — the ring on both focus variants, and a stray frame on `11:3780` |
| Text nodes | **0** — this is the control only, no label |
| Component properties | none beyond the 3 variant axes — no text, boolean or swap property |
| Instances in the file | **0** |
| Documentation frame | `12:3795` — 1680 × 6450, 10 sections, **v0.1.0 · 13 Aug 2026** — stale, see §12.2 |
| Set description | *(empty)* |
| Variant descriptions | *(empty on all 10)* |
| Documentation links | *(none)* |

### 1.1 Set construction

| | |
|---|---|
| Set frame auto-layout | `NONE` — variants hand-placed |
| Grid | **regular** — columns x = 28, 88, 148, 208 (60px apart); rows y = 34, 149, 264 (115px apart) |
| Column meaning | `default` · `hover` · `focus` · `disabled` |
| Row meaning | unchecked · checked · error |
| `State` dropdown order | `default`, `hover`, `focus`, `disabled` — sensible |
| `Is Active` dropdown order | **`yes`, `no`** — reversed; the default value `no` is listed second |
| `Is Error` dropdown order | `no`, `yes` |
| Set wrapper fill | bound to `surface/default` — the only `ZF Semantic` binding on the page |

The grid is **tidier than the badge's**: consistent 60px columns and 115px rows, one column per
interaction state, one row per selection/validation condition. Two cells are empty — `focus`/error
and `disabled`/error — and that is exactly where two of the six missing variants sit.

### 1.2 The grid says 12 cells; the axes say 16

The canvas is a 4 × 3 grid: four interaction states against three conditions — unchecked, checked,
error. That is a **12-cell** model, and it is a coherent one: it treats "error" as a third value of
one condition axis rather than as a boolean orthogonal to selection.

Figma declares something else. `Is Active` and `Is Error` are two independent booleans, which
multiplies out to 16. **No variant anywhere combines them** — `Is Active=yes, Is Error=yes` does not
exist in any of the four states. So four of the six gaps are one missing idea, repeated four times,
not four separate omissions.

This is the canon's *one axis, one dimension* defect, recorded against the button, the pill, the
wizard, the segmented control, the stepper, and most sharply the avatar — whose axes claimed 56
combinations against 28 defined. Here the axes over-declare the design, the properties panel offers
combinations that were never drawn, and a consumer who picks one gets whichever variant Figma falls
back to. Either draw `checked + error` or collapse the two booleans into a single `Condition` axis
with values `unchecked` / `checked` / `error` — which is what the canvas already believes.

### 1.3 Zero instances

`radio` is used nowhere in the file. Confirmed by walking all 28 pages and resolving every instance's
main component: `0` point at `11:3779`. The same was true of the status badge. Neither of the two
form controls documented so far is actually consumed by anything.

---

## 2. Anatomy

Selection is a **ring, not a dot**. The border thickens from 1px to 3px, which leaves a 6px white
core. Nothing is drawn in the centre, and a developer must not add a dot.

| Part | Detail |
|---|---|
| Control | 12 × 12, `cornerRadius: 999` |
| Border — resting / hover / error | **1px, `CENTER`-aligned** |
| Border — selected | **3px, `INSIDE`-aligned** — leaves a 6px white core |
| Fill | `#FFFFFF`; `color/neutral/400` on disabled-unchecked only |
| Focus ring | separate 16 × 16 frame, `layoutPositioning: ABSOLUTE` at x/y = −2, radius 999 |
| Focus ring stroke | **1.1428570747375488px**, `OUTSIDE` |
| Hover halo | `DROP_SHADOW`, 0 offset, 0 blur, **3px spread**, 20% alpha — a solid ring, not a glow |

There is no label, no description, no error-message slot and no hit-area wrapper. Everything except
the 12px circle is the consumer's problem, which is what §8 is about.

---

## 3. The variant matrix

| | `Is Active=no, Is Error=no` | `Is Active=yes, Is Error=no` | `Is Active=no, Is Error=yes` | `Is Active=yes, Is Error=yes` |
|---|---|---|---|---|
| `default` | ✓ `11:3780` | ✓ `11:3790` | ✓ `11:3782` | ✗ |
| `hover` | ✓ `11:3788` | ✓ `11:3792` | ✓ `11:3789` | ✗ |
| `focus` | ✓ `11:3783` | ✓ `11:3785` | ✗ | ✗ |
| `disabled` | ✓ `11:3787` | ✓ `11:3791` | ✗ | ✗ |

**10 present, 6 missing.** Ranked by consequence:

| Missing | Consequence | Verdict |
|---|---|---|
| `focus` + error, unchecked | **A keyboard user in an error state gets no focus indication** | must add |
| `focus` + error, checked | same, when selected | must add |
| `default` + error, checked | a selected option cannot show a validation error | should add |
| `hover` + error, checked | same, on hover | should add |
| `disabled` + error, unchecked | undefined — a disabled control cannot be corrected | likely correct to omit |
| `disabled` + error, checked | same reasoning | likely correct to omit |

The two `focus` + error gaps are the serious ones and they are cheap to close: error changes the
border colour, focus adds a separate ring, so the two compose without interacting. There is no design
question here, only missing artwork.

---

## 4. Geometry — measured

| Property | Value | Bound to | Should be |
|---|---|---|---|
| Size | **12 × 12** | see §4.2 | — |
| `minWidth` / `minHeight` | 12 | remote variable **named `12`** | a ZF token |
| `maxWidth` / `maxHeight` | 14 | remote variable **named `14`** | a ZF token |
| Corner radius | **999**, uniform | *nothing* | `radius/full` |
| Border — resting / hover / error | 1px, `CENTER`, all four sides | remote **style** | a role |
| Border — selected | 3px, `INSIDE`, all four sides | remote **style** | a role |
| Focus ring frame | 16 × 16 at (−2, −2), `ABSOLUTE`, radius 999 | — | — |
| Focus ring stroke | **1.1428570747375488px**, `OUTSIDE` | remote **style** | 2px |
| Focus ring constraints | `CENTER` / `CENTER` | — | — |
| Hover halo | 0 / 0 / 3px spread / 20% | *nothing* | — |
| `layoutMode` | **`VERTICAL`** on all 10 — with no children | — | remove |
| `itemSpacing` | **10** on all 10 — with no children | *nothing* | remove |
| Focus ring `itemSpacing` | **13.333333969116211** — also childless | *nothing* | remove |
| `clipsContent` | `true` on 8, **`false`** on the 2 focus variants | — | correct as-is |
| Effects | halo on 6 of 10 — **2 visible, 4 hidden** | — | see §4.5 |
| Opacity · blend · rotation | 1 · `PASS_THROUGH` · 0 on every node | — | — |

### 4.1 A selected radio is 1px smaller than an unselected one

This is measured, and it is not in the canon.

| | Stroke | Alignment | Outer diameter | Inner |
|---|---|---|---|---|
| Resting / hover / error | 1px | **`CENTER`** | **13px** | 11px |
| Selected | 3px | **`INSIDE`** | **12px** | 6px (the white core) |

A `CENTER`-aligned stroke straddles the path: half of the 1px sits outside the 12px frame, so the
visible circle is 13px across. An `INSIDE`-aligned stroke sits entirely within, so the selected
circle is 12px across.

**Selecting a radio therefore shrinks it by half a pixel on every side.** In a vertical group the
left edges of the circles will not line up between the chosen option and the rest. At 12px, half a
pixel is 4% of the control and it will read as a wobble rather than as a size change.

Fix by making the resting stroke `INSIDE` too. That takes the resting outer diameter to 12px and the
inner to 10px, matching the selected outer, and it costs nothing visually except 0.5px of border
that is currently overhanging.

### 4.2 The 12px width is held up by a remote variable, not by a size

Eight of the ten variants have `layoutSizingHorizontal: HUG` with `layoutMode: VERTICAL`, and
**seven of those eight have no children at all**. A hug-width auto-layout frame with no children and
no padding computes to zero width. These report 12px only because `minWidth` is bound to a variable
that says 12.

The eighth, `11:3785` (`focus, checked`), has one child — but it is the focus ring, which is
`layoutPositioning: ABSOLUTE` and therefore excluded from the layout calculation. So it hugs to zero
too. Eight variants, one reason.

So on 80% of the set the control's dimensions are a side-effect of a constraint on a remote library
variable. If that library detaches or the variable is deleted, eight radios collapse to zero width.
The two `FIXED` variants would survive — which means the failure would be partial and therefore
confusing.

And the variables themselves are **named `12` and `14`**. A token named after its own value carries
no meaning, cannot be re-tuned without lying, and tells a developer nothing about why the number is
what it is. These want to be `control/size-sm` and `control/size-md`, or simply a fixed 12 with the
auto-layout removed.

### 4.3 The focus ring gap is 1.5px, not 2px — and only when unchecked

The ring frame is 16 × 16 positioned at (−2, −2), so its **inner** edge is 2px clear of the 12px
frame on every side. But the control's *visible* edge is not the frame edge:

| Focus variant | Control outer | Ring inner | Actual gap |
|---|---|---|---|
| `focus, Is Active=no` (`11:3783`) | **13px** — 1px `CENTER` | 16px | **1.5px** |
| `focus, Is Active=yes` (`11:3785`) | 12px — 3px `INSIDE` | 16px | **2px** |

The ring's own stroke is `OUTSIDE`-aligned, so its outer extent is 16 + 2 × 1.142857 = **18.2857px**.

At the bound maximum of 14px the gaps become **0.5px** unchecked and **1px** checked — the ring
nearly touches the control. Both numbers follow from §4.1, and both disappear once the resting stroke
becomes `INSIDE`.

### 4.4 The ring has been resized at least twice

Two sub-pixel values on the ring frame are scale artefacts, and they disagree about the scale:

| Value | Equals | Implies |
|---|---|---|
| stroke `1.1428570747375488` | 16 ÷ 14 = 1.1428571 | a **14px** original scaled to 16 |
| `itemSpacing` `13.333333969116211` | 10 × 16 ÷ 12 = 13.333333 | a **12px** original scaled to 16 |

So the ring was built at one size, scaled, rebuilt or re-scaled at another, and both operations left
a fingerprint. Sub-pixel strokes render blurry at 1× — this is §1.7.6 of the canon, *the resize
trap*, showing up on a non-icon node. Set the stroke to 2px and delete the item spacing.

### 4.5 The hover halo, counted

The canon calls the halo "inconsistent". Measured:

| Variant | Halo | Colour | Visible |
|---|---|---|---|
| `hover, unchecked` `11:3788` | yes | `#1B6DE0` 20% | **✓ visible** |
| `hover, unchecked, error` `11:3789` | yes | `#CC2132` 20% | **✓ visible** |
| `hover, checked` `11:3792` | yes | `#1B6DE0` 20% | ✗ hidden |
| `default, checked` `11:3790` | yes | `#1B6DE0` 20% | ✗ hidden |
| `focus, checked` `11:3785` | yes | `#1B6DE0` 20% | ✗ hidden |
| `disabled, checked` `11:3791` | yes | `#1B6DE0` 20% | ✗ hidden |
| the other 4 variants | none | — | — |

**Six of ten carry the effect; two show it.** The four hidden ones are all the `checked` variants, so
this is not random — the halo was authored on the checked column and then switched off, which reads
like an abandoned decision rather than an oversight.

One detail matters if any of them is ever switched back on. **Two of the six halos do not match their
own border:**

| Variant | Halo | Border | |
|---|---|---|---|
| `hover, checked` `11:3792` | `#1B6DE0` | `#1B4C91` | ✗ mismatch |
| `disabled, checked` `11:3791` | `#1B6DE0` | `#A7C7F5` | ✗ mismatch |
| the other four | matches its border | | ✓ |

Both mismatches are on hidden halos, so neither is visible today. The pattern is that all four hidden
halos were left at `#1B6DE0` — the checked-column default — while two of those four borders moved on.
Enabling them without fixing the colour would produce two states where the halo and the border are
different blues.

### 4.6 The stray frame is invisible by accident

Canon issue 4 stands: variant `11:3780` contains `Frame 38` — an empty **100 × 100** frame at (0, 0),
no fill, no stroke, inside a 12 × 12 control.

It renders nothing today for two independent reasons: it has no paint of its own, and `11:3780`
clips. Neither is a safeguard. The two focus variants must set `clipsContent: false` so the ring can
overhang, so **if the `focus` + error variants are built by duplicating `11:3780`** — the obvious way
to build them — the clip comes off and the only thing still hiding a 100 × 100 frame is that nobody
has given it a fill.

Delete `Frame 38` before adding any variant, not after.

---

## 5. Colour — measured

Contrast is measured against **WCAG 1.4.11 non-text contrast**, which requires **3:1** for the visual
boundary of a control — not the 4.5:1 text threshold. **vs white** is the control against the page.

| Role | In Figma | Bound to | vs white | 3:1 | Nearest ZF primitive | ΔE |
|---|---|---|---|---|---|---|
| Border — resting | `#E4E4F0` | **style** `neutral/neutral \| 350` | **1.26** | ✗ | `color/neutral/600` `#DFE0EB` | 1.63 |
| Border — selected / hover | `#1B6DE0` | **style** `blue/blue \| 700` | **4.87** | ✓ | `color/blue/1200` `#3874EB` | 4.07 |
| Border — hover selected | `#1B4C91` | **style** `blue/blue \| 800` | **8.44** | ✓ | `color/blue/1600` `#1A4291` | 8.81 |
| Focus ring | `#1B4C91` | **style** `blue/blue \| 800` | **8.44** | ✓ | `color/blue/1600` `#1A4291` | 8.81 |
| Border — error | `#CC2132` | **style** `red/red \| 700` | **5.48** | ✓ | `color/red/1400` `#B22D36` | 14.08 |
| Border — disabled selected | `#A7C7F5` | **style** `blue/blue \| 400` | **1.73** | ✓ exempt | `color/blue/800` `#B1CAFC` | 3.54 |
| Fill — disabled | `#F0F1FA` | `color/neutral/400` ✓ | **1.12** | decorative | `color/neutral/400` `#F0F1FA` **exact** | 0.0 |
| Fill — resting | `#FFFFFF` | `color/base/white` ✓ | — | — | `color/base/white` `#FFFFFF` **exact** | 0.0 |

### 5.1 Two failures, one exemption

| | |
|---|---|
| **Resting border — `#E4E4F0` at 1.26:1** | ✗ fails 1.4.11. This is the default appearance of every radio in the product. |
| **Disabled selected border — `#A7C7F5` at 1.73:1** | ✗ on the number, but **exempt** — 1.4.11 does not apply to disabled controls. |
| Disabled fill — `#F0F1FA` at 1.12:1 | decorative, not a boundary. Not a failure on its own, but see §5.2. |
| Selected `#1B6DE0` 4.87 · hover-selected and ring `#1B4C91` 8.44 · error `#CC2132` 5.48 | ✓ all clear 3:1 comfortably |

The resting border is the one that matters. It is the state a radio is in almost all of the time, and
at 1.26:1 the circle is very nearly invisible against a white form. The first ZF neutral step that
reaches 3:1 is **`color/neutral/1100` `#71758F` at 4.52:1** — five steps darker than the canon's
proposed `neutral/600`, which measures 1.31:1 and fails too. Snapping to the palette does not fix
this; only choosing a darker step does.

### 5.2 A disabled radio is almost not there

Its fill is `#F0F1FA` and its border is `#E4E4F0`. Against each other: **1.121:1, ΔE 4.70.** Against
white: 1.12 and 1.26. So a disabled radio is a pale grey disc on a white page with a border you
cannot separate from the fill.

Disabled controls are exempt from contrast minimums, so this is not a WCAG failure. It is still worth
a decision: a control the user cannot see at all is not communicating "unavailable", it is
communicating nothing. Note that `ZF Semantic`'s own `text/disabled` sits at `neutral/900` `#AEB1C2`,
which is 2.13:1 against white — so the system's existing position is that disabled things may fall
below 3:1. The question is whether *invisible* is the same as *dimmed*.

### 5.3 The white core is not a token

The selected state's 6px core is not a fill — it is the 3px `INSIDE` stroke leaving the white
`#FFFFFF` fill exposed in the middle. So the core inherits `color/base/white` from the fill, which is
correct today and wrong in dark mode: the core needs to be the *surface* colour, not white. That is
`surface/default`, which the set wrapper is already bound to and no variant is.

---

## 6. Where these colours come from

**All five border colours bind to remote paint styles.** Not variables — styles.

| Bound to | Nodes | Collection |
|---|---|---|
| **Remote paint style** `neutral/neutral \| 350` `#E4E4F0` | 3 borders — resting, focus-unchecked, disabled-unchecked | **outside ZF** |
| **Remote paint style** `blue/blue \| 700` `#1B6DE0` | 3 borders — hover, default-checked, focus-checked | **outside ZF** |
| **Remote paint style** `blue/blue \| 800` `#1B4C91` | 1 border + **2 focus rings** — hover-checked | **outside ZF** |
| **Remote paint style** `red/red \| 700` `#CC2132` | 2 borders — default-error, hover-error | **outside ZF** |
| **Remote paint style** `blue/blue \| 400` `#A7C7F5` | 1 border — disabled-checked | **outside ZF** |
| `color/base/white` | 9 fills | `ZF Primitives` ⚠️ primitive |
| `color/neutral/400` | 1 fill — disabled-unchecked | `ZF Primitives` ⚠️ primitive |
| `ZF Semantic` | **0** on any variant | ✗ |

### 6.1 A style is worse than a variable

The badge's colours were bound to remote *variables*, which is bad but recoverable — a variable has a
collection, a mode, and can in principle be re-pointed. The radio's borders are bound to remote
**paint styles**, and a paint style holds one flat paint with no mode axis at all. It cannot respond
to a theme under any circumstances.

So the radio does not merely lack a dark mode. **Its borders are structurally incapable of having
one** until every one of the 12 style references is replaced with a variable binding. That is the
single highest-value fix on this component, and unlike the colour question on the badge it needs no
design decision — the values do not have to change, only what holds them.

### 6.2 The remote ladder, again

`neutral/neutral | 350`, `blue/blue | 700`, `red/red | 700` — the same external library as the badge,
with the same half-steps and the same unrelated numbering. `blue | 700` here is `#1B6DE0`, a
mid-saturation blue; ZF's `blue/700` is `#C0D5FD`, a pale tint. **The step numbers are not
comparable between the two systems**, so nobody should map these by arithmetic. §5's ΔE column is the
only safe guide.

---

## 7. Token binding audit

| Layer | Bound? | Target | Verdict |
|---|---|---|---|
| Border and ring colours — 12 references | yes | remote paint **styles** | ✗ outside ZF, no mode axis |
| Fill colours — 10 | yes | `color/base/white`, `color/neutral/400` | ⚠️ primitives, should be roles |
| Corner radius — 12 | **no** | raw `999` | ✗ → `radius/full` |
| min/max size — 10 × 4 fields | yes | remote variables named `12` and `14` | ✗ outside ZF, meaningless names |
| Stroke weights — 1px / 3px / 1.14px | **no** | raw | ✗ no token exists yet |
| Hover halo — 6 | **no** | raw 3px spread, 20% alpha | ✗ no shadow tokens exist |
| `itemSpacing` — 12 | **no** | raw `10` × 10 and `13.3333` × 2 | ✗ delete, don't bind |
| Focus ring geometry | **no** | raw 16 × 16 at (−2, −2) | ✗ derive from control size |

**Bound: 62 fields — 12 stroke styles + 10 fill variables + 40 min/max fields. Bound to something
inside ZF: 10, and all 10 are fills.** Same shape as the badge: the parts that carry the design are
outside the system, and the parts inside it are white.

`radius: 999` is the §1.5 violation the avatar fixed across 80 nodes and that §2.22 recorded as a
standing rule — never `999` or `size ÷ 2`, always `radius/full`. Radio predates that fix and still
has the raw value.

---

## 8. Accessibility

| Requirement | Status | Detail |
|---|---|---|
| **1.4.11 Non-text contrast** | ✗ **fail** | Resting border `#E4E4F0` at **1.26:1** against white; 3:1 required |
| **2.5.8 Target size** | ✗ **fail** | 12 × 12 control against a 24 × 24 minimum — **25% of the required area** |
| **2.4.7 Focus visible** | ⚠️ partial | A ring exists, but not for error states — both `focus` + error variants are missing (§3) |
| Focus ring contrast | ✓ | `#1B4C91` at 8.44:1 against white |
| Focus ring thickness | ⚠️ | 1.14px — below the 2px that WCAG 2.2's focus-appearance guidance expects, and blurry |
| **1.4.1 Use of colour** | ⚠️ partial | Error is a red border and nothing else |
| 2.1.1 Keyboard | ✓ | Inherited free, *provided* a native `<input type="radio">` is used |
| 1.3.1 Info and relationships | ⚠️ | No grouping is part of the component — see below |
| 4.1.2 Name, role, value | ⚠️ | No label is part of the component |

**Target size.** The 12px circle must not be the hit area. 12 × 12 is 144px² against the 576px²
required — a quarter. Wrap it in a `<label>` with at least 24 × 24 of clickable space, which is good
practice regardless since clicking the text should select the option.

**Error by colour alone.** A red border is the only signal, and at `#CC2132` it is distinguishable
from `#E4E4F0` but conveys "error" only by convention. Pair it with a message referenced by
`aria-describedby` and set `aria-invalid="true"`.

**Grouping.** Radios must sit in a `<fieldset>` with a `<legend>`, or a container with
`role="radiogroup"` and an accessible name. Without it a screen reader announces the options but not
what the user is choosing between. Nothing in the component set encodes this, and there is no
composite to enforce it — see defect 3.

**The focus ring is the accessibility feature most at risk.** It is 1.14px, it is bound to a remote
style, its geometry is hard-coded to a 16px square that does not track the control's own 12–14px
range, and it does not exist for error states. Of the four, only the last is listed in the canon.

---

## 9. Usage

**Do**

- Use a radio only when **exactly one** option must be chosen. Zero-or-more is checkboxes.
- Always wrap the group in a `<fieldset>` with a `<legend>`, or `role="radiogroup"` with a name.
- Make the text label clickable. It is the hit area, and it is what solves 2.5.8.
- Pre-select a sensible default where one exists. An empty group forces a choice the user may not
  have.
- List options in a predictable order — frequency, alphabetical, or numeric.

**Don't**

- Don't use a radio for a single on/off choice. That is a checkbox or a switch.
- Don't rely on the red border alone to signal an error.
- **Don't add a centre dot.** Selection is a 3px ring with a white core. This is the component's one
  genuinely unusual decision and it will be "corrected" by anyone who does not read this.
- Don't use `:focus` for the ring. Use `:focus-visible`, so mouse users do not see it on click.
- Don't make the 12px circle the click target.
- Don't reach for the 14px size casually — at 14px the focus ring gap drops to 0.5px (§4.3).

---

## 10. Code

Radio states map onto **native browser pseudo-classes**, so unlike the badge almost no classes are
invented. Only validation needs one, because CSS has no reliable selector for "this group is
invalid".

| Figma axis value | Selector | Why |
|---|---|---|
| `State = default` | `.zf-radio` | base |
| `State = hover` | `:hover` | native |
| `State = focus` | `:focus-visible` | native — **not** `:focus`, so the ring is keyboard-only |
| `State = disabled` | `:disabled` | native — also drops it from the tab order for free |
| `Is Active = yes` | `:checked` | native |
| `Is Error = yes` | `.zf-radio--error` | **not** native; needs a class |

```css
.zf-radio {
  appearance: none;
  width:  var(--zf-control-sm);        /* 12px — see §4.2, currently a remote variable named "12" */
  height: var(--zf-control-sm);
  border-radius: var(--zf-radius-full);
  background: var(--zf-surface-default);   /* not --zf-base-white: this is the white core in §5.3 */
  border: 1px solid var(--zf-neutral-1100);/* 4.52:1 — NOT neutral-600, which fails 1.4.11 (§5.1) */
  box-sizing: border-box;                  /* makes the resting outer diameter 12px, matching
                                              :checked — fixes the 1px jump in §4.1 */
  margin: 0;
}

.zf-radio:checked            { border-width: 3px; border-color: var(--zf-blue-1200); }
.zf-radio:hover              { border-color: var(--zf-blue-1200);
                               box-shadow: 0 0 0 3px rgb(56 116 235 / .2); }
.zf-radio:checked:hover      { border-color: var(--zf-blue-1600); box-shadow: none; }
.zf-radio:focus-visible      { outline: 2px solid var(--zf-blue-1600); outline-offset: 2px; }
.zf-radio:disabled           { background: var(--zf-neutral-400); }
.zf-radio:checked:disabled   { border-color: var(--zf-blue-800); }
.zf-radio--error             { border-color: var(--zf-red-1400); }
.zf-radio--error:hover       { box-shadow: 0 0 0 3px rgb(178 45 54 / .2); }
```

Four of those lines deliberately **do not** reproduce Figma, and each is a defect being routed around
rather than copied:

| Line | Figma has | Why the CSS differs |
|---|---|---|
| `border-color: neutral-1100` | `#E4E4F0`, 1.26:1 | it fails 1.4.11 (§5.1) |
| `box-sizing: border-box` | 1px `CENTER` = 13px outer | removes the 1px jump on select (§4.1) |
| `background: surface-default` | `#FFFFFF` via a primitive | the core must follow the surface in dark mode (§5.3) |
| `outline: 2px` | a 1.14px ring frame | 2px is not blurry, and `outline-offset` tracks the control at any size (§4.3, §4.4) |

The focus ring is an `outline`, not an element. It reproduces the ring geometry, follows the control
if it grows to 14px, needs no `clipsContent: false`, and never affects layout — which is four
problems solved by not modelling it as a child.

**Missing entirely from both Figma and this CSS: the label composite.** `.zf-radio` is a bare
control. Nothing here delivers the ≥24px hit area that 2.5.8 requires, and nothing enforces the
`fieldset`. See defect 3.

---

## 11. Defects — measured, ranked

| # | Severity | Defect | Nodes | Fix |
|---|---|---|---|---|
| 1 | **Critical** | Resting border `#E4E4F0` is **1.26:1** against white — fails WCAG 1.4.11. This is the default state of every radio. `neutral/600` does not fix it either (1.31:1); the first passing step is `neutral/1100` at 4.52:1 | 3 variants | Darken to `neutral/1100`. Visible change — needs a design decision |
| 2 | **Critical** | 12 border/ring references bind to **remote paint styles**, which have no mode axis. The borders are structurally incapable of dark mode | all 10 | Replace every style reference with a variable binding. No value has to change |
| 3 | **High** | 12 × 12 is **25% of the 24 × 24** target area 2.5.8 requires, and no label or hit-area composite exists | set `11:3779` | Ship a `zf-radio-field` composite: control + label + ≥24px hit area + error message slot |
| 4 | **High** | 6 of 16 variants missing, including **both `focus` + error** — a keyboard user in an error state gets no focus indication | set `11:3779` | Add `focus`+error ×2 and `default`/`hover`+error-checked ×2. Decide explicitly on disabled+error |
| 5 | **High** | `Is Active` and `Is Error` are declared independent but **never combined in any variant** — 4 of the 6 gaps are one missing idea | set `11:3779` | Draw `checked + error`, or collapse to one `Condition` axis (§1.2) |
| 6 | **High** | **Selecting a radio changes its outer diameter from 13px to 12px** — 1px `CENTER` vs 3px `INSIDE`. Circles in a group do not align with the chosen one | all 10 | Make the resting stroke `INSIDE` |
| 7 | Medium | On 8 of 10 variants the 12px width exists **only** because a remote `minWidth` variable says 12 — childless (or absolutely-positioned-only) HUG frames that would otherwise compute to zero | 8 variants | Remove the auto-layout and set an explicit size |
| 8 | Medium | The min/max variables are **named `12` and `14`** — remote, and named after their own values | 40 fields | Replace with ZF tokens carrying meaning |
| 9 | Medium | Focus ring stroke is **1.1428570747375488px** = 16 ÷ 14, and its `itemSpacing` is 13.3333 = 10 × 16 ÷ 12 — two artefacts from two different resizes. Sub-pixel strokes render blurry | `11:3784`, `11:3786` | Set the stroke to 2px; delete the item spacing |
| 10 | Medium | Focus ring is a fixed 16px against a control that ranges 12–14px, so the gap runs 2px → 1px (checked) or 1.5px → 0.5px (unchecked) | `11:3784`, `11:3786` | Derive from control size, or use `outline-offset` as in §10 |
| 11 | Medium | Hover halo is on 6 of 10 variants: **2 visible, 4 hidden** — all four hidden ones are the `checked` column. Two of the six carry a halo that does not match their own border (`11:3792`, `11:3791`) | 6 variants | Pick one behaviour; if enabling, fix the two mismatched colours |
| 12 | Medium | `radius: 999` raw on all 10 variants **and both focus rings** — the §1.5 violation the avatar fixed across 80 nodes | 12 nodes | Bind `radius/full` |
| 13 | Medium | Stray empty **100 × 100** `Frame 38` inside a 12 × 12 control, invisible only because that variant clips. Duplicating it to build the focus+error variants will expose it | `11:3781` in `11:3780` | Delete it **before** adding variants |
| 14 | Low | `layoutMode: VERTICAL` with `itemSpacing: 10` on all 10 variants, none of which has children | all 10 | Remove the auto-layout |
| 15 | Low | A disabled radio is nearly invisible — fill vs its own border is **1.121:1**, ΔE 4.70 | `11:3787` | Exempt from WCAG, but decide whether it should be legible |
| 16 | Low | Focus ring frames carry a hidden white fill | `11:3784`, `11:3786` | Delete |
| 17 | Low | Set and all 10 variant descriptions empty; no documentation links | set + 10 | Add a description and a link to this file |
| 18 | Low | An empty `TEXT` node (`13:8055`, 0 × 15, characters `""`) is loose on the page | `13:8055` | Delete |
| 19 | Low | `Is Active` dropdown lists `yes` before `no`, though `no` is the default | set `11:3779` | Reorder |

Defects 2, 8, 12, 14, 16, 18 are one script and need no decisions. **Defect 13 must run before
defect 4.** Defects 1, 3, 5, 6 change how the control looks or behaves and need sign-off.

### 11.1 What this component needs that it does not have

Every defect above is a repair. These are absences:

- **A label composite.** Without it, 2.5.8 cannot be satisfied by any consumer who uses the component
  as shipped, and the `fieldset` requirement is documentation rather than code.
- **Stroke-width tokens.** 1px, 3px and the ring's 2px are load-bearing values with no home in
  `ZF Spacing` or anywhere else.
- **Shadow tokens.** The halo is `0 0 0 3px` at 20% and there is no shadow layer in the token system
  at all — this is the first component to need one.
- **A `checked + error` design.** Not a missing variant so much as a missing decision (§1.2).

---

## 12. Divergences

### 12.1 From canon §2.2

| Canon §2.2 says | Figma is |
|---|---|
| Colours "snapped to the ERP palette by nearest CIELAB distance" | **not one border colour is a ZF primitive** — the `ORIGINAL` column is what is drawn |
| Resting border 1.31:1 | **1.26:1** — 1.31 is the *snapped* `#DFE0EB`, not the drawn `#E4E4F0` |
| Error border 6.32:1 | **5.48:1** — 6.32 is `#B22D36`; Figma has `#CC2132` |
| Selected border 4.32:1 | **4.87:1** — 4.32 is `#3874EB`; Figma has `#1B6DE0` |
| Focus ring 9.41:1 | **8.44:1** — 9.41 is `#1A4291`; Figma has `#1B4C91` |
| Focus ring "2px clear of the control on all sides" | 2px when checked, **1.5px when unchecked** (§4.3) |
| "Size 12 × 12, bound to variables: min 12, max 14" | correct, but omits that on 8 of 10 variants the min is the **only** thing setting the width (§4.2) |
| Border colours bound to variables *(implied)* | bound to remote **paint styles** — a stronger problem (§6.1) |
| 9 issues | 19 — canon's nine map onto 8 of them, so **11 are new** |

The canon's arithmetic is sound — every contrast figure it quotes is correct **for the palette it
intends**. The error is that it presents the intended palette as the current one. Same failure as
§2.1 and the badge: a migration recorded as done that was never executed.

### 12.2 From the Figma documentation frame `12:3795`

Stamped **v0.1.0 · 13 Aug 2026**, 10 sections, 382 text nodes, sitting on the same page as the
component.

| Frame `12:3795` says | Actually |
|---|---|
| Colour table headed `ORIGINAL` → `SNAPPED`, described as "snapped to the ERP palette" | the `ORIGINAL` column is **current**; the `SNAPPED` column has never been applied |
| Its 9-item issue list | **omits the rebind entirely** — where canon §2.1.10 at least carried the badge's equivalent as issue 7 |
| Resting border 1.31:1, error 6.32:1, ring 9.41:1 | 1.26, 5.48, 8.44 — it quotes the snapped column |
| "Focus ring 16 × 16, 2px clear" | 1.5px clear when unchecked |
| Footer: "Figma is the source of truth — this frame and the markdown are regenerated from it, never edited independently" | the frame was generated from the **specification**, not from the component |

To its credit the frame shows the original and the snapped values **side by side**, so the divergence
is visible if you know to look — canon §2.2.4 does the same. What neither says is **which column is
live**. And by leaving the rebind off its own nine-item issue list, the frame implies the snap is
already done — which is the one thing that would have made the omission obvious.

**Action:** regenerate `12:3795` from the component set once defects 1 and 2 land. Do not patch it.

### 12.3 What was checked and found clean

All uniform across all 10 variants unless noted: opacity 1 · blend `PASS_THROUGH` · rotation 0 · not
locked · all visible · uniform corner radii `[999,999,999,999]` · uniform per-side stroke weights ·
no dash patterns · every paint at opacity 1, and every paint visible except the two hidden ring fills
in defect 16 · constraints `MIN`/`MIN` on variants and `CENTER`/`CENTER` on both rings · zero padding
on every frame · no export settings · no prototype reactions · no plugin data · no text nodes
anywhere in the set · no component properties beyond the 3 variant axes · no `effectStyleId` on any
node · all 10 variant IDs and both ring IDs unique · the grid is regular at 60 × 115 (§1.1) ·
`clipsContent: false` on exactly the two variants that need it.

The regular grid is worth calling out as a positive: the badge's variants were scattered across nine
irregular columns, and this set is not.

---

## 13. What needs a decision

| # | Question | Blocks |
|---|---|---|
| 1 | Darken the resting border to `neutral/1100` (4.52:1)? It is a visible change to every radio in the product, and the alternative is shipping a 1.4.11 failure | defect 1 |
| 2 | Build the `zf-radio-field` composite — control + label + ≥24px hit area + error slot? Without it 2.5.8 cannot be met | defect 3 |
| 3 | Is `checked + error` a real state? If yes, draw 4 variants. If no, collapse `Is Active` × `Is Error` into one `Condition` axis | defects 4, 5 |
| 4 | Is `disabled + error` deliberately excluded? | defect 4 |
| 5 | Make the resting stroke `INSIDE` so selection stops changing the diameter? | defect 6 |
| 6 | Halo on `checked` hover — enable it, or delete it from the four variants that hide it? | defect 11 |
| 7 | Should a disabled radio be legible at all? Currently fill and border differ by 1.121:1 | defect 15 |
| 8 | Add a shadow token layer, or leave the halo hard-coded? This is the first component to need one | §11.1 |

Questions 1, 2, 3 and 5 change what ships. 4, 6, 7 and 8 are scoping.

---

**Provenance.** All values read from `Tin Tin` (`zZtArxOeRCjd7pKE25HQVS`), page `radio button`
(`11:3768`), component set `radio` (`11:3779`), on 2026-08-20 via the Figma Plugin API. Enumerated
recursively: 10 variants, 13 nodes, 24 paints, 12 stroke-style references, 6 effects, 40 bound
min/max fields, and every geometry, layout, stroke, effect, constraint, prototype, export and
plugin-data field — §12.3 lists what came back clean. All 5 paint styles and all 5 variable IDs
resolved by ID. Contrast is WCAG 2.1 relative luminance against the **1.4.11 3:1** non-text
threshold; ΔE is CIE76 against all 200 `ZF Primitives`. Instance count from a full walk of all 28
pages resolving every instance's main component. Documentation frame `12:3795` read in full — 382
text nodes — and diffed in §12.2.

**Companion files:** `ZF-DESIGN-CANNON.md` §2.2, `ZF-STATUS-BADGE.md`, `ZF-COLORS.md`,
`ZF-TYPE-SPACE.md`, `ZF-SCALES.md`.
