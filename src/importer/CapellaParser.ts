import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { AccentuationType } from '@src/model/AccentuationType';
import { Automation, AutomationType } from '@src/model/Automation';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { Chord } from '@src/model/Chord';
import { Clef } from '@src/model/Clef';
import { CrescendoType } from '@src/model/CrescendoType';
import { Duration } from '@src/model/Duration';
import { MasterBar } from '@src/model/MasterBar';
import { Note } from '@src/model/Note';
import { Score } from '@src/model/Score';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { VibratoType } from '@src/model/VibratoType';
import { Voice } from '@src/model/Voice';
import { Settings } from '@src/Settings';
import { XmlDocument } from '@src/xml/XmlDocument';

import { XmlNode, XmlNodeType } from '@src/xml/XmlNode';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { TextAlign } from '@src/platform/ICanvas';
import { ModelUtils } from '@src/model/ModelUtils';
import { Logger } from '@src/alphatab';
import { Fermata, FermataType } from '@src/model/Fermata';
import { DynamicValue } from '@src/model/DynamicValue';

class DrawObject {
    public noteRange: number = 1;
}

enum FrameType {
    None,
    Rectangle,
    Ellipse,
    Circle
}

class TextDrawObject extends DrawObject {
    public align: TextAlign = TextAlign.Left;
    public frame: FrameType = FrameType.None;
    public text: string = '';
    public fontFace: string = '';
}

class GuitarDrawObject extends DrawObject {
    public chord: Chord = new Chord();
}

class SlurDrawObject extends DrawObject { }

class WavyLineDrawObject extends DrawObject { }

class TupletBracketDrawObject extends DrawObject {
    public number: number = 0;
}

class WedgeDrawObject extends DrawObject {
    public decrescendo: boolean = false;
}

class VoltaDrawObject extends DrawObject {
    public allNumbers: boolean = false;
    public firstNumber: number = 0;
    public lastNumber: number = 0;
}

class OctaveClefDrawObject extends DrawObject {
    public octave: number = 1;
}

class TrillDrawObject extends DrawObject { }

class StaffLayout {
    public defaultClef: Clef = Clef.G2;
    public description: string = '';

    public percussion: boolean = false;
    public instrument: number = 0;
    public transpose: number = 0;
    public index: number = 0;
}

class Bracket {
    public from: number = 0;
    public to: number = 0;
    public curly: boolean = false;
}

class CapellaVoiceState {
    public currentBarIndex: number = -1;
    public currentBarComplete: boolean = true;
    public currentBarDuration: number = 0;
    public currentPosition: number = 0;
    public voiceStemDir: BeamDirection | null = null;
}

export class CapellaParser {
    public score!: Score;
    private _trackChannel: number = 0;
    private _forceFlags: boolean = false;
    private _galleryObjects!: Map<string, DrawObject>;

    private _voiceCounts!: Map<number /*track*/, number /*count*/>;

    public parseXml(xml: string, settings: Settings): void {
        this._galleryObjects = new Map<string, DrawObject>();
        this._tieStarts = [];
        this._tieStartIds = new Map<number, boolean>();
        this._voiceCounts = new Map();
        this._slurs = new Map<Beat, number>();
        this._crescendo = new Map<Beat, WedgeDrawObject>();

        let dom: XmlDocument;
        try {
            dom = new XmlDocument(xml);
        } catch (e) {
            throw new UnsupportedFormatError('Could not parse XML', e);
        }

        this.parseDom(dom);

        this.consolidate();

        this.score.finish(settings);
    }

