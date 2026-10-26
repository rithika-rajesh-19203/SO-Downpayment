import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import type { ButtonIntent, ButtonSize } from './Button';
import { Inline, Stack, Surface, Text } from '../../primitives';

/**
 * INCOMING — not exported from '@canon' and not reachable from src/app.
 * Review at localhost:6006 in all four pane x hue combinations before admitting.
 *
 * TWO THINGS BLOCK ADMISSION, and neither is fixable inside this component —
 * both are semantic-layer decisions. See `ContrastFailures` below.
 */
const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'padded' },
  args: { children: 'Save changes' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const INTENTS: ButtonIntent[] = ['default', 'success', 'warning', 'danger'];
const SIZES: ButtonSize[] = ['lg', 'md', 'sm'];

/**
 * THE MATRIX — 4 intents x 2 emphases x 3 sizes = 24, which is every variant the
 * component has. Figma draws 96 because it enumerates `State` as a fourth axis;
 * here Default / Hover / Focus / Disabled are `:hover`, `:focus-visible` and
 * `:disabled`, so they are real states rather than pictures of states. Hover
 * them, tab through them.
 */
export const Matrix: Story = {
  render: () => (
    <Stack gap={10}>
      {SIZES.map((size) => (
        <Stack key={size} gap={4}>
          <Text size="overline" tone="tertiary">
            size = {size}
          </Text>
          <Inline gap={6} wrap align="center">
            {INTENTS.map((intent) => (
              <Button key={intent} intent={intent} emphasis="primary" size={size}>
                {intent}
              </Button>
            ))}
          </Inline>
          <Inline gap={6} wrap align="center">
            {INTENTS.map((intent) => (
              <Button key={intent} intent={intent} emphasis="secondary" size={size}>
                {intent}
              </Button>
            ))}
          </Inline>
        </Stack>
      ))}
    </Stack>
  ),
};

/**
 * THE TWO THINGS BLOCKING ADMISSION. Both are semantic-layer defects that this
 * component inherits and cannot fix.
 *
 * 1. `primary/default` + `primary/on-primary` is **4.32:1** in Light, under the
 *    4.5:1 of WCAG 1.4.3. zf-button.md §5.2: it fails "by construction… not just
 *    in the button, but anywhere in the system that puts on-primary text on a
 *    primary surface". `npm run tokens:sync` now warns on it. The fix is a ladder
 *    shift — default to blue/1300, hover to blue/1400, selected to 1400 or 1500 —
 *    because `primary/hover` and `primary/selected` already sit on blue/1300.
 *    The other three intents pass: 4.56, 6.07, 6.09.
 *
 * 2. Secondary's border is **1.31:1** against 1.4.11's 3:1, and no `border/*`
 *    role in the system reaches 3:1 — the ramp tops out at 2.74. This is the
 *    third component to hit it after the input field and the radio. One new role,
 *    `border/control` at neutral/1100, fixes all three.
 *
 * Compare the first row against the second: every Primary hover passes, so the
 * default-intent button is legible only while the pointer is on it. That is
 * backwards, and it is why a review conducted by hovering over things never sees
 * the failure.
 */
export const ContrastFailures: Story = {
  render: () => (
    <Stack gap={10}>
      <Stack gap={3}>
        <Text size="overline" tone="tertiary">1 · primary at rest — 4.32:1, fails 1.4.3</Text>
        <Inline gap={6} align="center" wrap>
          <Button intent="default">default · 4.32 ✗</Button>
          <Button intent="success">success · 4.56 ✓</Button>
          <Button intent="warning">warning · 6.07 ✓</Button>
          <Button intent="danger">danger · 6.09 ✓</Button>
        </Inline>
        <Text size="body-sm" tone="secondary">
          Hover each one. Every hover state passes — 5.48 / 6.19 / 7.77 / 7.04 — so the
          only failing pairing in the set is the resting state of the most-used button.
        </Text>
      </Stack>

      <Stack gap={3}>
        <Text size="overline" tone="tertiary">2 · secondary border — 1.31:1, fails 1.4.11</Text>
        <Inline gap={6} align="center" wrap>
          {INTENTS.map((intent) => (
            <Button key={intent} intent={intent} emphasis="secondary">{intent}</Button>
          ))}
        </Inline>
        <Text size="body-sm" tone="secondary">
          The intent-coloured borders are no better — success/border 1.42, warning 1.69,
          danger 1.75 — which is why the intent rides the label here instead, where it
          clears 5.92 to 8.06. The border is the only thing saying &quot;this is a
          control&quot;, because the fill is 1.04:1 against the page.
        </Text>
      </Stack>
    </Stack>
  ),
};

/**
 * ICON-ONLY — Figma's `Button Icons`, all 96 variants of it, is this component
 * with no children. md defect 4 is that the Figma set declares a `Label` TEXT
 * property and contains zero text nodes to put it in; here the label *is* the
 * children, so its absence is what makes the button icon-only and there is no
 * dead property to declare.
 *
 * `label` becomes REQUIRED at compile time when children are omitted. Without an
 * accessible name an icon-only control announces as "button" and nothing else —
 * try it with a screen reader on the row below, then imagine the row without it.
 */
export const IconOnly: Story = {
  args: { children: undefined, label: 'Upload' },
  render: () => (
    <Stack gap={8}>
      {SIZES.map((size) => (
        <Inline key={size} gap={6} align="center">
          <Text size="caption" tone="tertiary" className="w-8 shrink-0">{size}</Text>
          {INTENTS.map((intent) => (
            <Button key={intent} intent={intent} size={size} icon="upload" label={`Upload · ${intent}`} />
          ))}
          {INTENTS.map((intent) => (
            <Button
              key={intent}
              intent={intent}
              emphasis="secondary"
              size={size}
              icon="more"
              label={`More actions · ${intent}`}
            />
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

/**
 * ICONS BESIDE A LABEL. Both slots default to none — Figma defaults both to
 * `true`, so a freshly placed Button arrives with two upload icons flanking the
 * label (md defect 7), and `Hyperlink` in the same file defaults them to `false`.
 *
 * Every glyph is `tone="inherit"`, so it takes the button's colour and cannot
 * drift from the label when an intent changes.
 *
 * **The icon slot grows with the button** — 16 / 14 / 12 across lg / md / sm,
 * which is `icon-md` / `icon-sm` / `icon-xs` on the shared ramp. No new token and
 * nothing off the scale.
 *
 * This diverges from md §2's measured 13 / 12 / 11 deliberately: neither 13 nor
 * 11 is on any scale here, both carry the signature of the resize artefacts
 * zf-icons.md §3.3 catalogues, and an 18% span across a three-step ramp reads as
 * drift rather than as a decision. 16 -> 12 is 33% and visible at a glance.
 */
export const WithIcons: Story = {
  render: () => (
    <Stack gap={6}>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">
          the icon ramp — 16 / 14 / 12, shrinking left to right with the button
        </Text>
        <Inline gap={6} align="center">
          {SIZES.map((size) => (
            <Button key={size} size={size} icon="upload" iconRight="chevron-down">
              {size}
            </Button>
          ))}
        </Inline>
        <Inline gap={6} align="center">
          {SIZES.map((size) => (
            <Button key={size} size={size} icon="upload" label={`Upload · ${size}`} />
          ))}
        </Inline>
      </Stack>
      <Inline gap={6} wrap align="center">
        <Button icon="upload">Upload</Button>
        <Button iconRight="arrow-right">Continue</Button>
        <Button icon="plus" iconRight="caret-down">New record</Button>
      </Inline>
      <Inline gap={6} wrap align="center">
        <Button emphasis="secondary" icon="edit">Edit</Button>
        <Button emphasis="secondary" intent="danger" icon="close">Delete</Button>
        <Button emphasis="secondary" iconRight="chevron-down">Filter</Button>
      </Inline>
    </Stack>
  ),
};

/**
 * DISABLED — one appearance for all eight intent x emphasis combinations.
 *
 * Figma fills a disabled Primary with `{hue}/800` and keeps the white label,
 * which md §5.3 measures at 1.42 – 1.75:1: exempt from 1.4.3, but "close enough
 * to invisible that the label is effectively gone". It reaches that tint through
 * `{family}/border` — a border role used as a fill, md defect 6.
 *
 * `surface/disabled` + `text/disabled` is 1.89:1. Still low, still exempt, better
 * than everything it replaces, and it reads as "disabled" rather than as a faded
 * danger button. A disabled control has no intent left to communicate.
 */
export const Disabled: Story = {
  render: () => (
    <Stack gap={6}>
      <Inline gap={6} wrap align="center">
        {INTENTS.map((intent) => (
          <Button key={intent} intent={intent} disabled>{intent}</Button>
        ))}
      </Inline>
      <Inline gap={6} wrap align="center">
        {INTENTS.map((intent) => (
          <Button key={intent} intent={intent} emphasis="secondary" disabled>{intent}</Button>
        ))}
      </Inline>
      <Inline gap={6} align="center">
        <Button icon="upload" label="Upload" disabled />
        <Button emphasis="secondary" icon="more" label="More" disabled />
      </Inline>
    </Stack>
  ),
};

/**
 * OVERFLOW and the size ramp. md §2 measures the ramp as doing its work
 * horizontally — 32 to 28 is a 12.5% height change, 12 to 6 is a 50% padding
 * change — so two buttons of different size in a row are told apart by width.
 * Worth checking that reads as deliberate rather than as a rendering accident.
 *
 * All three heights clear WCAG 2.5.8's 24 x 24 target minimum, 28px at the
 * smallest.
 */
export const Overflow: Story = {
  render: () => (
    <Stack gap={8}>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">the ramp, side by side</Text>
        <Inline gap={4} align="center">
          {SIZES.map((size) => (
            <Button key={size} size={size} icon="upload">Save changes</Button>
          ))}
        </Inline>
      </Stack>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">a long label truncates rather than growing the row</Text>
        <Surface tone="sunken" pad={4} radius="md" border="divider" className="w-rail">
          <Button icon="upload">Upload supporting documentation for this purchase order</Button>
        </Surface>
      </Stack>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">in a toolbar — the common real arrangement</Text>
        <Surface pad={4} radius="md" border="divider">
          <Inline gap={4} align="center" justify="between">
            <Inline gap={3} align="center">
              <Button emphasis="secondary" size="sm" icon="table-config" label="Configure columns" />
              <Button emphasis="secondary" size="sm" iconRight="chevron-down">Filter</Button>
            </Inline>
            <Inline gap={3} align="center">
              <Button emphasis="secondary" size="sm">Cancel</Button>
              <Button size="sm" icon="check-circle">Approve</Button>
            </Inline>
          </Inline>
        </Surface>
      </Stack>
    </Stack>
  ),
};
