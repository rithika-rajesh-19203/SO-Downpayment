/**
 * Ten purchase orders. Application data, not design data — the canon owns how a
 * row looks, this owns what is in one.
 *
 * `status` and `billed` are the record's own vocabulary; the screen maps each to
 * a `StatusBadge` status. Keeping the mapping in the screen rather than here is
 * deliberate: "Closed" is a fact about a purchase order, "success" is a fact
 * about how it is drawn, and this file should not know the second one.
 */
export interface PurchaseOrder {
  id: string;
  date: string;              // ISO — formatted at render, never stored formatted
  number: string;
  reference: string;
  vendor: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Issued' | 'Closed' | 'Cancelled';
  billed: 'Billed' | 'Pending';
  amount: number;            // minor unit avoided: these are whole rupees
}

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: 'po-1',  date: '2026-08-24', number: 'PO-00042', reference: 'REQ-8821', vendor: 'Sundar Metalworks',        status: 'Issued',           billed: 'Pending', amount: 184500 },
  { id: 'po-2',  date: '2026-08-21', number: 'PO-00041', reference: 'REQ-8814', vendor: 'Kavery Packaging',         status: 'Closed',           billed: 'Billed',  amount: 32760 },
  { id: 'po-3',  date: '2026-08-19', number: 'PO-00040', reference: 'REQ-8809', vendor: 'Nilgiri Components Pvt Ltd', status: 'Approved',       billed: 'Pending', amount: 921340 },
  { id: 'po-4',  date: '2026-08-17', number: 'PO-00039', reference: 'REQ-8802', vendor: 'Anand Tooling',            status: 'Pending Approval', billed: 'Pending', amount: 47215 },
  { id: 'po-5',  date: '2026-08-14', number: 'PO-00038', reference: 'REQ-8790', vendor: 'Deccan Logistics',         status: 'Closed',           billed: 'Billed',  amount: 15980 },
  { id: 'po-6',  date: '2026-08-11', number: 'PO-00037', reference: 'REQ-8783', vendor: 'Bharat Steel Traders',     status: 'Cancelled',        billed: 'Pending', amount: 268400 },
  { id: 'po-7',  date: '2026-08-08', number: 'PO-00036', reference: 'REQ-8771', vendor: 'Vaigai Chemicals',         status: 'Issued',           billed: 'Billed',  amount: 76050 },
  { id: 'po-8',  date: '2026-08-05', number: 'PO-00035', reference: 'REQ-8764', vendor: 'Coromandel Fasteners',     status: 'Draft',            billed: 'Pending', amount: 9375 },
  { id: 'po-9',  date: '2026-08-02', number: 'PO-00034', reference: 'REQ-8752', vendor: 'Mahanadi Rubber Works',    status: 'Approved',         billed: 'Pending', amount: 412600 },
  { id: 'po-10', date: '2026-07-29', number: 'PO-00033', reference: 'REQ-8741', vendor: 'Sarayu Electricals',       status: 'Closed',           billed: 'Billed',  amount: 58120 },

  //  Twenty-five more, generated once with a fixed seed and written out
  //  literally. Data in a file beats data from a function: a list view that
  //  reshuffles on every reload cannot be reviewed, screenshotted, or
  //  compared against a design. `Billed` appears only on Issued and Closed
  //  orders — a cancelled purchase order that is billed is a lie, and a
  //  screen full of lies teaches nobody anything about the view.
  { id: 'po-11',  date: '2026-07-23',  number: 'PO-00032', reference: 'REQ-8600',  vendor: 'Sundar Metalworks',            status: 'Closed',            billed: 'Billed',   amount: 507300 },
  { id: 'po-12',  date: '2026-07-19',  number: 'PO-00031', reference: 'REQ-8647',  vendor: 'Kavery Packaging',             status: 'Issued',            billed: 'Billed',   amount: 76050 },
  { id: 'po-13',  date: '2026-07-18',  number: 'PO-00030', reference: 'REQ-8611',  vendor: 'Nilgiri Components Pvt Ltd',   status: 'Draft',             billed: 'Pending',  amount: 312750 },
  { id: 'po-14',  date: '2026-07-13',  number: 'PO-00029', reference: 'REQ-8708',  vendor: 'Anand Tooling',                status: 'Closed',            billed: 'Pending',  amount: 638900 },
  { id: 'po-15',  date: '2026-07-09',  number: 'PO-00028', reference: 'REQ-8711',  vendor: 'Deccan Logistics',             status: 'Issued',            billed: 'Billed',   amount: 91400 },
  { id: 'po-16',  date: '2026-07-08',  number: 'PO-00027', reference: '-',         vendor: 'Bharat Steel Traders',         status: 'Closed',            billed: 'Pending',  amount: 745200 },
  { id: 'po-17',  date: '2026-07-05',  number: 'PO-00026', reference: 'REQ-8624',  vendor: 'Vaigai Chemicals',             status: 'Closed',            billed: 'Pending',  amount: 921340 },
  { id: 'po-18',  date: '2026-07-01',  number: 'PO-00025', reference: 'REQ-8728',  vendor: 'Coromandel Fasteners',         status: 'Issued',            billed: 'Billed',   amount: 9375 },
  { id: 'po-19',  date: '2026-06-29',  number: 'PO-00024', reference: 'REQ-8706',  vendor: 'Mahanadi Rubber Works',        status: 'Issued',            billed: 'Pending',  amount: 32760 },
  { id: 'po-20',  date: '2026-06-25',  number: 'PO-00023', reference: 'REQ-8660',  vendor: 'Sarayu Electricals',           status: 'Approved',          billed: 'Pending',  amount: 91400 },
  { id: 'po-21',  date: '2026-06-22',  number: 'PO-00022', reference: 'REQ-8648',  vendor: 'Palar Precision',              status: 'Closed',            billed: 'Billed',   amount: 312750 },
  { id: 'po-22',  date: '2026-06-18',  number: 'PO-00021', reference: 'REQ-8624',  vendor: 'Godavari Castings',            status: 'Approved',          billed: 'Pending',  amount: 312750 },
  { id: 'po-23',  date: '2026-06-13',  number: 'PO-00020', reference: 'REQ-8738',  vendor: 'Tungabhadra Textiles',         status: 'Issued',            billed: 'Billed',   amount: 312750 },
  { id: 'po-24',  date: '2026-06-10',  number: 'PO-00019', reference: 'REQ-8712',  vendor: 'Kaveri Hydraulics',            status: 'Pending Approval',  billed: 'Pending',  amount: 507300 },
  { id: 'po-25',  date: '2026-06-08',  number: 'PO-00018', reference: 'REQ-8609',  vendor: 'Chenab Bearings',              status: 'Approved',          billed: 'Pending',  amount: 9375 },
  { id: 'po-26',  date: '2026-06-07',  number: 'PO-00017', reference: '-',         vendor: 'Periyar Polymers',             status: 'Issued',            billed: 'Billed',   amount: 58120 },
  { id: 'po-27',  date: '2026-06-05',  number: 'PO-00016', reference: 'REQ-8729',  vendor: 'Netravati Coatings',           status: 'Draft',             billed: 'Pending',  amount: 268400 },
  { id: 'po-28',  date: '2026-06-04',  number: 'PO-00015', reference: 'REQ-8706',  vendor: 'Bhima Forge',                  status: 'Closed',            billed: 'Billed',   amount: 745200 },
  { id: 'po-29',  date: '2026-05-30',  number: 'PO-00014', reference: 'REQ-8687',  vendor: 'Sabarmati Wire',               status: 'Issued',            billed: 'Pending',  amount: 23640 },
  { id: 'po-30',  date: '2026-05-29',  number: 'PO-00013', reference: 'REQ-8659',  vendor: 'Krishna Abrasives',            status: 'Closed',            billed: 'Billed',   amount: 921340 },
  { id: 'po-31',  date: '2026-05-24',  number: 'PO-00012', reference: 'REQ-8721',  vendor: 'Indravati Optics',             status: 'Pending Approval',  billed: 'Pending',  amount: 15980 },
  { id: 'po-32',  date: '2026-05-20',  number: 'PO-00011', reference: 'REQ-8622',  vendor: 'Manjeera Gaskets',             status: 'Issued',            billed: 'Pending',  amount: 143900 },
  { id: 'po-33',  date: '2026-05-18',  number: 'PO-00010', reference: 'REQ-8635',  vendor: 'Pennar Alloys',                status: 'Approved',          billed: 'Pending',  amount: 412600 },
  { id: 'po-34',  date: '2026-05-16',  number: 'PO-00009', reference: 'REQ-8666',  vendor: 'Zuari Adhesives',              status: 'Pending Approval',  billed: 'Pending',  amount: 76050 },
  { id: 'po-35',  date: '2026-05-14',  number: 'PO-00008', reference: 'REQ-8656',  vendor: 'Tapti Instruments',            status: 'Pending Approval',  billed: 'Pending',  amount: 23640 },
];
