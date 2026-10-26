import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Toggle } from './Toggle';
import { Inline, Stack, Text } from '../../primitives';

/**
 * INCOMING. §9.6's checklist is the review script. Its first row is the one that
 * matters: **if the off track renders light grey, someone restored `#D3D3E5` or
 * bound it to `neutral/700` — both fail.** It should be a mid grey.
 */
const meta = {
  title: 'Components/Toggle', component: Toggle, parameters: { layout: 'padded' },
  args: { label: 'Email notifications', checked: false, onCheckedChange: () => {} },
} satisfies Meta<typeof Toggle>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * THE DELIBERATE, VISIBLE CHANGE — §2.1 option A.
 *
 * Figma's off track is `#D3D3E5`, and the white knob against it is **1.48:1**
 * where 1.4.11 needs 3:1. Knob position IS the state, so the single most
 * important signal in the component is the one that fails. The track is also
 * 1.48:1 against the page, so it barely reads as a control until it is on.
 *
 * rev 1 recommended a knob border at 3.06:1. **rev 2 retracts that**: 3.06 was
 * measured against the literal hex, and **neither `#D3D3E5` nor `#BCBCD1` is a ZF
 * primitive** — so a real build cannot have that number. Against the nearest
 * primitive it is 2.95 and fails.
 *
 * Option A darkens the track to `neutral/1100` and clears both boundaries at
 * **4.52:1** with no border at all. §2.1 is blunt about the cost: "an off toggle
 * becomes visually heavy, and a settings page with a column of them reads dark.
 * That is a design decision, and it is the one this file recommends taking."
 *
 * This is the story to judge that on.
 */
export const OffTrack: Story = {
  render: function O() {
    const [on, setOn] = useState([false, false, false, true]);
    return (
      <Stack gap={5}>
        {['Email notifications', 'Desktop alerts', 'Weekly digest', 'Two-factor authentication']
          .map((l, i) => (
            <Toggle key={l} label={l} checked={on[i]}
              onCheckedChange={(v) => setOn(on.map((o, j) => (i === j ? v : o)))} />
          ))}
        <Text size="body-sm" tone="secondary">
          A column of mostly-off toggles is exactly the case §2.1 warns reads dark. Judge
          it here, in both panes.
        </Text>
      </Stack>
    );
  },
};

/**
 * HOVER MUST ACTUALLY FIRE — §9.6, and §8 explains why it so often does not.
 *
 * The input is visually hidden with `pointer-events: none`, so it can **never**
 * match `:hover`. A rule written against the input "is dead code that silently
 * does nothing". Hover is driven from the wrapping `<label>` instead.
 *
 * **Mouse over the label text, not the track.** The track should darken from
 * `#71758F` to `#6A6E85`. If nothing happens, hover is on the wrong element.
 *
 * (This rule caught a live bug in `Checkbox`, which had all seven of its hover
 * classes on the input.)
 */
export const Hover: Story = {
  render: function H() {
    const [a, setA] = useState(false);
    const [b, setB] = useState(true);
    return (
      <Stack gap={5}>
        <Toggle label="Hover this label — the off track darkens" checked={a} onCheckedChange={setA} />
        <Toggle label="Hover this one — the on track darkens" checked={b} onCheckedChange={setB} />
      </Stack>
    );
  },
};

/**
 * ERROR RENDERS AT REST — §5. Figma's only error variants are **focus** variants,
 * and they change nothing but the ring colour, so "error is invisible to a mouse
 * user, invisible in a screenshot, and invisible to anyone who has not tabbed to
 * the control." 12 of 32 variants are missing, all non-focus error.
 *
 * §9.2's ring is **outside** the track with a 1px page-coloured spacer, so it is
 * measured against the page — **6.09:1** Light, **5.56:1** Dark. An inset ring
 * shares an edge with the track: 1.35:1 Light, and **1.05:1 in Dark on the
 * on-state**, which is invisible.
 *
 * Check there is a gap between the track and the red. Then tab to one: the focus
 * ring moves to a 5px offset so the two read as separate rings, not one thick
 * band. Then look at the disabled one — the ring is **deliberately suppressed**,
 * because 50% opacity would fade it to 1.20:1.
 */
export const Error: Story = {
  render: () => (
    <Stack gap={6}>
      {([['off', false, {}], ['on', true, {}],
        ['disabled — ring suppressed', false, { disabled: true }]] as const).map(([l, c, p]) => (
        <Toggle key={l} label={`Error, ${l}`} checked={c} onCheckedChange={() => {}}
          error errorMessage="This setting is locked by your administrator" {...p} />
      ))}
    </Stack>
  ),
};

/**
 * BOTH SIZES — §3.1: the small one is **not** a uniform scale. Width ×0.800,
 * height ×0.778, knob ×0.714, padding ×1.000. Four different ratios, because the
 * padding stays 2px and takes a proportionally larger bite out of the smaller
 * track. Both are declared explicitly; "do not try to express the small size as a
 * `scale()` — there isn't one."
 *
 * Knob travel is 12px large and 10px small, from `width − 2·padding − knob`.
 */
export const Sizes: Story = {
  render: function S() {
    const [on, setOn] = useState(true);
    return (
      <Stack gap={6}>
        {(['md', 'sm'] as const).map((size) => (
          <Inline key={size} gap={8} align="center">
            <Text size="caption" tone="tertiary" className="w-8 shrink-0">{size}</Text>
            <Toggle size={size} label="Off" checked={false} onCheckedChange={() => {}} />
            <Toggle size={size} label="On" checked={on} onCheckedChange={setOn} />
          </Inline>
        ))}
      </Stack>
    );
  },
};

/**
 * DISABLED — §4.2. Figma stacks two things: the off-disabled variant uses the
 * **hover** track colour, *and* the variant carries `opacity: 0.5`. So a disabled
 * toggle derives from a darker base than an idle one, and the canon's quoted
 * 2.10:1 ignores the opacity — the real number is **1.42**.
 *
 * Built from the **default** track at 50%, and **not** `primary/border`: that
 * resolves to blue/800 and composites to **1.28:1**, worse than what Figma ships.
 * Under option A both improve as a side effect — 1.93 and 1.95.
 */
export const Disabled: Story = {
  render: () => (
    <Stack gap={5}>
      <Toggle label="Off, disabled" checked={false} onCheckedChange={() => {}} disabled />
      <Toggle label="On, disabled" checked onCheckedChange={() => {}} disabled />
    </Stack>
  ),
};

/**
 * MOTION — §10 defect 10: "no motion defined anywhere, yet the entire affordance
 * is a sliding knob." 150ms ease, on `transform` so it stays on the compositor;
 * Figma's MIN/MAX alignment would be an un-animatable jump.
 *
 * `prefers-reduced-motion` is honoured globally in `index.css`, so with that OS
 * setting on the knob should jump rather than slide.
 */
export const Motion: Story = {
  render: function M() {
    const [on, setOn] = useState(false);
    return (
      <Stack gap={4} align="start">
        <Toggle label="Click me repeatedly" checked={on} onCheckedChange={setOn} />
        <Text size="body-sm" tone="secondary">
          Then turn on Reduce Motion in the OS and try again — the knob should jump.
        </Text>
      </Stack>
    );
  },
};
