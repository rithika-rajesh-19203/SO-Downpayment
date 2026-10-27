#!/usr/bin/env node
/* ============================================================================
   RECORD A PROTOTYPE VERSION.
   ----------------------------------------------------------------------------
     npm run record -- v2 "Partial advance payments"    record a new version
     npm run record -- v2 --update                      fold new commits into v2

   Tags the current commit, pushes main and the tag, then starts the deploy on
   main — which rebuilds every version, so v2 appears in every version's
   dropdown. Commit your changes first: a version is a commit, and uncommitted
   work is not in it.

   `--update` moves an existing version to the current commit and keeps its
   note — for while a version is still being worked on. Once you move on to the
   next number, leave the earlier ones alone: people may have the link.
   ========================================================================= */
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const update = args.includes('--update');
const [version, ...rest] = args.filter((a) => a !== '--update');
let note = rest.join(' ').trim();
const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit' });
const read = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' }).trim();

if (!/^v\d+$/.test(version ?? '')) {
  console.error('Usage: npm run record -- v2 "What changed"');
  process.exit(1);
}
if (read('git', ['status', '--porcelain'])) {
  console.error('There are uncommitted changes. Commit them first, so they are part of the version.');
  process.exit(1);
}
const exists = Boolean(read('git', ['tag', '--list', version]));
if (exists && !update) {
  console.error(`${version} is already recorded. Use the next number, or add --update to move it to this commit.`);
  process.exit(1);
}
if (!exists && update) {
  console.error(`${version} has not been recorded yet — drop --update.`);
  process.exit(1);
}
if (update && !note) note = read('git', ['tag', '--list', version, '--format=%(contents:subject)']);

run('git', ['tag', ...(update ? ['-f'] : []), '-a', version, '-m', note || version]);
run('git', ['push', 'origin', 'main']);
run('git', ['push', ...(update ? ['--force'] : []), 'origin', `refs/tags/${version}`]);
run('gh', ['workflow', 'run', 'deploy.yml', '--ref', 'main']);
console.log(`\n✓ ${version} ${update ? 'updated' : 'recorded'}. The deploy is running — watch it with: gh run watch`);
