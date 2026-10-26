import type { ElementType, ReactNode } from 'react';
import { cn } from '../utils/cn';

/**
 * THE TYPE SCALE — 9 sizes, and the line-height is part of the size.
 * Source: design-refs/zf-scales.md.
 *
 * Chosen from 1,306 measured text nodes so the largest number did not have to
 * move: 13/20 alone covers 682 of them. The rule the scale enforces is ONE
 * LINE-HEIGHT PER SIZE AND CASE — 13px previously carried five (20, 20.8, AUTO,
 * 21, 16), and 20.8 is ambiguous by construction because it is both 13 x 1.6
 * and 16 x 1.3.
 *
 * `overline` is the one entry that is a size AND a case: 11 / 17.6 UPPER. It is
 * listed with the sizes because it is chosen the same way, but it fixes its own
 * weight — see `defaultWeight`.
 */
const sizeMap = {
  display: 'text-display',
  'title-lg': 'text-title-lg',
  title: 'text-title',
  heading: 'text-heading',
  subheading: 'text-subheading',
  'body-lg': 'text-body-lg',
  body: 'text-body',
  'body-sm': 'text-body-sm',
  label: 'text-label',
  caption: 'text-caption',
  overline: 'text-overline uppercase',
} as const;

/**
 * WEIGHT IS ITS OWN AXIS — 4 values, and every size exists in every weight.
 * 9 x 4 = 36 styles, composed from two classes rather than enumerated.
 *
 * The previous version of this component had 13 fused roles, where `body`,
 * `body-strong` and `body-emphasis` were three names for 13/20 at three
 * weights. That is one axis carrying two dimensions — the single most frequent
 * modelling error the design source records, flagged in §2.7.2, §2.8.2, §2.9.5,
 * §2.10.1 and §2.11.2 — and it fails the first test for a variant axis: `body`
 * and `medium` can both be true at once, so they are two axes.
 *
 * It also could not express 30 of the 36 styles. `heading` at `bold` had no
 * name at all.
 */
const weightMap = {
  regular: 'font-regular',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

/**
 * TONE is a third axis, also deliberately separate.
 *
 * Size and emphasis are not the same question as hierarchy or status: a `body`
 * may be default, secondary or danger, and a `label` may be any of them too.
 *
 * `default -> secondary -> tertiary` is a contrast ladder; the decreasing
 * contrast IS the hierarchy. `placeholder` and `disabled` sit outside it
 * because they encode state, not emphasis. Colour md §1.2.
 */
const toneMap = {
  /**
   * Take the colour of whatever contains you. The right default whenever the
   * text IS the thing rather than sitting inside it — a status badge's label is
   * the badge, so the badge's token pair colours both halves and the label must
   * not re-declare it. Icon makes `inherit` its default for the same reason
   * (colour md §2.7.6 found 108 orphan paints from icons carrying their own).
   */
  inherit: 'text-inherit',
  default: 'text-text-default', // 15.15:1
  secondary: 'text-text-secondary', // 6.79:1
  tertiary: 'text-text-tertiary', // 4.52:1 — the last passing step
  placeholder: 'text-text-placeholder',
  disabled: 'text-text-disabled', // exempt under 1.4.3
  inverse: 'text-text-inverse',
  /** Links. NOT `primary/default`, which is 4.32:1 and fails at 13px. */
  link: 'text-primary-text', // 5.92:1
  success: 'text-success-text', // 8.06:1
  warning: 'text-warning-text',
  danger: 'text-danger-text', // 7.04:1
  info: 'text-info-text',
} as const;

export type TextSize = keyof typeof sizeMap;
export type TextWeight = keyof typeof weightMap;
export type TextTone = keyof typeof toneMap;

/**
 * The weight a size takes when none is asked for. Every value here is the
 * weight the design source states for that size — not a house preference — so
 * omitting `weight` reproduces the drawing, and passing it reaches the other 27
 * styles. `overline` is Semi Bold as part of the style itself.
 */
const defaultWeight: Record<TextSize, TextWeight> = {
  display: 'semibold',
  'title-lg': 'semibold',
  title: 'semibold',
  heading: 'semibold',
  subheading: 'semibold',
  'body-lg': 'regular',
  body: 'regular',
  'body-sm': 'regular',
  label: 'medium',
  caption: 'regular',
  overline: 'semibold',
};

/** Sensible semantic element per size; override with `as`. */
const defaultTag: Record<TextSize, ElementType> = {
  display: 'h1',
  'title-lg': 'h1',
  title: 'h1',
  heading: 'h2',
  subheading: 'h3',
  'body-lg': 'p',
  body: 'p',
  'body-sm': 'p',
  label: 'span',
  caption: 'span',
  overline: 'span',
};

export interface TextProps {
  /** Size and line-height, from the 9-size scale. The two are one choice. */
  size?: TextSize;
  /** Weight. Independent of `size` — every size exists in every weight. */
  weight?: TextWeight;
  /** Colour role. Independent of both — see the note above. */
  tone?: TextTone;
  /** Swap the rendered element without changing the look. */
  as?: ElementType;
  /** Single line with an ellipsis — the common case in table cells. */
  truncate?: boolean;
  children?: ReactNode;
  className?: string;
  /**
   * Needed for `aria-describedby`. zf-radio.md §8: a red border alone does not
   * satisfy 1.4.1, so an error message is mandatory — and a message the control
   * does not point at is not associated with it. The id is that pointer.
   */
  id?: string;
  /**
   * ARIA role. zf-checkbox.md §9.5 puts `role="alert"` on a validation message so
   * it is announced when it appears rather than only when focus reaches it.
   *
   * `id` and `role` are declared one at a time on purpose. Widening this to
   * `HTMLAttributes` would also admit `style`, and an inline style is a raw value
   * escaping the token layer — the one thing rule 1 exists to stop.
   */
  role?: string;
  title?: string;
  href?: string;
  onClick?: () => void;
}

/**
 * All text. A screen picks a size, a weight and a tone, and never a font size
 * or a hex. Retuning the scale happens in tokens/scale.css and here — nowhere
 * else.
 */
export function Text({
  size = 'body', weight, tone = 'default', as, truncate, children, className, ...rest
}: TextProps) {
  const Tag = (as ?? defaultTag[size]) as ElementType;
  return (
    <Tag
      className={cn(
        sizeMap[size],
        weightMap[weight ?? defaultWeight[size]],
        toneMap[tone],
        truncate && 'truncate',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
