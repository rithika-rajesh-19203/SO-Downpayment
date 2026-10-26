import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Stepper, StepperField } from './Stepper';
import type { StepperTone } from './Stepper';
import { Stack, Inline, Surface, Text } from '../../primitives';

/**
 * INCOMING. §9.6's first row is the whole component: **set `tone="error"` and the
 * field border turns red**, not just the help text.
 *
 * Note `info` is in the roster with no geometry yet, so the neutral help icon
 * renders the dashed placeholder. `check-circle` and `alert-circle` are real.
 */
const meta = {
  title: 'Components/Stepper', component: StepperField, parameters: { layout: 'padded' },
  args: { label: 'Quantity', value: 1, onValueChange: () => {} },
} satisfies Meta<typeof StepperField>;
export default meta;
type Story = StoryObj<typeof meta>;

function Live(p: Omit<React.ComponentProps<typeof StepperField>, 'value' | 'onValueChange'>
  & { start?: number }) {
  const [v, setV] = useState(p.start ?? 1);
  return <StepperField {...p} value={v} onValueChange={setV} />;
}

/**
 * **THE §2 DEFECT, FIXED.** This is the story the whole file is about.
 *
 * In Figma, `zf-stepper-field` has a `Tone` axis and `zf-stepper` has a matching
 * `Validation` axis — and **all six field variants embed `Validation=none`**. So
 * `Tone=error` changes the help icon and the help text colour, and the field's
 * border stays `border/default` grey at 1.31:1.
 *
 * *"A user is told there is an error by a line of small print beneath a control
 * that looks completely normal."*
 *
 * The maddening part is that the 16 correct variants exist, are complete, and
 * are bound to the right roles — `success/default` at **4.56** and
 * `danger/default` at **6.09**, which would be the strongest boundary this
 * component has. They are simply never selected. §2: *"This is not a colour
 * problem, it is a wiring problem."*
 *
 * Here one `tone` prop drives the border and the message together.
 *
 * **Now hover each one.** §2.1: in Figma, `Validation` *overrides* `State` on the
 * border rather than composing with it, so all four of default/hover/focus/active
 * carry one colour and a validated field gives **no hover response at all** —
 * "silently dead on exactly the fields a user is most likely to be interacting
 * with". These darken the same hue instead.
 */
export const ToneDrivesTheBorder: Story = {
  render: () => (
    <Stack gap={10}>
      <Inline gap={10}>
        {(['neutral', 'success', 'error'] as StepperTone[]).map((t) => (
          <Live key={t} label="Quantity" tone={t} start={t === 'error' ? 0 : 3}
            min={0} max={99}
            help={t === 'error' ? 'Must be at least 1' : t === 'success' ? 'Looks good' : 'How many copies'} />
        ))}
      </Inline>
      <Text size="body-sm" tone="secondary">
        Focus a validated one: the border keeps its hue and the ring carries focus — §2.1.
        Only a neutral field turns blue on focus.
      </Text>
    </Stack>
  ),
};

/**
 * ALL SIX STATES. `State` is interaction, `Validation` is data — the split is
 * right, and §5 notes two things it gets right and one it does not.
 *
 * **Press one chevron and watch the other.** §5 / defect 3: Figma's
 * `State=active` lives on the *container* and sets **both** chevrons active, so
 * pressing anywhere lights up and down together. `:active` scoped to the button
 * is free in CSS.
 *
 * **Watch the chevron, not the fill.** §4.3: the button's hover fill is 1.08:1
 * and its pressed fill 1.12:1 — imperceptible. The chevron going 6.79 → 14.05 →
 * 3.84 with a hue shift is doing all the work. *"Worth knowing before someone
 * 'fixes' a state by adjusting the fill."*
 *
 * `read-only` is well modelled in Figma and kept: sunken fill, border intact,
 * value still readable at 13.47:1, and **both buttons disabled** — a read-only
 * stepper with live chevrons would be a contradiction.
 */
export const States: Story = {
  render: () => (
    <Stack gap={8}>
      {([['default / hover / focus / active', {}],
         ['disabled', { disabled: true }],
         ['read-only', { readOnly: true }]] as const).map(([name, extra]) => (
        <Stack key={name} gap={3}>
          <Text size="overline" tone="tertiary">{name}</Text>
          <Live label="Quantity" start={3} min={0} max={99} {...extra} />
        </Stack>
      ))}
      <Stack gap={3}>
        <Text size="overline" tone="tertiary">at the bounds — the reached chevron disables</Text>
        <Inline gap={10}>
          <Live label="At minimum" start={0} min={0} max={5} help="Cannot go below 0" />
          <Live label="At maximum" start={5} min={0} max={5} help="Cannot go above 5" />
        </Inline>
      </Stack>
      <Text size="body-sm" tone="secondary">
        §9.3 / defect 8: Figma has no concept of a bound, so a stepper at its maximum
        looks fully operable there.
      </Text>
    </Stack>
  ),
};

