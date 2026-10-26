import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import {
  ICON_NAMES, iconPaths, unexportedIcons,
  ICONS_ABSENT_FROM_MD, RETIRED_ICON_NAMES, STROKED_ICONS, ICON_STROKE_WEIGHT,
} from './paths';
import { Inline, Stack, Surface, Text } from '../primitives';

/**
 * The icon grid is not decoration — it is the review surface.
 *
 * md §2.7.6 and §2.10.8 are both cases where a stroke weight looked correct
 * inside one component and visibly wrong in a grid: a 2px stroke on a 13.5px
 * glyph next to a label whose cap height is 9.6px, and four 4.5px squares with
 * 2px gaps that read as a block of ink. Neither was catchable one component at
 * a time. Both were obvious the moment every glyph sat in one row.
 */
const meta = {
  title: 'Foundations/Icons',
  component: Icon,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

const exported = ICON_NAMES.filter((n) => iconPaths[n]);
const SLOTS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

/** Every name in the system. Dashed squares are names awaiting a Figma export. */
export const AllIcons: Story = {
  args: { name: 'chevron-down' },
  render: () => (
    <Stack gap={10}>
      <Stack gap={2}>
        <Text size="heading">The icon set</Text>
        <Text size="body" tone="secondary">
          {exported.length} of {ICON_NAMES.length} names have geometry. A dashed square is a
          name the design system uses but Figma has not exported yet — the component,
          the token plumbing and the accessibility contract all already work.
        </Text>
        <Text size="body-sm" tone="tertiary">
          Drop an SVG in design-refs/icons/ and run npm run icons:sync. Nothing else —
          no registry entry, no new export, no component change. The Figma set is 51
          icons; {STROKED_ICONS.length} of these names are stroked at {ICON_STROKE_WEIGHT}px
          and the rest are filled.
        </Text>
      </Stack>

      <Surface tone="sunken" pad={8} radius="lg" border="divider">
        <Stack gap={4}>
          <Text size="overline" tone="tertiary">Exported · {exported.length}</Text>
          <Inline gap={8} wrap>
            {exported.map((name) => (
              <Stack key={name} gap={1} align="center">
                <Icon name={name} size="lg" tone="default" />
                <Text size="caption" tone="tertiary">{name}</Text>
              </Stack>
            ))}
          </Inline>
        </Stack>
      </Surface>

      <Surface pad={8} radius="lg" border="divider">
        <Stack gap={4}>
          <Text size="overline" tone="tertiary">
            Awaiting export · {unexportedIcons.length}
          </Text>
          <Inline gap={8} wrap>
            {unexportedIcons.map((name) => (
              <Stack key={name} gap={1} align="center">
                <Icon name={name} size="lg" tone="subtle" />
                <Text size="caption" tone="tertiary">{name}</Text>
              </Stack>
            ))}
          </Inline>
        </Stack>
      </Surface>

      {/*
        Two lists that are not about geometry at all — they are about whether the
        NAME is real. zf-icons.md measured all 51 icons in Figma, so a name we use
        that it never mentions is a name that may have no glyph coming.
      */}
      <Surface pad={8} radius="lg" border="divider">
        <Stack gap={6}>
          <Stack gap={2}>
            <Text size="overline" tone="tertiary">
              Not measured in the md · {ICONS_ABSENT_FROM_MD.length}
            </Text>
            <Text size="body-sm" tone="secondary">
              All nine of these exist — an SVG was exported for every one. What is
              missing is the measurement: §3.1 says which icons are stroked and at what
              weight, and it has no row for any of these. So for these nine, icons:sync
              reports what it found instead of checking it against the design.
            </Text>
            <Inline gap={6} wrap>
              {ICONS_ABSENT_FROM_MD.map((name) => (
                <Text key={name} size="caption" tone="tertiary">{name}</Text>
              ))}
            </Inline>
          </Stack>
          <Stack gap={2}>
            <Text size="overline" tone="tertiary">
              Retired · {RETIRED_ICON_NAMES.length}
            </Text>
            <Text size="body-sm" tone="secondary">
              Removed from the roster. §12.1 found them listed in a stale Figma
              documentation frame — alongside &quot;ICONS 4&quot; and a 2px stroke — as
              icons that do not exist. `icons:sync` refuses an SVG dropped under either
              name, because the roster is the contract.
            </Text>
            <Inline gap={6} wrap>
              {RETIRED_ICON_NAMES.map((name) => (
                <Text key={name} size="caption" tone="disabled">{name}</Text>
              ))}
            </Inline>
          </Stack>
        </Stack>
      </Surface>
    </Stack>
  ),
};

/**
 * Slot sizes. The GLYPH does not change between these — only the room it
 * occupies does. md §1.7.6 is the trap: `CENTER` constraints re-centre art on
 * resize without scaling it, so a 16px glyph in an 8px slot stays 16px wide and
 * reads as an icon that has outgrown its badge. The 20px case is the dangerous
 * one, because it happens to fit and only the small sizes look broken.
 */
export const Sizes: Story = {
  args: { name: 'chevron-right' },
  render: () => (
    <Stack gap={10}>
      <Stack gap={2}>
        <Text size="heading">The slot ramp</Text>
        <Text size="body" tone="secondary">
          xs 12 · sm 14 · md 16 · lg 20 · xl 24. The glyph is authored once at its own
          viewBox; only the slot changes. Several different glyphs are shown because one
          chevron is not enough to judge a ramp by — and because a glyph whose ink fills
          little of its own box looks small at every size without that being a sizing bug.
        </Text>
      </Stack>

      {(['chevron-right', 'search', 'home', 'settings', 'upload'] as const).map((name) => (
        <Inline key={name} gap={10} align="end">
          <Text size="caption" tone="tertiary" className="w-rail shrink-0">{name}</Text>
          {SLOTS.map((size) => (
            <Stack key={size} gap={2} align="center">
              <Icon name={name} size={size} tone="default" />
              <Text size="caption" tone="tertiary">{size}</Text>
            </Stack>
          ))}
        </Inline>
      ))}

      <Surface tone="sunken" pad={6} radius="md" border="divider">
        <Stack gap={3}>
          <Text size="overline" tone="tertiary">ink extent, measured</Text>
          <Text size="body-sm" tone="secondary">
            A glyph does not fill its box, and should not. Of the 47 ingested,
            17 draw across less than 75% of their 16px box — `upload` covers 53%,
            `caret-down` 51%. That is optical sizing, not a defect: they scale with the
            slot exactly like the rest. If an icon looks small at every size, this is
            usually why, and swapping the set only helps if the new set is drawn larger.
          </Text>
        </Stack>
      </Surface>
    </Stack>
  ),
};

export const Tones: Story = {
  args: { name: 'chevron-down' },
  render: () => (
    <Inline gap={10} wrap>
      {(['default', 'subtle', 'disabled', 'primary', 'success', 'warning', 'danger'] as const).map(
        (tone) => (
          <Stack key={tone} gap={2} align="center">
            <Icon name="chevron-down" size="lg" tone={tone} />
            <Text size="caption" tone="tertiary">{tone}</Text>
          </Stack>
        ),
      )}
      <Surface tone="inverse" pad={4} radius="md">
        <Stack gap={2} align="center">
          <Icon name="chevron-down" size="lg" tone="inverse" />
          <Text size="caption" tone="inverse">inverse</Text>
        </Stack>
      </Surface>
    </Inline>
  ),
};

/**
 * Inheriting the label's colour — the case that should be the default everywhere.
 * Nothing sets a colour on the icon; it takes whatever the `Text` beside it has.
 */
export const InheritsLabelColour: Story = {
  args: { name: 'chevron-right' },
  render: () => (
    <Stack gap={4}>
      {(['default', 'secondary', 'link', 'danger'] as const).map((tone) => (
        <Inline key={tone} gap={2}>
          <Text size="body" tone={tone}>
            <Inline gap={2} align="center">
              <Icon name="chevron-right" size="md" />
              {tone} label — the icon follows it
            </Inline>
          </Text>
        </Inline>
      ))}
    </Stack>
  ),
};

/**
 * Accessibility. A decorative glyph is hidden from assistive tech; an icon-only
 * control MUST pass `label`. md §2.10.6 calls icon-only "the case most often
 * shipped broken" — with no visible text and no label, a screen reader announces
 * only "button".
 */
export const Accessibility: Story = {
  args: { name: 'close' },
  render: () => (
    <Stack gap={6}>
      <Inline gap={4} align="center">
        <Icon name="chevron-down" size="md" tone="default" />
        <Text size="body" tone="secondary">
          Decorative — no <code>label</code>, so <code>aria-hidden</code>. Correct when a
          visible label sits beside it.
        </Text>
      </Inline>
      <Inline gap={4} align="center">
        <Icon name="chevron-down" size="md" tone="default" label="Expand section" />
        <Text size="body" tone="secondary">
          Labelled — <code>role=&quot;img&quot;</code> with an accessible name. Required on
          any icon-only control.
        </Text>
      </Inline>
    </Stack>
  ),
};
