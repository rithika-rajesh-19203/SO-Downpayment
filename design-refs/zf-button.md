# ZF Design Cannon — Button family

**Canon:** §2.7 · **Figma:** `Tin Tin` — page `Buttons` (`23:10416`) · **CSS class:** `.zf-btn`
**Measured 2026-08-20.**

Four component sets, **208 variants**, every matrix complete. This is the most thoroughly built part
of the system and the only part with no missing variants — and it still fails **three** success
criteria (1.4.3, 1.4.1, 1.4.11), carries a dead component property, renders a chevron as a white
square, and has a role-binding mistake that a value-based audit cannot see.

| Set | Node | Variants | Matrix |
|---|---|---|---|
| `Button` | `23:10457` | **96** | `Intent` (4) × `Type` (2) × `State` (4) × `Size` (3) |
| `Button Icons` | `23:10866` | **96** | same four axes |
| `Hyperlink` | `23:11086` | **8** | `State` (4) × `Color` (**1**) × `Size` (2) |
| `Split Button` | `23:11121` | **8** | `State` (4) × `Type` (2) |

---

## 1. What the canon claims, and what is actually there

§2.7 records a large repair pass. Verified against the file, **most of it landed**:

| Canon says | Measured | |
|---|---|---|
| `Accent Color` renamed to `Intent`, values `default · success · warning · danger` | exactly that, on both 96-variant sets | ✓ |
| All four sets expose `State` = `Default · Hover · Focus · Disabled` | all four do | ✓ |
| Icons are local `icon / *`, not the external library | `icon / upload` ×288, `icon / arrow-right` ×16, `icon / chevron` ×8 nested in `Split Button` = **312**, zero remote | ✓ |
| 367 legacy-library paints re-pointed, zero legacy bindings remain | zero remote colour bindings on the page | ✓ |
| Focus ring: radius 8, `ABSOLUTE`, bound to `focus/ring` | 24/24 on `Button`, 2/2 on `Split Button` | ✓ |
| Text styles applied | 96/96 `Button`, 8/8 `Hyperlink`, 8/8 `Split Button` — but at **13/21** and **12/19**, which are off the 13/20 · 12/16 scale (defect 20) | ⚠️ |
| Geometry 32/30/28, padding 12/8/6, radius 6 | exactly, on all 96 | ✓ |
| Icon glyphs stroked and inheriting the label's paint | 192/192 stroked, bound to the matching `on-*` or `text/*` role | ✓ |
| **"Four raw values remain unbound"** — `#31384D`, `#929BB8`, `#202432`, `#FAFAFF` | **none of the four remain.** Zero raw paints anywhere on the page | ⚠️ canon stale |
| **"Secondary Focus has its own fill for no reason"** (`#FAFAFF`) | fixed — Focus now shares `neutral/100` with Default | ⚠️ canon stale |
| Both icons default to `true` | still `true` | ✗ open |
| `Hyperlink` `Color` axis has one value | still one value, `Primary` | ✗ open |
| No pressed state anywhere | still none | ✗ open |
| Hover carries four stacked shadows | 24 variants × 4 effects, in both big sets | ✗ open |

So the canon's §2.7.5 should be corrected: the four raw values it lists as outstanding have all been
bound. Everything else it flags as open, is open.

### 1.1 Three of the four sets are used nowhere

**127 instances exist, and every one of them is `Button`.** `Button Icons`, `Hyperlink` and
`Split Button` have **zero instances** across all 28 pages. 112 of the 208 variants — 54% — have never
been placed.

That is not automatically wrong for a library, but it means `Button Icons`' dead `Label` property
(§3.1) and `Hyperlink`'s missing underline (§7) have never been caught by use.

---

## 2. Geometry — measured

| Property | Large | Medium | Small |
|---|---|---|---|
| Height | **32** | **30** | **28** |
| Padding — horizontal | 12 | 8 | 6 |
| Padding — vertical | **10** on all three | 10 | 10 |
| Gap | 10 | 10 | **6** |
| Corner radius | **6** on all 96 | 6 | 6 |
| Label | 13 / 21 | 13 / 21 | **12 / 19** |
| Icon frame | 13 × 13 | 12 × 12 | 11 × 11 |

