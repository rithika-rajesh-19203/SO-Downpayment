# ZF Design Cannon — Icons

**Foundation:** §1.7 of the canon · **Figma:** `Tin Tin` — page `Icons` (`13:8745`) · **CSS:** consumed
as inline SVG, no class of its own

**Measured 2026-08-20.** 51 icon components — 47 standalone plus a 4-variant `icon / chevron` set.

> **Status: repaired 2026-08-20.** Every defect below is fixed in Figma and the fix verified by
> re-measurement. §12 is the post-fix audit. The page now holds 51 icons on one 48px grid with the
> documentation frame beneath it and nothing overlapping.
>
> **Two findings in the first draft of this document were wrong**, and the corrections matter: the
> icons were **already bound to the `icon/default` role**, not to a primitive — so they always had a
> dark mode. And **`__np` was not litter**, it was the 56px specimen strip. A third, `alert-triangle`
> being 0.835px off-centre, was a bounding-box artefact — on render bounds it was already correct.
> §11 explains why all three got through.

---

## 1. What is on the page

| | |
|---|---|
| Page | `Icons` (`13:8745`) — **50 top-level nodes** |
| Icon components | **51** — 47 standalone `COMPONENT` + 4 variants inside `icon / chevron` (`13:8763`) |
| Component sets | 1 — `icon / chevron`, axis `Direction` (`Down`, `Up`, `Right`, `Left`) |
| Slot size | **16 × 16 on all 51** ✓ |
| Constraints | **`SCALE` / `SCALE` on all 61 child nodes** ✓ |
| Naming | `icon / {name}` on all 51 ✓ |
| Documentation frame | `13:8764` — 1440 × 2059 at y = 180, 8 sections |
| Specimen strip | `67:49683`, 584 × 104 — 7 icon instances at 56px. Was named `__np`, now `Icon specimen — 56 px` |
| Paint | `#565A70` on every icon; the 34 **fills** bind to `VariableID:6:1052` = **`color/neutral/1300`**. The 17 stroke paints were read as hex only — see §10 |

Two of §1.7's four rules already hold across the whole set: every icon is a 16 × 16 slot, and every
child carries `SCALE`/`SCALE` — that second one is the fix applied after the avatar admin-badge
incident, and it has held. The naming convention holds too.

What does not hold is everything about how the glyphs are drawn.

---

## 2. The page is visually broken, and that is the fastest thing to fix

Top-level nodes and their y positions:

| y | What sits there |
|---|---|
| 0 | `icon / chevron` set at x = 0, then 18 standalone icons, x = 260 → 1140 |
| **180 → 2239** | **the documentation frame `13:8764`, 1440 wide** |
| 1200, 1248 | 16 icons — 11 at y = 1200 (x = 0 → 480) and 5 at y = 1248 |
| 1500, 1560 | 6 icons |
| 1640 | the 56px specimen strip |
| 2319, 2415, 2511 | 7 icons |

The documentation frame occupies y 180 → 2239 across the full 1440px width. **Twenty-two icons and the
specimen strip sit inside that rectangle**, drawn on top of the documentation — the 11 at y = 1200, the 5
at y = 1248, the 2 at y = 1500 and the 4 at y = 1560. That is why the page reads as a mess: those icons
are not in a grid beside the docs, they are scattered across them.

Twenty-five icons are placed cleanly: the y = 0 row sits above the frame, and the three rows at
y = 2319, 2415 and 2511 sit below it.

Column spacing is inconsistent too — **three different pitches**. The y = 0 row runs mostly at 48px
with three 64px gaps dropped in at arbitrary points; y = 1200 and 1248 are a clean 48px; y = 2319
onward is 40px. The y = 1500 row starts at x = 48 with nothing at x = 0.

---

## 3. Two rendering technologies, and they behave differently

| | Count | Stroke weight | Scales with the frame? |
|---|---|---|---|
| **Stroked** — outline glyphs | **17** | 1.2 / 1.25 / 1.5 / 2.2857 | geometry yes, **stroke weight no** |
| **Filled** — solid glyphs | **34** | n/a | yes, completely |

