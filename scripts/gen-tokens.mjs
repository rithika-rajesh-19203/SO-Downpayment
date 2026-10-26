#!/usr/bin/env node
/* ============================================================================
   TOKEN GENERATOR  —  `npm run tokens:sync`
   ----------------------------------------------------------------------------
   Parses design-refs/zf-colours.md and emits:

     src/canon/tokens/primitives.css    200 values
     src/canon/tokens/semantic.css      109 roles x 2 modes
     src/canon/tokens/brand.css           5 tokens x 2 hues

   Never hand-edit those three. Edit the md and re-run.

   ── WHY THIS IS GENERATED AND VERIFIED ──────────────────────────────────────
   424 values is far past what anyone can hand-copy reliably, and the md itself
   makes the point: "a token layer nobody checks is a token layer that has
   already drifted."

   So every role states BOTH its alias and its resolved hex, and this script
   checks the two agree. That cross-check is the real product — it catches a
   transcription slip in the primitive table AND in the role tables, because a
   mistake in either makes the pair disagree. §2.16.2 of the design cannon is
   what happens without it: #21263C and #21263D for one colour, 0.71 dE apart,
   across 34 nodes, invisible to any review that is not a script.
   ========================================================================= */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SRC_MD = join(ROOT, 'design-refs/zf-colours.md');
const SRC_CANNON = join(ROOT, 'design-refs/zf-design-cannon.md');
const OUT = join(ROOT, 'src/canon/tokens');

const md = readFileSync(SRC_MD, 'utf8');
const cannon = readFileSync(SRC_CANNON, 'utf8');
const problems = [];

/* ── 1 · primitives ──────────────────────────────────────────────────────────
   Column order in the md's §2 table. `sky`, not `sky-blue` — the alias column
   throughout §3 writes `sky/800`, and the CSS contract is
   `color/<family>/<step>` -> `--zf-<family>-<step>`.

   NOTE: zf-design-cannon.md §1.1 calls this family `--zf-sky-blue-*`. The two
   documents disagree. This follows zf-colours.md because it is the generated
   one and its ~10 alias references are consistent. Flagged in docs/BACKLOG.md. */
const FAMILIES = ['neutral', 'blue', 'sky', 'cyan', 'green', 'yellow', 'orange', 'red', 'purple'];

const primitives = new Map();               // "blue/1200" -> "#3874EB"
for (const m of md.matchAll(/^\|\s*\*\*(\d{3,4})\*\*\s*\|(.+)\|\s*$/gm)) {
  const step = m[1];
  const cells = m[2].split('|').map((c) => c.trim());
  if (cells.length !== FAMILIES.length) {
    problems.push(`step ${step}: expected ${FAMILIES.length} hex cells, found ${cells.length}`);
    continue;
  }
  cells.forEach((cell, i) => {
    const hex = /`(#[0-9A-Fa-f]{6})`/.exec(cell);
    if (!hex) { problems.push(`step ${step} · ${FAMILIES[i]}: no hex in "${cell}"`); return; }
    primitives.set(`${FAMILIES[i]}/${step}`, hex[1].toUpperCase());
  });
}
primitives.set('base/white', '#FFFFFF');
primitives.set('base/black', '#000000');

/* ── 2 · roles ───────────────────────────────────────────────────────────────
   Rows shaped:  | `role/name` | `#LIGHT` | `#DARK` | `alias-a` / `alias-b` | uses |
   The alias cell is `raw` / `raw` for overlay/scrim, the one role with alpha. */
const ROLE_ROW = new RegExp(
  '^\\|\\s*`([a-z]+/[a-z0-9-]+)`\\s*\\|'         // role
  + '\\s*`(#[0-9A-Fa-f]{6})`([^|]*)\\|'           // value A (+ any "@ 48%" tail)
  + '\\s*`(#[0-9A-Fa-f]{6})`([^|]*)\\|'           // value B
  + '\\s*([^|]+?)\\s*\\|',                        // alias cell
  'gm',
);

const brandStart = md.indexOf('## 4. Brand');
const contrastStart = md.indexOf('## 5. Contrast');

