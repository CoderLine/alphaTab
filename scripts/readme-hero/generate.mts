/**
 * Generates `img/hero.svg`, the README hero: a passage of a song rendered by alphaTab inside a player window, as one
 * self-contained SVG with light and dark colors (`prefers-color-scheme`). All text and music symbols are outlined, so
 * the image renders identically wherever it is embedded as an image.
 *
 * Usage (from the repository root, after `npm run build`):
 *
 *   npm run readme-hero -- --song "temp/Iron Waltz - alphaTab.gp"
 *
 * The song needs a backing track and `ffmpeg` on the PATH for the waveform. Run with `--help` for all options.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { type FontFace, GlyphLibrary, num, registerOutlineEngine } from './outline-canvas.mts';

type AlphaTab = typeof import('@coderline/alphatab');
type Score = import('@coderline/alphatab').model.Score;

const { values: args } = parseArgs({
    options: {
        song: { type: 'string' },
        out: { type: 'string', default: 'img/hero.svg' },
        alphatab: { type: 'string', default: '@coderline/alphatab' },
        track: { type: 'string', default: '0' },
        start: { type: 'string', default: '77' },
        bars: { type: 'string', default: '4' },
        scale: { type: 'string', default: '0.78' },
        loop: { type: 'string', default: '78-79' },
        cursor: { type: 'string', default: '79.4' },
        muted: { type: 'string', default: '4' },
        subtitle: { type: 'string', default: 'alphaTab demo song' },
        help: { type: 'boolean', default: false }
    }
});

if (args.help || !args.song) {
    console.log(`Options:
  --song <file>       Score to render (required). Its backing track provides the waveform and timing.
  --out <file>        Output SVG (default: img/hero.svg)
  --alphatab <spec>   alphaTab ES module to use (default: @coderline/alphatab, the build in packages/alphatab/dist)
  --track <index>     Track to render (default: 0)
  --start <bar>       First rendered bar, 1-based (default: 77)
  --bars <count>      Number of rendered bars (default: 4)
  --scale <factor>    alphaTab display scale (default: 0.78)
  --loop <from-to>    Bars of the highlighted loop range (default: 78-79)
  --cursor <bar.beat> Bar and beat index of the playback cursor (default: 79.4)
  --muted <indexes>   Comma-separated tracks shown as muted (default: 4)
  --subtitle <text>   Text before the time signature and tempo in the title bar`);
    process.exit(args.song ? 0 : 1);
}

const alphaTabSpec =
    args.alphatab!.startsWith('.') || path.isAbsolute(args.alphatab!) ? path.resolve(args.alphatab!) : args.alphatab!;
const alphaTab: AlphaTab = await import(alphaTabSpec);

const config = {
    track: Number(args.track),
    startBar: Number(args.start),
    barCount: Number(args.bars),
    scale: Number(args.scale),
    loop: args.loop!.split('-').map(Number) as [number, number],
    cursor: { bar: Number(args.cursor!.split('.')[0]), beat: Number(args.cursor!.split('.')[1] ?? 0) },
    muted: new Set(args.muted ? args.muted.split(',').map(Number) : [])
};

const W = 1080;
const PAD = { left: 24, right: 24, top: 18, bottom: 34 };
const WIN = { x: PAD.left, y: PAD.top, w: W - PAD.left - PAD.right };
const HEADER_H = 54;
const SIDEBAR_W = 200;
const VIEWPORT_H = 246;
const TIMELINE_H = 70;
const WIN_H = HEADER_H + 1 + VIEWPORT_H + 1 + TIMELINE_H;
const H = PAD.top + WIN_H + PAD.bottom;
const VIEWPORT = { x: WIN.x + SIDEBAR_W, y: WIN.y + HEADER_H + 1, w: WIN.w - SIDEBAR_W, h: VIEWPORT_H };
const TIMELINE_Y = VIEWPORT.y + VIEWPORT_H + 1;

const glyphs = new GlyphLibrary();
const ENGINE = 'outline-svg';
// The window shows only the systems, not alphaTab's attribution line below them.
registerOutlineEngine(alphaTab, glyphs, ENGINE, text => text === 'rendered by alphaTab');

const songPath = path.resolve(args.song!);
const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(new Uint8Array(fs.readFileSync(songPath)));

// --- timing -------------------------------------------------------------------------------------------------------

/** Score time of every masterbar start (seconds), and a mapping from score time to backing-track time. */
function computeTiming(score: Score) {
    const starts: number[] = [];
    let time = 0;
    let tempo = score.tempo;
    for (const mb of score.masterBars) {
        starts.push(time);
        const duration = mb.calculateDuration();
        let ratio = 0;
        for (const automation of [...mb.tempoAutomations].sort((a, b) => a.ratioPosition - b.ratioPosition)) {
            time += (((automation.ratioPosition - ratio) * duration) / 960) * (60 / tempo);
            ratio = automation.ratioPosition;
            tempo = automation.value;
        }
        time += (((1 - ratio) * duration) / 960) * (60 / tempo);
    }
    starts.push(time);

    const scoreTimeAt = (barIndex: number, ratio: number) =>
        starts[barIndex] + (starts[barIndex + 1] - starts[barIndex]) * ratio;

    const anchors: [number, number][] = [];
    for (const mb of score.masterBars) {
        for (const sp of mb.syncPoints ?? []) {
            anchors.push([scoreTimeAt(mb.index, sp.ratioPosition), sp.syncPointValue!.millisecondOffset / 1000]);
        }
    }
    anchors.sort((a, b) => a[0] - b[0]);

    const toAudio = (t: number) => {
        if (anchors.length === 0) {
            return t;
        }
        if (t <= anchors[0][0] || anchors.length === 1) {
            return anchors[0][1] + (t - anchors[0][0]);
        }
        for (let i = 1; i < anchors.length; i++) {
            const [s0, a0] = anchors[i - 1];
            const [s1, a1] = anchors[i];
            if (t <= s1) {
                return a0 + ((t - s0) / (s1 - s0)) * (a1 - a0);
            }
        }
        const [sl, al] = anchors[anchors.length - 1];
        return al + (t - sl);
    };

    return { scoreTimeAt, toAudio, duration: toAudio(starts[starts.length - 1]) };
}

