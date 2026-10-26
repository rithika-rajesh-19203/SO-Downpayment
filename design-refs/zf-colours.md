# ZF Colours

Every colour variable in the system: **200 primitives, 109 semantic roles in two modes, 5 brand
tokens in two hues** — 424 values in all. Generated from the Figma file `Tin Tin`; the contract is
§1.1–§1.3 of `zf-design-cannon.md`.

> Transcribed into the repo on 2026-08-20. `scripts/gen-tokens.mjs` parses the tables below and
> emits `src/canon/tokens/{primitives,semantic,brand}.css`, then verifies every alias resolves to
> the stated hex. Do not hand-edit the generated CSS — edit this file and re-run
> `npm run tokens:sync`.

| | |
|---|---|
| Primitives | 200 — 9 hue families × 22 steps, plus `base/white` and `base/black` |
| Semantic roles | 109, each with a Light and a Dark value |
| Brand tokens | 5, each with a Blue and a Red value |
| Aliased | 108 of 109 roles point at a primitive; only `overlay/scrim` carries a raw value |
| Verified | 424 values round-trip from CSS back to Figma; 0 mismatches |
| **Unconsumed** | **27 roles have no component bound to them** — §6 |
| **Collisions** | 3 pairs share a value where they must not — §7 |

---

## 1. The three layers

```
primitives   --zf-blue-1200: #3874EB;                         a value, no meaning
     ↓
semantic     --zf-color-primary-default: var(--zf-blue-1200);  a meaning, two modes
     ↓
component    background: var(--zf-color-primary-default);      a use
```

**Only ever consume the middle layer.** A primitive is identical in Light and Dark, so anything
bound to one cannot theme.

### Naming

| Layer | Figma | CSS | TypeScript |
|---|---|---|---|
| Primitive | `color/blue/1200` | `--zf-blue-1200` | — |
| Semantic | `surface/default` | `--zf-color-surface-default` | `color['surface/default']` |
| Brand | `brand/solid` | `--zf-color-brand-solid` | `color['brand/solid']` |

### Theme and brand are attributes, not a provider

| | Selector | Default |
|---|---|---|
| Light | `:root`, `[data-theme="light"]` | ✔ |
| Dark | `[data-theme="dark"]`, or the OS via `prefers-color-scheme` | |
| Blue | `:root`, `[data-brand="blue"]` | ✔ |
| Red | `[data-brand="red"]` | |

Independent, and on any element — so a dark panel inside a light page is `<div data-theme="dark">`
and nothing else.

---

## 2. Primitives

9 hue families × 22 steps. **The step is a lightness index, not a weight**: 100 is the lightest,
2200 the darkest, and the same step in two families is the same lightness.

