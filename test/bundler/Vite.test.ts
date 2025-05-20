/**@target web */
import { alphaTab } from '../../src/alphaTab.vite';
import path from 'node:path';
import fs from 'node:fs';
import { expect } from 'chai';

describe('Vite', () => {
    it('bundle-correctly', async () => {
        const bundlerProject = './test-data/bundler/vite';
        const cwd = process.cwd();
        process.chdir(bundlerProject);

        const vite = await import('vite');

        try {
            await fs.promises.rm(path.join(process.cwd(), 'dist'), { force: true, recursive: true });
            await vite.build(
                vite.defineConfig({
                    base: '/test-data/bundler/vite/dist/',
                    plugins: [
                        alphaTab({
                            alphaTabSourceDir: '../../../dist/'
                        })
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
            expect(fs.existsSync(file)).to.eq(true, `File '${file}' Missing`);
        }

        const dir = await fs.promises.readdir(path.join(bundlerProject, 'dist', 'assets'), { withFileTypes: true });

        let appValidated = false;
        let workletValidated = false;
        let workerValidated = false;

        for (const file of dir) {
            if (file.isFile()) {
                const text = await fs.promises.readFile(path.join(file.parentPath ?? file.path, file.name), 'utf8');

                if (file.name.startsWith('index-')) {
                    // ensure new worker has worker import
                    expect(text.match(/new [^ ]+\.alphaTabWorker\(new [^ ]+\.alphaTabUrl/)).to.be.ok;
                    // ensure worker bootstrapping script is references
                    expect(text).to.include('assets/alphaTab.worker-');
                    // ensure worklet bootstrapper script is references
                    expect(text).to.include('assets/alphaTab.worklet-');
                    // without custom chunking the app will bundle alphatab directly
                    expect(text).to.include(".at-surface");
                    appValidated = true;
                } else if (file.name.startsWith('alphaTab.worker-')) {
                    expect(text).to.include('initializeWorker()');
                    // without custom chunking the app will bundle alphatab directly
                    expect(text).to.include(".at-surface");

                    workerValidated = true;
                } else if (file.name.startsWith('alphaTab.worklet-')) {
                    expect(text).to.include('initializeAudioWorklet()');
                    // without custom chunking the app will bundle alphatab directly
                    expect(text).to.include(".at-surface");
                    workletValidated = true;
                }
            }
        }

        expect(appValidated).to.eq(true, 'Missing app validation');
        expect(workerValidated).to.eq(true, 'Missing worker validation');
        expect(workletValidated).to.eq(true, 'Missing worklet validation');
    }).timeout(30000);
});