**Vertical padding is inert.** Height is fixed and the label's line box is 21px, so 10 + 21 + 10 = 41
against a declared 32. Auto-layout drops it. This is the same defect measured on the status badge
(§2.1) and the tab items — a declared value that cannot take effect, which is why nobody notices it is
wrong.

**The size ramp does its work horizontally.** 32 → 28 is a 12.5% height change; 12 → 6 is a 50%
padding change. Two buttons of different `Size` sitting in a row are told apart by width, not height.

**Radius 6 matches the input field**, which after the input-field pass is now two components agreeing
— the only radius agreement in the system. The checkbox is 2, the badge 4, the radio and toggle fully
round.

**Target size passes.** All three heights clear the 24 × 24 minimum in WCAG 2.5.8 — 28px at the
smallest — as does the input field at 34px. The radio and the checkbox are both 12 × 12 and both fail.

---

## 3. Properties

| Set | Properties |
|---|---|
| `Button` | `Label` TEXT · `Icon Left` BOOL **`true`** · `Icon Left Swap` · `Icon Right` BOOL **`true`** · `Icon Right Swap` |
| `Button Icons` | `Label` TEXT — **dead, see §3.1** · `Icon` INSTANCE_SWAP |
| `Hyperlink` | `Link Label` TEXT · `Icon Left` BOOL `false` · `Icon Right` BOOL `false` · two swaps |
| `Split Button` | `Upload Label` TEXT · `Dropdown Icon` INSTANCE_SWAP |

**Both `Button` icon booleans default to `true`.** A freshly placed Button arrives with two upload
icons flanking the label. The common case is no icon, and the same defect was just fixed on the input
field by flipping the defaults. `Hyperlink` already has them `false`, so the two sets disagree.

### 3.1 `Button Icons` has a `Label` property and nowhere to put it

`Button Icons` declares `Label#55:0`, type TEXT, default `"Button"`. The set contains **zero text
nodes** — 0 across all 96 variants. So the property appears in the panel, a consumer types into it,
and nothing happens.

This is the third instance of the same defect class in this system: the status badge's two `Accepted`
variants, the input field's four error variants, and now this. In the first two cases the property
reference was missing from a node that existed; here the node itself does not exist. The symptom is
identical — a control that silently does nothing.

Either delete the property, or give the set an optional label and stop calling it an icon-only button.

### 3.2 Stray geometry in `Button Icons`

Two kinds of residue across 5 variants, all invisible, all found by counting rather than looking:

| What | Where | |
|---|---|---|
| A second ring — `Rectangle 47`, 36 × 36, radius 8, `ABSOLUTE`, **no stroke at all** — behind the real `Rectangle 48` | `Type=Primary, State=Focus` on `Large/success`, `Large/warning`, `Large/danger` and **`Small/default`** | 4 variants |
| A box stroke bound to `color/blue/1200` where the other **47** Primary variants have none | `Type=Primary, State=Default, Size=Large, Intent=default` | 1 variant |

The set reports **27 rectangles for 24 focus variants** and exactly 23 carry `focus/ring`, so
27 − 23 = the 4 strokeless duplicates and the arithmetic closes. That count is how they were found — a
strokeless rectangle is invisible, as is a blue border on a blue button. Both are residue from an edit
applied to some variants and not others, and note the fourth duplicate sits on a different `Size` from
the other three, so a spot-check of the Large row would have missed it.

---

## 4. The Intent axis binds to the wrong kind of role

The canon's §2.7.5 records that 87 paints were moved "to semantic roles **where exactly one role held
the value**". That is binding by *value*, and it produced bindings that are correct in colour and
wrong in meaning.

| What it is | Bound to | What that role means |
|---|---|---|
| `Intent=default, Primary, Hover` **fill** | **`primary/text`** | text drawn in the primary colour |
| `Intent=default, Primary, Disabled` **fill** | **`primary/border`** | the border of a primary element |
| `Intent=success, Primary, Disabled` **fill** | **`success/border`** | ditto |
| `Intent=danger, Primary, Disabled` **fill** | **`danger/border`** | ditto |
| `Hyperlink, Hover` label | `primary/text` | ✓ correct — it *is* text |

A `*/border` role used as a fill and a `*/text` role used as a fill will both survive a theme change
looking plausible, and both will break the moment someone retunes borders or text independently of
surfaces — which is the entire reason the semantic layer exists.

