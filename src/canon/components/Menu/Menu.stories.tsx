import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { Menu } from './Menu';
import type { MenuEntry } from './Menu';
import { Button } from '../Button/Button';
import { Stack, Text } from '../../primitives';

/**
 * `design-refs/zf-menu.md` §2.25 — and **all 20 of its figures reproduce exactly
 * against our own primitives.** Every contrast pair in §4.3, both of §3.2 and
 * §4.5's traps, and all three source numbers. The first md in this series to
 * score perfect.
 *
 * **There was no component.** 22 hand-drawn nodes, **not one bound paint**, no
 * instance, no text style, and no state beyond the two that happened to be
 * drawn.
 *
 * **§7 is most of what a menu is, and none of it is in the drawing** — arrows
 * that wrap, typeahead, a 150ms hover intent, a safe triangle to the flyout, and
 * an Escape ladder that returns focus to the trigger.
 */
const meta = {
  title: 'Components/Menu', component: Menu,
  parameters: { layout: 'centered' },
  args: { anchor: null, open: false, onClose: () => {}, entries: [], label: 'Menu' },
} satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;

const ENTRIES: MenuEntry[] = [
  {
    id: 'sort', label: 'Sort by', icon: 'sort',
    children: [
      { id: 'date', label: 'Date', checked: true, onSelect: () => {} },
      { id: 'number', label: 'Purchase Order#', checked: false, onSelect: () => {} },
      { id: 'vendor', label: 'Vendor Name', checked: false, onSelect: () => {} },
    ],
  },
  { separator: true },
  {
    id: 'import', label: 'Import', icon: 'import',
    children: [
      { id: 'imp-po', label: 'Import Purchase Orders', onSelect: () => {} },
      { id: 'imp-rec', label: 'Import Purchase Receives', onSelect: () => {} },
    ],
  },
  { separator: true },
  {
    id: 'export', label: 'Export', icon: 'export',
    children: [
      { id: 'exp-po', label: 'Export Purchase Order', onSelect: () => {} },
      { id: 'exp-view', label: 'Export Current View', onSelect: () => {} },
      { id: 'exp-rec', label: 'Export Purchase Receives', onSelect: () => {} },
    ],
  },
  { separator: true },
  { id: 'prefs', label: 'Preferences', icon: 'settings', onSelect: () => {} },
  { id: 'fields', label: 'Manage Custom Fields', icon: 'table-config', onSelect: () => {} },
  { separator: true },
  { id: 'refresh', label: 'Refresh List', icon: 'refresh', onSelect: () => {} },
  { id: 'delete', label: 'Delete this view', icon: 'close', tone: 'danger', onSelect: () => {} },
];

function Demo({ entries = ENTRIES }: { entries?: MenuEntry[] }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <Stack gap={8} align="center">
      <Button ref={ref} emphasis="secondary" onClick={() => setOpen((o) => !o)}>
        More actions
      </Button>
      <Menu anchor={ref.current} open={open} onClose={() => setOpen(false)}
        entries={entries} label="More actions for Purchase Orders" />
      <Text size="body-sm" tone="secondary">
        ↑ ↓ wrap · Home / End · type to jump · → opens · ← closes · Esc returns to the trigger
      </Text>
    </Stack>
  );
}

/**
 * **THE MENU.** Four things the source could not hold, in the order §7 puts them.
 *
 * **Press `↓` past the last row.** It wraps. A menu wraps; a listbox does not.
 *
 * **Type "ref" quickly** — it jumps to Refresh List. Wait a second and press "r"
 * and it starts a new search from the *next* row, so pressing "r" repeatedly
 * walks the r's rather than sticking on the first one. 500ms window.
 *
 * **Tab while it is open.** Nothing inside takes focus: §8 makes the panel the
 * only tabbable node and names the active row with `aria-activedescendant`. That
 * way Escape always has a focused element to return from, a disabled row can be
 * active without being tabbable, and the browser never scrolls a row behind the
 * trigger. The cost is paid explicitly — `scrollIntoView({block:'nearest'})` on
 * every move, because activedescendant does not scroll and the md measured the
 * active row 197px below the panel after 20 keystrokes.
 *
 * **Press and hold on a row, then release outside.** It does not dismiss.
 * `pointerdown` beats `click`, because that gesture is a drag.
 */
export const Default: Story = { args: { entries: ENTRIES }, render: () => <Demo /> };

