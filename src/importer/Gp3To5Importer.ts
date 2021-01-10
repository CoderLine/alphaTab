import { GeneralMidi } from '@src/midi/GeneralMidi';

import { ScoreImporter } from '@src/importer/ScoreImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';

import { IOHelper } from '@src/io/IOHelper';
import { IReadable } from '@src/io/IReadable';
import { AccentuationType } from '@src/model/AccentuationType';
import { Automation, AutomationType } from '@src/model/Automation';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BrushType } from '@src/model/BrushType';
import { Chord } from '@src/model/Chord';
import { Clef } from '@src/model/Clef';
import { Color } from '@src/model/Color';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { Fingers } from '@src/model/Fingers';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { KeySignature } from '@src/model/KeySignature';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { Lyrics } from '@src/model/Lyrics';
import { MasterBar } from '@src/model/MasterBar';
import { Note } from '@src/model/Note';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { PickStroke } from '@src/model/PickStroke';
import { PlaybackInformation } from '@src/model/PlaybackInformation';
import { Score } from '@src/model/Score';
import { Section } from '@src/model/Section';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { VibratoType } from '@src/model/VibratoType';
import { Voice } from '@src/model/Voice';

import { Logger } from '@src/Logger';
import { ModelUtils } from '@src/model/ModelUtils';
import { IWriteable } from '@src/io/IWriteable';
import { Tuning } from '@src/model/Tuning';

export class Gp3To5Importer extends ScoreImporter {
    private static readonly VersionString: string = 'FICHIER GUITAR PRO ';
    private _versionNumber: number = 0;
    private _score!: Score;
    private _globalTripletFeel: TripletFeel = TripletFeel.NoTripletFeel;
    private _lyricsTrack: number = 0;
    private _lyrics: Lyrics[] = [];
    private _barCount: number = 0;
    private _trackCount: number = 0;
    private _playbackInfos: PlaybackInformation[] = [];

    private _beatTextChunksByTrack: Map<number, string[]> = new Map<number, string[]>();

    public get name(): string {
        return 'Guitar Pro 3-5';
    }

    public constructor() {
        super();
    }

    public readScore(): Score {
        this.readVersion();
        this._score = new Score();
        // basic song info
        this.readScoreInformation();
        // triplet feel before Gp5
        if (this._versionNumber < 500) {
            this._globalTripletFeel = GpBinaryHelpers.gpReadBool(this.data)
                ? TripletFeel.Triplet8th
                : TripletFeel.NoTripletFeel;
        }
        // beat lyrics
        if (this._versionNumber >= 400) {
            this.readLyrics();
        }
        // rse master settings since GP5.1
        if (this._versionNumber >= 510) {
            // master volume (4)
            // master effect (4)
            // master equalizer (10)
            // master equalizer preset (1)
            this.data.skip(19);
        }
        // page setup since GP5
        if (this._versionNumber >= 500) {
            this.readPageSetup();
            this._score.tempoLabel = GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
        }
        // tempo stuff
        this._score.tempo = IOHelper.readInt32LE(this.data);
        if (this._versionNumber >= 510) {
            GpBinaryHelpers.gpReadBool(this.data); // hide tempo?
        }
        // keysignature and octave
        IOHelper.readInt32LE(this.data);
        if (this._versionNumber >= 400) {
            this.data.readByte();
        }
        this.readPlaybackInfos();
        // repetition stuff
        if (this._versionNumber >= 500) {
            // "Coda" bar index (2)
            // "Double Coda" bar index (2)
            // "Segno" bar index (2)
            // "Segno Segno" bar index (2)
            // "Fine" bar index (2)
            // "Da Capo" bar index (2)
            // "Da Capo al Coda" bar index (2)
            // "Da Capo al Double Coda" bar index (2)
            // "Da Capo al Fine" bar index (2)
            // "Da Segno" bar index (2)
            // "Da Segno al Coda" bar index (2)
            // "Da Segno al Double Coda" bar index (2)
            // "Da Segno al Fine "bar index (2)
            // "Da Segno Segno" bar index (2)
            // "Da Segno Segno al Coda" bar index (2)
            // "Da Segno Segno al Double Coda" bar index (2)
            // "Da Segno Segno al Fine" bar index (2)
            // "Da Coda" bar index (2)
            // "Da Double Coda" bar index (2)
            this.data.skip(38);
            // unknown (4)
            this.data.skip(4);
        }
        // contents
        this._barCount = IOHelper.readInt32LE(this.data);
        this._trackCount = IOHelper.readInt32LE(this.data);
        this.readMasterBars();
        this.readTracks();
        this.readBars();

        // To be more in line with the GP7 structure we create an
        // initial tempo automation on the first masterbar
        if (this._score.masterBars.length > 0) {
            this._score.masterBars[0].tempoAutomation = Automation.buildTempoAutomation(false, 0, this._score.tempo, 2);
            this._score.masterBars[0].tempoAutomation.text = this._score.tempoLabel;
        }

        this._score.finish(this.settings);
        if (this._lyrics && this._lyricsTrack >= 0) {
            this._score.tracks[this._lyricsTrack].applyLyrics(this._lyrics);
        }
        return this._score;
    }

    public readVersion(): void {
        let version: string = GpBinaryHelpers.gpReadStringByteLength(this.data, 30, this.settings.importer.encoding);
        if (!version.startsWith(Gp3To5Importer.VersionString)) {
            throw new UnsupportedFormatError('Unsupported format');
        }
        version = version.substr(Gp3To5Importer.VersionString.length + 1);
        let dot: number = version.indexOf(String.fromCharCode(46));
        this._versionNumber = 100 * parseInt(version.substr(0, dot)) + parseInt(version.substr(dot + 1));
        Logger.debug(this.name, 'Guitar Pro version ' + version + ' detected');
    }