This is the split the canon flagged as **open item 36**, and §1.7.6 — *the resize trap* — explains why
it matters: `SCALE` constraints scale a vector's geometry but **not** its `strokeWeight`. So a stroked
icon rendered at 80px keeps a 1.2px line and reads as a hairline, while a filled icon at 80px looks
correct. That is exactly what the §2.23.10 preview showed when `icon / chevron` at 80px looked like a
different icon from the 16px one.

**The set is 33% stroked, so a third of the icons break at any size other than 16.**

### 3.1 Four stroke weights, one of them an artefact

| Weight | Icons | |
|---|---|---|
| **1.2** | 10 — alert-circle, alert-triangle, board-view, card-view, check-circle, info, list-view, plus-circle, table-view, x-circle | |
| **1.25** | 2 — arrow-right, upload | visually identical to 1.2 |
| **1.5** | 4 — chevron (all 4 variants) | |
| **2.2857** | 1 — search | **= 16 ÷ 7 — a scaling artefact** |

`icon / search` is the outlier: its stroke is **2.2857px = 16 ÷ 7**, and its path is 13.7143 =
16 × 6/7. The whole icon was authored in a 7px box and scaled to 16, and the stroke came along for the
ride. At 2.2857 it is **90% heavier** than the ten icons at 1.2 sitting next to it in the same row, and
that is visible without measuring.

`1.2` and `1.25` differ by 0.05px — invisible, and therefore pure inconsistency with no upside.

### 3.2 Stroke caps are split too

14 of the 17 stroked icons use `ROUND` caps; **3 use `NONE`** — `upload`, `arrow-right` and
`card-view`. A square-capped line next to a round-capped one at 16px is a subtle but real difference in
weight and warmth.

### 3.3 Twenty-four filled icons carry a leftover stroke weight

`strokeWeight` on a vector with zero strokes does nothing. But 24 of the 34 filled icons carry one:

| Leftover value | Icons | Probable origin |
|---|---|---|
| 1.1429 | 16 | 16 ÷ 14 — the same resize artefact as the radio focus ring |
| 1 | 3 | authored at 1px |
| 1.3051 | 2 | a resize of some kind |
| 1.039 | 1 | a resize of some kind |
| 1.0182 | 1 | a resize of some kind |
| 1.692 | 1 | a resize of some kind |

Sixteen of them are **1.1429 = 16 ÷ 14**, the identical artefact measured on the radio's focus ring
(`ZF-RADIO.md` §4.4). A batch of icons was authored at 14px and scaled to 16, and the dead stroke
weight is the fingerprint. Harmless to render, but it is evidence that sixteen glyphs are not drawn on
the 16px pixel grid they claim to sit on.

---

## 4. The paint layer was already correct — my error, not the file's

**Corrected.** The first draft called this the highest-value defect on the page: 51 icons bound to the
primitive `color/neutral/1300` rather than the role `icon/default`, and therefore no dark mode. That
was wrong.

`VariableID:6:1052` **is** `icon/default`. I inferred it was `color/neutral/1300` because the icons
render `#565A70` and that hex is unique to `color/neutral/1300` in `ZF Primitives` — but `icon/default`
*aliases* `color/neutral/1300` in Light, so both resolve to the same hex. Reading the variable's name
instead of matching its colour would have settled it in one call. The rebind pass confirms it:
**0 of 53 paints needed rebinding.**

The icons have had a working dark mode all along. From `ZF Semantic`:

| Role | Light | Dark |
|---|---|---|
| **`icon/default`** | `color/neutral/1300` `#565A70` | `color/neutral/900` `#AEB1C2` |
| `icon/subtle` | `color/neutral/1000` | `color/neutral/1100` |
| `icon/disabled` | `color/neutral/900` | `color/neutral/1300` |
| `icon/inverse` | `color/base/white` | `color/neutral/2200` |

All 53 paints — 34 fills, 17 strokes, and the flattened `apps` — bind to `icon/default`, measured
**6.79:1** against white in Light, comfortably past the 3:1 that WCAG 1.4.11 asks of a graphic. In Dark
they become `color/neutral/900` `#AEB1C2` with nobody touching them.

