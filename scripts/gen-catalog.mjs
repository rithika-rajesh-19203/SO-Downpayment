#!/usr/bin/env node
/* ============================================================================
   Generates docs/COMPONENTS.md from src/canon/registry.json.
   ----------------------------------------------------------------------------
   Never hand-edit the output. A hand-maintained component list is stale within
   two weeks; a generated one cannot lie.
   ========================================================================= */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const { components } = JSON.parse(readFileSync(join(ROOT, 'src/canon/registry.json'), 'utf8'));

const CATEGORY_ORDER = [
  'primitive', 'action', 'form', 'data-display',
  'navigation', 'feedback', 'overlay', 'pattern',
];
const CATEGORY_TITLES = {
  primitive: 'Primitives — layout & typography',
  action: 'Actions',
  form: 'Form & input',
  'data-display': 'Data display',
  navigation: 'Navigation',
  feedback: 'Feedback',
  overlay: 'Overlays',
  pattern: 'Patterns — composed blocks',
};
const MARK = { stable: '✅', incoming: '🚧', deprecated: '⚠️' };

const fmtProps = (props) =>
  !props
    ? '—'
    : Object.entries(props)
        .map(([k, v]) => (Array.isArray(v) ? `\`${k}\`: ${v.map((o) => `\`${o}\``).join(' · ')}` : `\`${k}\`: ${v}`))
        .join('<br>');

const counts = components.reduce((a, c) => ((a[c.status] = (a[c.status] ?? 0) + 1), a), {});

let md = `# The canon

<!-- GENERATED FILE — do not edit. Run \`npm run canon:docs\` after changing src/canon/registry.json. -->

Everything the ZF Design Cannon contains. Read this before building any screen:
if something here already does the job, use it.

**${components.length} components** — ${MARK.stable} ${counts.stable ?? 0} stable · ${MARK.incoming} ${counts.incoming ?? 0} incoming · ${MARK.deprecated} ${counts.deprecated ?? 0} deprecated

| Status | Meaning |
| --- | --- |
| ${MARK.stable} stable | Exported from \`@canon\`. Safe to use in screens. |
| ${MARK.incoming} incoming | In \`src/canon/_incoming/\`. Reviewable in the canon, **not** importable by screens. |
| ${MARK.deprecated} deprecated | Still exported; no new usage. |
`;

for (const cat of CATEGORY_ORDER) {
  const items = components.filter((c) => c.category === cat);
  if (!items.length) continue;
  md += `\n## ${CATEGORY_TITLES[cat]}\n\n| Component | | Use it when | Props |\n| --- | --- | --- | --- |\n`;
  for (const c of items.sort((a, b) => a.name.localeCompare(b.name))) {
    const note = c.replacedBy ? ` _(use \`${c.replacedBy}\`)_` : '';
    md += `| \`${c.name}\` | ${MARK[c.status]} | ${c.use}${note} | ${fmtProps(c.props)} |\n`;
  }
}

const empty = CATEGORY_ORDER.filter((c) => !components.some((x) => x.category === c));
if (empty.length) {
  md += `\n## Not yet built\n\nNothing in these categories yet: ${empty.map((c) => `\`${c}\``).join(', ')}.\n`;
}

md += `\n---\n\nBrowse these visually: \`npm run canon\` → http://localhost:6006\n`;

writeFileSync(join(ROOT, 'docs/COMPONENTS.md'), md);
console.log(`✓ docs/COMPONENTS.md — ${components.length} components`);
