import type { AlphaTexAstNode } from '@src/importer/alphaTex/AlphaTexAst';
import { AlphaTexLexer } from '@src/importer/alphaTex/AlphaTexLexer';
import { expect } from 'chai';

describe('AlphaTexLexerTest', () => {
    function lexerTest(source: string, diagnostics: boolean = false) {
        const lexer = new AlphaTexLexer(source);
        const actual: AlphaTexAstNode[] = [];

        while (true) {
            const token = lexer.nextToken();
            if (!token) {
                break;
            }
            actual.push(token);
        }

        expect(actual).toMatchSnapshot();
        if (diagnostics) {
            expect(lexer.lexerDiagnostics.items).toMatchSnapshot();
        }
    }

    function floatTest(source: string) {
        const lexer = new AlphaTexLexer(source);

        const actual: AlphaTexAstNode[] = [];

        while (true) {
            const token = lexer.nextTokenWithFloats();
            if (!token) {
                break;
            }
            actual.push(token);
        }

        expect(actual).toMatchSnapshot();
    }

    it('strings', () => {
        lexerTest(`"Double Quoted"`);
        lexerTest(`'Single Quoted'`);
        lexerTest(`'Multiple' "Strings"`);
        lexerTest(`"Double \\"Quoted\\""`);
        lexerTest(`'Single \\'Quoted\\''`);
        lexerTest(`"\\r\\n\\t"`);
        lexerTest(`"\\R\\N\\T"`);
        lexerTest(`"\\uD83D\\uDE38"`);
        lexerTest(`"😸🤘🏻"`);
    });

    it('numbers', () => {
        lexerTest(`1`);
        lexerTest(`1234`);
        lexerTest(`-1`);
        lexerTest(`-1234`);
        lexerTest(`1234 5678`);
    });

    it('basic-tokens', () => {
        lexerTest(`.`);
        lexerTest(`:`);
        lexerTest(`(`);
        lexerTest(`)`);
        lexerTest(`{`);
        lexerTest(`}`);
        lexerTest(`|`);
        lexerTest(`*`);
    });

    it('meta-command', () => {
        lexerTest('\\title');
        lexerTest('\\\\double');
        lexerTest('\\withNumber123');
        lexerTest('\\withUnicode😼');
        lexerTest('\\withUnicode😼 . \\withNumber123');
    });

    it('whitespace', () => {
        lexerTest('  .  \r\n\t\v    .');
    });

    it('identifiers', () => {
        lexerTest('true');
        lexerTest('false');
        lexerTest('HelloWorld');
        lexerTest('C4');
        lexerTest('C#4');
        lexerTest('Cb4');
        lexerTest('electricpiano1');
        lexerTest('Unicodeöäü Unicode😸 Utf16🤘🏻');
        lexerTest('dashed-identifier');
    });

    it('floats', () => {
        floatTest('1.1');
        floatTest('11.22 33.44');
        floatTest('1.1.4');
        floatTest('1.1 .4');
        floatTest('1 .1.4');
        floatTest('-1.1');
        floatTest('-.1');
        floatTest('1.1(');
        floatTest('1.1{');
        floatTest('1.1|');
        floatTest('1.1a');
        floatTest('1a.1');
        floatTest('1.1\\test');
    });

    it('leading-comments', () => {
        lexerTest(`
        // Single
        true
        /* Multi */
        /* Multi2 */
        // Single
        false
        `);
    });

    it('trailing-comments', () => {
        lexerTest(`
        true // Single After
        false /* Multi After */
        /* before */ true /* middle */ false // after
        `);
    });

    describe('errors', () => {
        it('at001', () => {
            lexerTest('/a */', true);
        });

        it('at002', () => {
            lexerTest('\\ "Test"', true);
        });

        it('at003', () => {
            lexerTest('"\\uAB"', true);
        });

        it('at004', () => {
            lexerTest('"\\uXXXX"', true);
        });

        it('at005', () => {
            lexerTest('"\\b01010101"', true);
        });

        it('at006', () => {
            lexerTest('"double', true);
            lexerTest("'single", true);
        });
    });
});
