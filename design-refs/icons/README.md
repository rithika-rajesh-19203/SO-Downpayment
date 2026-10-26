# Drop icon SVGs here

One file per glyph. Then:

```bash
npm run icons:sync
```

That reads every `.svg` in this folder, checks it, and regenerates
`src/canon/icons/geometry.generated.ts`. Nothing else changes — no registry
entry, no new export, no component edit. `<Icon name="apps" />` can be written
today and lights up the moment `apps.svg` lands here.

This folder is a **design input**. Like the rest of `design-refs/`, it is never
shipped — only the generated `.ts` is.

---

## Exporting from Figma

Page `Icons` (`13:8745`), 51 icons on a 48px grid.

1. Select the icon component (not an instance).
2. Export as **SVG**, at **1x**.
3. Turn **off** "Include id attribute" and "Outline text" if offered.
4. Save here.

## File naming

The name of the file becomes the name of the icon. All of these work:

```
apps.svg     icon-apps.svg     icon_apps.svg     icon _ apps.svg
```

They all resolve to `apps`. Figma names the component `icon / apps`, and since a
filename cannot contain a slash, exporting it lands as `icon _ apps.svg` — so
**you can drop Figma's exports exactly as they come out**, no renaming. The name has to be in `ICON_NAMES` in
`src/canon/icons/paths.ts` — if it is not, `icons:sync` tells you and skips the
file rather than inventing a roster entry. Add the line, re-run.

For the chevron, export each variant and name them by direction:
`chevron-down.svg`, `chevron-up.svg`, `chevron-left.svg`, `chevron-right.svg`.
A real export replaces the derived geometry currently standing in for it.

## What the sync checks

| Check | Why |
| --- | --- |
| `viewBox` is `0 0 16 16` | The glyph is authored at the 16px slot — md §1.7 rule 1. A 24px export scaled by CSS is not the same drawing. |
| The name is in `ICON_NAMES` | Otherwise geometry arrives under a name nothing can ask for. |
| Filled vs stroked matches md §3.1 | A filled export landing on a stroked name means the wrong glyph was exported. 17 are stroked; the sync knows which. |
| Stroke weight is 1.25 | md defect 4 — the set had four weights and was normalised to one. Anything else is a stale export. |
| Only `<path>` elements | `<rect>`, `<circle>`, `<line>` cannot carry the `d` the component needs. md §5.3: `apps` was nine `<rect>`s and had to be flattened. |

`fill`, `stroke`, `width` and `height` are **stripped**, not checked. A glyph
must inherit `currentColor` or it cannot follow the theme — md §2.7.6 found 108
orphan paints from icons carrying their own colour, and §4 of the icons md is
clear that the Figma set already binds `icon/default` correctly. Colour is
`Icon`'s job, via `tone`.

Multiple `<path>` elements are **merged into one `d`**. That is correct and
deliberate: md §5.5 records twelve icons that hold several subpaths in one
vector, and says a future cleanup must not "fix" it — one node, one fill.

## Prefer filled glyphs

md **open item 36 / defect 6 is the only thing still open** on the icon page:
17 of 51 glyphs are stroked, and `SCALE` scales geometry but **not** stroke
weight. A stroked glyph in an 80px slot draws 80px of path at a 16px weight and
reads as a hairline — which is exactly what the §2.23.10 preview showed, where
`chevron` at 80px looked like a different icon from the 16px one.

Filled survives a resize intact. If you are redrawing anything, redraw it filled.