const roles = [];   // { role, a, b, aliasA, aliasB, alphaA, alphaB, brand }
for (const m of md.matchAll(ROLE_ROW)) {
  const [, role, a, tailA, b, tailB, aliasCell] = m;
  const aliases = aliasCell.split('/').length >= 2
    ? aliasCell.split(/\s+\/\s+/).map((s) => s.replace(/`/g, '').trim())
    : [];
  // an alias is itself `fam/step`, so split on " / " between backticked pairs
  const pair = [...aliasCell.matchAll(/`([a-z]+\/[a-z0-9]+|raw)`/g)].map((x) => x[1]);
  const isBrand = m.index > brandStart && m.index < contrastStart + 1 && m.index > brandStart;
  roles.push({
    role,
    a: a.toUpperCase(),
    b: b.toUpperCase(),
    alphaA: /(\d+)\s*%/.exec(tailA)?.[1],
    alphaB: /(\d+)\s*%/.exec(tailB)?.[1],
    aliasA: pair[0] ?? aliases[0],
    aliasB: pair[1] ?? aliases[1],
    brand: isBrand,
  });
}

const semantic = roles.filter((r) => !r.brand);
const brand = roles.filter((r) => r.brand);

/* ── 3 · verify each alias resolves to the stated hex ─────────────────────── */
let checked = 0;
for (const r of [...semantic, ...brand]) {
  for (const [alias, want, which] of [[r.aliasA, r.a, 'A'], [r.aliasB, r.b, 'B']]) {
    if (!alias) { problems.push(`${r.role}: missing alias ${which}`); continue; }
    if (alias === 'raw') { checked += 1; continue; }
    const got = primitives.get(alias);
    if (!got) { problems.push(`${r.role} ${which}: alias '${alias}' is not a primitive`); continue; }
    if (got !== want) {
      problems.push(`${r.role} ${which}: alias '${alias}' is ${got} but the table states ${want}`);
    }
    checked += 1;
  }
}

/* ── 3b · the component layer: status badge, md §2.1.6 ──────────────────────
   The third layer of primitives -> semantic -> component, and its first
   inhabitant. Parsed straight out of zf-design-cannon.md rather than
   transcribed, because §2.1.6 states BOTH the palette step and the resolved hex
   for all 28 pairings — which is exactly the pair that makes verification
   possible, the same property that makes the colour layer trustworthy.

   WHY THE BADGE GETS COMPONENT TOKENS AT ALL.
   §2.1.11 says the classes should reference primitives directly and that there
   deliberately is no intermediate variable layer. We cannot do that: rule 7
   forbids a primitive reference outside tokens/, because var(--zf-green-500)
   and var(--zf-color-...) render identically today and diverge the moment the
   theme changes. And the md's stated reason for dropping the layer — "a
   variable cannot hold a fill and a label at once" — is an argument about CSS
   variables, not about components. A React variant map holds both, so the
   argument does not reach us. The layer comes back, generated.

   WHY THERE IS A DARK COLUMN AT ALL.
   §2.1 specifies one pane. A badge whose fill is green/500 stays a pale tint on
   a near-black table, so shipping the spec verbatim ships a component that is
   wrong in half of the four combinations this repo reviews in. So Dark is
   DERIVED, by the mirror the colour doc already uses for every status family:

     success/subtle   green/300  <-> green/2000     300 + 2000 = 2300
     success/text     green/1600 <-> green/800      1600 + 800 = 2300
     success/default  green/1300 <-> green/1000     1300 + 1000 = 2300
     success/on-*     base/white <-> green/2200

   So: dark step = 2300 - light step, and base/white mirrors to {family}/2200.
   The palette is 22 steps from 100 to 2200, so every mirror lands on a real
   step. This is a derivation from a documented convention, not a new decision,
   but it is still ours and not the design's — open item, see docs/BACKLOG.md.
   The one place the convention itself is inconsistent is `{hue}/border`, which
   mirrors 800 to 1600 and sums to 2400. Nothing here uses border. */

const BADGE_FAMILY = { 'sky blue': 'sky' };   //  §1.1 calls it sky-blue; the palette calls it sky

//  §2.1.6 names the purple state's class `.zf-badge--TBD` on purpose, so the gap
//  stays visible in the developer-facing column (issue 1: `ageneratedPurple` is a
//  Figma placeholder, not a business state). We keep the gap visible by NAME
//  instead — `unclassified` is §2.1.7's own family name for it — because a token
//  called TBD would also be the one token with capitals in it, and Tailwind theme
//  keys are lowercased.
const BADGE_SLUG = { TBD: 'unclassified' };
const MIRROR = 2300;

const badgeStates = [];
{
  const from = cannon.indexOf('### 2.1.6');
  const to = cannon.indexOf('### 2.1.7');
  if (from < 0 || to < 0) problems.push('badge: §2.1.6 not found in zf-design-cannon.md');

  const ROW = new RegExp(
    '^\\|\\s*`?([^|`]+?)`?\\s*\\|'                          //  state name
    + '\\s*`\\.zf-badge--([a-z-]+|TBD)`\\s*\\|'             //  slug
    + '\\s*`(#[0-9A-Fa-f]{6})`\\s*/\\s*`(#[0-9A-Fa-f]{6})`\\s*\\|'  //  fill / label
    + '\\s*([A-Za-z ]+?)\\s+(\\d{3,4})\\s*/\\s*(\\d{3,4})\\s*\\|'   //  family + 2 steps
    + '\\s*([\\d.]+)[^|]*\\|'                               //  ratio
    + '\\s*`\\.zf-badge--(?:[a-z-]+|TBD)-solid`\\s*\\|'     //  solid slug
    + '\\s*`(#[0-9A-Fa-f]{6})`\\s*/\\s*`(#[0-9A-Fa-f]{6})`\\s*\\|' //  solid fill / label
    + '\\s*([A-Za-z ]+?)\\s+(\\d{3,4})\\s*\\|'              //  solid family + step
    + '\\s*([\\d.]+)', 'gm');

  const fam = (raw) => {
    const k = raw.trim().toLowerCase();
    return BADGE_FAMILY[k] ?? k;
  };

  for (const m of cannon.slice(from, to).matchAll(ROW)) {
    const [, name, slug, fill, label, f1, sFill, sLabel, ratio,
      solidFill, solidLabel, f2, sSolid, solidRatio] = m;
    badgeStates.push({
      name: name.trim(),
      slug: BADGE_SLUG[slug] ?? slug,
      family: fam(f1),
      solidFamily: fam(f2),
      steps: { fill: Number(sFill), label: Number(sLabel), solidFill: Number(sSolid) },
      hex: { fill, label, solidFill, solidLabel },
      ratio: Number(ratio),
      solidRatio: Number(solidRatio),
    });
  }
}

let badgeChecked = 0;
for (const b of badgeStates) {
  const claims = [
    [`${b.family}/${b.steps.fill}`, b.hex.fill, 'default fill'],
    [`${b.family}/${b.steps.label}`, b.hex.label, 'default label'],
    [`${b.solidFamily}/${b.steps.solidFill}`, b.hex.solidFill, 'solid fill'],
  ];
  for (const [alias, want, which] of claims) {
    const got = primitives.get(alias);
    if (!got) { problems.push(`badge ${b.slug} ${which}: '${alias}' is not a primitive`); continue; }
    if (got.toUpperCase() !== want.toUpperCase()) {
      problems.push(`badge ${b.slug} ${which}: '${alias}' is ${got} but §2.1.6 states ${want}`);
    }
    badgeChecked += 1;
  }
  if (b.hex.solidLabel.toUpperCase() !== '#FFFFFF') {
    problems.push(`badge ${b.slug}: solid label is ${b.hex.solidLabel}, expected #FFFFFF (base/white)`);
  } else {
    badgeChecked += 1;
  }
  //  Every mirrored step has to be a real step, or Dark silently loses a token.
  for (const [which, step] of Object.entries(b.steps)) {
    const family = which === 'solidFill' ? b.solidFamily : b.family;
    const alias = `${family}/${MIRROR - step}`;
    if (!primitives.get(alias)) {
      problems.push(`badge ${b.slug} ${which}: mirror '${alias}' is not a primitive`);
    }
  }
}
if (badgeStates.length !== 14) {
  problems.push(`badge: parsed ${badgeStates.length} states, §2.1.4 specifies 14`);
}

/* ── 3b-ii · the one place the mirror does not survive contact ────────────────
   Mirroring the neutral family's SOLID fills lands draft on neutral/1100, and
   near-black text on neutral/1100 is 4.02:1 — under AA. Measured against
   neutral/2200, the whole ramp reads:

     1200  3.62  FAIL      1000  6.37       800  10.62      600  13.86
     1100  4.02  FAIL       900  8.55       700  11.87      500  15.20

   So the Dark solid ladder cannot start above 1000. This is not a flaw in the
   mirror; it is that Light's neutral solid fills start at 1200 — much lighter
   than the hue families, whose solid fills start at 1400 — so their mirrors land
   on the palette's midpoint instead of in its light half.

   THE FAMILY SHIFTS, NOT THE ONE STATE. Moving draft alone from 1100 to 1000
   puts it on top of void, and §2.1.7 records that Draft and Void previously
   SHARED a solid fill and were indistinguishable in Solid emphasis — that bug
   was already found and fixed once. Walking draft further to 900 fixes the
   collision but inverts the ladder, which §2.1.7 also rejects: "Without the swap
   the ladder steps darker then lighter, which reads as accidental rather than
   systematic."

   Shifting all four one step preserves both properties. In Light the ladder
   darkens as a record ages (1200 -> 1600); in Dark it lightens (1000 -> 600),
   which is the same ladder seen from the other side.

   Asserted below, not trusted: every pairing passes AA, all 14 Dark solid fills
   stay unique, and the neutral ladder stays monotonic. */

const BADGE_DARK_SOLID_FILL = {
  draft: 1000,      //  mirror gives 1100 — 4.02:1, fails
  void: 900,        //  mirror gives 1000
  inactive: 700,    //  mirror gives 800
  expired: 600,     //  mirror gives 700
};

const darkSteps = (b) => ({
  fill: MIRROR - b.steps.fill,
  label: MIRROR - b.steps.label,
  solidFill: BADGE_DARK_SOLID_FILL[b.slug] ?? MIRROR - b.steps.solidFill,
  solidLabel: 2200,
});

/* ── 3c · contrast, measured ─────────────────────────────────────────────────
   §2.1.6 states a contrast ratio for every one of the 28 pairings and claims all
   28 pass AA. That claim is checkable, so it is checked: a stated ratio that
   disagrees with the computed one is a problem, exactly like a stated hex that
   disagrees with its alias.

   The DARK column is derived rather than specified, so it cannot be verified
   against anything — but it can still be measured. A derived pairing under 4.5:1
   is reported as a warning, loudly, because the derivation is ours and a silent
   AA failure in half the themes is precisely what §2.9.9 is a story about. */

const srgb = (hex) => [1, 3, 5]
  .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));

const luminance = (hex) => {
  const [r, g, b] = srgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const AA_NORMAL = 4.5;
const badgeWarnings = [];
let ratiosChecked = 0;

for (const b of badgeStates) {
  //  Light — the specification. Verified against the ratio the md prints.
  for (const [emphasis, bg, fg, stated] of [
    ['default', b.hex.fill, b.hex.label, b.ratio],
    ['solid', b.hex.solidFill, b.hex.solidLabel, b.solidRatio],
  ]) {
    const got = contrast(bg, fg);
    if (Math.abs(got - stated) > 0.02) {
      problems.push(
        `badge ${b.slug} ${emphasis} Light: §2.1.6 states ${stated}:1 but ${bg} on ${fg} measures ${got.toFixed(2)}:1`);
    }
    if (got < AA_NORMAL) {
      problems.push(`badge ${b.slug} ${emphasis} Light: ${got.toFixed(2)}:1 fails AA, and §2.1.6 claims all 28 pass`);
    }
    ratiosChecked += 1;
  }

  //  Dark — derived. Measured, not verified.
  const step = (family, n) => primitives.get(`${family}/${n}`);
  const d = darkSteps(b);
  for (const [emphasis, bg, fg] of [
    ['default', step(b.family, d.fill), step(b.family, d.label)],
    ['solid', step(b.solidFamily, d.solidFill), step(b.solidFamily, d.solidLabel)],
  ]) {
    if (!bg || !fg) continue;
    const got = contrast(bg, fg);
    if (got < AA_NORMAL) {
      badgeWarnings.push(
        `${b.slug} ${emphasis} Dark: ${got.toFixed(2)}:1 — under AA's ${AA_NORMAL}:1. `
        + `Derived as ${bg} on ${fg}; §2.1 specifies no Dark value to fall back on.`);
    }
    ratiosChecked += 1;
  }
}

/* ── 3d · the structural claims §2.1.6 and §2.1.7 make ───────────────────────
   Three properties the md states as CHECKED OUTCOMES rather than intentions:

     "14 normal fills unique  ok"
     "14 solid fills unique   ok"
     "Neutral lightness ladder  ok preserved as Neutral 400 -> 500 -> 600 -> 700"

   Asserted here in both panes, because Dark is derived and the neutral override
   above moves four of the values it would otherwise be checking. A uniqueness
   collision is not cosmetic: §2.1.7 records that Draft and Void once shared a
   solid fill and were "indistinguishable in Solid emphasis". */

for (const [pane, resolve] of [
  ['Light', (b) => ({ fill: `${b.family}/${b.steps.fill}`, solid: `${b.solidFamily}/${b.steps.solidFill}` })],
  ['Dark', (b) => {
    const d = darkSteps(b);
    return { fill: `${b.family}/${d.fill}`, solid: `${b.solidFamily}/${d.solidFill}` };
  }],
]) {
  for (const which of ['fill', 'solid']) {
    const seen = new Map();
    for (const b of badgeStates) {
      const v = resolve(b)[which];
      if (seen.has(v)) {
        problems.push(
          `badge ${pane} ${which} fills collide: '${b.slug}' and '${seen.get(v)}' are both ${v}. `
          + 'md §2.1.6 states all 14 are unique.');
      }
      seen.set(v, b.slug);
    }
  }

  //  The neutral ladder, in workflow order. Light darkens as a record ages;
  //  Dark is the same ladder from the other side, so it lightens. Either way it
  //  must be strictly monotonic — §2.1.7 rejects "darker then lighter" as
  //  reading accidental rather than systematic.
  const ladder = ['draft', 'void', 'inactive', 'expired']
    .map((slug) => badgeStates.find((b) => b.slug === slug))
    .filter(Boolean);

  for (const which of ['fill', 'solid']) {
    const steps = ladder.map((b) => Number(resolve(b)[which].split('/')[1]));
    const dir = pane === 'Light' ? 1 : -1;
    for (let i = 1; i < steps.length; i += 1) {
      if ((steps[i] - steps[i - 1]) * dir <= 0) {
        problems.push(
          `badge ${pane} neutral ${which} ladder is not monotonic: ${steps.join(' -> ')} `
          + `(expected strictly ${dir > 0 ? 'darker' : 'lighter'} in workflow order, md §2.1.7)`);
      }
    }
  }
}

/* ── 3e · every {family}/default must be able to carry its own on-{family} ────
   zf-button.md §5.2 is a foundations finding wearing a component's clothes:

     "primary/default + primary/on-primary fails 1.4.3 by construction, at
      4.32:1 — not just in the button, but anywhere in the system that puts
      on-primary text on a primary surface."

   That is a claim about the SEMANTIC LAYER, so it is checked here rather than in
   a component. An `on-X` role exists for exactly one purpose — to be legible on
   `X` — so a pair that cannot reach 4.5:1 is a role that does not do its job, and
   no amount of careful component work can rescue it.

   Reported as a warning rather than a failure: three of the four families pass,
   and fixing the fourth is a ladder shift (default -> blue/1300, hover ->
   blue/1400, selected -> 1400 or 1500) because primary/hover and primary/selected
   already sit on blue/1300. That is a design decision, recorded in
   docs/BACKLOG.md, not something a generator should quietly apply. */

const roleValue = new Map();
for (const r of semantic) roleValue.set(r.role, { light: r.a, dark: r.b });

let pairsChecked = 0;
const onRoleWarnings = [];

for (const [role] of roleValue) {
  const family = role.split('/')[0];
  if (role !== `${family}/on-${family}`) continue;
  const surface = roleValue.get(`${family}/default`);
  const onRole = roleValue.get(role);
  if (!surface || !onRole) continue;

  for (const pane of ['light', 'dark']) {
    const got = contrast(surface[pane], onRole[pane]);
    if (got < AA_NORMAL) {
      onRoleWarnings.push(
        `${family}/on-${family} on ${family}/default, ${pane}: ${got.toFixed(2)}:1 `
        + `(${onRole[pane]} on ${surface[pane]}) — under AA's ${AA_NORMAL}:1. `
        + `An on-${family} role that is not legible on ${family}/default has no other job.`);
    }
    pairsChecked += 1;
  }
}

/* ── 4 · emit ─────────────────────────────────────────────────────────────── */
const BANNER = (title, extra) => `/* ============================================================================
   ${title}
   ----------------------------------------------------------------------------
   GENERATED by scripts/gen-tokens.mjs from design-refs/zf-colours.md.
   Do not hand-edit. Edit the md and run \`npm run tokens:sync\`.
${extra}   ========================================================================= */
`;

/* primitives.css */
{
  const lines = [BANNER('LAYER 1 — ZF PRIMITIVES  (200 values)',
    `
   The palette. 9 hue families x 22 steps, plus base/white and base/black.
   The step is a LIGHTNESS INDEX, not a weight: 100 is lightest, 2200 darkest,
   and the same step in two families is the same lightness. That is what makes
   a Light/Dark role pair mechanical.

   THIS FILE AND scale.css ARE THE ONLY FILES ALLOWED A RAW VALUE.

   NOTHING OUTSIDE tokens/ MAY REFERENCE A PRIMITIVE. A primitive is identical
   in Light and Dark, so anything bound to one cannot theme. Components consume
   semantic.css roles only — rule 7 of the boundary check enforces it.

   There is no pure-grey family: every neutral carries a blue cast, which is why
   a sampled #757575 reads as foreign at 13.88 dE from the nearest step.
`)];
  lines.push(':root {');
  lines.push('  /* ── Base ─────────────────────────────────────────────────────────────── */');
  lines.push('  --zf-base-white: #FFFFFF;');
  lines.push('  --zf-base-black: #000000;');
  for (const fam of FAMILIES) {
    lines.push('');
    lines.push(`  /* ── ${fam[0].toUpperCase() + fam.slice(1)} ${'─'.repeat(Math.max(2, 66 - fam.length))} */`);
    for (let s = 100; s <= 2200; s += 100) {
      const v = primitives.get(`${fam}/${s}`);
      if (v) lines.push(`  --zf-${fam}-${s}: ${v};`);
      else problems.push(`primitives: missing ${fam}/${s}`);
    }
  }
  lines.push('}');
  writeFileSync(join(OUT, 'primitives.css'), `${lines.join('\n')}\n`);
}

/* semantic.css */
{
  const groups = new Map();
  for (const r of semantic) {
    const g = r.role.split('/')[0];
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(r);
  }

  const decl = (r, side) => {
    const alias = side === 'A' ? r.aliasA : r.aliasB;
    const alpha = side === 'A' ? r.alphaA : r.alphaB;
    const name = `--zf-color-${r.role.replace('/', '-')}`;
    if (alias === 'raw') {
      // The one role with an alpha channel. Expressed through color-mix against
      // a primitive rather than as a literal rgba(), so it still has no raw
      // value in this file and still follows a palette edit.
      const base = side === 'A' ? 'var(--zf-neutral-2200)' : 'var(--zf-base-black)';
      return `  ${name}: color-mix(in srgb, ${base} ${alpha}%, transparent);`;
    }
    return `  ${name}: var(--zf-${alias.replace('/', '-')});`;
  };

  const lines = [BANNER('LAYER 2 — ZF SEMANTIC  (109 roles x 2 modes)',
    `
   Roles. The only layer components may consume, and the only layer that may
   reference a primitive.

   TWO INDEPENDENT AXES. Pane lightness lives here; brand hue lives in
   brand.css. They must never share an axis: the source library fused them into
   four modes, duplicated two thirds of its table, and the one genuinely 2-D
   token had already drifted.

     pane  ->  :root  /  [data-zf-theme="dark"]  /  prefers-color-scheme
     hue   ->  [data-zf-brand="blue" | "red"]     brand.css

   Every value here is a var() into primitives.css. The single exception is
   overlay/scrim, which carries alpha and so cannot alias an opaque primitive —
   it is expressed as a color-mix against one instead.
`)];

  lines.push(":root,\n[data-theme='light'] {");
  for (const [g, rs] of groups) {
    lines.push(`\n  /* ${g}/* */`);
    for (const r of rs) lines.push(decl(r, 'A'));
  }
  lines.push('}');

  lines.push('\n/* ── DARK PANE ─────────────────────────────────────────────────────────────');
  lines.push('   chrome/* and the nav brand pair are absent below on purpose: the top bar and');
  lines.push('   the logo band are dark in BOTH panes, so a role that flips cannot describe');
  lines.push('   them. Binding a placeholder there to text/secondary inverts the moment Dark');
  lines.push('   is applied. ───────────────────────────────────────────────────────────── */');
  lines.push("[data-theme='dark'] {");
  for (const [g, rs] of groups) {
    const changed = rs.filter((r) => r.aliasA !== r.aliasB);
    if (!changed.length) continue;
    lines.push(`\n  /* ${g}/* */`);
    for (const r of changed) lines.push(decl(r, 'B'));
  }
  lines.push('}');

  lines.push('\n/* Respect the OS when no explicit choice has been made. */');
  lines.push('@media (prefers-color-scheme: dark) {');
  lines.push("  :root:not([data-theme='light']) {");
  for (const [, rs] of groups) {
    for (const r of rs.filter((x) => x.aliasA !== x.aliasB)) {
      lines.push(`  ${decl(r, 'B')}`);
    }
  }
  lines.push('  }');
  lines.push('}');

  writeFileSync(join(OUT, 'semantic.css'), `${lines.join('\n')}\n`);
}

/* brand.css */
{
  const lines = [BANNER('LAYER 2b — ZF BRAND  (5 tokens x 2 hues)',
    `
   The per-product hue, as its own axis — chosen per product, not per theme, so
   a red product in dark mode needs both axes at once.

   brand/solid is NOT primary/default. \`primary\` is the interactive blue and it
   stays blue in a red product; \`brand\` is the product identity. Confusing them
   is how a red product ends up with blue links, or a blue product with red
   focus rings.

   Only Blue and Red exist because that is what the source had. A third hue is
   five declarations now and a sweep later — open item 29.
`)];
  lines.push(":root,\n[data-brand='blue'] {");
  for (const r of brand) {
    lines.push(`  --zf-color-${r.role.replace('/', '-')}: var(--zf-${r.aliasA.replace('/', '-')});`);
  }
  lines.push('}');
  lines.push("\n[data-brand='red'] {");
  for (const r of brand) {
    lines.push(`  --zf-color-${r.role.replace('/', '-')}: var(--zf-${r.aliasB.replace('/', '-')});`);
  }
  lines.push('}');
  writeFileSync(join(OUT, 'brand.css'), `${lines.join('\n')}\n`);
}

/* theme.css — the Tailwind interface.
   Generated from the same source as the roles, so a role can never exist
   without a utility. Utility names are the role paths verbatim, which makes
   `bg-surface-hover` greppable straight back to a table row — at the cost of a
   doubled prefix in `text-text-default`. That reads awkwardly and appears only
   inside the canon primitives, never in a screen. */
{
  const all = [...semantic, ...brand];
  const groups = new Map();
  for (const r of all) {
    const g = r.role.split('/')[0];
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(r);
  }
  const lines = [BANNER('LAYER 3 — THE TAILWIND INTERFACE',
    `
   Maps every semantic role onto a utility class. Nothing here holds a value.

   \`@theme inline\` is load-bearing: it makes each utility emit
   var(--zf-color-...) rather than resolving the colour at build time, which is
   the only reason [data-zf-theme] and [data-zf-brand] can re-theme a rendered
   page at runtime. A plain @theme block would bake Light in.
`)];
  lines.push('@theme inline {');
  for (const [g, rs] of groups) {
    lines.push(`\n  /* ${g}/* */`);
    for (const r of rs) {
      const flat = r.role.replace('/', '-');
      lines.push(`  --color-${flat}: var(--zf-color-${flat});`);
    }
  }
  lines.push('}');
  writeFileSync(join(OUT, 'theme.css'), `${lines.join('\n')}\n`);
}

/* badge.css — the component layer */
{
  const t = (b, k) => `--zf-color-badge-${b.slug}-${k}`;

  const light = (b) => [
    `  ${t(b, 'surface')}: var(--zf-${b.family}-${b.steps.fill});`,
    `  ${t(b, 'text')}: var(--zf-${b.family}-${b.steps.label});`,
    `  ${t(b, 'solid-surface')}: var(--zf-${b.solidFamily}-${b.steps.solidFill});`,
    `  ${t(b, 'solid-text')}: var(--zf-base-white);`,
  ];

  const dark = (b) => {
    const d = darkSteps(b);
    return [
      `  ${t(b, 'surface')}: var(--zf-${b.family}-${d.fill});`,
      `  ${t(b, 'text')}: var(--zf-${b.family}-${d.label});`,
      `  ${t(b, 'solid-surface')}: var(--zf-${b.solidFamily}-${d.solidFill});`,
      `  ${t(b, 'solid-text')}: var(--zf-${b.solidFamily}-${d.solidLabel});`,
    ];
  };

  const block = (fn, indent = '') => badgeStates
    .flatMap((b) => [`${indent}  /* ${b.name} */`, ...fn(b).map((l) => indent + l), ''])
    .slice(0, -1)
    .join('\n');

  const lines = [`/* ============================================================================
   LAYER 2b — ZF COMPONENT: STATUS BADGE  (14 states x 2 emphases)
   ----------------------------------------------------------------------------
   GENERATED by scripts/gen-tokens.mjs from design-refs/zf-design-cannon.md
   §2.1.6 — not from zf-colours.md, unlike the other four.
   Do not hand-edit. Edit the md and run \`npm run tokens:sync\`.

   28 pairings, each a fill and a label that belong together — which is why they
   are a component token and not two semantic roles. §2.1.6 states the palette
   step AND the resolved hex for every one, so all 28 are verified the same way
   the semantic layer is.

   LIGHT is the specification. DARK IS DERIVED, by the mirror the colour doc
   already uses for every status family: dark step = 2300 - light step, and
   base/white mirrors to {family}/2200. §2.1 specifies one pane only; shipping
   it verbatim would ship a pale tint on a near-black table. Flagged in
   docs/BACKLOG.md as ours to confirm rather than the design's to assume.
   ========================================================================= */
`];

  lines.push(':root,');
  lines.push("[data-theme='light'] {");
  lines.push(block(light));
  lines.push('}');
  lines.push('');
  lines.push("[data-theme='dark'] {");
  lines.push(block(dark));
  lines.push('}');
  lines.push('');
  lines.push('@media (prefers-color-scheme: dark) {');
  lines.push("  :root:not([data-theme='light']) {");
  lines.push(block(dark, '  '));
  lines.push('  }');
  lines.push('}');
  lines.push('');
  lines.push('@theme inline {');
  for (const b of badgeStates) {
    lines.push(`  /* ${b.name} */`);
    for (const k of ['surface', 'text', 'solid-surface', 'solid-text']) {
      lines.push(`  --color-badge-${b.slug}-${k}: var(${t(b, k)});`);
    }
    lines.push('');
  }
  lines.pop();
  lines.push('}');

  writeFileSync(join(OUT, 'badge.css'), `${lines.join('\n')}\n`);
}

/* ── 5 · report ──────────────────────────────────────────────────────────── */
console.log(`primitives : ${primitives.size} values`);
console.log(`semantic   : ${semantic.length} roles x 2 modes`);
console.log(`brand      : ${brand.length} tokens x 2 hues`);
console.log(`badge      : ${badgeStates.length} states x 2 emphases (component layer)`);
console.log(`verified   : ${checked} colour + ${badgeChecked} badge = ${checked + badgeChecked} alias -> hex pairs`);
console.log(`contrast   : ${ratiosChecked} badge pairings measured (28 Light verified against §2.1.6, 28 Dark derived)`);
console.log(`on-roles   : ${pairsChecked} {family}/default + on-{family} pairs measured`);

if (badgeWarnings.length) {
  console.warn(`\n!  ${badgeWarnings.length} DERIVED pairing(s) under AA — a decision, not a bug:\n`);
  for (const w of badgeWarnings) console.warn(`   ${w}`);
  console.warn('\n   §2.1.6 already predicted this one: "Solid Draft ... is now the value to');
  console.warn('   watch if any neutral step is ever retuned." The mirror IS a retune.');
  console.warn('   Recorded in docs/BACKLOG.md. Not auto-corrected — the fix is a design');
  console.warn('   choice between lightening the fill and specifying Dark properly.\n');
}

if (onRoleWarnings.length) {
  console.warn(`\n!  ${onRoleWarnings.length} on-role pairing(s) under AA — zf-button.md §5.2:\n`);
  for (const w of onRoleWarnings) console.warn(`   ${w}`);
  console.warn('\n   This is a SEMANTIC LAYER defect, not a component one. Any surface using');
  console.warn('   the role inherits it. The fix is a ladder shift, not one edit, because');
  console.warn('   primary/hover and primary/selected already sit on blue/1300 — see');
  console.warn('   docs/BACKLOG.md decision 2.\n');
}

if (problems.length) {
  console.error(`\n✗ ${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`   ${p}`);
  process.exit(1);
}
console.log('\n✓ every alias resolves to the hex the table states');