| Step | Neutral | Blue | Sky | Cyan | Green | Yellow | Orange | Red | Purple |
|---|---|---|---|---|---|---|---|---|---|
| **100** | `#FAFAFC` | `#FAFBFC` | `#F7FBFC` | `#F5FCFC` | `#F7FCFA` | `#FCF9F2` | `#FCFAF7` | `#FCFAFA` | `#FBFAFC` |
| **200** | `#F7F8FC` | `#F5F7FC` | `#F2F9FC` | `#EDFCFC` | `#F0FCF7` | `#FCF6E8` | `#FCF6F0` | `#FCF5F5` | `#F9F7FC` |
| **300** | `#F5F6FC` | `#F0F5FC` | `#EBF7FC` | `#DEFCFC` | `#E3FCF2` | `#FCF3E1` | `#FCF2E8` | `#FCF0F1` | `#F6F2FC` |
| **400** | `#F0F1FA` | `#EBF2FC` | `#E6F3FA` | `#DCFAFA` | `#E1FAF0` | `#FAEED7` | `#FAEEE3` | `#FAEDEE` | `#F4F0FA` |
| **500** | `#E9EAF5` | `#E1EBFC` | `#DBEFF9` | `#C3FAFA` | `#D7F5E9` | `#FAE9C8` | `#FAE6D5` | `#FDE1E6` | `#EEE6FA` |
| **600** | `#DFE0EB` | `#D8E4FB` | `#CCEBFB` | `#AFF6F6` | `#B6F6DC` | `#FCE1AB` | `#FCDCC0` | `#FAD7D9` | `#E7D8FD` |
| **700** | `#CED0DE` | `#C0D5FD` | `#AFDEF6` | `#9CEAEA` | `#A3EBCE` | `#FCCE72` | `#FBC99E` | `#FFBFC3` | `#D9C8F1` |
| **800** | `#C3C5D4` | `#B1CAFC` | `#95D7F9` | `#7EE6E6` | `#7EEDC1` | `#FFC34A` | `#FFB87B` | `#FAB1B6` | `#D1B8F7` |
| **900** | `#AEB1C2` | `#94B3F2` | `#70C5EF` | `#50DBDB` | `#61DCAB` | `#F1AB1F` | `#F29F56` | `#F59399` | `#C19DF8` |
| **1000** | `#9598AB` | `#769BE7` | `#59ABD4` | `#36C2C2` | `#41C590` | `#D59109` | `#D8863F` | `#E07980` | `#A984E2` |
| **1100** | `#71758F` | `#4F7EDB` | `#3290BF` | `#11A6A6` | `#23A671` | `#AD7503` | `#C46614` | `#D1525A` | `#8D5BD9` |
| **1200** | `#6A6E85` | `#3874EB` | `#188FBA` | `#0E9999` | `#259669` | `#9C6C0C` | `#B25F17` | `#C9474F` | `#8256C4` |
| **1300** | `#565A70` | `#2762D9` | `#0D789E` | `#068080` | `#068754` | `#855800` | `#9E4B03` | `#B2343C` | `#713DBF` |
| **1400** | `#51556B` | `#1C5BD9` | `#067299` | `#087878` | `#127A51` | `#7A5304` | `#964600` | `#B22D36` | `#6C39B8` |
| **1500** | `#4A4D63` | `#1E53BD` | `#13628A` | `#186666` | `#116F49` | `#704C04` | `#80420D` | `#A62932` | `#5D3B94` |
| **1600** | `#3A3E53` | `#1A4291` | `#0B5073` | `#0F5454` | `#095C3B` | `#593D04` | `#6B3403` | `#822127` | `#4F2A87` |
| **1700** | `#2D3145` | `#1C3466` | `#0D3E57` | `#173D3D` | `#0F452F` | `#42300D` | `#4F2B0B` | `#6E181E` | `#3F216B` |
| **1800** | `#282B3D` | `#182E59` | `#0A374D` | `#113838` | `#0E3B29` | `#3B2A0A` | `#452509` | `#5C161B` | `#381C63` |
| **1900** | `#222536` | `#15274D` | `#122D3B` | `#132E2E` | `#143025` | `#30250E` | `#38210C` | `#4D1518` | `#2B1F3D` |
| **2000** | `#1D202E` | `#182236` | `#13252E` | `#102929` | `#11291F` | `#29200D` | `#2E1D0F` | `#33191B` | `#251B36` |
| **2100** | `#191C29` | `#161E2E` | `#132026` | `#0E2424` | `#10241C` | `#241D0F` | `#261A10` | `#2B1618` | `#20192B` |
| **2200** | `#13151F` | `#13161C` | `#11171A` | `#0D1A1A` | `#0D1A15` | `#1A150C` | `#1A1511` | `#1C1314` | `#181321` |

| | |
|---|---|
| `base/white` | `#FFFFFF` |
| `base/black` | `#000000` |

**There is no pure-grey family.** Every neutral carries a blue cast, which is why a sampled
`#757575` (top bar) or `#222222` (list table) reads as foreign and sits 13.88 and 12.18 ΔE from the
nearest step. Open item 12.

---

## 3. Semantic roles

109 roles in 17 groups. **Alias** is the primitive each mode points at; **Used by** counts the
bindings across the 52 `zf-` component sets.

### `surface/*`

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `surface/canvas` | `#F5F6FC` | `#13151F` | `neutral/300` / `neutral/2200` | 1 in 1 |
| `surface/default` | `#FFFFFF` | `#1D202E` | `base/white` / `neutral/2000` | 648 in 44 |
| `surface/disabled` | `#F0F1FA` | `#191C29` | `neutral/400` / `neutral/2100` | 12 in 6 |
| `surface/hover` | `#F5F6FC` | `#222536` | `neutral/300` / `neutral/1900` | 21 in 10 |
| `surface/inverse` | `#222536` | `#F5F6FC` | `neutral/1900` / `neutral/300` | 1 in 1 |
| `surface/inverse-hover` | `#2D3145` | `#F0F1FA` | `neutral/1700` / `neutral/400` | 2 in 1 |
| `surface/pressed` | `#E9EAF5` | `#282B3D` | `neutral/500` / `neutral/1800` | 2 in 2 |
| `surface/raised` | `#FFFFFF` | `#222536` | `base/white` / `neutral/1900` | none |
| `surface/selected` | `#EBF2FC` | `#182236` | `blue/400` / `blue/2000` | 1 in 1 |
| `surface/sunken` | `#F0F1FA` | `#191C29` | `neutral/400` / `neutral/2100` | 43 in 9 |

