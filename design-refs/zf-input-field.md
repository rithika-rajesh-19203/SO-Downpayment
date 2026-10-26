# ZF Design Cannon — Input Field

**Figma:** `Tin Tin` — page `Input Field ` (`13:7313`)
**Components:** `zf-field` (`112:14067`) · `Input Field/States` (`13:7334`)
**Measured and repaired 2026-08-20.**

> **What changed.** The set was the input *box* only — 9 variants, no label, no message, no filled
> state, and three component properties that silently did nothing on every error variant. It is now
> 18 variants with everything wired, and a new **`zf-field`** wraps it with the label, the required
> marker and the help/error message so the plain case is one drag.

---

## 1. Two components, and which one to use

| | `zf-field` — **use this** | `Input Field/States` |
|---|---|---|
| Node | `112:14067` | `13:7334` |
| What it is | the whole field | the input box only |
| Contains | label · required marker · input · help/error message | box, optional icons, text |
| Variants | **9** — `State` (5) × `Is Error` (2), minus Disabled+error | **18** — `States` (5) × `is_error` (2) × `Content` (2), minus Disabled+error |
| Height | **58px** on the 5 non-error variants, **78px** on the 4 error variants | 34px |
| Width | 280 | 280 |

**Reach for `zf-field` by default.** `Input Field/States` remains public because a few places need a
bare box — a table's inline edit cell, a search field in a toolbar — but anything on a form wants the
wrapper, because that is what makes the label travel with the input instead of being a sibling someone
has to remember to add.

### 1.1 The original question — is "with icon / without icon" enough?

No, and the icons were never the gap. Icon on/off was already modelled correctly, as two **booleans**
rather than variants — which is right, because they are independent of each other and of state, and as
variants they would have multiplied 18 into 72.

What was missing was everything around the box. `Label` and `Help Text` existed on the page as **two
loose instances of a remote library** — not in the set, not composed with it. So "just a label and an
input" was not something anyone could take from the library; it was an assembly job, done from memory,
with the gap guessed each time. That is what `zf-field` fixes.

---

## 2. `zf-field`

```
┌ label-row ──────────────────────────┐   gap space/1 (2px)
│ Label *                             │   label zf/body/medium · asterisk danger/default
└─────────────────────────────────────┘
                                          gap space/2 (4px)
┌ input ──────────────────────────────┐   nested Input Field/States instance, FILL width
│ ⌕  Placeholder                   ⌄  │   34px
└─────────────────────────────────────┘
                                          gap space/2 (4px)
  Help text  or  Error message            zf/body-sm/regular
```

| Property | Type | Default | Notes |
|---|---|---|---|
| `Label` | TEXT | `Label` | |
| `Required` | BOOLEAN | **`false`** | shows a `danger/default` asterisk |
| `Message` | TEXT | `Help text` | drives the help message **and** the error message |
| `Show Message` | BOOLEAN | **`false`** | non-error variants only — see §2.1 |
| `State` | VARIANT | `Default` | `Default` · `Hover` · `On-Click` · `Focus` · `Disabled` |
| `Is Error` | VARIANT | `no` | forwarded to the nested input |

Each variant sets the nested instance's `States` and `is_error` to match, verified on all 9.

**Two things live on the nested input, not on `zf-field`:** the icon booleans, and `Content`. All 9
variants pin the nested instance to `Content=placeholder`, so showing a filled field means selecting
the input inside the instance and switching `Content` to `value` there. That is one extra click, and
the alternative — forwarding `Content` as a third `zf-field` axis — would take the wrapper from 9
variants to 18 to save it. Worth revisiting if filled fields turn out to be the common case in mockups;
§8 item 7.

### 2.1 An error state cannot hide its message

On the five non-error variants the message node is `help-message`, visibility driven by
`Show Message`, default off. On the four error variants it is `error-message`, **the `visible`
reference is deliberately absent, and the node is permanently on.**

That is not an oversight. A red border with no explanation fails **WCAG 3.3.1 Error Identification** —
the error has to be described in text. Figma cannot express "this boolean defaults to true only on
these variants", because a non-variant property is set-wide; booleans have no per-variant default.
Removing the reference is the only way to make the message non-optional exactly where it must be.

