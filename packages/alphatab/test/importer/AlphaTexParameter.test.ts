import { AlphaTexParser } from '@coderline/alphatab/importer/alphaTex/AlphaTexParser';
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { Settings } from '@coderline/alphatab/Settings';
import { expect } from 'chai';

describe('AlphaTexParameterTests', () => {
    describe('parser', () => {
        function parserTest(tex: string) {
            const parser = new AlphaTexParser(tex);
            const node = parser.read();
            expect(node).to.be.ok;
            expect(node).toMatchSnapshot();
            expect(parser.lexerDiagnostics.errors).toMatchSnapshot('lexer-diagnostics');
            expect(parser.parserDiagnostics.errors).toMatchSnapshot('parser-diagnostics');
        }

        describe('metadata', () => {
            describe('empty signature', () => {
                it('empty1', () => parserTest(`\\ac C4`));
                it('empty2', () => parserTest(`\\ac \\ft C4`));
                it('parenthesis empty', () => parserTest(`\\ac () C4`));
            });

            describe('single overload', () => {
                it('correct', () => parserTest('\\jump Segno C4'));
                it('missing', () => parserTest('\\jump \\ac'));
                it('wrong identifier', () => parserTest('\\jump C4'));
                it('wrong type', () => parserTest('\\jump 3.3'));
            });

            describe('required overloads', () => {
                it('overload1', () => parserTest('\\section "Text"'));
                it('overload2', () => parserTest('\\section "T" "Text'));
            });

            describe('value overloads', () => {
                it('overload1', () => parserTest('\\ts common'));
                it('overload2', () => parserTest('\\ts 3 4'));
            });

            describe('list', () => {
                it('single', () => parserTest('\\systemslayout 3'));
                it('multi', () => parserTest('\\systemslayout 3 2 3'));
            });

            describe('type overloads', () => {
                it('overload1-ident', () => parserTest('\\articulation defaults'));
                it('overload1-string', () => parserTest('\\articulation "defaults"'));
                it('overload2', () => parserTest('\\articulation "A" 1'));
                it('overload3', () => parserTest('\\articulation A 1'));
            });

            describe('optional overloads', () => {
                it('none', () => parserTest('\\track'));
                it('single', () => parserTest('\\track "Name"'));
                it('multi', () => parserTest('\\track "Name" "ShortName"'));
            });
        });

        describe('props', () => {
            describe('empty signature', () => {
                it('empty1', () => parserTest(`C4 {v}`));
                it('empty2', () => parserTest(`C4 {v ac}`));
                it('parenthesis empty', () => parserTest(`C4 { v() }`));
            });

            describe('optional overload', () => {
                it('correct', () => parserTest('C4 {ad 100}'));
                it('missing1', () => parserTest('C4 {ad}'));
                it('missing2', () => parserTest('C4 {ad v}'));
                it('wrong identifier', () => parserTest('C4 {beam invalid}'));
                it('wrong type', () => parserTest('C4 {ad "1"}'));
            });

            describe('single overload', () => {
                it('correct', () => parserTest('\\jump Segno C4'));
                it('missing', () => parserTest('\\jump \\ac'));
                it('wrong identifier', () => parserTest('\\jump C4'));
                it('wrong type', () => parserTest('\\jump 3.3'));
            });

            describe('mixed overloads', () => {
                it('overload1', () => parserTest('\\section "Text"'));
                it('overload2', () => parserTest('\\section "T" "Text'));
            });

            describe('type overloads', () => {
                it('overload1-number', () => parserTest('\\program 20'));
                it('overload2-string', () => parserTest('\\program "Acoustic Grand Piano"'));
                it('overload2-identifier', () => parserTest('\\program AcousticGrandPiano'));
                it('overload3-percussion', () => parserTest('\\program percussion'));
                it('overload2', () => parserTest('\\articulation "A" 1'));
                it('overload3', () => parserTest('\\articulation A 1'));
            });

            describe('vararg overloads', () => {
                // old syntax of tb
                describe('parenthesis', ()=>{
                    it('overload1', () => parserTest('C4 { tb (0 4) }'));
                    it('overload2-ident', () => parserTest('C4 { tb custom (0 4) }'));
                    it('overload2-string', () => parserTest('C4 { tb "custom" (0 4) }'));
                    it('overload3-ident', () => parserTest('C4 { tb gradual (0 4) }'));
                    it('overload3-string', () => parserTest('C4 { tb "gradual"" (0 4) }'));
                    it('overload4-ident', () => parserTest('C4 { tb custom gradual (0 4) }'));
                    it('overload4-string', () => parserTest('C4 { tb "custom" "gradual"" (0 4) }'));
                })

                // "new" syntax of tb without parenthesis
                describe('flat', ()=> {
                    it('overload1', () => parserTest('C4 { tb 0 4 }'));
                    it('overload2-ident', () => parserTest('C4 { tb custom 0 4 }'));
                    it('overload2-string', () => parserTest('C4 { tb "custom" 0 4 }'));
                    it('overload3-ident', () => parserTest('C4 { tb gradual 0 4 }'));
                    it('overload3-string', () => parserTest('C4 { tb "gradual"" 0 4 }'));
                    it('overload4-ident', () => parserTest('C4 { tb custom gradual 0 4 }'));
                    it('overload4-string', () => parserTest('C4 { tb "custom" "gradual"" 0 4 }'));
                });
            });


            describe('ambiguous', ()=>{
                it('incomplete', () => parserTest('C4 { tu 3 }'))
            })
        });
    });

    describe('handler-validation', () => {
        function importTest(tex: string) {
            const importer = new AlphaTexImporter();
            importer.initFromString(tex, new Settings());
            try {
                importer.readScore();
            } catch {
                // ignore
            }

            expect(importer.scoreNode).to.be.ok;
            expect(importer.scoreNode).toMatchSnapshot();
            expect(importer.lexerDiagnostics.errors).toMatchSnapshot('lexer-diagnostics');
            expect(importer.parserDiagnostics.errors).toMatchSnapshot('parser-diagnostics');
            expect(importer.semanticDiagnostics.errors).toMatchSnapshot('semantic-diagnostics');
        }

        describe('metadata', () => {
            describe('empty signature', () => {
                it('empty1', () => importTest(`\\ac C4`));
                it('empty2', () => importTest(`\\ac \\ft C4`));
                it('parenthesis empty', () => importTest(`\\ac () C4`));
            });

            describe('single overload', () => {
                it('correct', () => importTest('\\jump Segno C4'));
                it('missing', () => importTest('\\jump \\ac'));
                it('wrong identifier', () => importTest('\\jump C4'));
                it('wrong type', () => importTest('\\jump 3.3'));
            });

            describe('required overloads', () => {
                it('overload1', () => importTest('\\section "Text"'));
                it('overload2', () => importTest('\\section "T" "Text"'));
            });

            describe('value overloads', () => {
                it('overload1', () => importTest('\\ts common'));
                it('overload2', () => importTest('\\ts 3 4'));
            });

            describe('list', () => {
                it('single', () => importTest('\\systemslayout 3'));
                it('multi', () => importTest('\\systemslayout 3 2 3'));
            });

            describe('type overloads', () => {
                it('overload1-ident', () => importTest('\\articulation defaults'));
                it('overload2-string', () => importTest('\\articulation "A" 38'));
                it('overload2-ident', () => importTest('\\articulation A 38'));
            });

            describe('optional overloads', () => {
                it('none', () => importTest('\\track'));
                it('single', () => importTest('\\track "Name"'));
                it('multi', () => importTest('\\track "Name" "ShortName"'));
            });
        });

        describe('props', () => {
            describe('empty signature', () => {
                it('empty1', () => importTest(`C4 {v}`));
                it('empty2', () => importTest(`C4 {v ac}`));
                it('parenthesis empty', () => importTest(`C4 { v() }`));
            });

            describe('optional overload', () => {
                it('correct', () => importTest('C4 {ad 100}'));
                it('missing1', () => importTest('C4 {ad}'));
                it('missing2', () => importTest('C4 {ad v}'));
                it('wrong identifier', () => importTest('C4 {beam invalid}'));
                it('wrong type', () => importTest('C4 {ad "1"}'));
            });

            describe('type overloads', () => {
                it('overload1-number', () => importTest('\\track { instrument 20 }'));
                it('overload2-string', () => importTest('\\track { instrument "Acoustic Grand Piano"}'));
                it('overload2-identifier', () => importTest('\\track { instrument AcousticGrandPiano }'));
                it('overload3-percussion', () => importTest('\\track { instrument percussion }'));
            });

            describe('vararg overloads', () => {
                // old syntax of tb
                describe('parenthesis', ()=>{
                    it('overload1', () => importTest('C4 { tb (0 4) }'));
                    it('overload2-ident', () => importTest('C4 { tb custom (0 4) }'));
                    it('overload2-string', () => importTest('C4 { tb "custom" (0 4) }'));
                    it('overload3-ident', () => importTest('C4 { tb gradual (0 4) }'));
                    it('overload3-string', () => importTest('C4 { tb "gradual"" (0 4) }'));
                    it('overload4-ident', () => importTest('C4 { tb custom gradual (0 4) }'));
                    it('overload4-string', () => importTest('C4 { tb "custom" "gradual"" (0 4) }'));
                })

                // "new" syntax of tb without parenthesis
                describe('flat', ()=> {
                    it('overload1', () => importTest('C4 { tb 0 4 }'));
                    it('overload2-ident', () => importTest('C4 { tb custom 0 4 }'));
                    it('overload2-string', () => importTest('C4 { tb "custom" 0 4 }'));
                    it('overload3-ident', () => importTest('C4 { tb gradual 0 4 }'));
                    it('overload3-string', () => importTest('C4 { tb "gradual" 0 4 }'));
                    it('overload4-ident', () => importTest('C4 { tb custom gradual 0 4 }'));
                    it('overload4-string', () => importTest('C4 { tb "custom" "gradual"" 0 4 }'));
                });
            });

            describe('ambiguous', ()=>{
                it('incomplete', () => importTest(''))
            })
        });
    });
});
