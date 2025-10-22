import { AlphaTexParser } from '@src/importer/alphaTex/AlphaTexParser';
import { expect } from 'chai';

describe('AlphaTexParserTest', () => {
    function parserTest(source: string) {
        const parser = new AlphaTexParser(source);
        const node = parser.read();
        expect(node).to.be.ok;
        expect(node).toMatchSnapshot();
        expect(parser.lexerDiagnostics.errors).toMatchSnapshot('lexer-diagnostics');
        expect(parser.parserDiagnostics.errors).toMatchSnapshot('parser-diagnostics');
    }

    describe('valid-empty', () => {
        it('empty', () => parserTest(''));
    });

    describe('valid-score-metadata', () => {
        it('empty', () => parserTest(' . '));
        it('known valuelist', () => parserTest('\\title ("Title") . '));
        it('known semantic', () => parserTest('\\title "Title" "Template" left . '));
        it('known multiple', () => parserTest('\\title "Title" \\subtitle "Sub" . '));
        it('known property', () => parserTest('\\track "Name" {color "red"} . '));
        it('known property before value', () => parserTest('\\track {color "red"} "Name" . '));
        it('unknown valuelist', () => parserTest('\\notExisting ("Value") . '));
        it('unknown multiple', () => parserTest('\\notExisting ("Value") \\notExisting ("") . '));
        it('valuelist propertylist empty', () => parserTest('\\notExisting ("Value") {} . '));
        it('valuelist propertylist unknown prop', () => parserTest('\\notExisting ("Value") {unknown (1 2 3)} . '));
    });

    describe('valid-bars', () => {
        it('no score meta', () => parserTest(' C4 | C4 '));
        it('with score meta', () => parserTest('\\title "Test" . C4 | C4 '));
        it('empty at end', () => parserTest('C4 | C4 |  '));
        it('multiple empty', () => parserTest('C4 | C4 | | | | '));
        it('multiple empty then filled', () => parserTest('C4 | C4 | | | | C4 '));
    });

    describe('valid-bar-meta', () => {
        it('unknown no score meta', () => parserTest('\\notExisting ("Value") C4 | C4 '));
        it('unkonwn score meta', () => parserTest('. \\notExisting ("Value") C4 | C4 '));
        it('known no score meta', () => parserTest('\\ts 3 4 C4 | C4 '));
        it('known score meta', () => parserTest('. \\ts 3 4  ("Value") C4 | C4 '));
    });

    describe('valid-beats-basic-pitched', () => {
        it('basic', () => parserTest('C4 C5'));
        it('duration change', () => parserTest(':2 C4 :4 C5'));
        it('duration', () => parserTest('C4.4 C5.8'));
        it('multiplier', () => parserTest('C4*4 C5*2'));
        it('effects empty', () => parserTest('C4.4 {} C5.4 {}'));
        it('effects known', () => parserTest('C4.4 {v f} C5.4 {cre tu 3 2}'));
        it('complex', () => parserTest(':2 C4.8 * 2 {cre tu 3 2}'));
    });

    describe('valid-beats-chord-pitched', () => {
        it('chord', () => parserTest('(C4 C5) (D4 D5)'));
        it('duration change', () => parserTest(':2 (C4 C5) :4 (D4 D5)'));
        it('duration', () => parserTest('(C4 C5).4 (D4 D5).8'));
        it('multiplier', () => parserTest('(C4 C5)*4 (D4 D5)*2'));
        it('effects empty', () => parserTest('(C4 C5) {} (D4 D5) {}'));
        it('effects known', () => parserTest('(C4 C5) {v f} (D4 D5) {cre tu 3 2}'));
        it('complex', () => parserTest(':2 (C4 C5).8 * 2 {cre tu 3 2}'));
    });

    describe('valid-beats-basic-fretted', () => {
        it('basic', () => parserTest('3.3 4.2'));
        it('duration change', () => parserTest(':2 3.3 :4 4.2'));
        it('duration', () => parserTest('3.3.4 4.2.8'));
        it('multiplier', () => parserTest('3.3*4 4.2*2'));
        it('effects empty', () => parserTest('3.3.4 {} 4.2.4 {}'));
        it('effects known', () => parserTest('3.3.4 {v f} 4.2.4 {cre tu 3 2}'));
        it('complex', () => parserTest(':2 3.3.8 * 2 {cre tu 3 2}'));
        it('spacing', () => parserTest('3.3.8 | 3 . 3 . 8 | 3.3 .8 | 3 . 3.8'));
    });

    describe('valid-beats-chord-fretted', () => {
        it('chord', () => parserTest('(3.3 4.2) (1.2 6.1)'));
        it('duration change', () => parserTest(':2 (3.3 4.2) :4 (1.2 6.1)'));
        it('duration', () => parserTest('(3.3 4.2).4 (1.2 6.1).8'));
        it('multiplier', () => parserTest('(3.3 4.2)*4 (1.2 6.1)*2'));
        it('effects empty', () => parserTest('(3.3 4.2).4 {} (1.2 6.1).4 {}'));
        it('effects known', () => parserTest('(3.3 4.2).4 {v f} (1.2 6.1).4 {cre tu 3 2}'));
        it('complex', () => parserTest(':2 (3.3 4.2).8 * 2 {cre tu 3 2}'));
        it('spacing', () =>
            parserTest(`
            (
                3.3 
                3 . 3
            ) . 8`));
    });

    describe('valid-beats-rest', () => {
        it('rest', () => parserTest('r'));
        it('duration change', () => parserTest(':2 r :4 r'));
        it('duration', () => parserTest('r.4 r.8'));
        it('multiplier', () => parserTest('r*4 r*2'));
        it('effects empty', () => parserTest('r.4 {} r.4 {}'));
        it('effects known', () => parserTest('r.4 {v f} r.4 {cre tu 3 2}'));
        it('complex', () => parserTest(':2 r.8 * 2 {cre tu 3 2}'));
    });

    describe('valid-beat-effects', () => {
        it('empty', () => parserTest('C4.8 {}'));
        it('unknown', () => parserTest('C4.8 {unknown (1 2 3)}'));
        it('known', () => parserTest('C4.8 {tu 2 3}'));
        it('known with list', () => parserTest('C4.8 {tb (0 -2 0)}'));
        it('multiple', () => parserTest('C4.8 {cre tb (0 -2 0) tu 3 2}'));
    });

    describe('valid-note-effects', () => {
        it('empty', () => parserTest('C4 {}'));
        it('unknown', () => parserTest('C4 {unknown (1 2 3)}'));
        it('known', () => parserTest('C4 {tr 4 4}'));
        it('known with list', () => parserTest('C4 {b (0 4 0)}'));
        it('multiple', () => parserTest('C4 {nh b (0 4 0) v}'));
        it('multiple chord', () => parserTest('(C4 {nh b (0 4 0) v} C5 { v h unknown (1 2 3)})'));
        it('with beat effects', () => parserTest('C4 {nh b (0 4 0) v} { tu 3 2 }'));
        it('beat effects in note effect', () => parserTest('C4 { tu 3 2 }'));
        it('multiple chord beat effects', () =>
            parserTest('(C4 {nh b (0 4 0) v} C5 { v h unknown (1 2 3)}) { tu 3 2 }'));
    });

    describe('valid-sync-points', () => {
        it('empty', () => parserTest(' . . '));
        it('empty with bars', () => parserTest(' . C4 | C5 . '));
        it('empty with bars empty at end', () => parserTest(' . C4 | C5 | . '));
        it('basic simple pitched', () => parserTest(' . C4 . \\sync 1 1 1'));
        it('basic simple numbered', () => parserTest(' . 32 . \\sync 1 1 1'));
        it('basic fretted', () => parserTest(' . 3.3 . \\sync 1 1 1'));
        it('full', () => parserTest(' \\title "Test" . C4.4 . \\sync 1 1 1'));
        it('valuelist', () => parserTest(' . C4 . \\sync (1 1 1)'));
        it('properties empty', () => parserTest(' . C4 . \\sync (1 1 1) {} '));
        it('properties unknown', () => parserTest(' . C4 . \\sync (1 1 1) { unknown (1 2 3) } '));
    });

    describe('floats', () => {
        it('tempo', () => parserTest('. \\tempo 120 "Moderate" 0.5'));
        it('tempo parenthesis', () => parserTest('. \\tempo (120 "Moderate" 0.5)'));
        it('valuelist parenthesis', () => parserTest('\\unknown (1.2 2.3)'));
        it('valuelist', () => parserTest('. \\scale 0.5'));
    });

    describe('comments', () => {
        it('score meta singleline', () => parserTest('// Single \n \\title "Test"'));
        it('score meta multiline', () => parserTest('/* multi\nline*/ \\title "Test"'));
        it('score meta multiline middle', () => parserTest('\\title /* multi\nline*/ "Test"'));
        it('bar meta singleline', () => parserTest('. \n// Single \n \\ts 3 4'));
        it('bar multiline', () => parserTest('.\n/* multi\nline*/ \\ts 3 4'));
        it('bar multiline middle', () => parserTest('.\n\\ts 3 /* multi\nline*/ 4'));
        it('beat singleline', () => parserTest('. C4\n // Single \n C5'));
        it('beat multiline', () => parserTest('. C4\n /* multi\nline*/ C5'));
        it('beat chord singleline', () => parserTest('. (C4\n // Single \n C5)'));
        it('beat chord multiline', () => parserTest('. (C4\n /* multi\nline*/ C5)'));
        it('beateffects singleline', () => parserTest('. (C4 C5) {\n // Single \n } '));
        it('beateffects multiline', () => parserTest('. (C4 C5) {\n /* multi\nline*/ }'));
        it('noteeffects singleline', () => parserTest('. (C4 {\n // Single \n } C5)'));
        it('noteeffects multiline', () => parserTest('. (C4   {\n /* multi\nline*/ } C5)'));
    });

    describe('ambiguous', () => {
        it('tempo and stringed note', () => parserTest('\\tempo 120 3.3 3.4'));
        it('tempo, temponame and stringed note', () => parserTest('\\tempo 120 "Moderate" 3.4'));
    });

    // TODO: check how much of the AST we need to provide code completion
    // currently the parser/lexer are rather "fail fast" and do not
    // provide many intermediately parsed nodes.

    describe('intermediate', () => {
        it('started initial meta', () => parserTest('\\'));
        it('started meta', () => parserTest('\\tr'));
        it('started meta properties', () => parserTest('\\track "X" {'));
        it('started meta property name', () => parserTest('\\track "X" { co'));
        it('started meta property value', () => parserTest('\\track "X" { color "'));
        it('finished meta property value, not closed ', () => parserTest('\\track "X" { color "red"'));

        it('started meta string', () => parserTest('\\title "Ti'));

        it('started pitched note', () => parserTest('\\title "Title" . C'));
        it('started note effects', () => parserTest('\\title "Title" . C4 { '));
        it('started note effect name', () => parserTest('\\title "Title" . C4 { slu'));
        it('started note effect value', () => parserTest('\\title "Title" . C4 { slur "S1'));
        it('finished note effect value, not closed', () => parserTest('\\title "Title" . C4 { slur "S1"'));
        it('started beat duration', () => parserTest('\\title "Title" . C4 { slur "S1" } .'));
        it('started beat effects', () => parserTest('\\title "Title" . C4 { slur "S1" } . 4 { '));
        it('started beat effect name', () => parserTest('\\title "Title" . C4 { slur "S1" } . 4 { ras'));
        it('started beat effect value', () => parserTest('\\title "Title" . C4 { slur "S1" } . 4 { rasg "i'));
        it('finished beat effect value, not closed', () =>
            parserTest('\\title "Title" . C4 { slur "S1" } . 4 { rasg "i" '));
    });

    describe('errors', () => {
        describe('at200', () => {
            it('missing', () => parserTest('(3.3) * '));
            it('type', () => parserTest('(3.3) * A'));
        });

        describe('at201', () => {
            it('missing', () => parserTest(':'));
            it('type', () => parserTest(':A'));
        });

        describe('at202', () => {
            it('beat duration', () => parserTest('(C4).A'));
            it('note string', () => parserTest('3.A'));
            it('note value', () => parserTest(' . ( \\notevalue )'));
            it('value list', () => parserTest('\\meta (\\metavalue)'));
            it('meta value', () => parserTest('\\title 10'));
        });

        describe('at203', () => {
            it('note string', () => parserTest('. (3.'));
            it('meta value', () => parserTest('\\title'));
        });

        describe('at204', () => {
            it('score', () => parserTest('\\unknown'));
            it('bar', () => parserTest('. \\unknown'));
        });

        describe('at205', () => {
            it('bar', () => parserTest('. \\track "Test" {unknown}'));
            it('beat', () => parserTest('. (C4) {unknown}'));
            it('note', () => parserTest('. (C4{unknown})'));
            it('gracetype', () => parserTest('C4 {gr invalid}'));
            it('barre', () => parserTest('C4 {barre 1 invalid}'));
            it('fermata', () => parserTest('C4 {fermata invalid}'));
        });

        describe('at206', () => {
            it('note list', () => parserTest('(C4'));
            it('properties', () => parserTest('\\track "Test" { color red'));
            it('values', () => parserTest('\\title ("Test"'));
        });
    });
});