/** RMS envelope (0..1) of the backing track and its duration, or `null` without backing track. */
function decodeBackingTrack(score: Score, fallbackDuration: number): { peaks: number[]; duration: number } | null {
    const raw = score.backingTrack?.rawAudioFile;
    if (!raw) {
        console.warn('Song has no backing track, the timeline shows no waveform.');
        return null;
    }
    const sampleRate = 8000;
    const result = spawnSync(
        'ffmpeg',
        ['-v', 'error', '-i', 'pipe:0', '-ac', '1', '-ar', `${sampleRate}`, '-f', 's16le', 'pipe:1'],
        {
            input: raw,
            maxBuffer: 256 * 1024 * 1024
        }
    );
    if (result.error || result.status !== 0) {
        throw new Error(
            `Decoding the backing track needs ffmpeg on the PATH: ${result.error?.message ?? result.stderr}`
        );
    }
    const pcm = result.stdout;
    const samples = pcm.length / 2;
    const bins = 220;
    const perBin = Math.floor(samples / bins);
    const peaks: number[] = [];
    for (let i = 0; i < bins; i++) {
        let sum = 0;
        for (let j = 0; j < perBin; j++) {
            const v = pcm.readInt16LE((i * perBin + j) * 2) / 32768;
            sum += v * v;
        }
        peaks.push(Math.sqrt(sum / perBin));
    }
    const max = Math.max(...peaks) || 1;
    return { peaks: peaks.map(p => p / max), duration: samples / sampleRate || fallbackDuration };
}

// --- notation -----------------------------------------------------------------------------------------------------