### `text/*`

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `text/default` | `#222536` | `#F5F6FC` | `neutral/1900` / `neutral/300` | 578 in 29 |
| `text/disabled` | `#AEB1C2` | `#565A70` | `neutral/900` / `neutral/1300` | 18 in 7 |
| `text/inverse` | `#FFFFFF` | `#13151F` | `base/white` / `neutral/2200` | 8 in 2 |
| `text/placeholder` | `#9598AB` | `#71758F` | `neutral/1000` / `neutral/1100` | none |
| `text/secondary` | `#565A70` | `#C3C5D4` | `neutral/1300` / `neutral/800` | 123 in 16 |
| `text/tertiary` | `#71758F` | `#9598AB` | `neutral/1100` / `neutral/1000` | 365 in 11 |

### `icon/*`

**`icon/muted` is new, and it exists because the ladder had a hole in it.**
`icon/default` is 6.79:1 and the only step below it is `icon/subtle` at **2.85:1**
— which fails 1.4.11 and is marked decorative-only for that reason, the same trap
`zf-design-cannon.md` §2.11.4 records nearly shipping a stepper chevron into.

So there was no way to draw a glyph *quieter* without dropping it below the
floor, and "a bit lighter" is a real and constant request. `icon/muted` is the
step in between:

| | Light | Dark | |
|---|---|---|---|
| `icon/default` | 6.79 | 7.60 | the meaningful glyph |
| **`icon/muted`** | **4.52** | **5.67** | quieter, still identifies a control |
| `icon/subtle` | 2.85 | — | **decorative only** — fails 1.4.11 |

It takes the same per-mode pair as `border/control` — `neutral/1100` Light,
`neutral/1000` Dark — because that pair was chosen for exactly this job: one step
back from the foreground while clearing 3:1 in both panes. `neutral/1200` is the
only other candidate and it is worse in Dark (3.22 against 5.67) for 0.5 more in
Light.

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `icon/default` | `#565A70` | `#AEB1C2` | `neutral/1300` / `neutral/900` | 254 in 21 |
| `icon/disabled` | `#AEB1C2` | `#565A70` | `neutral/900` / `neutral/1300` | 16 in 4 |
| `icon/inverse` | `#FFFFFF` | `#13151F` | `base/white` / `neutral/2200` | 6 in 1 |
| `icon/muted` | `#71758F` | `#9598AB` | `neutral/1100` / `neutral/1000` | 1 in 1 |
| `icon/subtle` | `#9598AB` | `#71758F` | `neutral/1000` / `neutral/1100` | 6 in 1 |

### `border/*`

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `border/control` | `#71758F` | `#9598AB` | `neutral/1100` / `neutral/1000` | *(new — see below)* |
| `border/control-hover` | `#6A6E85` | `#AEB1C2` | `neutral/1200` / `neutral/900` | *(new — see below)* |
| `border/default` | `#DFE0EB` | `#2D3145` | `neutral/600` / `neutral/1700` | 355 in 19 |
| `border/disabled` | `#E9EAF5` | `#282B3D` | `neutral/500` / `neutral/1800` | 6 in 5 |
| `border/divider` | `#E9EAF5` | `#282B3D` | `neutral/500` / `neutral/1800` | 216 in 15 |
| `border/hover` | `#9598AB` | `#565A70` | `neutral/1000` / `neutral/1300` | 8 in 4 |
| `border/strong` | `#C3C5D4` | `#4A4D63` | `neutral/800` / `neutral/1500` | 3 in 1 |

### `primary/*`

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `primary/active` | `#1E53BD` | `#B1CAFC` | `blue/1500` / `blue/800` | 8 in 4 |
| `primary/border` | `#B1CAFC` | `#1A4291` | `blue/800` / `blue/1600` | 5 in 2 |
| `primary/default` | `#3874EB` | `#769BE7` | `blue/1200` / `blue/1000` | 61 in 9 |
| `primary/hover` | `#2762D9` | `#94B3F2` | `blue/1300` / `blue/900` | 3 in 2 |
| `primary/on-primary` | `#FFFFFF` | `#13161C` | `base/white` / `blue/2200` | 126 in 11 |
| `primary/selected` | `#2762D9` | `#94B3F2` | `blue/1300` / `blue/900` | 27 in 7 |
| `primary/subtle` | `#EBF2FC` | `#182236` | `blue/400` / `blue/2000` | 56 in 4 |
| `primary/subtle-hover` | `#E1EBFC` | `#15274D` | `blue/500` / `blue/1900` | 3 in 1 |
| `primary/text` | `#1C5BD9` | `#94B3F2` | `blue/1400` / `blue/900` | 65 in 8 |

