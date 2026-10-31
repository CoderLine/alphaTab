import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { alphaTab } from '../src/alphaTab.vite';

type ViteLike = typeof import('vite');

function expectMinified(fileName: string, text: string) {
    // the unminified bundle has tens of thousands of lines, the minified one only the license banners
    expect(text.split('\n').length, `${fileName} is not minified`).toBeLessThan(1000);
}

async function runBundleSmokeTest(vite: ViteLike) {
    const bundlerProject = './test-data/project';

    const cwd = process.cwd();
    process.chdir(bundlerProject);

    try {
        await fs.promises.rm(path.join(process.cwd(), 'dist'), { force: true, recursive: true });
        await vite.build(
            vite.defineConfig({
                base: '/test-data/project/dist/',
                plugins: [alphaTab()]
            })
        );
    } catch (e) {
        process.chdir(cwd);
        throw e;
    } finally {
        process.chdir(cwd);
    }

    // ensure assets are copied
    const files = [
        path.join(bundlerProject, 'dist', 'font', 'Bravura.otf'),
        path.join(bundlerProject, 'dist', 'font', 'Bravura.woff'),
        path.join(bundlerProject, 'dist', 'font', 'Bravura.woff2'),
        path.join(bundlerProject, 'dist', 'font', 'Bravura-OFL.txt'),

        path.join(bundlerProject, 'dist', 'soundfont', 'LICENSE'),
        path.join(bundlerProject, 'dist', 'soundfont', 'sonivox.sf2')
    ];
    for (const file of files) {
        expect(fs.existsSync(file), `File '${file}' Missing`).toBe(true);
    }

    const assetsDir = path.join(bundlerProject, 'dist', 'assets');
    const jsFiles = new Map<string, string>();
    for (const file of await fs.promises.readdir(assetsDir)) {
        expect(file, `unexpected output file '${file}'`).toMatch(/\.js$/);
        jsFiles.set(file, await fs.promises.readFile(path.join(assetsDir, file), 'utf8'));
    }

    const findChunk = (prefix: string): [string, string] => {
        const matches = [...jsFiles].filter(([name]) => name.startsWith(prefix));
        expect(
            matches.map(([name]) => name),
            `expected exactly one '${prefix}*' chunk`
        ).toHaveLength(1);
        return matches[0];
    };
    const importsOf = (code: string) => [...code.matchAll(/\bfrom\s*["']\.\/([^"']+)["']/g)].map(m => m[1]);

    const [coreName, coreCode] = findChunk('alphaTab.core-');
    const [, indexCode] = findChunk('index-');
    const [workerName, workerCode] = findChunk('alphaTab.worker-');
    const [workletName, workletCode] = findChunk('alphaTab.worklet-');

    // core once: only the shared core chunk carries alphaTab's code
    const filesWithCore = [...jsFiles].filter(([, code]) => code.includes('.at-surface')).map(([name]) => name);
    expect(filesWithCore).toEqual([coreName]);
    expectMinified(coreName, coreCode);

    expect(importsOf(indexCode)).toContain(coreName);
    expect(importsOf(workerCode)).toEqual([coreName]);
    expect(importsOf(workletCode)).toEqual([coreName]);
    expect(workerCode).toContain('initializeWorker()');
    expect(workletCode).toContain('initializeAudioWorklet()');

    // the page starts worker and worklet through the emitted chunk URLs
    expect(indexCode).toMatch(new RegExp(`new Worker\\(new URL\\([^)]*${escapeRegExp(workerName)}`));
    expect(indexCode).toMatch(new RegExp(`addModule\\(new URL\\([^)]*${escapeRegExp(workletName)}`));

    // the alphaTabUrl fallback markers are not bundler syntax and stay as written
    expect(indexCode).toMatch(/\.alphaTabUrl\(\s*["'`]\.\/alphaTab\.worker\.mjs["'`]/);

    for (const [name, code] of jsFiles) {
        expect(code, `${name} contains the detection marker`).not.toContain('__ALPHATAB_VITE__');
    }
}

function escapeRegExp(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function loadVite(major: 7 | 8): Promise<ViteLike> {
    const url = new URL(
        `./fixtures/vite-versions/node_modules/vite-v${major}/dist/node/index.js`,
        import.meta.url
    );
    return (await import(url.href)) as unknown as ViteLike;
}

// Both cases share global state (process.cwd, the dist/ folder), so they
// must run sequentially — that is what vitest does inside a single describe.
describe('Vite', () => {
    it('peer range accepts every tested vite major', () => {
        const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        const ranges = (pkg.peerDependencies.vite as string).split('||').map(r => r.trim());
        expect(ranges).toContain('^7');
        expect(ranges).toContain('^8');
    });

    it('bundle-correctly (vite 8, rolldown)', { timeout: 30000 }, async () => {
        await runBundleSmokeTest(await loadVite(8));
    });

    it('bundle-correctly (vite 7, rollup)', { timeout: 30000 }, async () => {
        await runBundleSmokeTest(await loadVite(7));
    });

    it('serves alphaTab unbundled in dev', async () => {
        for (const major of [7, 8] as const) {
            const vite = await loadVite(major);
            const config = await vite.resolveConfig(
                { configFile: false, root: './test-data/project', plugins: [alphaTab()] },
                'serve'
            );
            expect(config.optimizeDeps.exclude, `vite ${major}`).toContain('@coderline/alphatab');
        }
    });
});
