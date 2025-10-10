import type { AlphaTexMetaDataNode, AlphaTexPropertyNode } from '@src/importer/alphaTex/AlphaTexAst';
import type { IAlphaTexImporter } from '@src/importer/alphaTex/AlphaTexShared';
import type { FlatSyncPoint } from '@src/model/Automation';
import type { Bar } from '@src/model/Bar';
import type { Beat } from '@src/model/Beat';
import type { Note } from '@src/model/Note';
import type { Score } from '@src/model/Score';
import type { Staff } from '@src/model/Staff';

export enum ApplyNodeResult {
    Applied,
    NotAppliedSemanticError,
    NotAppliedUnrecognizedMarker
}

export interface IAlphaTexLanguageImportHandler {
    applyStructuralMetaData(importer: IAlphaTexImporter, metaData: AlphaTexMetaDataNode): ApplyNodeResult;
    applyScoreMetaData(importer: IAlphaTexImporter, score: Score, metaData: AlphaTexMetaDataNode): ApplyNodeResult;
    applyStaffMetaData(importer: IAlphaTexImporter, staff: Staff, metaData: AlphaTexMetaDataNode): ApplyNodeResult;
    applyBarMetaData(importer: IAlphaTexImporter, bar: Bar, metaData: AlphaTexMetaDataNode): ApplyNodeResult;

    applyBeatDurationProperty(importer: IAlphaTexImporter, property: AlphaTexPropertyNode): ApplyNodeResult;
    applyBeatProperty(importer: IAlphaTexImporter, beat: Beat, property: AlphaTexPropertyNode): ApplyNodeResult;
    applyNoteProperty(importer: IAlphaTexImporter, note: Note, p: AlphaTexPropertyNode): ApplyNodeResult;

    readonly knownStaffMetaDataTags: Set<string>;
    readonly knownBeatProperties: Set<string>;
    readonly knownBarMetaDataTags: Set<string>;
    readonly knownBeatDurationProperties: Set<string>;
    readonly knownNoteProperties: Set<string>;

    buildSyncPoint(importer: IAlphaTexImporter, metaDataNode: AlphaTexMetaDataNode): FlatSyncPoint | undefined;

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
