import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TopBar } from './TopBar';
import type { TopBarAction } from './TopBar';
import { Nav } from '../Nav/Nav';
import type { NavNode } from '../Nav/Nav';
import { Stack, Text } from '../../primitives';

/**
 * INCOMING. §9.6 is the review script and its first row is the headline: **look
 * at the apps grid beside the bell — it must be the same white as every other
 * glyph.**
 *
 * All eight `chrome/*` roles already existed in the token layer, mode-invariant
 * and emitted on `:root`, so §9.5's trap — a pipeline dropping roles that do not
 * differ between modes — is already avoided here.
 */
const meta = {
  title: 'Components/TopBar', component: TopBar, parameters: { layout: 'fullscreen' },
  args: {},
} satisfies Meta<typeof TopBar>;
export default meta;
type Story = StoryObj<typeof meta>;

const MARK = (
  <svg viewBox="0 0 512 512" aria-hidden focusable="false" fill="currentColor" className="size-12">
    <path d="M361 502.5H24.5c-8 0-14.4-6.5-14.4-14.4V365.8c0-26.7 17-50.5 42.2-59.2l373-128c29-10 48.6-37.3 48.6-68 0-39.6-32.3-71.9-71.9-71.9H39v238.1c0 8-6.5 14.4-14.4 14.4S10 284.9 10 276.9V24.3c0-8 6.5-14.4 14.4-14.4h377.5c55.6 0 100.8 45.2 100.8 100.8 0 43-27.3 81.3-68.1 95.3l-373 128a33.72 33.72 0 0 0-22.7 31.9v107.8H361c30.1 0 58.5-11.7 79.8-33a112 112 0 0 0 33-79.8c0-21.3-6-42.1-17.4-60.1a113.42 113.42 0 0 0-46.1-41.3 14.41 14.41 0 0 1-6.7-19.3c3.5-7.2 12.1-10.2 19.3-6.7 23.8 11.5 43.8 29.5 58 51.9 14.3 22.6 21.8 48.8 21.8 75.6 0 37.8-14.7 73.4-41.5 100.2A141.24 141.24 0 0 1 361 502.5z" />
    <path d="M172.4 211.9c-31.8 0-57.7-25.9-57.7-57.7s25.9-57.7 57.7-57.7 57.7 25.9 57.7 57.7-25.9 57.7-57.7 57.7zm0-86.6c-15.9 0-28.9 13-28.9 28.9s13 28.9 28.9 28.9 28.9-13 28.9-28.9-13-28.9-28.9-28.9zM317.1 415.7c-31.8 0-57.7-25.9-57.7-57.7s25.9-57.7 57.7-57.7 57.7 25.9 57.7 57.7-25.8 57.7-57.7 57.7zm0-86.6c-15.9 0-28.9 13-28.9 28.9s13 28.9 28.9 28.9 28.9-13 28.9-28.9-12.9-28.9-28.9-28.9z" />
  </svg>
);

/**
 * The recent-activity mark, placed before the search field. A 512-unit asset —
 * not one of the 51 ZF glyphs, so `icons:sync` would reject it on the viewBox
 * check, and `TopBarAction.icon` takes a node for exactly that case.
 *
 * `fill="currentColor"` and no baked hex, so it takes `chrome/text` from the
 * button — 15.90:1 on the bar — and follows the hover and pressed fills like
 * every other action.
 *
 * The 512x512 `fill="none"` rect the export carried is dropped: it is a bounding
 * box, not ink.
 */
