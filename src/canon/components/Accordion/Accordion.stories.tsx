import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion, AccordionItem, AccordionNote } from './Accordion';
import { Stack, Surface, Text } from '../../primitives';

/**
 * INCOMING. The md calls this "the strongest component in the system and the
 * best doc frame in the file" — 220 paints, every one role-bound, every property
 * wired on all 16 variants, and chevron direction implemented as real glyph
 * swaps with zero rotation.
 *
 * Three things it misses. §9.6's checklist is the review script.
 */
const meta = {
  title: 'Components/Accordion', component: Accordion, parameters: { layout: 'padded' },
  args: { children: null },
} satisfies Meta<typeof Accordion>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * THE DEFAULT SHAPE, and the two fixes to look for.
 *
 * **Open and close a section.** Nothing below it may shift by 1px. §2.2: Figma
 * adds the header/body divider as a *bottom border on the header*, and only when
 * expanded — so the header is **42px collapsed and 43px expanded**, and opening
 * a section nudges everything under it by a pixel on top of the body's own
 * height change. The same rule drawn on the body's top edge is identical to look
 * at and costs no layout.
 *
 * **Tab to the first header.** §2.1: Figma's ring is at −2 with a `CENTER`
 * stroke, which spans −3…−1 — a **1px** gap, not the 2px its doc frame claims.
 * Items sit at gap 0, so an outward ring paints over its neighbours, and the
 * container's `clipsContent` shears it on the first and last rows. This ring is
 * drawn *inside* the header at −5px, which cannot overlap anything and clears
 * the container's rounded corners.
 */
export const Default: Story = {
  render: () => (
    <Accordion>
      <AccordionItem title="Section one">
        <AccordionNote>No records found</AccordionNote>
      </AccordionItem>
      <AccordionItem title="Section two" defaultOpen count={12} countLabel="records">
        <AccordionNote>No records found</AccordionNote>
      </AccordionItem>
      <AccordionItem title="Section three">
        <AccordionNote>No records found</AccordionNote>
      </AccordionItem>
    </Accordion>
  ),
};

/**
 * **THE §2 FIX — the count badge.**
 *
 * Figma fills it `primary/default` with `primary/on-primary` text at 11px, which
 * is **4.32:1** and fails 1.4.3. It is the same `primary/default` +
 * `primary/on-primary` failure recorded on the Primary button since
 * `ZF-BUTTON.md`, landing here on a badge that is hidden by default — §2: *"so
 * nobody has ever looked at it."*
 *
 * The doc frame's §08 records "Text contrast 1.4.3 — PASSES" and cites the title
 * (15.15) and the note (6.79). The badge is the component's third text node and
 * is not in the row.
 *
 * `primary/selected` gives **5.48 / 8.62**. Worth knowing: **the md contradicts
 * itself here.** §2 reasons for `primary/selected` — *"the role the pill and the
 * wizard already standardised on"* — while §9.2's CSS, §9.4's table and defect 2
 * all say `primary/active` (6.94). I took §2, because its reasoning is checkable
 * and true: Pill and Wizard both use `primary/selected`, and consistency beats
 * 1.46 of extra headroom on a value already clearing 4.5.
 *
 * The change is nearly invisible — one step of blue. That is the point.
 */
export const CountAndAction: Story = {
  render: () => (
    <Stack gap={8}>
      <Accordion>
        <AccordionItem title="Invoices" count={12} countLabel="records" defaultOpen
          action={{ label: 'Add record', icon: 'plus', onClick: () => {} }}>
          <AccordionNote>No records found</AccordionNote>
        </AccordionItem>
        <AccordionItem title="Credit notes" count={3} countLabel="records"
          action={{ label: 'Add record', icon: 'plus', onClick: () => {} }}>
          <AccordionNote>No records found</AccordionNote>
        </AccordionItem>
      </Accordion>
      <Surface pad={6} radius="lg" border="divider">
        <Text size="body-sm" tone="secondary">
          **Click "Add record".** It must fire and the section must NOT toggle. §8: the doc
          frame says the action needs `stopPropagation`, and that is wrong twice over —
          stopPropagation does not help, because toggling is `&lt;summary&gt;`'s default action
          rather than a listener; and a real `&lt;button&gt;` needs no guard at all, because it
          becomes the activation target itself. Swap it for a `&lt;span&gt;` and it does toggle.
          Its target is also 24px tall, against Figma's 20, which fails 2.5.8 with no
          exception available.
        </Text>
      </Surface>
    </Stack>
  ),
};

