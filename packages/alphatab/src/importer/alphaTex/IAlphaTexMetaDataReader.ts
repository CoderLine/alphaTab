import type {
    AlphaTexMetaDataTagNode,
    AlphaTexPropertyNode,
    AlphaTexValueList
} from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import type { AlphaTexParser } from '@coderline/alphatab/importer/alphaTex/AlphaTexParser';

/**
 * @internal
 */
export interface IAlphaTexMetaDataReader {
    readMetaDataValues(parser: AlphaTexParser, metaData: AlphaTexMetaDataTagNode): AlphaTexValueList | undefined;

    readMetaDataPropertyValues(
        parser: AlphaTexParser,
        metaData: AlphaTexMetaDataTagNode,
        property: AlphaTexPropertyNode
    ): AlphaTexValueList | undefined;

    readBeatPropertyValues(parser: AlphaTexParser, property: AlphaTexPropertyNode): AlphaTexValueList | undefined;

    readDurationChangePropertyValues(
        parser: AlphaTexParser,
        property: AlphaTexPropertyNode
    ): AlphaTexValueList | undefined;

    readNotePropertyValues(parser: AlphaTexParser, property: AlphaTexPropertyNode): AlphaTexValueList | undefined;
}
