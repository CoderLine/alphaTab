import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { BeatCloner } from '@src/generated/model/BeatCloner';
import { AlphaTex1LanguageHandler } from '@src/importer/alphaTex/AlphaTex1LanguageHandler';
import {
    type AlphaTexAstNode,
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
} from '@src/importer/alphaTex/AlphaTexAst';
import { AlphaTexParser } from '@src/importer/alphaTex/AlphaTexParser';
import {
    AlphaTexAccidentalMode,
    type AlphaTexDiagnostic,
    AlphaTexDiagnosticBag,
    AlphaTexDiagnosticCode,
    AlphaTexDiagnosticsSeverity,
    type IAlphaTexImporter,
    type IAlphaTexImporterState
} from '@src/importer/alphaTex/AlphaTexShared';
import {
    ApplyNodeResult,
    ApplyStructuralMetaDataResult,
    type IAlphaTexLanguageImportHandler
} from '@src/importer/alphaTex/IAlphaTexLanguageImportHandler';
import { ScoreImporter } from '@src/importer/ScoreImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { IOHelper } from '@src/io/IOHelper';
import { Logger } from '@src/Logger';
import type { FlatSyncPoint } from '@src/model/Automation';
import { Bar, type SustainPedalMarker } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import type { Lyrics } from '@src/model/Lyrics';
import { MasterBar } from '@src/model/MasterBar';
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
import { Lazy } from '@src/util/Lazy';

export class AlphaTexErrorWithDiagnostics extends AlphaTabError {
    public lexerDiagnostics?: AlphaTexDiagnosticBag;
    public parserDiagnostics?: AlphaTexDiagnosticBag;
    public semanticDiagnostics?: AlphaTexDiagnosticBag;

    public *iterateDiagnostics() {
        if (this.lexerDiagnostics) {
            for (const d of this.lexerDiagnostics.items) {
                yield d;
            }
        }
        if (this.parserDiagnostics) {
            for (const d of this.parserDiagnostics.items) {
                yield d;
            }
        }
        if (this.semanticDiagnostics) {
            for (const d of this.semanticDiagnostics.items) {
                yield d;
            }
        }
    }

    public constructor(
        message: string,
        lexerDiagnostics?: AlphaTexDiagnosticBag,
        parserDiagnostics?: AlphaTexDiagnosticBag,
        semanticDiagnostics?: AlphaTexDiagnosticBag
    ) {
        super(AlphaTabErrorType.AlphaTex, message);
        this.lexerDiagnostics = lexerDiagnostics;
        this.parserDiagnostics = parserDiagnostics;
        this.semanticDiagnostics = semanticDiagnostics;
    }

    public override toString(): string {
        return [
            this.message!,
            'lexer diagnostics:',
            AlphaTexErrorWithDiagnostics.diagnosticsToString(this.lexerDiagnostics, '  '),
            'parser diagnostics:',
            AlphaTexErrorWithDiagnostics.diagnosticsToString(this.parserDiagnostics, '  '),
            'semantic diagnostics:',
            AlphaTexErrorWithDiagnostics.diagnosticsToString(this.semanticDiagnostics, '  ')
        ].join('\n');
    }

    private static diagnosticsToString(semanticDiagnostics: AlphaTexDiagnosticBag | undefined, indent: string) {
        if (!semanticDiagnostics) {
            return `${indent}none`;
        }

        return semanticDiagnostics.items
            .map(
                d =>
                    `${indent}${AlphaTexDiagnosticsSeverity[d.severity]} AT${(d.code as number).toString().padStart(3, '0')}${AlphaTexErrorWithDiagnostics.locationToString(d)}: ${d.message}`
            )
            .join('\n');
    }

    private static locationToString(d: AlphaTexDiagnostic): string {
        let s = '';
        if (d.start) {
            s += `(${d.start.line},${d.start.col})`;
        }
        if (d.end) {
            if (s.length > 0) {
                s += '->';
            }
            s += `(${d.end.line},${d.end.col})`;
        }
        return s;
    }
}

class AlphaTexImportState implements IAlphaTexImporterState {
    public trackChannel: number = 0;
    public score!: Score;
    public currentTrack?: Track;
    public currentStaff?: Staff;
    public barIndex: number = 0;
    public voiceIndex: number = 0;
    public ignoredInitialVoice = false;
    public ignoredInitialStaff = false;
    public ignoredInitialTrack = false;
    public currentDuration = Duration.Quarter;
    public articulationValueToIndex = new Map<number, number>();

