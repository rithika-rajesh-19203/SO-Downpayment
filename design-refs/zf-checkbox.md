# ZF Design Cannon — Checkbox

**Canon:** §2.3 · **Figma:** `Tin Tin` — page `Check box` (`13:4728`)
**Sets:** `checkbox` (`13:4746`, 15 variants) · `checkbox_defined` (`13:4782`, 2 variants)
**CSS class:** `.zf-checkbox` · **Measured 2026-08-21.**

> **This file is the implementation spec, not a transcription of Figma.**
>
> Twelve values in the Figma file should not be copied: **one** WCAG failure, **two** bindings to a
> remote library, **three** semantic roles used for the wrong purpose, **four** primitives where a role
> exists, and **two** raw unbound paints. §4 lists every one with the value to use instead and the
> reason. **Where this file and Figma disagree, this file wins.** §9 is the code — build from §9, check
> against §3 and §5, and read §9.4 before reordering the stylesheet.

---

## 1. What to build

Two things, and the second is the one product code should use:

| | `checkbox` | `checkbox_defined` |
|---|---|---|
| Figma | `13:4746` — 15 variants | `13:4782` — **2 variants** |
| What it is | the 12 × 12 box only | box + label + optional description |
| Use it for | a table's select-row cell, where the row is the hit area | **every form checkbox** |
| Instances in the file | 34 — **32 of them in the `Table` page** | 0 |

`checkbox_defined` has **no state axes at all**. Its only axis is `with_description`, and its nested
control is pinned to `State=default, is_active=no, is_error=no, is_indeterminate=no`. So it cannot
represent a checked, hovered, focused, disabled or invalid row. **In code, do not mirror that** — build
one component that takes the state as props. §9.

---

## 2. States — the 15 that exist and the 9 that do not

Figma declares one four-valued enum and three booleans: `State` (4) × `is_active` (2) × `is_error` (2)
× `is_indeterminate` (2) = **32 combinations**. But `is_active` and `is_indeterminate` are mutually
exclusive, so 8 are logically impossible. The real matrix is **24**, and 15 are drawn.

| Selection | `default` | `hover` | `focus` | `disabled` |
|---|---|---|---|---|
| **unchecked** | ✓ | ✓ | ✓ | ✓ |
| **checked** | ✓ | ✓ | ✓ | ✓ |
| **indeterminate** | ✓ | ✓ | ✓ | ✓ |
| **unchecked + error** | ✓ | ✓ | ✓ | ✗ |
| **checked + error** | ✗ | ✗ | ✗ | ✗ |
| **indeterminate + error** | ✗ | ✗ | ✗ | ✗ |

**Error styling exists only for the unchecked box.** A ticked checkbox in an invalid group shows no
error at all, and neither does a partly-selected parent row. That is the significant gap, and in code
it costs four CSS rules to fix: **§9 covers all 12 error combinations even though Figma draws 3.** It
takes four rather than one because the state selectors outrank a bare error class — §9.4.

The four `disabled + error` cells are reasonably omitted: a control the user cannot edit cannot be
corrected.

### 2.1 Model selection as one enum, not two booleans

In Figma nothing stops a designer setting `is_active=yes` and `is_indeterminate=yes` together,
producing a combination with no styling. In code, do not reproduce the two booleans:

```ts
type Selection = 'unchecked' | 'checked' | 'indeterminate';
```

That makes the invalid state unrepresentable, which is the whole point. This is the same
*one axis, one dimension* problem recorded against the avatar, the button and the pill.

---

## 3. Geometry — measured, and safe to copy

| Property | Value | Notes |
|---|---|---|
| Size | **12 × 12** | fixed on all 15 |
| Corner radius | **2** | a rounded square, not a circle |
| Border | **1px**, `CENTER`-aligned | see §3.1 |
| Check glyph | **7.318 × 5.462**, a filled path, round cap | white |
| Indeterminate glyph | **7.89 × 2**, radius clamped to a pill | white |
| Focus ring | **16 × 16** at (−2, −2), `ABSOLUTE` | 2px clear of the box |
| Hover halo | offset 0 / 0, blur **0**, spread **3**, alpha **0.2**, `NORMAL` — measured | unchecked and error only; **unbound**, §4.5 |

