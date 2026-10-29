/** @target web */
// What a rendered session keeps alive, attributed by releasing one owner after the other and
// measuring the heap after a full GC (exclusive retained bytes per owner, in release order).
// Run: npm run test-layout-flow -- Retained   (LAYOUT_FLOW_FILE=<name> limits the scores)
import fs from 'node:fs';
import path from 'node:path';
import v8 from 'node:v8';
import vm from 'node:vm';
import { AlphaSynthMidiFileHandler } from '@coderline/alphatab/midi/AlphaSynthMidiFileHandler';
import { MidiFile } from '@coderline/alphatab/midi/MidiFile';
import { MidiFileGenerator } from '@coderline/alphatab/midi/MidiFileGenerator';
import { ScoreSerializer } from '@coderline/alphatab/generated/model/ScoreSerializer';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import type { Score } from '@coderline/alphatab/model/Score';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { BoundsLookupObjectWriter } from '@coderline/alphatab/rendering/utils/BoundsLookupObjectWriter';
import { BoundsLookupWire } from '@coderline/alphatab/rendering/utils/BoundsLookupWire';
import { BoundsLookupWireWriter } from '@coderline/alphatab/rendering/utils/BoundsLookupWireWriter';
import { Settings } from '@coderline/alphatab/Settings';
import { AlphaSynth } from '@coderline/alphatab/synth/AlphaSynth';
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { PlayerMode } from '@coderline/alphatab/PlayerSettings';
import type { IAlphaSynth } from '@coderline/alphatab/synth/IAlphaSynth';
import { TestOutput } from 'test/audio/TestOutput';
import { TestUiFacade } from 'test/visualTests/TestUiFacade';
import { describe, it } from 'vitest';
import { type CensusEntry, HeapCensus } from './HeapCensus';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';

v8.setFlagsFromString('--expose-gc');
const gc = vm.runInNewContext('gc') as () => void;

function heap(): number {
    for (let i = 0; i < 4; i++) {
        gc();
    }
    const m = process.memoryUsage();
    return m.heapUsed + m.arrayBuffers;
}

const mb = (b: number) => `${(b / 1024 / 1024).toFixed(2)} MB`;

interface Counts {
    tracks: number;
    masterBars: number;
    systems: number;
    staffBars: number;
    beats: number;
    notes: number;
    svgChars: number;
}

function counts(h: LayoutHarness): Counts {
    const layout = h.renderer.layout!;
    let staffBars = 0;
    for (const s of layout.systems) {
        for (const st of s.allStaves) {
            staffBars += st.barRenderers.length;
        }
    }
    let beats = 0;
    let notes = 0;
    const first = h.renderer.layout!.firstBarIndex;
    const last = h.renderer.layout!.lastBarIndex;
    for (const t of h.renderer.tracks!) {
        for (const st of t.staves) {
            for (let b = first; b <= last; b++) {
                for (const v of st.bars[b].voices) {
                    for (const beat of v.beats) {
                        beats++;
                        notes += beat.notes.length;
                    }
                }
            }
        }
    }
    return {
        tracks: h.renderer.tracks!.length,
        masterBars: last - first + 1,
        systems: layout.systems.length,
        staffBars,
        beats,
        notes,
        svgChars: 0
    };
}

function lazyPartials(h: LayoutHarness): Map<string, { args: { renderResult: unknown } }> {
    return (h.renderer.layout as any)._lazyPartials;
}

interface Breakdown {
    counts: Counts;
    steps: [string, number][];
}

