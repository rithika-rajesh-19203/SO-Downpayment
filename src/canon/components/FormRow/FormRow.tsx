import { useId } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../icons';
import { Text } from '../../primitives/Text';
import { cn } from '../../utils/cn';

/**
 * FORM ROW — `ZF-CREATE-PAGE.md` §3. One label, one control, and a column of
 * nothing.
 *
 * **`2 + 3 + 1 = 6`**, the six columns a half owns. Expressed as `2fr 3fr 1fr`
 * rather than as pixels, so a column is a pure twelfth of the content box at
 * any width and the arithmetic needs no `--grid-col` variable at all.
 *
 * ── THE TRACK IS FIXED; THE LABEL HUGS ──────────────────────────────────────
 * §4.1, and it is the finding the file is worth reading for. The first build
 * made the label FILL its 2-column track so it would wrap — which pushed the
 * required asterisk to the far edge of the column, yards from the word it
 * belongs to. Separating the two jobs fixes it:
 *
 * · the **track** is `2fr` and never moves, so every input on the page starts
 *   on column 3 whatever its label does;
 * · the **label** is `max-content` capped at the track, so it hugs its text and
 *   the asterisk lands beside the last word.
 *
 * Measured at a 220 track: "Vendor" 53 wide, "Agreement Name" 117, and a
 * 45-character label clamped to 220 and wrapped to two lines — **the control
 * starts at 220 in all three.**
 *
 * ── THE 7 IS DERIVED, AND THAT IS CORRECT ───────────────────────────────────
 * The label's FIRST line centres on the control:
 * `calc((chrome/control − 20) / 2)` = 7 at 34. In Figma that has to be a
 * literal 7 in 34 instances; in CSS it is a calc that self-corrects the day the
 * control height changes.
 *
 * First line, not the block: when a label wraps, the row grows and the input
 * stays level with the label's first line, which is what keeps a two-line label
 * from pushing its input out of the rhythm its neighbours are in.
 *
 * §7 decision 2, verified against our own tokens: there are **three** control
 * heights and nothing relates them — input **34**, button-lg **32**, toolbar
 * item **28**. Converge them on 32 and this offset becomes `space/3` and the
 * last unbound number in the component goes away.
 *
 * ── AND THE ASTERISK IS NOT THE MECHANISM ───────────────────────────────────
 * §5.1: the source colours the whole required label red, which spends the error
 * colour on a resting state — when the field actually fails there is nothing
 * left to change to — and makes "required" a colour difference, which is 1.4.1.
 * Here the label stays `text/default` and only the mark is `danger/default`,
 * with `required` + `aria-required` doing the work. **On this page red means
 * error and nothing else.**
 */
export interface FormRowProps {
  label: string;
  /** Draws the asterisk AND is passed to the control as `required`. */
  required?: boolean;
  /**
   * Across all twelve columns instead of six — same `2 + 3 + 1` shape, so the
   * label and control still line up with the rows above. For a description, a
   * note, or a line-item table.
   */
  span?: 'half' | 'full';
  /**
   * The validation message, or nothing. Present means the row is in error.
   *
   * ── A RED BORDER IS NOT A MESSAGE ───────────────────────────────────────
   * `zf-radio.md` §8: *"a red border alone does not satisfy 1.4.1, so an error
   * message is mandatory — and a message the control does not point at is not
   * associated with it. The id is that pointer."* So the row owns three things
   * that have to agree, and hands all three to the control: `aria-invalid`,
   * `aria-describedby`, and the id the message is rendered under. A caller
   * wiring them by hand is a caller who will wire two of them.
   *
   * §5.1's rule still holds around it: the LABEL never turns red. On this page
   * red means error, and a label that is already red at rest has nothing left
   * to change to when the field actually fails.
   */
  error?: string;
  /**
   * Override the generated id. Only needed when something outside the row has to
   * find the control — moving focus to the first invalid field on submit is the
   * case this exists for.
   */
  id?: string;
  /**
   * The control. Receives everything it needs to be correctly associated and
   * correctly announced — render it as a function so the `<label for>` can point
   * at something that actually exists.
   */
  children: (props: {
    id: string;
    required: boolean;
    error: boolean;
    describedBy: string | undefined;
  }) => ReactNode;
  className?: string;
}

