// unfortunately the "old" alphaTex syntax had no strict delimiters
// for values and properties. That's why we need to parse the properties exactly
// as needed for the identifiers. In an alphaTex2 we should make this parsing simpler.
// the parser should not need to do that semantic checks, that's the importers job
// but we emit "Hint" diagnostics for now.

import { AlphaTex1EnumMappings } from '@src/importer/alphaTex/AlphaTex1EnumMappings';
import {
    AlphaTex1LanguageDefinitions,
    type ValueListParseTypesExtended,
    ValueListParseTypesMode
} from '@src/importer/alphaTex/AlphaTex1LanguageDefinitions';
import {
    type AlphaTexAstNode,
    type AlphaTexIdentifier,
    type AlphaTexMetaDataNode,
    AlphaTexNodeType,
    type AlphaTexNumberLiteral,
    type AlphaTexPropertyNode,
    type AlphaTexTextNode,
    type AlphaTexValueList,
    type IAlphaTexValueListItem
} from '@src/importer/alphaTex/AlphaTexAst';
import {
    AlphaTexDiagnosticCode,
    AlphaTexDiagnosticsSeverity,
    type IAlphaTexImporter
} from '@src/importer/alphaTex/AlphaTexShared';
import { Atnf } from '@src/importer/alphaTex/ATNF';
import {
    ApplyNodeResult,
    ApplyStructuralMetaDataResult,
    type IAlphaTexLanguageImportHandler
} from '@src/importer/alphaTex/IAlphaTexLanguageImportHandler';
import { GeneralMidi } from '@src/midi/GeneralMidi';
import { AccentuationType } from '@src/model/AccentuationType';
import { Automation, AutomationType, type FlatSyncPoint } from '@src/model/Automation';
import { type Bar, BarLineStyle, SustainPedalMarker, SustainPedalMarkerType } from '@src/model/Bar';
import { BarreShape } from '@src/model/BarreShape';
import { type Beat, BeatBeamingMode } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BendStyle } from '@src/model/BendStyle';
import { BrushType } from '@src/model/BrushType';
import { Chord } from '@src/model/Chord';
import { Clef } from '@src/model/Clef';
import { Color } from '@src/model/Color';
import { CrescendoType } from '@src/model/CrescendoType';
import { Duration } from '@src/model/Duration';
import { FadeType } from '@src/model/FadeType';
import { Fermata } from '@src/model/Fermata';
import { Fingers } from '@src/model/Fingers';
import { GolpeType } from '@src/model/GolpeType';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { Lyrics } from '@src/model/Lyrics';
import type { MasterBar } from '@src/model/MasterBar';
import { ModelUtils } from '@src/model/ModelUtils';
import type { Note } from '@src/model/Note';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { NoteOrnament } from '@src/model/NoteOrnament';
import { Ottavia } from '@src/model/Ottavia';
import { PercussionMapper } from '@src/model/PercussionMapper';
import { PickStroke } from '@src/model/PickStroke';
import type { RenderStylesheet } from '@src/model/RenderStylesheet';
import { HeaderFooterStyle, Score, ScoreStyle, ScoreSubElement } from '@src/model/Score';
import { Section } from '@src/model/Section';
import { SimileMark } from '@src/model/SimileMark';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { Tuning } from '@src/model/Tuning';
import { VibratoType } from '@src/model/VibratoType';
import { WahPedal } from '@src/model/WahPedal';
import { BeamDirection } from '@src/rendering/_barrel';
import { SynthConstants } from '@src/synth/SynthConstants';

/**
 * @internal
 */
export class AlphaTex1LanguageHandler implements IAlphaTexLanguageImportHandler {
    public static readonly instance = new AlphaTex1LanguageHandler();

    public applyScoreMetaData(
        importer: IAlphaTexImporter,
        score: Score,
        metaData: AlphaTexMetaDataNode
    ): ApplyNodeResult {
        const result = this._checkValueListTypes(
            importer,
            [AlphaTex1LanguageDefinitions.scoreMetaDataValueListTypes],
            metaData,
            metaData.tag.tag.text.toLowerCase(),
            metaData.values
        );
        if (result !== undefined) {
            return result!;
        }

        switch (metaData.tag.tag.text.toLowerCase()) {
            case 'title':
                score.title = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this._headerFooterStyle(importer, score, ScoreSubElement.Title, metaData);
                return ApplyNodeResult.Applied;
            case 'subtitle':
                score.subTitle = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this._headerFooterStyle(importer, score, ScoreSubElement.SubTitle, metaData);
                return ApplyNodeResult.Applied;
            case 'artist':
                score.artist = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this._headerFooterStyle(importer, score, ScoreSubElement.Artist, metaData);
                return ApplyNodeResult.Applied;
            case 'album':
                score.album = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this._headerFooterStyle(importer, score, ScoreSubElement.Album, metaData);
                return ApplyNodeResult.Applied;
            case 'words':
                score.words = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this._headerFooterStyle(importer, score, ScoreSubElement.Words, metaData);
                return ApplyNodeResult.Applied;
            case 'music':
                score.music = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this._headerFooterStyle(importer, score, ScoreSubElement.Music, metaData);
                return ApplyNodeResult.Applied;
            case 'copyright':
                score.copyright = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this._headerFooterStyle(importer, score, ScoreSubElement.Copyright, metaData);
                return ApplyNodeResult.Applied;
            case 'instructions':
                score.instructions = (metaData.values!.values[0] as AlphaTexTextNode).text;
                return ApplyNodeResult.Applied;
            case 'notices':
                score.notices = (metaData.values!.values[0] as AlphaTexTextNode).text;
                return ApplyNodeResult.Applied;
            case 'tab':
                score.tab = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this._headerFooterStyle(importer, score, ScoreSubElement.Transcriber, metaData);
                return ApplyNodeResult.Applied;
            case 'copyright2':
                this._headerFooterStyle(importer, score, ScoreSubElement.CopyrightSecondLine, metaData, 0);
                return ApplyNodeResult.Applied;
            case 'wordsandmusic':
                this._headerFooterStyle(importer, score, ScoreSubElement.WordsAndMusic, metaData, 0);
                return ApplyNodeResult.Applied;
            case 'defaultsystemslayout':
                score.defaultSystemsLayout = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                return ApplyNodeResult.Applied;
            case 'systemslayout':
                for (const v of metaData.values!.values) {
                    score.systemsLayout.push((v as AlphaTexNumberLiteral).value);
                }
                return ApplyNodeResult.Applied;
            case 'hidedynamics':
                score.stylesheet.hideDynamics = true;
                return ApplyNodeResult.Applied;
            case 'showdynamics':
                score.stylesheet.hideDynamics = false;
                return ApplyNodeResult.Applied;
            case 'bracketextendmode':
                const bracketExtendMode = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    metaData.values!,
                    'bracket extend mode',
                    AlphaTex1EnumMappings.bracketExtendModes
                );
                if (bracketExtendMode === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.bracketExtendMode = bracketExtendMode!;
                return ApplyNodeResult.Applied;
            case 'usesystemsignseparator':
                score.stylesheet.useSystemSignSeparator = true;
                return ApplyNodeResult.Applied;
            case 'multibarrest':
                score.stylesheet.multiTrackMultiBarRest = true;
                return ApplyNodeResult.Applied;
            case 'singletracktracknamepolicy':
                const singleTrackTrackNamePolicy = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    metaData.values!,
                    'track name policy',
                    AlphaTex1EnumMappings.trackNamePolicies
                );
                if (singleTrackTrackNamePolicy === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.singleTrackTrackNamePolicy = singleTrackTrackNamePolicy!;
                return ApplyNodeResult.Applied;
            case 'multitracktracknamepolicy':
                const multiTrackTrackNamePolicy = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    metaData.values!,
                    'track name policy',
                    AlphaTex1EnumMappings.trackNamePolicies
                );
                if (multiTrackTrackNamePolicy === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.multiTrackTrackNamePolicy = multiTrackTrackNamePolicy!;
                return ApplyNodeResult.Applied;
            case 'firstsystemtracknamemode':
                const firstSystemTrackNameMode = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    metaData.values!,
                    'track name mode',
                    AlphaTex1EnumMappings.trackNameMode
                );
                if (firstSystemTrackNameMode === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.firstSystemTrackNameMode = firstSystemTrackNameMode!;
                return ApplyNodeResult.Applied;
            case 'othersystemstracknamemode':
                const otherSystemsTrackNameMode = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    metaData.values!,
                    'track name mode',
                    AlphaTex1EnumMappings.trackNameMode
                );
                if (otherSystemsTrackNameMode === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.otherSystemsTrackNameMode = otherSystemsTrackNameMode!;
                return ApplyNodeResult.Applied;
            case 'firstsystemtracknameorientation':
                const firstSystemTrackNameOrientation = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    metaData.values!,
                    'track name orientation',
                    AlphaTex1EnumMappings.trackNameOrientations
                );
                if (firstSystemTrackNameOrientation === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.firstSystemTrackNameOrientation = firstSystemTrackNameOrientation!;
                return ApplyNodeResult.Applied;
            case 'othersystemstracknameorientation':
                const otherSystemsTrackNameOrientation = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    metaData.values!,
                    'track name orientation',
                    AlphaTex1EnumMappings.trackNameOrientations
                );
                if (otherSystemsTrackNameOrientation === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.otherSystemsTrackNameOrientation = otherSystemsTrackNameOrientation!;
                return ApplyNodeResult.Applied;
            default:
                return ApplyNodeResult.NotAppliedUnrecognizedMarker;
        }
    }

