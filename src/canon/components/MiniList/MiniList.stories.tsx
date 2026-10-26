import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MiniList } from './MiniList';
import type { MiniListItem } from './MiniList';
import { Stack, Surface, Text } from '../../primitives';
import { ActionBar } from '../ActionBar/ActionBar';

/**
 * §2.28 — the left column of a split view. **All nine of the md's contrast
 * figures reproduce exactly** against our primitives, as do both source figures
 * and the `text/tertiary` trap.
 *
 * **There was no component.** 75 raw nodes across two boards, one of them a
 * `#D9D9D9` placeholder rectangle the panel was drawn on top of and which
 * shipped with it.
 */
const meta = {
  title: 'Components/MiniList', component: MiniList,
  parameters: { layout: 'fullscreen' },
  args: { label: 'Invoices', items: [], activeId: null, onActivate: () => {} },
} satisfies Meta<typeof MiniList>;
export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS: MiniListItem[] = [
  { id: '1', name: 'Kaniyan Amudhan', amount: '₹372.00', meta: ['INV-4318', '01 Jul 2024'], status: 'Overdue by 30 days', statusVariant: 'overdue' },
  { id: '2', name: 'Meridian Textiles', amount: '₹3,12,750', meta: ['INV-4317', '28 Jun 2024'], status: 'Sent', statusVariant: 'pending' },
  { id: '3', name: 'Anantha Foods', amount: '₹4,820', meta: ['INV-4316', '24 Jun 2024'], status: 'Paid', statusVariant: 'success' },
  { id: '4', name: 'Kaveri Logistics and Warehousing Private Limited', amount: '₹1,84,500', meta: ['INV-4315', '21 Jun 2024'], status: 'Partially paid', statusVariant: 'in-progress' },
  { id: '5', name: 'Nilgiri Retail', amount: '₹58,120', meta: ['INV-4314', '18 Jun 2024'], status: 'Draft', statusVariant: 'draft' },
  { id: '6', name: 'Bharat Pharma', amount: '₹9,21,340', meta: ['INV-4313', '15 Jun 2024'], status: 'Sent', statusVariant: 'pending' },
  { id: '7', name: 'Suryodaya Energy', amount: '₹76,050', meta: ['INV-4312', '11 Jun 2024'], status: 'Overdue by 7 days', statusVariant: 'overdue' },
  { id: '8', name: 'Konark Ceramics', amount: '₹23,640', meta: ['INV-4311', '08 Jun 2024'], status: 'Paid', statusVariant: 'success' },
  { id: '9', name: 'Vindhya Motors', amount: '₹5,07,300', meta: ['INV-4310', '04 Jun 2024'], status: 'Sent', statusVariant: 'pending' },
  { id: '10', name: 'Arcot Interiors', amount: '₹15,980', meta: ['INV-4309', '01 Jun 2024'], status: 'Draft', statusVariant: 'draft' },
];

function Split(p: { withSelect?: boolean; items?: MiniListItem[] }) {
  const [active, setActive] = useState('2');
  const [bulk, setBulk] = useState<ReadonlySet<string>>(new Set());
  const items = p.items ?? ITEMS;
  return (
    <div className="flex h-dvh bg-surface-canvas">
      <MiniList
        label="Invoices"
        items={items}
        activeId={active}
        onActivate={setActive}
        selection={p.withSelect ? { selected: bulk, onChange: setBulk } : undefined}
        views={[
          { id: 'all', label: 'All Invoices' },
          { id: 'unpaid', label: 'Unpaid Invoices' },
          { id: 'overdue', label: 'Overdue Invoices' },
        ]}
        viewId="all"
        onViewChange={() => {}}
        onCreate={() => {}}
        moreEntries={[
          { id: 'sort', label: 'Sort by', icon: 'sort', children: [
            { id: 'date', label: 'Date', checked: true, onSelect: () => {} },
            { id: 'amount', label: 'Amount', checked: false, onSelect: () => {} },
          ] },
          { separator: true },
          { id: 'refresh', label: 'Refresh List', icon: 'refresh', onSelect: () => {} },
        ]}
      />
      <Surface tone="canvas" pad={10} grow>
        <Stack gap={4}>
          <Text size="heading">{items.find((i) => i.id === active)?.name}</Text>
          <Text tone="secondary">
            The details pane. Selecting a row swaps this and leaves the list exactly where it was.
          </Text>
          {p.withSelect ? (
            <Text size="body-sm" tone="tertiary">
              Ticked for bulk: {bulk.size === 0 ? 'none' : [...bulk].join(', ')}
            </Text>
          ) : null}
        </Stack>
      </Surface>
    </div>
  );
}

/**
 * **A NAVIGATION CONTROL, NOT A LIST OF LINKS.** §5: *"a user arrowing through
 * seven links navigates seven times."*
 *
 * **Tab into the list — one stop.** ↑ ↓ move the active option, Home and End
 * reach the ends, Enter opens. Roving `tabindex`, and
 * `scrollIntoView({ block: 'nearest' })` so arrowing scrolls by the smallest
 * amount rather than centring on every press.
 *
 * **Scroll down, then click a row.** The list does not move. That is the entire
 * reason the pattern exists — a list that jumps to the top on selection is one
 * the user has to re-find their place in every single time.
 *
 * **The fourth name is 48 characters.** It ellipsises, the amount does not move,
 * and the row is still 93.
 */
export const Default: Story = { args: { label: 'Invoices', items: ITEMS }, render: () => <Split /> };