### 3.1 A `CENTER`-aligned 1px border makes the box 13px, not 12

Half the stroke sits outside the 12px frame, so the rendered box is **13 × 13**. The checked state
uses the same alignment, so unlike the radio this is at least consistent between states — but it means
`width: 12px` in CSS with the browser default `content-box` gives a 14px box.

**Use `box-sizing: border-box`.** That puts the border inside and renders a true 12px box in every
state.

### 3.2 Three sub-pixel values that are resize artefacts — do not copy

| Figma | Equals | Use instead |
|---|---|---|
| icon frame **9.19239** × 9.19239 | 6.5 × √2 | not needed — position the glyph with flexbox |
| focus ring stroke **1.06667** | 16 ÷ 15 | **2px** |
| focus ring radius **4.26667** | 32 ÷ 7.5 | **4px** — box radius 2 + 2px offset, so it is concentric |

The √2 on the icon frame is the fingerprint of a 45°-rotated frame that was later un-rotated; the
frame's `rotation` now reads 0 but its size still carries the factor. It is centred (12 − 2 × 1.40381
= 9.19238) so it renders correctly, and in CSS the wrapper is unnecessary anyway.

Sub-pixel strokes render blurry at 1×. The radio and the toggle carry the same class of artefact —
`ZF-RADIO.md` §4.4.

### 3.3 Padding 10 and `layoutMode: VERTICAL` are inert

All 15 variants declare 10px padding on every side and a 10px gap, inside a fixed 12 × 12 frame with
0–2 absolutely-positioned children. None of it can take effect. Ignore it entirely; it is not a
spacing decision, it is residue. Same pattern as `ZF-STATUS-BADGE.md` §3.1 and `ZF-BUTTON.md` §2.

### 3.4 Target size — 12 × 12 is 25% of the minimum

144px² against the 576px² that **WCAG 2.5.8** requires. This is why `checkbox_defined` exists and why
§9 wraps the control in a `<label>`: the label is the hit area, and it must be at least 24px tall.
**Never make the 12px box the click target.**

---

## 4. Colour — what is bound to what, and what to use instead

**42 paints across the 15 variants.** Where they point:

| Bound to | Paints | |
|---|---|---|
| **`ZF Primitives`** | **27** | `base/white` ×14, `blue/1200` ×9, `red/1200` ×3, `neutral/300` ×1 |
| `ZF Semantic` roles | 13 | `primary/active` ×4, `primary/border` ×4, `primary/text` ×2, `primary/hover` ×2, `border/default` ×1 |
| **A remote library** | **2** | `Neutral/350` — the resting border |

Nothing is raw in `checkbox` itself. But 27 of 42 point at a **primitive** rather than a role, 2 point
outside ZF entirely, and 3 of the 13 role bindings use a role that means something else. Row by row:

| # | What | Figma binds it to | Rendered | Use instead | Why |
|---|---|---|---|---|---|
| 1 | Border — resting | **`Neutral/350`, a remote library** | `#E4E4F0` | `--zf-neutral-1100` | **1.26:1, fails 1.4.11**; and a remote binding has no dark mode. §4.1 |
| 2 | **Fill — unchecked** | `color/base/white` | `#FFFFFF` | **`--zf-surface-default`** | **the dark-mode bug.** §4.2 |
| 3 | Glyph — check and bar | `color/base/white` | `#FFFFFF` | `--zf-icon-inverse` | primitive → role; white in Light, dark in Dark |
| 4 | Fill + border — checked / indeterminate | `color/blue/1200` | `#3874EB` | `--zf-primary-default` | **identical value**, zero visual change |
| 5 | Border — error | `color/red/1200` | `#C9474F` | `--zf-danger-default` | primitive → role; `red/1300`, and 4.67 → 6.09 |
| 6 | Fill — disabled unchecked | `color/neutral/300` | `#F5F6FC` | `--zf-surface-disabled` | primitive → role; `neutral/400` |
| 7 | Fill — hover checked | `primary/hover` | `#2762D9` | keep ✓ | correct role |
| 8 | Fill — hover indeterminate | **`primary/text`** | `#1C5BD9` | `--zf-primary-hover` | a *text* role as a fill, and it disagrees with row 7 for the same gesture. §4.3 |
| 9 | Fill — disabled selected | **`primary/border`** | `#B1CAFC` | **keep** — see below | odd name, right behaviour |
| 10 | Focus ring | **`primary/active`** | `#1E53BD` | `--zf-focus-ring` | a focus ring is not an "active" state, and it disagrees with the button and input. §4.4 |
| 11 | Border — disabled | `border/default` | `#DFE0EB` | keep ✓ | exempt when disabled |
| 12 | Hover halo | **unbound** — a raw `DROP_SHADOW` | `#3874EB` / `#C9474F` at 20% | see §4.5 | no shadow tokens exist yet |
| 13 | `checkbox_defined` label | **RAW, unbound** | `#202432` | `--zf-text-default` | `#222536`, ΔE 2.3 — just perceptible |
| 14 | `checkbox_defined` description | **RAW, unbound** | `#58627F` | `--zf-text-secondary` | `#565A70`, **ΔE 5.4 — a visible change** |

