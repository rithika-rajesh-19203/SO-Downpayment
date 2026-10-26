import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Segmented } from './Segmented';
import type { SegmentOption } from './Segmented';
import { Stack, Inline, Surface, Text } from '../../primitives';

/**
 * INCOMING. §9.6 is the review script, and its first two rows are the whole
 * component: **the selected segment has a visible border**, and **it survives
 * dark mode**.
 *
 * A note on the icons: `card-view` and `list-view` are in the roster and marked
 * stroked, but no SVG has been ingested yet — so they render the **dashed
 * placeholder**. That is the tracking mechanism working, not a bug. Drop the two
 * exports into `design-refs/icons/` and run `npm run icons:sync`.
 */
const meta = {
  title: 'Components/Segmented', component: Segmented, parameters: { layout: 'padded' },
  args: { options: [], value: '', onChange: () => {}, label: 'View mode' },
} satisfies Meta<typeof Segmented>;
export default meta;
type Story = StoryObj<typeof meta>;

const VIEWS: SegmentOption[] = [
  { value: 'card', label: 'Card View', icon: 'card-view' },
  { value: 'list', label: 'List View', icon: 'list-view' },
];

function Live({ options, showLabels, disabled, label = 'View mode' }: {
  options: SegmentOption[]; showLabels?: boolean; disabled?: boolean; label?: string;
}) {
  const [v, setV] = useState(options[0]!.value);
  return <Segmented options={options} value={v} onChange={setV}
    showLabels={showLabels} disabled={disabled} label={label} />;
}

/**
 * THE THREE PRESENTATIONS — Figma's `Content` axis on the track.
 *
 * §8: **`Content` is not a CSS class and not a prop.** The doc frame's own trap 1
 * says it exists so a designer picks a preset rather than toggling four
 * booleans, and that *"in code there is no `--content` modifier: it is which
 * children get rendered."* So the API is `icon` per option and one `showLabels`
 * flag — no third presentation to keep in sync.
 *
 * **Click, then Tab, then use the arrows.** §9.6: one tab stop, landing on the
 * selected segment. Arrows move *and* select, wrapping at both ends. None of
 * that is free — §8 and §10.1: the Figma doc frame claims 2.1.1 passes because
 * "native radio semantics give arrow-key navigation", and there are no native
 * radios in this component at all. That is the frame's one wrong claim, and
 * "it is the kind that gets a keyboard trap shipped".
 */
export const Presentations: Story = {
  render: () => (
    <Stack gap={10}>
      {([['icon + text', true], ['icon only', false]] as const).map(([name, show]) => (
        <Stack key={name} gap={3}>
          <Text size="overline" tone="tertiary">{name}</Text>
          <Inline gap={5}><Live options={VIEWS} showLabels={show} /></Inline>
        </Stack>
      ))}
      <Stack gap={3}>
        <Text size="overline" tone="tertiary">text only</Text>
        <Inline gap={5}>
          <Live options={[
            { value: 'all', label: 'All' },
            { value: 'mine', label: 'Assigned to me' },
          ]} />
        </Inline>
      </Stack>
      <Text size="body-sm" tone="secondary">
        Icon-only still announces its label — it moves to `sr-only`, it is not dropped.
        §9.1: Figma's `Show label = false` deletes the text node, which for a button means
        no accessible name at all.
      </Text>
    </Stack>
  ),
};

/**
 * **THE §2.1 FIX — and this is the story to look at in dark mode.**
 *
 * Figma conveys selection with a white segment on a recessed track: **1.12:1**.
 * In Dark those become two near-identical near-blacks at **1.05:1**, and the
 * shadow that is supposed to lift the segment is raw `#000000` at 8% — over a
 * dark track it composites to `#171A26`, which is **1.07:1** against the thing
 * it is lifting. A black shadow on a black surface.
 *
 * So in Dark, Figma's only remaining cue is the label shifting by 1.59:1.
 *
 * The 1px `border/control` here is 4.02 Light / 3.75 Dark against the track.
 * **Flip the Pane switch.** If the selected segment vanishes into the track, the
 * border is missing.
 *
 * Also check it does not *move* when selected: the transparent border is
 * reserved on the base rule, so switching the colour on shifts nothing.
 */
