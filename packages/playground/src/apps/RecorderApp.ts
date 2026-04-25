import * as alphaTab from '@coderline/alphatab';
import { Footer } from '../components/Footer';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { NavMenu } from '../components/NavMenu';
import { Sidebar } from '../components/Sidebar';
import { DrumPadPanel } from '../components/recorder/DrumPadPanel';
import { type RhythmConfig, RHYTHM_4_4_STRAIGHT } from '../components/recorder/RhythmConfig';
import { RhythmGridOverlay } from '../components/recorder/RhythmGridOverlay';
import { type Mountable, css, html, injectStyles, mount, parseHtml } from '../util/Dom';
import { Paths } from '../util/Paths';

injectStyles(
    'RecorderApp',
    css`
    .at-wrap.at-wrap-recorder {
        position: relative;
        width: 90vw;
        height: 90vh;
        margin: 0 auto;
        border: 1px solid rgba(0, 0, 0, 0.12);
        background: #fff;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .at-wrap-recorder > .at-content {
        flex: 1 1 auto;
        overflow: hidden;
        position: relative;
    }
    .at-wrap-recorder .at-viewport {
        overflow-y: auto;
        position: absolute;
        top: 0;
        left: 70px;
        right: 0;
        bottom: 0;
        padding-right: 20px;
    }
    .at-wrap-recorder .at-canvas {
        position: relative;
    }
    @media screen and (max-width: 1100px) {
        .at-wrap-recorder .at-viewport { left: 0; }
    }
`
);

const MIDI_QUARTER_TIME = 960;

export interface RecorderAppOptions {
    rhythm?: RhythmConfig;
    fontDirectory?: string;
    soundFont?: string;
}

export class RecorderApp implements Mountable {
    readonly api: alphaTab.AlphaTabApi;
    readonly root: HTMLElement;

    private rhythm: RhythmConfig;
    private slotDuration: alphaTab.model.Duration;
    private slotTicks: number;
    private score: alphaTab.model.Score;
    private track: alphaTab.model.Track;
    private staff: alphaTab.model.Staff;
    private currentBeat: alphaTab.model.Beat | undefined;
    private insertTickThreshold = -1;
    private wasPlaying = false;

    private overlay: LoadingOverlay;
    private sidebar: Sidebar;
    private footer: Footer;
    private gridOverlay: RhythmGridOverlay;
    private padPanel: DrumPadPanel;
    private nav: NavMenu;

    private subscriptions: (() => void)[] = [];

