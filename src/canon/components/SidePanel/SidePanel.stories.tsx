import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SidePanel, SidePanelBody } from './SidePanel';
import { Button } from '../Button/Button';
import { Stack, Surface, Text } from '../../primitives';

/**
 * INCOMING. §9.6 is the review script and its first row is the whole file:
 * **open the panel and the page behind must dim.** No dimming means no scrim,
 * which is the single biggest gap between the Figma component and a working
 * panel.
 *
 * The md's §9 was rendered and measured in headless Chromium before being
 * written, and it records three defects found that way — the drawer rendering
 * flush *left*, `onClose` firing *twice*, and a text-selection drag dismissing
 * the panel. All three are guarded here; the stories below let you check each.
 */
const meta = {
  title: 'Components/SidePanel', component: SidePanel, parameters: { layout: 'padded' },
  args: { open: false, onClose: () => {}, title: 'Header label', children: null },
} satisfies Meta<typeof SidePanel>;
export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ label = 'Open panel', ...p }: Partial<React.ComponentProps<typeof SidePanel>>
  & { label?: string }) {
  const [open, setOpen] = useState(false);
  const [closes, setCloses] = useState(0);
  return (
    <Stack gap={5}>
      <Button onClick={() => { setOpen(true); setCloses(0); }}>{label}</Button>
      <Text size="body-sm" tone="secondary">onClose fired: {closes}×</Text>
      <SidePanel
        open={open}
        onClose={() => { setOpen(false); setCloses((c) => c + 1); }}
        title="Header label"
        {...p}
      >
        {p.children ?? <SidePanelBody>Panel content goes here</SidePanelBody>}
      </SidePanel>
    </Stack>
  );
}

/**
 * **THE §2 FIX — the scrim.** `overlay/scrim` was created for this component and
 * **nothing in the Figma file uses it.** The md searched every node on every
 * page: the only matches for "overlay", "scrim" or "backdrop" are text nodes
 * inside two documentation frames, both of which *describe* an overlay.
 *
 * So the doc frame's anatomy row — *"Overlay — was: did not exist — now:
 * overlay/scrim"* — is true as written and misleading in place: the component
 * gained a token for an overlay, not an overlay.
 *
 * **Four things to check** (§9.6):
 * 1. The page behind **dims**, and the scrim is translucent rather than opaque —
 *    an opaque one means the alpha was flattened in the token pipeline.
 * 2. **Click the dimmed area** — it closes.
 * 3. **Press Esc** — it closes *and* the counter above increments, meaning
 *    React's state went false too, not just the DOM.
 * 4. **The counter reads 1×, never 2×.** Unguarded, the effect re-fires `close`
 *    after the parent's `open` is already false.
 *
 * And the one that is easy to miss: **drag from inside the panel and release on
 * the dimmed area.** The panel must stay open. Without the pointerdown latch,
 * every text selection that overshoots the edge dismisses the panel — because
 * the resulting click reports the `<dialog>` as its target.
 */
export const Default: Story = { render: () => <Demo /> };

/**
 * **THE §2.1 FIX — and the reason to open this one in dark mode.**
 *
 * Composite the scrim over each mode's page and measure the panel against the
 * result: Light is `#8E8F93` and the white panel reads at **3.23:1**. Dark
 * composites to **`#0A0C11`** while the panel is `#1D202E` — **1.21:1**.
 *
 * The drop shadow does *worse* than nothing there: `#12141F` is **lighter** than
 * the scrim, so it lands at `#0B0D13` and takes 1.21 down to **1.20**. A shadow
 * meant to lift the panel off the page is lifting the page toward the panel.
 *
 * So the panel's leading edge — the only thing saying where the panel ends and
 * the dimmed page begins — has no boundary at all.
 *
 * This is the one border **added** rather than matched to Figma, because Figma's
 * own `border/default` does not fix it: 1.26 against the panel and **1.52
 * against the scrim**. `border/control` gives 5.67 and 6.85. In Light it is 1.40
 * against the scrim — invisible, and unnecessary, since Light already passes.
 *
 * **Flip the Pane switch and look at the left edge.**
 */
export const DarkModeEdge: Story = { render: () => <Demo label="Open — then switch to dark" /> };

