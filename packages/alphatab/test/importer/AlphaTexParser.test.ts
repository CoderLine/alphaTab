import { AlphaTexParser } from '@src/importer/AlphaTexParser';
import { expect } from 'chai';

describe('AlphaTexParserTest', () => {
    function parserTest(source: string, message: string) {
        const parser = new AlphaTexParser(source);
        const node = parser.read();
        expect(node).to.be.ok;
        expect(node, message).toMatchSnapshot();
        expect(parser.lexerDiagnostics, message).toMatchSnapshot('lexer-diagnostics');
        expect(parser.parserDiagnostics, message).toMatchSnapshot('parser-diagnostics');
    }

    // TODO: test specifics of the parser to construct the AST
    // it should cover mainly:
    // - parsing of intermediate documents (result + diagnostics)

    // we should try to stay here on the parsing level, and not
    // cover too much of the semantic stuff

    it('valid-empty', () => {
        parserTest('', 'empty');
    });

    it('valid-score-metadata', () => {
        parserTest(' . ', 'empty');
        parserTest('\\title ("Title") . ', 'known valuelist');
        parserTest('\\title "Title" "Template" left . ', 'known semantic');
        parserTest('\\title "Title" \\subtitle "Sub" . ', 'known multiple');
        parserTest('\\track "Name" {color "red"} . ', 'known property');
        parserTest('\\notExisting ("Value") . ', 'unknown valuelist');
        parserTest('\\notExisting ("Value") \\notExisting ("") . ', 'unknown multiple');
        parserTest('\\notExisting ("Value") {} . ', 'valuelist propertylist empty');
        parserTest('\\notExisting ("Value") {unknown (1 2 3)} . ', 'valuelist propertylist unknown prop');
    });

    it('valid-bars', () => {
        parserTest(' C4 | C4 ', 'no score meta');
        parserTest('\\title "Test" . C4 | C4 ', 'with score meta');
        parserTest('C4 | C4 |  ', 'empty at end');
    });

    it('valid-bar-meta', () => {
        parserTest('\\notExisting ("Value") C4 | C4 ', 'unknown no score meta');
        parserTest('. \\notExisting ("Value") C4 | C4 ', 'unkonwn score meta');
        parserTest('\\ts 3 4 C4 | C4 ', 'known no score meta');
        parserTest('. \\ts 3 4  ("Value") C4 | C4 ', 'known score meta');
    });

    it('valid-beats-basic-pitched', () => {
        parserTest('C4 C5', 'basic');
        parserTest(':2 C4 :4 C5', 'duration change');
        parserTest('C4.4 C5.8', 'duration');
        parserTest('C4*4 C5*2', 'multiplier');
        parserTest('C4.4 {} C5.4 {}', 'effects empty');
        parserTest('C4.4 {v f} C5.4 {cre tu 3 2}', 'effects known');
        parserTest(':2 C4.8 * 2 {cre tu 3 2}', 'complex');
    });

    it('valid-beats-chord-pitched', () => {
        parserTest('(C4 C5) (D4 D5)', 'chord');
        parserTest(':2 (C4 C5) 4: (D4 D5)', 'duration change');
        parserTest('(C4 C5).4 (D4 D5).8', 'duration');
        parserTest('(C4 C5)*4 (D4 D5)*2', 'multiplier');
        parserTest('(C4 C5) {} (D4 D5) {}', 'effects empty');
        parserTest('(C4 C5) {v f} (D4 D5) {cre tu 3 2}', 'effects known');
        parserTest(':2 (C4 C5).8 * 2 {cre tu 3 2}', 'complex');
    });

    it('valid-beats-basic-fretted', () => {
        parserTest('3.3 4.2', 'basic');
        parserTest(':2 3.3 :4 4.2', 'duration change');
        parserTest('3.3.4 4.2.8', 'duration');
        parserTest('3.3*4 4.2*2', 'multiplier');
        parserTest('3.3.4 {} 4.2.4 {}', 'effects empty');
        parserTest('3.3.4 {v f} 4.2.4 {cre tu 3 2}', 'effects known');
        parserTest(':2 3.3.8 * 2 {cre tu 3 2}', 'complex');
        parserTest('3.3.8 | 3 . 3 . 8 | 3.3 .8 | 3 . 3.8', 'spacing');
    });

    it('valid-beats-chord-fretted', () => {
        parserTest('(3.3 4.2) (1.2 6.1)', 'chord');
        parserTest(':2 (3.3 4.2) 4: (1.2 6.1)', 'duration change');
        parserTest('(3.3 4.2).4 (1.2 6.1).8', 'duration');
        parserTest('(3.3 4.2)*4 (1.2 6.1)*2', 'multiplier');
        parserTest('(3.3 4.2).4 {} (1.2 6.1).4 {}', 'effects empty');
        parserTest('(3.3 4.2).4 {v f} (1.2 6.1).4 {cre tu 3 2}', 'effects known');
        parserTest(':2 (3.3 4.2).8 * 2 {cre tu 3 2}', 'complex');
        parserTest(
            `
            (
                3.3.8 
                3 . 3 . 8 
                3.3 .8 
                3 . 3.8
            )`,
            'spacing'
        );
    });

    it('valid-beats-rest', () => {
        parserTest('r', 'rest');
        parserTest(':2 r :4 r', 'duration change');
        parserTest('r.4 r.8', 'duration');
        parserTest('r*4 r*2', 'multiplier');
        parserTest('r.4 {} r.4 {}', 'effects empty');
        parserTest('r.4 {v f} r.4 {cre tu 3 2}', 'effects known');
        parserTest(':2 r.8 * 2 {cre tu 3 2}', 'complex');
    });

    it('valid-beat-effects', () => {
        parserTest('C4.8 {}', 'empty');
        parserTest('C4.8 {unknown (1 2 3)}', 'unknown');
        parserTest('C4.8 {tu 2 3}', 'known');
        parserTest('C4.8 {wb (0 -2 0)}', 'known with list');
        parserTest('C4.8 {cre wb (0 -2 0) tu 3 2}', 'multiple');
    });

    it('valid-note-effects', () => {
        parserTest('C4 {}', 'empty');
        parserTest('C4 {unknown (1 2 3)}', 'unknown');
        parserTest('C4 {tr 4 4}', 'known');
        parserTest('C4 {b (0 4 0)}', 'known with list');
        parserTest('C4 {nh b (0 4 0) v}', 'multiple');
        parserTest('(C4 {nh b (0 4 0) v} C5 { v h unknown (1 2 3)})', 'multiple chord');
        parserTest('C4 {nh b (0 4 0) v} { tu 3 2 }', 'with beat effects');
        parserTest('(C4 {nh b (0 4 0) v} C5 { v h unknown (1 2 3)}) { tu 3 2 }', 'multiple chord beat effects');
    });

    it('valid-sync-points', () => {
        parserTest(' . . ', 'empty');
        parserTest(' . C4 | C5 . ', 'empty with bars');
        parserTest(' . C4 | C5 | . ', 'empty with bars empty at end');
        parserTest(' . C4 . \\sync 1 1 1', 'basic');
        parserTest(' \\title "Test . C4 . \\sync 1 1 1', 'full');
        parserTest(' . C4 . \\sync (1 1 1)', 'valuelist');
        parserTest(' . C4 . \\sync (1 1 1) {} ', 'properties empty');
        parserTest(' . C4 . \\sync (1 1 1) { unknown (1 2 3) } ', 'properties unknown');
    });

    it('floats', () => {
        parserTest('\\tempo 120 "Moderate" 0.5', 'tempo');
        parserTest('\\unknown (1.2 2.3)', 'valuelist');
        parserTest('. \\scale 0.5', 'valuelist');
    });

    it('comments', () => {
        parserTest('// Single \n \\title "Test"', 'score meta singleline');
        parserTest('/* multi\nline*/ \\title "Test"', 'score meta multiline');
        parserTest('\\title /* multi\nline*/ "Test"', 'score meta multiline middle');
        parserTest('. // Single \n \\ts 3 4', 'bar meta singleline');
        parserTest('. /* multi\nline*/ \\ks 3 4', 'bar multiline');
        parserTest('. \\ks 3 /* multi\nline*/ 4', 'bar multiline middle');
        parserTest('. C4 // Single \n C5', 'beat singleline');
        parserTest('. C4 /* multi\nline*/ C5', 'beat multiline');
        parserTest('. (C4 // Single \n C5)', 'beat chord singleline');
        parserTest('. (C4 /* multi\nline*/ C5)', 'beat chord multiline');
        parserTest('. (C4 C5) { // Single \n } ', 'beateffects singleline');
        parserTest('. (C4 C5) { /* multi\nline*/ }', 'beateffects multiline');
        parserTest('. (C4 { // Single \n } C5)', 'noteeffects singleline');
        parserTest('. (C4   { /* multi\nline*/ } C5)', 'noteeffects multiline');
    });

    it('ambiguous', () => {
        parserTest('\\tempo 120 3.3 3.4', 'tempo and stringed note');
        parserTest('\\tempo 120 "Moderate" 3.4', 'tempo, temponame and stringed note');
    });

    it('intermediate', () =>{
        parserTest('\\', 'started initial meta')
        parserTest('\\tr', 'started meta')
        parserTest('\\track "X" {', 'started meta properties')
        parserTest('\\track "X" { co', 'started meta property name')
        parserTest('\\track "X" { color "', 'started meta property value')
        parserTest('\\track "X" { color "red"', 'finished meta property value, not closed ')
        
        parserTest('\\title "Ti', 'started meta string')
        
        parserTest('\\title "Title" . C', 'started pitched note')
        parserTest('\\title "Title" . C4 { ', 'started note effects')
        parserTest('\\title "Title" . C4 { slu', 'started note effect name')
        parserTest('\\title "Title" . C4 { slur "S1', 'started note effect value')
        parserTest('\\title "Title" . C4 { slur "S1"', 'finished note effect value, not closed')
        parserTest('\\title "Title" . C4 { slur "S1" } .', 'started beat duration')
        parserTest('\\title "Title" . C4 { slur "S1" } . 4 { ', 'started beat effects')
        parserTest('\\title "Title" . C4 { slur "S1" } . 4 { ras', 'started beat effect name')
        parserTest('\\title "Title" . C4 { slur "S1" } . 4 { rasg "i', 'started beat effect value')
        parserTest('\\title "Title" . C4 { slur "S1" } . 4 { rasg "i" ', 'finished beat effect value, not closed')
    })
});
