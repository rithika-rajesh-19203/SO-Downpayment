import { Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * AVATAR — `zf-design-cannon.md` §2.22. A tinted circle carrying an initial, or
 * a photo, at four sizes.
 *
 * ── ONE AXIS, NOT THREE ──────────────────────────────────────────────────────
 * §2.22.1 is the sharpest modelling finding in the whole source. It declared
 * `Size`(4) × `Color`(7) × `is_image`(2) = **56 combinations, and 28 existed**.
 * The other 28 are not missing work, they are impossible: a tint with a photo
 * over it is not a thing, and `Color = None` is not a colour — it is a flag
 * saying *ignore the colour*.
 *
 * **`Color = None` and `is_image = yes` are the same statement made twice**, and
 * the moment a value on one axis means "ignore the other axis", the two are one
 * axis. The failure is quiet: ask Figma for `Large / Red / image` and it does not
 * error, it picks something.
 *
 * So `fill` is one question with seven answers — six tints or a photo — and
 * `size` × `fill` is exactly 28 with no undefined cell. It stays ONE component
 * even though `image` changes the markup, because the frame, the radius, the
 * ring and the badge are identical and only the fill area differs.
 *
 * ── THE TINT IS DERIVED, NOT CHOSEN ──────────────────────────────────────────
 * §2.22.8: *"Tint selection belongs to code, not to the designer: derive it from
 * a hash of the person's name so the same person is the same colour everywhere.
 * A tint picked by hand per instance means the same face changes colour between
 * two screens."* That is what `fill` defaulting to `undefined` does here.
 *
 * 1.4.1 depends on it: the tint carries **identity, not status**, and it must
 * never be read as state. That is only true while it comes from the name.
 *
 * ── WHAT ELSE §2.22 FOUND ────────────────────────────────────────────────────
 * **Two ways of writing "circle".** `cornerRadius` was 999 on three sizes and 50
 * on the fourth, and neither is half the width — both render as a circle at the
 * size they were drawn and neither survives a resize. `radius/full` here.
 *
 * **Type that stops scaling halfway.** 12 · 16 · 16 · 36 across 24 · 40 · 60 ·
 * 100 — identical at 40 and 60, so a 60px avatar carried a 40px avatar's
 * initial. As a share of the diameter: 50% → 40% → 27% → 36%, with no rule
 * behind any of it. It is **40% of the diameter at every size** now.
 *
 * **A boolean that worked on one size in four.** `is_super_admin` was declared on
 * the set and drawn only at Medium, where it was 20 × 20 — *half the avatar*. A
 * boolean that silently no-ops is worse than a missing one: the panel says the
 * option is there, the toggle moves, and nothing happens on three sizes in four.
 *
 * **The one bound paint pointed somewhere else.** The admin badge was the only
 * bound paint in the set and it pointed at the legacy library's `Orange/1100`,
 * which puts white at **3.99:1** — a 1.4.11 fail. `avatar/admin` is 6.07:1.
 */

const sizeMap = {
  sm: 'size-avatar-sm',   // 24
  md: 'size-avatar-md',   // 40
  lg: 'size-avatar-lg',   // 60
  xl: 'size-avatar-xl',   // 100
} as const;

/**
 * 40% of the diameter — 9.6 · 16 · 24 · 40, taken to the nearest scale step.
 * All four sizes are exact; the line-heights are not, and cannot be: rule 9
 * allows one line-height per size, and 16/20, 24/30 and 40/50 would each be a
 * second one. It does not matter here — a single centred glyph in a fixed circle
 * is positioned by `place-items-center`, not by its leading.
 */
const typeMap = {
  sm: 'caption',    // 10 — §2.22.5 says 10/12, and `caption` IS 10/12
  md: 'subheading', // 16
  lg: 'title-lg',   // 24
  xl: 'display',    // 40
} as const;

const badgeMap = {
  sm: 'size-avatar-badge-sm', // 8 — a dot, no glyph
  md: 'size-avatar-badge-md', // 14
  lg: 'size-avatar-badge-lg', // 20
  xl: 'size-avatar-badge-xl', // 32
} as const;

/** Ring weights 1 · 1.5 · 2 · 3. 1.5 is not a border width Tailwind has, so the
 *  ring is an `outline` — which also keeps it OUTSIDE the box, so a ringed and
 *  an unringed avatar are the same diameter. §2.22.5 pins it `STRETCH`. */
const ringMap = {
  sm: 'outline-1', md: 'outline-2', lg: 'outline-2', xl: 'outline-4',
} as const;

/**
 * The six identity tints, each a bound surface/text PAIR. §2.22.4: the surfaces
 * were already palette values in all but name — every one inside ΔE 2.9 — and
 * the text tones drift much further because they were custom mixes rather than
 * steps (purple's `#633C76` is 16.44 from the nearest purple).
 *
 * Light 5.47 → 10.56, Dark 9.40 → 12.60. The lowest is orange.
 */
const fillMap = {
  green: 'bg-avatar-green-surface text-avatar-green-text',    // 6.96 / 11.63
  cyan: 'bg-avatar-cyan-surface text-avatar-cyan-text',       // 7.90 / 12.60
  blue: 'bg-avatar-blue-surface text-avatar-blue-text',       // 8.35 / 11.48
  orange: 'bg-avatar-orange-surface text-avatar-orange-text', // 5.47 / 11.60
  red: 'bg-avatar-red-surface text-avatar-red-text',          // 8.38 / 9.40
  purple: 'bg-avatar-purple-surface text-avatar-purple-text', // 10.56 / 11.45
} as const;

export type AvatarSize = keyof typeof sizeMap;
export type AvatarTint = keyof typeof fillMap;

const TINTS = Object.keys(fillMap) as AvatarTint[];

/**
 * §2.22.8's hash. Deterministic and stable across renders, sessions and screens,
 * which is the whole requirement — the same person must be the same colour
 * everywhere. FNV-1a over the name's code points; any stable hash would do.
 */
export function avatarTint(name: string): AvatarTint {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i += 1) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return TINTS[h % TINTS.length];
}

