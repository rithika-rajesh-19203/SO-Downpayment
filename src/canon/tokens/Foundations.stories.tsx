import type { Meta } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Inline, Stack, Surface, Text } from '../primitives';
import type { TextSize, TextWeight } from '../primitives';

/**
 * Living documentation of the token layer.
 *
 * Every swatch reads its colour from a Tailwind utility backed by semantic.css,
 * so when a role changes this page changes with it and cannot go stale.
 *
 * The palette is COMPLETE: 200 primitives, 107 roles x 2 modes, 5 brand tokens
 * x 2 hues — 424 values, generated from design-refs/zf-colours.md by
 * `npm run tokens:sync`, which verifies every alias resolves to the hex the
 * source table states.
 *
 * Note what is NOT available here: `w-32`, `h-14`, `p-7`. scale.css sets
 * `--spacing: initial`, which removes Tailwind's dynamic 4px scale. That is
 * deliberate — md §1.6.3 traced 44 off-scale values in the date range picker to
 * exactly that scale leaking in, and called it "a foreign scale, not a
 * decision". Only the 12 steps on the 2px base resolve, so an off-scale value
 * is a build error rather than a silent 28px.
 */
const meta: Meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'padded' },
};
export default meta;

/* ── helpers ──────────────────────────────────────────────────────────────── */

function Swatch({ cls, name, note }: { cls: string; name: string; note?: string }) {
  return (
    <Stack gap={1}>
      {/* h-16 is 32px on the step scale; w-full is not spacing-derived. */}
      <Surface className={`${cls} h-16 w-full`} pad={0} radius="sm" border="divider" />
      <Text size="caption" tone="secondary">{name}</Text>
      {note ? <Text size="caption" tone="tertiary">{note}</Text> : null}
    </Stack>
  );
}

function Group({ label, blurb, children }: { label: string; blurb?: string; children: ReactNode }) {
  return (
    <Stack gap={4}>
      <Stack gap={1}>
        <Text size="overline" tone="tertiary">{label}</Text>
        {blurb ? <Text size="body-sm" tone="secondary">{blurb}</Text> : null}
      </Stack>
      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {children}
      </div>
    </Stack>
  );
}

/* ── the layering ─────────────────────────────────────────────────────────── */

const LAYERS: Array<[string, string]> = [
  ['1 · primitives.css', 'The palette. 9 families x 22 steps. The only file with a hex.'],
  ['2 · scale.css', 'Type, space, radius, elevation. The only other raw-value file.'],
  ['3 · semantic.css', 'Roles, Light + Dark. var() only — zero hex.'],
  ['4 · brand.css', 'Brand hue, an axis independent of the pane.'],
  ['5 · theme.css', 'Roles to Tailwind utilities, via @theme inline.'],
];

export const TheLayering = () => (
  <Stack gap={8}>
    <Stack gap={2}>
      <Text size="title">Three layers, one direction</Text>
      <Text size="body" tone="secondary">
        primitives to semantic to component. Nothing reaches backwards. A component that
        references a primitive has skipped the layer that makes retheming possible, and
        rule 7 of the boundary check fails the build on it.
      </Text>
    </Stack>
    <Surface tone="sunken" pad={8} radius="lg" border="divider">
      <Stack gap={4}>
        {LAYERS.map(([k, v]) => (
          <Inline key={k} gap={6} align="baseline">
            <Text size="body" weight="medium" className="w-rail shrink-0">{k}</Text>
            <Text size="body" tone="secondary">{v}</Text>
          </Inline>
        ))}
      </Stack>
    </Surface>
  </Stack>
);

/* ── colour roles ─────────────────────────────────────────────────────────── */

