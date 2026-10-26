/**
 * Thirty invoices. Application data — the canon owns how a row looks, this owns
 * what is in one.
 *
 * Generated once with a fixed seed and written out literally, for the reason
 * `purchase-orders.ts` gives: a list view that reshuffles on every reload cannot
 * be reviewed, screenshotted, or compared against a design.
 *
 * `statusLabel` exists because one status carries a NUMBER. "Overdue by 30 days"
 * is the state plus a measurement of it, and the badge shows the whole sentence
 * while `status` stays the six-value vocabulary everything else keys off. Two
 * fields rather than parsing the label back apart.
 *
 * The balance follows the status rather than being rolled independently: a Paid
 * invoice with a balance outstanding is a lie, and a Draft with a part-payment
 * against it is impossible. A screen full of impossible rows teaches nothing.
 */
export interface Invoice {
  id: string;
  date: string;                 // ISO — formatted at render, never stored formatted
  number: string;
  order: string;
  customer: string;
  status: 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Void';
  statusLabel: string;
  dueDate: string;
  amount: number;
  balance: number;
  location: string;
}

export const INVOICES: Invoice[] = [
  { id: 'inv-1',   date: '2026-08-24',  number: 'INV-2140',   order: 'SO-1870',   customer: 'Meridian Textiles',       status: 'Sent',            statusLabel: 'Sent',                    dueDate: '2026-10-08',  amount: 312750, balance: 312750, location: 'Chennai', },
  { id: 'inv-2',   date: '2026-08-20',  number: 'INV-2139',   order: 'SO-1869',   customer: 'Anantha Foods',           status: 'Paid',            statusLabel: 'Paid',                    dueDate: '2026-09-19',  amount: 4820, balance: 0, location: 'Bengaluru', },
  { id: 'inv-3',   date: '2026-08-15',  number: 'INV-2138',   order: 'SO-1868',   customer: 'Kaveri Logistics',        status: 'Overdue',         statusLabel: 'Overdue by 45 days',      dueDate: '2026-07-13',  amount: 91400, balance: 91400, location: 'Mumbai', },
  { id: 'inv-4',   date: '2026-08-13',  number: 'INV-2137',   order: 'SO-1867',   customer: 'Nilgiri Retail',          status: 'Void',            statusLabel: 'Void',                    dueDate: '2026-08-28',  amount: 745200, balance: 0, location: 'Hyderabad', },
  { id: 'inv-5',   date: '2026-08-10',  number: 'INV-2136',   order: 'SO-1866',   customer: 'Bharat Pharma',           status: 'Draft',           statusLabel: 'Draft',                   dueDate: '2026-09-09',  amount: 745200, balance: 745200, location: 'Pune', },
  { id: 'inv-6',   date: '2026-08-06',  number: 'INV-2135',   order: 'SO-1865',   customer: 'Suryodaya Energy',        status: 'Draft',           statusLabel: 'Draft',                   dueDate: '2026-10-05',  amount: 184500, balance: 184500, location: 'New Delhi', },
  { id: 'inv-7',   date: '2026-08-05',  number: 'INV-2134',   order: 'SO-1864',   customer: 'Konark Ceramics',         status: 'Paid',            statusLabel: 'Paid',                    dueDate: '2026-09-19',  amount: 47215, balance: 0, location: 'Kochi', },
  { id: 'inv-8',   date: '2026-08-01',  number: 'INV-2133',   order: 'SO-1863',   customer: 'Vindhya Motors',          status: 'Paid',            statusLabel: 'Paid',                    dueDate: '2026-08-16',  amount: 4820, balance: 0, location: 'Ahmedabad', },
  { id: 'inv-9',   date: '2026-07-27',  number: 'INV-2132',   order: 'SO-1862',   customer: 'Arcot Interiors',         status: 'Paid',            statusLabel: 'Paid',                    dueDate: '2026-09-25',  amount: 143900, balance: 0, location: 'Chennai', },
  { id: 'inv-10',  date: '2026-07-25',  number: 'INV-2131',   order: 'SO-1861',   customer: 'Payal Jewellers',         status: 'Paid',            statusLabel: 'Paid',                    dueDate: '2026-08-09',  amount: 15980, balance: 0, location: 'Bengaluru', },
  { id: 'inv-11',  date: '2026-07-22',  number: 'INV-2130',   order: 'SO-1860',   customer: 'Trisha Konar',            status: 'Overdue',         statusLabel: 'Overdue by 7 days',       dueDate: '2026-08-20',  amount: 9375, balance: 9375, location: 'Mumbai', },
  { id: 'inv-12',  date: '2026-07-21',  number: 'INV-2129',   order: 'SO-1859',   customer: 'Ravi Menon',              status: 'Overdue',         statusLabel: 'Overdue by 92 days',      dueDate: '2026-05-27',  amount: 1204500, balance: 1204500, location: 'Hyderabad', },
  { id: 'inv-13',  date: '2026-07-18',  number: 'INV-2128',   order: 'SO-1858',   customer: 'Sundaram Iyer',           status: 'Sent',            statusLabel: 'Sent',                    dueDate: '2026-09-16',  amount: 184500, balance: 184500, location: 'Pune', },
  { id: 'inv-14',  date: '2026-07-16',  number: 'INV-2127',   order: 'SO-1857',   customer: 'Deepa Nambiar',           status: 'Paid',            statusLabel: 'Paid',                    dueDate: '2026-08-30',  amount: 638900, balance: 0, location: 'New Delhi', },
  { id: 'inv-15',  date: '2026-07-14',  number: 'INV-2126',   order: 'SO-1856',   customer: 'Zenith Print House',      status: 'Paid',            statusLabel: 'Paid',                    dueDate: '2026-07-29',  amount: 638900, balance: 0, location: 'Kochi', },
  { id: 'inv-16',  date: '2026-07-10',  number: 'INV-2125',   order: 'SO-1855',   customer: 'Coastal Marine Supply',   status: 'Draft',           statusLabel: 'Draft',                   dueDate: '2026-08-09',  amount: 1204500, balance: 1204500, location: 'Ahmedabad', },
  { id: 'inv-17',  date: '2026-07-08',  number: 'INV-2124',   order: 'SO-1854',   customer: 'Girija Analytics',        status: 'Sent',            statusLabel: 'Sent',                    dueDate: '2026-08-07',  amount: 32760, balance: 32760, location: 'Chennai', },
  { id: 'inv-18',  date: '2026-07-06',  number: 'INV-2123',   order: 'SO-1853',   customer: 'Harsha Constructions',    status: 'Overdue',         statusLabel: 'Overdue by 7 days',       dueDate: '2026-08-20',  amount: 118250, balance: 118250, location: 'Bengaluru', },
  { id: 'inv-19',  date: '2026-07-05',  number: 'INV-2122',   order: 'SO-1852',   customer: 'Indus Valley Crafts',     status: 'Partially Paid',  statusLabel: 'Partially Paid',          dueDate: '2026-07-20',  amount: 412600, balance: 206300, location: 'Mumbai', },
  { id: 'inv-20',  date: '2026-07-04',  number: 'INV-2121',   order: 'SO-1851',   customer: 'Jalaram Spices',          status: 'Overdue',         statusLabel: 'Overdue by 15 days',      dueDate: '2026-08-12',  amount: 4820, balance: 4820, location: 'Hyderabad', },
  { id: 'inv-21',  date: '2026-07-02',  number: 'INV-2120',   order: 'SO-1850',   customer: 'Kalinga Steel',           status: 'Sent',            statusLabel: 'Sent',                    dueDate: '2026-07-17',  amount: 143900, balance: 143900, location: 'Pune', },
  { id: 'inv-22',  date: '2026-07-01',  number: 'INV-2119',   order: 'SO-1849',   customer: 'Lotus Hospitality',       status: 'Overdue',         statusLabel: 'Overdue by 60 days',      dueDate: '2026-06-28',  amount: 921340, balance: 921340, location: 'New Delhi', },
  { id: 'inv-23',  date: '2026-06-28',  number: 'INV-2118',   order: 'SO-1848',   customer: 'Mangala Dairy',           status: 'Partially Paid',  statusLabel: 'Partially Paid',          dueDate: '2026-07-28',  amount: 4820, balance: 2890, location: 'Kochi', },
  { id: 'inv-24',  date: '2026-06-26',  number: 'INV-2117',   order: 'SO-1847',   customer: 'Neelkanth Optics',        status: 'Sent',            statusLabel: 'Sent',                    dueDate: '2026-07-11',  amount: 91400, balance: 91400, location: 'Ahmedabad', },
  { id: 'inv-25',  date: '2026-06-22',  number: 'INV-2116',   order: 'SO-1846',   customer: 'Orissa Minerals',         status: 'Overdue',         statusLabel: 'Overdue by 92 days',      dueDate: '2026-05-27',  amount: 184500, balance: 184500, location: 'Chennai', },
  { id: 'inv-26',  date: '2026-06-17',  number: 'INV-2115',   order: 'SO-1845',   customer: 'Prabhat Publishing',      status: 'Draft',           statusLabel: 'Draft',                   dueDate: '2026-07-17',  amount: 412600, balance: 412600, location: 'Bengaluru', },
  { id: 'inv-27',  date: '2026-06-16',  number: 'INV-2114',   order: 'SO-1844',   customer: 'Quilon Coir',             status: 'Paid',            statusLabel: 'Paid',                    dueDate: '2026-07-16',  amount: 47215, balance: 0, location: 'Mumbai', },
  { id: 'inv-28',  date: '2026-06-14',  number: 'INV-2113',   order: 'SO-1843',   customer: 'Rashtriya Cables',        status: 'Draft',           statusLabel: 'Draft',                   dueDate: '2026-07-29',  amount: 921340, balance: 921340, location: 'Hyderabad', },
  { id: 'inv-29',  date: '2026-06-12',  number: 'INV-2112',   order: 'SO-1842',   customer: 'Sarvodaya Trust',         status: 'Paid',            statusLabel: 'Paid',                    dueDate: '2026-07-12',  amount: 507300, balance: 0, location: 'Pune', },
  { id: 'inv-30',  date: '2026-06-10',  number: 'INV-2111',   order: 'SO-1841',   customer: 'Tirupati Packaging',      status: 'Overdue',         statusLabel: 'Overdue by 7 days',       dueDate: '2026-08-20',  amount: 745200, balance: 745200, location: 'New Delhi', },
];
