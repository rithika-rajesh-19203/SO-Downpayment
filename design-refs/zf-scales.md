# ZF scales — the list

Figma file `Tin Tin`. Contract §1.4 · §1.5 · §1.6.

This is the **dimension** contract, the counterpart to `zf-colours.md`. It is read
from Figma, never invented.

Where it disagrees with `zf-design-cannon.md` §1.4, **this file wins** — see
§Divergences at the end.

---

## Font sizes

9 sizes. **The line-height is part of the size, not a separate choice.**

| Name | Size | Line-height | Ratio | Tracking |
|---|---|---|---|---|
| `display` | 40 | 48 | 1.20 | — |
| `title-lg` | 24 | 32 | 1.33 | — |
| `title` | 20 | 28 | 1.40 | — |
| `heading` | 18 | 24 | 1.33 | — |
| `subheading` | 16 | 24 | 1.50 | — |
| `body` | 13 | 20 | 1.54 | — |
| `body-sm` | 12 | 16 | 1.33 | — |
| `label` | 11 | 16 | 1.45 | +2% |
| `caption` | 10 | 12 | 1.20 | +2% |

Plus one case variant, which is not a weight:

| Name | Size | Line-height | Weight | Tracking | Case |
|---|---|---|---|---|---|
| `overline` | 11 | 17.6 | Semi Bold | +0.6px | UPPER |

---

## Font weights

4 weights. **Every size exists in every weight** — 9 × 4 = 36 styles.

| Name | Value | Inter style |
|---|---|---|
| `regular` | 400 | Regular |
| `medium` | 500 | Medium |
| `semibold` | 600 | Semi Bold |
| `bold` | 700 | Bold |

**Figma:** `zf/{size}/{weight}` — `zf/body/medium`, `zf/heading/bold`.
**CSS:** two classes, composed — `class="zf-text-body zf-font-medium"`.
**React:** `text('body', 'medium')`.

---

## Spacing

12 steps on a **2px base**. Named by step: the value is `step × 2`.

| Token | Value |
|---|---|
| `space-0` | 0 |
| `space-1` | 2 |
| `space-2` | 4 |
| `space-3` | 6 |
| `space-4` | 8 |
| `space-5` | 10 |
| `space-6` | 12 |
| `space-8` | 16 |
| `space-10` | 20 |
| `space-12` | 24 |
| `space-16` | 32 |
| `space-20` | 40 |

**CSS:** `var(--zf-space-4)` · **React:** `space['4']`

---

## Radius

7 steps.

| Token | Value |
|---|---|
| `radius-xs` | 2 |
| `radius-sm` | 4 |
| `radius-md` | 6 |
| `radius-lg` | 8 |
| `radius-xl` | 12 |
| `radius-2xl` | 16 |
| `radius-full` | 999 |

`radius-md` is the default. Use `radius-full` for circles and capsules — never `size ÷ 2`, which
stops being a circle the moment the element resizes.

**CSS:** `var(--zf-radius-md)` · **React:** `radius.md`

---

## Retired

**Sizes:** 9, 11.25, 14, 15, 19, 32
**Line-heights:** 20.8, 21, 22.4, 28.8, 17.6 *(except `overline`)*, and every `AUTO`
**Spacing:** 1, 3, 5, 7, 11, 14, 15, 30
**Radius:** 1, 1.6, 3, 7, 9, 10, 11, 11.75, 14, 18
**Weight spelling:** `Semibold` — use `Semi Bold`

---

## Divergences from `zf-design-cannon.md` §1.4

Recorded because the two documents disagree and someone will hit it. Four items.

| # | `zf-design-cannon.md` §1.4 | This file | Resolution |
|---|---|---|---|
| 1 | **13 fused styles.** Size and weight are one axis: `body`, `body-strong`, `body-emphasis` are three styles at 13/20. | **9 sizes × 4 weights, composed.** "Every size exists in every weight." | **This file.** The cannon's own §2.7.2 · §2.8.2 · §2.9.5 · §2.10.1 · §2.11.2 name one-axis-carrying-two-dimensions as the most frequent modelling error in the source. `body-strong` is that error. |
| 2 | **3 weights** — Regular, Medium, Semi Bold. | **4 weights** — adds `bold` 700. | **This file.** Bold is a real weight, not the `Semibold`/`Semi Bold` spelling slip of §1.4.5. |
| 3 | `label` = 12/16 Medium · `label-sm` = 11/16 Medium +2%. | `label` = 11/16 +2%. No 12/16 named style. | **This file.** Under item 1 the cannon's `label` is `body-sm` at `medium`, so the name is free; the cannon's `label-sm` becomes `label`. This also repairs §1.4.2, whose prose contrasts "`label` and `label-sm`" while quoting the values of `label-sm` and `overline`. |
| 4 | `caption` 10/12 — **no tracking**. | `caption` 10/12 — **+2%**. | **This file**, being newer and the dimension contract. Small type takes tracking; `label` at 11 already does. Worth a glance from design, since it is the one value where this file adds rather than reorganises. |