**The rule needs a second half.** §3 of the canon says *bind to the role, not to the nearest step*.
The measurement here says it must also say: **bind to the role that means the right thing, not the
role that happens to hold the value.** A value match is necessary and not sufficient.

The intents are also inconsistent about it: `warning`'s hover and disabled fills stay on primitives
(`color/orange/1400`, `color/orange/800`) while `success` and `danger` moved onto border roles. Same
ladder, three different answers.

### 4.1 The ladder itself

| State | Fill | Bound to |
|---|---|---|
| Default | `{hue}/1200` | primitive, all four intents |
| Hover | `{hue}/1400` | `primary/text` (blue) · primitive (green, orange, red) |
| Focus | `{hue}/1200` — same as Default, plus a ring | primitive |
| Disabled | `{hue}/800` | `*/border` (blue, green, red) · primitive (orange) |

Labels and icon glyphs are correct throughout: `primary/on-primary`, `success/on-success`,
`warning/on-warning`, `danger/on-danger` on Primary; `text/default` on Secondary; `text/disabled` when
disabled. 96/96 labels and 192/192 glyphs.

---

## 5. Two Primary intents fail contrast

White label on the resting fill, against the 4.5:1 that WCAG 1.4.3 requires for 13px text:

| Intent | Default fill | Ratio | |
|---|---|---|---|
| **`success`** | `green/1200` `#259669` | **3.72** | ✗ **fails** |
| **`default`** | `blue/1200` `#3874EB` | **4.32** | ✗ **fails** |
| `warning` | `orange/1200` `#B25F17` | 4.62 | ✓ |
| `danger` | `red/1200` `#C9474F` | 4.67 | ✓ |

And the same buttons on **hover**:

| Intent | Hover fill | Ratio | |
|---|---|---|---|
| `success` | `green/1400` `#127A51` | 5.35 | ✓ |
| `default` | `blue/1400` `#1C5BD9` | 5.92 | ✓ |
| `warning` | `orange/1400` `#964600` | 6.62 | ✓ |
| `danger` | `red/1400` `#B22D36` | 6.32 | ✓ |

**Every hover state passes and two resting states fail.** The button is legible only while the pointer
is on it — which is backwards, and it means the failure is invisible in any review conducted by
hovering over things.

### 5.1 The fix is one step, and it is the same step the canon already proposed

Walking each hue to find the first step that holds white at 4.5:1:

| Hue | 1100 | 1200 | **1300** | 1400 | First pass |
|---|---|---|---|---|---|
| blue | 3.93 | 4.32 | **5.48** | 5.92 | `blue/1300` |
| green | 3.10 | 3.72 | **4.56** | 5.35 | `green/1300` |
| orange | 3.99 | **4.62** | 6.07 | 6.62 | `orange/1200` |
| red | 4.15 | **4.67** | 6.09 | 6.32 | `red/1200` |

Moving the Default fill from `/1200` to `/1300` puts all four intents above 4.5 — and it is exactly
the shift §2.7.6 of the canon proposes for a different reason, to let the buttons bind to
`success/default`, `warning/default` and `danger/default`. **One change satisfies both goals**, which
makes it considerably easier to justify than the canon's version, which framed it as a cosmetic
alignment.

### 5.2 …except `primary/default` cannot carry white text

Here is the catch, and it is a foundations problem rather than a button one.

| Role | Light | White on it | |
|---|---|---|---|
| `success/default` | `green/1300` `#068754` | 4.56 | ✓ |
| `warning/default` | `orange/1300` `#9E4B03` | 6.07 | ✓ |
| `danger/default` | `red/1300` `#B2343C` | 6.09 | ✓ |
| **`primary/default`** | **`blue/1200` `#3874EB`** | **4.32** | ✗ |

`primary/on-primary` is white. So the pair **`primary/default` + `primary/on-primary` fails 1.4.3 by
construction, at 4.32:1** — not just in the button, but anywhere in the system that puts on-primary
text on a primary surface. Three of the four status families are built to clear the threshold and the
primary family is not.

`primary/default` wants to move to `blue/1300` `#2762D9` (5.48:1). Two things make that less simple
than it looks.

