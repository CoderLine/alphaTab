import { StaveProfile } from '@src/StaveProfile';
import { AlphaTexError, AlphaTexImporter, AlphaTexSymbols } from '@src/importer/AlphaTexImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { Beat } from '@src/model/Beat';
import { BrushType } from '@src/model/BrushType';
import { Clef } from '@src/model/Clef';
import { CrescendoType } from '@src/model/CrescendoType';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { Fingers } from '@src/model/Fingers';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { KeySignature } from '@src/model';
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
import { assert, expect } from 'chai';

describe('AlphaTexImporterTest', () => {
    function parseTex(tex: string): Score {
        let importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        return importer.readScore();
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

        let score: Score = parseTex(tex);
        expect(score.title).to.equal('Test');
        expect(score.words).to.equal('test');
        expect(score.music).to.equal('alphaTab');
        expect(score.copyright).to.equal('test');
        expect(score.tempo).to.equal(200);
        expect(score.tracks.length).to.equal(1);
        expect(score.tracks[0].playbackInfo.program).to.equal(30);
        expect(score.tracks[0].staves[0].capo).to.equal(2);
        expect(score.tracks[0].staves[0].tuning.join(',')).to.equal('55,38,43,47,50,69');
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(3);
        {
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).to.equal(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].duration).to.equal(Duration.Half);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(0);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].string).to.equal(2);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes.length).to.equal(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].duration).to.equal(Duration.Quarter);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].fret).to.equal(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].string).to.equal(2);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes.length).to.equal(1);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].duration).to.equal(Duration.Quarter);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].fret).to.equal(3);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].string).to.equal(3);
        }
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).to.equal(5);
        {
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes.length).to.equal(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].duration).to.equal(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].fret).to.equal(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].string).to.equal(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes.length).to.equal(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].duration).to.equal(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].fret).to.equal(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].string).to.equal(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes.length).to.equal(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].duration).to.equal(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].fret).to.equal(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].string).to.equal(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes.length).to.equal(1);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].duration).to.equal(Duration.Eighth);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].fret).to.equal(5);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].string).to.equal(4);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].notes.length).to.equal(0);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].duration).to.equal(Duration.Half);
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].isRest).to.equal(true);
        }
    });

    it('tuning', () => {
        const tex = `\\tuning E4 B3 G3 D3 A2 E2
        .
        0.5.1`;

        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].tuning.join(',')).to.equal(Tuning.getDefaultTuningFor(6)!.tunings.join(','));
    });

    it('dead-notes1-issue79', () => {
        let tex: string = ':4 x.3';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isDead).to.equal(true);
    });

    it('dead-notes2-issue79', () => {
        let tex: string = ':4 3.3{x}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isDead).to.equal(true);
    });

    it('trill-issue79', () => {
        let tex: string = ':4 3.3{tr 5 16}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isTrill).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillSpeed).to.equal(Duration.Sixteenth);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillFret).to.equal(5);
    });

    it('tremolo-issue79', () => {
        let tex: string = ':4 3.3{tr 5 16}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isTrill).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillSpeed).to.equal(Duration.Sixteenth);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].trillFret).to.equal(5);
    });

    it('tremolo-picking-issue79', () => {
        let tex: string = ':4 3.3{tp 16}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].isTremolo).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].tremoloSpeed).to.equal(Duration.Sixteenth);
    });

    it('brushes-arpeggio', () => {
        let tex: string = `
            (1.1 2.2 3.3 4.4).4{bd 60} (1.1 2.2 3.3 4.4).8{bu 60} (1.1 2.2 3.3 4.4).2{ad 60} (1.1 2.2 3.3 4.4).16{au 60} r |
            (1.1 2.2 3.3 4.4).4{bd 120} (1.1 2.2 3.3 4.4).8{bu 120} (1.1 2.2 3.3 4.4).2{ad 120} (1.1 2.2 3.3 4.4).16{au 120} r |
            (1.1 2.2 3.3 4.4).4{bd} (1.1 2.2 3.3 4.4).8{bu} (1.1 2.2 3.3 4.4).2{ad} (1.1 2.2 3.3 4.4).16{au} r
        `;
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].brushType).to.equal(BrushType.BrushDown);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].playbackDuration).to.equal(960);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].brushDuration).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].brushType).to.equal(BrushType.BrushUp);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].playbackDuration).to.equal(480);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].brushDuration).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].brushType).to.equal(BrushType.ArpeggioDown);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].playbackDuration).to.equal(1920);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].brushDuration).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].brushType).to.equal(BrushType.ArpeggioUp);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].playbackDuration).to.equal(240);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].brushDuration).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].isRest).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].brushType).to.equal(BrushType.None);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].playbackDuration).to.equal(240);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].brushDuration).to.equal(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].brushType).to.equal(BrushType.BrushDown);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].brushDuration).to.equal(120);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].brushType).to.equal(BrushType.BrushUp);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].brushDuration).to.equal(120);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].brushType).to.equal(BrushType.ArpeggioDown);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].brushDuration).to.equal(120);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].brushType).to.equal(BrushType.ArpeggioUp);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].brushDuration).to.equal(120);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].isRest).to.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].brushType).to.equal(BrushType.None);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].brushDuration).to.equal(0);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].brushType).to.equal(BrushType.BrushDown);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].brushDuration).to.equal(60);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].brushType).to.equal(BrushType.BrushUp);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].brushDuration).to.equal(30);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].brushType).to.equal(BrushType.ArpeggioDown);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].brushDuration).to.equal(480);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].brushType).to.equal(BrushType.ArpeggioUp);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].brushDuration).to.equal(60);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[4].isRest).to.equal(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[4].brushType).to.equal(BrushType.None);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[4].brushDuration).to.equal(0);

    });

    it('hamonics-issue79', () => {
        let tex: string = ':8 3.3{nh} 3.3{ah} 3.3{th} 3.3{ph} 3.3{sh}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].harmonicType).to.equal(
            HarmonicType.Natural
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].harmonicType).to.equal(
            HarmonicType.Artificial
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].harmonicType).to.equal(HarmonicType.Tap);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].harmonicType).to.equal(HarmonicType.Pinch);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].harmonicType).to.equal(HarmonicType.Semi);
    });

    it('hamonics-rendering-text-issue79', () => {
        let tex: string = ':8 3.3{nh} 3.3{ah} 3.3{th} 3.3{ph} 3.3{sh}';
        let score: Score = parseTex(tex);
        let settings: Settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = false;
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
        ).to.be.ok;
        expect(
            new RegExp(
                regexTemplate.replace('{0}', HarmonicsEffectInfo.harmonicToString(HarmonicType.Artificial))
            ).exec(svg)
        ).to.be.ok;
        expect(
            new RegExp(regexTemplate.replace('{0}', HarmonicsEffectInfo.harmonicToString(HarmonicType.Tap))).exec(svg)
        ).to.be.ok;
        expect(
            new RegExp(regexTemplate.replace('{0}', HarmonicsEffectInfo.harmonicToString(HarmonicType.Pinch))).exec(svg)
        ).to.be.ok;
        expect(
            new RegExp(regexTemplate.replace('{0}', HarmonicsEffectInfo.harmonicToString(HarmonicType.Semi))).exec(svg)
        ).to.be.ok;
    });

    it('grace-issue79', () => {
        let tex: string = ':8 3.3{gr} 3.3{gr ob}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].graceType).to.equal(GraceType.BeforeBeat);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].graceType).to.equal(GraceType.OnBeat);
    });

    it('left-hand-finger-single-note', () => {
        let tex: string = ':8 3.3{lf 1} 3.3{lf 2} 3.3{lf 3} 3.3{lf 4} 3.3{lf 5}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].leftHandFinger).to.equal(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].leftHandFinger).to.equal(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].leftHandFinger).to.equal(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].leftHandFinger).to.equal(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].leftHandFinger).to.equal(
            Fingers.LittleFinger
        );
    });

    it('right-hand-finger-single-note', () => {
        let tex: string = ':8 3.3{rf 1} 3.3{rf 2} 3.3{rf 3} 3.3{rf 4} 3.3{rf 5}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].rightHandFinger).to.equal(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].rightHandFinger).to.equal(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].rightHandFinger).to.equal(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].rightHandFinger).to.equal(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].rightHandFinger).to.equal(
            Fingers.LittleFinger
        );
    });

    it('left-hand-finger-chord', () => {
        let tex: string = ':8 (3.1{lf 1} 3.2{lf 2} 3.3{lf 3} 3.4{lf 4} 3.5{lf 5})';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].leftHandFinger).to.equal(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[1].leftHandFinger).to.equal(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[2].leftHandFinger).to.equal(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[3].leftHandFinger).to.equal(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[4].leftHandFinger).to.equal(
            Fingers.LittleFinger
        );
    });

    it('right-hand-finger-chord', () => {
        let tex: string = ':8 (3.1{rf 1} 3.2{rf 2} 3.3{rf 3} 3.4{rf 4} 3.5{rf 5})';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).to.equal(5);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].rightHandFinger).to.equal(Fingers.Thumb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[1].rightHandFinger).to.equal(
            Fingers.IndexFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[2].rightHandFinger).to.equal(
            Fingers.MiddleFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[3].rightHandFinger).to.equal(
            Fingers.AnnularFinger
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[4].rightHandFinger).to.equal(
            Fingers.LittleFinger
        );
    });

    it('unstringed', () => {
        let tex: string = '\\tuning piano . c4 c#4 d4 d#4 | c4 db4 d4 eb4';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(4);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].realValue).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].realValue).to.equal(61);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].realValue).to.equal(62);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].realValue).to.equal(63);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).to.equal(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].realValue).to.equal(60);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].realValue).to.equal(61);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].realValue).to.equal(62);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].isPiano).to.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].realValue).to.equal(63);
    });

    it('multi-staff-default-settings', () => {
        let tex: string = '1.1 | 1.1 | \\staff 2.1 | 2.1';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves.length).to.equal(2);
        expect(score.tracks[0].staves[0].showTablature).to.be.equal(true);
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
        expect(score.tracks[0].staves[1].showTablature).to.be.equal(true); // default settings used

        expect(score.tracks[0].staves[1].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[1].bars.length).to.equal(2);
    });

    it('multi-staff-default-settings-braces', () => {
        let tex: string = '1.1 | 1.1 | \\staff{} 2.1 | 2.1';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves.length).to.equal(2);
        expect(score.tracks[0].staves[0].showTablature).to.be.equal(true);
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
        expect(score.tracks[0].staves[1].showTablature).to.be.equal(true); // default settings used

        expect(score.tracks[0].staves[1].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[1].bars.length).to.equal(2);
    });

    it('single-staff-with-setting', () => {
        let tex: string = '\\staff{score} 1.1 | 1.1';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves.length).to.equal(1);
        expect(score.tracks[0].staves[0].showTablature).to.be.equal(false);
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
    });

    it('multi-staff-with-settings', () => {
        const tex = `\\staff{score} 1.1 | 1.1 |
        \\staff{tabs} \\capo 2 2.1 | 2.1 |
        \\staff{score tabs} \\tuning A1 D2 A2 D3 G3 B3 E4 3.1 | 3.1`;
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves.length).to.equal(3);
        expect(score.tracks[0].staves[0].showTablature).to.be.equal(false);
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
        expect(score.tracks[0].staves[1].showTablature).to.be.equal(true);
        expect(score.tracks[0].staves[1].showStandardNotation).to.be.equal(false);
        expect(score.tracks[0].staves[1].bars.length).to.equal(2);
        expect(score.tracks[0].staves[1].capo).to.equal(2);
        expect(score.tracks[0].staves[2].showTablature).to.be.equal(true);
        expect(score.tracks[0].staves[2].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[2].bars.length).to.equal(2);
        expect(score.tracks[0].staves[2].tuning.length).to.equal(7);
    });

    it('multi-track', () => {
        let tex: string = '\\track "First" 1.1 | 1.1 | \\track "Second" 2.2 | 2.2';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(2);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves.length).to.equal(1);
        expect(score.tracks[0].name).to.equal('First');
        expect(score.tracks[0].playbackInfo.primaryChannel).to.equal(0);
        expect(score.tracks[0].playbackInfo.secondaryChannel).to.equal(1);
        expect(score.tracks[0].staves[0].showTablature).to.be.equal(true);
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
        expect(score.tracks[1].staves.length).to.equal(1);
        expect(score.tracks[1].name).to.equal('Second');
        expect(score.tracks[1].playbackInfo.primaryChannel).to.equal(2);
        expect(score.tracks[1].playbackInfo.secondaryChannel).to.equal(3);
        expect(score.tracks[1].staves[0].showTablature).to.be.equal(true);
        expect(score.tracks[1].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[1].staves[0].bars.length).to.equal(2);
    });

    it('multi-track-names', () => {
        let tex: string =
            '\\track 1.1 | 1.1 | \\track "Only Long Name" 2.2 | 2.2 | \\track "Very Long Name" "shrt" 3.3 | 3.3 ';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(3);
        expect(score.masterBars.length).to.equal(2);
        expect(score.tracks[0].staves.length).to.equal(1);
        expect(score.tracks[0].name).to.equal('');
        expect(score.tracks[0].shortName).to.equal('');
        expect(score.tracks[0].playbackInfo.primaryChannel).to.equal(0);
        expect(score.tracks[0].playbackInfo.secondaryChannel).to.equal(1);
        expect(score.tracks[0].staves[0].showTablature).to.be.equal(true);
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars.length).to.equal(2);
        expect(score.tracks[1].staves.length).to.equal(1);
        expect(score.tracks[1].name).to.equal('Only Long Name');
        expect(score.tracks[1].shortName).to.equal('Only Long ');
        expect(score.tracks[1].playbackInfo.primaryChannel).to.equal(2);
        expect(score.tracks[1].playbackInfo.secondaryChannel).to.equal(3);
        expect(score.tracks[1].staves[0].showTablature).to.be.equal(true);
        expect(score.tracks[1].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[1].staves[0].bars.length).to.equal(2);
        expect(score.tracks[2].staves.length).to.equal(1);
        expect(score.tracks[2].name).to.equal('Very Long Name');
        expect(score.tracks[2].shortName).to.equal('shrt');
        expect(score.tracks[2].playbackInfo.primaryChannel).to.equal(4);
        expect(score.tracks[2].playbackInfo.secondaryChannel).to.equal(5);
        expect(score.tracks[2].staves[0].showTablature).to.be.equal(true);
        expect(score.tracks[2].staves[0].showStandardNotation).to.be.equal(true);
        expect(score.tracks[2].staves[0].bars.length).to.equal(2);
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
        expect(score.tracks.length).to.equal(3);
        expect(score.masterBars.length).to.equal(1);
        {
            let track1: Track = score.tracks[0];
            expect(track1.name).to.equal('Piano');
            expect(track1.staves.length).to.equal(2);
            expect(track1.playbackInfo.program).to.equal(0);
            expect(track1.playbackInfo.primaryChannel).to.equal(0);
            expect(track1.playbackInfo.secondaryChannel).to.equal(1);
            {
                let staff1: Staff = track1.staves[0];
                expect(staff1.showTablature).to.be.equal(false);
                expect(staff1.showStandardNotation).to.be.equal(true);
                expect(staff1.tuning.length).to.equal(0);
                expect(staff1.bars.length).to.equal(1);
                expect(staff1.bars[0].clef).to.equal(Clef.G2);
            }
            {
                let staff2: Staff = track1.staves[1];
                expect(staff2.showTablature).to.be.equal(false);
                expect(staff2.showStandardNotation).to.be.equal(true);
                expect(staff2.tuning.length).to.equal(0);
                expect(staff2.bars.length).to.equal(1);
                expect(staff2.bars[0].clef).to.equal(Clef.F4);
            }
        }
        {
            let track2: Track = score.tracks[1];
            expect(track2.name).to.equal('Guitar');
            expect(track2.staves.length).to.equal(1);
            expect(track2.playbackInfo.program).to.equal(25);
            expect(track2.playbackInfo.primaryChannel).to.equal(2);
            expect(track2.playbackInfo.secondaryChannel).to.equal(3);
            {
                let staff1: Staff = track2.staves[0];
                expect(staff1.showTablature).to.be.equal(true);
                expect(staff1.showStandardNotation).to.be.equal(false);
                expect(staff1.tuning.length).to.equal(6);
                expect(staff1.bars.length).to.equal(1);
                expect(staff1.bars[0].clef).to.equal(Clef.G2);
            }
        }
        {
            let track3: Track = score.tracks[2];
            expect(track3.name).to.equal('Second Guitar');
            expect(track3.staves.length).to.equal(1);
            expect(track3.playbackInfo.program).to.equal(25);
            expect(track3.playbackInfo.primaryChannel).to.equal(4);
            expect(track3.playbackInfo.secondaryChannel).to.equal(5);
            {
                let staff1: Staff = track3.staves[0];
                expect(staff1.showTablature).to.be.equal(true);
                expect(staff1.showStandardNotation).to.be.equal(true);
                expect(staff1.tuning.length).to.equal(6);
                expect(staff1.bars.length).to.equal(1);
                expect(staff1.bars[0].clef).to.equal(Clef.G2);
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
        expect(score.tracks.length).to.equal(3);
        expect(score.masterBars.length).to.equal(3);
        {
            let track1: Track = score.tracks[0];
            expect(track1.name).to.equal('Piano');
            expect(track1.staves.length).to.equal(2);
            expect(track1.playbackInfo.program).to.equal(0);
            expect(track1.playbackInfo.primaryChannel).to.equal(0);
            expect(track1.playbackInfo.secondaryChannel).to.equal(1);
            {
                let staff1: Staff = track1.staves[0];
                expect(staff1.showTablature).to.be.equal(false);
                expect(staff1.showStandardNotation).to.be.equal(true);
                expect(staff1.tuning.length).to.equal(0);
                expect(staff1.bars.length).to.equal(3);
                expect(staff1.bars[0].isEmpty).to.be.equal(false);
                expect(staff1.bars[1].isEmpty).to.be.equal(true);
                expect(staff1.bars[2].isEmpty).to.be.equal(true);
                expect(staff1.bars[0].clef).to.equal(Clef.G2);
            }
            {
                let staff2: Staff = track1.staves[1];
                expect(staff2.showTablature).to.be.equal(false);
                expect(staff2.showStandardNotation).to.be.equal(true);
                expect(staff2.tuning.length).to.equal(0);
                expect(staff2.bars.length).to.equal(3);
                expect(staff2.bars[0].isEmpty).to.be.equal(false);
                expect(staff2.bars[1].isEmpty).to.be.equal(false);
                expect(staff2.bars[2].isEmpty).to.be.equal(false);
                expect(staff2.bars[0].clef).to.equal(Clef.F4);
            }
        }
        {
            let track2: Track = score.tracks[1];
            expect(track2.name).to.equal('Guitar');
            expect(track2.staves.length).to.equal(1);
            expect(track2.playbackInfo.program).to.equal(25);
            expect(track2.playbackInfo.primaryChannel).to.equal(2);
            expect(track2.playbackInfo.secondaryChannel).to.equal(3);
            {
                let staff1: Staff = track2.staves[0];
                expect(staff1.showTablature).to.be.equal(true);
                expect(staff1.showStandardNotation).to.be.equal(false);
                expect(staff1.tuning.length).to.equal(6);
                expect(staff1.bars.length).to.equal(3);
                expect(staff1.bars[0].isEmpty).to.be.equal(false);
                expect(staff1.bars[1].isEmpty).to.be.equal(false);
                expect(staff1.bars[2].isEmpty).to.be.equal(true);
                expect(staff1.bars[0].clef).to.equal(Clef.G2);
            }
        }
        {
            let track3: Track = score.tracks[2];
            expect(track3.name).to.equal('Second Guitar');
            expect(track3.staves.length).to.equal(1);
            expect(track3.playbackInfo.program).to.equal(25);
            expect(track3.playbackInfo.primaryChannel).to.equal(4);
            expect(track3.playbackInfo.secondaryChannel).to.equal(5);
            {
                let staff1: Staff = track3.staves[0];
                expect(staff1.showTablature).to.be.equal(true);
                expect(staff1.showStandardNotation).to.be.equal(true);
                expect(staff1.tuning.length).to.equal(6);
                expect(staff1.bars.length).to.equal(3);
                expect(staff1.bars[0].isEmpty).to.be.equal(false);
                expect(staff1.bars[1].isEmpty).to.be.equal(true);
                expect(staff1.bars[2].isEmpty).to.be.equal(true);
                expect(staff1.bars[0].clef).to.equal(Clef.G2);
            }
        }
    });

    it('slides', () => {
        let tex: string = '3.3{sl} 4.3 | 3.3{ss} 4.3 | 3.3{sib} 3.3{sia} 3.3{sou} 3.3{sod} | 3.3{psd} 3.3{psu}';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(4);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].slideOutType).to.equal(SlideOutType.Legato);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].slideTarget!.id).to.equal(
            score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].id
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].slideOutType).to.equal(SlideOutType.Shift);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].slideTarget!.id).to.equal(
            score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].id
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].slideInType).to.equal(
            SlideInType.IntoFromBelow
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].notes[0].slideInType).to.equal(
            SlideInType.IntoFromAbove
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].notes[0].slideOutType).to.equal(SlideOutType.OutUp);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].notes[0].slideOutType).to.equal(
            SlideOutType.OutDown
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideUp
        );
    });

    it('section', () => {
        let tex: string = '\\section Intro 1.1 | 1.1 | \\section "Chorus 01" 1.1 | \\section S Solo';
        let score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(4);
        expect(score.masterBars[0].isSectionStart).to.be.equal(true);
        expect(score.masterBars[0].section!.text).to.equal('Intro');
        expect(score.masterBars[0].section!.marker).to.equal('');
        expect(score.masterBars[1].isSectionStart).to.be.equal(false);
        expect(score.masterBars[2].isSectionStart).to.be.equal(true);
        expect(score.masterBars[2].section!.text).to.equal('Chorus 01');
        expect(score.masterBars[2].section!.marker).to.equal('');
        expect(score.masterBars[3].isSectionStart).to.be.equal(true);
        expect(score.masterBars[3].section!.text).to.equal('Solo');
        expect(score.masterBars[3].section!.marker).to.equal('S');
    });

    it('key-signature', () => {
        let tex: string = `:1 3.3 | \\ks C 3.3 | \\ks Cmajor 3.3 | \\ks Aminor 3.3 |
        \\ks F 3.3 | \\ks bbmajor 3.3 | \\ks CMINOR 3.3 | \\ks aB 3.3 | \\ks db 3.3 | \\ks d#minor 3.3 |
        \\ks g 3.3 | \\ks Dmajor 3.3 | \\ks f#minor 3.3 | \\ks E 3.3 | \\ks Bmajor 3.3 | \\ks Ebminor 3.3`;
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].keySignature).to.equal(KeySignature.C)
        expect(score.masterBars[1].keySignature).to.equal(KeySignature.C)
        expect(score.masterBars[2].keySignature).to.equal(KeySignature.C)
        expect(score.masterBars[3].keySignature).to.equal(KeySignature.C)
        expect(score.masterBars[4].keySignature).to.equal(KeySignature.F)
        expect(score.masterBars[5].keySignature).to.equal(KeySignature.Bb)
        expect(score.masterBars[6].keySignature).to.equal(KeySignature.Eb)
        expect(score.masterBars[7].keySignature).to.equal(KeySignature.Ab)
        expect(score.masterBars[8].keySignature).to.equal(KeySignature.Db)
        expect(score.masterBars[9].keySignature).to.equal(KeySignature.Gb)
        expect(score.masterBars[10].keySignature).to.equal(KeySignature.G)
        expect(score.masterBars[11].keySignature).to.equal(KeySignature.D)
        expect(score.masterBars[12].keySignature).to.equal(KeySignature.A)
        expect(score.masterBars[13].keySignature).to.equal(KeySignature.E)
        expect(score.masterBars[14].keySignature).to.equal(KeySignature.B)
        expect(score.masterBars[15].keySignature).to.equal(KeySignature.FSharp)
    });

    it('pop-slap-tap', () => {
        let tex: string = '3.3{p} 3.3{s} 3.3{tt} r';
        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].pop).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].slap).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tap).to.be.equal(true);
    });

    it('triplet-feel-numeric', () => {
        let tex: string = '\\tf 0 | \\tf 1 | \\tf 2 | \\tf 3 | \\tf 4 | \\tf 5 | \\tf 6';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).to.equal(TripletFeel.NoTripletFeel);
        expect(score.masterBars[1].tripletFeel).to.equal(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).to.equal(TripletFeel.Triplet8th);
        expect(score.masterBars[3].tripletFeel).to.equal(TripletFeel.Dotted16th);
        expect(score.masterBars[4].tripletFeel).to.equal(TripletFeel.Dotted8th);
        expect(score.masterBars[5].tripletFeel).to.equal(TripletFeel.Scottish16th);
        expect(score.masterBars[6].tripletFeel).to.equal(TripletFeel.Scottish8th);
    });

    it('triplet-feel-long-names', () => {
        let tex: string =
            '\\tf none | \\tf triplet-16th | \\tf triplet-8th | \\tf dotted-16th | \\tf dotted-8th | \\tf scottish-16th | \\tf scottish-8th';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).to.equal(TripletFeel.NoTripletFeel);
        expect(score.masterBars[1].tripletFeel).to.equal(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).to.equal(TripletFeel.Triplet8th);
        expect(score.masterBars[3].tripletFeel).to.equal(TripletFeel.Dotted16th);
        expect(score.masterBars[4].tripletFeel).to.equal(TripletFeel.Dotted8th);
        expect(score.masterBars[5].tripletFeel).to.equal(TripletFeel.Scottish16th);
        expect(score.masterBars[6].tripletFeel).to.equal(TripletFeel.Scottish8th);
    });

    it('triplet-feel-short-names', () => {
        let tex: string = '\\tf no | \\tf t16 | \\tf t8 | \\tf d16 | \\tf d8 | \\tf s16 | \\tf s8';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).to.equal(TripletFeel.NoTripletFeel);
        expect(score.masterBars[1].tripletFeel).to.equal(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).to.equal(TripletFeel.Triplet8th);
        expect(score.masterBars[3].tripletFeel).to.equal(TripletFeel.Dotted16th);
        expect(score.masterBars[4].tripletFeel).to.equal(TripletFeel.Dotted8th);
        expect(score.masterBars[5].tripletFeel).to.equal(TripletFeel.Scottish16th);
        expect(score.masterBars[6].tripletFeel).to.equal(TripletFeel.Scottish8th);
    });

    it('triplet-feel-multi-bar', () => {
        let tex: string = '\\tf t16 | | | \\tf t8 | | | \\tf no | | ';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].tripletFeel).to.equal(TripletFeel.Triplet16th);
        expect(score.masterBars[1].tripletFeel).to.equal(TripletFeel.Triplet16th);
        expect(score.masterBars[2].tripletFeel).to.equal(TripletFeel.Triplet16th);
        expect(score.masterBars[3].tripletFeel).to.equal(TripletFeel.Triplet8th);
        expect(score.masterBars[4].tripletFeel).to.equal(TripletFeel.Triplet8th);
        expect(score.masterBars[5].tripletFeel).to.equal(TripletFeel.Triplet8th);
        expect(score.masterBars[6].tripletFeel).to.equal(TripletFeel.NoTripletFeel);
        expect(score.masterBars[7].tripletFeel).to.equal(TripletFeel.NoTripletFeel);
        expect(score.masterBars[8].tripletFeel).to.equal(TripletFeel.NoTripletFeel);
    });

    it('tuplet-repeat', () => {
        let tex: string = ':8 5.3{tu 3}*3';
        let score: Score = parseTex(tex);
        let durations: Duration[] = [Duration.Eighth, Duration.Eighth, Duration.Eighth];
        let tuplets = [3, 3, 3];
        let i: number = 0;
        let b: Beat | null = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        while (b) {
            expect(b.duration).to.equal(durations[i], `Duration on beat ${i} was wrong`);
            if (tuplets[i] === 1) {
                expect(b.hasTuplet).to.be.equal(false);
            } else {
                expect(b.tupletNumerator).to.equal(tuplets[i], `Tuplet on beat ${i} was wrong`);
            }
            b = b.nextBeat;
            i++;
        }
        expect(i).to.equal(durations.length);
    });

    it('simple-anacrusis', () => {
        let tex: string = '\\ac 3.3 3.3 | 1.1 2.1 3.1 4.1';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].isAnacrusis).to.be.equal(true);
        expect(score.masterBars[0].calculateDuration()).to.equal(1920);
        expect(score.masterBars[1].calculateDuration()).to.equal(3840);
    });

    it('multi-bar-anacrusis', () => {
        let tex: string = '\\ac 3.3 3.3 | \\ac 3.3 3.3 | 1.1 2.1 3.1 4.1';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].isAnacrusis).to.be.equal(true);
        expect(score.masterBars[1].isAnacrusis).to.be.equal(true);
        expect(score.masterBars[0].calculateDuration()).to.equal(1920);
        expect(score.masterBars[1].calculateDuration()).to.equal(1920);
        expect(score.masterBars[2].calculateDuration()).to.equal(3840);
    });

    it('random-anacrusis', () => {
        let tex: string = '\\ac 3.3 3.3 | 1.1 2.1 3.1 4.1 | \\ac 3.3 3.3 | 1.1 2.1 3.1 4.1';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].isAnacrusis).to.be.equal(true);
        expect(score.masterBars[1].isAnacrusis).to.be.equal(false);
        expect(score.masterBars[2].isAnacrusis).to.be.equal(true);
        expect(score.masterBars[3].isAnacrusis).to.be.equal(false);
        expect(score.masterBars[0].calculateDuration()).to.equal(1920);
        expect(score.masterBars[1].calculateDuration()).to.equal(3840);
        expect(score.masterBars[2].calculateDuration()).to.equal(1920);
        expect(score.masterBars[3].calculateDuration()).to.equal(3840);
    });

    it('repeat', () => {
        let tex: string =
            '\\ro 1.3 2.3 3.3 4.3 | 5.3 6.3 7.3 8.3 | \\rc 2 1.3 2.3 3.3 4.3 | \\ro \\rc 3 1.3 2.3 3.3 4.3 |';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].isRepeatStart).to.be.equal(true);
        expect(score.masterBars[1].isRepeatStart).to.be.equal(false);
        expect(score.masterBars[2].isRepeatStart).to.be.equal(false);
        expect(score.masterBars[3].isRepeatStart).to.be.equal(true);
        expect(score.masterBars[0].repeatCount).to.equal(0);
        expect(score.masterBars[1].repeatCount).to.equal(0);
        expect(score.masterBars[2].repeatCount).to.equal(2);
        expect(score.masterBars[3].repeatCount).to.equal(3);
    });

    it('alternate-endings', () => {
        let tex: string = '\\ro 4.3*4 | \\ae (1 2 3) 6.3*4 | \\ae 4 \\rc 4 6.3 6.3 6.3 5.3 |';
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].isRepeatStart).to.be.equal(true);
        expect(score.masterBars[1].isRepeatStart).to.be.equal(false);
        expect(score.masterBars[2].isRepeatStart).to.be.equal(false);
        expect(score.masterBars[0].repeatCount).to.equal(0);
        expect(score.masterBars[1].repeatCount).to.equal(0);
        expect(score.masterBars[2].repeatCount).to.equal(4);
        expect(score.masterBars[0].alternateEndings).to.equal(0b0000);
        expect(score.masterBars[1].alternateEndings).to.equal(0b0111);
        expect(score.masterBars[2].alternateEndings).to.equal(0b1000);
    })

    it('random-alternate-endings', () => {
        let tex: string = `
            \\ro \\ae 1 1.1.1 | \\ae 2 2.1 | \\ae 3 3.1 |
            4.3.4*4 |
            \\ae 1 1.1.1 | \\ae 2 2.1 | \\ae 3 3.1 |
            4.3.4*4 |
            \\ae (1 3) 1.1.1 | \\ae 2 \\rc 3 2.1 |
        `;
        let score: Score = parseTex(tex);
        expect(score.masterBars[0].isRepeatStart).to.be.equal(true);
        for (let i = 1; i <= 9; i++) {
            expect(score.masterBars[i].isRepeatStart).to.be.equal(false);
        }
        for (let i = 0; i <= 8; i++) {
            expect(score.masterBars[i].repeatCount).to.equal(0);
        }
        expect(score.masterBars[9].repeatCount).to.equal(3);
        expect(score.masterBars[0].alternateEndings).to.equal(0b001);
        expect(score.masterBars[1].alternateEndings).to.equal(0b010);
        expect(score.masterBars[2].alternateEndings).to.equal(0b100);
        expect(score.masterBars[3].alternateEndings).to.equal(0b000);
        expect(score.masterBars[4].alternateEndings).to.equal(0b001);
        expect(score.masterBars[5].alternateEndings).to.equal(0b010);
        expect(score.masterBars[6].alternateEndings).to.equal(0b100);
        expect(score.masterBars[7].alternateEndings).to.equal(0b000);
        expect(score.masterBars[8].alternateEndings).to.equal(0b101);
        expect(score.masterBars[9].alternateEndings).to.equal(0b010);
    })

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

        expect(score.tracks[0].staves[0].transpositionPitch).to.equal(0);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).to.equal(0);
        expect(score.tracks[0].staves[1].transpositionPitch).to.equal(0);
        expect(score.tracks[0].staves[1].displayTranspositionPitch).to.equal(0);
        expect(score.tracks[1].staves[0].transpositionPitch).to.equal(0);
        expect(score.tracks[1].staves[0].displayTranspositionPitch).to.equal(-12);
    });

    it('dynamics', () => {
        let tex: string = '1.1.8{dy ppp} 1.1{dy pp} 1.1{dy p} 1.1{dy mp} 1.1{dy mf} 1.1{dy f} 1.1{dy ff} 1.1{dy fff}';
        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).to.equal(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).to.equal(DynamicValue.PP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].dynamics).to.equal(DynamicValue.P);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].dynamics).to.equal(DynamicValue.MP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].dynamics).to.equal(DynamicValue.MF);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[5].dynamics).to.equal(DynamicValue.F);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[6].dynamics).to.equal(DynamicValue.FF);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[7].dynamics).to.equal(DynamicValue.FFF);
    });

    it('dynamics-auto', () => {
        let tex: string = '1.1.4{dy ppp} 1.1 1.1{dy mp} 1.1';
        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).to.equal(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).to.equal(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].dynamics).to.equal(DynamicValue.MP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].dynamics).to.equal(DynamicValue.MP);
    });

    it('dynamics-auto-reset-on-track', () => {
        let tex: string = '1.1.4{dy ppp} 1.1 \\track "Second" 1.1.4';
        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).to.equal(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).to.equal(DynamicValue.PPP);
        expect(score.tracks[1].staves[0].bars[0].voices[0].beats[0].dynamics).to.equal(DynamicValue.F);
    });

    it('dynamics-auto-reset-on-staff', () => {
        let tex: string = '1.1.4{dy ppp} 1.1 \\staff 1.1.4';
        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].dynamics).to.equal(DynamicValue.PPP);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].dynamics).to.equal(DynamicValue.PPP);
        expect(score.tracks[0].staves[1].bars[0].voices[0].beats[0].dynamics).to.equal(DynamicValue.F);
    });

    it('crescendo', () => {
        let tex: string = '1.1.4{dec} 1.1{dec} 1.1{cre} 1.1{cre}';
        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].crescendo).to.equal(CrescendoType.Decrescendo);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].crescendo).to.equal(CrescendoType.Decrescendo);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].crescendo).to.equal(CrescendoType.Crescendo);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].crescendo).to.equal(CrescendoType.Crescendo);
    });

    it('left-hand-tapping', () => {
        let tex: string = ':4 1.1{lht} 1.1 1.1{lht} 1.1';
        let score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isLeftHandTapped).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isLeftHandTapped).to.equal(false);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].isLeftHandTapped).to.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].isLeftHandTapped).to.equal(false);
    });

    it('expect-invalid-format-xml', () => {
        expect(() => parseTex('<xml>')).to.throw(UnsupportedFormatError);
    });

    it('expect-invalid-format-other-text', () => {
        expect(() => parseTex('This is not an alphaTex file')).to.throw(UnsupportedFormatError);
    });

    it('auto-detect-tuning-from-instrument', () => {
        let score = parseTex('\\instrument acousticguitarsteel . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).to.equal(6);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).to.equal(-12);

        score = parseTex('\\instrument acousticbass . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).to.equal(4);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).to.equal(-12);

        score = parseTex('\\instrument violin . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).to.equal(4);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).to.equal(0);

        score = parseTex('\\instrument acousticpiano . 3.3');
        expect(score.tracks[0].staves[0].tuning.length).to.equal(0);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).to.equal(0);
    });

    it('multibyte-encoding', () => {
        const multiByteChars = '爱你ÖÄÜ🎸🎵🎶';
        const score = parseTex(`\\title "${multiByteChars}"
        .
        \\track "🎸"
        \\lyrics "Test Lyrics 🤘"
        (1.2 1.1).4 x.2.8 0.1 1.1 | 1.2 3.2 0.1 1.1`);

        expect(score.title).to.equal(multiByteChars);
        expect(score.tracks[0].name).to.equal("🎸");
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].lyrics![0]).to.equal("🤘");
    });

    it('does-not-hang-on-backslash', () => {
        expect(() => parseTex('\\title Test . 3.3 \\')).to.throw(UnsupportedFormatError);
    });

    it('disallows-unclosed-string', () => {
        expect(() => parseTex('\\title "Test . 3.3')).to.throw(UnsupportedFormatError);
    });

    function runSectionNoteSymbolTest(noteSymbol: string) {
        const score = parseTex(`1.3.4 * 4 | \\section Verse ${noteSymbol}.1 | 2.3.4*4`);

        expect(score.masterBars.length).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(4);
        expect(score.masterBars[1].section!.text).to.equal('Verse');
        expect(score.masterBars[1].section!.marker).to.equal('');
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).to.equal(1);
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
        const importer: AlphaTexImporter = new AlphaTexImporter();
        for (const _i of [1, 2]) {
            importer.initFromString(tex, new Settings());
            const score = importer.readScore();
            expect(score.title).to.equal('Test');
            expect(score.words).to.equal('test');
            expect(score.music).to.equal('alphaTab');
            expect(score.copyright).to.equal('test');
            expect(score.tempo).to.equal(200);
            expect(score.tracks.length).to.equal(1);
            expect(score.tracks[0].playbackInfo.program).to.equal(30);
            expect(score.tracks[0].staves[0].capo).to.equal(2);
            expect(score.tracks[0].staves[0].tuning.join(',')).to.equal('55,38,43,47,50,69');
            expect(score.masterBars.length).to.equal(2);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(3);
            {
                expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).to.equal(1);
                expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].duration).to.equal(Duration.Half);
                expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(0);
                expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].string).to.equal(2);
                expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes.length).to.equal(1);
                expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].duration).to.equal(Duration.Quarter);
                expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].fret).to.equal(1);
                expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].string).to.equal(2);
                expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes.length).to.equal(1);
                expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].duration).to.equal(Duration.Quarter);
                expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].fret).to.equal(3);
                expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].string).to.equal(3);
            }
            expect(score.tracks[0].staves[0].bars[1].voices[0].beats.length).to.equal(5);
            {
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes.length).to.equal(1);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].duration).to.equal(Duration.Eighth);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].fret).to.equal(5);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].string).to.equal(4);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes.length).to.equal(1);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].duration).to.equal(Duration.Eighth);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].fret).to.equal(5);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].string).to.equal(4);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes.length).to.equal(1);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].duration).to.equal(Duration.Eighth);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].fret).to.equal(5);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].string).to.equal(4);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes.length).to.equal(1);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].duration).to.equal(Duration.Eighth);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].fret).to.equal(5);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].string).to.equal(4);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].notes.length).to.equal(0);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].duration).to.equal(Duration.Half);
                expect(score.tracks[0].staves[0].bars[1].voices[0].beats[4].isRest).to.equal(true);
            }
        }
    });

    it('error-shows-symbol-data', () => {
        const tex = '3.3.ABC';
        expect(() => parseTex(tex)).to.throw(UnsupportedFormatError);
        try {
            parseTex(tex);
        } catch (e) {
            if (!(e instanceof UnsupportedFormatError)) {
                assert.fail('Did not throw correct error');
                return;
            }
            if (!(e.inner instanceof AlphaTexError)) {
                assert.fail('Did not contain an AlphaTexError');
                return;
            }
            const i = e.inner as AlphaTexError;
            expect(i.expected).to.equal(AlphaTexSymbols.Number);
            expect(i.message?.includes('Number')).to.be.true;
            expect(i.symbol).to.equal(AlphaTexSymbols.String);
            expect(i.message?.includes('String')).to.be.true;
            expect(i.symbolData).to.equal('ABC');
            expect(i.message?.includes('ABC')).to.be.true;
        }
    });

    it('tempo-as-float', () => {
        const score = parseTex('\\tempo 112.5 .');
        expect(score.tempo).to.equal(112.5);
    });

    it('tempo-as-float-in-bar', () => {
        const score = parseTex('\\tempo 112 . 3.3.1 | \\tempo 333.3 3.3');
        expect(score.tempo).to.equal(112);
        expect(score.tracks[0].staves[0].bars[1].masterBar.tempoAutomation?.value).to.equal(333.3);
    });

    it('tempo-invalid-float', () => {
        expect(() => parseTex('\\tempo 112.Q .')).to.throw(UnsupportedFormatError);
    });
});