/**
 * WITH A FOOTER, and two things Figma does that this reverses.
 *
 * §3.3: Figma's footer is **left-aligned** with **Save before Cancel**, leaving
 * 325px of empty space at the trailing edge — two small buttons huddled in the
 * bottom-left of a 460px panel. Both are questionable: a drawer's actions
 * conventionally sit where the eye finishes and where the close button already
 * is, and in a left-to-right reading order the confirming action comes last.
 *
 * Nothing in the doc frame says either was decided rather than being the default
 * `MIN` a new auto-layout frame gets. §11 decision 2 is yours to take.
 *
 * Also check the **body scrolls, not the panel**. Figma's body instance is
 * `FILL / FIXED`, so a swapped-in Body sits at the top of a 719px frame and can
 * neither grow nor scroll.
 */
export const WithFooter: Story = {
  render: () => (
    <Demo
      label="Open with actions"
      footer={<>
        <Button emphasis="secondary" size="md">Cancel</Button>
        <Button size="md">Save</Button>
      </>}
    >
      <Stack gap={5} className="p-10">
        {Array.from({ length: 24 }, (_, i) => (
          <Text key={i} size="body" tone={i === 0 ? 'default' : 'secondary'}>
            {i === 0 ? 'Scroll me — the header and footer must stay put.' : `Row ${i + 1}`}
          </Text>
        ))}
      </Stack>
    </Demo>
  ),
};

/**
 * **TINTED HEADER — Figma's `Tinted header` boolean.** It shows a
 * `surface/sunken` rectangle behind the header.
 *
 * **It is wired and it is working. You almost certainly cannot see it.** §4.3
 * measures the change at **1.12:1** in Light and **1.05:1 in Dark** — "very
 * close to nothing, and in Dark effectively nothing". The swatches below are
 * the same two roles side by side at full height, which is the only way to
 * judge a ratio that small; flipping between two panel screenshots will not do
 * it.
 *
 * The header already has a 1px rule separating it from the body, so the tint is
 * doing decorative work rather than structural work. §11 decision 3 asks
 * whether a 1.12:1 change earns a property at all — that is the open question,
 * not whether it renders.
 */
export const TintedHeader: Story = {
  render: () => (
    <Stack gap={10}>
      <Stack gap={3}>
        <Text size="overline" tone="tertiary">the two surfaces, adjacent — this is the whole difference</Text>
        <div className="flex w-side-panel max-w-full overflow-hidden rounded-lg border border-border-default">
          <div className="flex-1 grid place-items-center h-side-panel-header bg-surface-default">
            <Text size="body-sm" tone="secondary">surface/default</Text>
          </div>
          <div className="flex-1 grid place-items-center h-side-panel-header bg-surface-sunken">
            <Text size="body-sm" tone="secondary">surface/sunken · 1.12:1</Text>
          </div>
        </div>
      </Stack>
      <Stack gap={3}>
        <Text size="overline" tone="tertiary">and in the panel — open each and compare the header strip</Text>
        <div className="flex gap-5">
          <Demo label="Plain header" />
          <Demo label="Tinted header" tintedHeader />
        </div>
      </Stack>
      <Surface pad={6} radius="lg" border="divider">
        <Text size="body-sm" tone="secondary">
          Switch to dark mode and the swatch pair goes to 1.05:1 — at that point the two
          halves are the same colour for practical purposes. That is Figma's value, not a
          bug, and §11 decision 3 is where it gets resolved.
        </Text>
      </Surface>
    </Stack>
  ),
};

/**
 * THE REMAINING PROPERTIES.
 *
 * `showClose={false}` removes the close button. Note it is the panel's **first
 * tab stop** and Figma gives it neither hover nor focus (§5) — both are supplied
 * here. Tab to it and check the ring.
 *
 * The non-modal variant uses `show()` rather than `showModal()`: no focus trap,
 * no scrim, no inert page. §8 — "do not trap while `aria-modal` is false."
 */
export const Variants: Story = {
  render: () => (
    <Stack gap={10}>
      <Demo label="No close button" showClose={false}
        footer={<Button size="md">Done</Button>} />
      <Demo label="Non-modal (no scrim, no trap)" modal={false} />
      <Surface pad={6} radius="lg" border="divider">
        <Text size="body-sm" tone="secondary">
          On the non-modal one, Tab out of the panel — focus should reach the page behind.
          On the other it must not. That is `showModal()` versus `show()`, and it is the
          whole reason `modal` is a prop rather than an assumption.
        </Text>
      </Surface>
    </Stack>
  ),
};
