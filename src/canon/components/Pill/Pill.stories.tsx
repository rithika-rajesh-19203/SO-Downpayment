import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Pill } from './Pill';
import { Icon } from '../../icons';
import { Inline, Stack, Text } from '../../primitives';

/**
 * INCOMING. §9.6's checklist is the review script, and its first row is the one
 * that matters: **tab to a selected pill — the ring must have a visible gap.**
 * If it hugs the pill, `outline-offset` is missing and the ring is 1.27:1 in
 * Light and 1.00:1 in Dark, where `focus/ring` and `primary/selected` are the
 * same variable.
 */
const meta = {
  title: 'Components/Pill', component: Pill, parameters: { layout: 'padded' },
  args: { label: 'All Transactions', selected: false, onSelectedChange: () => {} },
} satisfies Meta<typeof Pill>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ALL 8 VARIANTS. `Selection` × `State`, and State is pseudo-classes — so this
 * is two real variants and six states the browser composes.
 *
 * **Tab across the row.** §2.2 is the defect worth seeing: Figma draws the ring
 * with an `INSIDE` stroke on a frame inset 2px, which leaves *zero* gap, so the
 * ring's inner neighbour is the pill rather than the page. On a selected pill
 * that measures 1.27:1 in Light and **1.00:1 in Dark — the same variable.** The
 * `outline-offset` here puts the page on both sides: 4.32 / 7.69, every variant.
 */
export const Variants: Story = {
  render: () => (
    <Stack gap={6}>
      {([['unselected', false], ['selected', true]] as const).map(([l, sel]) => (
        <Inline key={l} gap={6} align="center">
          <Text size="caption" tone="tertiary" className="w-rail shrink-0">{l}</Text>
          <Pill label="All Transactions" selected={sel} onSelectedChange={() => {}} />
          <Pill label="With an icon" selected={sel} onSelectedChange={() => {}}
            icon={<Icon name="items" size="md" tone="inherit" />} />
          <Pill label="Disabled" selected={sel} onSelectedChange={() => {}} disabled />
        </Inline>
      ))}
      <Text size="body-sm" tone="secondary">
        Selection is `aria-pressed`, not a class — §8: the attribute already carries the
        state and is what the screen reader reads, so duplicating it into a class creates
        two sources of truth that will drift.
      </Text>
    </Stack>
  ),
};

/**
 * SELECTED + DISABLED — §4.3, and the clearest one-token fix in any of these
 * files.
 *
 * `primary/border` is a **light** blue in Light and a **dark** blue in Dark.
 * Figma's label is `primary/on-primary` — white, then near-black. So in each
 * mode the label is the *same lightness as its own background*: **1.65:1** and
 * **1.93:1**. Exempt from 1.4.3, and unreadable.
 *
 * `text/default` inverts the other way — dark on the light fill, light on the
 * dark one: **9.18** and **8.72**. Switch panes and check both.
 */
export const SelectedDisabled: Story = {
  render: () => (
    <Inline gap={6} align="center">
      <Pill label="Overdue" selected disabled onSelectedChange={() => {}} />
      <Text size="body-sm" tone="secondary">
        the label must be readable in both panes — 9.18 Light, 8.72 Dark
      </Text>
    </Inline>
  ),
};

/**
 * THE BORDER THAT IS LEFT FAILING, ON PURPOSE.
 *
 * The unselected border is `border/default` at **1.31:1** — the sixth component
 * with this failure. `border/control` exists and would take it to 4.52.
 *
 * §9 does not bind it, and §4.4a is why: **the unselected pill's entire hover
 * feedback is a border colour change.** `neutral/1100` sits 1.3 L\* from
 * `blue/1200`, so the hover would collapse to a hue-only shift at **1.05:1** —
 * invisible in greyscale and to anyone with a blue-yellow deficiency.
 *
 * Hover the first pill: the border shift is 3.29:1 today. That is what rebinding
 * would spend.
 */
export const RestingBorder: Story = {
  render: () => (
    <Stack gap={5}>
      <Inline gap={6} align="center">
        <Pill label="Hover me" selected={false} onSelectedChange={() => {}} />
        <Text size="body-sm" tone="secondary">
          border/default 1.31:1 → primary/default on hover, a 3.29:1 shift
        </Text>
      </Inline>
      <Inline gap={6} align="center">
        <Pill label="Hover me" selected={false} onSelectedChange={() => {}}
          className="border-border-control" />
        <Text size="body-sm" tone="secondary">
          border/control 4.52:1 — but the hover shift collapses to 1.05:1
        </Text>
      </Inline>
    </Stack>
  ),
};

/**
 * TRUNCATION — §3.5: Figma has HUG width, `textTruncation: DISABLED`, no
 * `maxWidth` and `clipsContent: false`, so a long category name grows the chip
 * without limit. Filter chips carry user-generated names, so this will happen.
 *
 * §9.2 puts all three declarations on the **label span**, not the button: the
 * `max-width` is 20 characters *of label* (on the button it would also pay for
 * padding, border, icon and gap, leaving roughly 13), `text-overflow` only
 * applies to a block container, and `min-width: 0` is what lets a flex item
 * shrink below its content at all.
 *
 * You should see a real ellipsis, not a hard clip mid-glyph — and the icon must
 * stay 16px rather than squashing.
 */
export const Truncation: Story = {
  render: () => (
    <Stack gap={4} align="start">
      <Pill label="Overdue" selected={false} onSelectedChange={() => {}} />
      <Pill label="Awaiting supplier acknowledgement" selected onSelectedChange={() => {}} />
      <Pill
        label="Awaiting regional finance controller approval"
        selected={false}
        onSelectedChange={() => {}}
        icon={<Icon name="alert-triangle" size="md" tone="inherit" />}
      />
    </Stack>
  ),
};

/** A filter bar — the thing the component exists for. Multiple can be on at once. */
export const FilterBar: Story = {
  render: function F() {
    const [on, setOn] = useState<string[]>(['Overdue']);
    const filters = ['Overdue', 'In progress', 'Approved', 'Draft', 'Cancelled', 'Awaiting supplier'];
    return (
      <Stack gap={5}>
        <Inline gap={4} wrap>
          {filters.map((f) => (
            <Pill
              key={f}
              label={f}
              selected={on.includes(f)}
              onSelectedChange={(next) => setOn(next ? [...on, f] : on.filter((x) => x !== f))}
            />
          ))}
        </Inline>
        <Text size="caption" tone="tertiary">{on.length} applied</Text>
        <Text size="body-sm" tone="secondary">
          §7: if only one could be on at a time and they changed the view, this would be a
          tab, not a pill. Pills are additive filters over one view.
        </Text>
      </Stack>
    );
  },
};
