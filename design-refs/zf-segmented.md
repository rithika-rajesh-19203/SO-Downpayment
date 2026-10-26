# ZF Design Cannon — Segmented Control

**Canon:** §2.11 · **Figma:** `Tin Tin` — page `Segmentation tab` (`31:18754`)
**Two component sets:** `zf-segment` (`31:18821`) · `zf-segmented` (`31:18861`)
**CSS classes:** `.zf-segment` · `.zf-segmented` · **Measured 2026-08-24.**

> **This file is the implementation spec, not a transcription of Figma.**
>
> **This is the best-documented component in the system.** Its Figma doc frame already names the headline
> defect, gives the exact ratio, links it to the system-wide border problem, and — in a section called
> "Traps worth recording" — explains three things that *look* like defects and are deliberate. Eight of
> its claims are exact, one is wrong, two are too cautious. No other doc frame in this file comes close.
>
> What it does not do is look at **dark mode**, and that is where this component comes apart: every cue
> that conveys selection collapses at once. §2 has the numbers, §10.1 has the row-by-row check.
> **Where this file and Figma disagree, this file wins** — but here they mostly agree. §9 is the code.

---

## 1. What this is

A **segmented control**: 2–4 mutually exclusive options in a shared track, exactly one selected, switching
instantly. It is a radio group that looks like a switch. §7 separates it from tabs and pills.

| Set | Variants | Role |
|---|---|---|
| **`zf-segment`** | 8 — `Selection` (2) × `State` (4) | one segment |
| **`zf-segmented`** | 3 — `Content` (`icon + text`, `icon only`, `text only`) | the track |

| | |
|---|---|
| Segment | **100 × 28** on all eight set variants. In the track, per-label: 100 / 93 · 34 / 34 · 80 / 73 |
| Track | **199 / 74 / 159 × 32** — HUG width, 2px padding, 2px gap |
| `zf-segment` properties | `Label` (TEXT), `Show icon` (BOOL), `Show label` (BOOL), `Icon` (SWAP) |
| Property references | **32 of 32 present** — all four refs on all eight variants. §2.3 |
| Paints | **all on `ZF Semantic` roles.** One raw effect, no raw or primitive paints |
| Descriptions | both present; **`zf-segmented`'s is wrong** — §10 defect 5 |
| Instances | **23** — 20 `zf-segment`, 3 `zf-segmented` — all on the `Segmentation tab` page |
| Doc frame | `31:19020` — 1680 × 3,894, 6 sections — §10.1 |

**No consumers outside its own page.** All 23 instances are on `Segmentation tab`.

---

## 2. The selection signal is 1.12:1 — and 1.05:1 in dark mode

A segmented control has exactly one job: show which of N options is on. Here that is done by a white
segment floating on a recessed track. Measured:

| Channel | Light | Dark | Needs |
|---|---|---|---|
| **Surface** — selected segment vs track | **1.12** | **1.05** | 3.0 |
| **Shadow** — its darkest edge vs the segment | **1.34** | **1.07** | 3.0 |
| **Label** — `text/secondary` → `text/default` | 2.23 | 1.59 | — *(a state delta, not a boundary)* |

