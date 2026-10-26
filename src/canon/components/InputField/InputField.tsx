import type { InputHTMLAttributes } from 'react';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import { cn } from '../../utils/cn';

/**
 * INPUT FIELD — design-refs/zf-input-field.md, the `Input Field/States` half.
 * **The input box only.**
 *
 * §1 is explicit about which of the two components to reach for: **`Field` by
 * default.** This one stays public because a few places need a bare box — a
 * table's inline edit cell, a search field in a toolbar — but anything on a form
 * wants the wrapper, "because that is what makes the label travel with the input
 * instead of being a sibling someone has to remember to add."
 *
 * ── 18 FIGMA VARIANTS COLLAPSE TO 2 ──────────────────────────────────────────
 * `States` (5) × `is_error` (2) × `Content` (2), minus Disabled+error = 18.
 *
 *   `States`  — Default / Hover / On-Click / Focus / Disabled are all native
 *               pseudo-classes on an `<input>`. §5 also measures that Hover and
 *               On-Click render IDENTICALLY, so the five options produce four
 *               appearances even in Figma.
 *   `Content` — placeholder vs value is not a variant in a real input. It is
 *               whether the element has a value, and `::placeholder` is the
 *               selector. §3.2 exists because a designer had to override the
 *               text colour by hand; a browser does it for free.
 *
 * That leaves `error`. Everything else is the DOM doing its job.
 *
 * ── THE ICONS DEFAULT OFF ────────────────────────────────────────────────────
 * §3: Figma had `Icon Left` and `Icon Right` defaulting to `true`, so a freshly
 * placed field arrived with two glyphs. Fixed there, and matched here. §1.1 also
 * settles that they are booleans and not variants — as variants they would have
 * multiplied 18 into 72.
 */
/**
 * WHAT THE FIELD WILL ACCEPT. The characters are filtered on the way in, so a
 * paste cannot get past it either — `change` fires after a paste, which is why
 * this is done there rather than on `keydown`.
 *
 * ── AND WHY NONE OF THEM IS `type="number"` ─────────────────────────────────
 * It is the obvious answer and it is wrong for every one of these:
 *
 * · a scroll wheel over a focused number input **changes the value**, silently,
 *   while the user is scrolling the page past it;
 * · it drops leading zeros, so an account number or a pin cannot be typed;
 * · its spinners are unstyleable and add furniture to a 34px control;
 * · and it accepts `e`, `+` and `-` anywhere, so `1e5` is a "valid number" —
 *   which is exactly the class of thing this prop exists to stop.
 *
 * `type="text"` with `inputMode` gets the right mobile keyboard without any of
 * that, and the filter does what `type="number"` only appears to.
 *
 * ── AND `date` IS NOT `type="date"` EITHER ──────────────────────────────────
 * · its picker is painted by the OS and cannot be made to match the 34px field
 *   beside it, the same reason `Select` is not a native `<select>`;
 * · **its displayed format follows the browser's locale**, so the same stored
 *   value reads `22/03/2026` to one user and `03/22/2026` to another — and the
 *   placeholder saying `DD/MM/YYYY` would be a lie for half of them;
 * · its value is always ISO `YYYY-MM-DD`, which is a second format for every
 *   consumer to convert, and a third once someone forgets.
 *
 * A masked text field shows exactly one format to everybody and hands back
 * exactly the string the placeholder promised.
 */
export type InputFormat = 'text' | 'numeric' | 'decimal' | 'tel' | 'date';

const FILTER: Record<InputFormat, RegExp | null> = {
  text: null,
  numeric: /[^0-9]/g,
  //  One dot, and it may lead. `-` only at the start, so `1-2` cannot happen.
  decimal: /[^0-9.-]/g,
  //  §: the punctuation a phone number is actually written with.
  tel: /[^0-9+()\-\s]/g,
  //  Handled by `maskDate`, which needs the digits and nothing else.
  date: null,
};

const MODE: Record<InputFormat, InputHTMLAttributes<HTMLInputElement>['inputMode']> = {
  text: undefined, numeric: 'numeric', decimal: 'decimal', tel: 'tel', date: 'numeric',
};

/**
 * `DD/MM/YYYY`, built from the digits.
 *
 * ── THE SEPARATOR IS LAZY, AND THAT IS THE WHOLE TRICK ──────────────────────
 * A slash is only added when a digit FOLLOWS it. Append it eagerly — `22` →
 * `22/` — and backspace becomes a trap: the user deletes the slash, the mask
 * puts it straight back, and the field cannot be emptied from the right.
 *
 * Deriving the whole string from the digits rather than editing it in place is
 * what makes that work. There is no state in which the separators are wrong,
 * because they are never kept — only the digits are.
 */
function maskDate(digits: string): string {
  const d = digits.slice(0, 8);
  return d.slice(0, 2)
    + (d.length > 2 ? `/${d.slice(2, 4)}` : '')
    + (d.length > 4 ? `/${d.slice(4)}` : '');
}

/**
 * Exported so a bare cell input — `ProductTable`'s — treats a value identically.
 * Named `apply` and not `filter` because `date` MASKS as well as strips.
 */
