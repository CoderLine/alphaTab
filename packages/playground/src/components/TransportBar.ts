import * as alphaTab from '@coderline/alphatab';
import { type Mountable, css, html, injectStyles, mount, parseHtml } from '../util/Dom';
import { Icons } from '../util/Icons';
import { exportAudio, exportGp7 } from './AudioExporter';
import { Dropdown, type DropdownItem } from './primitives/Dropdown';
import { IconButton } from './primitives/IconButton';
import { LoadingProgress } from './primitives/LoadingProgress';
import { ToggleButton } from './primitives/ToggleButton';
import type { TrackList } from './TrackList';

injectStyles(
    'TransportBar',
    css`
    .at-transport {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--at-footer-bg);
        color: var(--at-footer-fg);
    }
    .at-transport-left,
    .at-transport-right {
        display: flex;
        align-items: center;
        padding: 3px;
    }
    .at-transport-left > *,
    .at-transport-right > * {
        margin-right: 4px;
    }
    .at-transport-separator {
        align-self: stretch;
        width: 1px;
        margin: 6px 4px;
        background: var(--at-divider);
    }
    .at-song-details {
        font-size: 12px;
        padding: 0 8px;
    }
    .at-song-details > .at-song-title { font-weight: 500; }
    .at-time-position {
        font-weight: bold;
        padding: 0 8px;
    }
    .at-loading-slot { display: inline-flex; align-items: center; }
    .at-loading-slot.hidden { display: none; }

    @media screen and (max-width: 920px) {
        .at-transport-right > *:not(.at-transport-essential) { display: none !important; }
    }
    @media screen and (max-width: 1100px) {
        .at-transport * { font-size: 12px !important; }
    }
`
);

const SPEED_ITEMS: DropdownItem<number>[] = [
    { value: 0.25, label: '0.25x' },
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 0.9, label: '0.9x' },
    { value: 1, label: '1x' },
    { value: 1.1, label: '1.1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' }
];

const ZOOM_ITEMS: DropdownItem<number>[] = [
    { value: 0.25, label: '25%' },
    { value: 0.5, label: '50%' },
    { value: 0.75, label: '75%' },
    { value: 0.9, label: '90%' },
    { value: 1, label: '100%' },
    { value: 1.1, label: '110%' },
    { value: 1.25, label: '125%' },
    { value: 1.5, label: '150%' },
    { value: 2, label: '200%' }
];

const LAYOUT_ITEMS: DropdownItem<alphaTab.LayoutMode>[] = [
    { value: alphaTab.LayoutMode.Horizontal, label: 'Horizontal', icon: Icons.LayoutHorizontal },
    { value: alphaTab.LayoutMode.Page, label: 'Vertical', icon: Icons.LayoutPage },
    { value: alphaTab.LayoutMode.Parchment, label: 'Parchment', icon: Icons.LayoutParchment }
];

const SCROLL_ITEMS: DropdownItem<alphaTab.ScrollMode>[] = [
    { value: alphaTab.ScrollMode.Off, label: 'No automatic Scrolling', icon: Icons.ScrollOff },
    { value: alphaTab.ScrollMode.Continuous, label: 'On bar change (Continuous)', icon: Icons.ScrollContinuous },
    { value: alphaTab.ScrollMode.OffScreen, label: 'On bar change (Out of Screen)', icon: Icons.ScrollOffScreen },
    { value: alphaTab.ScrollMode.Smooth, label: 'Smooth', icon: Icons.ScrollSmooth }
];

export interface TransportBarOptions {
    trackList?: TrackList;
}

export class TransportBar implements Mountable {
    readonly root: HTMLElement;
    private playPause: IconButton;
    private stop: IconButton;
    private metronome: ToggleButton;
    private countIn: ToggleButton;
    private loop: ToggleButton;
    private outputDevice: Dropdown<string>;
    private loadingProgress: LoadingProgress;
    private loadingSlot: HTMLElement;
    private titleEl: HTMLElement;
    private artistEl: HTMLElement;
    private timePositionEl: HTMLElement;
    private subscriptions: (() => void)[] = [];
    private outputDevices: alphaTab.synth.ISynthOutputDevice[] = [];
    private previousTime = -1;