### `danger/*`

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `danger/active` | `#822127` | `#FAB1B6` | `red/1600` / `red/800` | none |
| `danger/border` | `#FAB1B6` | `#822127` | `red/800` / `red/1600` | 5 in 2 |
| `danger/default` | `#B2343C` | `#E07980` | `red/1300` / `red/1000` | 68 in 6 |
| `danger/hover` | `#A62932` | `#F59399` | `red/1500` / `red/900` | none |
| `danger/on-danger` | `#FFFFFF` | `#1C1314` | `base/white` / `red/2200` | 2 in 1 |
| `danger/subtle` | `#FCF0F1` | `#33191B` | `red/300` / `red/2000` | 3 in 1 |
| `danger/text` | `#A62932` | `#FAB1B6` | `red/1500` / `red/800` | 15 in 5 |

### `warning/*`

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `warning/border` | `#FFB87B` | `#6B3403` | `orange/800` / `orange/1600` | 3 in 1 |
| `warning/default` | `#9E4B03` | `#D8863F` | `orange/1300` / `orange/1000` | 2 in 1 |
| `warning/hover` | `#80420D` | `#F29F56` | `orange/1500` / `orange/900` | none |
| `warning/on-warning` | `#FFFFFF` | `#1A1511` | `base/white` / `orange/2200` | none |
| `warning/subtle` | `#FCF2E8` | `#2E1D0F` | `orange/300` / `orange/2000` | 3 in 1 |
| `warning/text` | `#80420D` | `#FFB87B` | `orange/1500` / `orange/800` | none |

### `success/*`

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `success/border` | `#7EEDC1` | `#095C3B` | `green/800` / `green/1600` | 3 in 1 |
| `success/default` | `#068754` | `#41C590` | `green/1300` / `green/1000` | 14 in 4 |
| `success/hover` | `#116F49` | `#61DCAB` | `green/1500` / `green/900` | none |
| `success/on-success` | `#FFFFFF` | `#0D1A15` | `base/white` / `green/2200` | 4 in 2 |
| `success/subtle` | `#E3FCF2` | `#11291F` | `green/300` / `green/2000` | 3 in 1 |
| `success/text` | `#095C3B` | `#7EEDC1` | `green/1600` / `green/800` | 5 in 2 |

### `info/*`

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `info/border` | `#95D7F9` | `#0B5073` | `sky/800` / `sky/1600` | 3 in 1 |
| `info/default` | `#0D789E` | `#59ABD4` | `sky/1300` / `sky/1000` | 2 in 1 |
| `info/hover` | `#13628A` | `#70C5EF` | `sky/1500` / `sky/900` | none |
| `info/on-info` | `#FFFFFF` | `#11171A` | `base/white` / `sky/2200` | none |
| `info/subtle` | `#EBF7FC` | `#13252E` | `sky/300` / `sky/2000` | 3 in 1 |
| `info/text` | `#13628A` | `#95D7F9` | `sky/1500` / `sky/800` | none |

### `focus/*`

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `focus/halo` | `#D8E4FB` | `#1A4291` | `blue/600` / `blue/1600` | none |
| `focus/ring` | `#3874EB` | `#94B3F2` | `blue/1200` / `blue/900` | 45 in 19 |

### `overlay/*`

`scrim` is the only role with an alpha channel, and the only one carrying a raw value rather than
an alias.

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `overlay/scrim` | `#13151F` @ 48% | `#000000` @ 64% | `raw` / `raw` | none |

### `nav/*`

**`nav/brand-surface` moved off `blue/2100` — this is open item 31, closed.**
`zf-design-cannon.md` §2.21.4 ends: *"`chrome/surface` is `blue/2000`; `nav/brand-surface`
— the sidebar's logo band — is `blue/2100`. They are one step apart because the source
drew them one step apart. **If the bar and the logo band ever sit adjacent, that seam will
show.**"* They now sit adjacent in every screen the shell composes, and the seam showed.

The two were drawn a step apart because they were drawn in separate frames. Assembled they
are one strip, and the reference renders them as one colour, so the band takes the bar's:
`blue/2000` `#182236`. `nav/brand-text` stays white at 15.90:1, down from 16.68.

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `nav/border` | `#DFE0EB` | `#2D3145` | `neutral/600` / `neutral/1700` | none |
| `nav/brand-surface` | `#182236` | `#182236` | `blue/2000` / `blue/2000` | 5 in 3 |
| `nav/brand-text` | `#FFFFFF` | `#FFFFFF` | `base/white` / `base/white` | 24 in 4 |
| `nav/item-hover` | `#E9EAF5` | `#2D3145` | `neutral/500` / `neutral/1700` | 9 in 5 |
| `nav/item-pressed` | `#C3C5D4` | `#51556B` | `neutral/800` / `neutral/1400` | 11 in 4 |
| `nav/item-selected` | `#CED0DE` | `#4A4D63` | `neutral/700` / `neutral/1500` | 27 in 4 |
| `nav/surface` | `#F5F6FC` | `#222536` | `neutral/300` / `neutral/1900` | 3 in 2 |
| `nav/text` | `#161E2E` | `#E9EAF5` | `blue/2100` / `neutral/500` | 67 in 5 |
| `nav/text-secondary` | `#4A4D63` | `#AEB1C2` | `neutral/1500` / `neutral/900` | 95 in 4 |
| `nav/text-tertiary` | `#6A6E85` | `#9598AB` | `neutral/1200` / `neutral/1000` | 44 in 3 |

