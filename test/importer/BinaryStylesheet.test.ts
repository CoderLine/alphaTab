import { BinaryStylesheet } from '@src/importer/BinaryStylesheet';
import { Color } from '@src/model/Color';
import { TestPlatform } from '@test/TestPlatform';
import { ModelUtils } from '@src/model/ModelUtils';

describe('BinaryStylesheetParserTest', () => {
    it('testRead', async () => {
        const data = await TestPlatform.loadFile('test-data/guitarpro7/BinaryStylesheet');
        let stylesheet: BinaryStylesheet = new BinaryStylesheet(data);

        expect(stylesheet.raw.has('Global/chordNameStyle')).toBeTrue();
        expect(stylesheet.raw.get('Global/chordNameStyle')).toEqual(2);

        expect(stylesheet.raw.has('StandardNotation/deadNoteSymbol')).toBeTrue();
        expect(stylesheet.raw.get('StandardNotation/deadNoteSymbol')).toEqual(0);

        expect(stylesheet.raw.has('Header/WordsAndMusic')).toBeTrue();
        expect(stylesheet.raw.get('Header/WordsAndMusic')).toEqual('Words & Music by %MUSIC%');

        expect(stylesheet.raw.has('Global/PickStrokePriority')).toBeTrue();
        expect(stylesheet.raw.get('Global/PickStrokePriority')).toEqual(1100);

        expect(stylesheet.raw.has('Odd/drawOddFooter')).toBeTrue();
        expect(stylesheet.raw.get('Odd/drawOddFooter')).toEqual(true);

        expect(stylesheet.raw.has('TablatureNotation/tabRhythmPlacementVoice3')).toBeTrue();
        expect(stylesheet.raw.get('TablatureNotation/tabRhythmPlacementVoice3')).toEqual(2);

        expect(stylesheet.raw.has('Global/HideTupletBracket')).toBeTrue();
        expect(stylesheet.raw.get('Global/HideTupletBracket')).toEqual(true);

        expect(stylesheet.raw.has('Global/DrawChords')).toBeTrue();
        expect(stylesheet.raw.get('Global/DrawChords')).toEqual(true);

        expect(stylesheet.raw.has('System/codaSplitWidth')).toBeTrue();
        expect(ModelUtils.isAlmostEqualTo(stylesheet.raw.get('System/codaSplitWidth') as number, 2.0)).toBeTrue();

        expect(stylesheet.raw.has('Global/HarmonicPriority')).toBeTrue();
        expect(stylesheet.raw.get('Global/HarmonicPriority')).toEqual(2200);

        expect(stylesheet.raw.has('Global/LetRingThroughoutPriority')).toBeTrue();
        expect(stylesheet.raw.get('Global/LetRingThroughoutPriority')).toEqual(2500);

        expect(stylesheet.raw.has('Global/stretchFactor')).toBeTrue();
        expect(ModelUtils.isAlmostEqualTo(stylesheet.raw.get('Global/stretchFactor') as number, 0.5)).toBeTrue();

        expect(stylesheet.raw.has('StandardNotation/bendHeight')).toBeTrue();
        expect(ModelUtils.isAlmostEqualTo(stylesheet.raw.get('StandardNotation/bendHeight') as number, 2.0)).toBeTrue();

        expect(stylesheet.raw.has('Global/ChordDiagramPriority')).toBeTrue();
        expect(stylesheet.raw.get('Global/ChordDiagramPriority')).toEqual(3000);

        expect(stylesheet.raw.has('Global/AlternateEndingPriority')).toBeTrue();
        expect(stylesheet.raw.get('Global/AlternateEndingPriority')).toEqual(2800);

        expect(stylesheet.raw.has('StandardNotation/tieOffsetX')).toBeTrue();
        expect(ModelUtils.isAlmostEqualTo(stylesheet.raw.get('StandardNotation/tieOffsetX') as number, 0.105)).toBeTrue();

        expect(stylesheet.raw.has('Global/PalmMutePriority')).toBeTrue();
        expect(stylesheet.raw.get('Global/PalmMutePriority')).toEqual(1200);

        expect(stylesheet.raw.has('System/hideLyrics')).toBeTrue();
        expect(stylesheet.raw.get('System/hideLyrics')).toEqual(false);

        expect(stylesheet.raw.has('Global/drawArpeggioArrow')).toBeTrue();
        expect(stylesheet.raw.get('Global/drawArpeggioArrow')).toEqual(true);

        expect(stylesheet.raw.has('Global/HoPoPriority')).toBeTrue();
        expect(stylesheet.raw.get('Global/HoPoPriority')).toEqual(800);

        expect(stylesheet.raw.has('Staff/repeatWidth')).toBeTrue();
        expect(ModelUtils.isAlmostEqualTo(stylesheet.raw.get('Staff/repeatWidth') as number, 0.5)).toBeTrue();

        expect(stylesheet.raw.has('System/bracketWidth')).toBeTrue();
        expect(ModelUtils.isAlmostEqualTo(stylesheet.raw.get('System/bracketWidth') as number, 0.5)).toBeTrue();

        expect(stylesheet.raw.has('Global/TuningSpaceInFrontOfStaff')).toBeTrue();
        expect(
            ModelUtils.isAlmostEqualTo(stylesheet.raw.get('Global/TuningSpaceInFrontOfStaff') as number, 2.0)
        ).toBeTrue();

        expect(stylesheet.raw.has('StandardNotation/drawWholeRestOnEmptyBars')).toBeTrue();
        expect(stylesheet.raw.get('StandardNotation/drawWholeRestOnEmptyBars')).toEqual(false);

        expect(stylesheet.raw.has('Global/miniBrowserPosition')).toBeTrue();
        expect(stylesheet.raw.get('Global/miniBrowserPosition')).toEqual(0);

        expect(stylesheet.raw.has('StandardNotation/hideUselessRests')).toBeTrue();
        expect(stylesheet.raw.get('StandardNotation/hideUselessRests')).toEqual(true);

        expect(stylesheet.raw.has('Global/SpacingAffectFontsSize')).toBeTrue();
        expect(stylesheet.raw.get('Global/SpacingAffectFontsSize')).toEqual(true);

        expect(stylesheet.raw.has('Even/drawEvenCopyright')).toBeTrue();
        expect(stylesheet.raw.get('Even/drawEvenCopyright')).toEqual(true);

        expect(stylesheet.raw.has('Global/RepeatTargetPriority')).toBeTrue();
        expect(stylesheet.raw.get('Global/RepeatTargetPriority')).toEqual(3300);

        expect(stylesheet.raw.has('Global/SVGFont')).toBeTrue();
        expect(stylesheet.raw.get('Global/SVGFont')).toEqual(':/renderer/resources/notes.svg');

        expect(stylesheet.raw.has('Footer/PageNumberAlignment')).toBeTrue();
        expect(stylesheet.raw.get('Footer/PageNumberAlignment')).toEqual(2);

        expect(stylesheet.raw.has('Global/graceFlatScaleFactor')).toBeTrue();
        expect(
            ModelUtils.isAlmostEqualTo(stylesheet.raw.get('Global/graceFlatScaleFactor') as number, 0.8333282)
        ).toBeTrue();

        expect(stylesheet.raw.has('Global/shadowColorEnd')).toBeTrue();
        expect((stylesheet.raw.get('Global/shadowColorEnd') as Color).r).toEqual(90);
        expect((stylesheet.raw.get('Global/shadowColorEnd') as Color).g).toEqual(90);
        expect((stylesheet.raw.get('Global/shadowColorEnd') as Color).b).toEqual(90);
        expect((stylesheet.raw.get('Global/shadowColorEnd') as Color).a).toEqual(10);

        expect(stylesheet.raw.has('Even/EvenCopyright')).toBeTrue();
        expect(stylesheet.raw.get('Even/EvenCopyright')).toEqual('%COPYRIGHT%');

        expect(stylesheet.raw.has('Global/GolpePriority')).toBeTrue();
        expect(stylesheet.raw.get('Global/GolpePriority')).toEqual(350);

        expect(stylesheet.raw.has('Global/spaceSizeMM')).toBeTrue();
        expect(ModelUtils.isAlmostEqualTo(stylesheet.raw.get('Global/spaceSizeMM') as number, 0.5)).toBeTrue();

        expect(stylesheet.raw.has('TablatureNotation/drawSecondNoteTrill')).toBeTrue();
        expect(stylesheet.raw.get('TablatureNotation/drawSecondNoteTrill')).toEqual(true);

        expect(stylesheet.raw.has('System/insertSize')).toBeTrue();
        expect(stylesheet.raw.get('System/insertSize')).toEqual(2);

        expect(stylesheet.raw.has('TablatureNotation/minimalInformationForHarmonic')).toBeTrue();
        expect(stylesheet.raw.get('TablatureNotation/minimalInformationForHarmonic')).toEqual(true);

        expect(stylesheet.raw.has('PageSetup/pageTopMargin')).toBeTrue();
        expect(ModelUtils.isAlmostEqualTo(stylesheet.raw.get('PageSetup/pageTopMargin') as number, 8.0)).toBeTrue();

        expect(stylesheet.raw.has('StandardNotation/augmentationDotRadius')).toBeTrue();
        expect(
            ModelUtils.isAlmostEqualTo(stylesheet.raw.get('StandardNotation/augmentationDotRadius') as number, 0.125)
        ).toBeTrue();

        expect(stylesheet.raw.has('Odd/drawOddCopyright')).toBeTrue();
        expect(stylesheet.raw.get('Odd/drawOddCopyright')).toEqual(false);

        expect(stylesheet.raw.has('TablatureNotation/forceRhythmicBand')).toBeTrue();
        expect(stylesheet.raw.get('TablatureNotation/forceRhythmicBand')).toEqual(false);

        expect(stylesheet.raw.has('System/codaSplit')).toBeTrue();
        expect(stylesheet.raw.get('System/codaSplit')).toEqual(true);

        expect(stylesheet.raw.has('StandardNotation/tieMaxHeight')).toBeTrue();
        expect(ModelUtils.isAlmostEqualTo(stylesheet.raw.get('StandardNotation/tieMaxHeight') as number, 2.0)).toBeTrue();

        expect(stylesheet.raw.has('Header/WordsAndMusicAlignment')).toBeTrue();
        expect(stylesheet.raw.get('Header/WordsAndMusicAlignment')).toEqual(2);

        expect(stylesheet.raw.has('Even/drawEvenFooter')).toBeTrue();
        expect(stylesheet.raw.get('Even/drawEvenFooter')).toEqual(true);

        expect(stylesheet.raw.has('StandardNotation/rightFingeringPositionSN')).toBeTrue();
        expect(stylesheet.raw.get('StandardNotation/rightFingeringPositionSN')).toEqual(1);

        expect(stylesheet.raw.has('System/bracketCurveHeight')).toBeTrue();
        expect(
            ModelUtils.isAlmostEqualTo(stylesheet.raw.get('System/bracketCurveHeight') as number, 1.600006)
        ).toBeTrue();

        expect(stylesheet.raw.has('Global/FreeTimePriority')).toBeTrue();
        expect(stylesheet.raw.get('Global/FreeTimePriority')).toEqual(2700);

        expect(stylesheet.raw.has('Global/ChordSpacingMillimeter')).toBeTrue();
        expect(ModelUtils.isAlmostEqualTo(stylesheet.raw.get('Global/ChordSpacingMillimeter') as number, 2.0)).toBeTrue();

        expect(stylesheet.raw.has('Header/drawAlbum')).toBeTrue();
        expect(stylesheet.raw.get('Header/drawAlbum')).toEqual(true);

        expect(stylesheet.raw.has('System/trackNameModeMulti')).toBeTrue();
        expect(stylesheet.raw.get('System/trackNameModeMulti')).toEqual(1);

        expect(stylesheet.raw.has('System/insertSizeSameTrack')).toBeTrue();
        expect(stylesheet.raw.get('System/insertSizeSameTrack')).toEqual(1);

        expect(stylesheet.raw.has('System/marginMinimalBeforeFirstNote')).toBeTrue();
        expect(
            ModelUtils.isAlmostEqualTo(stylesheet.raw.get('System/marginMinimalBeforeFirstNote') as number, 0.5)
        ).toBeTrue();

        expect(stylesheet.raw.has('Header/Subtitle')).toBeTrue();
        expect(stylesheet.raw.get('Header/Subtitle')).toEqual('%SUBTITLE%');

        expect(stylesheet.raw.has('Global/alphaSuggested')).toBeTrue();
        expect(ModelUtils.isAlmostEqualTo(stylesheet.raw.get('Global/alphaSuggested') as number, 0.5)).toBeTrue();

        expect(stylesheet.raw.has('Even/EvenHeaderAlignment')).toBeTrue();
        expect(stylesheet.raw.get('Even/EvenHeaderAlignment')).toEqual(0);

        expect(stylesheet.raw.has('Global/TechniqueSymbol')).toBeTrue();
        expect(stylesheet.raw.get('Global/TechniqueSymbol')).toEqual(25);

        expect(stylesheet.raw.has('Global/tuningBoxed')).toBeTrue();
        expect(stylesheet.raw.get('Global/tuningBoxed')).toEqual(false);

        expect(stylesheet.raw.has('StandardNotation/drawBends')).toBeTrue();
        expect(stylesheet.raw.get('StandardNotation/drawBends')).toEqual(true);

        expect(stylesheet.raw.has('Global/mouseClickMaxTime')).toBeTrue();
        expect(stylesheet.raw.get('Global/mouseClickMaxTime')).toEqual(200);

        expect(stylesheet.raw.has('Global/graceSharpScaleFactor')).toBeTrue();
        expect(
            ModelUtils.isAlmostEqualTo(stylesheet.raw.get('Global/graceSharpScaleFactor') as number, 1.333344)
        ).toBeTrue();

        expect(stylesheet.raw.has('Global/GrayedOpacity')).toBeTrue();
        expect(ModelUtils.isAlmostEqualTo(stylesheet.raw.get('Global/GrayedOpacity') as number, 0.4000015)).toBeTrue();

        expect(stylesheet.raw.has('Global/WhammyBarVibratoPriority')).toBeTrue();
        expect(stylesheet.raw.get('Global/WhammyBarVibratoPriority')).toEqual(1400);

        expect(stylesheet.raw.has('TablatureNotation/noStaffLineForSlashs')).toBeTrue();
        expect(stylesheet.raw.get('TablatureNotation/noStaffLineForSlashs')).toEqual(false);
    });
});
