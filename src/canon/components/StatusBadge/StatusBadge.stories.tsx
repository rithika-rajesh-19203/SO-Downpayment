import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBadge, STATUS_BADGE_STATUSES, STATUS_FAMILIES } from './StatusBadge';
import type { StatusBadgeStatus } from './StatusBadge';
import { Inline, Stack, Surface, Text } from '../../primitives';

/**
 * ADMITTED — exported from '@canon' and usable in screens. Every change from
 * here on is a change to something the product renders, so keep reviewing it in
 * all four pane x hue combinations.
 */
const meta = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  parameters: { layout: 'padded' },
  args: { status: 'success', children: 'Approved' },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const LABELS: Record<StatusBadgeStatus, string> = {
  success: 'Success',
  accepted: 'Accepted',
  approved: 'Approved',
  submitted: 'Submitted',
  'in-progress': 'In progress',
  pending: 'Pending',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
  failed: 'Failed',
  draft: 'Draft',
  void: 'Void',
  inactive: 'Inactive',
  expired: 'Expired',
  unclassified: 'Unclassified',
};

/**
 * THE COMPLETE MATRIX — 14 states x 2 emphases = 28, which is every variant
 * §2.1.4 specifies. Grouped by the six meaning families of §2.1.7 rather than
 * listed flat, because the ordering INSIDE a family is deliberate: "Progression
 * within a family encodes finality." Accepted is a heavier green than Success.
 *
 * Look at the four neutrals together. §2.1.7 records the known limitation
 * honestly — they sit within 1.1-1.2:1 of each other, which is below the
 * threshold of visible difference, so a user will not tell Draft from Void by
 * colour in a live table. The label does that work. The gradation earns its keep
 * only in a legend like this one, where all four appear at once.
 */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={12}>
      {STATUS_FAMILIES.map(({ family, states }) => (
        <Stack key={family} gap={4}>
          <Text size="overline" tone="tertiary">{family}</Text>
          <Stack gap={3}>
            {states.map((s) => (
              <Inline key={s} gap={6} align="center">
                <Text size="caption" tone="tertiary" className="w-20 shrink-0">{s}</Text>
                <StatusBadge status={s}>{LABELS[s]}</StatusBadge>
                <StatusBadge status={s} emphasis="solid">{LABELS[s]}</StatusBadge>
              </Inline>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
};

/**
 * THE BORDER'S ACTUAL JOB. §2.1.2 specifies a 1px inside border and gives the
 * reason: adjacent badges in a dense row must read as separate objects without a
 * gap. On the page surface it is invisible; on a tinted row it does the work.
 *
 * The top row is gapless on `surface/default` — the border should be invisible.
 * The bottom row is gapless on `surface/sunken` — the border should separate.
 * If the second row reads as one continuous block, the border has failed.
 *
 * Check this one in Dark especially. The md asks for white; we bind
 * `surface/default` instead, which is white in Light and near-black in Dark. A
 * literal white would draw a bright hairline around every badge on a dark table.
 */
export const BorderSeparation: Story = {
  render: () => (
    <Stack gap={8}>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">on surface/default — border should vanish</Text>
        <Surface tone="default" pad={4} radius="md" border="divider">
          <Inline gap={0}>
            {(['draft', 'void', 'inactive', 'expired'] as StatusBadgeStatus[]).map((s) => (
              <StatusBadge key={s} status={s}>{LABELS[s]}</StatusBadge>
            ))}
          </Inline>
        </Surface>
      </Stack>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">on surface/sunken — border should separate them</Text>
        <Surface tone="sunken" pad={4} radius="md" border="divider">
          <Inline gap={0}>
            {(['draft', 'void', 'inactive', 'expired'] as StatusBadgeStatus[]).map((s) => (
              <StatusBadge key={s} status={s}>{LABELS[s]}</StatusBadge>
            ))}
          </Inline>
        </Surface>
      </Stack>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">solid, gapless — the case the border was drawn for</Text>
        <Surface tone="sunken" pad={4} radius="md" border="divider">
          <Inline gap={0}>
            {(['cancelled', 'failed', 'overdue', 'pending'] as StatusBadgeStatus[]).map((s) => (
              <StatusBadge key={s} status={s} emphasis="solid">{LABELS[s]}</StatusBadge>
            ))}
          </Inline>
        </Surface>
      </Stack>
    </Stack>
  ),
};

/**
 * OVERFLOW — the state a mock never shows. §2.1.2 sets a 200px ceiling so a long
 * label cannot break row height, and §2.1.2 also fixes the height at 22px, so
 * the label must truncate rather than wrap. A wrapped label at a fixed height is
 * clipped text, which is worse than an ellipsis.
 *
 * §2.1.8 asks for one or two words. This story is what happens when someone
 * ignores that.
 */
export const Overflow: Story = {
  render: () => (
    <Stack gap={6}>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">short · at the ceiling · past the ceiling</Text>
        <Inline gap={4} align="center">
          <StatusBadge status="pending">Pending</StatusBadge>
          <StatusBadge status="pending">Pending approval from finance</StatusBadge>
          <StatusBadge status="pending">
            Pending approval from the regional finance controller
          </StatusBadge>
        </Inline>
      </Stack>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">
          in a narrow cell — the badge must not force the column wider
        </Text>
        <Surface tone="sunken" pad={4} radius="md" border="divider" className="w-rail">
          <Inline gap={4} align="center" justify="between">
            <Text size="body-sm" truncate>PO-2026-00814</Text>
            <StatusBadge status="in-progress">In progress</StatusBadge>
          </Inline>
        </Surface>
      </Stack>
    </Stack>
  ),
};

/**
 * IN CONTEXT — §2.1.8's "Do" list is about restraint, and restraint is only
 * visible at density. `Default` in the rows; one `Solid` in the header where a
 * single status must read at a glance.
 *
 * Six solid badges in these rows would compete with each other and with the
 * page's actual primary action. That is the rule; this is the picture of it.
 *
 * Rows are `Surface tone="default"` cards on a sunken ground rather than a real
 * table, because `Table` is §2.24 and does not exist yet — faking its chrome
 * here would be a second design system growing inside a story.
 */
export const InAList: Story = {
  render: () => (
    <Surface tone="sunken" pad={4} radius="lg" border="divider" className="w-full">
      <Stack gap={4}>
        <Inline gap={6} align="center" justify="between">
          <Text size="subheading">Purchase orders</Text>
          <StatusBadge status="overdue" emphasis="solid">3 overdue</StatusBadge>
        </Inline>
        <Stack gap={2}>
          {([
            ['PO-2026-00814', 'Chennai · Line 3', 'in-progress'],
            ['PO-2026-00815', 'Chennai · Line 1', 'submitted'],
            ['PO-2026-00816', 'Pune · Line 2', 'overdue'],
            ['PO-2026-00817', 'Pune · Line 2', 'approved'],
            ['PO-2026-00818', 'Chennai · Line 3', 'draft'],
            ['PO-2026-00819', 'Coimbatore · Line 4', 'cancelled'],
          ] as Array<[string, string, StatusBadgeStatus]>).map(([id, site, status]) => (
            <Surface key={id} tone="default" pad={4} radius="md">
              <Inline gap={6} align="center" justify="between">
                <Stack gap={0}>
                  <Text size="body" weight="medium">{id}</Text>
                  <Text size="caption" tone="tertiary">{site}</Text>
                </Stack>
                <StatusBadge status={status}>{LABELS[status]}</StatusBadge>
              </Inline>
            </Surface>
          ))}
        </Stack>
      </Stack>
    </Surface>
  ),
};

/**
 * THE NEUTRAL LADDER — the one place the Dark derivation needed a hand, and the
 * story to look hardest at.
 *
 * §2.1.7 splits Draft / Void / Inactive / Expired into four states because they
 * mean different things, and orders their fills light-to-dark in the order a
 * record moves through them. Mirroring that ladder into Dark landed `draft` on
 * neutral/1100, where near-black text measures **4.02:1 — under AA**. The whole
 * neutral ladder therefore shifts one step lighter in Dark (1000 / 900 / 700 /
 * 600), which fixes the contrast while keeping the four fills unique and the
 * ladder monotonic. Moving `draft` alone would have collided with `void` — a bug
 * §2.1.7 records as already found and fixed once.
 *
 * All 56 pairings now pass AA. What to check by eye instead:
 *
 *  - In DARK, are the four solid fills still distinguishable from each other?
 *    The shift made them lighter and therefore closer to each other.
 *  - In LIGHT, §2.1.7 is honest that these four sit within 1.1-1.2:1 and a user
 *    will NOT tell Draft from Void by colour in a live table. The label does that
 *    work. This story is the legend case, where all four appear at once and the
 *    ordering is supposed to help.
 */
export const NeutralLadder: Story = {
  render: () => (
    <Stack gap={6}>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">
          solid — 1200 / 1300 / 1500 / 1600 in Light, shifted to 1000 / 900 / 700 / 600 in Dark
        </Text>
        <Inline gap={4} align="center">
          {(['draft', 'void', 'inactive', 'expired'] as StatusBadgeStatus[]).map((s) => (
            <StatusBadge key={s} status={s} emphasis="solid">{LABELS[s]}</StatusBadge>
          ))}
        </Inline>
      </Stack>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">
          default — mirrored without adjustment, 400 / 500 / 600 / 700
        </Text>
        <Inline gap={4} align="center">
          {(['draft', 'void', 'inactive', 'expired'] as StatusBadgeStatus[]).map((s) => (
            <StatusBadge key={s} status={s}>{LABELS[s]}</StatusBadge>
          ))}
        </Inline>
      </Stack>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">
          gapless, on a sunken ground — the ordering as a legend would show it
        </Text>
        <Surface tone="sunken" pad={4} radius="md" border="divider">
          <Inline gap={0}>
            {(['draft', 'void', 'inactive', 'expired'] as StatusBadgeStatus[]).map((s) => (
              <StatusBadge key={s} status={s} emphasis="solid">{LABELS[s]}</StatusBadge>
            ))}
          </Inline>
        </Surface>
      </Stack>
    </Stack>
  ),
};

/**
 * EVERY STATE, BOTH EMPHASES, ONE SCREEN — the flat grid, for scanning the whole
 * set at once rather than family by family. Use this one to compare across
 * families: whether Overdue and Pending are still distinguishable, and whether
 * any Solid label has lost its 4.5:1 in Dark, where the fills are derived rather
 * than specified.
 */
export const Grid: Story = {
  render: () => (
    <Stack gap={4}>
      <Inline gap={6} wrap>
        {STATUS_BADGE_STATUSES.map((s) => (
          <StatusBadge key={s} status={s}>{LABELS[s]}</StatusBadge>
        ))}
      </Inline>
      <Inline gap={6} wrap>
        {STATUS_BADGE_STATUSES.map((s) => (
          <StatusBadge key={s} status={s} emphasis="solid">{LABELS[s]}</StatusBadge>
        ))}
      </Inline>
    </Stack>
  ),
};
