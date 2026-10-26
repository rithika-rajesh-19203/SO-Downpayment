import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, avatarTint } from './Avatar';
import { Inline, Stack, Text } from '../../primitives';

/**
 * §2.22 — and its §2.22.1 is the sharpest modelling finding in the source.
 *
 * The set declared `Size`(4) × `Color`(7) × `is_image`(2) = **56 combinations,
 * and 28 existed**. The other 28 are not missing work, they are impossible: a
 * tint with a photo over it is not a thing, and `Color = None` is not a colour,
 * it is a flag saying *ignore the colour*. **`Color = None` and `is_image = yes`
 * are the same statement made twice** — and the moment a value on one axis means
 * "ignore the other axis", the two are one axis.
 *
 * The failure is quiet, which is what makes it worth recording: ask Figma for
 * `Large / Red / image` and it does not error, it picks something.
 */
const meta = {
  title: 'Components/Avatar', component: Avatar,
  parameters: { layout: 'padded' },
  args: { name: 'Paityn Press' },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

const PEOPLE = [
  'Dulce Torff', 'Emerson Gouse', 'Paityn Press', 'Tiana Levin',
  'Alfonso Calzoni', 'Jaydon Bator', 'Ryan Westervelt', 'Livia Gouse',
];

/**
 * **THE TINT IS DERIVED FROM THE NAME, and that is a requirement rather than a
 * convenience.**
 *
 * §2.22.8: *"Tint selection belongs to code, not to the designer: derive it from
 * a hash of the person's name so the same person is the same colour everywhere.
 * A tint picked by hand per instance means the same face changes colour between
 * two screens."*
 *
 * 1.4.1 rests on it. The tint carries **identity, not status**, and it must
 * never be read as state — which is only true while nobody is choosing it.
 *
 * **Paityn Press appears three times in the reference table and is the same
 * green in all three.** That is the whole test.
 */
export const Identity: Story = {
  render: () => (
    <Stack gap={6}>
      <Inline gap={4} wrap>
        {PEOPLE.map((p) => <Avatar key={p} name={p} size="md" />)}
      </Inline>
      <Text size="body-sm" tone="secondary">
        {PEOPLE.map((p) => `${p} → ${avatarTint(p)}`).join(' · ')}
      </Text>
    </Stack>
  ),
};

/**
 * **FOUR SIZES, and almost nothing about them scaled in the source.**
 *
 * **Two ways of writing "circle".** `cornerRadius` was **999** on three sizes and
 * **50** on the fourth — and neither is half the width. Both render as a circle
 * at the size they were drawn; neither survives a resize. It is `radius/full`
 * here, which is size/2 by construction.
 *
 * **Type that stops scaling halfway.** 12 · 16 · 16 · 36 across 24 · 40 · 60 ·
 * 100 — *identical at 40 and 60*, so a 60px avatar carried a 40px avatar's
 * initial. As a share of the diameter that is 50% → 40% → 27% → 36%, with no
 * rule behind any of it. Now **40% at every size**: 10 · 16 · 24 · 40, and all
 * four are exact steps on the type scale.
 *
 * **Three line-height treatments across four sizes** — 12, 20.8, 20.8 and AUTO,
 * with 20.8 the 130% artefact this file meets in §2.5 and §2.9 too. Irrelevant
 * here: a single centred glyph is placed by `place-items-center`, not by its
 * leading, which is also why rule 9's one-line-height-per-size holds.
 */
export const Sizes: Story = {
  render: () => (
    <Inline gap={8} align="center">
      {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Stack key={s} gap={3} align="center">
          <Avatar name="Paityn Press" size={s} />
          <Text size="caption" tone="secondary">{s}</Text>
        </Stack>
      ))}
    </Inline>
  ),
};

/**
 * **THE SIX TINTS.** §2.22.4: every surface is inside **ΔE 2.9** of a palette
 * step — the backgrounds were already palette values in all but name; nobody
 * bound them, but somebody picked them from the same place. The text tones drift
 * much further because they are custom mixes rather than steps: purple's
 * `#633C76` is **16.44** away, orange's `#90340D` is 11.49.
 *
 * All six clear 4.5:1 in both panes. Light runs 5.47 → 10.56, Dark 9.40 → 12.60,
 * and **the lowest is orange**. Dark did not exist in the source at all.
 *
 * `tint` overrides the hash, and this story is one of the few honest uses: a
 * legend, a picker, or a component's own documentation. Setting it per instance
 * in a product is exactly what §2.22.8 warns about.
 */
