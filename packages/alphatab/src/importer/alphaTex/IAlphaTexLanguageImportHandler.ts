import type { AlphaTexMetaDataNode, AlphaTexPropertyNode } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import type { IAlphaTexImporter } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import type { Score } from '@coderline/alphatab/model/Score';
import type { Staff } from '@coderline/alphatab/model/Staff';

/**
 * @internal
 */
export enum ApplyNodeResult {
    Applied = 0,
    NotAppliedSemanticError = 1,
    NotAppliedUnrecognizedMarker = 2
}

/**
 * @internal
 */
export enum ApplyStructuralMetaDataResult {
    AppliedNewTrack = 0,
    AppliedNewStaff = 1,
    AppliedNewVoice = 2,
    NotAppliedSemanticError = 3,
    NotAppliedUnrecognizedMarker = 4
}

/**
 * @internal
 */
export interface IAlphaTexLanguageImportHandler {
    applyStructuralMetaData(importer: IAlphaTexImporter, metaData: AlphaTexMetaDataNode): ApplyStructuralMetaDataResult;
    applyScoreMetaData(importer: IAlphaTexImporter, score: Score, metaData: AlphaTexMetaDataNode): ApplyNodeResult;
    applyStaffMetaData(importer: IAlphaTexImporter, staff: Staff, metaData: AlphaTexMetaDataNode): ApplyNodeResult;
    applyBarMetaData(importer: IAlphaTexImporter, bar: Bar, metaData: AlphaTexMetaDataNode): ApplyNodeResult;

    applyBeatDurationProperty(importer: IAlphaTexImporter, property: AlphaTexPropertyNode): ApplyNodeResult;
    applyBeatProperty(importer: IAlphaTexImporter, beat: Beat, property: AlphaTexPropertyNode): ApplyNodeResult;
    applyNoteProperty(importer: IAlphaTexImporter, note: Note, p: AlphaTexPropertyNode): ApplyNodeResult;

    readonly allKnownMetaDataTags: Set<string>;
    readonly knownScoreMetaDataTags: Set<string>;
    readonly knownStructuralMetaDataTags: Set<string>;
    readonly knownStaffMetaDataTags: Set<string>;
    readonly knownBarMetaDataTags: Set<string>;

    readonly knownBeatProperties: Set<string>;
    readonly knownBeatDurationProperties: Set<string>;
    readonly knownNoteProperties: Set<string>;

    buildScoreMetaDataNodes(score: Score): AlphaTexMetaDataNode[];
    buildBarMetaDataNodes(
        staff: Staff,
        bar: Bar | undefined,
        voice: number,
        isMultiVoice: boolean
    ): AlphaTexMetaDataNode[];
    buildSyncPointNodes(score: Score): AlphaTexMetaDataNode[];
    buildBeatEffects(beat: Beat): AlphaTexPropertyNode[];
    buildNoteEffects(data: Note): AlphaTexPropertyNode[];
}