**This is the one layer where the icons are ahead of the rest of the system.** The badge has 39 paints
bound to an external library; the radio has 12 bound to remote paint *styles*, which have no mode axis
at all. The icons consume the role, exactly as §3 of the canon requires. The only wrong paints on the
page were the **9 stray `#979797` strokes on `apps`** — unbound, and now removed (§5.3).

---

## 5. Geometry defects

### 5.1 Six icons overflow the 16px slot

| Icon | Overflow | |
|---|---|---|
| `icon / apps` | **0.1324px** on all four sides | 9 rectangles spanning −0.1323 → 16.1324 |
| `icon / items` | 0.0055px | sub-pixel |
| `icon / accountant` | 0.0023px | sub-pixel |
| `icon / inventory` | 0.0012px | sub-pixel |
| `icon / documents` | 0.0007px | sub-pixel |
| `icon / home` | 0.0005px | sub-pixel |

`apps` is the only visible one. The other five are sub-pixel and will never be seen — but they mean the
glyph is not aligned to the slot, and a `SCALE` resize multiplies the error: at 80px, `items`'
0.0055px becomes 0.0275px, and `apps`' 0.1324 becomes **0.662px** of overhang on each side.

### 5.2 Three icons are visibly off-centre

§1.7 rule 2 says the glyph is centred on its `absoluteRenderBounds` inside the slot. Measured against
the bounding box (a valid proxy for unrotated symmetric geometry):

| Icon | dx | dy | |
|---|---|---|---|
| `icon / alert-triangle` | 0 | **−0.835px** | sits 0.8px high in the slot |
| `icon / arrow-right` | **−0.442px** | 0 | sits 0.44px left |
| `icon / upload` | 0 | **+0.129px** | marginal — sits low, not high |
| the other **43** unrotated icons | ≤ 0.05px | ≤ 0.05px | ✓ centred |

`icon / apps` is in the centred group despite §5.3: its nine rectangles span −0.1323 → 16.1324 in both
axes, so their collective centre is 8.00005 — off by **0.00005px**. It overflows the slot symmetrically
rather than sitting off-centre. 43 + 3 = 46 unrotated icons; the 5 rotated ones (4 chevron variants and
`arrow-down`) are excluded because a rotated node's x/y is its transform origin, not its box corner.

**`alert-triangle` was a false positive.** Its render bounds (9.94 × 9.33) are smaller than its
bounding box (11 × 9.8) — the path does not fill its own box — so the box centre and the render-bounds
centre are two different points. §1.7 specifies **render bounds**, and measured that way the icon was
already centred. The −0.835 figure was an artefact of testing the wrong thing.

The first draft flagged that caveat and then listed the icon as a defect anyway. It should have been
resolved before publishing rather than noted as a doubt — see §11.

That leaves **two** genuine off-centre glyphs, both now corrected: `arrow-right` (+0.442px in x) and
`upload` (−0.129px in y).

### 5.3 `icon / apps` is nine rectangles

Every other icon is one vector (or two, for `configure` and `publish`). `apps` is **nine
`RECTANGLE` nodes** of 3.5556 × 3.5556 in a 3 × 3 grid — and each one carries a **stray stroke** at
`#979797`, weight 0.

Two problems in one node. Nine children instead of one violates §1.7 rule 1 and makes the icon
9 × more expensive to recolour. And `#979797` is an **unowned grey** — not in `ZF Primitives`, not in
the remote library the badge and radio use, and found nowhere else in the file. It rendered nothing at
weight 0, which is why it survived.

**Fixed:** the 9 strokes were removed and the 9 rectangles flattened into a single path. The flatten
preserved the original 16.2647px extent, so the glyph was then scaled by 0.9837 and re-centred to sit
exactly in the 16px slot. `apps` is now one `path`, bound to `icon/default`, like every other icon.

### 5.4 Child node naming is three-way split

| Child name | Components |
|---|---|
| `Vector` | 32 |
| `path` | 18 |
| `Rectangle` | 1 |

`path` on 18 components, `Vector` on 32, `Rectangle` on `apps`. Counted per **node** rather than per
component it is `Vector` × 34, `path` × 18, `Rectangle` × 9 = 61, because `configure` and `publish`
hold two vectors each and `apps` holds nine rectangles. §1.7 does not name the child, which is why this
drifted — but an exporter that walks `icon / *` → first child by name will miss two-thirds of the set
whichever name it picks. Standardise on one.