export interface AvatarProps {
  /**
   * REQUIRED, and it is the accessible name. §2.22.9: *"the initial is not a
   * name — 'A' is not an accessible name"*. It is also what the tint is derived
   * from, so passing it is not optional in either direction.
   */
  name: string;
  /**
   * What shows in the circle. Defaults to the name's first letter, which is what
   * the reference draws. §2.22.7 notes two is a common variant, so the box does
   * not clip — pass `"DT"` and it fits.
   */
  initials?: string;
  /** 24 · 40 · 60 · 100. */
  size?: AvatarSize;
  /**
   * A photo. Replaces the initial and drops the tint — the `image` value of
   * §2.22.1's single `Fill` axis, expressed as the presence of a source rather
   * than as a seventh enum value that then needs a URL from somewhere else.
   */
  src?: string;
  /**
   * Overrides the derived tint. Use it only where the colour is not identity —
   * a legend, a picker, this component's own stories. Setting it per instance in
   * a product is the thing §2.22.8 warns about.
   */
  tint?: AvatarTint;
  /** §2.22.3 — works at all four sizes, unlike the source's. */
  admin?: boolean;
  /**
   * The cut-out that separates stacked avatars, bound to `surface/default` so it
   * is a hole in whatever is behind rather than a white line on a dark page.
   *
   * **Default `false`, where §2.22.7 defaults it true.** The ring exists to
   * separate one avatar from the one it overlaps; a lone avatar in a table cell
   * has nothing to separate from, and on a hovered row a `surface/default` ring
   * reads as a white halo. It belongs to `zf-avatar-group`, which is not built.
   */
  ring?: boolean;
  className?: string;
}

export function Avatar({
  name, initials, size = 'sm', src, tint, admin, ring, className,
}: AvatarProps) {
  const resolved = tint ?? avatarTint(name);
  const glyph = initials ?? Array.from(name.trim())[0]?.toUpperCase() ?? '?';

  return (
    <span
      //  Not `aria-hidden`, and not `role="img"` either: this is a name in a
      //  circle. §2.22.9 grades "the initial is not a name" REVIEW; the title
      //  and the visually-hidden text are the fix. Where a visible name sits
      //  beside it — a table cell, a comment header — the caller passes the same
      //  string to both and a screen reader hears it twice, which is the lesser
      //  of the two failures.
      title={name}
      className={cn(
        'relative inline-grid place-items-center flex-none align-middle',
        sizeMap[size],
        //  §2.22.2 — size/2 at every size, expressed as `radius/full` so it
        //  survives a resize. The source wrote 999 three times and 50 once.
        'rounded-full overflow-hidden',
        src ? 'bg-surface-sunken' : fillMap[resolved],
        ring && cn('outline-surface-default -outline-offset-1', ringMap[size]),
        className,
      )}
    >
      {src ? (
        //  1.1.1 — decorative, because `title` above already carries the name.
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <Text as="span" size={typeMap[size]} weight="medium" tone="inherit"
          //  `aria-hidden`: "DT" announces as two letters. The name is on the
          //  wrapper's `title` and in the span below.
          className="leading-none" >
          <span aria-hidden>{glyph}</span>
        </Text>
      )}
      <span className="sr-only">{name}</span>

      {admin ? (
        <span className={cn(
          'absolute end-0 bottom-0 grid place-items-center rounded-full',
          //  §2.22.3 — a third of the diameter, not the source's half, and drawn
          //  at all four sizes rather than only at Medium.
          badgeMap[size],
          //  White on `avatar/admin` is 6.07:1. On the source's bound
          //  `Orange/1100` it was 3.99 — a 1.4.11 fail, and the only bound paint
          //  in the entire set.
          'bg-avatar-admin text-avatar-admin-glyph',
          'outline-2 outline-surface-default',
        )}>
          {/* §2.22.3 — at 24 the badge is an 8px dot with NO glyph. A crown
              drawn at 5px is a smudge, so the mark is dropped and the colour
              carries it. A deliberate stop, not an omission. Our roster has no
              crown either, which makes the stop the only honest option at every
              size until one is exported. */}
          <span className="sr-only">Administrator</span>
        </span>
      ) : null}
    </span>
  );
}