/**
 * THE CHEVRON CONVENTION — §5, and the best design decision in the component.
 *
 * Four legacy Figma sets disagreed about direction: two used right→down, two
 * down→up. It looked like carelessness. It was not — the direction is tied to
 * which side the chevron sits on:
 *
 * - **leading** — right when closed, down when open. A disclosure triangle: the
 *   row opens downward from the marker.
 * - **trailing** — down when closed, up when open. An expander: the arrow points
 *   at where the content will go.
 *
 * Both are correct *for their side*, so tying direction to position turns two
 * contradictions into one rule. Open each column and check all four positions.
 */
export const ChevronConvention: Story = {
  render: () => (
    <Stack gap={10}>
      {(['trailing', 'leading'] as const).map((c) => (
        <Stack key={c} gap={3}>
          <Text size="overline" tone="tertiary">{c}</Text>
          <Accordion>
            <AccordionItem title="Closed" chevron={c}>
              <AccordionNote>No records found</AccordionNote>
            </AccordionItem>
            <AccordionItem title="Open" chevron={c} defaultOpen>
              <AccordionNote>No records found</AccordionNote>
            </AccordionItem>
          </Accordion>
        </Stack>
      ))}
    </Stack>
  ),
};

/**
 * DISABLED — and the thing Figma gets wrong.
 *
 * §4.1 / defect 3: `action-label` is `primary/text` in **all 16 variants** and
 * the count badge is `primary/default` in all 16. So a disabled item keeps a
 * live blue link and a live blue badge on a dead section. The action even
 * *passes* contrast on the disabled header (5.26:1) — which is precisely the
 * problem.
 *
 * Both dim here, and the badge becomes a surface with a border rather than a
 * text role pressed into service as a fill.
 *
 * **Press Enter and Space on the disabled header.** Neither may toggle, and the
 * body must not flash open for a frame. §9.3: the guard is on the summary's
 * *click*, not the details' `onToggle` — `toggle` fires *after* the state
 * change, so resetting `open` there opens the body for one frame and fires two
 * events. Both keys dispatch a click on `<summary>`, so one guard covers them.
 */
export const Disabled: Story = {
  render: () => (
    <Accordion>
      <AccordionItem title="Available" count={4} countLabel="records"
        action={{ label: 'Add record', icon: 'plus', onClick: () => {} }}>
        <AccordionNote>No records found</AccordionNote>
      </AccordionItem>
      <AccordionItem title="Unavailable" disabled count={0} countLabel="records"
        action={{ label: 'Add record', icon: 'plus', onClick: () => {} }}>
        <AccordionNote>No records found</AccordionNote>
      </AccordionItem>
    </Accordion>
  ),
};

/**
 * ONE AT A TIME — `<details name="...">`, with no script and no state.
 *
 * Opening one section closes the others, enforced by the browser. §8: available
 * in current Chrome, Safari and Firefox; where you need older support the
 * fallback is a `toggle` listener that closes the siblings.
 *
 * §7's warning applies before you reach for this: *"An accordion that closes the
 * previous section on every open is tabs with more vertical motion."* The
 * exception is a long form on mobile.
 */
export const OneAtATime: Story = {
  render: () => (
    <Accordion group="filters">
      <AccordionItem title="Date range" defaultOpen>
        <AccordionNote>No records found</AccordionNote>
      </AccordionItem>
      <AccordionItem title="Status"><AccordionNote>No records found</AccordionNote></AccordionItem>
      <AccordionItem title="Assignee"><AccordionNote>No records found</AccordionNote></AccordionItem>
    </Accordion>
  ),
};

/**
 * THE BODY IS THE CONSUMER'S BUSINESS. §1 quotes the doc frame: *"the disclosure
 * is the component, and what it discloses is the consumer's business."* Four
 * separate Figma sets collapsed into one because of that `INSTANCE_SWAP` — which
 * in React is the most ordinary thing there is.
 */
export const ArbitraryBody: Story = {
  render: () => (
    <Accordion>
      <AccordionItem title="With a note"><AccordionNote>No records found</AccordionNote></AccordionItem>
      <AccordionItem title="With arbitrary content" defaultOpen count={2}>
        <Stack gap={4} className="p-8">
          <Text size="body">Any children at all — a table, a form, a message.</Text>
          <Text size="body-sm" tone="secondary">
            The container supplies the border and the dividers; the item supplies the
            disclosure; the body is yours.
          </Text>
        </Stack>
      </AccordionItem>
    </Accordion>
  ),
};
