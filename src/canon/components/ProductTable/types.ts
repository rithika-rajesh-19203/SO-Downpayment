import type { SelectOption } from '../Select/Select';
import type { InputFormat } from '../InputField/InputField';

export type ProductCellKind = 'input' | 'select' | 'read-only';

export interface ProductColumn {
  id: string;
  label: string;
  kind: ProductCellKind;
  /** px. User-resizable unless `resizable: false`. */
  width: number;
  min: number;
  /** EXACTLY ONE column absorbs the slack. §4.2 — and it still needs `min`. */
  flex?: boolean;
  align?: 'start' | 'center';
  resizable?: boolean;
  /** `kind: 'select'` only. */
  options?: SelectOption[];
  placeholder?: string;
  /**
   * `kind: 'input'` only. What the cell will accept — Qty and Discount are
   * `numeric`, Rate is `decimal`. Filtered on the way in, so a paste cannot get
   * past it either.
   *
   * §4.1's left alignment is about where the CARET goes; this is about what it
   * can put there. A grid whose Qty column accepts "3 boxes" produces a total
   * of NaN, and the first place anyone sees that is the totals card.
   */
  format?: InputFormat;
  /** Renders `text/secondary` regular rather than `text/default` medium. */
  muted?: boolean;
  /**
   * An `input` cell whose value is IN a unit chosen per row — a discount as
   * `%` or `Rs.`. Renders a joined `% ▾` segment at the cell's trailing edge.
   * The unit is stored beside the value, at `values['<column id>:unit']`, and
   * falls back to `default` until a row picks one.
   */
  unit?: { options: { value: string; label: string }[]; default: string };
}

export interface ProductRow {
  id: string;
  kind: 'item' | 'group';
  /** Group rows only. */
  label?: string;
  /** Item rows only, keyed by column id. */
  values?: Record<string, string>;
}

export interface TotalRow {
  id: string;
  label: string;
  kind: 'static' | 'editable' | 'emphasis';
  amount: string;
  input?: string;
  /** A rule above this row — it starts a new block of the sum (taxes, Total, what is deducted after it). */
  divider?: boolean;
  /** A secondary line under the label: where a figure came from, e.g. the advance it applies. */
  note?: string;
}