export const SemanticRoles = () => (
  <Stack gap={12}>
    <Text size="title">Semantic roles</Text>

    <Group
      label="Surface"
      blurb="`canvas` is what a page sits on, `default` is the page or card, `sunken` a recessed well, `raised` a card above the page. The interaction ladder default > hover > pressed is monotonic in both panes, and `disabled` sits OFF it — disabled is not a stronger version of pressed."
    >
      <Swatch cls="bg-surface-canvas" name="surface/canvas" />
      <Swatch cls="bg-surface-default" name="surface/default" />
      <Swatch cls="bg-surface-raised" name="surface/raised" />
      <Swatch cls="bg-surface-sunken" name="surface/sunken" />
      <Swatch cls="bg-surface-hover" name="surface/hover" />
      <Swatch cls="bg-surface-pressed" name="surface/pressed" />
      <Swatch cls="bg-surface-selected" name="surface/selected" />
      <Swatch cls="bg-surface-disabled" name="surface/disabled" />
      <Swatch cls="bg-surface-inverse" name="surface/inverse" />
    </Group>

    <Group
      label="Icon"
      blurb="The ladder had a hole in it: default is 6.79 and the only step below it was subtle at 2.85, which fails 1.4.11 and is marked decorative-only. 'A bit lighter' meant 'below the floor' until icon/muted. §2.11.4 records nearly shipping a stepper chevron into that gap."
    >
      <Swatch cls="bg-icon-default" name="icon/default" note="6.79:1" />
      <Swatch cls="bg-icon-muted" name="icon/muted" note="4.52:1 — the step subtle could not be" />
      <Swatch cls="bg-icon-subtle" name="icon/subtle" note="2.85:1 — decorative ONLY" />
      <Swatch cls="bg-icon-disabled" name="icon/disabled" note="exempt" />
    </Group>

    <Group
      label="Border"
      blurb="No border role reaches 3:1 on white — default 1.31, strong 1.71, hover 2.85. Nine components fail WCAG 1.4.11 for this one reason, and the neutral ramp jumps 2.85 to 4.52 with nothing between. Open items 12 and 35."
    >
      <Swatch cls="bg-border-default" name="border/default" note="1.31:1 — fails 1.4.11" />
      <Swatch cls="bg-border-strong" name="border/strong" note="1.71:1" />
      <Swatch cls="bg-border-hover" name="border/hover" note="2.85:1" />
      <Swatch cls="bg-border-divider" name="border/divider" note="decorative, exempt" />
    </Group>

    <Group
      label="Primary"
      blurb="`default` is themeable; the status families are not. White on default is 4.32:1 and fails at 13px — which is exactly why `selected` exists at 5.48:1."
    >
      <Swatch cls="bg-primary-default" name="primary/default" note="4.32:1" />
      <Swatch cls="bg-primary-selected" name="primary/selected" note="white 5.48:1" />
      <Swatch cls="bg-primary-active" name="primary/active" note="6.94:1" />
      <Swatch cls="bg-primary-subtle" name="primary/subtle" />
      <Swatch cls="bg-primary-text" name="primary/text" note="links, 5.92:1" />
      <Swatch cls="bg-focus-ring" name="focus/ring" note="one ring, every control" />
    </Group>

    <Group
      label="Status — default"
      blurb="Warning is ORANGE, not Yellow — confirmed in §1.2 and re-pointed in §2.7.6. Info resolves to Sky, which is why an informational banner does not compete with the primary button beside it."
    >
      <Swatch cls="bg-success-default" name="success/default" note="white 4.56:1" />
      <Swatch cls="bg-warning-default" name="warning/default" note="white 6.07:1" />
      <Swatch cls="bg-danger-default" name="danger/default" note="6.09:1" />
      <Swatch cls="bg-info-default" name="info/default" note="4.58:1" />
    </Group>

    <Group
      label="Status — subtle and border"
      blurb="Each tone is a designed PAIR: {tone}/default on {tone}/subtle. md §2.13.6 notes this is the first component whose icon contrast passes on every tone without adjustment — which is what a semantic layer is for, and a good counterweight to the neutral roles, where nothing reaches 3:1."
    >
      <Swatch cls="bg-success-subtle" name="success/subtle" />
      <Swatch cls="bg-warning-subtle" name="warning/subtle" />
      <Swatch cls="bg-danger-subtle" name="danger/subtle" />
      <Swatch cls="bg-info-subtle" name="info/subtle" />
      <Swatch cls="bg-success-border" name="success/border" note="decorative tint" />
      <Swatch cls="bg-danger-border" name="danger/border" note="1.75:1 — NOT a boundary" />
    </Group>

    <Group
      label="Chrome — the top bar"
      blurb="Permanently dark in BOTH panes, so these roles deliberately do not flip. Binding the placeholder to text/secondary inverts the moment Dark is applied."
    >
      <Swatch cls="bg-chrome-surface" name="chrome/surface" />
      <Swatch cls="bg-chrome-raised" name="chrome/raised" />
      <Swatch cls="bg-chrome-border" name="chrome/border" note="3.69:1 on the field" />
      <Swatch cls="bg-chrome-avatar" name="chrome/avatar" note="the tile, not an edge" />
      <Swatch cls="bg-chrome-badge" name="chrome/badge" note="4.71:1 — the brightest red that carries white" />
      <Swatch cls="bg-chrome-accent" name="chrome/accent" note="4.20:1 on the field" />
    </Group>

    <Group
      label="Nav — the left rail"
      blurb="One ladder: surface, hover, selected, pressed — each a step further from the pane. The source ran them in opposite directions in the two panes, so pressing a row darkened it in Light and lightened it in Dark."
    >
      <Swatch cls="bg-nav-surface" name="nav/surface" />
      <Swatch cls="bg-nav-item-hover" name="nav/item-hover" />
      <Swatch cls="bg-nav-item-selected" name="nav/item-selected" />
      <Swatch cls="bg-nav-item-pressed" name="nav/item-pressed" />
      <Swatch cls="bg-nav-brand-surface" name="nav/brand-surface" note="dark in both panes" />
    </Group>

    <Group
      label="Brand — follows [data-zf-brand]"
      blurb="Independent of the pane. Red is red/1200, not 1300: the source's #F8525A put white at 3.31:1 and failed 1.4.3 where Blue passed, because the hue swap changed the colour without checking luminance."
    >
      <Swatch cls="bg-brand-solid" name="brand/solid" />
      <Swatch cls="bg-brand-solid-hover" name="brand/solid-hover" note="hover DARKENS" />
      <Swatch cls="bg-brand-solid-pressed" name="brand/solid-pressed" />
    </Group>

    <Group
      label="Avatar — identity tints"
      blurb="Derived from a hash of the person's name (open item 34), so the tint carries identity. It must never be read as status."
    >
      <Swatch cls="bg-avatar-green-surface" name="avatar/green" />
      <Swatch cls="bg-avatar-cyan-surface" name="avatar/cyan" />
      <Swatch cls="bg-avatar-blue-surface" name="avatar/blue" />
      <Swatch cls="bg-avatar-red-surface" name="avatar/red" />
      <Swatch cls="bg-avatar-purple-surface" name="avatar/purple" />
      <Swatch cls="bg-avatar-orange-surface" name="avatar/orange" />
      <Swatch cls="bg-avatar-admin" name="avatar/admin" note="white 6.07:1" />
    </Group>

    <Group
      label="Accent — reserved"
      blurb="Decorative hues for tags and categories. Nothing consumes these yet, and that is deliberate rather than a gap."
    >
      <Swatch cls="bg-accent-cyan" name="accent/cyan" />
      <Swatch cls="bg-accent-orange" name="accent/orange" />
      <Swatch cls="bg-accent-purple" name="accent/purple" />
      <Swatch cls="bg-accent-yellow" name="accent/yellow" />
    </Group>

    <Group
      label="Chart — reserved"
      blurb="A categorical series palette, in order. No chart component exists yet. Note chart/1 resolves to the same value as primary/default — fine, because the two never need telling apart."
    >
      <Swatch cls="bg-chart-1" name="chart/1" />
      <Swatch cls="bg-chart-2" name="chart/2" />
      <Swatch cls="bg-chart-3" name="chart/3" />
      <Swatch cls="bg-chart-4" name="chart/4" />
      <Swatch cls="bg-chart-5" name="chart/5" />
      <Swatch cls="bg-chart-6" name="chart/6" />
      <Swatch cls="bg-chart-7" name="chart/7" />
      <Swatch cls="bg-chart-8" name="chart/8" />
    </Group>
  </Stack>
);