**Row 9 is not a defect to "fix" naively.** `primary/border` is `blue/800` in Light and `blue/1600` in
Dark — a *pale* tint on a light surface and a *dark* tint on a dark one, which is exactly the behaviour
a disabled fill needs. Substituting the primitive `--zf-blue-800` would render `#B1CAFC` in Dark: the
brightest thing on the panel, for the least active control. **Keep the binding.** The name is wrong,
not the value; the clean answer is a `primary/disabled` role pointing at the same two steps.

Contrast, against the thresholds that apply:

| | Ratio | Needs | |
|---|---|---|---|
| Resting border `#E4E4F0` | **1.26** | 3.0 (1.4.11) | ✗ |
| `border/default` `#DFE0EB` | **1.31** | 3.0 | ✗ |
| `neutral/1100` `#71758F` | **4.52** | 3.0 | ✓ first passing neutral |
| Checked fill `#3874EB` | 4.32 | 3.0 | ✓ |
| Error border `#C9474F` | 4.67 | 3.0 | ✓ |
| `danger/default` `#B2343C` | 6.09 | 3.0 | ✓ better |
| White glyph on the checked fill | 4.32 | 3.0 | ✓ |
| White glyph on the disabled fill `#B1CAFC` | 1.65 | — | exempt, effectively invisible |
| Label `#202432` · description `#58627F` | 15.44 · 6.05 | 4.5 (1.4.3) | ✓ both |

**The resting border is the only WCAG failure in the component.** Everything else passes or is exempt.

### 4.1 The resting border

`Neutral/350` is not a ZF variable — it comes from the same **external library** the radio's borders do
(`ZF-RADIO.md` §6), so it cannot respond to a theme, and at **1.26:1** the resting box is very nearly
invisible on a white form.

The canon already identifies both the problem and the target: §2.3.12 issue 1 says Neutral 600 gives
1.31:1 and "first passing step is Neutral 1100 (4.52:1)". Confirmed — `neutral/1100` `#71758F` at
**4.52:1**, and `neutral/1000` is 2.85 so it is genuinely the first. What the canon does not say is that
the binding is *remote*; that is the new finding.

No `border/*` role points at `neutral/1100`. This is the same wall the input field, the radio and
Secondary buttons hit — `ZF-INPUT-FIELD.md` §4.2: **no border role in the system reaches 3:1.** §9 uses
the primitive and marks it; when `border/control` exists this becomes one token change in four
components.

### 4.2 The unchecked fill is the dark-mode bug

All 6 unchecked variants bind their fill to the primitive **`color/base/white`**. A primitive has one
value, so in Dark mode every checkbox in the product renders as a **white block**. This is the canon's
**open item 38** and `ZF-COLORS.md` names it explicitly.

It matters more here than anywhere else because **32 of the 34 checkbox instances in the file are in the
`Table` page** — the select-row cells. A dark-mode table would show 32 white squares.

`surface/default` is `base/white` in Light and `neutral/2000` in Dark. Same Light value, so the swap is
a zero-pixel change today and the entire fix for Dark.

### 4.3 Hover uses two different roles for one gesture

