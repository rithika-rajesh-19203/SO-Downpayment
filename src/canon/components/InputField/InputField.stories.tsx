import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputField } from './InputField';
import { Stack, Text } from '../../primitives';

const meta = {
  title: 'Components/InputField', component: InputField, parameters: { layout: 'padded' },
  args: { placeholder: 'Search orders' },
} satisfies Meta<typeof InputField>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * THE BOX ONLY. §1: reach for **`Field`** by default — this stays public because
 * a table's inline edit cell and a toolbar search need a bare box, but anything
 * on a form wants the wrapper.
 *
 * **18 Figma variants collapse to 2 here.** `States` (5) are pseudo-classes, and
 * §5 measures that Hover and On-Click render identically anyway, so five options
 * already produce four appearances. `Content` (placeholder vs value) is not a
 * variant in a real input — it is whether the element has a value, and
 * `::placeholder` is the selector. That leaves `error`.
 *
 * Hover the first one, then tab into it. Those are the two states Figma draws as
 * four variants.
 */
export const States: Story = {
  render: () => (
    <Stack gap={5} className="max-w-rail">
      {([
        ['default — hover it, then tab into it', {}],
        ['with icons — both default OFF (§3)', { icon: 'search' as const, iconRight: 'chevron-down' as const }],
        ['error', { error: true }],
        ['disabled', { disabled: true }],
        ['disabled + error — deliberately identical (§5)', { disabled: true, error: true }],
      ] as const).map(([label, props]) => (
        <Stack key={label} gap={2}>
          <Text size="caption" tone="tertiary">{label}</Text>
          <InputField placeholder="Search orders" {...props} />
        </Stack>
      ))}
    </Stack>
  ),
};

/**
 * `Content` IS NOT A VARIANT. §3.2 added a `Content = placeholder | value` axis
 * because "a designer showing a form with data had to override the text colour
 * by hand on every field". A browser does that for free: the value is
 * `text/default` and `::placeholder` is its own selector.
 *
 * The two below differ only in whether they have a value. Nine of Figma's
 * eighteen variants exist to express this row.
 */
export const PlaceholderVsValue: Story = {
  render: () => (
    <Stack gap={5} className="max-w-rail">
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">placeholder — text/tertiary</Text>
        <InputField placeholder="Search orders" />
      </Stack>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">value — text/default</Text>
        <InputField defaultValue="PO-2026-00816" />
      </Stack>
      <Text size="body-sm" tone="secondary">
        The placeholder is `text/tertiary`, **not** `text/placeholder`. §4.3: that role
        is neutral/1000 at 2.85:1, below the 4.5:1 that 1.4.3 asks of text — "a role named
        text/placeholder that cannot be used for placeholder text is a trap." Retune it or
        retire it; §8 Q3.
      </Text>
    </Stack>
  ),
};

/**
 * THE BORDER — the finding that outgrew the component.
 *
 * §4.2 walks the whole ramp: divider 1.20, default 1.31, **strong 1.71** — the
 * darkest, and what the input was bound to — and hover 2.85. **Not one of the
 * five clears 1.4.11's 3:1.** "So this is not the input field choosing a bad
 * border — there is no correct choice available."
 *
 * `border/control` at neutral/1100 (4.52:1) is the role §4.2 proposes and §6's
 * CSS already uses. It now exists. The second row is what `border/strong` looks
 * like — the best that was available before.
 */
export const RestingBorder: Story = {
  render: () => (
    <Stack gap={5} className="max-w-rail">
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">border/control — neutral/1100, 4.52:1 ✓</Text>
        <InputField placeholder="Search orders" />
      </Stack>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">border/strong — neutral/800, 1.71:1 ✗ the darkest role there was</Text>
        <InputField placeholder="Search orders" className="border-border-strong" />
      </Stack>
    </Stack>
  ),
};
