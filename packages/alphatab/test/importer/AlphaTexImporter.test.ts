import { describe, expect, it } from 'vitest';
import { AlphaTexExporter } from '@coderline/alphatab/exporter/AlphaTexExporter';
import { AlphaTexStaffNoteKind } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexErrorWithDiagnostics, AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { UnsupportedFormatError } from '@coderline/alphatab/importer/UnsupportedFormatError';
import { AutomationType } from '@coderline/alphatab/model/Automation';
import { BarreShape } from '@coderline/alphatab/model/BarreShape';
import { type Beat, BeatBeamingMode } from '@coderline/alphatab/model/Beat';
import { BendStyle } from '@coderline/alphatab/model/BendStyle';
import { BendType } from '@coderline/alphatab/model/BendType';
import { BrushType } from '@coderline/alphatab/model/BrushType';
import { Clef } from '@coderline/alphatab/model/Clef';
import { CrescendoType } from '@coderline/alphatab/model/CrescendoType';
import { Direction } from '@coderline/alphatab/model/Direction';
import { Duration } from '@coderline/alphatab/model/Duration';
import { DynamicValue } from '@coderline/alphatab/model/DynamicValue';
import { FadeType } from '@coderline/alphatab/model/FadeType';
import { FermataType } from '@coderline/alphatab/model/Fermata';
import { Fingers } from '@coderline/alphatab/model/Fingers';
import { GolpeType } from '@coderline/alphatab/model/GolpeType';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { HarmonicType } from '@coderline/alphatab/model/HarmonicType';
import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { KeySignatureType } from '@coderline/alphatab/model/KeySignatureType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import { NoteOrnament } from '@coderline/alphatab/model/NoteOrnament';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import { Rasgueado } from '@coderline/alphatab/model/Rasgueado';
import {
    BarNumberDisplay,
    BracketExtendMode,
    TrackNameMode,
    TrackNameOrientation,
    TrackNamePolicy
} from '@coderline/alphatab/model/RenderStylesheet';
import { type Score, ScoreSubElement } from '@coderline/alphatab/model/Score';
import { SimileMark } from '@coderline/alphatab/model/SimileMark';
import { SlideInType } from '@coderline/alphatab/model/SlideInType';
import { SlideOutType } from '@coderline/alphatab/model/SlideOutType';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';
import { TripletFeel } from '@coderline/alphatab/model/TripletFeel';
import { Tuning } from '@coderline/alphatab/model/Tuning';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import { WhammyType } from '@coderline/alphatab/model/WhammyType';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import { HarmonicsEffectInfo } from '@coderline/alphatab/rendering/effects/HarmonicsEffectInfo';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { Settings } from '@coderline/alphatab/Settings';
import { StaveProfile } from '@coderline/alphatab/StaveProfile';
import { ComparisonHelpers } from 'test/model/ComparisonHelpers';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { TremoloPickingEffectSerializer } from '@coderline/alphatab/generated/model/TremoloPickingEffectSerializer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