### `chrome/*`

The top bar. Permanently dark in both modes, which is why every value is identical.

**`zf-design-cannon.md` §2.21.3 measures what the bar is painted with**, and three roles
sit a long way from it. Only one moved:

| Role | Drawn | Bound | ΔE | Verdict |
|---|---|---|---|---|
| `chrome/accent` | `#408DFB` | `blue/1000` `#769BE7` | ~12 | **moved**, from `blue/900` at 31.39 |
| `chrome/border` | `#6C718A` | `neutral/1000` `#9598AB` | 15.68 | stays |
| `chrome/text-muted` | `#838195` | `neutral/900` `#AEB1C2` | 17.95 | stays |

`chrome/accent` was the largest deviation anywhere in the bar — a pale periwinkle where
the drawing is a saturated blue. `blue/1200` `#3874EB` is the nearest step to the drawn
value and was **not** taken: it gives **2.43:1** on the field, and this role is the field's
focus ring as well as its caret. `blue/1000` gives 4.20:1.

**The other two stay light, and both times for the same reason: at 1px and at 13px, the
drawn value is too dim to do its job.** The edge was tried at `neutral/1100` `#71758F` —
~2 ΔE from the drawing — and it reads muted where the reference renders a crisp ring; it
also falls to **2.31:1 against the field's own fill**, failing 1.4.11 on the inner side.
`neutral/1000` gives 5.56:1 against the bar and 3.69:1 against the field, passing on both.
The placeholder's drawn `#838195` measures **3.04:1** and the nearest step 2.31:1, against
a 4.5:1 requirement for text — and a placeholder is this field's only visible label.

So the standing decision that borders match the drawing holds where the drawing is legible,
and these two are named as the places it is not.

`chrome/avatar` exists because §10 defect 8 records the account tile filling itself with
`chrome/border` — a border role painting a surface. That was invisible while the two shared
a value, and it stopped being invisible the moment the tile needed to move on its own: the
reference draws a **light** disc, near `#D8D8D8`, where `neutral/1000` is a mid blue-grey.
`neutral/700` `#CED0DE` is the nearest real step to it, and the initials read 10.34:1 on it
rather than 5.57.

`chrome/badge` is the notification count on the bell — a red the bar had no role for.
`red/1200` `#C9474F` is the **brightest** red in the palette that still carries white text:
4.71:1, against 4.15 for `red/1100` and 6.13 for the darker `red/1300`. The disc itself is
3.37:1 against the bar. It is in `chrome/*` and not `danger/*` for the reason §2.21.4 gives
for the whole namespace — `danger/default` flips to a light pink in Dark, and this bar
never flips.

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `chrome/accent` | `#769BE7` | `#769BE7` | `blue/1000` / `blue/1000` | 6 in 2 |
| `chrome/avatar` | `#CED0DE` | `#CED0DE` | `neutral/700` / `neutral/700` | 1 in 1 |
| `chrome/badge` | `#C9474F` | `#C9474F` | `red/1200` / `red/1200` | 1 in 1 |
| `chrome/border` | `#9598AB` | `#9598AB` | `neutral/1000` / `neutral/1000` | 6 in 1 |
| `chrome/item-hover` | `#2D3145` | `#2D3145` | `neutral/1700` / `neutral/1700` | 4 in 4 |
| `chrome/item-pressed` | `#4A4D63` | `#4A4D63` | `neutral/1500` / `neutral/1500` | 3 in 3 |
| `chrome/raised` | `#3A3E53` | `#3A3E53` | `neutral/1600` / `neutral/1600` | 2 in 1 |
| `chrome/surface` | `#182236` | `#182236` | `blue/2000` / `blue/2000` | 5 in 5 |
| `chrome/text` | `#FFFFFF` | `#FFFFFF` | `base/white` / `base/white` | 64 in 4 |
| `chrome/text-muted` | `#AEB1C2` | `#AEB1C2` | `neutral/900` / `neutral/900` | 3 in 1 |

### `table/*`

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `table/head` | `#F0F1FA` | `#282B3D` | `neutral/400` / `neutral/1800` | 12 in 1 |
| `table/row-hover` | `#F7F8FC` | `#222536` | `neutral/200` / `neutral/1900` | added 31 Aug 2026 |

