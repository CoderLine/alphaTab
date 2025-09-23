import { AlphaTexParser } from '@src/importer/AlphaTexParser';
import { expect } from 'chai';

describe('AlphaTexParserTest', () => {
    function parserTest(source: string) {
        const parser = new AlphaTexParser(source);
        const node = parser.read();
        expect(node).toMatchSnapshot();
    }

    // TODO: test specifics of the parser to construct the AST
    // it should cover mainly:
    // - the main syntax tree (valid)
    // - all parser diagnostics
    // - semantic node start/end locations and comments
    // - general parsing of metadata value lists (delimited/undelimited)
    // - general parsing of properties
    // - general parsing of property values (delimited/undelimited)
    // - parsing of float values where needed
    // - parsing of some trick constructs where we might have overlaps on metadata and notes
    // - parsing of intermediate documents (result + diagnostics)

    // we should try to stay here on the parsing level, and not
    // cover too much of the semantic stuff
});