/** Renders with lazy loading, paints every partial and releases the owners one by one. */
function breakdown(file: string, prepare: (s: Settings) => void, tracks: (s: Score) => number[] | null): Breakdown {
    const steps: [string, number][] = [];
    let last = heap();
    const step = (name: string) => {
        const now = heap();
        steps.push([name, now - last]);
        last = now;
    };
    const h = new LayoutHarness(new Settings());
    prepare(h.settings);
    h.paint = false;
    let score: Score | null = LayoutHarness.loadScore(file, h.settings);
    step('+ score model (import)');
    h.render(score, tracks(score), 1300);
    step('+ layout (render, no paint)');
    let svgChars = 0;
    h.renderer.partialRenderFinished.on(e => {
        svgChars += typeof e.renderResult === 'string' ? (e.renderResult as string).length : 0;
    });
    for (const id of h.partialIds) {
        h.renderer.renderResult(id);
    }
    step('+ paint all partials (svg kept in lazy partial args)');
    const c = counts(h);
    c.svgChars = svgChars;
    for (const p of lazyPartials(h).values()) {
        p.args.renderResult = null;
    }
    step('- svg strings in lazy partial args');
    h.renderer.boundsLookup = null;
    step('- bounds lookup');
    const layout = h.renderer.layout as any;
    layout.headerProfiles.clear();
    layout.beamingRuleLookups.clear();
    layout.activeEffects.clear();
    layout.slurRegistry.clear();
    layout._barRendererLookup.clear();
    step('- layout caches (header profiles, beaming rules, effects, slurs, renderer lookup)');
    lazyPartials(h).clear();
    step('- lazy partial closures (exclusive)');
    if (layout._systemPool) {
        layout._systemPool = [];
        step('- pooled systems beyond the current ones');
        layout._systems = [];
        step('- staff systems (staves, skylines, effect bands; bar renderers stay)');
        layout._allMasterBarRenderers = [];
        step('- measured master bars (bar renderers, glyph trees)');
    } else {
        layout._system = null;
        layout._systems = [];
        layout._allMasterBarRenderers = [];
        step('- system and bar renderers (horizontal)');
    }
    layout.headerGlyphs = new Map();
    layout.footerGlyphs = new Map();
    layout.chordDiagrams = null;
    layout.tuningGlyph = null;
    h.renderer.layout = null;
    step('- layout object rest');
    h.renderer.tracks = null;
    h.renderer.score = null;
    (h.renderer as any)._renderedTracks = null;
    (h as any)._ids = [];
    score = null;
    step('- score model');
    return { counts: c, steps };
}

class SynthUiFacade extends TestUiFacade {
    public override createWorkerPlayer(): IAlphaSynth | null {
        return new AlphaSynth(new TestOutput(), 500);
    }
}

async function flush(): Promise<void> {
    for (let i = 0; i < 5; i++) {
        await new Promise<void>(resolve => setImmediate(resolve));
    }
}

function censusLines(entries: CensusEntry[], types: number, owners: number, out: string[]) {
    const t = entries.filter(e => !e.name.startsWith('  '));
    const o = entries.filter(e => e.name.startsWith('  '));
    out.push(
        `    total ${mb(t.reduce((s, e) => s + e.selfBytes, 0))} in ${t.reduce((s, e) => s + e.count, 0)} objects`
    );
    for (const e of t.slice(0, types)) {
        out.push(`    ${mb(e.selfBytes).padStart(10)}  ${String(e.count).padStart(8)}  ${e.name}`);
    }
    if (owners > 0) {
        out.push('  by owner:');
        for (const e of o.slice(0, owners)) {
            out.push(`    ${mb(e.selfBytes).padStart(10)}  ${String(e.count).padStart(8)}  ${e.name.trim()}`);
        }
    }
}

const T = () => HeapCensus.takeToFile(true);
const censusFiles: string[] = [];
/** Diff of two file censuses, read without keeping them in the heap of later censuses. */
function D(before: string, after: string): CensusEntry[] {
    const read = (f: string) => {
        if (!censusFiles.includes(f)) {
            censusFiles.push(f);
        }
        const entries = JSON.parse(fs.readFileSync(f, 'utf8')) as CensusEntry[];
        return new Map(entries.map(e => [e.name, e]));
    };
    return HeapCensus.diff(read(before), read(after));
}

function printBreakdown(title: string, b: Breakdown, out: string[]) {
    const c = b.counts;
    out.push(
        `### ${title}: tracks=${c.tracks} masterBars=${c.masterBars} systems=${c.systems} staffBars=${c.staffBars} beats=${c.beats} notes=${c.notes} svgChars=${c.svgChars}`
    );
    for (const [name, bytes] of b.steps) {
        out.push(
            `    ${mb(bytes).padStart(10)}  ${(bytes / c.staffBars / 1024).toFixed(2).padStart(7)} KB/staffBar  ${name}`
        );
    }
}

