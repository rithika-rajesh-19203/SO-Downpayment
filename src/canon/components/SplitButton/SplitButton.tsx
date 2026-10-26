import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import type { IconName } from '../../icons';
import { Menu } from '../Menu/Menu';
import type { MenuEntry } from '../Menu/Menu';
import { cn } from '../../utils/cn';

/**
 * SPLIT BUTTON — one default action, and a menu of its variants.
 *
 * CLAUDE.md has listed this as queued since the button family was built; the
 * product table's `Add New Row` is what finally needed it.
 *
 * ── IT IS TWO BUTTONS, AND THAT IS THE POINT ────────────────────────────────
 * Not one button with a caret. The halves do different things — the leading one
 * commits, the trailing one opens — so they are two controls, two tab stops and
 * two accessible names. A single button carrying both would have to guess from
 * the pointer's x which the user meant.
 *
 * **The trailing half needs its own name.** "Add New Row" is already spoken by
 * the half beside it, and two adjacent controls with the same accessible name is
 * a 4.1.2 defect — the same one the action bar's caret had. So it is
 * "More Add New Row actions", built from the label rather than hardcoded.
 *
 * ── THE SEAM ────────────────────────────────────────────────────────────────
 * `join` squares off exactly the corners that touch, and `-ms-px` pulls the
 * trailing half over the leading one's border so the pair shares a single
 * hairline rather than stacking two. `hover:z-1` lets whichever half is live
 * draw its border OVER its neighbour instead of under it — without it the seam
 * flickers between two greys as the pointer crosses.
 *
 * ── WHAT IT DOES NOT DO ─────────────────────────────────────────────────────
 * No `emphasis="primary"` default. `zf-product-table.md` §13 asks for Secondary
 * and every split button in the reference is secondary — a split PRIMARY button
 * puts two competing commitments in one control. Available, not the default.
 */
export interface SplitButtonProps {
  /** The default action's label. Also names the trailing half. */
  children: ReactNode;
  onSelect: () => void;
  /** The menu the caret opens. */
  entries: MenuEntry[];
  /** §21.3's leading-icon slot. */
  icon?: IconName;
  emphasis?: 'primary' | 'secondary';
  size?: 'lg' | 'md' | 'sm';
  disabled?: boolean;
  className?: string;
}

export function SplitButton({
  children, onSelect, entries, icon, emphasis = 'secondary',
  size = 'lg', disabled, className,
}: SplitButtonProps) {
  const caretRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const name = typeof children === 'string' ? children : 'actions';

  return (
    <div className={cn('inline-flex items-center', className)}>
      <Button
        emphasis={emphasis}
        size={size}
        icon={icon}
        join="start"
        disabled={disabled}
        onClick={onSelect}
      >
        {children}
      </Button>

      <Button
        ref={caretRef}
        emphasis={emphasis}
        size={size}
        join="end"
        icon="caret-down"
        //  Its own name — see above. Built from the label so it cannot drift.
        label={`More ${name} actions`}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        //  One shared hairline, and the live half draws over its neighbour.
        className="-ms-px hover:z-1 focus-visible:z-1"
      />

      <Menu
        anchor={caretRef.current}
        open={open}
        onClose={() => setOpen(false)}
        label={`More ${name} actions`}
        //  The trigger is at the START of its row here, so the default
        //  right-edge alignment would throw the panel back across the button.
        align="start"
        entries={entries}
      />
    </div>
  );
}
