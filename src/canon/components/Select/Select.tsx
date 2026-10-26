import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { Icon } from '../../icons';
import { cn } from '../../utils/cn';
import { MENU_SURFACE } from '../Menu/Menu';

/**
 * SELECT — choose one value from a list.
 *
 * **No md on disk.** Built to the ARIA `combobox`-with-`listbox` pattern, and
 * drawn as an `InputField` so a select and a text field on the same form row are
 * the same 34px box with the same border, radius and focus ring. Every number
 * here comes from `zf-input-field.md` via that component; nothing is measured
 * twice.
 *
 * ── WHY IT IS NOT A `Menu` ──────────────────────────────────────────────────
 * A menu is a list of **commands**; a select is a list of **values**, and one of
 * them is currently true. That is `role="listbox"` with `aria-selected` on every
 * option, not `role="menu"` with `menuitem` — and §1's sharpest test applies:
 * *if two values need different HTML, they are different components.*
 *
 * It does reuse `MENU_SURFACE`, so the panel is the same paper as every other
 * overlay in the system. `PageHeader`'s view switcher already does exactly this.
 *
 * ── AND NOT A NATIVE `<select>` ─────────────────────────────────────────────
 * A native select cannot be styled to match the field beside it — the options
 * are painted by the OS — and it cannot hold the secondary text a vendor row
 * wants. The cost is that every keyboard behaviour has to be written out, which
 * is the block below.
 *
 * ── THE KEYBOARD, WHICH IS THE WHOLE COMPONENT ──────────────────────────────
 * · **Closed**: ↓ ↑ Enter Space Alt+↓ open. ↓ ↑ with Alt released also *change*
 *   the value without opening, which is how a native select behaves and how
 *   people fill forms fast.
 * · **Open**: ↓ ↑ move the active option, Home / End jump, Enter and Space
 *   commit, Escape closes and **restores the value it opened with** — a cancel
 *   that leaves the changed value behind is not a cancel.
 * · **Focus stays on the trigger** the whole time; the active option is named by
 *   `aria-activedescendant`. Moving focus into the list would break the typing
 *   that `aria-owns` exists to allow, and would take the trigger's own label
 *   away from the screen reader.
 */
export interface SelectOption {
  value: string;
  label: string;
  /**
   * A thumbnail beside the label — an `<Avatar src>` for a product, a glyph for
   * a category. Rendered in the list AND in the trigger once chosen, because a
   * picture that identifies an option must still identify it after you have
   * picked it; showing it only in the list makes it a decoration on a menu.
   *
   * A node rather than a `src`, so the caller decides what a thumbnail IS. Some
   * products have photographs, some have initials, some have a category icon —
   * this component should not have an opinion about which.
   */
  media?: ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  /** The chosen value, or `''` for none. Controlled. */
  value: string;
  onChange: (next: string) => void;
  /** Shown when nothing is chosen. `text/tertiary` at 4.52 — never `text/placeholder`. */
  placeholder?: string;
  /** Wired by `FormRow`, so the `<label for>` points at the trigger. */
  id?: string;
  required?: boolean;
  disabled?: boolean;
  /**
   * Named `error` to match `InputField` and `Textarea`, not `error`. Three
   * controls that sit on the same form row must not need three different words
   * for the same state — the wrong one is a silent no-op, because an unknown
   * prop on a component that spreads nothing simply vanishes.
   */
  error?: boolean;
  /** Only when there is no visible `<label for>` pointing at it. */
  ariaLabel?: string;
  /**
   * Points at the validation message. Declared one at a time rather than
   * spreading `HTMLAttributes`, for the same reason `Text` does: widening it
   * would also admit `style`, and an inline style is a raw value escaping the
   * token layer.
   */
  ariaDescribedBy?: string;
  className?: string;
}