**It has fewer consumers than you would guess.** No other `ZF Semantic` role aliases `primary/default`.
`focus/ring` and `chart/1` are *siblings* — separately bound to `color/blue/1200` — not consumers, so
moving `primary/default` leaves both where they are. The radio's selected border is a **remote paint
style outside ZF** (`ZF-RADIO.md` §6) and would not move either. The only measured consumer is the
input field's hover / on-click border.

**It collides on arrival.** `primary/hover` and `primary/selected` are *already* `blue/1300`
`#2762D9` — `ZF-COLORS.md` records that pair as an existing value collision. Moving `primary/default`
there makes default, hover and selected identical, so a primary button would stop responding visibly
to hover. So this is a **ladder shift, not a single edit**: default → `blue/1300`, hover →
`blue/1400`, selected → `blue/1400` or `1500`. That is the real shape of decision 2.

### 5.3 Secondary and disabled

| | Value | Ratio | |
|---|---|---|---|
| Secondary label on the resting fill | `text/default` `#222536` on `#FAFAFC` | **14.54** | ✓ |
| Secondary label on the hover fill | on `#F7F8FC` | 14.28 | ✓ |
| Secondary disabled label | `text/disabled` `#AEB1C2` on `#FAFAFC` | 2.04 | exempt — 1.4.3 excludes inactive controls |
| Primary disabled, white on `{hue}/800` | 1.42 – 1.75 | | exempt, but see below |

Secondary is comfortable. **Primary disabled is white text on a pale tint** — `green/800` at 1.42:1 is
the worst. WCAG exempts inactive controls so this is not a violation, but 1.42:1 is close enough to
invisible that the label is effectively gone. The canon's §2.7.5 notes the *old* disabled label
`#929BB8` was darker than the `text/disabled` role that replaced it; the same trade happened here and
it made things dimmer.

### 5.4 No border in the system reaches 3:1, so Secondary's does not either

| Secondary border | Value | Ratio | |
|---|---|---|---|
| Default / Focus | `border/default` `#DFE0EB` | **1.31** | ✗ 1.4.11 |
| Hover | `color/neutral/700` `#CED0DE` | 1.53 | ✗ |
| Disabled | `color/neutral/300` `#F5F6FC` | 1.08 | exempt |

This is the finding recorded in `ZF-INPUT-FIELD.md` §4.2 showing up a third time: the whole `border/*`
ramp tops out at 2.85:1 (`border/hover`, `neutral/1000`), so **no border role in the system can satisfy
1.4.11.** The input field, the radio and now Secondary buttons all fail for the same reason. The
proposed `border/control` at `neutral/1100` (4.52:1) would fix all three at once.

Secondary is the mildest case of the three, because the button also has a fill — `#FAFAFC` against a
white page is 1.04:1, so the fill contributes nothing, and the border is doing all the work of saying
"this is a control."

---

## 6. The focus ring — the best one in the system, with one blind spot

| Property | Value |
|---|---|
| Node | `Rectangle 47` / `Rectangle 48` |
| Geometry | button + 4px, offset −2px |
| Radius | **8** = button radius 6 + 2px offset, so it is genuinely concentric |
| Positioning | **`ABSOLUTE`** — never participates in layout, never clipped |
| Colour | **`focus/ring`** on 24/24 `Button` and 2/2 `Split Button` |
| Stroke | 1px |

Three things it gets right that no other ring in the system does: it is absolute, its radius is
derived from the shape it surrounds, and it is the same colour on all four intents — a focus ring
means "this has keyboard focus" and should not change meaning with hue.

**Against the page it reads at 4.32:1.** Against its own button it does not:

| Ring against | Ratio |
|---|---|
| the white page | **4.32** ✓ |
| the blue Primary button | **1.00** — identical colour |
| the green button | 1.16 |
| the orange button | 1.07 |
| the red button | 1.08 |

For a filled Primary button the ring is separated from the fill only by the 2px transparent gap. That
is defensible — the ring reads against the page, which is what 1.4.11 measures — but on the blue
button the ring and the fill are literally the same colour, so the indicator is a 2px white gap rather
than a blue line. The robust version gives the ring a white inner stroke of its own so it reads against
both.

Two smaller gaps: the stroke is **1px** where the radio, checkbox and toggle are all being standardised
to 2px, and `Hyperlink`'s ring is built differently from the other three sets (§7).