    private consolidate() {
        // voice counts and contents might be inconsistent
        // we need to ensure we have an equal amount of voices across all bars
        // and voices must contain an empty beat at minimum
        let tempo = this.score.tempo;
        for (const track of this.score.tracks) {
            const trackVoiceCount = this._voiceCounts.get(track.index)!;
            for (const staff of track.staves) {
                while (staff.bars.length < this.score.masterBars.length) {
                    this.addNewBar(staff);
                }

                for (const bar of staff.bars) {
                    while (bar.voices.length < trackVoiceCount) {
                        bar.addVoice(new Voice());
                    }

                    for (const voice of bar.voices) {
                        if (voice.beats.length === 0) {
                            const emptyBeat = new Beat();
                            emptyBeat.isEmpty = true;
                            voice.addBeat(emptyBeat);
                        }
                    }

                    const mb = bar.masterBar;
                    if (mb.tempoAutomation) {
                        if (mb.tempoAutomation.value !== tempo) {
                            tempo = mb.tempoAutomation.value;
                        } else {
                            mb.tempoAutomation = null;
                        }
                    }
                }
            }
        }

        // TODO: unify this 
        this._slurs.forEach((noteRange, startBeat) => {
            let endBeat = startBeat;
            for (let i = 0; i < noteRange; i++) {
                endBeat.isLegatoOrigin = true;

                // advance to next
                if (endBeat.index + 1 < endBeat.voice.beats.length) {
                    endBeat = endBeat.voice.beats[endBeat.index + 1];
                } else if (endBeat.voice.bar.index + 1 < endBeat.voice.bar.staff.bars.length) {
                    const nextBar = endBeat.voice.bar.staff.bars[endBeat.voice.bar.index + 1];
                    endBeat = nextBar.voices[endBeat.voice.index].beats[0];
                } else {
                    break;
                }
            }
        });

        this._crescendo.forEach((cre, startBeat) => {
            const noteRange = cre.noteRange;
            let endBeat = startBeat;
            for (let i = 0; i < noteRange; i++) {
                endBeat.crescendo = cre.decrescendo ? CrescendoType.Decrescendo : CrescendoType.Crescendo;
                // advance to next
                if (endBeat.index + 1 < endBeat.voice.beats.length) {
                    endBeat = endBeat.voice.beats[endBeat.index + 1];
                } else if (endBeat.voice.bar.index + 1 < endBeat.voice.bar.staff.bars.length) {
                    const nextBar = endBeat.voice.bar.staff.bars[endBeat.voice.bar.index + 1];
                    endBeat = nextBar.voices[endBeat.voice.index].beats[0];
                } else {
                    break;
                }
            }
        });
    }

    private parseDom(dom: XmlDocument): void {
        let root: XmlNode | null = dom.documentElement;
        if (!root) {
            return;
        }
        if (root.localName === 'score') {
            this.score = new Score();
            this.score.tempo = 120;
            // parse all children
            for (let n of root.childNodes) {
                if (n.nodeType === XmlNodeType.Element) {
                    switch (n.localName) {
                        case 'info':
                            this.parseInfo(n);
                            break;
                        case 'layout':
                            this.parseLayout(n);
                            break;
                        case 'gallery':
                            this.parseGallery(n);
                            break;
                        case 'pageObjects':
                            this.parsePageObjects(n);
                            break;
                        // barCount ignored
                        case 'systems':
                            this.parseSystems(n);
                            break;
                    }
                }
            }
        } else {
            throw new UnsupportedFormatError('Root node of XML was not GPIF');
        }
    }