/**
 * LAYOUT AND GEOMETRY. Two things to measure here.
 *
 * **The two chevron buttons must be 17px each.** §9.2: Figma's column is the
 * container's *full* 34px height, sitting **on** the 1px border so the divider
 * meets the outer edge. Laid out as a plain flex child it would be 32px, and
 * `flex: 1 1 0` would split that **16.5 / 15.5** — because the first button's
 * border counts in its flex base. A half-pixel-off divider and two unequal
 * targets. The fix is `-my-px` on the column plus a fixed height per button.
 *
 * **The control is 170px** and the column's corners sit flush inside the rounded
 * container. §3.2: Figma clips at radius **5**, not 6 — the nesting radius,
 * 6 minus the 1px border. *"Get this wrong and square corners poke out of a
 * rounded box."* Here `overflow-hidden` does the same job.
 *
 * `Position=left` reverses child order. The doc frame records the previous build
 * rotating the column −180°, which carried the radii and the up/down order with
 * it.
 */
export const Layouts: Story = {
  render: () => (
    <Stack gap={10}>
      <Stack gap={3}>
        <Text size="overline" tone="tertiary">label on top · chevrons right</Text>
        <Live label="Quantity" start={12} min={0} max={999} help="How many copies" />
      </Stack>
      <Stack gap={3}>
        <Text size="overline" tone="tertiary">label inline · 84px column, centred against the 34px control</Text>
        <Live label="Quantity" start={12} min={0} max={999} inline help="How many copies" />
      </Stack>
      <Stack gap={3}>
        <Text size="overline" tone="tertiary">chevrons left — reversed order, not a rotation</Text>
        <Live label="Quantity" start={12} min={0} max={999} btnsLeft />
      </Stack>
      <Surface pad={6} radius="lg" border="divider">
        <Text size="body-sm" tone="secondary">
          §3.4, stated rather than hidden: each chevron is 28 × 17, and **17 fails**
          WCAG 2.2's 24 × 24 minimum. It conforms only under the equivalent-control
          exception — the value can be typed. The md is blunt that this "is a legal
          argument, not an ergonomic one": a 17px target is hard for anyone with a tremor,
          and the exception is moot in read-only, where nothing can be typed.
        </Text>
      </Surface>
    </Stack>
  ),
};

/**
 * TYPING AND CLAMPING — the part that is easy to get wrong.
 *
 * `min`/`max`/`step` give you ArrowUp/ArrowDown, mobile numeric keyboards and
 * form participation for free, **but they clamp only during stepping**. Typing
 * `5000` into a `max="999"` field leaves the value at 5000 with
 * `validity.rangeOverflow` set. So the JS clamp is load-bearing.
 *
 * **Try three things** (§9.6):
 * 1. Type `5000` and blur — clamps to 999.
 * 2. **Clear the field entirely.** It must stay empty while you type. If it snaps
 *    back, the clamp is inside `onChange`: an empty input gives `valueAsNumber`
 *    NaN, the change is dropped, and the caret fights back.
 * 3. Tab through. **One** stop, landing in the input — the chevrons are
 *    `tabIndex={-1}` because the input already handles Up/Down. Three stops per
 *    field is what you get otherwise.
 *
 * Click a chevron and the caret returns to the input.
 */
export const TypingAndBounds: Story = {
  render: () => (
    <Stack gap={8}>
      <Live label="Copies" start={1} min={1} max={999} step={1} help="1 to 999" />
      <Live label="Year" start={2024} min={1900} max={2100} help="Typing 2 does not snap to 1900" />
      <Text size="body-sm" tone="secondary">
        The second one is the mid-typing case: with a per-keystroke clamp, typing toward
        2024 would jump to 1900 on the first digit.
      </Text>
    </Stack>
  ),
};

/** The bare control, without a label or help text. */
export const ControlOnly: Story = {
  render: function C() {
    const [v, setV] = useState(3);
    return <Stepper label="Quantity" value={v} onValueChange={setV} min={0} max={99} />;
  },
};