describe('AlphaTexImporterTest', () => {
    /**
     * @static
     */
    function importErrorTest(tex: string) {
        const importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        try {
            importer.readScore();
            throw new Error('Expected error on import');
        } catch {
            expect(importer.lexerDiagnostics.errors).toMatchSnapshot('lexer-diagnostics');
            expect(importer.parserDiagnostics.errors).toMatchSnapshot('parser-diagnostics');
            expect(importer.semanticDiagnostics.errors).toMatchSnapshot('semantic-diagnostics');
        }
    }

    /**
     * @static
     */
    function parseTex(tex: string): Score {
        const importer: AlphaTexImporter = new AlphaTexImporter();
        importer.logErrors = true;
        importer.initFromString(tex, new Settings());
        try {
            return importer.readScore();
        } catch (e) {
            const x = (e as Error).cause instanceof AlphaTexErrorWithDiagnostics ? (e as Error).cause : e;
            if (x instanceof AlphaTexErrorWithDiagnostics) {
                const withDiag = x as AlphaTexErrorWithDiagnostics;
                if (e instanceof UnsupportedFormatError) {
                    throw new UnsupportedFormatError(withDiag.toString());
                } else {
                    throw new Error(`${withDiag.toString()}`);
                }
            }
            throw e;
        }
    }

    // as we often add tests here for new alphaTex features, this helper
    // directly allows testing the exporter via a roundtrip comparison
    function testExportRoundtrip(expected: Score) {
        ComparisonHelpers.alphaTexExportRoundtripPrepare(expected);

        const exported = new AlphaTexExporter().exportToString(expected);
        const actual = parseTex(exported);

        ComparisonHelpers.alphaTexExportRoundtripEqual('export-roundtrip', actual, expected);
    }

    it('ensure-metadata-parsing-issue73', () => {
        const tex = `\\title Test
        \\words test
        \\music alphaTab
        \\copyright test
        \\tempo 200
        \\instrument 30
        \\capo 2
        \\tuning G3 D2 G2 B2 D3 A4
        .
        0.5.2 1.5.4 3.4.4 | 5.3.8 5.3.8 5.3.8 5.3.8 r.2`;

        const score = parseTex(tex);
        expect(score.title).toBe('Test');
        expect(score.words).toBe('test');
        expect(score.music).toBe('alphaTab');
        expect(score.copyright).toBe('test');
        expect(score.tempo).toBe(200);
        expect(score.tracks.length).toBe(1);
        expect(score.tracks[0].playbackInfo.program).toBe(30);
        expect(score.tracks[0].staves[0].capo).toBe(2);
        expect(score.tracks[0].staves[0].tuning.join(',')).toBe('55,38,43,47,50,69');
        expect(score.masterBars.length).toBe(2);

        // bars[0]
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].duration).toBe(Duration.Half);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].string).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].duration).toBe(Duration.Quarter);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].fret).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].string).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].duration).toBe(Duration.Quarter);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].fret).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].string).toBe(3);

        // bars[1]
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).toBe(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].duration).toBe(Duration.Eighth);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].fret).toBe(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].string).toBe(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].duration).toBe(Duration.Eighth);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].fret).toBe(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].string).toBe(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].duration).toBe(Duration.Eighth);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].fret).toBe(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].string).toBe(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].duration).toBe(Duration.Eighth);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].fret).toBe(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].string).toBe(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].notes.length).toBe(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].duration).toBe(Duration.Half);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].isRest).toBe(true);
    });

    it('tuning', () => {
        const tex = `\\tuning E4 B3 G3 D3 A2 E2
        .
        0.5.1`;

        const score = parseTex(tex);
        expect(score.tracks[0].staves[0].tuning.join(',')).toBe(Tuning.getDefaultTuningFor(6)!.tunings.join(','));
    });

    it('dead-notes1-issue79', () => {
        const tex: string = ':4 x.3';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isDead).toBe(true);
    });

    it('dead-notes2-issue79', () => {
        const tex: string = ':4 3.3{x}';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isDead).toBe(true);
    });

    it('dead', () => {
        const tex: string = 'x.1 3.1{x}';
        const score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].string).toBe(6);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].fret).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].string).toBe(6);
    });

    it('trill-issue79', () => {
        const tex: string = ':4 3.3{tr 5 16}';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isTrill).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillSpeed).toBe(Duration.Sixteenth);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillFret).toBe(5);
    });

    it('tremolo-issue79', () => {
        const tex: string = ':4 3.3{tr 5 16}';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isTrill).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillSpeed).toBe(Duration.Sixteenth);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillFret).toBe(5);
    });

    it('tremolo-picking-issue79', () => {
        const tex: string = ':4 3.3{tp 16}';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].isTremolo).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].tremoloPicking!.marks).toBe(2);
    });

    it('brushes-arpeggio', () => {
        const tex: string = `
            (1.1 2.2 3.3 4.4).4{bd 60} (1.1 2.2 3.3 4.4).8{bu 60} (1.1 2.2 3.3 4.4).2{ad 60} (1.1 2.2 3.3 4.4).16{au 60} r |
            (1.1 2.2 3.3 4.4).4{bd 120} (1.1 2.2 3.3 4.4).8{bu 120} (1.1 2.2 3.3 4.4).2{ad 120} (1.1 2.2 3.3 4.4).16{au 120} r |
            (1.1 2.2 3.3 4.4).4{bd} (1.1 2.2 3.3 4.4).8{bu} (1.1 2.2 3.3 4.4).2{ad} (1.1 2.2 3.3 4.4).16{au} r
        `;
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].brushType).toBe(BrushType.BrushDown);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].playbackDuration).toBe(960);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].brushDuration).toBe(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].brushType).toBe(BrushType.BrushUp);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].playbackDuration).toBe(480);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].brushDuration).toBe(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].brushType).toBe(BrushType.ArpeggioDown);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].playbackDuration).toBe(1920);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].brushDuration).toBe(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].brushType).toBe(BrushType.ArpeggioUp);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].playbackDuration).toBe(240);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].brushDuration).toBe(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].isRest).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].brushType).toBe(BrushType.None);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].playbackDuration).toBe(240);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].brushDuration).toBe(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).toBe(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].brushType).toBe(BrushType.BrushDown);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].brushDuration).toBe(120);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].brushType).toBe(BrushType.BrushUp);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].brushDuration).toBe(120);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].brushType).toBe(BrushType.ArpeggioDown);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].brushDuration).toBe(120);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].brushType).toBe(BrushType.ArpeggioUp);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].brushDuration).toBe(120);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].isRest).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].brushType).toBe(BrushType.None);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].brushDuration).toBe(0);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats.length).toBe(5);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].brushType).toBe(BrushType.BrushDown);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].brushDuration).toBe(60);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].brushType).toBe(BrushType.BrushUp);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].brushDuration).toBe(30);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].brushType).toBe(BrushType.ArpeggioDown);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].brushDuration).toBe(480);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].brushType).toBe(BrushType.ArpeggioUp);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].brushDuration).toBe(60);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[4].isRest).toBe(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[4].brushType).toBe(BrushType.None);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[4].brushDuration).toBe(0);
        testExportRoundtrip(score);
    });

    it('hamonics-issue79', () => {
        const tex: string = ':8 3.3{nh} 3.3{ah} 3.3{th} 3.3{ph} 3.3{sh}';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].harmonicType).toBe(
            HarmonicType.Natural
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].harmonicType).toBe(
            HarmonicType.Artificial
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].harmonicType).toBe(HarmonicType.Tap);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].harmonicType).toBe(HarmonicType.Pinch);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].harmonicType).toBe(HarmonicType.Semi);
    });

    it('hamonics-rendering-text-issue79', async () => {
        const tex: string = ':8 3.3{nh} 3.3{ah} 3.3{th} 3.3{ph} 3.3{sh}';
        const score = parseTex(tex);

        await VisualTestHelper.prepareAlphaSkia();
        const settings: Settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = false;
        settings.display.staveProfile = StaveProfile.ScoreTab;
        const renderer: ScoreRenderer = new ScoreRenderer(settings);
        renderer.width = 970;
        let svg: string = '';
        renderer.partialRenderFinished.on(r => {
            svg += r.renderResult;
        });
        renderer.renderScore(score, [0]);
        const regexTemplate: string = '<text[^>]+>\\s*{0}\\s*</text>';
        expect(
            new RegExp(regexTemplate.replace('{0}', HarmonicsEffectInfo.harmonicToString(HarmonicType.Natural))).exec(
                svg
            )
        ).toBeTruthy();
        expect(
            new RegExp(
                regexTemplate.replace('{0}', HarmonicsEffectInfo.harmonicToString(HarmonicType.Artificial))
            ).exec(svg)
        ).toBeTruthy();
        expect(
            new RegExp(regexTemplate.replace('{0}', HarmonicsEffectInfo.harmonicToString(HarmonicType.Tap))).exec(svg)
        ).toBeTruthy();
        expect(
            new RegExp(regexTemplate.replace('{0}', HarmonicsEffectInfo.harmonicToString(HarmonicType.Pinch))).exec(svg)
        ).toBeTruthy();
        expect(
            new RegExp(regexTemplate.replace('{0}', HarmonicsEffectInfo.harmonicToString(HarmonicType.Semi))).exec(svg)
        ).toBeTruthy();
    });

    it('grace-issue79', () => {
        const tex: string = ':8 3.3{gr} 3.3{gr ob}';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].graceType).toBe(GraceType.BeforeBeat);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].graceType).toBe(GraceType.OnBeat);
        testExportRoundtrip(score);
    });

    it('left-hand-finger-single-note', () => {
        const tex: string = ':8 3.3{lf 1} 3.3{lf 2} 3.3{lf 3} 3.3{lf 4} 3.3{lf 5}';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].leftHandFinger).toBe(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].leftHandFinger).toBe(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].leftHandFinger).toBe(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].leftHandFinger).toBe(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].leftHandFinger).toBe(
            Fingers.LittleFinger
        );
        testExportRoundtrip(score);
    });

    it('right-hand-finger-single-note', () => {
        const tex: string = ':8 3.3{rf 1} 3.3{rf 2} 3.3{rf 3} 3.3{rf 4} 3.3{rf 5}';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].rightHandFinger).toBe(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].rightHandFinger).toBe(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].rightHandFinger).toBe(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].rightHandFinger).toBe(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].rightHandFinger).toBe(
            Fingers.LittleFinger
        );
        testExportRoundtrip(score);
    });

    it('left-hand-finger-chord', () => {
        const tex: string = ':8 (3.1{lf 1} 3.2{lf 2} 3.3{lf 3} 3.4{lf 4} 3.5{lf 5})';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).toBe(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].leftHandFinger).toBe(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[1].leftHandFinger).toBe(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[2].leftHandFinger).toBe(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[3].leftHandFinger).toBe(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[4].leftHandFinger).toBe(
            Fingers.LittleFinger
        );
        testExportRoundtrip(score);
    });

    it('right-hand-finger-chord', () => {
        const tex: string = ':8 (3.1{rf 1} 3.2{rf 2} 3.3{rf 3} 3.4{rf 4} 3.5{rf 5})';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).toBe(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].rightHandFinger).toBe(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[1].rightHandFinger).toBe(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[2].rightHandFinger).toBe(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[3].rightHandFinger).toBe(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[4].rightHandFinger).toBe(
            Fingers.LittleFinger
        );
        testExportRoundtrip(score);
    });

    it('unstringed', () => {
        const tex: string = '\\instrument piano . c4 c#4 d4 d#4 | c4 db4 d4 eb4';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(2);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(4);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].realValue).toBe(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].realValue).toBe(61);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].realValue).toBe(62);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].realValue).toBe(63);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).toBe(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].realValue).toBe(60);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].realValue).toBe(61);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].realValue).toBe(62);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].realValue).toBe(63);
        testExportRoundtrip(score);
    });

    it('multi-staff-default-settings', () => {
        const tex: string = '1.1 | 1.1 | \\staff 2.1 | 2.1';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(2);
        expect(score.tracks[0].staves.length).toBe(2);
        expect(score.tracks[0].staves[0].showTablature).toBe(true);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[0].bars.length).toBe(2);
        expect(score.tracks[0].staves[1].showTablature).toBe(true); // default settings used

        expect(score.tracks[0].staves[1].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[1].bars.length).toBe(2);
        testExportRoundtrip(score);
    });

    it('multi-staff-default-settings-braces', () => {
        const tex: string = '1.1 | 1.1 | \\staff{} 2.1 | 2.1';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(2);
        expect(score.tracks[0].staves.length).toBe(2);
        expect(score.tracks[0].staves[0].showTablature).toBe(true);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[0].bars.length).toBe(2);
        expect(score.tracks[0].staves[1].showTablature).toBe(true); // default settings used

        expect(score.tracks[0].staves[1].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[1].bars.length).toBe(2);
        testExportRoundtrip(score);
    });

    it('single-staff-with-setting', () => {
        const tex: string = '\\staff{score} 1.1 | 1.1';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(2);
        expect(score.tracks[0].staves.length).toBe(1);
        expect(score.tracks[0].staves[0].showTablature).toBe(false);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[0].bars.length).toBe(2);
        testExportRoundtrip(score);
    });

    it('single-staff-with-slash', () => {
        const tex: string = '\\staff{slash} 1.1 | 1.1';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(2);
        expect(score.tracks[0].staves.length).toBe(1);
        expect(score.tracks[0].staves[0].showSlash).toBe(true);
        expect(score.tracks[0].staves[0].showTablature).toBe(false);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(false);
        expect(score.tracks[0].staves[0].bars.length).toBe(2);
        testExportRoundtrip(score);
    });

    it('single-staff-with-score-and-slash', () => {
        const tex: string = '\\staff{score slash} 1.1 | 1.1';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(2);
        expect(score.tracks[0].staves.length).toBe(1);
        expect(score.tracks[0].staves[0].showSlash).toBe(true);
        expect(score.tracks[0].staves[0].showTablature).toBe(false);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[0].bars.length).toBe(2);
        testExportRoundtrip(score);
    });

    it('multi-staff-with-settings', () => {
        const tex = `\\staff{score} 1.1 | 1.1 |
        \\staff{tabs} \\capo 2 2.1 | 2.1 |
        \\staff{score tabs} \\tuning A1 D2 A2 D3 G3 B3 E4 3.1 | 3.1`;
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(2);
        expect(score.tracks[0].staves.length).toBe(3);
        expect(score.tracks[0].staves[0].showTablature).toBe(false);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[0].bars.length).toBe(2);
        expect(score.tracks[0].staves[1].showTablature).toBe(true);
        expect(score.tracks[0].staves[1].showStandardNotation).toBe(false);
        expect(score.tracks[0].staves[1].bars.length).toBe(2);
        expect(score.tracks[0].staves[1].capo).toBe(2);
        expect(score.tracks[0].staves[2].showTablature).toBe(true);
        expect(score.tracks[0].staves[2].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[2].bars.length).toBe(2);
        expect(score.tracks[0].staves[2].tuning.length).toBe(7);
        testExportRoundtrip(score);
    });

    it('multi-track', () => {
        const tex: string = '\\track "First" 1.1 | 1.1 | \\track "Second" 2.2 | 2.2';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(2);
        expect(score.masterBars.length).toBe(2);
        expect(score.tracks[0].staves.length).toBe(1);
        expect(score.tracks[0].name).toBe('First');
        expect(score.tracks[0].playbackInfo.primaryChannel).toBe(0);
        expect(score.tracks[0].playbackInfo.secondaryChannel).toBe(1);
        expect(score.tracks[0].staves[0].showTablature).toBe(true);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[0].bars.length).toBe(2);
        expect(score.tracks[1].staves.length).toBe(1);
        expect(score.tracks[1].name).toBe('Second');
        expect(score.tracks[1].playbackInfo.primaryChannel).toBe(2);
        expect(score.tracks[1].playbackInfo.secondaryChannel).toBe(3);
        expect(score.tracks[1].staves[0].showTablature).toBe(true);
        expect(score.tracks[1].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[1].staves[0].bars.length).toBe(2);
        testExportRoundtrip(score);
    });

    it('multi-track-names', () => {
        const tex: string =
            '\\track 1.1 | 1.1 | \\track "Only Long Name" 2.2 | 2.2 | \\track "Very Long Name" "shrt" 3.3 | 3.3 ';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(3);
        expect(score.masterBars.length).toBe(2);
        expect(score.tracks[0].staves.length).toBe(1);
        expect(score.tracks[0].name).toBe('');
        expect(score.tracks[0].shortName).toBe('');
        expect(score.tracks[0].playbackInfo.primaryChannel).toBe(0);
        expect(score.tracks[0].playbackInfo.secondaryChannel).toBe(1);
        expect(score.tracks[0].staves[0].showTablature).toBe(true);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[0].bars.length).toBe(2);
        expect(score.tracks[1].staves.length).toBe(1);
        expect(score.tracks[1].name).toBe('Only Long Name');
        expect(score.tracks[1].shortName).toBe('Only Long ');
        expect(score.tracks[1].playbackInfo.primaryChannel).toBe(2);
        expect(score.tracks[1].playbackInfo.secondaryChannel).toBe(3);
        expect(score.tracks[1].staves[0].showTablature).toBe(true);
        expect(score.tracks[1].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[1].staves[0].bars.length).toBe(2);
        expect(score.tracks[2].staves.length).toBe(1);
        expect(score.tracks[2].name).toBe('Very Long Name');
        expect(score.tracks[2].shortName).toBe('shrt');
        expect(score.tracks[2].playbackInfo.primaryChannel).toBe(4);
        expect(score.tracks[2].playbackInfo.secondaryChannel).toBe(5);
        expect(score.tracks[2].staves[0].showTablature).toBe(true);
        expect(score.tracks[2].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[2].staves[0].bars.length).toBe(2);
        testExportRoundtrip(score);
    });

    it('multi-track-multi-staff', () => {
        const tex = `\\track "Piano"
            \\staff{score} \\tuning piano \\instrument acousticgrandpiano
            c4 d4 e4 f4 |

            \\staff{score} \\tuning piano \\clef F4
            c2 c2 c2 c2 |

            \\track "Guitar"
                \\staff{tabs}
                1.2 3.2 0.1 1.1 |

            \\track "Second Guitar"
                1.2 3.2 0.1 1.1
        `;
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(3);
        expect(score.masterBars.length).toBe(1);
        {
            const track1: Track = score.tracks[0];
            expect(track1.name).toBe('Piano');
            expect(track1.staves.length).toBe(2);
            expect(track1.playbackInfo.program).toBe(0);
            expect(track1.playbackInfo.primaryChannel).toBe(0);
            expect(track1.playbackInfo.secondaryChannel).toBe(1);
            {
                const staff1: Staff = track1.staves[0];
                expect(staff1.showTablature).toBe(false);
                expect(staff1.showStandardNotation).toBe(true);
                expect(staff1.tuning.length).toBe(0);
                expect(staff1.bars.length).toBe(1);
                expect(staff1.bars[0].clef).toBe(Clef.G2);
            }
            {
                const staff2: Staff = track1.staves[1];
                expect(staff2.showTablature).toBe(false);
                expect(staff2.showStandardNotation).toBe(true);
                expect(staff2.tuning.length).toBe(0);
                expect(staff2.bars.length).toBe(1);
                expect(staff2.bars[0].clef).toBe(Clef.F4);
            }
        }
        {
            const track2: Track = score.tracks[1];
            expect(track2.name).toBe('Guitar');
            expect(track2.staves.length).toBe(1);
            expect(track2.playbackInfo.program).toBe(25);
            expect(track2.playbackInfo.primaryChannel).toBe(2);
            expect(track2.playbackInfo.secondaryChannel).toBe(3);
            {
                const staff1: Staff = track2.staves[0];
                expect(staff1.showTablature).toBe(true);
                expect(staff1.showStandardNotation).toBe(false);
                expect(staff1.tuning.length).toBe(6);
                expect(staff1.bars.length).toBe(1);
                expect(staff1.bars[0].clef).toBe(Clef.G2);
            }
        }
        {
            const track3: Track = score.tracks[2];
            expect(track3.name).toBe('Second Guitar');
            expect(track3.staves.length).toBe(1);
            expect(track3.playbackInfo.program).toBe(25);
            expect(track3.playbackInfo.primaryChannel).toBe(4);
            expect(track3.playbackInfo.secondaryChannel).toBe(5);
            {
                const staff1: Staff = track3.staves[0];
                expect(staff1.showTablature).toBe(true);
                expect(staff1.showStandardNotation).toBe(true);
                expect(staff1.tuning.length).toBe(6);
                expect(staff1.bars.length).toBe(1);
                expect(staff1.bars[0].clef).toBe(Clef.G2);
            }
        }
        testExportRoundtrip(score);
    });

    it('multi-track-multi-staff-inconsistent-bars', () => {
        const tex: string = `
         \\track "Piano"
            \\staff{score} \\tuning piano \\instrument acousticgrandpiano
            c4 d4 e4 f4 |

            \\staff{score} \\tuning piano \\clef F4
            c2 c2 c2 c2 | c2 c2 c2 c2 | c2 c2 c2 c2 |

          \\track "Guitar"
            \\staff{tabs}
            1.2 3.2 0.1 1.1 | 1.2 3.2 0.1 1.1 |

          \\track "Second Guitar"
            1.2 3.2 0.1 1.1
        `;
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(3);
        expect(score.masterBars.length).toBe(3);
        {
            const track1: Track = score.tracks[0];
            expect(track1.name).toBe('Piano');
            expect(track1.staves.length).toBe(2);
            expect(track1.playbackInfo.program).toBe(0);
            expect(track1.playbackInfo.primaryChannel).toBe(0);
            expect(track1.playbackInfo.secondaryChannel).toBe(1);
            {
                const staff1: Staff = track1.staves[0];
                expect(staff1.showTablature).toBe(false);
                expect(staff1.showStandardNotation).toBe(true);
                expect(staff1.tuning.length).toBe(0);
                expect(staff1.bars.length).toBe(3);
                expect(staff1.bars[0].isEmpty).toBe(false);
                expect(staff1.bars[1].isEmpty).toBe(true);
                expect(staff1.bars[2].isEmpty).toBe(true);
                expect(staff1.bars[0].clef).toBe(Clef.G2);
            }
            {
                const staff2: Staff = track1.staves[1];
                expect(staff2.showTablature).toBe(false);
                expect(staff2.showStandardNotation).toBe(true);
                expect(staff2.tuning.length).toBe(0);
                expect(staff2.bars.length).toBe(3);
                expect(staff2.bars[0].isEmpty).toBe(false);
                expect(staff2.bars[1].isEmpty).toBe(false);
                expect(staff2.bars[2].isEmpty).toBe(false);
                expect(staff2.bars[0].clef).toBe(Clef.F4);
            }
        }
        {
            const track2: Track = score.tracks[1];
            expect(track2.name).toBe('Guitar');
            expect(track2.staves.length).toBe(1);
            expect(track2.playbackInfo.program).toBe(25);
            expect(track2.playbackInfo.primaryChannel).toBe(2);
            expect(track2.playbackInfo.secondaryChannel).toBe(3);
            {
                const staff1: Staff = track2.staves[0];
                expect(staff1.showTablature).toBe(true);
                expect(staff1.showStandardNotation).toBe(false);
                expect(staff1.tuning.length).toBe(6);
                expect(staff1.bars.length).toBe(3);
                expect(staff1.bars[0].isEmpty).toBe(false);
                expect(staff1.bars[1].isEmpty).toBe(false);
                expect(staff1.bars[2].isEmpty).toBe(true);
                expect(staff1.bars[0].clef).toBe(Clef.G2);
            }
        }
        {
            const track3: Track = score.tracks[2];
            expect(track3.name).toBe('Second Guitar');
            expect(track3.staves.length).toBe(1);
            expect(track3.playbackInfo.program).toBe(25);
            expect(track3.playbackInfo.primaryChannel).toBe(4);
            expect(track3.playbackInfo.secondaryChannel).toBe(5);
            {
                const staff1: Staff = track3.staves[0];
                expect(staff1.showTablature).toBe(true);
                expect(staff1.showStandardNotation).toBe(true);
                expect(staff1.tuning.length).toBe(6);
                expect(staff1.bars.length).toBe(3);
                expect(staff1.bars[0].isEmpty).toBe(false);
                expect(staff1.bars[1].isEmpty).toBe(true);
                expect(staff1.bars[2].isEmpty).toBe(true);
                expect(staff1.bars[0].clef).toBe(Clef.G2);
            }
        }
        testExportRoundtrip(score);
    });

    it('slides', () => {
        const tex: string = '3.3{sl} 4.3 | 3.3{ss} 4.3 | 3.3{sib} 3.3{sia} 3.3{sou} 3.3{sod} | 3.3{psd} 3.3{psu}';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(4);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].slideOutType).toBe(
            SlideOutType.Legato
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].slideTarget!.id).toBe(
            score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].id
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].slideOutType).toBe(SlideOutType.Shift);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].slideTarget!.id).toBe(
            score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].id
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].slideInType).toBe(
            SlideInType.IntoFromBelow
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].notes[0].slideInType).toBe(
            SlideInType.IntoFromAbove
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].notes[0].slideOutType).toBe(SlideOutType.OutUp);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].notes[0].slideOutType).toBe(
            SlideOutType.OutDown
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideUp
        );
        testExportRoundtrip(score);
    });

    it('section', () => {
        const tex: string = '\\section Intro 1.1 | 1.1 | \\section "Chorus 01" 1.1 | \\section S Solo';
        const score = parseTex(tex);
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(4);
        expect(score.masterBars[0].isSectionStart).toBe(true);
        expect(score.masterBars[0].section!.text).toBe('Intro');
        expect(score.masterBars[0].section!.marker).toBe('');
        expect(score.masterBars[1].isSectionStart).toBe(false);
        expect(score.masterBars[2].isSectionStart).toBe(true);
        expect(score.masterBars[2].section!.text).toBe('Chorus 01');
        expect(score.masterBars[2].section!.marker).toBe('');
        expect(score.masterBars[3].isSectionStart).toBe(true);
        expect(score.masterBars[3].section!.text).toBe('Solo');
        expect(score.masterBars[3].section!.marker).toBe('S');
        testExportRoundtrip(score);
    });

    it('key-signature', () => {
        const tex: string = `:1 3.3 | \\ks C 3.3 | \\ks Cmajor 3.3 | \\ks Aminor 3.3 |
        \\ks F 3.3 | \\ks bbmajor 3.3 | \\ks CMINOR 3.3 | \\ks aB 3.3 | \\ks db 3.3 | \\ks Ebminor 3.3 |
        \\ks g 3.3 | \\ks Dmajor 3.3 | \\ks f#minor 3.3 | \\ks E 3.3 | \\ks Bmajor 3.3 | \\ks d#minor 3.3`;
        const score = parseTex(tex);

        const bars = score.tracks[0].staves[0].bars;
        const expected: [KeySignature, KeySignatureType][] = [
            [KeySignature.C, KeySignatureType.Major],
            [KeySignature.C, KeySignatureType.Major],
            [KeySignature.C, KeySignatureType.Major],
            [KeySignature.C, KeySignatureType.Minor],
            [KeySignature.F, KeySignatureType.Major],
            [KeySignature.Bb, KeySignatureType.Major],
            [KeySignature.Eb, KeySignatureType.Minor],
            [KeySignature.Ab, KeySignatureType.Major],
            [KeySignature.Db, KeySignatureType.Major],
            [KeySignature.Gb, KeySignatureType.Minor],
            [KeySignature.G, KeySignatureType.Major],
            [KeySignature.D, KeySignatureType.Major],
            [KeySignature.A, KeySignatureType.Minor],
            [KeySignature.E, KeySignatureType.Major],
            [KeySignature.B, KeySignatureType.Major],
            [KeySignature.FSharp, KeySignatureType.Minor]
        ];

        for (let i = 0; i < expected.length; i++) {
            expect(bars[i].keySignature).toBe(expected[i][0]);
            expect(bars[i].keySignatureType).toBe(expected[i][1]);
        }
        testExportRoundtrip(score);
    });

    it('key-signature-multi-staff', () => {
        const tex: string = `
        \\track "T1"
            \\staff
                :1 3.3 | \\ks C 3.3 | \\ks Cmajor 3.3 | \\ks Aminor 3.3 |
                \\ks F 3.3 | \\ks bbmajor 3.3 | \\ks CMINOR 3.3 | \\ks aB 3.3 | \\ks db 3.3 | \\ks Ebminor 3.3 |
                \\ks g 3.3 | \\ks Dmajor 3.3 | \\ks f#minor 3.3 | \\ks E 3.3 | \\ks Bmajor 3.3 | \\ks d#minor 3.3
            \\staff
                \\ks d#minor :1 3.3 | \\ks Bmajor 3.3 | \\ks E 3.3 |
                \\ks f#minor 3.3 | \\ks Dmajor 3.3 | \\ks g 3.3 | \\ks Ebminor 3.3 | \\ks db 3.3 | \\ks aB 3.3 |
                \\ks CMINOR 3.3 | \\ks bbmajor 3.3 | \\ks F 3.3 | \\ks Aminor 3.3 | \\ks Cmajor 3.3 | \\ks C 3.3 | \\ks C 3.3
        `;
        const score = parseTex(tex);

        let bars = score.tracks[0].staves[0].bars;
        const expected: [KeySignature, KeySignatureType][] = [
            [KeySignature.C, KeySignatureType.Major],
            [KeySignature.C, KeySignatureType.Major],
            [KeySignature.C, KeySignatureType.Major],
            [KeySignature.C, KeySignatureType.Minor],
            [KeySignature.F, KeySignatureType.Major],
            [KeySignature.Bb, KeySignatureType.Major],
            [KeySignature.Eb, KeySignatureType.Minor],
            [KeySignature.Ab, KeySignatureType.Major],
            [KeySignature.Db, KeySignatureType.Major],
            [KeySignature.Gb, KeySignatureType.Minor],
            [KeySignature.G, KeySignatureType.Major],
            [KeySignature.D, KeySignatureType.Major],
            [KeySignature.A, KeySignatureType.Minor],
            [KeySignature.E, KeySignatureType.Major],
            [KeySignature.B, KeySignatureType.Major],
            [KeySignature.FSharp, KeySignatureType.Minor]
        ];

        for (let i = 0; i < expected.length; i++) {
            expect(bars[i].keySignature).toBe(expected[i][0]);
            expect(bars[i].keySignatureType).toBe(expected[i][1]);
        }

        bars = score.tracks[0].staves[1].bars;
        expected.reverse();
        for (let i = 0; i < expected.length; i++) {
            expect(bars[i].keySignature, `at ${i}`).toBe(expected[i][0]);
            expect(bars[i].keySignatureType, `at ${i}`).toBe(expected[i][1]);
        }
        testExportRoundtrip(score);
    });

    it('pop-slap-tap', () => {
        const tex: string = '3.3{p} 3.3{s} 3.3{tt} r';
        const score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].pop).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].slap).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tap).toBe(true);
        testExportRoundtrip(score);
    });

    it('triplet-feel-numeric', () => {
        const tex: string = '\\tf 0 | \\tf 1 | \\tf 2 | \\tf 3 | \\tf 4 | \\tf 5 | \\tf 6';
        const score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).toBe(TripletFeel.NoTripletFeel);
        expect(score.masterBars[1].tripletFeel).toBe(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).toBe(TripletFeel.Triplet8th);
        expect(score.masterBars[3].tripletFeel).toBe(TripletFeel.Dotted16th);
        expect(score.masterBars[4].tripletFeel).toBe(TripletFeel.Dotted8th);
        expect(score.masterBars[5].tripletFeel).toBe(TripletFeel.Scottish16th);
        expect(score.masterBars[6].tripletFeel).toBe(TripletFeel.Scottish8th);
        testExportRoundtrip(score);
    });

    it('triplet-feel-long-names', () => {
        const tex: string =
            '\\tf none | \\tf triplet-16th | \\tf triplet-8th | \\tf dotted-16th | \\tf dotted-8th | \\tf scottish-16th | \\tf scottish-8th';
        const score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).toBe(TripletFeel.NoTripletFeel);
        expect(score.masterBars[1].tripletFeel).toBe(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).toBe(TripletFeel.Triplet8th);
        expect(score.masterBars[3].tripletFeel).toBe(TripletFeel.Dotted16th);
        expect(score.masterBars[4].tripletFeel).toBe(TripletFeel.Dotted8th);
        expect(score.masterBars[5].tripletFeel).toBe(TripletFeel.Scottish16th);
        expect(score.masterBars[6].tripletFeel).toBe(TripletFeel.Scottish8th);
        testExportRoundtrip(score);
    });

    it('triplet-feel-short-names', () => {
        const tex: string = '\\tf no | \\tf t16 | \\tf t8 | \\tf d16 | \\tf d8 | \\tf s16 | \\tf s8';
        const score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).toBe(TripletFeel.NoTripletFeel);
        expect(score.masterBars[1].tripletFeel).toBe(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).toBe(TripletFeel.Triplet8th);
        expect(score.masterBars[3].tripletFeel).toBe(TripletFeel.Dotted16th);
        expect(score.masterBars[4].tripletFeel).toBe(TripletFeel.Dotted8th);
        expect(score.masterBars[5].tripletFeel).toBe(TripletFeel.Scottish16th);
        expect(score.masterBars[6].tripletFeel).toBe(TripletFeel.Scottish8th);
        testExportRoundtrip(score);
    });

    it('triplet-feel-multi-bar', () => {
        const tex: string = '\\tf t16 C4 | C4  | C4  | \\tf t8 C4 | C4 | C4 | \\tf no | C4  | C4 ';
        const score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).toBe(TripletFeel.Triplet16th);
        expect(score.masterBars[1].tripletFeel).toBe(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).toBe(TripletFeel.Triplet16th);
        expect(score.masterBars[3].tripletFeel).toBe(TripletFeel.Triplet8th);
        expect(score.masterBars[4].tripletFeel).toBe(TripletFeel.Triplet8th);
        expect(score.masterBars[5].tripletFeel).toBe(TripletFeel.Triplet8th);
        expect(score.masterBars[6].tripletFeel).toBe(TripletFeel.NoTripletFeel);
        expect(score.masterBars[7].tripletFeel).toBe(TripletFeel.NoTripletFeel);
        expect(score.masterBars[8].tripletFeel).toBe(TripletFeel.NoTripletFeel);
        testExportRoundtrip(score);
    });

    it('tuplet-repeat', () => {
        const tex: string = ':8 5.3{tu 3}*3';
        const score = parseTex(tex);
        const durations: Duration[] = [Duration.Eighth, Duration.Eighth, Duration.Eighth];
        const tuplets = [3, 3, 3];
        let i: number = 0;
        let b: Beat | null = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        while (b) {
            expect(b.duration, `Duration on beat ${i} was wrong`).toBe(durations[i]);
            if (tuplets[i] === 1) {
                expect(b.hasTuplet).toBe(false);
            } else {
                expect(b.tupletNumerator, `Tuplet on beat ${i} was wrong`).toBe(tuplets[i]);
            }
            b = b.nextBeat;
            i++;
        }
        expect(i).toBe(durations.length);
        testExportRoundtrip(score);
    });

    it('tuplet-custom', () => {
        const tex: string = ':8 5.3{tu 5 2}*5';
        const score = parseTex(tex);
        const tupletNumerators = [5, 5, 5, 5, 5];
        const tupletDenominators = [2, 2, 2, 2, 2];

        let i: number = 0;
        let b: Beat | null = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        while (b) {
            expect(b.tupletNumerator, `Tuplet on beat ${i} was wrong`).toBe(tupletNumerators[i]);
            expect(b.tupletDenominator, `Tuplet on beat ${i} was wrong`).toBe(tupletDenominators[i]);
            b = b.nextBeat;
            i++;
        }
        testExportRoundtrip(score);
    });

    it('simple-anacrusis', () => {
        const tex: string = '\\ac 3.3 3.3 | 1.1 2.1 3.1 4.1';
        const score = parseTex(tex);
        expect(score.masterBars[0].isAnacrusis).toBe(true);
        expect(score.masterBars[0].calculateDuration()).toBe(1920);
        expect(score.masterBars[1].calculateDuration()).toBe(3840);
        testExportRoundtrip(score);
    });

    it('multi-bar-anacrusis', () => {
        const tex: string = '\\ac 3.3 3.3 | \\ac 3.3 3.3 | 1.1 2.1 3.1 4.1';
        const score = parseTex(tex);
        expect(score.masterBars[0].isAnacrusis).toBe(true);
        expect(score.masterBars[1].isAnacrusis).toBe(true);
        expect(score.masterBars[0].calculateDuration()).toBe(1920);
        expect(score.masterBars[1].calculateDuration()).toBe(1920);
        expect(score.masterBars[2].calculateDuration()).toBe(3840);
        testExportRoundtrip(score);
    });

    it('random-anacrusis', () => {
        const tex: string = '\\ac 3.3 3.3 | 1.1 2.1 3.1 4.1 | \\ac 3.3 3.3 | 1.1 2.1 3.1 4.1';
        const score = parseTex(tex);
        expect(score.masterBars[0].isAnacrusis).toBe(true);
        expect(score.masterBars[1].isAnacrusis).toBe(false);
        expect(score.masterBars[2].isAnacrusis).toBe(true);
        expect(score.masterBars[3].isAnacrusis).toBe(false);
        expect(score.masterBars[0].calculateDuration()).toBe(1920);
        expect(score.masterBars[1].calculateDuration()).toBe(3840);
        expect(score.masterBars[2].calculateDuration()).toBe(1920);
        expect(score.masterBars[3].calculateDuration()).toBe(3840);
        testExportRoundtrip(score);
    });

    it('repeat', () => {
        const tex: string =
            '\\ro 1.3 2.3 3.3 4.3 | 5.3 6.3 7.3 8.3 | \\rc 2 1.3 2.3 3.3 4.3 | \\ro \\rc 3 1.3 2.3 3.3 4.3 |';
        const score = parseTex(tex);
        expect(score.masterBars[0].isRepeatStart).toBe(true);
        expect(score.masterBars[1].isRepeatStart).toBe(false);
        expect(score.masterBars[2].isRepeatStart).toBe(false);
        expect(score.masterBars[3].isRepeatStart).toBe(true);
        expect(score.masterBars[0].repeatCount).toBe(0);
        expect(score.masterBars[1].repeatCount).toBe(0);
        expect(score.masterBars[2].repeatCount).toBe(2);
        expect(score.masterBars[3].repeatCount).toBe(3);
        testExportRoundtrip(score);
    });

    it('alternate-endings', () => {
        const tex: string = '\\ro 4.3*4 | \\ae (1 2 3) 6.3*4 | \\ae 4 \\rc 4 6.3 6.3 6.3 5.3 |';
        const score = parseTex(tex);
        expect(score.masterBars[0].isRepeatStart).toBe(true);
        expect(score.masterBars[1].isRepeatStart).toBe(false);
        expect(score.masterBars[2].isRepeatStart).toBe(false);
        expect(score.masterBars[0].repeatCount).toBe(0);
        expect(score.masterBars[1].repeatCount).toBe(0);
        expect(score.masterBars[2].repeatCount).toBe(4);
        expect(score.masterBars[0].alternateEndings).toBe(0b0000);
        expect(score.masterBars[1].alternateEndings).toBe(0b0111);
        expect(score.masterBars[2].alternateEndings).toBe(0b1000);
        testExportRoundtrip(score);
    });

    it('random-alternate-endings', () => {
        const tex: string = `
            \\ro \\ae 1 1.1.1 | \\ae 2 2.1 | \\ae 3 3.1 |
            4.3.4*4 |
            \\ae 1 1.1.1 | \\ae 2 2.1 | \\ae 3 3.1 |
            4.3.4*4 |
            \\ae (1 3) 1.1.1 | \\ae 2 \\rc 3 2.1 |
        `;
        const score = parseTex(tex);
        expect(score.masterBars[0].isRepeatStart).toBe(true);
        for (let i = 1; i <= 9; i++) {
            expect(score.masterBars[i].isRepeatStart).toBe(false);
        }
        for (let i = 0; i <= 8; i++) {
            expect(score.masterBars[i].repeatCount).toBe(0);
        }
        expect(score.masterBars[9].repeatCount).toBe(3);
        expect(score.masterBars[0].alternateEndings).toBe(0b001);
        expect(score.masterBars[1].alternateEndings).toBe(0b010);
        expect(score.masterBars[2].alternateEndings).toBe(0b100);
        expect(score.masterBars[3].alternateEndings).toBe(0b000);
        expect(score.masterBars[4].alternateEndings).toBe(0b001);
        expect(score.masterBars[5].alternateEndings).toBe(0b010);
        expect(score.masterBars[6].alternateEndings).toBe(0b100);
        expect(score.masterBars[7].alternateEndings).toBe(0b000);
        expect(score.masterBars[8].alternateEndings).toBe(0b101);
        expect(score.masterBars[9].alternateEndings).toBe(0b010);
        testExportRoundtrip(score);
    });

    it('default-transposition-on-instruments', () => {
        const tex: string = `
            \\track "Piano with Grand Staff" "pno."
                \\staff{score} \\tuning piano \\instrument acousticgrandpiano
                c4 d4 e4 f4 |
                \\staff{score} \\tuning piano \\clef F4
                c2 c2 c2 c2 |
            \\track "Guitar"
                \\staff{tabs} \\instrument acousticguitarsteel \\capo 5
                1.2 3.2 0.1 1.1
        `;
        const score = parseTex(tex);

        expect(score.tracks[0].staves[0].transpositionPitch).toBe(0);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).toBe(0);
        expect(score.tracks[0].staves[1].transpositionPitch).toBe(0);
        expect(score.tracks[0].staves[1].displayTranspositionPitch).toBe(0);
        expect(score.tracks[1].staves[0].transpositionPitch).toBe(0);
        expect(score.tracks[1].staves[0].displayTranspositionPitch).toBe(-12);
        testExportRoundtrip(score);
    });

    it('dynamics', () => {
        const tex: string = '1.1.8{dy ppp} 1.1{dy pp} 1.1{dy p} 1.1{dy mp} 1.1{dy mf} 1.1{dy f} 1.1{dy ff} 1.1{dy fff}';
        const score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).toBe(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).toBe(DynamicValue.PP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].dynamics).toBe(DynamicValue.P);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].dynamics).toBe(DynamicValue.MP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].dynamics).toBe(DynamicValue.MF);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[5].dynamics).toBe(DynamicValue.F);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[6].dynamics).toBe(DynamicValue.FF);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[7].dynamics).toBe(DynamicValue.FFF);
        testExportRoundtrip(score);
    });

    it('dynamics-auto', () => {
        const tex: string = '1.1.4{dy ppp} 1.1 1.1{dy mp} 1.1';
        const score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).toBe(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).toBe(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].dynamics).toBe(DynamicValue.MP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].dynamics).toBe(DynamicValue.MP);
        testExportRoundtrip(score);
    });

    it('dynamics-auto-reset-on-track', () => {
        const tex: string = '1.1.4{dy ppp} 1.1 \\track "Second" 1.1.4';
        const score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).toBe(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).toBe(DynamicValue.PPP);
        expect(score.tracks[1].staves[0].bars[0].voices[0].beats[0].dynamics).toBe(DynamicValue.F);
        testExportRoundtrip(score);
    });

    it('dynamics-auto-reset-on-staff', () => {
        const tex: string = '1.1.4{dy ppp} 1.1 \\staff 1.1.4';
        const score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).toBe(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).toBe(DynamicValue.PPP);
        expect(score.tracks[0].staves[1].bars[0].voices[0].beats[0].dynamics).toBe(DynamicValue.F);
        testExportRoundtrip(score);
    });

    it('crescendo', () => {
        const tex: string = '1.1.4{dec} 1.1{dec} 1.1{cre} 1.1{cre}';
        const score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].crescendo).toBe(CrescendoType.Decrescendo);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].crescendo).toBe(CrescendoType.Decrescendo);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].crescendo).toBe(CrescendoType.Crescendo);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].crescendo).toBe(CrescendoType.Crescendo);
        testExportRoundtrip(score);
    });

    it('left-hand-tapping', () => {
        const tex: string = ':4 1.1{lht} 1.1 1.1{lht} 1.1';
        const score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isLeftHandTapped).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isLeftHandTapped).toBe(false);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].isLeftHandTapped).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].isLeftHandTapped).toBe(false);
        testExportRoundtrip(score);
    });

    it('expect-invalid-format-xml', () => {
        expect(() => parseTex('<xml>')).toThrow(UnsupportedFormatError);
    });

    it('expect-invalid-format-other-text', () => {
        expect(() => parseTex('This is not an alphaTex file')).toThrow(UnsupportedFormatError);
    });

    it('auto-detect-tuning-from-instrument', () => {
        let score = parseTex('\\instrument acousticguitarsteel . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).toBe(6);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).toBe(-12);

        score = parseTex('\\instrument acousticbass . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).toBe(4);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).toBe(-12);

        score = parseTex('\\instrument violin . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).toBe(4);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).toBe(0);

        score = parseTex('\\instrument acousticpiano . C4');
        expect(score.tracks[0].staves[0].tuning.length).toBe(0);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).toBe(0);
    });

    it('multibyte-encoding', () => {
        const multiByteChars = '爱你ÖÄÜ🎸🎵🎶';
        const score = parseTex(`\\title "${multiByteChars}"
        .
        \\track "🎸"
        \\lyrics "Test Lyrics 🤘"
        (1.2 1.1).4 x.2.8 0.1 1.1 | 1.2 3.2 0.1 1.1`);

        expect(score.title).toBe(multiByteChars);
        expect(score.tracks[0].name).toBe('🎸');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].lyrics![0]).toBe('🤘');
        testExportRoundtrip(score);
    });

    function runSectionNoteSymbolTest(noteSymbol: string) {
        const score = parseTex(`1.3.4 * 4 | \\section "Verse" ${noteSymbol}.1 | 2.3.4*4`);

        expect(score.masterBars.length).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(4);
        expect(score.masterBars[1].section!.text).toBe('Verse');
        expect(score.masterBars[1].section!.marker).toBe('');
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).toBe(1);
    }

    it('does-not-interpret-note-symbols-on-section', () => {
        runSectionNoteSymbolTest('r');
        runSectionNoteSymbolTest('-');
        runSectionNoteSymbolTest('x');
    });

    it('loads-score-twice-without-hickups', () => {
        const tex = `\\title Test
        \\words test
        \\music alphaTab
        \\copyright test
        \\tempo 200
        \\instrument 30
        \\capo 2
        \\tuning G3 D2 G2 B2 D3 A4
        .
        0.5.2 1.5.4 3.4.4 | 5.3.8 5.3.8 5.3.8 5.3.8 r.2`;
        const importer = new AlphaTexImporter();
        for (const _i of [1, 2]) {
            importer.initFromString(tex, new Settings());
            const score = importer.readScore();
            expect(score.title).toBe('Test');
            expect(score.words).toBe('test');
            expect(score.music).toBe('alphaTab');
            expect(score.copyright).toBe('test');
            expect(score.tempo).toBe(200);
            expect(score.tracks.length).toBe(1);
            expect(score.tracks[0].playbackInfo.program).toBe(30);
            expect(score.tracks[0].staves[0].capo).toBe(2);
            expect(score.tracks[0].staves[0].tuning.join(',')).toBe('55,38,43,47,50,69');
            expect(score.masterBars.length).toBe(2);

            // bars[0]
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(3);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).toBe(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].duration).toBe(Duration.Half);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toBe(0);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].string).toBe(2);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes.length).toBe(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].duration).toBe(Duration.Quarter);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].fret).toBe(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].string).toBe(2);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes.length).toBe(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].duration).toBe(Duration.Quarter);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].fret).toBe(3);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].string).toBe(3);

            // bars[1]
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).toBe(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes.length).toBe(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].duration).toBe(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].fret).toBe(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].string).toBe(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes.length).toBe(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].duration).toBe(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].fret).toBe(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].string).toBe(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes.length).toBe(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].duration).toBe(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].fret).toBe(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].string).toBe(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes.length).toBe(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].duration).toBe(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].fret).toBe(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].string).toBe(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].notes.length).toBe(0);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].duration).toBe(Duration.Half);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].isRest).toBe(true);
        }
    });

    it('tempo-as-float', () => {
        const score = parseTex('\\tempo 112.5 .');
        expect(score.tempo).toBe(112.5);
        testExportRoundtrip(score);
    });

    it('tempo-as-float-in-bar', () => {
        const score = parseTex('\\tempo 112 . 3.3.1 | \\tempo 333.3 3.3');
        expect(score.tempo).toBe(112);
        expect(score.tracks[0].staves[0].bars[1].masterBar.tempoAutomations[0]?.value).toBe(333.3);
        testExportRoundtrip(score);
    });

    it('percussion-numbers', () => {
        const score = parseTex(`
            \\instrument "percussion"
            .
            30 31 33 34
        `);
        expect(score.tracks[0].playbackInfo.primaryChannel).toBe(9);
        expect(score.tracks[0].staves[0].isPercussion).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].percussionArticulation).toBe(0);
        expect(score.tracks[0].percussionArticulations[0].outputMidiNumber).toBe(49);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].percussionArticulation).toBe(1);
        expect(score.tracks[0].percussionArticulations[1].outputMidiNumber).toBe(40);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].percussionArticulation).toBe(2);
        expect(score.tracks[0].percussionArticulations[2].outputMidiNumber).toBe(37);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].percussionArticulation).toBe(3);
        expect(score.tracks[0].percussionArticulations[3].outputMidiNumber).toBe(38);
        testExportRoundtrip(score);
    });

    it('percussion-custom-articulation', () => {
        const score = parseTex(`
            \\instrument "percussion"
            \\articulation A 30
            \\articulation B 31
            \\articulation C 33
            \\articulation D 34
            .
            A B C D
        `);
        expect(score.tracks[0].playbackInfo.primaryChannel).toBe(9);
        expect(score.tracks[0].staves[0].isPercussion).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].percussionArticulation).toBe(0);
        expect(score.tracks[0].percussionArticulations[0].outputMidiNumber).toBe(49);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].percussionArticulation).toBe(1);
        expect(score.tracks[0].percussionArticulations[1].outputMidiNumber).toBe(40);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].percussionArticulation).toBe(2);
        expect(score.tracks[0].percussionArticulations[2].outputMidiNumber).toBe(37);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].percussionArticulation).toBe(3);
        expect(score.tracks[0].percussionArticulations[3].outputMidiNumber).toBe(38);
        testExportRoundtrip(score);
    });

    it('percussion-default-articulations', () => {
        const score = parseTex(`
            \\instrument "percussion"
            \\articulation defaults
            .
            "Cymbal (hit)" "Snare (side stick)" "Snare (side stick) 2" "Snare (hit)"
        `);
        expect(score.tracks[0].playbackInfo.primaryChannel).toBe(9);
        expect(score.tracks[0].staves[0].isPercussion).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].percussionArticulation).toBe(0);
        expect(score.tracks[0].percussionArticulations[0].outputMidiNumber).toBe(49);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].percussionArticulation).toBe(1);
        expect(score.tracks[0].percussionArticulations[1].outputMidiNumber).toBe(37);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].percussionArticulation).toBe(2);
        expect(score.tracks[0].percussionArticulations[2].outputMidiNumber).toBe(40);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].percussionArticulation).toBe(3);
        expect(score.tracks[0].percussionArticulations[3].outputMidiNumber).toBe(38);
        testExportRoundtrip(score);
    });

    it('percussion-default-articulations-short', () => {
        const score = parseTex(`
            \\instrument "percussion"
            \\articulation defaults
            .
            CymbalHit SnareSideStick SnareSideStick2 SnareHit
        `);
        expect(score.tracks[0].playbackInfo.primaryChannel).toBe(9);
        expect(score.tracks[0].staves[0].isPercussion).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].percussionArticulation).toBe(0);
        expect(score.tracks[0].percussionArticulations[0].outputMidiNumber).toBe(49);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].percussionArticulation).toBe(1);
        expect(score.tracks[0].percussionArticulations[1].outputMidiNumber).toBe(37);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].percussionArticulation).toBe(2);
        expect(score.tracks[0].percussionArticulations[2].outputMidiNumber).toBe(40);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].percussionArticulation).toBe(3);
        expect(score.tracks[0].percussionArticulations[3].outputMidiNumber).toBe(38);
        testExportRoundtrip(score);
    });

    it('beat-tempo-change', () => {
        const score = parseTex(`
            . \\tempo 120 1.1.4 1.1 1.1{tempo 60} 1.1 | 1.1.4{tempo 100} 1.1 1.1{tempo 120} 1.1
        `);
        expect(score.masterBars[0].tempoAutomations.length).toBe(2);
        expect(score.masterBars[0].tempoAutomations[0].value).toBe(120);
        expect(score.masterBars[0].tempoAutomations[0].ratioPosition).toBe(0);
        expect(score.masterBars[0].tempoAutomations[1].value).toBe(60);
        expect(score.masterBars[0].tempoAutomations[1].ratioPosition).toBe(0.5);
        testExportRoundtrip(score);
    });

    it('note-accidentals', () => {
        let tex = '. \n';
        const expectedAccidentalModes: NoteAccidentalMode[] = [];
        for (const [k, v] of ModelUtils.accidentalModeMapping) {
            if (k) {
                tex += `3.3 { acc ${k} } \n`;
                expectedAccidentalModes.push(v);
            }
        }

        const score = parseTex(tex);

        const actualAccidentalModes: NoteAccidentalMode[] = [];

        let b: Beat | null = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        while (b != null) {
            actualAccidentalModes.push(b.notes[0].accidentalMode);
            b = b.nextBeat;
        }

        expect(actualAccidentalModes.join(',')).toBe(expectedAccidentalModes.join(','));
        testExportRoundtrip(score);
    });

    it('accidental-mode', () => {
        // song level
        let score = parseTex('\\accidentals auto . F##4');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].accidentalMode).toBe(
            NoteAccidentalMode.Default
        );

        // track level
        score = parseTex('\\track "T1" F##4 | \\track "T2" \\accidentals auto F##4');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].accidentalMode).toBe(
            NoteAccidentalMode.ForceDoubleSharp
        );
        expect(score.tracks[1].staves[0].bars[0].voices[0].beats[0].notes[0].accidentalMode).toBe(
            NoteAccidentalMode.Default
        );

        // staff level
        score = parseTex('\\track "T1" \\staff F##4 \\staff \\accidentals auto F##4');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].accidentalMode).toBe(
            NoteAccidentalMode.ForceDoubleSharp
        );
        expect(score.tracks[0].staves[1].bars[0].voices[0].beats[0].notes[0].accidentalMode).toBe(
            NoteAccidentalMode.Default
        );

        // bar level
        score = parseTex('F##4 | \\accidentals auto F##4');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].accidentalMode).toBe(
            NoteAccidentalMode.ForceDoubleSharp
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].accidentalMode).toBe(
            NoteAccidentalMode.Default
        );
        testExportRoundtrip(score);
    });

    it('dead-slap', () => {
        const score = parseTex('r { ds }');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].isRest).toBe(false);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].deadSlapped).toBe(true);
        testExportRoundtrip(score);
    });

    it('golpe', () => {
        const score = parseTex('3.3 { glpf } 3.3 { glpt }');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].golpe).toBe(GolpeType.Finger);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].golpe).toBe(GolpeType.Thumb);
        testExportRoundtrip(score);
    });

    it('fade', () => {
        const score = parseTex('3.3 { f } 3.3 { fo } 3.3 { vs } ');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].fade).toBe(FadeType.FadeIn);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].fade).toBe(FadeType.FadeOut);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].fade).toBe(FadeType.VolumeSwell);
        testExportRoundtrip(score);
    });

    it('barre', () => {
        const score = parseTex('3.3 { barre 5 } 3.3 { barre 14 half }');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].barreFret).toBe(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].barreShape).toBe(BarreShape.Full);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].barreFret).toBe(14);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].barreShape).toBe(BarreShape.Half);
        testExportRoundtrip(score);
        testExportRoundtrip(score);
    });

    it('ornaments', () => {
        const score = parseTex('3.3 { turn } 3.3 { iturn } 3.3 { umordent } 3.3 { lmordent }');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].ornament).toBe(NoteOrnament.Turn);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].ornament).toBe(
            NoteOrnament.InvertedTurn
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].ornament).toBe(
            NoteOrnament.UpperMordent
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].ornament).toBe(
            NoteOrnament.LowerMordent
        );
        testExportRoundtrip(score);
    });

    it('rasgueado', () => {
        const score = parseTex('3.3 { rasg mi } 3.3 { rasg pmptriplet } 3.3 { rasg amianapaest }');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].rasgueado).toBe(Rasgueado.Mi);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].hasRasgueado).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].rasgueado).toBe(Rasgueado.PmpTriplet);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].hasRasgueado).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].rasgueado).toBe(Rasgueado.AmiAnapaest);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].hasRasgueado).toBe(true);
        testExportRoundtrip(score);
    });

    it('directions', () => {
        const score = parseTex('. \\jump Segno | | \\jump DaCapoAlCoda \\jump Coda \\jump SegnoSegno ');
        expect(score.masterBars[0].directions).toBeTruthy();
        expect(score.masterBars[0].directions).toContain(Direction.TargetSegno);

        expect(score.masterBars[1].directions).not.toBeTruthy();

        expect(score.masterBars[2].directions).toBeTruthy();
        expect(score.masterBars[2].directions).toContain(Direction.JumpDaCapoAlCoda);
        expect(score.masterBars[2].directions).toContain(Direction.TargetCoda);
        expect(score.masterBars[2].directions).toContain(Direction.TargetSegnoSegno);
        testExportRoundtrip(score);
    });

    it('multi-voice-full', () => {
        const score = parseTex(`
            \\track "Piano"
                \\staff{score} \\tuning piano \\instrument acousticgrandpiano
                    \\voice
                        c4 d4 e4 f4 | c4 d4 e4 f4
                    \\voice
                        c3 d3 e3 f3 | c3 d3 e3 f3
        `);

        expect(score.masterBars.length).toBe(2);

        expect(score.tracks[0].staves[0].bars.length).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices.length).toBe(2);
        expect(score.tracks[0].staves[0].bars[1].voices.length).toBe(2);
        testExportRoundtrip(score);
    });

    it('multi-voice-simple-all-voices', () => {
        const score = parseTex(`
            \\voice
                c4 d4 e4 f4 | c4 d4 e4 f4
            \\voice
                c3 d3 e3 f3 | c3 d3 e3 f3
        `);

        expect(score.masterBars.length).toBe(2);

        expect(score.tracks[0].staves[0].bars.length).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices.length).toBe(2);
        expect(score.tracks[0].staves[0].bars[1].voices.length).toBe(2);
        testExportRoundtrip(score);
    });

    it('multi-voice-simple-skip-initial', () => {
        const score = parseTex(`
            c4 d4 e4 f4 | c4 d4 e4 f4
            \\voice
            c3 d3 e3 f3 | c3 d3 e3 f3
        `);

        expect(score.masterBars.length).toBe(2);

        expect(score.tracks[0].staves[0].bars.length).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices.length).toBe(2);
        expect(score.tracks[0].staves[0].bars[1].voices.length).toBe(2);
        testExportRoundtrip(score);
    });

    it('standard-notation-line-count', () => {
        const score = parseTex(`
            \\staff { score 3 }
        `);
        expect(score.tracks[0].staves[0].standardNotationLineCount).toBe(3);
        testExportRoundtrip(score);
    });

    it('song-metadata', () => {
        const score = parseTex(`
            \\title "Title\\tTitle"
            \\instructions "Line1\nLine2"
            .
        `);
        expect(score.title).toBe('Title\tTitle');
        expect(score.instructions).toBe('Line1\nLine2');
        testExportRoundtrip(score);
    });

    it('tempo-label', () => {
        const score = parseTex(`
            \\tempo (80 "Label")
            .
        `);
        expect(score.tempo).toBe(80);
        expect(score.tempoLabel).toBe('Label');
        testExportRoundtrip(score);
    });

    it('transpose', () => {
        const score = parseTex(`
            \\staff
            \\displaytranspose 12
            \\transpose 6
            .
        `);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).toBe(-12);
        expect(score.tracks[0].staves[0].transpositionPitch).toBe(-6);
        testExportRoundtrip(score);
    });

    it('beat-vibrato', () => {
        const score = parseTex(`
            3.3.4{v} 3.3.4{vw}
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].vibrato).toBe(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].vibrato).toBe(VibratoType.Wide);
        testExportRoundtrip(score);
    });

    it('note-vibrato', () => {
        const score = parseTex(`
            3.3{v}.4 3.3{vw}.4
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].vibrato).toBe(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].vibrato).toBe(VibratoType.Wide);
        testExportRoundtrip(score);
    });

    it('whammy', () => {
        const score = parseTex(`
            3.3.4{ tb dive (0 -12.5) } |
            3.3.4{ tb dive gradual (0 -12.5) } |
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarType).toBe(WhammyType.Dive);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints!.length).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![0].value).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![1].value).toBe(-12.5);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarType).toBe(WhammyType.Dive);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyStyle).toBe(BendStyle.Gradual);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints!.length).toBe(2);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![0].value).toBe(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![1].value).toBe(-12.5);
        testExportRoundtrip(score);
    });

    it('beat-ottava', () => {
        const score = parseTex(`
            3.3.4{ ot 15ma } 3.3.4{ ot 8vb }
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].ottava).toBe(Ottavia._15ma);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].ottava).toBe(Ottavia._8vb);
        testExportRoundtrip(score);
    });

    it('beat-text', () => {
        const score = parseTex(`
            3.3.4{ txt "Hello World" } 3.3.4{ txt Hello }
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].text).toBe('Hello World');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].text).toBe('Hello');
        testExportRoundtrip(score);
    });

    it('legato-origin', () => {
        const score = parseTex(`
            3.3.4{ legatoOrigin } 4.3.4
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].isLegatoOrigin).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].isLegatoDestination).toBe(true);
        testExportRoundtrip(score);
    });

    it('instrument-change', () => {
        const score = parseTex(`
            \\instrument acousticgrandpiano
            G4 G4 G4 { instrument brightacousticpiano }
        `);
        expect(score.tracks[0].playbackInfo.program).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].automations.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].automations[0].type).toBe(
            AutomationType.Instrument
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].automations[0].value).toBe(1);
        testExportRoundtrip(score);
    });

    it('beat-fermata', () => {
        const score = parseTex(`
            G4 G4 G4 { fermata medium 4 }
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].fermata).toBeTruthy();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].fermata!.type).toBe(FermataType.Medium);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].fermata!.length).toBe(4);
        testExportRoundtrip(score);
    });

    it('bend-type', () => {
        const score = parseTex(`
            3.3{ b bend gradual (0 4)}
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendType).toBe(BendType.Bend);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendStyle).toBe(BendStyle.Gradual);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints!.length).toBe(2);
        testExportRoundtrip(score);
    });

    it('harmonic-values', () => {
        const score = parseTex(`
        2.3{nh} 2.3{ah} 2.3{ah 7} 2.3{th} 2.3{th 7} 2.3{ph} 2.3{ph 7} 2.3{sh} 2.3{sh 7} 2.3{fh} 2.3{fh 7}
        `);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].harmonicType).toBe(
            HarmonicType.Natural
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].harmonicValue).toBe(2.4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].harmonicType).toBe(
            HarmonicType.Artificial
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].harmonicValue).toBe(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].harmonicType).toBe(
            HarmonicType.Artificial
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].harmonicValue).toBe(7);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].harmonicType).toBe(HarmonicType.Tap);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].harmonicValue).toBe(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].harmonicType).toBe(HarmonicType.Tap);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].harmonicValue).toBe(7);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[5].notes[0].harmonicType).toBe(HarmonicType.Pinch);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[5].notes[0].harmonicValue).toBe(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[6].notes[0].harmonicType).toBe(HarmonicType.Pinch);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[6].notes[0].harmonicValue).toBe(7);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[7].notes[0].harmonicType).toBe(HarmonicType.Semi);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[7].notes[0].harmonicValue).toBe(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[8].notes[0].harmonicType).toBe(HarmonicType.Semi);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[8].notes[0].harmonicValue).toBe(7);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[9].notes[0].harmonicType).toBe(
            HarmonicType.Feedback
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[9].notes[0].harmonicValue).toBe(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[10].notes[0].harmonicType).toBe(
            HarmonicType.Feedback
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[10].notes[0].harmonicValue).toBe(7);
        testExportRoundtrip(score);
    });

    it('time-signature-commons', () => {
        const score = parseTex(`
        \\ts common
        `);
        expect(score.masterBars[0].timeSignatureNumerator).toBe(4);
        expect(score.masterBars[0].timeSignatureDenominator).toBe(4);
        expect(score.masterBars[0].timeSignatureCommon).toBe(true);
        testExportRoundtrip(score);
    });

    it('clef-ottava', () => {
        const score = parseTex(`
        \\ottava 15ma
        `);
        expect(score.tracks[0].staves[0].bars[0].clefOttava).toBe(Ottavia._15ma);
        testExportRoundtrip(score);
    });

    it('simile-mark', () => {
        const score = parseTex(`
        \\simile simple
        `);
        expect(score.tracks[0].staves[0].bars[0].simileMark).toBe(SimileMark.Simple);
        testExportRoundtrip(score);
    });

    it('tempo-automation-text', () => {
        const score = parseTex(`
        \\tempo (100 "T1")
        .
        3.3.4 * 4 | \\tempo (80 "T2") 4.3.4*4
        `);
        expect(score.tempo).toBe(100);
        expect(score.tempoLabel).toBe('T1');

        expect(score.masterBars[1].tempoAutomations.length).toBe(1);
        expect(score.masterBars[1].tempoAutomations[0].value).toBe(80);
        expect(score.masterBars[1].tempoAutomations[0].text).toBe('T2');
        testExportRoundtrip(score);
    });

    it('double-bar', () => {
        const tex: string = '3.3 3.3 3.3 3.3 | \\db 1.1 2.1 3.1 4.1';
        const score = parseTex(tex);
        expect(score.masterBars[1].isDoubleBar).toBe(true);
        testExportRoundtrip(score);
    });

    it('score-options', () => {
        const score = parseTex(`
            \\defaultSystemsLayout 5
            \\systemsLayout 3 2 3
            \\hideDynamics
            \\bracketExtendMode nobrackets
            \\useSystemSignSeparator
            \\singleTrackTrackNamePolicy allsystems
            \\multiTrackTrackNamePolicy Hidden
            \\firstSystemTrackNameMode fullname
            \\otherSystemsTrackNameMode fullname
            \\firstSystemTrackNameOrientation horizontal
            \\otherSystemsTrackNameOrientation horizontal
            .
        `);

        expect(score.defaultSystemsLayout).toBe(5);
        expect(score.systemsLayout.length).toBe(3);
        expect(score.systemsLayout[0]).toBe(3);
        expect(score.systemsLayout[1]).toBe(2);
        expect(score.systemsLayout[2]).toBe(3);
        expect(score.stylesheet.hideDynamics).toBe(true);
        expect(score.stylesheet.bracketExtendMode).toBe(BracketExtendMode.NoBrackets);
        expect(score.stylesheet.useSystemSignSeparator).toBe(true);
        expect(score.stylesheet.singleTrackTrackNamePolicy).toBe(TrackNamePolicy.AllSystems);
        expect(score.stylesheet.multiTrackTrackNamePolicy).toBe(TrackNamePolicy.Hidden);
        expect(score.stylesheet.firstSystemTrackNameMode).toBe(TrackNameMode.FullName);
        expect(score.stylesheet.otherSystemsTrackNameMode).toBe(TrackNameMode.FullName);
        expect(score.stylesheet.firstSystemTrackNameOrientation).toBe(TrackNameOrientation.Horizontal);
        expect(score.stylesheet.otherSystemsTrackNameOrientation).toBe(TrackNameOrientation.Horizontal);
        testExportRoundtrip(score);
    });

    it('bar-sizing', () => {
        const score = parseTex(`
            3.3.4 | \\scale 0.5 3.3.4 | \\width 300 3.3.4
        `);

        expect(score.masterBars[1].displayScale).toBe(0.5);
        expect(score.masterBars[2].displayWidth).toBe(300);
        testExportRoundtrip(score);
    });

    it('track-properties', () => {
        const score = parseTex(`
            \\track "First" {
                color "#FF0000"
                defaultSystemsLayout 6
                systemsLayout 3 2 3
                volume 7
                balance 3
                mute
                solo
            }
        `);

        expect(score.tracks[0].color.rgba).toBe('#FF0000');
        expect(score.tracks[0].defaultSystemsLayout).toBe(6);
        expect(score.tracks[0].systemsLayout.length).toBe(3);
        expect(score.tracks[0].systemsLayout[0]).toBe(3);
        expect(score.tracks[0].systemsLayout[1]).toBe(2);
        expect(score.tracks[0].systemsLayout[0]).toBe(3);
        expect(score.tracks[0].playbackInfo.volume).toBe(7);
        expect(score.tracks[0].playbackInfo.balance).toBe(3);
        expect(score.tracks[0].playbackInfo.isMute).toBe(true);
        expect(score.tracks[0].playbackInfo.isSolo).toBe(true);
        testExportRoundtrip(score);
    });

    it('beat-beam', () => {
        const score = parseTex(`
            :8 3.3{ beam invert } 3.3 |
            3.3{ beam up } 3.3 |
            3.3{ beam down } 3.3 |
            3.3{ beam auto } 3.3 |
            3.3{ beam split } 3.3 |
            3.3{ beam merge } 3.3 |
        `);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].invertBeamDirection).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].preferredBeamDirection).toBe(BeamDirection.Up);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].preferredBeamDirection).toBe(
            BeamDirection.Down
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].beamingMode).toBe(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].beamingMode).toBe(
            BeatBeamingMode.ForceMergeWithNext
        );
        testExportRoundtrip(score);
    });

    it('note-show-string', () => {
        const score = parseTex(`
            :8 3.3{ string }
        `);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].showStringNumber).toBe(true);
        testExportRoundtrip(score);
    });

    it('note-hide', () => {
        const score = parseTex(`
            :8 3.3{ hide }
        `);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isVisible).toBe(false);
    });

    it('note-slur', () => {
        const score = parseTex(`
            :8 (3.3{ slur s1 } 3.4 3.5)  (10.3 {slur s1} 17.4 15.5)
        `);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isSlurOrigin).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isSlurDestination).toBe(true);
        testExportRoundtrip(score);
    });

    it('hide-tuning', () => {
        const score = parseTex(`
            \\track "Track 1"
            \\track "Track 2"
            \\staff {tabs}
            \\tuning A1 D2 A2 D3 G3 B3 E4 hide
            4.1 3.1 2.1 1.1`);

        expect(score.tracks[1].staves[0].stringTuning.tunings[0]).toBe(33);
        expect(score.stylesheet.perTrackDisplayTuning).toBeTruthy();
        expect(score.stylesheet.perTrackDisplayTuning!.has(1)).toBe(true);
        expect(score.stylesheet.perTrackDisplayTuning!.get(1)).toBe(false);
        testExportRoundtrip(score);
    });

    it('clefs', () => {
        const score = parseTex(`
        \\clef C4 \\ottava 15ma C4 | C4 |
        \\clef 0 | \\clef 48 | \\clef 60 | \\clef 65 | \\clef 43 |
        \\clef Neutral | \\clef C3 | \\clef C4 | \\clef F4 | \\clef G2 |
        \\clef "Neutral" | \\clef "C3" | \\clef "C4" | \\clef "F4" | \\clef "G2" |
        \\clef n | \\clef alto | \\clef tenor | \\clef bass | \\clef treble |
        \\clef "n" | \\clef "alto" | \\clef "tenor" | \\clef "bass" | \\clef "treble"
        `);
        let barIndex = 0;
        expect(score.tracks[0].staves[0].bars[barIndex].clef).toBe(Clef.C4);
        expect(score.tracks[0].staves[0].bars[barIndex++].clefOttava).toBe(Ottavia._15ma);
        expect(score.tracks[0].staves[0].bars[barIndex].clef).toBe(Clef.C4);
        expect(score.tracks[0].staves[0].bars[barIndex++].clefOttava).toBe(Ottavia._15ma);

        for (let i = 0; i < 5; i++) {
            expect(score.tracks[0].staves[0].bars[barIndex++].clef, `Invalid clef at index ${barIndex - 1}`).toBe(
                Clef.Neutral
            );
            expect(score.tracks[0].staves[0].bars[barIndex++].clef, `Invalid clef at index ${barIndex - 1}`).toBe(
                Clef.C3
            );
            expect(score.tracks[0].staves[0].bars[barIndex++].clef, `Invalid clef at index ${barIndex - 1}`).toBe(
                Clef.C4
            );
            expect(score.tracks[0].staves[0].bars[barIndex++].clef, `Invalid clef at index ${barIndex - 1}`).toBe(
                Clef.F4
            );
            expect(score.tracks[0].staves[0].bars[barIndex++].clef, `Invalid clef at index ${barIndex - 1}`).toBe(
                Clef.G2
            );
        }

        testExportRoundtrip(score);
    });

    it('multibar-rest', () => {
        const score = parseTex(`
        \\multiBarRest
        .
        \\track "A" { multiBarRest }
        3.3
        \\track "B"
        3.3

        `);
        expect(score.stylesheet.multiTrackMultiBarRest).toBe(true);
        expect(score.stylesheet.perTrackMultiBarRest).toBeTruthy();
        expect(score.stylesheet.perTrackMultiBarRest!.has(0)).toBe(true);
        expect(score.stylesheet.perTrackMultiBarRest!.has(1)).toBe(false);
        testExportRoundtrip(score);
    });

    it('header-footer', async () => {
        const score = parseTex(`
            \\title "Title" "Title: %TITLE%" left
            \\subtitle "Subtitle" "Subtitle: %SUBTITLE%" center
            \\artist "Artist" "Artist: %ARTIST%" right
            \\album "Album" "Album: %ALBUM%" left
            \\words "Words" "Words: %WORDS%" center
            \\music "Music" "Music: %MUSIC%" right
            \\wordsAndMusic "Words & Music: %MUSIC%" left
            \\tab "Tab" "Transcriber: %TABBER%" center
            \\copyright "Copyright" "Copyright: %COPYRIGHT%" right
            \\copyright2 "Copyright2" right
            .
            `);

        expect(score.style).toBeTruthy();

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Title)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.template).toBe('Title: %TITLE%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.textAlign).toBe(TextAlign.Left);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.SubTitle)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.template).toBe('Subtitle: %SUBTITLE%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.textAlign).toBe(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Artist)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.template).toBe('Artist: %ARTIST%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.textAlign).toBe(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Album)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.template).toBe('Album: %ALBUM%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.textAlign).toBe(TextAlign.Left);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Words)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.template).toBe('Words: %WORDS%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.textAlign).toBe(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Music)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.template).toBe('Music: %MUSIC%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.textAlign).toBe(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.WordsAndMusic)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.template).toBe(
            'Words & Music: %MUSIC%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.textAlign).toBe(TextAlign.Left);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Transcriber)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Transcriber)!.template).toBe(
            'Transcriber: %TABBER%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Transcriber)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Transcriber)!.textAlign).toBe(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Copyright)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.template).toBe(
            'Copyright: %COPYRIGHT%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.textAlign).toBe(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.CopyrightSecondLine)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.template).toBe('Copyright2');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.textAlign).toBe(
            TextAlign.Right
        );
        testExportRoundtrip(score);
    });

    it('barlines', () => {
        const score = parseTex(`
            \\instrument piano
            .
            \\track "T1"
                \\staff
                    \\barlineleft dashed
                    \\barlineright dotted
                    |
                    \\barlineleft heavyheavy
                    \\barlineright heavyheavy

                \\staff
                    \\barlineleft lightlight
                    \\barlineright lightheavy
                    |
                    \\barlineleft heavylight
                    \\barlineright dashed
            `);
        expect(score).toMatchSnapshot();
    });

    it('sync', () => {
        const score = parseTex(`
            \\tempo 90
            .
            3.4.4*4 | 3.4.4*4 |
            \\ro 3.4.4*4 | 3.4.4*4 | \\rc 2 3.4.4*4 |
            3.4.4*4 | 3.4.4*4
            .
            \\sync 0 0 0
            \\sync 0 0 1000 0.5
            \\sync 1 0 2000
            \\sync 3 0 3000
            \\sync 3 1 4000
            \\sync 6 1 5000
            `);

        // simplify snapshot
        const tracks = score.tracks;
        score.tracks = [];

        expect(score).toMatchSnapshot();

        score.tracks = tracks;
        testExportRoundtrip(score);
    });

    it('sync-expect-dot', () => {
        const score = parseTex(`
            \\title "Prelude in D Minor"
            \\artist "J.S. Bach (1685-1750)"
            \\copyright "Public Domain"
            \\tempo 80
            .
            \\ts 3 4
            0.4.16 (3.2 -.4) (1.1 -.4) (5.1 -.4) 1.1 3.2 1.1 3.2 2.3.8 (3.2 3.4) |
            (3.2 0.4).16 (3.2 -.4) (1.1 -.4) (5.1 -.4) 1.1 3.2 1.1 3.2 2.3.8 (3.2 3.4) |
            (3.2 0.4).16 (3.2 -.4) (3.1 -.4) (6.1 -.4) 3.1 3.2 3.1 3.2 3.3.8 (3.2 0.3) |
            (3.2 0.4).16 (3.2 -.4) (3.1 -.4) (6.1 -.4) 3.1 3.2 3.1 3.2 3.3.8 (3.2 0.3) |
            .
            \\sync 0 0 0
            \\sync 0 0 1500 0.666
            \\sync 1 0 4075 0.666
            \\sync 2 0 6475 0.333
            \\sync 3 0 10223 1
        `);

        // simplify snapshot
        const tracks = score.tracks;
        score.tracks = [];

        expect(score).toMatchSnapshot();

        score.tracks = tracks;
        testExportRoundtrip(score);
    });

    it('tuning-name', () => {
        const score = parseTex(`
            \\tuning E4 B3 G3 D3 A2 E2 "Default"
        `);

        expect(score.tracks[0].staves[0].stringTuning.tunings.join(',')).toBe(
            Tuning.getDefaultTuningFor(6)!.tunings.join(',')
        );
        expect(score.tracks[0].staves[0].stringTuning.name).toBe('Default');
        testExportRoundtrip(score);
    });

    it('volume-change', () => {
        const score = parseTex(`
            \\track "T1" {
                volume 7
            }
            G4 G4 { volume 8 } G4 { volume 9 }
        `);

        expect(score.tracks[0].playbackInfo.volume).toBe(7);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].automations.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].automations[0].type).toBe(
            AutomationType.Volume
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].automations[0].value).toBe(8);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].automations.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].automations[0].type).toBe(
            AutomationType.Volume
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].automations[0].value).toBe(9);
        testExportRoundtrip(score);
    });

    it('balance-change', () => {
        const score = parseTex(`
            \\track "T1" {
                balance 7
            }
            G4 G4 { balance 8 } G4 { balance 9 }
        `);

        expect(score.tracks[0].playbackInfo.balance).toBe(7);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].automations.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].automations[0].type).toBe(
            AutomationType.Balance
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].automations[0].value).toBe(8);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].automations.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].automations[0].type).toBe(
            AutomationType.Balance
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].automations[0].value).toBe(9);
        testExportRoundtrip(score);
    });

    it('beat-barre', () => {
        const score = parseTex(`
            3.3.4 { barre 5 half }
        `);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].barreFret).toBe(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].barreShape).toBe(BarreShape.Half);
        testExportRoundtrip(score);
    });

    it('beat-dead-slapped', () => {
        const score = parseTex(`
            ().16 {ds}
        `);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].deadSlapped).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).toBe(0);
        testExportRoundtrip(score);
    });

    it('unicode-escape', () => {
        const score = parseTex(`
            \\title "\\uD83D\\uDE38"
            .
        `);

        expect(score.title).toBe('😸');
    });

    it('utf16', () => {
        const score = parseTex(`\\title "🤘🏻" .`);

        expect(score.title).toBe('🤘🏻');
    });

    it('beat-lyrics', () => {
        const score = parseTex(`
            .
            3.3.4
            3.3.4 {lyrics "A"}
            3.3.4 {lyrics 0 "B C D"}
            3.3.4 {lyrics 0 "E" lyrics 1 "F" lyrics 2 "G"}
        `);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].lyrics).not.toBeTruthy();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].lyrics).toBeTruthy();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].lyrics!.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].lyrics![0]).toBe('A');

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].lyrics).toBeTruthy();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].lyrics!.length).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].lyrics![0]).toBe('B C D');

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].lyrics).toBeTruthy();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].lyrics!.length).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].lyrics![0]).toBe('E');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].lyrics![1]).toBe('F');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].lyrics![2]).toBe('G');

        testExportRoundtrip(score);
    });

    it('bank', () => {
        const score = parseTex(`
            \\track "Piano" { instrument electricpiano1}
            c4 d4 e4 f4

            \\track "Piano" { instrument electricpiano1 bank 2 }
            c4 d4 e4 f4
        `);

        expect(score.tracks[0].playbackInfo.program).toBe(4);
        expect(score.tracks[0].playbackInfo.bank).toBe(0);

        expect(score.tracks[1].playbackInfo.program).toBe(4);
        expect(score.tracks[1].playbackInfo.bank).toBe(2);

        testExportRoundtrip(score);
    });

    // Here we should focus on all the semantic tests:
    // - all metadata tags (valid and invalid variants)
    // - all properties (valid and invalid variants)
    // - proper diagnostics reporting
    // - value list type validations
    // - round-trip tests on old/new importer/exporter (backwards compatibility, and verification of new parser)

    describe('errors', () => {
        describe('at209', () => {
            it('tuning', () => importErrorTest('\\tuning Invalid'));
            it('articulation', () => importErrorTest('\\articulation "Test" 0'));
            it('duration tuplet', () => importErrorTest('. :4 {tu 0}'));
            it('beat tuplet', () => importErrorTest('. C4 {tu 0}'));
            it('tremolo speed', () => importErrorTest('. C4 {tp 10}'));
            it('trill', () => importErrorTest('. 3.3 {tr 4 0}'));
            it('textalign', () => importErrorTest('\\title "Test" "" invalid'));
        });

        describe('at219', () => {
            it('score empty', () => importErrorTest('\\title ()'));
            it('bar empty', () => importErrorTest('. \\ts ()'));
            it('bar missing', () => importErrorTest('. \\ts (3)'));

            it('score required', () => importErrorTest('\\title (1)'));
            it('bar required', () => importErrorTest('. \\rc ("a")'));
            it('score optional', () => importErrorTest('\\title ("Title" 1)'));
            it('bar optional', () => importErrorTest('. \\section ("a" 1)'));

            it('bracketextendmode', () => importErrorTest('\\bracketextendmode invalid'));
            it('singletracktracknamepolicy', () => importErrorTest('\\singletracktracknamepolicy invalid'));
            it('multitracktracknamepolicy', () => importErrorTest('\\multitracktracknamepolicy invalid'));
            it('firstsystemtracknamemode', () => importErrorTest('\\firstsystemtracknamemode invalid'));
            it('othersystemstracknamemode', () => importErrorTest('\\othersystemstracknamemode invalid'));
            it('firstsystemtracknameorientation', () => importErrorTest('\\firstsystemtracknameorientation invalid'));
            it('othersystemstracknameorientation', () => importErrorTest('\\firstsystemtracknameorientation invalid'));
            it('accidentalmode', () => importErrorTest('\\accidentals invalid'));
            it('whammybartype', () => importErrorTest('C4 {tb invalid (0 1)}'));
            it('whammybarstyle', () => importErrorTest('C4 {tb none invalid (0 1)}'));
            it('dynamic', () => importErrorTest('C4 {dy invalid}'));
            it('rasg', () => importErrorTest('C4 {rasg invalid}'));
            it('ottava', () => importErrorTest('C4 {ot invalid}'));
            it('fermata', () => importErrorTest('C4 {fermata (invalid)}'));
            it('bendtype', () => importErrorTest('C4 {b invalid (0 4)}'));
            it('bendstyle', () => importErrorTest('C4 {b bend invalid (0 4)}'));
            it('gracetype', () => importErrorTest('C4 {gr (invalid)}'));
            it('barre', () => importErrorTest('C4 {barre (1 invalid)    }'));

            it('beam', () => importErrorTest('. C4 {beam invalid}'));
        });
    });

    describe('bar-meta-interweaving', () => {
        function test(tex: string) {
            expect(parseTex(tex)).toMatchSnapshot();
        }

        describe('initial', () => {
            it('meta-track', () => test(`\\clef C3 \\track "T1"`));
            it('meta-track-staff', () => test(`\\clef C3 \\track "T1" \\staff`));
            it('meta-track-staff-voice', () => test(`\\clef C3 \\track "T1" \\staff \\voice`));
            it('meta-track-staff-voice-voice', () => test(`\\clef C3 \\track "T1" \\staff \\voice \\voice`));
            it('meta-track-staff-staff', () => test(`\\clef C3 \\track "T1" \\staff \\staff`));
            it('meta-track-voice', () => test(`\\clef C3 \\track "T1" \\voice`));
            it('meta-track-voice-voice', () => test(`\\clef C3 \\track "T1" \\voice \\voice`));
            it('meta-track-track', () => test(`\\clef C3 \\track "T1" \\track "T2"`));

            it('meta-staff', () => test(`\\clef C3 \\staff`));
            it('meta-staff-voice', () => test(`\\clef C3 \\staff \\voice`));
            it('meta-staff-voice-voice', () => test(`\\clef C3 \\staff \\voice \\voice`));
            it('meta-staff-staff', () => test(`\\clef C3 \\staff \\staff`));

            it('meta-voice', () => test(`\\clef C3 \\voice`));
            it('meta-voice-voice', () => test(`\\clef C3 \\voice \\voice`));
            it('meta-track-track-meta', () => test(`\\clef C3 \\track "T1" \\track "T2" \\clef C4`));
        });

        describe('with-previous-bars', () => {
            it('meta-track', () => test(`C4 | C5 | \\clef C3 \\track "T1"`));
            it('meta-track-staff', () => test(`C4 | C5 | \\clef C3 \\track "T1" \\staff`));
            it('meta-track-staff-voice', () => test(`C4 | C5 | \\clef C3 \\track "T1" \\staff \\voice`));
            it('meta-track-staff-voice-voice', () => test(`C4 | C5 | \\clef C3 \\track "T1" \\staff \\voice \\voice`));
            it('meta-track-staff-staff', () => test(`C4 | C5 | \\clef C3 \\track "T1" \\staff \\staff`));
            it('meta-track-voice', () => test(`C4 | C5 | \\clef C3 \\track "T1" \\voice`));
            it('meta-track-voice-voice', () => test(`\\clef C3 \\track "T1" \\voice \\voice`));
            it('meta-track-track', () => test(`C4 | C5 | \\clef C3 \\track "T1" \\track "T2"`));

            it('meta-staff', () => test(`C4 | C5 | \\clef C3 \\staff`));
            it('meta-staff-voice', () => test(`C4 | C5 | \\clef C3 \\staff \\voice`));
            it('meta-staff-voice-voice', () => test(`C4 | C5 | \\clef C3 \\staff \\voice \\voice`));
            it('meta-staff-staff', () => test(`C4 | C5 | \\clef C3 \\staff \\staff`));

            it('meta-voice', () => test(`C4 | C5 | \\clef C3 \\voice`));
            it('meta-voice-voice', () => test(`C4 | C5 | \\clef C3 \\voice \\voice`));
            it('meta-track-track-meta', () => test(`C4 | C5 | \\clef C3 \\track "T1" \\track "T2" \\clef C4`));
        });
    });

    describe('staff-autodetect', () => {
        // tests for autodetecting staff note kinds
        function test(tex: string, type: AlphaTexStaffNoteKind) {
            const importer = new AlphaTexImporter();
            importer.initFromString(tex, new Settings());
            const s = importer.readScore();
            expect(importer.getStaffNoteKind(s.tracks[0].staves[0])).toBe(type);
        }

        // - direct values
        describe('direct', () => {
            it('pitch-value', () => test(`C4`, AlphaTexStaffNoteKind.Pitched));
            it('fretted', () => test(`3.3`, AlphaTexStaffNoteKind.Fretted));
            it('articulation', () => test(`"Ride (choke)"`, AlphaTexStaffNoteKind.Articulation));
        });

        // - with tuning already specified
        describe('tuning', () => {
            it('pitch-value', () => test(`\\tuning (C4 C4 C4) C4`, AlphaTexStaffNoteKind.Pitched));
            it('fretted', () => test(`\\tuning (C4 C4 C4) 3.3`, AlphaTexStaffNoteKind.Fretted));
            it('articulation', () => test(`\\tuning (C4 C4 C4) "Ride (choke)"`, AlphaTexStaffNoteKind.Articulation));
        });

        // - with instrument already specified
    });

    it('extend-bar-lines', () => {
        const score = ScoreLoader.loadAlphaTex(`
            \\extendBarLines
            \\track "Piano1"
              \\staff {score}
            \\instrument piano
              C4 D4 E4 F4
              \\staff {score}
              \\clef f4 C3 D3 E3 F3
            \\track "Piano2"
              \\staff {score}
            \\instrument piano
              C4 D4 E4 F4
            \\track "Flute 1"
              \\staff { score }
            \\instrument flute
              C4 D4 E4 F4
            \\track "Flute 2"
              \\staff { score }
            \\instrument flute
              \\clef f4 C3 D3 E3 F3
            \\track "Guitar 1"
              \\staff { score tabs }
              0.3.4 2.3.4 5.3.4 7.3.4
        `);

        expect(score.stylesheet.extendBarLines).toBe(true);

        testExportRoundtrip(score);
    });

    describe('voice-mode', () => {
        it('default', () => {
            expect(
                parseTex(`
                    \\voice
                        C4 | C5
                    \\voice
                        C3 | C4
                `)
            ).toMatchSnapshot();
        });
        it('staffWise', () => {
            expect(
                parseTex(`
                    \\voiceMode staffWise
                    \\voice
                        C4 | C5
                    \\voice
                        C3 | C4
                `)
            ).toMatchSnapshot();
        });
        it('barWise', () => {
            expect(
                parseTex(`
                    \\voiceMode barWise
                    // Bar 1
                        \\voice C4 
                        \\voice C3
                    |
                    // Bar 2
                        \\voice C5 
                        \\voice C4
                `)
            ).toMatchSnapshot();
        });
    });

    it('inline-chord-diagrams', () => {
        let score = parseTex(`
            \\chordDiagramsInScore
            \\chord ("E" 0 0 1 2 2 0)
            (0.1 0.2 1.3 2.4 2.5 0.6){ch "E"}
        `);
        expect(score.stylesheet.globalDisplayChordDiagramsInScore).toBe(true);

        score = parseTex(`
            \\chordDiagramsInScore true
            \\chord ("E" 0 0 1 2 2 0)
            (0.1 0.2 1.3 2.4 2.5 0.6){ch "E"}
        `);
        expect(score.stylesheet.globalDisplayChordDiagramsInScore).toBe(true);

        score = parseTex(`
            \\chordDiagramsInScore false
            \\chord ("E" 0 0 1 2 2 0)
            (0.1 0.2 1.3 2.4 2.5 0.6){ch "E"}
        `);
        expect(score.stylesheet.globalDisplayChordDiagramsInScore).toBe(false);
    });

    it('empty-staff-options', () => {
        let score = parseTex(`
            \\hideEmptyStaves
            C4
        `);
        expect(score.stylesheet.hideEmptyStaves).toBe(true);
        expect(score.stylesheet.hideEmptyStavesInFirstSystem).toBe(false);
        expect(score.stylesheet.showSingleStaffBrackets).toBe(false);

        score = parseTex(`
            \\hideEmptyStaves
            \\hideEmptyStavesInFirstSystem
        `);
        expect(score.stylesheet.hideEmptyStaves).toBe(true);
        expect(score.stylesheet.hideEmptyStavesInFirstSystem).toBe(true);

        score = parseTex(`
            \\hideEmptyStavesInFirstSystem
            C4
        `);
        expect(score.stylesheet.hideEmptyStaves).toBe(false);
        expect(score.stylesheet.hideEmptyStavesInFirstSystem).toBe(true);

        score = parseTex(`
            \\showSingleStaffBrackets
            C4
        `);
        expect(score.stylesheet.showSingleStaffBrackets).toBe(true);
    });

    describe('tremolos', () => {
        function test(tex: string) {
            const score = parseTex(tex);
            const beat = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
            const serialized = TremoloPickingEffectSerializer.toJson(beat.tremoloPicking!);
            expect(serialized).toMatchSnapshot();
            testExportRoundtrip(score);
        }

        // simple
        it('tremolo1', () => test(`C4 {tp 1}`));
        it('tremolo2', () => test(`C4 {tp 2}`));
        it('tremolo3', () => test(`C4 {tp 3}`));
        it('tremolo4', () => test(`C4 {tp 4}`));
        it('tremolo5', () => test(`C4 {tp 5}`));

        // backwards compatibility
        it('tremolo8', () => test(`C4 {tp 8}`));
        it('tremolo16', () => test(`C4 {tp 16}`));
        it('tremolo32', () => test(`C4 {tp 32}`));

        // with default style
        it('tremolo-default1', () => test(`C4 {tp (1 default)}`));
        it('tremolo-default2', () => test(`C4 {tp (2 default)}`));
        it('tremolo-default3', () => test(`C4 {tp (3 default)}`));
        it('tremolo-default4', () => test(`C4 {tp (4 default)}`));
        it('tremolo-default5', () => test(`C4 {tp (5 default)}`));

        // buzzroll
        it('buzzroll-default1', () => test(`C4 {tp (1 buzzRoll)}`));
        it('buzzroll-default2', () => test(`C4 {tp (2 buzzRoll)}`));
        it('buzzroll-default3', () => test(`C4 {tp (3 buzzRoll)}`));
        it('buzzroll-default4', () => test(`C4 {tp (4 buzzRoll)}`));
        it('buzzroll-default5', () => test(`C4 {tp (5 buzzRoll)}`));
    });

    describe('defaultBarNumberDisplay', () => {
        function test(tex: string, mode: BarNumberDisplay) {
            const score = parseTex(tex);
            expect(score.stylesheet.barNumberDisplay).toBe(mode);

            testExportRoundtrip(score);
        }

        it('all', () => test('\\defaultBarNumberDisplay allBars C4', BarNumberDisplay.AllBars));
        it('first', () => test('\\defaultBarNumberDisplay firstOfSystem C4', BarNumberDisplay.FirstOfSystem));
        it('hide', () => test('\\defaultBarNumberDisplay hide C4', BarNumberDisplay.Hide));
    });

    describe('barNumberDisplay', () => {
        function test(tex: string, mode: BarNumberDisplay | undefined) {
            const score = parseTex(tex);
            expect(score.tracks[0].staves[0].bars[0].barNumberDisplay).toBeUndefined();
            expect(score.tracks[0].staves[0].bars[1].barNumberDisplay).toBe(mode);

            testExportRoundtrip(score);
        }

        it('unsert', () => test('\\defaultBarNumberDisplay hide C4 | C4 ', undefined));
        it('all', () =>
            test('\\defaultBarNumberDisplay hide C4 | \\barNumberDisplay allBars C4 ', BarNumberDisplay.AllBars));
        it('first', () =>
            test(
                '\\defaultBarNumberDisplay hide C4 | \\barNumberDisplay firstOfSystem C4 ',
                BarNumberDisplay.FirstOfSystem
            ));
        it('hide', () =>
            test('\\defaultBarNumberDisplay allBars C4 | \\barNumberDisplay hide C4 ', BarNumberDisplay.Hide));
    });

    it('custom-beaming', () => {
        const score = parseTex(`
            \\ts (4 4)
            \\beaming (8 2 2 2 2)
                C4.8 * 8 |
                C4.8 * 8 |
            \\ts (4 4)
            \\beaming (8 4 4)
                C4.8 * 8
                C4.8 * 8            
        `);
        expect(score).toMatchSnapshot();
        testExportRoundtrip(score);
    });
});