Hovering a **checked** box goes to `primary/hover` (`blue/1300`). Hovering an **indeterminate** box goes
to `primary/text` (`blue/1400`). Same gesture, two roles, one of them a text role. Use `primary/hover`
for both.

### 4.4 The focus ring is a different colour in four components

| Component | Ring | Value | On the right role? |
|---|---|---|---|
| **checkbox** | `primary/active` | `blue/1500` `#1E53BD` | wrong role |
| radio | a remote paint style | `#1B4C91` | ✗ outside ZF |
| button | **`focus/ring`** | `blue/1200` `#3874EB` | ✓ |
| input field | **`focus/ring`** | `blue/1200` `#3874EB` | ✓ |

A focus ring means "this element has keyboard focus" — the same signal on every control, so it must be
the same colour, or the indicator visibly shifts hue as a keyboard user tabs across a form. **Use
`--zf-focus-ring`.** Note this trades contrast down, 6.94 → 4.32; both clear the 3:1 that applies, and
consistency of a focus indicator matters more than headroom on one control.

### 4.5 The hover halo does not theme

Measured: `DROP_SHADOW`, offset 0 / 0, blur **0**, spread **3**, alpha **0.2**, blend `NORMAL`, and
**no variable binding** — the colour is baked in. So the halo is the one paint in the component that
cannot follow a theme at all.

There is no shadow token layer in the system yet; the radio has the same halo with the same problem
(`ZF-RADIO.md` §11.1). `focus/halo` exists in `ZF Semantic` — `blue/600` Light, `blue/1600` Dark — and
is consumed by nothing. Either use it, or accept the hardcoded `rgb()` in §9 as a known gap. §9 marks
the two literals.

---

## 5. Anatomy

`checkbox_defined`, measured:

| | `with_description=no` | `with_description=yes` |
|---|---|---|
| Frame | 54 × 20 | 235 × 44 |
| Control → text gap | 8 | 8 |
| Control top offset | **4** | **4** |
| Label → description gap | — | **4** |

Label is 13/20 Regular `text/default`; description is 12/19.2 Regular `text/secondary`.

The canon states the 4px control offset exists "in the `with_description` variant only" (§2.3.7).
Measured, the nested instance sits at y = 4 in **both** variants. The offset is what optically centres
a 12px box against a 20px line box — `(20 − 12) / 2 = 4` — so it is correct in both, and in CSS it is
simply `align-items: flex-start` plus that 4px, or a line-height-derived margin.

The description's **12 / 19.2** line height is off the type scale, which is 12 / 16 for `body-sm`.
§9 uses 16.

---

## 6. Accessibility

| Requirement | Status | What to do |
|---|---|---|
| **1.4.11** non-text contrast | ✗ **fails** at 1.26:1 | `--zf-neutral-1100`, §4.1 |
| **2.5.8** target size | ✗ 12 × 12 is 25% of the minimum | wrap in a `<label>` with ≥24px height, §9 |
| 2.4.7 focus visible | ✓ | a ring exists for **every** state including error — better than the radio, which lacks focus + error entirely |
| Focus ring contrast | ✓ | 4.32:1 after moving to `focus/ring` |
| Glyph contrast | ✓ | 4.32:1 white on the checked fill |
| **1.4.1** use of colour | ⚠️ | error is a red border and nothing else — pair with a message via `aria-describedby` |
| Indeterminate announced | ⚠️ | a native `<input>` announces "mixed" **only** if `el.indeterminate = true` is set in JS |
| 2.1.1 keyboard | ✓ | Space toggles, free from the native input |

**Two things that are easy to get wrong and both matter:**

`indeterminate` **has no HTML attribute.** `<input type="checkbox" indeterminate>` does nothing. It
must be set as a DOM property in JS. This is the single most common implementation mistake with this
control, and §9 handles it with a ref effect.

**Never let a user set indeterminate directly.** It is a computed summary of child rows, so clicking a
mixed parent should resolve to checked or unchecked, never cycle back to mixed.

---

## 7. Usage

**Do**