function renderNotation() {
    const settings = new alphaTab.Settings();
    settings.core.engine = ENGINE;
    settings.core.enableLazyLoading = false;
    settings.core.useWorkers = false;
    settings.display.layoutMode = alphaTab.LayoutMode.Page;
    settings.display.startBar = config.startBar;
    settings.display.barCount = config.barCount;
    settings.display.barsPerRow = config.barCount;
    settings.display.scale = config.scale;
    settings.display.padding = [20, 22, 30, 18];
    settings.display.lastSystemFillThreshold = 0;
    for (const element of [
        'GuitarTuning',
        'ScoreTitle',
        'ScoreSubTitle',
        'ScoreArtist',
        'ScoreAlbum',
        'ScoreWords',
        'ScoreMusic',
        'ScoreWordsAndMusic',
        'ScoreCopyright',
        'TrackNames'
    ] as const) {
        settings.notation.elements.set(alphaTab.NotationElement[element], false);
    }

    const renderer = new alphaTab.rendering.ScoreRenderer(settings);
    renderer.width = VIEWPORT.w;
    const partials: { x: number; y: number; svg: string }[] = [];
    let failure: unknown;
    renderer.partialRenderFinished.on(r => {
        if (typeof r.renderResult === 'string') {
            partials.push({ x: r.x, y: r.y, svg: r.renderResult });
        }
    });
    renderer.error.on(e => {
        failure = e;
    });
    const warnings: string[] = [];
    const log = alphaTab.Logger.log;
    alphaTab.Logger.log = {
        ...log,
        warning: (category: string, msg: string, ...details: unknown[]) => {
            warnings.push(`[${category}] ${msg}`);
            log.warning(category, msg, ...details);
        }
    };
    renderer.renderScore(score, [config.track]);
    alphaTab.Logger.log = log;
    if (failure) {
        throw failure;
    }
    if (warnings.some(w => w.includes('do not fit'))) {
        console.warn('Notation is compressed below its minimum width; reduce --scale or --bars.');
    }

    const lookup = renderer.boundsLookup!;
    const system = lookup.staffSystems[0];
    const masterBar = (bar: number) => {
        const bounds = system.bars.find(b => b.index === bar - 1);
        if (!bounds) {
            throw new Error(`Bar ${bar} is not part of the rendered range.`);
        }
        return bounds;
    };

    const content = partials
        .map(p => `<g transform="translate(${num(p.x)} ${num(p.y)})">${stripSvgRoot(p.svg)}</g>`)
        .join('');

    const cursorBeat = masterBar(config.cursor.bar).bars[0].beats[config.cursor.beat];
    if (!cursorBeat) {
        throw new Error(`Bar ${config.cursor.bar} has no beat ${config.cursor.beat}.`);
    }
    const cursorStart = cursorBeat.beat.playbackStart;
    const highlightedBounds = masterBar(config.cursor.bar)
        .bars.flatMap(b => b.beats)
        .filter(
            b => b.beat.playbackStart <= cursorStart && cursorStart < b.beat.playbackStart + b.beat.playbackDuration
        );
    const highlighted = highlightedBounds.map(b => b.beat.id);
    const inkLeft = Math.min(
        ...highlightedBounds.flatMap(b => [b.visualBounds.x, ...(b.notes ?? []).map(n => n.noteHeadBounds.x)])
    );

    let markup = content;
    for (const id of highlighted) {
        markup = markup.replaceAll(`<g class="b${id}">`, `<g class="b${id} hl">`);
    }
    markup = markup.replace(/<g class="b\d+">/g, '<g>').replace(/(\d+\.\d{3,})/g, m => num(Number(m)));

    const from = masterBar(config.loop[0]).realBounds;
    const to = masterBar(config.loop[1]).realBounds;
    const cursorMasterBar = score.masterBars[config.cursor.bar - 1];
    const cursorTime = timing.toAudio(
        timing.scoreTimeAt(cursorMasterBar.index, cursorStart / cursorMasterBar.calculateDuration())
    );

    return {
        markup,
        system: system.realBounds,
        loop: { x: from.x, y: from.y, w: to.x + to.w - from.x, h: from.h },
        cursorX: inkLeft - 7,
        cursorTime,
        loopTime: [
            timing.toAudio(timing.scoreTimeAt(config.loop[0] - 1, 0)),
            timing.toAudio(timing.scoreTimeAt(config.loop[1], 0))
        ] as [number, number],
        colors: settings.display.resources
    };
}

