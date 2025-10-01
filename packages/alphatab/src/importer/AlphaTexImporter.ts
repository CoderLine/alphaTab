import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
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
import {
    AlphaTex1LanguageHandler,
    ApplyNodeResult,
    type IAlphaTexImporter,
    type IAlphaTexImporterState,
    type IAlphaTexLanguageHandler
} from '@src/importer/AlphaTexLanguageHandler';
import { AlphaTexParser } from '@src/importer/AlphaTexParser';
import {
    AlphaTexAccidentalMode,
    type AlphaTexDiagnostic,
    AlphaTexDiagnosticBag,
    AlphaTexDiagnosticCode,
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
            this.message,
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
    public readonly _initialBarMetaData: AlphaTexMetaDataNode[] = [];

    public trackChannel: number = 0;
    public score!: Score;
    public currentTrack!: Track;
    public currentStaff!: Staff;
    public barIndex: number = 0;
    public voiceIndex: number = 0;
    public ignoredInitialVoice = false;
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
    public currentDynamics = DynamicValue.F;
    public accidentalMode = AlphaTexAccidentalMode.Explicit;
    public currentTupletNumerator = -1;
    public currentTupletDenominator = -1;

    public _syncPoints: FlatSyncPoint[] = [];
}

export class AlphaTexImporter extends ScoreImporter implements IAlphaTexImporter {
    private _parser!: AlphaTexParser;
    private _handler: IAlphaTexLanguageHandler = AlphaTex1LanguageHandler.instance;
    private _state = new AlphaTexImportState();

    public get state() {
        return this._state;
    }

    public addSemanticDiagnostic(diagnostic: AlphaTexDiagnostic) {
        this.semanticDiagnostics.push(diagnostic);
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

    public readonly semanticDiagnostics = new AlphaTexDiagnosticBag();

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
            throw new UnsupportedFormatError('Error parsing alphaTex, check inner error for detials', e as Error);
        }

        if (this._parser.parserDiagnostics.hasErrors || this._parser.lexer.lexerDiagnostics.hasErrors) {
            throw new UnsupportedFormatError(
                'Error parsing alphaTex, check diagnostics for details',
                new AlphaTexErrorWithDiagnostics(
                    'There are errors in the parsed alphaTex, check the diagnostics for details',
                    this.lexerDiagnostics,
                    this.parserDiagnostics,
                    this.semanticDiagnostics
                )
            );
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

        if (this.semanticDiagnostics.hasErrors) {
            if (this._state.hasAnyProperData) {
                throw new AlphaTexErrorWithDiagnostics(
                    'There are errors in the parsed alphaTex, check the diagnostics for details',
                    this.lexerDiagnostics,
                    this.parserDiagnostics,
                    this.semanticDiagnostics
                );
            } else {
                throw new UnsupportedFormatError('No alphaTex data found');
            }
        }

        ModelUtils.consolidate(this._state.score);
        this._state.score.finish(this.settings);
        ModelUtils.trimEmptyBarsAtEnd(this._state.score);
        this._state.score.rebuildRepeatGroups();
        this._state.score.applyFlatSyncPoints(this._state._syncPoints);
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
        this._state.score.tempo = 120;
        this._state.score.tempoLabel = '';
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

    private metaData(score: AlphaTexScoreNode) {
        for (const metaData of score.metaData) {
            if (this.handleStructuralMetaData(metaData)) {
                continue;
            }

            let result = this._handler.applyScoreMetaData(this, this._state.score, metaData);

            // fallback to staff meta
            if (result === ApplyNodeResult.NotAppliedUnrecognizedMarker) {
                result = this._handler.applyStaffMetaData(this, this._state.currentStaff, metaData);
            }

            // allow bar meta (remember it for later)
            if (
                result === ApplyNodeResult.NotAppliedUnrecognizedMarker &&
                this._handler.knownBarMetaDataTags.has(metaData.tag.tag.text.toLowerCase())
            ) {
                this._state._initialBarMetaData.push(metaData);
                this._state.hasAnyProperData = true;
                result = ApplyNodeResult.Applied;
            }

            switch (result) {
                case ApplyNodeResult.Applied:
                case ApplyNodeResult.NotAppliedSemanticError:
                    this._state.hasAnyProperData = true;
                    break;
                case ApplyNodeResult.NotAppliedUnrecognizedMarker:
                    this.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT206,
                        message: `Unrecognized metadata '${metaData.tag.tag.text}'.`,
                        severity: AlphaTexDiagnosticsSeverity.Error,
                        start: metaData.start,
                        end: metaData.end
                    });
                    break;
            }
        }