### `avatar/*`

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `avatar/admin` | `#9E4B03` | `#9E4B03` | `orange/1300` / `orange/1300` | 47 in 3 |
| `avatar/admin-glyph` | `#FFFFFF` | `#FFFFFF` | `base/white` / `base/white` | 33 in 2 |
| `avatar/blue-surface` | `#EBF2FC` | `#15274D` | `blue/400` / `blue/1900` | 8 in 2 |
| `avatar/blue-text` | `#1A4291` | `#D8E4FB` | `blue/1600` / `blue/600` | 12 in 2 |
| `avatar/cyan-surface` | `#DCFAFA` | `#132E2E` | `cyan/400` / `cyan/1900` | 4 in 1 |
| `avatar/cyan-text` | `#0F5454` | `#C3FAFA` | `cyan/1600` / `cyan/500` | 4 in 1 |
| `avatar/green-surface` | `#D7F5E9` | `#143025` | `green/500` / `green/1900` | 8 in 2 |
| `avatar/green-text` | `#095C3B` | `#B6F6DC` | `green/1600` / `green/600` | 8 in 2 |
| `avatar/orange-surface` | `#FAE6D5` | `#38210C` | `orange/500` / `orange/1900` | 8 in 2 |
| `avatar/orange-text` | `#964600` | `#FCDCC0` | `orange/1400` / `orange/600` | 8 in 2 |
| `avatar/purple-surface` | `#EEE6FA` | `#2B1F3D` | `purple/500` / `purple/1900` | 11 in 3 |
| `avatar/purple-text` | `#3F216B` | `#E7D8FD` | `purple/1700` / `purple/600` | 11 in 3 |
| `avatar/red-surface` | `#FAEDEE` | `#4D1518` | `red/400` / `red/1900` | 4 in 1 |
| `avatar/red-text` | `#822127` | `#FFBFC3` | `red/1600` / `red/700` | 4 in 1 |

### `accent/*`

Decorative hues for tags and categories. **Nothing consumes these yet.**

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `accent/cyan` | `#068080` | `#36C2C2` | `cyan/1300` / `cyan/1000` | none |
| `accent/orange` | `#9E4B03` | `#D8863F` | `orange/1300` / `orange/1000` | none |
| `accent/purple` | `#713DBF` | `#A984E2` | `purple/1300` / `purple/1000` | none |
| `accent/yellow` | `#D59109` | `#F1AB1F` | `yellow/1000` / `yellow/900` | none |

### `chart/*`

A categorical series palette. **Reserved — no chart component exists yet.**

| Role | Light | Dark | Alias — Light / Dark | Used by |
|---|---|---|---|---|
| `chart/1` | `#3874EB` | `#769BE7` | `blue/1200` / `blue/1000` | none |
| `chart/2` | `#11A6A6` | `#36C2C2` | `cyan/1100` / `cyan/1000` | none |
| `chart/3` | `#8256C4` | `#A984E2` | `purple/1200` / `purple/1000` | none |
| `chart/4` | `#23A671` | `#41C590` | `green/1100` / `green/1000` | none |
| `chart/5` | `#F29F56` | `#F29F56` | `orange/900` / `orange/900` | none |
| `chart/6` | `#59ABD4` | `#70C5EF` | `sky/1000` / `sky/900` | none |
| `chart/7` | `#D1525A` | `#E07980` | `red/1100` / `red/1000` | none |
| `chart/8` | `#F1AB1F` | `#FFC34A` | `yellow/900` / `yellow/800` | none |

---

## 4. Brand

The per-product hue. A separate collection because it is chosen per product, not per theme.

| Role | Blue | Red | Alias — Blue / Red | Used by |
|---|---|---|---|---|
| `brand/accent` | `#3874EB` | `#C9474F` | `blue/1200` / `red/1200` | none |
| `brand/on-solid` | `#FFFFFF` | `#FFFFFF` | `base/white` / `base/white` | 78 in 7 |
| `brand/solid` | `#2762D9` | `#C9474F` | `blue/1300` / `red/1200` | 26 in 7 |
| `brand/solid-hover` | `#1C5BD9` | `#B2343C` | `blue/1400` / `red/1300` | 5 in 4 |
| `brand/solid-pressed` | `#1A4291` | `#B22D36` | `blue/1600` / `red/1400` | 5 in 4 |

`brand/solid` is **not** the same as `primary/default`. `primary` is the interactive blue and it
stays blue in a red product; `brand` is the product identity. Confusing them is how a red product
ends up with blue links or a blue product with red focus rings.

**Only Blue and Red exist** because that is what the source had. Open item 29.

---

## 5. Contrast

