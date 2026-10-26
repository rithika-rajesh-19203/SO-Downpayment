/**
 * Sales orders, with the advance each one asks for and what has been paid
 * against it. Application data — the canon owns how a row looks, this owns what
 * is in one.
 *
 * ── THE ADVANCE IS TERMS, THE PAYMENTS ARE FACTS ───────────────────────────
 * `advance` is what the order asks for, set on the creation page: a percentage
 * of the total or a fixed amount. `payments` is what the customer actually paid.
 * Two fields rather than one running balance, for the reason the competitor
 * study gives — NetSuite's "Required Deposit" and its deposits are separate
 * records, and a deposit can exceed what was required.
 *
 * `advance.amount` is resolved once, at save. A percentage that re-derived its
 * amount from the total on every render would silently change what the
 * customer was asked for the moment a line was edited.
 *
 * Once an invoice is raised the advance is APPLIED to it — each payment flips to
 * `Applied` and carries the invoice it went against, and the invoice's balance
 * is the total less that advance.
 */

export type AdvanceType = 'percent' | 'amount';

export interface AdvanceTerms {
  type: AdvanceType;
  /** What the user typed: 25 for 25%, or 2000 for ₹2,000. */
  value: number;
  /** Resolved at save — see above. */
  amount: number;
  /** When it has to be in by. */
  collectBefore: 'confirmation' | 'shipment' | 'invoicing';
}

export interface AdvancePayment {
  id: string;
  number: string;
  date: string;                 // ISO
  mode: string;
  depositTo: string;
  reference: string;
  amount: number;
  status: 'Received' | 'Applied';
  /** The invoice number, once applied. */
  appliedTo?: string;
}

export interface OrderInvoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  advanceApplied: number;
  balance: number;
  status: 'Sent' | 'Partially Paid' | 'Paid';
}

export interface OrderLine {
  item: string;
  qty: number;
  rate: number;
  /** Line-level discount: a percentage of qty × rate, or a flat amount off it. */
  discount?: number;
  discountType?: 'percent' | 'amount';
}

/**
 * What a line comes to: qty × rate, less its discount. ONE function, because
 * the creation page, the details page, the PDF and the portal all show this
 * number, and four copies of the rule is three chances for them to disagree.
 * Never below zero — a discount larger than the line is a typo, not a refund.
 */
export function lineAmount(l: OrderLine) {
  const gross = l.qty * l.rate;
  const off = !l.discount ? 0
    : l.discountType === 'amount' ? l.discount
      : (gross * l.discount) / 100;
  return Math.max(0, Math.round((gross - off) * 100) / 100);
}

export interface SalesOrder {
  id: string;
  number: string;
  date: string;
  shipmentDate: string;
  customer: string;
  reference: string;
  paymentTerms: string;
  location: string;
  status: 'Draft' | 'Awaiting Advance' | 'Confirmed' | 'Invoiced';
  lines: OrderLine[];
  shipping: number;
  total: number;
  advance?: AdvanceTerms;
  payments: AdvancePayment[];
  invoices: OrderInvoice[];
}

export const COLLECT_BEFORE: Record<AdvanceTerms['collectBefore'], string> = {
  confirmation: 'Confirming the order',
  shipment: 'Shipping the order',
  invoicing: 'Raising the invoice',
};

export const PAYMENT_MODES = [
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Credit Card', label: 'Credit Card' },
];

export const DEPOSIT_ACCOUNTS = [
  { value: 'HDFC Current A/c', label: 'HDFC Current A/c' },
  { value: 'Undeposited Funds', label: 'Undeposited Funds' },
  { value: 'Petty Cash', label: 'Petty Cash' },
];

export const received = (o: SalesOrder) => o.payments.reduce((s, p) => s + p.amount, 0);
export const advanceDue = (o: SalesOrder) => Math.max(0, (o.advance?.amount ?? 0) - received(o));

