import { AlphaTexImporter } from '@src/importer/AlphaTexImporterNew';
import { Settings } from '@src/Settings';
import { expect } from 'chai';

describe('AlphaTexImporterNewTest', () => {
    function importTest(tex: string) {
        const importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        const score = importer.readScore();
        expect(score).Arguments.toMatchSnapshot();
        expect(importer.lexerDiagnostics).toMatchSnapshot('lexer-diagnostics');
        expect(importer.parserDiagnostics).toMatchSnapshot('parser-diagnostics');
        expect(importer.semanticDiagnostics).toMatchSnapshot('semantic-diagnostics');
    }

    // Here we should focus on all the semantic tests:
    // - all metadata tags (valid and invalid variants)
    // - all properties (valid and invalid variants)
    // - proper diagnostics reporting
    // - value list type validations
    // - round-trip tests on old/new importer/exporter (backwards compatibility, and verification of new parser)

    describe('errors', () => {
        describe('at209', () => {
            it('tuning', () => importTest('\\tuning XX'));
            it('articulation', () => importTest('\\articulation "Test" 0'));
            it('score required', () => importTest('\\title (1)'));
            it('bar required', () => importTest('. \\rc ("a")'));
            it('score optional', () => importTest('\\title ("Title" 1)'));
            it('bar optional', () => importTest('. \\section ("a" 1)'));
            it('duration tuplet', () => importTest('. :4 {tu 0}'));
            it('beat tuplet', () => importTest('. C4 {tu 0}'));
            it('tremolo speed', () => importTest('. C4 {tp 0}'));
            it('beam', () => importTest('. C4 {beam invalid}'));
            it('trill', () => importTest('. C4 {tr 0}'));
            it('bracketextendmode', () => importTest('\\bracketextendmode invalid'));
            it('singletracktracknamepolicy', () => importTest('\\singletracktracknamepolicy invalid'));
            it('multitracktracknamepolicy', () => importTest('\\multitracktracknamepolicy invalid'));
            it('firstsystemtracknamemode', () => importTest('\\firstsystemtracknamemode invalid'));
            it('othersystemstracknamemode', () => importTest('\\othersystemstracknamemode invalid'));
            it('firstsystemtracknameorientation', () => importTest('\\firstsystemtracknameorientation invalid'));
            it('othersystemstracknameorientation', () => importTest('\\firstsystemtracknameorientation invalid'));
            it('accidentalmode', () => importTest('\\accidentals invalid'));
            it('textalign', () => importTest('\\title "Test" "" invalid'));
            it('whammybartype', () => importTest('C4 {tb invalid (0 1)}'));
            it('whammybarstyle', () => importTest('C4 {tb none invalid (0 1)}'));
            it('gracetype', () => importTest('C4 {gr invalid}'));
            it('dynamic', () => importTest('C4 {dy invalid}'));
            it('barre', () => importTest('C4 {barre 1 invalid}'));
            it('rasg', () => importTest('C4 {rasg invalid}'));
            it('ottava', () => importTest('C4 {ot invalid}'));
            it('fermata', () => importTest('C4 {fermata invalid}'));
            it('bendtype', () => importTest('C4 {b invalid (0 4)}'));
            it('bendstyle', () => importTest('C4 {b bend invalid (0 4)}'));
        });

        describe('at210', () => {
            it('score empty', () => importTest('\\title ()'));
            it('bar empty', () => importTest('. \\ts ()'));
            it('bar missing', () => importTest('. \\ts (3)'));
        });
    });
});