**The "bound to `focus/ring`" verification is 24/24 on `Button` and 2/2 on `Split Button` only.** Across
all four sets there are **55 ring rectangles**, of which 52 carry a stroke and **49 are on the role** —
`Button Icons` has 4 strokeless duplicates (§3.2) and `Hyperlink`'s 2 are bound to a primitive (§7). The
family is not uniform on this; two of the four sets are.

---

## 7. `Hyperlink` — a link identified by colour alone

8 variants. No fill, no stroke, no padding, radius 0, gap 4, heights 21 / 19.

| State | Colour | Bound to | Ratio vs white | |
|---|---|---|---|---|
| Default | `#3874EB` | **`color/blue/1200`** — primitive | **4.32** | ✗ fails 4.5 |
| Hover | `#1C5BD9` | `primary/text` ✓ | 5.92 | ✓ |
| Focus | `#3874EB` | primitive | 4.32 | ✗ |
| Disabled | `#9598AB` | `color/neutral/1000` — primitive | 2.85 | exempt |

**`textDecoration` is `NONE` on all 8 variants.** So a link in body copy is distinguished from the text
around it by colour only. Against `text/default` `#222536` the link reads at **3.51:1**, which clears
the 3:1 that WCAG technique F73 asks for — but F73 requires 3:1 **and** a non-colour cue on hover and
focus. There is no underline in any state, so the second half is unmet: **1.4.1 Use of Colour is not
satisfied.**

The fix is one line of CSS and one property in Figma: underline the link, or at minimum underline it on
hover and focus.

Three more, all smaller:

- **`Color` is a dead axis** — one value, `Primary`. A dropdown a consumer cannot change. Removing it
  is a breaking API change, which is why the canon left it; it should still go.
- **The focus ring is inconsistent with the rest of the family** — radius **3** (against 8 elsewhere)
  and bound to the **primitive** `color/blue/1200` rather than `focus/ring`. `Button Icons` also has 4
  rings off the role, though those are strokeless rather than mis-bound (§3.2).
- **Both icon slots are always present in the layer tree** (`icon / arrow-right` ×16, two per variant),
  correctly defaulted to `false`.

---

## 8. `Split Button` — the chevron is a white square

8 variants, `State` × `Type`. **One size only** — height 32, no `Size` axis, so it cannot sit beside a
Medium or Small Button.

Anatomy, measured: the label, then a 20 × 32 `Frame 19` holding a `LINE` divider (32 long, rotated 90°,
1px) and a 12 × 12 `icon / chevron` instance. So the asymmetric padding **is** making room for the
divider and chevron — verified, not assumed.

| | |
|---|---|
| Padding | **16 left / 8 right** — asymmetric, and different from Button's 12/12 |
| Gap | **16** — against Button's 10 |
| Radius | 6 ✓ |
| Divider | `LINE`, 1px, `primary/on-primary` on Primary and `border/default` on Secondary ✓ |
| Focus ring | radius 8, `ABSOLUTE`, `focus/ring` ✓ |
| Label | `primary/on-primary` / `text/default` / `text/disabled` ✓, at 13/21 — off-scale, defect 20 |
| Fills | `color/blue/1200` and `color/neutral/100` primitives; `primary/text` and `primary/border` as fills — the §4 misuse again |

### 8.1 All four Primary variants render a white block instead of a chevron

Every one of the 8 `icon / chevron` instances carries a **visible white fill at opacity 1** on the
instance frame. The master has `fills: []` — no fill at all — so this is a stale instance override
adding a 12 × 12 white square on top of the glyph.

On the four **Secondary** variants the square is white on `neutral/100`, so it is invisible and the
chevron reads normally. On the four **Primary** variants it is white on blue, and it covers the white
glyph completely: **the dropdown affordance is a solid white square.** Confirmed by rendering the set,
not inferred.

The inner `path` vector is bound correctly throughout — `primary/on-primary` on Primary,
`text/default` on Secondary, `text/disabled` when disabled. The glyph is right; the square on top of it
is not. Clearing the instance fill on all 8 fixes it.

This is the one defect in the family that a user would notice immediately, and it survived because
`Split Button` has **zero instances** anywhere in the file (§1.1) — nothing in the product renders it.

### 8.2 The shadow is on one Hover variant of two

