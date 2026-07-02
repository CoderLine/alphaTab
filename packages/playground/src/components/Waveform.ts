import * as alphaTab from '@coderline/alphatab';
import { type Mountable, css, html, injectStyles, parseHtml } from '../util/Dom';

injectStyles(
    'Waveform',
    css`
    .at-waveform {
        position: relative;
        background: #f7f7f7;
        border-top: 1px solid rgba(0, 0, 0, 0.12);
        cursor: pointer;
    }
    .at-waveform.hidden { display: none; }
    .at-waveform > canvas {
        width: 100%;
        opacity: 0.5;
        display: block;
    }
    .at-waveform > .at-waveform-cursor {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 1px;
        background: var(--at-cursor-beat);
    }
`
);

export class Waveform implements Mountable {
    readonly root: HTMLElement;
    private cursor: HTMLElement;
    private canvas: HTMLCanvasElement | null = null;
    private currentScore: alphaTab.model.Score | null = null;
    private audioElement: HTMLAudioElement | null = null;
    private updateCursor = () => this.refreshCursor();
    private unsubScoreLoaded: () => void;
    private unsubPlayerReady: () => void;
    private unsubStateChanged: () => void;

    constructor(private api: alphaTab.AlphaTabApi) {
        this.root = parseHtml(html`
            <div class="at-waveform hidden">
                <div class="at-waveform-cursor"></div>
            </div>
        `);
        this.cursor = this.root.querySelector('.at-waveform-cursor')!;
        this.root.addEventListener('click', e => {
            if (this.audioElement) {
                const rect = this.root.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                this.audioElement.currentTime = this.audioElement.duration * percent;
            }
        });

        this.unsubScoreLoaded = api.scoreLoaded.on(() => this.refresh());
        this.unsubPlayerReady = api.playerReady.on(() => this.refresh());
        this.unsubStateChanged = api.playerStateChanged.on(() => this.refresh());
    }

    private async refresh(): Promise<void> {
        const score = this.api.score;
        const player = this.api.player;
        if (!score || !player || !score.backingTrack || this.api.actualPlayerMode !== alphaTab.PlayerMode.EnabledBackingTrack) {
            this.hide();
            return;
        }

        const output = player.output as alphaTab.synth.IAudioElementBackingTrackSynthOutput;
        if (typeof output.audioElement === 'undefined') {
            this.hide();
            return;
        }
        this.bindAudio(output.audioElement);

        if (score === this.currentScore) {
            return;
        }
        this.currentScore = score;
        this.root.classList.remove('hidden');
        await this.draw(score.backingTrack);
    }

    private bindAudio(audio: HTMLAudioElement): void {
        if (this.audioElement === audio) {
            return;
        }
        this.unbindAudio();
        this.audioElement = audio;
        audio.addEventListener('timeupdate', this.updateCursor);
        audio.addEventListener('durationchange', this.updateCursor);
        audio.addEventListener('seeked', this.updateCursor);
    }

    private unbindAudio(): void {
        if (!this.audioElement) {
            return;
        }
        this.audioElement.removeEventListener('timeupdate', this.updateCursor);
        this.audioElement.removeEventListener('durationchange', this.updateCursor);
        this.audioElement.removeEventListener('seeked', this.updateCursor);
        this.audioElement = null;
    }

    private hide(): void {
        this.root.classList.add('hidden');
        this.unbindAudio();
        this.currentScore = null;
    }

    private refreshCursor(): void {
        if (!this.audioElement || !this.audioElement.duration) {
            return;
        }
        this.cursor.style.left = `${(this.audioElement.currentTime / this.audioElement.duration) * 100}%`;
    }

    private async draw(backingTrack: alphaTab.model.BackingTrack): Promise<void> {
        const buffer = backingTrack.rawAudioFile;
        if (!buffer) {
            return;
        }

        const audioContext = new AudioContext();
        const data = await audioContext.decodeAudioData(structuredClone(buffer.buffer) as ArrayBuffer);

        const top = data.getChannelData(0);
        const bottom = data.numberOfChannels > 1 ? data.getChannelData(1) : top;
        const length = top.length;

        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.root.insertBefore(this.canvas, this.cursor);
        }
        const width = this.root.offsetWidth || 600;
        const height = 80;
        this.canvas.width = width;
        this.canvas.height = height;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            return;
        }
        const pixelRatio = window.devicePixelRatio || 1;
        const halfHeight = height / 2;
        const barWidth = 2 * pixelRatio;
        const barGap = 1 * pixelRatio;
        const barIndexScale = width / (barWidth + barGap) / length;

        ctx.beginPath();
        let prevX = 0;
        let maxTop = 0;
        let maxBottom = 0;
        for (let i = 0; i <= length; i++) {
            const x = Math.round(i * barIndexScale);
            if (x > prevX) {
                const topBarHeight = Math.round(maxTop * halfHeight);
                const bottomBarHeight = Math.round(maxBottom * halfHeight);
                const barHeight = topBarHeight + bottomBarHeight || 1;
                ctx.roundRect(prevX * (barWidth + barGap), halfHeight - topBarHeight, barWidth, barHeight, 2);
                prevX = x;
                maxTop = 0;
                maxBottom = 0;
            }
            const mt = Math.abs(top[i] || 0);
            const mb = Math.abs(bottom[i] || 0);
            if (mt > maxTop) {
                maxTop = mt;
            }
            if (mb > maxBottom) {
                maxBottom = mb;
            }
        }
        ctx.fillStyle = '#436d9d';
        ctx.fill();
    }

    dispose(): void {
        this.unsubScoreLoaded();
        this.unsubPlayerReady();
        this.unsubStateChanged();
        this.unbindAudio();
        this.root.remove();
    }
}
