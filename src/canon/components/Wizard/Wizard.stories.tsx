import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Wizard, WizardPanel } from './Wizard';
import type { Step } from './Wizard';
import { Stack, Surface, Text } from '../../primitives';

/**
 * INCOMING. §9.6 is the review script, and its first row is the headline:
 * **a completed card next to an upcoming card must be visibly different at a
 * glance.** In Figma they carry the same border variable — 1.00:1 — with no
 * tick, no green, nothing.
 */
const meta = {
  title: 'Components/Wizard', component: Wizard, parameters: { layout: 'padded' },
  args: { steps: [], label: 'Progress' },
} satisfies Meta<typeof Wizard>;
export default meta;
type Story = StoryObj<typeof meta>;

const FLOW: Step[] = [
  { id: 'cfg', label: 'Configuration', state: 'completed' },
  { id: 'map', label: 'Map Account', state: 'current' },
  { id: 'vnd', label: 'Vendor Selection', state: 'upcoming' },
  { id: 'rev', label: 'Review', state: 'upcoming' },
];

/**
 * THE §2.1 FIX. In Figma, `completed` and `upcoming` cards carry **the same
 * border variable** — a 1.00:1 ratio — and the card has no completion mark of
 * any kind. The only difference is the title's colour and weight: 3.35 in Light
 * and **2.65 in Dark**.
 *
 * §2.1: *"switching a wizard from `horizontal` to `tabs` loses the progress
 * information entirely, which is the one thing a stepper exists to convey."*
 *
 * The card now carries the same `success/default` tick the marker atom already
 * uses. Look at the strip: step 1 must read as done at a glance, not just as
 * "not the active one".
 *
 * **Also check for reflow.** Figma's card is HUG-width and its title weight
 * changes with state, so advancing a step makes the tab 2px wider and shifts
 * every tab after it. One weight and a constant basis stop that.
 */
export const Tabs: Story = {
  render: function T() {
    const [at, setAt] = useState(1);
    const steps: Step[] = ['Overview', 'Line items', 'Complete your return'].map((label, i) => ({
      id: label, label,
      state: i < at ? 'completed' : i === at ? 'current' : 'upcoming',
    }));
    return (
      <Stack gap={8}>
        <Wizard steps={steps} orientation="tabs" label="Return filing progress"
          onStepClick={() => {}} />
        <WizardPanel>
          <Surface pad={8} radius="lg" border="divider">
            <Text size="body" tone="secondary">
              Step {at + 1} of 3. Click a completed tab to go back — upcoming tabs are not
              focusable, because they render as a span rather than a disabled button (§5).
            </Text>
          </Surface>
        </WizardPanel>
        <Text as="button" size="body-sm" tone="link"
          onClick={() => setAt((a) => (a + 1) % 3)} className="underline">
          advance a step — nothing after it should shift horizontally
        </Text>
      </Stack>
    );
  },
};

/**
 * HORIZONTAL — and the connector is the thing to look at.
 *
 * §4.5: Figma paints **every** connector `border/divider`, so the line between a
 * completed step and the current one is the same faint grey as the line between
 * two upcoming ones. At **1.20:1** against the page it is barely visible at all —
 * and §4.4 calls this "the most consequential in the system, because the
 * connector *is* the progress track".
 *
 * Here it is `border/control` at 4.52:1, and it turns `success/default` for the
 * path already travelled. So progress has a second, non-numeric channel.
 *
 * Count them: exactly `steps − 1`, and the last step sits flush with no trailing
 * dead space.
 */
export const Horizontal: Story = {
  render: () => (
    <Stack gap={10}>
      <Wizard steps={FLOW} label="Return filing progress" onStepClick={() => {}} />
      <Wizard
        steps={FLOW.map((s, i) => ({ ...s, state: i === 2 ? 'error' : s.state }))}
        label="With an error"
        onStepClick={() => {}}
      />
      <Text size="body-sm" tone="secondary">
        The second row has an error step. §7: Figma's card uses `danger/border` at 1.75:1
        for this while the marker atom uses `danger/default` at 6.09 — one of seven things
        the two atoms disagree about, and the reason they are one component here.
      </Text>
    </Stack>
  ),
};

/**
 * VERTICAL — §3.3. Figma's connector here is a **`FIXED` 30px frame**, so the
 * step-to-step distance is frozen at 10 + 30 + 10 = 50px whatever the content
 * does. The horizontal one is `FILL` width and adapts. Two implementations of one
 * thing, and only one of them works.
 *
 * The line here is a **minimum** of 30px that grows, so the default reproduces
 * Figma exactly — 74px marker to marker — and a long label still stretches it.
 * The second column proves that.
 */
export const Vertical: Story = {
  render: () => (
    <Stack gap={16}>
      <Wizard steps={FLOW} orientation="vertical" label="Return filing progress"
        onStepClick={() => {}} />
      <Wizard
        steps={[
          { id: 'a', label: 'Configuration', state: 'completed' },
          { id: 'b', label: 'Map the account to a chart-of-accounts entry', state: 'current' },
          { id: 'c', label: 'Review', state: 'upcoming' },
        ]}
        orientation="vertical"
        label="With a long label"
      />
    </Stack>
  ),
};

/**
 * ALL FOUR STATES, both presentations. `State` carries progress and `Focused`
 * carries keyboard focus — §5 calls that split correct, and it is.
 *
 * **Tab through both.** Only `completed` and `error` steps take focus; `current`
 * and `upcoming` render as spans, so they are out of the tab order without a
 * `disabled` attribute or `pointer-events: none`. §8.
 *
 * The ring is 2px at a real 2px clearance — which Figma also gets right on both
 * atoms, unlike the pill. Do not "fix" it.
 *
 * One thing worth knowing: completed and current markers are only **1.20:1**
 * apart in Light and **1.04:1** in Dark. Green and blue are near-identical in
 * lightness, so the two states are separated by hue alone — 1.4.1 still passes
 * because completed shows a tick and current a numeral, but the colour is doing
 * none of the work.
 */
export const States: Story = {
  render: () => (
    <Stack gap={10}>
      {(['horizontal', 'tabs'] as const).map((o) => (
        <Stack key={o} gap={3}>
          <Text size="overline" tone="tertiary">{o}</Text>
          <Wizard
            orientation={o}
            label={`All states, ${o}`}
            onStepClick={() => {}}
            steps={[
              { id: '1', label: 'Completed', state: 'completed' },
              { id: '2', label: 'Current', state: 'current' },
              { id: '3', label: 'Upcoming', state: 'upcoming' },
              { id: '4', label: 'Error', state: 'error' },
            ]}
          />
        </Stack>
      ))}
    </Stack>
  ),
};
