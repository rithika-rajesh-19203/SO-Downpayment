#!/usr/bin/env node
/* ============================================================================
   BUILD EVERY RECORDED VERSION OF THE PROTOTYPE INTO ONE SITE.
   ----------------------------------------------------------------------------
   A version is a git tag named v<number> — `v1`, `v2`. This builds:

     site/<tag>/        each tag, as it was when tagged
     site/latest/       the current checkout (main), unrecorded changes
     site/versions.json the list the in-app dropdown reads at runtime
     site/index.html    a redirect to the newest tag (or latest, if none)

   Each tag is built from a `git worktree`, sharing this checkout's
   node_modules. A tag whose dependencies differ from main's would need its own
   install; for a prototype that is not worth the minutes.

   Usage:  node scripts/build-versions.mjs [outDir]   (default: site)
   ========================================================================= */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = process.cwd();
const out = path.resolve(root, process.argv[2] ?? 'site');
const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

function build(cwd, id) {
  execFileSync(process.execPath, [vite, 'build', '--outDir', path.join(out, id), '--emptyOutDir'], {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, VITE_PROTOTYPE_VERSION: id },
  });
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

//  Newest first, by number — v10 after v9, not after v1.
const tags = git('tag', '--list', 'v*')
  .split('\n')
  .filter((t) => /^v\d+$/.test(t))
  .sort((a, b) => Number(b.slice(1)) - Number(a.slice(1)));

const versions = [];
for (const tag of tags) {
  const dir = mkdtempSync(path.join(tmpdir(), `proto-${tag}-`));
  try {
    git('worktree', 'add', '--detach', dir, tag);
    if (!existsSync(path.join(dir, 'node_modules'))) symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'));
    console.log(`\n── building ${tag}`);
    build(dir, tag);
  } finally {
    git('worktree', 'remove', '--force', dir);
  }
  //  The tag's message is the note — `git tag -a v2 -m "Partial payments"`.
  //  A lightweight tag has none, and falls back to the commit's subject.
  const note = git('tag', '--list', tag, '--format=%(contents:subject)') || git('log', '-1', '--format=%s', tag);
  const date = git('log', '-1', '--format=%cs', tag);
  versions.push({ id: tag, label: tag, note, date });
}

console.log('\n── building latest');
build(root, 'latest');
versions.push({ id: 'latest', label: 'Latest changes', note: 'not yet recorded as a version' });

writeFileSync(path.join(out, 'versions.json'), JSON.stringify(versions, null, 2));

const home = tags[0] ?? 'latest';
writeFileSync(path.join(out, 'index.html'), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=./${home}/">
  <title>SO Advance Payment</title>
</head>
<body><a href="./${home}/">Open the prototype (${home})</a></body>
</html>
`);

console.log(`\n✓ ${versions.length} build(s) in ${path.relative(root, out)}/ — home is ${home}`);