function stripSvgRoot(svg: string): string {
    return svg.replace(/^\s*<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

// --- composition --------------------------------------------------------------------------------------------------

function push(markup: string) {
    out.push(markup);
}

/** Draws `text` with its baseline at `y`; returns the advance width. */
function text(
    value: string,
    x: number,
    y: number,
    size: number,
    face: FontFace,
    cls: string,
    align?: 'start' | 'middle' | 'end',
    letterSpacing?: number
): number {
    const r = glyphs.text({ text: value, x, y, size, face, align, letterSpacing, attributes: `class="${cls}"` });
    push(r.svg);
    return r.width;
}

function rect(x: number, y: number, w: number, h: number, cls: string, rx = 0) {
    push(
        `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}"${rx ? ` rx="${num(rx)}"` : ''} class="${cls}"/>`
    );
}

function compose(): string {
    const duration = audio?.duration ?? timing.duration;

    push(
        `<rect x="${WIN.x + 0.5}" y="${WIN.y + 0.5}" width="${WIN.w - 1}" height="${WIN_H - 1}" rx="16" class="win" filter="url(#shadow)"/>`
    );
    push(
        `<clipPath id="win"><rect x="${WIN.x + 1}" y="${WIN.y + 1}" width="${WIN.w - 2}" height="${WIN_H - 2}" rx="15"/></clipPath>`
    );
    push('<g clip-path="url(#win)">');
    rect(WIN.x, WIN.y + HEADER_H, WIN.w, 1, 'line');
    rect(WIN.x, VIEWPORT.y, SIDEBAR_W - 1, VIEWPORT_H, 'panel');
    rect(WIN.x + SIDEBAR_W - 1, VIEWPORT.y, 1, VIEWPORT_H, 'line');
    rect(WIN.x, TIMELINE_Y - 1, WIN.w, 1, 'line');
    rect(WIN.x, TIMELINE_Y, WIN.w, TIMELINE_H, 'panel');

    header();
    sidebar();
    viewport();
    timeline(duration);
    push('</g>');

    function viewport() {
        const shiftY = Math.round((VIEWPORT_H + 18 - notation.system.h) / 2 - notation.system.y);
        const ox = VIEWPORT.x;
        const oy = VIEWPORT.y + shiftY;
        const { loop } = notation;
        push(
            `<rect x="${num(ox + loop.x)}" y="${num(oy + loop.y)}" width="${num(loop.w)}" height="${num(loop.h)}" rx="3" class="sel"/>`
        );
        const bracketY = oy + loop.y - 17;
        push(
            `<path d="M${num(ox + loop.x + 0.75)} ${num(bracketY + 7)}V${num(bracketY + 3)}q0-3 3-3H${num(ox + loop.x + loop.w - 3.75)}q3 0 3 3V${num(bracketY + 7)}" class="bracket"/>`
        );
        const label = `Loop · bars ${config.loop[0]}–${config.loop[1]}`;
        const labelW = glyphs.sansBold.measure(label, 10) + 11 + 4;
        const pillW = labelW + 13;
        const pillX = ox + loop.x + loop.w / 2 - pillW / 2;
        const pillY = bracketY - 9;
        push(`<rect x="${num(pillX)}" y="${num(pillY)}" width="${num(pillW)}" height="18" rx="9" class="accent"/>`);
        push(icon('loop', pillX + 6, pillY + 3.5, 11, 'icon-inv', 2.6));
        push(
            glyphs.text({
                text: label,
                x: pillX + 6 + 11 + 4,
                y: pillY + 12.6,
                size: 10,
                face: glyphs.sansBold,
                attributes: 'class="inv"'
            }).svg
        );

        push(`<g class="notation" transform="translate(${ox} ${oy})">${notation.markup}</g>`);

        const cx = ox + notation.cursorX;
        push(
            `<rect x="${num(cx - 3)}" y="${num(oy + loop.y)}" width="8.5" height="${num(loop.h)}" rx="4" class="cursor-halo"/>`
        );
        push(
            `<rect x="${num(cx)}" y="${num(oy + loop.y)}" width="2.5" height="${num(loop.h)}" rx="1.25" class="accent"/>`
        );
    }

    const css = buildCss(notation.colors);
    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(
            `${score.title} rendered by alphaTab in a player with loop, playback cursor and backing track`
        )}">` +
        `<style>${css}</style>` +
        `<defs><filter id="shadow" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="11" class="shadow"/></filter>${glyphs.defs()}</defs>` +
        out.join('') +
        '</svg>\n'
    );
}