    constructor(options: RecorderAppOptions = {}) {
        this.rhythm = options.rhythm ?? RHYTHM_4_4_STRAIGHT;
        this.slotDuration = pickSlotDuration(this.rhythm.subdivisionsPerBeat);
        this.slotTicks = MIDI_QUARTER_TIME / this.rhythm.subdivisionsPerBeat;

        this.root = parseHtml(html`
            <div class="at-wrap at-wrap-recorder">
                <div class="cmp-overlay"></div>
                <div class="at-content">
                    <div class="cmp-sidebar"></div>
                    <div class="at-viewport">
                        <div class="at-canvas"></div>
                    </div>
                </div>
                <div class="cmp-footer"></div>
            </div>
        `);

        const viewport = this.root.querySelector<HTMLElement>('.at-viewport')!;
        const canvas = this.root.querySelector<HTMLElement>('.at-canvas')!;

        const settings = new alphaTab.Settings();
        settings.fillFromJson({
            core: {
                fontDirectory: options.fontDirectory ?? Paths.fontDirectory
            },
            player: {
                playerMode: alphaTab.PlayerMode.EnabledAutomatic,
                soundFont: options.soundFont ?? Paths.soundFont,
                scrollOffsetX: -10,
                scrollOffsetY: -20,
                scrollElement: viewport
            },
            display: {
                layoutMode: alphaTab.LayoutMode.Parchment,
                justifyLastSystem: true
            }
        } satisfies alphaTab.json.SettingsJson);

        this.api = new alphaTab.AlphaTabApi(canvas, settings);
        this.subscriptions.push(this.api.error.on(e => console.error('alphaTab error', e)));

        // build the empty percussion score
        this.score = new alphaTab.model.Score();
        this.track = new alphaTab.model.Track();
        this.track.name = 'Drums';
        this.track.shortName = 'Drums';
        this.track.ensureStaveCount(1);
        this.track.playbackInfo.primaryChannel = 9;
        this.track.playbackInfo.secondaryChannel = 9;
        this.staff = this.track.staves[0];
        this.staff.isPercussion = true;
        this.staff.showTablature = false;
        this.staff.showStandardNotation = true;
        this.score.addTrack(this.track);
        this.score.defaultSystemsLayout = 5;
        this.track.defaultSystemsLayout = 5;

        // mount overlay/sidebar/footer
        this.overlay = mount(this.root, '.cmp-overlay', new LoadingOverlay(this.api));
        this.sidebar = mount(this.root, '.cmp-sidebar', new Sidebar(this.api));
        this.footer = mount(
            this.root,
            '.cmp-footer',
            new Footer(this.api, { trackList: this.sidebar.trackList })
        );

        // grid overlay sits inside .at-canvas — alphaTab adds its rendering as siblings/children.
        this.gridOverlay = new RhythmGridOverlay(this.api, this.rhythm);
        canvas.appendChild(this.gridOverlay.root);

        // drum pad panel: floating on body
        this.padPanel = new DrumPadPanel();
        this.padPanel.onHit = note => this.addDrumHit(note);
        document.body.appendChild(this.padPanel.root);

        this.nav = new NavMenu();
        document.body.appendChild(this.nav.root);

        // wire api events
        this.subscriptions.push(this.api.scoreLoaded.on(() => this.updateInsertTickThreshold()));
        this.subscriptions.push(
            this.api.midiLoad.on(midi => {
                this.extendMidi(midi);
            })
        );
        this.subscriptions.push(
            this.api.playerPositionChanged.on(e => {
                if (this.insertTickThreshold !== -1 && e.currentTick >= this.insertTickThreshold) {
                    this.insertNewSystem();
                }
            })
        );
        this.subscriptions.push(
            this.api.playedBeatChanged.on(beat => {
                this.currentBeat = beat;
            })
        );
        this.subscriptions.push(
            this.api.playerStateChanged.on(e => {
                const isPlaying = e.state === alphaTab.synth.PlayerState.Playing;
                if (this.wasPlaying && !isPlaying) {
                    // Regenerate midi so just-recorded drums become audible on replay.
                    this.api.loadMidiForScore();
                }
                this.wasPlaying = isPlaying;
                this.padPanel.setRecording(isPlaying);
            })
        );

        // seed initial system
        this.insertNewSystem();

        if (typeof window !== 'undefined') {
            window.api = this.api;
            window.alphaTab = alphaTab;
        }
    }

    private addDrumHit(midiNote: number): void {
        if (this.api.playerState !== alphaTab.synth.PlayerState.Playing || !this.currentBeat) {
            return;
        }
        const note = new alphaTab.model.Note();
        note.percussionArticulation = midiNote;
        this.currentBeat.addNote(note);
        this.currentBeat.isEmpty = false;

        const bar = this.currentBeat.voice.bar;
        bar.finish(this.api.settings, null);

        this.api.renderScore(this.score, undefined, {
            reuseViewport: true,
            firstChangedMasterBar: bar.index
        });

        this.padPanel.flash(midiNote);
    }

    private createEmptyBeatsForBar(): alphaTab.model.Beat[] {
        const beats: alphaTab.model.Beat[] = [];
        for (let i = 0; i < this.rhythm.beatMask.length; i++) {
            const beat = new alphaTab.model.Beat();
            beat.duration = this.slotDuration;
            beat.isEmpty = true;
            beats.push(beat);
        }
        return beats;
    }

    private insertNewMasterBar(): alphaTab.model.MasterBar {
        const masterBar = new alphaTab.model.MasterBar();
        masterBar.timeSignatureNumerator = this.rhythm.timeSignatureNumerator;
        masterBar.timeSignatureDenominator = this.rhythm.timeSignatureDenominator;
        this.score.addMasterBar(masterBar);

        const lookup = new alphaTab.midi.MasterBarTickLookup();
        lookup.tempoChanges.push(new alphaTab.midi.MasterBarTickLookupTempoChange(masterBar.start, this.score.tempo));
        lookup.start = masterBar.start;
        lookup.end = masterBar.start + masterBar.calculateDuration();
        lookup.masterBar = masterBar;
        this.api.tickCache?.addMasterBar(lookup);
        return masterBar;
    }

