import { GeneralMidi } from '@src/midi/GeneralMidi';

import { ScoreImporter } from '@src/importer/ScoreImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';

import { IOHelper } from '@src/io/IOHelper';
import type { IReadable } from '@src/io/IReadable';
import { AccentuationType } from '@src/model/AccentuationType';
import { Automation, AutomationType } from '@src/model/Automation';
import { Bar, BarLineStyle } from '@src/model/Bar';
import { Beat, BeatBeamingMode } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BrushType } from '@src/model/BrushType';
import { Chord } from '@src/model/Chord';
import { Clef } from '@src/model/Clef';
import { Color } from '@src/model/Color';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import type { Fingers } from '@src/model/Fingers';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import type { KeySignature } from '@src/model/KeySignature';
import type { KeySignatureType } from '@src/model/KeySignatureType';
import { Lyrics } from '@src/model/Lyrics';
import { MasterBar } from '@src/model/MasterBar';
import { Note } from '@src/model/Note';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { PickStroke } from '@src/model/PickStroke';
import { PlaybackInformation } from '@src/model/PlaybackInformation';
import { Score, ScoreSubElement } from '@src/model/Score';
import { Section } from '@src/model/Section';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import type { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { VibratoType } from '@src/model/VibratoType';
import { Voice } from '@src/model/Voice';

import { Logger } from '@src/Logger';
import { ModelUtils } from '@src/model/ModelUtils';
import type { IWriteable } from '@src/io/IWriteable';
import { Tuning } from '@src/model/Tuning';
import { FadeType } from '@src/model/FadeType';
import { Rasgueado } from '@src/model/Rasgueado';
import { Direction } from '@src/model/Direction';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { Ottavia } from '@src/model/Ottavia';
import { WahPedal } from '@src/model/WahPedal';

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
    private _doubleBars: Set<number> = new Set<number>();
    private _keySignatures: Map<number, [KeySignature, KeySignatureType]> = new Map<
        number,
        [KeySignature, KeySignatureType]
    >();
    private _beatTextChunksByTrack: Map<number, string[]> = new Map<number, string[]>();

    private _directionLookup: Map<number, Direction[]> = new Map<number, Direction[]>();

    public get name(): string {
        return 'Guitar Pro 3-5';
    }

    public readScore(): Score {
        this._directionLookup.clear();

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
            this.readDirection(Direction.TargetCoda);
            this.readDirection(Direction.TargetDoubleCoda);
            this.readDirection(Direction.TargetSegno);
            this.readDirection(Direction.TargetSegnoSegno);
            this.readDirection(Direction.TargetFine);

            this.readDirection(Direction.JumpDaCapo);
            this.readDirection(Direction.JumpDaCapoAlCoda);
            this.readDirection(Direction.JumpDaCapoAlDoubleCoda);
            this.readDirection(Direction.JumpDaCapoAlFine);

            this.readDirection(Direction.JumpDalSegno);
            this.readDirection(Direction.JumpDalSegnoAlCoda);
            this.readDirection(Direction.JumpDalSegnoAlDoubleCoda);
            this.readDirection(Direction.JumpDalSegnoAlFine);

            this.readDirection(Direction.JumpDalSegnoSegno);
            this.readDirection(Direction.JumpDalSegnoSegnoAlCoda);
            this.readDirection(Direction.JumpDalSegnoSegnoAlDoubleCoda);
            this.readDirection(Direction.JumpDalSegnoSegnoAlFine);

            this.readDirection(Direction.JumpDaCoda);
            this.readDirection(Direction.JumpDaDoubleCoda);

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
            const automation = Automation.buildTempoAutomation(false, 0, this._score.tempo, 2);
            automation.text = this._score.tempoLabel;
            this._score.masterBars[0].tempoAutomations.push(automation);
        }

        ModelUtils.consolidate(this._score);
        this._score.finish(this.settings);
        if (this._lyrics && this._lyricsTrack >= 0) {
            this._score.tracks[this._lyricsTrack].applyLyrics(this._lyrics);
        }
        return this._score;
    }

    private readDirection(direction: Direction) {
        let directionIndex = IOHelper.readInt16LE(this.data);
        // direction not set
        if (directionIndex === -1) {
            return;
        }

        // indexes are 1-based in file
        directionIndex--;

        let directionsList: Direction[];
        if (this._directionLookup.has(directionIndex)) {
            directionsList = this._directionLookup.get(directionIndex)!;
        } else {
            directionsList = [];
            this._directionLookup.set(directionIndex, directionsList);
        }
        directionsList.push(direction);
    }

    public readVersion(): void {
        let version: string = GpBinaryHelpers.gpReadStringByteLength(this.data, 30, this.settings.importer.encoding);
        if (!version.startsWith(Gp3To5Importer.VersionString)) {
            throw new UnsupportedFormatError('Unsupported format');
        }
        version = version.substr(Gp3To5Importer.VersionString.length + 1);
        const dot: number = version.indexOf(String.fromCharCode(46));
        this._versionNumber = 100 * Number.parseInt(version.substr(0, dot)) + Number.parseInt(version.substr(dot + 1));
        Logger.debug(this.name, `Guitar Pro version ${version} detected`);
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
        const noticeLines: number = IOHelper.readInt32LE(this.data);
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
            const lyrics: Lyrics = new Lyrics();
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
        this.data.skip(28);

        const flags = IOHelper.readInt16LE(this.data);
        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.Title).isVisible =
            (flags & (0x01 << 0)) !== 0;
        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.Title).template =
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);

        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.SubTitle).isVisible =
            (flags & (0x01 << 1)) !== 0;
        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.SubTitle).template =
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);

        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.Artist).isVisible =
            (flags & (0x01 << 2)) !== 0;
        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.Artist).template =
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);

        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.Album).isVisible =
            (flags & (0x01 << 3)) !== 0;
        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.Album).template =
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);

        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.Words).isVisible =
            (flags & (0x01 << 4)) !== 0;
        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.Words).template =
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);

        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.Music).isVisible =
            (flags & (0x01 << 5)) !== 0;
        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.Music).template =
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);

        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.WordsAndMusic).isVisible =
            (flags & (0x01 << 6)) !== 0;
        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.WordsAndMusic).template =
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);

        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.Copyright).isVisible =
            (flags & (0x01 << 7)) !== 0;
        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.Copyright).template =
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);

        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.CopyrightSecondLine).isVisible =
            (flags & (0x01 << 7)) !== 0;
        ModelUtils.getOrCreateHeaderFooterStyle(this._score, ScoreSubElement.CopyrightSecondLine).template =
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
        // page number format
        GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
    }

    public readPlaybackInfos(): void {
        this._playbackInfos = [];
        let channel = 0;
        for (let i: number = 0; i < 64; i++) {
            const info: PlaybackInformation = new PlaybackInformation();
            info.primaryChannel = channel++;
            info.secondaryChannel = channel++;
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
        const newMasterBar: MasterBar = new MasterBar();
        const flags: number = this.data.readByte();
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
        // alternate endings (pre GP5)
        if ((flags & 0x10) !== 0 && this._versionNumber < 500) {
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
            const repeatMask: number = this.data.readByte();
            for (let i: number = 0; i < 8; i++) {
                // only add the repeating if it is not existing
                const repeating: number = 1 << i;
                if (repeatMask > i && (existentAlternatives & repeating) === 0) {
                    repeatAlternative = repeatAlternative | repeating;
                }
            }
            newMasterBar.alternateEndings = repeatAlternative;
        }
        // marker
        if ((flags & 0x20) !== 0) {
            const section: Section = new Section();
            section.text = GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
            section.marker = '';
            GpBinaryHelpers.gpReadColor(this.data, false);
            newMasterBar.section = section;
        }
        // keysignature
        if ((flags & 0x40) !== 0) {
            this._keySignatures.set(this._score.masterBars.length, [
                IOHelper.readSInt8(this.data) as KeySignature,
                this.data.readByte() as KeySignatureType
            ]);
        }
        if (this._versionNumber >= 500 && (flags & 0x03) !== 0) {
            this.data.skip(4);
        }
        // better alternate ending mask in GP5
        if (this._versionNumber >= 500) {
            newMasterBar.alternateEndings = this.data.readByte();
        }
        // tripletfeel
        if (this._versionNumber >= 500) {
            const tripletFeel: number = this.data.readByte();
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
        const isDoubleBar = (flags & 0x80) !== 0;
        newMasterBar.isDoubleBar = isDoubleBar;

        const barIndexForDirection = this._score.masterBars.length;
        if (this._directionLookup.has(barIndexForDirection)) {
            for (const direction of this._directionLookup.get(barIndexForDirection)!) {
                newMasterBar.addDirection(direction);
            }
        }

        this._score.addMasterBar(newMasterBar);

        if (isDoubleBar) {
            this._doubleBars.add(newMasterBar.index);
        }
    }

    public readTracks(): void {
        for (let i: number = 0; i < this._trackCount; i++) {
            this.readTrack();
        }
    }

    public readTrack(): void {
        const newTrack: Track = new Track();
        newTrack.ensureStaveCount(1);
        this._score.addTrack(newTrack);
        const mainStaff: Staff = newTrack.staves[0];

        // Track Flags:
        // 1   - Percussion Track
        // 2   - 12 Stringed Track
        // 4   - Unknown
        // 8   - Is Visible on Multi Track
        // 16  - Unknown
        // 32  - Unknown
        // 64  - Unknown
        // 128 - Show Tuning

        const flags: number = this.data.readByte();
        newTrack.name = GpBinaryHelpers.gpReadStringByteLength(this.data, 40, this.settings.importer.encoding);
        if ((flags & 0x01) !== 0) {
            mainStaff.isPercussion = true;
        }
        if (this._versionNumber >= 500) {
            newTrack.isVisibleOnMultiTrack = (flags & 0x08) !== 0;
        }

        if (this._score.stylesheet.perTrackDisplayTuning === null) {
            this._score.stylesheet.perTrackDisplayTuning = new Map<number, boolean>();
        }
        this._score.stylesheet.perTrackDisplayTuning!.set(newTrack.index, (flags & 0x80) !== 0);

        //
        const stringCount: number = IOHelper.readInt32LE(this.data);
        const tuning: number[] = [];
        for (let i: number = 0; i < 7; i++) {
            const stringTuning: number = IOHelper.readInt32LE(this.data);
            if (stringCount > i) {
                tuning.push(stringTuning);
            }
        }
        mainStaff.stringTuning.tunings = tuning;

        const port: number = IOHelper.readInt32LE(this.data);
        const index: number = IOHelper.readInt32LE(this.data) - 1;
        const effectChannel: number = IOHelper.readInt32LE(this.data) - 1;
        this.data.skip(4); // Fretcount

        if (index >= 0 && index < this._playbackInfos.length) {
            const info: PlaybackInformation = this._playbackInfos[index];
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
            const staveFlags = this.data.readByte();
            mainStaff.showTablature = (staveFlags & 0x01) !== 0;
            mainStaff.showStandardNotation = (staveFlags & 0x02) !== 0;

            const showChordDiagramListOnTopOfScore = (staveFlags & 0x64) !== 0;

            if (this._score.stylesheet.perTrackChordDiagramsOnTop === null) {
                this._score.stylesheet.perTrackChordDiagramsOnTop = new Map<number, boolean>();
            }
            this._score.stylesheet.perTrackChordDiagramsOnTop!.set(newTrack.index, showChordDiagramListOnTopOfScore);

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
        const newBar: Bar = new Bar();
        const mainStaff: Staff = track.staves[0];
        if (mainStaff.isPercussion) {
            newBar.clef = Clef.Neutral;
        }
        mainStaff.addBar(newBar);

        if (this._keySignatures.has(newBar.index)) {
            const newKeySignature = this._keySignatures.get(newBar.index)!;
            newBar.keySignature = newKeySignature[0];
            newBar.keySignatureType = newKeySignature[1];
        } else if (newBar.index > 0) {
            newBar.keySignature = newBar.previousBar!.keySignature;
            newBar.keySignatureType = newBar.previousBar!.keySignatureType;
        }

        if (this._doubleBars.has(newBar.index)) {
            newBar.barLineRight = BarLineStyle.LightLight;
        }

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
        const beatCount: number = IOHelper.readInt32LE(this.data);
        if (beatCount === 0) {
            return;
        }
        const newVoice: Voice = new Voice();
        bar.addVoice(newVoice);
        for (let i: number = 0; i < beatCount; i++) {
            this.readBeat(track, bar, newVoice);
        }
    }

    public readBeat(track: Track, bar: Bar, voice: Voice): void {
        const newBeat: Beat = new Beat();
        const flags: number = this.data.readByte();
        if ((flags & 0x01) !== 0) {
            newBeat.dots = 1;
        }
        if ((flags & 0x40) !== 0) {
            const type: number = this.data.readByte();
            newBeat.isEmpty = (type & 0x02) === 0;
        }
        voice.addBeat(newBeat);
        const duration: number = IOHelper.readSInt8(this.data);
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

        const beatTextAsLyrics = this.settings.importer.beatTextAsLyrics && track.index !== this._lyricsTrack; // detect if not lyrics track

        if ((flags & 0x04) !== 0) {
            const text = GpBinaryHelpers.gpReadStringIntUnused(this.data, this.settings.importer.encoding);
            if (beatTextAsLyrics) {
                const lyrics = new Lyrics();
                lyrics.text = text.trim();
                lyrics.finish(true);

                // push them in reverse order to the store for applying them
                // to the next beats being read
                const beatLyrics: string[] = [];
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
        const stringFlags: number = this.data.readByte();
        for (let i: number = 6; i >= 0; i--) {
            if ((stringFlags & (1 << i)) !== 0 && 6 - i < bar.staff.tuning.length) {
                const note = this.readNote(track, bar, voice, newBeat, 6 - i);
                if (allNoteHarmonicType !== HarmonicType.None) {
                    note.harmonicType = allNoteHarmonicType;
                    if (note.harmonicType === HarmonicType.Natural) {
                        note.harmonicValue = ModelUtils.deltaFretToHarmonicValue(note.fret);
                    }
                }
            }
        }
        if (this._versionNumber >= 500) {
            // not 100% sure about the bits here but they look good in all test files.

            const flags2 = IOHelper.readInt16LE(this.data);

            // beam flags indicate how to handle beams connected to the previous beat,
            // so we have to set the beaming mode on the previous beat!

            // 1 - Break Beams
            if ((flags2 & 0x01) !== 0) {
                if (newBeat.index > 0) {
                    voice.beats[newBeat.index - 1].beamingMode = BeatBeamingMode.ForceSplitToNext;
                }
            }

            // 2 - Force beams down
            // this bit also set if we 'invert' a down-stem, but bit 8 will force the direction to up as both bits are set
            if ((flags2 & 0x02) !== 0) {
                newBeat.preferredBeamDirection = BeamDirection.Down;
            }

            // 4 - Force Beams
            if ((flags2 & 0x04) !== 0) {
                if (newBeat.index > 0) {
                    voice.beats[newBeat.index - 1].beamingMode = BeatBeamingMode.ForceMergeWithNext;
                }
            }

            // 8 - Force beams up
            if ((flags2 & 0x08) !== 0) {
                newBeat.preferredBeamDirection = BeamDirection.Up;
            }

            // 16 - Ottava 8va
            if ((flags2 & 0x10) !== 0) {
                newBeat.ottava = Ottavia._8va;
            }

            // 32 - Ottava 8vb
            if ((flags2 & 0x20) !== 0) {
                newBeat.ottava = Ottavia._8vb;
            }

            // 64 - Ottava 15ma
            if ((flags2 & 0x40) !== 0) {
                newBeat.ottava = Ottavia._15ma;
            }

            // 128 - Unknown, upper bit of first byte, maybe a placeholder.

            // 256 - Ottava 15mb
            if ((flags2 & 0x100) !== 0) {
                newBeat.ottava = Ottavia._15mb;
            }

            // 512 - Unknown
            // 1024 - Unknown

            // 2048 - Break Secondary Beams info set? -> read another byte for flag
            if ((flags2 & 0x800) !== 0) {
                const breakSecondaryBeams = this.data.readByte() !== 0;
                if (newBeat.index > 0 && breakSecondaryBeams) {
                    voice.beats[newBeat.index - 1].beamingMode = BeatBeamingMode.ForceSplitOnSecondaryToNext;
                }
            }

            // 4096 - Unknown
            // 8096 - Force Tuplet Bracket
        }

        if (
            beatTextAsLyrics &&
            !newBeat.isRest &&
            this._beatTextChunksByTrack.has(track.index) &&
            this._beatTextChunksByTrack.get(track.index)!.length > 0
        ) {
            newBeat.lyrics = [this._beatTextChunksByTrack.get(track.index)!.pop()!];
        }
    }

    public readChord(beat: Beat): void {
        const chord: Chord = new Chord();
        const chordId: string = ModelUtils.newGuid();
        if (this._versionNumber >= 500) {
            this.data.skip(17);
            chord.name = GpBinaryHelpers.gpReadStringByteLength(this.data, 21, this.settings.importer.encoding);
            this.data.skip(4);
            chord.firstFret = IOHelper.readInt32LE(this.data);
            for (let i: number = 0; i < 7; i++) {
                const fret: number = IOHelper.readInt32LE(this.data);
                if (i < beat.voice.bar.staff.tuning.length) {
                    chord.strings.push(fret);
                }
            }
            const numberOfBarres: number = this.data.readByte();
            const barreFrets: Uint8Array = new Uint8Array(5);
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
                        const fret: number = IOHelper.readInt32LE(this.data);
                        if (i < beat.voice.bar.staff.tuning.length) {
                            chord.strings.push(fret);
                        }
                    }
                    const numberOfBarres: number = this.data.readByte();
                    const barreFrets: Uint8Array = new Uint8Array(5);
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
                        const fret: number = IOHelper.readInt32LE(this.data);
                        if (i < beat.voice.bar.staff.tuning.length) {
                            chord.strings.push(fret);
                        }
                    }
                    // unknown
                    this.data.skip(36);
                }
            } else {
                const strings: number = this._versionNumber >= 406 ? 7 : 6;
                chord.name = GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
                chord.firstFret = IOHelper.readInt32LE(this.data);
                if (chord.firstFret > 0) {
                    for (let i: number = 0; i < strings; i++) {
                        const fret: number = IOHelper.readInt32LE(this.data);
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
        const flags: number = this.data.readByte();
        let flags2: number = 0;
        if (this._versionNumber >= 400) {
            flags2 = this.data.readByte();
        }
        if ((flags & 0x10) !== 0) {
            beat.fade = FadeType.FadeIn;
        }
        if ((this._versionNumber < 400 && (flags & 0x01) !== 0) || (flags & 0x02) !== 0) {
            beat.vibrato = VibratoType.Slight;
        }
        if ((flags2 & 0x01) !== 0) {
            beat.rasgueado = Rasgueado.Ii;
        }
        if ((flags & 0x20) !== 0 && this._versionNumber >= 400) {
            const slapPop: number = IOHelper.readSInt8(this.data);
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
            const slapPop: number = IOHelper.readSInt8(this.data);
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
            }
            if ((flags & 0x08) !== 0) {
                return HarmonicType.Artificial;
            }
        }

        return HarmonicType.None;
    }

    public readTremoloBarEffect(beat: Beat): void {
        this.data.readByte(); // type

        IOHelper.readInt32LE(this.data); // value

        const pointCount: number = IOHelper.readInt32LE(this.data);
        if (pointCount > 0) {
            for (let i: number = 0; i < pointCount; i++) {
                const point: BendPoint = new BendPoint(0, 0);
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
        const tableChange: MixTableChange = new MixTableChange();
        tableChange.instrument = IOHelper.readSInt8(this.data);
        if (this._versionNumber >= 500) {
            this.data.skip(16); // Rse Info
        }
        tableChange.volume = IOHelper.readSInt8(this.data);
        tableChange.balance = IOHelper.readSInt8(this.data);
        const chorus: number = IOHelper.readSInt8(this.data);
        const reverb: number = IOHelper.readSInt8(this.data);
        const phaser: number = IOHelper.readSInt8(this.data);
        const tremolo: number = IOHelper.readSInt8(this.data);
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
            this.data.readByte(); // mixTableFlags
        }
        if (this._versionNumber >= 500) {
            const wahType = IOHelper.readSInt8(this.data);
            // const showWahWah = (mixTableFlags & 0x80) !== 0;
            // -1 Off (when there is a mixtable but no wah-wah)
            if (wahType >= 100) {
                beat.wahPedal = WahPedal.Closed;
            } else if (wahType >= 0) {
                beat.wahPedal = WahPedal.Open;
            }
        }
        // unknown
        if (this._versionNumber >= 510) {
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
            GpBinaryHelpers.gpReadStringIntByte(this.data, this.settings.importer.encoding);
        }
        if (tableChange.volume >= 0) {
            const volumeAutomation: Automation = new Automation();
            volumeAutomation.isLinear = true;
            volumeAutomation.type = AutomationType.Volume;
            volumeAutomation.value = tableChange.volume;
            beat.automations.push(volumeAutomation);
        }
        if (tableChange.balance >= 0) {
            const balanceAutomation: Automation = new Automation();
            balanceAutomation.isLinear = true;
            balanceAutomation.type = AutomationType.Balance;
            balanceAutomation.value = tableChange.balance;
            beat.automations.push(balanceAutomation);
        }
        if (tableChange.instrument >= 0) {
            const instrumentAutomation: Automation = new Automation();
            instrumentAutomation.isLinear = true;
            instrumentAutomation.type = AutomationType.Instrument;
            instrumentAutomation.value = tableChange.instrument;
            beat.automations.push(instrumentAutomation);
        }
        if (tableChange.tempo >= 0) {
            const tempoAutomation: Automation = new Automation();
            tempoAutomation.isLinear = true;
            tempoAutomation.type = AutomationType.Tempo;
            tempoAutomation.value = tableChange.tempo;
            beat.automations.push(tempoAutomation);
            beat.voice.bar.masterBar.tempoAutomations.push(tempoAutomation);
        }
    }

    public readNote(track: Track, bar: Bar, voice: Voice, beat: Beat, stringIndex: number): Note {
        const newNote: Note = new Note();
        newNote.string = bar.staff.tuning.length - stringIndex;
        const flags: number = this.data.readByte();
        if ((flags & 0x02) !== 0) {
            newNote.accentuated = AccentuationType.Heavy;
        } else if ((flags & 0x40) !== 0) {
            newNote.accentuated = AccentuationType.Normal;
        }
        newNote.isGhost = (flags & 0x04) !== 0;
        if ((flags & 0x20) !== 0) {
            const noteType: number = this.data.readByte();
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
            const dynamicNumber: number = IOHelper.readSInt8(this.data);
            newNote.dynamics = this.toDynamicValue(dynamicNumber);
            beat.dynamics = newNote.dynamics;
        }
        if ((flags & 0x20) !== 0) {
            newNote.fret = IOHelper.readSInt8(this.data);
        }
        if ((flags & 0x80) !== 0) {
            newNote.leftHandFinger = IOHelper.readSInt8(this.data) as Fingers;
            newNote.rightHandFinger = IOHelper.readSInt8(this.data) as Fingers;
        }
        let swapAccidentals = false;
        if (this._versionNumber >= 500) {
            if ((flags & 0x01) !== 0) {
                newNote.durationPercent = IOHelper.readFloat64BE(this.data);
            }
            const flags2: number = this.data.readByte();
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
        const flags: number = this.data.readByte();
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

        const pointCount: number = IOHelper.readInt32LE(this.data);
        if (pointCount > 0) {
            for (let i: number = 0; i < pointCount; i++) {
                const point: BendPoint = new BendPoint(0, 0);
                point.offset = IOHelper.readInt32LE(this.data); // 0...60

                point.value = (IOHelper.readInt32LE(this.data) / Gp3To5Importer.BendStep) | 0; // 0..12 (amount of quarters)

                GpBinaryHelpers.gpReadBool(this.data); // vibrato

                note.addBendPoint(point);
            }
        }
    }

    public readGrace(voice: Voice, note: Note): void {
        const graceBeat: Beat = new Beat();
        const graceNote: Note = new Note();
        graceNote.string = note.string;
        graceNote.fret = IOHelper.readSInt8(this.data);
        graceBeat.duration = Duration.ThirtySecond;
        graceBeat.dynamics = this.toDynamicValue(IOHelper.readSInt8(this.data));
        const transition: number = IOHelper.readSInt8(this.data);
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
            const flags: number = this.data.readByte();
            graceNote.isDead = (flags & 0x01) !== 0;
            graceBeat.graceType = (flags & 0x02) !== 0 ? GraceType.OnBeat : GraceType.BeforeBeat;
        }
        voice.addGraceBeat(graceBeat);
        graceBeat.addNote(graceNote);
    }

    public readTremoloPicking(beat: Beat): void {
        const speed: number = this.data.readByte();
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
            const type: number = IOHelper.readSInt8(this.data);
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
            const type: number = IOHelper.readSInt8(this.data);
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
        const type: number = this.data.readByte();
        if (this._versionNumber >= 500) {
            switch (type) {
                case 1:
                    note.harmonicType = HarmonicType.Natural;
                    note.harmonicValue = ModelUtils.deltaFretToHarmonicValue(note.fret);
                    break;
                case 2:
                    /*let _harmonicTone: number = */ this.data.readByte();
                    /*let _harmonicKey: number =  */ this.data.readByte();
                    /*let _harmonicOctaveOffset: number = */ this.data.readByte();
                    note.harmonicType = HarmonicType.Artificial;
                    break;
                case 3:
                    note.harmonicType = HarmonicType.Tap;
                    note.harmonicValue = ModelUtils.deltaFretToHarmonicValue(this.data.readByte());
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
    public static gpReadColor(data: IReadable, readAlpha: boolean = false): Color {
        const r: number = data.readByte();
        const g: number = data.readByte();
        const b: number = data.readByte();
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
        const length: number = IOHelper.readInt32LE(data) - 1;
        data.readByte();
        return GpBinaryHelpers.gpReadString(data, length, encoding);
    }

    public static gpReadString(data: IReadable, length: number, encoding: string): string {
        const b: Uint8Array = new Uint8Array(length);
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
        const stringLength: number = data.readByte();
        const s: string = GpBinaryHelpers.gpReadString(data, stringLength, encoding);
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