export const SALES_ORDERS: SalesOrder[] = [
  {
    id: 'so-73', number: 'SO-00073', date: '2026-10-24', shipmentDate: '2026-11-07',
    customer: 'Mr. Jeh Faran', reference: 'PO-JF-118', paymentTerms: 'Net 15', location: 'Head Office',
    status: 'Awaiting Advance',
    lines: [
      { item: 'Ergonomic Office Chair', qty: 4, rate: 1996 },
      { item: 'Standing Desk Frame', qty: 1, rate: 2000 },
    ],
    shipping: 0, total: 9984,
    advance: { type: 'percent', value: 25, amount: 2496, collectBefore: 'confirmation' },
    payments: [], invoices: [],
  },
  {
    id: 'so-72', number: 'SO-00072', date: '2026-10-22', shipmentDate: '2026-11-02',
    customer: 'Mr. John', reference: '', paymentTerms: 'Due on Receipt', location: 'Head Office',
    status: 'Awaiting Advance',
    lines: [{ item: 'LED Monitor 27"', qty: 2, rate: 2695 }],
    shipping: 0, total: 5390,
    advance: { type: 'amount', value: 2000, amount: 2000, collectBefore: 'shipment' },
    payments: [
      {
        id: 'adv-14', number: 'ADV-00014', date: '2026-10-23', mode: 'UPI',
        depositTo: 'HDFC Current A/c', reference: 'UPI-55120934', amount: 1000, status: 'Received',
      },
    ],
    invoices: [],
  },
  {
    id: 'so-71', number: 'SO-00071', date: '2026-10-20', shipmentDate: '2026-10-28',
    customer: 'Mr. John', reference: '', paymentTerms: 'Net 30', location: 'Head Office',
    status: 'Confirmed',
    lines: [{ item: 'Wireless Keyboard', qty: 2, rate: 500 }],
    shipping: 0, total: 1000,
    payments: [], invoices: [],
  },
  {
    id: 'so-70', number: 'SO-00070', date: '2026-10-13', shipmentDate: '2026-10-30',
    customer: 'Mr. Jeh Faran', reference: 'QT-000007', paymentTerms: 'Net 15', location: 'Head Office',
    status: 'Confirmed',
    lines: [
      { item: 'Conference Table', qty: 1, rate: 14097 },
      { item: 'Ergonomic Office Chair', qty: 4, rate: 2000 },
    ],
    shipping: 0, total: 22097,
    advance: { type: 'percent', value: 50, amount: 11048.5, collectBefore: 'confirmation' },
    payments: [
      {
        id: 'adv-12', number: 'ADV-00012', date: '2026-10-14', mode: 'Bank Transfer',
        depositTo: 'HDFC Current A/c', reference: 'NEFT-88213', amount: 6000, status: 'Received',
      },
      {
        id: 'adv-13', number: 'ADV-00013', date: '2026-10-18', mode: 'Cheque',
        depositTo: 'Undeposited Funds', reference: 'CHQ-004512', amount: 5048.5, status: 'Received',
      },
    ],
    invoices: [],
  },
  {
    id: 'so-69', number: 'SO-00069', date: '2026-08-13', shipmentDate: '2026-08-20',
    customer: 'Mr. Jeh Faran', reference: 'QT-000006', paymentTerms: 'Due on Receipt', location: 'Head Office',
    status: 'Invoiced',
    lines: [{ item: 'Standing Desk Frame', qty: 1, rate: 2496 }],
    shipping: 0, total: 2496,
    advance: { type: 'percent', value: 20, amount: 499.2, collectBefore: 'confirmation' },
    payments: [
      {
        id: 'adv-09', number: 'ADV-00009', date: '2026-08-13', mode: 'Cash',
        depositTo: 'Petty Cash', reference: '', amount: 499.2, status: 'Applied', appliedTo: 'INV-000137',
      },
    ],
    invoices: [
      {
        id: 'inv-137', number: 'INV-000137', date: '2026-08-13', dueDate: '2026-08-13',
        amount: 2496, advanceApplied: 499.2, balance: 0, status: 'Paid',
      },
    ],
  },
  {
    id: 'so-68', number: 'SO-00068', date: '2026-08-12', shipmentDate: '2026-08-19',
    customer: 'Branch 1 (The Retail Store Inc)', reference: '', paymentTerms: 'Net 30', location: 'Branch 1',
    status: 'Draft',
    lines: [{ item: 'Wireless Keyboard', qty: 1, rate: 499 }],
    shipping: 0, total: 499,
    payments: [], invoices: [],
  },
];

/** The business issuing the order — the PDF's letterhead. */
export const ORGANISATION = {
  name: 'The Retail Store Inc',
  address: ['Coimbatore Tamil Nadu 641027', 'India'],
  gstin: '33SXWAI6641W6Z3',
};

export interface CustomerInfo {
  billing: string[];
  shipping: string[];
  gstin?: string;
  placeOfSupply: string;
}

/** Stand-in until a customers API exists. Keyed by `SalesOrder.customer`. */
export const CUSTOMER_INFO: Record<string, CustomerInfo> = {
  'Mr. Jeh Faran': {
    billing: ['ABC Building,', 'Sample test street', 'Madurai', 'Tamil Nadu', 'India', '625001'],
    shipping: [],
    gstin: '33ESDRUI1234231',
    placeOfSupply: 'Tamil Nadu (33)',
  },
  'Mr. John': {
    billing: ['12 Lake View Road', 'Coimbatore', 'Tamil Nadu', 'India', '641002'],
    shipping: ['Warehouse 2, Avinashi Road', 'Coimbatore', 'Tamil Nadu', 'India', '641014'],
    placeOfSupply: 'Tamil Nadu (33)',
  },
  'Branch 1 (The Retail Store Inc)': {
    billing: ['Branch 1, Gandhipuram', 'Coimbatore', 'Tamil Nadu', 'India', '641012'],
    shipping: [],
    gstin: '33SXWAI6641W6Z3',
    placeOfSupply: 'Tamil Nadu (33)',
  },
  'Meridian Textiles': {
    billing: ['22 Avinashi Road', 'Coimbatore', 'Tamil Nadu', 'India', '641018'],
    shipping: ['Unit 7, Tirupur Export Zone', 'Tirupur', 'Tamil Nadu', 'India', '641604'],
    gstin: '33AACCM4521K1Z8',
    placeOfSupply: 'Tamil Nadu (33)',
  },
};

/**
 * Adds a payment to an order's advance. ONE function, used by Books' Record
 * Advance Payment and by the customer paying from the portal, so both apply the
 * same rule: the advance arriving in full is what confirms an order that was
 * waiting on it — NetSuite releases its hold on the same condition.
 */
export function applyAdvancePayment(o: SalesOrder, p: AdvancePayment): SalesOrder {
  const payments = [...o.payments, p];
  const paid = payments.reduce((s, x) => s + x.amount, 0);
  return {
    ...o,
    payments,
    status: o.status === 'Awaiting Advance' && paid >= (o.advance?.amount ?? 0) ? 'Confirmed' : o.status,
  };
}