    public readScoreInformation(): void {
        this._score.title = GpBinaryHelpers.gpReadStringIntUnused(this.data, this.settings.importer.encoding);
        this._score.subTitle = GpBinaryHelpers.gpReadStringIntUnused(this.data, this.settings.importer.encoding);
        this._score.artist = GpBinaryHelpers.gpReadStringIntUnused(this.data, this.settings.importer.encoding);
        this._score.album = GpBinaryHelpers.gpReadStringIntUnused(this.data, this.settings.importer.encoding);
        this._score.words = GpBinaryHelpers.gpReadStringIntUnused(this.data, this.settings.importer.encoding);
        this._score.music =
            this._versionNumber >= 500
                ? GpBinaryHelpers.gpReadStringIntUnused(this.data, this.settings.importer.encoding)
                : this._score.words;
        this._score.copyright = GpBinaryHelpers.gpReadStringIntUnused(this.data, this.settings.importer.encoding);
        this._score.tab = GpBinaryHelpers.gpReadStringIntUnused(this.data, this.settings.importer.encoding);
        this._score.instructions = GpBinaryHelpers.gpReadStringIntUnused(this.data, this.settings.importer.encoding);
        let noticeLines: number = IOHelper.readInt32LE(this.data);
        let notice: string = '';
        for (let i: number = 0; i < noticeLines; i++) {
            if (i > 0) {
                notice += '\r\n';
            }
            notice += GpBinaryHelpers.gpReadStringIntUnused(this.data, this.settings.importer.encoding)?.toString();
        }
        this._score.notices = notice;
    }

    public readLyrics(): void {
        this._lyrics = [];
        this._lyricsTrack = IOHelper.readInt32LE(this.data) - 1;
        for (let i: number = 0; i < 5; i++) {
            let lyrics: Lyrics = new Lyrics();
            lyrics.startBar = IOHelper.readInt32LE(this.data) - 1;
            lyrics.text = GpBinaryHelpers.gpReadStringInt(this.data, this.settings.importer.encoding);
            this._lyrics.push(lyrics);
        }
    }

    public readPageSetup(): void {
        // Page Width (4)
        // Page Heigth (4)
        // Padding Left (4)
        // Padding Right (4)
        // Padding Top (4)
        // Padding Bottom (4)
        // Size Proportion(4)
        // Header and Footer display flags (2)
        this.data.skip(30);
        // title format
        // subtitle format
        // artist format
        // album format
        // words format
        // music format
        // words and music format
        // copyright format
        // pagpublic enumber format
        for (let i: number = 0; i < 10; i++) {
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
        }
    }

    public readPlaybackInfos(): void {
        this._playbackInfos = [];
        for (let i: number = 0; i < 64; i++) {
            let info: PlaybackInformation = new PlaybackInformation();
            info.primaryChannel = i;
            info.secondaryChannel = i;
            info.program = IOHelper.readInt32LE(this.data);
            info.volume = this.data.readByte();
            info.balance = this.data.readByte();
            this.data.skip(6);
            this._playbackInfos.push(info);
        }
    }

    public readMasterBars(): void {
        for (let i: number = 0; i < this._barCount; i++) {
            this.readMasterBar();
        }
    }

    public readMasterBar(): void {
        let previousMasterBar: MasterBar | null = null;
        if (this._score.masterBars.length > 0) {
            previousMasterBar = this._score.masterBars[this._score.masterBars.length - 1];
        }
        let newMasterBar: MasterBar = new MasterBar();
        let flags: number = this.data.readByte();
        // time signature
        if ((flags & 0x01) !== 0) {
            newMasterBar.timeSignatureNumerator = this.data.readByte();
        } else if (previousMasterBar) {
            newMasterBar.timeSignatureNumerator = previousMasterBar.timeSignatureNumerator;
        }
        if ((flags & 0x02) !== 0) {
            newMasterBar.timeSignatureDenominator = this.data.readByte();
        } else if (previousMasterBar) {
            newMasterBar.timeSignatureDenominator = previousMasterBar.timeSignatureDenominator;
        }
        // repeatings
        newMasterBar.isRepeatStart = (flags & 0x04) !== 0;
        if ((flags & 0x08) !== 0) {
            newMasterBar.repeatCount = this.data.readByte() + (this._versionNumber >= 500 ? 0 : 1);
        }
        // alternate endings
        if ((flags & 0x10) !== 0) {
            if (this._versionNumber < 500) {
                let currentMasterBar: MasterBar | null = previousMasterBar;
                // get the already existing alternatives to ignore them
                let existentAlternatives: number = 0;
                while (currentMasterBar) {
                    // found another repeat ending?
                    if (currentMasterBar.isRepeatEnd && currentMasterBar !== previousMasterBar) {
                        break;
                    }
                    // found the opening?
                    if (currentMasterBar.isRepeatStart) {
                        break;
                    }
                    existentAlternatives = existentAlternatives | currentMasterBar.alternateEndings;
                    currentMasterBar = currentMasterBar.previousMasterBar;
                }
                // now calculate the alternative for this bar
                let repeatAlternative: number = 0;
                let repeatMask: number = this.data.readByte();
                for (let i: number = 0; i < 8; i++) {
                    // only add the repeating if it is not existing
                    let repeating: number = 1 << i;
                    if (repeatMask > i && (existentAlternatives & repeating) === 0) {
                        repeatAlternative = repeatAlternative | repeating;
                    }
                }
                newMasterBar.alternateEndings = repeatAlternative;
            } else {
                newMasterBar.alternateEndings = this.data.readByte();
            }
        }
        // marker
        if ((flags & 0x20) !== 0) {
            let section: Section = new Section();
            section.text = GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
            section.marker = '';
            GpBinaryHelpers.gpReadColor(this.data, false);
            newMasterBar.section = section;
        }
        // keysignature
        if ((flags & 0x40) !== 0) {
            newMasterBar.keySignature = IOHelper.readSInt8(this.data) as KeySignature;
            newMasterBar.keySignatureType = this.data.readByte() as KeySignatureType;
        } else if (previousMasterBar) {
            newMasterBar.keySignature = previousMasterBar.keySignature;
            newMasterBar.keySignatureType = previousMasterBar.keySignatureType;
        }
        if (this._versionNumber >= 500 && (flags & 0x03) !== 0) {
            this.data.skip(4);
        }
        // better alternate ending mask in GP5
        if (this._versionNumber >= 500 && (flags & 0x10) === 0) {
            newMasterBar.alternateEndings = this.data.readByte();
        }
        // tripletfeel
        if (this._versionNumber >= 500) {
            let tripletFeel: number = this.data.readByte();
            switch (tripletFeel) {
                case 1:
                    newMasterBar.tripletFeel = TripletFeel.Triplet8th;
                    break;
                case 2:
                    newMasterBar.tripletFeel = TripletFeel.Triplet16th;
                    break;
            }
            this.data.readByte();
        } else {
            newMasterBar.tripletFeel = this._globalTripletFeel;
        }
        newMasterBar.isDoubleBar = (flags & 0x80) !== 0;

        this._score.addMasterBar(newMasterBar);
    }