The consequence to know: `Show Message` has no effect on an error variant. The text still comes from
`Message`.

### 2.2 Label styling is deliberately not the value styling

| | Style | Colour |
|---|---|---|
| Label | `zf/body/medium` — 13 / 20 **Medium** | `text/default`, or `text/disabled` when `State=Disabled` |
| Value | `zf/body/regular` — 13 / 20 Regular | `text/default` |
| Placeholder | `zf/body/regular` | `text/tertiary` |
| Message | `zf/body-sm/regular` — 12 / 16 | `text/secondary`, or `danger/text` on error |

The label is the same size as the value and one weight heavier. Same size keeps the vertical rhythm;
the weight is what stops a label reading as content. The loose `Label` instance this replaces was 13
Regular — identical to value text, which is precisely the confusion worth removing.

---

## 3. `Input Field/States` — what changed

| | Before | After |
|---|---|---|
| Variants | 9 | **18** — `Content` axis added |
| `Icon Left` / `Icon Right` default | **`true`** | **`false`** |
| Property refs on the 4 error variants | **all 3 absent** — properties did nothing | wired, 18 / 18 |
| Icon slots | pasted vectors, **16 × 12.43** | **instances** of `icon / search` and `icon / chevron`, 16 × 16 |
| Radius 6 | raw number | bound `radius/md` |
| Padding 10, gap 10 | raw numbers | bound `space/5` |
| Placeholder type | hard-coded 13 Regular | `zf/body/regular` |
| Text node name | `Placeholder` | `input-text` on all 18 |
| Icon slot names | `Frame 830` / `Frame 831` | `icon-left` / `icon-right` |

### 3.1 The dead properties

On `is_error=yes` — all four variants — `Icon Left`, `Icon Right` and `Placeholder` had **no
`componentPropertyReferences` at all**. The panel showed the controls; nothing happened. Silent, and
the same defect the status badge's two `Accepted` variants have (`ZF-STATUS-BADGE.md` defect 5).

**It happened again during this repair.** Cloning the 9 variants to build the `Content=value` half
produced 9 new variants with every reference stripped — `clone()` does not carry
`componentPropertyReferences`. My own post-fix audit caught it and it is fixed, but it is worth
recording as a rule: **after cloning a variant, re-apply its property references and verify, every
time.**

### 3.2 The `Content` axis

`Content = placeholder | value` is the filled state the set never had. Placeholder text is
`text/tertiary`; value text is `text/default`. Without it, a designer showing a form with data had to
override the text colour by hand on every field — which §3 of the canon forbids, and which no export
would ever reproduce.

`Disabled` keeps `text/disabled` in both halves.

### 3.3 Icons now come from the icon library

Both slots were hard-coded copies of one glyph at **16 × 12.43** — not square, not a 16 × 16 slot,
not an instance of anything, while 51 icons sat one page over. They are now instances:
`icon / search` on the left, `icon / chevron` on the right, both 16 × 16, both inheriting
`icon/default` and therefore both theme-aware.

Swap either for any other icon the normal way. Because they are instances, that is now possible at
all.

---

## 4. Colour — every paint now binds to a role

**This was wrong when I first wrote it up.** I rebound the text to `ZF Semantic` roles and left the
fills, strokes and focus rings bound to **primitives** — `color/neutral/700`, `color/blue/1200`,
`color/red/1200`, `color/base/white`, `color/neutral/200`. 40 of 58 paints. The audit table said
"54 / 54 bound" and it was true and useless, because *bound to a primitive* is the defect §3 of the
canon names: **bind to the role, not to the nearest step.** Same mistake I documented on the badge and
the radio, made while fixing this one.

Now corrected. All 58 paints bind to `ZF Semantic`, zero primitives:

