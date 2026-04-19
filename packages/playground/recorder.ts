import { setupControl } from './control';
import * as alphaTab from '@coderline/alphatab';

const req = new XMLHttpRequest();
req.onload = () => {
    document.getElementById('placeholder')!.outerHTML = req.responseText;

    // this is a drum-recording demo built with alphaTab.
    // we do not actually play a song - we use the rendering + player + cursor capabilities to
    // let the user "record" drum hits onto a percussion staff. for the sake of simplicity we do
    // not have a real MIDI input but simulate it:
    //  1. the score is seeded with bars of empty beats laid out on a rhythm-configuration grid.
    //  2. pressing a keyboard key (or an on-screen pad) adds a percussion note to the beat under
    //     the cursor. the overlay grid shows the subdivisions so the user can see where hits land.

    // the overall recorder goes with various assumptions:
    //  1. we only have one track/staff being recorded
    //     -> would need more complex update of the data model.
    //  2. we have a single voice with multi-note beats (no stems-up/stems-down split for
    //     drums vs cymbals) -> out of scope for this POC.
    //  3. we do not have any tempo, time signature or similar changes as we simply record lineary
    //     -> would need more complex handling of updating the lookups.
    //  4. we do not have any re-recording flows (stop, seek and restart recording)
    //     -> would need further extensions.
    //  5. every bar uses the same rhythm configuration (pre-filled grid of empty beats); no
    //     dynamic beat creation or splitting at runtime - too fragile.

    // we want bars dynamically being added as we record, to achieve this we use following tricks for rendering:

    //  1. we start with one full system of pre-filled empty bars
    //     -> this ensures the player/cursor doesn't think we have an end, but we still continue.
    //  2. we add a new system when we reach 80% of the second-last bar.
    //     -> this gives us always one empty future bar ensuring correct rendering and cursor behavior.
    //  3. the seed beats are marked isEmpty = true so they render as nothing (not as rests).
    //     with 32 subdivisions per bar a dense row of rest glyphs would be visual noise - the
    //     overlay grid is the visual rhythm indicator instead.

    // to get the cursor behaving as we want we do following:

    //  1. we generate an empty midi at start. this gives us a base Midi and MidiTickLookup to start with.
    //  2. we extend this midi to the expected maximum recording length (multiple minutes of playback).
    //     this way the player will internally play quasi endlessly and allows us to extend the song.
    //  3. when we extend the score we need to update the MidiTickLookup with the new bars to have
    //     correct cursor alignment.

    // input handling:

    //  1. the pad is active only while the player is actually playing (playerState === Playing).
    //     a state indicator on the panel surfaces this; pads are visually dimmed and click-disabled
    //     otherwise.
    //  2. we rely on api.playedBeatChanged to know which beat to attach a note to. alphaTab already
    //     tracks the "beat under the cursor", which gives us quantization for free - no parallel
    //     tick polling loop.
    //  3. on hit we flip the target beat's isEmpty to false and partially re-render only the
    //     affected bar via renderScore's firstChangedMasterBar hint.

    // --- rhythm configuration -----------------------------------------------
    // beatMask values are the "display weight" of each slot: 4 = quarter boundary, 8 = eighth,
    // 16 = sixteenth, 32 = thirty-second. only slots with weight <= displayWeightThreshold
    // get a visible grid line. every slot in the bar gets a concrete empty Beat.
    interface RhythmConfig {
        timeSignatureNumerator: number;
        timeSignatureDenominator: number;
        subdivisionsPerBeat: number; // grid slots inside one beat (quarter)
        beatMask: number[]; // length = numerator * subdivisionsPerBeat, values are display weights
        displayWeightThreshold: number; // max weight to draw in the overlay
    }

    const RHYTHM_4_4_STRAIGHT: RhythmConfig = {
        timeSignatureNumerator: 4,
        timeSignatureDenominator: 4,
        subdivisionsPerBeat: 4,
        // per quarter: [quarter, 16th, 8th, 16th] - finest grid is 16th.
        beatMask: Array.from({ length: 4 }, () => [4, 16, 8, 16]).flat(),
        displayWeightThreshold: 16
    };

    const activeRhythm = RHYTHM_4_4_STRAIGHT;
    const MIDI_QUARTER_TIME = 960;
    // every beat in the bar gets the same Duration (the finest subdivision) so playbackDuration
    // stays uniform across all grid slots. this keeps playedBeatChanged firing at every slot.
    const slotDuration = (() => {
        switch (activeRhythm.subdivisionsPerBeat) {
            case 2:
                return alphaTab.model.Duration.Eighth;
            case 4:
                return alphaTab.model.Duration.Sixteenth;
            case 8:
                return alphaTab.model.Duration.ThirtySecond;
            case 16:
                return alphaTab.model.Duration.SixtyFourth;
            default:
                throw new Error(`unsupported subdivisionsPerBeat: ${activeRhythm.subdivisionsPerBeat}`);
        }
    })();
    const slotTicks = MIDI_QUARTER_TIME / activeRhythm.subdivisionsPerBeat;

    // --- drum pad mapping ---------------------------------------------------
    // keyboard key -> { midiNote, label }. a single keypress becomes a single percussion note
    // placed on the currently-played beat. the default GP7 articulation list in alphaTab's
    // PercussionMapper uses MIDI note numbers as articulation indices, so no custom
    // track.percussionArticulations[] is needed.
    interface DrumPad {
        key: string;
        midiNote: number;
        label: string;
    }

    const DRUM_PADS: DrumPad[] = [
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
    const padByKey = new Map(DRUM_PADS.map(p => [p.key, p]));

    // --- alphaTab setup -----------------------------------------------------
    const api = setupControl('#alphaTab', {
        core: {
            file: undefined
        },
        display: {
            // parchment gives the best deterministic system creation without flickering as bars are added
            layoutMode: alphaTab.LayoutMode.Parchment,
            justifyLastSystem: true
        }
    });

    // build an empty percussion score programmatically. default tempo is 120 bpm (Score.tempo getter).
    const score = new alphaTab.model.Score();
    const track = new alphaTab.model.Track();
    track.name = 'Drums';
    track.shortName = 'Drums';
    track.ensureStaveCount(1);
    track.playbackInfo.primaryChannel = 9;
    track.playbackInfo.secondaryChannel = 9;
    const staff = track.staves[0];
    staff.isPercussion = true;
    staff.showTablature = false;
    staff.showStandardNotation = true;
    score.addTrack(track);
    score.defaultSystemsLayout = 5;
    track.defaultSystemsLayout = 5;

    // threshold indicating we need to insert a new bar, -1 as marker to not do anything
    let insertTickThreshold = -1;

    function createEmptyBeatsForBar(): alphaTab.model.Beat[] {
        const beats: alphaTab.model.Beat[] = [];
        for (let i = 0; i < activeRhythm.beatMask.length; i++) {
            const beat = new alphaTab.model.Beat();
            beat.duration = slotDuration;
            beat.isEmpty = true;
            beats.push(beat);
        }
        return beats;
    }

    function insertNewMasterBar() {
        const newMasterBar = new alphaTab.model.MasterBar();
        newMasterBar.timeSignatureNumerator = activeRhythm.timeSignatureNumerator;
        newMasterBar.timeSignatureDenominator = activeRhythm.timeSignatureDenominator;
        score.addMasterBar(newMasterBar);

        // insert new bar to tick cache for cursor placement
        const masterBarTickLookup = new alphaTab.midi.MasterBarTickLookup();
        masterBarTickLookup.tempoChanges.push(
            new alphaTab.midi.MasterBarTickLookupTempoChange(newMasterBar.start, score.tempo)
        );
        masterBarTickLookup.start = newMasterBar.start;
        masterBarTickLookup.end = newMasterBar.start + newMasterBar.calculateDuration();
        masterBarTickLookup.masterBar = newMasterBar;
        api.tickCache?.addMasterBar(masterBarTickLookup);

        return newMasterBar;
    }

    function insertNewBar() {
        const previousBar = staff.bars.length > 0 ? staff.bars[staff.bars.length - 1] : null;
        const newBar = new alphaTab.model.Bar();
        if (previousBar) {
            newBar.clef = previousBar.clef;
            newBar.clefOttava = previousBar.clefOttava;
            newBar.keySignature = previousBar.keySignature;
            newBar.keySignatureType = previousBar.keySignatureType;
        }

        staff.addBar(newBar);

        const initialVoice = new alphaTab.model.Voice();
        newBar.addVoice(initialVoice);

        const emptyBeats = createEmptyBeatsForBar();
        for (let i = 0; i < emptyBeats.length; i++) {
            initialVoice.addBeat(emptyBeats[i]);
            api.tickCache?.addBeat(emptyBeats[i], i * slotTicks, slotTicks);
        }

        return newBar;
    }

    function insertNewSystem() {
        // clear threshold after we create bar, will be set again after render
        insertTickThreshold = -1;

        const currentSystemCount = Math.floor(score.masterBars.length / score.defaultSystemsLayout);
        const neededSystemCount = currentSystemCount + 1;
        const neededBars = neededSystemCount * score.defaultSystemsLayout;
        const lastMasterBarIndex = score.masterBars.length - 1;

        let missingBars = neededBars - score.masterBars.length;

        while (missingBars > 0) {
            const newMasterBar = insertNewMasterBar();
            const newBar = insertNewBar();

            const sharedDataBag = new Map<string, unknown>();
            newMasterBar.finish(sharedDataBag);
            newBar.finish(api.settings, sharedDataBag);

            missingBars--;
        }

        //
        // update remaining bits and render

        updateInsertTickThreshold();

        api.renderScore(score, undefined, {
            reuseViewport: currentSystemCount > 0,
            firstChangedMasterBar: currentSystemCount > 0 ? lastMasterBarIndex : undefined
        });
    }

    function updateInsertTickThreshold() {
        // assumption: due to recording we do not have any repeats but a linear score
        const lastBar = score!.masterBars![score.masterBars.length - 2];
        const thresholdPercent = 0.8;
        const lastBarDuration = lastBar.calculateDuration();
        insertTickThreshold = lastBar.start + lastBarDuration * thresholdPercent;
    }

    api.scoreLoaded.on(() => {
        updateInsertTickThreshold();
    });

    // seed with 2 bars (so we always have 1 future bar buffered) and do the initial render
    insertNewSystem();

    // extend the midi to be very long so the player keeps running while the user records.
    api.midiLoad.on(midi => {
        // find last rest event as starting point to extend
        let rest: alphaTab.midi.AlphaTabRestEvent | undefined = undefined;
        for (let i = midi.tracks[0].events.length; i >= 0; i--) {
            const e = midi.tracks[0].events[i];
            if (e instanceof alphaTab.midi.AlphaTabRestEvent) {
                rest = e;
                break;
            }
        }

        // should never happen assuming we start with an empty song like in this sample
        if (!rest) {
            return;
        }

        // 30mins should be enough for everyone ;)
        const desiredLengthInMilliseconds = 60 * 30 * 1000;
        const tempo = api.tickCache!.masterBars[0].tempoChanges[0].tempo;
        const desiredLengthInTicks = (desiredLengthInMilliseconds / (60000.0 / (tempo * MIDI_QUARTER_TIME))) | 0;

        const endOfTrack = midi.tracks[0].events.pop()! as alphaTab.midi.EndOfTrackEvent;

        // add rest events every quarter note
        let tick = rest.tick + MIDI_QUARTER_TIME;
        while (tick < desiredLengthInTicks) {
            midi.tracks[0].events.push(new alphaTab.midi.AlphaTabRestEvent(rest.track, tick, rest.channel));
            tick += MIDI_QUARTER_TIME;
        }

        // shift end message
        endOfTrack.tick = tick;
    });

    api.playerPositionChanged.on(e => {
        if (insertTickThreshold !== -1 && e.currentTick >= insertTickThreshold) {
            insertNewSystem();
        }
    });

    // --- input -> notes -----------------------------------------------------
    // alphaTab already tracks the "beat under the cursor" for us; subscribing to playedBeatChanged
    // is cheaper and more consistent than running a parallel tick polling loop.
    let currentBeat: alphaTab.model.Beat | undefined = undefined;
    api.playedBeatChanged.on(beat => {
        currentBeat = beat;
    });

    function isRecording() {
        return api.playerState === alphaTab.synth.PlayerState.Playing;
    }

    function addDrumHit(midiNote: number) {
        if (!isRecording() || !currentBeat) {
            return;
        }

        const note = new alphaTab.model.Note();
        note.percussionArticulation = midiNote;
        currentBeat.addNote(note);
        // a beat with a note is no longer empty - keep the data model correct.
        currentBeat.isEmpty = false;

        const bar = currentBeat.voice.bar;
        bar.finish(api.settings, null);

        api.renderScore(score, undefined, {
            reuseViewport: true,
            firstChangedMasterBar: bar.index
        });

        flashPad(midiNote);
    }

    // button flash on hit - reused by both keyboard and on-screen clicks
    const padButtonByMidi = new Map<number, HTMLButtonElement>();
    function flashPad(midiNote: number) {
        const btn = padButtonByMidi.get(midiNote);
        if (!btn) {
            return;
        }
        btn.style.background = '#ff7043';
        btn.style.borderColor = '#ffab91';
        window.setTimeout(() => {
            btn.style.background = '';
            btn.style.borderColor = '';
        }, 120);
    }

    document.addEventListener(
        'keydown',
        e => {
            if (e.repeat) {
                return;
            }
            const pad = padByKey.get(e.key.toLowerCase());
            if (!pad) {
                return;
            }
            e.preventDefault();
            addDrumHit(pad.midiNote);
        },
        true
    );

    // --- drum pad UI + overlay ----------------------------------------------
    // the grid overlay is attached to the outer #alphaTab container (same approach as the website's
    // BoundsLookupViewer). the container is set to position:relative and the overlay stretches
    // over its full rect. BoundsLookup coordinates are relative to the container top-left since
    // the inner .at-surface sits at (0,0) there. attaching to .at-surface would clip lines via
    // its overflow:hidden style.
    const containerEl = document.getElementById('alphaTab')!;
    containerEl.style.position = containerEl.style.position || 'relative';

    const overlayEl = document.createElement('div');
    overlayEl.className = 'recorder-grid-overlay';
    Object.assign(overlayEl.style, {
        position: 'absolute',
        left: '0',
        top: '0',
        right: '0',
        bottom: '0',
        pointerEvents: 'none',
        zIndex: '6'
    } as Partial<CSSStyleDeclaration>);
    // insert before the first child so alphaTab's own DOM mutations (child replacement of
    // placeholders) don't touch our overlay.
    containerEl.insertBefore(overlayEl, containerEl.firstChild);

    function redrawOverlay() {
        overlayEl.replaceChildren();

        const lookup = api.renderer?.boundsLookup;
        if (!lookup) {
            return;
        }

        // the grid renders as short tick marks above and below each bar's bounding box rather
        // than full-height lines through the staff. this keeps the notation area itself visually
        // unobstructed and reads as a gridline "guide" rather than an overlay.
        const tickLength = 12;
        const mainColor = 'rgba(0, 120, 220, 0.55)';
        const subColor = 'rgba(0, 120, 220, 0.25)';

        for (const system of lookup.staffSystems) {
            for (const masterBarBounds of system.bars) {
                for (const barBounds of masterBarBounds.bars) {
                    const beats = barBounds.beats;
                    const barTop = barBounds.realBounds.y;
                    const barBottom = barBounds.realBounds.y + barBounds.realBounds.h;

                    for (let i = 0; i < beats.length && i < activeRhythm.beatMask.length; i++) {
                        const weight = activeRhythm.beatMask[i];
                        if (weight > activeRhythm.displayWeightThreshold) {
                            continue;
                        }
                        const beatBounds = beats[i];
                        const isMainBeat = weight === 4;
                        const width = isMainBeat ? 2 : 1;
                        const color = isMainBeat ? mainColor : subColor;
                        const x = beatBounds.realBounds.x;

                        const topTick = document.createElement('div');
                        Object.assign(topTick.style, {
                            position: 'absolute',
                            left: `${x}px`,
                            top: `${barTop - tickLength}px`,
                            width: `${width}px`,
                            height: `${tickLength}px`,
                            background: color
                        } as Partial<CSSStyleDeclaration>);
                        overlayEl.appendChild(topTick);

                        const bottomTick = document.createElement('div');
                        Object.assign(bottomTick.style, {
                            position: 'absolute',
                            left: `${x}px`,
                            top: `${barBottom}px`,
                            width: `${width}px`,
                            height: `${tickLength}px`,
                            background: color
                        } as Partial<CSSStyleDeclaration>);
                        overlayEl.appendChild(bottomTick);
                    }
                }
            }
        }
    }

    api.postRenderFinished.on(() => {
        redrawOverlay();
    });

    // build the drum pad panel
    const padPanel = document.createElement('div');
    padPanel.className = 'recorder-pad-panel';
    Object.assign(padPanel.style, {
        position: 'fixed',
        bottom: '72px',
        right: '16px',
        padding: '0 12px 12px 12px',
        background: 'rgba(33, 37, 41, 0.92)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        zIndex: '1000',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif'
    } as Partial<CSSStyleDeclaration>);

    // drag handle across the top of the panel, doubles as a recording-state indicator
    const dragHandle = document.createElement('div');
    Object.assign(dragHandle.style, {
        padding: '8px 10px',
        marginBottom: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        cursor: 'move',
        userSelect: 'none',
        fontSize: '11px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    } as Partial<CSSStyleDeclaration>);
    const stateDot = document.createElement('span');
    Object.assign(stateDot.style, {
        display: 'inline-block',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: '#6c757d'
    } as Partial<CSSStyleDeclaration>);
    const stateLabel = document.createElement('span');
    stateLabel.textContent = 'Paused - press Play to record';
    dragHandle.appendChild(stateDot);
    dragHandle.appendChild(stateLabel);
    padPanel.appendChild(dragHandle);

    const padGrid = document.createElement('div');
    Object.assign(padGrid.style, {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
        gap: '8px'
    } as Partial<CSSStyleDeclaration>);
    padPanel.appendChild(padGrid);

    function refreshPadState() {
        if (isRecording()) {
            stateDot.style.background = '#e53935';
            stateDot.style.boxShadow = '0 0 6px #e53935';
            stateLabel.textContent = 'Recording - hit pads or press keys';
            padGrid.style.opacity = '1';
            padGrid.style.pointerEvents = 'auto';
        } else {
            stateDot.style.background = '#6c757d';
            stateDot.style.boxShadow = 'none';
            stateLabel.textContent = 'Paused - press Play to record';
            padGrid.style.opacity = '0.4';
            padGrid.style.pointerEvents = 'none';
        }
    }
    // whenever playback stops/pauses we regenerate the midi from the current score so
    // previously-recorded drums become audible on replay. the existing midiLoad hook re-extends
    // the fresh midi with rest events so further recording still has playback runway beyond the
    // last bar. on pause (stopped=false) we restore api.tickPosition so the cursor stays where
    // the user paused; on full stop (stopped=true) we skip the restore so the player's natural
    // reset to the start takes effect.
    let wasPlaying = false;
    api.playerStateChanged.on(e => {
        const isPlaying = e.state === alphaTab.synth.PlayerState.Playing;
        if (wasPlaying && !isPlaying) {
            api.loadMidiForScore();
        }
        wasPlaying = isPlaying;
        refreshPadState();
    });

    let dragOffsetX = 0;
    let dragOffsetY = 0;
    dragHandle.addEventListener('pointerdown', e => {
        const rect = padPanel.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        // switch from bottom/right anchoring to left/top so dragging works in both axes
        padPanel.style.left = `${rect.left}px`;
        padPanel.style.top = `${rect.top}px`;
        padPanel.style.right = 'auto';
        padPanel.style.bottom = 'auto';
        dragHandle.setPointerCapture(e.pointerId);
    });
    dragHandle.addEventListener('pointermove', e => {
        if (!dragHandle.hasPointerCapture(e.pointerId)) {
            return;
        }
        padPanel.style.left = `${e.clientX - dragOffsetX}px`;
        padPanel.style.top = `${e.clientY - dragOffsetY}px`;
    });
    dragHandle.addEventListener('pointerup', e => {
        dragHandle.releasePointerCapture(e.pointerId);
    });

    for (const pad of DRUM_PADS) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = `${pad.label}\n[${pad.key.toUpperCase()}]`;
        Object.assign(btn.style, {
            padding: '8px 10px',
            minWidth: '68px',
            background: '#4a5056',
            color: '#fff',
            border: '1px solid #6c757d',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            lineHeight: '1.2',
            whiteSpace: 'pre'
        } as Partial<CSSStyleDeclaration>);
        btn.addEventListener('click', () => addDrumHit(pad.midiNote));
        padGrid.appendChild(btn);
        padButtonByMidi.set(pad.midiNote, btn);
    }
    document.body.appendChild(padPanel);
    refreshPadState();

    (window as any).at = api;
};
req.open('GET', 'control-template.html');
req.send();