export const TheSelectionSignal: Story = {
  render: () => (
    <Stack gap={8}>
      <Inline gap={8}>
        {(['light', 'dark'] as const).map((t) => (
          <Surface key={t} pad={8} radius="lg" data-theme={t}>
            <Stack gap={4}>
              <Text size="overline" tone="tertiary">{t}</Text>
              <Live options={VIEWS} />
            </Stack>
          </Surface>
        ))}
      </Inline>
      <Text size="body-sm" tone="secondary">
        Both panes are forced here, so this comparison holds whichever way the toolbar is set —
        the theme selectors are attribute-only, so a `data-theme` on any element re-themes its subtree.
      </Text>
    </Stack>
  ),
};

/**
 * ALL EIGHT — `Selection` (2) × `State` (4). The axis split is correct:
 * `Selection` is what the user chose, `State` is what the pointer and keyboard
 * are doing.
 *
 * **Hover the selected segment. Nothing happens — that is correct.** §2.2, and
 * the doc frame's argument is better than the one I made about the pill:
 * *"A selected segment is not a target; changing it on hover suggests it can be
 * re-chosen."* Clicking a selected **pill** deselects it (filters are additive);
 * clicking a selected **segment** does nothing at all. A control that cannot
 * respond should not offer feedback. Do not "fix" it.
 *
 * **Hover an unselected one and watch the label, not the fill.** The fill change
 * is real but 1.04:1 — `surface/hover` is one ramp step from the track.
 *
 * Two things measured but exempt: disabled text is 1.89:1 Light / 2.49 Dark,
 * "below the threshold at which most people can read 12px type at all" (§4.3),
 * and it is the same `text/disabled` ceiling the pill hit.
 */
export const States: Story = {
  render: () => (
    <Stack gap={8}>
      <Stack gap={3}>
        <Text size="overline" tone="tertiary">enabled — hover and press both segments</Text>
        <Inline gap={5}><Live options={VIEWS} /></Inline>
      </Stack>
      <Stack gap={3}>
        <Text size="overline" tone="tertiary">disabled — the whole group, and it keeps its value</Text>
        <Inline gap={5}><Live options={VIEWS} disabled /></Inline>
      </Stack>
      <Text size="body-sm" tone="secondary">
        §9.3: there is no per-option `disabled` on purpose. A disabled *selected* segment would
        leave the group with no reachable value, and the arrow handler would `onChange` onto it
        while `focus()` silently no-ops.
      </Text>
    </Stack>
  ),
};

/**
 * TRUNCATION AND WIDTH. Figma has `textTruncation: DISABLED` and `maxWidth: null`,
 * so a long label grows the segment and the track without limit — a deliberate
 * divergence (§9.4): a segmented control in a constrained container must not
 * push its own track wider.
 *
 * The `max-width` on the **track** is what makes the ellipsis reachable. Without
 * a constraint somewhere, `truncate` is dead code.
 *
 * Measure the default one while you are here: **100 × 28** per segment and
 * **199 × 32** for the two-up track. If it comes out 102 and 203, the padding is
 * 10 instead of 9 and the 1px border is being added on top of the auto width
 * (§9.2 — `box-sizing: border-box` only subtracts a border from a *specified*
 * dimension).
 */
export const Truncation: Story = {
  render: () => (
    <Stack gap={8}>
      <Surface pad={6} radius="lg" border="divider" className="max-w-2xs">
        <Live options={[
          { value: 'a', label: 'Grouped by account owner' },
          { value: 'b', label: 'Grouped by filing period' },
        ]} />
      </Surface>
      <Text size="body-sm" tone="secondary">
        Constrained to 288px. The track hugs, the labels ellipsize, and neither segment
        overflows — that last part is `min-w-0`, which is load-bearing.
      </Text>
    </Stack>
  ),
};