export function FormRow({
  label, required = false, span = 'half', error, id: idProp, children, className,
}: FormRowProps) {
  const uid = useId();
  const id = idProp ?? uid;
  const errorId = `${id}-error`;

  return (
    <div className={cn(
      //  `items-start`, so the control aligns to the label's first line rather
      //  than to the centre of a wrapped block.
      'grid items-start min-w-0',
      //  ONE branch. Two `grid-cols` on one element are settled by the
      //  stylesheet's emission order, not the className's.
      span === 'full' ? 'col-span-full grid-cols-form-full' : 'grid-cols-form',
      className,
    )}>
      <label
        htmlFor={id}
        className={cn(
          //  HUG, capped at the track. §4.1 — this is what puts the asterisk
          //  beside the word instead of at the far edge of the column.
          'w-max max-w-full min-w-0',
          //  §5 — a field label is NEVER truncated. It wraps and the row grows.
          'break-words',
          'pt-label-offset pe-1',
          'text-body font-regular text-text-default',
        )}
      >
        {label}
        {required ? (
          //  `<abbr>` with a title, not a bare "*": the mark is decoration on
          //  top of `aria-required`, and a screen reader that reads "asterisk"
          //  has been told nothing. Some UAs underline `<abbr>` — hence
          //  `no-underline`.
          <abbr title="required" className="ms-1 text-danger-default no-underline">*</abbr>
        ) : null}
      </label>

      {/* The 30 is on the TRAILING edge only, so the control still starts flush
          on column 3's leading edge. `min-w-0` or a long value stops the track
          from shrinking and the grid stops being twelfths. */}
      {/* `relative`, so the marker can live in the 30 this cell already reserves.
          §3's inset exists to keep the control off column 5's edge and holds
          nothing — which makes it the one place on the row that can gain a
          marker WITHOUT the row changing height. */}
      <div className="relative pe-15 min-w-0">
        {children({ id, required, error: Boolean(error), describedBy: error ? errorId : undefined })}

        {/* ── THE MARKER IS A GLYPH IN THE GUTTER, NOT A LINE OF TEXT ────────
            A message rendered under the control adds ~18px to the row the
            moment it appears and takes it away the moment it is fixed — so a
            form being corrected jumps under the hand doing the correcting,
            once per keystroke while live validation is on. That is the whole
            reason this is not text.

            The message still EXISTS, in `sr-only`: `aria-describedby` points at
            it, so a screen reader reads the field, then "invalid", then the
            reason. The glyph is `aria-hidden` decoration on top of that, and
            carries `title` so a pointer can read it too.

            ONE THING THIS GIVES UP, and it is real: a sighted keyboard user
            gets the red border, the glyph and the banner, but not this field's
            specific sentence. The banner is what has to carry them, which is why
            it says what to do rather than only that something is wrong. */}
        {error ? (
          <>
            <span
              aria-hidden
              title={error}
              //  Centred on the control's own height, so it lines up with a
              //  34-tall input and with the first line of a taller textarea —
              //  the same rule the label follows.
              className="absolute end-0 top-0 grid place-items-center w-15 h-control text-danger-default"
            >
              <Icon name="alert-circle" size="md" tone="inherit" />
            </span>
            <Text id={errorId} as="span" className="sr-only">{error}</Text>
          </>
        ) : null}
      </div>

      {/* Column 6 is the grid's own third track. THERE IS NO SLACK ELEMENT —
          §7.1: an empty div is a node the AT walks past for nothing. */}
    </div>
  );
}
