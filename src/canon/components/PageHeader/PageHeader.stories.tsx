import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { PageHeader } from './PageHeader';
import type { HeaderAction } from './PageHeader';
import { Stack, Surface, Text } from '../../primitives';

/**
 * INCOMING. §9.6 is the review script; the first four rows are the whole story.
 *
 * **This is the best-built family in the source and it is not close** — 143 of
 * 143 paints role-bound, 20 of 20 text nodes on a style, zero effects, and five
 * descriptions that are arguments rather than labels. One of them names the open
 * item that will retire the component it is attached to.
 *
 * We re-derived **44 of its figures** against our own primitives. **41 reproduce
 * to 0.01** — every ΔE, every text pair, the neutral-ramp gap, and the
 * `surface/pressed` ladder's monotonicity in both panes. The three that do not
 * are all the same divergence: **our `border/control` is a per-mode pair** where
 * the md assumes one value, so its Dark figures are conservative — 5.67 against
 * the band rather than 3.58, 5.31 against `surface/hover` rather than 3.35, 4.89
 * against `surface/pressed` rather than 3.09. Fifth md in a row.
 */
const meta = {
  title: 'Components/PageHeader', component: PageHeader,
  parameters: { layout: 'fullscreen' },
  args: { type: 'create', title: 'New Material Requirement Plan' },
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

const CREATE_ACTIONS: HeaderAction[] = [
  //  §9.1 — each names what it DOES. "Discard and close", not "Close".
  { id: 'attach', label: 'Attach a file', icon: 'attach', onSelect: () => {} },
  { id: 'settings', label: 'Settings', icon: 'settings', onSelect: () => {} },
  { id: 'close', label: 'Discard and close', icon: 'close', onSelect: () => {} },
];

const DETAIL_ACTIONS: HeaderAction[] = [
  { id: 'edit', label: 'Edit this plan', icon: 'edit', onSelect: () => {} },
  { id: 'close', label: 'Close', icon: 'close', onSelect: () => {} },
];

/**
 * The band sits at the top of the content column, so every story renders it over
 * `surface/canvas` — that is where §4.5's 1.08:1 and the rule's 1.11:1 live, and
 * neither is visible against a white Storybook backdrop.
 *
 * **The `<main>` is load-bearing, not decoration.** §9.1 measured three bare
 * `<header>`s producing three `banner` landmarks in the CDP accessibility tree,
 * against a document that already has one — the top bar. Scoped to `<main>` the
 * same markup produces zero.
 */
function Page({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-surface-canvas">
      {children}
      <Surface className="m-10 p-10">
        <Text tone="secondary">Content column.</Text>
      </Surface>
    </main>
  );
}

/**
 * **LIST — and the headline defect.**
 *
 * **Look at the title without hovering it.** In Figma that chip is
 * `surface/default` on a `surface/default` band — **1.00:1** — so at rest the
 * menu button is *not drawn at all*, and the only thing saying "this opens
 * something" is a 16px caret. It is visible at 4.32, but 16px of chevron beside
 * 18px Semi Bold reads as punctuation rather than as an affordance. Hover is
 * 1.08:1, and focus — the one state with a real signal — is the state a mouse
 * user never sees.
 *
 * The md is careful that this is **not** a WCAG failure: 1.4.11 wants 3:1 for
 * information *required to identify* a component, and the caret does identify
 * it. A menu button indistinguishable from static text is still wrong.
 *
 * **§9 answers it with a 1px `border/control` and that answer is not taken
 * here.** The reference draws the title as bare text and a caret with no box,
 * nothing is non-functional by the md's own reasoning, and borders match the
 * drawing. The border was also 1px wrong: `box-border` adds its width to the
 * 6px padding, so the title landed at **21** rather than the 20 that §3.2's
 * whole `14 + 6` story exists to protect.
 *
 * So the blue caret is the only affordance, which is exactly the state §2
 * describes. **Open decision 1 is the real fix and it is a system question** —
 * how should *any* menu button be drawn at rest? Whatever the answer, it applies
 * to every menu button in the product, not to this one.
 *
 * **Then open it.** Figma has a `Label` and a caret and *no way to express a
 * list*, so it draws no menu. `aria-expanded` on a trigger with nothing behind
 * it is a 4.1.2 failure rather than an omission, so the listbox is part of the
 * component — with Escape and outside-click, because a menu that cannot be
 * dismissed is a second defect.
 *
 * **Measure the title's left edge, then switch to Create and measure again.**
 * 20 on both. Figma gets there with `14 + 6` and `20 + 0`; the 14 is off the
 * spacing scale and is the family's one unbound padding (§3.6). Here the band
 * keeps 20 on all three types and the chip pulls itself back by −6.
 */
export const List: Story = {
  render: function ListStory() {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState('all');
    const views = [
      { id: 'all', label: 'All Plans' },
      { id: 'mine', label: 'My Plans' },
      { id: 'archived', label: 'Archived Plans' },
    ];
    return (
      <Page>
        <PageHeader
          type="list"
          title={views.find((v) => v.id === view)?.label ?? 'All Plans'}
          views={views}
          onViewChange={setView}
          viewMenuOpen={open}
          onViewMenuToggle={() => setOpen((o) => !o)}
          cta={{ label: 'New', icon: 'plus', onSelect: () => {} }}
        />
      </Page>
    );
  },
};

/**
 * **CREATE — three icon actions, no CTA.**
 *
 * **Hover an action and watch its border.** It gets *stronger*, which sounds
 * obvious and is the finding nobody in the source had. Figma's hover border is
 * `border/hover` `neutral/1000`, and against `surface/hover` that is **2.65
 * Light / 2.23 Dark** — under 3:1 in both panes, in the one state whose entire
 * visual expression *is* the border, because the fill moves only 1.08:1. The doc
 * frame graded the **resting** border carefully and never measured the state
 * that replaces it.
 *
 * The fix overshoots and has to: the neutral ramp jumps from **2.85:1** at
 * `neutral/1000` straight to **4.52:1** at `neutral/1100` with nothing near 3:1.
 * Both verified exactly against our own primitives. `border/control` gives 4.19
 * / 5.31 on hover and 3.78 / 4.89 on pressed — moved together so the two states
 * cannot invert.
 *
 * The doc frame's refusal to invent a local grey instead is the best sentence
 * about system hygiene in the file: *"a border colour invented for one component
 * is how a system ends up with three greys 1.1 ΔE apart — which is exactly what
 * this source did."*
 */
export const Create: Story = {
  render: () => (
    <Page>
      <PageHeader type="create" title="New Material Requirement Plan"
        actions={CREATE_ACTIONS} />
    </Page>
  ),
};

/**
 * **DETAIL — a back button, a parent link, a title.**
 *
 * **The eyebrow is an `<a>`, not an `<h2>`.** "Production Planning" is the parent
 * record and it is navigable; a level-2 heading *above* the level-1 inverts the
 * document outline.
 *
 * **The back button names its destination** — "Back to Production Planning", not
 * "Back". A screen reader user who hears "Back" three times in a session has
 * learned nothing.
 *
 * **Now shrink the viewport until the title has to give way.** The back button
 * stays 32 × 32. §9.2 measured it collapsing to **18 × 32** without `flex: none`
 * — under a long title in Figma's `SPACE_BETWEEN` row — with the glyph
 * overflowing, so nothing looked wrong while 2.5.8 quietly failed.
 */
export const Detail: Story = {
  render: () => (
    <Page>
      <PageHeader type="detail" title="Q2 Bicycle Production"
        parent={{ label: 'Production Planning', href: '#' }}
        onBack={() => {}}
        actions={DETAIL_ACTIONS} />
    </Page>
  ),
};

/**
 * **A LONG TITLE, which Figma has nothing stopping.**
 *
 * Every text node in the family is `textTruncation: DISABLED` with no
 * `maxWidth`, the leading region HUGs, the row is `SPACE_BETWEEN`, and
 * **`clipsContent` is `false`** — so a long title pushes the trailing cluster to
 * the padding and then **leaves the band entirely**. On a detail page the title
 * is a record name, which makes that the common case rather than the edge case.
 *
 * Here it truncates and the actions stay put.
 */
export const LongTitle: Story = {
  render: () => (
    <Page>
      <PageHeader type="detail"
        title="Q2 Bicycle Production — Frame Assembly, Wheelset Build and Final QA Line"
        parent={{ label: 'Production Planning and Scheduling', href: '#' }}
        onBack={() => {}}
        actions={DETAIL_ACTIONS}
        cta={{ label: 'New', icon: 'plus', onSelect: () => {} }} />
    </Page>
  ),
};

/**
 * **THE DISABLED CTA, and the 2px nobody would look for.**
 *
 * **Disable the primary action and measure it.** Same width as enabled.
 *
 * §3.4: Figma's disabled variant is the only one of the five with a stroke, the
 * stroke is `INSIDE`, and the frame HUGs — so it measures **77 × 32** where every
 * other state is 75. The glyph sits at x = 13 instead of 12 and the label at 35
 * instead of 34. A button that is 2px wider when disabled **shifts everything to
 * its left as it disables**, and in a `SPACE_BETWEEN` row that is the entire
 * trailing cluster.
 *
 * A 1px transparent border at rest costs nothing and neutralises it.
 *
 * The disabled pair reads **1.89 / 2.49** and that is fine — 1.4.3 and 1.4.11
 * both exempt "inactive user interface components". It is the one number in this
 * family that looks like a failure and is not.
 */
export const Disabled: Story = {
  render: () => (
    <Stack gap={0}>
      <Page>
        <PageHeader type="create" title="New Material Requirement Plan"
          actions={CREATE_ACTIONS.map((a, i) => (i === 1 ? { ...a, disabled: true } : a))}
          cta={{ label: 'New', icon: 'plus', disabled: true, onSelect: () => {} }} />
      </Page>
    </Stack>
  ),
};

/**
 * **FOCUS — the pattern the rest of the system should be brought up to.**
 *
 * **Tab through everything**: switcher, back, each action, CTA. Every one shows
 * a ring, every ring is 2px and inset so the control's box never resizes, and
 * the ring on the CTA is **white**, not blue — 5.48 against the fill where a
 * blue ring would give **1.27**.
 *
 * That is complete here, which no previous family in this series managed: the
 * sidebar's toggle and org switcher had none, the top bar's tile, org and avatar
 * had none, and the avatar had no states at all.
 *
 * **Then try it in forced-colors.** §9.2 draws these as inset box-shadows and
 * needs a whole `@media (forced-colors: active)` block to restore them, because
 * that mode discards `box-shadow`. Negative `outline-offset` is painted there,
 * so there is no fallback to keep in sync — the one place this build departs
 * from §9, and the same departure every other component here made.
 *
 * The eyebrow is the single exception: a text link has no box to inset into, so
 * its ring is 2px **outside** at `radius/xs`.
 */
export const FocusLadder: Story = {
  render: function FocusStory() {
    const [open, setOpen] = useState(false);
    return (
      <Page>
        <PageHeader type="list" title="All Plans"
          views={[{ id: 'all', label: 'All Plans' }, { id: 'mine', label: 'My Plans' }]}
          onViewChange={() => {}} viewMenuOpen={open}
          onViewMenuToggle={() => setOpen((o) => !o)}
          actions={DETAIL_ACTIONS}
          cta={{ label: 'New', icon: 'plus', onSelect: () => {} }} />
      </Page>
    );
  },
};

/**
 * **PANE AND HUE — and one of these fails.**
 *
 * **Switch the Brand control to Red and look at the CTA's edge in Dark.**
 * `brand/solid` against the band is **2.95:1** in Dark Blue and **3.46** in Dark
 * Red. The CTA *is* a user interface component and its fill against the band is
 * its only edge, so 1.4.11 reaches it — which means **the same component
 * conforms or does not depending on which brand mode ships**. Both recomputed
 * here and both exact. It is the same finding as the top bar's `+` button.
 *
 * The label is legible at 5.48 / 4.67 throughout, so nothing is unusable, which
 * is why the md grades it Medium rather than High and says so out loud.
 *
 * **Also look at the band's bottom rule in both panes** — 1.20 / 1.16 against
 * the band and 1.11 / 1.30 against the page. A divider between two regions of
 * one surface does not need 3:1 and no criterion reaches it. It is still the
 * **fourth component in a row** with this shape: the rail at 1.07, the side
 * panel at 1.21, the top bar at 1.02.
 */
export const PaneAndHue: Story = {
  render: () => (
    <Stack gap={0}>
      <div data-theme="light" data-brand="blue">
        <Page>
          <PageHeader type="create" title="Light · Blue" actions={DETAIL_ACTIONS}
            cta={{ label: 'New', icon: 'plus', onSelect: () => {} }} />
        </Page>
      </div>
      <div data-theme="light" data-brand="red">
        <Page>
          <PageHeader type="create" title="Light · Red" actions={DETAIL_ACTIONS}
            cta={{ label: 'New', icon: 'plus', onSelect: () => {} }} />
        </Page>
      </div>
      <div data-theme="dark" data-brand="blue">
        <Page>
          <PageHeader type="create" title="Dark · Blue — 2.95:1" actions={DETAIL_ACTIONS}
            cta={{ label: 'New', icon: 'plus', onSelect: () => {} }} />
        </Page>
      </div>
      <div data-theme="dark" data-brand="red">
        <Page>
          <PageHeader type="create" title="Dark · Red — 3.46:1" actions={DETAIL_ACTIONS}
            cta={{ label: 'New', icon: 'plus', onSelect: () => {} }} />
        </Page>
      </div>
    </Stack>
  ),
};

/**
 * **NOTHING AT ALL, and five of something.**
 *
 * With no actions and no CTA the trailing cluster renders **nothing**. Figma's
 * `Count=0, CTA=no` is a **1 × 32 frame** — an empty auto-layout container
 * collapses to Figma's 1px minimum rather than to nothing — so a designer who
 * picks that combination gets a hairline at the right edge.
 *
 * And five actions render, because `actions` is an array. Figma caps at three
 * because a variant axis has to enumerate every cell; the eight variants of
 * `zf-header-actions` exist only because a Figma boolean's default is set-wide,
 * which its own description says outright. That is the correct use of a variant
 * axis in Figma and the wrong shape for an API.
 */
export const ActionCounts: Story = {
  render: () => (
    <Stack gap={0}>
      <Page>
        <PageHeader type="create" title="No actions, no CTA" />
      </Page>
      <Page>
        <PageHeader type="create" title="Five actions"
          actions={[...CREATE_ACTIONS, ...DETAIL_ACTIONS.map((a) => ({ ...a, id: `x-${a.id}` }))]} />
      </Page>
    </Stack>
  ),
};