### 5.5 Twelve icons hold multiple subpaths in one vector

`items`, `inventory`, `sales` (3), `purchases`, `timesheets`, `tax`, `custom-modules`, `payroll`,
`sidebar-collapse`, `settings`, `edit`, `pin`. This is correct and desirable — multiple subpaths in
one vector is one node and one fill, which is exactly what `configure`, `publish` and `apps` should
have been. Recorded here so a future cleanup does not "fix" it.

---

## 6. Documentation is present on 8 of 51, and three entries are wrong

Only 8 icons carry a description. Worse, **four of those 8 state facts the node contradicts** — six wrong facts between them:

| Icon | Description says | Node is |
|---|---|---|
| `icon / upload` | "1.25px **round** stroke… centre constraints mean it does not scale with the frame" | 1.25px but cap **`NONE`**, not round; and constraints are **`SCALE`/`SCALE`**, so it does scale. Two wrong facts |
| `icon / arrow-right` | same sentence | same two contradictions |
| `icon / card-view` | "1.5px round stroke" | **1.2px, `NONE` cap** — wrong weight *and* wrong cap |
| `icon / list-view` | "1.5px round stroke" | **1.2px** round — wrong weight |

So the documentation that exists is less reliable than no documentation, because it reads as
authoritative. The `upload` / `arrow-right` sentence is a direct casualty of the avatar fix: the
constraints were corrected across the set and the prose was not.

**43 of 51 icons have no description at all**, and none of the 51 has a documentation link.

---

## 7. `icon / chevron` is modelled differently from every other directional icon

| Icon | Model |
|---|---|
| `icon / chevron` | **1 component set, 4 variants** on a `Direction` axis |
| `icon / arrow-up`, `icon / arrow-down` | **2 separate components** |
| `icon / caret-down` | 1 component, no counterpart |
| `icon / arrow-right` | 1 component, no counterpart |

Three different answers to the same question. The chevron's variant model is the better one — one
component, one axis, rotation handled inside — and it is also the only icon in the set that uses it.
`arrow-up` and `arrow-down` are the same glyph — identical dimensions (10.3796 × 12.9999), identical
render bounds, one subpath each — with `rotation: 180` on one of them. That is precisely what a
`Direction` variant is for.

This is not urgent. It is worth settling before the set grows, because every directional icon added
from here will pick one of the three patterns arbitrarily.

---

## 8. Defects — ranked