        // NOTE: we do not validate that we have a "dot" after initial metadata
        // with the new parser this separator is not really needed
        // we simply allow all metadata on start,
        // in alphaTex2 we can remove the separate top level meta
        // and simply check for known tags on the initial bar.
    }

    private bars(node: AlphaTexScoreNode) {
        if (node.bars.length > 0) {
            for (const b of node.bars) {
                this.bar(b);
            }
        } else {
            this.newBar(this._state.currentStaff);
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
        switch (node.noteValue.nodeType) {
            case AlphaTexNodeType.NumberLiteral:
                fret = (node.noteValue as AlphaTexNumberLiteral).value;
                if (this._state.currentStaff.isPercussion && !PercussionMapper.instrumentArticulations.has(fret)) {
                    this.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT209,
                        message: `Unexpected percussion articulation value '${fret}', expected: oneOf(${Array.from(PercussionMapper.instrumentArticulations.keys()).join(',')}).`,
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
                if (this._state.currentStaff.isPercussion) {
                    const articulationName = str.toLowerCase();
                    if (this._state.percussionArticulationNames.has(articulationName)) {
                        fret = this._state.percussionArticulationNames.get(articulationName)!;
                    } else {
                        this.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected percussion articulation value '${articulationName}', expected: oneOf(${Array.from(this._state.percussionArticulationNames.keys()).join(',')}).`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: node.noteValue.start,
                            end: node.noteValue.end
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
                                this.makeStaffPitched(this._state.currentStaff);
                            }

                            if (this._state.currentStaff.isStringed) {
                                this.addSemanticDiagnostic({
                                    code: AlphaTexDiagnosticCode.AT215,
                                    message: `Cannot use pitched note value '${str}' on string staff, please specify notes using the 'fret.string' syntax.`,
                                    severity: AlphaTexDiagnosticsSeverity.Error,
                                    start: node.noteValue.start,
                                    end: node.noteValue.end
                                });
                                return;
                            }

                            if (this._state.currentStaff.isPercussion) {
                                this.addSemanticDiagnostic({
                                    code: AlphaTexDiagnosticCode.AT216,
                                    message: `Cannot use pitched note value '${str}' on percussion staff, please specify percussion articulations with numbers or names.`,
                                    severity: AlphaTexDiagnosticsSeverity.Error,
                                    start: node.noteValue.start,
                                    end: node.noteValue.end
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
                                start: node.noteValue.start,
                                end: node.noteValue.end
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
            octave === -1 && this._state.currentStaff.tuning.length > 0 && !this._state.currentStaff.isPercussion;
        let noteString: number = -1;
        if (isFretted) {
            // Fret [Dot] String
            if (!node.noteString) {
                this.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT218,
                    message: `Missing string for fretted note.`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: node.noteValue.end,
                    end: node.noteValue.end
                });
                return;
            }

            noteString = node.noteString!.value;
            if (noteString < 1 || noteString > this._state.currentStaff.tuning.length) {
                this.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT219,
                    message: `Note string is out of range. Available range: 1-${this._state.currentStaff.tuning.length}`,
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
            note.string = this._state.currentStaff.tuning.length - (noteString - 1);
            note.isDead = isDead;
            note.isTieDestination = isTie;
            if (!isTie) {
                note.fret = fret;
            }
        } else if (this._state.currentStaff.isPercussion) {
            const articulationValue = fret;
            let articulationIndex: number = 0;
            if (this._state.articulationValueToIndex.has(articulationValue)) {
                articulationIndex = this._state.articulationValueToIndex.get(articulationValue)!;
            } else {
                articulationIndex = this._state.currentTrack.percussionArticulations.length;
                const articulation = PercussionMapper.getArticulationByInputMidiNumber(articulationValue);
                if (articulation === null) {
                    this.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT209,
                        message: `Unexpected articulation value '${articulationValue}', expected: oneOf(${Array.from(PercussionMapper.instrumentArticulations.keys()).join(',')}).`,
                        severity: AlphaTexDiagnosticsSeverity.Error,
                        start: node.noteValue.end,
                        end: node.noteValue.end
                    });
                    return;
                }

                this._state.currentTrack.percussionArticulations.push(articulation!);
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
            !this._state.staffDisplayTranspositionApplied.has(this._state.currentStaff) &&
            !this._state.staffHasExplicitDisplayTransposition.has(this._state.currentStaff)
        ) {
            const program = this._state.currentStaff.track.playbackInfo.program;
            if (ModelUtils.displayTranspositionPitches.has(program)) {
                // guitar E4 B3 G3 D3 A2 E2
                this._state.currentStaff.displayTranspositionPitch =
                    ModelUtils.displayTranspositionPitches.get(program)!;
            } else {
                this._state.currentStaff.displayTranspositionPitch = 0;
            }
            this._state.staffDisplayTranspositionApplied.add(this._state.currentStaff);
        }
    }

    private detectTuningForStaff() {
        // detect tuning for staff
        const program = this._state.currentStaff.track.playbackInfo.program;
        if (
            !this._state.staffTuningApplied.has(this._state.currentStaff) &&
            !this._state.staffHasExplicitTuning.has(this._state.currentStaff)
        ) {
            // reset to defaults
            this._state.currentStaff.stringTuning.tunings = [];

            if (program === 15) {
                // dulcimer E4 B3 G3 D3 A2 E2
                this._state.currentStaff.stringTuning.tunings = Tuning.getDefaultTuningFor(6)!.tunings;
            } else if (program >= 24 && program <= 31) {
                // guitar E4 B3 G3 D3 A2 E2
                this._state.currentStaff.stringTuning.tunings = Tuning.getDefaultTuningFor(6)!.tunings;
            } else if (program >= 32 && program <= 39) {
                // bass G2 D2 A1 E1
                this._state.currentStaff.stringTuning.tunings = [43, 38, 33, 28];
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
                this._state.currentStaff.stringTuning.tunings = [52, 57, 50, 43];
            } else if (program === 41) {
                // viola A3 D3 G2 C2
                this._state.currentStaff.stringTuning.tunings = [57, 50, 43, 36];
            } else if (program === 42) {
                // cello A2 D2 G1 C1
                this._state.currentStaff.stringTuning.tunings = [45, 38, 31, 24];
            } else if (program === 43) {
                // contrabass
                // G2 D2 A1 E1
                this._state.currentStaff.stringTuning.tunings = [43, 38, 33, 28];
            } else if (program === 105) {
                // banjo
                // D3 B2 G2 D2 G3
                this._state.currentStaff.stringTuning.tunings = [50, 47, 43, 38, 55];
            } else if (program === 106) {
                // shamisen
                // A3 E3 A2
                this._state.currentStaff.stringTuning.tunings = [57, 52, 45];
            } else if (program === 107) {
                // koto
                // E3 A2 D2 G1
                this._state.currentStaff.stringTuning.tunings = [52, 45, 38, 31];
            } else if (program === 110) {
                // Fiddle
                // E4 A3 D3 G2
                this._state.currentStaff.stringTuning.tunings = [64, 57, 50, 43];
            }

            this._state.staffTuningApplied.add(this._state.currentStaff);
        }
    }

    private barMeta(node: AlphaTexBarNode): Bar {
        let bar: Bar | undefined = undefined;

        // bar meta
        for (const m of node.metaData) {
            // handle structural meta
            let result = this._handler.applyStructuralMetaData(this, m);
            switch (result) {
                case ApplyNodeResult.Applied:
                case ApplyNodeResult.NotAppliedSemanticError:
                    // need for a new bar
                    bar = undefined;
                    this._state.hasAnyProperData = true;
                    continue;
            }

            if (this._handler.knownStaffMetaDataTags.has(m.tag.tag.text.toLowerCase())) {
                result = this._handler.applyStaffMetaData(this, this._state.currentStaff, m);

                switch (result) {
                    case ApplyNodeResult.Applied:
                    case ApplyNodeResult.NotAppliedSemanticError:
                        this._state.hasAnyProperData = true;
                        break;
                    case ApplyNodeResult.NotAppliedUnrecognizedMarker:
                        this.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT206,
                            message: `Unrecognized metadata '${m.tag.tag.text}'.`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: m.start,
                            end: m.end
                        });
                        break;
                }
            } else if (this._handler.knownBarMetaDataTags.has(m.tag.tag.text.toLowerCase())) {
                if (!bar) {
                    bar = this.newBar(this._state.currentStaff);
                }

                this.applyBarMetaData(bar, m);
            } else {
                const knownMeta = Array.from(this._handler.knownBarMetaDataTags).join(',');
                this.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT206,
                    message: `Unrecognized metadata '${m.tag.tag.text}', expected one of: ${knownMeta}`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: m.tag.start,
                    end: m.tag.end
                });
            }
        }

        if (!bar) {
            bar = this.newBar(this._state.currentStaff);
        }

        return bar;
    }
    private applyBarMetaData(bar: Bar, m: AlphaTexMetaDataNode) {
        const result = this._handler.applyBarMetaData(this, bar, m);

        switch (result) {
            case ApplyNodeResult.Applied:
            case ApplyNodeResult.NotAppliedSemanticError:
                this._state.hasAnyProperData = true;
                break;
            case ApplyNodeResult.NotAppliedUnrecognizedMarker:
                this.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT206,
                    message: `Unrecognized metadata '${m.tag.tag.text}'.`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: m.start,
                    end: m.end
                });
                break;
        }
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

        if (this._state.currentStaff.bars.length > this._state.score.masterBars.length) {
            const master = new MasterBar();
            this._state.score.addMasterBar(master);
            if (master.index > 0) {
                master.timeSignatureDenominator = master.previousMasterBar!.timeSignatureDenominator;
                master.timeSignatureNumerator = master.previousMasterBar!.timeSignatureNumerator;
                master.tripletFeel = master.previousMasterBar!.tripletFeel;
            }
        }

        if (this._state._initialBarMetaData.length > 0) {
            for (const metaData of this._state._initialBarMetaData) {
                this.applyBarMetaData(newBar, metaData);
            }
            this._state._initialBarMetaData.splice(0, this._state._initialBarMetaData.length);
        }

        return newBar;
    }

    private syncPoints(score: AlphaTexScoreNode) {
        for (const syncPoint of score.syncPoints) {
            const flat = this._handler.buildSyncPoint(this, syncPoint);
            if (flat) {
                this._state._syncPoints.push(flat);
            }
        }
    }

    private handleStructuralMetaData(metaData: AlphaTexMetaDataNode) {
        const result = this._handler.applyStructuralMetaData(this, metaData);
        switch (result) {
            case ApplyNodeResult.Applied:
            case ApplyNodeResult.NotAppliedSemanticError:
                this._state.hasAnyProperData = true;
                return true;
            // case ApplyMetaDataResult.NotAppliedUnrecognizedMeta:
            default:
                return false;
        }
    }

    public startNewStaff(): Staff {
        this._state.ignoredInitialVoice = false;

        if (this._state.currentTrack.staves[0].bars.length > 0) {
            const previousWasPercussion = this._state.currentStaff.isPercussion;
            this._state.currentTrack.ensureStaveCount(this._state.currentTrack.staves.length + 1);
            const staff = this._state.currentTrack.staves[this._state.currentTrack.staves.length - 1];
            this.beginStaff(staff);

            if (previousWasPercussion) {
                this.applyPercussionStaff(this._state.currentStaff);
            }

            this._state.currentDynamics = DynamicValue.F;
        }
        return this._state.currentStaff;
    }

    public applyPercussionStaff(staff: Staff) {
        staff.isPercussion = true;
        staff.showTablature = false;
        staff.track.playbackInfo.program = 0;
    }

    public startNewTrack(): Track {
        this._state.ignoredInitialVoice = false;

        // new track starting? - if no masterbars it's the \track of the initial track.
        if (this._state.ignoredInitialTrack || this._state.score.masterBars.length > 0) {
            this.newTrack();
        } else {
            this._state.ignoredInitialTrack = true;
        }

        return this._state.currentTrack;
    }

    public startNewVoice() {
        if (
            this._state.voiceIndex === 0 &&
            (this._state.currentStaff.bars.length === 0 ||
                (this._state.currentStaff.bars.length === 1 &&
                    this._state.currentStaff.bars[0].isEmpty &&
                    !this._state.ignoredInitialVoice))
        ) {
            // voice marker on the begining of the first voice without any bar yet?
            // -> ignore
            this._state.ignoredInitialVoice = true;
            return;
        }
        // create directly a new empty voice for all bars
        for (const b of this._state.currentStaff.bars) {
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