- Use checkboxes when options are independent. If exactly one must be chosen, use a radio group.
- Use the label as the hit area — that is what satisfies 2.5.8.
- Reserve indeterminate for a parent whose children are partly selected.
- Write labels as positive statements. "Send me email" reads once; "Do not send me email" inverts
  twice when unticked.
- Group related checkboxes in a `<fieldset>` with a `<legend>`.

**Don't**

- Don't use a checkbox for something that takes effect immediately — that is a switch.
- Don't rely on the red border alone for an error.
- Don't make the 12px box the click target.
- Don't set `indeterminate` as an attribute.
- Don't reproduce Figma's two selection booleans in code — §2.1.

---

## 8. Selector strategy

Checkbox has more native state than any other control in the system, including `:indeterminate`,
which is a real CSS pseudo-class. Only the error needs a class.

| Figma | Selector |
|---|---|
| `State=default` | `.zf-checkbox` |
| `State=hover` | `:hover` |
| `State=focus` | `:focus-visible` — not `:focus`, so the ring is keyboard-only |
| `State=disabled` | `:disabled` |
| `is_active=yes` | `:checked` |
| `is_indeterminate=yes` | `:indeterminate` |
| `is_error=yes` | `.zf-checkbox--error` — no native equivalent |

---

## 9. Code

### 9.1 Markup — a hidden native input plus a styled box

Do **not** style the `<input>` itself. `::before` on an `<input>` is not reliably supported across
browsers (it is a replaced element), and the glyph needs a pseudo-element. The portable pattern is a
visually-hidden real input with a `<span>` sibling that carries the visuals.

The input stays in the accessibility tree and keeps every native behaviour — Space to toggle, form
participation, `:checked`, `:indeterminate`, `:disabled`. The `<span>` is `aria-hidden` because it is
decoration.

### 9.2 CSS

```css
/* the real control: present to AT and to CSS, invisible on screen.
   NOT display:none and NOT visibility:hidden — either would remove it from the tab order. */
.zf-checkbox-input {
  position: absolute;
  width: 1px; height: 1px;
  margin: 0; padding: 0;
  opacity: 0;
  pointer-events: none;
}

.zf-checkbox {
  width: 12px;
  height: 12px;
  box-sizing: border-box;                    /* §3.1 — a true 12px box in every state */
  border: 1px solid var(--zf-neutral-1100);  /* 4.52:1. NOT the #E4E4F0 Figma draws — §4.1 */
  border-radius: 2px;
  background: var(--zf-surface-default);     /* NOT base-white — §4.2, this is the dark-mode fix */
  flex: none;
  position: relative;
  transition: background-color 80ms ease-out, border-color 80ms ease-out;
}

.zf-checkbox-input:checked + .zf-checkbox,
.zf-checkbox-input:indeterminate + .zf-checkbox {
  background: var(--zf-primary-default);     /* blue/1200 — same value as Figma, on the role */
  border-color: var(--zf-primary-default);
}

.zf-checkbox-input:hover:not(:disabled) + .zf-checkbox {
  border-color: var(--zf-primary-default);
  box-shadow: 0 0 0 3px rgb(56 116 235 / .2);   /* measured: offset 0, blur 0, spread 3, a .2 */
}
.zf-checkbox-input:hover:not(:disabled):is(:checked, :indeterminate) + .zf-checkbox {
  background: var(--zf-primary-hover);       /* one role for both selections — Figma uses two, §4.3 */
  border-color: var(--zf-primary-hover);
  box-shadow: none;                          /* a selected box darkens instead of haloing */
}

/* same ring as the button and the input field — §4.4. outline-offset 2px on a
   radius-2 box gives an effective radius of 4, so the ring is concentric. */
.zf-checkbox-input:focus-visible + .zf-checkbox {
  outline: 2px solid var(--zf-focus-ring);
  outline-offset: 2px;
}

.zf-checkbox-input:disabled + .zf-checkbox {
  background: var(--zf-surface-disabled);
  border-color: var(--zf-border-default);
}
.zf-checkbox-input:disabled:is(:checked, :indeterminate) + .zf-checkbox {
  background: var(--zf-primary-border);      /* keep the role — §4 row 9. NOT --zf-blue-800 */
  border-color: var(--zf-primary-border);
}

/* ---- error ----
   MUST come after every block above. Each rule mirrors the state selector it has
   to beat, at equal specificity, so source order decides — see §9.4. Figma draws
   error for the unchecked box only; these four rules cover all 12 combinations. */
.zf-checkbox-input--error + .zf-checkbox,
.zf-checkbox-input--error:is(:checked, :indeterminate) + .zf-checkbox,
.zf-checkbox-input--error:hover:not(:disabled) + .zf-checkbox,
.zf-checkbox-input--error:hover:not(:disabled):is(:checked, :indeterminate) + .zf-checkbox {
  border-color: var(--zf-danger-default);
}
.zf-checkbox-input--error:hover:not(:disabled) + .zf-checkbox {
  box-shadow: 0 0 0 3px rgb(178 52 60 / .2);    /* danger/default at .2 */
}

/* ---- the field: this is the hit area, and it is what makes 2.5.8 pass — §3.4 */
.zf-checkbox-field {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--zf-space-4);                    /* 8px */
  min-height: 24px;
  cursor: pointer;
}
.zf-checkbox-field > .zf-checkbox { margin-top: 4px; }   /* (20 − 12) / 2 — §5 */
```