/* ── type ─────────────────────────────────────────────────────────────────── */

const TYPE: Array<[TextSize, string]> = [
  ['display', '40 / 48 · 1.20'],
  ['title-lg', '24 / 32 · 1.33'],
  ['title', '20 / 28 · 1.40'],
  ['heading', '18 / 24 · 1.33'],
  ['subheading', '16 / 24 · 1.50'],
  ['body', '13 / 20 · 1.54 — 682 nodes, 72% of all text'],
  ['body-sm', '12 / 16 · 1.33'],
  ['label', '11 / 16 · 1.45 · +2%'],
  ['caption', '10 / 12 · 1.20 · +2%'],
  ['overline', '11 / 17.6 · 1.60 · +0.6px · UPPER · 600'],
];

const WEIGHTS: Array<[TextWeight, string]> = [
  ['regular', '400'],
  ['medium', '500'],
  ['semibold', '600'],
  ['bold', '700'],
];

export const TypeScale = () => (
  <Stack gap={8}>
    <Stack gap={2}>
      <Text size="title">Type scale — 9 sizes</Text>
      <Text size="body" tone="secondary">
        Chosen from 1,306 measured text nodes so the largest number did not have to move.
        The line-height is part of the size, not a separate choice: 13px previously carried
        five of them, and 20.8 was ambiguous by construction because it is both 13 x 1.6
        and 16 x 1.3. Shown at each size&apos;s default weight.
      </Text>
    </Stack>
    <Stack gap={6}>
      {TYPE.map(([v, spec]) => (
        <Inline key={v} gap={8} align="baseline" justify="between">
          <Text size={v}>{v}</Text>
          <Text size="caption" tone="tertiary">{spec}</Text>
        </Inline>
      ))}
    </Stack>
  </Stack>
);

