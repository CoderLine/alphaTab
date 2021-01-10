import { ScoreImporter } from '@src/importer/ScoreImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { AccentuationType } from '@src/model/AccentuationType';
import { Automation, AutomationType } from '@src/model/Automation';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { Chord } from '@src/model/Chord';
import { Clef } from '@src/model/Clef';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { GraceType } from '@src/model/GraceType';
import { KeySignature } from '@src/model/KeySignature';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { MasterBar } from '@src/model/MasterBar';
import { Note } from '@src/model/Note';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { Ottavia } from '@src/model/Ottavia';
import { PickStroke } from '@src/model/PickStroke';
import { Score } from '@src/model/Score';
import { SlideOutType } from '@src/model/SlideOutType';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { Voice } from '@src/model/Voice';

import { ModelUtils } from '@src/model/ModelUtils';

import { XmlDocument } from '@src/xml/XmlDocument';
import { XmlNode, XmlNodeType } from '@src/xml/XmlNode';
import { IOHelper } from '@src/io/IOHelper';

export class MusicXmlImporter extends ScoreImporter {
    private _score!: Score;
    private _trackById!: Map<string, Track>;
    private _partGroups!: Map<string, Track[]>;
    private _currentPartGroup: string | null = null;
    private _trackFirstMeasureNumber: number = 0;
    private _maxVoices: number = 0;
    private _currentDirection: string | null = null;
    private _tieStarts!: Note[];
    private _tieStartIds!: Map<number, boolean>;
    private _slurStarts!: Map<string, Note>;

    public get name(): string {
        return 'MusicXML';
    }

    public constructor() {
        super();
    }

    public readScore(): Score {
        this._trackById = new Map<string, Track>();
        this._partGroups = new Map<string, Track[]>();
        this._tieStarts = [];
        this._tieStartIds = new Map<number, boolean>();
        this._slurStarts = new Map<string, Note>();
        let xml: string = IOHelper.toString(this.data.readAll(), this.settings.importer.encoding);
        let dom: XmlDocument = new XmlDocument();
        try {
            dom.parse(xml);
        } catch (e) {
            throw new UnsupportedFormatError('Unsupported format');
        }
        this._score = new Score();
        this._score.tempo = 120;
        this.parseDom(dom);
        // merge partgroups into a single track with multiple staves
        if (this.settings.importer.mergePartGroupsInMusicXml) {
            this.mergePartGroups();
        }
        this._score.finish(this.settings);
        // the structure of MusicXML does not allow live creation of the groups,
        this._score.rebuildRepeatGroups();
        return this._score;
    }

    private mergePartGroups(): void {
        let anyMerged: boolean = false;
        for(const tracks of this._partGroups.values()) {
            if (tracks.length > 1) {
                this.mergeGroup(tracks);
                anyMerged = true;
            }
        }
        // if any groups were merged, we need to rebuild the indexes
        if (anyMerged) {
            for (let i: number = 0; i < this._score.tracks.length; i++) {
                this._score.tracks[i].index = i;
            }
        }
    }

    private mergeGroup(partGroup: Track[]): void {
        let primaryTrack: Track = partGroup[0];
        for (let i: number = 1; i < partGroup.length; i++) {
            // merge staves over to primary track
            let secondaryTrack: Track = partGroup[i];
            for (let staff of secondaryTrack.staves) {
                primaryTrack.addStaff(staff);
            }
            // remove track from score
            let trackIndex: number = this._score.tracks.indexOf(secondaryTrack);
            this._score.tracks.splice(trackIndex, 1);
        }
    }

    private parseDom(dom: XmlDocument): void {
        let root: XmlNode | null = dom.firstElement;
        if (!root) {
            throw new UnsupportedFormatError('Unsupported format');
        }
        switch (root.localName) {
            case 'score-partwise':
                this.parsePartwise(root);
                break;
            case 'score-timewise':
                // ParseTimewise(root);
                break;
            default:
                throw new UnsupportedFormatError('Unsupported format');
        }
    }