export const Tints: Story = {
  render: () => (
    <Stack gap={0}>
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} data-theme={theme} className="bg-surface-default p-10">
          <Inline gap={4}>
            {(['green', 'cyan', 'blue', 'orange', 'red', 'purple'] as const).map((t) => (
              <Avatar key={t} name={t.toUpperCase()} tint={t} size="md" />
            ))}
          </Inline>
        </div>
      ))}
    </Stack>
  ),
};

/**
 * **THE ADMIN BADGE — a boolean that worked on one size in four.**
 *
 * §2.22.3: `is_super_admin` was declared on the set and **drawn only at
 * Medium**, where it was 20 × 20 — *half the avatar*. On the other three sizes
 * the properties panel offered it, the toggle moved, and nothing happened.
 *
 * *"A boolean that silently no-ops is worse than a missing one."* A missing
 * property gets noticed the first time someone looks for it; this one gets
 * noticed in QA.
 *
 * It is drawn at all four sizes here and scaled to **a third** of the avatar
 * rather than a half. **At 24 it is an 8px dot with no glyph** — a crown drawn at
 * 5px is a smudge, so the mark is dropped and the colour carries it. That is a
 * deliberate stop, not an omission, and it currently applies at every size:
 * there is no crown in the 51-glyph roster to draw.
 *
 * The colour is the one thing in the set that was bound, and it pointed at the
 * legacy library's `Orange/1100` — white on it is **3.99:1**, a 1.4.11 fail. On
 * `avatar/admin` it is **6.07:1**.
 */
export const Admin: Story = {
  render: () => (
    <Inline gap={8} align="center">
      {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Avatar key={s} name="Anika Mango" size={s} admin />
      ))}
    </Inline>
  ),
};

/**
 * **A PHOTO, and a ring.**
 *
 * `src` is §2.22.1's `image` value of the single `Fill` axis, expressed as the
 * presence of a source rather than as a seventh enum value that then needs a URL
 * from somewhere else. It replaces the initial and drops the tint.
 *
 * The **ring** is bound to `surface/default`, not to white — a cut-out against
 * whatever the avatar sits on rather than a white line drawn on a dark page, the
 * same reasoning as the segmented control's separator in §2.10. It is an
 * `outline` rather than a border for two reasons: 1.5px is not a border width
 * Tailwind has, and an outline sits outside the box, so a ringed and an unringed
 * avatar are the same diameter.
 *
 * **It defaults to `false` here where §2.22.7 defaults it true.** The ring exists
 * to separate one avatar from the one it overlaps; a lone avatar in a table cell
 * has nothing to separate from, and on a hovered row a `surface/default` ring
 * reads as a white halo. It belongs to `zf-avatar-group`, which is not built.
 */
export const PhotoAndRing: Story = {
  render: () => (
    <Stack gap={8}>
      <Inline gap={4} align="center">
        <Avatar name="Kianna Dorwart" size="md" ring />
        <Avatar name="Kianna Dorwart" size="md" />
        <Text tone="secondary">ringed · plain</Text>
      </Inline>
      <Inline gap={4} align="center">
        {(['sm', 'md', 'lg'] as const).map((s) => (
          <Avatar key={s} name="Chance Kenter" size={s}
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Crect width='8' height='8' fill='%234F7EDB'/%3E%3Ccircle cx='4' cy='3' r='1.6' fill='%23fff'/%3E%3Cpath d='M1 8a3 3 0 0 1 6 0z' fill='%23fff'/%3E%3C/svg%3E" />
        ))}
      </Inline>
    </Stack>
  ),
};

/**
 * **NAMES, and what a screen reader hears.**
 *
 * §2.22.9 grades three things REVIEW and all three are code-only. The one that
 * matters most: **"the initial is not a name"** — `A` is not an accessible name,
 * so `name` is required, carries the `title`, and is repeated in visually-hidden
 * text. The glyph itself is `aria-hidden`, because "DT" otherwise announces as
 * two letters.
 *
 * `initials` defaults to the first letter, which is what the reference draws.
 * §2.22.7 notes two is a common variant, so the box does not clip — pass `"DT"`.
 *
 * **The 24px avatar is below 24 × 24 once a ring is inside it**, so it must never
 * be the only hit target for an action. This component renders a `<span>` and is
 * never interactive; make the row or the link the target.
 */
export const Names: Story = {
  render: () => (
    <Stack gap={4}>
      {[['Dulce Torff', undefined], ['Dulce Torff', 'DT'], ['Nilgiri Components Pvt Ltd', 'NC']]
        .map(([n, i], k) => (
          <Inline key={k} gap={3} align="center">
            <Avatar name={n as string} initials={i as string | undefined} />
            <Text>{n}</Text>
            <Text size="body-sm" tone="secondary">
              {i ? `initials="${i}"` : 'derived'}
            </Text>
          </Inline>
        ))}
    </Stack>
  ),
};