const HISTORY_MARK = (
  <svg viewBox="0 0 512 512" width="16" height="16" aria-hidden focusable="false"
    fill="currentColor">
    <path d="M467 364.5a237.9 237.9 0 0 1-211.3 128.7H252A238 238 0 0 1 90 84.4 238 238 0 0 1 417.6 81V46.8a25 25 0 0 1 50 0V155.4l-.2 1-.2 1-.1.6-.4 1.6-.2.8a25.7 25.7 0 0 1-1.3 3.1l-.5 1-.7 1.2-.6 1-.7 1a30.5 30.5 0 0 1-2.4 2.7 23.8 23.8 0 0 1-2.5 2.2l-.5.4-1.5 1-.7.5-.8.4-1.6.8-.7.2-1.8.7-.5.1-.6.2a22.8 22.8 0 0 1-2.5.5 1.3 1.3 0 0 1-.3 0l-1 .2H440l-1-.2-1-.1-.6-.2c-.6 0-1-.2-1.6-.4l-.8-.2a25.7 25.7 0 0 1-3.1-1.3l-1-.4-1.2-.7-1-.7-1-.7a30.5 30.5 0 0 1-2.7-2.3 23.8 23.8 0 0 1-2.2-2.5l-.4-.6-1-1.4-.2-.3-6.3-10.1a187.9 187.9 0 1 0 7.8 186 25 25 0 0 1 44.4 23z" />
    <path d="m425.8 171.2 1.9 1.5a22.3 22.3 0 0 1-1.9-1.5zm35.3-1.7 1.5-1.9a22.3 22.3 0 0 1-1.5 1.9zM317 331.7a25 25 0 0 1-34.6 7.3L225.9 302a25 25 0 0 1-11.3-21V170.6a25 25 0 0 1 50 0v97.2l45 29.4a25 25 0 0 1 7.3 34.6z" />
  </svg>
);

const LEADING: TopBarAction[] = [
  { id: 'recent', label: 'Recent activity', icon: HISTORY_MARK, onSelect: () => {} },
];

const ACTIONS: TopBarAction[] = [
  { id: 'new', label: 'Create new', icon: 'plus', filled: true, onSelect: () => {} },
  { id: 'invite', label: 'Invite users', icon: 'users', onSelect: () => {} },
  { id: 'notifications', label: 'Notifications', icon: 'bell', count: 1, onSelect: () => {} },
  { id: 'settings', label: 'Settings', icon: 'settings', onSelect: () => {} },
];

const NAV_ITEMS: NavNode[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'items', label: 'Items', icon: 'items', children: [{ id: 'all-items', label: 'All Items' }] },
  { id: 'inventory', label: 'Inventory', icon: 'inventory',
    children: [{ id: 'assemblies', label: 'Assemblies' }] },
];

/**
 * The shell. The rail owns the lockup; the bar starts where the rail ends and
 * runs to the page edge. §3.1's `20 + 200 = 220` alignment is structural here
 * rather than two numbers agreeing by intent.
 */
function Shell(p: { orgName?: string; withOrg?: boolean }) {
  const [q, setQ] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [current, setCurrent] = useState('home');
  return (
    <div className="flex h-dvh bg-surface-default">
      <Nav items={NAV_ITEMS} currentId={current} onNavigate={setCurrent}
        collapsed={collapsed} onCollapsedChange={setCollapsed}
        product={{ name: 'Books', mark: MARK }} />
      <div className="flex flex-1 min-w-0 flex-col">
        <TopBar
          leading={LEADING}
          search={{ scope: 'Customers', value: q, onValueChange: setQ,
            onSubmit: () => {}, onScopeOpen: () => {} }}
          org={p.withOrg === false ? undefined : { name: p.orgName ?? 'Meedium', onOpen: () => {} }}
          actions={ACTIONS}
          account={{ name: 'Jenner Dopeson', initials: 'JD', onOpen: () => {} }}
          apps={{ onOpen: () => {} }}
        />
        <main className="flex-1 min-h-0 overflow-auto p-10">
          <Text size="title" weight="semibold">All Profiles</Text>
        </main>
      </div>
    </div>
  );
}

const Live = Shell;