### 9.3 The two glyphs

Both are authored so the viewBox **is** the measured ink extent. That means no scaling happens and
the stroke lands at exactly the measured weight. Get this wrong and the glyph renders small with a
thin stroke.

```
check: measured ink 7.31847 × 5.46231, stroke 1.75 round. The path is inset by
       half the stroke (0.875) on every side so the stroke ends flush with the viewBox.
       viewBox "0 0 7.32 5.46"   d="M0.875 2.95 2.85 4.585 6.445 0.875"
       fill none, stroke-width 1.75, round cap and join

bar:   measured ink 7.89 × 2, radius clamped to a pill. A filled rect, not a stroke —
       2 is the HEIGHT, not the stroke weight.
       viewBox "0 0 7.89 2"   rect width 7.89 height 2 rx 1
```

Check the arithmetic if you change anything: the path's extents plus half the stroke must equal the
viewBox. `0.875 − 0.875 = 0` and `6.445 + 0.875 = 7.32`; `0.875 − 0.875 = 0` and `4.585 + 0.875 = 5.46`.

### 9.4 Why the error block has to be last

`.zf-checkbox-input:hover:not(:disabled):is(:checked, :indeterminate) + .zf-checkbox` is specificity
(0,5,0). A naive `.zf-checkbox--error` at (0,1,0) loses to it, so an errored checkbox would turn **blue**
on hover while still showing a red halo. The error rules therefore mirror each state selector exactly,
land at the same specificity, and win on source order. If you reorder the stylesheet, this breaks
silently — hover an errored checked box to test it.

### 9.5 React + TypeScript

```ts
export interface CheckboxProps {
  selection?: 'unchecked' | 'checked' | 'indeterminate';  // one enum, never two booleans — §2.1
  onSelectionChange?: (next: Selection) => void;
  label?: string;
  description?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
}
```

Four things the component does deliberately:

- **`<label>` wraps the control**, so the whole row is clickable and `min-height: 24px` satisfies
  2.5.8. Without this the component fails.
- **`aria-describedby` lists only ids that render.** Pointing at an absent element announces nothing,
  which is worse than omitting the attribute.
- **The description and the error message have separate ids.** Sharing one is invalid HTML, and
  `aria-describedby` would resolve to whichever came first — silently dropping the error.
- **The bare form returns just the box**, for the table case — 32 of the 34 instances.

Clicking a mixed parent resolves it to checked or unchecked; it never cycles back to mixed — §6.

### 9.6 A token-naming caveat before you build

This file uses `--zf-<role>` — `--zf-primary-default`, `--zf-surface-default`, `--zf-focus-ring`.
`ZF-INPUT-FIELD.md` and `ZF-BUTTON.md` use the same form, but **`ZF-COLORS.md` declares the generated
convention as `--zf-color-<role>`**, and canon §2.3.11 uses a third form again. The generator in
`@zf/design-tokens` is the authority. **Check what `tokens/semantic.css` actually emits and use that
prefix** — the role names are right either way, the prefix is not settled.