| # | Severity | Defect | Scope | Fix |
|---|---|---|---|---|
| 1 | — | ~~All 51 icons bind to a primitive~~ **WITHDRAWN — this was wrong.** They were already bound to `icon/default`; see §4 | — | no action; 0 of 53 paints needed rebinding |
| 2 | **High** | 22 icons and the specimen strip are drawn **on top of** the documentation frame | page layout | ✅ **fixed** — 51 icons on one 48px grid, specimen strip below, doc frame below that |
| 3 | **High** | `icon / search` stroke was **2.2857px = 16 ÷ 7**, 90% heavier than its neighbours | `13:8997` | ✅ **fixed** — 1.25px |
| 4 | **High** | 4 stroke weights across 17 stroked icons: 1.2, 1.25, 1.5, 2.2857 | 17 icons | ✅ **fixed** — all 17 at **1.25px**, see §9 |
| 5 | **High** | Four descriptions stated facts the nodes contradict — six wrong facts, including two describing the pre-fix constraints | 4 icons | ✅ **fixed** — all 48 descriptions regenerated from measurement |
| 6 | Medium | 17 of 51 are **stroked**, so their weight does not scale — open item 36 | 17 icons | Decide: convert to filled, or accept 16px-only |
| 7 | Medium | `icon / apps` was 9 rectangles, each with a stray `#979797` stroke — an unowned grey found nowhere else | `67:49673` | ✅ **fixed** — 1 path, 9 strokes removed |
| 8 | — | ~~`alert-triangle` sits 0.835px high~~ **WITHDRAWN — false positive.** A bounding-box artefact; on render bounds it was already centred (§5.2) | — | no action |
| 9 | Medium | `icon / arrow-right` sat 0.442px left; `icon / upload` 0.129px low | `29:12686`, `29:12684` | ✅ **fixed** — centred on render bounds |
| 10 | Medium | `apps` overflowed the slot by 0.1324px on all four sides — 0.66px at 80px | `67:49673` | ✅ **fixed** — scaled 0.9837 to exactly 16px |
| 11 | Medium | Stroke caps split `ROUND` × 14 / `NONE` × 3 | `upload`, `arrow-right`, `card-view` | ✅ **fixed** — all 17 `ROUND` cap and join |
| 12 | Low | Filled icons carrying a dead `strokeWeight`; 16 of them at 1.1429 = 16 ÷ 14 | **30 nodes** | ✅ **fixed** — all zeroed |
| 13 | Low | 5 icons overflowed the slot sub-pixel | `home`, `items`, `inventory`, `documents`, `accountant` | ✅ **fixed** — re-centring resolved 4; `items` scaled 0.9993 |
| 14 | Low | Child naming split three ways — `path`, `Vector`, `Rectangle` | 53 child nodes | ✅ **fixed** — all named `path` |
| 15 | Low | The specimen strip was named `__np`, which reads as scratch and invites deletion | `67:49683` | ✅ **fixed** — renamed `Icon specimen — 56 px`. **Not** litter: 7 instances at 56px |
| 16 | Low | 43 of 51 had no description | 51 | ✅ **fixed** — 48 descriptions written from measurement (47 components + the chevron set) |
| 17 | Low | Three inconsistent models for directional icons | chevron / arrows / caret | Settle on the variant model |
| 18 | Low | Three column pitches on the page: 64, 48, 40 | page layout | ✅ **fixed** — single 48px grid, 12 per row |

**Withdrawn on measurement:** 1 and 8 — both were my errors, not the file's (§11).
**Fixed mechanically:** 9, 10, 12, 13, 14, 16.
**Fixed as layout:** 2, 15, 18.
**Fixed, and they changed how icons look:** 3, 4, 11 — the stroke normalisation, §9.
**Still open — the only one left:** **6**, the 17 stroked icons. That is open item 36 and it needs 17
glyphs redrawn, not a script.
**Still open, low urgency:** 17, the three inconsistent models for directional icons.

---

## 9. The repair, and the one decision inside it

Everything except stroke weight is unambiguous. **Stroke weight is not**, because any value chosen
changes how twelve to seventeen icons look.

Instance counts settled it. **1,545 icon instances** exist across the file, and the two heaviest users
are both stroked:

| Icon | Instances | Was |
|---|---|---|
| **`icon / upload`** | **542** | 1.25px |
| **`icon / chevron`** | **312** | 1.5px |
| `icon / plus` | 84 | filled |
| `icon / close` | 69 | filled |
| the ten icons at 1.2px | ~130 between them | 1.2px |

| Option | Effect |
|---|---|
| **1.25px — chosen** | Leaves `upload` (542 instances, the most-used icon in the file) untouched. Ten icons move by 0.05px, which is invisible. `search` drops from 2.2857. Only `chevron` changes visibly — 312 instances, 17% lighter |
| 1.5px | Leaves `chevron` alone but changes `upload` — 542 instances, 20% heavier. Strictly worse on instance count |
| 1.2px | Ten icons unchanged, but both `upload` and `chevron` move |
| Convert all 17 to filled | Solves defect 6 permanently and makes the whole set scale correctly. Requires redrawing 17 glyphs — a project, not a fix |

**Applied: 1.25px, round cap and join, on all 17.** Four weights became one, and the icon with the most
instances did not move.

The first draft recommended 1.5px on the belief that `chevron` was the most-instanced icon. Measurement
says `upload` is, by 230 instances. That reversed the decision — 1.5px would have re-weighted 542
instances to protect 312.

Filled remains the real answer to open item 36 and should be scheduled, not rushed.

The rest of the script, in order — the order matters:

