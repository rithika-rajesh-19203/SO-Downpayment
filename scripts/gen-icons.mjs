#!/usr/bin/env node
/* ============================================================================
   ICON INGEST — design-refs/icons/*.svg  ->  src/canon/icons/geometry.generated.ts

   Drop an SVG in design-refs/icons/, run `npm run icons:sync`. Nothing else:
   no registry entry, no new export, no component change.

   Like scripts/gen-tokens.mjs, the point is not the transcription — it is the
   CHECKING. design-refs/zf-icons.md measured all 51 icons in Figma, so this
   script knows what each one is supposed to be and says so when an export
   disagrees. md §6 found four Figma descriptions stating facts their own nodes
   contradicted; prose drifts, a check does not.
   ========================================================================= */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SRC = join(ROOT, 'design-refs/icons');
const OUT = join(ROOT, 'src/canon/icons/geometry.generated.ts');
const PATHS_TS = join(ROOT, 'src/canon/icons/paths.ts');

const problems = [];
const warnings = [];

/* ── the roster and the md's facts, read from paths.ts so they cannot drift ── */
const paths = readFileSync(PATHS_TS, 'utf8');

const listFrom = (name) => {
  const m = new RegExp(`export const ${name}[^=]*=\\s*\\[([\\s\\S]*?)\\] as const`).exec(paths);
  if (!m) throw new Error(`gen-icons: could not read ${name} from paths.ts`);
  return [...m[1].matchAll(/'([a-z0-9-]+)'/g)].map((x) => x[1]);
};

const ICON_NAMES = listFrom('ICON_NAMES');
const STROKED = new Set(listFrom('STROKED_ICONS'));
const RETIRED = new Set(listFrom('RETIRED_ICON_NAMES'));
//  The md states which icons are stroked — but only for the 38 it names. For the
//  other 9 it says nothing, so there is nothing to check an export against and
//  claiming otherwise would be inventing a fact. Reported, not verified.
const ABSENT_FROM_MD = new Set(listFrom('ICONS_ABSENT_FROM_MD'));
const STROKE_WEIGHT = Number(/export const ICON_STROKE_WEIGHT = ([\d.]+)/.exec(paths)[1]);


/* ── shapes become paths ─────────────────────────────────────────────────────
   md §1.7 rule 1 and §5.5 both want one node with one `d`: "multiple subpaths
   in one vector is one node and one fill". Figma's own `apps` glyph had to be
   flattened from nine <rect>s for exactly that reason.

   But most icon libraries draw with <circle>, <rect>, <line> and <polyline> —
   Lucide, Feather and Heroicons all do — so refusing them means refusing every
   third-party set. Converting is deterministic, so convert rather than refuse.
   The output is still one node and one fill; the source markup is not. */
const num = (el, attr, dflt = 0) => {
  const m = new RegExp(`\\b${attr}\\s*=\\s*["']([^"']*)["']`).exec(el);
  return m ? Number.parseFloat(m[1]) : dflt;
};
const pts = (el) => {
  const m = /\bpoints\s*=\s*["']([^"']*)["']/.exec(el);
  const n = (m?.[1] ?? '').trim().split(/[\s,]+/).map(Number).filter((v) => !Number.isNaN(v));
  const out = [];
  for (let i = 0; i + 1 < n.length; i += 2) out.push(`${n[i]} ${n[i + 1]}`);
  return out;
};

