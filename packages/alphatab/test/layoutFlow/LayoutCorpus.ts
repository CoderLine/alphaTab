/** @target web */
import fs from 'node:fs';
import path from 'node:path';
import type { Score } from '@coderline/alphatab/model/Score';
import { SimileMark } from '@coderline/alphatab/model/SimileMark';

/**
 * A modification of a corpus input that exercises break rules the plain files rarely hit.
 * @internal
 */
export interface LayoutVariant {
    name: string;
    tracks: (s: Score) => number[] | null;
    prepare: (s: Score) => void;
}

/**
 * The layout-flow corpus: every score input of the visual tests plus the reference scores.
 * @internal
 */
export class LayoutCorpus {
    public static readonly referenceScores = [
        { name: 'canon', file: 'test-data/guitarpro5/canon.gp5' },
        { name: 'full-song', file: 'test-data/audio/full-song.gp5' },
        { name: 'fade-to-black (dense)', file: 'test-data/guitarpro4/fade-to-black.gp4' }
    ];

    public static readonly resizeWidths = [1000, 800, 600, 1300, 1000];

    public static readonly variants: LayoutVariant[] = [
        { name: 'all-tracks', tracks: () => null, prepare: () => {} },
        { name: 'first-track', tracks: () => [0], prepare: () => {} },
        {
            name: 'hide-empty-staves',
            tracks: () => null,
            prepare: s => {
                s.stylesheet.hideEmptyStaves = true;
            }
        },
        {
            name: 'forced-line-breaks',
            tracks: () => null,
            prepare: s => {
                for (const t of s.tracks) {
                    for (let b = 3; b < s.masterBars.length; b += 7) {
                        t.addLineBreaks(b);
                    }
                }
            }
        },
        {
            name: 'double-simile',
            tracks: () => [0],
            prepare: s => {
                // two-bar repeats cannot be split across systems (canWrap = false)
                for (const staff of s.tracks[0].staves) {
                    for (let b = 2; b + 1 < staff.bars.length; b += 5) {
                        staff.bars[b].simileMark = SimileMark.FirstOfDouble;
                        staff.bars[b + 1].simileMark = SimileMark.SecondOfDouble;
                    }
                }
            }
        }
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
        for (const r of LayoutCorpus.referenceScores) {
            files.push(path.join(root, r.file));
        }
        return files;
    }

    /** The directory the layout-flow runs write their reports to (git-ignored). */
    public static outDir(root: string): string {
        const dir = process.env.LAYOUT_FLOW_OUT ?? path.join(root, 'temp/layout-flow');
        fs.mkdirSync(dir, { recursive: true });
        return dir;
    }
}
