import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ActionBar } from './ActionBar';
import { Stack, Surface, Text } from '../../primitives';

/**
 * §2.26 — and **all six of the md's rebuild contrast figures reproduce exactly**
 * against our primitives, as do its three ΔE values and the 1.45:1 button
 * stroke.
 *
 * **There was no component.** A 37-node group of raw rectangles: no auto-layout,
 * no variant, **no bound paint**, no text style — and no expression at all of
 * the thing that makes an action bar an action bar, which is the moment it
 * replaces the page header.
 */
const meta = {
  title: 'Components/ActionBar', component: ActionBar,
  parameters: { layout: 'padded' },
  args: { count: 6, onClear: () => {} },
} satisfies Meta<typeof ActionBar>;
export default meta;
type Story = StoryObj<typeof meta>;

const ICONS = [
  { id: 'mail', label: 'Email selected', icon: 'mail' as const, onSelect: () => {} },
  { id: 'print', label: 'Print selected', icon: 'print' as const, onSelect: () => {} },
  { id: 'pdf', label: 'Export as PDF', icon: 'pdf' as const, onSelect: () => {} },
];
const ACTIONS = [
  { id: 'custom', label: 'Custom Button', onSelect: () => {} },
  { id: 'bill', label: 'Convert to bill', onSelect: () => {} },
  { id: 'issued', label: 'Mark as Issued', onSelect: () => {} },
  { id: 'void', label: 'Void', onSelect: () => {} },
  { id: 'delete', label: 'Delete', onSelect: () => {} },
];

function Demo(p: Partial<React.ComponentProps<typeof ActionBar>>) {
  const [count, setCount] = useState(p.count ?? 6);
  if (count === 0) {
    return (
      <Surface pad={10} border="default">
        <Text tone="secondary">Selection cleared — the bar unmounts and the header returns.</Text>
      </Surface>
    );
  }
  return (
    <ActionBar
      count={count} total={35}
      primary={{ id: 'bulk', label: 'Bulk Update', onSelect: () => {} }}
      iconActions={ICONS}
      actions={ACTIONS}
      onClear={() => setCount(0)}
      {...p}
    />
  );
}

/**
 * **THE BAR.** Four things to try.
 *
 * **Tab into it — one stop.** §6: a toolbar is a single tab stop, arrows move
 * within it, Home and End reach the ends. Eight tab stops in a bar that appears
 * mid-task means eight presses to escape it, on every selection change.
 *
 * **Then disable whichever control holds the tab stop.** The bar is still
 * reachable: the roving effect depends on the DATA, not on `actions.length`,
 * which does not change when a `disabled` flag flips — with stale deps the
 * toolbar can end up with zero tabbable controls, which is 2.1.1.
 *
 * **Press Escape.** The selection clears. It is a *document* listener that bails
 * on `defaultPrevented`, because focus is usually in the table rather than in
 * the bar — a listener on the bar element never fires and Escape looks dead. The
 * `defaultPrevented` check is what stops it eating the key from every dropdown
 * and dialog on the page: the innermost overlay wins, because it called
 * `preventDefault()` when it closed itself.
 *
 * **Look at the ✕.** It announces as **"Clear selection"**, never "Close" — it
 * does not close anything, and a label that lies is worse than no label. It is
 * 32 × 32 where the source drew **14 × 14**, an outright 2.5.8 failure.
 */
export const Default: Story = { args: { count: 6 }, render: () => <Demo /> };

/**
 * **THE COUNT, which is the whole job.**
 *
 * In the source it is **4.39:1** — a 1.4.3 failure at 12px, on the one number
 * the component exists to report, and the only thing on screen telling the user
 * what the next button press will act on. Here `primary/text` on
 * `primary/subtle` is **5.25 Light / 7.56 Dark**.
 *
 * "Selected" was pure **`#000000`** — 19.32 ΔE from `text/default` and a value
 * that appears nowhere else in 26 components. Not a token: what happens when a
 * colour picker opens at its default.
 *
 * **Set the count to the total and the numeral becomes a check.** §3.4: a check
 * reads as "all of them" without asking the user to compare a number against a
 * total they cannot see. It is derived from `count >= total`, not asked for as a
 * variant — the caller already knows the total, and making them pass a variant
 * name is asking them to compute it twice.
 *
 * `tabular-nums`, so 6 → 7 cannot resize the chip.
 */
export const CountAndScope: Story = {
  args: { count: 35 },
  render: () => (
    <Stack gap={8}>
      <Demo count={6} />
      <Demo count={35} />
    </Stack>
  ),
};

/**
 * **THE JOINED TRIO, and the CSS trap in it.**
 *
 * The three icon buttons share their borders so they read as one control with
 * three settings rather than three unrelated actions. Figma expresses that as
 * `itemSpacing: -1`, which it accepts.
 *
 * **CSS will not.** A negative `gap` is clamped to zero by the spec — the
 * declaration is accepted and then ignored, which is the worst kind of failure
 * because nothing warns you. It is a negative *margin* on every child after the
 * first, and the hovered button is raised so its border draws over its
 * neighbour's rather than under it. Three 32px buttons occupy **94**, not 96.
 *
 * The source got the same look by placing rectangles at a 31px pitch, **by
 * coincidence** — which survives exactly until a label changes.
 *
 * **`pdf` is a dashed placeholder.** §3.6 uses `icon / documents` for the third
 * button and the reference image shows a PDF page; that correction is pending,
 * so the roster carries the name and nothing else. `mail` and `print` are
 * derived from §3.6's own path data.
 */
export const JoinedIcons: Story = {
  args: { count: 6 },
  render: () => <Demo actions={[]} />,
};

/**
 * **NARROW — §9.4's priority list.**
 *
 * Drag the frame in. Named actions move into ⋯ from the right; the count and the
 * dismiss pair never collapse.
 *
 * **The count is never hidden**, because it is the only feedback that the
 * selection exists at all. **The dismiss target is never hidden**, because on a
 * touch device it is the only way out. **The ⋯ trigger is never hidden**,
 * because at the narrowest widths it is the only route to the actions — which is
 * why the trailing group is guarded on `hasTrailing` and not on
 * `visible.length`.
 *
 * The thresholds read `borderBoxSize`, not `contentRect`. The bar sets
 * `padding-inline: 8`, so `contentRect` is **16 narrower** than the element and
 * every threshold would fire one action early.
 *
 * **Never `flex-wrap`.** A wrapped action bar is two rows tall, which breaks the
 * one promise §7 makes — that nothing reflows. `overflow-*-clip` on both axes
 * enforces it: a change that causes a wrap clips visibly instead of silently
 * shifting the table.
 */
export const Narrow: Story = {
  args: { count: 6 },
  render: () => (
    <Stack gap={8}>
      <div className="max-w-3xl"><Demo /></div>
      <div className="max-w-lg"><Demo /></div>
    </Stack>
  ),
};

/**
 * **PANE.**
 *
 * §4.4 reports that building this bar in Figma exposed **every Secondary button
 * in the system rendering 1.04:1 in Dark** — 217 fills bound to the single-mode
 * `ZF Primitives` while their labels flipped with the theme. Blank white slabs
 * with invisible text.
 *
 * **That finding does not reach us**, and it was checked rather than assumed:
 * our `Button` has been on semantic roles since it was built, and its rest fill
 * is already `surface/default` rather than `surface/raised` — which §4.4 calls
 * load-bearing, because `raised` and `hover` are the same primitive in Dark and
 * a Secondary button on `raised` would have a dead hover state.
 *
 * Switch the pane and the labels are there.
 */
export const PaneAndHue: Story = {
  args: { count: 6 },
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