`State=Hover, Type=Secondary` carries the four stacked drop shadows; `State=Hover, Type=Primary`
carries none. The same non-uniform edit pattern as §3.2.

---

## 9. Defects — ranked

| # | Severity | Defect | Scope | Fix |
|---|---|---|---|---|
| 1 | **Critical** | `success` Primary is **3.72:1** and `default` Primary is **4.32:1** with a white label — both fail 1.4.3 | **12 variants** in `Button` (2 intents × Default+Focus × 3 sizes); `Button Icons` has no label so cannot fail. The *fix* touches 48 | Move the Default fill `{hue}/1200` → `/1300`; §5.1 |
| 2 | **Critical** | **`primary/default` + `primary/on-primary` fail by construction at 4.32:1**, system-wide, not just here | `ZF Semantic` | Move `primary/default` to `blue/1300` (5.48:1); §5.2 |
| 3 | **High** | `Hyperlink` has **no underline in any state** — a link identified by colour alone, so 1.4.1 is unmet | all 8 | Underline, at minimum on hover and focus |
| 4 | **High** | `Button Icons` declares a `Label` TEXT property and contains **zero text nodes** — the property silently does nothing | set `23:10866` | Delete the property, or add the label |
| 5 | **High** | Secondary's border is **1.31:1**, failing 1.4.11 — the third component to hit this; no `border/*` role reaches 3:1 | 48 variants | `border/control` at `neutral/1100`; §5.4 |
| 6 | Medium | `*/border` and `*/text` roles used as **fills** — correct value, wrong meaning | **26 fills** — 12 in `Button`, 12 in `Button Icons`, 2 in `Split Button` | Rebind by meaning; §4 |
| 7 | Medium | Both `Button` icon booleans default to **`true`**, so a fresh button arrives with two icons. `Hyperlink` defaults to `false` — the two disagree | set `23:10457` | Default to `false`, as the input field now does |
| 8 | Medium | **No pressed / active state** in any of the four sets — on the one control where a press is the whole point | all four | Add `State=Active`; `:active` is free in CSS |
| 9 | Medium | Hover carries **four stacked `DROP_SHADOW` effects** and there is no elevation scale in §1 to source them from. Also non-uniform: only 1 of `Split Button`'s 2 Hover variants has them (§8.2) | **49 variants** across three sets | One shadow, and a token layer for it |
| 10 | Medium | `Hyperlink`'s focus ring is radius **3** and bound to the **primitive** `blue/1200`, unlike the other three sets | 2 variants | Radius 8, bind `focus/ring` |
| 11 | Medium | `Split Button` has no `Size` axis, and its padding 16/8 and gap 16 do not match Button's 12/12 and 10 | set `23:11121` | Reconcile, or document why it differs |
| 12 | Low | Three `Button Icons` Focus variants carry a **duplicate strokeless ring**; one carries a stray blue box border | 4 variants | Delete; §3.2 |
| 13 | Low | Vertical padding 10 is **inert** — 10 + 21 + 10 = 41 inside a fixed 32 on Large/Medium, and 10 + 19 + 10 = 39 inside 28 on Small | **200 variants** — `Button` 96, `Button Icons` 96, `Split Button` 8; only `Hyperlink` is 0/0 | Set to 0 or make the height hug |
| 14 | Low | `Hyperlink`'s `Color` axis has **one value** | set `23:11086` | Remove — breaking, so schedule it |
| 15 | Low | Primary disabled is white on `{hue}/800`, **1.42 – 1.75:1**. Exempt, but effectively illegible | 24 variants | Decide whether disabled should be readable |
| 16 | Low | The focus ring is **1px** where the radio, checkbox and toggle are moving to 2px | **55 ring rectangles** across the four sets, 52 of them stroked | 2px |
| 17 | Low | On the blue Primary button the ring is the **same colour as the fill** (1.00:1), separated only by the gap | 6 variants | White inner stroke on the ring |
| 18 | Low | **112 of 208 variants have never been instanced** — all of `Button Icons`, `Hyperlink`, `Split Button` | 3 sets | Not a defect; explains why 3, 4, 10, 11, 14 and 19 went unnoticed |
| 19 | **High** | **All four Primary `Split Button` variants render a white square instead of a chevron** — a stale white instance fill covering the glyph | 8 instances, 4 visibly broken | Clear the instance fill; §8.1 |
| 20 | Medium | Labels are **13/21** and **12/19**, which are not on the type scale — `zf/body` is 13/**20** and `zf/body-sm` is 12/**16** | 96 + 8 + 8 labels | Restyle to the scale, or record 21/19 as declared exceptions |

Defects 6, 7, 10, 12, 13 and **19** are mechanical. **1, 2, 3, 5 and 19** are the ones that matter —
19 because it is the only one a user would see today.

---

## 10. Divergences

### 10.1 From canon §2.7

| Canon says | Actually |
|---|---|
| "Four raw values remain unbound" — `#31384D` ×108, `#929BB8` ×51, `#202432` ×45, `#FAFAFF` ×12 | **all four are bound**; zero raw paints on the page |
| "Secondary Focus has its own fill for no reason" (`#FAFAFF`) | resolved — Focus shares `neutral/100` with Default |
| "Icon glyphs at `#31384D` are the real outlier… 108 paints" | resolved — glyphs are stroked and bound to the label's role |
| §2.7.6: shifting the ladder to `/1300` is "a visible change to 72 variants, so it is yours to call" | true, **and it is also the fix for two 1.4.3 failures** — the case is much stronger than a cosmetic alignment |
| §2.7.6 implies binding to `*/default` roles resolves the intents | three of four; **`primary/default` itself fails white text at 4.32:1** |
| §2.7.3 "Label is white throughout, bound to `color/base/white`" | bound to the four `*/on-*` roles, which is better |
| §2.7.5 "87 paints to semantic roles where exactly one role held the value" | accurate, and that method is what produced the `*/border`-as-fill problem in §4 |

The canon is broadly reliable here — unlike §2.1 and §2.2, where a migration was recorded as done and
had not happened. The staleness runs the *other* way: work was completed after the canon was written.

### 10.2 The Figma documentation frame

`29:14065`, **1680 × 11,025** with 14 content sections including "Palette provenance", "Icons",
"Cross-component drift — a fifth blue" and "Issues in the Figma source". By far the most complete doc
frame in the file.

Not audited line by line in this pass. Given that the badge's, radio's and icons' frames were all
stale, and that this one predates the raw-value bindings described in §10.1, **assume it is stale on
those four values** and regenerate it alongside defects 1 and 2.

---

## 11. Code

A button is a `<button>`, so `State` maps entirely onto native pseudo-classes and no state classes are
invented — the same conclusion as the radio and the input field.

| Figma | Selector |
|---|---|
| `State=Default` | `.zf-btn` |
| `State=Hover` | `:hover` |
| `State=Focus` | `:focus-visible` |
| `State=Disabled` | `:disabled` |
| *(missing)* | `:active` — defect 8 |
| `Type` | `.zf-btn--primary` / `--secondary` |
| `Size` | `.zf-btn--lg` / `--md` / `--sm` |
| `Intent` | `.zf-btn--success` / `--warning` / `--danger`; `default` inherits the theme |

```css
.zf-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--zf-space-5);                     /* 10px */
  height: 32px;
  padding: 0 var(--zf-space-6);               /* 12px — vertical padding is inert, §2 */
  border: 1px solid transparent;
  border-radius: var(--zf-radius-md);         /* 6px */
  font: var(--zf-text-body-size)/var(--zf-text-body-line) var(--zf-font-family);
  cursor: pointer;
}
.zf-btn--md { height: 30px; padding: 0 var(--zf-space-4); }
.zf-btn--sm { height: 28px; padding: 0 var(--zf-space-3); gap: var(--zf-space-3);
              font-size: var(--zf-text-body-sm-size); line-height: var(--zf-text-body-sm-line); }