export const WeightScale = () => (
  <Stack gap={8}>
    <Stack gap={2}>
      <Text size="title">Weight — a second axis, 4 values</Text>
      <Text size="body" tone="secondary">
        Every size exists in every weight — 9 x 4 = 36 styles, composed from two classes
        rather than enumerated. `zf/body/medium` in Figma is `text-body font-medium` here.
        Tailwind&apos;s other six weights are removed, so `font-thin` is a build error.
      </Text>
    </Stack>
    <Stack gap={4}>
      {WEIGHTS.map(([w, value]) => (
        <Inline key={w} gap={8} align="baseline" justify="between">
          <Text size="subheading" weight={w}>The quick brown fox — {w}</Text>
          <Text size="caption" tone="tertiary">{value}</Text>
        </Inline>
      ))}
    </Stack>
    <Stack gap={2}>
      <Text size="caption" tone="tertiary">
        13 / 20 at all four — the row that carries 72% of the system&apos;s text
      </Text>
      <Inline gap={8} wrap align="baseline">
        {WEIGHTS.map(([w]) => (
          <Text key={w} size="body" weight={w}>Retainer Invoices {w}</Text>
        ))}
      </Inline>
    </Stack>
  </Stack>
);

/* ── tone is a third axis ─────────────────────────────────── */