/**
 * THE BAR. Two things to look at first.
 *
 * **The apps grid, far right.** §2: Figma binds that one glyph to
 * `icon/default` — a role whose job is to sit on `surface/default` — giving
 * **2.34** at rest, **1.89** hovered and **1.22** pressed. Press it in Figma and
 * it is at its *least* visible. Here it is `chrome/text` like everything else:
 * 15.90 / 12.83 / 8.29.
 *
 * The lesson §2 draws is the interesting part: the paint census reads **0 raw, 0
 * primitive, 0 remote** — a perfect score — and the defect survives it, because
 * `icon/default` *is* a bound semantic role. It is the wrong one. *"A
 * bound-paint census cannot tell you a role is bound to the wrong namespace."*
 * The brand lockup has the same shape of problem: seven paints on
 * `nav/brand-text`, a sidebar role, which happens to be the same `#FFFFFF`.
 *
 * **The `+` button's edge.** §4.4: `brand/solid` is **2.90:1** against the bar,
 * its hover 2.69 and its pressed **1.69** — it gets worse at every rung, because
 * the brand ladder darkens and the bar is already near-black. The glyph inside
 * passes at 5.48; the boundary does not. There is a 1px `chrome/text` ring here
 * so the edge is findable in all three states.
 *
 * Both hues fail on hover and pressed; **only Blue fails at rest** — so switch
 * the Brand toolbar control and the resting state's conformance changes with it.
 */
export const Default: Story = { render: () => <Live /> };

/**
 * **DARK MODE — and this is §2.1.**
 *
 * `zf-topbar`'s root carries **0 strokes and 0 effects**, and the family has no
 * effects at all. In Light that is fine: the bar is 15.90:1 against a white
 * page. In Dark:
 *
 * | | |
 * |---|---|
 * | bar vs the page | **1.02** |
 * | bar vs the sidebar | **1.05** |
 * |
 *
 * *"Three near-blacks with no boundary between any pair of them"* — and it is
 * the third component in a row with the same gap: the sidebar at 1.07
 * (`ZF-LHS-MENU.md` §2) and the side panel at 1.21 (`ZF-SIDE-PANEL.md` §2.1).
 * Three independent findings, one missing convention.
 *
 * `chrome/border` cannot be the fix — 5.67 on a dark page but **2.85** on a white
 * one. `border/control` is 3.52 against the bar and 3.58 against the dark page,
 * and that is what the bar carried until now.
 *
 * **It no longer does, and that is deliberate.** On a white page that hairline is
 * `neutral/1100` at 4.52:1 against the page — a line the reference does not draw
 * — and being additive it made the bar's box 49, so its bottom sat one pixel
 * below the rail's 48px brand band. The two dark regions are one strip.
 *
 * **Look at that seam in Light**, then switch the Pane control and see what Dark
 * gives up: 1.02:1 against the page. That is the drawing's defect rather than a
 * new one, and it is the third component to have it.
 */
export const DarkModeEdge: Story = {
  render: () => (
    <Live />
  ),
};

/**
 * FOCUS — §5, and the clearest fix in the file.
 *
 * **Tab through the whole bar**: brand link, search, scope caret, org, four
 * actions, avatar, apps. Every one shows a ring.
 *
 * In Figma **three of the eight components have no focus state** —
 * `zf-topbar-tile` and `zf-topbar-org` have three `State` values, and
 * `zf-topbar-avatar` has *none at all* — while `zf-topbar-action` two components
 * away has exactly the right treatment. Its own doc frame grades 2.4.7 as
 * PASSES. §6: *"the convention already exists and the work is copying it
 * twice."*
 *
 * Two details worth checking:
 * - **Focus the scope caret.** Only the caret rings, not the whole field. §9.2
 *   measured `:focus-within` painting two concentric rings, because the caret is
 *   a `<button>` inside the same `<form>`.
 * - **Tab into the input.** `focus/ring` on `chrome/raised` is **2.44:1** in
 *   Light and fails; it is the only mode-varying role the bar touches. The ring
 *   is bound to `chrome/accent` instead, which does not flip — **4.20:1** on the
 *   field, where `blue/900` used to give 5.01.
 *
 * Then try it in **forced-colors**. §9.2 draws these rings as inset box-shadows
 * and needs a whole `@media (forced-colors: active)` block to restore them,
 * because that mode forces `box-shadow: none`. A negative `outline-offset` is
 * painted there, so no fallback is needed.
 */