    public readTracks(): void {
        for (let i: number = 0; i < this._trackCount; i++) {
            this.readTrack();
        }
    }

    public readTrack(): void {
        let newTrack: Track = new Track();
        newTrack.ensureStaveCount(1);
        this._score.addTrack(newTrack);
        let mainStaff: Staff = newTrack.staves[0];
        let flags: number = this.data.readByte();
        newTrack.name = GpBinaryHelpers.gpReadStringByteLength(this.data, 40, this.settings.importer.encoding);
        if ((flags & 0x01) !== 0) {
            mainStaff.isPercussion = true;
        }
        let stringCount: number = IOHelper.readInt32LE(this.data);
        let tuning: number[] = [];
        for (let i: number = 0; i < 7; i++) {
            let stringTuning: number = IOHelper.readInt32LE(this.data);
            if (stringCount > i) {
                tuning.push(stringTuning);
            }
        }
        mainStaff.stringTuning.tunings = tuning;

        let port: number = IOHelper.readInt32LE(this.data);
        let index: number = IOHelper.readInt32LE(this.data) - 1;
        let effectChannel: number = IOHelper.readInt32LE(this.data) - 1;
        this.data.skip(4); // Fretcount

        if (index >= 0 && index < this._playbackInfos.length) {
            let info: PlaybackInformation = this._playbackInfos[index];
            info.port = port;
            info.isSolo = (flags & 0x10) !== 0;
            info.isMute = (flags & 0x20) !== 0;
            info.secondaryChannel = effectChannel;
            if (GeneralMidi.isGuitar(info.program)) {
                mainStaff.displayTranspositionPitch = -12;
            }
            newTrack.playbackInfo = info;
        }
        mainStaff.capo = IOHelper.readInt32LE(this.data);
        newTrack.color = GpBinaryHelpers.gpReadColor(this.data, false);
        if (this._versionNumber >= 500) {
            // flags for
            //  0x01 -> show tablature
            //  0x02 -> show standard notation
            this.data.readByte();
            // flags for
            //  0x02 -> auto let ring
            //  0x04 -> auto brush
            this.data.readByte();
            // unknown
            this.data.skip(43);
        }
        // unknown
        if (this._versionNumber >= 510) {
            this.data.skip(4);
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
        }
    }

    public readBars(): void {
        for (let i: number = 0; i < this._barCount; i++) {
            for (let t: number = 0; t < this._trackCount; t++) {
                this.readBar(this._score.tracks[t]);
            }
        }
    }

    public readBar(track: Track): void {
        let newBar: Bar = new Bar();
        let mainStaff: Staff = track.staves[0];
        if (mainStaff.isPercussion) {
            newBar.clef = Clef.Neutral;
        }
        mainStaff.addBar(newBar);
        let voiceCount: number = 1;
        if (this._versionNumber >= 500) {
            this.data.readByte();
            voiceCount = 2;
        }
        for (let v: number = 0; v < voiceCount; v++) {
            this.readVoice(track, newBar);
        }
    }

    public readVoice(track: Track, bar: Bar): void {
        let beatCount: number = IOHelper.readInt32LE(this.data);
        if (beatCount === 0) {
            return;
        }
        let newVoice: Voice = new Voice();
        bar.addVoice(newVoice);
        for (let i: number = 0; i < beatCount; i++) {
            this.readBeat(track, bar, newVoice);
        }
    }

