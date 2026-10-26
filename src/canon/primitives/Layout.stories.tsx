import type { Meta } from '@storybook/react-vite';
import { Inline, Stack, Surface, Text } from './index';
import type { Gap } from './Stack';

/**
 * Stack and Inline — the two layout primitives. Screens reach for these instead
 * of `mt-*` or `space-y-*`, so every gap in the product comes from the token
 * scale rather than an ad-hoc number.
 */
const meta: Meta = {
  title: 'Primitives/Layout',
  parameters: { layout: 'padded' },
};
export default meta;

const STEPS: Array<[Gap, string]> = [
  [1, '2px'], [2, '4px'], [3, '6px'], [4, '8px'], [5, '10px'], [6, '12px'],
  [8, '16px'], [10, '20px'], [12, '24px'], [16, '32px'], [20, '40px'],
];

function Block() {
  return <Surface tone="inverse" pad={0} radius="xs" className="h-6 w-10" />;
}

/**
 * Every gap step. Named by STEP, not by t-shirt size — `4` is 8px because the
 * base unit is 2px. md §1.6.2: "Your decision, taken: step-indexed names over
 * pixel-valued ones", so a future density change rescales the whole product
 * from tokens/scale.css without renaming a single prop value.
 */
export const GapScale = () => (
  <Stack gap={8}>
    <Stack gap={2}>
      <Text size="title">The gap scale</Text>
      <Text size="body" tone="secondary">
        A 2px base. Measured across 2,021 auto-layout frames — 2, 6 and 10 account for
        1,020 uses and none is a multiple of 4, which is what settled the base at 2 rather
        than 4.
      </Text>
    </Stack>
    <Stack gap={4}>
      {STEPS.map(([step, px]) => (
        <Inline key={step} gap={6} align="center">
          <Text size="caption" tone="tertiary" className="w-16 shrink-0">{step} · {px}</Text>
          <Inline gap={step}>
            <Block />
            <Block />
            <Block />
          </Inline>
        </Inline>
      ))}
    </Stack>
  </Stack>
);

/** Stack — vertical. `align` cross-axis, `justify` main-axis. */
export const StackAlignment = () => (
  <Inline gap={10} wrap align="start">
    {(['start', 'center', 'end', 'stretch'] as const).map((align) => (
      <Stack key={align} gap={2}>
        <Text size="caption" tone="tertiary">align={align}</Text>
        <Surface tone="sunken" pad={4} radius="md" border="divider" className="w-rail">
          <Stack gap={3} align={align}>
            <Surface tone="inverse" pad={0} radius="xs" className="h-6 w-10" />
            <Surface tone="inverse" pad={0} radius="xs" className="h-6 w-20" />
            <Surface tone="inverse" pad={0} radius="xs" className="h-6 w-16" />
          </Stack>
        </Surface>
      </Stack>
    ))}
  </Inline>
);

/** Inline — horizontal. `baseline` is the one that matters for mixed type sizes. */
export const InlineAlignment = () => (
  <Stack gap={8}>
    {(['start', 'center', 'end', 'baseline'] as const).map((align) => (
      <Stack key={align} gap={2}>
        <Text size="caption" tone="tertiary">align={align}</Text>
        <Surface tone="sunken" pad={4} radius="md" border="divider">
          <Inline gap={6} align={align}>
            <Text size="title">Title</Text>
            <Text size="body">body</Text>
            <Text size="caption" tone="tertiary">caption</Text>
          </Inline>
        </Surface>
      </Stack>
    ))}
  </Stack>
);

/** `justify="between"` — the toolbar and table-header case. */
export const Justify = () => (
  <Stack gap={6}>
    {(['start', 'center', 'end', 'between'] as const).map((justify) => (
      <Stack key={justify} gap={2}>
        <Text size="caption" tone="tertiary">justify={justify}</Text>
        <Surface tone="sunken" pad={4} radius="md" border="divider">
          <Inline gap={4} justify={justify}>
            <Block />
            <Block />
            <Block />
          </Inline>
        </Surface>
      </Stack>
    ))}
  </Stack>
);

/**
 * OVERFLOW. `grow` on an Inline child lets it truncate rather than push its
 * siblings out of the row — the table-cell case. md §2.24.10 records the cost of
 * getting this wrong: a hugging label followed by a divider put the divider
 * wherever the text ended, so one long label moved it 16px right of the other
 * five rows and a column stopped being a column.
 */
export const OverflowAndGrow = () => (
  <Stack gap={8}>
    <Stack gap={2}>
      <Text size="caption" tone="tertiary">
        grow + truncate — the text flexes, the trailing element stays put
      </Text>
      <Surface tone="sunken" pad={4} radius="md" border="divider" className="w-rail">
        <Inline gap={4}>
          <Inline grow>
            <Text size="body" truncate>
              Create Transaction Order for Chennai Facility Line 3
            </Text>
          </Inline>
          <Text size="caption" tone="tertiary">⌄</Text>
        </Inline>
      </Surface>
    </Stack>
    <Stack gap={2}>
      <Text size="caption" tone="tertiary">
        wrap — when the row is allowed to become two rows
      </Text>
      <Surface tone="sunken" pad={4} radius="md" border="divider" className="w-rail">
        <Inline gap={3} wrap>
          {['Draft', 'Submitted', 'Approved', 'In progress', 'Overdue', 'Cancelled'].map((s) => (
            <Surface key={s} tone="default" pad={3} radius="full" border="divider">
              <Text size="label" tone="secondary">{s}</Text>
            </Surface>
          ))}
        </Inline>
      </Surface>
    </Stack>
  </Stack>
);

/** Nesting the two is how every layout in the product gets built. */
export const Composed = () => (
  <Surface pad={10} radius="lg" border="divider" elevation="raised">
    <Stack gap={8}>
      <Inline justify="between" align="baseline">
        <Stack gap={1}>
          <Text size="label" tone="secondary">Production Planning</Text>
          <Text size="heading">Q2 Bicycle Production</Text>
        </Stack>
        <Text size="caption" tone="tertiary">12 items</Text>
      </Inline>
      <Stack gap={3}>
        {['Frame assembly', 'Wheel truing', 'Final inspection'].map((row) => (
          <Inline key={row} justify="between" align="center">
            <Text size="body">{row}</Text>
            <Text size="body-sm" tone="secondary">Chennai · Line 3</Text>
          </Inline>
        ))}
      </Stack>
    </Stack>
  </Surface>
);