1. Snapshot every instance override across all 28 pages. **Mutating a master's vector wipes instance
   paint overrides** — this cost 363 bindings during the page-header work and they had to be
   re-applied from a snapshot.
2. Delete `__np` after inspecting its 7 children.
3. Flatten `apps` to one vector; drop the 9 `#979797` strokes; fit to the slot.
4. Zero the 24 dead `strokeWeight` values.
5. Set the 17 stroked icons to the chosen weight and `ROUND` caps.
6. Snap the 6 overflowing glyphs into the slot.
7. Re-centre `alert-triangle`, `arrow-right` and `upload` on their **render bounds**, not their
   bounding boxes.
8. Rebind all 61 paints from `color/neutral/1300` to `icon/default`.
9. Rename every child to one name.
10. Write a generated description onto all 51.
11. Re-apply the override snapshot from step 1 and verify the count returns.
12. Lay out all 51 on a 48px grid in a labelled container at the top of the page; move the
    documentation frame below the last row.
13. Regenerate the documentation frame from the post-fix measurement.

---

## 10. The five open questions, now answered

The first draft listed five facts it could not read. Every one is resolved, and **three of them changed
a conclusion** — which is the argument for not publishing an audit with holes in it.

| # | Question | Answer | Changed a conclusion? |
|---|---|---|---|
| 1 | Contents of `__np` | **7 icon instances at 56 × 56** — the large-size specimen strip, not scratch | **Yes.** Defect 15 went from "delete" to "rename" |
| 2 | Are the 17 stroke paints bound? | **Yes, all 17 to `icon/default`** — as are the 34 fills. 26 stroke paints total, of which 9 were the `apps` strays | **Yes.** Defect 1 withdrawn entirely (§4) |
| 3 | Instance count per icon | **1,545 total.** `upload` 542, `chevron` 312, `plus` 84, `close` 69, `admin` 65, `learn` 61, `home` 43 | **Yes.** Reversed the stroke-weight decision (§9) |
| 4 | The doc frame's sections and staleness | 3 content sections — `01 Chevron`, `02 Specification`, `03 Adding an icon` — **badly stale**: v0.1.0, "ICONS 4", 2px strokes, `Neutral 1100`, centre/centre constraints, and two icons that do not exist (`calendar`, `eye`) | No, but it was a bigger job than assumed (§12.1) |
| 5 | `absoluteRenderBounds` origin per glyph | Read. Two glyphs genuinely off-centre, not three | **Yes.** `alert-triangle` withdrawn (§5.2) |

---

## 11. Why three of my findings were wrong

Three of the eighteen defects were not defects. Worth recording the mechanism, because each one is a
different way to be confidently wrong from real measurements.

**Defect 1 — I matched a colour instead of reading a name.** The icons bind to `VariableID:6:1052`. I
did not resolve that ID; I resolved the *hex* `#565A70`, found it unique to `color/neutral/1300`, and
concluded the binding was to the primitive. But `icon/default` aliases `color/neutral/1300`, so the
role and the primitive render identically in Light. One `getVariableByIdAsync` would have settled it,
and I had already used that call on the badge and the radio. **Resolve the identifier, not the value it
happens to produce.**

**Defect 8 — I measured the wrong box and said so, then published anyway.** `alert-triangle` is
centred on its render bounds and off-centre on its bounding box. §1.7 specifies render bounds. I noted
that the two differ for this icon and flagged it as needing a re-measure — then still listed it as a
Medium defect. A caveat in the text is not a substitute for the measurement.

**Defect 15 — I judged a node by its name.** `__np` reads like scratch. It held seven 56px instances:
the large-size specimen that the whole stroked-versus-filled argument depends on. Nearly deleted the
evidence for defect 6.

The common thread: all three came from a *partial* read. The bridge dropped mid-audit, five facts went
unread, and I published with the holes documented rather than waiting. §10 shows three of those five
holes each overturned a conclusion. **An audit with known gaps should not be given a defect table.**

---

## 12. Post-fix audit

Re-measured after every repair.