    public readBeat(track: Track, bar: Bar, voice: Voice): void {
        let newBeat: Beat = new Beat();
        let flags: number = this.data.readByte();
        if ((flags & 0x01) !== 0) {
            newBeat.dots = 1;
        }
        if ((flags & 0x40) !== 0) {
            let type: number = this.data.readByte();
            newBeat.isEmpty = (type & 0x02) === 0;
        }
        voice.addBeat(newBeat);
        let duration: number = IOHelper.readSInt8(this.data);
        switch (duration) {
            case -2:
                newBeat.duration = Duration.Whole;
                break;
            case -1:
                newBeat.duration = Duration.Half;
                break;
            case 0:
                newBeat.duration = Duration.Quarter;
                break;
            case 1:
                newBeat.duration = Duration.Eighth;
                break;
            case 2:
                newBeat.duration = Duration.Sixteenth;
                break;
            case 3:
                newBeat.duration = Duration.ThirtySecond;
                break;
            case 4:
                newBeat.duration = Duration.SixtyFourth;
                break;
            default:
                newBeat.duration = Duration.Quarter;
                break;
        }
        if ((flags & 0x20) !== 0) {
            newBeat.tupletNumerator = IOHelper.readInt32LE(this.data);
            switch (newBeat.tupletNumerator) {
                case 1:
                    newBeat.tupletDenominator = 1;
                    break;
                case 3:
                    newBeat.tupletDenominator = 2;
                    break;
                case 5:
                case 6:
                case 7:
                    newBeat.tupletDenominator = 4;
                    break;
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                    newBeat.tupletDenominator = 8;
                    break;
                case 2:
                case 4:
                case 8:
                    break;
                default:
                    newBeat.tupletNumerator = 1;
                    newBeat.tupletDenominator = 1;
                    break;
            }
        }
        if ((flags & 0x02) !== 0) {
            this.readChord(newBeat);
        }

        let beatTextAsLyrics = this.settings.importer.beatTextAsLyrics
            && track.index !== this._lyricsTrack; // detect if not lyrics track

        if ((flags & 0x04) !== 0) {
            const text = GpBinaryHelpers.gpReadStringIntUnused(this.data, this.settings.importer.encoding);
            if (beatTextAsLyrics) {

                const lyrics = new Lyrics();
                lyrics.text = text.trim();
                lyrics.finish(true);

                // push them in reverse order to the store for applying them 
                // to the next beats being read 
                const beatLyrics:string[] = [];
                for (let i = lyrics.chunks.length - 1; i >= 0; i--) {
                    beatLyrics.push(lyrics.chunks[i]);
                }
                this._beatTextChunksByTrack.set(track.index, beatLyrics);

            } else {
                newBeat.text = text;
            }
        }


        let allNoteHarmonicType = HarmonicType.None;
        if ((flags & 0x08) !== 0) {
            allNoteHarmonicType = this.readBeatEffects(newBeat);
        }
        if ((flags & 0x10) !== 0) {
            this.readMixTableChange(newBeat);
        }
        let stringFlags: number = this.data.readByte();
        for (let i: number = 6; i >= 0; i--) {
            if ((stringFlags & (1 << i)) !== 0 && 6 - i < bar.staff.tuning.length) {
                const note = this.readNote(track, bar, voice, newBeat, 6 - i);
                if (allNoteHarmonicType !== HarmonicType.None) {
                    note.harmonicType = allNoteHarmonicType;
                    if (note.harmonicType === HarmonicType.Natural) {
                        note.harmonicValue = this.deltaFretToHarmonicValue(note.fret);
                    }
                }
            }
        }
        if (this._versionNumber >= 500) {
            this.data.readByte();
            let flag: number = this.data.readByte();
            if ((flag & 0x08) !== 0) {
                this.data.readByte();
            }
        }

        if (beatTextAsLyrics && !newBeat.isRest && 
            this._beatTextChunksByTrack.has(track.index) &&
            this._beatTextChunksByTrack.get(track.index)!.length > 0) {
            newBeat.lyrics = [this._beatTextChunksByTrack.get(track.index)!.pop()!];
        }
    }

    public readChord(beat: Beat): void {
        let chord: Chord = new Chord();
        let chordId: string = ModelUtils.newGuid();
        if (this._versionNumber >= 500) {
            this.data.skip(17);
            chord.name = GpBinaryHelpers.gpReadStringByteLength(this.data, 21, this.settings.importer.encoding);
            this.data.skip(4);
            chord.firstFret = IOHelper.readInt32LE(this.data);
            for (let i: number = 0; i < 7; i++) {
                let fret: number = IOHelper.readInt32LE(this.data);
                if (i < beat.voice.bar.staff.tuning.length) {
                    chord.strings.push(fret);
                }
            }
            let numberOfBarres: number = this.data.readByte();
            let barreFrets: Uint8Array = new Uint8Array(5);
            this.data.read(barreFrets, 0, barreFrets.length);
            for (let i: number = 0; i < numberOfBarres; i++) {
                chord.barreFrets.push(barreFrets[i]);
            }
            this.data.skip(26);
        } else {
            if (this.data.readByte() !== 0) {
                // gp4
                if (this._versionNumber >= 400) {
                    // Sharp (1)
                    // Unused (3)
                    // Root (1)
                    // Major/Minor (1)
                    // Nin,Eleven or Thirteen (1)
                    // Bass (4)
                    // Diminished/Augmented (4)
                    // Add (1)
                    this.data.skip(16);
                    chord.name = GpBinaryHelpers.gpReadStringByteLength(this.data, 21, this.settings.importer.encoding);
                    // Unused (2)
                    // Fifth (1)
                    // Ninth (1)
                    // Eleventh (1)
                    this.data.skip(4);
                    chord.firstFret = IOHelper.readInt32LE(this.data);
                    for (let i: number = 0; i < 7; i++) {
                        let fret: number = IOHelper.readInt32LE(this.data);
                        if (i < beat.voice.bar.staff.tuning.length) {
                            chord.strings.push(fret);
                        }
                    }
                    let numberOfBarres: number = this.data.readByte();
                    let barreFrets: Uint8Array = new Uint8Array(5);
                    this.data.read(barreFrets, 0, barreFrets.length);
                    for (let i: number = 0; i < numberOfBarres; i++) {
                        chord.barreFrets.push(barreFrets[i]);
                    }
                    // Barree end (5)
                    // Omission1,3,5,7,9,11,13 (7)
                    // Unused (1)
                    // Fingering (7)
                    // Show Diagram Fingering (1)
                    // ??
                    this.data.skip(26);
                } else {
                    // unknown
                    this.data.skip(25);
                    chord.name = GpBinaryHelpers.gpReadStringByteLength(this.data, 34, this.settings.importer.encoding);
                    chord.firstFret = IOHelper.readInt32LE(this.data);
                    for (let i: number = 0; i < 6; i++) {
                        let fret: number = IOHelper.readInt32LE(this.data);
                        if (i < beat.voice.bar.staff.tuning.length) {
                            chord.strings.push(fret);
                        }
                    }
                    // unknown
                    this.data.skip(36);
                }
            } else {
                let strings: number = this._versionNumber >= 406 ? 7 : 6;
                chord.name = GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
                chord.firstFret = IOHelper.readInt32LE(this.data);
                if (chord.firstFret > 0) {
                    for (let i: number = 0; i < strings; i++) {
                        let fret: number = IOHelper.readInt32LE(this.data);
                        if (i < beat.voice.bar.staff.tuning.length) {
                            chord.strings.push(fret);
                        }
                    }
                }
            }
        }
        if (chord.name) {
            beat.chordId = chordId;
            beat.voice.bar.staff.addChord(beat.chordId, chord);
        }
    }

