import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';
import type { TextSize, TextTone, TextWeight } from './Text';
import { Inline, Stack, Surface } from './index';

const meta = {
  title: 'Primitives/Text',
  component: Text,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

const SIZES: TextSize[] = [
  'display', 'title-lg', 'title', 'heading', 'subheading',
  'body', 'body-sm', 'label', 'caption', 'overline',
];

const WEIGHTS: TextWeight[] = ['regular', 'medium', 'semibold', 'bold'];

const TONES: TextTone[] = [
  'default', 'secondary', 'tertiary', 'placeholder',
  'disabled', 'link', 'success', 'warning', 'danger',
];

/**
 * The 9 sizes, each at its default weight. `overline` is listed last because it
 * is a size AND a case, not a pure size.
 */
export const AllSizes: Story = {
  args: { children: 'Retainer Invoices' },
  render: () => (
    <Stack gap={6}>
      {SIZES.map((v) => (
        <Inline key={v} gap={8} align="baseline" justify="between">
          <Text size={v}>Retainer Invoices</Text>
          <Text size="caption" tone="tertiary">{v}</Text>
        </Inline>
      ))}
    </Stack>
  ),
};

/**
 * SIZE x WEIGHT — all 36 styles, and the reason the two are separate props.
 *
 * The previous component enumerated 13 fused roles, which could name only 6 of
 * these 36. `heading` at `bold` had no name at all, and `body-strong` was a name
 * for one cell of a grid. zf-scales.md is explicit: "every size exists in every
 * weight", composed from two classes.
 *
 * Read down a column to check that a weight is distinguishable at every size —
 * 500 against 600 at 10px is the pair that fails first, and `caption` is the row
 * to look at.
 */
export const SizeTimesWeight: Story = {
  args: { children: 'Sample' },
  render: () => (
    <Stack gap={4}>
      <Inline gap={8}>
        <Text size="caption" tone="tertiary" className="w-20 shrink-0" />
        {WEIGHTS.map((w) => (
          <Text key={w} size="caption" tone="tertiary" className="w-20 shrink-0">{w}</Text>
        ))}
      </Inline>
      {SIZES.map((v) => (
        <Inline key={v} gap={8} align="baseline">
          <Text size="caption" tone="tertiary" className="w-20 shrink-0">{v}</Text>
          {WEIGHTS.map((w) => (
            <Text key={w} size={v} weight={w} className="w-20 shrink-0">Aa 38</Text>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

/**
 * Every tone. Independent of `size` and `weight` — that separation is the point of the
 * component. `link` is `primary/text` (5.92:1), NOT `primary/default`, which is
 * 4.32:1 and fails WCAG 1.4.3 at 13px. md §2.24.8 caught that exact failure.
 */
export const AllTones: Story = {
  args: { children: 'Retainer Invoices' },
  render: () => (
    <Stack gap={8}>
      <Stack gap={4}>
        {TONES.map((t) => (
          <Inline key={t} gap={8} align="baseline" justify="between">
            <Text size="body" tone={t}>The quick brown fox jumps over the lazy dog</Text>
            <Text size="caption" tone="tertiary">{t}</Text>
          </Inline>
        ))}
      </Stack>
      <Surface tone="inverse" pad={8} radius="md">
        <Stack gap={2}>
          <Text size="body" weight="medium" tone="inverse">On an inverse surface</Text>
          <Text size="body" tone="inverse">tone=&quot;inverse&quot; — the only pairing that works here</Text>
        </Stack>
      </Surface>
    </Stack>
  ),
};

/**
 * SIZE x TONE. The argument for splitting these: the first version of this
 * component baked colour into the type role, so a secondary-toned heading or a
 * danger-toned label was unreachable without inventing a new role.
 */
export const SizeTimesTone: Story = {
  args: { children: 'Sample' },
  render: () => (
    <Stack gap={6}>
      {(['heading', 'body', 'body-sm', 'label', 'caption'] as TextSize[]).map((v) => (
        <Stack key={v} gap={2}>
          <Text size="caption" tone="tertiary">{v}</Text>
          <Inline gap={8} wrap align="baseline">
            {(['default', 'secondary', 'tertiary', 'link', 'danger'] as TextTone[]).map((t) => (
              <Text key={t} size={v} tone={t}>{t}</Text>
            ))}
          </Inline>
        </Stack>
      ))}
    </Stack>
  ),
};

/**
 * OVERFLOW — the state a design mock never shows and the one that determines
 * the real prop surface. `truncate` is the common case in a table cell.
 */
export const Overflow: Story = {
  args: { children: 'x' },
  render: () => (
    <Stack gap={8}>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">truncate — single line, ellipsis</Text>
        <Surface tone="sunken" pad={4} radius="sm" border="divider" className="w-rail">
          <Text size="body" truncate>
            Q2 Bicycle Production Plan — Chennai Facility, Line 3, Revision 14
          </Text>
        </Surface>
      </Stack>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">wrapping — the same string, unconstrained</Text>
        <Surface tone="sunken" pad={4} radius="sm" border="divider" className="w-rail">
          <Text size="body">
            Q2 Bicycle Production Plan — Chennai Facility, Line 3, Revision 14
          </Text>
        </Surface>
      </Stack>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">
          a title at length — checks the 20/28 line-height holds over two lines
        </Text>
        <Surface tone="sunken" pad={4} radius="sm" border="divider" className="w-rail">
          <Text size="title">Purchase Order Acknowledgement and Goods Receipt Note</Text>
        </Surface>
      </Stack>
    </Stack>
  ),
};

/**
 * `as` changes the element without changing the look — needed when the visual
 * hierarchy and the heading hierarchy disagree. md §2.23.7: the page header's
 * eyebrow is a LINK to the parent record, not an h2, even though it sits above
 * the h1.
 */
export const SemanticOverride: Story = {
  args: { children: 'Production Planning' },
  render: () => (
    <Stack gap={4}>
      <Text size="label" tone="secondary" as="a" href="#parent">
        Production Planning
      </Text>
      <Text size="heading" as="h1">Q2 Bicycle Production</Text>
      <Text size="body" tone="secondary" as="span">
        A span that looks like body copy — for use inside a table cell.
      </Text>
    </Stack>
  ),
};