    private _staffLookup: Map<number, Staff> = new Map();
    private parseLayout(element: XmlNode) {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'staves':
                        this.parseLayoutStaves(c);
                        break;
                    case 'brackets':
                        this.parseBrackets(c);
                        break;
                }
            }
        }

        // after the layout is parsed we can build up the
        // track > staff structure for later use

        // curly brackets define which staves go together into a track
        const curlyBrackets = this._brackets.filter(b => b.curly);
        curlyBrackets.sort((a, b) => a.from - b.from);

        let currentBracketIndex = 0;
        let currentTrack: Track | null = null;

        for (let i = 0; i < this._staffLayouts.length; i++) {
            const staffLayout = this._staffLayouts[i];
            // advance to next bracket according to the staff index
            while (currentBracketIndex < curlyBrackets.length && i > curlyBrackets[currentBracketIndex].to) {
                currentBracketIndex++;
            }

            if (
                currentTrack &&
                currentBracketIndex < curlyBrackets.length &&
                i > curlyBrackets[currentBracketIndex].from &&
                i <= curlyBrackets[currentBracketIndex].to
            ) {
                // if we still fit into the current bracket, we just add another staff to the
                // track
                currentTrack.ensureStaveCount(currentTrack.staves.length + 1);
            } else {
                currentTrack = new Track();
                currentTrack.ensureStaveCount(1);
                currentTrack.name = staffLayout.description;
                currentTrack.playbackInfo.program = staffLayout.instrument;
                if (staffLayout.percussion) {
                    currentTrack.playbackInfo.primaryChannel = 9;
                    currentTrack.playbackInfo.secondaryChannel = 9;
                } else {
                    currentTrack.playbackInfo.primaryChannel = this._trackChannel++;
                    currentTrack.playbackInfo.secondaryChannel = this._trackChannel++;
                }
                this.score.addTrack(currentTrack);
            }

            const staff = currentTrack.staves[currentTrack.staves.length - 1];
            staff.isPercussion = staffLayout.percussion;
            staff.transpositionPitch = staffLayout.transpose;
            staff.displayTranspositionPitch = 12;
            staff.showTablature = false; // capella does not have tabs
            this._staffLookup.set(staffLayout.index, staff);
        }
    }

    private _brackets: Bracket[] = [];
    private parseBrackets(element: XmlNode) {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'bracket':
                        this.parseBracket(c);
                        break;
                }
            }
        }
    }

    private parseBracket(element: XmlNode) {
        const bracket = new Bracket();
        bracket.from = parseInt(element.getAttribute('from'));
        bracket.to = parseInt(element.getAttribute('to'));
        if (element.attributes.has('curly')) {
            bracket.curly = element.attributes.get('curly') === 'true';
        }
        this._brackets.push(bracket);
    }

    private parseLayoutStaves(element: XmlNode) {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'staffLayout':
                        this.parseStaffLayout(c);
                        break;
                }
            }
        }
    }

    private _staffLayoutLookup: Map<string, StaffLayout> = new Map();
    private _staffLayouts: StaffLayout[] = [];

    private parseStaffLayout(element: XmlNode) {
        const layout = new StaffLayout();
        layout.description = element.getAttribute('description');

        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'notation':
                        if (c.attributes.has('defaultClef')) {
                            layout.defaultClef = this.parseClef(c.attributes.get('defaultClef')!);
                        }
                        break;

                    case 'sound':
                        if (c.attributes.has('percussion')) {
                            layout.percussion = c.attributes.get('percussion') === 'true';
                        }
                        if (c.attributes.has('instr')) {
                            layout.instrument = parseInt(c.attributes.get('instr')!);
                        }
                        if (c.attributes.has('transpose')) {
                            layout.transpose = parseInt(c.attributes.get('transpose')!);
                        }
                        break;
                }
            }
        }

        this._staffLayoutLookup.set(layout.description, layout);
        layout.index = this._staffLayouts.length;
        this._staffLayouts.push(layout);
    }

    private parseClef(v: string): Clef {
        switch (v) {
            case 'treble':
                return Clef.G2;
            case 'bass':
                return Clef.F4;
            case 'alto':
                return Clef.C4;
            case 'tenor':
                return Clef.C4;
        }
        return Clef.G2;
    }

    private parseSystems(element: XmlNode) {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'system':
                        this.parseSystem(c);
                        break;
                }
            }
        }
    }

    private parseSystem(element: XmlNode) {
        if (element.attributes.has('tempo')) {
            if (this.score.masterBars.length === 0) {
                this.score.tempo = parseInt(element.attributes.get('tempo')!);
            }
        }
        this._forceFlags = element.getAttribute('beamGrouping') === '0';

        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'staves':
                        this.parseStaves(element, c);
                        break;
                }
            }
        }
    }

    private parseStaves(systemElement: XmlNode, element: XmlNode) {
        let firstBarIndex = this.score.masterBars.length;
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'staff':
                        this.parseStaff(systemElement, firstBarIndex, c);
                        break;
                }
            }
        }
    }

    private _timeSignature: MasterBar = new MasterBar();
    private _currentStaffLayout!: StaffLayout;

    private parseStaff(systemElement: XmlNode, firstBarIndex: number, element: XmlNode) {
        const staffId = element.getAttribute('layout');
        this._currentStaffLayout = this._staffLayoutLookup.get(staffId)!;
        this._timeSignature.timeSignatureNumerator = 4;
        this._timeSignature.timeSignatureDenominator = 4;
        this._timeSignature.timeSignatureCommon = false;

        this.parseTime(element.getAttribute('defaultTime'));
        const staff = this._staffLookup.get(this._currentStaffLayout.index)!;

        // there might be systems where this staff is not contained
        // so we create bars until the current staff to ensure the right
        // alignment
        while (staff.bars.length < firstBarIndex) {
            this.addNewBar(staff);
        }

        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'voices':
                        this.parseVoices(staffId, staff, systemElement, firstBarIndex, c);
                        break;
                }
            }
        }
    }
    private parseTime(value: string) {
        switch (value) {
            case 'allaBreve':
            case 'C':
                this._timeSignature.timeSignatureNumerator = 2;
                this._timeSignature.timeSignatureDenominator = 2;
                this._timeSignature.timeSignatureCommon = true;
                break;
            case 'longAllaBreve':
                this._timeSignature.timeSignatureNumerator = 4;
                this._timeSignature.timeSignatureDenominator = 4;
                this._timeSignature.timeSignatureCommon = true;
                break;
            default:
                if (value.indexOf('/') > 0) {
                    const parts = value.split('/');
                    this._timeSignature.timeSignatureNumerator = parseInt(parts[0]);
                    this._timeSignature.timeSignatureDenominator = parseInt(parts[1]);
                    this._timeSignature.timeSignatureCommon = false;
                }
                break;
        }
    }
    private parseVoices(staffId: string, staff: Staff, systemElement: XmlNode, firstBarIndex: number, element: XmlNode) {
        let voiceIndex = 0;
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'voice':
                        this.parseVoice(staffId, staff, systemElement, voiceIndex, firstBarIndex, c);
                        voiceIndex++;
                        break;
                }
            }
        }
    }

    private getOrCreateBar(staff: Staff, barIndex: number): Bar {
        if (barIndex < staff.bars.length) {
            return staff.bars[barIndex];
        }
        return this.addNewBar(staff);
    }

    private addNewBar(staff: Staff) {
        // voice tags always start a new bar
        let currentBar: Bar = new Bar();
        currentBar.forceFlags = this._forceFlags;
        currentBar.clef = this._currentStaffLayout!.defaultClef;
        staff.addBar(currentBar);

        // create masterbar if needed
        if (staff.bars.length > this.score.masterBars.length) {
            let master: MasterBar = new MasterBar();
            this.score.addMasterBar(master);
            if (master.index > 0) {
                master.keySignature = master.previousMasterBar!.keySignature;
                master.keySignatureType = master.previousMasterBar!.keySignatureType;
                master.tripletFeel = master.previousMasterBar!.tripletFeel;
            }

            master.timeSignatureDenominator = this._timeSignature.timeSignatureDenominator;
            master.timeSignatureNumerator = this._timeSignature.timeSignatureNumerator;
            master.timeSignatureCommon = this._timeSignature.timeSignatureCommon;
        }
        return currentBar;
    }


    private _voiceStates: Map<string, CapellaVoiceState> = new Map();
    private _currentVoiceState!: CapellaVoiceState;
    private _currentBar!: Bar;
    private _currentVoice!: Voice;

    private newBar(staff: Staff, voiceIndex: number) {
        this._currentVoiceState.currentBarIndex++;
        this._currentBar = this.getOrCreateBar(staff, this._currentVoiceState.currentBarIndex);
        this._currentVoiceState.currentBarDuration = this._currentBar.masterBar.calculateDuration();
        this._currentVoiceState.currentBarComplete = false;
        this._currentVoiceState.currentPosition = 0;

        this.ensureVoice(staff, voiceIndex);
    }


    private parseVoice(staffId: string, staff: Staff, systemElement: XmlNode, voiceIndex: number, firstBarIndex: number, element: XmlNode) {
        const voiceStateKey = staffId + "_" + voiceIndex;
        if (!this._voiceStates.has(voiceStateKey)) {
            this._currentVoiceState = new CapellaVoiceState();
            this._currentVoiceState.currentBarIndex = firstBarIndex - 1;
            this._voiceStates.set(voiceStateKey, this._currentVoiceState);
            this.newBar(staff, voiceIndex);
        } else {
            this._currentVoiceState = this._voiceStates.get(voiceStateKey)!;
            this._currentVoiceState.currentBarComplete = true;
        }


        // voice tags always start a new bar
        if (element.attributes.has('stemDir')) {
            switch (element.attributes.get('stemDir')!) {
                case 'up':
                    this._currentVoiceState.voiceStemDir = BeamDirection.Up;
                    break;
                case 'down':
                    this._currentVoiceState.voiceStemDir = BeamDirection.Down;
                    break;
                default:
                    this._currentVoiceState.voiceStemDir = null;
                    break;
            }
        } else {
            this._currentVoiceState.voiceStemDir = null;
        }

        const noteObjects = element.findChildElement('noteObjects');

        if (systemElement.attributes.has('tempo')) {
            this._currentBar.masterBar.tempoAutomation = new Automation();
            this._currentBar.masterBar.tempoAutomation.isLinear = true;
            this._currentBar.masterBar.tempoAutomation.type = AutomationType.Tempo;
            this._currentBar.masterBar.tempoAutomation.value = parseInt(systemElement.attributes.get('tempo')!);
        }

        if (noteObjects) {
            for (let c of noteObjects.childNodes) {
                if (c.nodeType === XmlNodeType.Element) {
                    if (this._currentVoiceState.currentBarComplete) {
                        this.newBar(staff, voiceIndex);
                    }

                    switch (c.localName) {
                        case 'clefSign':
                            this._currentBar.clef = this.parseClef(c.getAttribute('clef'));
                            break;
                        case 'keySign':
                            this._currentBar.masterBar.keySignature = parseInt(c.getAttribute('fifths'));
                            break;
                        case 'timeSign':
                            this.parseTime(c.getAttribute('time'));
                            this._currentBar.masterBar.timeSignatureDenominator = this._timeSignature.timeSignatureDenominator;
                            this._currentBar.masterBar.timeSignatureNumerator = this._timeSignature.timeSignatureNumerator;
                            this._currentBar.masterBar.timeSignatureCommon = this._timeSignature.timeSignatureCommon;
                            this._currentVoiceState.currentBarDuration = this._currentBar.masterBar.calculateDuration();
                            break;
                        case 'barline':
                            switch (c.getAttribute('type')) {
                                case 'double':
                                    this._currentBar.masterBar.isDoubleBar = true;
                                    this._currentVoiceState.currentBarComplete = true;
                                    break;
                                case 'end':
                                    // nothing to do
                                    break;
                                case 'repEnd':
                                    // TODO: alternate endings handling
                                    this._currentBar.masterBar.repeatCount = this.findRepeatCount(c);
                                    this._currentVoiceState.currentBarComplete = true;
                                    break;
                                case 'repBegin':
                                    this._currentBar.masterBar.isRepeatStart = true;
                                    // no new bar here on purpose
                                    break;
                                case 'repEndBegin':
                                    // TODO: alternate endings handling
                                    this._currentBar.masterBar.repeatCount = this.findRepeatCount(c);
                                    this.newBar(staff, voiceIndex); // end-begin requires instant new bar
                                    this._currentBar.masterBar.isRepeatStart = true;
                                    break;
                                case 'dashed':
                                    this._currentVoiceState.currentBarComplete = true;
                                    break;
                                case 'single':
                                default:
                                    this._currentVoiceState.currentBarComplete = true;
                                    break;

                            }
                            break;
                        case 'chord':
                            let chordBeat = new Beat();
                            if (this._currentVoiceState.voiceStemDir) {
                                chordBeat.preferredBeamDirection = this._currentVoiceState.voiceStemDir;
                            }
                            this.parseDuration(this._currentBar, chordBeat, c.findChildElement('duration')!);
                            chordBeat.updateDurations();
                            this._currentVoiceState.currentPosition += chordBeat.playbackDuration;
                            this._currentVoice.addBeat(chordBeat);

                            this.parseChord(chordBeat, c);

                            if (this._currentVoiceState.currentPosition >= this._currentVoiceState.currentBarDuration) {
                                this._currentVoiceState.currentBarComplete = true;
                            }
                            break;
                        case 'rest':
                            let restBeat = new Beat();
                            this.parseDuration(this._currentBar, restBeat, c.findChildElement('duration')!);
                            restBeat.updateDurations();
                            this._currentVoiceState.currentPosition += restBeat.playbackDuration;

                            this._currentVoice.addBeat(restBeat);

                            if (this._currentVoiceState.currentPosition >= this._currentVoiceState.currentBarDuration) {
                                this._currentVoiceState.currentBarComplete = true;
                            }
                            break;
                    }
                }
            }
        }
    }

    private ensureVoice(staff: Staff, voiceIndex: number) {
        while (this._currentBar.voices.length < voiceIndex + 1) {
            this._currentBar.addVoice(new Voice());
        }

        if (!this._voiceCounts.has(staff.track.index) ||
            this._voiceCounts.get(staff.track.index)! < this._currentBar.voices.length
        ) {
            this._voiceCounts.set(staff.track.index, this._currentBar.voices.length);
        }

        this._currentVoice = this._currentBar.voices[voiceIndex];
    }

    private parseChord(beat: Beat, element: XmlNode) {
        const articulation: Note = new Note();
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'stem':
                        switch (c.getAttribute('dir')) {
                            case 'up':
                                beat.preferredBeamDirection = BeamDirection.Up;
                                break;
                            case 'down':
                                beat.preferredBeamDirection = BeamDirection.Down;
                                break;
                        }
                        break;
                    case 'articulation':
                        switch (c.getAttribute('type')) {
                            case 'staccato':
                                articulation.isStaccato = true;
                                break;
                            case 'normalAccent':
                                articulation.accentuated = AccentuationType.Normal;
                                break;
                            case 'strongAccent':
                                articulation.accentuated = AccentuationType.Heavy;
                                break;
                        }

                        break;
                    case 'lyric':
                        this.parseLyric(beat, c);
                        break;
                    case 'drawObjects':
                        this.parseBeatDrawObject(beat, c);
                        break;
                    case 'heads':
                        this.parseHeads(beat, articulation, c);
                        break;
                }
            }
        }
    }

    private parseHeads(beat: Beat, articulation: Note, element: XmlNode) {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'head':
                        this.parseHead(beat, articulation, c);
                        break;
                }
            }
        }
    }

    private _tieStarts!: Note[];
    private _tieStartIds!: Map<number, boolean>;
    private _slurs!: Map<Beat, number>;
    private _crescendo!: Map<Beat, WedgeDrawObject>;

    private parseHead(beat: Beat, articulation: Note, element: XmlNode) {
        const note = new Note();
        const pitch = ModelUtils.parseTuning(element.getAttribute('pitch'));
        note.octave = pitch!.octave;
        note.tone = pitch!.noteValue;
        note.isStaccato = articulation.isStaccato;
        note.accentuated = articulation.accentuated;
        beat.addNote(note);

        // TODO: based on the shape attribute apply effects or
        // right percussion value

        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'alter':
                        if (c.attributes.has('step')) {
                            note.tone += parseInt(c.attributes.get('step')!);
                        }
                        break;
                    case 'tie':
                        if (c.attributes.has('begin')) {
                            if (!this._tieStartIds.has(note.id)) {
                                this._tieStartIds.set(note.id, true);
                                this._tieStarts.push(note);
                            }
                        } else if (c.attributes.has('end') && this._tieStarts.length > 0 && !note.isTieDestination) {
                            note.isTieDestination = true;
                            note.tieOrigin = this._tieStarts[0];
                            this._tieStarts.splice(0, 1);
                            this._tieStartIds.delete(note.id);
                        }
                        break;
                }
            }
        }
    }

    private parseBeatDrawObject(beat: Beat, element: XmlNode) {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'drawObj':
                        const obj = this.parseDrawObj(c);
                        if (obj) {
                            if (obj instanceof TextDrawObject) {
                                if (obj.fontFace.startsWith('capella')) {
                                    if (obj.text === 'u') {
                                        beat.fermata = new Fermata();
                                        beat.fermata.type = FermataType.Medium;
                                    } else if (obj.text == 'f') {
                                        beat.dynamics = DynamicValue.F;
                                    } else if (obj.text == 'j') {
                                        beat.dynamics = DynamicValue.MF;
                                    }
                                } else {
                                    beat.text = obj.text;
                                }
                            } else if (obj instanceof GuitarDrawObject) {
                                // TODO: Chord
                            } else if (obj instanceof WavyLineDrawObject) {
                                beat.vibrato = VibratoType.Slight;
                            } else if (obj instanceof WedgeDrawObject) {
                                beat.crescendo = obj.decrescendo ? CrescendoType.Decrescendo : CrescendoType.Crescendo;
                                this._crescendo.set(beat, obj);
                            } else if (obj instanceof SlurDrawObject) {
                                this._slurs.set(beat, obj.noteRange);
                            }
                        }
                        break;
                }
            }
        }
    }

    private parseLyric(beat: Beat, element: XmlNode) {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'verse':
                        if (!beat.lyrics) {
                            beat.lyrics = [];
                        }
                        beat.lyrics.push(c.innerText);
                        break;
                }
            }
        }
    }

    private parseDuration(bar: Bar, beat: Beat, element: XmlNode) {
        const base = element.getAttribute('base');
        switch (base) {
            case '2/1':
                beat.duration = Duration.DoubleWhole;
                break;
            case '1/1':
                beat.duration = Duration.Whole;
                break;
            case '1/2':
                beat.duration = Duration.Half;
                break;
            case '1/4':
                beat.duration = Duration.Quarter;
                break;
            case '1/8':
                beat.duration = Duration.Eighth;
                break;
            case '1/16':
                beat.duration = Duration.Sixteenth;
                break;
            case '1/32':
                beat.duration = Duration.ThirtySecond;
                break;
            case '1/64':
                beat.duration = Duration.SixtyFourth;
                break;
            case '1/128':
                beat.duration = Duration.OneHundredTwentyEighth;
                break;
            default:
                const fullBars = parseInt(base);
                if (fullBars === 1) {
                    // TODO: find better solution here
                    const mb = bar.masterBar;
                    if (mb.timeSignatureNumerator === mb.timeSignatureDenominator) {
                        beat.duration = Duration.Whole;
                    } else {
                        Logger.warning(
                            'Importer',
                            `Unsupported full-bar rest for time signature ${mb.timeSignatureNumerator}/${mb.timeSignatureDenominator}`
                        );
                        beat.duration = Duration.Whole;
                    }
                } else {
                    // TODO: multibar rests
                    Logger.warning('Importer', `Multi-Bar rests are not supported`);
                }
                break;
        }

        if (element.attributes.has('dots')) {
            beat.dots = parseInt(element.attributes.get('dots')!);
        }

        const tuplet = element.findChildElement('tuplet');
        if (tuplet) {
            beat.tupletNumerator = parseInt(tuplet.getAttribute('count'));
            const tripartiteMultiplicator = tuplet.getAttribute('tripartite') === 'true' ? 3 : 1;
            const prolongDiff = tuplet.getAttribute('prolong') === 'true' ? 0 : 1;

            let power = 0;
            while (tripartiteMultiplicator * Math.pow(2, power + prolongDiff) < beat.tupletNumerator) {
                power++;
            }
            beat.tupletDenominator = tripartiteMultiplicator * Math.pow(2, power);
        }
    }

    private findRepeatCount(barLineNode: XmlNode): number {
        const drawObjects = barLineNode.findChildElement('drawObjects');
        if (drawObjects) {
            for (let c of drawObjects.childNodes) {
                if (c.nodeType === XmlNodeType.Element) {
                    switch (c.localName) {
                        case 'drawObj':
                            const obj = this.parseDrawObj(c);
                            if (obj) {
                                if (obj instanceof VoltaDrawObject) {
                                    return obj.lastNumber;
                                }
                            }
                            break;
                    }
                }
            }
        }
        return 2;
    }

    private parsePageObjects(element: XmlNode) {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'drawObj':
                        const obj = this.parseDrawObj(c);
                        if (obj) {
                            if (obj instanceof TextDrawObject) {
                                switch (obj.align) {
                                    case TextAlign.Center:
                                        if (!this.score.title) {
                                            this.score.title = c.innerText;
                                        } else if (!this.score.subTitle) {
                                            this.score.subTitle = c.innerText;
                                        }
                                        break;
                                    case TextAlign.Right:
                                        if (!this.score.artist) {
                                            this.score.artist = c.innerText;
                                        }
                                        break;
                                }
                            }
                        }

                        break;
                }
            }
        }
    }

    private parseGallery(element: XmlNode) {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'drawObj':
                        const obj = this.parseDrawObj(c);
                        if (obj) {
                            this._galleryObjects.set(c.getAttribute('name'), obj);
                        }
                        break;
                }
            }
        }
    }

    private parseDrawObj(element: XmlNode): DrawObject | null {
        let obj: DrawObject | null = null;

        let noteRange = 1;

        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'text':
                        obj = this.parseText(c);
                        break;
                    case 'guitar':
                        obj = this.parseGuitar(c);
                        break;
                    case 'slur':
                        obj = this.parseSlur(c);
                        break;
                    case 'wavyLine':
                        obj = this.parseWavyLine(c);
                        break;
                    case 'bracket':
                        obj = this.parseTupletBracket(c);
                        break;
                    case 'wedge':
                        obj = this.parseWedge(c);
                        break;
                    case 'volta':
                        obj = this.parseVolta(c);
                        break;
                    case 'octaveClef':
                        obj = this.parseOctaveClef(c);
                        break;
                    case 'trill':
                        obj = this.parseTrill(c);
                        break;
                    case 'basic':
                        if (c.attributes.has('noteRange')) {
                            noteRange = parseInt(c.attributes.get('noteRange')!);
                        }
                        break;
                }
            }
        }

        if (obj) {
            obj.noteRange = noteRange;
        }

        return obj;
    }

    private parseTrill(_: XmlNode): DrawObject | null {
        const obj = new TrillDrawObject();
        return obj;
    }

    private parseOctaveClef(element: XmlNode): OctaveClefDrawObject {
        const obj = new OctaveClefDrawObject();

        if (element.attributes.has('octave')) {
            obj.octave = parseInt(element.attributes.get('octave')!);
        }

        return obj;
    }

    private parseVolta(element: XmlNode): VoltaDrawObject {
        const obj = new VoltaDrawObject();

        obj.allNumbers = element.attributes.get('allNumbers') === 'true';
        if (element.attributes.has('firstNumber')) {
            obj.firstNumber = parseInt(element.attributes.get('firstNumber')!);
        }
        if (element.attributes.has('lastNumber')) {
            obj.lastNumber = parseInt(element.attributes.get('lastNumber')!);
        }

        return obj;
    }

    private parseWedge(element: XmlNode): WedgeDrawObject {
        const obj = new WedgeDrawObject();

        obj.decrescendo = element.attributes.get('decrescendo') === 'true';

        return obj;
    }

    private parseTupletBracket(element: XmlNode): TupletBracketDrawObject {
        const obj = new TupletBracketDrawObject();

        if (element.attributes.has('number')) {
            obj.number = parseInt(element.attributes.get('number')!);
        }

        return obj;
    }

    private parseWavyLine(_: XmlNode): WavyLineDrawObject {
        const obj = new WavyLineDrawObject();
        return obj;
    }

    private parseSlur(_: XmlNode): SlurDrawObject {
        const obj = new SlurDrawObject();
        return obj;
    }

    private parseGuitar(element: XmlNode): GuitarDrawObject {
        const obj = new GuitarDrawObject();

        const strings = element.innerText.trim();

        for (let i = 0; i < strings.length; i++) {
            if (strings.charAt(i) === '/') {
                obj.chord.strings.push(0);
            } else {
                obj.chord.strings.push(parseInt(strings.charAt(i)));
            }
        }

        return obj;
    }

    private parseText(element: XmlNode): TextDrawObject {
        const obj = new TextDrawObject();
        switch (element.getAttribute('align')) {
            case 'left':
                obj.align = TextAlign.Left;
                break;
            case 'center':
                obj.align = TextAlign.Center;
                break;
            case 'right':
                obj.align = TextAlign.Right;
                break;
        }

        switch (element.getAttribute('frame')) {
            case 'rectangle':
                obj.frame = FrameType.Rectangle;
                break;
            case 'ellipse':
                obj.frame = FrameType.Ellipse;
                break;
            case 'circle':
                obj.frame = FrameType.Circle;
                break;
            case 'none':
                obj.frame = FrameType.None;
                break;
        }

        if (element.firstElement) {
            for (let c of element.childNodes) {
                if (c.nodeType === XmlNodeType.Element) {
                    switch (c.localName) {
                        case 'font':
                            obj.fontFace = c.getAttribute('face');
                            break;
                        case 'content':
                            obj.text = c.innerText;
                            break;
                    }
                }
            }
        } else {
            obj.text = element.innerText;
        }


        return obj;
    }

    private parseInfo(element: XmlNode): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    // encodingSoftware ignored
                    case 'author':
                        this.score.tab = c.firstChild!.innerText;
                        break;
                    // keywords ignored
                    case 'comment':
                        this.score.notices = c.firstChild!.innerText;
                        break;
                }
            }
        }
    }
}