    constructor(
        api: alphaTab.AlphaTabApi,
        private options: TransportBarOptions = {}
    ) {
        this.root = parseHtml(html`
            <div class="at-transport">
                <div class="at-transport-left">
                    <div class="cmp-stop"></div>
                    <div class="cmp-play-pause"></div>
                    <div class="cmp-speed"></div>
                    <div class="at-loading-slot hidden">
                        <div class="cmp-loading"></div>
                    </div>
                    <div class="at-song-details">
                        <span class="at-song-title"></span> -
                        <span class="at-song-artist"></span>
                    </div>
                    <div class="at-time-position">00:00 / 00:00</div>
                </div>
                <div class="at-transport-right">
                    <div class="cmp-output-device at-transport-essential"></div>
                    <div class="cmp-count-in"></div>
                    <div class="cmp-metronome"></div>
                    <div class="cmp-loop"></div>
                    <div class="at-transport-separator"></div>
                    <div class="cmp-print"></div>
                    <div class="cmp-download-gp"></div>
                    <div class="cmp-download-audio"></div>
                    <div class="at-transport-separator"></div>
                    <div class="cmp-zoom"></div>
                    <div class="cmp-layout"></div>
                    <div class="cmp-scroll"></div>
                </div>
            </div>
        `);
        this.titleEl = this.root.querySelector('.at-song-title')!;
        this.artistEl = this.root.querySelector('.at-song-artist')!;
        this.timePositionEl = this.root.querySelector('.at-time-position')!;
        this.loadingSlot = this.root.querySelector('.at-loading-slot')!;

        // --- left group ---
        this.stop = mount(
            this.root,
            '.cmp-stop',
            new IconButton({ icon: Icons.Stop, tooltip: 'Stop' })
        );
        this.stop.setEnabled(false);
        this.stop.onClick = () => api.stop();

        this.playPause = mount(
            this.root,
            '.cmp-play-pause',
            new IconButton({ icon: Icons.Play, tooltip: 'Play/Pause' })
        );
        this.playPause.setEnabled(false);
        this.playPause.onClick = () => api.playPause();

        const speed = mount(
            this.root,
            '.cmp-speed',
            new Dropdown<number>({
                icon: Icons.Search,
                label: '1x',
                tooltip: 'Playback speed',
                items: SPEED_ITEMS,
                initialValue: 1
            })
        );
        speed.onSelect = (value, item) => {
            api.playbackSpeed = value;
            speed.setLabel(item.label);
        };

        this.loadingProgress = mount(this.loadingSlot, '.cmp-loading', new LoadingProgress());

        // --- right group ---
        this.outputDevice = mount(
            this.root,
            '.cmp-output-device',
            new Dropdown<string>({
                icon: Icons.OutputDevice,
                tooltip: 'Output device',
                items: [{ value: '', label: 'Default' }],
                onOpen: async () => {
                    const devices = await api.enumerateOutputDevices();
                    this.outputDevices = devices;
                    return [
                        { value: '', label: 'Default' },
                        ...devices.map(d => ({ value: d.deviceId, label: d.label + (d.isDefault ? ' (default)' : '') }))
                    ];
                }
            })
        );
        this.outputDevice.onSelect = async value => {
            if (!value) {
                await api.setOutputDevice(null);
                return;
            }
            const device = this.outputDevices.find(d => d.deviceId === value);
            if (device) {
                await api.setOutputDevice(device);
            }
        };

        this.countIn = mount(
            this.root,
            '.cmp-count-in',
            new ToggleButton({ icon: Icons.CountIn, tooltip: 'Count-In' })
        );
        this.countIn.setEnabled(false);
        this.countIn.onChange = on => {
            api.countInVolume = on ? 1 : 0;
        };

        this.metronome = mount(
            this.root,
            '.cmp-metronome',
            new ToggleButton({ icon: Icons.Metronome, tooltip: 'Metronome' })
        );
        this.metronome.setEnabled(false);
        this.metronome.onChange = on => {
            api.metronomeVolume = on ? 1 : 0;
        };

        this.loop = mount(
            this.root,
            '.cmp-loop',
            new ToggleButton({ icon: Icons.Loop, tooltip: 'Loop' })
        );
        this.loop.setEnabled(false);
        this.loop.onChange = on => {
            api.isLooping = on;
        };

        const print = mount(
            this.root,
            '.cmp-print',
            new IconButton({ icon: Icons.Print, tooltip: 'Print' })
        );
        print.onClick = () => api.print();

        const downloadGp = mount(
            this.root,
            '.cmp-download-gp',
            new IconButton({ icon: Icons.DownloadGp, tooltip: 'Download GP' })
        );
        downloadGp.onClick = () => exportGp7(api);

        const downloadAudio = mount(
            this.root,
            '.cmp-download-audio',
            new IconButton({ icon: Icons.DownloadAudio, tooltip: 'Download Audio Data' })
        );
        downloadAudio.onClick = async () => {
            await exportAudio(api, this.options.trackList?.getItems() ?? []);
        };

        const zoom = mount(
            this.root,
            '.cmp-zoom',
            new Dropdown<number>({
                icon: Icons.Search,
                label: '100%',
                tooltip: 'Zoom',
                items: ZOOM_ITEMS,
                initialValue: 1
            })
        );
        zoom.onSelect = (value, item) => {
            api.settings.display.scale = value;
            zoom.setLabel(item.label);
            api.updateSettings();
            api.render();
        };

        const layout = mount(
            this.root,
            '.cmp-layout',
            new Dropdown<alphaTab.LayoutMode>({
                label: 'Layout',
                tooltip: 'Layout mode',
                items: LAYOUT_ITEMS,
                initialValue: api.settings.display.layoutMode
            })
        );
        layout.onSelect = value => {
            api.settings.display.layoutMode = value;
            api.updateSettings();
            api.render();
        };

        const scroll = mount(
            this.root,
            '.cmp-scroll',
            new Dropdown<alphaTab.ScrollMode>({
                label: 'Scroll',
                tooltip: 'Scroll mode',
                items: SCROLL_ITEMS,
                initialValue: api.settings.player.scrollMode
            })
        );
        scroll.onSelect = value => {
            api.settings.player.scrollMode = value;
            switch (value) {
                case alphaTab.ScrollMode.Continuous:
                case alphaTab.ScrollMode.OffScreen:
                    api.settings.player.scrollOffsetX = -10;
                    api.settings.player.scrollOffsetY = -10;
                    break;
                case alphaTab.ScrollMode.Smooth:
                    api.settings.player.scrollOffsetX = -50;
                    api.settings.player.scrollOffsetY = -100;
                    break;
            }
            api.updateSettings();
            api.render();
        };

        // --- subscriptions ---
        this.subscriptions.push(
            api.scoreLoaded.on(score => {
                this.titleEl.textContent = score.title;
                this.artistEl.textContent = score.artist;
            })
        );
        this.subscriptions.push(
            api.playerStateChanged.on(args => {
                this.playPause.setIcon(
                    args.state === alphaTab.synth.PlayerState.Playing ? Icons.Pause : Icons.Play
                );
            })
        );
        this.subscriptions.push(
            api.playerPositionChanged.on(args => {
                const sec = (args.currentTime / 1000) | 0;
                if (sec === this.previousTime) {
                    return;
                }
                this.previousTime = sec;
                this.timePositionEl.textContent = `${formatDuration(args.currentTime)} / ${formatDuration(args.endTime)}`;
            })
        );
        this.subscriptions.push(
            api.soundFontLoad.on(args => {
                this.loadingSlot.classList.remove('hidden');
                this.loadingProgress.setValue(args.loaded / Math.max(1, args.total));
            })
        );
        this.subscriptions.push(
            api.soundFontLoaded.on(() => {
                this.loadingSlot.classList.add('hidden');
            })
        );
        this.subscriptions.push(
            api.playerReady.on(() => {
                this.playPause.setEnabled(true);
                this.stop.setEnabled(true);
                this.metronome.setEnabled(true);
                this.countIn.setEnabled(true);
                this.loop.setEnabled(true);
            })
        );
    }

    dispose(): void {
        for (const u of this.subscriptions) {
            u();
        }
        this.subscriptions = [];
        this.root.remove();
    }
}

function formatDuration(milliseconds: number): string {
    let seconds = milliseconds / 1000;
    const minutes = (seconds / 60) | 0;
    seconds = (seconds - minutes * 60) | 0;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
