/** @target web */
import fs from 'node:fs';
import path from 'node:path';

/**
 * A broad set of test scores: every score input of the visual tests plus a few large reference scores.
 * @internal
 */
export class ScoreCorpus {
    public static readonly referenceScores = [
        { name: 'canon', file: 'test-data/guitarpro5/canon.gp5' },
        { name: 'full-song', file: 'test-data/audio/full-song.gp5' },
        { name: 'fade-to-black (dense)', file: 'test-data/guitarpro4/fade-to-black.gp4' }
    ];

    public static files(root: string): string[] {
        const files: string[] = [];
        const walk = (dir: string) => {
            for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
                const p = path.join(dir, e.name);
                if (e.isDirectory()) {
                    walk(p);
                } else if (!e.name.endsWith('.png')) {
                    files.push(p);
                }
            }
        };
        walk(path.join(root, 'test-data/visual-tests'));
        files.sort();
        for (const r of ScoreCorpus.referenceScores) {
            files.push(path.join(root, r.file));
        }
        return files;
    }
}