    private _checkValueListTypes(
        importer: IAlphaTexImporter,
        lookupList: Map<string, ValueListParseTypesExtended[] | undefined>[],
        parent: AlphaTexAstNode,
        tag: string,
        values: AlphaTexValueList | undefined
    ): ApplyNodeResult | undefined {
        const lookup = lookupList.find(l => l.has(tag));
        if (!lookup) {
            return ApplyNodeResult.NotAppliedUnrecognizedMarker;
        }

        const types = lookup.get(tag);
        if (types === undefined) {
            if (values) {
                importer.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT300,
                    message: `Expected no values, but found some. Values are ignored.`,
                    start: values.start,
                    end: values.end,
                    severity: AlphaTexDiagnosticsSeverity.Warning
                });
            }
            return undefined;
        }

        if (!this._validateValueListTypes(importer, types, parent, values)) {
            return ApplyNodeResult.NotAppliedSemanticError;
        }

        return undefined;
    }

    public applyStaffMetaData(
        importer: IAlphaTexImporter,
        staff: Staff,
        metaData: AlphaTexMetaDataNode
    ): ApplyNodeResult {
        const result = this._checkValueListTypes(
            importer,
            [AlphaTex1LanguageDefinitions.staffMetaDataValueListTypes],
            metaData,
            metaData.tag.tag.text.toLowerCase(),
            metaData.values
        );
        if (result !== undefined) {
            return result!;
        }

        switch (metaData.tag.tag.text.toLowerCase()) {
            case 'capo':
                staff.capo = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                return ApplyNodeResult.Applied;
            case 'tuning':
                const tuning: number[] = [];
                let hideTuning = false;
                let tuningName = '';
                for (let i = 0; i < metaData.values!.values.length; i++) {
                    const v = metaData.values!.values[i];
                    const text = (v as AlphaTexTextNode).text;
                    switch (text) {
                        case 'piano':
                        case 'none':
                        case 'voice':
                            importer.makeStaffPitched(staff);
                            i = metaData.values!.values.length;
                            break;
                        case 'hide':
                            hideTuning = true;
                            break;
                        default:
                            const t = ModelUtils.parseTuning(text);
                            if (t) {
                                tuning.push(t.realValue);
                            } else if (i === metaData.values!.values.length - 1 && tuning.length > 0) {
                                tuningName = text;
                            } else {
                                const tuningLetters = Array.from(ModelUtils.tuningLetters).join(',');
                                const accidentalModes = Array.from(ModelUtils.accidentalModeMapping.keys()).join(',');
                                importer.addSemanticDiagnostic({
                                    code: AlphaTexDiagnosticCode.AT209,
                                    message: `Unexpected tuning value '${text}', expected: <note><accidental><octave> where <note>=oneOf(${tuningLetters}) <accidental>=oneOf(${accidentalModes}), <octave>=number`,
                                    start: v.start,
                                    end: v.end,
                                    severity: AlphaTexDiagnosticsSeverity.Error
                                });
                            }
                            break;
                    }
                }

                importer.state.staffHasExplicitTuning.add(staff);
                importer.state.staffTuningApplied.delete(staff);
                staff.stringTuning = new Tuning();
                staff.stringTuning.tunings = tuning;
                staff.stringTuning.name = tuningName;
                if (hideTuning) {
                    if (!staff.track.score.stylesheet.perTrackDisplayTuning) {
                        staff.track.score.stylesheet.perTrackDisplayTuning = new Map<number, boolean>();
                    }
                    staff.track.score.stylesheet.perTrackDisplayTuning!.set(staff.track.index, false);
                }
                return ApplyNodeResult.Applied;
            case 'instrument':
                importer.state.staffTuningApplied.delete(staff);
                this._readTrackInstrument(importer, staff.track, metaData.values!);

                return ApplyNodeResult.Applied;
            case 'bank':
                staff.track.playbackInfo.bank = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                return ApplyNodeResult.Applied;
            case 'lyrics':
                const lyrics: Lyrics = new Lyrics();
                lyrics.startBar = 0;
                lyrics.text = '';
                if (metaData.values!.values.length === 2) {
                    lyrics.startBar = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                    lyrics.text = (metaData.values!.values[1] as AlphaTexTextNode).text;
                } else {
                    lyrics.text = (metaData.values!.values[0] as AlphaTexTextNode).text;
                }
                importer.state.lyrics.get(staff.track.index)!.push(lyrics);

                return ApplyNodeResult.Applied;
            case 'chord':
                const chord = new Chord();
                this._chordProperties(importer, chord, metaData);
                chord.name = (metaData.values!.values[0] as AlphaTexTextNode).text;

                for (let i = 1; i < metaData.values!.values.length; i++) {
                    const v = metaData.values!.values[i];
                    if (v.nodeType === AlphaTexNodeType.Number) {
                        chord.strings.push((v as AlphaTexNumberLiteral).value);
                    } else if (v.nodeType === AlphaTexNodeType.Ident) {
                        const txt = (v as AlphaTexIdentifier).text;
                        if (txt === 'x') {
                            chord.strings.push(-1);
                        } else {
                            importer.addSemanticDiagnostic({
                                code: AlphaTexDiagnosticCode.AT209,
                                message: `Unexpected chord value '${txt}', expected: 'x'`,
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: v.start,
                                end: v.end
                            });
                        }
                    }
                }
                staff.addChord(AlphaTex1LanguageHandler._getChordId(staff, chord.name), chord);
                return ApplyNodeResult.Applied;
            case 'articulation':
                const percussionArticulationNames = importer.state.percussionArticulationNames;
                const articulationName = (metaData.values!.values[0] as AlphaTexTextNode).text;
                if (articulationName === 'defaults') {
                    for (const [defaultName, defaultValue] of PercussionMapper.instrumentArticulationNames) {
                        percussionArticulationNames.set(defaultName.toLowerCase(), defaultValue);
                        percussionArticulationNames.set(
                            AlphaTex1LanguageHandler._toArticulationId(defaultName),
                            defaultValue
                        );
                    }
                    return ApplyNodeResult.Applied;
                }

                if (metaData.values!.values.length === 2) {
                    const number = (metaData.values!.values[1] as AlphaTexNumberLiteral).value;
                    if (PercussionMapper.instrumentArticulations.has(number)) {
                        percussionArticulationNames.set(articulationName.toLowerCase(), number);
                        return ApplyNodeResult.Applied;
                    } else {
                        const articulations = Array.from(PercussionMapper.instrumentArticulations.keys())
                            .map(n => `${n}`)
                            .join(',');
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected articulation value '${number}', expected: ${articulations}`,
                            start: metaData.values!.values[1].start,
                            end: metaData.values!.values[1].end,
                            severity: AlphaTexDiagnosticsSeverity.Error
                        });
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                }

                return ApplyNodeResult.Applied;
            case 'accidentals':
                return AlphaTex1LanguageHandler._handleAccidentalMode(importer, metaData.values!);
            case 'displaytranspose':
                staff.displayTranspositionPitch = (metaData.values!.values[0] as AlphaTexNumberLiteral).value * -1;
                importer.state.staffHasExplicitDisplayTransposition.add(staff);
                return ApplyNodeResult.Applied;
            case 'transpose':
                staff.transpositionPitch = (metaData.values!.values[0] as AlphaTexNumberLiteral).value * -1;
                return ApplyNodeResult.Applied;
            default:
                return ApplyNodeResult.NotAppliedUnrecognizedMarker;
        }
    }

    public applyBarMetaData(importer: IAlphaTexImporter, bar: Bar, metaData: AlphaTexMetaDataNode): ApplyNodeResult {
        const result = this._checkValueListTypes(
            importer,
            [AlphaTex1LanguageDefinitions.barMetaDataValueListTypes],
            metaData,
            metaData.tag.tag.text.toLowerCase(),
            metaData.values
        );
        if (result !== undefined) {
            return result!;
        }

        switch (metaData.tag.tag.text.toLowerCase()) {
            case 'sync':
                const syncPoint = this._buildSyncPoint(metaData);
                importer.state.syncPoints.push(syncPoint);
                return ApplyNodeResult.Applied;
            case 'tempo':
                let ti = 0;
                const tempo = (metaData.values!.values[ti++] as AlphaTexNumberLiteral).value;
                let tempoLabel = '';
                let isVisible = true;
                let ratioPosition = 0;

                while (ti < metaData.values!.values.length) {
                    switch (metaData.values!.values[ti].nodeType) {
                        case AlphaTexNodeType.Ident:
                        case AlphaTexNodeType.String:
                            const txt = (metaData.values!.values[ti] as AlphaTexTextNode).text;
                            if (txt === 'hide') {
                                isVisible = false;
                            } else {
                                tempoLabel = txt;
                            }
                            break;
                        case AlphaTexNodeType.Number:
                            ratioPosition = (metaData.values!.values[ti] as AlphaTexNumberLiteral).value;
                            break;
                    }
                    ti++;
                }

                let tempoAutomation = bar.masterBar.tempoAutomations.find(a => a.ratioPosition === ratioPosition);
                if (!tempoAutomation) {
                    tempoAutomation = new Automation();
                    bar.masterBar.tempoAutomations.push(tempoAutomation);
                }
                tempoAutomation.isLinear = false;
                tempoAutomation.type = AutomationType.Tempo;
                tempoAutomation.value = tempo;
                tempoAutomation.text = tempoLabel;
                tempoAutomation.ratioPosition = ratioPosition;
                tempoAutomation.isVisible = isVisible;

                return ApplyNodeResult.Applied;
            case 'rc':
                bar.masterBar.repeatCount = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                return ApplyNodeResult.Applied;
            case 'ae':
                for (const e of metaData.values!.values) {
                    if (e.nodeType === AlphaTexNodeType.Number) {
                        const num = (e as AlphaTexNumberLiteral).value;
                        if (num < 1 || num > 31) {
                            importer.addSemanticDiagnostic({
                                code: AlphaTexDiagnosticCode.AT211,
                                message: `Value is out of valid range. Allowed range: %s, Actual Value: %s`,
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: e.start,
                                end: e.end
                            });
                            return ApplyNodeResult.NotAppliedSemanticError;
                        } else {
                            // Alternate endings bitflag starts from 0
                            bar.masterBar.alternateEndings |= 1 << (num - 1);
                        }
                    } else {
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT202,
                            message: `Unexpected '${AlphaTexNodeType[e.nodeType]}' token. Expected one of following: ${AlphaTexNodeType[AlphaTexNodeType.Number]}`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: e.start,
                            end: e.end
                        });
                    }
                }
                return ApplyNodeResult.Applied;
            case 'ts':
                switch (metaData.values!.values[0].nodeType) {
                    case AlphaTexNodeType.Number:
                        bar.masterBar.timeSignatureNumerator = (
                            metaData.values!.values[0] as AlphaTexNumberLiteral
                        ).value;
                        bar.masterBar.timeSignatureDenominator = (
                            metaData.values!.values[1] as AlphaTexNumberLiteral
                        ).value;
                        break;
                    case AlphaTexNodeType.Ident:
                    case AlphaTexNodeType.String:
                        const tsValue = (metaData.values!.values[0] as AlphaTexTextNode).text;
                        if (tsValue.toLowerCase() === 'common') {
                            bar.masterBar.timeSignatureCommon = true;
                            bar.masterBar.timeSignatureNumerator = 4;
                            bar.masterBar.timeSignatureDenominator = 4;
                        } else {
                            importer.addSemanticDiagnostic({
                                code: AlphaTexDiagnosticCode.AT209,
                                message: `Unexpected time signature value '${tsValue}', expected: common or two numbers`,
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: metaData.values!.values[0].start,
                                end: metaData.values!.values[0].end
                            });
                            return ApplyNodeResult.NotAppliedSemanticError;
                        }
                        break;
                }
                return ApplyNodeResult.Applied;
            case 'ks':
                const keySignature = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    metaData.values!,
                    'key signature',
                    AlphaTex1EnumMappings.keySignatures
                );
                if (keySignature === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }

                const keySignatureType = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    metaData.values!,
                    'key signature type',
                    AlphaTex1EnumMappings.keySignatureTypes
                );
                if (keySignatureType === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }

                bar.keySignature = keySignature!;
                bar.keySignatureType = keySignatureType!;

                return ApplyNodeResult.Applied;
            case 'clef':
                switch (metaData.values!.values[0].nodeType) {
                    case AlphaTexNodeType.Ident:
                    case AlphaTexNodeType.String:
                        const clef = AlphaTex1LanguageHandler._parseEnumValue(
                            importer,
                            metaData.values!,
                            'clef',
                            AlphaTex1EnumMappings.clefs
                        );
                        if (clef === undefined) {
                            return ApplyNodeResult.NotAppliedSemanticError;
                        }
                        bar.clef = clef!;
                        break;

                    case AlphaTexNodeType.Number:
                        const clefValue = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;

                        switch (clefValue) {
                            case 0:
                                bar.clef = Clef.Neutral;
                                break;
                            case 43:
                                bar.clef = Clef.G2;
                                break;
                            case 65:
                                bar.clef = Clef.F4;
                                break;
                            case 48:
                                bar.clef = Clef.C3;
                                break;
                            case 60:
                                bar.clef = Clef.C4;
                                break;
                            default:
                                importer.addSemanticDiagnostic({
                                    code: AlphaTexDiagnosticCode.AT209,
                                    message: `Unexpected clef value '${clefValue}', expected: ${Array.from(AlphaTex1EnumMappings.clefs.keys()).join(',')}`,
                                    severity: AlphaTexDiagnosticsSeverity.Error,
                                    start: metaData.values!.values[0].start,
                                    end: metaData.values!.values[0].end
                                });
                                return ApplyNodeResult.NotAppliedSemanticError;
                        }

                        break;
                }

                return ApplyNodeResult.Applied;
            case 'section':
                const section = new Section();
                if (metaData.values!.values.length === 1) {
                    section.text = (metaData.values!.values[0] as AlphaTexTextNode).text;
                } else {
                    section.marker = (metaData.values!.values[0] as AlphaTexTextNode).text;
                    section.text = (metaData.values!.values[1] as AlphaTexTextNode).text;
                }
                bar.masterBar.section = section;
                return ApplyNodeResult.Applied;
            case 'tf':
                switch (metaData.values!.values[0].nodeType) {
                    case AlphaTexNodeType.Ident:
                    case AlphaTexNodeType.String:
                        const tripletFeel = AlphaTex1LanguageHandler._parseEnumValue(
                            importer,
                            metaData.values!,
                            'triplet feel',
                            AlphaTex1EnumMappings.tripletFeels
                        );
                        if (tripletFeel === undefined) {
                            return ApplyNodeResult.NotAppliedSemanticError;
                        }
                        bar.masterBar.tripletFeel = tripletFeel!;
                        break;

                    case AlphaTexNodeType.Number:
                        const tripletFeelValue = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;

                        switch (tripletFeelValue) {
                            case 0:
                                bar.masterBar.tripletFeel = TripletFeel.NoTripletFeel;
                                break;
                            case 1:
                                bar.masterBar.tripletFeel = TripletFeel.Triplet16th;
                                break;
                            case 2:
                                bar.masterBar.tripletFeel = TripletFeel.Triplet8th;
                                break;
                            case 3:
                                bar.masterBar.tripletFeel = TripletFeel.Dotted16th;
                                break;
                            case 4:
                                bar.masterBar.tripletFeel = TripletFeel.Dotted8th;
                                break;
                            case 5:
                                bar.masterBar.tripletFeel = TripletFeel.Scottish16th;
                                break;
                            case 6:
                                bar.masterBar.tripletFeel = TripletFeel.Scottish8th;
                                break;
                            default:
                                importer.addSemanticDiagnostic({
                                    code: AlphaTexDiagnosticCode.AT209,
                                    message: `Unexpected triplet feel value '${tripletFeelValue}', expected: ${Array.from(AlphaTex1EnumMappings.tripletFeels.keys()).join(',')}`,
                                    severity: AlphaTexDiagnosticsSeverity.Error,
                                    start: metaData.values!.values[0].start,
                                    end: metaData.values!.values[0].end
                                });
                                return ApplyNodeResult.NotAppliedSemanticError;
                        }

                        break;
                }
                return ApplyNodeResult.Applied;
            case 'barlineleft':
                const barLineLeft = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    metaData.values!,
                    'bar line',
                    AlphaTex1EnumMappings.barLines
                );
                if (barLineLeft === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                bar.barLineLeft = barLineLeft!;
                return ApplyNodeResult.Applied;
            case 'barlineright':
                const barLineRight = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    metaData.values!,
                    'bar line',
                    AlphaTex1EnumMappings.barLines
                );
                if (barLineRight === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                bar.barLineRight = barLineRight!;
                return ApplyNodeResult.Applied;
            case 'accidentals':
                return AlphaTex1LanguageHandler._handleAccidentalMode(importer, metaData.values!);
            case 'jump':
                const direction = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    metaData.values!,
                    'direction',
                    AlphaTex1EnumMappings.directions
                );
                if (direction === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                bar.masterBar.addDirection(direction!);
                return ApplyNodeResult.Applied;
            case 'ottava':
                const ottava = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    metaData.values!,
                    'clef ottava',
                    AlphaTex1EnumMappings.ottavia
                );
                if (ottava === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                bar.clefOttava = ottava!;
                return ApplyNodeResult.Applied;
            case 'simile':
                const simile = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    metaData.values!,
                    'simile mark',
                    AlphaTex1EnumMappings.simileMarks
                );
                if (simile === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                bar.simileMark = simile!;
                return ApplyNodeResult.Applied;
            case 'width':
                bar.masterBar.displayWidth = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                bar.displayWidth = bar.masterBar.displayWidth;
                return ApplyNodeResult.Applied;
            case 'scale':
                bar.masterBar.displayScale = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                bar.displayScale = bar.masterBar.displayScale;
                return ApplyNodeResult.Applied;
            case 'spd':
                const sustainPedalDown = new SustainPedalMarker();
                sustainPedalDown.pedalType = SustainPedalMarkerType.Down;
                sustainPedalDown.ratioPosition = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                bar.sustainPedals.push(sustainPedalDown);
                return ApplyNodeResult.Applied;
            case 'spu':
                const sustainPedalUp = new SustainPedalMarker();
                sustainPedalUp.pedalType = SustainPedalMarkerType.Up;
                sustainPedalUp.ratioPosition = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                bar.sustainPedals.push(sustainPedalUp);
                return ApplyNodeResult.Applied;
            case 'sph':
                const sustainPedalHold = new SustainPedalMarker();
                sustainPedalHold.pedalType = SustainPedalMarkerType.Hold;
                sustainPedalHold.ratioPosition = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                bar.sustainPedals.push(sustainPedalHold);
                return ApplyNodeResult.Applied;
            case 'ft':
                bar.masterBar.isFreeTime = true;
                return ApplyNodeResult.Applied;
            case 'ro':
                bar.masterBar.isRepeatStart = true;
                return ApplyNodeResult.Applied;
            case 'ac':
                bar.masterBar.isAnacrusis = true;
                return ApplyNodeResult.Applied;
            case 'db':
                bar.masterBar.isDoubleBar = true;
                bar.barLineRight = BarLineStyle.LightLight;
                return ApplyNodeResult.Applied;
            default:
                return ApplyNodeResult.NotAppliedUnrecognizedMarker;
        }
    }

    private static _handleAccidentalMode(importer: IAlphaTexImporter, values: AlphaTexValueList): ApplyNodeResult {
        const accidentalMode = AlphaTex1LanguageHandler._parseEnumValue(
            importer,
            values,
            'accidental mode',
            AlphaTex1EnumMappings.accidentalModes
        );
        if (accidentalMode === undefined) {
            return ApplyNodeResult.NotAppliedSemanticError;
        }
        importer.state.accidentalMode = accidentalMode!;
        return ApplyNodeResult.Applied;
    }

    private static _toArticulationId(plain: string): string {
        return plain.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }

    private static _getChordId(currentStaff: Staff, chordName: string): string {
        return chordName.toLowerCase() + currentStaff.index + currentStaff.track.index;
    }

    private _buildSyncPoint(metaData: AlphaTexMetaDataNode): FlatSyncPoint {
        const barIndex = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
        const barOccurence = (metaData.values!.values[1] as AlphaTexNumberLiteral).value;
        const millisecondOffset = (metaData.values!.values[2] as AlphaTexNumberLiteral).value;
        let barPosition = 0;
        if (metaData.values!.values.length > 3) {
            barPosition = (metaData.values!.values[3] as AlphaTexNumberLiteral).value;
        }

        return {
            barIndex,
            barOccurence,
            barPosition,
            millisecondOffset
        };
    }

    private _validateValueListTypes(
        importer: IAlphaTexImporter,
        expectedValues: ValueListParseTypesExtended[],
        parent: AlphaTexAstNode,
        values: AlphaTexValueList | undefined
    ) {
        let error = false;
        let expectedIndex = 0;
        let actualIndex = 0;

        if (!values) {
            const anyRequired = expectedValues.some(
                v =>
                    v.parseMode === ValueListParseTypesMode.Required ||
                    v.parseMode === ValueListParseTypesMode.RequiredAsFloat ||
                    v.parseMode === ValueListParseTypesMode.RequiredAsValueList
            );
            if (anyRequired) {
                const expectedTypes = AlphaTex1LanguageHandler._buildExpectedTypesMessage(expectedValues);

                importer.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT210,
                    message: `Missing value. Expected following values: ${expectedTypes}`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: parent.start,
                    end: parent.end
                });
                return false;
            } else {
                return true;
            }
        }

        while (expectedIndex < expectedValues.length) {
            const expected = expectedValues[expectedIndex];

            const value: IAlphaTexValueListItem | undefined =
                actualIndex < values.values.length ? values.values[actualIndex] : undefined;

            // basic match
            if (value && expected.expectedTypes.has(value.nodeType)) {
                actualIndex++;
                switch (expected.parseMode) {
                    case ValueListParseTypesMode.OptionalAndStop:
                        // stop reading values
                        expectedIndex = expectedValues.length;
                        break;
                    case ValueListParseTypesMode.RequiredAsValueList:
                    case ValueListParseTypesMode.ValueListWithoutParenthesis:
                        // stay on current element
                        break;
                    default:
                        // advance to next item
                        expectedIndex++;
                        break;
                }
                continue;
            }

            const expectedTypes = AlphaTex1LanguageHandler._buildExpectedTypesMessage([expected]);

            // value list
            if (
                value &&
                value.nodeType === AlphaTexNodeType.Values &&
                (expected.parseMode === ValueListParseTypesMode.ValueListWithoutParenthesis ||
                    expected.parseMode === ValueListParseTypesMode.RequiredAsValueList)
            ) {
                actualIndex++;
                expectedIndex++;
                for (const item of (value as AlphaTexValueList).values) {
                    if (!expected.expectedTypes.has(item.nodeType)) {
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected list item value '${AlphaTexNodeType[value.nodeType]}', expected: ${expectedTypes}`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: item.start,
                            end: item.end
                        });
                    }
                }
                continue;
            }

            // error handling
            if (value) {
                switch (expected.parseMode) {
                    case ValueListParseTypesMode.ValueListWithoutParenthesis:
                        // end of value list as soon we have a different type
                        expectedIndex++;
                        break;
                    case ValueListParseTypesMode.Required:
                    case ValueListParseTypesMode.RequiredAsFloat:
                    case ValueListParseTypesMode.RequiredAsValueList:
                        error = true;
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected required value '${AlphaTexNodeType[value.nodeType]}', expected: ${expectedTypes}`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: value.start,
                            end: value.end
                        });
                        expectedIndex++;
                        actualIndex++;
                        break;
                    case ValueListParseTypesMode.Optional:
                    case ValueListParseTypesMode.OptionalAsFloat:
                    case ValueListParseTypesMode.OptionalAsFloatInValueList:
                    case ValueListParseTypesMode.OptionalAndStop:
                        // Skip value and try next
                        expectedIndex++;
                        break;
                }
            } else {
                // no value anymore
                switch (expected.parseMode) {
                    case ValueListParseTypesMode.Required:
                    case ValueListParseTypesMode.RequiredAsFloat:
                        error = true;
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT210,
                            message: `Missing values. Expected following values: ${expectedTypes}`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: values.end,
                            end: values.end
                        });
                        expectedIndex = expectedValues.length;
                        break;
                    case ValueListParseTypesMode.ValueListWithoutParenthesis:
                    case ValueListParseTypesMode.RequiredAsValueList:
                        // end of list
                        expectedIndex++;
                        break;
                    case ValueListParseTypesMode.Optional:
                    case ValueListParseTypesMode.OptionalAsFloat:
                    case ValueListParseTypesMode.OptionalAsFloatInValueList:
                    case ValueListParseTypesMode.OptionalAndStop:
                        // no value for optional item
                        expectedIndex++;
                        break;
                }
            }
        }

        // remaining values?
        if (actualIndex < values.values.length) {
            while (actualIndex < values.values.length) {
                const expectedTypes = AlphaTex1LanguageHandler._buildExpectedTypesMessage(expectedValues);
                const value = values.values[actualIndex];
                importer.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT209,
                    message: `Unexpected additional value '${AlphaTexNodeType[value.nodeType]}', expected: ${expectedTypes}`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: value.start,
                    end: value.end
                });
                actualIndex++;
            }
        }

        return !error;
    }

    private _headerFooterStyle(
        importer: IAlphaTexImporter,
        score: Score,
        element: ScoreSubElement,
        metaData: AlphaTexMetaDataNode,
        startIndex: number = 1
    ) {
        const remaining = metaData.values!.values.length - startIndex;
        if (remaining < 1) {
            return;
        }

        const style = ModelUtils.getOrCreateHeaderFooterStyle(score, element);
        if (style.isVisible === undefined) {
            style.isVisible = true;
        }

        const value = (metaData.values!.values[startIndex] as AlphaTexTextNode).text;
        if (value) {
            style.template = value;
        } else {
            style.isVisible = false;
        }

        if (remaining < 2) {
            return;
        }

        const textAlign = AlphaTex1LanguageHandler._parseEnumValue(
            importer,
            metaData.values!,
            'textAlign',
            AlphaTex1EnumMappings.textAligns,
            startIndex + 1
        );
        if (textAlign === undefined) {
            return;
        }
        style.textAlign = textAlign!;
    }

    private static _buildExpectedTypesMessage(values: ValueListParseTypesExtended[]) {
        const parts: string[] = [];

        for (const v of values) {
            const types = Array.from(v.expectedTypes)
                .map(t => AlphaTexNodeType[t])
                .join('|');
            switch (v.parseMode) {
                case ValueListParseTypesMode.Required:
                case ValueListParseTypesMode.RequiredAsFloat:
                    parts.push(`required(${types})`);
                    break;
                case ValueListParseTypesMode.Optional:
                case ValueListParseTypesMode.OptionalAsFloat:
                    parts.push(`optional(${types})`);
                    break;
                case ValueListParseTypesMode.OptionalAndStop:
                    parts.push(`only(${types})`);
                    break;
                case ValueListParseTypesMode.ValueListWithoutParenthesis:
                    parts.push(`listOf(${types})`);
                    break;
            }
        }

        return parts.join(',');
    }

    private _readTrackInstrument(importer: IAlphaTexImporter, track: Track, values: AlphaTexValueList) {
        switch (values!.values[0].nodeType) {
            case AlphaTexNodeType.Number:
                const instrument = (values!.values[0] as AlphaTexNumberLiteral).value;
                if (instrument >= 0 && instrument <= 127) {
                    track.playbackInfo.program = instrument;
                } else {
                    importer.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT211,
                        message: `Value is out of valid range. Allowed range: 0-127, Actual Value: ${instrument}`,
                        start: values!.values[0].start,
                        end: values!.values[0].end,
                        severity: AlphaTexDiagnosticsSeverity.Error
                    });
                }
                break;
            case AlphaTexNodeType.Ident:
            case AlphaTexNodeType.String:
                const instrumentName = (values!.values[0] as AlphaTexTextNode).text.toLowerCase();
                if (instrumentName === 'percussion') {
                    for (const staff of track.staves) {
                        importer.applyPercussionStaff(staff);
                    }
                    track.playbackInfo.primaryChannel = SynthConstants.PercussionChannel;
                    track.playbackInfo.secondaryChannel = SynthConstants.PercussionChannel;
                } else {
                    track.playbackInfo.program = GeneralMidi.getValue(instrumentName);
                }
                break;
        }
    }

    private _chordProperties(importer: IAlphaTexImporter, chord: Chord, metaData: AlphaTexMetaDataNode) {
        if (!metaData.properties) {
            return;
        }

        for (const p of metaData.properties.properties) {
            if (!this._checkProperty(importer, [AlphaTex1LanguageDefinitions.chordPropertyValueListTypes], p)) {
                continue;
            }

            switch (p.property.text.toLowerCase()) {
                case 'firstfret':
                    chord.firstFret = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    break;
                case 'showdiagram':
                    chord.showDiagram = AlphaTex1LanguageHandler._booleanLikeValue(p.values!.values, 0);
                    break;
                case 'showfingering':
                    chord.showFingering = AlphaTex1LanguageHandler._booleanLikeValue(p.values!.values, 0);
                    break;
                case 'showname':
                    chord.showName = AlphaTex1LanguageHandler._booleanLikeValue(p.values!.values, 0);
                    break;
                case 'barre':
                    chord.barreFrets = p.values!.values.map(v => (v as AlphaTexNumberLiteral).value);
                    break;
            }
        }
    }

    private static _booleanLikeValue(values: IAlphaTexValueListItem[], i: number): boolean {
        if (i >= values.length) {
            return true;
        }

        const v = values[i];
        switch (v.nodeType) {
            case AlphaTexNodeType.String:
            case AlphaTexNodeType.Ident:
                return (v as AlphaTexTextNode).text !== 'false';
            case AlphaTexNodeType.Number:
                return (v as AlphaTexNumberLiteral).value !== 0;
            default:
                return false;
        }
    }

    public applyStructuralMetaData(
        importer: IAlphaTexImporter,
        metaData: AlphaTexMetaDataNode
    ): ApplyStructuralMetaDataResult {
        switch (metaData.tag.tag.text.toLowerCase()) {
            case 'staff':
                const staff = importer.startNewStaff();
                this._staffProperties(importer, staff, metaData);

                return ApplyStructuralMetaDataResult.AppliedNewStaff;
            case 'track':
                const track = importer.startNewTrack();

                if (metaData.values && metaData.values.values.length > 0) {
                    track.name = (metaData.values!.values[0] as AlphaTexTextNode).text;
                    if (metaData.values!.values.length > 1) {
                        track.shortName = (metaData.values!.values[1] as AlphaTexTextNode).text;
                    }
                }

                this._trackProperties(importer, track, metaData);

                return ApplyStructuralMetaDataResult.AppliedNewTrack;
            case 'voice':
                importer.startNewVoice();
                return ApplyStructuralMetaDataResult.AppliedNewVoice;
            default:
                return ApplyStructuralMetaDataResult.NotAppliedUnrecognizedMarker;
        }
    }

    private _checkProperty(
        importer: IAlphaTexImporter,
        lookupList: Map<string, ValueListParseTypesExtended[] | undefined>[],
        p: AlphaTexPropertyNode
    ): boolean {
        const result = this._checkValueListTypes(importer, lookupList, p, p.property.text.toLowerCase(), p.values);
        if (result !== undefined) {
            switch (result!) {
                case ApplyNodeResult.Applied:
                case ApplyNodeResult.NotAppliedSemanticError:
                    return false;

                case ApplyNodeResult.NotAppliedUnrecognizedMarker:
                    const knownProps = lookupList.flatMap(l => Array.from(l.keys()));
                    Array.from(AlphaTex1LanguageDefinitions.chordPropertyValueListTypes.keys()).join(',');
                    importer.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT212,
                        message: `Unrecogized property '${p.property.text}', expected one of ${knownProps}`,
                        severity: AlphaTexDiagnosticsSeverity.Error,
                        start: p.start,
                        end: p.end
                    });
                    return false;
            }
        }

        return true;
    }

    private _staffProperties(importer: IAlphaTexImporter, staff: Staff, metaData: AlphaTexMetaDataNode) {
        if (!metaData.properties) {
            return;
        }

        let showStandardNotation: boolean = false;
        let showTabs: boolean = false;
        let showSlash: boolean = false;
        let showNumbered: boolean = false;

        for (const p of metaData.properties.properties) {
            if (!this._checkProperty(importer, [AlphaTex1LanguageDefinitions.staffPropertyValueListTypes], p)) {
                continue;
            }

            switch (p.property.text.toLowerCase()) {
                case 'score':
                    showStandardNotation = true;
                    if (p.values && p.values.values.length > 0) {
                        staff.standardNotationLineCount = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    }
                    break;
                case 'tabs':
                    showTabs = true;
                    break;
                case 'slash':
                    showSlash = true;
                    break;
                case 'numbered':
                    showNumbered = true;
                    break;
            }
        }

        if (showStandardNotation || showTabs || showSlash || showNumbered) {
            staff.showStandardNotation = showStandardNotation;
            staff.showTablature = showTabs;
            staff.showSlash = showSlash;
            staff.showNumbered = showNumbered;
        }
    }

    private _trackProperties(importer: IAlphaTexImporter, track: Track, metaData: AlphaTexMetaDataNode) {
        if (!metaData.properties) {
            return;
        }

        for (const p of metaData.properties.properties) {
            if (!this._checkProperty(importer, [AlphaTex1LanguageDefinitions.trackPropertyValueListTypes], p)) {
                continue;
            }

            switch (p.property.text.toLowerCase()) {
                case 'color':
                    try {
                        track.color = Color.fromJson((p.values!.values[0] as AlphaTexTextNode).text)!;
                    } catch {
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT213,
                            message: `Invalid format for color`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: p.values!.values[0].start,
                            end: p.values!.values[0].end
                        });
                    }
                    break;
                case 'defaultsystemslayout':
                    track.defaultSystemsLayout = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    break;
                case 'systemslayout':
                    track.systemsLayout = p.values!.values.map(v => (v as AlphaTexNumberLiteral).value);
                    break;
                case 'volume':
                    track.playbackInfo.volume = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    break;
                case 'balance':
                    track.playbackInfo.balance = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    break;
                case 'mute':
                    track.playbackInfo.isMute = true;
                    break;
                case 'solo':
                    track.playbackInfo.isSolo = true;
                    break;
                case 'multibarrest':
                    if (!track.score.stylesheet.perTrackMultiBarRest) {
                        track.score.stylesheet.perTrackMultiBarRest = new Set<number>();
                    }
                    track.score.stylesheet.perTrackMultiBarRest!.add(track.index);
                    break;
                case 'instrument':
                    this._readTrackInstrument(importer, track, p.values!);
                    break;
                case 'bank':
                    track.playbackInfo.bank = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    break;
            }
        }
    }

    public applyBeatDurationProperty(importer: IAlphaTexImporter, p: AlphaTexPropertyNode): ApplyNodeResult {
        const result = this._checkValueListTypes(
            importer,
            [AlphaTex1LanguageDefinitions.beatDurationPropertyValueListTypes],
            p,
            p.property.text.toLowerCase(),
            p.values
        );
        if (result !== undefined) {
            return result;
        }

        switch (p.property.text.toLowerCase()) {
            case 'tu':
                if (p.values!.values.length === 2) {
                    importer.state.currentTupletNumerator = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    importer.state.currentTupletDenominator = (p.values!.values[1] as AlphaTexNumberLiteral).value;
                } else {
                    const numerator = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    importer.state.currentTupletNumerator = numerator;
                    const denominator = AlphaTex1LanguageHandler._getTupletDenominator(numerator);
                    if (denominator < 0) {
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected default tuplet value '${numerator}', expected: 3, 5, 6, 7, 9, 10, 11 or 12`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: p.values!.values[0].start,
                            end: p.values!.values[0].end
                        });
                        importer.state.currentTupletNumerator = -1;
                        importer.state.currentTupletDenominator = -1;
                    } else {
                        importer.state.currentTupletDenominator = denominator;
                    }
                }
                return ApplyNodeResult.Applied;
        }

        return ApplyNodeResult.NotAppliedUnrecognizedMarker;
    }
    private static _getTupletDenominator(numerator: number) {
        switch (numerator) {
            case 3:
                return 2;
            case 5:
                return 4;
            case 6:
                return 4;
            case 7:
                return 4;
            case 9:
                return 8;
            case 10:
                return 8;
            case 11:
                return 8;
            case 12:
                return 8;
            default:
                return -1;
        }
    }

    private _allKnownBarMetaDataTags: Set<string> | undefined = undefined;
    public get allKnownMetaDataTags() {
        if (!this._allKnownBarMetaDataTags) {
            this._allKnownBarMetaDataTags = new Set<string>();
            const lists: Iterable<string>[] = [
                AlphaTex1LanguageDefinitions.scoreMetaDataValueListTypes.keys(),
                AlphaTex1LanguageDefinitions.structuralMetaDataValueListTypes.keys(),
                AlphaTex1LanguageDefinitions.staffMetaDataValueListTypes.keys(),
                AlphaTex1LanguageDefinitions.barMetaDataValueListTypes.keys()
            ];
            for (const l of lists) {
                for (const v of l) {
                    this._allKnownBarMetaDataTags.add(v);
                }
            }
        }
        return this._allKnownBarMetaDataTags;
    }

    private _knownScoreMetaDataTags: Set<string> | undefined = undefined;
    public get knownScoreMetaDataTags() {
        if (!this._knownScoreMetaDataTags) {
            this._knownScoreMetaDataTags = new Set<string>(
                AlphaTex1LanguageDefinitions.scoreMetaDataValueListTypes.keys()
            );
        }
        return this._knownScoreMetaDataTags;
    }

    private _knownStructuralMetaDataTags: Set<string> | undefined = undefined;
    public get knownStructuralMetaDataTags() {
        if (!this._knownStructuralMetaDataTags) {
            this._knownStructuralMetaDataTags = new Set<string>(
                AlphaTex1LanguageDefinitions.structuralMetaDataValueListTypes.keys()
            );
        }
        return this._knownStructuralMetaDataTags;
    }

    private _knownBarMetaDataTags: Set<string> | undefined = undefined;
    public get knownBarMetaDataTags() {
        if (!this._knownBarMetaDataTags) {
            this._knownBarMetaDataTags = new Set<string>(AlphaTex1LanguageDefinitions.barMetaDataValueListTypes.keys());
        }
        return this._knownBarMetaDataTags;
    }

    private _knownStaffMetaDataTags: Set<string> | undefined = undefined;
    public get knownStaffMetaDataTags() {
        if (!this._knownStaffMetaDataTags) {
            this._knownStaffMetaDataTags = new Set<string>(
                AlphaTex1LanguageDefinitions.staffMetaDataValueListTypes.keys()
            );
        }
        return this._knownStaffMetaDataTags;
    }

    private _knownBeatDurationProperties: Set<string> | undefined = undefined;
    public get knownBeatDurationProperties() {
        if (!this._knownBeatDurationProperties) {
            this._knownBeatDurationProperties = new Set<string>(
                AlphaTex1LanguageDefinitions.beatDurationPropertyValueListTypes.keys()
            );
        }
        return this._knownBeatDurationProperties;
    }

    private _knownBeatProperties: Set<string> | undefined = undefined;
    public get knownBeatProperties() {
        if (!this._knownBeatProperties) {
            this._knownBeatProperties = new Set<string>(AlphaTex1LanguageDefinitions.beatPropertyValueListTypes.keys());
        }
        return this._knownBeatProperties;
    }

    private _knownNoteProperties: Set<string> | undefined = undefined;
    public get knownNoteProperties() {
        if (!this._knownNoteProperties) {
            this._knownNoteProperties = new Set<string>(AlphaTex1LanguageDefinitions.notePropertyValueListTypes.keys());
        }
        return this._knownNoteProperties;
    }

    public applyBeatProperty(importer: IAlphaTexImporter, beat: Beat, p: AlphaTexPropertyNode): ApplyNodeResult {
        const tag = p.property.text.toLowerCase();
        const result = this._checkValueListTypes(
            importer,
            [AlphaTex1LanguageDefinitions.beatPropertyValueListTypes],
            p,
            tag,
            p.values
        );
        if (result !== undefined) {
            return result;
        }

        switch (tag) {
            case 'f':
                beat.fade = FadeType.FadeIn;
                return ApplyNodeResult.Applied;
            case 'fo':
                beat.fade = FadeType.FadeOut;
                return ApplyNodeResult.Applied;
            case 'vs':
                beat.fade = FadeType.VolumeSwell;
                return ApplyNodeResult.Applied;
            case 'v':
                beat.vibrato = VibratoType.Slight;
                return ApplyNodeResult.Applied;
            case 'vw':
                beat.vibrato = VibratoType.Wide;
                return ApplyNodeResult.Applied;
            case 's':
                beat.slap = true;
                return ApplyNodeResult.Applied;
            case 'p':
                beat.pop = true;
                return ApplyNodeResult.Applied;
            case 'tt':
                beat.tap = true;
                return ApplyNodeResult.Applied;
            case 'txt':
                beat.text = (p.values!.values[0] as AlphaTexTextNode).text;
                return ApplyNodeResult.Applied;
            case 'lyrics':
                let lyricsLine = 0;
                let lyricsText = '';
                if (p.values!.values.length === 2) {
                    lyricsLine = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    lyricsText = (p.values!.values[1] as AlphaTexTextNode).text;
                } else {
                    lyricsText = (p.values!.values[0] as AlphaTexTextNode).text;
                }

                if (!beat.lyrics) {
                    beat.lyrics = [];
                }

                while (beat.lyrics!.length <= lyricsLine) {
                    beat.lyrics.push('');
                }

                beat.lyrics[lyricsLine] = lyricsText;
                return ApplyNodeResult.Applied;
            case 'dd':
                beat.dots = 2;
                return ApplyNodeResult.Applied;
            case 'd':
                beat.dots = 1;
                return ApplyNodeResult.Applied;
            case 'su':
                beat.pickStroke = PickStroke.Up;
                return ApplyNodeResult.Applied;
            case 'sd':
                beat.pickStroke = PickStroke.Down;
                return ApplyNodeResult.Applied;
            case 'tu':
                if (p.values!.values.length === 2) {
                    beat.tupletNumerator = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    beat.tupletDenominator = (p.values!.values[1] as AlphaTexNumberLiteral).value;
                } else {
                    const numerator = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    beat.tupletNumerator = numerator;
                    const denominator = AlphaTex1LanguageHandler._getTupletDenominator(numerator);
                    if (denominator < 0) {
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected default tuplet value '${numerator}', expected: 3, 5, 6, 7, 9, 10, 11 or 12`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: p.values!.values[0].start,
                            end: p.values!.values[0].end
                        });
                        beat.tupletNumerator = -1;
                        beat.tupletDenominator = -1;
                        return ApplyNodeResult.NotAppliedSemanticError;
                    } else {
                        beat.tupletDenominator = denominator;
                    }
                }
                return ApplyNodeResult.Applied;
            case 'tb':
            case 'tbe':
                let tbi = 0;
                switch (p.values!.values[tbi].nodeType) {
                    case AlphaTexNodeType.Ident:
                    case AlphaTexNodeType.String:
                        const whammyBarType = AlphaTex1LanguageHandler._parseEnumValue(
                            importer,
                            p.values!,
                            'whammy type',
                            AlphaTex1EnumMappings.whammyTypes,
                            tbi
                        );
                        if (whammyBarType === undefined) {
                            return ApplyNodeResult.NotAppliedSemanticError;
                        }
                        beat.whammyBarType = whammyBarType;
                        tbi++;
                        break;
                }

                switch (p.values!.values[tbi].nodeType) {
                    case AlphaTexNodeType.Ident:
                    case AlphaTexNodeType.String:
                        const whammyBarStyle = AlphaTex1LanguageHandler._parseEnumValue(
                            importer,
                            p.values!,
                            'whammy style',
                            AlphaTex1EnumMappings.bendStyles,
                            tbi
                        );
                        if (whammyBarStyle === undefined) {
                            return ApplyNodeResult.NotAppliedSemanticError;
                        }
                        beat.whammyStyle = whammyBarStyle!;
                        tbi++;
                        break;
                }

                const points = this._getBendPoints(importer, p, tbi, tag === 'tbe');
                if (points) {
                    for (const point of points) {
                        beat.addWhammyBarPoint(point);
                    }
                }

                return ApplyNodeResult.Applied;
            case 'bu':
                AlphaTex1LanguageHandler._applyBrush(beat, p, BrushType.BrushUp, 0.25);
                return ApplyNodeResult.Applied;
            case 'bd':
                AlphaTex1LanguageHandler._applyBrush(beat, p, BrushType.BrushDown, 0.25);
                return ApplyNodeResult.Applied;
            case 'au':
                AlphaTex1LanguageHandler._applyBrush(beat, p, BrushType.ArpeggioUp, 1);
                return ApplyNodeResult.Applied;
            case 'ad':
                AlphaTex1LanguageHandler._applyBrush(beat, p, BrushType.ArpeggioDown, 1);
                return ApplyNodeResult.Applied;
            case 'ch':
                const chordName: string = (p.values!.values[0] as AlphaTexTextNode).text;
                const chordId: string = AlphaTex1LanguageHandler._getChordId(beat.voice.bar.staff, chordName);
                if (!beat.voice.bar.staff.hasChord(chordId)) {
                    const chord: Chord = new Chord();
                    chord.showDiagram = false;
                    chord.name = chordName;
                    beat.voice.bar.staff.addChord(chordId, chord);
                }
                beat.chordId = chordId;
                return ApplyNodeResult.Applied;
            case 'gr':
                if (p.values && p.values.values.length > 0) {
                    const graceType = AlphaTex1LanguageHandler._parseEnumValue(
                        importer,
                        p.values!,
                        'whammy style',
                        AlphaTex1EnumMappings.graceTypes
                    );
                    if (graceType === undefined) {
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                    beat.graceType = graceType!;
                } else {
                    beat.graceType = GraceType.BeforeBeat;
                }
                return ApplyNodeResult.Applied;
            case 'dy':
                const dyn = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    p.values!,
                    'dynamic',
                    AlphaTex1EnumMappings.dynamics
                );
                if (dyn === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                beat.dynamics = dyn!;
                importer.state.currentDynamics = dyn!;
                return ApplyNodeResult.Applied;
            case 'cre':
                beat.crescendo = CrescendoType.Crescendo;
                return ApplyNodeResult.Applied;
            case 'dec':
                beat.crescendo = CrescendoType.Decrescendo;
                return ApplyNodeResult.Applied;
            case 'tempo':
                // NOTE: playbackRatio is calculated on score finish when playback positions are known
                const tempo = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                let tempoLabel = '';
                let isVisible = true;

                if (p.values!.values.length > 2) {
                    tempoLabel = (p.values!.values[1] as AlphaTexTextNode).text;
                    const hideText = (p.values!.values[2] as AlphaTexTextNode).text;
                    if (hideText === 'hide') {
                        isVisible = false;
                    } else {
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected third tempo property value '${hideText}', expected: 'hide'`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: p.values!.values[2].start,
                            end: p.values!.values[2].end
                        });
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                } else if (p.values!.values.length > 1) {
                    tempoLabel = (p.values!.values[1] as AlphaTexTextNode).text;
                    if (tempoLabel === 'hide') {
                        isVisible = false;
                        tempoLabel = '';
                    }
                }
                const tempoAutomation = new Automation();
                tempoAutomation.isLinear = false;
                tempoAutomation.type = AutomationType.Tempo;
                tempoAutomation.value = tempo;
                tempoAutomation.text = tempoLabel;
                tempoAutomation.isVisible = isVisible;
                beat.automations.push(tempoAutomation);
                beat.voice.bar.masterBar.tempoAutomations.push(tempoAutomation);
                return ApplyNodeResult.Applied;
            case 'volume':
                // NOTE: playbackRatio is calculated on score finish when playback positions are known
                const volumeAutomation: Automation = new Automation();
                volumeAutomation.isLinear = true;
                volumeAutomation.type = AutomationType.Volume;
                volumeAutomation.value = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                beat.automations.push(volumeAutomation);
                return ApplyNodeResult.Applied;
            case 'balance':
                // NOTE: playbackRatio is calculated on score finish when playback positions are known
                const balanceAutomation: Automation = new Automation();
                balanceAutomation.isLinear = true;
                balanceAutomation.type = AutomationType.Balance;
                balanceAutomation.value = ModelUtils.clamp((p.values!.values[0] as AlphaTexNumberLiteral).value, 0, 16);
                beat.automations.push(balanceAutomation);
                return ApplyNodeResult.Applied;
            case 'tp':
                beat.tremoloSpeed = Duration.Eighth;
                if (p.values && p.values.values.length > 0) {
                    const tremoloSpeedValue = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    switch (tremoloSpeedValue) {
                        case 8:
                            beat.tremoloSpeed = Duration.Eighth;
                            break;
                        case 16:
                            beat.tremoloSpeed = Duration.Sixteenth;
                            break;
                        case 32:
                            beat.tremoloSpeed = Duration.ThirtySecond;
                            break;
                        default:
                            importer.addSemanticDiagnostic({
                                code: AlphaTexDiagnosticCode.AT209,
                                message: `Unexpected tremolo speed value '${tremoloSpeedValue}, expected: 8, 16 or 32`,
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: p.values!.values[0].start,
                                end: p.values!.values[0].end
                            });
                            return ApplyNodeResult.NotAppliedSemanticError;
                    }
                }
                return ApplyNodeResult.Applied;
            case 'spd':
                AlphaTex1LanguageHandler._applySustainPedal(importer, beat, SustainPedalMarkerType.Down);
                return ApplyNodeResult.Applied;
            case 'sph':
                AlphaTex1LanguageHandler._applySustainPedal(importer, beat, SustainPedalMarkerType.Hold);
                return ApplyNodeResult.Applied;
            case 'spu':
                AlphaTex1LanguageHandler._applySustainPedal(importer, beat, SustainPedalMarkerType.Up);
                return ApplyNodeResult.Applied;
            case 'spe':
                AlphaTex1LanguageHandler._applySustainPedal(importer, beat, SustainPedalMarkerType.Up, 1);
                return ApplyNodeResult.Applied;
            case 'slashed':
                beat.slashed = true;
                return ApplyNodeResult.Applied;
            case 'ds':
                beat.deadSlapped = true;
                if (beat.notes.length === 1 && beat.notes[0].isDead) {
                    beat.removeNote(beat.notes[0]);
                }
                return ApplyNodeResult.Applied;
            case 'glpf':
                beat.golpe = GolpeType.Finger;
                return ApplyNodeResult.Applied;
            case 'glpt':
                beat.golpe = GolpeType.Thumb;
                return ApplyNodeResult.Applied;
            case 'waho':
                beat.wahPedal = WahPedal.Open;
                return ApplyNodeResult.Applied;
            case 'wahc':
                beat.wahPedal = WahPedal.Closed;
                return ApplyNodeResult.Applied;
            case 'barre':
                beat.barreFret = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                beat.barreShape = BarreShape.Full;
                if (p.values!.values.length > 1) {
                    const barreShape = AlphaTex1LanguageHandler._parseEnumValue(
                        importer,
                        p.values!,
                        'barre shape',
                        AlphaTex1EnumMappings.barreShapes,
                        1
                    );
                    if (barreShape === undefined) {
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                    beat.barreShape = barreShape!;
                }
                return ApplyNodeResult.Applied;
            case 'rasg':
                const rasg = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    p.values!,
                    'rasgueado pattern',
                    AlphaTex1EnumMappings.rasgueadoPatterns
                );
                if (rasg === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                beat.rasgueado = rasg!;
                return ApplyNodeResult.Applied;
            case 'ot':
                const ottava = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    p.values!,
                    'ottava',
                    AlphaTex1EnumMappings.ottava
                );
                if (ottava === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                beat.ottava = ottava!;
                return ApplyNodeResult.Applied;
            case 'legatoorigin':
                beat.isLegatoOrigin = true;
                return ApplyNodeResult.Applied;
            case 'instrument':
                let program = 0;

                switch (p.values!.values[0].nodeType) {
                    case AlphaTexNodeType.Ident:
                    case AlphaTexNodeType.String:
                        program = GeneralMidi.getValue((p.values!.values[0] as AlphaTexTextNode).text);
                        break;

                    case AlphaTexNodeType.Number:
                        program = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                        break;
                }

                const instrumentAutomation = new Automation();
                instrumentAutomation.isLinear = false;
                instrumentAutomation.type = AutomationType.Instrument;
                instrumentAutomation.value = program;
                beat.automations.push(instrumentAutomation);
                return ApplyNodeResult.Applied;
            case 'bank':
                const bankAutomation = new Automation();
                bankAutomation.isLinear = false;
                bankAutomation.type = AutomationType.Bank;
                bankAutomation.value = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                beat.automations.push(bankAutomation);
                return ApplyNodeResult.Applied;
            case 'fermata':
                const fermataType = AlphaTex1LanguageHandler._parseEnumValue(
                    importer,
                    p.values!,
                    'fermata',
                    AlphaTex1EnumMappings.fermataTypes
                );
                if (fermataType === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }

                const fermata = new Fermata();
                fermata.type = fermataType!;

                if (p.values!.values.length > 1) {
                    fermata.length = (p.values!.values[1] as AlphaTexNumberLiteral).value;
                }

                beat.fermata = fermata;
                return ApplyNodeResult.Applied;

            case 'beam':
                const beamMode = (p.values!.values[0] as AlphaTexTextNode).text;
                switch (beamMode.toLowerCase()) {
                    case 'invert':
                        beat.invertBeamDirection = true;
                        break;
                    case 'up':
                        beat.preferredBeamDirection = BeamDirection.Up;
                        break;
                    case 'down':
                        beat.preferredBeamDirection = BeamDirection.Down;
                        break;
                    case 'auto':
                        beat.beamingMode = BeatBeamingMode.Auto;
                        break;
                    case 'split':
                        beat.beamingMode = BeatBeamingMode.ForceSplitToNext;
                        break;
                    case 'merge':
                        beat.beamingMode = BeatBeamingMode.ForceMergeWithNext;
                        break;
                    case 'splitsecondary':
                        beat.beamingMode = BeatBeamingMode.ForceSplitOnSecondaryToNext;
                        break;
                    default:
                        const allowedValues = ['invert', 'up', 'down', 'auto', 'split', 'merge', 'splitsecondary'];
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected beam value '${beamMode}', expected: ${allowedValues.join(',')}`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: p.values!.values[0].start,
                            end: p.values!.values[0].end
                        });
                        return ApplyNodeResult.NotAppliedSemanticError;
                }
                return ApplyNodeResult.Applied;
            case 'timer':
                beat.showTimer = true;
                return ApplyNodeResult.Applied;
        }

        return ApplyNodeResult.NotAppliedUnrecognizedMarker;
    }

    private static _applySustainPedal(
        importer: IAlphaTexImporter,
        beat: Beat,
        pedalType: SustainPedalMarkerType,
        ratioPosition: number = -1
    ) {
        const sustainPedal = new SustainPedalMarker();
        sustainPedal.pedalType = pedalType;
        // exact ratio position will be applied after .finish() when times are known
        sustainPedal.ratioPosition = ratioPosition >= 0 ? ratioPosition : beat.voice.bar.sustainPedals.length;
        importer.state.sustainPedalToBeat.set(sustainPedal, beat);
        beat.voice.bar.sustainPedals.push(sustainPedal);
    }

    private static _applyBrush(beat: Beat, p: AlphaTexPropertyNode, brushType: BrushType, durationFactor: number) {
        beat.brushType = brushType;
        if (p.values && p.values.values.length > 0) {
            beat.brushDuration = (p.values!.values[0] as AlphaTexNumberLiteral).value;
        } else {
            beat.updateDurations();
            beat.brushDuration = (beat.playbackDuration * durationFactor) / beat.notes.length;
        }
    }

    public applyNoteProperty(importer: IAlphaTexImporter, note: Note, p: AlphaTexPropertyNode): ApplyNodeResult {
        const tag = p.property.text.toLowerCase();
        const result = this._checkValueListTypes(
            importer,
            [AlphaTex1LanguageDefinitions.notePropertyValueListTypes],
            p,
            tag,
            p.values
        );
        if (result !== undefined) {
            return result;
        }

        switch (tag) {
            case 'b':
            case 'be':
                let tbi = 0;
                switch (p.values!.values[tbi].nodeType) {
                    case AlphaTexNodeType.Ident:
                    case AlphaTexNodeType.String:
                        const bendType = AlphaTex1LanguageHandler._parseEnumValue(
                            importer,
                            p.values!,
                            'bend type',
                            AlphaTex1EnumMappings.bendTypes,
                            tbi
                        );
                        if (bendType === undefined) {
                            return ApplyNodeResult.NotAppliedSemanticError;
                        }
                        note.bendType = bendType;
                        tbi++;
                        break;
                }

                switch (p.values!.values[tbi].nodeType) {
                    case AlphaTexNodeType.Ident:
                    case AlphaTexNodeType.String:
                        const bendStyle = AlphaTex1LanguageHandler._parseEnumValue(
                            importer,
                            p.values!,
                            'bend style',
                            AlphaTex1EnumMappings.bendStyles,
                            tbi
                        );
                        if (bendStyle === undefined) {
                            return ApplyNodeResult.NotAppliedSemanticError;
                        }
                        note.bendStyle = bendStyle!;
                        tbi++;
                        break;
                }

                const points = this._getBendPoints(importer, p, tbi, tag === 'be');
                if (points) {
                    for (const point of points) {
                        note.addBendPoint(point);
                    }
                }

                return ApplyNodeResult.Applied;
            case 'nh':
                note.harmonicType = HarmonicType.Natural;
                note.harmonicValue = ModelUtils.deltaFretToHarmonicValue(note.fret);
                return ApplyNodeResult.Applied;
            case 'ah':
                note.harmonicType = HarmonicType.Artificial;
                note.harmonicValue = AlphaTex1LanguageHandler._harmonicValue(p.values, note.harmonicValue);
                return ApplyNodeResult.Applied;
            case 'th':
                note.harmonicType = HarmonicType.Tap;
                note.harmonicValue = AlphaTex1LanguageHandler._harmonicValue(p.values, note.harmonicValue);
                return ApplyNodeResult.Applied;
            case 'ph':
                note.harmonicType = HarmonicType.Pinch;
                note.harmonicValue = AlphaTex1LanguageHandler._harmonicValue(p.values, note.harmonicValue);
                return ApplyNodeResult.Applied;
            case 'sh':
                note.harmonicType = HarmonicType.Semi;
                note.harmonicValue = AlphaTex1LanguageHandler._harmonicValue(p.values, note.harmonicValue);
                return ApplyNodeResult.Applied;
            case 'fh':
                note.harmonicType = HarmonicType.Feedback;
                note.harmonicValue = AlphaTex1LanguageHandler._harmonicValue(p.values, note.harmonicValue);
                return ApplyNodeResult.Applied;
            case 'tr':
                const trillFret = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                let trillDuration: Duration = Duration.Sixteenth;
                if (p.values!.values.length > 1) {
                    const trillDurationValue = (p.values!.values[1] as AlphaTexNumberLiteral).value;
                    switch (trillDurationValue) {
                        case 16:
                            trillDuration = Duration.Sixteenth;
                            break;
                        case 32:
                            trillDuration = Duration.ThirtySecond;
                            break;
                        case 64:
                            trillDuration = Duration.SixtyFourth;
                            break;
                        default:
                            importer.addSemanticDiagnostic({
                                code: AlphaTexDiagnosticCode.AT209,
                                message: `Unexpected trill duration value '${trillDurationValue}', expected: 16, 32 or 64`,
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: p.values!.values[1].start,
                                end: p.values!.values[1].end
                            });
                            return ApplyNodeResult.NotAppliedSemanticError;
                    }
                }
                note.trillValue = trillFret + note.stringTuning;
                note.trillSpeed = trillDuration;
                return ApplyNodeResult.Applied;
            case 'v':
                note.vibrato = VibratoType.Slight;
                return ApplyNodeResult.Applied;
            case 'vw':
                note.vibrato = VibratoType.Wide;
                return ApplyNodeResult.Applied;
            case 'sl':
                note.slideOutType = SlideOutType.Legato;
                return ApplyNodeResult.Applied;
            case 'ss':
                note.slideOutType = SlideOutType.Shift;
                return ApplyNodeResult.Applied;
            case 'sib':
                note.slideInType = SlideInType.IntoFromBelow;
                return ApplyNodeResult.Applied;
            case 'sia':
                note.slideInType = SlideInType.IntoFromAbove;
                return ApplyNodeResult.Applied;
            case 'sou':
                note.slideOutType = SlideOutType.OutUp;
                return ApplyNodeResult.Applied;
            case 'sod':
                note.slideOutType = SlideOutType.OutDown;
                return ApplyNodeResult.Applied;
            case 'psd':
                note.slideOutType = SlideOutType.PickSlideDown;
                return ApplyNodeResult.Applied;
            case 'psu':
                note.slideOutType = SlideOutType.PickSlideUp;
                return ApplyNodeResult.Applied;
            case 'h':
                note.isHammerPullOrigin = true;
                return ApplyNodeResult.Applied;
            case 'lht':
                note.isLeftHandTapped = true;
                return ApplyNodeResult.Applied;
            case 'g':
                note.isGhost = true;
                return ApplyNodeResult.Applied;
            case 'ac':
                note.accentuated = AccentuationType.Normal;
                return ApplyNodeResult.Applied;
            case 'hac':
                note.accentuated = AccentuationType.Heavy;
                return ApplyNodeResult.Applied;
            case 'ten':
                note.accentuated = AccentuationType.Tenuto;
                return ApplyNodeResult.Applied;
            case 'pm':
                note.isPalmMute = true;
                return ApplyNodeResult.Applied;
            case 'st':
                note.isStaccato = true;
                return ApplyNodeResult.Applied;
            case 'lr':
                note.isLetRing = true;
                return ApplyNodeResult.Applied;
            case 'x':
                note.isDead = true;
                return ApplyNodeResult.Applied;
            case '-':
            case 't':
                note.isTieDestination = true;
                return ApplyNodeResult.Applied;
            case 'lf':
                let leftFinger = Fingers.Thumb;
                if (p.values && p.values.values.length > 0) {
                    const customFinger = AlphaTex1LanguageHandler._toFinger(importer, p.values);
                    if (customFinger === undefined) {
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                    leftFinger = customFinger!;
                }
                note.leftHandFinger = leftFinger;
                return ApplyNodeResult.Applied;
            case 'rf':
                let rightFinger = Fingers.Thumb;
                if (p.values && p.values.values.length > 0) {
                    const customFinger = AlphaTex1LanguageHandler._toFinger(importer, p.values);
                    if (customFinger === undefined) {
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                    rightFinger = customFinger!;
                }
                note.rightHandFinger = rightFinger;
                return ApplyNodeResult.Applied;
            case 'acc':
                note.accidentalMode = ModelUtils.parseAccidentalMode((p.values!.values[0] as AlphaTexTextNode).text);
                return ApplyNodeResult.Applied;
            case 'turn':
                note.ornament = NoteOrnament.Turn;
                return ApplyNodeResult.Applied;
            case 'iturn':
                note.ornament = NoteOrnament.InvertedTurn;
                return ApplyNodeResult.Applied;
            case 'umordent':
                note.ornament = NoteOrnament.UpperMordent;
                return ApplyNodeResult.Applied;
            case 'lmordent':
                note.ornament = NoteOrnament.LowerMordent;
                return ApplyNodeResult.Applied;
            case 'string':
                note.showStringNumber = true;
                return ApplyNodeResult.Applied;
            case 'hide':
                note.isVisible = false;
                return ApplyNodeResult.Applied;
            case 'slur':
                const slurId = (p.values!.values[0] as AlphaTexTextNode).text;
                if (importer.state.slurs.has(slurId)) {
                    const slurOrigin = importer.state.slurs.get(slurId)!;
                    slurOrigin.slurDestination = note;

                    note.slurOrigin = slurOrigin;
                    note.isSlurDestination = true;
                } else {
                    importer.state.slurs.set(slurId, note);
                }
                return ApplyNodeResult.Applied;
            default:
                // fallback to beat
                return this.applyBeatProperty(importer, note.beat, p);
        }

        // biome-ignore lint/correctness/noUnreachable: for cross compilation
        return ApplyNodeResult.NotAppliedUnrecognizedMarker;
    }

    private static _toFinger(importer: IAlphaTexImporter, values: AlphaTexValueList): Fingers | undefined {
        const value = (values.values[0] as AlphaTexNumberLiteral).value;
        switch (value) {
            case 1:
                return Fingers.Thumb;
            case 2:
                return Fingers.IndexFinger;
            case 3:
                return Fingers.MiddleFinger;
            case 4:
                return Fingers.AnnularFinger;
            case 5:
                return Fingers.LittleFinger;
            default:
                importer.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT211,
                    message: `Value is out of valid range. Allowed range: 1-5, Actual Value: ${value}`,
                    start: values!.values[0].start,
                    end: values!.values[0].end,
                    severity: AlphaTexDiagnosticsSeverity.Error
                });
                return undefined;
        }
    }

    private static _harmonicValue(values: AlphaTexValueList | undefined, harmonicValue: number): number {
        if (values) {
            harmonicValue = (values!.values[0] as AlphaTexNumberLiteral).value;
        }
        return harmonicValue;
    }

    private _getBendPoints(
        importer: IAlphaTexImporter,
        p: AlphaTexPropertyNode,
        valueStartIndex: number,
        exact: boolean
    ): BendPoint[] | undefined {
        let values = p.values!.values;
        let remainingValues = values.length - valueStartIndex;
        let errorNode: AlphaTexAstNode = p.values!;

        // unwrap value list
        if (remainingValues > 0 && values[valueStartIndex].nodeType === AlphaTexNodeType.Values) {
            values = (values[valueStartIndex] as AlphaTexValueList).values;
            valueStartIndex = 0;
            remainingValues = values.length;
            errorNode = values[valueStartIndex] as AlphaTexAstNode;
        }

        const valuesPerItem = exact ? 2 : 1;
        if (remainingValues % valuesPerItem !== 0) {
            const pointCount = Math.ceil(remainingValues / valuesPerItem);
            const neededValues = pointCount * valuesPerItem;
            importer.addSemanticDiagnostic({
                code: AlphaTexDiagnosticCode.AT214,
                message: `The '${p.property.text}' effect needs ${valuesPerItem} values per item. With ${pointCount} points, ${neededValues} values are needed, only ${remainingValues} values found.`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: errorNode!.end,
                end: errorNode!.end
            });
            return undefined;
        }

        const points: BendPoint[] = [];
        let vi = valueStartIndex;
        while (vi < values.length) {
            let offset = 0;
            let value = 0;
            if (exact) {
                offset = (values[vi++] as AlphaTexNumberLiteral).value;
                value = (values[vi++] as AlphaTexNumberLiteral).value;
            } else {
                offset = 0;
                value = (values[vi++] as AlphaTexNumberLiteral).value;
            }
            points.push(new BendPoint(offset, value));
        }

        if (points.length > 0) {
            if (points.length > 60) {
                points.splice(60, points.length - 60);
            }

            // set positions
            if (exact) {
                points.sort((a, b) => {
                    return a.offset - b.offset;
                });
            } else {
                const count = points.length;
                const step = (BendPoint.MaxPosition / (count - 1)) | 0;
                let i: number = 0;
                while (i < count) {
                    points[i].offset = Math.min(BendPoint.MaxPosition, i * step);
                    i++;
                }
            }
            return points;
        } else {
            return undefined;
        }
    }

    //
    // string -> enum mappings

    private static _parseEnumValue<TValue extends number>(
        importer: IAlphaTexImporter,
        p: AlphaTexValueList,
        name: string,
        lookup: Map<string, TValue>,
        valueIndex: number = 0
    ): TValue | undefined {
        if (valueIndex >= p.values.length) {
            return undefined;
        }

        const txt = (p.values[valueIndex] as AlphaTexTextNode).text;
        if (lookup.has(txt.toLowerCase())) {
            return lookup.get(txt.toLowerCase())!;
        } else {
            importer.addSemanticDiagnostic({
                code: AlphaTexDiagnosticCode.AT209,
                message: `Unexpected ${name} value '${txt}', expected: ${Array.from(lookup.keys()).join(',')}`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: p.values[valueIndex].start,
                end: p.values[valueIndex].end
            });
            return undefined;
        }
    }

    // used to lookup some default values.
    private static readonly _defaultScore = new Score();
    private static readonly _defaultTrack = new Track();

    public buildScoreMetaDataNodes(score: Score): AlphaTexMetaDataNode[] {
        const nodes: AlphaTexMetaDataNode[] = [];
        AlphaTex1LanguageHandler._buildScoreInfoMeta(nodes, 'album', score, score.album, ScoreSubElement.Album);
        AlphaTex1LanguageHandler._buildScoreInfoMeta(nodes, 'artist', score, score.artist, ScoreSubElement.Artist);
        AlphaTex1LanguageHandler._buildScoreInfoMeta(
            nodes,
            'copyright',
            score,
            score.copyright,
            ScoreSubElement.Copyright
        );
        AlphaTex1LanguageHandler._buildScoreInfoMeta(
            nodes,
            'copyright2',
            score,
            undefined,
            ScoreSubElement.CopyrightSecondLine
        );
        AlphaTex1LanguageHandler._buildScoreInfoMeta(
            nodes,
            'wordsandmusic',
            score,
            undefined,
            ScoreSubElement.WordsAndMusic,
            true
        );
        AlphaTex1LanguageHandler._buildScoreInfoMeta(nodes, 'instructions', score, score.instructions, undefined);
        AlphaTex1LanguageHandler._buildScoreInfoMeta(nodes, 'music', score, score.music, ScoreSubElement.Music);
        AlphaTex1LanguageHandler._buildScoreInfoMeta(nodes, 'notices', score, score.notices, undefined);
        AlphaTex1LanguageHandler._buildScoreInfoMeta(
            nodes,
            'subtitle',
            score,
            score.subTitle,
            ScoreSubElement.SubTitle
        );
        AlphaTex1LanguageHandler._buildScoreInfoMeta(nodes, 'title', score, score.title, ScoreSubElement.Title);
        AlphaTex1LanguageHandler._buildScoreInfoMeta(nodes, 'words', score, score.words, ScoreSubElement.Words);
        AlphaTex1LanguageHandler._buildScoreInfoMeta(nodes, 'tab', score, score.tab, ScoreSubElement.Transcriber);

        if (score.defaultSystemsLayout !== AlphaTex1LanguageHandler._defaultScore.defaultSystemsLayout) {
            nodes.push(Atnf.numberMeta('defaultSystemsLayout', score.defaultSystemsLayout));
        }
        if (score.systemsLayout.length > 0) {
            nodes.push(
                Atnf.meta(
                    'systemsLayout',
                    Atnf.values(score.systemsLayout.map(l => Atnf.number(l) as IAlphaTexValueListItem))
                )
            );
        }

        AlphaTex1LanguageHandler._buildStyleSheetMetaData(nodes, score.stylesheet);

        if (nodes.length > 0) {
            nodes[0].leadingComments = [
                {
                    text: 'Score Metadata',
                    multiLine: false
                }
            ];
        }

        return nodes;
    }

    private static _buildStyleSheetMetaData(nodes: AlphaTexMetaDataNode[], stylesheet: RenderStylesheet) {
        const firstStyleSheet = nodes.length;

        if (stylesheet.hideDynamics) {
            nodes.push(Atnf.meta('hideDynamics'));
        }
        if (stylesheet.bracketExtendMode !== AlphaTex1LanguageHandler._defaultScore.stylesheet.bracketExtendMode) {
            nodes.push(
                Atnf.identMeta(
                    'bracketExtendMode',
                    AlphaTex1EnumMappings.bracketExtendModesReversed.get(stylesheet.bracketExtendMode)!
                )
            );
        }
        if (stylesheet.useSystemSignSeparator) {
            nodes.push(Atnf.meta('useSystemSignSeparator'));
        }
        if (stylesheet.multiTrackMultiBarRest) {
            nodes.push(Atnf.meta('multiBarRest'));
        }
        if (
            stylesheet.singleTrackTrackNamePolicy !==
            AlphaTex1LanguageHandler._defaultScore.stylesheet.singleTrackTrackNamePolicy
        ) {
            nodes.push(
                Atnf.identMeta(
                    'singleTrackTrackNamePolicy',
                    AlphaTex1EnumMappings.trackNamePoliciesReversed.get(stylesheet.singleTrackTrackNamePolicy)!
                )
            );
        }
        if (
            stylesheet.multiTrackTrackNamePolicy !==
            AlphaTex1LanguageHandler._defaultScore.stylesheet.multiTrackTrackNamePolicy
        ) {
            nodes.push(
                Atnf.identMeta(
                    'multiTrackTrackNamePolicy',
                    AlphaTex1EnumMappings.trackNamePoliciesReversed.get(stylesheet.multiTrackTrackNamePolicy)!
                )
            );
        }
        if (
            stylesheet.firstSystemTrackNameMode !==
            AlphaTex1LanguageHandler._defaultScore.stylesheet.firstSystemTrackNameMode
        ) {
            nodes.push(
                Atnf.identMeta(
                    'firstSystemTrackNameMode',
                    AlphaTex1EnumMappings.trackNameModeReversed.get(stylesheet.firstSystemTrackNameMode)!
                )
            );
        }
        if (
            stylesheet.otherSystemsTrackNameMode !==
            AlphaTex1LanguageHandler._defaultScore.stylesheet.otherSystemsTrackNameMode
        ) {
            nodes.push(
                Atnf.identMeta(
                    'otherSystemsTrackNameMode',
                    AlphaTex1EnumMappings.trackNameModeReversed.get(stylesheet.otherSystemsTrackNameMode)!
                )
            );
        }
        if (
            stylesheet.firstSystemTrackNameOrientation !==
            AlphaTex1LanguageHandler._defaultScore.stylesheet.firstSystemTrackNameOrientation
        ) {
            nodes.push(
                Atnf.identMeta(
                    'firstSystemTrackNameOrientation',
                    AlphaTex1EnumMappings.trackNameOrientationsReversed.get(stylesheet.firstSystemTrackNameOrientation)!
                )
            );
        }
        if (
            stylesheet.otherSystemsTrackNameOrientation !==
            AlphaTex1LanguageHandler._defaultScore.stylesheet.otherSystemsTrackNameOrientation
        ) {
            nodes.push(
                Atnf.identMeta(
                    'otherSystemsTrackNameOrientation',
                    AlphaTex1EnumMappings.trackNameOrientationsReversed.get(
                        stylesheet.otherSystemsTrackNameOrientation
                    )!
                )
            );
        }

        // Unsupported:
        // 'globaldisplaychorddiagramsontop',
        // 'pertrackchorddiagramsontop',
        // 'globaldisplaytuning',
        // 'pertrackdisplaytuning',
        // 'pertrackchorddiagramsontop',
        // 'pertrackmultibarrest',

        if (firstStyleSheet < nodes.length) {
            nodes[firstStyleSheet].leadingComments = [
                {
                    multiLine: false,
                    text: 'Score Stylesheet'
                }
            ];
        }
    }

    private static _buildScoreInfoMeta(
        nodes: AlphaTexMetaDataNode[],
        tag: string,
        score: Score,
        value: string | undefined,
        element: ScoreSubElement | undefined,
        writeIfEmpty: boolean = false
    ): void {
        if (value !== undefined && value.length === 0 && !writeIfEmpty) {
            return;
        }

        const values: IAlphaTexValueListItem[] = [];

        if (value !== undefined) {
            values.push(Atnf.string(value));
        }

        if (element !== undefined) {
            const style =
                score.style && score.style.headerAndFooter.has(element)
                    ? score.style.headerAndFooter.get(element)
                    : undefined;
            const defaultStyle = ScoreStyle.defaultHeaderAndFooter.has(element)
                ? ScoreStyle.defaultHeaderAndFooter.get(element)
                : undefined;
            if (style && (!defaultStyle || !HeaderFooterStyle.equals(defaultStyle, style))) {
                values.push(Atnf.string(style.isVisible === false ? '' : style.template));
                values.push(Atnf.ident(AlphaTex1EnumMappings.textAlignsReversed.get(style.textAlign)!));
            }
        }

        // do not write with all defaults
        if (value === undefined && values.length === 0) {
            return;
        } else if (value !== undefined && value.length === 0 && values.length === 1) {
            return;
        }

        nodes.push(Atnf.meta(tag, Atnf.values(values)));
    }

    public buildSyncPointNodes(score: Score): AlphaTexMetaDataNode[] {
        const nodes: AlphaTexMetaDataNode[] = [];

        const flatSyncPoints = score.exportFlatSyncPoints();
        for (const p of flatSyncPoints) {
            nodes.push(
                Atnf.meta(
                    'sync',
                    Atnf.values([
                        Atnf.number(p.barIndex),
                        Atnf.number(p.barOccurence),
                        Atnf.number(p.millisecondOffset),
                        p.barPosition > 0 ? Atnf.number(p.barPosition) : undefined
                    ])
                )
            );
        }

        return nodes;
    }

    public buildBarMetaDataNodes(
        staff: Staff,
        bar: Bar | undefined,
        voice: number,
        isMultiVoice: boolean
    ): AlphaTexMetaDataNode[] {
        const nodes: AlphaTexMetaDataNode[] = [];

        AlphaTex1LanguageHandler._buildStructuralMetaDataNodes(bar, staff, nodes, isMultiVoice, voice);
        if (!bar) {
            return nodes;
        }

        if (voice === 0) {
            // Master Bar meta on first track
            if (staff.index === 0 && staff.track.index === 0) {
                AlphaTex1LanguageHandler._buildMasterBarMetaDataNodes(nodes, bar.masterBar);
            }
        }

        const firstBarMetaIndex = nodes.length;

        if (voice === 0 && bar.index === 0 && staff.index === 0 && staff.track.index === 0) {
            nodes.push(Atnf.identMeta('accidentals', 'auto'));
        }

        if (bar.index === 0 || bar.clef !== bar.previousBar?.clef) {
            nodes.push(Atnf.identMeta('clef', AlphaTex1EnumMappings.clefsReversed.get(bar.clef)!));
        }

        if ((bar.index === 0 && bar.clefOttava !== Ottavia.Regular) || bar.clefOttava !== bar.previousBar?.clefOttava) {
            nodes.push(Atnf.identMeta('ottava', AlphaTex1EnumMappings.ottavaReversed.get(bar.clefOttava)!));
        }

        if ((bar.index === 0 && bar.simileMark !== SimileMark.None) || bar.simileMark !== bar.previousBar?.simileMark) {
            nodes.push(Atnf.identMeta('simile', AlphaTex1EnumMappings.simileMarksReversed.get(bar.simileMark)!));
        }

        if (bar.displayScale !== 1) {
            nodes.push(Atnf.numberMeta('scale', bar.displayScale));
        }

        if (bar.displayWidth > 0) {
            nodes.push(Atnf.numberMeta('width', bar.displayWidth));
        }

        // sustainPedals are on beat level
        for (const sp of bar.sustainPedals) {
            let pedalType = '';
            switch (sp.pedalType) {
                case SustainPedalMarkerType.Down:
                    pedalType = 'spd';
                    break;
                case SustainPedalMarkerType.Hold:
                    pedalType = 'sph';
                    break;
                case SustainPedalMarkerType.Up:
                    pedalType = 'spu';
                    break;
            }
            if (pedalType) {
                nodes.push(Atnf.numberMeta(pedalType, sp.ratioPosition));
            }
        }

        if (bar.barLineLeft !== BarLineStyle.Automatic) {
            nodes.push(Atnf.identMeta('barLineLeft', AlphaTex1EnumMappings.barLinesReversed.get(bar.barLineLeft)!));
        }

        if (bar.barLineRight !== BarLineStyle.Automatic) {
            nodes.push(Atnf.identMeta('barLineRight', AlphaTex1EnumMappings.barLinesReversed.get(bar.barLineRight)!));
        }

        if (
            bar.index === 0 ||
            bar.keySignature !== bar.previousBar!.keySignature ||
            bar.keySignatureType !== bar.previousBar!.keySignatureType
        ) {
            let ks = '';
            if (bar.keySignatureType === KeySignatureType.Minor) {
                ks = AlphaTex1EnumMappings.keySignaturesMinorReversed.get(bar.keySignature)!;
            } else {
                ks = AlphaTex1EnumMappings.keySignaturesMajorReversed.get(bar.keySignature)!;
            }
            nodes.push(Atnf.identMeta('ks', ks));
        }

        if (firstBarMetaIndex < nodes.length) {
            nodes[firstBarMetaIndex].leadingComments = [
                {
                    multiLine: false,
                    text: `Bar ${bar.index + 1} Metadata`
                }
            ];
        }

        return nodes;
    }
    private static _buildStaffMetaDataNodes(nodes: AlphaTexMetaDataNode[], staff: Staff) {
        const firstStaffMetaIndex = nodes.length;

        if (staff.capo !== 0) {
            nodes.push(Atnf.numberMeta('capo', staff.capo));
        }
        if (staff.isPercussion) {
            nodes.push(Atnf.identMeta('articulation', 'defaults'));
        } else if (staff.isStringed) {
            const tuning = Atnf.meta(
                'tuning',
                Atnf.values(
                    staff.stringTuning.tunings.map(
                        t => Atnf.ident(Tuning.getTextForTuning(t, true)) as IAlphaTexValueListItem
                    )
                )
            );
            nodes.push(tuning);

            if (
                staff.track.score.stylesheet.perTrackDisplayTuning &&
                staff.track.score.stylesheet.perTrackDisplayTuning!.has(staff.track.index)
            ) {
                tuning.values!.values.push(Atnf.ident('hide'));
            }

            if (staff.stringTuning.name.length > 0) {
                tuning.values!.values.push(Atnf.string(staff.stringTuning.name));
            }
        }

        if (staff.transpositionPitch !== 0) {
            nodes.push(Atnf.numberMeta('transpose', -staff.transpositionPitch));
        }

        const defaultTransposition = ModelUtils.displayTranspositionPitches.has(staff.track.playbackInfo.program)
            ? ModelUtils.displayTranspositionPitches.get(staff.track.playbackInfo.program)!
            : 0;
        if (staff.displayTranspositionPitch !== defaultTransposition) {
            nodes.push(Atnf.numberMeta('displaytranspose', -staff.displayTranspositionPitch));
        }

        if (staff.chords != null) {
            for (const [_, chord] of staff.chords!) {
                nodes.push(AlphaTex1LanguageHandler._buildChordNode(chord));
            }
        }

        if (firstStaffMetaIndex < nodes.length) {
            nodes[firstStaffMetaIndex].leadingComments = [
                {
                    multiLine: false,
                    text: `Staff ${staff.index + 1} Metadata`
                }
            ];
        }
    }

    private static _buildChordNode(chord: Chord): AlphaTexMetaDataNode {
        const chordNode = Atnf.meta(
            'chord',
            Atnf.stringValue(chord.name),
            Atnf.props([
                chord.firstFret >= 0 ? ['firstfret', Atnf.numberValue(chord.firstFret)] : undefined,
                ['showdiagram', Atnf.identValue(chord.showDiagram ? 'true' : 'false')],
                ['showfingering', Atnf.identValue(chord.showFingering ? 'true' : 'false')],
                ['showname', Atnf.identValue(chord.showName ? 'true' : 'false')],
                chord.barreFrets.length > 0
                    ? ['barre', Atnf.values(chord.barreFrets.map(f => Atnf.number(f) as IAlphaTexValueListItem))]
                    : undefined
            ])
        );
        chordNode.propertiesBeforeValues = true;

        for (let i = 0; i < chord.staff.tuning.length; i++) {
            if (i < chord.strings.length && chord.strings[i] >= 0) {
                chordNode.values!.values.push(Atnf.number(chord.strings[i]));
            } else {
                chordNode.values!.values.push(Atnf.ident('x'));
            }
        }

        return chordNode;
    }

    private static _buildMasterBarMetaDataNodes(nodes: AlphaTexMetaDataNode[], masterBar: MasterBar) {
        const firstMetaIndex = nodes.length;

        if (masterBar.alternateEndings !== 0) {
            nodes.push(
                Atnf.meta(
                    'ae',
                    Atnf.values(
                        ModelUtils.getAlternateEndingsList(masterBar.alternateEndings).map(
                            i => Atnf.number(i + 1) as IAlphaTexValueListItem
                        )
                    )
                )
            );
        }

        if (masterBar.isRepeatStart) {
            nodes.push(Atnf.meta('ro'));
        }

        if (masterBar.isRepeatEnd) {
            nodes.push(Atnf.numberMeta('rc', masterBar.repeatCount));
        }

        if (
            masterBar.index === 0 ||
            masterBar.timeSignatureCommon !== masterBar.previousMasterBar?.timeSignatureCommon ||
            masterBar.timeSignatureNumerator !== masterBar.previousMasterBar.timeSignatureNumerator ||
            masterBar.timeSignatureDenominator !== masterBar.previousMasterBar.timeSignatureDenominator
        ) {
            if (masterBar.timeSignatureCommon) {
                nodes.push(Atnf.identMeta('ts', 'common'));
            } else {
                nodes.push(
                    Atnf.meta(
                        'ts',
                        Atnf.values([
                            Atnf.number(masterBar.timeSignatureNumerator),
                            Atnf.number(masterBar.timeSignatureDenominator)
                        ])
                    )
                );
            }
        }

        if (
            (masterBar.index > 0 && masterBar.tripletFeel !== masterBar.previousMasterBar?.tripletFeel) ||
            (masterBar.index === 0 && masterBar.tripletFeel !== TripletFeel.NoTripletFeel)
        ) {
            nodes.push(Atnf.identMeta('tf', AlphaTex1EnumMappings.tripletFeelsReversed.get(masterBar.tripletFeel)!));
        }

        if (masterBar.isFreeTime) {
            nodes.push(Atnf.meta('ft'));
        }

        if (masterBar.section != null) {
            nodes.push(
                Atnf.meta(
                    'section',
                    Atnf.values([Atnf.string(masterBar.section.marker), Atnf.string(masterBar.section.text)])
                )
            );
        }

        if (masterBar.isAnacrusis) {
            nodes.push(Atnf.meta('ac'));
        }

        if (masterBar.displayScale !== 1) {
            nodes.push(Atnf.numberMeta('scale', masterBar.displayScale));
        }

        if (masterBar.displayWidth > 0) {
            nodes.push(Atnf.numberMeta('width', masterBar.displayWidth));
        }

        if (masterBar.directions) {
            for (const d of masterBar.directions!) {
                nodes.push(Atnf.identMeta('jump', AlphaTex1EnumMappings.directionsReversed.get(d)!));
            }
        }

        for (const a of masterBar.tempoAutomations) {
            const tempo = Atnf.meta(
                'tempo',
                Atnf.values([
                    Atnf.number(a.value),
                    a.text ? Atnf.string(a.text) : undefined,
                    a.ratioPosition > 0 ? Atnf.number(a.ratioPosition) : undefined,
                    !a.isVisible ? Atnf.ident('hide') : undefined
                ])
            );
            if (tempo.values!.values.length === 1) {
                tempo.values!.openParenthesis = undefined;
                tempo.values!.closeParenthesis = undefined;
            }
            nodes.push(tempo);
        }

        if (firstMetaIndex < nodes.length) {
            nodes[firstMetaIndex].leadingComments = [
                {
                    multiLine: false,
                    text: `Masterbar ${masterBar.index + 1} Metadata`
                }
            ];
        }
    }

    private static _buildStructuralMetaDataNodes(
        bar: Bar | undefined,
        staff: Staff,
        nodes: AlphaTexMetaDataNode[],
        isMultiVoice: boolean,
        voice: number
    ) {
        if (bar === undefined || bar.index === 0) {
            if (voice === 0) {
                if (staff.index === 0) {
                    nodes.push(AlphaTex1LanguageHandler._buildNewTrackNode(staff.track));
                }
                nodes.push(AlphaTex1LanguageHandler._buildNewStaffNode(staff));
                AlphaTex1LanguageHandler._buildStaffMetaDataNodes(nodes, staff);
            }

            if (isMultiVoice) {
                const voiceNode = Atnf.meta('voice');
                voiceNode.trailingComments = [
                    {
                        multiLine: true,
                        text: `Voice ${voice + 1}`
                    }
                ];
                nodes.push(voiceNode);
            }
        }
    }

    private static _buildNewStaffNode(staff: Staff): AlphaTexMetaDataNode {
        const node = Atnf.meta(
            'staff',
            undefined,
            Atnf.props([
                staff.showStandardNotation
                    ? [
                          'score',
                          Atnf.values([
                              staff.standardNotationLineCount !== Staff.DefaultStandardNotationLineCount
                                  ? Atnf.number(staff.standardNotationLineCount)
                                  : undefined
                          ])
                      ]
                    : undefined,
                staff.showTablature ? (['tabs', undefined] as [string, AlphaTexValueList | undefined]) : undefined,
                staff.showSlash ? (['slash', undefined] as [string, AlphaTexValueList | undefined]) : undefined,
                staff.showNumbered ? (['numbered', undefined] as [string, AlphaTexValueList | undefined]) : undefined
            ])
        );

        if (node.properties && node.properties.properties.length > 0) {
            node.properties.properties[0]!.leadingComments = [
                {
                    multiLine: false,
                    text: 'Staff Properties'
                }
            ];
        }

        return node;
    }

    private static _buildNewTrackNode(track: Track): AlphaTexMetaDataNode {
        const node = Atnf.meta(
            'track',
            Atnf.values([
                Atnf.string(track.name),
                track.shortName.length > 0 ? Atnf.string(track.shortName) : undefined
            ]),
            Atnf.props([
                track.color.rgba !== AlphaTex1LanguageHandler._defaultTrack.color.rgba
                    ? ['color', Atnf.stringValue(track.color.rgba)]
                    : undefined,
                track.defaultSystemsLayout !== AlphaTex1LanguageHandler._defaultTrack.defaultSystemsLayout
                    ? ['defaultSystemsLayout', Atnf.numberValue(track.defaultSystemsLayout)]
                    : undefined,
                track.systemsLayout.length
                    ? [
                          'systemsLayout',
                          Atnf.values(track.systemsLayout.map(d => Atnf.number(d) as IAlphaTexValueListItem))
                      ]
                    : undefined,
                ['volume', Atnf.numberValue(track.playbackInfo.volume)],
                ['balance', Atnf.numberValue(track.playbackInfo.balance)],
                track.playbackInfo.isMute
                    ? (['mute', undefined] as [string, AlphaTexValueList | undefined])
                    : undefined,
                track.playbackInfo.isSolo
                    ? (['solo', undefined] as [string, AlphaTexValueList | undefined])
                    : undefined,
                track.score.stylesheet.perTrackMultiBarRest &&
                track.score.stylesheet.perTrackMultiBarRest!.has(track.index)
                    ? (['multiBarRest', undefined] as [string, AlphaTexValueList | undefined])
                    : undefined,
                [
                    'instrument',
                    Atnf.identValue(track.isPercussion ? 'percussion' : GeneralMidi.getName(track.playbackInfo.program))
                ],
                track.playbackInfo.bank > 0 ? ['bank', Atnf.numberValue(track.playbackInfo.bank)] : undefined
            ])
        );

        if (node.properties && node.properties.properties.length > 0) {
            node.properties.properties[0]!.leadingComments = [
                {
                    multiLine: false,
                    text: 'Track Properties'
                }
            ];
        }

        return node;
    }

    public buildNoteEffects(note: Note): AlphaTexPropertyNode[] {
        const properties: AlphaTexPropertyNode[] = [];

        if (note.hasBend) {
            const beValue = Atnf.values(
                [
                    Atnf.ident(AlphaTex1EnumMappings.bendTypesReversed.get(note.bendType)!),
                    note.bendStyle !== BendStyle.Default
                        ? Atnf.ident(AlphaTex1EnumMappings.bendStylesReversed.get(note.bendStyle)!)
                        : undefined
                ],
                true
            )!;
            for (const p of note.bendPoints!) {
                beValue.values.push(Atnf.number(p.offset));
                beValue.values.push(Atnf.number(p.value));
            }

            Atnf.prop(properties, 'be', beValue);
        }

        let harmonicType = '';
        switch (note.harmonicType) {
            case HarmonicType.Natural:
                Atnf.prop(properties, 'nh');
                break;
            case HarmonicType.Artificial:
                harmonicType = 'ah';
                break;
            case HarmonicType.Pinch:
                harmonicType = 'ph';
                break;
            case HarmonicType.Tap:
                harmonicType = 'th';
                break;
            case HarmonicType.Semi:
                harmonicType = 'sh';
                break;
            case HarmonicType.Feedback:
                harmonicType = 'fh';
                break;
        }
        if (harmonicType) {
            Atnf.prop(properties, harmonicType, Atnf.numberValue(note.harmonicValue));
        }

        if (note.showStringNumber) {
            Atnf.prop(properties, 'string');
        }

        if (note.isTrill) {
            Atnf.prop(
                properties,
                'tr',
                Atnf.values([Atnf.number(note.trillFret), Atnf.number(note.trillSpeed as number)])
            );
        }

        switch (note.vibrato) {
            case VibratoType.Slight:
                Atnf.prop(properties, 'v');
                break;
            case VibratoType.Wide:
                Atnf.prop(properties, 'vw');
                break;
        }

        switch (note.slideInType) {
            case SlideInType.IntoFromBelow:
                Atnf.prop(properties, 'sib');
                break;
            case SlideInType.IntoFromAbove:
                Atnf.prop(properties, 'sia');
                break;
        }

        switch (note.slideOutType) {
            case SlideOutType.Shift:
                Atnf.prop(properties, 'ss');
                break;
            case SlideOutType.Legato:
                Atnf.prop(properties, 'sl');
                break;
            case SlideOutType.OutUp:
                Atnf.prop(properties, 'sou');
                break;
            case SlideOutType.OutDown:
                Atnf.prop(properties, 'sod');
                break;
            case SlideOutType.PickSlideDown:
                Atnf.prop(properties, 'psd');
                break;
            case SlideOutType.PickSlideUp:
                Atnf.prop(properties, 'psu');
                break;
        }

        if (note.isHammerPullOrigin) {
            Atnf.prop(properties, 'h');
        }

        if (note.isLeftHandTapped) {
            Atnf.prop(properties, 'lht');
        }

        if (note.isGhost) {
            Atnf.prop(properties, 'g');
        }

        switch (note.accentuated) {
            case AccentuationType.Normal:
                Atnf.prop(properties, 'ac');
                break;
            case AccentuationType.Heavy:
                Atnf.prop(properties, 'hac');
                break;
            case AccentuationType.Tenuto:
                Atnf.prop(properties, 'ten');
                break;
        }

        if (note.isPalmMute) {
            Atnf.prop(properties, 'pm');
        }

        if (note.isStaccato) {
            Atnf.prop(properties, 'st');
        }

        if (note.isLetRing) {
            Atnf.prop(properties, 'lr');
        }

        if (note.isDead) {
            Atnf.prop(properties, 'x');
        }

        if (note.isTieDestination) {
            Atnf.prop(properties, 't');
        }
        if (note.leftHandFinger >= Fingers.Thumb) {
            Atnf.prop(properties, 'lf', Atnf.numberValue((note.leftHandFinger as number) + 1));
        }
        if (note.rightHandFinger >= Fingers.Thumb) {
            Atnf.prop(properties, 'rf', Atnf.numberValue((note.rightHandFinger as number) + 1));
        }

        if (!note.isVisible) {
            Atnf.prop(properties, 'hide');
        }

        if (note.isSlurOrigin) {
            const slurId = `s${note.id}`;
            Atnf.prop(properties, 'slur', Atnf.identValue(slurId));
        }

        if (note.isSlurDestination) {
            const slurId = `s${note.slurOrigin!.id}`;
            Atnf.prop(properties, 'slur', Atnf.identValue(slurId));
        }

        if (note.accidentalMode !== NoteAccidentalMode.Default) {
            Atnf.prop(
                properties,
                'acc',
                Atnf.identValue(ModelUtils.reverseAccidentalModeMapping.get(note.accidentalMode)!)
            );
        }

        switch (note.ornament) {
            case NoteOrnament.InvertedTurn:
                Atnf.prop(properties, 'iturn');
                break;
            case NoteOrnament.Turn:
                Atnf.prop(properties, 'turn');
                break;
            case NoteOrnament.UpperMordent:
                Atnf.prop(properties, 'umordent');
                break;
            case NoteOrnament.LowerMordent:
                Atnf.prop(properties, 'lmordent');
                break;
        }

        return properties;
    }

    public buildBeatEffects(beat: Beat): AlphaTexPropertyNode[] {
        const properties: AlphaTexPropertyNode[] = [];

        switch (beat.fade) {
            case FadeType.FadeIn:
                Atnf.prop(properties, 'f');
                break;
            case FadeType.FadeOut:
                Atnf.prop(properties, 'fo');
                break;
            case FadeType.VolumeSwell:
                Atnf.prop(properties, 'vs');
                break;
        }

        if (beat.vibrato === VibratoType.Slight) {
            Atnf.prop(properties, 'v');
        } else if (beat.vibrato === VibratoType.Wide) {
            Atnf.prop(properties, 'vw');
        }

        if (beat.slap) {
            Atnf.prop(properties, 's');
        }

        if (beat.pop) {
            Atnf.prop(properties, 'p');
        }

        if (beat.tap) {
            Atnf.prop(properties, 'tt');
        }

        if (beat.dots >= 2) {
            Atnf.prop(properties, 'dd');
        } else if (beat.dots > 0) {
            Atnf.prop(properties, 'd');
        }

        if (beat.pickStroke === PickStroke.Up) {
            Atnf.prop(properties, 'su');
        } else if (beat.pickStroke === PickStroke.Down) {
            Atnf.prop(properties, 'sd');
        }

        if (beat.hasTuplet) {
            Atnf.prop(
                properties,
                'tu',
                Atnf.values([Atnf.number(beat.tupletNumerator), Atnf.number(beat.tupletDenominator)])
            );
        }

        if (beat.hasWhammyBar) {
            const tbeValues = Atnf.values(
                [
                    Atnf.ident(AlphaTex1EnumMappings.whammyTypesReversed.get(beat.whammyBarType)!),
                    Atnf.ident(AlphaTex1EnumMappings.bendStylesReversed.get(beat.whammyStyle)!)
                ],
                true
            )!;
            for (const p of beat.whammyBarPoints!) {
                tbeValues.values.push(Atnf.number(p.offset));
                tbeValues.values.push(Atnf.number(p.value));
            }

            Atnf.prop(properties, 'tbe', tbeValues);
        }

        let brushType = '';
        switch (beat.brushType) {
            case BrushType.BrushUp:
                brushType = 'bu';

                break;
            case BrushType.BrushDown:
                brushType = 'bd';
                break;
            case BrushType.ArpeggioUp:
                brushType = 'au';
                break;
            case BrushType.ArpeggioDown:
                brushType = 'ad';
                break;
        }
        if (brushType) {
            Atnf.prop(properties, brushType, Atnf.numberValue(beat.brushDuration));
        }

        if (beat.chord != null) {
            Atnf.prop(properties, 'ch', Atnf.stringValue(beat.chord.name));
        }

        if (beat.ottava !== Ottavia.Regular) {
            Atnf.prop(properties, 'ot', Atnf.identValue(AlphaTex1EnumMappings.ottavaReversed.get(beat.ottava)!));
        }

        if (beat.hasRasgueado) {
            Atnf.prop(
                properties,
                'rasg',
                Atnf.identValue(AlphaTex1EnumMappings.rasgueadoPatternsReversed.get(beat.rasgueado)!)
            );
        }

        if (beat.text != null) {
            Atnf.prop(properties, 'txt', Atnf.stringValue(beat.text));
        }

        if (beat.lyrics != null && beat.lyrics!.length > 0) {
            if (beat.lyrics.length > 1) {
                for (let i = 0; i < beat.lyrics.length; i++) {
                    Atnf.prop(properties, 'lyrics', Atnf.values([Atnf.number(i), Atnf.string(beat.lyrics[i])]));
                }
            } else {
                Atnf.prop(properties, 'lyrics', Atnf.stringValue(beat.lyrics[0]));
            }
        }

        if (beat.graceType !== GraceType.None) {
            Atnf.prop(
                properties,
                'gr',
                beat.graceType === GraceType.BeforeBeat
                    ? undefined
                    : Atnf.identValue(AlphaTex1EnumMappings.graceTypesReversed.get(beat.graceType)!)
            );
        }

        if (beat.isTremolo) {
            Atnf.prop(properties, 'tp', Atnf.numberValue(beat.tremoloSpeed! as number));
        }

        switch (beat.crescendo) {
            case CrescendoType.Crescendo:
                Atnf.prop(properties, 'cre');
                break;
            case CrescendoType.Decrescendo:
                Atnf.prop(properties, 'dec');
                break;
        }

        if ((beat.voice.bar.index === 0 && beat.index === 0) || beat.dynamics !== beat.previousBeat?.dynamics) {
            Atnf.prop(properties, 'dy', Atnf.identValue(AlphaTex1EnumMappings.dynamicsReversed.get(beat.dynamics)!));
        }

        const fermata = beat.fermata;
        if (fermata != null) {
            Atnf.prop(
                properties,
                'fermata',
                Atnf.values([
                    Atnf.ident(AlphaTex1EnumMappings.fermataTypesReversed.get(beat.fermata!.type)!),
                    Atnf.number(beat.fermata!.length)
                ])
            );
        }

        if (beat.isLegatoOrigin) {
            Atnf.prop(properties, 'legatoorigin');
        }

        for (const automation of beat.automations) {
            switch (automation.type) {
                case AutomationType.Tempo:
                    Atnf.prop(
                        properties,
                        'tempo',
                        Atnf.values([
                            Atnf.number(automation.value),
                            automation.text.length === 0 ? undefined : Atnf.string(automation.text)
                        ])
                    );
                    break;
                case AutomationType.Volume:
                    Atnf.prop(properties, 'volume', Atnf.numberValue(automation.value));
                    break;
                case AutomationType.Instrument:
                    if (!beat.voice.bar.staff.isPercussion) {
                        Atnf.prop(properties, 'instrument', Atnf.identValue(GeneralMidi.getName(automation.value)));
                    }
                    break;
                case AutomationType.Balance:
                    Atnf.prop(properties, 'balance', Atnf.numberValue(automation.value));
                    break;
            }
        }

        switch (beat.wahPedal) {
            case WahPedal.Open:
                Atnf.prop(properties, 'waho');
                break;
            case WahPedal.Closed:
                Atnf.prop(properties, 'wahc');
                break;
        }

        if (beat.isBarre) {
            Atnf.prop(
                properties,
                'barre',
                Atnf.values([
                    Atnf.number(beat.barreFret),
                    Atnf.ident(AlphaTex1EnumMappings.barreShapesReversed.get(beat.barreShape)!)
                ])
            );
        }

        if (beat.slashed) {
            Atnf.prop(properties, 'slashed');
        }

        if (beat.deadSlapped) {
            Atnf.prop(properties, 'ds');
        }

        switch (beat.golpe) {
            case GolpeType.Thumb:
                Atnf.prop(properties, 'glpt');
                break;
            case GolpeType.Finger:
                Atnf.prop(properties, 'glpf');
                break;
        }

        if (beat.invertBeamDirection) {
            Atnf.prop(properties, 'beam', Atnf.identValue('invert'));
        } else if (beat.preferredBeamDirection !== null) {
            Atnf.prop(properties, 'beam', Atnf.identValue(BeamDirection[beat.preferredBeamDirection!]));
        }

        let beamingModeValue = '';
        switch (beat.beamingMode) {
            case BeatBeamingMode.ForceSplitToNext:
                beamingModeValue = 'split';
                break;
            case BeatBeamingMode.ForceMergeWithNext:
                beamingModeValue = 'merge';
                break;
            case BeatBeamingMode.ForceSplitOnSecondaryToNext:
                beamingModeValue = 'splitsecondary';
                break;
        }

        if (beamingModeValue) {
            Atnf.prop(properties, 'beam', Atnf.identValue(beamingModeValue));
        }

        if (beat.showTimer) {
            Atnf.prop(properties, 'timer');
        }

        return properties;
    }
}
