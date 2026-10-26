import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from './Radio';
import { Inline, Stack, Text } from '../../primitives';

/**
 * INCOMING — not exported from '@canon'. Review in all four pane × hue
 * combinations before admitting.
 */
const meta = {
  title: 'Components/Radio', component: Radio, parameters: { layout: 'padded' },
} satisfies Meta<typeof Radio>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ALL 16 COMBINATIONS. Figma has 10 — §3 lists the six gaps, and four of them are
 * one missing idea repeated: `Is Active` and `Is Error` are declared independent
 * and **never combined in any variant**.
 *
 * Here selection is native `:checked` and validation is a prop, so the matrix
 * cannot be incomplete. The two §3 calls "the serious ones" — `focus + error`,
 * where a keyboard user in an error state gets no focus indication — exist by
 * construction. **Tab through the error row to see them.**
 *
 * Hover and focus are real states, not pictures of states. Hover the row too.
 */
export const Matrix: Story = {
  render: () => (
    <Stack gap={6}>
      {([
        ['default', {}],
        ['error', { error: true }],
        ['disabled', { disabled: true }],
        ['disabled + error — deliberately identical to disabled', { disabled: true, error: true }],
      ] as const).map(([label, props], i) => (
        <Inline key={label} gap={8} align="center">
          <Text size="caption" tone="tertiary" className="w-rail shrink-0">{label}</Text>
          <Inline gap={5} align="center">
            <Radio name={`m${i}`} readOnly {...props} />
            <Text size="caption" tone="tertiary">unchecked</Text>
          </Inline>
          <Inline gap={5} align="center">
            <Radio name={`m${i}b`} checked readOnly {...props} />
            <Text size="caption" tone="tertiary">checked</Text>
          </Inline>
        </Inline>
      ))}
      <Text size="body-sm" tone="secondary">
        §3 rates `disabled + error` "likely correct to omit" — a disabled control cannot
        be corrected — so `error` is ignored when disabled rather than producing a state
        that means nothing. The last two rows should look identical.
      </Text>
    </Stack>
  ),
};

/**
 * SELECTION MUST NOT CHANGE THE DIAMETER — §4.1, defect 6, and the thing to check
 * hardest here.
 *
 * In Figma the resting stroke is 1px `CENTER`-aligned, so half of it sits outside
 * the 12px frame and the visible circle is **13px**. The selected stroke is 3px
 * `INSIDE`, so that circle is **12px**. Selecting a radio therefore shrinks it by
 * half a pixel on every side, and in a vertical group the left edges stop lining
 * up with the chosen one.
 *
 * `border-box` fixes it by the box model rather than by a value. **Look down the
 * left edge of the column below** — every circle should start at exactly the same
 * x, whichever one is selected. Click a different one and nothing should shift.
 *
 * And note what is NOT there: no centre dot. §9 — the 6px core is the surface
 * showing through a 3px ring.
 */
export const NoWobble: Story = {
  render: () => (
    <Stack gap={4}>
      {['Purchase order', 'Sales order', 'Transfer order', 'Return order'].map((l, i) => (
        <label key={l}>
          <Inline gap={4} align="center">
            <Radio name="wobble" defaultChecked={i === 1} />
            <Text size="body">{l}</Text>
          </Inline>
        </label>
      ))}
    </Stack>
  ),
};

/**
 * THE RESTING BORDER — the one value that needed a new role.
 *
 * §5.1: Figma draws `#E4E4F0` at **1.26:1** and the canon's proposed snap to
 * `neutral/600` is **1.31:1**. Both fail WCAG 1.4.11's 3:1, and this is the state
 * a radio is in almost all of the time — "the circle is very nearly invisible
 * against a white form".
 *
 * The neutral ramp jumps 2.85 → 4.52 with nothing between, so snapping to the
 * palette does not fix it; only choosing a darker step does. `border/control` at
 * `neutral/1100` (4.52:1 Light, 3.22:1 Dark) is that step, and it is exactly what
 * §10's own reference CSS uses.
 *
 * The middle row is what would have shipped.
 */
export const RestingBorder: Story = {
  render: () => (
    <Stack gap={6}>
      <Inline gap={6} align="center">
        <Radio name="rb1" />
        <Text size="body-sm">
          <Text as="span" size="body-sm" weight="medium">border/control</Text> — neutral/1100, 4.52:1 ✓
        </Text>
      </Inline>
      <Inline gap={6} align="center">
        <Radio name="rb2" className="border-border-default" />
        <Text size="body-sm" tone="secondary">
          border/default — neutral/600, 1.31:1 ✗ what the canon proposed
        </Text>
      </Inline>
      <Text size="body-sm" tone="secondary">
        Both circles are unselected and enabled. If you can only see one of them, that
        is the finding.
      </Text>
    </Stack>
  ),
};

/**
 * A GROUP, WHICH IS THE ONLY WAY A RADIO IS EVER CORRECT.
 *
 * §8 lists three things this component does not and cannot provide on its own:
 *
 *  - **2.5.8 target size.** 12 × 12 is 144px² against 576px² required — a
 *    quarter. The `<label>` is the hit area, and it is the only thing that fixes
 *    this. Click the text below, not the circle.
 *  - **1.3.1 grouping.** A `<fieldset>` with a `<legend>`, or `role="radiogroup"`
 *    with a name. Without it a screen reader announces the options but not what
 *    the user is choosing between.
 *  - **1.4.1 error by colour alone.** A red border is the only signal, so it must
 *    be paired with a message via `aria-describedby`.
 *
 * All three are the consumer's job today, which §11.1 calls out as an absence
 * rather than a defect: **there is no `RadioField` composite.** That is §13 Q2,
 * and it is the next thing this component needs. Until it exists, this story is
 * the pattern to copy.
 */
export const InAFieldset: Story = {
  render: () => (
    <fieldset>
      <Stack gap={4}>
        <legend>
          <Text size="label" tone="secondary">Order type</Text>
        </legend>
        {['Purchase order', 'Sales order', 'Transfer order'].map((l, i) => (
          <label key={l}>
            <Inline gap={4} align="center">
              <Radio name="order-type" defaultChecked={i === 0} />
              <Text size="body">{l}</Text>
            </Inline>
          </label>
        ))}
        <Text size="body-sm" tone="secondary" className="pt-2">
          Focus one and press the arrow keys. That is free from a native input with a
          shared `name`, and it is the second reason this is not a styled div.
        </Text>
      </Stack>
    </fieldset>
  ),
};

/** Error, paired with a message — a red border alone does not satisfy 1.4.1 (§8). */
export const ErrorNeedsAMessage: Story = {
  render: () => (
    <fieldset>
      <Stack gap={4}>
        <legend><Text size="label" tone="secondary">Shipping method</Text></legend>
        {['Standard', 'Express', 'Overnight'].map((l, i) => (
          <label key={l}>
            <Inline gap={4} align="center">
              <Radio name="ship" error defaultChecked={i === 2} aria-describedby="ship-err" />
              <Text size="body">{l}</Text>
            </Inline>
          </label>
        ))}
        <Text id="ship-err" size="body-sm" tone="danger">
          Overnight is not available for this delivery address
        </Text>
      </Stack>
    </fieldset>
  ),
};
