# `design-refs/` — design inputs

Drop design references here, then ask for the screen.

- Screenshots / exports: `active-job-cards.png`
- Multiple states of one screen: `job-card--empty.png`, `job-card--loading.png`
- Figma links: put them in a `.md` beside the image, or just paste them in chat

## What happens next

The reference is read against `src/canon/registry.json`, and you get a **gap
report before any code is written**: what maps onto existing components, and what
does not exist yet. You decide whether to build the missing pieces or cut them
from v1.

See `docs/WORKFLOW.md`.

## Worth knowing

- **Several states beat one pretty screen.** Empty, loading and overflow states
  are what determine a component's real prop surface.
- **Flag which parts are new** vs. reused from a screen already built — it saves
  a round of "is this the same table as before?".
- Files here are design inputs, not assets. Icons and images that ship in the
  product belong in `src/canon/` or `public/`.