`surface/default` `#FFFFFF` on `surface/sunken` `#F0F1FA` is 1.12:1. **Neither boundary that 1.4.11
governs comes close to 3:1, in either mode**, and the third cue — the label colour shifting — is a
state-to-state delta with no threshold to fail. It is listed because it is what a user actually notices,
not because 2.23 is a compliance number. (The labels' own contrast is fine: 6.04 and 15.15 — §4.2.)

**The Figma doc frame already knows this** — its §05 records 1.4.11 as FAILS at 1.12:1, and its §06 trap 3
names the same pair and attributes it to the *"Same root cause as `border/default` at 1.31:1 across seven
components"*, which is right. Nothing to correct on this point.

**What it does not know is what happens in Dark**, and that is the part that matters:

| | Light | Dark |
|---|---|---|
| Track `surface/sunken` | `neutral/400` `#F0F1FA` | `neutral/2100` `#191C29` |
| Selected segment `surface/default` | `base/white` `#FFFFFF` | `neutral/2000` `#1D202E` |
| Between them | 1.12 | **1.05** |

Two near-identical near-blacks. And the shadow cannot help: it is **raw `#000000` at 8%**, so in Dark it
composites over the track to `#171A26` — **1.07:1 against the segment** it is supposed to lift, and 1.02:1
against the track it sits on. A black shadow on a black surface. So in Dark the *only* remaining cue is the
label, shifting by 1.59:1.

Be fair about Light, though. This is the iOS-style segmented control and it does read in practice, because
a shadow edge is a **gradient**, and a soft gradient is perceptually stronger than its peak flat ratio
suggests. The export confirms it: the selected segment is visible. But it fails the measurable test, it
depends on an effect that cannot be tokenised, and it stops working entirely when the theme flips.

### 2.1 The fix: a 1px border on the selected segment

| Option | Selected vs track | | Cost |
|---|---|---|---|
| **A — 1px `border/control` on the selected segment** | **4.02** Light · **3.75** Dark | ✓ | one line; the fill and shadow stay as they are |
| B — darken the track to `surface/pressed` | 1.20 Light · 1.16 Dark | ✗ | still fails, and the track gets heavy |
| C — tint the selected segment `primary/*` | passes | ⚠️ | rejected by the doc frame's §03, and rightly — see below |

**Option A.** `border/control` is `neutral/1100` `#71758F`, mode-invariant, and it also measures 4.52 Light
/ 3.58 Dark against the segment's own fill — so both of the border's boundaries pass in both modes. It is
additive: the white fill, the shadow and the label colours all stay exactly as they are, so Light looks
almost unchanged and Dark gains a boundary it currently does not have.

This is the **eighth** component needing `border/control`, and the role already exists (created during the
pill work, §4.4 there).

**Option C is the tempting one and the doc frame argues against it well enough to quote:** *"a segmented
control is a neutral switcher, and tinting the selected segment blue would make it compete with the
primary action on the page."* That is correct, and it is the reason not to reach for `primary/selected`
here the way the wizard and pill do.

### 2.2 Hover is inert on a selected segment — and that is deliberate

`Selection=selected, State=hover` is **byte-identical** to `State=default`: same fill, same label colour,
same shadow. In the pill I flagged a weak selected-hover as a defect. Here it is not one, and the doc
frame's §06 says why: *"A selected segment is not a target; changing it on hover suggests it can be
re-chosen. The variant exists so the matrix is complete, not because it differs."*

That is a better argument than the one I made about the pill, and the distinction is real: clicking a
selected **pill** deselects it (filters are additive), while clicking a selected **segment** does nothing
at all (exactly one is always on). A control that cannot respond should not offer feedback. §9 keeps it
inert and says so.

**Unselected hover is a separate problem**, though, and the frame does not measure it:

| | Light | Dark |
|---|---|---|
| `surface/hover` vs the track | **1.04** | **1.12** |
| the label darkening that accompanies it | 2.23 | 1.59 |

`surface/hover` is `neutral/300` `#F5F6FC` and the track is `neutral/400` `#F0F1FA` — **one step apart on
the ramp**. So the hover *fill* is invisible and the label change is doing all the work, weakly. §11
decision 2.

### 2.3 What this component gets right — including a first

- **32 of 32 property references present.** `Show icon`, `Show label`, `Label` and `Icon` are wired on all
  eight variants. Both the pill and the wizard's card atom lost most of theirs to `clone()`; this is the
  first set in the file with a complete reference matrix.
- **Composition is properties, not variants.** `Show icon` / `Show label` are booleans on the segment, so
  every combination is reachable without a variant explosion. Compare the badge and the button.
- **Every paint is on a semantic role.** No raw hex, no primitives, no remote references. Only the drop
  shadow is unbound, and no shadow token layer exists to bind it to.
- **Concentric radii.** Track 8, segment 6, 2px inset — 6 + 2 = 8 exactly.
- **The segment's height is FIXED at 28**, so content cannot change it — and the track simply hugs that,
  landing at 32. The immunity comes from the segment, not from a fixed track. That is the failure mode the
  wizard's step card has (§2.3 there) and this one is immune.
- **Geometry is tokenised**: horizontal padding, gap and all four radii bound on both sets. (The
  segment's vertical padding is an unbound 0, which is the honest value rather than an inert one.)
- **`zf/body-sm/medium`** — a real text style (12/16), not ad-hoc type.

---

## 3. Geometry — measured

### 3.1 `zf-segment`

| Property | Value | |
|---|---|---|
| Size | **100 × 28** on all eight set variants | HUG / **FIXED** |
| Size as instanced | icon+text **100 / 93** · icon-only **34 / 34** · text-only **80 / 73** | the width hugs each label, which is why the tracks come to 199 / 74 / 159 |
| Layout | `HORIZONTAL`, `CENTER / CENTER` | |
| Padding | **0 / 10 / 0 / 10** | horizontal bound to `space/5`; the vertical zeros carry no binding. Vertical is honestly 0 — the 28px fixed height centres the content |
| Gap | **6** | `space/3` — bound |
| Radius | **6** | `radius/md` — bound |
| Icon | **14 × 14** instance of a **16 × 16** master | §3.3 |
| Label | 12 / 16 Inter Medium, `zf/body-sm/medium` | ✓ a real style |
| Shadow (selected) | `DROP_SHADOW` 0/1, blur 2, spread 0, **raw `#000000` @ 8%** | §2 |
| Focus ring | 104 × 32 at (−2, −2), 2px `INSIDE`, radius 8, `ABSOLUTE`, `STRETCH/STRETCH` | §3.4 |

**No inert padding anywhere**, which is worth noting because the badge, button, checkbox and pill all
declare vertical padding that the fixed height overrides. Here it is declared as 0.

### 3.2 `zf-segmented` — the track

| Property | Value | |
|---|---|---|
| Size | **199 / 74 / 159 × 32** | HUG / HUG |
| Layout | `HORIZONTAL`, `MIN / CENTER` | |
| Padding | **2** on all four sides | bound |
| Gap | **2** | bound |
| Radius | **8** | bound — and 6 + 2 = 8, concentric with the segment |
| Fill | **`surface/sunken`** | a real role ✓ |
| `clipsContent` | `false` | correct, the focus ring reaches the track edge |
| Segments per variant | **2**, in all three | §10 defect 5 |

`32 = 2 + 28 + 2` — and the radii are concentric across the 2px inset. This is the cleanest container
geometry in the file.

### 3.3 The icon costs 28 hand-maintained overrides

The masters `icon / card-view` and `icon / list-view` are 16 × 16, a single `ROUND`-capped path, stroked
**1.25** and bound to **`icon/default`**. Every consumer overrides both:

| | Master | As used |
|---|---|---|
| Stroke weight | **1.25** | **1.2** |
| Stroke colour | **`icon/default`** | **`text/secondary｜default｜disabled`**, per state |

That is 2 overrides × 14 places (8 set variants + 6 nested track instances) = **28 overrides**, and they
exist for a good reason — the icon must track the label, and `icon/default` does not. The doc frame's §02
records the weight change as an optical decision, expressed as a ratio: *"1.5px stroke on an 11px glyph =
1 : 7.3"* became *"1.2px = 1 : 9.2"*. Both check out (11 ÷ 1.5 = 7.33, 11 ÷ 1.2 = 9.17).

**But the doc frame's own §06 trap 2 records the consequence:** swapping `Icon` replaces the whole instance
and the new one arrives with the master's paints, so the state override is lost — it says three selected
segments once came back at `neutral/1100`.

**I re-checked all six nested instances. They are currently correct** — `text/default` on the three
selected, `text/secondary` on the three unselected, 1.2 throughout. So that trap is a closed historical
fix, not an open defect. It is still a *structural* fragility: 28 overrides that any icon swap silently
resets.

**In code this problem does not exist.** `stroke: currentColor` on the icon makes it inherit the segment's
`color`, so there are zero overrides and a swap cannot break anything. §9.2. Two smaller notes: the master
says 1.25 while every instance says 1.2, so anyone instancing these icons elsewhere gets the heavier
weight; and the `list-view` path is 11 × 8 where `card-view` is 11 × 11, so the two glyphs do not share an
optical box.

### 3.4 The focus ring has no clearance — and here it does not matter

104 × 32 at (−2, −2) with a 2px **`INSIDE`** stroke means the band occupies −2…0: **zero gap** from the
segment. That is the exact construction I called a defect on the pill. Here it is benign, for two reasons.

First, the geometry is deliberate: the segment sits at (2, 2) inside the track, so a ring at −2 lands
**exactly on the track's 2px padding**. It fills the inset rather than overlapping anything, and
`clipsContent: false` means nothing cuts it off. The doc frame's §06 trap 5 describes this precisely.

Second — and this is why the pill failed and this does not — **the ring's neighbours contrast**:

| | Light | Dark | |
|---|---|---|---|
| Ring vs the track (its inner neighbour) | **3.84** | **8.06** | ✓ |
| Ring vs a selected segment | **4.32** | **7.69** | ✓ |
| Ring vs the page (outer edge) | 4.32 | 7.69 | ✓ |

On the pill the ring's inner neighbour was `primary/selected`, one step from `focus/ring` — 1.27 Light and
1.00 Dark. Here the neighbours are neutral surfaces, so a blue ring reads against all of them. **Zero
clearance is only a defect when the thing behind the ring is the same hue as the ring.** §9 still uses
`outline-offset` in CSS, because that is the portable way to get the same result.

### 3.5 Target size — passes, and the doc frame is too cautious

| | Measured | 2.5.8 minimum *(WCAG 2.2)* | |
|---|---|---|---|
| Default segment | 100 × 28 | 24 × 24 | ✓ |
| **Icon-only segment** | **34 × 28** | 24 × 24 | ✓ — the narrowest configuration in the file |
| Text-only segment | 80 / 73 × 28 | 24 × 24 | ✓ |

The doc frame records this as "REVIEW — 28px tall, above 24 but tight; icon-only segments are 34px wide".
Both dimensions clear the minimum in every configuration, so this is a **pass**. "Tight" is a fair design
note; it is not a conformance question.

---

## 4. Colour

Every paint on both sets resolves to a `ZF Semantic` role. No raw paints, no primitives, no remote
references — the second component in the file to manage that, after the pill.

### 4.1 The state matrix

| Selection · State | Segment fill | Label + icon | Elevation |
|---|---|---|---|
| unselected · default | **none** (track shows through) | `text/secondary` | — |
| unselected · hover | `surface/hover` | `text/default` | — |
| unselected · focus | none | `text/secondary` | — · + ring |
| unselected · disabled | none | `text/disabled` | — |
| selected · default | `surface/default` | `text/default` | shadow |
| selected · hover | `surface/default` | `text/default` | shadow — **identical, by design (§2.2)** |
| selected · focus | `surface/default` | `text/default` | shadow · + ring |
| selected · disabled | `surface/default` | `text/disabled` | shadow |

Resolved values:

| Role | Light | Dark |
|---|---|---|
| `surface/sunken` *(track)* | `neutral/400` `#F0F1FA` | `neutral/2100` `#191C29` |
| `surface/default` *(selected)* | `base/white` `#FFFFFF` | `neutral/2000` `#1D202E` |
| `surface/hover` | `neutral/300` `#F5F6FC` | `neutral/1900` `#222536` |
| `text/default` | `neutral/1900` `#222536` | `neutral/300` `#F5F6FC` |
| `text/secondary` | `neutral/1300` `#565A70` | `neutral/800` `#C3C5D4` |
| `text/disabled` | `neutral/900` `#AEB1C2` | `neutral/1300` `#565A70` |
| `focus/ring` | `blue/1200` `#3874EB` | `blue/900` `#94B3F2` |
| `icon/default` *(master only)* | `neutral/1300` `#565A70` | `neutral/900` `#AEB1C2` |

### 4.2 Contrast, both modes

| | Light | Dark | Needs | |
|---|---|---|---|---|
| **selected segment vs track** | **1.12** | **1.05** | 3.0 | ✗ §2 |
| **shadow edge vs the segment** | **1.34** | **1.07** | 3.0 | ✗ §2 |
| **hover segment vs track** | **1.04** | **1.12** | 3.0 | ✗ §2.2 |
| unselected label on the track | 6.04 | 9.89 | 4.5 | ✓ |
| unselected icon on the track | 6.04 | 9.89 | 3.0 | ✓ — the icon takes the *label's* role, so it matches the row above. (`icon/default`, which the masters use, would be 7.96 in Dark) |
| selected label on the segment | 15.15 | 15.00 | 4.5 | ✓ |
| hover label on the hover fill | 14.05 | 14.05 | 4.5 | ✓ |
| **disabled label, unselected** | **1.89** | **2.49** | — exempt | ⚠️ §4.3 |
| **disabled label, selected** | **2.13** | **2.38** | — exempt | ⚠️ §4.3 |
| focus ring vs page / track / segment | 4.32 / 3.84 / 4.32 | 7.69 / 8.06 / 7.69 | 3.0 | ✓ |

**Every *enabled* text pair passes with room; the disabled ones are 1.89–2.49 (§4.3). Every
surface-to-surface boundary fails.** The labels are the healthiest of any component in the system; the
surfaces are the weakest. That is one pattern — a design that deliberately conveys state through neutral
elevation rather than hue, which reads well and measures badly.

### 4.3 Disabled is dim to the point of illegible, and the doc frame omits it

| | Light | Dark |
|---|---|---|
| `text/disabled` on the track | **1.89** | 2.49 |
| `text/disabled` on a selected segment | **2.13** | 2.38 |

Disabled text is exempt from 1.4.3, so neither is a violation. But `#AEB1C2` on `#F0F1FA` at 1.89:1 is
below the threshold at which most people can read 12px type at all, and the doc frame's §05 has no
disabled row. This is the same `text/disabled` limit the pill hit (§4.3 there): the role is `neutral/900`,
and even `neutral/1100` only reaches 4.02 Light / 3.75 Dark. §11 decision 3, shared.

Note also that a **disabled segmented control is a strange thing to build** — if the whole group is
disabled that is one flag on the group, and if a single option is unavailable it usually should not be in
the group at all. **§9 implements group-level disabling only**, deliberately; §9.3's third bullet explains
what per-segment disabling would break, and §11 decision 4 asks whether it should exist.

---

## 5. States

`Selection` (2) × `State` (4), all 8 present, and the axis split is correct: `Selection` is what the user
chose, `State` is what the pointer and keyboard are doing. There is **no `error`** — right for this
component, since a segmented control cannot be invalid; it always has exactly one value.

One asymmetry is deliberate (`selected` + `hover` is inert, §2.2) and one is a gap:

**There is no `pressed` / `:active` state**, though `surface/pressed` exists in the system
(`neutral/500` `#E9EAF5`). For a control whose whole purpose is being clicked, the moment of the click is
unacknowledged. §11 decision 5.

---

## 6. Accessibility

| Requirement | Status | Detail |
|---|---|---|
| **1.4.11** — selected segment vs track | ✗ **fail** | **1.12** Light, **1.05** Dark — the selection signal itself. §2 |
| **1.4.11** — hover segment vs track | ✗ **fail** | 1.04 / 1.12 — `surface/hover` is one ramp step from the track. §2.2 |
| 1.4.3 text | ✓ | 6.04 / 15.15 / 14.05 Light; 9.89 / 15.00 / 14.05 Dark — the unselected label improves, the other two hold. §4.2 |
| 1.4.11 — focus ring | ✓ | 3.84–4.32 Light, 7.69–8.06 Dark, against all three neighbours. §3.4 |
| 2.4.7 focus visible | ✓ | 2px `focus/ring` on both selections, `STRETCH` so it tracks the segment's box as the label changes length |
| **1.4.1** colour independence | ⚠️ **judgment** | `aria-checked` carries it for assistive tech. Visually, elevation + label colour is a second channel, but at 1.12 / 1.34 / 2.23 no channel is strong — and in Dark, effectively none is |
| **2.5.8** target size *(WCAG 2.2)* | ✓ | 34 × 28 at the smallest. §3.5 |
| 2.1.1 keyboard | ⚠️ | needs a real radio group for arrow-key navigation — §8. Not free from `<button>`s |
| **Accessible name, icon-only** | ✗ | no name at all unless code supplies one — §9.1 |
| Disabled legibility | ⚠️ | 1.89:1 — exempt, barely readable. §4.3 |

**Two 1.4.11 failures, both between two neutral surfaces**, and one accessible-name failure that only code
can fix. The doc frame's §05 flags the first and the accessible name; §9 handles all of it.

---

## 7. Segmented control, tabs, or pills?

Three components in this system are a row of small labelled targets. The difference is **what the choice
does** and **how many can be on**:

| | Options on at once | Click does | Layout |
|---|---|---|---|
| **Segmented control** | **exactly one, always** | changes *how* the same content is shown | a shared enclosed track |
| Tabs | exactly one | changes *which* content is shown | separate, no track |
| Pills | zero to many | filters the content | separate, no track |

Two rules that catch most misuse:

- **If it changes the content rather than the view of it, use tabs.** Card-view / list-view is a segmented
  control; Overview / Billing / Members is tabs. The giveaway is whether the underlying data is the same.
- **If none-selected is a valid state, it is not a segmented control.** A segmented control cannot be
  empty. That is also why it has no `error` state and why `Selection` is not a boolean per segment.

The shared track is the visual signal for "these are alternatives to each other", which is why 2–4 is the
practical limit — beyond that, use a select.

---

## 8. Selector strategy

**This is the one component in the system where a native element is not enough.** A segmented control needs
roving-tabindex arrow-key navigation, which `<button>` does not give you and which a `<fieldset>` of radios
gives you only with the native radio appearance stripped.

Two viable builds:

| | |
|---|---|
| **A — native radios**, visually hidden, each with a `<label>` | arrow keys, form participation and `:checked` for free. But the label is the styling hook, so it repeats the checkbox/toggle pattern — and the `pointer-events: none` hover trap that broke both of those files |
| **B — ARIA radiogroup** on `<div role="radiogroup">` with `<button role="radio" aria-checked>` | matches the Figma description and the doc frame's §04 selector table exactly, and hover goes directly on the control. Costs: you implement arrow keys and roving tabindex yourself |

**§9 builds B**, because the Figma description already specifies `role="radiogroup"` (it stops there —
`aria-checked` is this file's addition), and because it avoids the hidden-input hover trap that has now
bitten two components in this system. The arrow-key handler is about fifteen lines.

| Figma | Selector |
|---|---|
| `zf-segmented` | `<div class="zf-segmented" role="radiogroup" aria-label="…">` |
| `zf-segment` | `<button class="zf-segment" role="radio" aria-checked>` |
| `Selection=selected` | **`[aria-checked="true"]`** — the attribute is the hook |
| `State=hover` | `:hover:not(:disabled)` — directly on the button, no wrapper needed |
| `State=focus` | `:focus-visible` |
| `State=disabled` | `:disabled` |
| `Content` | **no modifier.** It is which children render — §10.1 |

**`Content` is not a CSS class.** The doc frame's §06 trap 1 is explicit that the track axis exists so a
designer picks a preset rather than toggling four booleans, and that *"in code there is no `--content`
modifier: it is which children get rendered."* That is right, and it is why §9's React takes `icon` and
`label` per segment rather than a `content` prop.

---

## 9. Code

### 9.1 Markup

```html
<div class="zf-segmented" role="radiogroup" aria-label="View mode">
  <button type="button" class="zf-segment" role="radio" aria-checked="true" tabindex="0">
    <svg class="zf-segment__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">…</svg>
    <span class="zf-segment__label">Card View</span>
  </button>
  <button type="button" class="zf-segment" role="radio" aria-checked="false" tabindex="-1">
    <svg class="zf-segment__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">…</svg>
    <span class="zf-segment__label">List View</span>
  </button>
</div>

<!-- icon-only: the label is still in the DOM, just visually hidden.
     An icon-only segment with no accessible name is unusable, and Figma's
     `Show label = false` gives you exactly that. §6 -->
<button type="button" class="zf-segment zf-segment--icon-only" role="radio" aria-checked="false" tabindex="-1">
  <svg class="zf-segment__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">…</svg>
  <span class="zf-sr-only">List View</span>
</button>
```

**`tabindex` is roving**: exactly one segment carries `0` — the selected one — and the rest carry `-1`. That
is what makes the group a single tab stop with arrow keys inside it, which is what a radiogroup must be.

**Icon-only never drops the name.** `Show label = false` in Figma removes the text node, which for a
`<button>` means no accessible name at all. In code the label moves to `.zf-sr-only` instead of
disappearing. This is the one place where following Figma literally produces an unusable control.

### 9.2 CSS

```css
.zf-sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0;
  margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
}

/* ---- the track ------------------------------------------------------------- */
.zf-segmented {
  display: inline-flex;
  align-items: center;
  gap: var(--zf-space-1);                  /* 2 */
  padding: var(--zf-space-1);              /* 2 */
  border-radius: var(--zf-radius-lg);      /* 8 = the segment's 6 + the 2px inset */
  background: var(--zf-surface-sunken);
  box-sizing: border-box;
}

/* ---- one segment ----------------------------------------------------------- */
.zf-segment {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--zf-space-3);                  /* 6 */
  min-width: 0;                            /* load-bearing: without it a segment overflows a
                                              constrained track instead of shrinking */
  height: 28px;                            /* FIXED in Figma; vertical padding is honestly 0 */

  /* 10px of padding MINUS the 1px border, because the width here is auto.
     box-sizing: border-box only subtracts a border from a *specified* dimension —
     the height (28px) absorbs it, the auto width does not. Write
     `padding-inline: 10px` with a 1px border and every segment renders 102px
     instead of Figma's 100, and the track 203 instead of 199. */
  padding-inline: calc(var(--zf-space-5) - 1px);
  border: 1px solid transparent;           /* reserved, so the selected border adds no layout */
  border-radius: var(--zf-radius-md);      /* 6 */
  box-sizing: border-box;
  background: none;                        /* unselected: the track shows through */
  color: var(--zf-text-secondary);
  font-family: var(--zf-font-family);
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;                        /* zf/body-sm/medium */
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease;
}

/* The icon inherits `color`, so it needs no per-state rule and an icon swap
   cannot break it. In Figma this costs 28 hand-maintained overrides (§3.3),
   and the doc frame records them being silently reset by a swap.
   BOTH declarations must reach the <path>, not just the <svg>: Figma exports a
   stroke and a stroke-width as PRESENTATION ATTRIBUTES on the path, and an
   attribute on the child beats an inherited value from the parent. Hence the
   descendant selector — without it the icon stays one colour at 1.25.
   stroke-width is in USER UNITS: a 16-unit viewBox drawn at 14px scales by
   0.875, so a declared 1.2 paints 1.05. 1.371 = 1.2 / 0.875 paints 1.2. */
.zf-segment__icon,
.zf-segment__icon * {
  stroke: currentColor;
  stroke-width: 1.371;
}
.zf-segment__icon { flex: none; width: 14px; height: 14px; }

/* Truncation. Figma has textTruncation DISABLED, maxWidth null and
   WIDTH_AND_HEIGHT, so a long label grows the segment and the track without
   limit — this is a deliberate divergence (§9.4). max-width on the TRACK is
   what makes the ellipsis reachable; without a constraint somewhere these
   three declarations are dead code. */
.zf-segmented { max-width: 100%; }
.zf-segment__label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ---- selected. The attribute is the hook — §8 ------------------------------ */
.zf-segment[aria-checked='true'] {
  background: var(--zf-surface-default);
  color: var(--zf-text-default);
  box-shadow: 0 1px 2px rgb(0 0 0 / .08);  /* raw: no shadow token layer, §10 defect 4 */

  /* THE §2.1 FIX. Without this the selected segment is 1.12:1 against the track
     in Light and 1.05:1 in Dark — the control's only job, done by nothing
     measurable. border/control gives 4.02 / 3.75 against the track and
     4.52 / 3.58 against the fill. The transparent border above reserves the
     1px, so turning this on shifts nothing. */
  border-color: var(--zf-border-control);
}

/* ---- hover. Directly on the button: there is no hidden input here, so the
        pointer-events trap that broke the checkbox and toggle does not apply.
        NOTE the fill change is 1.04:1 against the track (§2.2) — the colour
        change is what a user actually perceives. */
.zf-segment:hover:not(:disabled) {
  background: var(--zf-surface-hover);
  color: var(--zf-text-default);
}

/* Selected + hover renders identically to selected + default, DELIBERATELY (§2.2)
   — but this rule is REQUIRED, not documentary. `.zf-segment:hover:not(:disabled)`
   is (0,3,0) and sits after `[aria-checked='true']` at (0,2,0), so deleting this
   makes a hovered SELECTED segment paint surface/hover. Do not let a dedupe lint
   remove it. */
.zf-segment[aria-checked='true']:hover:not(:disabled) {
  background: var(--zf-surface-default);
  color: var(--zf-text-default);
}

/* ---- pressed. Figma has no such state; surface/pressed exists. §5.
   Be honest about what this buys: surface/pressed against the track is 1.06:1
   in Light and 1.21:1 in Dark — barely more than the 1.04 hover it follows.
   It is a nod to the click, not a legible state change. */
.zf-segment:active:not(:disabled):not([aria-checked='true']) {
  background: var(--zf-surface-pressed);
}

/* ---- focus. offset 0, NOT 2px. An outline extends `offset + width` outward,
        so offset:2 would reach 4px — and the inter-segment gap is 2px and the
        track padding is 2px, so the ring would paint over the neighbouring
        segment and spill outside the track's rounded edge.
        offset:0 reaches exactly 2px, which fills the track's padding and
        reproduces Figma's ring (104x32 at -2,-2 with an INSIDE stroke) exactly.
        Zero clearance is fine here because the ring's neighbours are neutral
        surfaces at 3.84-8.06:1 — unlike the pill, where the neighbour was the
        same hue as the ring. §3.4 */
.zf-segment:focus-visible {
  outline: 2px solid var(--zf-focus-ring);
  outline-offset: 0;
}

/* ---- disabled -------------------------------------------------------------- */
.zf-segment:disabled { color: var(--zf-text-disabled); cursor: not-allowed; }
.zf-segment[aria-checked='true']:disabled {
  background: var(--zf-surface-default);
  color: var(--zf-text-disabled);
}

/* ---- icon-only. Figma renders 34 x 28; the padding is what gets it there. */
.zf-segment--icon-only { padding-inline: var(--zf-space-5); gap: 0; }

@media (prefers-reduced-motion: reduce) { .zf-segment { transition: none; } }
```

**On the transparent border.** Declaring `border: 1px solid transparent` on every segment and only changing
`border-color` when selected is what makes §2.1 free: with `box-sizing: border-box` the 1px is already
inside the 28px height and inside the padding box, so switching the colour on moves nothing. Write the
border only on the selected rule and every selected segment jumps 2px.

### 9.3 React + TypeScript

```tsx
import { useRef } from 'react';

export interface SegmentOption {
  value: string;
  label: string;                    // ALWAYS required — icon-only hides it, never drops it. §9.1
  icon?: React.ReactNode;
}

export interface SegmentedProps {
  options: SegmentOption[];         // 2-4; beyond that use a select. §7
  value: string;
  onChange: (next: string) => void;
  showLabels?: boolean;             // maps to Figma's `Show label`
  disabled?: boolean;               // the whole group; see §11 decision 4
  label: string;                    // the radiogroup's accessible name
}

export function Segmented({
  options, value, onChange, showLabels = true, disabled, label,
}: SegmentedProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // The roving tab stop. If `value` matches no option — a stale value, or an
  // initial render before it is set — every button would get tabIndex -1 and the
  // group would be unreachable by keyboard. Fall back to the first option.
  const selectedIndex = options.findIndex((o) => o.value === value);
  const tabStop = selectedIndex === -1 ? 0 : selectedIndex;

  // Arrow-key navigation. A radiogroup is ONE tab stop; arrows move within it and
  // select as they go, which is the native radio behaviour role="radio" implies.
  // Home/End are optional but cheap.
  function onKeyDown(e: React.KeyboardEvent, i: number) {
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % options.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + options.length) % options.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = options.length - 1;
    if (next === -1) return;
    e.preventDefault();
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div className="zf-segmented" role="radiogroup" aria-label={label}>
      {options.map((o, i) => {
        const checked = o.value === value;
        const iconOnly = !showLabels && Boolean(o.icon);
        // A braced JSX comment is only legal in an attribute list as a spread,
        // so every note about an attribute lives out here. `tabIndex` below is
        // the roving tab stop from §9.1.
        return (
          <button
            key={o.value}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={i === tabStop ? 0 : -1}
            disabled={disabled}
            className={`zf-segment${iconOnly ? ' zf-segment--icon-only' : ''}`}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {o.icon}
            {iconOnly
              ? <span className="zf-sr-only">{o.label}</span>
              : <span className="zf-segment__label">{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
```

Four deliberate choices:

- **`label` on the option is required even when hidden.** Figma's `Show label = false` deletes the text
  node; here it moves to `.zf-sr-only`. Making it optional invites a nameless button.
- **`tabIndex` is roving off `checked`**, not `0` on every segment. Without this the group is N tab stops
  and does not behave like a radio group at all.
- **Arrows change the selection, not just the focus.** That is what native radios do and what
  `role="radio"` promises. If your product needs focus-without-select, you want `role="tablist"` with
  manual activation — which means it is probably tabs, not a segmented control (§7).
- **`disabled` is group-level only**, and `SegmentOption` has no `disabled` field on purpose. Two reasons:
  a disabled *selected* segment leaves the group with no reachable value, and the arrow-key handler above
  would happily `onChange` onto a disabled option while `focus()` silently no-ops. If you do add
  per-segment disabling, the handler has to skip those indices — and use `aria-disabled` rather than
  `disabled`, because the native attribute suppresses the `keydown` the roving tabindex depends on. §11
  decision 4.

### 9.4 What this deliberately does not copy from Figma

| Figma | §9 | Why |
|---|---|---|
| selected segment: fill + shadow only, 1.12:1 | **plus a 1px `border/control`** | 1.12 → 4.02 Light, 1.05 → 3.75 Dark. The control's only signal — §2.1 |
| icon colour: 28 per-instance overrides | `currentColor` | zero overrides, and an icon swap cannot reset it — §3.3 |
| `Show label = false` removes the text | moves it to `.zf-sr-only` | otherwise the button has no accessible name — §9.1 |
| no pressed state | `:active` → `surface/pressed` | the role already exists — §5 |
| focus ring: `INSIDE` stroke, 0px gap | `outline` + **`outline-offset: 0`** | reaches exactly 2px outward, matching Figma. `offset: 2` would reach 4px and paint over the neighbouring segment — §9.2 |
| label never truncates (`DISABLED`, `maxWidth: null`) | `max-width` on the track + ellipsis on the label | a segmented control in a constrained container must not push its own track wider — §9.2 |
| icon stroke as 14px-instance geometry | `stroke-width: 1.371` | user units in a 16-unit viewBox scale by 0.875, so 1.2 would paint 1.05 — §9.2 |
| `Content` as a track variant | no CSS modifier at all | it is which children render — §8, and the doc frame's own trap 1 |
| selected + hover identical to default | **kept identical** | deliberate, and correct — §2.2 |
| icon stroke 1.25 in the master, 1.2 in use | **1.2** | matches every real instance; the master is the outlier — §3.3 |

### 9.5 Token caveats

This file uses `--zf-<role>`; `ZF-COLORS.md` declares `--zf-color-<role>`. **Check what
`tokens/semantic.css` emits** — this applies to `--zf-space-N` and `--zf-radius-*` too. Values are
verified (`space/1`=2, `/3`=6, `/5`=10; `radius/md`=6, `lg`=8); the emitted names are a convention to
confirm.

Two tokens are not resolvable:

| Token | Status |
|---|---|
| `--zf-border-control` | the role **exists** (`neutral/1100`, created during the pill work) but nothing is bound to it yet |
| `--zf-font-family` | **not a Figma variable** — no collection holds typography. Define it, or write `Inter, sans-serif` |

No shadow token exists either; §9.2 hardcodes `rgb(0 0 0 / .08)` to match Figma.

### 9.6 Verification checklist

| Check | Expected |
|---|---|
| **The selected segment has a visible border** | a 1px `#71758F` edge. Without it the selection is 1.12:1 and, in dark mode, 1.05:1 — §2.1 |
| **Toggle to dark mode and look at it** | the selected segment is still identifiable. If it vanishes into the track, the border is missing — the shadow contributes nothing in Dark (1.07:1) |
| Selected segment does not shift when selected | the transparent border is reserved on the base rule, not added on the selected one |
| Icon colour | follows the label in every state, with **no** per-state icon rule. If it stays one colour, the exported SVG has a hardcoded `stroke` — fix the export, not the CSS |
| Swap an icon | its colour still tracks the label. In Figma this silently resets — §3.3 |
| **Icon-only segment, screen reader** | announces the label. If it announces nothing, `Show label = false` was copied literally — §9.1 |
| **Tab into the group** | **one** tab stop, landing on the selected segment. N tab stops means `tabIndex` is not roving |
| **Arrow keys** | move *and* select, wrapping at both ends |
| Hover an unselected segment | the label darkens. The fill change is real but 1.04:1 — do not rely on seeing it |
| **Hover the selected segment** | **nothing happens.** This is correct — §2.2. Do not "fix" it |
| Press and hold | `surface/pressed`. Figma has no such state |
| Focus ring | 2px, and legible against the track (3.84:1) as well as against a selected segment |
| Track and segment radii | 8 and 6. They must differ by exactly the 2px inset or the corners will not nest |
| Long label | truncates with an ellipsis; the track hugs |
| Disabled | the whole group via one prop, and the group still has a value |

---

## 10. Defects in the Figma source

| # | Severity | Defect | Fix |
|---|---|---|---|
| 1 | **Critical** | **The selection signal is 1.12:1** (`surface/default` on `surface/sunken`), and **1.05:1 in Dark**. The two supporting cues are no better: the shadow edge is 1.34 / **1.07**, the label delta 2.23 / **1.59**. A segmented control's only job is unmeasurable, and in Dark it is close to invisible — §2 | A 1px `border/control` on the selected segment: **4.02 / 3.75**. Additive, no layout change, role already exists |
| 2 | **High** | **`surface/hover` is one ramp step from the track** — `neutral/300` on `neutral/400` — so the unselected hover fill is **1.04:1** and only the label change is perceptible — §2.2 | No neutral in the ramp helps — `surface/pressed` scores 1.06 Light. Either accept that the label carries hover, or add a border on hover as well |
| 3 | **High** | **`Show label = false` leaves an icon-only segment with no accessible name.** Following Figma literally produces an unusable control — §9.1 | Code must keep the label as visually-hidden text. Add a note to the component description |
| 4 | Medium | The selected segment's `DROP_SHADOW` is **raw `#000000` @ 8%** and unbindable — and a black shadow is inert on a dark surface. It is also a *different* recipe from the wizard card's `#181C2E` @ 6% | Create a shadow token tier, and make it mode-aware |
| 5 | Medium | **`zf-segmented`'s description is wrong.** It says *"Segments = 2 \| 3 \| 4"*, but the axis is `Content` and **every variant has exactly 2 segments** — there is no 3- or 4-segment specimen | Rewrite the description to match the axis; add 3- and 4-segment specimens |
| 6 | Medium | **The icon needs 28 hand-maintained overrides** (2 per instance × 14) because the masters are on `icon/default` at 1.25 and every use needs `text/*` at 1.2. The doc frame records a swap silently resetting them — §3.3 | Unavoidable in Figma; in code use `currentColor`. Consider an `icon/inherit` convention |
| 7 | Medium | **No `pressed` state**, though `surface/pressed` exists — for a control that exists to be clicked — §5 | Add `State=pressed`, or accept that CSS `:active` covers it |
| 8 | Low | **Icon master / instance mismatch:** masters are stroked **1.25**, every instance **1.2**. Anyone instancing these icons elsewhere gets the heavier weight | Set the masters to 1.2, or add a 14px icon tier |
| 9 | Low | The two glyphs do not share an optical box — `card-view` is 11 × 11, `list-view` is 11 × 8 | Normalise the ink box, or accept it |
| 10 | Low | Layer naming is inconsistent — the selected nested instance is `segment · selected`, the other is `segment` | One convention |
| 11 | Low | **`text/disabled` at 1.89:1** on the track. Exempt, but below readable for 12px type — §4.3 | Semantic-layer move, shared with the pill |

**Mechanical, no decision:** 8, 10, and the description half of 5.
**Need a decision:** 1, 2, 3, 4, 6, 7, 9, 11, and the specimens half of 5.
**The ones that matter:** 1 (the component's entire purpose, and it fails hardest in Dark), 3 (an unusable
control if Figma is followed literally), and **the doc frame's own 2.1.1 row** (§10.1) — it claims keyboard
navigation comes free from native radio semantics, and it does not.

Defect 5 splits: rewriting a wrong description is mechanical; adding 3- and 4-segment specimens is a
decision about what this product ships (§11 decision 7). Defects **6** (28 icon overrides) and **9**
(mismatched optical boxes) carry no §11 row because neither has a Figma-side fix worth debating — §9.2
removes 6 entirely with `currentColor`, and 9 is a note for whoever next touches the icon set.

### 10.1 The doc frame, checked row by row

`31:19020` is **the most accurate doc frame in this file** — six sections, and its §06 "Traps worth
recording" is a genre no other component has: things that look like mistakes and are not. It is not
flawless, though; one row is wrong and two are too cautious.

**Right, and exact:**

| Doc frame says | Verdict |
|---|---|
| §05: "Non-text contrast 1.4.11 — **FAILS** — Selected surface vs track is 1.12:1" | ✓ exact, and it names the right pair |
| §06 trap 3: "Same root cause as `border/default` at 1.31:1 across seven components" | ✓ correct, and the cross-component count is right — this is the eighth |
| §06 trap 4: selected + hover is inert *by design*, because "a selected segment is not a target" | ✓ **a better argument than the one I made about the pill** — §2.2 |
| §06 trap 5: the ring is "flush with the track… nothing clips, but there is no outer gap either" | ✓ exact — 104 × 32 at (−2,−2), `INSIDE`, `clipsContent: false` |
| §06 trap 1: `Content` is an axis on the track and a property on the segment, deliberately | ✓ and the reasoning holds — §8 |
| §06 trap 2: an icon swap drops the state stroke override | ✓ the mechanism is real. **I re-checked all six nested instances and they are currently correct**, so this is a closed fix rather than an open defect |
| §02: icon weight `1.5px → 1.2px`, `1 : 7.3 → 1 : 9.2` | ✓ both ratios check out (though the masters still say 1.25 — defect 8) |
| §03: "tinting the selected segment blue would make it compete with the primary action on the page" | ✓ and it is why §2.1 recommends a border rather than a `primary/*` fill |

**Wrong:**

| §05 says | Measured |
|---|---|
| "Keyboard operation 2.1.1 — **PASSES** — Native radio semantics give arrow-key navigation" | **there are no native radios in this component.** Both sets are frames; the description specifies `role="radiogroup"`, which is ARIA, and ARIA gives you nothing for free. Arrow keys and roving tabindex have to be implemented — §8 chooses that build precisely because they are not free. This is the frame's one incorrect claim, and it is the kind that gets a keyboard trap shipped |

**Too cautious rather than wrong:**

| | |
|---|---|
| §05: "Target size 2.5.8 — **REVIEW** — 28px tall, above 24 but tight" | 34 × 28 clears 24 × 24 in both dimensions in every configuration. This is a **pass**; "tight" is a fair design note — §3.5 |
| §05: "Colour independence 1.4.1 — **PASSES** — elevation and colour reinforce it" | `aria-checked` carries it for assistive tech, so the letter is met. But the visual reinforcement is 1.12 / 1.34 in Light and 1.05 / 1.07 in Dark — thin, then effectively absent |

### 10.2 And two things it does not cover

- **Dark mode.** Not mentioned in any of the six sections. It is where every finding in §2 gets worse, and
  where the shadow — half of the stated selection mechanism — stops existing.
- **Disabled contrast.** §05 has no row for it; it is 1.89:1 (§4.3).

---

## 11. Open decisions

| # | Question | Blocks |
|---|---|---|
| 1 | **Add a 1px `border/control` to the selected segment?** 1.12 → 4.02 Light, 1.05 → 3.75 Dark. Additive and layout-free, but it changes a deliberately borderless design — and the doc frame's §03 rationale for neutrality should be weighed | defect 1 |
| 2 | **Is `surface/hover` at 1.04:1 against the track acceptable**, given the label carries the change? `surface/pressed` as the hover fill is **1.06** Light / 1.21 Dark — *worse* than the 1.04 it replaces in Light | defect 2 |
| 3 | Move `text/disabled` off `neutral/900`? Even `neutral/1100` only reaches 4.02 / 3.75, and it touches every component | defect 11, shared with the pill |
| 4 | **Should a single segment be disable-able at all?** A disabled *selected* segment leaves the group with no reachable value; group-level disabling is the sane default | defect 3 |
| 5 | Add a `pressed` state to the Figma matrix, or leave `:active` to CSS? | defect 7 |
| 6 | Create a **mode-aware shadow token tier**? Four components now hardcode effects, and two use different recipes | defect 4 |
| 7 | Add 3- and 4-segment specimens, and fix the description? | defect 5 |

Decisions 1, 3 and 6 are system-level. **Decision 1 is the one to take** — it is the only defect here that
touches what the component is for, the role already exists, and this is now the eighth component waiting
on it.

---

**A correction to `ZF-WIZARD.md`.** That file's §4.3 and defect 4 say the `tabs` strip was bound to the
primitive `neutral/100` because *"there is no `surface/subtle` or `surface/sunken` for a recessed
container."* **That is wrong: `surface/sunken` exists** — `neutral/400` Light / `neutral/2100` Dark — and it
is exactly what this component's track uses. The wizard's tabs strip should bind to it, which also fixes
that file's dark-mode break without needing a new role. `ZF Semantic` has a full surface family:
`canvas`, `default`, `raised`, `sunken`, `hover`, `selected`, `pressed`, `disabled`, `inverse`,
`inverse-hover`. I checked for the wrong name and reported absence.

---

**Provenance.** Measured in `Tin Tin` (`zZtArxOeRCjd7pKE25HQVS`), page `Segmentation tab` (`31:18754`),
sets `zf-segment` (`31:18821`) and `zf-segmented` (`31:18861`), on 2026-08-24 via the Figma Plugin API.
Enumerated: all 11 variants and every descendant — geometry, position, auto-layout mode / alignment /
padding / gap, sizing mode, radius, `clipsContent`, fills and strokes with per-paint visibility and
opacity, stroke weight / alignment / cap, effects with offset and alpha, layout positioning, constraints,
text size / line height / weight / style / truncation / `maxWidth` / `textAutoResize`, and
**`componentPropertyReferences` read as values rather than keys** — which is how the 32-of-32 result in
§2.3 was established; a key-only read cannot distinguish present from wired. Every paint resolved by
variable ID through both Light and Dark modes to its terminal primitive hex; contrast computed from those
resolved values against 1.4.3 (4.5:1 — 12px Medium is normal text) and 1.4.11 (3:1, per boundary,
including the focus ring against all three of its neighbours). The 8% shadow was **composited over each
mode's actual track colour** rather than assumed, which is what produced the 1.34 / 1.07 figures. The
`ZF Semantic` surface and text families were enumerated in full, which is how the `ZF-WIZARD.md` correction
above was found. Icon masters and all 14 icon instances were read for stroke weight and bound role, which
is how the 1.25-vs-1.2 mismatch and the currently-correct state of the doc frame's trap 2 were established.
Instance count from a full walk of all 28 pages. Both sets exported at 3× and inspected.

**Read from the doc frame rather than measured:** its dimensions, its 6 section titles, and every quotation
in §2, §3.3, §3.4, §8 and §10.1. I verified the *claims* those sections make against the current
component; I did not re-derive the history they describe (the earlier 35 / 31.39px heights, the 1.5px icon
stroke, the "Frame 1 was white" hard-coded selection).

**Not measured:** whether `--zf-font-family` or a shadow token exist in the CSS layer — both are absent
from all five variable collections. Containment of the 23 instances inside the doc frame was not checked,
only that all 23 are on the `Segmentation tab` page. 1.4.11's *applicability* to a surface-to-surface
boundary inside a control is argued, not measured; for the selection boundary the argument is as strong as
it gets, since that boundary is the component's only output.

**Companion files:** `ZF-DESIGN-CANNON.md` §2.11, `ZF-PILL.md` (where `border/control` was created; the
zero-to-many sibling — §7), `ZF-WIZARD.md` (the `surface/sunken` correction above), `ZF-TOGGLE.md`,
`ZF-CHECKBOX.md` (the hidden-input hover trap §8 avoids), `ZF-ICONS.md`, `ZF-COLORS.md`, `ZF-SCALES.md`.