/**
 * **THE FLYOUT, and the two invisible things holding it up.**
 *
 * **Sweep the pointer straight down across three submenu rows.** Nothing opens —
 * a 150ms intent absorbs it. Without that, a submenu fires every time the
 * pointer crosses its row on the way somewhere else.
 *
 * **Now hover `Export`, then move diagonally into the flyout.** It stays open.
 *
 * That one needs more than a corridor, and the md proves it: sampling the
 * straight line from a parent row's centre to the flyout's third row, the path
 * **crosses two sibling rows inside the panel**, each arming its own 150ms timer
 * that closes the flyout. Measured — hovering "Sort by" then "Preferences"
 * closed it every time, *with a 12px corridor in place*. What works is a **safe
 * triangle** from the pointer's last position to the flyout's near edge: inside
 * it, another row's timer is 300ms instead of 150.
 *
 * **The flyout opens RIGHT and flips left.** The source only ever draws the
 * flipped case, because its trigger sits at the right of a page header — and a
 * component that can only open left breaks the first time it is used on the left
 * of a screen. The **1px overlap** is the source's own fine judgement (it drew
 * 0.86) and it is kept.
 */
export const SubMenus: Story = { args: { entries: ENTRIES }, render: () => <Demo /> };

/**
 * **THE ACTIVE ROW, and why it is not filled blue.**
 *
 * The source fills its one active row `#408DFB` with white text — **3.27:1**, a
 * 1.4.3 failure at 13px, on the row the design most wants you to look at. It
 * clears 1.4.11 at 3.0, which is exactly why it looks fine in a screenshot. And
 * `#408DFB` is **4.79 ΔE from `#528EF4`**, the caret's blue eight nodes away in
 * the same drawing: the same intended colour drawn twice, neither owned. Seventh
 * appearance of that blue across the file.
 *
 * Here the active row is `surface/hover` with `text/default` — **14.05:1** — plus
 * a 2px inset `focus/ring` at **4.00:1** on that fill.
 *
 * **The ring is not decoration.** `surface/hover` against the panel is 1.08 / 1.07;
 * as a hover cue that is fine and every component in the system uses it, but
 * 2.4.7 wants a *visible* focus indicator and 1.4.11 sets 3:1. So the fill says
 * *the pointer or the keyboard is here* and the ring says *the keyboard is here* —
 * different facts, and a menu shows both at once, because a pointer can rest on
 * row 3 while the keyboard owns row 7.
 */
export const ActiveRow: Story = { args: { entries: ENTRIES }, render: () => <Demo /> };

/**
 * **DANGER, DISABLED, AND CHECKED.**
 *
 * **`tone: 'danger'` recolours the label and the glyph only, never the fill.**
 * The obvious choice is `danger/subtle`, and it is **1.00:1** against the panel
 * in Dark — `red/2000` against `neutral/2000`, luminances within a rounding
 * error — so a danger row would have **no hover state at all**. Verified. The
 * md's own Figma build shipped nine variants on it before catching this.
 *
 * **A disabled row is focusable.** Arrow onto it: it is reachable, announced, and
 * Enter does nothing. `aria-disabled`, never the native `disabled`, which removes
 * the button from the accessibility tree — *a disabled row the keyboard skips is
 * a disabled row nobody can discover.* Disabled also beats destructive: a
 * disabled danger row is `text/disabled`, not red.
 *
 * **`checked` makes the row a `menuitemcheckbox`** and puts `icon/check` in the
 * trailing slot. It is a glyph and not a fill, because `surface/selected` is
 * 1.13 / **1.02** and cannot carry that on its own — §11 decision 6.
 */
export const States: Story = {
  args: { entries: ENTRIES },
  render: () => (
    <Demo entries={[
      { id: 'a', label: 'Edit view', icon: 'edit', onSelect: () => {} },
      { id: 'b', label: 'Show archived', icon: 'eye', checked: true, onSelect: () => {} },
      { id: 'c', label: 'Show drafts', checked: false, onSelect: () => {} },
      { separator: true },
      { id: 'd', label: 'Duplicate view', disabled: true, onSelect: () => {} },
      { id: 'e', label: 'Delete this view', icon: 'close', tone: 'danger', onSelect: () => {} },
      { id: 'f', label: 'Delete permanently', tone: 'danger', disabled: true, onSelect: () => {} },
    ]} />
  ),
};