| Check | Result |
|---|---|
| Icon components | **51** — 47 standalone + 4 chevron variants |
| 16 × 16 slot | **51 / 51** ✓ |
| `SCALE` / `SCALE` constraints | **53 / 53** child nodes ✓ |
| `icon / {name}` naming | **51 / 51** ✓ |
| Child node name | **`path` × 53** — one name ✓ |
| Paints bound to `icon/default` | **53 / 53** ✓ |
| Unbound paints | **0** ✓ |
| Stroke weights | **`1.25` × 17** — one value ✓ |
| Stroke caps | **`ROUND` × 17** — one value ✓ |
| Dead `strokeWeight` on filled glyphs | **0** ✓ |
| Glyphs off-centre on render bounds | **0** ✓ |
| Glyphs overflowing the 16px slot | **0** ✓ |
| Descriptions | **48 / 48** — 47 components + the chevron set ✓ |
| Nodes overlapping the documentation frame | **0** ✓ |
| Top-level nodes on the page | 50 — 47 icons, the chevron set, the specimen strip, the doc frame |

Layout: chevron set at y = 0, the 47 standalone icons on a **48px grid, 12 per row, 4 rows** from
y = 104, the 56px specimen strip at y = 336, and the documentation frame at y = 520.

**Instance overrides.** 1,621 paint records were snapshotted across all 28 pages before any mutation
and re-applied after. 1,567 restored; **54 did not, all of them expected** — six `apps` instances × nine
rectangle children that no longer exist, because the master is now one path. Verified: the surviving
`apps` instance renders one `VECTOR` child correctly at 56px.

### 12.1 The documentation frame was rebuilt

Frame `13:8764` was as stale as the badge's and the radio's — it described a **four-icon** set:

| It said | Now says |
|---|---|
| `ICONS 4`, `VERSION 0.1.0` | `51`, `0.2.0` |
| `STROKE 2px, round cap and join` | `1.25px round — 17 of 51` |
| `DEFAULT COLOUR Neutral 1100` · `#71758F` · `4.52:1` | `icon/default → neutral/1300` · `#565A70` · **6.79:1** |
| `Constraints  Centre / centre` | `Scale / scale`, with the avatar admin-badge bug named as why |
| "Put one vector inside. Stroke 2px…" | "Prefer a filled path. If you must stroke, use 1.25px" — plus the `SCALE`-does-not-scale-`strokeWeight` warning |
| Naming list including `icon / calendar`, `icon / eye` | real icons only |

27 text nodes rewritten. The frame had never been regenerated since the day it was written, which is
the third documentation frame in this system found in that state.

### 12.2 What is still open

| # | Open item | Why it was not fixed |
|---|---|---|
| **6** | **17 of 51 icons are stroked**, so their weight does not scale — a 16px-only set. Canon **open item 36** | Needs 17 glyphs redrawn as filled paths. A project, not a script |
| 17 | Three inconsistent models for directional icons — chevron is a `Direction` variant set, `arrow-up`/`arrow-down` are two components, `caret-down` is alone | A modelling decision. Worth settling before the set grows |

Everything else on the page is closed.

---

**Provenance.** Measured and repaired in `Tin Tin` (`zZtArxOeRCjd7pKE25HQVS`), page `Icons`
(`13:8745`), on 2026-08-20 via the Figma Plugin API. Pre-fix pass enumerated 50 top-level nodes, 51
icon components and 61 child nodes with every geometry, layout, stroke, effect, constraint, paint,
binding, export and plugin-data field. Repairs applied in the order set out in §9, with a
1,621-record instance-override snapshot taken before the first mutation and re-applied after the last.
Post-fix pass in §12 re-measured every check independently. Contrast is WCAG 2.1 relative luminance
against the 1.4.11 3:1 non-text threshold. Instance counts from a full walk of all 28 pages resolving
every instance's main component. `#565A70`, `icon/default` and all four `icon/*` roles resolved by
variable ID.

**Corrections.** This document supersedes its first draft, which contained three false defects (1, 8,
15) and recommended the wrong stroke weight. §11 covers the first three; §9 the fourth.

**Companion files:** `ZF-DESIGN-CANNON.md` §1.7, `ZF-STATUS-BADGE.md`, `ZF-RADIO.md`,
`ZF-COLORS.md`, `ZF-TYPE-SPACE.md`, `ZF-SCALES.md`.