export const TextTones = () => (
  <Stack gap={8}>
    <Stack gap={2}>
      <Text size="title">Tone is its own axis</Text>
      <Text size="body" tone="secondary">
        Size and emphasis are not the same question as hierarchy or status. Baking colour
        into the type role is the most common modelling error the md records — one axis
        carrying two dimensions, flagged in §2.7.2, §2.8.2, §2.9.5, §2.10.1 and §2.11.2.
      </Text>
    </Stack>
    <Stack gap={4}>
      {(['default', 'secondary', 'tertiary', 'placeholder', 'disabled', 'link',
        'success', 'warning', 'danger'] as const).map((tone) => (
          <Inline key={tone} gap={6} align="baseline" justify="between">
            <Text size="body" tone={tone}>The quick brown fox — {tone}</Text>
            <Text size="caption" tone="tertiary">tone=&quot;{tone}&quot;</Text>
          </Inline>
      ))}
      <Surface tone="inverse" pad={6} radius="md">
        <Text size="body" tone="inverse">On an inverse surface — tone=&quot;inverse&quot;</Text>
      </Surface>
    </Stack>
  </Stack>
);

/* ── space, radius, elevation ─────────────────────────────────────────────── */

/** Literal classes — Tailwind scans source text, so `w-${step}` is invisible to it. */
const RULER: Array<[number, string, string]> = [
  [1, '2px', 'w-1'],
  [2, '4px', 'w-2'],
  [3, '6px', 'w-3'],
  [4, '8px', 'w-4'],
  [5, '10px', 'w-5'],
  [6, '12px', 'w-6'],
  [8, '16px', 'w-8'],
  [10, '20px', 'w-10'],
  [12, '24px', 'w-12'],
  [16, '32px', 'w-16'],
  [20, '40px', 'w-20'],
];

export const SpaceAndRadius = () => (
  <Stack gap={12}>
    <Stack gap={4}>
      <Stack gap={2}>
        <Text size="title">Spacing — a 2px base, named by step</Text>
        <Text size="body" tone="secondary">
          Measured across 2,021 auto-layout frames: 2, 6 and 10 account for 1,020 uses and
          none is a multiple of 4. A 4px base would forbid the first, third and eighth most
          common values in the system. `space-4` is 8px because 4 x 2 = 8, so a density
          change rescales the product without renaming a single prop value.
        </Text>
      </Stack>
      <Stack gap={3}>
        {RULER.map(([step, px, cls]) => (
          <Inline key={step} gap={6} align="center">
            <Text size="caption" tone="tertiary" className="w-16 shrink-0">{step} · {px}</Text>
            <Surface tone="inverse" pad={0} radius="xs" className={`h-3 ${cls}`} />
          </Inline>
        ))}
      </Stack>
    </Stack>

    <Stack gap={4}>
      <Stack gap={2}>
        <Text size="title">Radius</Text>
        <Text size="body" tone="secondary">
          `md` (6px) is the default — 371 uses, buttons and inputs. Prefer `full` over any
          half-of-height arithmetic: 999 always resolves to a capsule, where a literal 50
          is a circle at exactly 100px and a rounded rectangle everywhere else.
        </Text>
      </Stack>
      <Inline gap={6} wrap align="start">
        {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((r) => (
          <Stack key={r} gap={1} align="center">
            <Surface tone="sunken" radius={r} border="default" pad={0} className="h-16 w-16" />
            <Text size="caption" tone="tertiary">{r}</Text>
          </Stack>
        ))}
      </Inline>
    </Stack>

    <Stack gap={4}>
      <Stack gap={2}>
        <Text size="title">Elevation</Text>
        <Text size="body" tone="secondary">
          §1 defines no elevation scale — open item 13. These four are the values actually
          drawn in the file, promoted to roles so a fifth cannot be invented per component.
          The shadow colour is unstated in the md.
        </Text>
      </Stack>
      <Inline gap={12} wrap align="start">
        {(['raised', 'popover', 'modal', 'drawer'] as const).map((e) => (
          <Stack key={e} gap={3} align="center">
            <Surface elevation={e} radius="lg" pad={10} className="h-16 w-20" />
            <Text size="caption" tone="tertiary">{e}</Text>
          </Stack>
        ))}
      </Inline>
    </Stack>
  </Stack>
);
