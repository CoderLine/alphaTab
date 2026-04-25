import { type Mountable, css, html, injectStyles, parseHtml } from '../../util/Dom';

injectStyles(
    'DrumPadPanel',
    css`
    .at-drum-pad-panel {
        position: fixed;
        bottom: 72px;
        right: 16px;
        padding: 0 12px 12px 12px;
        background: rgba(33, 37, 41, 0.92);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        z-index: 1000;
        color: #fff;
        font-family: system-ui, sans-serif;
    }
    .at-drum-pad-panel > .at-drum-pad-handle {
        padding: 8px 10px;
        margin-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        cursor: move;
        user-select: none;
        font-size: 11px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    .at-drum-pad-panel .at-drum-pad-state-dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #6c757d;
    }
    .at-drum-pad-panel.recording .at-drum-pad-state-dot {
        background: #e53935;
        box-shadow: 0 0 6px #e53935;
    }
    .at-drum-pad-panel > .at-drum-pad-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 8px;
        opacity: 0.4;
        pointer-events: none;
    }
    .at-drum-pad-panel.recording > .at-drum-pad-grid {
        opacity: 1;
        pointer-events: auto;
    }
    .at-drum-pad-panel .at-drum-pad-btn {
        padding: 8px 10px;
        min-width: 68px;
        background: #4a5056;
        color: #fff;
        border: 1px solid #6c757d;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        line-height: 1.2;
        white-space: pre;
        font-family: inherit;
        transition: background 0.12s ease-out, border-color 0.12s ease-out;
    }
    .at-drum-pad-panel .at-drum-pad-btn.flash {
        background: #ff7043;
        border-color: #ffab91;
    }
`
);

export interface DrumPad {
    key: string;
    midiNote: number;
    label: string;
}

export const DEFAULT_DRUM_PADS: DrumPad[] = [
    { key: 'a', midiNote: 36, label: 'Kick' },
    { key: 's', midiNote: 38, label: 'Snare' },
    { key: 'd', midiNote: 42, label: 'Hi-Hat' },
    { key: 'f', midiNote: 46, label: 'Open HH' },
    { key: 'g', midiNote: 44, label: 'HH Pedal' },
    { key: 'h', midiNote: 45, label: 'Low Tom' },
    { key: 'j', midiNote: 47, label: 'Mid Tom' },
    { key: 'k', midiNote: 50, label: 'Hi Tom' },
    { key: 'l', midiNote: 49, label: 'Crash' },
    { key: ';', midiNote: 51, label: 'Ride' }
];

const FLASH_MS = 120;

export class DrumPadPanel implements Mountable {
    readonly root: HTMLElement;
    private gridEl: HTMLElement;
    private handleEl: HTMLElement;
    private stateLabelEl: HTMLElement;
    private btnByMidi = new Map<number, HTMLButtonElement>();
    private padByKey = new Map<string, DrumPad>();

    private dragOffsetX = 0;
    private dragOffsetY = 0;
    private onPointerDown = (e: PointerEvent) => {
        const rect = this.root.getBoundingClientRect();
        this.dragOffsetX = e.clientX - rect.left;
        this.dragOffsetY = e.clientY - rect.top;
        this.root.style.left = `${rect.left}px`;
        this.root.style.top = `${rect.top}px`;
        this.root.style.right = 'auto';
        this.root.style.bottom = 'auto';
        this.handleEl.setPointerCapture(e.pointerId);
    };
    private onPointerMove = (e: PointerEvent) => {
        if (!this.handleEl.hasPointerCapture(e.pointerId)) {
            return;
        }
        this.root.style.left = `${e.clientX - this.dragOffsetX}px`;
        this.root.style.top = `${e.clientY - this.dragOffsetY}px`;
    };
    private onPointerUp = (e: PointerEvent) => {
        this.handleEl.releasePointerCapture(e.pointerId);
    };
    private onKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) {
            return;
        }
        const pad = this.padByKey.get(e.key.toLowerCase());
        if (!pad) {
            return;
        }
        e.preventDefault();
        this.onHit?.(pad.midiNote);
    };

    onHit: ((midiNote: number) => void) | null = null;

    constructor(pads: DrumPad[] = DEFAULT_DRUM_PADS) {
        this.root = parseHtml(html`
            <div class="at-drum-pad-panel">
                <div class="at-drum-pad-handle">
                    <span class="at-drum-pad-state-dot"></span>
                    <span class="at-drum-pad-state-label">Paused — press Play to record</span>
                </div>
                <div class="at-drum-pad-grid"></div>
            </div>
        `);
        this.handleEl = this.root.querySelector('.at-drum-pad-handle')!;
        this.stateLabelEl = this.root.querySelector('.at-drum-pad-state-label')!;
        this.gridEl = this.root.querySelector('.at-drum-pad-grid')!;

        for (const pad of pads) {
            this.padByKey.set(pad.key, pad);
            const btn = parseHtml(
                html`<button type="button" class="at-drum-pad-btn">${pad.label}\n[${pad.key.toUpperCase()}]</button>`
            ) as HTMLButtonElement;
            // textContent preserves the literal newline
            btn.textContent = `${pad.label}\n[${pad.key.toUpperCase()}]`;
            btn.addEventListener('click', () => this.onHit?.(pad.midiNote));
            this.gridEl.appendChild(btn);
            this.btnByMidi.set(pad.midiNote, btn);
        }

        this.handleEl.addEventListener('pointerdown', this.onPointerDown);
        this.handleEl.addEventListener('pointermove', this.onPointerMove);
        this.handleEl.addEventListener('pointerup', this.onPointerUp);
        document.addEventListener('keydown', this.onKeyDown, true);
    }

    setRecording(recording: boolean): void {
        this.root.classList.toggle('recording', recording);
        this.stateLabelEl.textContent = recording
            ? 'Recording — hit pads or press keys'
            : 'Paused — press Play to record';
    }

    flash(midiNote: number): void {
        const btn = this.btnByMidi.get(midiNote);
        if (!btn) {
            return;
        }
        btn.classList.add('flash');
        window.setTimeout(() => btn.classList.remove('flash'), FLASH_MS);
    }

    dispose(): void {
        document.removeEventListener('keydown', this.onKeyDown, true);
        this.root.remove();
    }
}