/**
 * **GEOMETRY — 240 / 232 / 160.**
 *
 * The panel is **240 fixed**, not `max-content`: left to hug, the md's rebuild
 * measured **180.00, 204.50 and 201.53** on three different sets of labels, two
 * of them fractional, so every row edge and glyph landed on a half pixel.
 *
 * **The edge is an inset `box-shadow`, not a `border`.** Figma's `INSIDE` stroke
 * does not consume layout and a `box-sizing: border-box` CSS border does — at 240
 * a 1px border gives a **230px row and a 158px label** where §3.3 needs 232 and
 * 160. `shadow/menu` carries both halves: the elevation and the inset ring.
 *
 * **The row is 32, not the source's 34.** 34 is what 13/AUTO produces — Inter at
 * 13px with automatic leading measures 15.73, the node rounds to 16, and
 * 9 + 16 + 9 = 34. Nobody chose it. 6 + 20 + 6 = 32 is the row height
 * `zf-header-action`, `zf-header-cta` and `zf-header-switcher` already use.
 *
 * **Put a 200-character label in a row** and it truncates at 160, the row stays
 * 32 tall, and the panel stays ≤ 320 wide.
 */
export const Geometry: Story = {
  args: { entries: ENTRIES },
  render: () => (
    <Demo entries={[
      { id: 'short', label: 'Export', icon: 'export', onSelect: () => {} },
      {
        id: 'long', icon: 'import',
        label: 'Import purchase orders from a comma-separated file exported by another system entirely',
        onSelect: () => {},
      },
      { id: 'noicon', label: 'No leading glyph at all', onSelect: () => {} },
    ]} />
  ),
};

/**
 * **PANE — and this is where the role that sounds right breaks.**
 *
 * The obvious surface for a floating panel is `surface/raised`. It is
 * `neutral/1900` in Dark — **the same primitive as `surface/hover`** — so a
 * hovered row on a raised panel is **1.00:1**. A menu built on it has no hover
 * state in Dark at all. Verified against our own tokens.
 *
 * So the panel is `surface/default`, on which hover is 1.08 / 1.07. Weak, but
 * real. **§11 decision 1 is the one that will bite someone**, because
 * `surface/raised` is the role whose name says "use me for a floating panel" and
 * it is the one that breaks.
 *
 * Switch the pane and check the ring on the active row: 4.00 Light, 7.21 Dark.
 */
export const PaneAndHue: Story = {
  args: { entries: ENTRIES },
  render: () => (
    <Stack gap={0}>
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} data-theme={theme} className="bg-surface-canvas p-10">
          <Demo />
        </div>
      ))}
    </Stack>
  ),
};

/**
 * `emphasis="strong"` — accented glyphs at rest and a **solid blue row** under
 * the pointer, label and glyph together. For a menu that IS the control's whole
 * content, rather than a footnote to something visible behind it.
 *
 * **The fill is `primary/hover`, not `primary/default`.** Measured: white on
 * `primary/default` `#3874EB` is **4.32:1**, which fails 1.4.3's 4.5 for the
 * 13px label sitting on it. `primary/hover` `#2762D9` is **5.48 Light / 8.62
 * Dark**. The glyphs at rest are `primary/default` at 4.32 against the panel —
 * fine, because 1.4.11 asks a graphic for 3:1, and an icon is not text.
 *
 * **Danger does not go blue.** A destructive row that takes the same colour as
 * "Clone" under the pointer has thrown away the one thing marking it, at the
 * moment the user is about to commit.
 */
export const StrongEmphasis: Story = {
  render: function Render() {
    const ref = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(true);
    return (
      <div className="p-10">
        <Button ref={ref} emphasis="secondary" icon="more" label="More actions"
          aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} />
        <Menu
          anchor={ref.current} open={open} onClose={() => setOpen(false)}
          label="More actions" align="start" emphasis="strong"
          entries={[
            { id: 'credit', label: 'Create Credit Note', icon: 'documents', onSelect: () => {} },
            { id: 'clone', label: 'Clone', icon: 'export', onSelect: () => {} },
            { id: 'barcode', label: 'Print Item Barcode', icon: 'print', onSelect: () => {} },
            { separator: true },
            { id: 'delete', label: 'Delete', icon: 'x-circle', tone: 'danger', onSelect: () => {} },
            { separator: true },
            { id: 'lock', label: 'Lock Debit Note', icon: 'pin', onSelect: () => {} },
            { id: 'prefs', label: 'Invoice Preferences', icon: 'settings', onSelect: () => {} },
          ]}
        />
      </div>
    );
  },
};
