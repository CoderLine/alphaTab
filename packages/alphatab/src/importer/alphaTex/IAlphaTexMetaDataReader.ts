import type {
    AlphaTexMetaDataTagNode,
    AlphaTexPropertyNode,
    AlphaTexArgumentList
} from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import type { AlphaTexParser } from '@coderline/alphatab/importer/alphaTex/AlphaTexParser';

/**
 * @internal
 */
export interface IAlphaTexMetaDataReader {
    readMetaDataValues(parser: AlphaTexParser, metaData: AlphaTexMetaDataTagNode): AlphaTexArgumentList | undefined;

    readMetaDataPropertyValues(
        parser: AlphaTexParser,
        metaData: AlphaTexMetaDataTagNode,
        property: AlphaTexPropertyNode
    ): AlphaTexArgumentList | undefined;

    readBeatPropertyValues(parser: AlphaTexParser, property: AlphaTexPropertyNode): AlphaTexArgumentList | undefined;

    readDurationChangePropertyValues(
        parser: AlphaTexParser,
        property: AlphaTexPropertyNode
    ): AlphaTexArgumentList | undefined;

    readNotePropertyValues(parser: AlphaTexParser, property: AlphaTexPropertyNode): AlphaTexArgumentList | undefined;
}
