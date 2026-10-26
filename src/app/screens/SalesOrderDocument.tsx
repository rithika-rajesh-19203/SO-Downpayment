import { Fragment } from 'react';
import {
  DescriptionList, Divider, Inline, Stack, StatusBadge, Surface, Table, Text,
} from '@canon';
import type { StatusBadgeStatus, TableColumn } from '@canon';
import { CUSTOMER_INFO, ORGANISATION, lineAmount, received } from '../data/sales-orders';
import type { OrderLine, SalesOrder } from '../data/sales-orders';

/**
 * THE SALES ORDER AS A DOCUMENT — formatting, totals and the PDF rendering.
 *
 * Shared by the two places an order is read: Books' details page and the
 * customer portal. One file, so the PDF a business sees and the PDF its customer
 * sees cannot drift apart.
 */

export const STATUS_TONE: Record<SalesOrder['status'], StatusBadgeStatus> = {
  Draft: 'draft',
  'Awaiting Advance': 'pending',
  Confirmed: 'approved',
  Invoiced: 'success',
};

export const money = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
});
export const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
export const date = (iso: string) => day.format(new Date(iso));
export const round = (n: number) => Math.round(n * 100) / 100;

/** How the advance was asked for, in words: "25% (₹2,496.00)". */
export function termsLabel(o: SalesOrder) {
  if (!o.advance) return 'Not requested';
  return o.advance.type === 'percent'
    ? `${o.advance.value}% (${money.format(o.advance.amount)})`
    : money.format(o.advance.amount);
}

export type Line = OrderLine & { id: string; n: number };

export const LINE_COLUMNS: TableColumn<Line>[] = [
  { id: 'n', header: '#', cell: (r) => r.n },
  { id: 'item', header: 'Item & Description', cell: (r) => r.item },
  { id: 'qty', header: 'Qty', align: 'end', cell: (r) => r.qty },
  { id: 'rate', header: 'Rate', align: 'end', cell: (r) => money.format(r.rate) },
  { id: 'discount', header: 'Discount', align: 'end', cell: (r) => discountLabel(r) },
  { id: 'amount', header: 'Amount', align: 'end', cell: (r) => money.format(lineAmount(r)) },
];

/** "10%" or "₹50.00", or a dash for a line with none. */
export function discountLabel(l: OrderLine) {
  if (!l.discount) return '—';
  return l.discountType === 'amount' ? money.format(l.discount) : `${l.discount}%`;
}

export const lines = (o: SalesOrder): Line[] => o.lines.map((l, i) => ({ ...l, id: String(i), n: i + 1 }));
export const customerOf = (o: SalesOrder) => CUSTOMER_INFO[o.customer] ?? { billing: [], shipping: [], placeOfSupply: '—' };

/** An address as stacked lines, or a dash when there is none. */
export function Address({ value }: { value: string[] }) {
  if (!value.length) return <Text as="span">—</Text>;
  return (
    <Stack gap={1}>
      {value.map((l) => <Text key={l} as="span">{l}</Text>)}
    </Stack>
  );
}

/**
 * Sub total down to what is left to pay. The advance rows appear only on an
 * order that asked for one — they are the reason this order's PDF differs from
 * any other.
 */
export function OrderTotals({ order, strong }: { order: SalesOrder; strong?: boolean }) {
  //  Sub Total is AFTER line discounts — each line's amount already has its
  //  discount taken off, so the total and the advance are on what is charged.
  const sub = order.lines.reduce((s, l) => s + lineAmount(l), 0);
  const got = received(order);
  const rows: [string, string, boolean?][] = [
    ['Sub Total', money.format(sub)],
    ...(order.shipping ? [['Shipping Charges', money.format(order.shipping)] as [string, string]] : []),
    ['Total', money.format(order.total), true],
    ...(order.advance ? [
      [`Advance Required${order.advance.type === 'percent' ? ` (${order.advance.value}% from total)` : ''}`, money.format(order.advance.amount)] as [string, string],
      ['Advance Received', `(−) ${money.format(got)}`] as [string, string],
      ['Balance Due', money.format(Math.max(0, order.total - got)), true] as [string, string, boolean],
    ] : []),
  ];
  return (
    <Stack gap={4} className="ms-auto w-1/3 min-w-pt-totals-min">
      {rows.map(([label, value, bold], i) => (
        <Fragment key={label}>
          <Inline gap={8} justify="between">
            <Text tone={bold || strong ? 'default' : 'secondary'} weight={bold ? 'semibold' : 'regular'}>{label}</Text>
            <Text weight={bold ? 'semibold' : 'regular'} className="tabular-nums">{value}</Text>
          </Inline>
          {/* A rule under Total when the advance rows follow it: above it is
              what the order costs, below it is what has been paid against it. */}
          {label === 'Total' && i < rows.length - 1 ? <Divider /> : null}
        </Fragment>
      ))}
    </Stack>
  );
}