| Foreground | Background | Light | Dark | Needs | |
|---|---|---|---|---|---|
| `text/default` | `surface/default` | 15.15:1 | 15.0:1 | 4.5:1 | pass |
| `text/secondary` | `surface/default` | 6.79:1 | 9.44:1 | 4.5:1 | pass |
| `text/tertiary` | `surface/default` | 4.52:1 | 5.67:1 | 4.5:1 | pass |
| `text/disabled` | `surface/disabled` | 1.89:1 | 2.49:1 | 4.5:1 | exempt |
| `icon/default` | `surface/default` | 6.79:1 | 7.6:1 | 4.5:1 | pass |
| `primary/text` | `surface/default` | 5.92:1 | 7.69:1 | 4.5:1 | pass |
| `primary/default` | `surface/default` | 4.32:1 | 5.86:1 | 3.0:1 | pass |
| `danger/text` | `surface/default` | 7.04:1 | 9.27:1 | 4.5:1 | pass |
| `success/text` | `surface/default` | 8.06:1 | 11.38:1 | 4.5:1 | pass |
| `text/secondary` | `table/head` | 6.04:1 | 8.15:1 | 4.5:1 | pass |
| `text/default` | `surface/hover` | 14.05:1 | 14.05:1 | 4.5:1 | pass |
| `primary/text` | `surface/hover` | 5.49:1 | 7.21:1 | 4.5:1 | pass |
| `nav/text` | `nav/surface` | 15.46:1 | 12.66:1 | 4.5:1 | pass |
| `nav/text-secondary` | `nav/surface` | 7.69:1 | 7.12:1 | 4.5:1 | pass |
| `nav/text-tertiary` | `nav/surface` | 4.66:1 | 5.31:1 | 4.5:1 | pass |
| `chrome/text` | `chrome/surface` | 15.9:1 | 15.9:1 | 4.5:1 | pass |
| `chrome/text-muted` | `chrome/raised` | 4.95:1 | 4.95:1 | 4.5:1 | pass |
| `border/control` | `surface/default` | 4.52:1 | 5.67:1 | 3.0:1 | pass |
| `border/control-hover` | `surface/default` | 5.02:1 | 7.60:1 | 3.0:1 | pass |
| `border/default` | `surface/default` | 1.31:1 | 1.26:1 | 3.0:1 | **FAIL** |
| `border/divider` | `surface/default` | 1.2:1 | 1.16:1 | 3.0:1 | exempt |
| `focus/ring` | `surface/default` | 4.32:1 | 7.69:1 | 3.0:1 | pass |

**`border/default` fails, and it is a palette problem rather than a role problem.** The neutral ramp
jumps from **2.85:1** at `neutral/1000` straight to **4.52:1** at `neutral/1100`, so no step lands
near 3:1. Every bordered control is in the same position. Open item 35.

**`border/control` is the answer to open item 35, added 2026-08-21.** It sits at the first neutral
step that clears 3:1 — `neutral/1100`, 4.52:1 — which is what `ZF-RADIO.md` §5.1,
`ZF-BUTTON.md` §5.4 and `ZF-INPUT-FIELD.md` §4.2 all independently identify.

Its Dark value is **`neutral/1000`, 5.67:1**, stated by `ZF-INPUT-FIELD.md` §4.2. This role was first
added on 2026-08-21 with `neutral/1200` instead, derived from the mirror every other `border/*` role
follows (Light step + Dark step = 2300, true for all five). That derivation was wrong — the input
field md specifies the value, and it is a better one: 5.67:1 against the 3.22:1 the mirror produced.
**The mirror is a heuristic for filling a gap, not a substitute for a stated value.**

It is **additive**: `border/default` is unchanged, so nothing that currently uses it moves. A control
opts in by binding `border/control` instead — which is the boundary of a *control*, as against
`border/default`, which is the boundary of a *container*. That distinction is the reason this is a
separate role rather than a retune: a card and a radio should not have to agree.

**`border/control-hover` follows it**, at `neutral/1200` / `neutral/900`, parallel to how
`border/default` is followed by `border/hover`. `ZF-TOGGLE.md` §2.1 needs both steps: `neutral/1100`
for the resting track and `neutral/1200` for the hovered one, and no other role held the second.

⚠️ **The toggle uses both as a FILL, not a border.** That is the role-meaning problem `ZF-BUTTON.md`
§4 catalogues, in the other direction — a switch track is a surface. The values are right and no other
role holds them, so this is the honest place to note it rather than to hide it: the clean answer is a
`control/track` family, and that is a naming decision, not a value one.

The consequence is concrete: an unchecked checkbox is *only* a border, so it is the one control that
cannot be identified at all. Open item 38.

---

## 6. Roles nothing consumes

