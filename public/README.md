# `public/` — static assets that ship in the product

Served at the site root and copied verbatim into the build. Not scanned by
`scripts/check-boundaries.mjs` (it only walks `src/**` for `.ts/.tsx/.css`), so
nothing here is token-checked — keep design decisions out.

| Path | Holds |
| --- | --- |
| `brand/` | Product wordmarks and marks: `books.svg`, `billing.svg`, `erp.svg`, `expense.svg` |
| `favicon.svg` | Tab icon |

Reference them by absolute URL — `/brand/books.svg` — never by a relative path.

## What does NOT go here

- **Icons.** They live in `src/canon/icons/paths.ts` as inline path data so they
  inherit `currentColor` and can be recoloured by token. An icon served as a
  file cannot follow the theme. See md §1.7.
- **Design references.** Those are inputs, not assets — `design-refs/`.

## Open question before the brand assets land

md open item 32: the product wordmark is drawn ARTWORK in the top bar and a TEXT
layer in the sidebar. Artwork is more faithful; text is translatable and needs no
asset per product. Settle it before both ship — if text wins, most of `brand/`
is only the mark, not the wordmark.