    public readBeatEffects(beat: Beat): HarmonicType {
        let flags: number = this.data.readByte();
        let flags2: number = 0;
        if (this._versionNumber >= 400) {
            flags2 = this.data.readByte();
        }
        beat.fadeIn = (flags & 0x10) !== 0;
        if ((this._versionNumber < 400 && (flags & 0x01) !== 0) || (flags & 0x02) !== 0) {
            beat.vibrato = VibratoType.Slight;
        }
        beat.hasRasgueado = (flags2 & 0x01) !== 0;
        if ((flags & 0x20) !== 0 && this._versionNumber >= 400) {
            let slapPop: number = IOHelper.readSInt8(this.data);
            switch (slapPop) {
                case 1:
                    beat.tap = true;
                    break;
                case 2:
                    beat.slap = true;
                    break;
                case 3:
                    beat.pop = true;
                    break;
            }
        } else if ((flags & 0x20) !== 0) {
            let slapPop: number = IOHelper.readSInt8(this.data);
            switch (slapPop) {
                case 1:
                    beat.tap = true;
                    break;
                case 2:
                    beat.slap = true;
                    break;
                case 3:
                    beat.pop = true;
                    break;
            }
            this.data.skip(4);
        }
        if ((flags2 & 0x04) !== 0) {
            this.readTremoloBarEffect(beat);
        }
        if ((flags & 0x40) !== 0) {
            let strokeUp: number = 0;
            let strokeDown: number = 0;
            if (this._versionNumber < 500) {
                strokeDown = this.data.readByte();
                strokeUp = this.data.readByte();
            } else {
                strokeUp = this.data.readByte();
                strokeDown = this.data.readByte();
            }
            if (strokeUp > 0) {
                beat.brushType = BrushType.BrushUp;
                beat.brushDuration = Gp3To5Importer.toStrokeValue(strokeUp);
            } else if (strokeDown > 0) {
                beat.brushType = BrushType.BrushDown;
                beat.brushDuration = Gp3To5Importer.toStrokeValue(strokeDown);
            }
        }
        if ((flags2 & 0x02) !== 0) {
            switch (IOHelper.readSInt8(this.data)) {
                case 0:
                    beat.pickStroke = PickStroke.None;
                    break;
                case 1:
                    beat.pickStroke = PickStroke.Up;
                    break;
                case 2:
                    beat.pickStroke = PickStroke.Down;
                    break;
            }
        }

        if (this._versionNumber < 400) {
            if ((flags & 0x04) !== 0) {
                return HarmonicType.Natural;
            } else if ((flags & 0x08) !== 0) {
                return HarmonicType.Artificial;
            }
        }

        return HarmonicType.None;
    }

    public readTremoloBarEffect(beat: Beat): void {
        this.data.readByte(); // type

        IOHelper.readInt32LE(this.data); // value

        let pointCount: number = IOHelper.readInt32LE(this.data);
        if (pointCount > 0) {
            for (let i: number = 0; i < pointCount; i++) {
                let point: BendPoint = new BendPoint(0, 0);
                point.offset = IOHelper.readInt32LE(this.data); // 0...60

                point.value = (IOHelper.readInt32LE(this.data) / Gp3To5Importer.BendStep) | 0; // 0..12 (amount of quarters)

                GpBinaryHelpers.gpReadBool(this.data); // vibrato

                beat.addWhammyBarPoint(point);
            }
        }
    }

    private static toStrokeValue(value: number): number {
        switch (value) {
            case 1:
                return 30;
            case 2:
                return 30;
            case 3:
                return 60;
            case 4:
                return 120;
            case 5:
                return 240;
            case 6:
                return 480;
            default:
                return 0;
        }
    }

