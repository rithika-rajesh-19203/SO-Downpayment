import type { ReactNode } from 'react';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * STATUS BADGE — md §2.1. Non-interactive, read-only. Reports state; never
 * changes it.
 *
 * ── ONE AXIS, ONE DIMENSION ──────────────────────────────────────────────────
 * Two axes, and they pass all four tests. `status` and `emphasis` can both be
 * true at once (test 1). `emphasis` changes what the badge is DOING — shouting
 * or reporting — not what it contains (test 2). No value is two values spliced
 * (test 3). Neither makes the other irrelevant (test 4). And both render the
 * same HTML, so they are one component (the sharpest test).
 *
 * 14 x 2 = 28, which is the complete matrix §2.1.4 specifies. No gaps.
 *
 * ── THE STATES ARE SLUGS, NOT BUSINESS NAMES ─────────────────────────────────
 * §2.1.6 collapses synonyms: `Submitted / open / sent` is `submitted`, not
 * `submitted-open-sent`. Those are alternate names different modules use for
 * one state, so they share one token pair. §2.1.8: "Keep one state name per
 * meaning across the whole product."
 *
 * `unclassified` is §2.1.6's `ageneratedPurple` — a Figma placeholder that is
 * not a business state and would otherwise ship (issue 1, High). It carries a
 * full verified colour pair, so it exists, but under a name that reads as
 * unfinished rather than as a typo. Do not use it for a real status.
 */
const STATUS_CLASSES = {
  success: ['bg-badge-success-surface text-badge-success-text', 'bg-badge-success-solid-surface text-badge-success-solid-text'],
  accepted: ['bg-badge-accepted-surface text-badge-accepted-text', 'bg-badge-accepted-solid-surface text-badge-accepted-solid-text'],
  approved: ['bg-badge-approved-surface text-badge-approved-text', 'bg-badge-approved-solid-surface text-badge-approved-solid-text'],
  submitted: ['bg-badge-submitted-surface text-badge-submitted-text', 'bg-badge-submitted-solid-surface text-badge-submitted-solid-text'],
  'in-progress': ['bg-badge-in-progress-surface text-badge-in-progress-text', 'bg-badge-in-progress-solid-surface text-badge-in-progress-solid-text'],
  pending: ['bg-badge-pending-surface text-badge-pending-text', 'bg-badge-pending-solid-surface text-badge-pending-solid-text'],
  overdue: ['bg-badge-overdue-surface text-badge-overdue-text', 'bg-badge-overdue-solid-surface text-badge-overdue-solid-text'],
  cancelled: ['bg-badge-cancelled-surface text-badge-cancelled-text', 'bg-badge-cancelled-solid-surface text-badge-cancelled-solid-text'],
  failed: ['bg-badge-failed-surface text-badge-failed-text', 'bg-badge-failed-solid-surface text-badge-failed-solid-text'],
  draft: ['bg-badge-draft-surface text-badge-draft-text', 'bg-badge-draft-solid-surface text-badge-draft-solid-text'],
  void: ['bg-badge-void-surface text-badge-void-text', 'bg-badge-void-solid-surface text-badge-void-solid-text'],
  inactive: ['bg-badge-inactive-surface text-badge-inactive-text', 'bg-badge-inactive-solid-surface text-badge-inactive-solid-text'],
  expired: ['bg-badge-expired-surface text-badge-expired-text', 'bg-badge-expired-solid-surface text-badge-expired-solid-text'],
  unclassified: ['bg-badge-unclassified-surface text-badge-unclassified-text', 'bg-badge-unclassified-solid-surface text-badge-unclassified-solid-text'],
} as const;

export type StatusBadgeStatus = keyof typeof STATUS_CLASSES;
export type StatusBadgeEmphasis = 'default' | 'solid';

/**
 * The six meaning families of §2.1.7. Exported because a legend, a filter list
 * or a status key needs to group them, and because the ordering inside each
 * family is deliberate — §2.1.7: "Progression within a family encodes finality."
 */
export const STATUS_FAMILIES: Array<{ family: string; states: StatusBadgeStatus[] }> = [
  { family: 'Positive / terminal-good', states: ['success', 'accepted', 'approved'] },
  { family: 'Active / in-flight', states: ['submitted', 'in-progress'] },
  { family: 'Attention', states: ['pending', 'overdue'] },
  { family: 'Negative / terminal-bad', states: ['cancelled', 'failed'] },
  { family: 'Neutral / dormant', states: ['draft', 'void', 'inactive', 'expired'] },
  { family: 'Unclassified', states: ['unclassified'] },
];

export const STATUS_BADGE_STATUSES = Object.keys(STATUS_CLASSES) as StatusBadgeStatus[];

export interface StatusBadgeProps {
  /** Which state the record is in. 14 values, synonyms already collapsed. */
  status: StatusBadgeStatus;
  /**
   * `default` is a tinted fill with a dark label — low weight, for tables and
   * lists. `solid` is saturated with a white label — for a single status that
   * must read at a glance. §2.1.8: many solid badges in one view compete with
   * each other and with the page's actual primary action.
   */
  emphasis?: StatusBadgeEmphasis;
  /** The visible label, and the only thing carrying the meaning. */
  children: ReactNode;
  className?: string;
}

/**
 * §2.1.9 — non-interactive: no tabindex, no handlers, no role. The visible
 * label is sufficient for a screen reader, so there is no hidden text either;
 * where the context does not make clear what the badge describes, §2.1.9 says
 * to associate it with its record rather than labelling the badge.
 *
 * Geometry, all from §2.1.2:
 *   height 22px fixed        `h-badge`      — a named token, off the 2px scale
 *   max-width 200px          `max-w-badge-max` — the truncation ceiling
 *   padding 6px horizontal   `px-3`         — step 3 = 6px
 *   radius 4px               `rounded-sm`
 *   1px inside border        `border` + `border-surface-default`
 *
 * THE BORDER IS A ROLE, NOT WHITE. §2.1.2 specifies `1px solid #FFFFFF`, and
 * gives the reason: it lets adjacent badges in a dense row read as separate
 * objects without a gap. On a white surface it is invisible; on a tinted row it
 * does the work. A literal white does that in Light and draws a bright hairline
 * around every badge in Dark, so it is bound to `surface/default` — the role
 * that IS white in Light and near-black in Dark. Same intent, both panes.
 *
 * TYPE IS `body-sm` + `medium`, NOT §2.1.3's 12 / 19.2 / +0.2px. §1.4 retired
 * the 0.2px tracking (§1.4.5, mixed tracking units) and 19.2 is not on the
 * scale. The badge predates the scale; applying it is the point of having one.
 * At a fixed 22px height the line-height is moot anyway — 16 + 2 + 2 fits.
 * Flagged in docs/BACKLOG.md.
 */
export function StatusBadge({
  status, emphasis = 'default', children, className,
}: StatusBadgeProps) {
  const [tint, solid] = STATUS_CLASSES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center shrink-0',
        'h-badge max-w-badge-max px-3 rounded-sm',
        'border border-surface-default',
        emphasis === 'solid' ? solid : tint,
        className,
      )}
    >
      <Text size="body-sm" weight="medium" as="span" tone="inherit" truncate>
        {children}
      </Text>
    </span>
  );
}
