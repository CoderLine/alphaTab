import { BinaryStylesheet } from '@src/importer/BinaryStylesheet';
import type { Color } from '@src/model/Color';
import { TestPlatform } from '@test/TestPlatform';
import { expect } from 'chai';

describe('BinaryStylesheetParserTest', () => {
    it('testRead', async () => {
        const data = await TestPlatform.loadFile('test-data/guitarpro7/BinaryStylesheet');
        const stylesheet: BinaryStylesheet = new BinaryStylesheet(data);

        expect(stylesheet.raw.has('Global/chordNameStyle')).to.be.true;
        expect(stylesheet.raw.get('Global/chordNameStyle')).to.equal(2);

        expect(stylesheet.raw.has('StandardNotation/deadNoteSymbol')).to.be.true;
        expect(stylesheet.raw.get('StandardNotation/deadNoteSymbol')).to.equal(0);

        expect(stylesheet.raw.has('Header/WordsAndMusic')).to.be.true;
        expect(stylesheet.raw.get('Header/WordsAndMusic')).to.equal('Words & Music by %MUSIC%');

        expect(stylesheet.raw.has('Global/PickStrokePriority')).to.be.true;
        expect(stylesheet.raw.get('Global/PickStrokePriority')).to.equal(1100);

        expect(stylesheet.raw.has('Odd/drawOddFooter')).to.be.true;
        expect(stylesheet.raw.get('Odd/drawOddFooter')).to.equal(true);

        expect(stylesheet.raw.has('TablatureNotation/tabRhythmPlacementVoice3')).to.be.true;
        expect(stylesheet.raw.get('TablatureNotation/tabRhythmPlacementVoice3')).to.equal(2);

        expect(stylesheet.raw.has('Global/HideTupletBracket')).to.be.true;
        expect(stylesheet.raw.get('Global/HideTupletBracket')).to.equal(true);

        expect(stylesheet.raw.has('Global/DrawChords')).to.be.true;
        expect(stylesheet.raw.get('Global/DrawChords')).to.equal(true);

        expect(stylesheet.raw.has('System/codaSplitWidth')).to.be.true;
        expect(stylesheet.raw.get('System/codaSplitWidth') as number).to.be.closeTo(6.0, 0.0001);

        expect(stylesheet.raw.has('Global/HarmonicPriority')).to.be.true;
        expect(stylesheet.raw.get('Global/HarmonicPriority')).to.equal(2200);

        expect(stylesheet.raw.has('Global/LetRingThroughoutPriority')).to.be.true;
        expect(stylesheet.raw.get('Global/LetRingThroughoutPriority')).to.equal(2500);

        expect(stylesheet.raw.has('Global/stretchFactor')).to.be.true;
        expect(stylesheet.raw.get('Global/stretchFactor') as number).to.be.closeTo(1, 0.0001);

        expect(stylesheet.raw.has('StandardNotation/bendHeight')).to.be.true;
        expect(stylesheet.raw.get('StandardNotation/bendHeight') as number).to.be.closeTo(2.0, 0.0001);

        expect(stylesheet.raw.has('Global/ChordDiagramPriority')).to.be.true;
        expect(stylesheet.raw.get('Global/ChordDiagramPriority')).to.equal(3000);

        expect(stylesheet.raw.has('Global/AlternateEndingPriority')).to.be.true;
        expect(stylesheet.raw.get('Global/AlternateEndingPriority')).to.equal(2800);

        expect(stylesheet.raw.has('StandardNotation/tieOffsetX')).to.be.true;
        expect(stylesheet.raw.get('StandardNotation/tieOffsetX') as number).to.be.closeTo(0.07999999, 0.0001);

        expect(stylesheet.raw.has('Global/PalmMutePriority')).to.be.true;
        expect(stylesheet.raw.get('Global/PalmMutePriority')).to.equal(1200);

        expect(stylesheet.raw.has('System/hideLyrics')).to.be.true;
        expect(stylesheet.raw.get('System/hideLyrics')).to.equal(false);

        expect(stylesheet.raw.has('Global/drawArpeggioArrow')).to.be.true;
        expect(stylesheet.raw.get('Global/drawArpeggioArrow')).to.equal(true);

        expect(stylesheet.raw.has('Global/HoPoPriority')).to.be.true;
        expect(stylesheet.raw.get('Global/HoPoPriority')).to.equal(800);

        expect(stylesheet.raw.has('Staff/repeatWidth')).to.be.true;
        expect(stylesheet.raw.get('Staff/repeatWidth') as number).to.be.closeTo(0.5, 0.0001);

        expect(stylesheet.raw.has('System/bracketWidth')).to.be.true;
        expect(stylesheet.raw.get('System/bracketWidth') as number).to.be.closeTo(0.5, 0.0001);

        expect(stylesheet.raw.has('Global/TuningSpaceInFrontOfStaff')).to.be.true;
        expect(stylesheet.raw.get('Global/TuningSpaceInFrontOfStaff') as number).to.be.closeTo(2.0, 0.0001);

        expect(stylesheet.raw.has('StandardNotation/drawWholeRestOnEmptyBars')).to.be.true;
        expect(stylesheet.raw.get('StandardNotation/drawWholeRestOnEmptyBars')).to.equal(false);

        expect(stylesheet.raw.has('Global/miniBrowserPosition')).to.be.true;
        expect(stylesheet.raw.get('Global/miniBrowserPosition')).to.equal(0);

        expect(stylesheet.raw.has('StandardNotation/hideUselessRests')).to.be.true;
        expect(stylesheet.raw.get('StandardNotation/hideUselessRests')).to.equal(true);

        expect(stylesheet.raw.has('Global/SpacingAffectFontsSize')).to.be.true;
        expect(stylesheet.raw.get('Global/SpacingAffectFontsSize')).to.equal(true);

        expect(stylesheet.raw.has('Even/drawEvenCopyright')).to.be.true;
        expect(stylesheet.raw.get('Even/drawEvenCopyright')).to.equal(true);

        expect(stylesheet.raw.has('Global/RepeatTargetPriority')).to.be.true;
        expect(stylesheet.raw.get('Global/RepeatTargetPriority')).to.equal(3300);

        expect(stylesheet.raw.has('Global/SVGFont')).to.be.true;
        expect(stylesheet.raw.get('Global/SVGFont')).to.equal(':/renderer/resources/notes.svg');

        expect(stylesheet.raw.has('Footer/PageNumberAlignment')).to.be.true;
        expect(stylesheet.raw.get('Footer/PageNumberAlignment')).to.equal(2);

        expect(stylesheet.raw.has('Global/graceFlatScaleFactor')).to.be.true;
        expect(stylesheet.raw.get('Global/graceFlatScaleFactor') as number).to.be.closeTo(0.58333, 0.0001);

        expect(stylesheet.raw.has('Global/shadowColorEnd')).to.be.true;
        expect((stylesheet.raw.get('Global/shadowColorEnd') as Color).r).to.equal(90);
        expect((stylesheet.raw.get('Global/shadowColorEnd') as Color).g).to.equal(90);
        expect((stylesheet.raw.get('Global/shadowColorEnd') as Color).b).to.equal(90);
        expect((stylesheet.raw.get('Global/shadowColorEnd') as Color).a).to.equal(10);

        expect(stylesheet.raw.has('Even/EvenCopyright')).to.be.true;
        expect(stylesheet.raw.get('Even/EvenCopyright')).to.equal('%COPYRIGHT%');

        expect(stylesheet.raw.has('Global/GolpePriority')).to.be.true;
        expect(stylesheet.raw.get('Global/GolpePriority')).to.equal(350);

        expect(stylesheet.raw.has('Global/spaceSizeMM')).to.be.true;
        expect(stylesheet.raw.get('Global/spaceSizeMM') as number).to.be.closeTo(1.5, 0.0001);

        expect(stylesheet.raw.has('TablatureNotation/drawSecondNoteTrill')).to.be.true;
        expect(stylesheet.raw.get('TablatureNotation/drawSecondNoteTrill')).to.equal(true);

        expect(stylesheet.raw.has('System/insertSize')).to.be.true;
        expect(stylesheet.raw.get('System/insertSize')).to.equal(2);

        expect(stylesheet.raw.has('TablatureNotation/minimalInformationForHarmonic')).to.be.true;
        expect(stylesheet.raw.get('TablatureNotation/minimalInformationForHarmonic')).to.equal(true);

        expect(stylesheet.raw.has('PageSetup/pageTopMargin')).to.be.true;
        expect(stylesheet.raw.get('PageSetup/pageTopMargin') as number).to.be.closeTo(15, 0.0001);

        expect(stylesheet.raw.has('StandardNotation/augmentationDotRadius')).to.be.true;
        expect(stylesheet.raw.get('StandardNotation/augmentationDotRadius') as number).to.be.closeTo(0.25, 0.0001);

        expect(stylesheet.raw.has('Odd/drawOddCopyright')).to.be.true;
        expect(stylesheet.raw.get('Odd/drawOddCopyright')).to.equal(false);

        expect(stylesheet.raw.has('TablatureNotation/forceRhythmicBand')).to.be.true;
        expect(stylesheet.raw.get('TablatureNotation/forceRhythmicBand')).to.equal(false);

        expect(stylesheet.raw.has('System/codaSplit')).to.be.true;
        expect(stylesheet.raw.get('System/codaSplit')).to.equal(true);

        expect(stylesheet.raw.has('StandardNotation/tieMaxHeight')).to.be.true;
        expect(stylesheet.raw.get('StandardNotation/tieMaxHeight') as number).to.be.closeTo(2.5, 0.0001);

        expect(stylesheet.raw.has('Header/WordsAndMusicAlignment')).to.be.true;
        expect(stylesheet.raw.get('Header/WordsAndMusicAlignment')).to.equal(2);

        expect(stylesheet.raw.has('Even/drawEvenFooter')).to.be.true;
        expect(stylesheet.raw.get('Even/drawEvenFooter')).to.equal(true);

        expect(stylesheet.raw.has('StandardNotation/rightFingeringPositionSN')).to.be.true;
        expect(stylesheet.raw.get('StandardNotation/rightFingeringPositionSN')).to.equal(1);

        expect(stylesheet.raw.has('System/bracketCurveHeight')).to.be.true;
        expect(stylesheet.raw.get('System/bracketCurveHeight') as number).to.be.closeTo(0.8, 0.0001);

        expect(stylesheet.raw.has('Global/FreeTimePriority')).to.be.true;
        expect(stylesheet.raw.get('Global/FreeTimePriority')).to.equal(2700);

        expect(stylesheet.raw.has('Global/ChordSpacingMillimeter')).to.be.true;
        expect(stylesheet.raw.get('Global/ChordSpacingMillimeter') as number).to.be.closeTo(3.0, 0.0001);

        expect(stylesheet.raw.has('Header/drawAlbum')).to.be.true;
        expect(stylesheet.raw.get('Header/drawAlbum')).to.equal(true);

        expect(stylesheet.raw.has('System/trackNameModeMulti')).to.be.true;
        expect(stylesheet.raw.get('System/trackNameModeMulti')).to.equal(1);

        expect(stylesheet.raw.has('System/insertSizeSameTrack')).to.be.true;
        expect(stylesheet.raw.get('System/insertSizeSameTrack')).to.equal(1);

        expect(stylesheet.raw.has('System/marginMinimalBeforeFirstNote')).to.be.true;
        expect(stylesheet.raw.get('System/marginMinimalBeforeFirstNote') as number).to.be.closeTo(1.5, 0.0001);

        expect(stylesheet.raw.has('Header/Subtitle')).to.be.true;
        expect(stylesheet.raw.get('Header/Subtitle')).to.equal('%SUBTITLE%');

        expect(stylesheet.raw.has('Global/alphaSuggested')).to.be.true;
        expect(stylesheet.raw.get('Global/alphaSuggested') as number).to.be.closeTo(0.5, 0.0001);

        expect(stylesheet.raw.has('Even/EvenHeaderAlignment')).to.be.true;
        expect(stylesheet.raw.get('Even/EvenHeaderAlignment')).to.equal(0);

        expect(stylesheet.raw.has('Global/TechniqueSymbol')).to.be.true;
        expect(stylesheet.raw.get('Global/TechniqueSymbol')).to.equal(25);

        expect(stylesheet.raw.has('Global/tuningBoxed')).to.be.true;
        expect(stylesheet.raw.get('Global/tuningBoxed')).to.equal(false);

        expect(stylesheet.raw.has('StandardNotation/drawBends')).to.be.true;
        expect(stylesheet.raw.get('StandardNotation/drawBends')).to.equal(true);

        expect(stylesheet.raw.has('Global/mouseClickMaxTime')).to.be.true;
        expect(stylesheet.raw.get('Global/mouseClickMaxTime')).to.equal(200);

        expect(stylesheet.raw.has('Global/graceSharpScaleFactor')).to.be.true;
        expect(stylesheet.raw.get('Global/graceSharpScaleFactor') as number).to.be.closeTo(0.6666, 0.0001);

        expect(stylesheet.raw.has('Global/GrayedOpacity')).to.be.true;
        expect(stylesheet.raw.get('Global/GrayedOpacity') as number).to.be.closeTo(0.2, 0.0001);

        expect(stylesheet.raw.has('Global/WhammyBarVibratoPriority')).to.be.true;
        expect(stylesheet.raw.get('Global/WhammyBarVibratoPriority')).to.equal(1400);

        expect(stylesheet.raw.has('TablatureNotation/noStaffLineForSlashs')).to.be.true;
        expect(stylesheet.raw.get('TablatureNotation/noStaffLineForSlashs')).to.equal(false);
    });
});