function header() {
    const top = WIN.y;
    text(score.title, WIN.x + 18, top + 25, 15, glyphs.sansBold, 'ink');
    const mb = score.masterBars[0];
    text(
        `${args.subtitle} · ${mb.timeSignatureNumerator}/${mb.timeSignatureDenominator} · ${score.tempo} bpm`,
        WIN.x + 18,
        top + 41,
        11.5,
        glyphs.sans,
        'muted'
    );

    const right = WIN.x + WIN.w - 16;
    const segH = 28;
    const segY = top + (HEADER_H - segH) / 2;
    const segLabels = ['Synthesizer', 'Backing track'];
    const activeSeg = audio ? 1 : 0;
    const widths = segLabels.map((l, i) => glyphs.sansBold.measure(l, 11.5) + 20 + (i === 1 ? 12 : 0));
    const segW = widths.reduce((a, b) => a + b, 0) + 2 + 2 + 2;
    const segX = right - segW;
    rect(segX + 0.5, segY + 0.5, segW - 1, segH - 1, 'chip', 8);
    let x = segX + 2;
    segLabels.forEach((label, i) => {
        const on = i === activeSeg;
        if (on) {
            rect(x, segY + 2, widths[i], segH - 4, 'seg-on', 6);
        }
        let tx = x + 10;
        if (i === 1) {
            rect(tx - 3, segY + segH / 2 - 6, 12, 12, audio ? 'live-halo' : 'chip', 6);
            rect(tx, segY + segH / 2 - 3, 6, 6, audio ? 'live' : 'muted', 3);
            tx += 12;
        }
        text(label, tx, segY + 18, 11.5, on ? glyphs.sansBold : glyphs.sans, on ? 'ink' : 'muted');
        x += widths[i] + 2;
    });

    const file = `${score.title}${path.extname(songPath)}`;
    const fileW = glyphs.sans.measure(file, 11.5) + 16;
    const fileX = segX - 14 - fileW;
    rect(fileX + 0.5, top + 14.5, fileW - 1, 25, 'chip', 6);
    text(file, fileX + 8, top + 31, 11.5, glyphs.sans, 'soft');
}

function sidebar() {
    const x0 = WIN.x + 10;
    const w = SIDEBAR_W - 1 - 20;
    text('TRACKS', x0 + 8, VIEWPORT.y + 24, 10.5, glyphs.sansBold, 'muted', 'start', 0.08);
    let y = VIEWPORT.y + 35;
    // Illustrative mixer levels; the score carries no per-track volume worth showing.
    const volumes = [0.82, 0.64, 0.7, 0.76, 0.5];
    score.tracks.slice(0, 5).forEach((track, i) => {
        const on = i === config.track;
        const muted = config.muted.has(i);
        const rowH = 37;
        if (on) {
            rect(x0 + 0.5, y + 0.5, w - 1, rowH - 1, 'row-on', 9);
        }
        rect(x0 + 8, y + (rowH - 24) / 2, 4, 24, `tc${i % 6}`, 2);
        const nameX = x0 + 8 + 4 + 10;
        text(
            track.name,
            nameX,
            y + 6 + 13,
            12.5,
            on ? glyphs.sansBold : glyphs.sans,
            muted ? 'muted' : on ? 'ink' : 'soft'
        );
        const btnX = x0 + w - 8 - 44;
        ['M', 'S'].forEach((label, j) => {
            const bx = btnX + j * 24;
            const by = y + (rowH - 20) / 2;
            const active = label === 'M' && muted;
            rect(bx + 0.5, by + 0.5, 19, 19, active ? 'btn-m' : 'btn', 5);
            text(label, bx + 10, by + 14, 10, glyphs.sansBold, active ? 'danger' : 'muted', 'middle');
        });
        const volX = nameX;
        const volW = btnX - 10 - volX;
        rect(volX, y + 6 + 22, volW, 3, 'vol-bg', 1.5);
        rect(volX, y + 6 + 22, volW * (volumes[i] ?? 0.6), 3, `tc${i % 6}`, 1.5);
        y += rowH + 2;
    });
}

