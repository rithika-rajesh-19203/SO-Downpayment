# `src/app/` — the application

Screens live here. This half of the repo makes **no styling decisions**.

## Hard rules (enforced by `npm run check`)

- Import from `'@canon'` and nothing else. No `@canon/components/...`, no `../canon/...`.
- No hex codes, no `rgb()`, no arbitrary Tailwind values (`text-[13px]`).
- No styled bare elements (`<div className="...">`). Compose `Stack`, `Inline`,
  `Surface`, `Text` and real components instead.

If a screen cannot be built under those rules, that is the signal a **component
is missing** — not a signal to bend the rules. Add it to `src/canon/_incoming/`.

## Layout

| Path | Holds |
| --- | --- |
| `screens/` | One file per screen. Composition only — should read like a layout description. |
| `layouts/` | Shared chrome (app shell, split views) once the design defines it. |
| `data/` | Mock or fetched data, kept out of screens so screens stay about layout. |
