import { StaveProfile } from '@src/DisplaySettings';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { Beat } from '@src/model/Beat';
import { Clef } from '@src/model/Clef';
import { CrescendoType } from '@src/model/CrescendoType';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { Fingers } from '@src/model/Fingers';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { Score } from '@src/model/Score';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { Tuning } from '@src/model/Tuning';
import { HarmonicsEffectInfo } from '@src/rendering/effects/HarmonicsEffectInfo';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';

describe('AlphaTexImporterTest', () => {
    const parseTex: (tex:string) => Score = (tex: string): Score => {
        let importer: AlphaTexImporter = new AlphaTexImporter();
        importer.init(TestPlatform.createStringReader(tex), new Settings());
        return importer.readScore();
    };

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

        let score: Score = parseTex(tex);
        expect(score.title).toEqual('Test');
        expect(score.words).toEqual('test');
        expect(score.music).toEqual('alphaTab');
        expect(score.copyright).toEqual('test');
        expect(score.tempo).toEqual(200);
        expect(score.tracks.length).toEqual(1);
        expect(score.tracks[0].playbackInfo.program).toEqual(30);
        expect(score.tracks[0].staves[0].capo).toEqual(2);
        expect(score.tracks[0].staves[0].tuning.join(',')).toEqual('55,38,43,47,50,69');
        expect(score.masterBars.length).toEqual(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toEqual(3);
        {
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).toEqual(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].duration).toEqual(Duration.Half);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toEqual(0);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].string).toEqual(2);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes.length).toEqual(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].duration).toEqual(Duration.Quarter);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].fret).toEqual(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].string).toEqual(2);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes.length).toEqual(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].duration).toEqual(Duration.Quarter);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].fret).toEqual(3);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].string).toEqual(3);
        }
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).toEqual(5);
        {
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes.length).toEqual(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].duration).toEqual(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].fret).toEqual(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].string).toEqual(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes.length).toEqual(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].duration).toEqual(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].fret).toEqual(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].string).toEqual(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes.length).toEqual(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].duration).toEqual(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].fret).toEqual(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].string).toEqual(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes.length).toEqual(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].duration).toEqual(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].fret).toEqual(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].string).toEqual(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].notes.length).toEqual(0);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].duration).toEqual(Duration.Half);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].isRest).toEqual(true);
        }
    });

    it('tuning', () => {
        const tex = `\\tuning E4 B3 G3 D3 A2 E2
        .
        0.5.1`;

        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].tuning.join(',')).toEqual(Tuning.getDefaultTuningFor(6)!.tunings.join(','));
    });

    it('dead-notes1-issue79', () => {
        let tex: string = ':4 x.3';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toEqual(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isDead).toEqual(true);
    });

    it('dead-notes2-issue79', () => {
        let tex: string = ':4 3.3{x}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toEqual(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isDead).toEqual(true);
    });

    it('trill-issue79', () => {
        let tex: string = ':4 3.3{tr 5 16}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toEqual(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isTrill).toEqual(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillSpeed).toEqual(Duration.Sixteenth);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillFret).toEqual(5);
    });

    it('tremolo-issue79', () => {
        let tex: string = ':4 3.3{tr 5 16}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toEqual(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isTrill).toEqual(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillSpeed).toEqual(Duration.Sixteenth);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillFret).toEqual(5);
    });

    it('tremolo-picking-issue79', () => {
        let tex: string = ':4 3.3{tp 16}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toEqual(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].isTremolo).toEqual(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].tremoloSpeed).toEqual(Duration.Sixteenth);
    });

    it('hamonics-issue79', () => {
        let tex: string = ':8 3.3{nh} 3.3{ah} 3.3{th} 3.3{ph} 3.3{sh}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toEqual(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].harmonicType).toEqual(
            HarmonicType.Natural
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].harmonicType).toEqual(
            HarmonicType.Artificial
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].harmonicType).toEqual(HarmonicType.Tap);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].harmonicType).toEqual(HarmonicType.Pinch);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].harmonicType).toEqual(HarmonicType.Semi);
    });

    it('hamonics-rendering-text-issue79', () => {
        let tex: string = ':8 3.3{nh} 3.3{ah} 3.3{th} 3.3{ph} 3.3{sh}';
        let score: Score = parseTex(tex);
        let settings: Settings = new Settings();
        settings.core.engine = 'svg';
        settings.display.staveProfile = StaveProfile.ScoreTab;
        let renderer: ScoreRenderer = new ScoreRenderer(settings);
        renderer.width = 970;
        let svg: string = '';
        renderer.partialRenderFinished.on(r => {
            svg += r.renderResult;
        });
        renderer.renderScore(score, [0]);
        let regexTemplate: string = '<text[^>]+>\\s*{0}\\s*</text>';
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
        let tex: string = ':8 3.3{gr} 3.3{gr ob}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toEqual(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].graceType).toEqual(GraceType.BeforeBeat);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].graceType).toEqual(GraceType.OnBeat);
    });

    it('left-hand-finger-single-note', () => {
        let tex: string = ':8 3.3{lf 1} 3.3{lf 2} 3.3{lf 3} 3.3{lf 4} 3.3{lf 5}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toEqual(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].leftHandFinger).toEqual(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].leftHandFinger).toEqual(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].leftHandFinger).toEqual(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].leftHandFinger).toEqual(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].leftHandFinger).toEqual(
            Fingers.LittleFinger
        );
    });

    it('right-hand-finger-single-note', () => {
        let tex: string = ':8 3.3{rf 1} 3.3{rf 2} 3.3{rf 3} 3.3{rf 4} 3.3{rf 5}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toEqual(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].rightHandFinger).toEqual(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].rightHandFinger).toEqual(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].rightHandFinger).toEqual(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].rightHandFinger).toEqual(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].rightHandFinger).toEqual(
            Fingers.LittleFinger
        );
    });

    it('left-hand-finger-chord', () => {
        let tex: string = ':8 (3.1{lf 1} 3.2{lf 2} 3.3{lf 3} 3.4{lf 4} 3.5{lf 5})';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).toEqual(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].leftHandFinger).toEqual(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[1].leftHandFinger).toEqual(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[2].leftHandFinger).toEqual(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[3].leftHandFinger).toEqual(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[4].leftHandFinger).toEqual(
            Fingers.LittleFinger
        );
    });

    it('right-hand-finger-chord', () => {
        let tex: string = ':8 (3.1{rf 1} 3.2{rf 2} 3.3{rf 3} 3.4{rf 4} 3.5{rf 5})';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toEqual(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).toEqual(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].rightHandFinger).toEqual(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[1].rightHandFinger).toEqual(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[2].rightHandFinger).toEqual(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[3].rightHandFinger).toEqual(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[4].rightHandFinger).toEqual(
            Fingers.LittleFinger
        );
    });

    it('unstringed', () => {
        let tex: string = '\\tuning piano . c4 c#4 d4 d#4 | c4 db4 d4 eb4';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toEqual(4);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).toEqual(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].realValue).toEqual(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).toEqual(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].realValue).toEqual(61);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).toEqual(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].realValue).toEqual(62);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).toEqual(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].realValue).toEqual(63);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).toEqual(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).toEqual(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].realValue).toEqual(60);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).toEqual(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].realValue).toEqual(61);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).toEqual(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].realValue).toEqual(62);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).toEqual(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].realValue).toEqual(63);
    });

    it('multi-staff-default-settings', () => {
        let tex: string = '1.1 | 1.1 | \\staff 2.1 | 2.1';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(2);
        expect(score.tracks[0].staves.length).toEqual(2);
        expect(score.tracks[0].staves[0].showTablature).toBe(true);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[0].bars.length).toEqual(2);
        expect(score.tracks[0].staves[1].showTablature).toBe(true); // default settings used

        expect(score.tracks[0].staves[1].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[1].bars.length).toEqual(2);
    });

    it('multi-staff-default-settings-braces', () => {
        let tex: string = '1.1 | 1.1 | \\staff{} 2.1 | 2.1';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(2);
        expect(score.tracks[0].staves.length).toEqual(2);
        expect(score.tracks[0].staves[0].showTablature).toBe(true);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[0].bars.length).toEqual(2);
        expect(score.tracks[0].staves[1].showTablature).toBe(true); // default settings used

        expect(score.tracks[0].staves[1].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[1].bars.length).toEqual(2);
    });

    it('single-staff-with-setting', () => {
        let tex: string = '\\staff{score} 1.1 | 1.1';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(2);
        expect(score.tracks[0].staves.length).toEqual(1);
        expect(score.tracks[0].staves[0].showTablature).toBe(false);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[0].bars.length).toEqual(2);
    });

    it('multi-staff-with-settings', () => {
        const tex = `\\staff{score} 1.1 | 1.1 |
        \\staff{tabs} \\capo 2 2.1 | 2.1 |
        \\staff{score tabs} \\tuning A1 D2 A2 D3 G3 B3 E4 3.1 | 3.1`;
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(2);
        expect(score.tracks[0].staves.length).toEqual(3);
        expect(score.tracks[0].staves[0].showTablature).toBe(false);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[0].bars.length).toEqual(2);
        expect(score.tracks[0].staves[1].showTablature).toBe(true);
        expect(score.tracks[0].staves[1].showStandardNotation).toBe(false);
        expect(score.tracks[0].staves[1].bars.length).toEqual(2);
        expect(score.tracks[0].staves[1].capo).toEqual(2);
        expect(score.tracks[0].staves[2].showTablature).toBe(true);
        expect(score.tracks[0].staves[2].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[2].bars.length).toEqual(2);
        expect(score.tracks[0].staves[2].tuning.length).toEqual(7);
    });

    it('multi-track', () => {
        let tex: string = '\\track "First" 1.1 | 1.1 | \\track "Second" 2.2 | 2.2';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(2);
        expect(score.masterBars.length).toEqual(2);
        expect(score.tracks[0].staves.length).toEqual(1);
        expect(score.tracks[0].name).toEqual('First');
        expect(score.tracks[0].playbackInfo.primaryChannel).toEqual(0);
        expect(score.tracks[0].playbackInfo.secondaryChannel).toEqual(1);
        expect(score.tracks[0].staves[0].showTablature).toBe(true);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[0].bars.length).toEqual(2);
        expect(score.tracks[1].staves.length).toEqual(1);
        expect(score.tracks[1].name).toEqual('Second');
        expect(score.tracks[1].playbackInfo.primaryChannel).toEqual(2);
        expect(score.tracks[1].playbackInfo.secondaryChannel).toEqual(3);
        expect(score.tracks[1].staves[0].showTablature).toBe(true);
        expect(score.tracks[1].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[1].staves[0].bars.length).toEqual(2);
    });

    it('multi-track-names', () => {
        let tex: string =
            '\\track 1.1 | 1.1 | \\track "Only Long Name" 2.2 | 2.2 | \\track "Very Long Name" "shrt" 3.3 | 3.3 ';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(3);
        expect(score.masterBars.length).toEqual(2);
        expect(score.tracks[0].staves.length).toEqual(1);
        expect(score.tracks[0].name).toEqual('');
        expect(score.tracks[0].shortName).toEqual('');
        expect(score.tracks[0].playbackInfo.primaryChannel).toEqual(0);
        expect(score.tracks[0].playbackInfo.secondaryChannel).toEqual(1);
        expect(score.tracks[0].staves[0].showTablature).toBe(true);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[0].staves[0].bars.length).toEqual(2);
        expect(score.tracks[1].staves.length).toEqual(1);
        expect(score.tracks[1].name).toEqual('Only Long Name');
        expect(score.tracks[1].shortName).toEqual('Only Long ');
        expect(score.tracks[1].playbackInfo.primaryChannel).toEqual(2);
        expect(score.tracks[1].playbackInfo.secondaryChannel).toEqual(3);
        expect(score.tracks[1].staves[0].showTablature).toBe(true);
        expect(score.tracks[1].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[1].staves[0].bars.length).toEqual(2);
        expect(score.tracks[2].staves.length).toEqual(1);
        expect(score.tracks[2].name).toEqual('Very Long Name');
        expect(score.tracks[2].shortName).toEqual('shrt');
        expect(score.tracks[2].playbackInfo.primaryChannel).toEqual(4);
        expect(score.tracks[2].playbackInfo.secondaryChannel).toEqual(5);
        expect(score.tracks[2].staves[0].showTablature).toBe(true);
        expect(score.tracks[2].staves[0].showStandardNotation).toBe(true);
        expect(score.tracks[2].staves[0].bars.length).toEqual(2);
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
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(3);
        expect(score.masterBars.length).toEqual(1);
        {
            let track1: Track = score.tracks[0];
            expect(track1.name).toEqual('Piano');
            expect(track1.staves.length).toEqual(2);
            expect(track1.playbackInfo.program).toEqual(0);
            expect(track1.playbackInfo.primaryChannel).toEqual(0);
            expect(track1.playbackInfo.secondaryChannel).toEqual(1);
            {
                let staff1: Staff = track1.staves[0];
                expect(staff1.showTablature).toBe(false);
                expect(staff1.showStandardNotation).toBe(true);
                expect(staff1.tuning.length).toEqual(0);
                expect(staff1.bars.length).toEqual(1);
                expect(staff1.bars[0].clef).toEqual(Clef.G2);
            }
            {
                let staff2: Staff = track1.staves[1];
                expect(staff2.showTablature).toBe(false);
                expect(staff2.showStandardNotation).toBe(true);
                expect(staff2.tuning.length).toEqual(0);
                expect(staff2.bars.length).toEqual(1);
                expect(staff2.bars[0].clef).toEqual(Clef.F4);
            }
        }
        {
            let track2: Track = score.tracks[1];
            expect(track2.name).toEqual('Guitar');
            expect(track2.staves.length).toEqual(1);
            expect(track2.playbackInfo.program).toEqual(25);
            expect(track2.playbackInfo.primaryChannel).toEqual(2);
            expect(track2.playbackInfo.secondaryChannel).toEqual(3);
            {
                let staff1: Staff = track2.staves[0];
                expect(staff1.showTablature).toBe(true);
                expect(staff1.showStandardNotation).toBe(false);
                expect(staff1.tuning.length).toEqual(6);
                expect(staff1.bars.length).toEqual(1);
                expect(staff1.bars[0].clef).toEqual(Clef.G2);
            }
        }
        {
            let track3: Track = score.tracks[2];
            expect(track3.name).toEqual('Second Guitar');
            expect(track3.staves.length).toEqual(1);
            expect(track3.playbackInfo.program).toEqual(25);
            expect(track3.playbackInfo.primaryChannel).toEqual(4);
            expect(track3.playbackInfo.secondaryChannel).toEqual(5);
            {
                let staff1: Staff = track3.staves[0];
                expect(staff1.showTablature).toBe(true);
                expect(staff1.showStandardNotation).toBe(true);
                expect(staff1.tuning.length).toEqual(6);
                expect(staff1.bars.length).toEqual(1);
                expect(staff1.bars[0].clef).toEqual(Clef.G2);
            }
        }
    });

    it('multi-track-multi-staff-inconsistent-bars', () => {
        let tex: string = `
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
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(3);
        expect(score.masterBars.length).toEqual(3);
        {
            let track1: Track = score.tracks[0];
            expect(track1.name).toEqual('Piano');
            expect(track1.staves.length).toEqual(2);
            expect(track1.playbackInfo.program).toEqual(0);
            expect(track1.playbackInfo.primaryChannel).toEqual(0);
            expect(track1.playbackInfo.secondaryChannel).toEqual(1);
            {
                let staff1: Staff = track1.staves[0];
                expect(staff1.showTablature).toBe(false);
                expect(staff1.showStandardNotation).toBe(true);
                expect(staff1.tuning.length).toEqual(0);
                expect(staff1.bars.length).toEqual(3);
                expect(staff1.bars[0].isEmpty).toBe(false);
                expect(staff1.bars[1].isEmpty).toBe(true);
                expect(staff1.bars[2].isEmpty).toBe(true);
                expect(staff1.bars[0].clef).toEqual(Clef.G2);
            }
            {
                let staff2: Staff = track1.staves[1];
                expect(staff2.showTablature).toBe(false);
                expect(staff2.showStandardNotation).toBe(true);
                expect(staff2.tuning.length).toEqual(0);
                expect(staff2.bars.length).toEqual(3);
                expect(staff2.bars[0].isEmpty).toBe(false);
                expect(staff2.bars[1].isEmpty).toBe(false);
                expect(staff2.bars[2].isEmpty).toBe(false);
                expect(staff2.bars[0].clef).toEqual(Clef.F4);
            }
        }
        {
            let track2: Track = score.tracks[1];
            expect(track2.name).toEqual('Guitar');
            expect(track2.staves.length).toEqual(1);
            expect(track2.playbackInfo.program).toEqual(25);
            expect(track2.playbackInfo.primaryChannel).toEqual(2);
            expect(track2.playbackInfo.secondaryChannel).toEqual(3);
            {
                let staff1: Staff = track2.staves[0];
                expect(staff1.showTablature).toBe(true);
                expect(staff1.showStandardNotation).toBe(false);
                expect(staff1.tuning.length).toEqual(6);
                expect(staff1.bars.length).toEqual(3);
                expect(staff1.bars[0].isEmpty).toBe(false);
                expect(staff1.bars[1].isEmpty).toBe(false);
                expect(staff1.bars[2].isEmpty).toBe(true);
                expect(staff1.bars[0].clef).toEqual(Clef.G2);
            }
        }
        {
            let track3: Track = score.tracks[2];
            expect(track3.name).toEqual('Second Guitar');
            expect(track3.staves.length).toEqual(1);
            expect(track3.playbackInfo.program).toEqual(25);
            expect(track3.playbackInfo.primaryChannel).toEqual(4);
            expect(track3.playbackInfo.secondaryChannel).toEqual(5);
            {
                let staff1: Staff = track3.staves[0];
                expect(staff1.showTablature).toBe(true);
                expect(staff1.showStandardNotation).toBe(true);
                expect(staff1.tuning.length).toEqual(6);
                expect(staff1.bars.length).toEqual(3);
                expect(staff1.bars[0].isEmpty).toBe(false);
                expect(staff1.bars[1].isEmpty).toBe(true);
                expect(staff1.bars[2].isEmpty).toBe(true);
                expect(staff1.bars[0].clef).toEqual(Clef.G2);
            }
        }
    });

    it('slides', () => {
        let tex: string = '3.3{sl} 4.3 | 3.3{ss} 4.3 | 3.3{sib} 3.3{sia} 3.3{sou} 3.3{sod} | 3.3{psd} 3.3{psu}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(4);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].slideOutType).toEqual(SlideOutType.Legato);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].slideTarget!.id).toEqual(
            score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].id
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].slideOutType).toEqual(SlideOutType.Shift);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].slideTarget!.id).toEqual(
            score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].id
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].slideInType).toEqual(
            SlideInType.IntoFromBelow
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].notes[0].slideInType).toEqual(
            SlideInType.IntoFromAbove
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].notes[0].slideOutType).toEqual(SlideOutType.OutUp);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].notes[0].slideOutType).toEqual(
            SlideOutType.OutDown
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideUp
        );
    });

    it('section', () => {
        let tex: string = '\\section Intro 1.1 | 1.1 | \\section "Chorus 01" 1.1 | \\section S Solo';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).toEqual(1);
        expect(score.masterBars.length).toEqual(4);
        expect(score.masterBars[0].isSectionStart).toBe(true);
        expect(score.masterBars[0].section!.text).toEqual('Intro');
        expect(score.masterBars[0].section!.marker).toEqual('');
        expect(score.masterBars[1].isSectionStart).toBe(false);
        expect(score.masterBars[2].isSectionStart).toBe(true);
        expect(score.masterBars[2].section!.text).toEqual('Chorus 01');
        expect(score.masterBars[2].section!.marker).toEqual('');
        expect(score.masterBars[3].isSectionStart).toBe(true);
        expect(score.masterBars[3].section!.text).toEqual('Solo');
        expect(score.masterBars[3].section!.marker).toEqual('S');
    });

    it('pop-slap-tap', () => {
        let tex: string = '3.3{p} 3.3{s} 3.3{tt} r';
        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].pop).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].slap).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tap).toBe(true);
    });

    it('triplet-feel-numeric', () => {
        let tex: string = '\\tf 0 | \\tf 1 | \\tf 2 | \\tf 3 | \\tf 4 | \\tf 5 | \\tf 6';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).toEqual(TripletFeel.NoTripletFeel);
        expect(score.masterBars[1].tripletFeel).toEqual(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).toEqual(TripletFeel.Triplet8th);
        expect(score.masterBars[3].tripletFeel).toEqual(TripletFeel.Dotted16th);
        expect(score.masterBars[4].tripletFeel).toEqual(TripletFeel.Dotted8th);
        expect(score.masterBars[5].tripletFeel).toEqual(TripletFeel.Scottish16th);
        expect(score.masterBars[6].tripletFeel).toEqual(TripletFeel.Scottish8th);
    });

    it('triplet-feel-long-names', () => {
        let tex: string =
            '\\tf none | \\tf triplet-16th | \\tf triplet-8th | \\tf dotted-16th | \\tf dotted-8th | \\tf scottish-16th | \\tf scottish-8th';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).toEqual(TripletFeel.NoTripletFeel);
        expect(score.masterBars[1].tripletFeel).toEqual(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).toEqual(TripletFeel.Triplet8th);
        expect(score.masterBars[3].tripletFeel).toEqual(TripletFeel.Dotted16th);
        expect(score.masterBars[4].tripletFeel).toEqual(TripletFeel.Dotted8th);
        expect(score.masterBars[5].tripletFeel).toEqual(TripletFeel.Scottish16th);
        expect(score.masterBars[6].tripletFeel).toEqual(TripletFeel.Scottish8th);
    });

    it('triplet-feel-short-names', () => {
        let tex: string = '\\tf no | \\tf t16 | \\tf t8 | \\tf d16 | \\tf d8 | \\tf s16 | \\tf s8';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).toEqual(TripletFeel.NoTripletFeel);
        expect(score.masterBars[1].tripletFeel).toEqual(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).toEqual(TripletFeel.Triplet8th);
        expect(score.masterBars[3].tripletFeel).toEqual(TripletFeel.Dotted16th);
        expect(score.masterBars[4].tripletFeel).toEqual(TripletFeel.Dotted8th);
        expect(score.masterBars[5].tripletFeel).toEqual(TripletFeel.Scottish16th);
        expect(score.masterBars[6].tripletFeel).toEqual(TripletFeel.Scottish8th);
    });

    it('triplet-feel-multi-bar', () => {
        let tex: string = '\\tf t16 | | | \\tf t8 | | | \\tf no | | ';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).toEqual(TripletFeel.Triplet16th);
        expect(score.masterBars[1].tripletFeel).toEqual(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).toEqual(TripletFeel.Triplet16th);
        expect(score.masterBars[3].tripletFeel).toEqual(TripletFeel.Triplet8th);
        expect(score.masterBars[4].tripletFeel).toEqual(TripletFeel.Triplet8th);
        expect(score.masterBars[5].tripletFeel).toEqual(TripletFeel.Triplet8th);
        expect(score.masterBars[6].tripletFeel).toEqual(TripletFeel.NoTripletFeel);
        expect(score.masterBars[7].tripletFeel).toEqual(TripletFeel.NoTripletFeel);
        expect(score.masterBars[8].tripletFeel).toEqual(TripletFeel.NoTripletFeel);
    });

    it('tuplet-repeat', () => {
        let tex: string = ':8 5.3{tu 3}*3';
        let score: Score = parseTex(tex);
        let durations: Duration[] = [Duration.Eighth, Duration.Eighth, Duration.Eighth];
        let tuplets = [3, 3, 3];
        let i: number = 0;
        let b: Beat | null = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        while (b) {
            expect(b.duration).toEqual(durations[i], `Duration on beat ${i} was wrong`);
            if (tuplets[i] === 1) {
                expect(b.hasTuplet).toBe(false);
            } else {
                expect(b.tupletNumerator).toEqual(tuplets[i], `Tuplet on beat ${i} was wrong`);
            }
            b = b.nextBeat;
            i++;
        }
        expect(i).toEqual(durations.length);
    });

    it('simple-anacrusis', () => {
        let tex: string = '\\ac 3.3 3.3 | 1.1 2.1 3.1 4.1';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].isAnacrusis).toBe(true);
        expect(score.masterBars[0].calculateDuration()).toEqual(1920);
        expect(score.masterBars[1].calculateDuration()).toEqual(3840);
    });

    it('multi-bar-anacrusis', () => {
        let tex: string = '\\ac 3.3 3.3 | \\ac 3.3 3.3 | 1.1 2.1 3.1 4.1';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].isAnacrusis).toBe(true);
        expect(score.masterBars[1].isAnacrusis).toBe(true);
        expect(score.masterBars[0].calculateDuration()).toEqual(1920);
        expect(score.masterBars[1].calculateDuration()).toEqual(1920);
        expect(score.masterBars[2].calculateDuration()).toEqual(3840);
    });

    it('random-anacrusis', () => {
        let tex: string = '\\ac 3.3 3.3 | 1.1 2.1 3.1 4.1 | \\ac 3.3 3.3 | 1.1 2.1 3.1 4.1';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].isAnacrusis).toBe(true);
        expect(score.masterBars[1].isAnacrusis).toBe(false);
        expect(score.masterBars[2].isAnacrusis).toBe(true);
        expect(score.masterBars[3].isAnacrusis).toBe(false);
        expect(score.masterBars[0].calculateDuration()).toEqual(1920);
        expect(score.masterBars[1].calculateDuration()).toEqual(3840);
        expect(score.masterBars[2].calculateDuration()).toEqual(1920);
        expect(score.masterBars[3].calculateDuration()).toEqual(3840);
    });

    it('repeat', () => {
        let tex: string =
            '\\ro 1.3 2.3 3.3 4.3 | 5.3 6.3 7.3 8.3 | \\rc 2 1.3 2.3 3.3 4.3 | \\ro \\rc 3 1.3 2.3 3.3 4.3 |';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].repeatCount).toEqual(0);
        expect(score.masterBars[1].repeatCount).toEqual(0);
        expect(score.masterBars[2].repeatCount).toEqual(2);
        expect(score.masterBars[3].repeatCount).toEqual(3);
    });

    it('default-transposition-on-instruments', () => {
        let tex: string = `
            \\track "Piano with Grand Staff" "pno."
                \\staff{score} \\tuning piano \\instrument acousticgrandpiano
                c4 d4 e4 f4 |
                \\staff{score} \\tuning piano \\clef F4
                c2 c2 c2 c2 |
            \\track Guitar
                \\staff{tabs} \\instrument acousticguitarsteel \\capo 5
                1.2 3.2 0.1 1.1
        `;
        let score: Score = parseTex(tex);

        expect(score.tracks[0].staves[0].transpositionPitch).toEqual(0);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).toEqual(0);
        expect(score.tracks[0].staves[1].transpositionPitch).toEqual(0);
        expect(score.tracks[0].staves[1].displayTranspositionPitch).toEqual(0);
        expect(score.tracks[1].staves[0].transpositionPitch).toEqual(0);
        expect(score.tracks[1].staves[0].displayTranspositionPitch).toEqual(-12);
    });

    it('dynamics', () => {
        let tex: string = '1.1.8{dy ppp} 1.1{dy pp} 1.1{dy p} 1.1{dy mp} 1.1{dy mf} 1.1{dy f} 1.1{dy ff} 1.1{dy fff}';
        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).toEqual(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).toEqual(DynamicValue.PP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].dynamics).toEqual(DynamicValue.P);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].dynamics).toEqual(DynamicValue.MP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].dynamics).toEqual(DynamicValue.MF);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[5].dynamics).toEqual(DynamicValue.F);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[6].dynamics).toEqual(DynamicValue.FF);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[7].dynamics).toEqual(DynamicValue.FFF);
    });

    it('dynamics-auto', () => {
        let tex: string = '1.1.4{dy ppp} 1.1 1.1{dy mp} 1.1';
        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).toEqual(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).toEqual(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].dynamics).toEqual(DynamicValue.MP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].dynamics).toEqual(DynamicValue.MP);
    });

    it('dynamics-auto-reset-on-track', () => {
        let tex: string = '1.1.4{dy ppp} 1.1 \\track "Second" 1.1.4';
        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).toEqual(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).toEqual(DynamicValue.PPP);
        expect(score.tracks[1].staves[0].bars[0].voices[0].beats[0].dynamics).toEqual(DynamicValue.F);
    });

    it('dynamics-auto-reset-on-staff', () => {
        let tex: string = '1.1.4{dy ppp} 1.1 \\staff 1.1.4';
        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).toEqual(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).toEqual(DynamicValue.PPP);
        expect(score.tracks[0].staves[1].bars[0].voices[0].beats[0].dynamics).toEqual(DynamicValue.F);
    });

    it('crescendo', () => {
        let tex: string = '1.1.4{dec} 1.1{dec} 1.1{cre} 1.1{cre}';
        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].crescendo).toEqual(CrescendoType.Decrescendo);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].crescendo).toEqual(CrescendoType.Decrescendo);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].crescendo).toEqual(CrescendoType.Crescendo);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].crescendo).toEqual(CrescendoType.Crescendo);
    });

    it('left-hand-tapping', () => {
        let tex: string = ':4 1.1{lht} 1.1 1.1{lht} 1.1';
        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isLeftHandTapped).toEqual(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isLeftHandTapped).toEqual(false);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].isLeftHandTapped).toEqual(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].isLeftHandTapped).toEqual(false);
    });

    it('expect-invalid-format-xml', () => {
        try {
            parseTex('<xml>');
            fail('Expected error');
        } catch(e) {
            if(!(e instanceof UnsupportedFormatError)) {
                fail(`Expected UnsupportedFormatError got ${e}`);
            }
        }
    });
    
    it('expect-invalid-format-other-text', () => {
        try {
            parseTex('This is not an alphaTex file');
            fail('Expected error');
        } catch(e) {
            if(!(e instanceof UnsupportedFormatError)) {
                fail(`Expected UnsupportedFormatError got ${e}`);
            }
        }
    });

    it('auto-detect-tuning-from-instrument', () => {
        let score = parseTex('\\instrument acousticguitarsteel . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).toEqual(6);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).toEqual(-12);

        score = parseTex('\\instrument acousticbass . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).toEqual(4);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).toEqual(-12);

        score = parseTex('\\instrument violin . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).toEqual(4);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).toEqual(0);

        score = parseTex('\\instrument acousticpiano . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).toEqual(0);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).toEqual(0);
    });
});