### 9.7 Verification checklist

| Check | Expected |
|---|---|
| Box renders 12 × 12, not 13 or 14 | `box-sizing: border-box` |
| Resting border | `--zf-neutral-1100`, **not** `#E4E4F0` |
| Unchecked fill | `--zf-surface-default`, **not** `base-white` |
| Focus ring colour | `--zf-focus-ring`, identical to the button's |
| Hover on checked and on indeterminate | the **same** colour |
| **Hover an errored checked box** | border stays **red**, not blue — §9.4 |
| Error border on a checked box | present — Figma has no such variant |
| Check glyph | 7.32 × 5.46 with a 1.75 stroke, not smaller |
| Indeterminate bar | 7.89 × **2** tall, not 1.2 |
| `indeterminate` | set via ref, not as an attribute |
| Label row height | ≥ 24px |
| Tab to it | ring appears; click it → ring does not |
| **Dark mode** | box fill, glyph and border all flip; nothing stays light |

The dark-mode row is the one that catches copied Figma values. Two bindings break it — the remote
`Neutral/350` border and the `base/white` fill — and both look perfectly correct in Light.

---

## 10. Defects in the Figma source

| # | Severity | Defect | Fix |
|---|---|---|---|
| 1 | **High** | Resting border is `Neutral/350` from a **remote library** at **1.26:1** — fails 1.4.11 and has no dark mode. The canon already names `neutral/1100` as the target; what it misses is that the binding is remote | Rebind to a ZF variable at `neutral/1100`; ideally create `border/control` |
| 2 | **High** | 12 × 12 is **25%** of the 2.5.8 minimum, and `checkbox_defined` is the only thing that fixes it | Mandate the composite; give it a ≥24px row |
| 3 | **High** | **9 of 24 valid variants missing** — error exists only for unchecked | Add error × {checked, indeterminate} × {default, hover, focus} |
| 4 | **High** | `checkbox_defined` has **no state axes** — its control is pinned to default/unchecked/no-error, so no consumer can show a real row without overriding by hand | Expose `State`, `Selection`, `Error` and wire them through |
| 5 | **High** | Two selection booleans allow `is_active` + `is_indeterminate` together — 8 unstyled combinations | One `Selection` axis |
| 6 | **High** | **The unchecked fill is bound to the primitive `color/base/white`** — every checkbox renders as a white block in dark mode, and 32 of the 34 instances are table select-row cells. Canon open item 38 | Bind `surface/default` — zero visual change in Light |
| 7 | Medium | Focus ring on **`primary/active`**; the button and input use `focus/ring`. Four components, three ring colours | Bind `focus/ring` everywhere |
| 8 | Medium | Hover uses `primary/hover` when checked and **`primary/text`** when indeterminate — a text role as a fill, and two answers to one gesture | `primary/hover` for both |
| 9 | Low | Disabled selected fill is **`primary/border`** — a border role as a fill. The *value* is right in both modes, so this is a naming problem, not a rendering one | Add `primary/disabled` at the same two steps. **Do not substitute the primitive** — §4 row 9 |
| 10 | Medium | `checkbox_defined`'s label and description are **raw unbound paints** (`#202432`, `#58627F`) | `text/default` (ΔE 2.3, just perceptible) and `text/secondary` (**ΔE 5.4, a visible change**) |
| 11 | Medium | Focus ring stroke **1.06667** = 16 ÷ 15 and radius **4.26667** = 32 ÷ 7.5 — sub-pixel, blurry | 2px, radius 4 |
| 12 | Medium | Hover halo on unchecked and error only; selected states darken instead. The halo is also **unbound**, so it cannot theme — `focus/halo` exists and is unconsumed | Pick one hover language; bind the halo or add shadow tokens |
| 13 | Low | Icon frame **9.19239** = 6.5 × √2 — an un-rotated 45° frame | Resize to whole pixels |
| 14 | Low | 10px padding, 10px gap and `layoutMode: VERTICAL` on all 15, all inert | Remove |
| 15 | Low | **Four paints bound to primitives** where a role exists — `blue/1200` ×9, `red/1200` ×3, `neutral/300` ×1, plus the glyph's `base/white` ×8 | `primary/default`, `danger/default`, `surface/disabled`, `icon/inverse` |
| 16 | Low | Description line height **19.2** is off the 12/16 scale | Restyle, or declare the exception |
| 17 | Low | Label is Inter **Regular**; the input field's label is Medium after that pass | Confirm which is intended |