export function applyFormat(value: string, format: InputFormat): string {
  if (format === 'date') return maskDate(value.replace(/[^0-9]/g, ''));
  const re = FILTER[format];
  if (!re) return value;
  let out = value.replace(re, '');
  if (format === 'decimal') {
    //  Keep the FIRST dot and the LEADING minus; drop the rest. Doing it by
    //  regex alone cannot express "one of these, in this position".
    const neg = out.startsWith('-');
    const [head, ...tail] = out.replace(/-/g, '').split('.');
    out = (neg ? '-' : '') + head + (tail.length ? `.${tail.join('')}` : '');
  }
  return out;
}

export interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  /**
   * What the field accepts. `text` (default) accepts anything; the rest filter
   * on the way in and set the matching mobile keyboard. `date` also MASKS —
   * typing `22032026` becomes `22/03/2026`. Never `type="number"`, and never
   * `type="date"` — see `InputFormat`.
   */
  format?: InputFormat;
  /** §3.3 — a real icon instance, 16 × 16, inheriting the theme. Off by default. */
  icon?: IconName;
  iconRight?: IconName;
}

export function InputField({
  error, icon, iconRight, disabled, format = 'text', onChange, className, ...rest
}: InputFieldProps) {
  //  §5: `Disabled + error` does not exist in either component, "and that is
  //  defensible — a control the user cannot edit cannot be corrected".
  const invalid = Boolean(error) && !disabled;

  return (
    <span
      className={cn(
        //  §4.1 / §7: height 34, padding and gap both space/5, radius md.
        'inline-flex items-center gap-5 h-control px-5 w-full',
        'rounded-md border bg-surface-default transition-colors',
        //  §6: the ring is an outline, not a child rectangle — "an outline needs
        //  no node, never affects layout, and follows the box at any size".
        //  Applied to the wrapper via focus-within so the icons sit inside it.
        'focus-within:outline-2 focus-within:outline-offset-2',
        disabled
          ? 'bg-surface-disabled border-border-disabled cursor-not-allowed'
          : invalid
            //  §4: error border AND the error focus ring are `danger/default`,
            //  6.09:1. The ring changes colour with the state, which is the one
            //  place this component overrides the system-wide focus treatment.
            ? 'border-danger-default focus-within:outline-danger-default'
            //  §4.2 / §6: `border/control`, not `border/strong`. The whole
            //  border ramp tops out at 1.71:1 and 1.4.11 needs 3:1, so there was
            //  no correct choice available until this role existed.
            //  §6 keeps the resting border on focus and only adds the ring —
            //  "stated because it looks like an omission".
            : 'border-border-default hover:border-border-hover focus-within:outline-focus-ring',
        className,
      )}
    >
      {icon ? <Icon name={icon} size="md" tone={disabled ? 'disabled' : 'subtle'} /> : null}
      <input
        disabled={disabled}
        inputMode={MODE[format]}
        //  Filtered here and not on `keydown`: `change` is the one event that
        //  fires for typing, pasting, drag-and-drop and autofill alike. The
        //  caller receives the cleaned value, so a controlled field never holds
        //  a character the format forbids.
        onChange={format === 'text' ? onChange : (e) => {
          const el = e.target;
          const raw = el.value;
          const clean = applyFormat(raw, format);
          if (clean !== raw) {
            //  ── KEEP THE CARET WHERE THE USER LEFT IT ─────────────────────
            //  Rewriting `value` puts the caret at the end, so editing the
            //  MIDDLE of a masked date sends the cursor to the far right on
            //  every keystroke and the field can only be typed into from the
            //  end. Nobody edits a date that way twice.
            //
            //  Counted in DIGITS, not characters: the mask adds and removes
            //  separators around the caret, so a character index means
            //  something different before and after. Digits are what the user
            //  actually typed and the only stable thing to anchor to.
            const before = raw.slice(0, el.selectionStart ?? raw.length)
              .replace(/[^0-9]/g, '').length;
            let at = 0;
            let seen = 0;
            while (at < clean.length && seen < before) {
              if (/[0-9]/.test(clean[at])) seen += 1;
              at += 1;
            }
            el.value = clean;
            //  Synchronously, and before React re-renders — it will see the
            //  same value it is about to set and leave the node alone.
            el.setSelectionRange(at, at);
          }
          onChange?.(e);
        }}
        aria-invalid={invalid || undefined}
        className={cn(
          'min-w-0 flex-1 bg-transparent outline-none text-body',
          'text-text-default',
          //  §4.3: NOT `text/placeholder`. That role is `neutral/1000` at
          //  2.85:1, below the 4.5:1 1.4.3 asks of text — "a role named
          //  text/placeholder that cannot be used for placeholder text is a
          //  trap". `text/tertiary` is neutral/1100 at 4.52:1 and passes whether
          //  or not placeholders are held to be exempt.
          'placeholder:text-text-tertiary',
          'disabled:text-text-disabled disabled:cursor-not-allowed',
        )}
        {...rest}
      />
      {iconRight ? <Icon name={iconRight} size="md" tone={disabled ? 'disabled' : 'subtle'} /> : null}
    </span>
  );
}
