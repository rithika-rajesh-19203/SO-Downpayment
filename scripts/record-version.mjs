#!/usr/bin/env node
/* ============================================================================
   RECORD A PROTOTYPE VERSION.
   ----------------------------------------------------------------------------
     npm run record -- v2 "Partial advance payments"

   Tags the current commit, pushes main and the tag, then starts the deploy on
   main — which rebuilds every version, so v2 appears in every version's
   dropdown. Commit your changes first: a version is a commit, and uncommitted
   work is not in it.
   ========================================================================= */
import { execFileSync } from 'node:child_process';

const [version, ...rest] = process.argv.slice(2);
const note = rest.join(' ').trim();
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
if (read('git', ['tag', '--list', version])) {
  console.error(`${version} is already recorded. Use the next number.`);
  process.exit(1);
}

run('git', ['tag', '-a', version, '-m', note || version]);
run('git', ['push', 'origin', 'main', version]);
run('gh', ['workflow', 'run', 'deploy.yml', '--ref', 'main']);
console.log(`\n✓ ${version} recorded. The deploy is running — watch it with: gh run watch`);
