import { useEffect, useState } from 'react';
import {
  AppShell, Nav, TopBar, PageHeader, Stack, Surface, Text,
} from '@canon';
import {
  BOOKS_MARK, HISTORY_MARK, NAV_ITEMS, NAV_SECTIONS, BAR_ACTIONS, LABELS, setOnCreate,
} from '../data/books';
import { Invoices } from './Invoices';
import { InvoiceDetails } from './InvoiceDetails';
import { NewInvoice } from './NewInvoice';
import { NewPurchaseAgreement } from './NewPurchaseAgreement';
import { NewSalesAgreement } from './NewSalesAgreement';
import { PurchaseOrders } from './PurchaseOrders';
import { NewSalesOrder } from './NewSalesOrder';
import { SalesOrderDetails } from './SalesOrderDetails';
import { CustomerPortal } from './CustomerPortal';
import { PrototypeBar } from './PrototypeBar';
import { SALES_ORDERS } from '../data/sales-orders';
import type { SalesOrder } from '../data/sales-orders';

/**
 * BOOKS — the application.
 *
 * Composition only. There is not one class name, one colour and one pixel in
 * this file: every visual decision lives in the canon, and what is here is
 * which components go where and what state moves between them. That is the
 * whole point of the boundary — rule 4 fails the build the moment a screen
 * grows a styled bare element, which is how a second, unmanaged design system
 * starts.
 *
 * The three regions are `AppShell`'s, not this screen's. It also supplies the
 * `<main>`, which is what keeps `PageHeader` from announcing as a second
 * `banner` alongside the top bar.
 */

const VIEWS = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'Assigned to me' },
  { id: 'recent', label: 'Recently viewed' },
];