/* Primary. The /1300 step, not the /1200 Figma draws — /1200 fails 1.4.3 (§5.1). */
.zf-btn--primary            { background: var(--zf-blue-1300);  color: var(--zf-base-white); }
.zf-btn--primary:hover      { background: var(--zf-blue-1400); }
.zf-btn--primary:active     { background: var(--zf-blue-1500); }
.zf-btn--primary:disabled   { background: var(--zf-blue-800); }

.zf-btn--success            { background: var(--zf-success-default); }   /* green/1300, 4.56 */
.zf-btn--warning            { background: var(--zf-warning-default); }   /* orange/1300, 6.07 */
.zf-btn--danger             { background: var(--zf-danger-default); }    /* red/1300, 6.09 */

.zf-btn--secondary          { background: var(--zf-neutral-100);
                              color: var(--zf-text-default);
                              border-color: var(--zf-neutral-1100); }    /* 4.52:1, §5.4 */
.zf-btn--secondary:hover    { background: var(--zf-neutral-200); }
.zf-btn--secondary:disabled { color: var(--zf-text-disabled);
                              border-color: var(--zf-neutral-300); }

.zf-btn:focus-visible       { outline: 2px solid var(--zf-focus-ring); outline-offset: 2px; }
```

Four deliberate departures, each routing around a defect rather than copying it:

| Line | Figma has | Why |
|---|---|---|
| `--zf-blue-1300` for Primary | `blue/1200`, 4.32:1 | fails 1.4.3 (§5.1). Becomes `var(--zf-primary-default)` once defect 2 lands |
| `--zf-neutral-1100` for the Secondary border | `border/default`, 1.31:1 | no border role reaches 3:1 (§5.4) |
| `:active` present | no pressed state | defect 8; free in CSS |
| `outline` for focus | an absolute child rectangle | reproduces the geometry with no node, and tracks any size |
| `--zf-text-body-line` (**20**) and `--zf-text-body-sm-line` (**16**) | **21** and **19** | Figma's labels are off the type scale; the CSS uses the scale (defect 20). If the 21/19 leading is deliberate it has to be declared as an exception, the way `zf/overline`'s 17.6 is |

`--zf-success-default`, `--zf-warning-default` and `--zf-danger-default` are used directly, because
those three roles already sit at the step that passes. `primary` cannot be until defect 2 is resolved
— which is the whole argument for resolving it.

---

## 12. What needs a decision

| # | Question | Blocks |
|---|---|---|
| 1 | Move the Primary Default fill `{hue}/1200` → `/1300`? Fixes two 1.4.3 failures **and** binds three intents to their roles. Visible on 48 variants | defect 1 |
| 2 | **Move `primary/default` to `blue/1300`?** It cannot carry white text at 4.32:1. Affects the input field, focus ring, chart 1 and the radio — and improves all of them | defect 2 |
| 3 | Create `border/control` at `neutral/1100`? Fixes Secondary buttons, the input field and the radio in one edit | defect 5 |
| 4 | Underline links always, or only on hover and focus? | defect 3 |
| 5 | Does `Button Icons` get a label, or lose the property? | defect 4 |
| 6 | Add `State=Active` across all four sets? | defect 8 |
| 7 | Should a disabled Primary button's label be readable, at 1.42:1 today? | defect 15 |
| 8 | Give `Split Button` a `Size` axis and Button's padding rhythm? | defect 11 |

Decisions 1, 2 and 3 are one coordinated palette pass and close defects 1, 2 and 5 — three of the five
that matter — across three components. Defect 3 needs decision 4, and defect 19 needs no decision at
all: it is a stale override to clear.

---

**Provenance.** All values read from `Tin Tin` (`zZtArxOeRCjd7pKE25HQVS`), page `Buttons`
(`23:10416`), on 2026-08-20 via the Figma Plugin API. Enumerated: 4 component sets, **208 variants**,
and for each variant its geometry, padding, radius, gap, fill, stroke, effects, child list, text
style, text paint, property references, focus-ring geometry and positioning, plus every icon
instance's master and every icon glyph's stroke binding — 288 glyph paints resolved by variable ID.
Contrast is WCAG 2.1 relative luminance: text against 1.4.3 (4.5:1), borders and rings against 1.4.11
(3:1), target size against 2.5.8 (24 × 24). Hue ladders walked step by step against white to locate
the first passing step. Instance counts from a full walk of all 28 pages resolving every instance's
main component.

**Not audited in this pass:** the 11,025px documentation frame `29:14065`, line by line — see §10.2.

**Companion files:** `ZF-DESIGN-CANNON.md` §2.7, `ZF-INPUT-FIELD.md`, `ZF-RADIO.md`,
`ZF-STATUS-BADGE.md`, `ZF-ICONS.md`, `ZF-COLORS.md`, `ZF-TYPE-SPACE.md`, `ZF-SCALES.md`.