**Mechanical, no decision:** 6, 8, 9, 10, 11, 13, 14, 15.
**Need a decision:** 1, 2, 3, 4, 5, 7, 12, 16, 17.
**The ones that matter:** 1 (the only WCAG failure), 2 (target size), **6** (dark mode, and it is the
cheapest fix on the list), 3 and 4 (missing states), 5 (the axis model).

### 10.1 What the canon gets wrong

| Canon §2.3 says | Measured |
|---|---|
| Resting border `#E4E4F0` is "legacy" | it is a **remote library binding** to `Neutral/350` — a live dependency on another file, not a stale hex. The canon's own `neutral/1100` target is correct and confirmed |
| Focus ring is Blue 1500 "exact" primitive | bound to the **role** `primary/active` — better than stated, but the wrong role |
| Indeterminate glyph radius "1px" | radius **90**, clamped to a pill on a 2px-tall bar |
| Control top padding 4px "in the `with_description` variant only" | y = 4 in **both** variants |
| Label text `#202433` "legacy", ΔE 1.6 | **raw and unbound**, and the value is `#202432`; ΔE to `text/default` is **2.3** |
| Description `#58627F` "legacy" | **raw and unbound**. The canon's ΔE 5.4 is right — so this is a *visible* change, not a free one |
| "Eight of twelve colour values are exact ERP primitives" | true, and beside the point — **27 of 42 paints are bound to primitives**, and three of the role bindings use the wrong role. A value check sees none of that |

The Figma documentation frame `13:4793` (1680 × 10,053, 12 sections) was not audited line by line. It
predates this measurement and should be assumed stale on the rows above.

---

## 11. Open decisions

| # | Question | Blocks |
|---|---|---|
| 1 | Create **`border/control`** at `neutral/1100`? Fixes the checkbox, radio, input field and Secondary buttons in one token | defect 1 |
| 2 | Standardise the focus ring on **`focus/ring`** across all controls? | defect 7 |
| 3 | Add the 6 missing error variants — checked and indeterminate × default/hover/focus? | defect 3 |
| 4 | Rebuild `checkbox_defined` with real state axes, as `zf-field` was rebuilt for the input? | defect 4 |
| 5 | Collapse the two selection booleans into one `Selection` axis? Breaking, so schedule it | defect 5 |
| 6 | Bind the hover halo, or add a shadow token layer? Nothing in the system has one yet | defect 12 |
| 7 | Label weight — Regular here, Medium on the input field. Pick one | defect 17 |

Decisions 1 and 2 are shared with three other components and should be taken once, for all of them.
**Defect 6 — the `base/white` fill — needs no decision at all and is the cheapest real fix here.**

---

**Provenance.** Measured in `Tin Tin` (`zZtArxOeRCjd7pKE25HQVS`), page `Check box` (`13:4728`), on
2026-08-21 via the Figma Plugin API. Enumerated: 2 component sets, 17 variants, and for every variant
and descendant the geometry, position, rotation, fills, strokes, stroke weight and alignment, corner
radius, layout positioning, effects, text content, size, line height, weight, text style, component
property references and visibility. Every colour binding resolved by variable ID — which is how the
remote `Neutral/350` and the four role misuses were identified; a hex comparison would have shown all
of them as correct. Contrast is WCAG 2.1 relative luminance: control boundaries and graphics against
1.4.11 (3:1), text against 1.4.3 (4.5:1), target size against 2.5.8 (24 × 24). Instance counts from a
full walk of all 28 pages.

**Companion files:** `ZF-DESIGN-CANNON.md` §2.3, `ZF-INPUT-FIELD.md` (the `zf-field` pattern this
component's composite should follow), `ZF-RADIO.md` (same remote-border problem), `ZF-BUTTON.md`
(the focus-ring role), `ZF-COLORS.md`, `ZF-TYPE-SPACE.md`, `ZF-SCALES.md`.