function timeline(duration: number) {
    const cy = TIMELINE_Y + TIMELINE_H / 2;
    const playX = WIN.x + 18;
    rect(playX, cy - 19, 38, 38, 'accent', 19);
    rect(playX + 13, cy - 7.5, 4, 15, 'inv', 1.2);
    rect(playX + 21, cy - 7.5, 4, 15, 'inv', 1.2);

    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    let x = playX + 38 + 14;
    x += text(fmt(notation.cursorTime), x, cy + 4.5, 12, glyphs.sansBold, 'soft');
    x += text(` / ${fmt(duration)}`, x, cy + 4.5, 12, glyphs.sans, 'muted');

    // tools, right to left
    const toolsRight = WIN.x + WIN.w - 18;
    const tools: { w: number; draw: (x: number) => void }[] = [
        {
            w: 28,
            draw: tx => {
                rect(tx + 0.5, cy - 13.5, 27, 27, 'tool-on', 7);
                push(icon('loop', tx + 6.5, cy - 7.5, 15, 'icon-on'));
            }
        },
        { w: 28, draw: tx => push(icon('metronome', tx + 6.5, cy - 7.5, 15, 'icon')) },
        {
            w: glyphs.sansBold.measure('0.75×', 11.5) + 14,
            draw: tx => text('0.75×', tx + 7, cy + 4, 11.5, glyphs.sansBold, 'soft')
        },
        { w: 28, draw: tx => push(icon('volume', tx + 6.5, cy - 7.5, 15, 'icon')) }
    ];
    const toolsW = tools.reduce((a, b) => a + b.w, 0) + 6 * (tools.length - 1);
    let tx = toolsRight - toolsW;
    for (const tool of tools) {
        tool.draw(tx);
        tx += tool.w + 6;
    }

    const scrubX = x + 14;
    const scrubW = toolsRight - toolsW - 14 - scrubX;
    const scrubY = cy - 23;
    const progress = notation.cursorTime / duration;
    const [loopFrom, loopTo] = notation.loopTime.map(v => v / duration);
    const peaks = audio?.peaks ?? new Array(220).fill(0.35);
    const barW = (scrubW - (peaks.length - 1)) / peaks.length;
    // One path per color keeps the 200+ waveform bars small.
    const wave = new Map<string, string>();
    peaks.forEach((p, i) => {
        const pos = (i + 0.5) / peaks.length;
        const cls = pos >= loopFrom && pos <= loopTo ? 'accent' : pos < progress ? 'wave-p' : 'wave';
        const h = 26 * Math.max(0.08, p);
        const bar = `M${num(scrubX + i * (barW + 1))} ${num(scrubY + 4 + (26 - h) / 2)}h${num(barW)}v${num(h)}h${num(-barW)}z`;
        wave.set(cls, (wave.get(cls) ?? '') + bar);
    });
    for (const [cls, d] of wave) {
        push(`<path d="${d}" class="${cls}"/>`);
    }

    const headX = scrubX + progress * scrubW;
    rect(headX - 1, scrubY, 2, 34, 'ink', 1);
    rect(headX - 4, scrubY - 3, 8, 8, 'ink', 4);

    // section labels; the current section always shows, others only where they don't collide
    const sections = score.masterBars
        .filter(mb => mb.section)
        .map(mb => ({
            text: mb.section!.text || mb.section!.marker,
            time: timing.toAudio(timing.scoreTimeAt(mb.index, 0)),
            index: mb.index
        }));
    const current = sections.filter(s => s.index <= config.cursor.bar - 1).pop();
    const LABEL_GAP = 10;
    const candidates = sections.map((s, i) => {
        const x = scrubX + (s.time / duration) * scrubW;
        const end = x + 5 + glyphs.sans.measure(s.text, 9.5);
        const length = (sections[i + 1]?.time ?? duration) - s.time;
        return { x, end, s, length };
    });
    // The current section always shows; the others by descending length, wherever they don't collide.
    candidates.sort((a, b) => (a.s === current ? -1 : b.s === current ? 1 : b.length - a.length));
    const placed: typeof candidates = [];
    for (const c of candidates) {
        const fits =
            c.end <= scrubX + scrubW && placed.every(p => c.end + LABEL_GAP <= p.x || p.end + LABEL_GAP <= c.x);
        if (fits) {
            placed.push(c);
        }
    }
    const labelsY = scrubY + 46 - 12;
    for (const p of placed) {
        const isCurrent = p.s === current;
        rect(p.x, labelsY, 1, 12, isCurrent ? 'accent' : 'line');
        text(
            p.s.text,
            p.x + 5,
            labelsY + 9.5,
            9.5,
            isCurrent ? glyphs.sansBold : glyphs.sans,
            isCurrent ? 'accent' : 'muted'
        );
    }
}

