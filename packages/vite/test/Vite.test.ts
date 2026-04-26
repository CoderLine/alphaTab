import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { alphaTab } from '../src/alphaTab.vite';

describe('Vite', () => {
    it('bundle-correctly', { timeout: 30000 }, async () => {
        const bundlerProject = './test-data/project';

        const cwd = process.cwd();
        process.chdir(bundlerProject);

        const vite = await import('vite');

        try {
            await fs.promises.rm(path.join(process.cwd(), 'dist'), { force: true, recursive: true });
            await vite.build(
                vite.defineConfig({
                    base: '/test-data/project/dist/',
                    plugins: [
                        alphaTab()
                    ]
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

        const dir = await fs.promises.readdir(path.join(bundlerProject, 'dist', 'assets'), { withFileTypes: true });

        let appValidated = false;
        let workletValidated = false;
        let workerValidated = false;

        for (const file of dir) {
            if (file.isFile()) {
                const text = await fs.promises.readFile(path.join(file.parentPath, file.name), 'utf8');

                if (file.name.startsWith('index-')) {
                    // ensure new worker has worker import
                    expect(text.match(/new [^ ]+\.alphaTabWorker\(new [^ ]+\.alphaTabUrl/)).toBeTruthy();
                    // ensure worker bootstrapping script is references
                    expect(text).toContain('assets/alphaTab.worker-');
                    // ensure worklet bootstrapper script is references
                    expect(text).toContain('assets/alphaTab.worklet-');
                    // without custom chunking the app will bundle alphatab directly
                    expect(text).toContain(".at-surface");
                    // ensure __ALPHATAB_VITE__ got replaced
                    expect(text).not.toContain("__ALPHATAB_VITE__");
                    appValidated = true;
                } else if (file.name.startsWith('alphaTab.worker-')) {
                    expect(text).toContain('initializeWorker()');
                    // without custom chunking the app will bundle alphatab directly
                    expect(text).toContain(".at-surface");

                    workerValidated = true;
                } else if (file.name.startsWith('alphaTab.worklet-')) {
                    expect(text).toContain('initializeAudioWorklet()');
                    // without custom chunking the app will bundle alphatab directly
                    expect(text).toContain(".at-surface");
                    workletValidated = true;
                }
            }
        }

        expect(appValidated, 'Missing app validation').toBe(true);
        expect(workerValidated, 'Missing worker validation').toBe(true);
        expect(workletValidated, 'Missing worklet validation').toBe(true);
    });
});