export const FocusLadder: Story = { render: () => <Live /> };

/**
 * THE SEARCH FIELD, and two things Figma gets wrong inside it.
 *
 * **Press `/` with nothing focused** — the field focuses and selects. The
 * placeholder advertises the shortcut (`Search in Customers ( / )`) and nothing
 * in Figma implements it; §6 is blunt that *"having advertised it, not shipping
 * it is worse than never having said so."*
 *
 * **Then press `/` while typing in the field itself** — you get a literal slash.
 * Without that guard the bar hijacks every forward slash on the page.
 *
 * **Hover the field, then hover an action.** Both get *lighter*. §4.5: Figma's
 * field hover is `chrome/item-hover`, which is **darker than `chrome/raised`** —
 * so the search field is the only control in the bar that *recedes* when you
 * point at it while the other three advance. One role used as an absolute value
 * rather than a relative step.
 *
 * The scope caret is **24 × 24** here; Figma's is 16 × 16 on a control its own
 * doc frame calls a button, and §5.6 works through why no 2.5.8 exception
 * rescues it — Equivalent fails outright, and Spacing excuses proximity, not
 * size.
 *
 * ── THE FIELD'S OWN COLOUR AND SIZE ──────────────────────────────────────────
 *
 * **The caret moved; the edge and the placeholder did not.** §2.21.3 measures
 * what the bar is painted with, and three roles sit a long way off it. The caret
 * was the outlier by a distance — `blue/900` `#94B3F2` is **31.39 ΔE** from the
 * drawn `#408DFB`, a pale periwinkle where the drawing is a saturated blue. It
 * is now `blue/1000` `#769BE7` at ~12 and 4.20:1 on the field. `blue/1200` is
 * the nearest step and was **not** taken: 2.43:1, and this role is the field's
 * focus ring too.
 *
 * The edge and the placeholder are 15.68 and 17.95 ΔE off, and both stay light
 * for the same reason — at 1px and at 13px the drawn value is too dim to do its
 * job. `neutral/1100` `#71758F` is ~2 ΔE from the drawn `#6C718A` and was tried:
 * it reads muted against a crisp reference ring and falls to **2.31:1** against
 * the field's own fill. `neutral/1000` gives 5.56 on the bar and 3.69 on the
 * fill. The placeholder's drawn `#838195` is **3.04:1** against a 4.5:1
 * requirement, and it is this field's only visible label.
 *
 * **The field is 32 tall and its placeholder is 13/20**, both down from what
 * §2.21 measures (36, and 16/24). Sight along the top edges: the field, the four
 * actions and the `+` tile now start on one line, the way the reference draws
 * them. And the bar holds exactly two pieces of text — this and the org label —
 * where 16/24 made the placeholder the largest type in the chrome, three steps
 * above the nav labels a few pixels to its left. §3.5 had already argued the org
 * down to 13/20 as *"the size every other label in the product uses"*; this is
 * that argument applied to the other one.
 */
export const Search: Story = { render: () => <Live /> };

/**
 * THE OPTIONAL PARTS.
 *
 * **A long org name.** §5.4: Figma's switcher is `HUG` with `textTruncation:
 * DISABLED` inside a bar whose root is `clipsContent: true`, so a 40-character
 * tenant name pushes the whole right-hand cluster off the end and is silently
 * cut. It caps at 20ch with an ellipsis here — the cluster must not move.
 *
 * **No org at all.** §9.2: the auto margin lives on the cluster wrapper, not on
 * the org switcher. With it on the org, removing the org left nothing carrying
 * the margin — the md measured the whole right cluster collapsing to x=560 with
 * 739px of empty bar after it.
 */
export const OrgVariants: Story = {
  render: () => (
    <Stack gap={0}>
      <Live orgName="Zylker Corporation International Holdings Limited" />
    </Stack>
  ),
};