| Element | Role | Light | Ratio | | |
|---|---|---|---|---|---|
| Value text | `text/default` | `#222536` | **15.15** | ✓ | needs 4.5 |
| Label | `text/default` | `#222536` | **15.15** | ✓ | |
| Error message | `danger/text` | `#A62932` | **7.04** | ✓ | |
| Help message | `text/secondary` | `#565A70` | **6.79** | ✓ | |
| Required asterisk | `danger/default` | `#B2343C` | **6.09** | ✓ | |
| Placeholder | `text/tertiary` | `#71758F` | **4.52** | ✓ | 0.02 above the line |
| Border — error, and the error focus ring | `danger/default` | `#B2343C` | **6.09** | ✓ | needs 3.0 |
| Border — hover / on-click | `primary/default` | `#3874EB` | **4.32** | ✓ | |
| Focus ring | `focus/ring` | `#3874EB` | **4.32** | ✓ | |
| **Border — resting, focus, disabled** | `border/strong` | `#C3C5D4` | **1.71** | ✗ | **fails 3.0** |
| Field fill | `surface/default` | `#FFFFFF` | — | ✓ | `neutral/2000` in Dark |
| Fill — disabled | `surface/disabled` | `#F0F1FA` | — | ✓ | |
| Label and placeholder, disabled | `text/disabled` | `#AEB1C2` | 2.13 | ✓ | exempt: 1.4.3 excludes inactive controls |

### 4.1 Three values moved, and why

Binding to roles meant accepting the role's value. Three changed:

| | Was — primitive | Now — role | Effect |
|---|---|---|---|
| Resting border | `neutral/700` `#CED0DE` 1.53 | `border/strong` `#C3C5D4` **1.71** | one step darker, slightly better |
| Error border | `red/1200` `#C9474F` 4.67 | `danger/default` `#B2343C` **6.09** | measurably better |
| Disabled fill | `neutral/200` `#F7F8FC` | `surface/disabled` `#F0F1FA` | one step darker |

Everything else was already sitting on the role's exact value, so `surface/default`,
`primary/default` and `focus/ring` are **zero-pixel changes**.

### 4.2 No border role in the system reaches 3:1

This is the finding that outgrew the component. Walking the whole `border/*` ramp against white:

| Role | Light | Ratio | |
|---|---|---|---|
| `border/divider` · `border/disabled` | `neutral/500` `#E9EAF5` | 1.20 | ✗ |
| `border/default` | `neutral/600` `#DFE0EB` | 1.31 | ✗ |
| **`border/strong`** — the darkest, and what the input now uses | `neutral/800` `#C3C5D4` | **1.71** | ✗ |
| `border/hover` | `neutral/1000` `#9598AB` | 2.85 | ✗ |

**Not one of the five clears 3:1.** So this is not the input field choosing a bad border — there is no
correct choice available. The first ZF neutral that passes is `color/neutral/1100` `#71758F` at
**4.52:1**, and no border role points at it or anything darker.

That makes it a foundations problem, and it explains the radio too: `ZF-RADIO.md` records its resting
border failing at **1.26:1**. Note the fixes are *not* the same edit, though — the radio's border is
bound to a **remote paint style** outside ZF entirely, so it has to be rebound to a variable before any
role change can reach it. What the two share is the target value, not the operation.

The proposal: add **`border/control`** at `neutral/1100` Light / `neutral/1000` Dark, for the boundary
of an interactive control as distinct from a divider. Then this component and the radio both point at
one variable, and 1.4.11 is a single edit for the whole system. I have not created it — that changes
the look of every input, select, checkbox and radio in the product, so it is yours to call.

Because the input's border is now on a **role**, making that change later is one variable edit rather
than 18 node edits.

### 4.3 `text/placeholder` cannot hold placeholder text

The role resolves to `neutral/1000` `#9598AB` = **2.85:1**, below the 4.5:1 that 1.4.3 asks of text. So
the placeholder is deliberately bound to `text/tertiary` (`neutral/1100`, 4.52:1) instead.

Whether placeholder text is exempt from 1.4.3 as "incidental" is genuinely contested — placeholders are
visible content the user reads, which is the argument against exemption. Rather than rely on the
argument, the component uses a value that passes either way. But a role named `text/placeholder` that
cannot be used for placeholder text is a trap: retune it to `neutral/1100` or retire it.

---

## 5. Still redundant, and left alone on purpose

