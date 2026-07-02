import type * as alphaTab from '@coderline/alphatab';
import { type Mountable, css, html, injectStyles, mount, parseHtml } from '../util/Dom';
import { type IconNode, Icons, icon as renderIcon } from '../util/Icons';
import { Slider } from './primitives/Slider';
import { ToggleButton } from './primitives/ToggleButton';

function pickTrackIcon(track: alphaTab.model.Track): IconNode {
    if (track.playbackInfo.primaryChannel === 9 || track.staves[0]?.isPercussion) {
        return Icons.TrackDrum;
    }
    const program = track.playbackInfo.program;
    if (program >= 0 && program <= 7) {
        // Acoustic Grand .. Clavi
        return Icons.TrackPiano;
    }
    if ((program >= 52 && program <= 54) || program === 85) {
        // Choir Aahs / Voice Oohs / Synth Voice / Lead 6 (voice)
        return Icons.TrackVoice;
    }
    if (program >= 112 && program <= 119) {
        // Percussive program range (Tinkle Bell .. Reverse Cymbal)
        return Icons.TrackDrum;
    }
    return Icons.Track;
}

injectStyles(
    'TrackItem',
    css`
    .at-track {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto;
        grid-template-areas: 'icon title' 'icon controls';
        padding: 5px;
        transition: background 0.2s;
        grid-gap: 5px;
        cursor: pointer;
    }
    .at-track:hover { background: rgba(0, 0, 0, 0.1); }
    .at-track.active { background: var(--at-track-active-bg); }
    .at-track > .at-track-icon {
        grid-area: icon;
        font-size: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0.5;
        transition: opacity 0.2s;
        width: 64px;
        height: 64px;
        color: inherit;
    }
    .at-track > .at-track-icon > svg { width: 32px; height: 32px; }
    .at-track:hover > .at-track-icon { opacity: 0.8; }
    .at-track.active > .at-track-icon { color: var(--at-accent); opacity: 1; }
    .at-track > .at-track-name {
        grid-area: title;
        font-weight: 500;
    }
    .at-track > .at-track-controls {
        grid-area: controls;
        display: flex;
        align-items: center;
    }
    .at-track > .at-track-controls > * { margin: 0 2px; }
    .at-track > .at-track-controls > .at-track-mute,
    .at-track > .at-track-controls > .at-track-solo {
        display: inline-flex;
        align-items: center;
        height: 26px;
        padding: 2px 8px;
        font-size: 11px;
        border: 1px solid;
        background: transparent;
        cursor: pointer;
        border-radius: 4px;
    }
    .at-track-mute { color: #dc3545; border-color: #dc3545; }
    .at-track-mute.at-toggle-active { background: #dc3545; color: #fff; }
    .at-track-solo { color: #198754; border-color: #198754; }
    .at-track-solo.at-toggle-active { background: #198754; color: #fff; }
    .at-track > .at-track-controls > .at-track-volume-icon { display: inline-flex; }
    .at-track > .at-track-controls > .at-track-volume-icon > svg { width: 14px; height: 14px; }
`
);

export class TrackItem implements Mountable {
    readonly root: HTMLElement;
    readonly track: alphaTab.model.Track;

    private muteBtn: ToggleButton;
    private soloBtn: ToggleButton;
    private volume: Slider;

    onSelect: ((e: MouseEvent) => void) | null = null;

    constructor(api: alphaTab.AlphaTabApi, track: alphaTab.model.Track) {
        this.track = track;
        this.root = parseHtml(html`
            <div class="at-track">
                <div class="at-track-icon"></div>
                <span class="at-track-name">${track.name}</span>
                <div class="at-track-controls">
                    <div class="cmp-mute"></div>
                    <div class="cmp-solo"></div>
                    <span class="at-track-volume-icon"></span>
                    <div class="cmp-volume"></div>
                </div>
            </div>
        `);
        this.root.querySelector('.at-track-icon')!.appendChild(renderIcon(pickTrackIcon(track)));
        this.root.querySelector('.at-track-volume-icon')!.appendChild(renderIcon(Icons.Volume));

        this.muteBtn = mount(
            this.root,
            '.cmp-mute',
            new ToggleButton({ icon: Icons.Track, label: 'Mute', tooltip: 'Mute track' })
        );
        // Replace the IconButton svg with simple text button by clearing the icon slot
        const muteIconSlot = this.muteBtn.root.querySelector('.at-icon-btn-icon');
        if (muteIconSlot) {
            muteIconSlot.remove();
        }
        this.muteBtn.root.classList.remove('at-icon-btn');
        this.muteBtn.root.classList.add('at-track-mute');
        this.muteBtn.onChange = active => {
            api.changeTrackMute([this.track], active);
        };

        this.soloBtn = mount(
            this.root,
            '.cmp-solo',
            new ToggleButton({ icon: Icons.Track, label: 'Solo', tooltip: 'Solo track' })
        );
        const soloIconSlot = this.soloBtn.root.querySelector('.at-icon-btn-icon');
        if (soloIconSlot) {
            soloIconSlot.remove();
        }
        this.soloBtn.root.classList.remove('at-icon-btn');
        this.soloBtn.root.classList.add('at-track-solo');
        this.soloBtn.onChange = active => {
            api.changeTrackSolo([this.track], active);
        };

        this.volume = mount(
            this.root,
            '.cmp-volume',
            new Slider({ min: 0, max: 16, step: 1, initialValue: track.playbackInfo.volume })
        );
        this.volume.onInput = value => {
            api.changeTrackVolume([this.track], value / Math.max(1, this.track.playbackInfo.volume));
        };

        this.root.addEventListener('click', e => this.onSelect?.(e));
    }

    setActive(active: boolean): void {
        this.root.classList.toggle('active', active);
    }

    isMuted(): boolean {
        return this.muteBtn.isActive();
    }

    isSoloed(): boolean {
        return this.soloBtn.isActive();
    }

    getVolume(): number {
        return this.volume.getValue();
    }

    dispose(): void {
        this.muteBtn.dispose();
        this.soloBtn.dispose();
        this.volume.dispose();
        this.root.remove();
    }
}