    public readMixTableChange(beat: Beat): void {
        let tableChange: MixTableChange = new MixTableChange();
        tableChange.instrument = IOHelper.readSInt8(this.data);
        if (this._versionNumber >= 500) {
            this.data.skip(16); // Rse Info
        }
        tableChange.volume = IOHelper.readSInt8(this.data);
        tableChange.balance = IOHelper.readSInt8(this.data);
        let chorus: number = IOHelper.readSInt8(this.data);
        let reverb: number = IOHelper.readSInt8(this.data);
        let phaser: number = IOHelper.readSInt8(this.data);
        let tremolo: number = IOHelper.readSInt8(this.data);
        if (this._versionNumber >= 500) {
            tableChange.tempoName = GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
        }
        tableChange.tempo = IOHelper.readInt32LE(this.data);
        // durations
        if (tableChange.volume >= 0) {
            this.data.readByte();
        }
        if (tableChange.balance >= 0) {
            this.data.readByte();
        }
        if (chorus >= 0) {
            this.data.readByte();
        }
        if (reverb >= 0) {
            this.data.readByte();
        }
        if (phaser >= 0) {
            this.data.readByte();
        }
        if (tremolo >= 0) {
            this.data.readByte();
        }
        if (tableChange.tempo >= 0) {
            tableChange.duration = IOHelper.readSInt8(this.data);
            if (this._versionNumber >= 510) {
                this.data.readByte(); // hideTempo (bool)
            }
        }
        if (this._versionNumber >= 400) {
            this.data.readByte(); // all tracks flag
        }
        // unknown
        if (this._versionNumber >= 500) {
            this.data.readByte();
        }
        // unknown
        if (this._versionNumber >= 510) {
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
        }
        if (tableChange.volume >= 0) {
            let volumeAutomation: Automation = new Automation();
            volumeAutomation.isLinear = true;
            volumeAutomation.type = AutomationType.Volume;
            volumeAutomation.value = tableChange.volume;
            beat.automations.push(volumeAutomation);
        }
        if (tableChange.balance >= 0) {
            let balanceAutomation: Automation = new Automation();
            balanceAutomation.isLinear = true;
            balanceAutomation.type = AutomationType.Balance;
            balanceAutomation.value = tableChange.balance;
            beat.automations.push(balanceAutomation);
        }
        if (tableChange.instrument >= 0) {
            let instrumentAutomation: Automation = new Automation();
            instrumentAutomation.isLinear = true;
            instrumentAutomation.type = AutomationType.Instrument;
            instrumentAutomation.value = tableChange.instrument;
            beat.automations.push(instrumentAutomation);
        }
        if (tableChange.tempo >= 0) {
            let tempoAutomation: Automation = new Automation();
            tempoAutomation.isLinear = true;
            tempoAutomation.type = AutomationType.Tempo;
            tempoAutomation.value = tableChange.tempo;
            beat.automations.push(tempoAutomation);
            beat.voice.bar.masterBar.tempoAutomation = tempoAutomation;
        }
    }

    public readNote(track: Track, bar: Bar, voice: Voice, beat: Beat, stringIndex: number): Note {
        let newNote: Note = new Note();
        newNote.string = bar.staff.tuning.length - stringIndex;
        let flags: number = this.data.readByte();
        if ((flags & 0x02) !== 0) {
            newNote.accentuated = AccentuationType.Heavy;
        } else if ((flags & 0x40) !== 0) {
            newNote.accentuated = AccentuationType.Normal;
        }
        newNote.isGhost = (flags & 0x04) !== 0;
        if ((flags & 0x20) !== 0) {
            let noteType: number = this.data.readByte();
            if (noteType === 3) {
                newNote.isDead = true;
            } else if (noteType === 2) {
                newNote.isTieDestination = true;
            }
        }
        if ((flags & 0x01) !== 0 && this._versionNumber < 500) {
            this.data.readByte(); // duration

            this.data.readByte(); // tuplet
        }
        if ((flags & 0x10) !== 0) {
            let dynamicNumber: number = IOHelper.readSInt8(this.data);
            newNote.dynamics = this.toDynamicValue(dynamicNumber);
            beat.dynamics = newNote.dynamics;
        }
        if ((flags & 0x20) !== 0) {
            newNote.fret = IOHelper.readSInt8(this.data);
        }
        if ((flags & 0x80) !== 0) {
            newNote.leftHandFinger = IOHelper.readSInt8(this.data) as Fingers;
            newNote.rightHandFinger = IOHelper.readSInt8(this.data) as Fingers;
            newNote.isFingering = true;
        }
        let swapAccidentals = false;
        if (this._versionNumber >= 500) {
            if ((flags & 0x01) !== 0) {
                newNote.durationPercent = GpBinaryHelpers.gpReadDouble(this.data);
            }
            let flags2: number = this.data.readByte();
            swapAccidentals = (flags2 & 0x02) !== 0;
        }
        beat.addNote(newNote);
        if ((flags & 0x08) !== 0) {
            this.readNoteEffects(track, voice, beat, newNote);
        }

        if (bar.staff.isPercussion) {
            newNote.percussionArticulation = newNote.fret;
            newNote.string = -1;
            newNote.fret = -1;
        }
        if (swapAccidentals) {
            const accidental = Tuning.defaultAccidentals[newNote.realValueWithoutHarmonic % 12];
            if (accidental === '#') {
                newNote.accidentalMode = NoteAccidentalMode.ForceFlat;
            } else if (accidental === 'b') {
                newNote.accidentalMode = NoteAccidentalMode.ForceSharp;
            }
            // Note: forcing no sign to sharp not supported
        }
        return newNote;
    }

