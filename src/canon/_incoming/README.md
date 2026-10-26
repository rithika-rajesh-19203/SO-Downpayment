# `_incoming/` — the antechamber

A component lands here when a design needs something the canon doesn't have.

It is **deliberately not exported** from `'@canon'`, so no screen can use it yet.
`scripts/check-boundaries.mjs` fails the build if anything imports from here.

## Admission checklist

A component leaves this folder only when all of these are true:

1. It has a `.stories.tsx` covering **every** state — hover, disabled, loading,
   empty, overflowing text, and the longest realistic content.
2. It uses tokens only. No hex, no `text-[13px]`, no `w-[247px]`.
3. Its props describe *intent* (`status`, `tone`, `size`), not appearance
   (`isBlue`, `paddingLeft`).
4. You have reviewed it at `localhost:6006` **in isolation** — not embedded in a
   screen, where flaws hide.
5. It does not duplicate something already in the canon. If it is 80% of an
   existing component, extend that one instead.

## Admitting it

```
git mv src/canon/_incoming/Thing src/canon/components/Thing
```

then add the export to `src/canon/index.ts` and flip its registry entry to
`"status": "stable"`. Run `npm run check` — it verifies all three moved together.