27 of 112. Reserved on purpose: all four `accent/*`, all eight `chart/*`, `brand/accent`, and the
interactive halves of the status families (`danger/active`, `danger/hover`, `info/hover`,
`info/on-info`, `info/text`, `success/hover`, `warning/hover`, `warning/on-warning`,
`warning/text`).

**Five are real gaps**, each defined for a reason and then never applied — which means a component
is using a near-enough role instead:

| Role | The gap |
|---|---|
| `overlay/scrim` | The popup modal has no scrim bound. A modal with no scrim is a modal you can read the page through. **Fix first.** |
| `text/placeholder` | The top bar's search placeholder used `chrome/text-muted` instead |
| `focus/halo` | Every focus ring uses `focus/ring` alone; the halo was defined and never used |
| `surface/raised` | Cards and popovers use `surface/default`, so nothing sits above the page |
| `nav/border` | The rail has no divider bound |

---

## 7. Roles that resolve to the same value

Two roles sharing a value is usually correct — that is what a role layer is *for*. It is only a bug
when the two have to be **visually distinguishable from each other**.

### The ones that matter

| Roles | Value | Why it is a problem |
|---|---|---|
| `primary/hover` · `primary/selected` | `#2762D9` / `#94B3F2` — both modes | **Hovering something already selected renders no change**, system-wide. 3 and 27 uses. Open item 24 |
| `surface/disabled` · `surface/sunken` | `#F0F1FA` / `#191C29` — both modes | A disabled control and a recessed well are the same surface. 12 and 43 uses |
| `border/disabled` · `border/divider` | `#E9EAF5` / `#282B3D` — both modes | A disabled input's boundary reads as a divider, so it stops reading as a control at all. 6 and 216 uses |

### One introduced and fixed

`surface/pressed` was added for the page header at `neutral/400` — exactly where `surface/disabled`
and `surface/sunken` already sat, so a pressed control and a disabled control were the same colour
in Light. It is now `neutral/500`, which skips the occupied step:

| | Default | Hover | Pressed | Disabled |
|---|---|---|---|---|
| Light | `#FFFFFF` | `neutral/300` | `neutral/500` | `neutral/400` |
| Dark | `neutral/2000` | `neutral/1900` | `neutral/1800` | `neutral/2100` |

The ladder is monotonic in both panes, and disabled sits off the ladder rather than on it — correct,
because disabled is not a stronger version of pressed.

### The ones that are fine

`icon/default` = `text/secondary`, `icon/disabled` = `text/disabled`, `icon/inverse` =
`text/inverse`, `chart/1` = `primary/default`, `nav/border` = `border/default`, `avatar/green-text`
= `success/text`, and twelve roles resolving to white in Light. Different meanings, same value

`nav/brand-surface` = `chrome/surface` joins them, and it is the one entry here that is
*deliberately* equal rather than incidentally so — see the note under `nav/*`. The rail's
logo band and the top bar are adjacent halves of a single dark strip, so a value they must
NOT be distinguishable across is exactly the inverse of what this section usually catches.

today. Leave them.

**The test is not "are these the same value" — it is "do these two ever need to be told apart".**

---

## 8. Colours the palette does not own

| Value | ΔE from nearest | Appears in | Status |
|---|---|---|---|
| `#408DFB` | 10.69 from `blue/1100` | Input Field, Wizard, Popup modal, Breadcrumb, table sort caret | open item 25 |
| `#528EF4` | 7.45 from `blue/1100`, 4.79 from `#408DFB` | page header caret | the same colour, drawn twice |
| `#2577F0` | 2.58 from `blue/1200`, 4.74 from `#1B6DE0` | list table link | as above |
| `#1B6DE0` | 4.07 from `blue/1200`, 6.26 from `blue/1300` | page-header CTA, table action link | between two steps, equal to neither |
| `#757575` | 13.88 | top bar | open item 12 — a true grey in a blue-cast ramp |
| `#222222` | 12.18 | list table body text | as above |
| `#CC2132` | 14.08 from `red/1400` | table shortage, alert triangle | folded into `danger/text` |
| `#E4E4EF` · `#E4E4F0` | 1.53 · 1.63 | table outer border | 0.52 ΔE apart — the same border sampled twice |

**Eight appearances, three intended blues, none owned.** A bright blue near `#4A8DF8`, a deep blue
near `#2077E8`, and the palette has neither. Open item 25.

---

## 9. Note on the upstream package

§9 of the source document describes an `@zf/design-tokens` npm package shipping
`tokens/primitives.css`, `tokens/semantic.css`, `tokens/brand.css`, `tokens.ts` and `tokens.json`.

If that package ships, this repo should **consume it and delete its generated CSS**. The naming in
this repo deliberately matches the package's contract (`--zf-color-<role>`) so the swap is a
drop-in rather than a rename sweep. Until then `scripts/gen-tokens.mjs` is the local stand-in.
