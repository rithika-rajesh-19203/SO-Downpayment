import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox } from './Checkbox';
import type { CheckboxSelection } from './Checkbox';
import { Inline, Stack, Text } from '../../primitives';

/**
 * INCOMING — not exported from '@canon'. Review in all four pane × hue
 * combinations. §9.7's checklist is the review script, and its last row is the
 * one that catches copied Figma values: **in Dark, the box fill, glyph and border
 * must all flip. Nothing stays light.**
 */
const meta = {
  title: 'Components/Checkbox', component: Checkbox, parameters: { layout: 'padded' },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

const SELECTIONS: CheckboxSelection[] = ['unchecked', 'checked', 'indeterminate'];

/**
 * THE FULL MATRIX — 3 selections × 4 conditions. Figma draws **15 of 24**, and
 * §2 records that error styling exists only for the unchecked box: "a ticked
 * checkbox in an invalid group shows no error at all, and neither does a
 * partly-selected parent row."
 *
 * All 12 error combinations exist here. **Hover the errored checked box** —
 * §9.7's sharpest check. In CSS this is a specificity trap: the state selectors
 * reach (0,5,0) and a bare error class loses, so the border would turn blue on
 * hover while still showing a red halo. The border must stay red.
 *
 * That trap doesn't arise here at all — selection, error and disabled are props,
 * so exactly one border colour is ever emitted and nothing depends on stylesheet
 * order.
 */
export const Matrix: Story = {
  render: () => (
    <Stack gap={6}>
      {([
        ['default', {}],
        ['error — Figma draws only the unchecked cell', { error: true }],
        ['disabled', { disabled: true }],
        ['disabled + error — deliberately identical to disabled', { disabled: true, error: true }],
      ] as const).map(([label, props]) => (
        <Inline key={label} gap={8} align="center">
          <Text size="caption" tone="tertiary" className="w-rail shrink-0">{label}</Text>
          {SELECTIONS.map((sel) => (
            <Inline key={sel} gap={3} align="center">
              <Checkbox selection={sel} {...props} />
              <Text size="caption" tone="tertiary">{sel}</Text>
            </Inline>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

/**
 * THE DARK-MODE BUG — §4.2, and the cheapest real fix in the whole file.
 *
 * All six unchecked variants bind their fill to the **primitive**
 * `color/base/white`. A primitive has one value, so in Dark every checkbox in the
 * product renders as a white block — and **32 of the 34 instances in the file are
 * table select-row cells**, so a dark-mode table would show 32 white squares.
 *
 * `surface/default` is `base/white` in Light, so the swap is a zero-pixel change
 * today and the entire fix for Dark.
 *
 * **Switch the Pane control.** These eight are a row of table select cells. In
 * Light they are white on white and you can only see their borders. In Dark they
 * must go dark with the page — if any of them stays a white square, the fill has
 * been bound to a primitive somewhere.
 *
 * (There is no side-by-side "wrong" column here on purpose: rendering one would
 * mean binding a primitive as a fill, which is the thing this story is about.)
 */
export const DarkModeFill: Story = {
  render: () => (
    <Stack gap={6}>
      <Inline gap={5}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Checkbox key={i} selection={i % 3 === 0 ? 'checked' : 'unchecked'} />
        ))}
      </Inline>
      <Text size="body-sm" tone="secondary">
        32 of the 34 checkbox instances in the Figma file are exactly this — table
        select-row cells. A dark-mode table would show 32 white squares.
      </Text>
    </Stack>
  ),
};

/**
 * INDETERMINATE IS SET IN JAVASCRIPT — §6. `<input type="checkbox" indeterminate>`
 * does nothing; it is a DOM property with no HTML attribute, and §6 calls it "the
 * single most common implementation mistake with this control".
 *
 * §6 also: **never let a user set indeterminate directly.** It is a computed
 * summary of child rows, so clicking a mixed parent resolves to checked or
 * unchecked and never cycles back to mixed. Try it.
 */
export const ParentChild: Story = {
  render: function P() {
    const [rows, setRows] = useState([true, false, false]);
    const all = rows.every(Boolean);
    const none = rows.every((r) => !r);
    return (
      <Stack gap={3}>
        <Checkbox
          selection={all ? 'checked' : none ? 'unchecked' : 'indeterminate'}
          onSelectionChange={() => setRows(rows.map(() => !all))}
          label="All line items"
        />
        <Stack gap={3} className="pl-10">
          {rows.map((on, i) => (
            <Checkbox
              key={i}
              selection={on ? 'checked' : 'unchecked'}
              onSelectionChange={() => setRows(rows.map((r, j) => (i === j ? !r : r)))}
              label={`Line ${i + 1}`}
            />
          ))}
        </Stack>
      </Stack>
    );
  },
};

/**
 * THE COMPOSITE — §1: `checkbox_defined` has **no state axes at all**, so no
 * consumer can show a checked, hovered, focused, disabled or invalid row without
 * overriding the nested instance by hand. §1: "In code, do not mirror that."
 *
 * The `<label>` is the hit area and it is the only thing that makes **2.5.8**
 * pass — §3.4: 12 × 12 is 144px² against the 576px² required, a quarter. Click
 * the text, not the box.
 */
export const WithLabelAndDescription: Story = {
  render: () => (
    <Stack gap={6} className="max-w-page-header">
      <Checkbox label="Accept the terms" />
      <Checkbox
        selection="checked"
        label="Accept the terms"
        description="You can withdraw consent later from Settings"
      />
      <Checkbox
        label="Accept the terms"
        description="You can withdraw consent later from Settings"
        error
        errorMessage="You must accept the terms to continue"
      />
      <Checkbox
        selection="checked"
        label="Accept the terms"
        description="You can withdraw consent later from Settings"
        disabled
      />
    </Stack>
  ),
};

/**
 * THE BARE BOX — §1's table select-row cell, 32 of the 34 instances in the file.
 *
 * One divergence from §9.5 worth knowing: it returns a `<span>` here, but the
 * input is `pointer-events: none` and 1px, so nothing inside a span would ever
 * toggle it. This uses a `<label>`, which costs nothing and keeps the box
 * clickable. The row still supplies the real hit area.
 */
export const BareForTables: Story = {
  render: function B() {
    const [sel, setSel] = useState<CheckboxSelection[]>(['checked', 'unchecked', 'unchecked']);
    return (
      <Stack gap={4}>
        {['PO-2026-00814', 'PO-2026-00816', 'PO-2026-00819'].map((row, i) => (
          <Inline key={row} gap={5} align="center">
            <Checkbox
              selection={sel[i]}
              onSelectionChange={(n) => setSel(sel.map((s, j) => (i === j ? n : s)))}
            />
            <Text size="body">{row}</Text>
          </Inline>
        ))}
      </Stack>
    );
  },
};

/**
 * THE GLYPHS — §9.3. Both are authored so the viewBox IS the measured ink extent
 * and nothing rescales: the check is 7.32 × 5.46 with a **1.75px** stroke, the
 * bar is 7.89 × **2** tall. §9.7: "get this wrong and the glyph renders small
 * with a thin stroke."
 *
 * Zoom the browser to 400%. The stroke should stay proportional and the check
 * should not drift off-centre.
 */
export const Glyphs: Story = {
  render: () => (
    <Inline gap={10} align="center">
      {(['checked', 'indeterminate'] as CheckboxSelection[]).map((s) => (
        <Stack key={s} gap={3} align="center">
          <Checkbox selection={s} />
          <Text size="caption" tone="tertiary">{s}</Text>
        </Stack>
      ))}
    </Inline>
  ),
};
