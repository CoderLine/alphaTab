import * as alphaTab from '@coderline/alphatab';
import { type Mountable, css, html, injectStyles, parseHtml } from '../util/Dom';
import { ControlApp } from './ControlApp';

injectStyles(
    'PlayerPositionRateApp',
    css`
    .at-ppr-panel {
        position: fixed;
        top: 8px;
        right: 8px;
        z-index: 1000;
        min-width: 300px;
        padding: 10px 12px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.95);
        font-size: 0.85rem;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    }
    .at-ppr-panel label { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
    .at-ppr-panel table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    .at-ppr-panel td { padding: 1px 0; }
    .at-ppr-panel td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
`
);

interface FastSong {
    name: string;
    tempo: number;
    duration: number;
    bars: number;
}

const songs: FastSong[] = [
    { name: '16ths @ 240 bpm (62.5 ms)', tempo: 240, duration: 16, bars: 32 },
    { name: '32nds @ 240 bpm (31.3 ms)', tempo: 240, duration: 32, bars: 32 },
    { name: '32nds @ 300 bpm (25.0 ms)', tempo: 300, duration: 32, bars: 40 },
    { name: '64ths @ 240 bpm (15.6 ms)', tempo: 240, duration: 64, bars: 16 }
];

const intervals: number[] = [0, 5, 10, 15, 23.2];

function songTex(song: FastSong): string {
    const bar = `:${song.duration} ${'3.3 5.3 7.3 5.3 '.repeat(song.duration / 4).trim()}`;
    const bars: string[] = [];
    for (let i = 0; i < song.bars; i++) {
        bars.push(bar);
    }
    return `\\title "${song.name}" \\tempo ${song.tempo} . ${bars.join(' | ')}`;
}

/**
 * Plays fast songs and compares player position update intervals
 * (`player.positionUpdateIntervalInMilliseconds`) while playing.
 */
export class PlayerPositionRateApp implements Mountable {
    readonly root: HTMLElement;
    private control: ControlApp;
    private panel: HTMLElement;
    private unsubs: (() => void)[] = [];
    private timer: number;

    private beatIndex = new Map<alphaTab.model.Beat, number>();
    private lastBeatIndex = -1;
    private positionEvents: number[] = [];
    private beatEvents: number[] = [];
    private skipped = 0;
    private maxGap = 0;
    private maxTimeStep = 0;
    private lastPositionAt = -1;
    private lastPositionTime = -1;
    private beatMs = 0;

    constructor() {
        this.control = new ControlApp({ settings: { core: { file: null } } });
        this.root = this.control.root;
        const api = this.control.api;

        this.panel = parseHtml(html`
            <div class="at-ppr-panel">
                <label>Song <select class="at-ppr-song"></select></label>
                <label>Position update interval <select class="at-ppr-interval"></select></label>
                <table>
                    <tr><td>playerPositionChanged / s</td><td class="at-ppr-updates">-</td></tr>
                    <tr><td>playedBeatChanged / s</td><td class="at-ppr-beats">-</td></tr>
                    <tr><td>beats / s in the song</td><td class="at-ppr-expected">-</td></tr>
                    <tr><td>skipped beats</td><td class="at-ppr-skipped">-</td></tr>
                    <tr><td>max gap between updates (ms)</td><td class="at-ppr-gap">-</td></tr>
                    <tr><td>max position step (ms)</td><td class="at-ppr-step">-</td></tr>
                </table>
            </div>
        `);
        document.body.appendChild(this.panel);

        const songSelect = this.panel.querySelector<HTMLSelectElement>('.at-ppr-song')!;
        songs.forEach((s, i) => {
            songSelect.appendChild(new Option(s.name, String(i)));
        });
        songSelect.onchange = () => this.loadSong(songs[Number(songSelect.value)]);

        const intervalSelect = this.panel.querySelector<HTMLSelectElement>('.at-ppr-interval')!;
        for (const interval of intervals) {
            const label =
                interval === 0 ? '0 ms (every quantum)' : interval === 10 ? '10 ms (default)' : `${interval} ms`;
            intervalSelect.appendChild(new Option(label, String(interval)));
        }
        intervalSelect.value = String(api.settings.player.positionUpdateIntervalInMilliseconds);
        intervalSelect.onchange = () => this.setInterval(Number(intervalSelect.value));

        this.unsubs.push(
            api.scoreLoaded.on(score => {
                this.beatIndex.clear();
                let i = 0;
                for (const bar of score.tracks[0].staves[0].bars) {
                    for (const beat of bar.voices[0].beats) {
                        this.beatIndex.set(beat, i++);
                    }
                }
                this.reset();
            }),
            api.playerPositionChanged.on(e => {
                if (e.isSeek) {
                    this.reset();
                    return;
                }
                const now = performance.now();
                this.positionEvents.push(now);
                if (this.lastPositionAt >= 0) {
                    this.maxGap = Math.max(this.maxGap, now - this.lastPositionAt);
                    this.maxTimeStep = Math.max(this.maxTimeStep, e.currentTime - this.lastPositionTime);
                }
                this.lastPositionAt = now;
                this.lastPositionTime = e.currentTime;
            }),
            api.playedBeatChanged.on(beat => {
                this.beatEvents.push(performance.now());
                const index = this.beatIndex.get(beat) ?? -1;
                if (this.lastBeatIndex >= 0 && index > this.lastBeatIndex + 1) {
                    this.skipped += index - this.lastBeatIndex - 1;
                }
                this.lastBeatIndex = index;
            }),
            api.playerStateChanged.on(e => {
                if (e.state !== alphaTab.synth.PlayerState.Playing) {
                    this.lastPositionAt = -1;
                    this.lastBeatIndex = -1;
                }
            })
        );

        this.timer = window.setInterval(() => this.updateStats(), 500);
        this.loadSong(songs[1]);
        songSelect.value = '1';
    }

    private loadSong(song: FastSong): void {
        this.beatMs = 60000 / song.tempo / (song.duration / 4);
        this.control.api.tex(songTex(song));
    }

    private setInterval(interval: number): void {
        const api = this.control.api;
        api.settings.player.positionUpdateIntervalInMilliseconds = interval;
        // the audio worklet takes the interval when the playback starts
        if (api.playerState === alphaTab.synth.PlayerState.Playing) {
            api.pause();
            api.play();
        }
        this.reset();
    }

    private reset(): void {
        this.positionEvents = [];
        this.beatEvents = [];
        this.skipped = 0;
        this.maxGap = 0;
        this.maxTimeStep = 0;
        this.lastPositionAt = -1;
        this.lastBeatIndex = -1;
    }

    private updateStats(): void {
        const now = performance.now();
        const since = now - 1000;
        this.positionEvents = this.positionEvents.filter(t => t >= since);
        this.beatEvents = this.beatEvents.filter(t => t >= since);
        const set = (cls: string, value: string) => {
            this.panel.querySelector<HTMLElement>(cls)!.textContent = value;
        };
        set('.at-ppr-updates', String(this.positionEvents.length));
        set('.at-ppr-beats', String(this.beatEvents.length));
        set('.at-ppr-expected', this.beatMs > 0 ? (1000 / this.beatMs).toFixed(1) : '-');
        set('.at-ppr-skipped', String(this.skipped));
        set('.at-ppr-gap', this.maxGap.toFixed(1));
        set('.at-ppr-step', this.maxTimeStep.toFixed(1));
    }

    dispose(): void {
        window.clearInterval(this.timer);
        for (const u of this.unsubs) {
            u();
        }
        this.panel.remove();
        this.control.dispose();
    }
}