function shapeToPath(tag, el) {
  if (tag === 'line') {
    return `M ${num(el, 'x1')} ${num(el, 'y1')} L ${num(el, 'x2')} ${num(el, 'y2')}`;
  }
  if (tag === 'polyline' || tag === 'polygon') {
    const p = pts(el);
    if (!p.length) return null;
    return `M ${p.join(' L ')}${tag === 'polygon' ? ' Z' : ''}`;
  }
  if (tag === 'circle' || tag === 'ellipse') {
    const cx = num(el, 'cx'), cy = num(el, 'cy');
    const rx = tag === 'circle' ? num(el, 'r') : num(el, 'rx');
    const ry = tag === 'circle' ? num(el, 'r') : num(el, 'ry', num(el, 'rx'));
    if (!rx || !ry) return null;
    //  Two half-arcs: a single arc cannot describe a closed ellipse.
    return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} `
         + `A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  }
  if (tag === 'rect') {
    const x = num(el, 'x'), y = num(el, 'y');
    const w = num(el, 'width'), h = num(el, 'height');
    if (!w || !h) return null;
    let rx = num(el, 'rx', num(el, 'ry')), ry = num(el, 'ry', rx);
    rx = Math.min(rx, w / 2); ry = Math.min(ry, h / 2);
    if (!rx || !ry) return `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
    return `M ${x + rx} ${y} H ${x + w - rx} A ${rx} ${ry} 0 0 1 ${x + w} ${y + ry} `
         + `V ${y + h - ry} A ${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h} `
         + `H ${x + rx} A ${rx} ${ry} 0 0 1 ${x} ${y + h - ry} `
         + `V ${y + ry} A ${rx} ${ry} 0 0 1 ${x + rx} ${y} Z`;
  }
  return null;
}

/* ── read the drop folder ──────────────────────────────────────────────────── */
const files = existsSync(SRC)
  ? readdirSync(SRC).filter((f) => f.toLowerCase().endsWith('.svg')).sort()
  : [];

/**
 * `apps.svg`, `icon-apps.svg` and `icon / apps.svg` all mean `apps`. Figma
 * exports the component name verbatim, and md §1 says every one is
 * `icon / {name}` — so the prefix and the spaces around the slash are noise.
 */
const nameOf = (file) => basename(file, '.svg')
  .trim()
  .replace(/\s*\/\s*/g, '-')
  //  Two exporter prefixes, both noise. Figma's frames are named `icon / {name}`
  //  and Zoho's icon set exports as `zfi-{name}.svg`. Stripping them here is what
  //  makes "drop the file in, run the sync" true without renaming anything —
  //  and a rename is exactly where a roster name and a file quietly diverge.
  .replace(/^icon[-_\s]*/i, '')
  //  Zoho's icon set exports as `zfi-{name}.svg`, and its line-unfilled family
  //  adds a second segment: `zfi-lu-export.svg`. Both are exporter noise.
  .replace(/^zfi[-_\s]*/i, '')
  .replace(/^lu[-_\s]*/i, '')
  .replace(/\s+/g, '-')
  .toLowerCase();

/*
 * FILENAME -> ROSTER NAME, for the exports whose names are not the roster's.
 *
 * A prefix strip is mechanical; this is not. `tick_filled` and `check` are
 * different words and `refresh-thick` carries a weight the roster does not name,
 * so nothing can derive one from the other. The alternative is renaming the file
 * on the way in, which is exactly where a roster name and its source quietly
 * diverge — six months later nobody can tell which export produced which glyph.
 *
 * An alias is the same fact written down instead: THIS file is THAT name. It is
 * reviewable, it survives a re-export, and `icons:sync` still refuses to invent
 * a roster entry.
 */
const FILE_ALIASES = {
  tick_filled: 'check',
  'refresh-thick': 'refresh',
  //  The roster pairs a shape with a direction — `chevron-down`, `arrow-down`,
  //  `caret-down` — and `down-arrow` inverts that, while `arrow-down` is already
  //  a different glyph (an arrow with a shaft). The alias keeps the export's own
  //  filename and the roster's own grammar, without either bending.
  'down-arrow': 'caret-down-bold',
  drag: 'drag-handle',
};

//  Names paths.ts supplies geometry for by hand — currently the derived chevron
//  family. They render today, so "no SVG dropped" is not "no geometry".
const DERIVED = new Set(
  [...(/const derivedPaths[^{]*\{([\s\S]*?)\n\};/.exec(paths)?.[1] ?? '')
    //  Anchored to the two-space indent of a top-level key, and the quotes are
    //  OPTIONAL: `chevron-down` needs them and `mail` does not, so a bare
    //  identifier was silently missed and reported as a placeholder for geometry
    //  that renders perfectly well. Matching unanchored would also pick up the
    //  `d:` and `strokeWidth:` inside each entry.
    .matchAll(/^ {2}'?([a-z0-9-]+)'?\s*:/gm)].map((m) => m[1]),
);

const geometry = new Map();
const absentReport = [];

for (const file of files) {
  const raw = nameOf(file);
  const name = FILE_ALIASES[raw] ?? raw;
  const svg = readFileSync(join(SRC, file), 'utf8');
  const at = (msg) => problems.push(`${file}: ${msg}`);

  if (RETIRED.has(name)) {
    at(`'${name}' is in RETIRED_ICON_NAMES — md §12.1 records it as an icon that does not exist. `
      + 'If it has been drawn since, remove it from that list first.');
    continue;
  }
  if (!ICON_NAMES.includes(name)) {
    at(`'${name}' is not in ICON_NAMES. Add the line to src/canon/icons/paths.ts, then re-run. `
      + 'Not added automatically — the roster is the contract, not a side effect of a file landing.');
    continue;
  }

  //  md §1.7 rule 1: authored at the 16px slot. A 24px export scaled by CSS is
  //  a different drawing, and the difference shows at small sizes.
  const viewBox = /viewBox\s*=\s*["']([^"']+)["']/i.exec(svg)?.[1]?.trim().split(/[\s,]+/);
  if (!viewBox) {
    at('no viewBox. Export from Figma rather than hand-writing the file.');
    continue;
  }
  const [minX, minY, w, h] = viewBox.map(Number);
  if (![minX, minY, w, h].every(Number.isFinite) || w <= 0 || h <= 0) {
    at(`viewBox is "${viewBox.join(' ')}" — unreadable.`);
    continue;
  }
  //  The viewBox is CARRIED, not required to be 16. md §1.7 rule 1 says the ZF
  //  glyphs are authored at the 16px slot, and a foreign set almost always is
  //  not — Lucide and Heroicons are 24. Since the rendered size comes from the
  //  slot token either way, the only thing that matters is that the glyph fills
  //  its own box. A non-16 box on a name the md measured is worth flagging; on
  //  any other name it is just how that set is drawn.
  if ((w !== 16 || h !== 16) && !ABSENT_FROM_MD.has(name)) {
    warnings.push(`${file}: viewBox is "${viewBox.join(' ')}"; md §1.7 rule 1 authors ZF glyphs at 16. Carried as-is.`);
  }
  if (w !== h) {
    warnings.push(`${file}: viewBox is not square (${w} x ${h}) — the glyph will letterbox in a square slot.`);
  }
  const viewBoxAttr = `${minX} ${minY} ${w} ${h}`;

  //  md §5.3: `apps` was nine <rect>s and had to be flattened before it could be
  //  one path. A shape element carries no `d`, so it cannot be ingested at all.
  //  A path that is `fill="none"` with NO stroke paints nothing — it is a
  //  bounding box the exporter left behind, and merging it into the glyph turns
  //  a 16px tick into a filled square. `tick_filled.svg` ships one at
  //  512 x 512.1. A STROKED path is legitimately fill="none", so the test is
  //  both halves.
  const ds = [];
  for (const m of svg.matchAll(/<path\b([^>]*)\bd\s*=\s*["']([^"']+)["']([^>]*)>/gi)) {
    const attrs = `${m[1]} ${m[3]}`;
    const noFill = /fill\s*=\s*["']none["']|fill\s*:\s*none/i.test(attrs);
    const hasStroke = /stroke\s*=\s*["'](?!none)[^"']+["']|stroke\s*:\s*(?!none)/i.test(attrs);
    if (noFill && !hasStroke) {
      warnings.push(`${file}: dropped a fill="none" path with no stroke — a bounding box, not ink.`);
      continue;
    }
    ds.push(m[2].trim());
  }

  const converted = [];
  for (const m of svg.matchAll(/<(rect|circle|ellipse|line|polygon|polyline)\b([^>]*)>/gi)) {
    const d = shapeToPath(m[1].toLowerCase(), m[2]);
    if (d) converted.push(d);
    else problems.push(`${file}: could not convert a <${m[1]}> — it has no usable dimensions.`);
  }
  if (converted.length) {
    warnings.push(`${file}: converted ${converted.length} shape element(s) to path data. `
      + 'One node, one fill — md §5.5.');
  }
  ds.push(...converted);

  if (!ds.length) {
    at('no drawable geometry found — no <path>, <rect>, <circle>, <line>, <polyline> or <polygon>.');
    continue;
  }

  //  Merging several <path> into one `d` is deliberate. md §5.5 lists twelve
  //  icons that hold multiple subpaths in one vector and says a cleanup must not
  //  "fix" it — one node, one fill, one recolour.
  //
  //  BUT A LEADING `m` HAS TO BECOME `M` FIRST, and getting this wrong is silent.
  //  Per the SVG spec, "if a relative moveto (m) appears as the first element of
  //  the path, then it is treated as a pair of absolute coordinates" — so an
  //  Illustrator export whose second <path> starts `m387.16,112.78` means those
  //  coordinates absolutely. Concatenated behind another path it stops being
  //  first, and the same `m` becomes relative to wherever the previous path's
  //  last subpath began.
  //
  //  Measured on `zfi-mail.svg`: the previous path closes at (472, 346), so the
  //  envelope's flap landed at (859, 459) in a 512 x 446 box — outside it
  //  entirely. The glyph rendered as an empty rounded rectangle and nothing
  //  warned. `zfi-pdf.svg` was displaced by (100.14, 40) the same way.
  //
  //  Only the FIRST path keeps its `m`: there, it already means what it says.
  const d = ds
    .map((seg, i) => (i === 0 ? seg : seg.replace(/^m/, 'M')))
    .join(' ')
    .replace(/\s+/g, ' ');

  /* ── stroked or filled, and does that match what Figma holds? ───────────── */
  const strokeAttr = /stroke\s*=\s*["']([^"']+)["']/i.exec(svg)?.[1];
  const strokeWidthAttr = /stroke-width\s*=\s*["']([\d.]+)["']/i.exec(svg)?.[1];
  const isStroked = Boolean(
    (strokeAttr && strokeAttr.toLowerCase() !== 'none') || strokeWidthAttr,
  );
  if (ABSENT_FROM_MD.has(name)) {
    //  No §3.1 row, so no expectation to compare against.
    absentReport.push(`${name} (${isStroked ? `stroked ${strokeWidthAttr ?? '?'}` : 'filled'})`);
  } else if (isStroked !== STROKED.has(name)) {
    warnings.push(
      `${file}: exported ${isStroked ? 'STROKED' : 'FILLED'} but md §3.1 measures '${name}' as `
      + `${STROKED.has(name) ? 'stroked' : 'filled'}. Either the wrong glyph was exported, or Figma `
      + 'changed and zf-icons.md needs re-measuring.');
  }

  //  md defect 4: four weights (1.2 / 1.25 / 1.5 / 2.2857) normalised to one.
  //  Anything else is a stale export taken before that fix.
  if (strokeWidthAttr && !ABSENT_FROM_MD.has(name) && Number(strokeWidthAttr) !== STROKE_WEIGHT) {
    warnings.push(
      `${file}: stroke-width is ${strokeWidthAttr}, expected ${STROKE_WEIGHT}. `
      + 'md defect 4 normalised all 17 stroked icons to one weight — this looks like a stale export. '
      + `Emitted at ${STROKE_WEIGHT} regardless.`);
  }

  if (geometry.has(name)) {
    at(`'${name}' is already defined by another file. Two exports, one name.`);
    continue;
  }

  //  Carry the SOURCE stroke width. For the ZF set every export is already
  //  1.25 so this changes nothing; for a foreign set, forcing ZF's weight onto
  //  a glyph drawn at another one would redraw it.
  const weight = strokeWidthAttr ? Number(strokeWidthAttr) : STROKE_WEIGHT;
  geometry.set(name, {
    d,
    viewBox: viewBoxAttr,
    ...(isStroked ? { strokeWidth: weight } : {}),
  });
}

/* ── emit ──────────────────────────────────────────────────────────────────── */
const entries = [...geometry.entries()].sort(([a], [b]) => a.localeCompare(b));

const body = entries.length
  ? entries.map(([name, g]) => {
    const key = /^[a-z][a-z0-9]*$/.test(name) ? name : `'${name}'`;
    const stroke = g.strokeWidth ? `, strokeWidth: ${g.strokeWidth}` : '';
    const vb = g.viewBox === '0 0 16 16' ? '' : `, viewBox: '${g.viewBox}'`;
    return `  ${key}: { d: '${g.d}'${vb}${stroke} },`;
  }).join('\n')
  : '';

const noSvg = ICON_NAMES.filter((n) => !geometry.has(n));
const derivedOnly = noSvg.filter((n) => DERIVED.has(n));
const noGeometry = noSvg.filter((n) => !DERIVED.has(n));

writeFileSync(OUT, `/* ============================================================================
   GENERATED by scripts/gen-icons.mjs from design-refs/icons/*.svg.
   Do not hand-edit. Drop SVGs in that folder and run \`npm run icons:sync\`.

   ${entries.length} of ${ICON_NAMES.length} glyphs ingested from SVG.
   Every name with no entry here renders a visible dashed placeholder in the
   canon under Foundations/Icons — that IS the tracking mechanism, so it is never
   silenced with invented geometry.

   \`fill\`, \`stroke\`, \`width\` and \`height\` are stripped on ingest: a glyph must
   inherit currentColor or it cannot follow the theme. Colour is Icon's job.
   ========================================================================= */

export interface GeneratedGeometry {
  d: string;
  /** Omitted when it is the 16 x 16 slot md §1.7 authors ZF glyphs at. */
  viewBox?: string;
  strokeWidth?: number;
}

export const generatedPaths: Record<string, GeneratedGeometry> = {${entries.length ? `\n${body}\n` : ''}};
`);

/* ── report ────────────────────────────────────────────────────────────────── */
console.log(`roster     : ${ICON_NAMES.length} names`);
console.log(`svgs found : ${files.length} in design-refs/icons/`);
console.log(`ingested   : ${entries.length}`);
console.log(`stroked    : ${entries.filter(([, g]) => g.strokeWidth).length} at ${STROKE_WEIGHT}px`
  + `  ·  filled: ${entries.filter(([, g]) => !g.strokeWidth).length}`);
if (derivedOnly.length) {
  console.log(`derived    : ${derivedOnly.length} render from paths.ts, no SVG needed`
    + ` (${derivedOnly.join(' ')})`);
}
console.log(`placeholder: ${noGeometry.length} with no geometry at all`);

if (warnings.length) {
  console.warn(`\n!  ${warnings.length} warning(s) — emitted anyway:\n`);
  for (const w of warnings) console.warn(`   ${w}`);
}

if (problems.length) {
  console.error(`\n✗ ${problems.length} file(s) skipped:\n`);
  for (const p of problems) console.error(`   ${p}`);
  process.exit(1);
}

if (absentReport.length) {
  console.log(`\n   ${absentReport.length} glyph(s) have no §3.1 row, so stroke was reported not checked:`);
  console.log(`   ${absentReport.join(', ')}`);
}
if (noGeometry.length && noGeometry.length <= 60) {
  console.log(`\n   still needed: ${noGeometry.join(' ')}`);
}
console.log(`\n✓ ${OUT.replace(ROOT, '.')}`);
