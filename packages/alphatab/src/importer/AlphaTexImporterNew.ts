import { BeatCloner } from '@src/generated/model/BeatCloner';
import {
    type AlphaTexBarNode,
    type AlphaTexBeatDurationChangeNode,
    type AlphaTexBeatNode,
    type AlphaTexMetaDataNode,
    AlphaTexNodeType,
    type AlphaTexNoteNode,
    type AlphaTexNumberLiteral,
    type AlphaTexPropertiesNode,
    type AlphaTexScoreNode, 
    type AlphaTexTextNode
} from '@src/importer/AlphaTexAst';
import { AlphaTexError } from '@src/importer/AlphaTexImporterOld';
import {
    AlphaTex1LanguageHandler,
    ApplyNodeResult,
    type IAlphaTexImporter,
    type IAlphaTexLanguageHandler
} from '@src/importer/AlphaTexLanguageHandler';
import { AlphaTexParser } from '@src/importer/AlphaTexParser';
import {
    AlphaTexAccidentalMode,
    AlphaTexDiagnosticCode,
    type AlphaTexDiagnostics, 
    AlphaTexDiagnosticsSeverity
} from '@src/importer/AlphaTexShared';
import { ScoreImporter } from '@src/importer/ScoreImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { IOHelper } from '@src/io/IOHelper';
import type { FlatSyncPoint } from '@src/model/Automation';
import { Bar, type SustainPedalMarker } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import type { Lyrics } from '@src/model/Lyrics';
import { ModelUtils } from '@src/model/ModelUtils';
import { Note } from '@src/model/Note';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { PercussionMapper } from '@src/model/PercussionMapper';
import { Score } from '@src/model/Score';
import type { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { Tuning } from '@src/model/Tuning';
import { Voice } from '@src/model/Voice';
import type { Settings } from '@src/Settings';

export class AlphaTexImporter extends ScoreImporter implements IAlphaTexImporter {
    private _parser!: AlphaTexParser;
    private _handler: IAlphaTexLanguageHandler = AlphaTex1LanguageHandler.instance;

    private readonly _initialBarMetaData: AlphaTexMetaDataNode[] = [];
    private _diagnostics: AlphaTexDiagnostics[] = [];

    private _trackChannel: number = 0;
    private _score!: Score;
    private _currentTrack!: Track;
    private _currentStaff!: Staff;
    private _barIndex: number = 0;
    private _voiceIndex: number = 0;
    private _ignoredInitialVoice = false;
    private _currentDuration = Duration.Quarter;
    private _articulationValueToIndex = new Map<number, number>();

    public readonly percussionArticulationNames = new Map<string, number>();

    public readonly slurs = new Map<string, Note>();
    public readonly lyrics = new Map<number, Lyrics[]>();
    public readonly sustainPedalToBeat = new Map<SustainPedalMarker, Beat>();
    public readonly staffTuningApplied = new Set<Staff>();
    public readonly staffHasExplicitTuning = new Set<Staff>();
    public readonly staffHasExplicitDisplayTransposition = new Set<Staff>();
    public readonly staffDisplayTranspositionApplied = new Set<Staff>();
    public currentDynamics = DynamicValue.F;
    public accidentalMode = AlphaTexAccidentalMode.Explicit;
    public currentTupletNumerator = -1;
    public currentTupletDenominator = -1;

    private _syncPoints: FlatSyncPoint[] = [];

    public addSemanticDiagnostic(diagnostic: AlphaTexDiagnostics) {
        this._diagnostics.push(diagnostic);
    }

    public get name(): string {
        return 'AlphaTex';
    }

    public get lexerDiagnostics() {
        return this._parser.lexerDiagnostics;
    }

    public get parserDiagnostics() {
        return this._parser.parserDiagnostics;
    }

    public get semanticDiagnostics() {
        return this._diagnostics;
    }

    public initFromString(tex: string, settings: Settings) {
        this.data = ByteBuffer.empty();
        this._parser = new AlphaTexParser(tex);
        this.settings = settings;
        // when beginning reading a new score we reset the IDs.
        Score.resetIds();
    }

    public readScore(): Score {
        try {
            if (this.data.length > 0) {
                this._parser = new AlphaTexParser(
                    IOHelper.toString(this.data.readAll(), this.settings.importer.encoding)
                );
            }

            this.createDefaultScore();
            this.parseAndTranslate();

            ModelUtils.consolidate(this._score);
            this._score.finish(this.settings);
            ModelUtils.trimEmptyBarsAtEnd(this._score);
            this._score.rebuildRepeatGroups();
            this._score.applyFlatSyncPoints(this._syncPoints);
            for (const [track, lyrics] of this.lyrics) {
                this._score.tracks[track].applyLyrics(lyrics);
            }
            for (const [sustainPedal, beat] of this.sustainPedalToBeat) {
                const duration = beat.voice.bar.masterBar.calculateDuration();
                sustainPedal.ratioPosition = beat.playbackStart / duration;
            }
            return this._score;
        } catch (e) {
            if (e instanceof UnsupportedFormatError) {
                throw e;
            }
            if (e instanceof AlphaTexError) {
                throw new UnsupportedFormatError(e.message, e);
            }
            throw e;
        }
    }

    private createDefaultScore(): void {
        this._score = new Score();
        this._score.tempo = 120;
        this._score.tempoLabel = '';
        this.newTrack();
    }

    private newTrack(): void {
        this._currentTrack = new Track();
        this._currentTrack.ensureStaveCount(1);
        this._currentTrack.playbackInfo.program = 25;
        this._currentTrack.playbackInfo.primaryChannel = this._trackChannel++;
        this._currentTrack.playbackInfo.secondaryChannel = this._trackChannel++;
        const staff = this._currentTrack.staves[0];
        staff.displayTranspositionPitch = 0;
        staff.stringTuning.tunings = Tuning.getDefaultTuningFor(6)!.tunings;
        this._articulationValueToIndex.clear();

        this.beginStaff(staff);

        this._score.addTrack(this._currentTrack);
        this.lyrics.set(this._currentTrack.index, []);
        this.currentDynamics = DynamicValue.F;
        this.currentTupletDenominator = -1;
        this.currentTupletNumerator = -1;
    }

    private beginStaff(staff: Staff) {
        this._currentStaff = staff;
        this.slurs.clear();
        this._barIndex = 0;
        this._voiceIndex = 0;
    }

    private parseAndTranslate() {
        let scoreNode: AlphaTexScoreNode;
        try {
            scoreNode = this._parser.read();
        } catch (e) {
            throw new UnsupportedFormatError('Error parsing alphaTex', e as Error);
        }

        // even start translating when we have parser errors
        // as long we have some nodes, we can already start semantically
        // validating and using them

        if (scoreNode.metaData.length === 0 && scoreNode.bars.length === 0) {
            throw new UnsupportedFormatError('No alphaTex data found');
        }

        this.metaData(scoreNode);
        this.bars(scoreNode);
        this.syncPoints(scoreNode);
    }

    private metaData(score: AlphaTexScoreNode) {
        for (const metaData of score.metaData) {
            if (this.handleStructuralMetaData(metaData)) {
                continue;
            }

            // TODO: warning about meta order?
            let result = this._handler.applyScoreMetaData(this, this._score, metaData);

            // fallback to staff meta
            if (result === ApplyNodeResult.NotAppliedUnrecognizedMarker) {
                result = this._handler.applyStaffMetaData(this, this._currentStaff, metaData);

                // allow bar meta (remember it for later)
                // TODO: warning recommending to move bar meta after
                if (
                    result === ApplyNodeResult.NotAppliedUnrecognizedMarker &&
                    this._handler.knownBarMetaDataTags.has(metaData.tag.tag.text.toLowerCase())
                ) {
                    this._initialBarMetaData.push(metaData);
                }
            }
        }

        // NOTE: we do not validate that we have a "dot" after initial metadata
        // with the new parser this separator is not really needed
        // we simply allow all metadata on start,
        // in alphaTex2 we can remove the separate top level meta
        // and simply check for known tags on the initial bar.
    }

    private bars(node: AlphaTexScoreNode) {
        for (const b of node.bars) {
            this.bar(b);
        }
    }

    private bar(node: AlphaTexBarNode) {
        const bar = this.barMeta(node);

        this.detectTuningForStaff();
        this.handleTransposition();

        const voice: Voice = bar.voices[this._voiceIndex];

        for (const b of node.beats) {
            this.beat(voice, b);
        }

        if (voice.beats.length === 0) {
            const emptyBeat = new Beat();
            emptyBeat.isEmpty = true;
            voice.addBeat(emptyBeat);
        }
    }

    private beat(voice: Voice, node: AlphaTexBeatNode) {
        if (node.durationChange) {
            this.beatDuration(node.durationChange);
        }

        const beat = new Beat();
        voice.addBeat(beat);

        if (node.notes) {
            for (const n of node.notes!.notes) {
                this.note(beat, n);
            }
        } else if (node.rest) {
            // beat is already a rest at start
        }

        if (node.durationValue) {
            this._currentDuration = this.parseDuration(node.durationValue!);
        }

        beat.duration = this._currentDuration;
        beat.dynamics = this.currentDynamics;
        beat.tupletNumerator = this.currentTupletNumerator;
        beat.tupletDenominator = this.currentTupletDenominator;

        // beat multiplier (repeat beat n times)
        let beatRepeat: number = 1;
        if (node.beatMultiplierValue !== undefined) {
            beatRepeat = node.beatMultiplierValue.value;
        }

        if (node.beatEffects) {
            this.beatEffects(beat, node.beatEffects!);
        }

        for (let i: number = 0; i < beatRepeat - 1; i++) {
            voice.addBeat(BeatCloner.clone(beat));
        }
    }

    private beatEffects(beat: Beat, node: AlphaTexPropertiesNode) {
        for (const p of node.properties) {
            const result = this._handler.applyBeatProperty(this, beat, p);
            switch (result) {
                case ApplyNodeResult.Applied:
                case ApplyNodeResult.NotAppliedSemanticError:
                    break;

                case ApplyNodeResult.NotAppliedUnrecognizedMarker:
                    const knownProps = Array.from(this._handler.knownBeatProperties).join(',');
                    this.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT001, // TODO code
                        message: `Unrecogized property '${p.property.text}', expected one of ${knownProps}`,
                        severity: AlphaTexDiagnosticsSeverity.Error,
                        start: p.start,
                        end: p.end
                    });
                    break;
            }
        }
    }

    private beatDuration(node: AlphaTexBeatDurationChangeNode) {
        if (node.value) {
            this._currentDuration = this.parseDuration(node.value!);
        }

        this.currentTupletNumerator = -1;
        this.currentTupletDenominator = -1;

        if (node.properties) {
            for (const p of node.properties.properties) {
                const result = this._handler.applyBeatDurationProperty(this, p);
                switch (result) {
                    case ApplyNodeResult.Applied:
                    case ApplyNodeResult.NotAppliedSemanticError:
                        break;

                    case ApplyNodeResult.NotAppliedUnrecognizedMarker:
                        const knownProps = Array.from(this._handler.knownBeatDurationProperties).join(',');
                        this.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT001, // TODO code
                            message: `Unrecogized property '${p.property.text}', expected one of ${knownProps}`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: p.start,
                            end: p.end
                        });
                        break;
                }
            }
        }
    }

    private parseDuration(duration: AlphaTexNumberLiteral): Duration {
        switch (duration.value) {
            case -4:
                return Duration.QuadrupleWhole;
            case -2:
                return Duration.DoubleWhole;
            case 1:
                return Duration.Whole;
            case 2:
                return Duration.Half;
            case 4:
                return Duration.Quarter;
            case 8:
                return Duration.Eighth;
            case 16:
                return Duration.Sixteenth;
            case 32:
                return Duration.ThirtySecond;
            case 64:
                return Duration.SixtyFourth;
            case 128:
                return Duration.OneHundredTwentyEighth;
            case 256:
                return Duration.TwoHundredFiftySixth;
            default:
                this.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT001, // TODO Code
                    message: `Invalid duration value '${duration.value}', expected one of, -4, -2, 1, 2, 4, 8, 16, 32, 64, 128, 256`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: duration.start,
                    end: duration.end
                });
                return this._currentDuration;
        }
    }

    private note(beat: Beat, node: AlphaTexNoteNode) {
        //
        // Note value
        let isDead: boolean = false;
        let isTie: boolean = false;
        let fret: number = -1;
        let octave: number = -1;
        let tone: number = -1;
        let accidentalMode = NoteAccidentalMode.Default;
        switch (node.noteValue.nodeType) {
            case AlphaTexNodeType.NumberLiteral:
                fret = (node.noteValue as AlphaTexNumberLiteral).value;
                if (this._currentStaff.isPercussion && !PercussionMapper.instrumentArticulations.has(fret)) {
                    this.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT001, // TODO code,
                        message: `Unknown percussion articulation '${fret}'.`,
                        severity: AlphaTexDiagnosticsSeverity.Error,
                        start: node.noteValue.start,
                        end: node.noteValue.end
                    });
                    return;
                }
                break;
            case AlphaTexNodeType.StringLiteral:
            case AlphaTexNodeType.Identifier:
                const str = (node.noteValue as AlphaTexTextNode).text;
                if (this._currentStaff.isPercussion) {
                    const articulationName = str.toLowerCase();
                    if (this.percussionArticulationNames.has(articulationName)) {
                        fret = this.percussionArticulationNames.get(articulationName)!;
                    } else {
                        this.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT001, // TODO code,
                            message: `Unknown percussion articulation '${articulationName}'.`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: node.noteValue.start,
                            end: node.noteValue.end
                        });
                    }
                } else {
                    isDead = str === 'x';
                    isTie = str === '-';

                    if (isTie || isDead) {
                        fret = 0;
                    } else {
                        const tuning = ModelUtils.parseTuning(str);
                        if (tuning) {
                            // auto convert staff
                            if (beat.index === 0 && beat.voice.index === 0 && beat.voice.bar.index === 0) {
                                this.makeStaffPitched(this._currentStaff);
                            } else if (this._currentStaff.isStringed) {
                                this.addSemanticDiagnostic({
                                    code: AlphaTexDiagnosticCode.AT001, // TODO code,
                                    message: `Cannot use pitched note value '${str}'  on string staff, please specify notes using the 'fret.string' syntax.`,
                                    severity: AlphaTexDiagnosticsSeverity.Error,
                                    start: node.noteValue.start,
                                    end: node.noteValue.end
                                });
                            } else if (this._currentStaff.isPercussion) {
                                this.addSemanticDiagnostic({
                                    code: AlphaTexDiagnosticCode.AT001, // TODO code,
                                    message: `Cannot use pitched note value '${str}'  on percussion staff, please specify percussion articulations with numbers or names.`,
                                    severity: AlphaTexDiagnosticsSeverity.Error,
                                    start: node.noteValue.start,
                                    end: node.noteValue.end
                                });
                            } else {
                                octave = tuning.octave;
                                tone = tuning.tone.noteValue;
                                if (this.accidentalMode === AlphaTexAccidentalMode.Explicit) {
                                    accidentalMode = tuning.tone.accidentalMode;
                                }
                            }
                        } else {
                            this.addSemanticDiagnostic({
                                code: AlphaTexDiagnosticCode.AT001, // TODO code,
                                message: `Unrecognized note value '${str}'.`,
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: node.noteValue.start,
                                end: node.noteValue.end
                            });
                        }
                    }
                }
                break;
        }

        //
        // Note String
        const isFretted: boolean =
            octave === -1 && this._currentStaff.tuning.length > 0 && !this._currentStaff.isPercussion;
        let noteString: number = -1;
        if (isFretted) {
            // Fret [Dot] String
            if (!node.noteString) {
                this.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT001, // TODO code,
                    message: `Missing string for fretted note.`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: node.noteValue.end,
                    end: node.noteValue.end
                });
                return;
            }

            noteString = node.noteString!.value;
            if (noteString < 1 || noteString > this._currentStaff.tuning.length) {
                this.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT001, // TODO code,
                    message: `Note string is out of range. Available range: 1-${this._currentStaff.tuning.length}`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: node.noteValue.end,
                    end: node.noteValue.end
                });
                return;
            }
        }

        //
        // Construct Note
        const note = new Note();
        if (isFretted) {
            note.string = this._currentStaff.tuning.length - (noteString - 1);
            note.isDead = isDead;
            note.isTieDestination = isTie;
            if (!isTie) {
                note.fret = fret;
            }
        } else if (this._currentStaff.isPercussion) {
            const articulationValue = fret;
            let articulationIndex: number = 0;
            if (this._articulationValueToIndex.has(articulationValue)) {
                articulationIndex = this._articulationValueToIndex.get(articulationValue)!;
            } else {
                articulationIndex = this._currentTrack.percussionArticulations.length;
                const articulation = PercussionMapper.getArticulationByInputMidiNumber(articulationValue);
                if (articulation === null) {
                    this.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT001, // TODO code,
                        message: `Unknown articulation value ${articulationValue}`,
                        severity: AlphaTexDiagnosticsSeverity.Error,
                        start: node.noteValue.end,
                        end: node.noteValue.end
                    });
                    return;
                }

                this._currentTrack.percussionArticulations.push(articulation!);
                this._articulationValueToIndex.set(articulationValue, articulationIndex);
            }

            note.percussionArticulation = articulationIndex;
        } else {
            note.octave = octave;
            note.tone = tone;
            note.accidentalMode = accidentalMode;
            note.isTieDestination = isTie;
        }
        beat.addNote(note);

        //
        // Note Effects
        if (node.noteEffects) {
            this.noteEffects(note, node.noteEffects!);
        }
    }

    private noteEffects(note: Note, node: AlphaTexPropertiesNode) {
        for (const p of node.properties) {
            const result = this._handler.applyNoteProperty(this, note, p);
            switch (result) {
                case ApplyNodeResult.Applied:
                case ApplyNodeResult.NotAppliedSemanticError:
                    break;

                case ApplyNodeResult.NotAppliedUnrecognizedMarker:
                    const knownProps = Array.from(this._handler.knownBeatProperties).join(',');
                    this.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT001, // TODO code
                        message: `Unrecogized property '${p.property.text}', expected one of ${knownProps}`,
                        severity: AlphaTexDiagnosticsSeverity.Error,
                        start: p.start,
                        end: p.end
                    });
                    break;
            }
        }
    }

    public makeStaffPitched(staff: Staff) {
        // clear tuning
        staff.stringTuning.tunings = [];
        if (!this.staffHasExplicitDisplayTransposition.has(staff)) {
            staff.displayTranspositionPitch = 0;
        }
    }

    private handleTransposition() {
        if (
            !this.staffDisplayTranspositionApplied.has(this._currentStaff) &&
            !this.staffHasExplicitDisplayTransposition.has(this._currentStaff)
        ) {
            const program = this._currentTrack.playbackInfo.program;
            if (ModelUtils.displayTranspositionPitches.has(program)) {
                // guitar E4 B3 G3 D3 A2 E2
                this._currentStaff.displayTranspositionPitch = ModelUtils.displayTranspositionPitches.get(program)!;
            } else {
                this._currentStaff.displayTranspositionPitch = 0;
            }
            this.staffDisplayTranspositionApplied.add(this._currentStaff);
        }
    }

    private detectTuningForStaff() {
        // detect tuning for staff
        const program = this._currentTrack.playbackInfo.program;
        if (!this.staffTuningApplied.has(this._currentStaff) && !this.staffHasExplicitTuning.has(this._currentStaff)) {
            // reset to defaults
            this._currentStaff.stringTuning.tunings = [];

            if (program === 15) {
                // dulcimer E4 B3 G3 D3 A2 E2
                this._currentStaff.stringTuning.tunings = Tuning.getDefaultTuningFor(6)!.tunings;
            } else if (program >= 24 && program <= 31) {
                // guitar E4 B3 G3 D3 A2 E2
                this._currentStaff.stringTuning.tunings = Tuning.getDefaultTuningFor(6)!.tunings;
            } else if (program >= 32 && program <= 39) {
                // bass G2 D2 A1 E1
                this._currentStaff.stringTuning.tunings = [43, 38, 33, 28];
            } else if (
                program === 40 ||
                program === 44 ||
                program === 45 ||
                program === 48 ||
                program === 49 ||
                program === 50 ||
                program === 51
            ) {
                // violin E3 A3 D3 G2
                this._currentStaff.stringTuning.tunings = [52, 57, 50, 43];
            } else if (program === 41) {
                // viola A3 D3 G2 C2
                this._currentStaff.stringTuning.tunings = [57, 50, 43, 36];
            } else if (program === 42) {
                // cello A2 D2 G1 C1
                this._currentStaff.stringTuning.tunings = [45, 38, 31, 24];
            } else if (program === 43) {
                // contrabass
                // G2 D2 A1 E1
                this._currentStaff.stringTuning.tunings = [43, 38, 33, 28];
            } else if (program === 105) {
                // banjo
                // D3 B2 G2 D2 G3
                this._currentStaff.stringTuning.tunings = [50, 47, 43, 38, 55];
            } else if (program === 106) {
                // shamisen
                // A3 E3 A2
                this._currentStaff.stringTuning.tunings = [57, 52, 45];
            } else if (program === 107) {
                // koto
                // E3 A2 D2 G1
                this._currentStaff.stringTuning.tunings = [52, 45, 38, 31];
            } else if (program === 110) {
                // Fiddle
                // E4 A3 D3 G2
                this._currentStaff.stringTuning.tunings = [64, 57, 50, 43];
            }

            this.staffTuningApplied.add(this._currentStaff);
        }
    }

    private barMeta(node: AlphaTexBarNode): Bar {
        let bar: Bar | undefined = undefined;

        // bar meta
        for (const m of node.metaData) {
            // handle structural meta
            const result = this._handler.applyStructuralMetaData(this, m);
            switch (result) {
                case ApplyNodeResult.Applied:
                case ApplyNodeResult.NotAppliedSemanticError:
                    // need for a new bar
                    bar = undefined;
                    continue;
            }

            if (this._handler.knownBarMetaDataTags.has(m.tag.tag.text.toLowerCase())) {
                if (!bar) {
                    bar = this.newBar(this._currentStaff);
                }
            } else {
                const knownMeta = Array.from(this._handler.knownBarMetaDataTags).join(',');
                this.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT001, // TODO Code
                    message: `Unrecognized bar level metadata '${m.tag.tag.text}', expected one of: ${knownMeta}`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: m.tag.start,
                    end: m.tag.end
                });
            }
        }

        if (!bar) {
            bar = this.newBar(this._currentStaff);
        }

        return bar;
    }

    private newBar(staff: Staff): Bar {
        // existing bar? -> e.g. in multi-voice setups where we fill empty voices later
        if (this._barIndex < staff.bars.length) {
            const bar = staff.bars[this._barIndex];
            this._barIndex++;
            return bar;
        }

        const voiceCount = staff.bars.length === 0 ? 1 : staff.bars[0].voices.length;

        // need new bar
        const newBar: Bar = new Bar();
        staff.addBar(newBar);
        if (newBar.previousBar) {
            newBar.clef = newBar.previousBar.clef;
            newBar.clefOttava = newBar.previousBar.clefOttava;
            newBar.keySignature = newBar.previousBar!.keySignature;
            newBar.keySignatureType = newBar.previousBar!.keySignatureType;
        }
        this._barIndex++;

        if (newBar.index > 0) {
            newBar.clef = newBar.previousBar!.clef;
        }

        for (let i = 0; i < voiceCount; i++) {
            const voice: Voice = new Voice();
            newBar.addVoice(voice);
        }

        return newBar;
    }

    private syncPoints(score: AlphaTexScoreNode) {
        for (const syncPoint of score.syncPoints) {
            const flat = this._handler.buildSyncPoint(this, syncPoint);
            if (flat) {
                this._syncPoints.push(flat);
            }
        }
    }

    private handleStructuralMetaData(metaData: AlphaTexMetaDataNode) {
        const result = this._handler.applyStructuralMetaData(this, metaData);
        switch (result) {
            case ApplyNodeResult.Applied:
            case ApplyNodeResult.NotAppliedSemanticError:
                return true;
            // case ApplyMetaDataResult.NotAppliedUnrecognizedMeta:
            default:
                return false;
        }
    }

    public startNewStaff(): Staff {
        this._ignoredInitialVoice = false;

        if (this._currentTrack.staves[0].bars.length > 0) {
            const previousWasPercussion = this._currentStaff.isPercussion;
            this._currentTrack.ensureStaveCount(this._currentTrack.staves.length + 1);
            const staff = this._currentTrack.staves[this._currentTrack.staves.length - 1];
            this.beginStaff(staff);

            if (previousWasPercussion) {
                this.applyPercussionStaff(this._currentStaff);
            }

            this.currentDynamics = DynamicValue.F;
        }
        return this._currentStaff;
    }

    public applyPercussionStaff(staff: Staff) {
        staff.isPercussion = true;
        staff.showTablature = false;
        staff.track.playbackInfo.program = 0;
    }

    public startNewTrack(): Track {
        this._ignoredInitialVoice = false;

        // new track starting? - if no masterbars it's the \track of the initial track.
        if (this._score.masterBars.length > 0) {
            this.newTrack();
        }

        return this._currentTrack;
    }

    public startNewVoice() {
        if (
            this._voiceIndex === 0 &&
            (this._currentStaff.bars.length === 0 ||
                (this._currentStaff.bars.length === 1 &&
                    this._currentStaff.bars[0].isEmpty &&
                    !this._ignoredInitialVoice))
        ) {
            // voice marker on the begining of the first voice without any bar yet?
            // -> ignore
            this._ignoredInitialVoice = true;
            return;
        }
        // create directly a new empty voice for all bars
        for (const b of this._currentStaff.bars) {
            const v = new Voice();
            b.addVoice(v);
        }
        // start using the new voice (see newBar for details on matching)
        this._voiceIndex++;
        this._barIndex = 0;
        this.currentTupletDenominator = -1;
        this.currentTupletNumerator = -1;
    }
}