export function Select({
  options, value, onChange, placeholder = 'Select', id,
  required, disabled, error, ariaLabel, ariaDescribedBy, className,
}: SelectProps) {
  const uid = useId();
  const listId = `${uid}-list`;
  const optId = (i: number) => `${uid}-opt-${i}`;

  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  //  What the value was when the panel opened, so Escape can put it back.
  const opened = useRef(value);

  const enabled = options.map((o, i) => ({ o, i })).filter(({ o }) => !o.disabled);
  const chosen = options.findIndex((o) => o.value === value);
  const [active, setActive] = useState(chosen >= 0 ? chosen : (enabled[0]?.i ?? 0));

  //  ── PLACEMENT ──────────────────────────────────────────────────────────────
  //  A layout effect, so the panel never paints at 0,0 for a frame. It matches
  //  the trigger's WIDTH, which a menu does not: a select's options are the
  //  values of the field, and a panel narrower or wider than the field it
  //  belongs to reads as a different control.
  useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    const place = () => {
      const t = btnRef.current?.getBoundingClientRect();
      const h = listRef.current?.offsetHeight ?? 0;
      if (!t) return;
      const below = t.bottom + 4;
      const flip = below + h > window.innerHeight && t.top - 4 - h > 0;
      setPos({ top: flip ? t.top - 4 - h : below, left: t.left, width: t.width });
    };
    place();
    //  `true` for capture, so a scroll in ANY ancestor repositions it — the
    //  create page's body is a scroller and the panel is `fixed`, so without
    //  this the list stays behind while the field moves away underneath it.
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  const close = useCallback((restore = false) => {
    if (restore) onChange(opened.current);
    setOpen(false);
    btnRef.current?.focus();
  }, [onChange]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  //  Keep the active option in view when the arrows walk past the panel's edge.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`#${CSS.escape(optId(active))}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const step = (dir: 1 | -1) => {
    const at = enabled.findIndex(({ i }) => i === active);
    const next = enabled[Math.min(Math.max(at + dir, 0), enabled.length - 1)];
    return next ? next.i : active;
  };

  const commit = (i: number) => {
    const o = options[i];
    if (!o || o.disabled) return;
    onChange(o.value);
    setOpen(false);
    btnRef.current?.focus();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        //  §: ↓/↑ WITHOUT Alt change the value in place, the way a native select
        //  does. With Alt, or on Enter/Space, the panel opens instead.
        if (!e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
          const i = step(e.key === 'ArrowDown' ? 1 : -1);
          setActive(i);
          const o = options[i];
          if (o && !o.disabled) onChange(o.value);
          return;
        }
        opened.current = value;
        setActive(chosen >= 0 ? chosen : (enabled[0]?.i ?? 0));
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActive(step(1)); return;
      case 'ArrowUp': e.preventDefault(); setActive(step(-1)); return;
      case 'Home': e.preventDefault(); setActive(enabled[0]?.i ?? active); return;
      case 'End': e.preventDefault(); setActive(enabled[enabled.length - 1]?.i ?? active); return;
      case 'Enter': case ' ': e.preventDefault(); commit(active); return;
      case 'Tab': setOpen(false); return;
      case 'Escape':
        //  `preventDefault` so an outer Escape handler — the action bar's, the
        //  modal's — does not also fire and close the thing behind this.
        e.preventDefault(); e.stopPropagation(); close(true);
        return;
      default:
    }
  };

  const label = chosen >= 0 ? options[chosen].label : placeholder;
  const media = chosen >= 0 ? options[chosen].media : null;

  return (
    <>
      <button
        ref={btnRef}
        id={id}
        type="button"
        //  `combobox` + `listbox`, not `menu` + `menuitem`: these are the values
        //  of a field, and one of them is currently true.
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? optId(active) : undefined}
        aria-required={required || undefined}
        aria-error={error || undefined}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        disabled={disabled}
        onClick={() => {
          opened.current = value;
          setActive(chosen >= 0 ? chosen : (enabled[0]?.i ?? 0));
          setOpen((o) => !o);
        }}
        onKeyDown={onKeyDown}
        className={cn(
          //  The InputField box, to the class — 34 tall, `space/5` padding,
          //  `radius/md`, and the same ring. A select beside a text field must
          //  be the same box or the row looks assembled from two kits.
          'inline-flex items-center gap-5 h-control px-5 w-full',
          'rounded-md border bg-surface-default transition-colors text-start',
          'focus-visible:outline-2 focus-visible:outline-offset-2',
          disabled
            ? 'bg-surface-disabled border-border-disabled cursor-not-allowed'
            : error
              ? 'border-danger-default focus-visible:outline-danger-default'
              : 'border-border-default hover:border-border-hover focus-visible:outline-focus-ring cursor-pointer',
          className,
        )}
      >
        {media ? <span className="flex-none">{media}</span> : null}
        <span className={cn(
          'min-w-0 flex-1 truncate text-body',
          //  `text/tertiary` (4.52), never `text/placeholder` — that role is
          //  2.85:1, below what 1.4.3 asks of text. zf-input-field.md §4.3 calls
          //  it "a trap".
          disabled ? 'text-text-disabled'
            : chosen >= 0 ? 'text-text-default' : 'text-text-tertiary',
        )}>
          {label}
        </span>
        <Icon name="caret-down" size="md" tone={disabled ? 'disabled' : 'subtle'} />
      </button>

      {open && !disabled ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          //  Focus never leaves the trigger, so the list is not tabbable and the
          //  active option is named by `aria-activedescendant` instead.
          tabIndex={-1}
          className={cn('fixed z-100', MENU_SURFACE)}
          style={{
            top: pos?.top ?? -9999,
            left: pos?.left ?? -9999,
            //  The panel is the FIELD's width. A menu sizes to its content; a
            //  select's options are the field's own values and a panel that does
            //  not match it reads as a different control.
            width: pos?.width,
          }}
        >
          {options.map((o, i) => {
            const isActive = i === active;
            const isChosen = i === chosen;
            return (
              <li
                key={o.value}
                id={optId(i)}
                role="option"
                aria-selected={isChosen}
                aria-disabled={o.disabled || undefined}
                onPointerEnter={() => !o.disabled && setActive(i)}
                onClick={() => commit(i)}
                className={cn(
                  'flex items-center gap-4 h-16 px-6 rounded-md cursor-pointer',
                  'text-body',
                  //  ONE branch. Two fills or two colours on one element are
                  //  settled by the stylesheet's emission order.
                  o.disabled ? 'bg-transparent text-text-disabled cursor-default'
                    : isActive ? 'bg-surface-hover text-primary-text'
                      : 'bg-transparent text-text-default',
                )}
              >
                {o.media ? <span className="flex-none">{o.media}</span> : null}
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {/* The CHOSEN value is a glyph, not a fill — the fill is already
                    saying which option the keyboard is on, and one treatment
                    cannot carry two facts. `xs` for the same reason Menu uses
                    it: the tick is the one solid mark in a set of outlines. */}
                {isChosen ? <Icon name="check" size="xs" tone="primary" /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </>
  );
}
