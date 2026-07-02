// Ensures the matrix-test fixture next to this script has its dependencies
// installed. The fixture lives outside the workspace graph so that the
// side-by-side Vite installs don't fight for the workspace-root `.bin/vite`.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const fixtureDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'vite-versions');

if (existsSync(path.join(fixtureDir, 'node_modules'))) {
    process.exit(0);
}

console.log(`[vite-versions] installing fixture deps in ${fixtureDir}`);
const result = spawnSync('npm', ['install', '--no-audit', '--no-fund'], {
    cwd: fixtureDir,
    stdio: 'inherit',
    shell: process.platform === 'win32'
});
process.exit(result.status ?? 1);