/** Lucide-style stroke icons on a 24 unit grid. */
function icon(
    name: 'loop' | 'metronome' | 'volume',
    x: number,
    y: number,
    size: number,
    cls: string,
    strokeWidth = 2
): string {
    const paths = {
        loop: 'M17 2l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3',
        metronome: 'M9 3h6l4 18H5zM12 15 17 6M8 15h8',
        volume: 'M11 5 6 9H3v6h3l5 4zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12'
    };
    return `<path d="${paths[name]}" transform="translate(${num(x)} ${num(y)}) scale(${num(size / 24, 4)})" class="${cls}" style="stroke-width:${strokeWidth}"/>`;
}

function escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// --- theme --------------------------------------------------------------------------------------------------------

function buildCss(resources: import('@coderline/alphatab').RenderingResources): string {
    const light = {
        surface: '#ffffff',
        panel: '#fbfcfe',
        'surface-alt': '#eef2f8',
        line: '#dfe5ee',
        ink: '#0d1626',
        soft: '#3a4761',
        muted: '#697587',
        accent: '#3b6db8',
        inv: '#ffffff',
        'accent-soft': 'rgba(59,109,184,.10)',
        'accent-line': 'rgba(59,109,184,.24)',
        sel: 'rgba(59,109,184,.16)',
        halo: 'rgba(59,109,184,.16)',
        wave: '#c9d2df',
        'wave-p': '#8fb0dd',
        live: '#2f8f6c',
        'live-halo': 'rgba(47,143,108,.18)',
        danger: '#c0392b',
        'danger-soft': '#fdecea',
        'danger-line': '#f2c4bf',
        shadow: 'rgba(13,22,38,.28)',
        'n-ink': '#0d1626',
        'n-staff': '#a3acba',
        'n-bar': '#2a3346',
        'n-num': '#c0392b',
        'n-soft': 'rgba(13,22,38,.4)',
        tc0: '#3b6db8',
        tc1: '#7a5cc0',
        tc2: '#208a73',
        tc3: '#c07a3e',
        tc4: '#a64570',
        tc5: '#3e8eb3'
    };
    const dark: typeof light = {
        surface: '#0f1729',
        panel: '#0c1424',
        'surface-alt': '#162033',
        line: '#22304a',
        ink: '#eef2f8',
        soft: '#bcc6d6',
        muted: '#7e8aa0',
        accent: '#6a98e3',
        inv: '#0a1020',
        'accent-soft': 'rgba(106,152,227,.14)',
        'accent-line': 'rgba(106,152,227,.32)',
        sel: 'rgba(106,152,227,.18)',
        halo: 'rgba(106,152,227,.22)',
        wave: '#2a3854',
        'wave-p': '#4b6aa0',
        live: '#4cc38a',
        'live-halo': 'rgba(76,195,138,.2)',
        danger: '#ff8a80',
        'danger-soft': 'rgba(255,138,128,.12)',
        'danger-line': 'rgba(255,138,128,.35)',
        shadow: 'rgba(0,0,0,.6)',
        'n-ink': '#e3eaf3',
        'n-staff': '#4f5d78',
        'n-bar': '#aab5c8',
        'n-num': '#f0716c',
        'n-soft': 'rgba(227,234,243,.4)',
        tc0: '#6a98e3',
        tc1: '#9d84dc',
        tc2: '#3fb595',
        tc3: '#dd9a5e',
        tc4: '#d0688f',
        tc5: '#62acd0'
    };
    const vars = (theme: typeof light) =>
        Object.entries(theme)
            .map(([k, v]) => `--${k}:${v}`)
            .join(';');

    const fills: [string, string][] = [
        ['win', 'surface'],
        ['panel', 'panel'],
        ['line', 'line'],
        ['ink', 'ink'],
        ['soft', 'soft'],
        ['muted', 'muted'],
        ['accent', 'accent'],
        ['inv', 'inv'],
        ['chip', 'surface-alt'],
        ['seg-on', 'surface'],
        ['btn', 'surface'],
        ['btn-m', 'danger-soft'],
        ['danger', 'danger'],
        ['row-on', 'surface'],
        ['vol-bg', 'line'],
        ['sel', 'sel'],
        ['cursor-halo', 'halo'],
        ['wave', 'wave'],
        ['wave-p', 'wave-p'],
        ['live', 'live'],
        ['live-halo', 'live-halo'],
        ['tool-on', 'accent-soft'],
        ['tc0', 'tc0'],
        ['tc1', 'tc1'],
        ['tc2', 'tc2'],
        ['tc3', 'tc3'],
        ['tc4', 'tc4'],
        ['tc5', 'tc5']
    ];
    const strokes: [string, string][] = [
        ['win', 'line'],
        ['chip', 'line'],
        ['btn', 'line'],
        ['btn-m', 'danger-line'],
        ['row-on', 'line'],
        ['tool-on', 'accent-line']
    ];

    // alphaTab writes its colors as attributes; attribute selectors retheme them without rewriting the markup.
    const notationColors: [string, string][] = [
        [resources.mainGlyphColor.rgba, 'n-ink'],
        [resources.scoreInfoColor.rgba, 'n-ink'],
        [resources.staffLineColor.rgba, 'n-staff'],
        [resources.barSeparatorColor.rgba, 'n-bar'],
        [resources.barNumberColor.rgba, 'n-num'],
        [resources.secondaryGlyphColor.rgba, 'n-soft']
    ];

    return [
        `svg{${vars(light)}}`,
        `@media (prefers-color-scheme:dark){svg{${vars(dark)}}}`,
        ...fills.map(([c, v]) => `.${c}{fill:var(--${v})}`),
        ...strokes.map(([c, v]) => `.${c}{stroke:var(--${v})}`),
        '.bracket{fill:none;stroke:var(--accent);stroke-width:1.5}',
        '.icon,.icon-on,.icon-inv{fill:none;stroke-linecap:round;stroke-linejoin:round}',
        '.icon{stroke:var(--soft)}.icon-on{stroke:var(--accent)}.icon-inv{stroke:var(--inv)}',
        '.shadow{flood-color:var(--shadow)}',
        '.notation{fill:var(--n-ink)}',
        ...notationColors.flatMap(([color, v]) => [
            `.notation [fill="${color}"]{fill:var(--${v})}`,
            `.notation [stroke="${color}"]{stroke:var(--${v})}`
        ]),
        '.notation .hl *{fill:var(--accent)}.notation .hl [stroke]{stroke:var(--accent)}'
    ].join('');
}

// --- main -------------------------------------------------------------------------------------------------------------

const out: string[] = [];
const timing = computeTiming(score);
const audio = decodeBackingTrack(score, timing.duration);
const notation = renderNotation();

const svg = compose();
fs.mkdirSync(path.dirname(path.resolve(args.out!)), { recursive: true });
fs.writeFileSync(path.resolve(args.out!), svg);
console.log(`Wrote ${args.out} (${(svg.length / 1024).toFixed(1)} KiB)`);
