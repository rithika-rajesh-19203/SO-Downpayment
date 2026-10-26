import { useMemo, useRef, useState } from 'react';
import {
  ActionBar, Avatar, DescriptionList, DetailsToolbar, Icon, Inline, Menu, MiniList,
  PageHeader, Segmented, SplitView, StatusBadge, Stack, Surface, Tabs, Text,
} from '@canon';
import type { DetailsToolbarGroup, MenuEntry } from '@canon';
import type { MiniListItem, StatusBadgeStatus } from '@canon';
import { INVOICES } from '../data/invoices';
import type { Invoice } from '../data/invoices';

/**
 * SALES → INVOICES → one invoice. The split view.
 *
 * `MiniList` on the left, the record on the right, and `SplitView` holding the
 * two so neither scrolls the other — which is the whole reason the pattern
 * exists: `zf-mini-list.md` §5 is that *"selecting a row does not re-render,
 * scroll, or lose its position."*
 *
 * The right column is the same `PageChrome` the list view uses, so §12's three
 * rules hold here too — one fixed cell, the header hidden rather than
 * unmounted, focus never crossing the swap. What changes is which header sits in
 * it: `type="detail"`, so the record gets a back control and a parent link
 * rather than a view switcher.
 *
 * **The bulk selection lives on the LEFT and its action bar appears on the
 * RIGHT.** That is `zf-mini-list.md` §5's own row — *"the action bar replaces
 * the page header, and here the page header is on the right"* — and it is the
 * reason the two selections have to stay separate: reading one invoice while
 * three others are ticked is a normal thing to be doing.
 */

/**
 * ONE map, used by the badge in the card and the badge in the mini list — and
 * the same one `Invoices.tsx` gives the table. A status that is orange in the
 * list and red in the detail is two facts about one record.
 *
 * `Overdue` is the **orange** `overdue` badge — `#FAEEE3` on `#964600`, 5.80:1
 * — not a red one. Red is `cancelled` and `failed`: things that ended badly. An
 * invoice overdue by 30 days is still collectable, and the colour should say
 * "attend to this", not "this is over".
 */
const STATUS_TONE: Record<Invoice['status'], StatusBadgeStatus> = {
  Draft: 'draft',
  Sent: 'pending',
  'Partially Paid': 'in-progress',
  Paid: 'success',
  Overdue: 'overdue',
  Void: 'void',
};


const money = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});
const day = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
});

/**
 * §3's grouping, resolved by the reference: **Edit · Send · Share · PDF/Print**
 * stay on the bar and everything else is behind the `⋯`.
 *
 * One group, not three. The md splits them into record / workflow / money and
 * separates the clusters — but the reference puts a rule between *every* pair,
 * which leaves the clusters with nothing to draw them, so claiming three of them
 * in the markup would be describing a grouping nobody can perceive. The
 * `role="group"` label still names what these four are.
 *
 * The line is what the record's chrome is FOR: acting on this document. Anything
 * that changes what the record *is* — recording a payment, voiding it — is a
 * decision, not a chrome action, and it belongs behind the `⋯` where it costs a
 * deliberate click.
 */
const TOOLBAR: DetailsToolbarGroup[] = [
  {
    id: 'document', label: 'Document actions',
    items: [
      //  Edit is always first and never carries a caret — §3.
      { id: 'edit', label: 'Edit', icon: 'edit', onSelect: () => {} },
      { id: 'send', label: 'Send', icon: 'mail', menu: true, onSelect: () => {} },
      { id: 'share', label: 'Share', icon: 'share', onSelect: () => {} },
      { id: 'pdf', label: 'PDF/Print', icon: 'pdf', menu: true, onSelect: () => {} },
    ],
  },
];

/**
 * Everything the bar does not show — the reference's list, in its order and with
 * its three separators.
 *
 * **Every glyph is the drawn one.** All six started as nearest-fits marked in
 * prose — `documents`, `export`, `print`, `x-circle`, `pin`, `settings` — and
 * each became one line as its export arrived. No stand-ins left in this menu.
 */
