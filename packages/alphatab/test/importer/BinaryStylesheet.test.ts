import { describe, expect, it } from 'vitest';
import { BinaryStylesheet } from '@coderline/alphatab/importer/BinaryStylesheet';
import type { Color } from '@coderline/alphatab/model/Color';
import { TestPlatform } from 'test/TestPlatform';
describe('BinaryStylesheetParserTest', () => {
    it('testRead', async () => {
        const data = await TestPlatform.loadFile('test-data/guitarpro7/BinaryStylesheet');
        const stylesheet: BinaryStylesheet = new BinaryStylesheet(data);

        expect(stylesheet.raw.has('Global/chordNameStyle')).toBe(true);
        expect(stylesheet.raw.get('Global/chordNameStyle')).toBe(2);

        expect(stylesheet.raw.has('StandardNotation/deadNoteSymbol')).toBe(true);
        expect(stylesheet.raw.get('StandardNotation/deadNoteSymbol')).toBe(0);

        expect(stylesheet.raw.has('Header/WordsAndMusic')).toBe(true);
        expect(stylesheet.raw.get('Header/WordsAndMusic')).toBe('Words & Music by %MUSIC%');

        expect(stylesheet.raw.has('Global/PickStrokePriority')).toBe(true);
        expect(stylesheet.raw.get('Global/PickStrokePriority')).toBe(1100);

        expect(stylesheet.raw.has('Odd/drawOddFooter')).toBe(true);
        expect(stylesheet.raw.get('Odd/drawOddFooter')).toBe(true);

        expect(stylesheet.raw.has('TablatureNotation/tabRhythmPlacementVoice3')).toBe(true);
        expect(stylesheet.raw.get('TablatureNotation/tabRhythmPlacementVoice3')).toBe(2);

        expect(stylesheet.raw.has('Global/HideTupletBracket')).toBe(true);
        expect(stylesheet.raw.get('Global/HideTupletBracket')).toBe(true);

        expect(stylesheet.raw.has('Global/DrawChords')).toBe(true);
        expect(stylesheet.raw.get('Global/DrawChords')).toBe(true);

        expect(stylesheet.raw.has('System/codaSplitWidth')).toBe(true);
        expect(stylesheet.raw.get('System/codaSplitWidth') as number).toBeCloseTo(6.0, 3);

        expect(stylesheet.raw.has('Global/HarmonicPriority')).toBe(true);
        expect(stylesheet.raw.get('Global/HarmonicPriority')).toBe(2200);

        expect(stylesheet.raw.has('Global/LetRingThroughoutPriority')).toBe(true);
        expect(stylesheet.raw.get('Global/LetRingThroughoutPriority')).toBe(2500);

        expect(stylesheet.raw.has('Global/stretchFactor')).toBe(true);
        expect(stylesheet.raw.get('Global/stretchFactor') as number).toBeCloseTo(1, 3);

        expect(stylesheet.raw.has('StandardNotation/bendHeight')).toBe(true);
        expect(stylesheet.raw.get('StandardNotation/bendHeight') as number).toBeCloseTo(2.0, 3);

        expect(stylesheet.raw.has('Global/ChordDiagramPriority')).toBe(true);
        expect(stylesheet.raw.get('Global/ChordDiagramPriority')).toBe(3000);

        expect(stylesheet.raw.has('Global/AlternateEndingPriority')).toBe(true);
        expect(stylesheet.raw.get('Global/AlternateEndingPriority')).toBe(2800);

        expect(stylesheet.raw.has('StandardNotation/tieOffsetX')).toBe(true);
        expect(stylesheet.raw.get('StandardNotation/tieOffsetX') as number).toBeCloseTo(0.07999999, 3);

        expect(stylesheet.raw.has('Global/PalmMutePriority')).toBe(true);
        expect(stylesheet.raw.get('Global/PalmMutePriority')).toBe(1200);

        expect(stylesheet.raw.has('System/hideLyrics')).toBe(true);
        expect(stylesheet.raw.get('System/hideLyrics')).toBe(false);

        expect(stylesheet.raw.has('Global/drawArpeggioArrow')).toBe(true);
        expect(stylesheet.raw.get('Global/drawArpeggioArrow')).toBe(true);

        expect(stylesheet.raw.has('Global/HoPoPriority')).toBe(true);
        expect(stylesheet.raw.get('Global/HoPoPriority')).toBe(800);

        expect(stylesheet.raw.has('Staff/repeatWidth')).toBe(true);
        expect(stylesheet.raw.get('Staff/repeatWidth') as number).toBeCloseTo(0.5, 3);

        expect(stylesheet.raw.has('System/bracketWidth')).toBe(true);
        expect(stylesheet.raw.get('System/bracketWidth') as number).toBeCloseTo(0.5, 3);

        expect(stylesheet.raw.has('Global/TuningSpaceInFrontOfStaff')).toBe(true);
        expect(stylesheet.raw.get('Global/TuningSpaceInFrontOfStaff') as number).toBeCloseTo(2.0, 3);

        expect(stylesheet.raw.has('StandardNotation/drawWholeRestOnEmptyBars')).toBe(true);
        expect(stylesheet.raw.get('StandardNotation/drawWholeRestOnEmptyBars')).toBe(false);

        expect(stylesheet.raw.has('Global/miniBrowserPosition')).toBe(true);
        expect(stylesheet.raw.get('Global/miniBrowserPosition')).toBe(0);

        expect(stylesheet.raw.has('StandardNotation/hideUselessRests')).toBe(true);
        expect(stylesheet.raw.get('StandardNotation/hideUselessRests')).toBe(true);

        expect(stylesheet.raw.has('Global/SpacingAffectFontsSize')).toBe(true);
        expect(stylesheet.raw.get('Global/SpacingAffectFontsSize')).toBe(true);

        expect(stylesheet.raw.has('Even/drawEvenCopyright')).toBe(true);
        expect(stylesheet.raw.get('Even/drawEvenCopyright')).toBe(true);

        expect(stylesheet.raw.has('Global/RepeatTargetPriority')).toBe(true);
        expect(stylesheet.raw.get('Global/RepeatTargetPriority')).toBe(3300);

        expect(stylesheet.raw.has('Global/SVGFont')).toBe(true);
        expect(stylesheet.raw.get('Global/SVGFont')).toBe(':/renderer/resources/notes.svg');

        expect(stylesheet.raw.has('Footer/PageNumberAlignment')).toBe(true);
        expect(stylesheet.raw.get('Footer/PageNumberAlignment')).toBe(2);

        expect(stylesheet.raw.has('Global/graceFlatScaleFactor')).toBe(true);
        expect(stylesheet.raw.get('Global/graceFlatScaleFactor') as number).toBeCloseTo(0.58333, 3);

        expect(stylesheet.raw.has('Global/shadowColorEnd')).toBe(true);
        expect((stylesheet.raw.get('Global/shadowColorEnd') as Color).r).toBe(90);
        expect((stylesheet.raw.get('Global/shadowColorEnd') as Color).g).toBe(90);
        expect((stylesheet.raw.get('Global/shadowColorEnd') as Color).b).toBe(90);
        expect((stylesheet.raw.get('Global/shadowColorEnd') as Color).a).toBe(10);

        expect(stylesheet.raw.has('Even/EvenCopyright')).toBe(true);
        expect(stylesheet.raw.get('Even/EvenCopyright')).toBe('%COPYRIGHT%');

        expect(stylesheet.raw.has('Global/GolpePriority')).toBe(true);
        expect(stylesheet.raw.get('Global/GolpePriority')).toBe(350);

        expect(stylesheet.raw.has('Global/spaceSizeMM')).toBe(true);
        expect(stylesheet.raw.get('Global/spaceSizeMM') as number).toBeCloseTo(1.5, 3);

        expect(stylesheet.raw.has('TablatureNotation/drawSecondNoteTrill')).toBe(true);
        expect(stylesheet.raw.get('TablatureNotation/drawSecondNoteTrill')).toBe(true);

        expect(stylesheet.raw.has('System/insertSize')).toBe(true);
        expect(stylesheet.raw.get('System/insertSize')).toBe(2);

        expect(stylesheet.raw.has('TablatureNotation/minimalInformationForHarmonic')).toBe(true);
        expect(stylesheet.raw.get('TablatureNotation/minimalInformationForHarmonic')).toBe(true);

        expect(stylesheet.raw.has('PageSetup/pageTopMargin')).toBe(true);
        expect(stylesheet.raw.get('PageSetup/pageTopMargin') as number).toBeCloseTo(15, 3);

        expect(stylesheet.raw.has('StandardNotation/augmentationDotRadius')).toBe(true);
        expect(stylesheet.raw.get('StandardNotation/augmentationDotRadius') as number).toBeCloseTo(0.25, 3);

        expect(stylesheet.raw.has('Odd/drawOddCopyright')).toBe(true);
        expect(stylesheet.raw.get('Odd/drawOddCopyright')).toBe(false);

        expect(stylesheet.raw.has('TablatureNotation/forceRhythmicBand')).toBe(true);
        expect(stylesheet.raw.get('TablatureNotation/forceRhythmicBand')).toBe(false);

        expect(stylesheet.raw.has('System/codaSplit')).toBe(true);
        expect(stylesheet.raw.get('System/codaSplit')).toBe(true);

        expect(stylesheet.raw.has('StandardNotation/tieMaxHeight')).toBe(true);
        expect(stylesheet.raw.get('StandardNotation/tieMaxHeight') as number).toBeCloseTo(2.5, 3);

        expect(stylesheet.raw.has('Header/WordsAndMusicAlignment')).toBe(true);
        expect(stylesheet.raw.get('Header/WordsAndMusicAlignment')).toBe(2);

        expect(stylesheet.raw.has('Even/drawEvenFooter')).toBe(true);
        expect(stylesheet.raw.get('Even/drawEvenFooter')).toBe(true);

        expect(stylesheet.raw.has('StandardNotation/rightFingeringPositionSN')).toBe(true);
        expect(stylesheet.raw.get('StandardNotation/rightFingeringPositionSN')).toBe(1);

        expect(stylesheet.raw.has('System/bracketCurveHeight')).toBe(true);
        expect(stylesheet.raw.get('System/bracketCurveHeight') as number).toBeCloseTo(0.8, 3);

        expect(stylesheet.raw.has('Global/FreeTimePriority')).toBe(true);
        expect(stylesheet.raw.get('Global/FreeTimePriority')).toBe(2700);

        expect(stylesheet.raw.has('Global/ChordSpacingMillimeter')).toBe(true);
        expect(stylesheet.raw.get('Global/ChordSpacingMillimeter') as number).toBeCloseTo(3.0, 3);

        expect(stylesheet.raw.has('Header/drawAlbum')).toBe(true);
        expect(stylesheet.raw.get('Header/drawAlbum')).toBe(true);

        expect(stylesheet.raw.has('System/trackNameModeMulti')).toBe(true);
        expect(stylesheet.raw.get('System/trackNameModeMulti')).toBe(1);

        expect(stylesheet.raw.has('System/insertSizeSameTrack')).toBe(true);
        expect(stylesheet.raw.get('System/insertSizeSameTrack')).toBe(1);

        expect(stylesheet.raw.has('System/marginMinimalBeforeFirstNote')).toBe(true);
        expect(stylesheet.raw.get('System/marginMinimalBeforeFirstNote') as number).toBeCloseTo(1.5, 3);

        expect(stylesheet.raw.has('Header/Subtitle')).toBe(true);
        expect(stylesheet.raw.get('Header/Subtitle')).toBe('%SUBTITLE%');

        expect(stylesheet.raw.has('Global/alphaSuggested')).toBe(true);
        expect(stylesheet.raw.get('Global/alphaSuggested') as number).toBeCloseTo(0.5, 3);

        expect(stylesheet.raw.has('Even/EvenHeaderAlignment')).toBe(true);
        expect(stylesheet.raw.get('Even/EvenHeaderAlignment')).toBe(0);

        expect(stylesheet.raw.has('Global/TechniqueSymbol')).toBe(true);
        expect(stylesheet.raw.get('Global/TechniqueSymbol')).toBe(25);

        expect(stylesheet.raw.has('Global/tuningBoxed')).toBe(true);
        expect(stylesheet.raw.get('Global/tuningBoxed')).toBe(false);

        expect(stylesheet.raw.has('StandardNotation/drawBends')).toBe(true);
        expect(stylesheet.raw.get('StandardNotation/drawBends')).toBe(true);

        expect(stylesheet.raw.has('Global/mouseClickMaxTime')).toBe(true);
        expect(stylesheet.raw.get('Global/mouseClickMaxTime')).toBe(200);

        expect(stylesheet.raw.has('Global/graceSharpScaleFactor')).toBe(true);
        expect(stylesheet.raw.get('Global/graceSharpScaleFactor') as number).toBeCloseTo(0.6666, 3);

        expect(stylesheet.raw.has('Global/GrayedOpacity')).toBe(true);
        expect(stylesheet.raw.get('Global/GrayedOpacity') as number).toBeCloseTo(0.2, 3);

        expect(stylesheet.raw.has('Global/WhammyBarVibratoPriority')).toBe(true);
        expect(stylesheet.raw.get('Global/WhammyBarVibratoPriority')).toBe(1400);

        expect(stylesheet.raw.has('TablatureNotation/noStaffLineForSlashs')).toBe(true);
        expect(stylesheet.raw.get('TablatureNotation/noStaffLineForSlashs')).toBe(false);
    });
});
