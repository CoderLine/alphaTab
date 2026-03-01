import { setupControl } from './control';
import * as alphaTab from '@coderline/alphatab';

const req = new XMLHttpRequest();
req.onload = () => {
    document.getElementById('placeholder')!.outerHTML = req.responseText;

    // this is a demo which builds a "recorder" with alphaTab.
    // in this case we do not actually play the song but just use the rendering and player capabilities
    // to get a display of the notes and a cursor.

    // the overall recorder goes with various assumptions:
    // 1. we only have one track/staff/voice being recorded
    //    -> would need more complex update of the data model.
    // 2. we do not have any tempo, time signature or similar changes as we simply record lineary
    //    -> would need more complex handling of updating the lookups.
    // 3. we do not have any re-recording flows (stop, seek and restart recording)
    //    -> would need further extensions.

    // we want bars dynamically being added as we record, to achieve this we use following tricks for rendering:

    // 1. we start with one full system
    //    -> this ensures the player/cursor doesn't think we have an end, but we still continue.
    // 2. we add a new system when we reach a 80% of the second-last bar.
    //    -> this gives us always one empty future bar ensuring correct rendering and cursor behavior.

    // to get the cursor behaving as we want we do following:

    // 1. we generate an empty midi at start. this gives us a base Midi and MidiTickLookup to start with.
    // 2. we extend this midi to the expected maximum recording length (multiple minutes of playback).
    //    this way the player will internally play quasi endlessly and allows us to extend the song.
    // 3. When we extend we need to update the MidiTickLookup with the new bars to have correct cursor alignment.

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

    // start with 2 bars to always have 1 future bar buffer
    const score = alphaTab.importer.ScoreLoader.loadAlphaTex('');
    score.tracks[0].defaultSystemsLayout = 5;

    // threshold indicating we need to insert a new bar, -1 as marker to not do anything
    let insertTickThreshold = -1;

    function insertNewMasterBar() {
        const newMasterBar = new alphaTab.model.MasterBar();
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

    function insertNewBar(masterBar: alphaTab.model.MasterBar) {
        const staff = score.tracks[0].staves[0];
        const previousBar = staff.bars[staff.bars.length - 1];
        const newBar = new alphaTab.model.Bar();
        newBar.clef = previousBar.clef;
        newBar.clefOttava = previousBar.clefOttava;
        newBar.keySignature = previousBar.keySignature;
        newBar.keySignatureType = previousBar.keySignatureType;

        staff.addBar(newBar);

        const initialVoice = new alphaTab.model.Voice();
        newBar.addVoice(initialVoice);

        const emptyBeat = new alphaTab.model.Beat();
        emptyBeat.isEmpty = true;
        emptyBeat.duration = alphaTab.model.Duration.Whole;
        initialVoice.addBeat(emptyBeat);

        api.tickCache?.addBeat(emptyBeat, 0, masterBar.calculateDuration());

        return newBar;
    }

    function insertNewSystem() {
        // clear threshold after we create bar, will be set again after render
        insertTickThreshold = -1;

        const currentSystemCount = Math.floor(score.masterBars.length / score.tracks[0].defaultSystemsLayout);
        const neededSystemCount = currentSystemCount + 1;
        const neededBars = neededSystemCount * score.tracks[0].defaultSystemsLayout;
        const lastMasterBarIndex = score.masterBars.length - 1;

        let missingBars = neededBars - score.masterBars.length;

        while (missingBars > 0) {
            const newMasterBar = insertNewMasterBar();
            const newBar = insertNewBar(newMasterBar);

            const sharedDataBag = new Map<string, unknown>();
            newMasterBar.finish(sharedDataBag);
            newBar.finish(api.settings, sharedDataBag);

            missingBars--;
        }

        //
        // update remaining bits and render

        updateInsertTickThreshold();

        // TODO: hints on edited score
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

    // add second bar and setup
    insertNewSystem();

    // extend the midi to be very long
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
        const midiQuarterTime = 960;
        const desiredLengthInMilliseconds = 60 * 30 * 1000;
        const tempo = api.tickCache!.masterBars[0].tempoChanges[0].tempo;
        const desiredLengthInTicks = (desiredLengthInMilliseconds / (60000.0 / (tempo * midiQuarterTime))) | 0;

        const endOfTrack = midi.tracks[0].events.pop()! as alphaTab.midi.EndOfTrackEvent;

        // add rest events every quarter note
        let tick = rest.tick + midiQuarterTime;
        while (tick < desiredLengthInTicks) {
            midi.tracks[0].events.push(new alphaTab.midi.AlphaTabRestEvent(rest.track, tick, rest.channel));
            tick += midiQuarterTime;
        }

        // shift end message
        endOfTrack.tick = tick;
    });

    api.playerPositionChanged.on(e => {
        if (insertTickThreshold !== -1 && e.currentTick >= insertTickThreshold) {
            insertNewSystem();
        }
    });

    (window as any).at = api;
};
req.open('GET', 'control-template.html');
req.send();
