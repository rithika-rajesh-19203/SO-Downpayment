#!/usr/bin/env node
/* ============================================================================
   BOUNDARY CHECK  —  run by `npm run check` and `npm run build`.
   ----------------------------------------------------------------------------
   Documentation asks nicely. This fails the build. It is the difference between
   a design system and a folder of components.

   Eight rules:
     1. No raw design values outside tokens/primitives.css and tokens/scale.css.
     2. Screens import '@canon' only — no deep paths, no relative climbing.
     3. Nothing imports from _incoming/.
     4. Screens contain no styled bare markup.
     5. registry.json <-> '@canon' exports <-> folders on disk all agree, and
        every entry's status / category / use is valid.
     6. Every component folder has a story.
     7. Nothing outside tokens/ references a PRIMITIVE. This is the md's §3
        "one rule": a component consumes semantic roles only. Both wrong forms
        render identically today and only break when the theme changes.
     8. The icon layer is reviewable — icons/ has a story.
   ========================================================================= */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const CANON = join(SRC, 'canon');
const TOKENS_DIR = join(CANON, 'tokens');
/* The only two files in the repo allowed a raw value. */
const RAW_VALUE_FILES = [
  join(TOKENS_DIR, 'primitives.css'),   // colour
  join(TOKENS_DIR, 'scale.css'),        // type, space, radius, elevation
];
const REGISTRY_FILE = join(CANON, 'registry.json');
const PUBLIC_API = join(CANON, 'index.ts');

const failures = [];
const fail = (file, line, rule, msg) =>
  failures.push({ file: relative(ROOT, file), line, rule, msg });

/* ── file walking ───────────────────────────────────────────────────────── */
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      walk(full, out);
    } else if (['.ts', '.tsx', '.css'].includes(extname(entry))) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(SRC);
const lines = (f) => readFileSync(f, 'utf8').split('\n');

/**
 * Blank out comment bodies while preserving newlines, so line numbers still
 * line up. Handles BLOCK comments that span lines, which a per-line strip
 * cannot — and that matters: this system documents its rejected values, so
 * "the source's #F8525A put white at 3.31:1 and failed" has to be sayable in a
 * comment without tripping rule 1.
 *
 * Correspondingly, a hex on the same line as a block-comment CLOSE is now
 * caught, where before it hid behind the opener.
 */
function stripComments(text) {
  let out = '';
  let inBlock = false;
  let inLine = false;
  for (let i = 0; i < text.length; i += 1) {
    const two = text.slice(i, i + 2);
    if (text[i] === '\n') { inLine = false; out += '\n'; continue; }
    if (inBlock) {
      if (two === '*/') { inBlock = false; out += '  '; i += 1; } else { out += ' '; }
      continue;
    }
    if (inLine) { out += ' '; continue; }
    if (two === '/*') { inBlock = true; out += '  '; i += 1; continue; }
    if (two === '//') { inLine = true; out += '  '; i += 1; continue; }
    out += text[i];
  }
  return out;
}

/** File contents with every comment blanked, split into lines. */
const codeLines = (f) => stripComments(readFileSync(f, 'utf8')).split('\n');