export function Books() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentId, setCurrentId] = useState('sales-orders');
  const [query, setQuery] = useState('');
  const [viewId, setViewId] = useState('all');
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  //  Which invoice is open, or null for the list. A sub-route of `invoices`,
  //  which is why it is its own piece of state rather than a third `currentId`
  //  value — navigating away and back should land on the list, not on whichever
  //  record was last read.
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  //  The creation page is a MODE of a section, not a section of its own: it is
  //  reached from the list's New and from the nav leaf's `+`, and Cancel has to
  //  return you to whichever list you came from.
  const [creating, setCreating] = useState(true);
  //  Sales orders are STATE here, not a module const: the creation page adds
  //  one and the details page records advances against it, and both have to
  //  see the same list.
  const [orders, setOrders] = useState<SalesOrder[]>(SALES_ORDERS);
  const [orderId, setOrderId] = useState<string>(SALES_ORDERS[0].id);
  //  The order the customer portal was opened on, or null when in Books. The
  //  portal replaces the whole shell — it is another product, not a page of
  //  this one.
  const [portalId, setPortalId] = useState<string | null>(null);

  //  The nav's `+` is registered once — see data/books.tsx for why it is a
  //  dispatcher rather than a prop. In an EFFECT, not in render: registering a
  //  handler is a side effect, and under StrictMode's double render it would
  //  otherwise run twice before React had committed anything.
  useEffect(() => {
    setOnCreate((kind) => {
      const section = kind === 'invoice' ? 'invoices'
        : kind === 'purchase agreement' ? 'purchase-agreements'
          : kind === 'sales agreement' ? 'sales-agreements'
            : kind === 'sales order' ? 'sales-orders'
              : null;
      if (!section) return;
      setCurrentId(section);
      setInvoiceId(null);
      setCreating(true);
    });
  }, []);

  const page = LABELS[currentId] ?? 'Home';
  const view = VIEWS.find((v) => v.id === viewId)?.label ?? 'All';

  //  Two routes and a sub-route, resolved by a ternary chain. THIS IS THE
  //  MOMENT a router earns its place — the chain now encodes ordering (the
  //  detail case has to be tested before the list case) rather than just
  //  mapping an id to a screen, and that is the first thing a hand-rolled route
  //  table gets wrong. Left as-is deliberately, and flagged.
  const done = () => setCreating(false);

  //  `purchase-agreements` has ONLY a creation page — there is no list view for
  //  it yet, so the nav leaf lands straight on the form. Stated rather than
  //  disguised: the list is the missing half, not a decision.
  const changeOrder = (o: SalesOrder) => setOrders((all) => all.map((x) => (x.id === o.id ? o : x)));
  const nextNumber = `SO-${String(74 + orders.length - SALES_ORDERS.length).padStart(5, '0')}`;

  const screen = currentId === 'sales-orders' && creating ? (
    <NewSalesOrder
      nextNumber={nextNumber}
      onCancel={done}
      onSave={(o) => { setOrders((all) => [o, ...all]); setOrderId(o.id); done(); }}
    />
  )
    : currentId === 'sales-orders' ? (
      <SalesOrderDetails
        orders={orders}
        orderId={orderId}
        onSelect={setOrderId}
        onChange={changeOrder}
        onCreate={() => setCreating(true)}
        onBack={() => {}}
        onOpenPortal={setPortalId}
      />
    )
    : currentId === 'purchase-agreements' ? (
    <NewPurchaseAgreement onCancel={done} onSave={done} />
  )
    //  Like `purchase-agreements`, this section has ONLY a creation page — there
    //  is no list view for it yet, so the nav leaf lands on the form. Stated
    //  rather than disguised: the list is the missing half, not a decision.
    : currentId === 'sales-agreements' ? (
      <NewSalesAgreement onCancel={done} onSend={done} />
    )
    : currentId === 'invoices' && creating ? (
      <NewInvoice onCancel={done} onSave={done} />
    )
    : currentId === 'purchase-orders' ? <PurchaseOrders />
      : currentId === 'invoices' && invoiceId ? (
      <InvoiceDetails
        invoiceId={invoiceId}
        onSelect={setInvoiceId}
        onBack={() => setInvoiceId(null)}
      />
    )
        : currentId === 'invoices'
          ? <Invoices onOpen={setInvoiceId} onCreate={() => setCreating(true)} />
          : null;

  const portalOrder = orders.find((o) => o.id === portalId);
  if (portalOrder) {
    const paid = orders.reduce((n, o) => n + o.payments.length, 0);
    return (
      <CustomerPortal
        orders={orders}
        customer={portalOrder.customer}
        orderId={portalOrder.id}
        nextAdvance={`ADV-${String(15 + paid).padStart(5, '0')}`}
        onChange={changeOrder}
        //  Back on the same order, so the payment just made is right there.
        onExit={() => { setOrderId(portalOrder.id); setPortalId(null); }}
      />
    );
  }

  return (
    <AppShell
      nav={(
        <Nav
          items={NAV_ITEMS}
          sections={NAV_SECTIONS}
          currentId={currentId}
          onNavigate={(id) => { setCurrentId(id); setInvoiceId(null); setCreating(false); }}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          product={{ name: 'Books', mark: BOOKS_MARK }}
        />
      )}
      topBar={(
        <Stack gap={0} className="flex-none">
        <PrototypeBar />
        <TopBar
          leading={[{
            id: 'recent', label: 'Recent activity', icon: HISTORY_MARK, onSelect: () => {},
          }]}
          //  The scope follows the page, which is the whole reason it is a
          //  scope and not a label: searching "Purchase Orders" from the
          //  purchase orders list is a different query from searching
          //  everything.
          search={{
            scope: page,
            value: query,
            onValueChange: setQuery,
            onSubmit: () => {},
            onScopeOpen: () => {},
          }}
          org={{ name: 'The Retail Store Inc', onOpen: () => {} }}
          actions={BAR_ACTIONS}
          account={{ name: 'Jenner Dopeson', initials: 'JD', onOpen: () => {} }}
          apps={{ onOpen: () => {} }}
        />
        </Stack>
      )}
    >
      {/* Inside <main>, and scrolling with the body — §7: "if it is about the
          current page, it does not belong in the top bar". */}
      {screen ?? (
      <>
      <PageHeader
        type="list"
        title={`${view} ${page}`}
        views={VIEWS.map((v) => ({ id: v.id, label: `${v.label} ${page}` }))}
        onViewChange={setViewId}
        viewMenuOpen={viewMenuOpen}
        onViewMenuToggle={() => setViewMenuOpen((o) => !o)}
        cta={{ label: 'New', icon: 'plus', onSelect: () => {} }}
      />

      <Stack gap={8} className="p-10">
        <Surface pad={10} border="default">
          <Stack gap={4}>
            <Text size="heading">The body</Text>
            <Text tone="secondary">
              Whatever the route renders goes here. It scrolls; the rail and the
              bar do not.
            </Text>
          </Stack>
        </Surface>

        <Surface tone="sunken" pad={10} radius="md">
          <Stack gap={4}>
            <Text size="subheading">What to look at</Text>
            <Text tone="secondary">
              Press Tab from the address bar — the first stop is a skip link that
              jumps the whole rail. Press / to focus search. Collapse the rail
              with the control at its foot and hover a parent row to get its
              flyout. Most glyphs are dashed placeholders: 31 of the 51 roster
              icons have no geometry yet, and the placeholder is how we track
              that rather than hide it.
            </Text>
          </Stack>
        </Surface>
      </Stack>
      </>
      )}
    </AppShell>
  );
}