describe('Retained', () => {
    const root = process.cwd();
    const lines: string[] = [];
    const extra = [
        { name: 'canon-audio-track (gp8)', file: 'test-data/guitarpro8/canon-audio-track.gp' },
        { name: 'Dichterliebe01 (musicxml, piano+voice)', file: 'test-data/musicxml-samples/Dichterliebe01.xml' }
    ];
    const refs = [...LayoutCorpus.referenceScores, ...extra].filter(
        r => !process.env.LAYOUT_FLOW_FILE || r.file.includes(process.env.LAYOUT_FLOW_FILE)
    );

    let baselineCensus = '';
    it('baseline census', () => {
        baselineCensus = HeapCensus.takeToFile(true);
    });

    it('warmup', () => {
        for (const ref of refs) {
            const w = new LayoutHarness(new Settings());
            w.render(LayoutHarness.loadScore(path.join(root, ref.file), w.settings), null, 1300);
            w.resize(1000);
        }
    });

    for (const ref of refs) {
        it(`single-thread ${ref.name}`, () => {
            const file = path.join(root, ref.file);
            const out: string[] = [`## ${ref.name} (${ref.file})`];
            printBreakdown(
                'page layout, all tracks',
                breakdown(
                    file,
                    () => {},
                    () => null
                ),
                out
            );

            // release-side deltas only: the add side also counts JIT artefacts of first calls
            // worker: main thread keeps its score, the decoded bounds and the midi; the worker keeps
            // its own score copy, the renderer state and its bounds lookup
            const h = new LayoutHarness(new Settings());
            h.paint = false;
            const score = LayoutHarness.loadScore(file, h.settings);
            h.render(score, null, 1300);
            let wire: Float64Array | null = BoundsLookupWire.encode(h.renderer.boundsLookup!);
            const wireBytes = wire.byteLength;
            let decoded: unknown = BoundsLookupWire.decode(wire, score);
            (decoded as any).finish();
            wire = null;
            let t = heap();
            decoded = null;
            out.push(`    main thread: decoded bounds lookup ${mb(t - heap())} (wire ${mb(wireBytes)})`);
            {
                // the web worker writes its bounds in wire format and keeps only the wire writer's buffers
                const hw = new LayoutHarness(new Settings());
                hw.paint = false;
                let writer: BoundsLookupWireWriter | null = new BoundsLookupWireWriter();
                hw.renderer.boundsWriter = writer;
                hw.render(LayoutHarness.loadScore(file, hw.settings), null, 1300);
                hw.resize(1000);
                hw.resize(1300);
                const before = heap();
                hw.renderer.boundsWriter = new BoundsLookupObjectWriter(hw.renderer);
                writer = null;
                out.push(`    worker: wire writer buffers ${mb(before - heap())} (instead of the bounds lookup)`);
            }
            let jsObject: unknown = ScoreSerializer.toJsObject(score);
            t = heap();
            let workerScore: Score | null = JsonConverter.jsObjectToScore(jsObject, h.settings);
            jsObject = null;
            const t1 = heap();
            out.push(`    worker message: score as js object ${mb(t - t1)} (transient)`);
            workerScore = null;
            out.push(`    worker: deserialized score ${mb(t1 - heap())}`);

            // midi and tick lookup (main thread), sequencer state (synth worker)
            let midiFile: MidiFile | null = new MidiFile();
            let generator: MidiFileGenerator | null = new MidiFileGenerator(
                score,
                h.settings,
                new AlphaSynthMidiFileHandler(midiFile)
            );
            generator.generate();
            let tickLookup: unknown = generator.tickLookup;
            generator = null;
            const events = midiFile.events.length;
            let synth: AlphaSynth | null = new AlphaSynth(new TestOutput(), 500);
            synth.loadMidiFile(midiFile);
            t = heap();
            synth = null;
            const t2 = heap();
            midiFile = null;
            const t3 = heap();
            tickLookup = null;
            const t4 = heap();
            out.push(
                `    synth (sequencer with loaded midi) ${mb(t - t2)}; midi file ${mb(t2 - t3)}; ` +
                    `tick lookup ${mb(t3 - t4)} (events=${events})`
            );
            const _unused = [workerScore, synth, midiFile, tickLookup, generator];
            const _u2 = null;

            // resize: systems pooled at a narrow width stay alive after widening again
            const r = new LayoutHarness(new Settings());
            r.paint = false;
            r.render(LayoutHarness.loadScore(file, r.settings), null, 1300);
            const freshSystems = r.renderer.layout!.systems.length;
            r.resize(500);
            const narrowSystems = r.renderer.layout!.systems.length;
            r.resize(1300);
            t = heap();
            const pool = (r.renderer.layout as any)._systemPool as unknown[];
            pool.splice(freshSystems, pool.length - freshSystems);
            out.push(
                `    resize 1300->500->1300: pooled systems beyond the current ones ${mb(t - heap())} ` +
                    `(systems ${freshSystems}, pool ${narrowSystems})`
            );
            const _u3 = [r, h, _unused, _u2];
            console.log(out.join('\n'));
            lines.push(...out, '');
            return _u3 !== null;
        });
    }

    it('horizontal and parchment', () => {
        const file = path.join(root, 'test-data/guitarpro5/canon.gp5');
        const out: string[] = ['## canon other layouts'];
        printBreakdown(
            'horizontal',
            breakdown(
                file,
                s => {
                    s.display.layoutMode = LayoutMode.Horizontal;
                },
                () => null
            ),
            out
        );
        console.log(out.join('\n'));
        lines.push(...out, '');
    });

    it('scaling', () => {
        const out: string[] = ['## scaling (page layout, layout + svg + bounds, exclusive steps)'];
        out.push(
            'score | bars | tracks | staffBars | beats | notes | model MB | layout MB | svg MB | bounds MB | glyph tree MB | systems MB'
        );
        const specs = [
            { file: 'test-data/guitarpro5/canon.gp5', name: 'canon' },
            { file: 'test-data/guitarpro4/fade-to-black.gp4', name: 'fade' }
        ];
        for (const spec of specs) {
            const file = path.join(root, spec.file);
            const probe = LayoutHarness.loadScore(file, new Settings());
            const trackCount = probe.tracks.length;
            const barTotal = probe.masterBars.length;
            for (const tc of [1, Math.max(1, trackCount >> 1), trackCount]) {
                for (const bars of [Math.floor(barTotal / 4), Math.floor(barTotal / 2), barTotal]) {
                    const b = breakdown(
                        file,
                        s => {
                            s.display.barCount = bars;
                        },
                        () => Array.from({ length: tc }, (_, i) => i)
                    );
                    const get = (prefix: string) =>
                        b.steps.filter(s => s[0].startsWith(prefix)).reduce((a, s) => a + s[1], 0);
                    const c = b.counts;
                    out.push(
                        [
                            spec.name,
                            c.masterBars,
                            c.tracks,
                            c.staffBars,
                            c.beats,
                            c.notes,
                            (-get('- score') / 1048576).toFixed(2),
                            (get('+ layout') / 1048576).toFixed(2),
                            (-get('- svg') / 1048576).toFixed(2),
                            (-get('- bounds') / 1048576).toFixed(2),
                            (-get('- measured') / 1048576).toFixed(2),
                            (-get('- staff systems') / 1048576).toFixed(2)
                        ].join(' | ')
                    );
                }
            }
        }
        console.log(out.join('\n'));
        lines.push(...out, '');
    });

    it('census of the layout (glyph tree by class)', () => {
        const file = path.join(root, process.env.LAYOUT_FLOW_CENSUS ?? 'test-data/audio/full-song.gp5');
        const out: string[] = [`## census of a rendered + painted layout (${file})`];
        const h = new LayoutHarness(new Settings());
        h.paint = false;
        const score = LayoutHarness.loadScore(file, h.settings);
        const before = T();
        h.render(score, null, 1300);
        const afterLayout = T();
        const types = D(before, afterLayout).filter(e => !e.name.startsWith('  '));
        const total = types.reduce((s, e) => s + e.selfBytes, 0);
        out.push(`### layout retained ${mb(total)} in ${types.reduce((s, e) => s + e.count, 0)} objects`);
        for (const e of types.slice(0, 60)) {
            out.push(`    ${mb(e.selfBytes).padStart(10)}  ${String(e.count).padStart(8)}  ${e.name}`);
        }
        const owners = D(before, afterLayout).filter(e => e.name.startsWith('  '));
        out.push('  numbers/arrays by owner:');
        for (const e of owners.slice(0, 50)) {
            out.push(`    ${mb(e.selfBytes).padStart(10)}  ${String(e.count).padStart(8)}  ${e.name.trim()}`);
        }
        console.log(out.slice(0, 30).join('\n'));
        lines.push(...out, '');
        return h !== null;
    });

    it('svg size (full-song)', () => {
        const file = path.join(root, 'test-data/audio/full-song.gp5');
        const out: string[] = ['## svg strings of all partials (full-song)'];
        const h = new LayoutHarness(new Settings());
        h.paint = false;
        const score = LayoutHarness.loadScore(file, h.settings);
        h.render(score, null, 1300);
        let before = '';
        let after = '';
        let svgs: string[] = [];
        h.renderer.partialRenderFinished.on(e => {
            svgs.push(e.renderResult as string);
        });
        for (const id of h.partialIds) {
            h.renderer.renderResult(id);
        }
        let elements = 0;
        let svgChars = 0;
        for (const svg of svgs) {
            svgChars += svg.length;
            for (let i = 0; i < svg.length; i++) {
                if (svg.charCodeAt(i) === 60 && svg.charCodeAt(i + 1) !== 47) {
                    elements++;
                }
            }
        }
        before = T();
        svgs = [];
        after = T();
        out.push(`### svg strings (${svgChars} chars, ${elements} elements)`);
        censusLines(D(after, before), 6, 6, out);

        const _u = [h];

        console.log(out.join('\n'));
        lines.push(...out, '');
        return _u !== null;
    });

    it('api session (single thread, synth player, svg)', async () => {
        const out: string[] = ['## api session (AlphaTabApiBase + TestUiFacade + AlphaSynth/TestOutput, canon)'];
        const canon = fs.readFileSync(path.join(root, 'test-data/guitarpro5/canon.gp5'));
        const full = fs.readFileSync(path.join(root, 'test-data/audio/full-song.gp5'));
        const h0 = heap();
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = true;
        settings.player.playerMode = PlayerMode.EnabledSynthesizer;
        settings.player.enableCursor = true;
        let facade: SynthUiFacade | null = new SynthUiFacade();
        facade.rootContainer.width = 1300;
        let api: AlphaTabApiBase<unknown> | null = new AlphaTabApiBase<unknown>(facade, settings);
        await flush();
        const h1 = heap();
        out.push(`    empty api ${mb(h1 - h0)}`);
        const load = async (data: Uint8Array) => {
            const rendered = Promise.withResolvers<void>();
            const off = api!.postRenderFinished.on(() => rendered.resolve());
            const offError = api!.error.on(e => rendered.reject(e));
            const timer = setTimeout(() => rendered.reject(new Error('render timeout')), 120000);
            const score = ScoreLoader.loadScoreFromBytes(new Uint8Array(data), api!.settings);
            api!.renderScore(
                score,
                score.tracks.map(t => t.index)
            );
            try {
                await rendered.promise;
            } finally {
                clearTimeout(timer);
                off();
                offError();
            }
            await flush();
        };
        await load(canon);
        const h2 = heap();
        out.push(`    canon loaded, rendered, painted, midi loaded: ${mb(h2 - h1)}`);
        await load(full);
        const h3 = heap();
        out.push(`    then full-song: ${mb(h3 - h1)}`);
        await load(canon);
        const h4 = heap();
        out.push(`    then canon again: ${mb(h4 - h1)} (first load ${mb(h2 - h1)})`);
        for (const w of [1000, 700, 500, 1300]) {
            facade!.rootContainer.width = w;
            api.triggerResize();
            await flush();
        }
        const h5 = heap();
        out.push(`    after resizes 1000,700,500,1300: ${mb(h5 - h1)}`);
        for (let i = 0; i < 3; i++) {
            api.render();
            await flush();
        }
        const h6 = heap();
        out.push(`    after 3x api.render(): ${mb(h6 - h1)}`);
        api.destroy();
        await flush();
        const h7 = heap();
        out.push(`    after destroy, api object still referenced: ${mb(h7 - h0)} above the pre-api heap`);
        api = null;
        facade = null;
        const h8 = heap();
        out.push(`    after dropping the api and facade: ${mb(h8 - h0)}`);
        const _u = [api, facade];
        if (_u.length === 0) {
            return;
        }
        console.log(out.join('\n'));
        lines.push(...out, '');
    });

    it('residue census (global caches after everything was released)', () => {
        const out: string[] = ['## residue: live objects added since the start of the file (all sessions released)'];
        const after = T();
        censusLines(D(baselineCensus, after), 40, 30, out);
        console.log(out.join('\n'));
        lines.push(...out, '');
    });

    it('report', () => {
        for (const f of censusFiles) {
            fs.rmSync(f, { force: true });
        }
        const target = path.join(LayoutCorpus.outDir(root), 'retained.txt');
        fs.writeFileSync(target, lines.join('\n'));
        console.log(`report written to ${target}`);
    });
});