const MORE: MenuEntry[] = [
  { id: 'credit-note', label: 'Create Credit Note', icon: 'create-credit-note', onSelect: () => {} },
  { id: 'clone', label: 'Clone', icon: 'clone', onSelect: () => {} },
  { id: 'barcode', label: 'Print Item Barcode', icon: 'autoscan', onSelect: () => {} },
  { separator: true },
  //  `danger`, and in a `strong` menu that now means a SOLID RED row on hover —
  //  `danger/hover` with `danger/on-danger`, 7.04 Light / 8.26 Dark. The one row
  //  here that destroys something should not answer the pointer in the same
  //  colour as "Clone".
  { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger', onSelect: () => {} },
  { separator: true },
  { id: 'lock', label: 'Lock Invoice', icon: 'lock', onSelect: () => {} },
  { separator: true },
  { id: 'prefs', label: 'Invoice Preferences', icon: 'preference', onSelect: () => {} },
];

export interface InvoiceDetailsProps {
  invoiceId: string;
  onSelect: (id: string) => void;
  /** Back to the list view. */
  onBack: () => void;
}

export function InvoiceDetails({ invoiceId, onSelect, onBack }: InvoiceDetailsProps) {
  const [bulk, setBulk] = useState<ReadonlySet<string>>(new Set());
  const moreRef = useRef<HTMLButtonElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  //  WHICH tab, and WHICH rendering of it. Two axes: the segmented switches the
  //  view inside whichever tab is open, so they cannot be one piece of state.
  const [tab, setTab] = useState('details');
  const [view, setView] = useState('details');

  const items: MiniListItem[] = useMemo(() => INVOICES.map((i) => ({
    id: i.id,
    name: i.customer,
    amount: money.format(i.amount),
    //  Three at most. §3: past that it wraps and the row stops being 93.
    meta: [i.number, day.format(new Date(i.date))],
    status: i.statusLabel,
    statusVariant: STATUS_TONE[i.status],
  })), []);

  const invoice = INVOICES.find((i) => i.id === invoiceId) ?? INVOICES[0];
  const selecting = bulk.size > 0;

  return (
    <SplitView
      list={(
        <MiniList
          label="Invoices"
          items={items}
          activeId={invoice.id}
          onActivate={onSelect}
          //  The bulk set, which is NOT the route. Ticking a box leaves the
          //  record on the right exactly where it was.
          selection={{ selected: bulk, onChange: setBulk }}
          //  THE BAR GOES HERE, on the same side as the checkboxes that filled
          //  it. `compact`, because 353px has room for the count and nothing
          //  else — every action lives in the one Actions menu.
          bar={selecting ? (
          <ActionBar
            density="compact"
            count={bulk.size}
            total={items.length}
            primary={{ id: 'reminder', label: 'Send Reminder', onSelect: () => {} }}
            iconActions={[
              { id: 'mail', label: 'Email selected', icon: 'mail', onSelect: () => {} },
              { id: 'print', label: 'Print selected', icon: 'print', onSelect: () => {} },
              { id: 'pdf', label: 'Export as PDF', icon: 'pdf', onSelect: () => {} },
            ]}
            actions={[
              { id: 'payment', label: 'Record Payment', onSelect: () => {} },
              { id: 'sent', label: 'Mark as Sent', onSelect: () => {} },
              { id: 'void', label: 'Void', onSelect: () => {} },
            ]}
            //  The head checkbox. `next` is the state it should move TO, so the
            //  screen owns what "all" means — here, every row in the list.
            onToggleAll={(next) => setBulk(next ? new Set(items.map((i) => i.id)) : new Set())}
            onClear={() => setBulk(new Set())}
          />
          ) : undefined}
          views={[
            { id: 'all', label: 'All Invoices' },
            { id: 'unpaid', label: 'Unpaid Invoices' },
            { id: 'overdue', label: 'Overdue Invoices' },
          ]}
          viewId="all"
          onViewChange={() => {}}
          onCreate={() => {}}
          moreEntries={[
            {
              id: 'sort', label: 'Sort by', icon: 'sort',
              children: [
                { id: 'date', label: 'Date', checked: true, onSelect: () => {} },
                { id: 'amount', label: 'Amount', checked: false, onSelect: () => {} },
                { id: 'due', label: 'Due Date', checked: false, onSelect: () => {} },
              ],
            },
            { separator: true },
            { id: 'export', label: 'Export Invoices', icon: 'export', onSelect: () => {} },
            { id: 'refresh', label: 'Refresh List', icon: 'refresh', onSelect: () => {} },
          ]}
        />
      )}
    >
      {/* §7 — the eyebrow is a LINK to the parent record, never an <h2>: a
          level-2 heading above the level-1 inverts the document outline. And
          the back control names its destination, because a screen-reader user
          who hears "Back" three times in a session has learned nothing. */}
      <PageHeader
        type="detail"
        title={invoice.number}
        parent={{ label: 'Invoices', href: '#' }}
        onBack={onBack}
      />

      {/* Directly under the header, and the header keeps NO actions of its own:
          every one of them is a toolbar item now. Drawing "Edit" in both places
          is the duplication the toolbar exists to collect. §2 — one hairline
          between the two, because the toolbar has no top border.

          It STAYS UP during a bulk selection, and that reverses an earlier call.
          While the bar lived in this column the two stacked 40px apart and
          "Record Payment" appeared twice with no way to tell which object it
          meant. With the bar over in the mini list's own toolbar, the columns do
          that work: the left one visibly owns the ticked records, the right one
          visibly owns the record being read. Blanking the right side while the
          user reads it would make the split view worse, not safer. */}
      <DetailsToolbar
        groups={TOOLBAR}
        overflow={{ ref: moreRef, expanded: moreOpen, onSelect: () => setMoreOpen((o) => !o) }}
      />
      {/* `align="start"`: the ⋯ is packed after PDF/Print rather than sprung to
          the far end, so the default right-edge alignment would throw the panel
          back across the whole bar. */}
      <Menu
        anchor={moreRef.current}
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        label="More actions for this invoice"
        align="start"
        //  `strong` — accented glyphs and a solid blue row under the pointer.
        //  These rows ARE the ⋯'s whole content; there is nothing visible behind
        //  the panel that they are a footnote to.
        emphasis="strong"
        entries={MORE}
      />

      {/* The record's own scroller. `SplitView` gives this column
          `min-h-0`, so it can be shorter than its content and this can hold the
          scrollbar — the list on the left keeps its own. */}
      <Surface tone="canvas" pad={0} radius="none" className="flex-1 min-h-0 overflow-y-auto">
        <Stack gap={8} className="p-10">
          {/* SECTION 1 — the summary. `radius="card"` is `chrome/card`, 10:
              a named role rather than a step, because 10 is a retired value on
              the radius ramp and the guard rejects it inside `--zf-radius-*`. */}
          <Surface pad={10} radius="card" border="default">
            <Inline gap={8} align="center" wrap>
              <Avatar name={invoice.customer} size="md" />
              <Stack gap={2} className="min-w-0 flex-1">
                <Text size="heading" truncate>{invoice.customer}</Text>
                <Text size="body-sm" tone="secondary">{invoice.location}</Text>
              </Stack>
              <Stack gap={2} align="end" className="flex-none">
                <Text size="title" weight="semibold" className="tabular-nums">
                  {money.format(invoice.balance)}
                </Text>
                <Text size="body-sm" tone="secondary">Balance due</Text>
              </Stack>
              <StatusBadge status={STATUS_TONE[invoice.status]}>
                {invoice.statusLabel}
              </StatusBadge>
            </Inline>
          </Surface>

          {/* SECTION 2 — tabbed. `pad={0}` because the tab strip's rule has to
              reach both edges of the card: a strip inset by the card's own
              padding leaves the rule floating with a gap at each end, which
              reads as an underline on the tabs rather than as the boundary
              between chrome and content.

              `overflow-hidden` so the strip's square top corners are clipped by
              the card's 10 — without it the rule runs straight through them. */}
          <Surface pad={0} radius="card" border="default" className="overflow-hidden">
            <Tabs
              items={[
                { id: 'details', label: 'Invoice Details' },
                { id: 'activity', label: 'Activity', badge: '12' },
                { id: 'journals', label: 'Journals' },
              ]}
              value={tab}
              onChange={setTab}
              label="Invoice views"
              //  ON THE STRIP'S BASELINE, and deliberately not a fourth tab:
              //  "PDF" is not another thing to read about the invoice, it is
              //  another rendering of the thing you are already reading. A tab
              //  would say the two are siblings and the arrow keys would agree.
              trailing={(
                <Segmented
                  label="View"
                  //  24 overall, so it rides the tab labels' baseline rather
                  //  than standing 32 tall beside 20px of text.
                  size="sm"
                  value={view}
                  onChange={setView}
                  options={[
                    { value: 'details', label: 'Details' },
                    { value: 'pdf', label: 'PDF' },
                  ]}
                />
              )}
            >
              {view === 'pdf' ? (
                //  The PDF is of the RECORD, so it is the same document whichever
                //  tab is open — which is exactly why the switch is not a tab.
                <Stack gap={6} align="center" justify="center" className="p-15 min-h-mini-list">
                  <Icon name="pdf" size="xl" tone="muted" />
                  <Text tone="secondary">{invoice.number}.pdf</Text>
                  <Text size="body-sm" tone="tertiary">The rendered document preview.</Text>
                </Stack>
              ) : tab === 'details' ? (
                <Stack gap={8} className="p-15">
                  <DescriptionList items={[
                    { label: 'Invoice#', value: invoice.number },
                    { label: 'Order#', value: invoice.order },
                    { label: 'Invoice date', value: day.format(new Date(invoice.date)) },
                    {
                      label: 'Due date',
                      //  The one field whose VALUE carries a state. `danger`
                      //  rather than a badge: a date is still a date, and two
                      //  badges in one card make neither read as the status.
                      value: (
                        <Text as="span" tone={invoice.status === 'Overdue' ? 'danger' : 'default'}>
                          {day.format(new Date(invoice.dueDate))}
                        </Text>
                      ),
                    },
                    {
                      label: 'Amount',
                      value: (
                        <Text as="span" weight="medium" className="tabular-nums">
                          {money.format(invoice.amount)}
                        </Text>
                      ),
                    },
                    {
                      label: 'Balance due',
                      value: (
                        <Text as="span" weight="medium" className="tabular-nums"
                          tone={invoice.balance > 0 ? 'default' : 'tertiary'}>
                          {money.format(invoice.balance)}
                        </Text>
                      ),
                    },
                    { label: 'Location', value: invoice.location },
                  ]} />
                </Stack>
              ) : tab === 'activity' ? (
                <Stack gap={6} className="p-15">
                  {[
                    ['Invoice created', '01 Jul 2024'],
                    ['Sent to ' + invoice.customer, '02 Jul 2024'],
                    ['Reminder sent', '16 Jul 2024'],
                  ].map(([what, when]) => (
                    <Inline key={what} gap={5} align="center">
                      <Text as="span" className="flex-1 min-w-0">{what}</Text>
                      <Text as="span" size="body-sm" tone="secondary" className="flex-none">{when}</Text>
                    </Inline>
                  ))}
                </Stack>
              ) : (
                <Stack gap={6} className="p-15">
                  <DescriptionList items={[
                    { label: 'Accounts Receivable', value: money.format(invoice.amount) },
                    { label: 'Sales', value: money.format(invoice.amount) },
                  ]} />
                </Stack>
              )}
            </Tabs>
          </Surface>
        </Stack>
      </Surface>
    </SplitView>
  );
}