    private insertNewBar(): alphaTab.model.Bar {
        const previousBar = this.staff.bars.length > 0 ? this.staff.bars[this.staff.bars.length - 1] : null;
        const bar = new alphaTab.model.Bar();
        if (previousBar) {
            bar.clef = previousBar.clef;
            bar.clefOttava = previousBar.clefOttava;
            bar.keySignature = previousBar.keySignature;
            bar.keySignatureType = previousBar.keySignatureType;
        }
        this.staff.addBar(bar);
        const voice = new alphaTab.model.Voice();
        bar.addVoice(voice);

        const beats = this.createEmptyBeatsForBar();
        for (let i = 0; i < beats.length; i++) {
            voice.addBeat(beats[i]);
            this.api.tickCache?.addBeat(beats[i], i * this.slotTicks, this.slotTicks);
        }
        return bar;
    }

    private insertNewSystem(): void {
        this.insertTickThreshold = -1;
        const currentSystemCount = Math.floor(this.score.masterBars.length / this.score.defaultSystemsLayout);
        const neededSystemCount = currentSystemCount + 1;
        const neededBars = neededSystemCount * this.score.defaultSystemsLayout;
        const lastMasterBarIndex = this.score.masterBars.length - 1;

        let missing = neededBars - this.score.masterBars.length;
        while (missing > 0) {
            const masterBar = this.insertNewMasterBar();
            const bar = this.insertNewBar();
            const dataBag = new Map<string, unknown>();
            masterBar.finish(dataBag);
            bar.finish(this.api.settings, dataBag);
            missing--;
        }

        this.updateInsertTickThreshold();
        this.api.renderScore(this.score, undefined, {
            reuseViewport: currentSystemCount > 0,
            firstChangedMasterBar: currentSystemCount > 0 ? lastMasterBarIndex : undefined
        });
    }

    private updateInsertTickThreshold(): void {
        if (this.score.masterBars.length < 2) {
            this.insertTickThreshold = -1;
            return;
        }
        const lastBar = this.score.masterBars[this.score.masterBars.length - 2];
        const thresholdPercent = 0.8;
        this.insertTickThreshold = lastBar.start + lastBar.calculateDuration() * thresholdPercent;
    }

    private extendMidi(midi: alphaTab.midi.MidiFile): void {
        let rest: alphaTab.midi.AlphaTabRestEvent | undefined;
        const events = midi.tracks[0].events;
        for (let i = events.length - 1; i >= 0; i--) {
            const e = events[i];
            if (e instanceof alphaTab.midi.AlphaTabRestEvent) {
                rest = e;
                break;
            }
        }
        if (!rest) {
            return;
        }
        const desiredMs = 60 * 30 * 1000; // 30 min
        const tempo = this.api.tickCache!.masterBars[0].tempoChanges[0].tempo;
        const desiredTicks = (desiredMs / (60000.0 / (tempo * MIDI_QUARTER_TIME))) | 0;
        const endOfTrack = events.pop()! as alphaTab.midi.EndOfTrackEvent;
        let tick = rest.tick + MIDI_QUARTER_TIME;
        while (tick < desiredTicks) {
            events.push(new alphaTab.midi.AlphaTabRestEvent(rest.track, tick, rest.channel));
            tick += MIDI_QUARTER_TIME;
        }
        endOfTrack.tick = tick;
    }

    dispose(): void {
        for (const u of this.subscriptions) {
            u();
        }
        this.subscriptions = [];
        this.nav.dispose();
        this.padPanel.dispose();
        this.gridOverlay.dispose();
        this.footer.dispose();
        this.sidebar.dispose();
        this.overlay.dispose();
        this.api.destroy();
        this.root.remove();
    }
}

function pickSlotDuration(subdivisionsPerBeat: number): alphaTab.model.Duration {
    switch (subdivisionsPerBeat) {
        case 2:
            return alphaTab.model.Duration.Eighth;
        case 4:
            return alphaTab.model.Duration.Sixteenth;
        case 8:
            return alphaTab.model.Duration.ThirtySecond;
        case 16:
            return alphaTab.model.Duration.SixtyFourth;
        default:
            throw new Error(`unsupported subdivisionsPerBeat: ${subdivisionsPerBeat}`);
    }
}