/**
 * THE PDF — the document as the customer receives it, on a page set against
 * the canvas. Composed from canon parts, so two things differ from the
 * reference and are worth knowing:
 *
 * - The status sits as a SOLID badge at the page's top-left rather than a
 *   diagonal corner ribbon. A ribbon needs a rotated element, which no canon
 *   component draws yet — a gap, not a choice.
 * - The type is the system's sans, not the serif a print template uses. The
 *   template's typeface is a property of the PDF engine, not of this screen.
 */

/**
 * THE PDF — the document as the customer receives it, on a page set against
 * the canvas. Composed from canon parts, so two things differ from the
 * reference and are worth knowing:
 *
 * - The status sits as a SOLID badge at the page's top-left rather than a
 *   diagonal corner ribbon. A ribbon needs a rotated element, which no canon
 *   component draws yet — a gap, not a choice.
 * - The type is the system's sans, not the serif a print template uses. The
 *   template's typeface is a property of the PDF engine, not of this screen.
 */
export function OrderPdf({ order }: { order: SalesOrder }) {
  const customer = customerOf(order);
  return (
    <Surface tone="canvas" pad={12} radius="none">
      <Surface pad={12} radius="none" border="strong" elevation="raised">
        <Stack gap={10}>
          <Inline>
            <StatusBadge status={STATUS_TONE[order.status]} emphasis="solid">{order.status}</StatusBadge>
          </Inline>

          {/* Letterhead and title. */}
          <Inline gap={10} align="start" justify="between" wrap>
            <Stack gap={2}>
              <Text size="heading">{ORGANISATION.name}</Text>
              {ORGANISATION.address.map((l) => <Text key={l}>{l}</Text>)}
              <Text>GSTIN {ORGANISATION.gstin}</Text>
            </Stack>
            <Stack gap={2} align="end">
              <Text as="h2" size="display">SALES ORDER</Text>
              <Text weight="semibold">Sales Order# {order.number}</Text>
            </Stack>
          </Inline>

          <Divider />

          <Inline gap={16} align="start" wrap>
            <DescriptionList className="flex-1 min-w-0" gap={4} items={[
              { label: 'Order Date', value: date(order.date) },
              { label: 'Expected Shipment', value: order.shipmentDate ? date(order.shipmentDate) : '—' },
              { label: 'Terms', value: order.paymentTerms },
            ]} />
            <DescriptionList className="flex-1 min-w-0" gap={4} items={[
              { label: 'Place Of Supply', value: customer.placeOfSupply },
              { label: 'Reference#', value: order.reference || '—' },
            ]} />
          </Inline>

          {/* Bill To / Ship To — a sunken band for the heading, as the
              template draws it. */}
          <Inline gap={10} align="start">
            {([['Bill To', customer.billing], ['Ship To', customer.shipping]] as const).map(([head, addr], i) => (
              <Stack key={head} gap={4} className="flex-1 min-w-0">
                <Surface tone="sunken" pad={4} radius="none" border="divider">
                  <Text weight="semibold">{head}</Text>
                </Surface>
                <Stack gap={1}>
                  {i === 0 ? <Text weight="semibold" tone="link">{order.customer}</Text> : null}
                  <Address value={addr} />
                  {i === 0 && customer.gstin ? <Text>GSTIN {customer.gstin}</Text> : null}
                </Stack>
              </Stack>
            ))}
          </Inline>

          <Table<Line>
            caption={`Items on ${order.number}`}
            placement="card"
            columns={LINE_COLUMNS}
            rows={lines(order)}
            rowKey={(r) => r.id}
          />

          <OrderTotals order={order} strong />

          {order.advance ? (
            <Surface tone="sunken" pad={6} radius="md" border="divider">
              <Text size="body-sm">
                An advance of {money.format(order.advance.amount)}
                {order.advance.type === 'percent' ? ` (${order.advance.value}% of the order total)` : ''} is
                required before this order is confirmed. It will be adjusted against the final invoice.
              </Text>
            </Surface>
          ) : null}

          {/* `Divider` fills its container, so the container is what is a third
              wide — the signature line, not a rule across the page. */}
          <Stack gap={2} align="center" className="pt-15 ms-auto w-1/3">
            <Divider />
            <Text size="body-sm" tone="secondary">Authorized Signature</Text>
          </Stack>
        </Stack>
      </Surface>
    </Surface>
  );
}