**`Hover` and `On-Click` render identically.** On the non-error half both take `primary/default`
`#3874EB` with no ring; on the error half both take `danger/default`, like every other error state. So
within each half the two options are indistinguishable, and `States` offers 5 options that produce
**4 appearances**: resting, hover ≡ on-click, focus (resting border **plus** a ring), and disabled.
`zf-field` inherits that.

I did not collapse them. Removing a variant option breaks every instance using it, and choosing
whether "On-Click" means *pressed* (a distinct appearance worth designing) or is just a synonym for
focus is a naming decision for you. Two ways forward:

- **Give `On-Click` its own look** — usually a slightly heavier border or a pressed fill — so the
  option earns its place.
- **Delete it** and let `:active` fall back to hover in CSS, which is what browsers do anyway.

Also unchanged: **`Disabled + error` does not exist** in either component, and that is defensible — a
control the user cannot edit cannot be corrected, so surfacing a validation error on it is arguably
wrong. Worth stating explicitly rather than leaving as an accident of the matrix.

---

## 6. Code

```html
<div class="zf-field">
  <label class="zf-field__label" for="invoice">
    Invoice number <span class="zf-field__required" aria-hidden="true">*</span>
  </label>
  <input id="invoice" class="zf-input" aria-required="true"
         aria-invalid="true" aria-describedby="invoice-msg" />
  <p id="invoice-msg" class="zf-field__message zf-field__message--error">
    That number is already used
  </p>
</div>
```

```css
.zf-field { display: flex; flex-direction: column; gap: var(--zf-space-2); }

.zf-field__label {
  font: var(--zf-font-medium) var(--zf-text-body-size)/var(--zf-text-body-line) var(--zf-font-family);
  color: var(--zf-text-default);
}
.zf-field__required { color: var(--zf-danger-default); }

.zf-input {
  height: 34px;
  padding: var(--zf-space-5);
  border: 1px solid var(--zf-neutral-1100);   /* 4.52:1. No border/* role reaches 3:1 — §4.2 */
  border-radius: var(--zf-radius-md);
  background: var(--zf-surface-default);
  color: var(--zf-text-default);              /* the value */
  font: var(--zf-text-body-size)/var(--zf-text-body-line) var(--zf-font-family);
  box-sizing: border-box;
}
.zf-input::placeholder    { color: var(--zf-text-tertiary); }  /* not text-placeholder, §4.1 */
.zf-input:hover           { border-color: var(--zf-primary-default); }
.zf-input:focus-visible   { outline: 2px solid var(--zf-focus-ring); outline-offset: 2px; }
.zf-input:disabled        { background: var(--zf-surface-disabled); color: var(--zf-text-disabled); }
.zf-input[aria-invalid="true"] { border-color: var(--zf-danger-default); }

.zf-field__message           { font-size: var(--zf-text-body-sm-size);
                               line-height: var(--zf-text-body-sm-line);
                               color: var(--zf-text-secondary); }
.zf-field__message--error    { color: var(--zf-danger-text); }
```

Three places the CSS deliberately departs from Figma, each routing around an open item rather than
copying it:

| Line | Figma has | Why |
|---|---|---|
| `border-color: neutral-1100` | `border/strong` `#C3C5D4`, 1.71:1 | the darkest border role still fails 1.4.11 (§4.2). This is the one line that intentionally does not match, and it goes away if `border/control` is created |
| `:focus-visible` as `outline` | a child rectangle at (−2, −2) | an outline needs no node, never affects layout, and follows the box at any size |
| no `border-color` on focus | Figma's focus variant keeps the resting border and adds the ring | the CSS does the same by leaving `border-color` alone; stated because it looks like an omission |

Everything else maps 1:1 onto a role, because §4 rebound every paint. `--zf-focus-ring`,
`--zf-danger-default`, `--zf-surface-disabled`, `--zf-text-tertiary` and `--zf-text-disabled` are the
same tokens the component uses.

`aria-describedby` is what makes the error message reach a screen reader, and `aria-invalid` is what
makes the red border mean something. Neither can live in Figma — which is the argument for `zf-field`
existing: the component's shape is what reminds a developer that a message and a label belong to the
input, not beside it.

---

## 7. Post-fix audit

