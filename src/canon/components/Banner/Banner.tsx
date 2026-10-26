import type { ReactNode } from 'react';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import { Text } from '../../primitives/Text';
import { cn } from '../../utils/cn';

/**
 * BANNER — one line saying what just happened, at the top of the thing it
 * happened to.
 *
 * ── EVERY TONE GETS ITS OWN SHAPE, NOT JUST ITS OWN COLOUR ──────────────────
 * `zf-design-cannon.md` §2.13.2's rule, and it is 1.4.1: a banner distinguished
 * only by being red is a banner a colour-blind user cannot tell from the green
 * one. So `danger` is a filled circle, `warning` a triangle, `success` a tick
 * and `info` an `i` — four silhouettes, readable with the colour removed.
 *
 * ── AND `alert` IS NOT A DECORATION ─────────────────────────────────────────
 * `role="alert"` for `danger` and `warning`, `role="status"` otherwise. The
 * first is assertive and interrupts; the second waits its turn. A failed submit
 * has to interrupt — the user has already pressed the button and is looking
 * somewhere else — and a success note must not, because it would cut across
 * whatever they moved on to.
 *
 * The role is on a node that is **always mounted** where the caller keeps one,
 * or announced on mount where they do not. Both work; what does not work is
 * mounting the role and its text in the same tick and expecting a re-read.
 */
export interface BannerProps {
  tone?: 'danger' | 'warning' | 'success' | 'info';
  children: ReactNode;
  /** Renders the ✕. Omit for a banner the user cannot get rid of. */
  onDismiss?: () => void;
  className?: string;
}

//  §2.13.2 — a distinct SHAPE per tone, so the meaning survives without colour.
const GLYPH: Record<NonNullable<BannerProps['tone']>, IconName> = {
  danger: 'alert-circle',
  warning: 'alert-triangle',
  success: 'check-circle',
  info: 'info',
};

//  One branch per tone, resolved here. Two fills or two colours on one element
//  are settled by the stylesheet's emission order, not the className's.
const TONE = {
  danger: 'bg-danger-subtle border-danger-border text-danger-text',
  warning: 'bg-warning-subtle border-warning-border text-warning-text',
  success: 'bg-success-subtle border-success-border text-success-text',
  info: 'bg-info-subtle border-info-border text-info-text',
} as const;

export function Banner({ tone = 'info', children, onDismiss, className }: BannerProps) {
  return (
    <div
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      className={cn(
        'flex items-center gap-4 w-full box-border',
        'px-5 py-4 rounded-md border',
        TONE[tone],
        className,
      )}
    >
      {/* `tone="inherit"`, so the glyph is exactly the text's colour — the
          contrast is then one number to check rather than two, and every
          {family}/text on its own {family}/subtle is past 6:1. */}
      <Icon name={GLYPH[tone]} size="md" tone="inherit" className="flex-none" />

      <Text as="span" size="body-sm" tone="inherit" className="min-w-0 flex-1">
        {children}
      </Text>

      {onDismiss ? (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className={cn(
            //  24, not 16: the glyph is 16 and 2.5.8 asks for 24.
            'grid place-items-center size-12 flex-none p-0 rounded-sm',
            'border-0 bg-transparent cursor-pointer text-current',
            'hover:bg-surface-hover',
            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
          )}
        >
          <Icon name="close" size="sm" tone="inherit" />
        </button>
      ) : null}
    </div>
  );
}