    private parsePartwise(element: XmlNode): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'work':
                        this.parseWork(c);
                        break;
                    case 'movement-title':
                        this._score.title = c.innerText;
                        break;
                    case 'identification':
                        this.parseIdentification(c);
                        break;
                    case 'part-list':
                        this.parsePartList(c);
                        break;
                    case 'part':
                        this.parsePart(c);
                        break;
                }
            }
        }
    }

    private parseWork(element: XmlNode): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'work-title':
                        this._score.title = c.innerText;
                        break;
                }
            }
        }
    }

    private parsePart(element: XmlNode): void {
        let id: string = element.getAttribute('id');
        if (!this._trackById.has(id)) {
            if (this._trackById.size === 1) {
                for(const [x,t] of this._trackById) {
                    if (t.staves.length === 0 || t.staves[0].bars.length === 0) {
                        id = x;
                    }
                }
                if (!this._trackById.has(id)) {
                    return;
                }
            } else {
                return;
            }
        }
        let track: Track = this._trackById.get(id)!;
        let isFirstMeasure: boolean = true;
        this._maxVoices = 0;
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'measure':
                        if (this.parseMeasure(c, track, isFirstMeasure)) {
                            isFirstMeasure = false;
                        }
                        break;
                }
            }
        }
        // ensure voices for all bars
        for (let staff of track.staves) {
            for (let bar of staff.bars) {
                this.ensureVoices(bar);
            }
        }
    }

    private parseMeasure(element: XmlNode, track: Track, isFirstMeasure: boolean): boolean {
        if (element.getAttribute('implicit') === 'yes' && element.getElementsByTagName('note', false).length === 0) {
            return false;
        }
        let barIndex: number = 0;
        if (isFirstMeasure) {
            this._divisionsPerQuarterNote = 0;
            this._trackFirstMeasureNumber = parseInt(element.getAttribute('number'));
            if(!this._trackFirstMeasureNumber) {
                this._trackFirstMeasureNumber = 0;
            }
            barIndex = 0;
        } else {
            barIndex = parseInt(element.getAttribute('number'));
            if (!barIndex) {
                return false;
            }
            barIndex -= this._trackFirstMeasureNumber;
        }
        // try to find out the number of staffs required
        if (isFirstMeasure) {
            let attributes: XmlNode[] = element.getElementsByTagName('attributes', false);
            if (attributes.length > 0) {
                let stavesElements: XmlNode[] = attributes[0].getElementsByTagName('staves', false);
                if (stavesElements.length > 0) {
                    let staves: number = parseInt(stavesElements[0].innerText);
                    track.ensureStaveCount(staves);
                }
            }
        }
        // create empty bars to the current index
        let bars: Bar[] = new Array<Bar>(track.staves.length);
        let masterBar: MasterBar | null = null;
        for (let b: number = track.staves[0].bars.length; b <= barIndex; b++) {
            for (let s: number = 0; s < track.staves.length; s++) {
                let bar: Bar = (bars[s] = new Bar());
                if (track.staves[s].bars.length > 0) {
                    let previousBar: Bar = track.staves[s].bars[track.staves[s].bars.length - 1];
                    bar.clef = previousBar.clef;
                }
                masterBar = this.getOrCreateMasterBar(barIndex);
                track.staves[s].addBar(bar);
                this.ensureVoices(bar);
            }
        }
        let attributesParsed: boolean = false;
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'note':
                        this.parseNoteBeat(c, bars);
                        break;
                    case 'forward':
                        this.parseForward(c, bars);
                        break;
                    case 'direction':
                        this.parseDirection(c, masterBar!);
                        break;
                    case 'attributes':
                        if (!attributesParsed) {
                            this.parseAttributes(c, bars, masterBar!, track);
                            attributesParsed = true;
                        }
                        break;
                    case 'harmony':
                        this.parseHarmony(c, track);
                        break;
                    case 'sound':
                        // TODO
                        break;
                    case 'barline':
                        this.parseBarline(c, masterBar!);
                        break;
                }
            }
        }
        return true;
    }

    private ensureVoices(bar: Bar): void {
        while (bar.voices.length < this._maxVoices) {
            let emptyVoice: Voice = new Voice();
            bar.addVoice(emptyVoice);
            let emptyBeat: Beat = new Beat();
            emptyBeat.isEmpty = true;
            emptyBeat.chordId = this._currentChord;
            emptyVoice.addBeat(emptyBeat);
        }
    }

    private getOrCreateBeat(element: XmlNode, bars: Bar[], chord: boolean): Beat {
        let voiceIndex: number = 0;
        let voiceNodes: XmlNode[] = element.getElementsByTagName('voice', false);
        if (voiceNodes.length > 0) {
            voiceIndex = parseInt(voiceNodes[0].innerText) - 1;
        }
        let previousBeatWasPulled: boolean = this._previousBeatWasPulled;
        this._previousBeatWasPulled = false;
        let staffElement: XmlNode[] = element.getElementsByTagName('staff', false);
        let staff: number = 1;
        if (staffElement.length > 0) {
            staff = parseInt(staffElement[0].innerText);
            // in case we have a beam with a staff-jump we pull the note to the previous staff
            if (
                (this._isBeamContinue || previousBeatWasPulled) &&
                this._previousBeat!.voice.bar.staff.index !== staff - 1
            ) {
                staff = this._previousBeat!.voice.bar.staff.index + 1;
                this._previousBeatWasPulled = true;
            }
            let staffId: string = bars[0].staff.track.index + '-' + staff;
            if (!this._voiceOfStaff.has(staffId)) {
                this._voiceOfStaff.set(staffId, voiceIndex);
            }
        }
        staff--;
        let bar: Bar;
        if (staff < 0) {
            bar = bars[0];
        } else if (staff >= bars.length) {
            bar = bars[bars.length - 1];
        } else {
            bar = bars[staff];
        }
        let beat: Beat;
        let voice: Voice = this.getOrCreateVoice(bar, voiceIndex);
        if ((chord && voice.beats.length > 0) || (voice.beats.length === 1 && voice.isEmpty)) {
            beat = voice.beats[voice.beats.length - 1];
        } else {
            beat = new Beat();
            beat.isEmpty = false;
            voice.addBeat(beat);
        }
        this._isBeamContinue = false;
        this._previousBeat = beat;
        return beat;
    }

    private parseForward(element: XmlNode, bars: Bar[]): void {
        let beat: Beat = this.getOrCreateBeat(element, bars, false);
        let durationInDivisions: number = parseInt(element.findChildElement('duration')!.innerText);
        let duration: number = (durationInDivisions * Duration.Quarter) / this._divisionsPerQuarterNote;
        let durations = [
            Duration.SixtyFourth,
            Duration.ThirtySecond,
            Duration.Sixteenth,
            Duration.Eighth,
            Duration.Quarter,
            Duration.Half,
            Duration.Whole
        ];
        for (let d of durations) {
            if (duration >= d) {
                beat.duration = d;
                duration -= d;
                break;
            }
        }
        if (duration > 0) {
            // TODO: Handle remaining duration
            // (additional beats, dotted durations,...)
        }
        beat.isEmpty = false;
    }

    private parseStaffDetails(element: XmlNode, track: Track): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'staff-lines':
                        for (let staff of track.staves) {
                            staff.stringTuning.tunings = new Array<number>(parseInt(c.innerText)).fill(0);
                        }
                        break;
                    case 'staff-tuning':
                        this.parseStaffTuning(c, track);
                        break;
                }
            }
        }
        for (let staff of track.staves) {
            if (this.isEmptyTuning(staff.tuning)) {
                staff.stringTuning.tunings = [];
            }
        }
    }

    private parseStaffTuning(element: XmlNode, track: Track): void {
        let line: number = parseInt(element.getAttribute('line'));
        let tuningStep: string = 'C';
        let tuningOctave: string = '';
        let tuningAlter: number = 0;
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'tuning-step':
                        tuningStep = c.innerText;
                        break;
                    case 'tuning-alter':
                        tuningAlter = parseInt(c.innerText);
                        break;
                    case 'tuning-octave':
                        tuningOctave = c.innerText;
                        break;
                }
            }
        }
        let tuning: number = ModelUtils.getTuningForText(tuningStep + tuningOctave) + tuningAlter;
        for (let staff of track.staves) {
            staff.tuning[staff.tuning.length - line] = tuning;
        }
    }

    private _currentChord: string | null = null;
    private _divisionsPerQuarterNote: number = 0;

    private parseHarmony(element: XmlNode, track: Track): void {
        let rootStep: string | null = null;
        let rootAlter: string = '';
        // let kind: string | null = null;
        // let kindText: string | null = null;
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'root':
                        for (let rootChild of c.childNodes) {
                            if (rootChild.nodeType === XmlNodeType.Element) {
                                switch (rootChild.localName) {
                                    case 'root-step':
                                        rootStep = rootChild.innerText;
                                        break;
                                    case 'root-alter':
                                        switch (parseInt(c.innerText)) {
                                            case -2:
                                                rootAlter = ' bb';
                                                break;
                                            case -1:
                                                rootAlter = ' b';
                                                break;
                                            case 0:
                                                rootAlter = '';
                                                break;
                                            case 1:
                                                rootAlter = ' #';
                                                break;
                                            case 2:
                                                rootAlter = ' ##';
                                                break;
                                        }
                                        break;
                                }
                            }
                        }
                        break;
                    case 'kind':
                        // kindText = c.getAttribute('text');
                        // kind = c.innerText;
                        break;
                }
            }
        }
        let chord: Chord = new Chord();
        chord.name = rootStep + rootAlter;
        // TODO: find proper names for the rest
        // switch (kind)
        // {
        //    // triads
        //    case "major":
        //        break;
        //    case "minor":
        //        chord.Name += "m";
        //        break;
        //    // Sevenths
        //    case "augmented":
        //        break;
        //    case "diminished":
        //        break;
        //    case "dominant":
        //        break;
        //    case "major-seventh":
        //        chord.Name += "7M";
        //        break;
        //    case "minor-seventh":
        //        chord.Name += "m7";
        //        break;
        //    case "diminished-seventh":
        //        break;
        //    case "augmented-seventh":
        //        break;
        //    case "half-diminished":
        //        break;
        //    case "major-minor":
        //        break;
        //    // Sixths
        //    case "major-sixth":
        //        break;
        //    case "minor-sixth":
        //        break;
        //    // Ninths
        //    case "dominant-ninth":
        //        break;
        //    case "major-ninth":
        //        break;
        //    case "minor-ninth":
        //        break;
        //    // 11ths
        //    case "dominant-11th":
        //        break;
        //    case "major-11th":
        //        break;
        //    case "minor-11th":
        //        break;
        //    // 13ths
        //    case "dominant-13th":
        //        break;
        //    case "major-13th":
        //        break;
        //    case "minor-13th":
        //        break;
        //    // Suspended
        //    case "suspended-second":
        //        break;
        //    case "suspended-fourth":
        //        break;
        //    // Functional sixths
        //    case "Neapolitan":
        //        break;
        //    case "Italian":
        //        break;
        //    case "French":
        //        break;
        //    case "German":
        //        break;
        //    // Other
        //    case "pedal":
        //        break;
        //    case "power":
        //        break;
        //    case "Tristan":
        //        break;
        // }
        // var degree = element.GetElementsByTagName("degree");
        // if (degree.Length > 0)
        // {
        //    var degreeValue = Platform.GetNodeValue(degree[0].GetElementsByTagName("degree-value")[0]);
        //    var degreeAlter = Platform.GetNodeValue(degree[0].GetElementsByTagName("degree-alter")[0]);
        //    var degreeType = Platform.GetNodeValue(degree[0].GetElementsByTagName("degree-type")[0]);
        //    if (!string.IsNullOrEmpty(degreeType))
        //    {
        //        chord.Name += degreeType;
        //    }
        //    if (!string.IsNullOrEmpty(degreeValue))
        //    {
        //        chord.Name += "#" + degreeValue;
        //    }
        // }
        this._currentChord = ModelUtils.newGuid();
        for (let staff of track.staves) {
            staff.addChord(this._currentChord, chord);
        }
    }

    private parseBarline(element: XmlNode, masterBar: MasterBar): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'repeat':
                        this.parseRepeat(c, masterBar);
                        break;
                    case 'ending':
                        this.parseEnding(c, masterBar);
                        break;
                }
            }
        }
    }

    private parseEnding(element: XmlNode, masterBar: MasterBar): void {
        let num: number = parseInt(element.getAttribute('number'));
        if (num > 0) {
            --num;
            masterBar.alternateEndings |= (0x01 << num) & 0xff;
        }
    }

    private parseRepeat(element: XmlNode, masterBar: MasterBar): void {
        let direction: string = element.getAttribute('direction');
        let times: number = parseInt(element.getAttribute('times'));
        if (times < 0 || isNaN(times)) {
            times = 2;
        }
        if (direction === 'backward') {
            masterBar.repeatCount = times;
        } else if (direction === 'forward') {
            masterBar.isRepeatStart = true;
        }
    }

    private _voiceOfStaff: Map<string, number> = new Map<string, number>();
    private _isBeamContinue: boolean = false;
    private _previousBeatWasPulled: boolean = false;
    private _previousBeat: Beat | null = null;

    private parseNoteBeat(element: XmlNode, bars: Bar[]): void {
        let chord: boolean = element.getElementsByTagName('chord', false).length > 0;
        let beat: Beat = this.getOrCreateBeat(element, bars, chord);
        if (!beat.chordId && this._currentChord) {
            beat.chordId = this._currentChord;
            this._currentChord = null;
        }
        if (this._currentDirection) {
            beat.text = this._currentDirection;
            this._currentDirection = null;
        }
        let note: Note = new Note();
        beat.voice.isEmpty = false;
        beat.isEmpty = false;
        beat.addNote(note);
        beat.dots = 0;
        let isFullBarRest = false;
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'grace':
                        // var slash = e.GetAttribute("slash");
                        // var makeTime = Platform.ParseInt(e.GetAttribute("make-time"));
                        // var stealTimePrevious = Platform.ParseInt(e.GetAttribute("steal-time-previous"));
                        // var stealTimeFollowing = Platform.ParseInt(e.GetAttribute("steal-time-following"));
                        beat.graceType = GraceType.BeforeBeat;
                        beat.duration = Duration.ThirtySecond;
                        break;
                    case 'duration':
                        if (beat.isRest && !isFullBarRest) {
                            // unit: divisions per quarter note
                            let duration: number = parseInt(c.innerText);
                            switch (duration) {
                                case 1:
                                    beat.duration = Duration.Whole;
                                    break;
                                case 2:
                                    beat.duration = Duration.Half;
                                    break;
                                case 4:
                                    beat.duration = Duration.Quarter;
                                    break;
                                case 8:
                                    beat.duration = Duration.Eighth;
                                    break;
                                case 16:
                                    beat.duration = Duration.Sixteenth;
                                    break;
                                case 32:
                                    beat.duration = Duration.ThirtySecond;
                                    break;
                                case 64:
                                    beat.duration = Duration.SixtyFourth;
                                    break;
                                default:
                                    beat.duration = Duration.Quarter;
                                    break;
                            }
                        }
                        break;
                    case 'tie':
                        this.parseTied(c, note);
                        break;
                    case 'cue':
                        // not supported
                        break;
                    case 'instrument':
                        // not supported
                        break;
                    case 'type':
                        beat.duration = this.getDuration(c.innerText);
                        if (beat.graceType !== GraceType.None && beat.duration < Duration.Sixteenth) {
                            beat.duration = Duration.Eighth;
                        }
                        break;
                    case 'dot':
                        beat.dots++;
                        break;
                    case 'accidental':
                        this.parseAccidental(c, note);
                        break;
                    case 'time-modification':
                        this.parseTimeModification(c, beat);
                        break;
                    case 'stem':
                        // not supported
                        break;
                    case 'notehead':
                        if (c.getAttribute('parentheses') === 'yes') {
                            note.isGhost = true;
                        }
                        break;
                    case 'beam':
                        let beamMode: string = c.innerText;
                        if (beamMode === 'continue') {
                            this._isBeamContinue = true;
                        }
                        break;
                    case 'notations':
                        this.parseNotations(c, beat, note);
                        break;
                    case 'lyric':
                        this.parseLyric(c, beat);
                        break;
                    case 'pitch':
                        this.parsePitch(c, note);
                        break;
                    case 'unpitched':
                        this.parseUnpitched(c, note);
                        break;
                    case 'rest':
                        isFullBarRest = c.getAttribute('measure') === 'yes';
                        beat.isEmpty = false;
                        beat.notes = [];
                        beat.duration = Duration.Whole;
                        break;
                }
            }
        }
        // check if new note is duplicate on string
        if (note.isStringed) {
            for (let i: number = 0; i < beat.notes.length; i++) {
                if (beat.notes[i].string === note.string && beat.notes[i] !== note) {
                    beat.removeNote(note);
                    break;
                }
            }
        }
    }

    private getDuration(text: string): Duration {
        switch (text) {
            case '256th':
            case '128th':
            case '64th':
                return Duration.SixtyFourth;
            case '32nd':
                return Duration.ThirtySecond;
            case '16th':
                return Duration.Sixteenth;
            case 'eighth':
                return Duration.Eighth;
            case 'quarter':
                return Duration.Quarter;
            case 'half':
                return Duration.Half;
            case 'long':
            case 'breve':
            case 'whole':
                return Duration.Whole;
        }
        return Duration.Quarter;
    }

    private parseLyric(element: XmlNode, beat: Beat): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'text':
                        if (beat.text) {
                            beat.text += ' ' + c.innerText;
                        } else {
                            beat.text = c.innerText;
                        }
                        break;
                }
            }
        }
    }

    private parseAccidental(element: XmlNode, note: Note): void {
        switch (element.innerText) {
            case 'sharp':
                note.accidentalMode = NoteAccidentalMode.ForceSharp;
                break;
            case 'natural':
                note.accidentalMode = NoteAccidentalMode.ForceNatural;
                break;
            case 'flat':
                note.accidentalMode = NoteAccidentalMode.ForceFlat;
                break;
            case 'double-sharp':
                break;
            case 'sharp-sharp':
                break;
            case 'flat-flat':
                break;
            case 'natural-sharp':
                break;
            case 'natural-flat':
                break;
            case 'quarter-flat':
                break;
            case 'quarter-sharp':
                break;
            case 'three-quarters-flat':
                break;
            case 'three-quarters-sharp':
                break;
        }
    }

    private parseTied(element: XmlNode, note: Note): void {
        if (element.getAttribute('type') === 'start') {
            if (!this._tieStartIds.has(note.id)) {
                this._tieStartIds.set(note.id, true);
                this._tieStarts.push(note);
            }
        } else if (element.getAttribute('type') === 'stop' && this._tieStarts.length > 0 && !note.isTieDestination) {
            note.isTieDestination = true;
            note.tieOriginNoteId = this._tieStarts[0].id;
            this._tieStarts.splice(0, 1);
            this._tieStartIds.delete(note.id);
        }
    }

    private parseNotations(element: XmlNode, beat: Beat, note: Note): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'articulations':
                        this.parseArticulations(c, note);
                        break;
                    case 'tied':
                        this.parseTied(c, note);
                        break;
                    case 'slide':
                    case 'glissando':
                        if (c.getAttribute('type') === 'start') {
                            note.slideOutType = SlideOutType.Shift;
                        }
                        break;
                    case 'dynamics':
                        this.parseDynamics(c, beat);
                        break;
                    case 'technical':
                        this.parseTechnical(c, note);
                        break;
                    case 'ornaments':
                        this.parseOrnaments(c, note);
                        break;
                    case 'slur':
                        let slurNumber: string = c.getAttribute('number');
                        if (!slurNumber) {
                            slurNumber = '1';
                        }
                        switch (c.getAttribute('type')) {
                            case 'start':
                                this._slurStarts.set(slurNumber, note);
                                break;
                            case 'stop':
                                if (this._slurStarts.has(slurNumber)) {
                                    note.isSlurDestination = true;
                                    let slurStart: Note = this._slurStarts.get(slurNumber)!;
                                    slurStart.slurDestinationNoteId = note.id;
                                    note.slurOriginNoteId = note.id;
                                }
                                break;
                        }
                        break;
                }
            }
        }
    }

    private parseOrnaments(element: XmlNode, note: Note): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'tremolo':
                        let tremoloSpeed: number = parseInt(c.innerText);
                        switch (tremoloSpeed) {
                            case 1:
                                note.beat.tremoloSpeed = Duration.Eighth;
                                break;
                            case 2:
                                note.beat.tremoloSpeed = Duration.Sixteenth;
                                break;
                            case 3:
                                note.beat.tremoloSpeed = Duration.ThirtySecond;
                                break;
                        }
                        break;
                }
            }
        }
    }

    private parseTechnical(element: XmlNode, note: Note): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'string':
                        note.string = parseInt(c.innerText);
                        if (note.string !== -2147483648) {
                            note.string = note.beat.voice.bar.staff.tuning.length - note.string + 1;
                        }
                        break;
                    case 'fret':
                        note.fret = parseInt(c.innerText);
                        break;
                    case 'down-bow':
                        note.beat.pickStroke = PickStroke.Down;
                        break;
                    case 'up-bow':
                        note.beat.pickStroke = PickStroke.Up;
                        break;
                }
            }
        }
        if (note.string === -2147483648 || note.fret === -2147483648) {
            note.string = -1;
            note.fret = -1;
        }
    }

    private parseArticulations(element: XmlNode, note: Note): void {
        for (let c of element.childNodes) {
            switch (c.localName) {
                case 'accent':
                    note.accentuated = AccentuationType.Normal;
                    break;
                case 'strong-accent':
                    note.accentuated = AccentuationType.Heavy;
                    break;
                case 'staccato':
                case 'detached-legato':
                    note.isStaccato = true;
                    break;
            }
        }
    }

    private parseDynamics(element: XmlNode, beat: Beat): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'p':
                        beat.dynamics = DynamicValue.P;
                        break;
                    case 'pp':
                        beat.dynamics = DynamicValue.PP;
                        break;
                    case 'ppp':
                        beat.dynamics = DynamicValue.PPP;
                        break;
                    case 'f':
                        beat.dynamics = DynamicValue.F;
                        break;
                    case 'ff':
                        beat.dynamics = DynamicValue.FF;
                        break;
                    case 'fff':
                        beat.dynamics = DynamicValue.FFF;
                        break;
                    case 'mp':
                        beat.dynamics = DynamicValue.MP;
                        break;
                    case 'mf':
                        beat.dynamics = DynamicValue.MF;
                        break;
                }
            }
        }
    }

    private parseTimeModification(element: XmlNode, beat: Beat): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'actual-notes':
                        beat.tupletNumerator = parseInt(c.innerText);
                        break;
                    case 'normal-notes':
                        beat.tupletDenominator = parseInt(c.innerText);
                        break;
                }
            }
        }
    }

    private parseUnpitched(element: XmlNode, note: Note): void {
        let step: string = '';
        let semitones: number = 0;
        let octave: number = 0;
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'display-step':
                        step = c.innerText;
                        break;
                    case 'display-alter':
                        semitones = parseInt(c.innerText);
                        break;
                    case 'display-octave':
                        // 0-9, 4 for middle C
                        octave = parseInt(c.innerText);
                        break;
                }
            }
        }
        let value: number = octave * 12 + ModelUtils.getToneForText(step) + semitones;
        note.octave = (value / 12) | 0;
        note.tone = value - note.octave * 12;
    }

    private parsePitch(element: XmlNode, note: Note): void {
        let step: string = '';
        let semitones: number = 0;
        let octave: number = 0;
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'step':
                        step = c.innerText;
                        break;
                    case 'alter':
                        semitones = parseFloat(c.innerText);
                        if (isNaN(semitones)) {
                            semitones = 0;
                        }
                        break;
                    case 'octave':
                        // 0-9, 4 for middle C
                        octave = parseInt(c.innerText) + 1;
                        break;
                }
            }
        }
        let value: number = octave * 12 + ModelUtils.getToneForText(step) + (semitones | 0);
        note.octave = (value / 12) | 0;
        note.tone = value - note.octave * 12;
    }

    private getOrCreateVoice(bar: Bar, index: number): Voice {
        if (index < bar.voices.length) {
            return bar.voices[index];
        }
        for (let i: number = bar.voices.length; i <= index; i++) {
            bar.addVoice(new Voice());
        }
        this._maxVoices = Math.max(this._maxVoices, bar.voices.length);
        return bar.voices[index];
    }

    private parseDirection(element: XmlNode, masterBar: MasterBar): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'sound':
                        let tempo: string = c.getAttribute('tempo');
                        if (tempo) {
                            let tempoAutomation: Automation = new Automation();
                            tempoAutomation.isLinear = true;
                            tempoAutomation.type = AutomationType.Tempo;
                            tempoAutomation.value = parseInt(tempo);
                            masterBar.tempoAutomation = tempoAutomation;
                        }
                        break;
                    case 'direction-type':
                        let directionType: XmlNode = c.firstElement!;
                        switch (directionType.localName) {
                            case 'words':
                                this._currentDirection = directionType.innerText;
                                break;
                            case 'metronome':
                                this.parseMetronome(directionType, masterBar);
                                break;
                        }
                        break;
                }
            }
        }
    }

    private parseMetronome(element: XmlNode, masterBar: MasterBar): void {
        let unit: Duration = Duration.Quarter;
        let perMinute: number = 120;
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'beat-unit':
                        unit = this.getDuration(c.innerText);
                        break;
                    case 'per-minute':
                        perMinute = parseInt(c.innerText);
                        break;
                }
            }
        }
        let tempoAutomation: Automation = (masterBar.tempoAutomation = new Automation());
        tempoAutomation.type = AutomationType.Tempo;
        tempoAutomation.value = perMinute * ((unit / 4) | 0);
    }

    private parseAttributes(element: XmlNode, bars: Bar[], masterBar: MasterBar, track: Track): void {
        let num: number = 0;
        let hasTime: boolean = false;
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'divisions':
                        this._divisionsPerQuarterNote = parseInt(c.innerText);
                        break;
                    case 'key':
                        this.parseKey(c, masterBar);
                        break;
                    case 'time':
                        this.parseTime(c, masterBar);
                        hasTime = true;
                        break;
                    case 'clef':
                        num = parseInt(c.getAttribute('number'));
                        if (isNaN(num)) {
                            num = 1;
                        }
                        this.parseClef(c, bars[num - 1]);
                        break;
                    case 'staff-details':
                        this.parseStaffDetails(c, track);
                        break;
                    case 'transpose':
                        this.parseTranspose(c, track);
                        break;
                }
            }
        }
        if (!hasTime) {
            masterBar.timeSignatureCommon = true;
        }
    }

    private parseTranspose(element: XmlNode, track: Track): void {
        let semitones: number = 0;
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'chromatic':
                        semitones += parseInt(c.innerText);
                        break;
                    case 'octave-change':
                        semitones += parseInt(c.innerText) * 12;
                        break;
                }
            }
        }
        for (let staff of track.staves) {
            staff.transpositionPitch = semitones;
        }
    }

    private parseClef(element: XmlNode, bar: Bar): void {
        let sign: string = 's';
        let line: number = 0;
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'sign':
                        sign = c.innerText.toLowerCase();
                        break;
                    case 'line':
                        line = parseInt(c.innerText);
                        break;
                    case 'clef-octave-change':
                        switch (parseInt(c.innerText)) {
                            case -2:
                                bar.clefOttava = Ottavia._15mb;
                                break;
                            case -1:
                                bar.clefOttava = Ottavia._8vb;
                                break;
                            case 1:
                                bar.clefOttava = Ottavia._8va;
                                break;
                            case 2:
                                bar.clefOttava = Ottavia._15mb;
                                break;
                        }
                        break;
                }
            }
        }
        switch (sign) {
            case 'g':
                bar.clef = Clef.G2;
                break;
            case 'f':
                bar.clef = Clef.F4;
                break;
            case 'c':
                if (line === 3) {
                    bar.clef = Clef.C3;
                } else {
                    bar.clef = Clef.C4;
                }
                break;
            case 'percussion':
                bar.clef = Clef.Neutral;
                bar.staff.isPercussion = true;
                break;
            case 'tab':
                bar.clef = Clef.G2;
                bar.staff.showTablature = true;
                break;
            default:
                bar.clef = Clef.G2;
                break;
        }
    }

    private parseTime(element: XmlNode, masterBar: MasterBar): void {
        if (element.getAttribute('symbol') === 'common') {
            masterBar.timeSignatureCommon = true;
        }
        let beatsParsed: boolean = false;
        let beatTypeParsed: boolean = false;
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                let v: string = c.innerText;
                switch (c.localName) {
                    case 'beats':
                        if (!beatsParsed) {
                            if (v.indexOf('+') === -1) {
                                masterBar.timeSignatureNumerator = parseInt(v);
                            } else {
                                masterBar.timeSignatureNumerator = 4;
                            }
                            beatsParsed = true;
                        }
                        break;
                    case 'beat-type':
                        if (!beatTypeParsed) {
                            if (v.indexOf('+') === -1) {
                                masterBar.timeSignatureDenominator = parseInt(v);
                            } else {
                                masterBar.timeSignatureDenominator = 4;
                            }
                            beatTypeParsed = true;
                        }
                        break;
                }
            }
        }
    }

    private parseKey(element: XmlNode, masterBar: MasterBar): void {
        let fifths: number = -2147483648;
        //let keyStep: number = -2147483648;
        //let keyAlter: number = -2147483648;
        let mode: string = '';
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'fifths':
                        fifths = parseInt(c.innerText);
                        break;
                    case 'key-step':
                        //keyStep = parseInt(c.innerText);
                        break;
                    case 'key-alter':
                        //keyAlter = parseInt(c.innerText);
                        break;
                    case 'mode':
                        mode = c.innerText;
                        break;
                }
            }
        }
        if (-7 <= fifths && fifths <= 7) {
            // TODO: check if this is conrrect
            masterBar.keySignature = fifths as KeySignature;
        } else {
            masterBar.keySignature = KeySignature.C;
            // TODO: map keyStep/keyAlter to internal keysignature
        }
        if (mode === 'minor') {
            masterBar.keySignatureType = KeySignatureType.Minor;
        } else {
            masterBar.keySignatureType = KeySignatureType.Major;
        }
    }

    private getOrCreateMasterBar(index: number): MasterBar {
        if (index < this._score.masterBars.length) {
            return this._score.masterBars[index];
        }
        for (let i: number = this._score.masterBars.length; i <= index; i++) {
            let mb: MasterBar = new MasterBar();
            if (this._score.masterBars.length > 0) {
                let prev: MasterBar = this._score.masterBars[this._score.masterBars.length - 1];
                mb.timeSignatureDenominator = prev.timeSignatureDenominator;
                mb.timeSignatureNumerator = prev.timeSignatureNumerator;
                mb.keySignature = prev.keySignature;
                mb.keySignatureType = prev.keySignatureType;
            }
            this._score.addMasterBar(mb);
        }
        return this._score.masterBars[index];
    }

    private parseIdentification(element: XmlNode): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'creator':
                        if (c.getAttribute('type') === 'composer') {
                            this._score.music = c.innerText;
                        }
                        break;
                    case 'rights':
                        if (this._score.copyright) {
                            this._score.copyright += '\n';
                        }
                        this._score.copyright += c.innerText;
                        break;
                }
            }
        }
    }

    private parsePartList(element: XmlNode): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'part-group':
                        this.parsePartGroup(c);
                        break;
                    case 'score-part':
                        this.parseScorePart(c);
                        break;
                }
            }
        }
    }

    private parsePartGroup(element: XmlNode): void {
        let type: string = element.getAttribute('type');
        switch (type) {
            case 'start':
                this._currentPartGroup = element.getAttribute('number');
                this._partGroups.set(this._currentPartGroup, []);
                break;
            case 'stop':
                this._currentPartGroup = null;
                break;
        }
    }

    private parseScorePart(element: XmlNode): void {
        let id: string = element.getAttribute('id');
        let track: Track = new Track();
        track.ensureStaveCount(1);
        let staff: Staff = track.staves[0];
        staff.showStandardNotation = true;
        this._trackById.set(id, track);
        this._score.addTrack(track);
        if (this._currentPartGroup) {
            this._partGroups.get(this._currentPartGroup)!.push(track);
        }
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'part-name':
                        track.name = c.innerText;
                        break;
                    case 'part-abbreviation':
                        track.shortName = c.innerText;
                        break;
                    case 'midi-instrument':
                        this.parseMidiInstrument(c, track);
                        break;
                }
            }
        }
        if (this.isEmptyTuning(track.staves[0].tuning)) {
            track.staves[0].stringTuning.tunings = [];
        }
    }

    private isEmptyTuning(tuning: number[]): boolean {
        if (!tuning) {
            return true;
        }
        for (let i: number = 0; i < tuning.length; i++) {
            if (tuning[i] !== 0) {
                return false;
            }
        }
        return true;
    }

    private parseMidiInstrument(element: XmlNode, track: Track): void {
        for (let c of element.childNodes) {
            if (c.nodeType === XmlNodeType.Element) {
                switch (c.localName) {
                    case 'midi-channel':
                        track.playbackInfo.primaryChannel = parseInt(c.innerText);
                        break;
                    case 'midi-program':
                        track.playbackInfo.program = parseInt(c.innerText);
                        break;
                    case 'volume':
                        track.playbackInfo.volume = Math.floor((parseInt(c.innerText) / 100) * 16);
                        break;
                    case 'pan':
                        track.playbackInfo.balance = Math.max(0, Math.min(16, Math.floor(((parseInt(c.innerText) + 90) / 180) * 16)));
                        break;
                }
            }
        }
    }
}