| Check | Result |
|---|---|
| `Input Field/States` variants | **18** |
| Property references wired | **18 / 18** — all three properties on every variant |
| Paints bound | **58 / 58** — 18 fills, 18 box strokes, 18 text fills, 4 focus-ring strokes — and **all 58 to `ZF Semantic` roles, 0 primitives** ✓ |
| Radius bound `radius/md` | 18 / 18 ✓ |
| Padding + gap bound `space/5` | 18 / 18 ✓ |
| Text style applied | 18 / 18 ✓ |
| Icon slots that are real instances | **36 / 36** ✓ |
| Icon slots at 16 × 16 | **36 / 36** ✓ |
| Distinct radius / padding / height values | 6 / 10 / 34 — one each ✓ |
| Rendered fill+border combinations | 4 — resting, disabled, hover ≡ on-click, error ✓ |
| `zf-field` variants | **9** |
| Nested instance state matches its variant | **9 / 9** ✓ |
| Label and message text styles | 9 / 9 ✓ |
| `zf-field` heights | 58 without a message, 78 with ✓ |
| Nodes overlapping on the page | **0** ✓ |
| Instances of either component | 14, all on this page |

Page layout: `zf-field` at y = 0, `Input Field/States` at y = 258, the superseded loose `Label`
(y = 674) and `Help Text` (y = 675) reference instances, `Frame 832` at y = 714 — an unnamed 3-vector
scratch frame, left alone pending §8 item 5 — and the documentation frame at y = 872.

---

## 8. What still needs a decision

| # | Question | Blocks |
|---|---|---|
| 1 | **Create `border/control` at `neutral/1100`** (4.52:1)? No `border/*` role reaches 3:1 today — the darkest is 1.71. This is a foundations fix, not an input fix, and it also unblocks the radio | §4.2 |
| 2 | `On-Click` — give it a distinct appearance, or delete the option? It renders identically to `Hover` | §5 |
| 3 | Retune `text/placeholder` to `neutral/1100`, or retire it? At `neutral/1000` it is 2.85:1, so nothing can safely use it for its own name | §4.3 |
| 4 | Confirm `Disabled + error` is deliberately excluded | §5 |
| 5 | Delete the superseded loose `Label` (y = 674) and `Help Text` (y = 675) instances now that `zf-field` owns both? They are instances of a remote library | §7 |
| 6 | Regenerate the documentation frame `13:7397`? It predates all of this — 9,215px describing the 9-variant box | — |
| 7 | Forward `Content` as a third `zf-field` axis (9 → 18 variants) so a filled field needs no nested selection? | §2 |

---

**Provenance.** Measured and repaired in `Tin Tin` (`zZtArxOeRCjd7pKE25HQVS`), page `Input Field `
(`13:7313`), on 2026-08-20 via the Figma Plugin API. Pre-fix pass enumerated both component sets in
full — every variant, child, geometry, paint, binding, text and property-reference field. Repairs
applied in seven stages, each verified before the next. Post-fix pass in §7 re-measured every check
independently. Contrast is WCAG 2.1 relative luminance, text against 1.4.3 (4.5:1) and borders
against 1.4.11 (3:1). Every paint's binding was resolved by variable ID; §4 records the correction
after that resolution showed 40 of 58 pointing at primitives rather than roles.

**Corrections to the first draft of this file.** It claimed 54 / 54 paints bound without saying 40 were
bound to primitives; it asserted role names for three colours (`#CED0DE`, `#C9474F`, `#F7F8FC`) that no
`ZF Semantic` role carries; it said the resting-border fix was "the same decision" as the radio's when
the radio needs a style-to-variable rebind first; it used `--zf-border-default` in the focus rule, which
is *lighter* than the border it was correcting; it cited canon §2.4 instead of §2.5; and it claimed a
`Value` text node existed before a filled state did. All corrected above.

**Companion files:** `ZF-DESIGN-CANNON.md` §2.5, `ZF-ICONS.md`, `ZF-RADIO.md`,
`ZF-STATUS-BADGE.md`, `ZF-COLORS.md`, `ZF-TYPE-SPACE.md`, `ZF-SCALES.md`.