/**
 * **THE SELECTION IS AN EDGE, AND THE FILL IS REINFORCEMENT.**
 *
 * Look at the selected row, then imagine the fill removed — the 2px
 * `primary/default` bar is still there, and it is the signal.
 *
 * It has to be. `surface/selected` is **1.13:1** against its neighbour in Light
 * and **1.02:1** in Dark, where the selected row is actually *darker* than the
 * rows around it and reads as receding rather than chosen. The source's own
 * `#F8F7FC` is 1.07. The edge is 3.83 Light and 5.76 Dark.
 *
 * **This is the third component to route around that role** — the table
 * (§4.5), the menu, and now this. §8 decision 4: either repoint it at something
 * with contrast in both modes, or rename it `surface/selected-subtle` and write
 * the accent-edge rule into the canon as the actual selection pattern.
 *
 * It is an **inset shadow, never `border-inline-start`**: a border shifts the
 * row's content 2px on select, which is a visible twitch on every arrow press.
 * And because forced-colors discards `box-shadow`, `index.css` repaints it there
 * as a real border off the row's `data-zf-selected`.
 */
export const Selection: Story = { args: { label: 'Invoices', items: ITEMS }, render: () => <Split /> };

/**
 * **TWO SELECTIONS, AND THEY MUST NOT BE CONFUSED.**
 *
 * "Which record am I reading" is the route. "Which records am I acting on" is
 * the checkbox. **Tick a box and the pane does not change** — without
 * `stopPropagation` on the checkbox, every bulk tick also navigates.
 *
 * The row is still clickable everywhere else, and a list with no bulk actions
 * simply omits `selection` and shows no boxes at all.
 */
export const BulkSelection: Story = {
  args: { label: 'Invoices', items: ITEMS },
  render: () => <Split withSelect />,
};

/**
 * **THE STATUS, AND THE ROLE THAT HAD TO MOVE.**
 *
 * The source draws it `#00B050` at 12px — **2.87:1**, a 1.4.3 failure on the one
 * field that says what state the record is in.
 *
 * It started on `text/tertiary` here and had to move too: 4.52:1 on a default
 * row and **4.01:1 on the selected one**. *"A role that passes on one row and
 * fails on the next is not a role you can put text in."* `text/secondary` holds
 * 6.03 everywhere. Second component this week to hit `text/tertiary`'s 0.02
 * margin.
 *
 * The tone is an attribute, not a variant axis — four states × four tones is
 * sixteen variants for a colour. Measured on both fills in both panes, the three
 * tones run **6.24 to 11.38**, all clear of 4.5.
 *
 * **The word carries the meaning and the colour only reinforces it**, which is
 * what keeps this out of 1.4.1. Read the statuses with the colour ignored and
 * nothing is lost.
 */
export const StatusBadges: Story = { args: { label: 'Invoices', items: ITEMS }, render: () => <Split /> };

/**
 * **PANE.** Switch to Dark and check two things: the separators, and the
 * selected edge.
 *
 * The fill tells you nothing there — 1.02:1, a selected row *darker* than its
 * neighbours — so the edge is doing all of it, at 5.76.
 *
 * The checkboxes are fine here; `zf-mini-list.md`'s own checklist warns they
 * render as white squares in Dark, which is Figma's open item 38. Ours has been
 * on `surface/default` rather than the `base/white` primitive since it was
 * built.
 */
export const PaneAndHue: Story = {
  args: { label: 'Invoices', items: ITEMS },
  render: () => (
    <div data-theme="dark"><Split withSelect /></div>
  ),
};

/**
 * **The bar lands in the mini list's OWN toolbar**, on the same side as the
 * checkboxes that filled it — not over in the detail column. The selection is a
 * fact about this list, and a bar on the far side of the split makes the user
 * look away from what they are ticking to read what they have ticked.
 *
 * `density="compact"`, because 353px has room for the count and nothing else:
 * the primary action, the wordless trio and every named action collapse into
 * one **Actions** menu, keeping §3.2's ordering and the separators between the
 * three clusters. The `Esc` hint goes — it is the only thing in the bar that is
 * not a control — while Escape itself still clears, because the document
 * listener does not know about density.
 *
 * The toolbar underneath is `hidden`, never unmounted: it owns the view
 * switcher's open menu and its scroll position, and the 56px cell never changes
 * height, so ticking the first checkbox cannot move the list under the pointer
 * that just clicked it.
 */
export const BulkBar: Story = {
  render: function Render() {
    const [active, setActive] = useState('2');
    const [bulk, setBulk] = useState<ReadonlySet<string>>(new Set(['1', '3', '7']));
    return (
      <div className="flex h-dvh bg-surface-canvas">
        <MiniList
          label="Invoices" items={ITEMS} activeId={active} onActivate={setActive}
          selection={{ selected: bulk, onChange: setBulk }}
          views={[{ id: 'all', label: 'All Invoices' }]} viewId="all"
          onViewChange={() => {}} onCreate={() => {}}
          bar={bulk.size > 0 ? (
            <ActionBar
              density="compact"
              count={bulk.size}
              total={ITEMS.length}
              primary={{ id: 'reminder', label: 'Send Reminder', onSelect: () => {} }}
              iconActions={[
                { id: 'mail', label: 'Email selected', icon: 'mail', onSelect: () => {} },
                { id: 'print', label: 'Print selected', icon: 'print', onSelect: () => {} },
                { id: 'pdf', label: 'Export as PDF', icon: 'pdf', onSelect: () => {} },
              ]}
              actions={[
                { id: 'payment', label: 'Record Payment', onSelect: () => {} },
                { id: 'sent', label: 'Mark as Sent', onSelect: () => {} },
                { id: 'void', label: 'Void', onSelect: () => {} },
              ]}
              onToggleAll={(next) => setBulk(next ? new Set(ITEMS.map((i) => i.id)) : new Set())}
              onClear={() => setBulk(new Set())}
            />
          ) : undefined}
        />
      </div>
    );
  },
};