    public toDynamicValue(value: number): DynamicValue {
        switch (value) {
            case 1:
                return DynamicValue.PPP;
            case 2:
                return DynamicValue.PP;
            case 3:
                return DynamicValue.P;
            case 4:
                return DynamicValue.MP;
            case 5:
                return DynamicValue.MF;
            case 6:
                return DynamicValue.F;
            case 7:
                return DynamicValue.FF;
            case 8:
                return DynamicValue.FFF;
            default:
                return DynamicValue.F;
        }
    }

    public readNoteEffects(track: Track, voice: Voice, beat: Beat, note: Note): void {
        let flags: number = this.data.readByte();
        let flags2: number = 0;
        if (this._versionNumber >= 400) {
            flags2 = this.data.readByte();
        }
        if ((flags & 0x01) !== 0) {
            this.readBend(note);
        }
        if ((flags & 0x10) !== 0) {
            this.readGrace(voice, note);
        }
        if ((flags2 & 0x04) !== 0) {
            this.readTremoloPicking(beat);
        }
        if ((flags2 & 0x08) !== 0) {
            this.readSlide(note);
        } else if (this._versionNumber < 400) {
            if ((flags & 0x04) !== 0) {
                note.slideOutType = SlideOutType.Shift;
            }
        }
        if ((flags2 & 0x10) !== 0) {
            this.readArtificialHarmonic(note);
        }
        if ((flags2 & 0x20) !== 0) {
            this.readTrill(note);
        }
        note.isLetRing = (flags & 0x08) !== 0;
        note.isHammerPullOrigin = (flags & 0x02) !== 0;
        if ((flags2 & 0x40) !== 0) {
            note.vibrato = VibratoType.Slight;
        }
        note.isPalmMute = (flags2 & 0x02) !== 0;
        note.isStaccato = (flags2 & 0x01) !== 0;
    }

    private static readonly BendStep: number = 25;

    public readBend(note: Note): void {
        this.data.readByte(); // type

        IOHelper.readInt32LE(this.data); // value

        let pointCount: number = IOHelper.readInt32LE(this.data);
        if (pointCount > 0) {
            for (let i: number = 0; i < pointCount; i++) {
                let point: BendPoint = new BendPoint(0, 0);
                point.offset = IOHelper.readInt32LE(this.data); // 0...60

                point.value = (IOHelper.readInt32LE(this.data) / Gp3To5Importer.BendStep) | 0; // 0..12 (amount of quarters)

                GpBinaryHelpers.gpReadBool(this.data); // vibrato

                note.addBendPoint(point);
            }
        }
    }

    public readGrace(voice: Voice, note: Note): void {
        let graceBeat: Beat = new Beat();
        let graceNote: Note = new Note();
        graceNote.string = note.string;
        graceNote.fret = IOHelper.readSInt8(this.data);
        graceBeat.duration = Duration.ThirtySecond;
        graceBeat.dynamics = this.toDynamicValue(IOHelper.readSInt8(this.data));
        let transition: number = IOHelper.readSInt8(this.data);
        switch (transition) {
            case 0:
                break;
            case 1:
                graceNote.slideOutType = SlideOutType.Legato;
                graceNote.slideTarget = note;
                break;
            case 2:
                break;
            case 3:
                graceNote.isHammerPullOrigin = true;
                break;
        }
        graceNote.dynamics = graceBeat.dynamics;
        this.data.skip(1); // duration

        if (this._versionNumber < 500) {
            graceBeat.graceType = GraceType.BeforeBeat;
        } else {
            let flags: number = this.data.readByte();
            graceNote.isDead = (flags & 0x01) !== 0;
            graceBeat.graceType = (flags & 0x02) !== 0 ? GraceType.OnBeat : GraceType.BeforeBeat;
        }
        voice.addGraceBeat(graceBeat);
        graceBeat.addNote(graceNote);
    }

    public readTremoloPicking(beat: Beat): void {
        let speed: number = this.data.readByte();
        switch (speed) {
            case 1:
                beat.tremoloSpeed = Duration.Eighth;
                break;
            case 2:
                beat.tremoloSpeed = Duration.Sixteenth;
                break;
            case 3:
                beat.tremoloSpeed = Duration.ThirtySecond;
                break;
        }
    }

    public readSlide(note: Note): void {
        if (this._versionNumber >= 500) {
            let type: number = IOHelper.readSInt8(this.data);
            if ((type & 1) !== 0) {
                note.slideOutType = SlideOutType.Shift;
            } else if ((type & 2) !== 0) {
                note.slideOutType = SlideOutType.Legato;
            } else if ((type & 4) !== 0) {
                note.slideOutType = SlideOutType.OutDown;
            } else if ((type & 8) !== 0) {
                note.slideOutType = SlideOutType.OutUp;
            }
            if ((type & 16) !== 0) {
                note.slideInType = SlideInType.IntoFromBelow;
            } else if ((type & 32) !== 0) {
                note.slideInType = SlideInType.IntoFromAbove;
            }
        } else {
            let type: number = IOHelper.readSInt8(this.data);
            switch (type) {
                case 1:
                    note.slideOutType = SlideOutType.Shift;
                    break;
                case 2:
                    note.slideOutType = SlideOutType.Legato;
                    break;
                case 3:
                    note.slideOutType = SlideOutType.OutDown;
                    break;
                case 4:
                    note.slideOutType = SlideOutType.OutUp;
                    break;
                case -1:
                    note.slideInType = SlideInType.IntoFromBelow;
                    break;
                case -2:
                    note.slideInType = SlideInType.IntoFromAbove;
                    break;
            }
        }
    }