/* ── RULE 1: no raw design values outside tokens.css ────────────────────── */
const RAW_VALUE_PATTERNS = [
  { re: /#[0-9a-fA-F]{3,8}\b/, what: 'hex colour' },
  { re: /\b(?:rgba?|hsla?)\s*\(/, what: 'rgb()/hsl() colour' },
  // Tailwind arbitrary values: bg-[#fff], text-[13px], w-[247px]
  { re: /(?:^|[\s"'`:])(?:[a-z-]+)-\[[^\]]+\]/, what: 'arbitrary Tailwind value' },
];

// A comment that leaked into live CSS.
//
// CSS has NO nested block comments: the first close-marker ends the block. So an
// inline comment written inside a larger comment terminates it early and dumps
// the remaining prose into the stylesheet as declarations. It still BUILDS —
// Lightning CSS only warns — and the tokens after the leak silently stop being
// emitted. That is the worst possible failure mode for a token file.
//
// Detection is cheap and high-signal: after comments are stripped, real CSS
// never needs a non-ASCII character, whereas the prose in this repo is full of
// them. One escaped box-drawing character means a comment is open that should
// have closed.
//
// This exact bug shipped in primitives.css and in THIS file's first draft of
// the comment above, which is a fair indication of how easy it is to write.
const LEAKED_PROSE = /[^\x00-\x7F]/;

for (const file of files) {
  if (extname(file) !== '.css') continue;
  codeLines(file).forEach((code, i) => {
    if (LEAKED_PROSE.test(code)) {
      fail(file, i + 1, 'comment-leaked-into-css',
        `non-ASCII text outside a comment — a block comment above this line was closed early by a nested \`*/\`. CSS has no nested comments.\n      ${(lines(file)[i] ?? '').trim()}`);
    }
  });
}

for (const file of files) {
  if (RAW_VALUE_FILES.includes(file)) continue;             // the two exemptions
  // Only the FOUNDATIONS story may print raw specs as text — it documents the
  // palette. Any other story quoting a hex is a component skipping the tokens.
  if (file.endsWith('.stories.tsx') && file.startsWith(TOKENS_DIR)) continue;
  codeLines(file).forEach((code, i) => {
    for (const { re, what } of RAW_VALUE_PATTERNS) {
      if (re.test(code)) {
        fail(file, i + 1, 'no-raw-values',
          `${what} found. Colour belongs in canon/tokens/primitives.css and dimensions in canon/tokens/scale.css — then consume the role's utility here.\n      ${(lines(file)[i] ?? '').trim()}`);
        break;
      }
    }
  });
}

/* ── RULE 2 + 3 + 4: import boundaries and screen purity ────────────────── */
const IMPORT_RE = /(?:^|\n)\s*(?:import|export)[^'"]*from\s*['"]([^'"]+)['"]/g;

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const isApp = file.startsWith(join(SRC, 'app'));

  for (const [, spec] of text.matchAll(IMPORT_RE)) {
    const lineNo = text.slice(0, text.indexOf(spec)).split('\n').length;

    // Rule 3 — _incoming is quarantined.
    if (spec.includes('_incoming') && !file.includes('_incoming')) {
      fail(file, lineNo, 'no-incoming-imports',
        `imports '${spec}'. Components in _incoming/ are not yet admitted to the canon — promote it first (see src/canon/_incoming/README.md).`);
    }

    if (!isApp) continue;

    // Rule 2 — the application's only door into the canon is '@canon'.
    if (spec === '@canon') continue;
    if (spec.startsWith('@canon/')) {
      fail(file, lineNo, 'no-deep-canon-imports',
        `imports '${spec}'. Screens must import from '@canon' only, so component internals stay refactorable.`);
    }
    if (/(\.\.\/)+canon\//.test(spec)) {
      fail(file, lineNo, 'no-deep-canon-imports',
        `imports '${spec}' by relative path. Use '@canon'.`);
    }
  }

  // Rule 4 — a styled bare element in a screen is how a parallel, unmanaged
  // design system starts growing inside the application.
  if (isApp) {
    lines(file).forEach((line, i) => {
      if (/<(div|span|p|h[1-6]|button|table|input|ul|li)\b[^>]*className=/.test(line)) {
        fail(file, i + 1, 'no-styled-markup-in-app',
          `styled bare element in a screen. Compose from '@canon' components instead.\n      ${(lines(file)[i] ?? '').trim()}`);
      }
    });
  }
}

/* ── RULE 5: registry validity, and parity with exports + disk ──────────── */
const registry = JSON.parse(readFileSync(REGISTRY_FILE, 'utf8')).components;
const registryNames = new Set(registry.map((c) => c.name));

/* TypeScript widens JSON string literals, so registry.ts cannot check these.
   This is where a `status: "stabel"` typo gets caught. */
const VALID_STATUS = ['stable', 'incoming', 'deprecated'];
const VALID_CATEGORY = [
  'primitive', 'form', 'action', 'data-display',
  'navigation', 'feedback', 'overlay', 'pattern',
];

for (const c of registry) {
  if (!c.name || typeof c.name !== 'string') {
    fail(REGISTRY_FILE, 0, 'invalid-registry-entry', `entry with a missing name: ${JSON.stringify(c)}`);
    continue;
  }
  if (!VALID_STATUS.includes(c.status)) {
    fail(REGISTRY_FILE, 0, 'invalid-registry-entry',
      `'${c.name}' has status '${c.status}'. Expected one of: ${VALID_STATUS.join(', ')}.`);
  }
  if (!VALID_CATEGORY.includes(c.category)) {
    fail(REGISTRY_FILE, 0, 'invalid-registry-entry',
      `'${c.name}' has category '${c.category}'. Expected one of: ${VALID_CATEGORY.join(', ')}.`);
  }
  if (!c.use || c.use.length < 10) {
    fail(REGISTRY_FILE, 0, 'invalid-registry-entry',
      `'${c.name}' needs a real 'use' line — one sentence on when a screen should reach for it.`);
  }
}

for (const dupe of new Set(registry.map((c) => c.name).filter((n, i, a) => a.indexOf(n) !== i))) {
  fail(REGISTRY_FILE, 0, 'invalid-registry-entry', `'${dupe}' is registered more than once.`);
}

const publicApi = readFileSync(PUBLIC_API, 'utf8');
const exported = new Set();
for (const [, names] of publicApi.matchAll(/export\s*\{([^}]+)\}/g)) {
  for (const raw of names.split(',')) {
    const name = raw.trim().split(/\s+as\s+/).pop()?.trim();
    if (name) exported.add(name);
  }
}
// Registry/tooling exports are infrastructure, not components.
for (const infra of ['registry', 'stableComponents', 'incomingComponents', 'findComponent']) {
  exported.delete(infra);
}

for (const c of registry) {
  if (c.status === 'incoming') {
    if (exported.has(c.name)) {
      fail(PUBLIC_API, 0, 'incoming-must-not-export',
        `'${c.name}' is status:incoming but is exported from '@canon'. Either promote it or remove the export.`);
    }
    continue;
  }
  if (!exported.has(c.name)) {
    fail(PUBLIC_API, 0, 'registry-export-mismatch',
      `'${c.name}' is status:${c.status} in registry.json but is not exported from '@canon'.`);
  }
  if (c.status === 'deprecated' && !c.replacedBy) {
    fail(REGISTRY_FILE, 0, 'deprecated-needs-replacement',
      `'${c.name}' is deprecated but has no replacedBy.`);
  }
}

for (const name of exported) {
  if (!registryNames.has(name)) {
    fail(REGISTRY_FILE, 0, 'registry-export-mismatch',
      `'${name}' is exported from '@canon' but missing from registry.json. Add an entry so it appears in the canon.`);
  }
}

/* ── RULE 6: every component folder has a story ─────────────────────────── */
for (const area of ['components', 'patterns', '_incoming']) {
  const dir = join(CANON, area);
  if (!existsSync(dir)) continue;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    if (!readdirSync(full).some((f) => f.endsWith('.stories.tsx'))) {
      fail(full, 0, 'missing-story',
        `'${entry}' has no .stories.tsx. A component that cannot be reviewed in isolation cannot be admitted.`);
    }
    if (area !== '_incoming' && !registryNames.has(basename(entry))) {
      fail(full, 0, 'registry-export-mismatch', `folder '${area}/${entry}' has no registry.json entry.`);
    }
  }
}

/* ── RULE 7: nothing outside tokens/ references a PRIMITIVE ──────────────────
   The md's §3 "one rule", and the reason the token layer is split in three:

     OK   color: var(--zf-text-default);    a role — follows the theme
     BAD  color: var(--zf-neutral-1900);    a primitive — skips the semantic layer
     BAD  color: #222536;                   invisible to the system (rule 1)

   Both wrong forms render identically today. They break later, when the theme
   changes and they do not follow. md §2.16.2 is the cost of not checking this:
   one component carried #21263C *and* #21263D for a single body colour, 0.71 ΔE
   apart — closer than any monitor or eye resolves — spread across 34 nodes.
   Nobody chose them; they arrived by paste and nudge. No review that is not a
   script will ever find that.

   tokens/semantic.css and tokens/brand.css are the ONLY legitimate consumers,
   which is exactly why the whole tokens/ directory is skipped here. */
const PRIMITIVE_FAMILIES = 'neutral|blue|green|red|orange|cyan|purple|sky|yellow';
const PRIMITIVE_PATTERNS = [
  {
    re: new RegExp('var\\(\\s*--zf-(?:' + PRIMITIVE_FAMILIES + ')-\\d{3,4}\\s*[,)]'),
    what: 'primitive custom property',
  },
  { re: /var\(\s*--zf-base-(?:white|black)\s*[,)]/, what: 'base primitive' },
  // Tailwind form. Primitives are deliberately absent from @theme, so a class
  // like `bg-neutral-1900` silently resolves to nothing at all — it does not
  // even fail loudly. md §2.22.10 calls this class of bug "one bound paint, to
  // a library you do not own".
  {
    re: new RegExp(
      '(?:^|[\\s"\'`:])(?:bg|text|border|fill|stroke|ring|outline|shadow|from|to|via)-(?:'
      + PRIMITIVE_FAMILIES + ')-\\d{3,4}\\b',
    ),
    what: 'primitive Tailwind utility',
  },
];

for (const file of files) {
  if (file.startsWith(TOKENS_DIR)) continue;   // the semantic layer's whole job
  codeLines(file).forEach((code, i) => {
    for (const { re, what } of PRIMITIVE_PATTERNS) {
      if (re.test(code)) {
        fail(file, i + 1, 'no-primitive-references',
          `${what} used outside tokens/. Components consume SEMANTIC ROLES only — add or reuse a role in canon/tokens/semantic.css and point at that.\n      ${(lines(file)[i] ?? '').trim()}`);
        break;
      }
    }
  });
}

/* ── RULE 8: the icon layer is reviewable ────────────────────────────────────
   icons/ is one component over a registry of glyphs rather than a folder per
   component, so rule 6's per-folder sweep does not reach it. It still has to be
   viewable in isolation: the grid is the only place an unexported glyph or a
   wrong optical weight becomes obvious. md §2.7.6 and §2.10.8 are both stroke
   weights that looked correct inside a component and wrong in a grid. */
const ICONS_DIR = join(CANON, 'icons');
if (existsSync(ICONS_DIR)
  && !readdirSync(ICONS_DIR).some((f) => f.endsWith('.stories.tsx'))) {
  fail(ICONS_DIR, 0, 'missing-story',
    'canon/icons has no .stories.tsx. The icon grid is where an unexported glyph or a wrong stroke weight shows up.');
}

/* ── RULE 9: the scale is the scale ─────────────────────────────────────────
   Rules 1 and 7 stop a raw value appearing OUTSIDE tokens/. Nothing stopped a
   retired value being re-added INSIDE scale.css, which is the one file allowed
   to hold dimensions — and that is where the drift came from in the first
   place: 9, 11.25, 14, 15, 19 and 32 were all real sizes in the source, and
   every one of them arrived with a component rather than being chosen.

   Two checks, both from the "Retired" section of design-refs/zf-scales.md:

     a. no retired value is reintroduced
     b. ONE LINE-HEIGHT PER SIZE AND CASE

   (b) is the rule the whole type section exists to enforce. 13px carried five
   line-heights in the source — 20, 20.8, AUTO, 21, 16 — and 20.8 is ambiguous
   by construction, being both 13 x 1.6 and 16 x 1.3. The scale bends the rule
   once, at 11px, because upper-case text has no descenders and legitimately
   takes different leading. That bend has to be DECLARED, with a reason, in
   SCALE_EXCEPTIONS below. An undeclared second line-height fails.

   A rule that only lives in a document is a rule that drifts. */
const SCALE_FILE = join(TOKENS_DIR, 'scale.css');

const RETIRED = {
  'font size': [9, 11.25, 14, 15, 19, 32],
  'line-height': [20.8, 21, 22.4, 28.8],
  spacing: [1, 3, 5, 7, 11, 14, 15, 30],
  radius: [1, 1.6, 3, 7, 9, 10, 11, 11.75, 14, 18],
};

/*  A retired value put back ON PURPOSE, by the design owner, with the reason
    recorded here rather than in a commit message.

    The guard exists because "every one of them arrived with a component rather
    than being chosen" — it is aimed at accidental re-entry. A deliberate choice
    is the case it was never meant to catch, and routing around it by renaming
    the token would put the value OUTSIDE the scale it belongs to, which is
    strictly worse than declaring it here. Same bargain as SCALE_EXCEPTIONS
    below: one entry, and it costs a sentence.  */
const RETIRED_EXCEPTIONS = {
  spacing: {
    30: 'ZF-CREATE-PAGE.md §3.1. The form grid insets its input by 30 on the trailing edge, and 30 is a LEGAL step on this scale — step N is 2N px, so it is step 15. It was never declared, not designed out: the ramp reads 0 1 2 3 4 5 6 8 10 12 16 20 and simply skips it. Declaring it also collapses the duplicate `--zf-chrome-section-pad: 30px` the detail card was carrying, so 30 now has one owner instead of two.',
  },
  'font size': {
    14: 'The tab label. Design decision, 28 Aug 2026. The ramp jumps 13 -> 16 and a tab sits between: at 13 it reads as body text that happens to be clickable, at 16 it competes with the section heading beside it. Re-entered as `body-lg` ON the type scale so `Text` can express it and the one-line-height rule still applies, rather than as a chrome token outside it.',
  },
};

//  size -> { lineHeight, reason }. One entry, and it costs a sentence to add.
const SCALE_EXCEPTIONS = {
  overline: {
    lineHeight: 17.6,
    reason: 'UPPER case at 11px — no descenders, so different leading is legitimate. zf-scales.md lists overline separately for exactly this. Open item 39.',
  },
};

if (existsSync(SCALE_FILE)) {
  const scale = stripComments(readFileSync(SCALE_FILE, 'utf8'));
  const scaleLines = scale.split('\n');
  const num = (v) => Number.parseFloat(v);

  //  Collected as size -> Set of line-heights, so (b) can be checked at the end.
  const heights = new Map();
  const sizeOf = new Map();

  scaleLines.forEach((code, i) => {
    const at = (rule, msg) => fail(SCALE_FILE, i + 1, rule, msg);

    let m = /^\s*--zf-text-([a-z0-9-]+?)-line-height:\s*([\d.]+)px/.exec(code);
    if (m) {
      const [, name, v] = m;
      const value = num(v);
      const allowed = SCALE_EXCEPTIONS[name]?.lineHeight === value;
      if (RETIRED['line-height'].includes(value)) {
        at('retired-scale-value', `line-height ${value} is retired (zf-scales.md). --zf-text-${name}`);
      }
      if (value === 17.6 && !allowed) {
        at('retired-scale-value', `line-height 17.6 is retired for every size except overline. --zf-text-${name}`);
      }
      (heights.get(name) ?? heights.set(name, new Set()).get(name)).add(value);
      return;
    }

    //  Must run AFTER the line-height branch above, and must reject the two
    //  sub-key suffixes explicitly: `--zf-text-overline-letter-spacing: 0.6px`
    //  otherwise reads as a size called `overline-letter-spacing`.
    m = /^\s*--zf-text-([a-z0-9-]+):\s*([\d.]+)px/.exec(code);
    if (m && !/-(?:line-height|letter-spacing)$/.test(m[1])) {
      const [, name, v] = m;
      sizeOf.set(name, num(v));
      if (RETIRED['font size'].includes(num(v)) && !RETIRED_EXCEPTIONS['font size'][num(v)]) {
        at('retired-scale-value', `font size ${v} is retired (zf-scales.md). --zf-text-${name}`);
      }
      return;
    }

    m = /^\s*--zf-space-(\d+):\s*([\d.]+)px/.exec(code);
    if (m && RETIRED.spacing.includes(num(m[2])) && !RETIRED_EXCEPTIONS.spacing?.[num(m[2])]) {
      at('retired-scale-value', `spacing ${m[2]} is retired (zf-scales.md). The scale is named by STEP, so a step of ${m[1]} must resolve to ${Number(m[1]) * 2}px.`);
      return;
    }

    m = /^\s*--zf-radius-([a-z0-9]+):\s*([\d.]+)px/.exec(code);
    if (m && RETIRED.radius.includes(num(m[2])) && !RETIRED_EXCEPTIONS.radius?.[num(m[2])]) {
      at('retired-scale-value', `radius ${m[2]} is retired (zf-scales.md). --zf-radius-${m[1]}`);
      return;
    }

    m = /^\s*--zf-font-weight-([a-z]+):\s*(\d+)/.exec(code);
    if (m && ![400, 500, 600, 700].includes(Number(m[2]))) {
      at('off-scale-weight', `font weight ${m[2]} is not one of the four drawn weights — 400 regular, 500 medium, 600 semibold, 700 bold.`);
    }
  });

  //  (b) — one line-height per SIZE, keyed by px rather than by token name, so
  //  two roles at 11px are compared against each other and not each to itself.
  const byPx = new Map();
  for (const [name, set] of heights) {
    const px = sizeOf.get(name);
    if (px === undefined) continue;
    for (const lh of set) {
      (byPx.get(px) ?? byPx.set(px, new Map()).get(px)).set(name, lh);
    }
  }
  for (const [px, named] of byPx) {
    const distinct = new Set(named.values());
    if (distinct.size < 2) continue;
    const undeclared = [...named].filter(([n, lh]) => SCALE_EXCEPTIONS[n]?.lineHeight !== lh);
    if (undeclared.length < 2) continue;
    fail(SCALE_FILE, 0, 'two-line-heights-for-one-size',
      `${px}px carries ${distinct.size} line-heights — ${[...named].map(([n, lh]) => `${n}:${lh}`).join(', ')}. `
      + 'One line-height per size and case. If a case genuinely needs different leading, declare it in SCALE_EXCEPTIONS with a reason.');
  }
}

/* ── report ─────────────────────────────────────────────────────────────── */
if (failures.length === 0) {
  console.log(`✓ boundary check passed — ${files.length} files, ${registry.length} components in the canon`);
  process.exit(0);
}

console.error(`\n✗ boundary check failed — ${failures.length} violation(s)\n`);
const byRule = failures.reduce((acc, f) => ((acc[f.rule] ??= []).push(f), acc), {});
for (const [rule, items] of Object.entries(byRule)) {
  console.error(`  [${rule}]`);
  for (const f of items) console.error(`    ${f.file}${f.line ? `:${f.line}` : ''} — ${f.msg}`);
  console.error('');
}
process.exit(1);