    public hasAnyProperData = false;

    public readonly percussionArticulationNames = new Map<string, number>();

    public readonly slurs = new Map<string, Note>();
    public readonly lyrics = new Map<number, Lyrics[]>();
    public readonly sustainPedalToBeat = new Map<SustainPedalMarker, Beat>();
    public readonly staffTuningApplied = new Set<Staff>();
    public readonly staffHasExplicitTuning = new Set<Staff>();
    public readonly staffHasExplicitDisplayTransposition = new Set<Staff>();
    public readonly staffDisplayTranspositionApplied = new Set<Staff>();
    public readonly syncPoints: FlatSyncPoint[] = [];

    public currentDynamics = DynamicValue.F;
    public accidentalMode = AlphaTexAccidentalMode.Explicit;
    public currentTupletNumerator = -1;
    public currentTupletDenominator = -1;
}

export class AlphaTexImporter extends ScoreImporter implements IAlphaTexImporter {
    private _parser!: AlphaTexParser;
    private _handler: IAlphaTexLanguageImportHandler = AlphaTex1LanguageHandler.instance;

    private _state = new AlphaTexImportState();

    public get state(): IAlphaTexImporterState {
        return this._state;
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

    public logErrors: boolean = false;

    public readonly semanticDiagnostics = new AlphaTexDiagnosticBag();

    public addSemanticDiagnostic(diagnostic: AlphaTexDiagnostic) {
        this.semanticDiagnostics.push(diagnostic);
    }

    public initFromString(tex: string, settings: Settings) {
        this.data = ByteBuffer.empty();
        this._parser = new AlphaTexParser(tex);
        this.settings = settings;
        // when beginning reading a new score we reset the IDs.
        Score.resetIds();
    }

    public readScore(): Score {
        this._state = new AlphaTexImportState();
        this.createDefaultScore();

        if (this.data.length > 0) {
            this._parser = new AlphaTexParser(IOHelper.toString(this.data.readAll(), this.settings.importer.encoding));
        }

        let scoreNode: AlphaTexScoreNode;
        try {
            scoreNode = this._parser.read();
        } catch (e) {
            if (this.logErrors) {
                Logger.error('AlphaTex', `Error while parsing alphaTex: ${(e as Error).toString()}`);
            }
            throw new UnsupportedFormatError('Error parsing alphaTex, check inner error for details', e as Error);
        }

        if (this._parser.parserDiagnostics.hasErrors || this._parser.lexer.lexerDiagnostics.hasErrors) {
            const error = new AlphaTexErrorWithDiagnostics(
                'There are errors in the parsed alphaTex, check the diagnostics for details',
                this.lexerDiagnostics,
                this.parserDiagnostics,
                this.semanticDiagnostics
            );

            if (this.logErrors) {
                Logger.error('AlphaTex', `Error while parsing alphaTex: ${error.toString()}`);
            }

            throw new UnsupportedFormatError(
                'Error parsing alphaTex, check diagnostics on inner error for details',
                error
            );
        }

        // even start translating when we have parser errors
        // as long we have some nodes, we can already start semantically
        // validating and using them

        if (scoreNode.bars.length === 0) {
            throw new UnsupportedFormatError('No alphaTex data found');
        }

        this.bars(scoreNode);

        if (this.semanticDiagnostics.hasErrors) {
            if (this._state.hasAnyProperData) {
                const error = new AlphaTexErrorWithDiagnostics(
                    'There are errors in the parsed alphaTex, check the diagnostics for details',
                    this.lexerDiagnostics,
                    this.parserDiagnostics,
                    this.semanticDiagnostics
                );
                if (this.logErrors) {
                    if (this.logErrors) {
                        Logger.error('AlphaTex', `Error while parsing alphaTex: ${error.toString()}`);
                    }
                }

                throw error;
            } else {
                throw new UnsupportedFormatError('No alphaTex data found');
            }
        }

        ModelUtils.consolidate(this._state.score);
        this._state.score.finish(this.settings);
        ModelUtils.trimEmptyBarsAtEnd(this._state.score);
        this._state.score.rebuildRepeatGroups();
        this._state.score.applyFlatSyncPoints(this._state.syncPoints);
        for (const [track, lyrics] of this._state.lyrics) {
            this._state.score.tracks[track].applyLyrics(lyrics);
        }
        for (const [sustainPedal, beat] of this._state.sustainPedalToBeat) {
            const duration = beat.voice.bar.masterBar.calculateDuration();
            sustainPedal.ratioPosition = beat.playbackStart / duration;
        }
        return this._state.score;
    }

    private createDefaultScore(): void {
        this._state.score = new Score();
        this.newTrack();
    }

    private newTrack(): void {
        this._state.currentTrack = new Track();
        this._state.currentTrack.ensureStaveCount(1);
        this._state.currentTrack.playbackInfo.program = 25;
        this._state.currentTrack.playbackInfo.primaryChannel = this._state.trackChannel++;
        this._state.currentTrack.playbackInfo.secondaryChannel = this._state.trackChannel++;
        const staff = this._state.currentTrack.staves[0];
        staff.displayTranspositionPitch = 0;
        staff.stringTuning.tunings = Tuning.getDefaultTuningFor(6)!.tunings;
        this._state.articulationValueToIndex.clear();

        this.beginStaff(staff);

        this._state.score.addTrack(this._state.currentTrack);
        this._state.lyrics.set(this._state.currentTrack.index, []);
        this._state.currentDynamics = DynamicValue.F;
        this._state.currentTupletDenominator = -1;
        this._state.currentTupletNumerator = -1;
    }

    private beginStaff(staff: Staff) {
        // ensure previous staff is properly initialized
        if (this._state.currentStaff) {
            this.detectTuningForStaff();
            this.handleTransposition();
        }

        this._state.currentStaff = staff;
        this._state.slurs.clear();
        this._state.barIndex = 0;
        this._state.voiceIndex = 0;
    }

    private bars(node: AlphaTexScoreNode) {
        if (node.bars.length > 0) {
            for (const b of node.bars) {
                this.bar(b);
            }
        } else {
            this.newBar(this._state.currentStaff!);
            this.detectTuningForStaff();
            this.handleTransposition();
        }
    }

    private bar(node: AlphaTexBarNode) {
        const bar = this.barMeta(node);

        this.detectTuningForStaff();
        this.handleTransposition();

        const voice: Voice = bar.voices[this._state.voiceIndex];

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

        if (!node.notes && !node.rest) {
            return;
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
            this._state.currentDuration = this.parseDuration(node.durationValue!);
        }

        beat.duration = this._state.currentDuration;
        beat.dynamics = this._state.currentDynamics;
        if (this._state.currentTupletNumerator !== -1 && !beat.hasTuplet) {
            beat.tupletNumerator = this._state.currentTupletNumerator;
            beat.tupletDenominator = this._state.currentTupletDenominator;
        }

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
                    this._state.hasAnyProperData = true;
                    break;

                case ApplyNodeResult.NotAppliedUnrecognizedMarker:
                    const knownProps = Array.from(this._handler.knownBeatProperties).join(',');
                    this.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT212,
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
            this._state.currentDuration = this.parseDuration(node.value!);
        }

        this._state.currentTupletNumerator = -1;
        this._state.currentTupletDenominator = -1;

        if (node.properties) {
            for (const p of node.properties.properties) {
                const result = this._handler.applyBeatDurationProperty(this, p);
                switch (result) {
                    case ApplyNodeResult.Applied:
                    case ApplyNodeResult.NotAppliedSemanticError:
                        this._state.hasAnyProperData = true;
                        break;

                    case ApplyNodeResult.NotAppliedUnrecognizedMarker:
                        const knownProps = Array.from(this._handler.knownBeatDurationProperties).join(',');
                        this.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT212,
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
                    code: AlphaTexDiagnosticCode.AT209,
                    message: `Unexpected duration value '${duration.value}', expected: -4, -2, 1, 2, 4, 8, 16, 32, 64, 128 or 256`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: duration.start,
                    end: duration.end
                });
                return this._state.currentDuration;
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
        const noteValue = node.noteValue as AlphaTexAstNode;
        switch (noteValue.nodeType) {
            case AlphaTexNodeType.NumberLiteral:
                fret = (noteValue as AlphaTexNumberLiteral).value;
                if (this._state.currentStaff!.isPercussion && !PercussionMapper.instrumentArticulations.has(fret)) {
                    this.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT209,
                        message: `Unexpected percussion articulation value '${fret}', expected: oneOf(${Array.from(PercussionMapper.instrumentArticulations.keys()).join(',')}).`,
                        severity: AlphaTexDiagnosticsSeverity.Error,
                        start: noteValue.start,
                        end: noteValue.end
                    });
                    return;
                }
                break;
            case AlphaTexNodeType.StringLiteral:
            case AlphaTexNodeType.Identifier:
                const str = (noteValue as AlphaTexTextNode).text;
                if (this._state.currentStaff!.isPercussion) {
                    const articulationName = str.toLowerCase();
                    if (this._state.percussionArticulationNames.has(articulationName)) {
                        fret = this._state.percussionArticulationNames.get(articulationName)!;
                    } else {
                        this.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected percussion articulation value '${articulationName}', expected: oneOf(${Array.from(this._state.percussionArticulationNames.keys()).join(',')}).`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: noteValue.start,
                            end: noteValue.end
                        });
                        return;
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
                                this.makeStaffPitched(this._state.currentStaff!);
                            }

                            if (this._state.currentStaff!.isStringed) {
                                this.addSemanticDiagnostic({
                                    code: AlphaTexDiagnosticCode.AT215,
                                    message: `Cannot use pitched note value '${str}' on string staff, please specify notes using the 'fret.string' syntax.`,
                                    severity: AlphaTexDiagnosticsSeverity.Error,
                                    start: noteValue.start,
                                    end: noteValue.end
                                });
                                return;
                            }

                            if (this._state.currentStaff!.isPercussion) {
                                this.addSemanticDiagnostic({
                                    code: AlphaTexDiagnosticCode.AT216,
                                    message: `Cannot use pitched note value '${str}' on percussion staff, please specify percussion articulations with numbers or names.`,
                                    severity: AlphaTexDiagnosticsSeverity.Error,
                                    start: noteValue.start,
                                    end: noteValue.end
                                });
                                return;
                            }

                            octave = tuning.octave;
                            tone = tuning.tone.noteValue;
                            if (this._state.accidentalMode === AlphaTexAccidentalMode.Explicit) {
                                accidentalMode = tuning.tone.accidentalMode;
                            }
                        } else {
                            this.addSemanticDiagnostic({
                                code: AlphaTexDiagnosticCode.AT217,
                                message: `Unrecognized note value '${str}'.`,
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: noteValue.start,
                                end: noteValue.end
                            });
                            return;
                        }
                    }
                }
                break;
        }

        //
        // Note String
        const isFretted: boolean =
            octave === -1 && this._state.currentStaff!.tuning.length > 0 && !this._state.currentStaff!.isPercussion;
        let noteString: number = -1;
        if (isFretted) {
            // Fret [Dot] String
            if (!node.noteString) {
                this.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT207,
                    message: `Missing string for fretted note.`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: noteValue.end,
                    end: noteValue.end
                });
                return;
            }

            noteString = node.noteString!.value;
            if (noteString < 1 || noteString > this._state.currentStaff!.tuning.length) {
                this.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT208,
                    message: `Note string is out of range. Available range: 1-${this._state.currentStaff!.tuning.length}`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: noteValue.end,
                    end: noteValue.end
                });
                return;
            }
        }

        //
        // Construct Note
        const note = new Note();
        if (isFretted) {
            note.string = this._state.currentStaff!.tuning.length - (noteString - 1);
            note.isDead = isDead;
            note.isTieDestination = isTie;
            if (!isTie) {
                note.fret = fret;
            }
        } else if (this._state.currentStaff!.isPercussion) {
            const articulationValue = fret;
            let articulationIndex: number = 0;
            if (this._state.articulationValueToIndex.has(articulationValue)) {
                articulationIndex = this._state.articulationValueToIndex.get(articulationValue)!;
            } else {
                articulationIndex = this._state.currentTrack!.percussionArticulations.length;
                const articulation = PercussionMapper.getArticulationByInputMidiNumber(articulationValue);
                if (articulation === null) {
                    this.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT209,
                        message: `Unexpected articulation value '${articulationValue}', expected: oneOf(${Array.from(PercussionMapper.instrumentArticulations.keys()).join(',')}).`,
                        severity: AlphaTexDiagnosticsSeverity.Error,
                        start: noteValue.end,
                        end: noteValue.end
                    });
                    return;
                }

                this._state.currentTrack!.percussionArticulations.push(articulation!);
                this._state.articulationValueToIndex.set(articulationValue, articulationIndex);
            }

            note.percussionArticulation = articulationIndex;
        } else {
            note.octave = octave;
            note.tone = tone;
            note.accidentalMode = accidentalMode;
            note.isTieDestination = isTie;
        }
        beat.addNote(note);
        this._state.hasAnyProperData = true;

        //
        // Note Effects
        if (node.noteEffects) {
            this.noteEffects(note, node.noteEffects!);
        }
    }

    private noteEffects(note: Note, node: AlphaTexPropertiesNode) {
        for (const p of node.properties) {
            let result = this._handler.applyNoteProperty(this, note, p);
            if (result === ApplyNodeResult.NotAppliedUnrecognizedMarker) {
                result = this._handler.applyBeatProperty(this, note.beat, p);
            }

            switch (result) {
                case ApplyNodeResult.Applied:
                case ApplyNodeResult.NotAppliedSemanticError:
                    break;

                case ApplyNodeResult.NotAppliedUnrecognizedMarker:
                    const knownProps = Array.from(this._handler.knownNoteProperties)
                        .concat(Array.from(this._handler.knownBeatProperties))
                        .join(',');
                    this.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT212,
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
        if (!this._state.staffHasExplicitDisplayTransposition.has(staff)) {
            staff.displayTranspositionPitch = 0;
        }
    }

    private handleTransposition() {
        if (
            !this._state.staffDisplayTranspositionApplied.has(this._state.currentStaff!) &&
            !this._state.staffHasExplicitDisplayTransposition.has(this._state.currentStaff!)
        ) {
            const program = this._state.currentStaff!.track.playbackInfo.program;
            if (ModelUtils.displayTranspositionPitches.has(program)) {
                // guitar E4 B3 G3 D3 A2 E2
                this._state.currentStaff!.displayTranspositionPitch =
                    ModelUtils.displayTranspositionPitches.get(program)!;
            } else {
                this._state.currentStaff!.displayTranspositionPitch = 0;
            }
            this._state.staffDisplayTranspositionApplied.add(this._state.currentStaff!);
        }
    }

    private detectTuningForStaff() {
        // detect tuning for staff
        const program = this._state.currentStaff!.track.playbackInfo.program;
        if (
            !this._state.staffTuningApplied.has(this._state.currentStaff!) &&
            !this._state.staffHasExplicitTuning.has(this._state.currentStaff!)
        ) {
            // reset to defaults
            this._state.currentStaff!.stringTuning.tunings = [];

            if (program === 15) {
                // dulcimer E4 B3 G3 D3 A2 E2
                this._state.currentStaff!.stringTuning.tunings = Tuning.getDefaultTuningFor(6)!.tunings;
            } else if (program >= 24 && program <= 31) {
                // guitar E4 B3 G3 D3 A2 E2
                this._state.currentStaff!.stringTuning.tunings = Tuning.getDefaultTuningFor(6)!.tunings;
            } else if (program >= 32 && program <= 39) {
                // bass G2 D2 A1 E1
                this._state.currentStaff!.stringTuning.tunings = [43, 38, 33, 28];
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
                this._state.currentStaff!.stringTuning.tunings = [52, 57, 50, 43];
            } else if (program === 41) {
                // viola A3 D3 G2 C2
                this._state.currentStaff!.stringTuning.tunings = [57, 50, 43, 36];
            } else if (program === 42) {
                // cello A2 D2 G1 C1
                this._state.currentStaff!.stringTuning.tunings = [45, 38, 31, 24];
            } else if (program === 43) {
                // contrabass
                // G2 D2 A1 E1
                this._state.currentStaff!.stringTuning.tunings = [43, 38, 33, 28];
            } else if (program === 105) {
                // banjo
                // D3 B2 G2 D2 G3
                this._state.currentStaff!.stringTuning.tunings = [50, 47, 43, 38, 55];
            } else if (program === 106) {
                // shamisen
                // A3 E3 A2
                this._state.currentStaff!.stringTuning.tunings = [57, 52, 45];
            } else if (program === 107) {
                // koto
                // E3 A2 D2 G1
                this._state.currentStaff!.stringTuning.tunings = [52, 45, 38, 31];
            } else if (program === 110) {
                // Fiddle
                // E4 A3 D3 G2
                this._state.currentStaff!.stringTuning.tunings = [64, 57, 50, 43];
            }

            this._state.staffTuningApplied.add(this._state.currentStaff!);
        }
    }

    private barMeta(node: AlphaTexBarNode): Bar {
        // it might be a bit an edge case but a valid one:
        // one might repeat multiple structural metadata
        // in one bar starting multiple tracks/staves/voices which are
        // empty.
        // for this reason we first remember the bar metadata
        // and do not create bars directly
        // the tricky thing is: \track, \staff, \voice might not create
        // new items but reuse the initial ones.
        // here we need to detect such scenarios and ensure we apply
        // any preceeding metadata to empty bars

        let initialBarMeta: AlphaTexMetaDataNode[] | undefined =
            this._state.score.masterBars.length > 0 ? undefined : [];

        const resetInitialBarMeta = () => {
            // reset state
            if (!initialBarMeta) {
                return;
            }

            initialBarMeta = undefined;
            previousStaff = this._state.currentStaff!;
            hadNewTrack = false;
            hadNewStaff = false;
            applyInitialBarMetaToPreviousStaff = false;
        };

        const bar: Lazy<Bar> = new Lazy<Bar>(() => {
            const b = this.newBar(this._state.currentStaff!);
            if (initialBarMeta) {
                for (const initial of initialBarMeta) {
                    this._handler.applyBarMetaData(this, b, initial);
                }
                resetInitialBarMeta();
            }
            return b;
        });

        let previousStaff = this._state.currentStaff!;
        let hadNewTrack = false;
        let hadNewStaff = false;
        let applyInitialBarMetaToPreviousStaff = false;

        // bar meta
        for (const m of node.metaData) {
            const tag = m.tag.tag.text.toLowerCase();
            if (this._handler.knownStructuralMetaDataTags.has(tag)) {
                this._state.hasAnyProperData = true;

                const result = this._handler.applyStructuralMetaData(this, m);
                switch (result) {
                    case ApplyStructuralMetaDataResult.AppliedNewTrack:
                        if (hadNewStaff) {
                            // new track after new staff -> apply to previous staff
                            applyInitialBarMetaToPreviousStaff = true;
                        } else if (hadNewTrack) {
                            // multiple new tracks -> apply to previous staff
                            applyInitialBarMetaToPreviousStaff = true;
                        } else {
                            hadNewTrack = true;
                            previousStaff = this._state.currentStaff!;
                        }

                        bar.reset();

                        break;
                    case ApplyStructuralMetaDataResult.AppliedNewStaff:
                        if (hadNewStaff) {
                            applyInitialBarMetaToPreviousStaff = true;
                        } else {
                            hadNewStaff = true;
                            previousStaff = this._state.currentStaff!;
                        }

                        // new bar needed on new structural level
                        bar.reset();
                        break;
                }

                if (initialBarMeta) {
                    if (applyInitialBarMetaToPreviousStaff) {
                        if (previousStaff.bars.length === 0) {
                            // need initial bar
                            const initialBar: Bar = new Bar();
                            previousStaff.addBar(initialBar);

                            const initialVoice: Voice = new Voice();
                            initialBar.addVoice(initialVoice);

                            if (previousStaff.bars.length > this._state.score.masterBars.length) {
                                const master = new MasterBar();
                                this._state.score.addMasterBar(master);
                            }

                            // apply all data
                            for (const m of initialBarMeta) {
                                this._handler.applyBarMetaData(this, initialBar, m);
                            }

                            resetInitialBarMeta();
                        } else {
                            // this should never occur. as far I can judge,
                            // we only run into this case when we have multiple \ and \staff tags
                            // without content inbetween, hence they should be empty
                            throw new AlphaTabError(
                                AlphaTabErrorType.AlphaTex,
                                `Unexpected internal error, didn't expect a filled staff after multiple \\track and/or \\staff tags. Please report this problem providing the input alphaTex.`
                            );
                        }
                    }
                }
            } else if (this._handler.knownScoreMetaDataTags.has(m.tag.tag.text.toLowerCase())) {
                this._state.hasAnyProperData = true;
                this._handler.applyScoreMetaData(this, this._state.score, m);
            } else if (this._handler.knownStaffMetaDataTags.has(m.tag.tag.text.toLowerCase())) {
                this._state.hasAnyProperData = true;
                this._handler.applyStaffMetaData(this, this._state.currentStaff!, m);
            } else if (this._handler.knownBarMetaDataTags.has(m.tag.tag.text.toLowerCase())) {
                this._state.hasAnyProperData = true;
                if (initialBarMeta) {
                    initialBarMeta.push(m);
                } else {
                    this._handler.applyBarMetaData(this, bar.value, m);
                }
            } else {
                const knownMeta = Array.from(this._handler.allKnownMetaDataTags).join(',');
                this.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT204,
                    message: `Unrecognized metadata '${m.tag.tag.text}', expected one of: ${knownMeta}`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: m.tag.start,
                    end: m.tag.end
                });
            }
        }

        return bar.value;
    }

    private newBar(staff: Staff): Bar {
        // existing bar? -> e.g. in multi-voice setups where we fill empty voices later
        if (this._state.barIndex < staff.bars.length) {
            const bar = staff.bars[this._state.barIndex];
            this._state.barIndex++;
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
        this._state.barIndex++;

        if (newBar.index > 0) {
            newBar.clef = newBar.previousBar!.clef;
        }

        for (let i = 0; i < voiceCount; i++) {
            const voice: Voice = new Voice();
            newBar.addVoice(voice);
        }

        if (this._state.currentStaff!.bars.length > this._state.score.masterBars.length) {
            const master = new MasterBar();
            this._state.score.addMasterBar(master);
            if (master.index > 0) {
                master.timeSignatureDenominator = master.previousMasterBar!.timeSignatureDenominator;
                master.timeSignatureNumerator = master.previousMasterBar!.timeSignatureNumerator;
                master.tripletFeel = master.previousMasterBar!.tripletFeel;
            }
        }

        return newBar;
    }

    public startNewStaff(): Staff {
        this._state.ignoredInitialVoice = false;

        if (this._state.ignoredInitialStaff || this._state.currentTrack!.staves[0].bars.length > 0) {
            const previousWasPercussion = this._state.currentStaff!.isPercussion;
            this._state.currentTrack!.ensureStaveCount(this._state.currentTrack!.staves.length + 1);
            const staff = this._state.currentTrack!.staves[this._state.currentTrack!.staves.length - 1];
            this.beginStaff(staff);

            if (previousWasPercussion) {
                this.applyPercussionStaff(this._state.currentStaff!);
            }

            this._state.currentDynamics = DynamicValue.F;
        } else {
            this._state.ignoredInitialStaff = true;
        }
        return this._state.currentStaff!;
    }

    public applyPercussionStaff(staff: Staff) {
        staff.isPercussion = true;
        staff.showTablature = false;
        staff.track.playbackInfo.program = 0;
    }

    public startNewTrack(): Track {
        this._state.ignoredInitialVoice = false;
        this._state.ignoredInitialStaff = false;

        // new track starting? - if no masterbars it's the \track of the initial track.
        if (this._state.ignoredInitialTrack || this._state.score.masterBars.length > 0) {
            this.newTrack();
        } else {
            this._state.ignoredInitialTrack = true;
        }

        return this._state.currentTrack!;
    }

    public startNewVoice() {
        if (
            this._state.voiceIndex === 0 &&
            (this._state.currentStaff!.bars.length === 0 ||
                (this._state.currentStaff!.bars.length === 1 &&
                    this._state.currentStaff!.bars[0].isEmpty &&
                    !this._state.ignoredInitialVoice))
        ) {
            // voice marker on the begining of the first voice without any bar yet?
            // -> ignore
            this._state.ignoredInitialVoice = true;
            return;
        }
        // create directly a new empty voice for all bars
        for (const b of this._state.currentStaff!.bars) {
            const v = new Voice();
            b.addVoice(v);
        }
        // start using the new voice (see newBar for details on matching)
        this._state.voiceIndex++;
        this._state.barIndex = 0;
        this._state.currentTupletDenominator = -1;
        this._state.currentTupletNumerator = -1;
    }
}