    public readArtificialHarmonic(note: Note): void {
        let type: number = this.data.readByte();
        if (this._versionNumber >= 500) {
            switch (type) {
                case 1:
                    note.harmonicType = HarmonicType.Natural;
                    note.harmonicValue = this.deltaFretToHarmonicValue(note.fret);
                    break;
                case 2:
                    /*let _harmonicTone: number = */ this.data.readByte();
                    /*let _harmonicKey: number =  */ this.data.readByte();
                    /*let _harmonicOctaveOffset: number = */ this.data.readByte();
                    note.harmonicType = HarmonicType.Artificial;
                    break;
                case 3:
                    note.harmonicType = HarmonicType.Tap;
                    note.harmonicValue = this.deltaFretToHarmonicValue(this.data.readByte());
                    break;
                case 4:
                    note.harmonicType = HarmonicType.Pinch;
                    note.harmonicValue = 12;
                    break;
                case 5:
                    note.harmonicType = HarmonicType.Semi;
                    note.harmonicValue = 12;
                    break;
            }
        } else if (this._versionNumber >= 400) {
            switch (type) {
                case 1:
                    note.harmonicType = HarmonicType.Natural;
                    break;
                case 3:
                    note.harmonicType = HarmonicType.Tap;
                    break;
                case 4:
                    note.harmonicType = HarmonicType.Pinch;
                    break;
                case 5:
                    note.harmonicType = HarmonicType.Semi;
                    break;
                case 15:
                    note.harmonicType = HarmonicType.Artificial;
                    break;
                case 17:
                    note.harmonicType = HarmonicType.Artificial;
                    break;
                case 22:
                    note.harmonicType = HarmonicType.Artificial;
                    break;
            }
        }
    }

    public deltaFretToHarmonicValue(deltaFret: number): number {
        switch (deltaFret) {
            case 2:
                return 2.4;
            case 3:
                return 3.2;
            case 4:
            case 5:
            case 7:
            case 9:
            case 12:
            case 16:
            case 17:
            case 19:
            case 24:
                return deltaFret;
            case 8:
                return 8.2;
            case 10:
                return 9.6;
            case 14:
            case 15:
                return 14.7;
            case 21:
            case 22:
                return 21.7;
            default:
                return 12;
        }
    }

    public readTrill(note: Note): void {
        note.trillValue = this.data.readByte() + note.stringTuning;
        switch (this.data.readByte()) {
            case 1:
                note.trillSpeed = Duration.Sixteenth;
                break;
            case 2:
                note.trillSpeed = Duration.ThirtySecond;
                break;
            case 3:
                note.trillSpeed = Duration.SixtyFourth;
                break;
        }
    }
}

export class GpBinaryHelpers {
    public static gpReadDouble(data: IReadable): number {
        let bytes: Uint8Array = new Uint8Array(8);
        data.read(bytes, 0, bytes.length);

        let array: Float64Array = new Float64Array(bytes.buffer);
        return array[0];
    }

    public static gpReadFloat(data: IReadable): number {
        let bytes: Uint8Array = new Uint8Array(4);
        bytes[3] = data.readByte();
        bytes[2] = data.readByte();
        bytes[2] = data.readByte();
        bytes[1] = data.readByte();

        let array: Float32Array = new Float32Array(bytes.buffer);
        return array[0];
    }

    public static gpReadColor(data: IReadable, readAlpha: boolean = false): Color {
        let r: number = data.readByte();
        let g: number = data.readByte();
        let b: number = data.readByte();
        let a: number = 255;
        if (readAlpha) {
            a = data.readByte();
        } else {
            data.skip(1);
        }
        return new Color(r, g, b, a);
    }

    public static gpReadBool(data: IReadable): boolean {
        return data.readByte() !== 0;
    }

    /**
     * Skips an integer (4byte) and reads a string using
     * a bytesize
     */
    public static gpReadStringIntUnused(data: IReadable, encoding: string): string {
        data.skip(4);
        return GpBinaryHelpers.gpReadString(data, data.readByte(), encoding);
    }

    /**
     * Reads an integer as size, and then the string itself
     */
    public static gpReadStringInt(data: IReadable, encoding: string): string {
        return GpBinaryHelpers.gpReadString(data, IOHelper.readInt32LE(data), encoding);
    }

    /**
     * Reads an integer as size, skips a byte and reads the string itself
     */
    public static gpReadStringIntByte(data: IReadable, encoding: string): string {
        let length: number = IOHelper.readInt32LE(data) - 1;
        data.readByte();
        return GpBinaryHelpers.gpReadString(data, length, encoding);
    }

    public static gpReadString(data: IReadable, length: number, encoding: string): string {
        let b: Uint8Array = new Uint8Array(length);
        data.read(b, 0, b.length);
        return IOHelper.toString(b, encoding);
    }

    public static gpWriteString(data: IWriteable, s: string): void {
        const encoded = IOHelper.stringToBytes(s);
        data.writeByte(s.length);
        data.write(encoded, 0, encoded.length);
    }

    /**
     * Reads a byte as size and the string itself.
     * Additionally it is ensured the specified amount of bytes is read.
     * @param data the data to read from.
     * @param length the amount of bytes to read
     * @param encoding The encoding to use to decode the byte into a string
     * @returns
     */
    public static gpReadStringByteLength(data: IReadable, length: number, encoding: string): string {
        let stringLength: number = data.readByte();
        let s: string = GpBinaryHelpers.gpReadString(data, stringLength, encoding);
        if (stringLength < length) {
            data.skip(length - stringLength);
        }
        return s;
    }
}

/**
 * A mixtablechange describes several track changes.
 */
class MixTableChange {
    public volume: number = -1;
    public balance: number = -1;
    public instrument: number = -1;
    public tempoName: string = '';
    public tempo: number = -1;
    public duration: number = -1;
}
